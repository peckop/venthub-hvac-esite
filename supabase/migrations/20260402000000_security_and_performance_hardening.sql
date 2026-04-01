-- =============================================================================
-- VentHub: Güvenlik Sertleştirme ve Performans Optimizasyonu
-- Tarih: 2026-04-02
-- Kaynak: Supabase Advisor Audit (2026-04-01)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SECURITY DEFINER VIEW → SECURITY INVOKER
-- Sorun: View yaratıcısının RLS'i sorgulayan kullanıcıya dayatıyordu
-- Çözüm: security_invoker = true ile sorgulayanın yetkileri geçerli olur
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.inventory_summary;
CREATE VIEW public.inventory_summary
  WITH (security_invoker = true)
AS
 WITH movement_stats AS (
         SELECT inventory_movements.product_id,
            COALESCE(sum(abs(inventory_movements.delta)), (0)::bigint) AS total_out_30d
           FROM inventory_movements
          WHERE ((inventory_movements.delta < 0)
            AND ((inventory_movements.reason = 'sale'::text) OR (inventory_movements.reason = 'manual_out'::text))
            AND (inventory_movements.created_at >= (now() - '30 days'::interval)))
          GROUP BY inventory_movements.product_id
        )
 SELECT p.id AS product_id,
    p.stock_qty,
    COALESCE(m.total_out_30d, (0)::bigint) AS total_out_30d,
    round(((COALESCE(m.total_out_30d, (0)::bigint))::numeric / 30.0), 2) AS daily_velocity,
    CASE
        WHEN (COALESCE(m.total_out_30d, (0)::bigint) = 0) THEN (9999)::numeric
        ELSE round(((p.stock_qty)::numeric / ((COALESCE(m.total_out_30d, (0)::bigint))::numeric / 30.0)))
    END AS days_until_empty,
    (COALESCE(p.purchase_price, (0)::numeric) * (p.stock_qty)::numeric) AS capital_tied_up,
    CASE
        WHEN (COALESCE(m.total_out_30d, (0)::bigint) >= 10) THEN 'A'::text
        WHEN (COALESCE(m.total_out_30d, (0)::bigint) >= 3) THEN 'B'::text
        ELSE 'C'::text
    END AS abc_class
   FROM (products p
     LEFT JOIN movement_stats m ON ((p.id = m.product_id)));

DROP VIEW IF EXISTS public.inventory_velocity;
CREATE VIEW public.inventory_velocity
  WITH (security_invoker = true)
AS
 WITH reserved AS (
         SELECT voi.product_id,
            (sum(voi.quantity))::integer AS reserved_qty
           FROM (venthub_order_items voi
             JOIN venthub_orders o ON ((o.id = voi.order_id)))
          WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text]))
            AND (o.shipped_at IS NULL))
          GROUP BY voi.product_id
        )
 SELECT p.id AS product_id,
    p.name,
    COALESCE(p.stock_qty, 0) AS physical_stock,
    COALESCE(r.reserved_qty, 0) AS reserved_stock,
    (COALESCE(p.stock_qty, 0) - COALESCE(r.reserved_qty, 0)) AS available_stock,
    p.warehouse_location,
    p.supplier_name
   FROM (products p
     LEFT JOIN reserved r ON ((r.product_id = p.id)));

-- -----------------------------------------------------------------------------
-- 2. FUNCTION SEARCH_PATH SABİTLEME
-- Sorun: Mutable search_path → saldırgan sahte tablo yerleştirebilir
-- Çözüm: search_path = public, extensions ile kilitlendi
-- -----------------------------------------------------------------------------

ALTER FUNCTION public.get_products_enriched(
  uuid[], integer, integer, text, text, text, numeric, numeric
)
SET search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- 3. ÇAKIŞAN RLS POLICY TEMİZLİĞİ
-- Sorun: Her sorgu için birden fazla permissive policy çalışıyordu
-- Çözüm: merged_ prefix'li şişirilmiş policy'ler kaldırıldı
--         admins_read_* ve _v2 olanlar (sade ve doğru) korundu
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS merged_admin_audit_log_authenticated_insert ON public.admin_audit_log;
DROP POLICY IF EXISTS merged_admin_audit_log_authenticated_select ON public.admin_audit_log;
DROP POLICY IF EXISTS merged_error_groups_authenticated_select ON public.error_groups;
DROP POLICY IF EXISTS merged_returns_webhook_events_authenticated_select ON public.returns_webhook_events;
DROP POLICY IF EXISTS merged_shipping_email_events_authenticated_select ON public.shipping_email_events;
DROP POLICY IF EXISTS merged_shipping_webhook_events_authenticated_select ON public.shipping_webhook_events;
-- product_authorities: ALL policy SELECT'i zaten kapsıyor
DROP POLICY IF EXISTS "Product authorities are viewable by everyone." ON public.product_authorities;

COMMIT;

-- -----------------------------------------------------------------------------
-- 4. EKSİK FK İNDEKSLERİ
-- Sorun: FK kolonlarında index yoktu → JOIN full table scan yapıyordu
-- Not: CONCURRENTLY transaction dışında çalışır, tablo kilitlenmez
-- -----------------------------------------------------------------------------

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_category_mapping_rules_target_subcategory
  ON public.category_mapping_rules(target_subcategory_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_items_product_id
  ON public.project_items(product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_updated_by
  ON public.site_settings(updated_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_projects_user_id
  ON public.user_projects(user_id);
