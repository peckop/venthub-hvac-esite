-- User profiles tablosuna organization_id kolonu ekle
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Mevcut user_profiles yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. organization_id kolonu ekle (nullable)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 3. Eğer role kolonu da yoksa ekle (admin rolleri için gerekli)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'individual';

-- 4. Son kontrol - güncellenmiş tablo yapısını görüntüle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
