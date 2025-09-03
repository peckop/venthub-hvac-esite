-- RLS'i geçici olarak kapatmak için SQL
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Venthub orders tablosunda RLS'i geçici olarak kapat
ALTER TABLE public.venthub_orders DISABLE ROW LEVEL SECURITY;

-- 2. Venthub order items tablosunda RLS'i geçici olarak kapat
ALTER TABLE public.venthub_order_items DISABLE ROW LEVEL SECURITY;

-- 3. Kontrol et - RLS durumunu görüntüle
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('venthub_orders', 'venthub_order_items');

-- Not: Bu sadece test amaçlı! Çalıştıktan sonra RLS'i tekrar açacağız.
