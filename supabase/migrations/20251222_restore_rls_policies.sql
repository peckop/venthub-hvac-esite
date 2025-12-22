-- RLS Policy Restore Migration
-- 20251222_fix_rls_performance_lints tarafından bozulan politikaları geri yükler.
-- Her tablo için temel RLS politikalarını yeniden oluşturur.

-- ============================================================================
-- 1. user_invoice_profiles tablosu - Temel politikaları geri yükle
-- ============================================================================
DO $$
BEGIN
  -- Mevcut politikaları temizle
  DROP POLICY IF EXISTS user_invoice_profiles_select ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_insert ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_update ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_delete ON public.user_invoice_profiles;
  
  -- Basit politikalar oluştur (performans uyarısı verse de en azından çalışır)
  CREATE POLICY user_invoice_profiles_select ON public.user_invoice_profiles
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY user_invoice_profiles_insert ON public.user_invoice_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY user_invoice_profiles_update ON public.user_invoice_profiles
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY user_invoice_profiles_delete ON public.user_invoice_profiles
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_invoice_profiles: %', SQLERRM;
END $$;

-- ============================================================================
-- 2. user_addresses tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS user_addresses_owner_all ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_select ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_insert ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_update ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_delete ON public.user_addresses;
  
  CREATE POLICY user_addresses_select ON public.user_addresses
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY user_addresses_insert ON public.user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY user_addresses_update ON public.user_addresses
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY user_addresses_delete ON public.user_addresses
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_addresses: %', SQLERRM;
END $$;

-- ============================================================================
-- 3. shopping_carts tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS shopping_carts_owner_all ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_select ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_insert ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_update ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_delete ON public.shopping_carts;
  
  CREATE POLICY shopping_carts_select ON public.shopping_carts
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY shopping_carts_insert ON public.shopping_carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY shopping_carts_update ON public.shopping_carts
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY shopping_carts_delete ON public.shopping_carts
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'shopping_carts: %', SQLERRM;
END $$;

-- ============================================================================
-- 4. cart_items tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS cart_items_owner_all ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_select ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_insert ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_update ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_delete ON public.cart_items;
  
  CREATE POLICY cart_items_select ON public.cart_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
  CREATE POLICY cart_items_insert ON public.cart_items
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
  CREATE POLICY cart_items_update ON public.cart_items
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
  CREATE POLICY cart_items_delete ON public.cart_items
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cart_items: %', SQLERRM;
END $$;

-- ============================================================================
-- 5. venthub_orders tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_orders_owner ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_select ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_insert ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_update ON public.venthub_orders;
  
  -- Kullanıcı kendi siparişlerini görebilir
  CREATE POLICY venthub_orders_select ON public.venthub_orders
    FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');
  CREATE POLICY venthub_orders_insert ON public.venthub_orders
    FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');
  CREATE POLICY venthub_orders_update ON public.venthub_orders
    FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_orders: %', SQLERRM;
END $$;

-- ============================================================================
-- 6. venthub_order_items tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_order_items_owner ON public.venthub_order_items;
  DROP POLICY IF EXISTS venthub_order_items_select ON public.venthub_order_items;
  DROP POLICY IF EXISTS venthub_order_items_insert ON public.venthub_order_items;
  
  CREATE POLICY venthub_order_items_select ON public.venthub_order_items
    FOR SELECT USING (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()) OR auth.role() = 'service_role');
  CREATE POLICY venthub_order_items_insert ON public.venthub_order_items
    FOR INSERT WITH CHECK (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()) OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_order_items: %', SQLERRM;
END $$;

-- ============================================================================
-- 7. venthub_returns tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_returns_owner ON public.venthub_returns;
  DROP POLICY IF EXISTS venthub_returns_select ON public.venthub_returns;
  DROP POLICY IF EXISTS venthub_returns_insert ON public.venthub_returns;
  
  CREATE POLICY venthub_returns_select ON public.venthub_returns
    FOR SELECT USING (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()) OR auth.role() = 'service_role');
  CREATE POLICY venthub_returns_insert ON public.venthub_returns
    FOR INSERT WITH CHECK (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()) OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_returns: %', SQLERRM;
END $$;

-- ============================================================================
-- 8. user_profiles tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS user_profiles_owner ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_update ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles;
  
  CREATE POLICY user_profiles_select ON public.user_profiles
    FOR SELECT USING (id = auth.uid() OR auth.role() = 'service_role');
  CREATE POLICY user_profiles_update ON public.user_profiles
    FOR UPDATE USING (id = auth.uid() OR auth.role() = 'service_role');
  CREATE POLICY user_profiles_insert ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_profiles: %', SQLERRM;
END $$;

-- ============================================================================
-- 9. wizard_selections tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS wizard_selections_public_insert ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_owner_select ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_select ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_insert ON public.wizard_selections;
  
  -- Herkes insert yapabilir (anonim dahil)
  CREATE POLICY wizard_selections_insert ON public.wizard_selections
    FOR INSERT WITH CHECK (true);
  -- Sadece kendi kayıtlarını görebilir
  CREATE POLICY wizard_selections_select ON public.wizard_selections
    FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'wizard_selections: %', SQLERRM;
END $$;

SELECT 'RLS Policy Restore completed.' as status;
