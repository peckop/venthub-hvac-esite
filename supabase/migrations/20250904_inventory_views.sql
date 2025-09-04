-- Inventory summary views
-- View 1: inventory_summary - physical, reserved (unshipped paid/confirmed/processing), available
CREATE OR REPLACE VIEW public.inventory_summary AS
WITH reserved AS (
  SELECT voi.product_id, SUM(voi.quantity)::int AS reserved_qty
  FROM public.venthub_order_items AS voi
  JOIN public.venthub_orders AS o ON o.id = voi.order_id
  WHERE o.status IN ('confirmed','paid','processing')
    AND o.shipped_at IS NULL
  GROUP BY voi.product_id
)
SELECT 
  p.id AS product_id,
  p.name,
  COALESCE(p.stock_qty,0)      AS physical_stock,
  COALESCE(r.reserved_qty,0)   AS reserved_stock,
  (COALESCE(p.stock_qty,0) - COALESCE(r.reserved_qty,0)) AS available_stock
FROM public.products p
LEFT JOIN reserved r ON r.product_id = p.id;

-- View 2: reserved_orders - which orders are reserving each product (unshipped)
CREATE OR REPLACE VIEW public.reserved_orders AS
SELECT 
  voi.product_id,
  o.id          AS order_id,
  o.created_at,
  o.status,
  o.payment_status,
  voi.quantity
FROM public.venthub_order_items voi
JOIN public.venthub_orders o ON o.id = voi.order_id
WHERE o.status IN ('confirmed','paid','processing')
  AND o.shipped_at IS NULL;

-- Optional grants (read for authenticated)
GRANT SELECT ON public.inventory_summary TO authenticated;
GRANT SELECT ON public.reserved_orders TO authenticated;
