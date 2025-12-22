-- Performance Lint Fix Migration
-- Bu migration, Supabase Dashboard'daki performans uyarılarını düzeltir.
-- auth.uid() ve auth.role() çağrılarını (SELECT ...) formatına dönüştürür.
-- Bu, RLS politikalarının her satır için değil, sorgu başına bir kez değerlendirilmesini sağlar.

BEGIN;

-- ============================================================================
-- 1. user_invoice_profiles tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS user_invoice_profiles_select ON public.user_invoice_profiles;
DROP POLICY IF EXISTS user_invoice_profiles_insert ON public.user_invoice_profiles;
DROP POLICY IF EXISTS user_invoice_profiles_update ON public.user_invoice_profiles;
DROP POLICY IF EXISTS user_invoice_profiles_delete ON public.user_invoice_profiles;

CREATE POLICY user_invoice_profiles_select ON public.user_invoice_profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY user_invoice_profiles_insert ON public.user_invoice_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY user_invoice_profiles_update ON public.user_invoice_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY user_invoice_profiles_delete ON public.user_invoice_profiles
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 2. user_addresses tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS user_addresses_select ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_insert ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_update ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_delete ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_owner_select ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_owner_insert ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_owner_update ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_owner_delete ON public.user_addresses;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_addresses') THEN
    EXECUTE 'CREATE POLICY user_addresses_owner_all ON public.user_addresses
      FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id)';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. shopping_carts tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS shopping_carts_owner ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_all ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_select ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_insert ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_update ON public.shopping_carts;
DROP POLICY IF EXISTS shopping_carts_delete ON public.shopping_carts;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shopping_carts') THEN
    EXECUTE 'CREATE POLICY shopping_carts_owner_all ON public.shopping_carts
      FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id)';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 4. cart_items tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS cart_items_owner ON public.cart_items;
DROP POLICY IF EXISTS cart_items_all ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_owner" ON public.cart_items;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cart_items') THEN
    EXECUTE 'CREATE POLICY cart_items_owner_all ON public.cart_items
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c 
          WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.shopping_carts c 
          WHERE c.id = cart_items.cart_id AND c.user_id = (SELECT auth.uid())
        )
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 5. venthub_orders tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS venthub_orders_select ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_insert ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_update ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_owner_select ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_owner_insert ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_owner_update ON public.venthub_orders;
DROP POLICY IF EXISTS venthub_orders_admin ON public.venthub_orders;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venthub_orders') THEN
    -- Kullanıcı kendi siparişlerini görebilir ve oluşturabilir
    EXECUTE 'CREATE POLICY venthub_orders_owner ON public.venthub_orders
      FOR ALL TO authenticated
      USING (
        user_id = (SELECT auth.uid()) 
        OR (SELECT auth.role()) = ''service_role''
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
      )
      WITH CHECK (
        user_id = (SELECT auth.uid()) 
        OR (SELECT auth.role()) = ''service_role''
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 6. venthub_order_items tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS venthub_order_items_select ON public.venthub_order_items;
DROP POLICY IF EXISTS venthub_order_items_insert ON public.venthub_order_items;
DROP POLICY IF EXISTS venthub_order_items_owner ON public.venthub_order_items;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venthub_order_items') THEN
    EXECUTE 'CREATE POLICY venthub_order_items_owner ON public.venthub_order_items
      FOR ALL TO authenticated
      USING (
        order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
        OR (SELECT auth.role()) = ''service_role''
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
      )
      WITH CHECK (
        order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
        OR (SELECT auth.role()) = ''service_role''
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 7. venthub_returns tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS venthub_returns_owner ON public.venthub_returns;
DROP POLICY IF EXISTS venthub_returns_select ON public.venthub_returns;
DROP POLICY IF EXISTS venthub_returns_insert ON public.venthub_returns;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venthub_returns') THEN
    EXECUTE 'CREATE POLICY venthub_returns_owner ON public.venthub_returns
      FOR ALL TO authenticated
      USING (
        order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
        OR (SELECT auth.role()) = ''service_role''
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
      )
      WITH CHECK (
        order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
        OR (SELECT auth.role()) = ''service_role''
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 8. user_profiles tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_all ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_owner ON public.user_profiles;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    EXECUTE 'CREATE POLICY user_profiles_owner ON public.user_profiles
      FOR ALL TO authenticated
      USING (
        id = (SELECT auth.uid()) 
        OR (SELECT auth.role()) = ''service_role''
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
      )
      WITH CHECK (
        id = (SELECT auth.uid()) 
        OR (SELECT auth.role()) = ''service_role''
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 9. wizard_selections tablosu RLS politikaları
-- ============================================================================
DROP POLICY IF EXISTS wizard_selections_owner ON public.wizard_selections;
DROP POLICY IF EXISTS wizard_selections_select ON public.wizard_selections;
DROP POLICY IF EXISTS wizard_selections_insert ON public.wizard_selections;
DROP POLICY IF EXISTS wizard_selections_update ON public.wizard_selections;
DROP POLICY IF EXISTS wizard_selections_admin ON public.wizard_selections;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wizard_selections') THEN
    -- Anonim ve oturum açmış kullanıcılar
    EXECUTE 'CREATE POLICY wizard_selections_public_insert ON public.wizard_selections
      FOR INSERT TO anon, authenticated
      WITH CHECK (true)';
    
    EXECUTE 'CREATE POLICY wizard_selections_owner_select ON public.wizard_selections
      FOR SELECT TO authenticated
      USING (
        user_id = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
      )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
