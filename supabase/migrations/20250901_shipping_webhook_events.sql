-- shipping_webhook_events audit & dedup table
create table if not exists public.shipping_webhook_events (
  id bigserial primary key,
  event_id text not null unique,
  order_id uuid null,
  order_number text null,
  carrier text null,
  status_raw text null,
  status_mapped text null,
  body_hash text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz null
);

create index if not exists shipping_webhook_events_order_id_idx on public.shipping_webhook_events(order_id);
create index if not exists shipping_webhook_events_received_at_idx on public.shipping_webhook_events(received_at desc);

alter table public.shipping_webhook_events enable row level security;
-- No RLS policies added: only Service Role (edge functions) can write/read.

