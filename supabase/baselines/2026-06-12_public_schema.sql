--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: contact_department; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_department AS ENUM (
    'sales',
    'support',
    'consulting'
);


--
-- Name: contact_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_status AS ENUM (
    'new',
    'read',
    'archived'
);


--
-- Name: _normalize_rls_expr(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._normalize_rls_expr(expr text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  s text;
BEGIN
  IF expr IS NULL THEN RETURN NULL; END IF;
  s := expr;

  -- unwrap existing wrappers
  s := replace(s, '(select auth.uid())', 'auth.uid()');
  s := replace(s, '(SELECT auth.uid())', 'auth.uid()');
  s := replace(s, '(select auth.role())', 'auth.role()');
  s := replace(s, '(SELECT auth.role())', 'auth.role()');
  s := replace(s, '(select auth.jwt())', 'auth.jwt()');
  s := replace(s, '(SELECT auth.jwt())', 'auth.jwt()');
  s := replace(s, '(select public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(SELECT public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(select current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');
  s := replace(s, '(SELECT current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');

  -- normalize current_setting variants
  s := replace(s, 'current_setting(''request.jwt.claims''::text, true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text, FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',FALSE)', 'current_setting(''request.jwt.claims'')');

  -- re-wrap
  s := replace(s, 'auth.uid()', '(select auth.uid())');
  s := replace(s, 'auth.role()', '(select auth.role())');
  s := replace(s, 'auth.jwt()', '(select auth.jwt())');
  s := replace(s, 'public.jwt_role()', '(select public.jwt_role())');
  s := replace(s, 'current_setting(''request.jwt.claims'')', '(select current_setting(''request.jwt.claims''))');

  RETURN s;
END
$$;


--
-- Name: adjust_stock(uuid, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog, public'
    AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'));
END;
$$;


--
-- Name: adjust_stock(uuid, integer, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog, public'
    AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id)
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), p_batch_id);
END;
$$;


--
-- Name: adjust_stock_v2(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.adjust_stock_v2(p_product_id uuid, p_delta integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_catalog'
    AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = COALESCE(stock_qty, 0) + p_delta,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;


--
-- Name: admin_list_all_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_all_users() RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: allow admins/moderators/super_admin/superadmin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin','superadmin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         (u.email)::text        AS email,
         (up.full_name)::text   AS full_name,
         (up.phone)::text       AS phone,
         COALESCE((up.role)::text, 'user') AS role,
         COALESCE(up.created_at, u.created_at) AS created_at,
         COALESCE(up.updated_at, u.updated_at) AS updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  ORDER BY COALESCE(up.created_at, u.created_at) DESC;
END;
$$;


--
-- Name: admin_list_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_users() RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: allow admins/moderators/superadmin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','superadmin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         (u.email)::text        AS email,
         (up.full_name)::text   AS full_name,
         (up.phone)::text       AS phone,
         (up.role)::text        AS role,
         up.created_at,
         up.updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE up.role IN ('admin','moderator','superadmin')
  ORDER BY up.created_at DESC;
END;
$$;


--
-- Name: admin_search_products(text, integer, integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_search_products(p_q text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_category_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id uuid, name text, sku text, model_code text, brand text, status text, category_id uuid, price numeric, purchase_price numeric, stock_qty integer, low_stock_threshold integer, is_featured boolean, slug text, rank real, total_count bigint)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public'
    AS $$
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
      p.id, p.name, p.sku, p.model_code, p.brand,
      p.status, p.category_id, p.price, p.purchase_price,
      p.stock_qty, p.low_stock_threshold, p.is_featured, p.slug,
      ts_rank(
        to_tsvector('turkish',
          coalesce(p.name,'') || ' ' ||
          coalesce(p.model_code,'') || ' ' ||
          coalesce(p.sku,'') || ' ' ||
          coalesce(p.brand,'') || ' ' ||
          coalesce(p.description,'') || ' ' ||
          coalesce(p.technical_specs::text,'')
        ),
        v_tsq
      ) AS rank
    FROM public.products p
    WHERE (
      p.name ILIKE '%' || v_raw_wildcard || '%'
      OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
      OR p.sku ILIKE '%' || v_raw_wildcard || '%'
      OR p.brand ILIKE '%' || v_raw_wildcard || '%'
      OR p.slug ILIKE '%' || v_raw_wildcard || '%'
      OR p.technical_specs::text ILIKE '%' || v_raw || '%'
      OR to_tsvector('turkish',
           coalesce(p.name,'') || ' ' ||
           coalesce(p.model_code,'') || ' ' ||
           coalesce(p.sku,'') || ' ' ||
           coalesce(p.brand,'') || ' ' ||
           coalesce(p.description,'') || ' ' ||
           coalesce(p.technical_specs::text,'')
         ) @@ v_tsq
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  )
  SELECT
    m.id, m.name, m.sku, m.model_code, m.brand,
    m.status, m.category_id, m.price, m.purchase_price,
    m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug,
    m.rank,
    count(*) OVER() AS total_count
  FROM matched m
  ORDER BY m.rank DESC NULLS LAST, m.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;


--
-- Name: bump_rate_limit(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer) RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
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
END $$;


--
-- Name: custom_access_token_hook(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.custom_access_token_hook(event jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  claims jsonb;
  user_role text;
  tenant_id_val text;
BEGIN
  -- Retrieve the user's role and tenant_id from the database user_profiles table
  SELECT role, tenant_id::text INTO user_role, tenant_id_val
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata is not null
  IF (claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  -- Inject the role into JWT claims as user_role
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, user_role}', '"user"'::jsonb);
  END IF;

  -- Inject tenant_id into JWT claims as tenant_id (both root and app_metadata)
  IF tenant_id_val IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(tenant_id_val));
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(tenant_id_val));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
  END IF;

  -- Put the modified claims back in the event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;


--
-- Name: enforce_role_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_role_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
  -- If the actor tries to change their own role and is not superadmin, block
  IF NEW.id = auth.uid() THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
      RAISE EXCEPTION 'not authorized to change own role';
    END IF;
  END IF;
  -- Only allow target roles in whitelist (safety)
  IF NEW.role NOT IN ('user','moderator','admin','superadmin') THEN
    RAISE EXCEPTION 'invalid role %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: venthub_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    shipping_method text DEFAULT 'standard'::text,
    shipping_address jsonb NOT NULL,
    billing_address jsonb NOT NULL,
    invoice_profile jsonb,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    conversation_id text,
    shipping_carrier text,
    shipping_tracking_number text,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_name text,
    customer_email text,
    carrier text,
    tracking_url text,
    subtotal_snapshot numeric(10,2),
    legal_consents jsonb,
    invoice_type text,
    invoice_info jsonb,
    payment_token text,
    customer_phone text,
    tracking_number text,
    payment_debug jsonb,
    coupon_code text,
    coupon_discount numeric DEFAULT 0,
    locale text DEFAULT 'tr'::text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT venthub_orders_coupon_discount_check CHECK ((coupon_discount >= (0)::numeric)),
    CONSTRAINT venthub_orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'partial_refunded'::text]))),
    CONSTRAINT venthub_orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])))
);


--
-- Name: TABLE venthub_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.venthub_orders IS 'Payment system fixed on 2025-09-03 - all required columns added | @graphql({"disabled": true})';


--
-- Name: COLUMN venthub_orders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.venthub_orders.status IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled';


--
-- Name: COLUMN venthub_orders.payment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.venthub_orders.payment_status IS 'Payment status: pending, paid, failed, refunded';


--
-- Name: fn_admin_get_orders(text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_admin_get_orders(p_id text DEFAULT NULL::text, p_conv text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_limit integer DEFAULT 10) RETURNS SETOF public.venthub_orders
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select *
  from venthub_orders
  where (p_id is null or id = p_id::uuid)
    and (p_conv is null or conversation_id = p_conv)
    and (p_status is null or status = p_status)
  order by created_at desc
  limit coalesce(p_limit, 10);
$$;


--
-- Name: fn_admin_update_order_status(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_admin_update_order_status(p_id text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_conv text DEFAULT NULL::text) RETURNS public.venthub_orders
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_row venthub_orders;
begin
  update venthub_orders
     set status = p_status
   where (p_id is not null and id = p_id::uuid)
      or (p_id is null and p_conv is not null and conversation_id = p_conv)
  returning * into v_row;

  return v_row;
end;
$$;


--
-- Name: fn_auto_categorize_products(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auto_categorize_products() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
    -- Sadece manuel kilitlenmemiş (is_category_manual = false) ürünleri güncelle
    UPDATE public.products p
    SET subcategory_id = r.target_subcategory_id
    FROM (
        SELECT DISTINCT ON (name_pattern, brand_filter) *
        FROM public.category_mapping_rules
        ORDER BY name_pattern, brand_filter, priority DESC
    ) r
    WHERE 
        p.is_category_manual = false -- KRİTİK: Manuel müdahaleyi koru
        AND (p.name ILIKE r.name_pattern)
        AND (r.brand_filter IS NULL OR p.brand ILIKE r.brand_filter)
        AND (r.exclude_pattern IS NULL OR p.name NOT ILIKE r.exclude_pattern);
END;
$$;


--
-- Name: fn_enrich_product_specs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_enrich_product_specs() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
    -- 1. Çap Ayıklama (100, 120, 150, 90)
    UPDATE public.products 
    SET technical_specs = jsonb_set(COALESCE(technical_specs, '{}'::jsonb), '{connection_diameter}', 
        CASE 
            WHEN name ~ '90' THEN '"90 mm"'
            WHEN name ~ '100' THEN '"100 mm"'
            WHEN name ~ '120' THEN '"120 mm"'
            WHEN name ~ '150' THEN '"150 mm"'
            WHEN name ~ '230' THEN '"230 mm"'
            WHEN name ~ '300' THEN '"300 mm"'
            ELSE '"Standart"'
        END::jsonb);

    -- 2. Motor Ömrü (LL)
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{motor_life}', '"Long Life (Ball Bearing)"'::jsonb)
    WHERE name ILIKE '%LL%';

    -- 3. Fonksiyon (Timer / Tımer)
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{features}', '["Zaman Ayarlı (Timer)"]'::jsonb)
    WHERE name ILIKE '%Timer%' OR name ILIKE '%Tımer%';

    -- 4. Tasarım Tipi
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{design_type}', 
        CASE 
            WHEN name ILIKE '%FLEXO%' THEN '"Esnek Montaj (Slim Body)"'
            WHEN name ILIKE '%FILO%' THEN '"Hemzemin (Ultra Slim Front)"'
            WHEN name ILIKE '%GHOST%' THEN '"Gizli Montaj (In-line)"'
            ELSE '"Standart Tasarım"'
        END::jsonb);
END;
$$;


--
-- Name: fts_search_products(text, integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fts_search_products(p_q text, p_limit integer DEFAULT 20, p_filters jsonb DEFAULT '{}'::jsonb) RETURNS TABLE(id uuid, name text, sku text, brand text, price numeric, rank real)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public'
    AS $$
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
  SELECT p.id, p.name, p.sku, p.brand, p.price,
         ts_rank(
           to_tsvector('turkish', 
             coalesce(p.name,'') || ' ' || 
             coalesce(p.model_code,'') || ' ' || 
             coalesce(p.sku,'') || ' ' || 
             coalesce(p.brand,'') || ' ' ||
             coalesce(p.description,'') || ' ' ||
             coalesce(p.technical_specs::text,'')
           ),
           v_tsq
         ) AS rank
  FROM public.products p
  WHERE (
    p.name ILIKE '%' || v_raw_wildcard || '%'
    OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
    OR p.sku ILIKE '%' || v_raw_wildcard || '%'
    OR p.brand ILIKE '%' || v_raw_wildcard || '%'
    OR p.description ILIKE '%' || v_raw_wildcard || '%'
    OR p.technical_specs::text ILIKE '%' || v_raw || '%'
    OR to_tsvector('turkish', 
         coalesce(p.name,'') || ' ' || 
         coalesce(p.model_code,'') || ' ' || 
         coalesce(p.sku,'') || ' ' || 
         coalesce(p.brand,'') || ' ' ||
         coalesce(p.description,'') || ' ' ||
         coalesce(p.technical_specs::text,'')
       ) @@ v_tsq
  )
  AND (
    (NOT (p_filters ? 'category_id')) OR (p.category_id = (p_filters->>'category_id')::uuid)
  )
  AND p.status = 'active'
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT v_limit;
END;
$$;


--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_order_number() RETURNS character varying
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    order_num VARCHAR(50);
BEGIN
    -- Format: VH-YYYYMMDD-NNNN
    order_num := 'VH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    RETURN order_num;
END;
$$;


--
-- Name: get_admin_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_users() RETURNS TABLE(id uuid, email character varying, created_at timestamp with time zone, role text, full_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin','superadmin','super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Admin ise kullanıcıları döndür
  RETURN QUERY
  SELECT u.id, u.email, u.created_at, p.role, p.full_name
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.id;
END;
$$;


--
-- Name: get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_products_enriched(p_category_ids uuid[] DEFAULT NULL::uuid[], p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_search_query text DEFAULT NULL::text, p_sort_by text DEFAULT 'name'::text, p_brand text DEFAULT NULL::text, p_min_price numeric DEFAULT NULL::numeric, p_max_price numeric DEFAULT NULL::numeric) RETURNS TABLE(id uuid, name text, brand text, price numeric, sku text, slug text, model_code text, category_id uuid, subcategory_id uuid, status text, is_featured boolean, description text, image_url text, image_alt text, stock_qty integer, low_stock_threshold integer, low_stock_override boolean, technical_specs jsonb, airflow_capacity numeric, noise_level numeric, pressure_rating numeric, created_at timestamp with time zone, updated_at timestamp with time zone, warehouse_location text, supplier_name text)
    LANGUAGE plpgsql
    SET search_path TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  WITH first_images AS (
    -- Her ürün için sadece ilk (en düşük sort_order) resmi seç
    SELECT DISTINCT ON (product_id)
      product_id,
      path,
      alt
    FROM product_images
    ORDER BY product_id, sort_order ASC
  )
  SELECT 
    p.id,
    p.name,
    p.brand,
    p.price::numeric,
    p.sku,
    p.slug,
    p.model_code,
    p.category_id,
    p.subcategory_id,
    p.status,
    p.is_featured,
    p.description,
    CASE 
      WHEN fi.path IS NOT NULL THEN 'product-images/' || fi.path 
      ELSE p.image_url -- Eğer tablodaki image_url alanı kullanılıyorsa fallback
    END as image_url,
    fi.alt as image_alt,
    p.stock_qty,
    p.low_stock_threshold,
    p.low_stock_override,
    p.technical_specs,
    p.airflow_capacity::numeric,
    p.noise_level::numeric,
    p.pressure_rating::numeric,
    p.created_at,
    p.updated_at,
    p.warehouse_location,
    p.supplier_name
  FROM products p
  LEFT JOIN first_images fi ON fi.product_id = p.id
  WHERE p.status = 'active'
    -- Filtreleme Lojiği
    AND (p_category_ids IS NULL OR p.category_id = ANY(p_category_ids) OR p.subcategory_id = ANY(p_category_ids))
    AND (p_brand IS NULL OR p.brand = p_brand)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.brand ILIKE '%' || p_search_query || '%' OR 
         p.sku ILIKE '%' || p_search_query || '%' OR
         p.model_code ILIKE '%' || p_search_query || '%')
  ORDER BY 
    CASE WHEN p_sort_by = 'featured' THEN p.is_featured END DESC,
    CASE WHEN p_sort_by = 'price-low' THEN p.price END ASC,
    CASE WHEN p_sort_by = 'price-high' THEN p.price END DESC,
    CASE WHEN p_sort_by = 'name' THEN p.name END ASC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


--
-- Name: get_search_suggestions(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_search_suggestions(p_q text, p_limit integer DEFAULT 6) RETURNS TABLE(type text, label text, url text, metadata jsonb)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public'
    AS $$
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
      'product'::text AS type,
      p.name::text AS label,
      ('/products/' || p.id::text)::text AS url,
      jsonb_build_object(
        'sku', p.sku,
        'brand', coalesce(p.brand, ''),
        'model_code', coalesce(p.model_code, '')
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
      CASE WHEN p.name ILIKE v_raw || '%' THEN 0 ELSE 1 END,
      p.is_featured DESC NULLS LAST,
      p.name
    LIMIT LEAST(v_limit, 4)
  )
  UNION ALL
  (
    -- Categories (max 2)
    SELECT
      'category'::text AS type,
      c.name::text AS label,
      ('/category/' || c.slug)::text AS url,
      jsonb_build_object('level', c.level) AS metadata
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
      'brand'::text AS type,
      p.brand::text AS label,
      ('/products?brand=' || p.brand)::text AS url,
      jsonb_build_object() AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND p.brand IS NOT NULL
      AND p.brand ILIKE v_like
    ORDER BY p.brand
    LIMIT 2
  )
  LIMIT v_limit;
END;
$$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(user_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;


--
-- Name: FUNCTION get_user_role(user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_role(user_id uuid) IS 'Kullanıcının rolünü getirir';


--
-- Name: handle_new_user_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_metadata() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_catalog'
    AS $$
DECLARE
  tenant_id_raw text;
  resolved_tenant_id uuid;
  role_val text;
BEGIN
  -- Extract tenant_id from raw_user_meta_data
  tenant_id_raw := new.raw_user_meta_data ->> 'tenant_id';
  
  -- Safe block to parse and check tenant_id validity in the tenants table
  BEGIN
    IF tenant_id_raw IS NOT NULL THEN
      SELECT id INTO resolved_tenant_id FROM public.tenants WHERE id = tenant_id_raw::uuid AND is_active = true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    resolved_tenant_id := NULL;
  END;

  -- Default to 'd3b07384-d113-495f-a558-8c38634e0000' if not found or invalid
  IF resolved_tenant_id IS NULL THEN
    resolved_tenant_id := 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;

  -- Extract role from metadata, default to 'user'
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

  -- Inject tenant_id and user_role into raw_app_meta_data so they are included in JWT claims
  new.raw_app_meta_data := jsonb_set(
    COALESCE(new.raw_app_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_app_meta_data := jsonb_set(
    new.raw_app_meta_data,
    '{user_role}',
    to_jsonb(role_val)
  );

  -- Also set tenant_id and user_role in raw_user_meta_data
  new.raw_user_meta_data := jsonb_set(
    COALESCE(new.raw_user_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_user_meta_data := jsonb_set(
    new.raw_user_meta_data,
    '{role}',
    to_jsonb(role_val)
  );

  RETURN new;
END;
$$;


--
-- Name: handle_new_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_catalog'
    AS $$
DECLARE
  resolved_tenant_id uuid;
  full_name_val text;
  role_val text;
BEGIN
  -- Extract resolved tenant_id from new.raw_app_meta_data
  resolved_tenant_id := (new.raw_app_meta_data ->> 'tenant_id')::uuid;
  
  -- Extract other metadata values
  full_name_val := new.raw_user_meta_data ->> 'full_name';
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

  -- Insert or update public.user_profiles mapping
  INSERT INTO public.user_profiles (id, tenant_id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    resolved_tenant_id,
    full_name_val,
    role_val,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    tenant_id = EXCLUDED.tenant_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$;


--
-- Name: handle_supabase_webhook(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_supabase_webhook() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'net'
    AS $$
    DECLARE
      payload jsonb;
      webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
      webhook_secret text := 'whsec_venthub_a61f54b2bcff63f221259b315256d006';
      req_id bigint;
    BEGIN
      -- Construct the payload matching Route Handler expectations
      payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
      );

      -- Perform asynchronous HTTP POST request using pg_net
      -- Passed body as payload (jsonb) instead of payload::text
      SELECT net.http_post(
        url := webhook_url,
        body := payload,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-webhook-secret', webhook_secret
        ),
        timeout_milliseconds := 5000
      ) INTO req_id;

      RETURN NEW;
    END;
    $$;


--
-- Name: increment_coupon_usage(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_coupon_usage(p_code text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_code
    AND (usage_limit IS NULL OR used_count < usage_limit);
END;
$$;


--
-- Name: increment_error_group_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_error_group_count(p_group_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
  UPDATE public.error_groups
  SET count = count + 1,
      last_seen = now()
  WHERE id = p_group_id;
$$;


--
-- Name: FUNCTION increment_error_group_count(p_group_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_error_group_count(p_group_id uuid) IS 'Atomically increments error_groups.count and updates last_seen for the given group id.';


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


--
-- Name: is_admin_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_user() RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- If service_role, bypass checks and return true
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- Retrieve JWT claims from request context
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  
  IF claims IS NOT NULL THEN
    user_role := COALESCE(
      claims ->> 'user_role',
      claims -> 'app_metadata' ->> 'user_role',
      claims -> 'user_metadata' ->> 'role'
    );
    IF user_role IS NOT NULL THEN
      RETURN user_role IN ('admin', 'superadmin');
    END IF;
  END IF;

  -- Fallback to database lookup if claims are empty (e.g. backend script, triggers)
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','superadmin')
  );
END;
$$;


--
-- Name: is_staff_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_staff_user() RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')
  );
END;
$$;


--
-- Name: is_user_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_user_admin(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role IN ('admin','superadmin')
  );
END;
$$;


--
-- Name: FUNCTION is_user_admin(user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_user_admin(user_id uuid) IS 'Kullanıcının admin olup olmadığını kontrol eder';


--
-- Name: jwt_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_role() RETURNS text
    LANGUAGE sql STABLE
    SET search_path TO 'public', 'pg_temp'
    AS $$
  SELECT COALESCE( NULLIF(current_setting('request.jwt.claims', true), ''), '{}' )::jsonb ->> 'role'
$$;


--
-- Name: jwt_tenant_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_tenant_id() RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_catalog'
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


--
-- Name: normalize_product_threshold_overrides(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_product_threshold_overrides() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  -- Yeni default ile aynı değere sahip tüm override'ları temizle
  update public.products
     set low_stock_threshold = null,
         low_stock_override = false
   where low_stock_override is true
     and low_stock_threshold is not null
     and low_stock_threshold = new.default_low_stock_threshold;
  return new;
end;
$$;


--
-- Name: process_order_stock_reduction(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_order_stock_reduction(p_order_id text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog, public'
    AS $$
DECLARE
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
  v_result jsonb;
BEGIN
  -- Convert order ID from text to UUID safely
  BEGIN
    v_order_uuid := p_order_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid order ID format',
      'processed_count', 0
    );
  END;

  -- 1. Row-level Lock (FOR UPDATE): Prevent concurrent executions on the same order.
  -- This forces any second webhook trigger to wait until this transaction completes.
  SELECT EXISTS(
    SELECT 1 FROM public.venthub_orders 
    WHERE id = v_order_uuid AND status IN ('paid', 'processing')
    FOR UPDATE
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Order not found or not in processed state',
      'processed_count', 0
    );
  END IF;

  -- 2. Idempotency Check: Check if stock reduction has already been run for this order.
  -- Look for inventory movements with the same order_id or batch_id and reason = 'order_sale'.
  IF EXISTS(
    SELECT 1 FROM public.inventory_movements 
    WHERE (order_id = v_order_uuid OR batch_id = v_order_uuid)
      AND reason = 'order_sale'
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Stock already reduced for this order',
      'processed_count', 0,
      'order_id', p_order_id
    );
  END IF;

  -- Loop through order items and reduce stock
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    FROM public.venthub_order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = v_order_uuid
  LOOP
    BEGIN
      -- Check current stock
      v_current_stock := COALESCE(v_item.stock_qty, 0);
      
      -- Is there enough stock?
      IF v_current_stock >= v_item.quantity THEN
        -- Adjust stock using standard adjust_stock function with batch_id = v_order_uuid
        PERFORM public.adjust_stock(
          v_item.product_id, 
          -v_item.quantity,  -- negative (stock reduction)
          'order_sale',
          v_order_uuid       -- batch_id
        );
        
        -- Update the inserted movement's order_id atomically via batch_id matching
        UPDATE public.inventory_movements 
        SET order_id = v_order_uuid
        WHERE batch_id = v_order_uuid 
          AND product_id = v_item.product_id
          AND order_id IS NULL;
        
        v_processed_count := v_processed_count + 1;
      ELSE
        -- Insufficient stock
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Record failure detail if an error occurs
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || SQLERRM || ')');
    END;
  END LOOP;

  -- Prepare success result
  v_result := jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );

  RETURN v_result;
END;
$$;


--
-- Name: reverse_inventory_batch(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reverse_inventory_batch(p_batch_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_batch RECORD;
    v_movement RECORD;
BEGIN
    -- Get batch info
    SELECT * INTO v_batch FROM public.inventory_batches WHERE id = p_batch_id;
    
    IF v_batch IS NULL THEN
        RAISE EXCEPTION 'Batch not found: %', p_batch_id;
    END IF;
    
    IF v_batch.reversed THEN
        RAISE EXCEPTION 'Batch already reversed: %', p_batch_id;
    END IF;
    
    -- Reverse all movements in this batch
    FOR v_movement IN 
        SELECT * FROM public.inventory_movements WHERE batch_id = p_batch_id
    LOOP
        -- Reverse the stock change
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_movement.quantity_change
        WHERE id = v_movement.product_id;
    END LOOP;
    
    -- Mark batch as reversed
    UPDATE public.inventory_batches
    SET reversed = true, reversed_at = NOW()
    WHERE id = p_batch_id;
END;
$$;


--
-- Name: reverse_inventory_batch(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer DEFAULT 30) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public'
    AS $$
DECLARE
  r RECORD;
  cnt int := 0;
  comp_id uuid;
  cutoff timestamptz := now() - (make_interval(mins => p_max_minutes));
  v_actor uuid;
BEGIN
  IF p_batch_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Determine actor (caller) if available
  BEGIN
    v_actor := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub';
  EXCEPTION WHEN others THEN
    v_actor := NULL;
  END;

  -- Enforce time window: earliest movement must be newer than cutoff
  IF EXISTS (
    SELECT 1 FROM public.inventory_movements
    WHERE batch_id = p_batch_id AND created_at < cutoff
  ) THEN
    RAISE EXCEPTION 'UNDO_WINDOW_EXPIRED';
  END IF;

  FOR r IN SELECT id, product_id, delta FROM public.inventory_movements WHERE batch_id = p_batch_id LOOP
    -- revert stock
    UPDATE public.products
    SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - r.delta)
    WHERE id = r.product_id;

    -- compensating movement with metadata
    INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id, original_movement_id, undo_by_user_id, undo_at)
    VALUES (r.product_id, -r.delta, 'undo:csv', p_batch_id, r.id, v_actor::uuid, now())
    RETURNING id INTO comp_id;

    -- link original to compensating record
    UPDATE public.inventory_movements SET reversed_by_movement_id = comp_id WHERE id = r.id;

    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$$;


--
-- Name: set_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_order_number() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_stock(uuid, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog, public'
    AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;
  
  v_delta := p_new_qty - v_current;
  
  IF v_delta = 0 THEN
    RETURN;
  END IF;
  
  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'));
END;
$$;


--
-- Name: set_stock(uuid, integer, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog, public'
    AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;

  v_delta := p_new_qty - v_current;
  IF v_delta = 0 THEN
    RETURN;
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'), p_batch_id);
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: set_user_admin_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_admin_role(user_id uuid, new_role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF new_role NOT IN ('user','admin','moderator','superadmin', 'super_admin', 'warehouse', 'sales', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role=new_role, updated_at=NOW();
  ELSE
    UPDATE public.user_profiles SET role=new_role, updated_at=NOW() WHERE id = user_id;
  END IF;

  RETURN TRUE;
END;
$$;


--
-- Name: set_user_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_role(user_id uuid, new_role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role = new_role, updated_at = NOW();
    RETURN TRUE;
END;
$$;


--
-- Name: sync_payment_status_with_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_payment_status_with_status() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NEW.status IN ('paid','confirmed') AND COALESCE(NEW.payment_status,'') <> 'refunded' THEN
    NEW.payment_status := 'paid';
  ELSIF NEW.status = 'failed' THEN
    NEW.payment_status := 'failed';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: tr_auto_categorize_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tr_auto_categorize_trigger() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
    -- Motoru sadece bu satır için çalıştır (Performans için)
    SELECT sub.target_subcategory_id INTO NEW.subcategory_id
    FROM public.category_mapping_rules sub
    WHERE 
        (NEW.name ILIKE sub.name_pattern)
        AND (sub.brand_filter IS NULL OR NEW.brand ILIKE sub.brand_filter)
        AND (sub.exclude_pattern IS NULL OR NEW.name NOT ILIKE sub.exclude_pattern)
    ORDER BY sub.priority DESC
    LIMIT 1;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_inventory_settings(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inventory_settings(p_default_low_stock_threshold integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  -- Allow CI/MCP via service role; otherwise require admin user
  if auth.role() = 'service_role' then
    -- allowed
  elsif not public.is_user_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if exists (select 1 from public.inventory_settings) then
    update public.inventory_settings
      set default_low_stock_threshold = p_default_low_stock_threshold,
          updated_at = now()
      where id is true; -- explicit filter (single-row table)
  else
    insert into public.inventory_settings (id, default_low_stock_threshold)
    values (true, p_default_low_stock_threshold);
  end if;
end;
$$;


--
-- Name: update_inventory_thresholds(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inventory_thresholds(p_default integer, p_reset_overrides boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  -- Auth: allow service_role (CI/MCP), otherwise require admin user
  if auth.role() = 'service_role' then
    -- allowed
  elsif not public.is_user_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Upsert settings (single row)
  if exists (select 1 from public.inventory_settings) then
    update public.inventory_settings
      set default_low_stock_threshold = p_default,
          updated_at = now()
      where id is true;
  else
    insert into public.inventory_settings (id, default_low_stock_threshold) values (true, p_default);
  end if;

  if p_reset_overrides is true then
    -- Apply to all products: explicit WHERE using primary key list to satisfy safety checks
    update public.products
       set low_stock_threshold = null,
           low_stock_override = false
     where id in (select id from public.products);
  else
    -- Normalize: any override equal to new default is cleared
    update public.products
       set low_stock_threshold = null,
           low_stock_override = false
     where low_stock_override is true
       and low_stock_threshold is not null
       and low_stock_threshold = p_default;
  end if;
end;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: user_invoice_profiles_ensure_single_default(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_invoice_profiles_ensure_single_default() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.user_invoice_profiles
        SET is_default = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    actor uuid DEFAULT auth.uid(),
    table_name text NOT NULL,
    row_pk text,
    action text NOT NULL,
    before jsonb,
    after jsonb,
    comment text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE admin_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_audit_log IS '@graphql({"disabled": true})';


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    full_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT user_profiles_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'warehouse'::character varying, 'sales'::character varying, 'viewer'::character varying, 'user'::character varying])::text[])))
);


--
-- Name: TABLE user_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_profiles IS 'Kullanıcı profilleri ve rolleri | @graphql({"disabled": true})';


--
-- Name: COLUMN user_profiles.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.role IS 'Kullanıcı rolü: user, admin, moderator';


--
-- Name: admin_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admin_users WITH (security_invoker='on') AS
 SELECT u.id,
    u.email,
    up.full_name,
    up.phone,
    up.role,
    up.created_at,
    up.updated_at
   FROM (auth.users u
     LEFT JOIN public.user_profiles up ON ((u.id = up.id)))
  WHERE ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))
  ORDER BY up.created_at DESC;


--
-- Name: VIEW admin_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.admin_users IS 'Admin ve moderatör kullanıcıları listesi | @graphql({"disabled": true})';


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    price_list_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: TABLE cart_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cart_items IS '@graphql({"disabled": true})';


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    level integer DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    seo_title text,
    seo_desc text,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    authority_content jsonb,
    menu_label text,
    marketing_title text,
    translation_key text,
    display_mode text DEFAULT 'series'::text
);


--
-- Name: category_mapping_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_mapping_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    priority integer DEFAULT 0,
    brand_filter text,
    name_pattern text NOT NULL,
    exclude_pattern text,
    spec_conditions jsonb,
    target_subcategory_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE category_mapping_rules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.category_mapping_rules IS '@graphql({"disabled": true})';


--
-- Name: client_errors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_errors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    url text,
    message text NOT NULL,
    stack text,
    user_agent text,
    release text,
    env text,
    level text DEFAULT 'error'::text NOT NULL,
    extra jsonb,
    group_id uuid
);


--
-- Name: TABLE client_errors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.client_errors IS '@graphql({"disabled": true})';


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    subject text NOT NULL,
    message text NOT NULL,
    department public.contact_department DEFAULT 'sales'::public.contact_department NOT NULL,
    status public.contact_status DEFAULT 'new'::public.contact_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    ip_address text
);


--
-- Name: TABLE contact_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contact_messages IS '@graphql({"disabled": true})';


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    code text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    minimum_order_amount numeric(10,2) DEFAULT 0,
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT coupons_code_check CHECK (((length(code) >= 3) AND (length(code) <= 50))),
    CONSTRAINT coupons_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric)),
    CONSTRAINT coupons_minimum_order_amount_check CHECK ((minimum_order_amount >= (0)::numeric)),
    CONSTRAINT coupons_usage_limit_check CHECK (((usage_limit IS NULL) OR (usage_limit > 0))),
    CONSTRAINT coupons_used_count_check CHECK ((used_count >= 0)),
    CONSTRAINT usage_limit_check CHECK (((usage_limit IS NULL) OR (used_count <= usage_limit))),
    CONSTRAINT valid_date_range CHECK (((valid_until IS NULL) OR (valid_until > valid_from)))
);


--
-- Name: TABLE coupons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.coupons IS '@graphql({"disabled": true})';


--
-- Name: error_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signature text NOT NULL,
    level text DEFAULT 'error'::text NOT NULL,
    last_message text,
    url_sample text,
    env text,
    release text,
    first_seen timestamp with time zone DEFAULT now() NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    count bigint DEFAULT 1 NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    assigned_to uuid,
    notes text
);


--
-- Name: TABLE error_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.error_groups IS '@graphql({"disabled": true})';


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    order_id uuid,
    delta integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    batch_id uuid,
    original_movement_id uuid,
    reversed_by_movement_id uuid,
    undo_by_user_id uuid,
    undo_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT inventory_movements_reason_check CHECK (((char_length(reason) >= 3) AND (char_length(reason) <= 32)))
);


--
-- Name: TABLE inventory_movements; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_movements IS '@graphql({"disabled": true})';


--
-- Name: inventory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_settings (
    id boolean DEFAULT true NOT NULL,
    default_low_stock_threshold integer DEFAULT 5,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    alert_email text,
    alert_webhook_url text,
    reservation_timeout_hours integer DEFAULT 24,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE inventory_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_settings IS '@graphql({"disabled": true})';


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    brand text NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    sku text NOT NULL,
    category_id uuid,
    subcategory_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    description text,
    technical_specs jsonb,
    image_url text,
    stock_qty integer DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    airflow_capacity numeric(10,2),
    noise_level numeric(5,2),
    pressure_rating numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    low_stock_override boolean DEFAULT false NOT NULL,
    purchase_price numeric(12,2),
    slug text,
    meta_title text,
    meta_description text,
    model_code text,
    warehouse_location text,
    supplier_name text,
    is_category_manual boolean DEFAULT false,
    CONSTRAINT products_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'out_of_stock'::text])))
);


--
-- Name: COLUMN products.model_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.model_code IS 'Distributor/Manufacturer model code (MPN). Display on PDP as Model; fallback to SKU if null.';


--
-- Name: inventory_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_summary WITH (security_invoker='true') AS
 WITH movement_stats AS (
         SELECT inventory_movements.product_id,
            COALESCE(sum(abs(inventory_movements.delta)), (0)::bigint) AS total_out_30d
           FROM public.inventory_movements
          WHERE ((inventory_movements.delta < 0) AND ((inventory_movements.reason = 'sale'::text) OR (inventory_movements.reason = 'manual_out'::text)) AND (inventory_movements.created_at >= (now() - '30 days'::interval)))
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
   FROM (public.products p
     LEFT JOIN movement_stats m ON ((p.id = m.product_id)));


--
-- Name: venthub_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    product_sku text,
    product_brand text,
    unit_price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    product_snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    price_at_time numeric(10,2),
    product_image_url text,
    unit_price_snapshot numeric(10,2),
    price_list_id_snapshot uuid,
    product_name_snapshot text,
    product_sku_snapshot text,
    tax_rate_snapshot numeric,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE venthub_order_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.venthub_order_items IS 'Order items schema fixed on 2025-09-03 - optional fields made nullable | @graphql({"disabled": true})';


--
-- Name: COLUMN venthub_order_items.total_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.venthub_order_items.total_price IS 'unit_price * quantity - calculated field';


--
-- Name: inventory_velocity; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_velocity WITH (security_invoker='true') AS
 WITH reserved AS (
         SELECT voi.product_id,
            (sum(voi.quantity))::integer AS reserved_qty
           FROM (public.venthub_order_items voi
             JOIN public.venthub_orders o ON ((o.id = voi.order_id)))
          WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text])) AND (o.shipped_at IS NULL))
          GROUP BY voi.product_id
        )
 SELECT p.id AS product_id,
    p.name,
    COALESCE(p.stock_qty, 0) AS physical_stock,
    COALESCE(r.reserved_qty, 0) AS reserved_stock,
    (COALESCE(p.stock_qty, 0) - COALESCE(r.reserved_qty, 0)) AS available_stock,
    p.warehouse_location,
    p.supplier_name
   FROM (public.products p
     LEFT JOIN reserved r ON ((r.product_id = p.id)));


--
-- Name: order_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_attachments (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    mime_type text,
    description text,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT order_attachments_file_size_check CHECK ((file_size > 0)),
    CONSTRAINT order_attachments_filename_check CHECK ((length(filename) >= 1))
);


--
-- Name: TABLE order_attachments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_attachments IS '@graphql({"disabled": true})';


--
-- Name: order_email_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    email_to text NOT NULL,
    subject text NOT NULL,
    provider text DEFAULT 'resend'::text NOT NULL,
    provider_message_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE order_email_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_email_events IS '@graphql({"disabled": true})';


--
-- Name: order_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_notes (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid DEFAULT auth.uid(),
    note text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT order_notes_note_check CHECK ((length(note) >= 1))
);


--
-- Name: TABLE order_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_notes IS '@graphql({"disabled": true})';


--
-- Name: order_refund_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_refund_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text,
    actor_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE order_refund_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_refund_events IS '@graphql({"disabled": true})';


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    tier_level integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizations IS '@graphql({"disabled": true})';


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id text NOT NULL,
    order_id uuid,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    status text NOT NULL,
    payment_method text NOT NULL,
    provider_response jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE payment_transactions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_transactions IS '@graphql({"disabled": true})';


--
-- Name: price_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    user_type character varying(50) DEFAULT 'individual'::character varying,
    is_active boolean DEFAULT true,
    effective_from timestamp with time zone DEFAULT now(),
    effective_to timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: product_authorities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_authorities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    expert_name text NOT NULL,
    expert_title text,
    expert_avatar_url text,
    content text NOT NULL,
    badge_text text,
    rating integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT product_authorities_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: TABLE product_authorities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.product_authorities IS '@graphql({"disabled": true})';


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    path text NOT NULL,
    alt text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    price_list_id uuid NOT NULL,
    base_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2),
    discount_percentage numeric(5,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: project_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: TABLE project_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_items IS '@graphql({"disabled": true})';


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    key text NOT NULL,
    bucket timestamp with time zone NOT NULL,
    count integer DEFAULT 0 NOT NULL
);


--
-- Name: TABLE rate_limits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.rate_limits IS '@graphql({"disabled": true})';


--
-- Name: reserved_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.reserved_orders WITH (security_invoker='on') AS
 SELECT voi.product_id,
    o.id AS order_id,
    o.created_at,
    o.status,
    o.payment_status,
    voi.quantity
   FROM (public.venthub_order_items voi
     JOIN public.venthub_orders o ON ((o.id = voi.order_id)))
  WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text])) AND (o.shipped_at IS NULL));


--
-- Name: returns_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns_webhook_events (
    id bigint NOT NULL,
    event_id text NOT NULL,
    return_id uuid,
    order_id uuid,
    carrier text,
    tracking_number text,
    status_raw text,
    status_mapped text,
    body_hash text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE returns_webhook_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.returns_webhook_events IS '@graphql({"disabled": true})';


--
-- Name: returns_webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.returns_webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: returns_webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.returns_webhook_events_id_seq OWNED BY public.returns_webhook_events.id;


--
-- Name: shipping_email_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    email_to text NOT NULL,
    subject text NOT NULL,
    provider text DEFAULT 'resend'::text NOT NULL,
    provider_message_id text,
    carrier text,
    tracking_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE shipping_email_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shipping_email_events IS '@graphql({"disabled": true})';


--
-- Name: shipping_idempotency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_idempotency (
    key text NOT NULL,
    scope text DEFAULT 'admin-update-shipping'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE shipping_idempotency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shipping_idempotency IS '@graphql({"disabled": true})';


--
-- Name: shipping_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_webhook_events (
    id bigint NOT NULL,
    event_id text NOT NULL,
    order_id uuid,
    order_number text,
    carrier text,
    status_raw text,
    status_mapped text,
    body_hash text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE shipping_webhook_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shipping_webhook_events IS '@graphql({"disabled": true})';


--
-- Name: shipping_webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_webhook_events_id_seq OWNED BY public.shipping_webhook_events.id;


--
-- Name: shopping_carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE shopping_carts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shopping_carts IS '@graphql({"disabled": true})';


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);


--
-- Name: TABLE site_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.site_settings IS '@graphql({"disabled": true})';


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subdomain text,
    custom_domain text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    styles jsonb DEFAULT '{}'::jsonb NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    theme_config jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    address_line text NOT NULL,
    district text NOT NULL,
    city text NOT NULL,
    postal_code text,
    country text DEFAULT 'Turkey'::text NOT NULL,
    address_type text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_default_shipping boolean DEFAULT false,
    is_default_billing boolean DEFAULT false,
    label text,
    full_name text,
    phone text,
    full_address text,
    street_address text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT user_addresses_address_type_check CHECK ((address_type = ANY (ARRAY['shipping'::text, 'billing'::text])))
);


--
-- Name: TABLE user_addresses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_addresses IS '@graphql({"disabled": true})';


--
-- Name: user_invoice_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_invoice_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_type text NOT NULL,
    company_name text,
    tax_number text,
    tax_office text,
    first_name text,
    last_name text,
    address_line text NOT NULL,
    district text NOT NULL,
    city text NOT NULL,
    postal_code text,
    country text DEFAULT 'Turkey'::text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT user_invoice_profiles_profile_type_check CHECK ((profile_type = ANY (ARRAY['individual'::text, 'corporate'::text])))
);


--
-- Name: TABLE user_invoice_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_invoice_profiles IS '@graphql({"disabled": true})';


--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE user_projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_projects IS '@graphql({"disabled": true})';


--
-- Name: venthub_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_returns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    status text DEFAULT 'requested'::text NOT NULL,
    reason text NOT NULL,
    description text,
    refund_amount numeric(10,2),
    admin_notes text,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    processed_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL,
    CONSTRAINT venthub_returns_status_check CHECK ((status = ANY (ARRAY['requested'::text, 'approved'::text, 'rejected'::text, 'in_transit'::text, 'received'::text, 'refunded'::text, 'cancelled'::text])))
);


--
-- Name: TABLE venthub_returns; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.venthub_returns IS '@graphql({"disabled": true})';


--
-- Name: view_admin_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_admin_orders WITH (security_invoker='true') AS
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
    o.shipped_at,
    o.delivered_at,
    o.created_at,
    o.updated_at,
    o.customer_name,
    o.customer_email,
    o.carrier,
    o.tracking_url,
    o.subtotal_snapshot,
    o.legal_consents,
    o.invoice_type,
    o.invoice_info,
    o.payment_token,
    o.customer_phone,
    o.tracking_number,
    o.payment_debug,
    o.coupon_code,
    o.coupon_discount,
    o.locale,
    o.tenant_id,
    (o.id)::text AS id_text,
    o.conversation_id AS conversation_id_text,
    ((((((((((((((((((COALESCE((o.id)::text, ''::text) || ' '::text) || COALESCE(o.conversation_id, ''::text)) || ' '::text) || COALESCE(o.order_number, ''::text)) || ' '::text) || COALESCE(o.customer_email, ''::text)) || ' '::text) || COALESCE(o.customer_name, ''::text)) || ' '::text) || COALESCE(o.customer_phone, ''::text)) || ' '::text) || COALESCE((o.invoice_info)::text, ''::text)) || ' '::text) || COALESCE((o.billing_address)::text, ''::text)) || ' '::text) || COALESCE((o.shipping_address)::text, ''::text)) || ' '::text) || COALESCE(p.full_name, ''::text)) AS search_text
   FROM (public.venthub_orders o
     LEFT JOIN public.user_profiles p ON ((o.user_id = p.id)));


--
-- Name: wizard_selections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wizard_selections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    door_width_cm integer NOT NULL,
    door_height_cm integer NOT NULL,
    usage_location text,
    sector text,
    wind_condition text,
    traffic_intensity text,
    heating_needed text,
    climate_zone text,
    calculated_airflow_m3h integer,
    calculated_nozzle_velocity numeric(5,2),
    calculated_power_w integer,
    recommended_series text,
    recommended_product_ids uuid[],
    selected_product_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    order_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);


--
-- Name: TABLE wizard_selections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.wizard_selections IS 'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı | @graphql({"disabled": true})';


--
-- Name: COLUMN wizard_selections.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wizard_selections.session_id IS 'Anonim kullanıcılar için oturum tanımlayıcı';


--
-- Name: COLUMN wizard_selections.calculated_airflow_m3h; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wizard_selections.calculated_airflow_m3h IS 'Formül ile hesaplanan gerekli debi (m³/h)';


--
-- Name: COLUMN wizard_selections.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wizard_selections.order_id IS 'Bu seçimle ilişkilendirilen sipariş (varsa)';


--
-- Name: returns_webhook_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns_webhook_events ALTER COLUMN id SET DEFAULT nextval('public.returns_webhook_events_id_seq'::regclass);


--
-- Name: shipping_webhook_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_webhook_events ALTER COLUMN id SET DEFAULT nextval('public.shipping_webhook_events_id_seq'::regclass);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: category_mapping_rules category_mapping_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_mapping_rules
    ADD CONSTRAINT category_mapping_rules_pkey PRIMARY KEY (id);


--
-- Name: client_errors client_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_errors
    ADD CONSTRAINT client_errors_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: error_groups error_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_groups
    ADD CONSTRAINT error_groups_pkey PRIMARY KEY (id);


--
-- Name: error_groups error_groups_signature_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_groups
    ADD CONSTRAINT error_groups_signature_key UNIQUE (signature);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_settings inventory_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_settings
    ADD CONSTRAINT inventory_settings_pkey PRIMARY KEY (id);


--
-- Name: order_attachments order_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_attachments
    ADD CONSTRAINT order_attachments_pkey PRIMARY KEY (id);


--
-- Name: order_email_events order_email_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_email_events
    ADD CONSTRAINT order_email_events_pkey PRIMARY KEY (id);


--
-- Name: order_notes order_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_pkey PRIMARY KEY (id);


--
-- Name: order_refund_events order_refund_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_refund_events
    ADD CONSTRAINT order_refund_events_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_id_key UNIQUE (transaction_id);


--
-- Name: price_lists price_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_pkey PRIMARY KEY (id);


--
-- Name: product_authorities product_authorities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_authorities
    ADD CONSTRAINT product_authorities_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_unique UNIQUE (product_id, price_list_id, valid_from);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: project_items project_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_pkey PRIMARY KEY (id);


--
-- Name: project_items project_items_project_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_project_id_product_id_key UNIQUE (project_id, product_id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (key, bucket);


--
-- Name: returns_webhook_events returns_webhook_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns_webhook_events
    ADD CONSTRAINT returns_webhook_events_event_id_key UNIQUE (event_id);


--
-- Name: returns_webhook_events returns_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns_webhook_events
    ADD CONSTRAINT returns_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: shipping_email_events shipping_email_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_email_events
    ADD CONSTRAINT shipping_email_events_pkey PRIMARY KEY (id);


--
-- Name: shipping_idempotency shipping_idempotency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_idempotency
    ADD CONSTRAINT shipping_idempotency_pkey PRIMARY KEY (key);


--
-- Name: shipping_webhook_events shipping_webhook_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_webhook_events
    ADD CONSTRAINT shipping_webhook_events_event_id_key UNIQUE (event_id);


--
-- Name: shipping_webhook_events shipping_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_webhook_events
    ADD CONSTRAINT shipping_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: shopping_carts shopping_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_custom_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_custom_domain_key UNIQUE (custom_domain);


--
-- Name: tenants tenants_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_name_key UNIQUE (name);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subdomain_key UNIQUE (subdomain);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_invoice_profiles user_invoice_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_invoice_profiles
    ADD CONSTRAINT user_invoice_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (id);


--
-- Name: venthub_order_items venthub_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_order_items
    ADD CONSTRAINT venthub_order_items_pkey PRIMARY KEY (id);


--
-- Name: venthub_orders venthub_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_orders
    ADD CONSTRAINT venthub_orders_order_number_key UNIQUE (order_number);


--
-- Name: venthub_orders venthub_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_orders
    ADD CONSTRAINT venthub_orders_pkey PRIMARY KEY (id);


--
-- Name: venthub_returns venthub_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_returns
    ADD CONSTRAINT venthub_returns_pkey PRIMARY KEY (id);


--
-- Name: wizard_selections wizard_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_selections
    ADD CONSTRAINT wizard_selections_pkey PRIMARY KEY (id);


--
-- Name: cart_items_cart_product_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cart_items_cart_product_unique ON public.cart_items USING btree (cart_id, product_id);


--
-- Name: idx_admin_audit_log_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_log_tenant_id ON public.admin_audit_log USING btree (tenant_id);


--
-- Name: idx_cart_items_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_price_list_id ON public.cart_items USING btree (price_list_id);


--
-- Name: idx_cart_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: idx_cart_items_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_tenant_id ON public.cart_items USING btree (tenant_id);


--
-- Name: idx_categories_menu_label; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_menu_label ON public.categories USING btree (menu_label);


--
-- Name: idx_categories_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);


--
-- Name: idx_category_mapping_rules_target_subcategory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_mapping_rules_target_subcategory ON public.category_mapping_rules USING btree (target_subcategory_id);


--
-- Name: idx_client_errors_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_errors_at ON public.client_errors USING btree (at);


--
-- Name: idx_client_errors_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_errors_group_id ON public.client_errors USING btree (group_id);


--
-- Name: idx_coupons_active_valid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_active_valid ON public.coupons USING btree (is_active, valid_from, valid_until) WHERE (is_active = true);


--
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);


--
-- Name: idx_coupons_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_created_by ON public.coupons USING btree (created_by);


--
-- Name: idx_coupons_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_tenant_id ON public.coupons USING btree (tenant_id);


--
-- Name: idx_error_groups_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_groups_assigned_to ON public.error_groups USING btree (assigned_to);


--
-- Name: idx_inventory_movements_batch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_batch_id ON public.inventory_movements USING btree (batch_id);


--
-- Name: idx_inventory_movements_original_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_original_id ON public.inventory_movements USING btree (original_movement_id);


--
-- Name: idx_inventory_movements_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements USING btree (product_id);


--
-- Name: idx_inventory_movements_reversed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_reversed_by ON public.inventory_movements USING btree (reversed_by_movement_id);


--
-- Name: idx_inventory_movements_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_tenant_id ON public.inventory_movements USING btree (tenant_id);


--
-- Name: idx_inventory_settings_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_settings_tenant_id ON public.inventory_settings USING btree (tenant_id);


--
-- Name: idx_order_attachments_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_attachments_created_by ON public.order_attachments USING btree (created_by);


--
-- Name: idx_order_attachments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_attachments_order_id ON public.order_attachments USING btree (order_id);


--
-- Name: idx_order_attachments_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_attachments_tenant_id ON public.order_attachments USING btree (tenant_id);


--
-- Name: idx_order_email_events_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_email_events_order_id ON public.order_email_events USING btree (order_id);


--
-- Name: idx_order_notes_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_order_id ON public.order_notes USING btree (order_id);


--
-- Name: idx_order_notes_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_tenant_id ON public.order_notes USING btree (tenant_id);


--
-- Name: idx_order_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_user_id ON public.order_notes USING btree (user_id);


--
-- Name: idx_order_refund_events_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_refund_events_tenant_id ON public.order_refund_events USING btree (tenant_id);


--
-- Name: idx_payment_transactions_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions USING btree (order_id);


--
-- Name: idx_payment_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions USING btree (user_id);


--
-- Name: idx_price_lists_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_price_lists_tenant_id ON public.price_lists USING btree (tenant_id);


--
-- Name: idx_product_authorities_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_authorities_product_id ON public.product_authorities USING btree (product_id);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_product_prices_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_prices_price_list_id ON public.product_prices USING btree (price_list_id);


--
-- Name: idx_product_prices_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_prices_tenant_id ON public.product_prices USING btree (tenant_id);


--
-- Name: idx_products_brand_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand_trgm ON public.products USING gin (brand extensions.gin_trgm_ops);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_featured ON public.products USING btree (is_featured) WHERE (status = 'active'::text);


--
-- Name: idx_products_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name_trgm ON public.products USING gin (name extensions.gin_trgm_ops);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_products_subcategory_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_subcategory_id ON public.products USING btree (subcategory_id);


--
-- Name: idx_project_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_items_product_id ON public.project_items USING btree (product_id);


--
-- Name: idx_returns_webhook_events_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_returns_webhook_events_tenant_id ON public.returns_webhook_events USING btree (tenant_id);


--
-- Name: idx_shipping_email_events_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_email_events_order_id ON public.shipping_email_events USING btree (order_id);


--
-- Name: idx_shipping_email_events_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_email_events_tenant_id ON public.shipping_email_events USING btree (tenant_id);


--
-- Name: idx_shipping_webhook_events_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_webhook_events_tenant_id ON public.shipping_webhook_events USING btree (tenant_id);


--
-- Name: idx_shopping_carts_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_carts_tenant_id ON public.shopping_carts USING btree (tenant_id);


--
-- Name: idx_shopping_carts_user_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_shopping_carts_user_unique ON public.shopping_carts USING btree (user_id);


--
-- Name: idx_site_settings_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_settings_updated_by ON public.site_settings USING btree (updated_by);


--
-- Name: idx_user_addresses_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_addresses_tenant_id ON public.user_addresses USING btree (tenant_id);


--
-- Name: idx_user_invoice_profiles_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_invoice_profiles_tenant_id ON public.user_invoice_profiles USING btree (tenant_id);


--
-- Name: idx_user_invoice_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_invoice_profiles_user_id ON public.user_invoice_profiles USING btree (user_id);


--
-- Name: idx_user_profiles_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_tenant_id ON public.user_profiles USING btree (tenant_id);


--
-- Name: idx_user_projects_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_projects_user_id ON public.user_projects USING btree (user_id);


--
-- Name: idx_venthub_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_order_items_order_id ON public.venthub_order_items USING btree (order_id);


--
-- Name: idx_venthub_order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_order_items_product_id ON public.venthub_order_items USING btree (product_id);


--
-- Name: idx_venthub_order_items_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_order_items_tenant_id ON public.venthub_order_items USING btree (tenant_id);


--
-- Name: idx_venthub_orders_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_orders_tenant_id ON public.venthub_orders USING btree (tenant_id);


--
-- Name: idx_venthub_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_orders_user_id ON public.venthub_orders USING btree (user_id);


--
-- Name: idx_venthub_returns_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_returns_order_id ON public.venthub_returns USING btree (order_id);


--
-- Name: idx_venthub_returns_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_returns_tenant_id ON public.venthub_returns USING btree (tenant_id);


--
-- Name: idx_venthub_returns_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venthub_returns_user_id ON public.venthub_returns USING btree (user_id);


--
-- Name: idx_wizard_selections_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_created_at ON public.wizard_selections USING btree (created_at);


--
-- Name: idx_wizard_selections_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_order_id ON public.wizard_selections USING btree (order_id);


--
-- Name: idx_wizard_selections_selected_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_selected_product_id ON public.wizard_selections USING btree (selected_product_id);


--
-- Name: idx_wizard_selections_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_session_id ON public.wizard_selections USING btree (session_id);


--
-- Name: idx_wizard_selections_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_tenant_id ON public.wizard_selections USING btree (tenant_id);


--
-- Name: idx_wizard_selections_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wizard_selections_user_id ON public.wizard_selections USING btree (user_id);


--
-- Name: inventory_movements_order_product_reason_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_movements_order_product_reason_key ON public.inventory_movements USING btree (order_id, product_id, reason) WHERE (order_id IS NOT NULL);


--
-- Name: rate_limits_bucket_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_limits_bucket_idx ON public.rate_limits USING btree (bucket);


--
-- Name: returns_webhook_events_received_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX returns_webhook_events_received_at_idx ON public.returns_webhook_events USING btree (received_at DESC);


--
-- Name: returns_webhook_events_return_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX returns_webhook_events_return_id_idx ON public.returns_webhook_events USING btree (return_id);


--
-- Name: shipping_email_events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_email_events_created_at_idx ON public.shipping_email_events USING btree (created_at DESC);


--
-- Name: shipping_idempotency_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_idempotency_created_at_idx ON public.shipping_idempotency USING btree (created_at);


--
-- Name: uq_products_slug_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_products_slug_lower ON public.products USING btree (lower(slug));


--
-- Name: user_addresses_one_default_billing; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_addresses_one_default_billing ON public.user_addresses USING btree (user_id) WHERE is_default_billing;


--
-- Name: user_addresses_one_default_shipping; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_addresses_one_default_shipping ON public.user_addresses USING btree (user_id) WHERE is_default_shipping;


--
-- Name: cart_items cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: categories on_categories_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_categories_change AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();


--
-- Name: inventory_movements on_inventory_movements_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_inventory_movements_change AFTER INSERT OR DELETE OR UPDATE ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();


--
-- Name: products on_products_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_products_change AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();


--
-- Name: organizations organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: price_lists price_lists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER price_lists_updated_at BEFORE UPDATE ON public.price_lists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: product_prices product_prices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER product_prices_updated_at BEFORE UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: venthub_orders set_order_number_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION public.set_order_number();


--
-- Name: shopping_carts shopping_carts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER shopping_carts_updated_at BEFORE UPDATE ON public.shopping_carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cart_items tr_cart_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_cart_items_set_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products tr_product_auto_category; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_product_auto_category BEFORE INSERT OR UPDATE OF name, brand ON public.products FOR EACH ROW WHEN ((new.is_category_manual = false)) EXECUTE FUNCTION public.tr_auto_categorize_trigger();


--
-- Name: user_profiles trg_enforce_role_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enforce_role_change BEFORE UPDATE OF role ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.enforce_role_change();


--
-- Name: inventory_settings trg_normalize_product_threshold_overrides; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_normalize_product_threshold_overrides AFTER INSERT OR UPDATE ON public.inventory_settings FOR EACH ROW EXECUTE FUNCTION public.normalize_product_threshold_overrides();


--
-- Name: venthub_orders trg_sync_payment_status_ins; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_payment_status_ins BEFORE INSERT ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION public.sync_payment_status_with_status();


--
-- Name: venthub_orders trg_sync_payment_status_upd; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_payment_status_upd BEFORE UPDATE OF status ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION public.sync_payment_status_with_status();


--
-- Name: user_invoice_profiles trg_user_invoice_profiles_single_default; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_invoice_profiles_single_default BEFORE INSERT OR UPDATE ON public.user_invoice_profiles FOR EACH ROW EXECUTE FUNCTION public.user_invoice_profiles_ensure_single_default();


--
-- Name: user_invoice_profiles trg_user_invoice_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_invoice_profiles_updated_at BEFORE UPDATE ON public.user_invoice_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_profiles trg_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_user_profiles_updated_at();


--
-- Name: venthub_returns trg_venthub_returns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_venthub_returns_updated_at BEFORE UPDATE ON public.venthub_returns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: coupons update_coupons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: order_notes update_order_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_order_notes_updated_at BEFORE UPDATE ON public.order_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: venthub_order_items update_venthub_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_venthub_order_items_updated_at BEFORE UPDATE ON public.venthub_order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: venthub_orders update_venthub_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_venthub_orders_updated_at BEFORE UPDATE ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_addresses user_addresses_set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_addresses_set_timestamp BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: venthub_order_items venthub_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER venthub_order_items_updated_at BEFORE UPDATE ON public.venthub_order_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: venthub_orders venthub_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER venthub_orders_updated_at BEFORE UPDATE ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: admin_audit_log admin_audit_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.shopping_carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: category_mapping_rules category_mapping_rules_target_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_mapping_rules
    ADD CONSTRAINT category_mapping_rules_target_subcategory_id_fkey FOREIGN KEY (target_subcategory_id) REFERENCES public.categories(id);


--
-- Name: client_errors client_errors_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_errors
    ADD CONSTRAINT client_errors_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.error_groups(id) ON DELETE SET NULL;


--
-- Name: coupons coupons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: coupons coupons_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: error_groups error_groups_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_groups
    ADD CONSTRAINT error_groups_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_settings inventory_settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_settings
    ADD CONSTRAINT inventory_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_attachments order_attachments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_attachments
    ADD CONSTRAINT order_attachments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: order_attachments order_attachments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_attachments
    ADD CONSTRAINT order_attachments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: order_attachments order_attachments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_attachments
    ADD CONSTRAINT order_attachments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_email_events order_email_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_email_events
    ADD CONSTRAINT order_email_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: order_notes order_notes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: order_notes order_notes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_notes order_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: order_refund_events order_refund_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_refund_events
    ADD CONSTRAINT order_refund_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: price_lists price_lists_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_authorities product_authorities_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_authorities
    ADD CONSTRAINT product_authorities_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_prices product_prices_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE CASCADE;


--
-- Name: product_prices product_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_prices product_prices_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: products products_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: project_items project_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: project_items project_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.user_projects(id) ON DELETE CASCADE;


--
-- Name: returns_webhook_events returns_webhook_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns_webhook_events
    ADD CONSTRAINT returns_webhook_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shipping_email_events shipping_email_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_email_events
    ADD CONSTRAINT shipping_email_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: shipping_email_events shipping_email_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_email_events
    ADD CONSTRAINT shipping_email_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shipping_webhook_events shipping_webhook_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_webhook_events
    ADD CONSTRAINT shipping_webhook_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: site_settings site_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: user_addresses user_addresses_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_invoice_profiles user_invoice_profiles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_invoice_profiles
    ADD CONSTRAINT user_invoice_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_invoice_profiles user_invoice_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_invoice_profiles
    ADD CONSTRAINT user_invoice_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_projects user_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: venthub_order_items venthub_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_order_items
    ADD CONSTRAINT venthub_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: venthub_order_items venthub_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_order_items
    ADD CONSTRAINT venthub_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: venthub_order_items venthub_order_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_order_items
    ADD CONSTRAINT venthub_order_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: venthub_orders venthub_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_orders
    ADD CONSTRAINT venthub_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: venthub_orders venthub_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_orders
    ADD CONSTRAINT venthub_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: venthub_returns venthub_returns_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_returns
    ADD CONSTRAINT venthub_returns_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE CASCADE;


--
-- Name: venthub_returns venthub_returns_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_returns
    ADD CONSTRAINT venthub_returns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: venthub_returns venthub_returns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venthub_returns
    ADD CONSTRAINT venthub_returns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wizard_selections wizard_selections_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_selections
    ADD CONSTRAINT wizard_selections_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE SET NULL;


--
-- Name: wizard_selections wizard_selections_selected_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_selections
    ADD CONSTRAINT wizard_selections_selected_product_id_fkey FOREIGN KEY (selected_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: wizard_selections wizard_selections_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_selections
    ADD CONSTRAINT wizard_selections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: wizard_selections wizard_selections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_selections
    ADD CONSTRAINT wizard_selections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: contact_messages Admins can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying])::text[]))))));


--
-- Name: organizations Anyone can view organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (true);


--
-- Name: product_authorities Product authorities are manageable by admins.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Product authorities are manageable by admins." ON public.product_authorities USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid)) AND ((user_profiles.role)::text = ANY (ARRAY[('admin'::character varying)::text, ('superadmin'::character varying)::text]))))));


--
-- Name: project_items Users can delete items from their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete items from their projects" ON public.project_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_projects
  WHERE ((user_projects.id = project_items.project_id) AND (user_projects.user_id = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid))))));


--
-- Name: user_projects Users can delete their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own projects" ON public.user_projects FOR DELETE USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) = user_id));


--
-- Name: project_items Users can insert items in their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert items in their projects" ON public.project_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_projects
  WHERE ((user_projects.id = project_items.project_id) AND (user_projects.user_id = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid))))));


--
-- Name: user_projects Users can insert their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own projects" ON public.user_projects FOR INSERT WITH CHECK ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) = user_id));


--
-- Name: project_items Users can update items in their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update items in their projects" ON public.project_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_projects
  WHERE ((user_projects.id = project_items.project_id) AND (user_projects.user_id = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid))))));


--
-- Name: user_projects Users can update their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own projects" ON public.user_projects FOR UPDATE USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) = user_id));


--
-- Name: project_items Users can view items in their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view items in their projects" ON public.project_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_projects
  WHERE ((user_projects.id = project_items.project_id) AND (user_projects.user_id = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid))))));


--
-- Name: user_projects Users can view their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own projects" ON public.user_projects FOR SELECT USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT auth.uid() AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) AS uid) = user_id));


--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit_log admin_audit_log_insert_v2; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_audit_log_insert_v2 ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: admin_audit_log admin_audit_log_select_v2; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_audit_log_select_v2 ON public.admin_audit_log FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: admin_audit_log admin_audit_log_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_audit_log_service_role ON public.admin_audit_log TO service_role USING (true);


--
-- Name: error_groups admins_read_error_groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_read_error_groups ON public.error_groups FOR SELECT TO authenticated USING (public.is_admin_user());


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: cart_items cart_items_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_items_service_role ON public.cart_items TO service_role USING (true);


--
-- Name: categories cat_admin_delete_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cat_admin_delete_opt ON public.categories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: categories cat_admin_insert_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cat_admin_insert_opt ON public.categories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: categories cat_admin_update_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cat_admin_update_opt ON public.categories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: categories cat_public_read_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cat_public_read_opt ON public.categories FOR SELECT USING (true);


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: category_mapping_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category_mapping_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: cart_items ci_auth_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ci_auth_all ON public.cart_items TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (cart_id IN ( SELECT shopping_carts.id
   FROM public.shopping_carts
  WHERE ((shopping_carts.user_id = ( SELECT auth.uid() AS uid)) AND (shopping_carts.tenant_id = public.jwt_tenant_id())))))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (cart_id IN ( SELECT shopping_carts.id
   FROM public.shopping_carts
  WHERE ((shopping_carts.user_id = ( SELECT auth.uid() AS uid)) AND (shopping_carts.tenant_id = public.jwt_tenant_id()))))));


--
-- Name: client_errors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons coupons_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_admin_delete ON public.coupons FOR DELETE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: coupons coupons_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_admin_insert ON public.coupons FOR INSERT TO authenticated WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: coupons coupons_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_admin_update ON public.coupons FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: coupons coupons_select_anon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_select_anon ON public.coupons FOR SELECT TO anon USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (is_active = true) AND ((valid_until IS NULL) OR (valid_until > now()))));


--
-- Name: coupons coupons_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_select_authenticated ON public.coupons FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin) OR ((is_active = true) AND ((valid_until IS NULL) OR (valid_until > now()))))));


--
-- Name: coupons coupons_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_service_role ON public.coupons TO service_role USING (true);


--
-- Name: error_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_movements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_movements inventory_movements_select_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY inventory_movements_select_admin ON public.inventory_movements FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: inventory_movements inventory_movements_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY inventory_movements_service_role ON public.inventory_movements TO service_role USING (true);


--
-- Name: inventory_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_settings inventory_settings_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY inventory_settings_select_all ON public.inventory_settings FOR SELECT TO anon, authenticated USING ((tenant_id = public.jwt_tenant_id()));


--
-- Name: inventory_settings inventory_settings_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY inventory_settings_service_role ON public.inventory_settings TO service_role USING (true);


--
-- Name: inventory_settings inventory_settings_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY inventory_settings_update_admin ON public.inventory_settings FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: shopping_carts merged_shopping_carts_service_role_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY merged_shopping_carts_service_role_select ON public.shopping_carts FOR SELECT TO service_role USING ((true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true));


--
-- Name: order_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: order_attachments order_attachments_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_attachments_admin_delete ON public.order_attachments FOR DELETE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_attachments order_attachments_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_attachments_admin_insert ON public.order_attachments FOR INSERT TO authenticated WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_attachments order_attachments_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_attachments_admin_update ON public.order_attachments FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_attachments order_attachments_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_attachments_select_authenticated ON public.order_attachments FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin) OR ((NOT is_internal) AND (order_id IN ( SELECT venthub_orders.id
   FROM public.venthub_orders
  WHERE ((venthub_orders.user_id = ( SELECT auth.uid() AS uid)) AND (venthub_orders.tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)))))))));


--
-- Name: order_attachments order_attachments_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_attachments_service_role ON public.order_attachments TO service_role USING (true);


--
-- Name: order_email_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_email_events ENABLE ROW LEVEL SECURITY;

--
-- Name: order_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: order_notes order_notes_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_notes_admin_delete ON public.order_notes FOR DELETE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_notes order_notes_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_notes_admin_insert ON public.order_notes FOR INSERT TO authenticated WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_notes order_notes_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_notes_admin_update ON public.order_notes FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: order_notes order_notes_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_notes_select_authenticated ON public.order_notes FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin) OR ((NOT is_internal) AND (order_id IN ( SELECT venthub_orders.id
   FROM public.venthub_orders
  WHERE ((venthub_orders.user_id = ( SELECT auth.uid() AS uid)) AND (venthub_orders.tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)))))))));


--
-- Name: order_notes order_notes_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_notes_service_role ON public.order_notes TO service_role USING (true);


--
-- Name: order_refund_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_refund_events ENABLE ROW LEVEL SECURITY;

--
-- Name: order_refund_events order_refund_events_admin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_refund_events_admin_select ON public.order_refund_events FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: order_refund_events order_refund_events_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_refund_events_service_role ON public.order_refund_events TO service_role USING (true);


--
-- Name: venthub_orders orders_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_delete_policy ON public.venthub_orders FOR DELETE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ( SELECT public.is_admin_user() AS is_admin_user)));


--
-- Name: venthub_orders orders_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_insert_policy ON public.venthub_orders FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: venthub_orders orders_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_select_policy ON public.venthub_orders FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: venthub_orders orders_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_service_role ON public.venthub_orders TO service_role USING (true);


--
-- Name: venthub_orders orders_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_update_policy ON public.venthub_orders FOR UPDATE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user)))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: price_lists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: price_lists price_lists_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_admin_delete ON public.price_lists FOR DELETE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: price_lists price_lists_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_admin_insert ON public.price_lists FOR INSERT TO authenticated WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: price_lists price_lists_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_admin_update ON public.price_lists FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: price_lists price_lists_select_anon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_select_anon ON public.price_lists FOR SELECT TO anon USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (is_active = true)));


--
-- Name: price_lists price_lists_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_select_authenticated ON public.price_lists FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin) OR (is_active = true))));


--
-- Name: price_lists price_lists_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY price_lists_service_role ON public.price_lists TO service_role USING (true);


--
-- Name: products prod_admin_delete_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prod_admin_delete_opt ON public.products FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: products prod_admin_insert_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prod_admin_insert_opt ON public.products FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: products prod_admin_update_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prod_admin_update_opt ON public.products FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying, 'moderator'::character varying])::text[]))))));


--
-- Name: products prod_public_read_opt; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prod_public_read_opt ON public.products FOR SELECT USING (true);


--
-- Name: product_authorities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_authorities ENABLE ROW LEVEL SECURITY;

--
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

--
-- Name: product_images product_images_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_images_select_all ON public.product_images FOR SELECT USING (true);


--
-- Name: product_images product_images_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_images_update_admin ON public.product_images FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying])::text[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.role)::text = ANY ((ARRAY['admin'::character varying, 'superadmin'::character varying])::text[]))))));


--
-- Name: product_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: product_prices product_prices_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_admin_delete ON public.product_prices FOR DELETE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: product_prices product_prices_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_admin_insert ON public.product_prices FOR INSERT TO authenticated WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: product_prices product_prices_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_admin_update ON public.product_prices FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin)));


--
-- Name: product_prices product_prices_select_anon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_select_anon ON public.product_prices FOR SELECT TO anon USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (is_active = true)));


--
-- Name: product_prices product_prices_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_select_authenticated ON public.product_prices FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND (( SELECT public.is_user_admin(( SELECT auth.uid() AS uid)) AS is_user_admin) OR (is_active = true))));


--
-- Name: product_prices product_prices_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_prices_service_role ON public.product_prices TO service_role USING (true);


--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: project_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: venthub_returns returns_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_delete_policy ON public.venthub_returns FOR DELETE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ( SELECT public.is_admin_user() AS is_admin_user)));


--
-- Name: venthub_returns returns_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_insert_policy ON public.venthub_returns FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: venthub_returns returns_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_select_policy ON public.venthub_returns FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: venthub_returns returns_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_service_role ON public.venthub_returns TO service_role USING (true);


--
-- Name: venthub_returns returns_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_update_policy ON public.venthub_returns FOR UPDATE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ( SELECT public.is_admin_user() AS is_admin_user))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ( SELECT public.is_admin_user() AS is_admin_user)));


--
-- Name: returns_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.returns_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: returns_webhook_events returns_webhook_events_admin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_webhook_events_admin_select ON public.returns_webhook_events FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: returns_webhook_events returns_webhook_events_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY returns_webhook_events_service_role ON public.returns_webhook_events TO service_role USING (true);


--
-- Name: shopping_carts sc_auth_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sc_auth_all ON public.shopping_carts TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid)))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: shipping_email_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipping_email_events ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_email_events shipping_email_events_admin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shipping_email_events_admin_select ON public.shipping_email_events FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: shipping_email_events shipping_email_events_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shipping_email_events_service_role ON public.shipping_email_events TO service_role USING (true);


--
-- Name: shipping_idempotency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipping_idempotency ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_webhook_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipping_webhook_events ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_webhook_events shipping_webhook_events_admin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shipping_webhook_events_admin_select ON public.shipping_webhook_events FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: shipping_webhook_events shipping_webhook_events_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shipping_webhook_events_service_role ON public.shipping_webhook_events TO service_role USING (true);


--
-- Name: shopping_carts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

--
-- Name: shopping_carts shopping_carts_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shopping_carts_service_role ON public.shopping_carts TO service_role USING (true);


--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants tenants_all_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenants_all_service_role ON public.tenants TO service_role USING (true);


--
-- Name: tenants tenants_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenants_select ON public.tenants FOR SELECT TO anon, authenticated USING (true);


--
-- Name: user_invoice_profiles uip_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY uip_own ON public.user_invoice_profiles TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid)))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: user_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: user_addresses user_addresses_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_addresses_delete ON public.user_addresses FOR DELETE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: user_addresses user_addresses_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_addresses_insert ON public.user_addresses FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: user_addresses user_addresses_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_addresses_select ON public.user_addresses FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: user_addresses user_addresses_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_addresses_service_role ON public.user_addresses TO service_role USING (true);


--
-- Name: user_addresses user_addresses_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_addresses_update ON public.user_addresses FOR UPDATE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid)))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: user_invoice_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_invoice_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_invoice_profiles user_invoice_profiles_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_invoice_profiles_service_role ON public.user_invoice_profiles TO service_role USING (true);


--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles user_profiles_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profiles_delete_policy ON public.user_profiles FOR DELETE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND public.is_admin_user()));


--
-- Name: user_profiles user_profiles_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profiles_insert_policy ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ((id = ( SELECT auth.uid() AS uid)) OR public.is_admin_user())));


--
-- Name: user_profiles user_profiles_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id() AS jwt_tenant_id)) AND ((id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: user_profiles user_profiles_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profiles_service_role ON public.user_profiles TO service_role USING (true);


--
-- Name: user_profiles user_profiles_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profiles_update_policy ON public.user_profiles FOR UPDATE TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ((id = ( SELECT auth.uid() AS uid)) OR public.is_admin_user()))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND ((id = ( SELECT auth.uid() AS uid)) OR public.is_admin_user())));


--
-- Name: user_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: venthub_order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.venthub_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: venthub_order_items venthub_order_items_insert_optimized; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY venthub_order_items_insert_optimized ON public.venthub_order_items FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (EXISTS ( SELECT 1
   FROM public.venthub_orders
  WHERE ((venthub_orders.id = venthub_order_items.order_id) AND (venthub_orders.user_id = ( SELECT auth.uid() AS uid)) AND (venthub_orders.tenant_id = public.jwt_tenant_id()))))));


--
-- Name: venthub_order_items venthub_order_items_select_consolidated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY venthub_order_items_select_consolidated ON public.venthub_order_items FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND ((order_id IN ( SELECT venthub_orders.id
   FROM public.venthub_orders
  WHERE ((venthub_orders.user_id = ( SELECT auth.uid() AS uid)) AND (venthub_orders.tenant_id = public.jwt_tenant_id())))) OR ( SELECT public.is_admin_user() AS is_admin_user))));


--
-- Name: venthub_order_items venthub_order_items_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY venthub_order_items_service_role ON public.venthub_order_items TO service_role USING (true);


--
-- Name: venthub_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.venthub_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: venthub_returns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.venthub_returns ENABLE ROW LEVEL SECURITY;

--
-- Name: wizard_selections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wizard_selections ENABLE ROW LEVEL SECURITY;

--
-- Name: wizard_selections wizard_selections_service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY wizard_selections_service_role ON public.wizard_selections TO service_role USING (true);


--
-- Name: wizard_selections ws_anon_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ws_anon_insert ON public.wizard_selections FOR INSERT TO anon WITH CHECK ((tenant_id = public.jwt_tenant_id()));


--
-- Name: wizard_selections ws_auth_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ws_auth_all ON public.wizard_selections TO authenticated USING (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid)))) WITH CHECK (((tenant_id = public.jwt_tenant_id()) AND (user_id = ( SELECT auth.uid() AS uid))));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;


--
-- Name: FUNCTION _normalize_rls_expr(expr text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public._normalize_rls_expr(expr text) TO anon;
GRANT ALL ON FUNCTION public._normalize_rls_expr(expr text) TO authenticated;
GRANT ALL ON FUNCTION public._normalize_rls_expr(expr text) TO service_role;


--
-- Name: FUNCTION adjust_stock(p_product_id uuid, p_delta integer, p_reason text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text) TO service_role;
GRANT ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text) TO authenticated;


--
-- Name: FUNCTION adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid) TO authenticated;


--
-- Name: FUNCTION adjust_stock_v2(p_product_id uuid, p_delta integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.adjust_stock_v2(p_product_id uuid, p_delta integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.adjust_stock_v2(p_product_id uuid, p_delta integer) TO service_role;


--
-- Name: FUNCTION admin_list_all_users(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_list_all_users() FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_list_all_users() TO service_role;


--
-- Name: FUNCTION admin_list_users(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_list_users() TO service_role;
GRANT ALL ON FUNCTION public.admin_list_users() TO authenticated;


--
-- Name: FUNCTION admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid) TO anon;
GRANT ALL ON FUNCTION public.admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid) TO service_role;


--
-- Name: FUNCTION bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer) TO anon;
GRANT ALL ON FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer) TO authenticated;
GRANT ALL ON FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer) TO service_role;


--
-- Name: FUNCTION custom_access_token_hook(event jsonb); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.custom_access_token_hook(event jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.custom_access_token_hook(event jsonb) TO service_role;
GRANT ALL ON FUNCTION public.custom_access_token_hook(event jsonb) TO supabase_auth_admin;


--
-- Name: FUNCTION enforce_role_change(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.enforce_role_change() FROM PUBLIC;
GRANT ALL ON FUNCTION public.enforce_role_change() TO service_role;


--
-- Name: TABLE venthub_orders; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.venthub_orders TO anon;
GRANT ALL ON TABLE public.venthub_orders TO authenticated;
GRANT ALL ON TABLE public.venthub_orders TO service_role;


--
-- Name: FUNCTION fn_admin_get_orders(p_id text, p_conv text, p_status text, p_limit integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.fn_admin_get_orders(p_id text, p_conv text, p_status text, p_limit integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fn_admin_get_orders(p_id text, p_conv text, p_status text, p_limit integer) TO service_role;


--
-- Name: FUNCTION fn_admin_update_order_status(p_id text, p_status text, p_conv text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.fn_admin_update_order_status(p_id text, p_status text, p_conv text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fn_admin_update_order_status(p_id text, p_status text, p_conv text) TO service_role;


--
-- Name: FUNCTION fn_auto_categorize_products(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fn_auto_categorize_products() TO anon;
GRANT ALL ON FUNCTION public.fn_auto_categorize_products() TO authenticated;
GRANT ALL ON FUNCTION public.fn_auto_categorize_products() TO service_role;


--
-- Name: FUNCTION fn_enrich_product_specs(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fn_enrich_product_specs() TO anon;
GRANT ALL ON FUNCTION public.fn_enrich_product_specs() TO authenticated;
GRANT ALL ON FUNCTION public.fn_enrich_product_specs() TO service_role;


--
-- Name: FUNCTION fts_search_products(p_q text, p_limit integer, p_filters jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fts_search_products(p_q text, p_limit integer, p_filters jsonb) TO anon;
GRANT ALL ON FUNCTION public.fts_search_products(p_q text, p_limit integer, p_filters jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.fts_search_products(p_q text, p_limit integer, p_filters jsonb) TO service_role;


--
-- Name: FUNCTION generate_order_number(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.generate_order_number() TO anon;
GRANT ALL ON FUNCTION public.generate_order_number() TO authenticated;
GRANT ALL ON FUNCTION public.generate_order_number() TO service_role;


--
-- Name: FUNCTION get_admin_users(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_admin_users() TO service_role;


--
-- Name: FUNCTION get_products_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_sort_by text, p_brand text, p_min_price numeric, p_max_price numeric); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.get_products_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_sort_by text, p_brand text, p_min_price numeric, p_max_price numeric) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_products_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_sort_by text, p_brand text, p_min_price numeric, p_max_price numeric) TO service_role;
GRANT ALL ON FUNCTION public.get_products_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_sort_by text, p_brand text, p_min_price numeric, p_max_price numeric) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_sort_by text, p_brand text, p_min_price numeric, p_max_price numeric) TO anon;


--
-- Name: FUNCTION get_search_suggestions(p_q text, p_limit integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.get_search_suggestions(p_q text, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_search_suggestions(p_q text, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_search_suggestions(p_q text, p_limit integer) TO service_role;


--
-- Name: FUNCTION get_user_role(user_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.get_user_role(user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_user_role(user_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user_metadata(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user_metadata() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user_metadata() TO service_role;


--
-- Name: FUNCTION handle_new_user_profile(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user_profile() TO service_role;


--
-- Name: FUNCTION handle_supabase_webhook(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_supabase_webhook() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_supabase_webhook() TO service_role;


--
-- Name: FUNCTION increment_coupon_usage(p_code text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.increment_coupon_usage(p_code text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.increment_coupon_usage(p_code text) TO service_role;


--
-- Name: FUNCTION increment_error_group_count(p_group_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.increment_error_group_count(p_group_id uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_error_group_count(p_group_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_error_group_count(p_group_id uuid) TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;


--
-- Name: FUNCTION is_admin_user(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_admin_user() TO service_role;
GRANT ALL ON FUNCTION public.is_admin_user() TO authenticated;


--
-- Name: FUNCTION is_staff_user(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_staff_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_staff_user() TO service_role;
GRANT ALL ON FUNCTION public.is_staff_user() TO authenticated;


--
-- Name: FUNCTION is_user_admin(user_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_user_admin(user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_user_admin(user_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.is_user_admin(user_id uuid) TO authenticated;


--
-- Name: FUNCTION jwt_role(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.jwt_role() TO anon;
GRANT ALL ON FUNCTION public.jwt_role() TO authenticated;
GRANT ALL ON FUNCTION public.jwt_role() TO service_role;


--
-- Name: FUNCTION jwt_tenant_id(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.jwt_tenant_id() FROM PUBLIC;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO service_role;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO authenticated;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO anon;


--
-- Name: FUNCTION normalize_product_threshold_overrides(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.normalize_product_threshold_overrides() TO anon;
GRANT ALL ON FUNCTION public.normalize_product_threshold_overrides() TO authenticated;
GRANT ALL ON FUNCTION public.normalize_product_threshold_overrides() TO service_role;


--
-- Name: FUNCTION process_order_stock_reduction(p_order_id text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.process_order_stock_reduction(p_order_id text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.process_order_stock_reduction(p_order_id text) TO service_role;


--
-- Name: FUNCTION reverse_inventory_batch(p_batch_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.reverse_inventory_batch(p_batch_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.reverse_inventory_batch(p_batch_id uuid) TO service_role;


--
-- Name: FUNCTION reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer) TO service_role;


--
-- Name: FUNCTION set_order_number(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_order_number() TO anon;
GRANT ALL ON FUNCTION public.set_order_number() TO authenticated;
GRANT ALL ON FUNCTION public.set_order_number() TO service_role;


--
-- Name: FUNCTION set_stock(p_product_id uuid, p_new_qty integer, p_reason text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text) TO service_role;
GRANT ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text) TO authenticated;


--
-- Name: FUNCTION set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid) TO authenticated;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION set_user_admin_role(user_id uuid, new_role text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_user_admin_role(user_id uuid, new_role text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_user_admin_role(user_id uuid, new_role text) TO service_role;
GRANT ALL ON FUNCTION public.set_user_admin_role(user_id uuid, new_role text) TO authenticated;


--
-- Name: FUNCTION set_user_role(user_id uuid, new_role text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_user_role(user_id uuid, new_role text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_user_role(user_id uuid, new_role text) TO service_role;


--
-- Name: FUNCTION sync_payment_status_with_status(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.sync_payment_status_with_status() TO anon;
GRANT ALL ON FUNCTION public.sync_payment_status_with_status() TO authenticated;
GRANT ALL ON FUNCTION public.sync_payment_status_with_status() TO service_role;


--
-- Name: FUNCTION tr_auto_categorize_trigger(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tr_auto_categorize_trigger() TO anon;
GRANT ALL ON FUNCTION public.tr_auto_categorize_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.tr_auto_categorize_trigger() TO service_role;


--
-- Name: FUNCTION update_inventory_settings(p_default_low_stock_threshold integer); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.update_inventory_settings(p_default_low_stock_threshold integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_inventory_settings(p_default_low_stock_threshold integer) TO service_role;


--
-- Name: FUNCTION update_inventory_thresholds(p_default integer, p_reset_overrides boolean); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.update_inventory_thresholds(p_default integer, p_reset_overrides boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_inventory_thresholds(p_default integer, p_reset_overrides boolean) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION update_user_profiles_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_user_profiles_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_user_profiles_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_user_profiles_updated_at() TO service_role;


--
-- Name: FUNCTION user_invoice_profiles_ensure_single_default(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.user_invoice_profiles_ensure_single_default() FROM PUBLIC;
GRANT ALL ON FUNCTION public.user_invoice_profiles_ensure_single_default() TO service_role;


--
-- Name: TABLE admin_audit_log; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.admin_audit_log TO anon;
GRANT ALL ON TABLE public.admin_audit_log TO authenticated;
GRANT ALL ON TABLE public.admin_audit_log TO service_role;


--
-- Name: TABLE user_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;


--
-- Name: TABLE admin_users; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.admin_users TO anon;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.admin_users TO authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;


--
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE category_mapping_rules; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.category_mapping_rules TO anon;
GRANT ALL ON TABLE public.category_mapping_rules TO authenticated;
GRANT ALL ON TABLE public.category_mapping_rules TO service_role;


--
-- Name: TABLE client_errors; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.client_errors TO anon;
GRANT ALL ON TABLE public.client_errors TO authenticated;
GRANT ALL ON TABLE public.client_errors TO service_role;


--
-- Name: TABLE contact_messages; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.contact_messages TO anon;
GRANT ALL ON TABLE public.contact_messages TO authenticated;
GRANT ALL ON TABLE public.contact_messages TO service_role;


--
-- Name: TABLE coupons; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.coupons TO anon;
GRANT ALL ON TABLE public.coupons TO authenticated;
GRANT ALL ON TABLE public.coupons TO service_role;


--
-- Name: TABLE error_groups; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.error_groups TO anon;
GRANT ALL ON TABLE public.error_groups TO authenticated;
GRANT ALL ON TABLE public.error_groups TO service_role;


--
-- Name: TABLE inventory_movements; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.inventory_movements TO anon;
GRANT ALL ON TABLE public.inventory_movements TO authenticated;
GRANT ALL ON TABLE public.inventory_movements TO service_role;


--
-- Name: TABLE inventory_settings; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.inventory_settings TO anon;
GRANT ALL ON TABLE public.inventory_settings TO authenticated;
GRANT ALL ON TABLE public.inventory_settings TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE inventory_summary; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.inventory_summary TO anon;
GRANT ALL ON TABLE public.inventory_summary TO authenticated;
GRANT ALL ON TABLE public.inventory_summary TO service_role;


--
-- Name: TABLE venthub_order_items; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.venthub_order_items TO anon;
GRANT ALL ON TABLE public.venthub_order_items TO authenticated;
GRANT ALL ON TABLE public.venthub_order_items TO service_role;


--
-- Name: TABLE inventory_velocity; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.inventory_velocity TO anon;
GRANT ALL ON TABLE public.inventory_velocity TO authenticated;
GRANT ALL ON TABLE public.inventory_velocity TO service_role;


--
-- Name: TABLE order_attachments; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.order_attachments TO anon;
GRANT ALL ON TABLE public.order_attachments TO authenticated;
GRANT ALL ON TABLE public.order_attachments TO service_role;


--
-- Name: TABLE order_email_events; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.order_email_events TO anon;
GRANT ALL ON TABLE public.order_email_events TO authenticated;
GRANT ALL ON TABLE public.order_email_events TO service_role;


--
-- Name: TABLE order_notes; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.order_notes TO anon;
GRANT ALL ON TABLE public.order_notes TO authenticated;
GRANT ALL ON TABLE public.order_notes TO service_role;


--
-- Name: TABLE order_refund_events; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.order_refund_events TO anon;
GRANT ALL ON TABLE public.order_refund_events TO authenticated;
GRANT ALL ON TABLE public.order_refund_events TO service_role;


--
-- Name: TABLE organizations; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.organizations TO anon;
GRANT ALL ON TABLE public.organizations TO authenticated;
GRANT ALL ON TABLE public.organizations TO service_role;


--
-- Name: TABLE payment_transactions; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.payment_transactions TO anon;
GRANT ALL ON TABLE public.payment_transactions TO authenticated;
GRANT ALL ON TABLE public.payment_transactions TO service_role;


--
-- Name: TABLE price_lists; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.price_lists TO anon;
GRANT ALL ON TABLE public.price_lists TO authenticated;
GRANT ALL ON TABLE public.price_lists TO service_role;


--
-- Name: TABLE product_authorities; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.product_authorities TO anon;
GRANT ALL ON TABLE public.product_authorities TO authenticated;
GRANT ALL ON TABLE public.product_authorities TO service_role;


--
-- Name: TABLE product_images; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;


--
-- Name: TABLE product_prices; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.product_prices TO anon;
GRANT ALL ON TABLE public.product_prices TO authenticated;
GRANT ALL ON TABLE public.product_prices TO service_role;


--
-- Name: TABLE project_items; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.project_items TO anon;
GRANT ALL ON TABLE public.project_items TO authenticated;
GRANT ALL ON TABLE public.project_items TO service_role;


--
-- Name: TABLE rate_limits; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.rate_limits TO anon;
GRANT ALL ON TABLE public.rate_limits TO authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;


--
-- Name: TABLE reserved_orders; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.reserved_orders TO service_role;
GRANT SELECT ON TABLE public.reserved_orders TO authenticated;


--
-- Name: TABLE returns_webhook_events; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.returns_webhook_events TO anon;
GRANT ALL ON TABLE public.returns_webhook_events TO authenticated;
GRANT ALL ON TABLE public.returns_webhook_events TO service_role;


--
-- Name: SEQUENCE returns_webhook_events_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.returns_webhook_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.returns_webhook_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.returns_webhook_events_id_seq TO service_role;


--
-- Name: TABLE shipping_email_events; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.shipping_email_events TO anon;
GRANT ALL ON TABLE public.shipping_email_events TO authenticated;
GRANT ALL ON TABLE public.shipping_email_events TO service_role;


--
-- Name: TABLE shipping_idempotency; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.shipping_idempotency TO anon;
GRANT ALL ON TABLE public.shipping_idempotency TO authenticated;
GRANT ALL ON TABLE public.shipping_idempotency TO service_role;


--
-- Name: TABLE shipping_webhook_events; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.shipping_webhook_events TO anon;
GRANT ALL ON TABLE public.shipping_webhook_events TO authenticated;
GRANT ALL ON TABLE public.shipping_webhook_events TO service_role;


--
-- Name: SEQUENCE shipping_webhook_events_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON SEQUENCE public.shipping_webhook_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.shipping_webhook_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.shipping_webhook_events_id_seq TO service_role;


--
-- Name: TABLE shopping_carts; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.shopping_carts TO anon;
GRANT ALL ON TABLE public.shopping_carts TO authenticated;
GRANT ALL ON TABLE public.shopping_carts TO service_role;


--
-- Name: TABLE site_settings; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.site_settings TO anon;
GRANT ALL ON TABLE public.site_settings TO authenticated;
GRANT ALL ON TABLE public.site_settings TO service_role;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- Name: TABLE user_addresses; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.user_addresses TO anon;
GRANT ALL ON TABLE public.user_addresses TO authenticated;
GRANT ALL ON TABLE public.user_addresses TO service_role;


--
-- Name: TABLE user_invoice_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.user_invoice_profiles TO anon;
GRANT ALL ON TABLE public.user_invoice_profiles TO authenticated;
GRANT ALL ON TABLE public.user_invoice_profiles TO service_role;


--
-- Name: TABLE user_projects; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.user_projects TO anon;
GRANT ALL ON TABLE public.user_projects TO authenticated;
GRANT ALL ON TABLE public.user_projects TO service_role;


--
-- Name: TABLE venthub_returns; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.venthub_returns TO anon;
GRANT ALL ON TABLE public.venthub_returns TO authenticated;
GRANT ALL ON TABLE public.venthub_returns TO service_role;


--
-- Name: TABLE view_admin_orders; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.view_admin_orders TO anon;
GRANT ALL ON TABLE public.view_admin_orders TO authenticated;
GRANT ALL ON TABLE public.view_admin_orders TO service_role;


--
-- Name: TABLE wizard_selections; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.wizard_selections TO anon;
GRANT ALL ON TABLE public.wizard_selections TO authenticated;
GRANT ALL ON TABLE public.wizard_selections TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

