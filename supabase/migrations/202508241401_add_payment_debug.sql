begin;

alter table if exists public.venthub_orders
  add column if not exists payment_debug jsonb;

commit;
