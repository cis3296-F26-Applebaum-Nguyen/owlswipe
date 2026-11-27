---
sidebar_position: 2
title: PostgreSQL Database Setup
---

# PostgreSQL Database Setup

OwlSwipe uses the PostgreSQL database included with Supabase. The application
already has Supabase clients in `lib/supabase`; a separate PostgreSQL server or
ORM is not needed.

The initial migration was applied to the team's Supabase project on November 27,
2026, and the database checks passed there. The setup steps below are for a fresh
project; teammates using the existing project only need to configure their local
environment.

## Create the tables

1. Open the team's development project in the Supabase dashboard. Confirm the
   project with the team before making changes.
2. Check the **Table Editor** for existing tables in the `public` schema. This
   initial migration expects the OwlSwipe tables listed below to be absent.
   If they already exist, check whether another teammate applied the migration;
   do not delete tables or rerun the initial migration over existing work.
3. Open **SQL Editor**, create a new query, and paste the entire contents of
   `supabase/migrations/20261127000000_initial_schema.sql` from the repository.
4. Run it as the default database owner (`postgres`). The file uses a transaction
   so an error will prevent a partial setup. If a transaction remains aborted,
   run `ROLLBACK;` before retrying the corrected query.
5. Refresh the Table Editor. The five tables below should appear with row level
   security enabled. Existing Auth users will also have profile rows.

Run the initial migration **once per project**. Keep future schema changes in new,
dated files under `supabase/migrations` and apply them in filename order. This
SQL Editor workflow does not automatically register files in the Supabase CLI's
migration history; reconcile that history first if the team later adopts the CLI.

## Tables and relationships

| Table | Stored information |
| --- | --- |
| `auth.users` (managed by Supabase) | Login email, verification, and authentication information. |
| `profiles` | One profile per Auth user, with a display name and creation time. A trigger creates it when an Auth account is added. |
| `listings` | Seller, restaurant/location, available time, remaining quantity, price, and listing status. |
| `orders` | Buyer, seller, listing, quantity, purchase details, total, and order status. |
| `payments` | An account's payment history: amount, type, status, optional order, and optional provider reference. |
| `seller_ratings` | One rating per completed order, with its buyer, seller, score from 1 to 5, and optional comment. |

Users can buy and sell with the same account. Listings belong to sellers; orders
link a listing to its buyer and seller. Ratings reference that exact combination
of order, buyer, and seller so a review cannot be attached to a different seller.

All money amounts use integer cents (for example, `500` means $5.00). Timestamps
use `timestamptz`. Column names use snake_case; the existing TypeScript service
interfaces use camelCase, so service implementations should map between them.

On order creation, a trigger copies the seller, location, available time, and
unit price from the listing. The total is calculated from quantity and price.
Those purchase details cannot be edited later, even if the listing changes.
Status values match the existing listing and order interfaces.

Payment amounts are positive; `deposit`, `purchase`, `sale`, `refund`, and
`cash_out` identify the transaction type. Status is `pending`, `succeeded`, or
`failed`. Purchase, sale, and refund entries require an order. The payment
implementation must validate the account and amount against that order.
`provider_reference` is optional and unique when supplied; use a distinct
reference for each provider operation. Do not store card numbers or security codes.

History references use restricted deletion so deleting a listing or account
cannot silently erase purchases and payments. Cancel listings using their status.
An account-deletion workflow will need to handle retained history separately.

## Access rules

Row level security is enabled on every OwlSwipe table, with explicit grants:

| Caller | Allowed access |
| --- | --- |
| Signed out (`anon`) | No access to OwlSwipe tables. |
| Signed in (`authenticated`) | Read and edit their own profile's display name; browse future, available listings with remaining stock; read all their own listings; read orders where they are buyer or seller; read only their own payment history. |
| Rating author | Insert or edit a rating only for their own completed purchase. The order, buyer, and seller cannot be edited. |
| Any signed-in user | Read seller ratings, including their associated account and order IDs. This does not grant access to private order or payment details. |
| Trusted backend (`service_role`) | Write listings, orders, and payment records after validating the request. This role bypasses row level security. |

The browser cannot directly change order/payment status or listing inventory.
The existing cookie-based server client also uses the signed-in user's permissions;
running it on the server does not bypass row level security. Future privileged
server operations must use a separate service-role client and check the requesting
user before changing data. Never expose that key to the browser.

Supabase Auth owns login data; profiles do not duplicate emails, passwords, or
one-time codes. The authentication task must enforce the approved school domains
and email verification. A signed-in database role alone does not establish that
someone has an approved school email.

## Connect the application

Copy `.env.example` to `.env.local` if needed. Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using the
values from the same Supabase project. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
The existing application also expects the Stripe test-mode variables described in
the README. Never commit `.env.local` or database credentials.

The existing Supabase client can query the new tables. For example, the orders
service can query `orders`, ordered by `created_at`; its user's session restricts
the result to their purchases and sales. Always handle the returned `error`.

## Verify the database

In the development project's SQL Editor, run the entire
`supabase/tests/database.sql` file as `postgres` after applying the migration.
It creates temporary sample users and records, switches database roles to test
access rules, and rolls everything back. A successful run ends with:

```text
Database checks passed; test data rolled back.
```

The checks cover profile creation, order snapshots and totals, invalid values,
private records, hidden unavailable listings, blocked client writes, and rating
ownership/completion/uniqueness. If a check fails, run `ROLLBACK;` before retrying.
The script is for development, not a production project with custom signup triggers.

Alternatively, with `psql` installed and a development connection configured:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/database.sql
```

In PowerShell, use `$env:DATABASE_URL` instead of `"$DATABASE_URL"`.

## Scope of this setup

This adds database storage and access rules. The current pages and service
interfaces still need their feature implementations. In particular, it does not
process Stripe payments, calculate wallet balances, reserve inventory, release
seller funds, or implement refunds. A future reservation operation must decrement
inventory and insert the order in one transaction to prevent overselling. Payment
confirmation and wallet updates must also be transactional and safe to retry.

## References

- [Supabase user data and profile triggers](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase row level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
