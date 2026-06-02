-- Migration: Resolve RLS Performance & Clean Up Duplicate Policies
-- Created: 2026-06-02
-- Description:
-- 1. Cleans up 31 multiple permissive policies by dropping duplicates and legacy merged_ policies.
-- 2. Resolves 11 auth_rls_initplan warnings by wrapping RLS functions/claims in subqueries (SELECT ...).
-- 3. Resolves the remaining 5 multiple permissive SELECT policy warnings by merging SELECT policies and splitting ALL policies for coupons, order_attachments, order_notes, price_lists, and product_prices.

BEGIN;

-- ============================================================================
-- 1. DROP DUPLICATE & OVERLAPPING POLICIES (multiple_permissive_policies fix)
-- ============================================================================

-- contact_messages duplicate select policy
DROP POLICY IF EXISTS "admin_view_messages" ON public.contact_messages;

-- coupons duplicate merged policies
DROP POLICY IF EXISTS "merged_coupons_anon_select" ON public.coupons;
DROP POLICY IF EXISTS "merged_coupons_authenticated_select" ON public.coupons;
DROP POLICY IF EXISTS "merged_coupons_dashboard_user_select" ON public.coupons;
DROP POLICY IF EXISTS "merged_coupons_service_role_select" ON public.coupons;

-- inventory_movements duplicate merged policies
DROP POLICY IF EXISTS "merged_inventory_movements_authenticated_select" ON public.inventory_movements;
DROP POLICY IF EXISTS "merged_inventory_movements_service_role_select" ON public.inventory_movements;

-- inventory_settings duplicate merged policies
DROP POLICY IF EXISTS "merged_inventory_settings_anon_select" ON public.inventory_settings;
DROP POLICY IF EXISTS "merged_inventory_settings_authenticated_select" ON public.inventory_settings;
DROP POLICY IF EXISTS "merged_inventory_settings_authenticated_update" ON public.inventory_settings;
DROP POLICY IF EXISTS "merged_inventory_settings_service_role_select" ON public.inventory_settings;

-- order_attachments duplicate merged policies
DROP POLICY IF EXISTS "merged_order_attachments_authenticated_select" ON public.order_attachments;
DROP POLICY IF EXISTS "merged_order_attachments_service_role_select" ON public.order_attachments;

-- order_notes duplicate merged policies
DROP POLICY IF EXISTS "merged_order_notes_authenticated_delete" ON public.order_notes;
DROP POLICY IF EXISTS "merged_order_notes_authenticated_insert" ON public.order_notes;
DROP POLICY IF EXISTS "merged_order_notes_authenticated_select" ON public.order_notes;
DROP POLICY IF EXISTS "merged_order_notes_service_role_select" ON public.order_notes;

-- order_refund_events duplicate merged policies
DROP POLICY IF EXISTS "merged_order_refund_events_authenticated_select" ON public.order_refund_events;
DROP POLICY IF EXISTS "merged_order_refund_events_service_role_select" ON public.order_refund_events;

-- price_lists duplicate merged policies
DROP POLICY IF EXISTS "merged_price_lists_anon_select" ON public.price_lists;
DROP POLICY IF EXISTS "merged_price_lists_authenticated_select" ON public.price_lists;
DROP POLICY IF EXISTS "merged_price_lists_service_role_select" ON public.price_lists;

-- product_prices duplicate merged policies
DROP POLICY IF EXISTS "merged_product_prices_anon_select" ON public.product_prices;
DROP POLICY IF EXISTS "merged_product_prices_authenticated_delete" ON public.product_prices;
DROP POLICY IF EXISTS "merged_product_prices_authenticated_insert" ON public.product_prices;
DROP POLICY IF EXISTS "merged_product_prices_authenticated_select" ON public.product_prices;
DROP POLICY IF EXISTS "merged_product_prices_authenticated_update" ON public.product_prices;
DROP POLICY IF EXISTS "merged_product_prices_service_role_select" ON public.product_prices;

-- tenants duplicate merged policies
DROP POLICY IF EXISTS "merged_tenants_anon_select" ON public.tenants;
DROP POLICY IF EXISTS "merged_tenants_authenticated_select" ON public.tenants;
DROP POLICY IF EXISTS "merged_tenants_service_role_select" ON public.tenants;

-- user_addresses duplicate merged policies
DROP POLICY IF EXISTS "merged_user_addresses_authenticated_delete" ON public.user_addresses;
DROP POLICY IF EXISTS "merged_user_addresses_authenticated_insert" ON public.user_addresses;
DROP POLICY IF EXISTS "merged_user_addresses_authenticated_select" ON public.user_addresses;
DROP POLICY IF EXISTS "merged_user_addresses_authenticated_update" ON public.user_addresses;
DROP POLICY IF EXISTS "merged_user_addresses_service_role_select" ON public.user_addresses;

-- user_profiles duplicate merged policies
DROP POLICY IF EXISTS "merged_user_profiles_authenticated_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "merged_user_profiles_authenticated_update" ON public.user_profiles;
DROP POLICY IF EXISTS "merged_user_profiles_service_role_select" ON public.user_profiles;

-- venthub_orders duplicate merged policies
DROP POLICY IF EXISTS "merged_venthub_orders_authenticated_delete" ON public.venthub_orders;
DROP POLICY IF EXISTS "merged_venthub_orders_authenticated_insert" ON public.venthub_orders;
DROP POLICY IF EXISTS "merged_venthub_orders_authenticated_update" ON public.venthub_orders;
DROP POLICY IF EXISTS "merged_venthub_orders_service_role_select" ON public.venthub_orders;

-- venthub_returns duplicate merged policies
DROP POLICY IF EXISTS "merged_venthub_returns_authenticated_update" ON public.venthub_returns;

-- Drop other redundant merged policies from the database
DROP POLICY IF EXISTS "merged_category_mapping_rules_authenticated_select" ON public.category_mapping_rules;
DROP POLICY IF EXISTS "merged_rate_limits_service_role_select" ON public.rate_limits;
DROP POLICY IF EXISTS "merged_wizard_selections_service_role_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "merged_admin_audit_log_service_role_select" ON public.admin_audit_log;
DROP POLICY IF EXISTS "merged_returns_webhook_events_service_role_insert" ON public.returns_webhook_events;
DROP POLICY IF EXISTS "merged_returns_webhook_events_service_role_select" ON public.returns_webhook_events;
DROP POLICY IF EXISTS "merged_cart_items_service_role_select" ON public.cart_items;
DROP POLICY IF EXISTS "merged_client_errors_authenticated_select" ON public.client_errors;
DROP POLICY IF EXISTS "merged_organizations_authenticated_delete" ON public.organizations;
DROP POLICY IF EXISTS "merged_organizations_authenticated_insert" ON public.organizations;
DROP POLICY IF EXISTS "merged_organizations_authenticated_update" ON public.organizations;
DROP POLICY IF EXISTS "merged_payment_transactions_authenticated_delete" ON public.payment_transactions;
DROP POLICY IF EXISTS "merged_payment_transactions_authenticated_insert" ON public.payment_transactions;
DROP POLICY IF EXISTS "merged_payment_transactions_authenticated_select" ON public.payment_transactions;
DROP POLICY IF EXISTS "merged_payment_transactions_authenticated_update" ON public.payment_transactions;
DROP POLICY IF EXISTS "merged_site_settings_anon_select" ON public.site_settings;
DROP POLICY IF EXISTS "merged_site_settings_authenticated_select" ON public.site_settings;
DROP POLICY IF EXISTS "merged_site_settings_authenticated_update" ON public.site_settings;
DROP POLICY IF EXISTS "merged_product_images_authenticated_delete" ON public.product_images;
DROP POLICY IF EXISTS "merged_product_images_authenticated_insert" ON public.product_images;
DROP POLICY IF EXISTS "merged_shipping_idempotency_service_role_select" ON public.shipping_idempotency;
DROP POLICY IF EXISTS "merged_user_invoice_profiles_service_role_select" ON public.user_invoice_profiles;
DROP POLICY IF EXISTS "merged_shipping_email_events_service_role_insert" ON public.shipping_email_events;
DROP POLICY IF EXISTS "merged_shipping_email_events_service_role_select" ON public.shipping_email_events;
DROP POLICY IF EXISTS "merged_shipping_webhook_events_service_role_select" ON public.shipping_webhook_events;
DROP POLICY IF EXISTS "merged_order_email_events_authenticated_select" ON public.order_email_events;
DROP POLICY IF EXISTS "merged_order_email_events_service_role_insert" ON public.order_email_events;


-- ============================================================================
-- 2. RE-CREATE FLAG-CHECK POLICIES WITH (SELECT ...) WRAPPER & SPLIT / MERGED SELECT
-- ============================================================================

-- 2.1 public.inventory_settings -> inventory_settings_update_admin
DROP POLICY IF EXISTS "inventory_settings_update_admin" ON public.inventory_settings;
CREATE POLICY "inventory_settings_update_admin" ON public.inventory_settings
  FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

-- 2.2 public.coupons -> Split coupons_admin_all and merge SELECT
DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
DROP POLICY IF EXISTS "coupons_public_select" ON public.coupons;

CREATE POLICY "coupons_select_authenticated" ON public.coupons FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND ((SELECT public.is_user_admin((SELECT auth.uid()))) OR (is_active = true AND (valid_until IS NULL OR valid_until > now()))));

CREATE POLICY "coupons_select_anon" ON public.coupons FOR SELECT TO anon
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "coupons_admin_insert" ON public.coupons FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "coupons_admin_update" ON public.coupons FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "coupons_admin_delete" ON public.coupons FOR DELETE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));


-- 2.3 & 2.4 public.order_notes -> Split order_notes_admin_all and merge SELECT
DROP POLICY IF EXISTS "order_notes_admin_all" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_view_policy" ON public.order_notes;

CREATE POLICY "order_notes_select_authenticated" ON public.order_notes FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (
    (SELECT public.is_user_admin((SELECT auth.uid()))) OR
    (NOT is_internal AND order_id IN (
      SELECT id FROM public.venthub_orders 
      WHERE user_id = (SELECT auth.uid()) AND tenant_id = (SELECT public.jwt_tenant_id())
    ))
  ));

CREATE POLICY "order_notes_admin_insert" ON public.order_notes FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "order_notes_admin_update" ON public.order_notes FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "order_notes_admin_delete" ON public.order_notes FOR DELETE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));


-- 2.5 public.user_profiles -> user_profiles_select_policy
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (id = (SELECT auth.uid()) OR (SELECT public.is_admin_user())));

-- 2.6 public.inventory_movements -> inventory_movements_select_admin
DROP POLICY IF EXISTS "inventory_movements_select_admin" ON public.inventory_movements;
CREATE POLICY "inventory_movements_select_admin" ON public.inventory_movements
  FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));


-- 2.7 & 2.8 public.order_attachments -> Split order_attachments_admin_all and merge SELECT
DROP POLICY IF EXISTS "order_attachments_admin_all" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_view_policy" ON public.order_attachments;

CREATE POLICY "order_attachments_select_authenticated" ON public.order_attachments FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (
    (SELECT public.is_user_admin((SELECT auth.uid()))) OR
    (NOT is_internal AND order_id IN (
      SELECT id FROM public.venthub_orders 
      WHERE user_id = (SELECT auth.uid()) AND tenant_id = (SELECT public.jwt_tenant_id())
    ))
  ));

CREATE POLICY "order_attachments_admin_insert" ON public.order_attachments FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "order_attachments_admin_update" ON public.order_attachments FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "order_attachments_admin_delete" ON public.order_attachments FOR DELETE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));


-- 2.9 public.product_prices -> Split product_prices_admin_all and merge SELECT
DROP POLICY IF EXISTS "product_prices_admin_all" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_select" ON public.product_prices;

CREATE POLICY "product_prices_select_authenticated" ON public.product_prices FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND ((SELECT public.is_user_admin((SELECT auth.uid()))) OR is_active = true));

CREATE POLICY "product_prices_select_anon" ON public.product_prices FOR SELECT TO anon
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND is_active = true);

CREATE POLICY "product_prices_admin_insert" ON public.product_prices FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "product_prices_admin_update" ON public.product_prices FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "product_prices_admin_delete" ON public.product_prices FOR DELETE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));


-- 2.10 & 2.11 public.price_lists -> Split price_lists_admin_all and merge SELECT
DROP POLICY IF EXISTS "price_lists_admin_all" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_select" ON public.price_lists;

CREATE POLICY "price_lists_select_authenticated" ON public.price_lists FOR SELECT TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND ((SELECT public.is_user_admin((SELECT auth.uid()))) OR is_active = true));

CREATE POLICY "price_lists_select_anon" ON public.price_lists FOR SELECT TO anon
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND is_active = true);

CREATE POLICY "price_lists_admin_insert" ON public.price_lists FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "price_lists_admin_update" ON public.price_lists FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))))
  WITH CHECK (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

CREATE POLICY "price_lists_admin_delete" ON public.price_lists FOR DELETE TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()) AND (SELECT public.is_user_admin((SELECT auth.uid()))));

COMMIT;
