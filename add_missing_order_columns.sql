-- Venthub orders tablosuna eksik kolonları ekle
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Mevcut tablo yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. İyzico fonksiyonun beklediği eksik kolonları ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS subtotal_snapshot DECIMAL(10,2);

ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS legal_consents JSONB;

-- 3. Son kontrol - güncellenmiş tablo yapısını görüntüle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venthub_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
