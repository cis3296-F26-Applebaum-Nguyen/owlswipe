-- Run after the migration in a development Supabase SQL Editor or with psql.
-- All fixtures and helper functions are rolled back; no test accounts are saved.
begin;

create function pg_temp.assert_true(ok boolean, message text)
returns void language plpgsql as $$
begin
  if ok is distinct from true then
    raise exception 'FAIL: %', message;
  end if;
end;
$$;

create function pg_temp.expect_error(statement text, expected_state text)
returns void language plpgsql as $$
begin
  execute statement;
  raise exception 'Statement unexpectedly succeeded: %', statement;
exception when others then
  if SQLSTATE <> all(string_to_array(expected_state, ',')) then
    raise exception 'Expected SQLSTATE %, got %: %', expected_state, SQLSTATE, SQLERRM;
  end if;
end;
$$;

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'seller-db-test@example.invalid'),
  ('00000000-0000-4000-8000-000000000002', 'buyer-db-test@example.invalid'),
  ('00000000-0000-4000-8000-000000000003', 'other-db-test@example.invalid');

select pg_temp.assert_true((select count(*) = 3 from public.profiles
  where id in ('00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003')), 'Auth creates profiles');

insert into public.listings
  (id, seller_id, location, available_at, quantity_available, price_in_cents, status)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
    'Test restaurant', now() + interval '1 day', 3, 500, 'available'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001',
    'Test restaurant', now() + interval '1 day', 0, 500, 'sold_out'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001',
    'Test restaurant', now() - interval '1 day', 3, 500, 'available'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001',
    'Test restaurant', now() + interval '1 day', 3, 500, 'cancelled');

insert into public.orders (id, listing_id, buyer_id, quantity, status) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002', 2, 'completed'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002', 1, 'payment_pending');

insert into public.payments (id, user_id, order_id, type, amount_in_cents, status) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001', 'purchase', 1000, 'succeeded'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001', 'sale', 1000, 'succeeded');

update public.listings set location = 'Changed restaurant', price_in_cents = 900
where id = '10000000-0000-4000-8000-000000000001';
select pg_temp.assert_true((select location = 'Test restaurant' and total_in_cents = 1000
  from public.orders where id = '20000000-0000-4000-8000-000000000001'),
  'Orders retain their original location and price');

select pg_temp.expect_error($q$update public.orders set quantity = 5
  where id = '20000000-0000-4000-8000-000000000001'$q$, '23514');
select pg_temp.expect_error($q$insert into public.orders (listing_id, buyer_id, quantity)
  values ('10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001', 1)$q$, '23514');
select pg_temp.expect_error($q$update public.listings set price_in_cents = 0
  where id = '10000000-0000-4000-8000-000000000001'$q$, '23514');
select pg_temp.expect_error($q$update public.listings set quantity_available = -1
  where id = '10000000-0000-4000-8000-000000000001'$q$, '23514');
select pg_temp.expect_error($q$delete from public.listings
  where id = '10000000-0000-4000-8000-000000000001'$q$, '23503,23001');
select pg_temp.expect_error($q$update public.payments set amount_in_cents = -1
  where id = '30000000-0000-4000-8000-000000000001'$q$, '23514');

-- Test real database roles, not just queries run as the database owner.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true((select count(*) = 1 from public.profiles), 'Only own profile is visible');
select pg_temp.assert_true((select count(*) = 2 from public.orders), 'Buyer sees their orders');
select pg_temp.assert_true((select count(*) = 1 from public.payments), 'Buyer sees only their payment');
select pg_temp.assert_true((select count(*) = 1 from public.listings
  where seller_id = '00000000-0000-4000-8000-000000000001'),
  'Marketplace hides expired, sold-out, and cancelled listings');

update public.profiles set display_name = 'Test buyer'
where id = '00000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select display_name = 'Test buyer' from public.profiles),
  'Users can update their own display name');
select pg_temp.expect_error($q$update public.orders set status = 'completed'$q$, '42501');
select pg_temp.expect_error($q$update public.payments set status = 'succeeded'$q$, '42501');
select pg_temp.expect_error($q$update public.listings set quantity_available = 99$q$, '42501');

select pg_temp.expect_error($q$insert into public.seller_ratings
  (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001', 5)$q$, '42501');
select pg_temp.expect_error($q$insert into public.seller_ratings
  (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001', 6)$q$, '23514');
select pg_temp.expect_error($q$insert into public.seller_ratings
  (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003', 5)$q$, '23503');

insert into public.seller_ratings (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001', 5);
select pg_temp.expect_error($q$insert into public.seller_ratings
  (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001', 4)$q$, '23505');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
select pg_temp.assert_true((select count(*) = 0 from public.orders), 'Other users cannot read orders');
select pg_temp.assert_true((select count(*) = 0 from public.payments), 'Other users cannot read payments');
update public.seller_ratings set rating = 1
where order_id = '20000000-0000-4000-8000-000000000001';
select pg_temp.assert_true((select rating = 5 from public.seller_ratings
  where order_id = '20000000-0000-4000-8000-000000000001'), 'Other users cannot edit a rating');
select pg_temp.expect_error($q$insert into public.seller_ratings
  (order_id, buyer_id, seller_id, rating) values
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001', 5)$q$, '42501');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select pg_temp.assert_true((select count(*) = 2 from public.orders), 'Seller sees their sales');
select pg_temp.assert_true((select count(*) = 1 from public.payments), 'Seller sees only their payment');
select pg_temp.assert_true((select count(*) = 4 from public.listings
  where seller_id = '00000000-0000-4000-8000-000000000001'), 'Seller sees all their listings');

reset role;
set local role anon;
select pg_temp.expect_error('select * from public.profiles', '42501');
select pg_temp.expect_error('select * from public.listings', '42501');
select pg_temp.expect_error('select * from public.orders', '42501');
select pg_temp.expect_error('select * from public.payments', '42501');
select pg_temp.expect_error('select * from public.seller_ratings', '42501');
reset role;

rollback;
select 'Database checks passed; test data rolled back.' as result;
