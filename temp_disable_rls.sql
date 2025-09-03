-- Geçici olarak venthub_orders tablosunda RLS'i kapat
-- Bu sadece test amaçlı, sonra tekrar açacağız

-- Önce mevcut RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'venthub_orders' AND schemaname = 'public';

-- RLS'i geçici olarak kapat
ALTER TABLE public.venthub_orders DISABLE ROW LEVEL SECURITY;

-- Durumu tekrar kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'venthub_orders' AND schemaname = 'public';
