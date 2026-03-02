-- Phase 2: Inventory Premium Fields

-- 1. Add columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warehouse_location text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_name text;

-- 2. Add columns to inventory_settings
ALTER TABLE public.inventory_settings ADD COLUMN IF NOT EXISTS alert_email text;
ALTER TABLE public.inventory_settings ADD COLUMN IF NOT EXISTS alert_webhook_url text;
ALTER TABLE public.inventory_settings ADD COLUMN IF NOT EXISTS reservation_timeout_hours integer DEFAULT 24;

-- 3. Update inventory_summary view to include new columns
DROP VIEW IF EXISTS public.inventory_summary;

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
  (COALESCE(p.stock_qty,0) - COALESCE(r.reserved_qty,0)) AS available_stock,
  p.warehouse_location,
  p.supplier_name
FROM public.products p
LEFT JOIN reserved r ON r.product_id = p.id;

GRANT SELECT ON public.inventory_summary TO authenticated;

-- 4. Create inventory_velocity view
CREATE OR REPLACE VIEW public.inventory_velocity AS
WITH movement_stats AS (
  SELECT 
    product_id,
    COALESCE(SUM(ABS(delta)), 0) as total_out_30d
  FROM public.inventory_movements
  WHERE delta < 0 
    AND (reason = 'sale' OR reason = 'manual_out')
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY product_id
)
SELECT 
  p.id as product_id,
  p.stock_qty,
  COALESCE(m.total_out_30d, 0) as total_out_30d,
  ROUND(COALESCE(m.total_out_30d, 0) / 30.0, 2) as daily_velocity,
  CASE 
    WHEN COALESCE(m.total_out_30d, 0) = 0 THEN 9999
    ELSE ROUND(p.stock_qty / (COALESCE(m.total_out_30d, 0) / 30.0))
  END as days_until_empty,
  COALESCE(p.purchase_price, 0) * p.stock_qty as capital_tied_up,
  CASE
    WHEN COALESCE(m.total_out_30d, 0) >= 10 THEN 'A'
    WHEN COALESCE(m.total_out_30d, 0) >= 3 THEN 'B'
    ELSE 'C'
  END as abc_class
FROM public.products p
LEFT JOIN movement_stats m ON p.id = m.product_id;

GRANT SELECT ON public.inventory_velocity TO authenticated;
