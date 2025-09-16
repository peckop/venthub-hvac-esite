-- Idempotency table for shipping operations
create table if not exists public.shipping_idempotency (
  key text primary key,
  scope text not null default 'admin-update-shipping',
  created_at timestamptz not null default now()
);

-- Optional retention: keep last 14 days
create index if not exists shipping_idempotency_created_at_idx on public.shipping_idempotency (created_at);