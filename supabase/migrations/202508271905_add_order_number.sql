-- Add order_number to venthub_orders (nullable, for display/reference)
BEGIN;

ALTER TABLE public.venthub_orders
  ADD COLUMN IF NOT EXISTS order_number text;

-- Optional: ensure fast sorting/filtering by order_number
CREATE INDEX IF NOT EXISTS idx_venthub_orders_order_number ON public.venthub_orders(order_number);

COMMIT;

