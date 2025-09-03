-- Cart items tablosuna price_list_id kolonu ekle
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Mevcut cart_items yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. price_list_id kolonu ekle (nullable, foreign key olmadan)
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS price_list_id UUID;

-- 3. Son kontrol - güncellenmiş tablo yapısını görüntüle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
