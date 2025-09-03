-- Venthub orders tablosuna shipping_method kolonu ekle
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- Shipping method kolonu ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50) DEFAULT 'standard';

-- Kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' 
  AND table_schema = 'public'
  AND column_name = 'shipping_method';
