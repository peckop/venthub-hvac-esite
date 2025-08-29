begin;

-- Snapshot columns for order items
alter table if exists public.venthub_order_items
  add column if not exists unit_price_snapshot numeric,
  add column if not exists price_list_id_snapshot text,
  add column if not exists product_name_snapshot text,
  add column if not exists product_sku_snapshot text,
  add column if not exists tax_rate_snapshot numeric;

-- Optional: store subtotal snapshot on order header
alter table if exists public.venthub_orders
  add column if not exists subtotal_snapshot numeric;

commit;

