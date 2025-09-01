-- Add shipping_method column to venthub_orders for service-level selection
alter table if exists public.venthub_orders
  add column if not exists shipping_method text;

-- Optional index for filtering/analytics
create index if not exists venthub_orders_shipping_method_idx on public.venthub_orders (shipping_method);

