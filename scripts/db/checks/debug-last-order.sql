-- Son sipariş debug scripti
-- Supabase SQL Editor'da çalıştırın

-- 1. Son siparişleri listele
SELECT 
  id,
  conversation_id,
  total_amount,
  status,
  customer_email,
  created_at,
  payment_token
FROM public.venthub_orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Son siparişin item'larını göster (ORDER_ID_HERE'yi değiştirin)
SELECT 
  oi.order_id,
  oi.product_id,
  oi.quantity,
  p.name as product_name,
  p.stock_qty as current_stock
FROM public.venthub_order_items oi
JOIN public.products p ON p.id = oi.product_id
WHERE oi.order_id = 'ORDER_ID_HERE' -- Bu kısmı değiştirin
ORDER BY oi.created_at;

-- 3. Bu order için stok hareket var mı kontrol et
SELECT 
  im.created_at,
  im.product_id,
  im.delta,
  im.reason,
  im.order_id,
  p.name as product_name
FROM public.inventory_movements im
JOIN public.products p ON p.id = im.product_id
WHERE im.order_id = 'ORDER_ID_HERE' -- Bu kısmı değiştirin
ORDER BY im.created_at DESC;
