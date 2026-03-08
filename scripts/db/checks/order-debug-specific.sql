-- Order 8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a debug
-- Supabase SQL Editor'da çalıştırın

-- 1. Order detayları
SELECT 
  id,
  status,
  conversation_id,
  total_amount,
  customer_email,
  payment_method,
  payment_token,
  created_at,
  updated_at
FROM public.venthub_orders 
WHERE id = '8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a';

-- 2. Order items detayları
SELECT 
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.price_at_time,
  p.name as product_name,
  p.stock_qty as current_stock
FROM public.venthub_order_items oi
JOIN public.products p ON p.id = oi.product_id
WHERE oi.order_id = '8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a';

-- 3. Bu order için inventory_movements var mı?
SELECT 
  im.created_at,
  im.product_id,
  im.delta,
  im.reason,
  im.order_id,
  p.name as product_name
FROM public.inventory_movements im
JOIN public.products p ON p.id = im.product_id
WHERE im.order_id = '8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a'::uuid
ORDER BY im.created_at DESC;

-- 4. Adsorption Dehumidifier 250 ürününün güncel durumu
SELECT 
  id,
  name, 
  stock_qty, 
  low_stock_threshold,
  updated_at
FROM public.products 
WHERE name ILIKE '%Adsorption Dehumidifier%';

-- 5. Manuel stok düşümü testi (RPC fonksiyon test)
-- Bu satırı uncomment edip çalıştırın:
-- SELECT public.process_order_stock_reduction('8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a');
