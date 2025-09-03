-- Shopping carts tablosundaki product_id kolonunu kaldır
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Önce mevcut tablo yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_carts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Eğer product_id kolonu varsa kaldır
-- (Shopping carts tablosunda product_id olmamalı, sadece cart_items'da olmalı)
ALTER TABLE public.shopping_carts 
DROP COLUMN IF EXISTS product_id;

-- 3. Shopping carts tablosunun doğru yapısı şu şekilde olmalı:
-- CREATE TABLE public.shopping_carts (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- 4. Düzeltme sonrası tablo yapısını tekrar kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_carts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
