begin;

-- Supabase Auth owns emails, verification, and login credentials.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete restrict,
  display_name text not null default '' check (char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete restrict,
  location text not null check (char_length(trim(location)) between 1 and 200),
  available_at timestamptz not null,
  quantity_available integer not null check (quantity_available >= 0),
  price_in_cents integer not null check (price_in_cents > 0),
  status text not null default 'available'
    check (status in ('available', 'sold_out', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  unique (id, seller_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  buyer_id uuid not null references public.profiles (id) on delete restrict,
  seller_id uuid not null references public.profiles (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- Snapshots keep purchase history intact when the listing changes.
  location text not null,
  available_at timestamptz not null,
  price_in_cents integer not null check (price_in_cents > 0),
  total_in_cents integer generated always as (quantity * price_in_cents) stored,
  status text not null default 'payment_pending'
    check (status in ('payment_pending', 'confirmed', 'completed', 'cancelled', 'reported')),
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id),
  foreign key (listing_id, seller_id)
    references public.listings (id, seller_id) on delete restrict,
  unique (id, buyer_id, seller_id)
);

-- One history entry per account. Amounts are positive; type gives the direction.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  order_id uuid references public.orders (id) on delete restrict,
  type text not null check (type in ('deposit', 'purchase', 'sale', 'refund', 'cash_out')),
  amount_in_cents integer not null check (amount_in_cents > 0),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed')),
  provider_reference text unique,
  created_at timestamptz not null default now(),
  check (type not in ('purchase', 'sale', 'refund') or order_id is not null)
);

create table public.seller_ratings (
  order_id uuid primary key,
  buyer_id uuid not null,
  seller_id uuid not null references public.profiles (id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  foreign key (order_id, buyer_id, seller_id)
    references public.orders (id, buyer_id, seller_id) on delete restrict
);

create index listings_marketplace_idx on public.listings (available_at, price_in_cents)
  where status = 'available' and quantity_available > 0;
create index listings_seller_idx on public.listings (seller_id, created_at desc);
create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index orders_seller_idx on public.orders (seller_id, created_at desc);
create index orders_listing_idx on public.orders (listing_id, seller_id);
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_order_idx on public.payments (order_id);
create index seller_ratings_seller_idx on public.seller_ratings (seller_id);

create function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.create_user_profile() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

-- Also support accounts that were created before this migration.
insert into public.profiles (id) select id from auth.users;

create function public.set_order_snapshot()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    select seller_id, location, available_at, price_in_cents
      into strict new.seller_id, new.location, new.available_at, new.price_in_cents
      from public.listings where id = new.listing_id;
  elsif row(new.listing_id, new.buyer_id, new.seller_id, new.quantity,
            new.location, new.available_at, new.price_in_cents, new.created_at)
    is distinct from
        row(old.listing_id, old.buyer_id, old.seller_id, old.quantity,
            old.location, old.available_at, old.price_in_cents, old.created_at) then
    raise exception 'Purchase details cannot be changed' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.set_order_snapshot() from public, anon, authenticated;
create trigger preserve_order_details
  before insert or update on public.orders
  for each row execute function public.set_order_snapshot();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.seller_ratings enable row level security;

-- Explicit grants also override Supabase projects with broad default grants.
revoke all on public.profiles, public.listings, public.orders,
  public.payments, public.seller_ratings from public, anon, authenticated;
grant select on public.profiles, public.listings, public.orders,
  public.payments, public.seller_ratings to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert (order_id, buyer_id, seller_id, rating, comment)
  on public.seller_ratings to authenticated;
grant update (rating, comment) on public.seller_ratings to authenticated;
grant all on public.profiles, public.listings, public.orders,
  public.payments, public.seller_ratings to service_role;

create policy profiles_read_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy listings_read on public.listings for select to authenticated
  using (seller_id = (select auth.uid()) or
    (status = 'available' and quantity_available > 0 and available_at > now()));
create policy orders_read_own on public.orders for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy payments_read_own on public.payments for select to authenticated
  using (user_id = (select auth.uid()));

-- Ratings are visible to signed-in students; order/payment details stay private.
create policy ratings_read on public.seller_ratings for select to authenticated
  using (true);
create policy ratings_insert_buyer on public.seller_ratings for insert to authenticated
  with check (buyer_id = (select auth.uid()) and exists (
    select 1 from public.orders o where o.id = order_id
      and o.buyer_id = (select auth.uid()) and o.status = 'completed'
  ));
create policy ratings_update_buyer on public.seller_ratings for update to authenticated
  using (buyer_id = (select auth.uid()))
  with check (buyer_id = (select auth.uid()) and exists (
    select 1 from public.orders o where o.id = order_id
      and o.buyer_id = (select auth.uid()) and o.status = 'completed'
  ));

commit;
