-- Multi-Tenant SaaS Foundation Migration
-- Target: public.tenants table and 21 Tenant-Aware tables.
-- Sequence: Golden Triad (Grants -> Enable RLS -> Recreate Policies).

BEGIN;

-- ==========================================
-- PART 1: public.tenants setup
-- ==========================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subdomain text UNIQUE,
  custom_domain text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Golden Triad: Grants
GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

-- Golden Triad: Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Golden Triad: Policies
DROP POLICY IF EXISTS tenants_select ON public.tenants;
CREATE POLICY tenants_select ON public.tenants
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS tenants_all_service_role ON public.tenants;
CREATE POLICY tenants_all_service_role ON public.tenants
  FOR ALL TO service_role USING (true);

-- Populate default tenant
INSERT INTO public.tenants (id, name, subdomain, is_active)
VALUES ('d3b07384-d113-495f-a558-8c38634e0000', 'Default Tenant', 'default', true)
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- PART 2: jwt_tenant_id() RPC Helper
-- ==========================================

CREATE OR REPLACE FUNCTION public.jwt_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  claims_str text;
  tenant_id_val text;
BEGIN
  -- Extract raw JWT claims string safely
  claims_str := current_setting('request.jwt.claims', true);
  
  IF claims_str IS NULL OR claims_str = '' THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;
  
  -- Parse JSON and extract app_metadata -> tenant_id
  tenant_id_val := claims_str::jsonb -> 'app_metadata' ->> 'tenant_id';
  
  IF tenant_id_val IS NULL OR tenant_id_val = '' THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;
  
  RETURN tenant_id_val::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
END;
$$;


-- ==========================================
-- PART 3: Adding tenant_id column and foreign key index
-- ==========================================

-- 1. shopping_carts
ALTER TABLE public.shopping_carts ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shopping_carts_tenant_id ON public.shopping_carts(tenant_id);

-- 2. cart_items
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cart_items_tenant_id ON public.cart_items(tenant_id);

-- 3. venthub_orders
ALTER TABLE public.venthub_orders ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_venthub_orders_tenant_id ON public.venthub_orders(tenant_id);

-- 4. venthub_order_items
ALTER TABLE public.venthub_order_items ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_tenant_id ON public.venthub_order_items(tenant_id);

-- 5. venthub_returns
ALTER TABLE public.venthub_returns ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_venthub_returns_tenant_id ON public.venthub_returns(tenant_id);

-- 6. coupons
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_coupons_tenant_id ON public.coupons(tenant_id);

-- 7. inventory_movements
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant_id ON public.inventory_movements(tenant_id);

-- 8. inventory_settings
ALTER TABLE public.inventory_settings ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_inventory_settings_tenant_id ON public.inventory_settings(tenant_id);

-- 9. price_lists
ALTER TABLE public.price_lists ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_price_lists_tenant_id ON public.price_lists(tenant_id);

-- 10. product_prices
ALTER TABLE public.product_prices ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_product_prices_tenant_id ON public.product_prices(tenant_id);

-- 11. order_attachments
ALTER TABLE public.order_attachments ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_attachments_tenant_id ON public.order_attachments(tenant_id);

-- 12. order_notes
ALTER TABLE public.order_notes ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_notes_tenant_id ON public.order_notes(tenant_id);

-- 13. order_refund_events
ALTER TABLE public.order_refund_events ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_refund_events_tenant_id ON public.order_refund_events(tenant_id);

-- 14. user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON public.user_profiles(tenant_id);

-- 15. user_addresses
ALTER TABLE public.user_addresses ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_addresses_tenant_id ON public.user_addresses(tenant_id);

-- 16. user_invoice_profiles
ALTER TABLE public.user_invoice_profiles ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_invoice_profiles_tenant_id ON public.user_invoice_profiles(tenant_id);

-- 17. wizard_selections
ALTER TABLE public.wizard_selections ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_wizard_selections_tenant_id ON public.wizard_selections(tenant_id);

-- 18. shipping_email_events
ALTER TABLE public.shipping_email_events ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shipping_email_events_tenant_id ON public.shipping_email_events(tenant_id);

-- 19. shipping_webhook_events
ALTER TABLE public.shipping_webhook_events ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shipping_webhook_events_tenant_id ON public.shipping_webhook_events(tenant_id);

-- 20. returns_webhook_events
ALTER TABLE public.returns_webhook_events ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_returns_webhook_events_tenant_id ON public.returns_webhook_events(tenant_id);

-- 21. admin_audit_log
ALTER TABLE public.admin_audit_log ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_tenant_id ON public.admin_audit_log(tenant_id);


-- ==========================================
-- PART 4: Applying Golden Triad & Recreating Policies
-- ==========================================

-- 1. shopping_carts
GRANT SELECT ON public.shopping_carts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_carts TO authenticated;
GRANT ALL ON public.shopping_carts TO service_role;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sc_auth_all" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_policy" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_select_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_modify_own" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_all" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_user_all" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_service_role" ON public.shopping_carts;

CREATE POLICY "sc_auth_all" ON public.shopping_carts
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "shopping_carts_service_role" ON public.shopping_carts
  FOR ALL TO service_role USING (true);


-- 2. cart_items
GRANT SELECT ON public.cart_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ci_auth_all" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_modify_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_all" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_user_all" ON public.cart_items;
DROP POLICY IF EXISTS "p_user_read_own_cart" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_service_role" ON public.cart_items;

CREATE POLICY "ci_auth_all" ON public.cart_items
  FOR ALL TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id() AND
    cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = (SELECT auth.uid()) AND tenant_id = public.jwt_tenant_id())
  )
  WITH CHECK (
    tenant_id = public.jwt_tenant_id() AND
    cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = (SELECT auth.uid()) AND tenant_id = public.jwt_tenant_id())
  );

CREATE POLICY "cart_items_service_role" ON public.cart_items
  FOR ALL TO service_role USING (true);


-- 3. venthub_orders
GRANT SELECT ON public.venthub_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venthub_orders TO authenticated;
GRANT ALL ON public.venthub_orders TO service_role;
ALTER TABLE public.venthub_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_service_role" ON public.venthub_orders;

CREATE POLICY "orders_select_policy" ON public.venthub_orders
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

CREATE POLICY "orders_insert_policy" ON public.venthub_orders
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

CREATE POLICY "orders_update_policy" ON public.venthub_orders
  FOR UPDATE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

CREATE POLICY "orders_delete_policy" ON public.venthub_orders
  FOR DELETE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (SELECT public.is_admin_user()));

CREATE POLICY "orders_service_role" ON public.venthub_orders
  FOR ALL TO service_role USING (true);


-- 4. venthub_order_items
GRANT SELECT ON public.venthub_order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venthub_order_items TO authenticated;
GRANT ALL ON public.venthub_order_items TO service_role;
ALTER TABLE public.venthub_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venthub_order_items_select_consolidated" ON public.venthub_order_items;
DROP POLICY IF EXISTS "venthub_order_items_insert_optimized" ON public.venthub_order_items;
DROP POLICY IF EXISTS "venthub_order_items_service_role" ON public.venthub_order_items;

CREATE POLICY "venthub_order_items_select_consolidated" ON public.venthub_order_items
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id() AND (
      order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()) AND tenant_id = public.jwt_tenant_id())
      OR (SELECT public.is_admin_user())
    )
  );

CREATE POLICY "venthub_order_items_insert_optimized" ON public.venthub_order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.jwt_tenant_id() AND
    EXISTS (SELECT 1 FROM public.venthub_orders WHERE id = order_id AND user_id = (SELECT auth.uid()) AND tenant_id = public.jwt_tenant_id())
  );

CREATE POLICY "venthub_order_items_service_role" ON public.venthub_order_items
  FOR ALL TO service_role USING (true);


-- 5. venthub_returns
GRANT SELECT ON public.venthub_returns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venthub_returns TO authenticated;
GRANT ALL ON public.venthub_returns TO service_role;
ALTER TABLE public.venthub_returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venthub_returns_select_consolidated" ON public.venthub_returns;
DROP POLICY IF EXISTS "returns_select_policy" ON public.venthub_returns;
DROP POLICY IF EXISTS "returns_insert_policy" ON public.venthub_returns;
DROP POLICY IF EXISTS "returns_update_policy" ON public.venthub_returns;
DROP POLICY IF EXISTS "returns_delete_policy" ON public.venthub_returns;
DROP POLICY IF EXISTS "returns_service_role" ON public.venthub_returns;

CREATE POLICY "returns_select_policy" ON public.venthub_returns
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

CREATE POLICY "returns_insert_policy" ON public.venthub_returns
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

CREATE POLICY "returns_update_policy" ON public.venthub_returns
  FOR UPDATE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (SELECT public.is_admin_user()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (SELECT public.is_admin_user()));

CREATE POLICY "returns_delete_policy" ON public.venthub_returns
  FOR DELETE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (SELECT public.is_admin_user()));

CREATE POLICY "returns_service_role" ON public.venthub_returns
  FOR ALL TO service_role USING (true);


-- 6. coupons
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
DROP POLICY IF EXISTS "coupons_public_select" ON public.coupons;
DROP POLICY IF EXISTS "coupons_service_role" ON public.coupons;

CREATE POLICY "coupons_admin_all" ON public.coupons
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "coupons_public_select" ON public.coupons
  FOR SELECT TO anon, authenticated
  USING (tenant_id = public.jwt_tenant_id() AND is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "coupons_service_role" ON public.coupons
  FOR ALL TO service_role USING (true);


-- 7. inventory_movements
GRANT SELECT ON public.inventory_movements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_movements_select_admin" ON public.inventory_movements;
DROP POLICY IF EXISTS "p_admin_read_inventory" ON public.inventory_movements;
DROP POLICY IF EXISTS "inventory_movements_service_role" ON public.inventory_movements;

CREATE POLICY "inventory_movements_select_admin" ON public.inventory_movements
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "inventory_movements_service_role" ON public.inventory_movements
  FOR ALL TO service_role USING (true);


-- 8. inventory_settings
GRANT SELECT ON public.inventory_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_settings TO authenticated;
GRANT ALL ON public.inventory_settings TO service_role;
ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_settings_select_all" ON public.inventory_settings;
DROP POLICY IF EXISTS "inventory_settings_update_admin" ON public.inventory_settings;
DROP POLICY IF EXISTS "inventory_settings_service_role" ON public.inventory_settings;

CREATE POLICY "inventory_settings_select_all" ON public.inventory_settings
  FOR SELECT TO anon, authenticated
  USING (tenant_id = public.jwt_tenant_id());

CREATE POLICY "inventory_settings_update_admin" ON public.inventory_settings
  FOR UPDATE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "inventory_settings_service_role" ON public.inventory_settings
  FOR ALL TO service_role USING (true);


-- 9. price_lists
GRANT SELECT ON public.price_lists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_lists TO authenticated;
GRANT ALL ON public.price_lists TO service_role;
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p_anon_read_active_price_lists" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_select" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_admin_all" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_service_role" ON public.price_lists;

CREATE POLICY "price_lists_select" ON public.price_lists
  FOR SELECT TO anon, authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (active = true OR public.is_user_admin(auth.uid())));

CREATE POLICY "price_lists_admin_all" ON public.price_lists
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "price_lists_service_role" ON public.price_lists
  FOR ALL TO service_role USING (true);


-- 10. product_prices
GRANT SELECT ON public.product_prices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_prices TO authenticated;
GRANT ALL ON public.product_prices TO service_role;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_prices_select" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_admin_all" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_service_role" ON public.product_prices;

CREATE POLICY "product_prices_select" ON public.product_prices
  FOR SELECT TO anon, authenticated
  USING (tenant_id = public.jwt_tenant_id());

CREATE POLICY "product_prices_admin_all" ON public.product_prices
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "product_prices_service_role" ON public.product_prices
  FOR ALL TO service_role USING (true);


-- 11. order_attachments
GRANT SELECT ON public.order_attachments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_attachments TO authenticated;
GRANT ALL ON public.order_attachments TO service_role;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage order attachments" ON public.order_attachments;
DROP POLICY IF EXISTS "Order owners can view non-internal attachments" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_admin_all" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_view_policy" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_service_role" ON public.order_attachments;

CREATE POLICY "order_attachments_admin_all" ON public.order_attachments
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "order_attachments_view_policy" ON public.order_attachments
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id() AND
    NOT is_internal AND
    order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid() AND tenant_id = public.jwt_tenant_id())
  );

CREATE POLICY "order_attachments_service_role" ON public.order_attachments
  FOR ALL TO service_role USING (true);


-- 12. order_notes
GRANT SELECT ON public.order_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_notes TO authenticated;
GRANT ALL ON public.order_notes TO service_role;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage order notes" ON public.order_notes;
DROP POLICY IF EXISTS "Order owners can view non-internal notes" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_admin_all" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_view_policy" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_service_role" ON public.order_notes;

CREATE POLICY "order_notes_admin_all" ON public.order_notes
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "order_notes_view_policy" ON public.order_notes
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id() AND
    NOT is_internal AND
    order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid() AND tenant_id = public.jwt_tenant_id())
  );

CREATE POLICY "order_notes_service_role" ON public.order_notes
  FOR ALL TO service_role USING (true);


-- 13. order_refund_events
GRANT SELECT ON public.order_refund_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_refund_events TO authenticated;
GRANT ALL ON public.order_refund_events TO service_role;
ALTER TABLE public.order_refund_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_refund_events_admin_select" ON public.order_refund_events;
DROP POLICY IF EXISTS "order_refund_events_service_role" ON public.order_refund_events;

CREATE POLICY "order_refund_events_admin_select" ON public.order_refund_events
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "order_refund_events_service_role" ON public.order_refund_events
  FOR ALL TO service_role USING (true);


-- 14. user_profiles
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_merged" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_merged" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_service_role" ON public.user_profiles;

CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));

CREATE POLICY "user_profiles_delete_policy" ON public.user_profiles
  FOR DELETE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "user_profiles_service_role" ON public.user_profiles
  FOR ALL TO service_role USING (true);


-- 15. user_addresses
GRANT SELECT ON public.user_addresses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;
GRANT ALL ON public.user_addresses TO service_role;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_addresses_select" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_update" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_delete" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_service_role" ON public.user_addresses;

CREATE POLICY "user_addresses_select" ON public.user_addresses
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "user_addresses_insert" ON public.user_addresses
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "user_addresses_update" ON public.user_addresses
  FOR UPDATE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "user_addresses_delete" ON public.user_addresses
  FOR DELETE TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "user_addresses_service_role" ON public.user_addresses
  FOR ALL TO service_role USING (true);


-- 16. user_invoice_profiles
GRANT SELECT ON public.user_invoice_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_invoice_profiles TO authenticated;
GRANT ALL ON public.user_invoice_profiles TO service_role;
ALTER TABLE public.user_invoice_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_invoice_profiles_own" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "uip_own" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "user_invoice_profiles_service_role" ON public.user_invoice_profiles;

CREATE POLICY "uip_own" ON public.user_invoice_profiles
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "user_invoice_profiles_service_role" ON public.user_invoice_profiles
  FOR ALL TO service_role USING (true);


-- 17. wizard_selections
GRANT SELECT ON public.wizard_selections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wizard_selections TO authenticated;
GRANT ALL ON public.wizard_selections TO service_role;
ALTER TABLE public.wizard_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_anon_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "ws_auth_all" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_service_role" ON public.wizard_selections;

CREATE POLICY "ws_anon_insert" ON public.wizard_selections
  FOR INSERT TO anon
  WITH CHECK (tenant_id = public.jwt_tenant_id());

CREATE POLICY "ws_auth_all" ON public.wizard_selections
  FOR ALL TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()))
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND user_id = (SELECT auth.uid()));

CREATE POLICY "wizard_selections_service_role" ON public.wizard_selections
  FOR ALL TO service_role USING (true);


-- 18. shipping_email_events
GRANT SELECT ON public.shipping_email_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_email_events TO authenticated;
GRANT ALL ON public.shipping_email_events TO service_role;
ALTER TABLE public.shipping_email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_shipping_emails" ON public.shipping_email_events;
DROP POLICY IF EXISTS "shipping_email_events_admin_select" ON public.shipping_email_events;
DROP POLICY IF EXISTS "shipping_email_events_service_role" ON public.shipping_email_events;

CREATE POLICY "shipping_email_events_admin_select" ON public.shipping_email_events
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "shipping_email_events_service_role" ON public.shipping_email_events
  FOR ALL TO service_role USING (true);


-- 19. shipping_webhook_events
GRANT SELECT ON public.shipping_webhook_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_webhook_events TO authenticated;
GRANT ALL ON public.shipping_webhook_events TO service_role;
ALTER TABLE public.shipping_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_shipping_webhooks" ON public.shipping_webhook_events;
DROP POLICY IF EXISTS "shipping_webhook_events_admin_select" ON public.shipping_webhook_events;
DROP POLICY IF EXISTS "shipping_webhook_events_service_role" ON public.shipping_webhook_events;

CREATE POLICY "shipping_webhook_events_admin_select" ON public.shipping_webhook_events
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "shipping_webhook_events_service_role" ON public.shipping_webhook_events
  FOR ALL TO service_role USING (true);


-- 20. returns_webhook_events
GRANT SELECT ON public.returns_webhook_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.returns_webhook_events TO authenticated;
GRANT ALL ON public.returns_webhook_events TO service_role;
ALTER TABLE public.returns_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_returns_webhooks" ON public.returns_webhook_events;
DROP POLICY IF EXISTS "returns_webhook_events_admin_select" ON public.returns_webhook_events;
DROP POLICY IF EXISTS "returns_webhook_events_service_role" ON public.returns_webhook_events;

CREATE POLICY "returns_webhook_events_admin_select" ON public.returns_webhook_events
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "returns_webhook_events_service_role" ON public.returns_webhook_events
  FOR ALL TO service_role USING (true);


-- 21. admin_audit_log
GRANT SELECT ON public.admin_audit_log TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_log_select_v2" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_insert_v2" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_service_role" ON public.admin_audit_log;

CREATE POLICY "admin_audit_log_select_v2" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "admin_audit_log_insert_v2" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.jwt_tenant_id() AND public.is_admin_user());

CREATE POLICY "admin_audit_log_service_role" ON public.admin_audit_log
  FOR ALL TO service_role USING (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
