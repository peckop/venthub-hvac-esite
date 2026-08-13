# Veritabani Semasi — venthub-hvac

---
compiled_at: 2026-08-13T08:29:51.679196+00:00
tables: 41
policies: 0
functions: 41
indexes: 0
---

## 1. TABLOLAR

### _migration_ledger

| Sutun | Tip |
|-------|-----|
| name | text |
| applied_at | timestamp with time zone |

### admin_audit_log

| Sutun | Tip |
|-------|-----|
| id | uuid |
| at | timestamp with time zone |
| actor | uuid |
| table_name | text |
| row_pk | text |
| action | text |
| before | jsonb |
| after | jsonb |
| comment | text |
| tenant_id | uuid |

### brands

| Sutun | Tip |
|-------|-----|
| id | uuid |
| tenant_id | uuid |
| name | text |
| slug | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### cart_items

| Sutun | Tip |
|-------|-----|
| id | uuid |
| cart_id | uuid |
| product_id | uuid |
| quantity | integer |
| unit_price | numeric |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| price_list_id | uuid |
| tenant_id | uuid |

### categories

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | text |
| slug | text |
| parent_id | uuid |
| level | integer |
| description | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| image_url | text |
| seo_title | text |
| seo_desc | text |
| is_featured | boolean |
| sort_order | integer |
| metadata | jsonb |
| is_active | boolean |
| authority_content | jsonb |
| menu_label | text |
| marketing_title | text |
| translation_key | text |
| display_mode | text |
| tenant_id | uuid |

### category_mapping_rules

| Sutun | Tip |
|-------|-----|
| id | uuid |
| priority | integer |
| brand_filter | text |
| name_pattern | text |
| exclude_pattern | text |
| spec_conditions | jsonb |
| target_subcategory_id | uuid |
| description | text |
| created_at | timestamp with time zone |

### client_errors

| Sutun | Tip |
|-------|-----|
| id | uuid |
| at | timestamp with time zone |
| url | text |
| message | text |
| stack | text |
| user_agent | text |
| release | text |
| env | text |
| level | text |
| extra | jsonb |
| group_id | uuid |

### contact_messages

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | text |
| email | text |
| phone | text |
| company | text |
| subject | text |
| message | text |
| department | contact_department |
| status | contact_status |
| created_at | timestamp with time zone |
| ip_address | text |

### coupons

| Sutun | Tip |
|-------|-----|
| id | uuid |
| code | text |
| description | text |
| discount_type | text |
| discount_value | numeric |
| minimum_order_amount | numeric |
| usage_limit | integer |
| used_count | integer |
| is_active | boolean |
| valid_from | timestamp with time zone |
| valid_until | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| created_by | uuid |
| tenant_id | uuid |

### error_groups

| Sutun | Tip |
|-------|-----|
| id | uuid |
| signature | text |
| level | text |
| last_message | text |
| url_sample | text |
| env | text |
| release | text |
| first_seen | timestamp with time zone |
| last_seen | timestamp with time zone |
| count | bigint |
| status | text |
| assigned_to | uuid |
| notes | text |

### inventory_movements

| Sutun | Tip |
|-------|-----|
| id | uuid |
| product_id | uuid |
| order_id | uuid |
| delta | integer |
| reason | text |
| created_at | timestamp with time zone |
| batch_id | uuid |
| original_movement_id | uuid |
| reversed_by_movement_id | uuid |
| undo_by_user_id | uuid |
| undo_at | timestamp with time zone |
| tenant_id | uuid |

### inventory_settings

| Sutun | Tip |
|-------|-----|
| id | boolean |
| default_low_stock_threshold | integer |
| updated_at | timestamp with time zone |
| alert_email | text |
| alert_webhook_url | text |
| reservation_timeout_hours | integer |
| tenant_id | uuid |

### order_attachments

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| filename | text |
| file_path | text |
| file_size | bigint |
| mime_type | text |
| description | text |
| is_internal | boolean |
| created_at | timestamp with time zone |
| created_by | uuid |
| tenant_id | uuid |

### order_email_events

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| email_to | text |
| subject | text |
| provider | text |
| provider_message_id | text |
| created_at | timestamp with time zone |

### order_notes

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| user_id | uuid |
| note | text |
| is_internal | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### order_refund_events

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| amount | numeric |
| reason | text |
| actor_user_id | uuid |
| created_at | timestamp with time zone |
| tenant_id | uuid |

### organizations

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | character varying(255) |
| tier_level | integer |
| is_active | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### payment_transactions

| Sutun | Tip |
|-------|-----|
| id | uuid |
| transaction_id | text |
| order_id | uuid |
| user_id | uuid |
| amount | numeric |
| currency | text |
| status | text |
| payment_method | text |
| provider_response | jsonb |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### price_lists

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | character varying(255) |
| description | text |
| user_type | character varying(50) |
| is_active | boolean |
| effective_from | timestamp with time zone |
| effective_to | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### product_authorities

| Sutun | Tip |
|-------|-----|
| id | uuid |
| product_id | uuid |
| expert_name | text |
| expert_title | text |
| expert_avatar_url | text |
| content | text |
| badge_text | text |
| rating | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### product_families

| Sutun | Tip |
|-------|-----|
| id | uuid |
| tenant_id | uuid |
| name | text |
| slug | text |
| brand_id | uuid |
| description | jsonb |
| is_description_manual | boolean |
| category_id | uuid |
| subcategory_id | uuid |
| meta_title | jsonb |
| meta_description | jsonb |
| series_code | text |
| sort_order | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| deleted_at | timestamp with time zone |

### product_images

| Sutun | Tip |
|-------|-----|
| id | uuid |
| product_id | uuid |
| path | text |
| alt | text |
| sort_order | integer |
| created_at | timestamp with time zone |
| tenant_id | uuid |

### product_prices

| Sutun | Tip |
|-------|-----|
| id | uuid |
| product_id | uuid |
| price_list_id | uuid |
| base_price | numeric |
| sale_price | numeric |
| discount_percentage | numeric |
| is_active | boolean |
| valid_from | timestamp with time zone |
| valid_until | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### products

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | text |
| brand | text |
| price | numeric |
| sku | text |
| category_id | uuid |
| subcategory_id | uuid |
| status | text |
| is_featured | boolean |
| technical_specs | jsonb |
| stock_qty | integer |
| low_stock_threshold | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| low_stock_override | boolean |
| purchase_price | numeric |
| slug | text |
| model_code | text |
| warehouse_location | text |
| supplier_name | text |
| family_id | uuid |
| tenant_id | uuid |
| purchase_currency | character varying(3) |
| barcode | text |
| tax_rate | numeric |
| is_taxable | boolean |
| weight_kg | numeric |
| width_mm | numeric |
| height_mm | numeric |
| depth_mm | numeric |
| deleted_at | timestamp with time zone |
| description_i18n | jsonb |

### project_items

| Sutun | Tip |
|-------|-----|
| id | uuid |
| project_id | uuid |
| product_id | uuid |
| quantity | integer |
| notes | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### rate_limits

| Sutun | Tip |
|-------|-----|
| key | text |
| bucket | timestamp with time zone |
| count | integer |

### returns_webhook_events

| Sutun | Tip |
|-------|-----|
| id | bigint |
| event_id | text |
| return_id | uuid |
| order_id | uuid |
| carrier | text |
| tracking_number | text |
| status_raw | text |
| status_mapped | text |
| body_hash | text |
| received_at | timestamp with time zone |
| processed_at | timestamp with time zone |
| tenant_id | uuid |

### shipping_email_events

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| email_to | text |
| subject | text |
| provider | text |
| provider_message_id | text |
| carrier | text |
| tracking_number | text |
| created_at | timestamp with time zone |
| tenant_id | uuid |

### shipping_idempotency

| Sutun | Tip |
|-------|-----|
| key | text |
| scope | text |
| created_at | timestamp with time zone |

### shipping_webhook_events

| Sutun | Tip |
|-------|-----|
| id | bigint |
| event_id | text |
| order_id | uuid |
| order_number | text |
| carrier | text |
| status_raw | text |
| status_mapped | text |
| body_hash | text |
| received_at | timestamp with time zone |
| processed_at | timestamp with time zone |
| tenant_id | uuid |

### shopping_carts

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### site_settings

| Sutun | Tip |
|-------|-----|
| id | uuid |
| key | text |
| value | jsonb |
| description | text |
| updated_at | timestamp with time zone |
| updated_by | uuid |

### tenants

| Sutun | Tip |
|-------|-----|
| id | uuid |
| name | text |
| subdomain | text |
| custom_domain | text |
| is_active | boolean |
| created_at | timestamp with time zone |
| features | jsonb |
| styles | jsonb |
| config | jsonb |
| theme_config | jsonb |

### user_addresses

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| address_line | text |
| district | text |
| city | text |
| postal_code | text |
| country | text |
| address_type | text |
| is_default | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| is_default_shipping | boolean |
| is_default_billing | boolean |
| label | text |
| full_name | text |
| phone | text |
| full_address | text |
| street_address | text |
| tenant_id | uuid |

### user_invoice_profiles

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| profile_type | text |
| company_name | text |
| tax_number | text |
| tax_office | text |
| first_name | text |
| last_name | text |
| address_line | text |
| district | text |
| city | text |
| postal_code | text |
| country | text |
| is_default | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### user_profiles

| Sutun | Tip |
|-------|-----|
| id | uuid |
| role | character varying(20) |
| full_name | text |
| phone | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| organization_id | uuid |
| tenant_id | uuid |

### user_projects

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| name | text |
| description | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

### venthub_order_items

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_id | uuid |
| product_id | uuid |
| product_name | text |
| product_sku | text |
| product_brand | text |
| unit_price | numeric |
| quantity | integer |
| total_price | numeric |
| product_snapshot | jsonb |
| created_at | timestamp with time zone |
| price_at_time | numeric |
| product_image_url | text |
| unit_price_snapshot | numeric |
| price_list_id_snapshot | uuid |
| product_name_snapshot | text |
| product_sku_snapshot | text |
| tax_rate_snapshot | numeric |
| tenant_id | uuid |

### venthub_orders

| Sutun | Tip |
|-------|-----|
| id | uuid |
| order_number | text |
| user_id | uuid |
| status | text |
| total_amount | numeric |
| shipping_method | text |
| shipping_address | jsonb |
| billing_address | jsonb |
| invoice_profile | jsonb |
| payment_method | text |
| payment_status | text |
| conversation_id | text |
| shipping_carrier | text |
| shipping_tracking_number | text |
| shipped_at | timestamp with time zone |
| delivered_at | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| customer_name | text |
| customer_email | text |
| carrier | text |
| tracking_url | text |
| subtotal_snapshot | numeric |
| legal_consents | jsonb |
| invoice_type | text |
| invoice_info | jsonb |
| payment_token | text |
| customer_phone | text |
| tracking_number | text |
| payment_debug | jsonb |
| coupon_code | text |
| coupon_discount | numeric |
| locale | text |
| tenant_id | uuid |

### venthub_returns

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| order_id | uuid |
| status | text |
| reason | text |
| description | text |
| refund_amount | numeric |
| admin_notes | text |
| requested_at | timestamp with time zone |
| approved_at | timestamp with time zone |
| processed_at | timestamp with time zone |
| completed_at | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |
| tenant_id | uuid |

### wizard_selections

| Sutun | Tip |
|-------|-----|
| id | uuid |
| user_id | uuid |
| session_id | text |
| door_width_cm | integer |
| door_height_cm | integer |
| usage_location | text |
| sector | text |
| wind_condition | text |
| traffic_intensity | text |
| heating_needed | text |
| climate_zone | text |
| calculated_airflow_m3h | integer |
| calculated_nozzle_velocity | numeric |
| calculated_power_w | integer |
| recommended_series | text |
| recommended_product_ids | uuid[] |
| selected_product_id | uuid |
| created_at | timestamp with time zone |
| ip_address | inet |
| user_agent | text |
| order_id | uuid |
| tenant_id | uuid |

## 2. RLS POLICY'LER

CREATE POLICY bulunamadi.

## 3. FONKSIYONLAR (PL/pgSQL)

### `_normalize_rls_expr(expr text)` → text

### `adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid)` → void

### `adjust_stock(p_product_id uuid, p_delta integer, p_reason text)` → void

### `adjust_stock_v2(p_product_id uuid, p_delta integer)` → void

### `admin_list_all_users()
 RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Authorization: allow admins/moderators/super_admin/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin', 'moderator', 'super_admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id, (u.email)::text        AS email, (up.full_name)::text   AS full_name, (up.phone)::text       AS phone, COALESCE((up.role)::text, 'user') AS role, COALESCE(up.created_at, u.created_at) AS created_at, COALESCE(up.updated_at, u.updated_at) AS updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  ORDER BY COALESCE(up.created_at, u.created_at) DESC;
END;
$function$
;

--
-- Name: admin_list_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Authorization: allow admins/moderators/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin', 'moderator', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id, (u.email)::text        AS email, (up.full_name)::text   AS full_name, (up.phone)::text       AS phone, (up.role)::text        AS role, up.created_at, up.updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE up.role IN ('admin', 'moderator', 'super_admin')
  ORDER BY up.created_at DESC;
END;
$function$
;

--
-- Name: admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.admin_search_products(p_q text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_category_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, name text, sku text, model_code text, brand text, status text, category_id uuid, price numeric, purchase_price numeric, stock_qty integer, low_stock_threshold integer, is_featured boolean, slug text, rank real, total_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_offset int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit  := LEAST(GREATEST(p_limit, 1), 200);
  v_offset := GREATEST(p_offset, 0);
  v_raw    := coalesce(trim(p_q), '');
  v_raw_wildcard := replace(v_raw, ' ', '%');

  -- Empty query → return empty (caller should use normal Supabase query)
  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  WITH matched AS (
    SELECT
      p.id, p.name, p.sku, p.model_code, p.brand, p.status, p.category_id, p.price, p.purchase_price, p.stock_qty, p.low_stock_threshold, p.is_featured, p.slug, ts_rank(
        to_tsvector('turkish', coalesce(p.name, '') || ' ' ||
          coalesce(p.model_code, '') || ' ' ||
          coalesce(p.sku, '') || ' ' ||
          coalesce(p.brand, '') || ' ' ||
          coalesce(p.description_i18n->>'tr', '') || ' ' ||
          coalesce(p.technical_specs::text, '')
        ), v_tsq
      ) AS rank
    FROM public.products p
    WHERE (
      p.name ILIKE '%' || v_raw_wildcard || '%'
      OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
      OR p.sku ILIKE '%' || v_raw_wildcard || '%'
      OR p.brand ILIKE '%' || v_raw_wildcard || '%'
      OR p.slug ILIKE '%' || v_raw_wildcard || '%'
      OR p.technical_specs::text ILIKE '%' || v_raw || '%'
      OR to_tsvector('turkish', coalesce(p.name, '') || ' ' ||
           coalesce(p.model_code, '') || ' ' ||
           coalesce(p.sku, '') || ' ' ||
           coalesce(p.brand, '') || ' ' ||
           coalesce(p.description_i18n->>'tr', '') || ' ' ||
           coalesce(p.technical_specs::text, '')
         ) @@ v_tsq
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  )
  SELECT
    m.id, m.name, m.sku, m.model_code, m.brand, m.status, m.category_id, m.price, m.purchase_price, m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug, m.rank, count(*) OVER() AS total_count
  FROM matched m
  ORDER BY m.rank DESC NULLS LAST, m.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$function$
;

--
-- Name: bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
 RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  now_ts timestamptz := now();
  bucket_ts timestamptz := date_trunc('minute', now_ts);
  window_start timestamptz := now_ts - make_interval(secs => p_window_seconds);
  total int := 0;
  resets_at timestamptz := bucket_ts + interval '1 minute';
BEGIN
  -- upsert current bucket
  INSERT INTO public.rate_limits(key, bucket, count)
  VALUES (p_key, bucket_ts, 1)
  ON CONFLICT (key, bucket) DO UPDATE SET count = public.rate_limits.count + 1;

  -- sum counts within window
  SELECT COALESCE(sum(count), 0) INTO total
  FROM public.rate_limits
  WHERE key = p_key AND bucket >= date_trunc('minute', window_start);

  IF total <= p_limit THEN
    RETURN QUERY SELECT true AS allowed, greatest(p_limit - total, 0) AS remaining, resets_at AS reset_at;
  ELSE
    RETURN QUERY SELECT false AS allowed, 0 AS remaining, resets_at AS reset_at;
  END IF;
END $function$
;

--
-- Name: custom_access_token_hook(event jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)` → jsonb

### `enforce_role_change()` → trigger

### `fn_admin_get_orders(p_id text DEFAULT NULL::text, p_conv text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_limit integer DEFAULT 10)` → SETOF venthub_orders

### `fn_admin_update_order_status(p_id text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_conv text DEFAULT NULL::text)` → venthub_orders

### `fn_enrich_product_specs()` → void

### `fts_search_products(p_q text, p_limit integer DEFAULT 20, p_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id uuid, name text, sku text, brand text, price numeric, rank real)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 100);
  v_raw := coalesce(p_q, '');
  v_raw_wildcard := replace(v_raw, ' ', '%');
  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  SELECT p.id, p.name, p.sku, p.brand, p.price, ts_rank(
           to_tsvector('turkish', coalesce(p.name, '') || ' ' ||
             coalesce(p.model_code, '') || ' ' ||
             coalesce(p.sku, '') || ' ' ||
             coalesce(p.brand, '') || ' ' ||
             coalesce(p.description_i18n->>'tr', '') || ' ' ||
             coalesce(p.technical_specs::text, '')
           ), v_tsq
         ) AS rank
  FROM public.products p
  WHERE (
    p.name ILIKE '%' || v_raw_wildcard || '%'
    OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
    OR p.sku ILIKE '%' || v_raw_wildcard || '%'
    OR p.brand ILIKE '%' || v_raw_wildcard || '%'
    OR (p.description_i18n->>'tr') ILIKE '%' || v_raw_wildcard || '%'
    OR p.technical_specs::text ILIKE '%' || v_raw || '%'
    OR to_tsvector('turkish', coalesce(p.name, '') || ' ' ||
         coalesce(p.model_code, '') || ' ' ||
         coalesce(p.sku, '') || ' ' ||
         coalesce(p.brand, '') || ' ' ||
         coalesce(p.description_i18n->>'tr', '') || ' ' ||
         coalesce(p.technical_specs::text, '')
       ) @@ v_tsq
  )
  AND (
    (NOT (p_filters ? 'category_id')) OR (p.category_id = (p_filters->>'category_id')::uuid)
  )
  AND p.status = 'active'
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT v_limit;
END;
$function$
;

--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.generate_order_number()` → character varying

### `get_admin_users()
 RETURNS TABLE(id uuid, email character varying, created_at timestamp with time zone, role text, full_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'super_admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Admin ise kullanıcıları döndür
  RETURN QUERY
  SELECT u.id, u.email, u.created_at, p.role, p.full_name
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.id;
END;
$function$
;

--
-- Name: get_category_counts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_category_counts()
 RETURNS TABLE(category_id uuid, product_count integer)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  SELECT c.id AS category_id, COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::int AS product_count
  FROM public.categories c
  LEFT JOIN public.products p
    ON p.category_id = c.id
       OR p.subcategory_id = c.id
       OR p.category_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
       OR p.subcategory_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
  GROUP BY c.id;
$function$
;

--
-- Name: get_family_detail(p_slug text, p_lang text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_family_detail(p_slug text, p_lang text DEFAULT 'tr'::text)` → jsonb

### `get_product_families_enriched(p_category_ids uuid[] DEFAULT NULL::uuid[], p_limit integer DEFAULT 24, p_offset integer DEFAULT 0, p_search_query text DEFAULT NULL::text, p_brand text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, slug text, series_code text, description jsonb, brand_name text, category_id uuid, subcategory_id uuid, cover_image_path text, variant_count bigint, min_price numeric, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description, b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order, count(p.id) as variant_count, min(p.price) as min_price
      from product_families f
      join brands b on b.id = f.brand_id
      -- inner join: aktif varyantı olmayan aile listeye hiç girmez
      join products p on p.family_id = f.id
       and p.status = 'active' and p.deleted_at is null
     where f.deleted_at is null
       and (p_category_ids is null
            or f.category_id = any(p_category_ids)
            or f.subcategory_id = any(p_category_ids))
       and (p_brand is null or b.name ilike p_brand)
       and (p_search_query is null
            or f.name ilike '%' || p_search_query || '%'
            or f.series_code ilike '%' || p_search_query || '%'
            or p.sku ilike '%' || p_search_query || '%'
            or p.name ilike '%' || p_search_query || '%'
            or p.model_code ilike '%' || p_search_query || '%')
     group by f.id, f.name, f.slug, f.series_code, f.description, b.name, f.category_id, f.subcategory_id, f.sort_order
  )
  select fam.id, fam.name, fam.slug, fam.series_code, fam.description, fam.brand_name, fam.category_id, fam.subcategory_id, cov.path as cover_image_path, fam.variant_count, fam.min_price, count(*) over () as total_count
    from fam
    left join lateral (
      -- deterministik kapak: sku sırasına göre ilk aktif varyantın ilk görseli
      select pi.path
        from product_images pi
        join products pv on pv.id = pi.product_id
       where pv.family_id = fam.id
         and pv.status = 'active' and pv.deleted_at is null
       order by pv.sku, pi.sort_order
       limit 1
    ) cov on true
   order by fam.sort_order, fam.name
   limit least(greatest(coalesce(p_limit, 24), 1), 96)
  offset greatest(coalesce(p_offset, 0), 0)
$function$
;

--
-- Name: get_search_suggestions(p_q text, p_limit integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_search_suggestions(p_q text, p_limit integer DEFAULT 6)
 RETURNS TABLE(type text, label text, url text, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_raw text;
  v_like text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  
  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_like := '%' || replace(v_raw, ' ', '%') || '%';

  RETURN QUERY
  (
    -- Products (max 4)
    SELECT
      'product'::text AS type, p.name::text AS label, ('/products/' || p.id::text)::text AS url, jsonb_build_object(
        'sku', p.sku, 'brand', coalesce(p.brand, ''), 'model_code', coalesce(p.model_code, '')
      ) AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND (
        p.name ILIKE v_like
        OR p.sku ILIKE v_like
        OR p.model_code ILIKE v_like
        OR p.brand ILIKE v_like
      )
    ORDER BY
      CASE WHEN p.name ILIKE v_raw || '%' THEN 0 ELSE 1 END, p.is_featured DESC NULLS LAST, p.name
    LIMIT LEAST(v_limit, 4)
  )
  UNION ALL
  (
    -- Categories (max 2)
    SELECT
      'category'::text AS type, c.name::text AS label, ('/category/' || c.slug)::text AS url, jsonb_build_object('level', c.level) AS metadata
    FROM public.categories c
    WHERE c.is_active = true
      AND c.name ILIKE v_like
    ORDER BY c.level, c.name
    LIMIT 2
  )
  UNION ALL
  (
    -- Brands (max 2, distinct from products)
    SELECT DISTINCT ON (p.brand)
      'brand'::text AS type, p.brand::text AS label, ('/products?brand=' || p.brand)::text AS url, jsonb_build_object() AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND p.brand IS NOT NULL
      AND p.brand ILIKE v_like
    ORDER BY p.brand
    LIMIT 2
  )
  LIMIT v_limit;
END;
$function$
;

--
-- Name: get_user_role(user_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)` → text

### `handle_new_user_metadata()` → trigger

### `handle_new_user_profile()` → trigger

### `handle_supabase_webhook()` → trigger

### `increment_coupon_usage(p_code text)` → void

### `increment_error_group_count(p_group_id uuid)` → void

### `is_admin()` → boolean

### `is_admin_user()` → boolean

### `is_staff_user()` → boolean

### `is_user_admin(user_id uuid)` → boolean

### `jwt_role()` → text

### `jwt_tenant_id()` → uuid

### `normalize_product_threshold_overrides()` → trigger

### `process_order_stock_reduction(p_order_id text)` → jsonb

### `reverse_inventory_batch(p_batch_id uuid)` → void

### `reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer DEFAULT 30)` → integer

### `set_order_number()` → trigger

### `set_stock(p_product_id uuid, p_new_qty integer, p_reason text)` → void

### `set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid)` → void

### `set_updated_at()` → trigger

### `set_user_admin_role(user_id uuid, new_role text)` → boolean

### `set_user_role(user_id uuid, new_role text)` → boolean

### `sync_payment_status_with_status()` → trigger

### `tg_categories_set_level()` → trigger

### `tg_set_updated_at()` → trigger

### `update_inventory_settings(p_default_low_stock_threshold integer)` → void

### `update_inventory_thresholds(p_default integer, p_reset_overrides boolean DEFAULT false)` → void

### `update_updated_at_column()` → trigger

### `update_user_profiles_updated_at()` → trigger

### `user_invoice_profiles_ensure_single_default()` → trigger

## 4. VIEW'LAR

### admin_users
```sql
SELECT u.id,
    u.email,
    up.full_name,
    up.phone,
    up.role,
    up.created_at,
    up.updated_at
   FROM (auth.users u
     LEFT JOIN user_profiles up ON ((u.id = up.id)))
  WHERE ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))
  ORDER
```

### inventory_summary
```sql
WITH movement_stats AS (
         SELECT inventory_movements.product_id,
            COALESCE(sum(abs(inventory_movements.delta)), (0)::bigint) AS total_out_30d
           FROM inventory_movements
          WHERE ((inventory_movements.delta < 0) AND ((inventory_movements.reason = 'sale'::text) OR (i
```

### inventory_velocity
```sql
WITH reserved AS (
         SELECT voi.product_id,
            (sum(voi.quantity))::integer AS reserved_qty
           FROM (venthub_order_items voi
             JOIN venthub_orders o ON ((o.id = voi.order_id)))
          WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::t
```

### reserved_orders
```sql
SELECT voi.product_id,
    o.id AS order_id,
    o.created_at,
    o.status,
    o.payment_status,
    voi.quantity
   FROM (venthub_order_items voi
     JOIN venthub_orders o ON ((o.id = voi.order_id)))
  WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text])) AND (o.sh
```

### view_admin_orders
```sql
SELECT o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.total_amount,
    o.shipping_method,
    o.shipping_address,
    o.billing_address,
    o.invoice_profile,
    o.payment_method,
    o.payment_status,
    o.conversation_id,
    o.shipping_carrier,
    o.shipping_tracking_number,
  
```

## 7. TABLO ILISKI DIYAGRAMI

```mermaid
erDiagram
    _migration_ledger
    admin_audit_log
    brands
    cart_items
    categories
    category_mapping_rules
    client_errors
    contact_messages
    coupons
    error_groups
    inventory_movements
    inventory_settings
    order_attachments
    order_email_events
    order_notes
    order_refund_events
    organizations
    payment_transactions
    price_lists
    product_authorities
    product_families
    product_images
    product_prices
    products
    project_items
    rate_limits
    returns_webhook_events
    shipping_email_events
    shipping_idempotency
    shipping_webhook_events
    shopping_carts
    site_settings
    tenants
    user_addresses
    user_invoice_profiles
    user_profiles
    user_projects
    venthub_order_items
    venthub_orders
    venthub_returns
    wizard_selections
```
