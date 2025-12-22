-- Performance Lint Fix Migration (Simplified & Idempotent)
-- Supabase Dashboard'daki RLS initplan performans uyarılarını düzeltir.
-- Her bölüm bağımsız çalışır, hata verse bile diğerleri etkilenmez.

-- ============================================================================
-- 1. user_invoice_profiles tablosu
-- ============================================================================
DO $$
BEGIN
  -- Mevcut politikaları sil
  DROP POLICY IF EXISTS user_invoice_profiles_select ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_insert ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_update ON public.user_invoice_profiles;
  DROP POLICY IF EXISTS user_invoice_profiles_delete ON public.user_invoice_profiles;
  
  -- Yeni optimize edilmiş politikalar
  CREATE POLICY user_invoice_profiles_select ON public.user_invoice_profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
  CREATE POLICY user_invoice_profiles_insert ON public.user_invoice_profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
  CREATE POLICY user_invoice_profiles_update ON public.user_invoice_profiles
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  CREATE POLICY user_invoice_profiles_delete ON public.user_invoice_profiles
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_invoice_profiles policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 2. user_addresses tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS user_addresses_select ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_insert ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_update ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_delete ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_owner_select ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_owner_insert ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_owner_update ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_owner_delete ON public.user_addresses;
  DROP POLICY IF EXISTS user_addresses_owner_all ON public.user_addresses;
  
  CREATE POLICY user_addresses_owner_all ON public.user_addresses
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_addresses policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 3. shopping_carts tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS shopping_carts_owner ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_all ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_select ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_insert ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_update ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_delete ON public.shopping_carts;
  DROP POLICY IF EXISTS shopping_carts_owner_all ON public.shopping_carts;
  
  CREATE POLICY shopping_carts_owner_all ON public.shopping_carts
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'shopping_carts policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 4. cart_items tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS cart_items_owner ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_all ON public.cart_items;
  DROP POLICY IF EXISTS cart_items_owner_all ON public.cart_items;
  
  CREATE POLICY cart_items_owner_all ON public.cart_items
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_carts c WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cart_items policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 5. venthub_orders tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_orders_select ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_insert ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_update ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_owner_select ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_owner_insert ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_owner_update ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_admin ON public.venthub_orders;
  DROP POLICY IF EXISTS venthub_orders_owner ON public.venthub_orders;
  
  CREATE POLICY venthub_orders_owner ON public.venthub_orders
    FOR ALL TO authenticated
    USING (
      user_id = (SELECT auth.uid()) 
      OR (SELECT auth.role()) = 'service_role'
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))
    )
    WITH CHECK (
      user_id = (SELECT auth.uid()) 
      OR (SELECT auth.role()) = 'service_role'
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_orders policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 6. venthub_order_items tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_order_items_select ON public.venthub_order_items;
  DROP POLICY IF EXISTS venthub_order_items_insert ON public.venthub_order_items;
  DROP POLICY IF EXISTS venthub_order_items_owner ON public.venthub_order_items;
  
  CREATE POLICY venthub_order_items_owner ON public.venthub_order_items
    FOR ALL TO authenticated
    USING (
      order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
      OR (SELECT auth.role()) = 'service_role'
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))
    )
    WITH CHECK (
      order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
      OR (SELECT auth.role()) = 'service_role'
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_order_items policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 7. venthub_returns tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS venthub_returns_owner ON public.venthub_returns;
  DROP POLICY IF EXISTS venthub_returns_select ON public.venthub_returns;
  DROP POLICY IF EXISTS venthub_returns_insert ON public.venthub_returns;
  
  CREATE POLICY venthub_returns_owner ON public.venthub_returns
    FOR ALL TO authenticated
    USING (
      order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
      OR (SELECT auth.role()) = 'service_role'
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))
    )
    WITH CHECK (
      order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
      OR (SELECT auth.role()) = 'service_role'
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'venthub_returns policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 8. user_profiles tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_update ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_all ON public.user_profiles;
  DROP POLICY IF EXISTS user_profiles_owner ON public.user_profiles;
  
  CREATE POLICY user_profiles_owner ON public.user_profiles
    FOR ALL TO authenticated
    USING (
      id = (SELECT auth.uid()) 
      OR (SELECT auth.role()) = 'service_role'
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))
    )
    WITH CHECK (
      id = (SELECT auth.uid()) 
      OR (SELECT auth.role()) = 'service_role'
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_profiles policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 9. wizard_selections tablosu
-- ============================================================================
DO $$
BEGIN
  DROP POLICY IF EXISTS wizard_selections_owner ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_select ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_insert ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_update ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_admin ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_public_insert ON public.wizard_selections;
  DROP POLICY IF EXISTS wizard_selections_owner_select ON public.wizard_selections;
  
  -- Anonim ve oturum açmış kullanıcılar insert yapabilir
  CREATE POLICY wizard_selections_public_insert ON public.wizard_selections
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
  
  -- Oturum açmış kullanıcılar kendi kayıtlarını görebilir, adminler hepsini
  CREATE POLICY wizard_selections_owner_select ON public.wizard_selections
    FOR SELECT TO authenticated
    USING (
      user_id = (SELECT auth.uid())
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = (SELECT auth.uid()))
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'wizard_selections policies: %', SQLERRM;
END $$;

-- Tamamlandı
SELECT 'RLS Performance Lint Fix Migration completed.' as status;
