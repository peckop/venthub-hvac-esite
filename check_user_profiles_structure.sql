-- user_profiles tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mevcut politikaları da göster
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';
