begin;

alter table if exists public.venthub_orders
  add column if not exists invoice_type text,
  add column if not exists invoice_info jsonb,
  add column if not exists legal_consents jsonb;

commit;
