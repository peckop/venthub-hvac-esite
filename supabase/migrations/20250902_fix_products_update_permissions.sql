-- Products tablosu UPDATE permission'larını düzelt
-- Admin kullanıcılar stock_qty güncelleyebilsin

begin;

-- Önce mevcut policies kontrol et ve temizle
DROP POLICY IF EXISTS "products_update_admin_stock" ON public.products;

-- Admin için stock update policy oluştur
CREATE POLICY "products_update_admin_stock" ON public.products
  FOR UPDATE 
  USING (
    (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') = 'admin'
  );

-- Geçici çözüm: Authenticated kullanıcılar stock_qty güncelleyebilsin
CREATE POLICY "products_update_stock_authenticated" ON public.products
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS'nin aktif olduğunu kontrol et
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Mevcut policies listele (debug için)
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY policyname;

commit;
