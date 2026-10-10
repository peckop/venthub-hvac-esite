


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "archive_pre_kademe2";


ALTER SCHEMA "archive_pre_kademe2" OWNER TO "postgres";


COMMENT ON SCHEMA "archive_pre_kademe2" IS 'Kademe-2 öncesi (2026-08-11) legacy ürün/sipariş anlık görüntüsü. Salt-arşiv; API''ye açık değil. Fiyat motoru çapraz-kontrolünden sonra düşürülebilir.';



CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgroonga" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contact_department" AS ENUM (
    'sales',
    'support',
    'consulting'
);


ALTER TYPE "public"."contact_department" OWNER TO "postgres";


CREATE TYPE "public"."contact_status" AS ENUM (
    'new',
    'read',
    'archived'
);


ALTER TYPE "public"."contact_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_normalize_rls_expr"("expr" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public', 'pg_temp'
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


ALTER FUNCTION "public"."_normalize_rls_expr"("expr" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_quote_published_enqueue"("p_quote_id" "uuid", "p_zorunlu" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_bayrak text;
  v_url    text;
  v_sir    text;
begin
  select decrypted_secret into v_bayrak from vault.decrypted_secrets
   where name = 'quote_published_webhook_enabled' limit 1;
  if v_bayrak is distinct from 'on' then
    if p_zorunlu then
      raise exception 'yayim e-postasi kapali (quote_published_webhook_enabled != on) — gonderilmedi'
        using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] bayrak kapali — yayim bildirimi ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  select decrypted_secret into v_sir from vault.decrypted_secrets where name = 'quote_webhook_secret' limit 1;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'quote_webhook_url' limit 1;
  if coalesce(v_sir, '') = '' or coalesce(v_url, '') = '' then
    if p_zorunlu then
      raise exception 'Vault kaydi eksik (quote_webhook_secret/url) — gonderilmedi' using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] Vault kaydi eksik — bildirim ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  -- Gövde YALNIZ olay + kimlik: kişisel veri taşımaz, Edge satırı kendisi okur.
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('event', 'quote_published', 'quote_id', p_quote_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_sir,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  );
  return true;
end;
$$;


ALTER FUNCTION "public"."_quote_published_enqueue"("p_quote_id" "uuid", "p_zorunlu" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
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


ALTER FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
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


ALTER FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjust_stock_v2"("p_product_id" "uuid", "p_delta" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = COALESCE(stock_qty, 0) + p_delta,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;


ALTER FUNCTION "public"."adjust_stock_v2"("p_product_id" "uuid", "p_delta" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: allow admins/moderators/super_admin/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin','super_admin')
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


ALTER FUNCTION "public"."admin_list_all_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_list_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: allow admins/moderators/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin')
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
  WHERE up.role IN ('admin','moderator','super_admin')
  ORDER BY up.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."admin_list_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
declare
  v_tenant   uuid := public.jwt_tenant_id();
  v_currency text := upper(trim(coalesce(p_currency, '')));
  v_before   jsonb;
  v_no       text;
  v_sent     timestamptz;
  v_toplam   numeric;
begin
  if not public.is_admin_user() then
    raise exception 'yetkisiz: teklif yayimlama admin gerektirir'
      using errcode = '42501';
  end if;

  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'gecersiz para birimi: % (uc harfli ISO kodu bekleniyor)', p_currency
      using errcode = 'P0001';
  end if;

  -- Cetvel §6: "gelecekte olsun" NOT NULL'dan daha sıkı ve bilerek eklendi.
  if p_valid_until is null or p_valid_until <= now() then
    raise exception 'gecersiz gecerlilik tarihi: gelecekte bir zaman olmali'
      using errcode = 'P0001';
  end if;

  -- Tenant süzgeci OKUMADA da uygulanır (DEFINER RLS'i atlar).
  select to_jsonb(q) into v_before
  from public.venthub_quotes q
  where q.id = p_quote_id and q.tenant_id = v_tenant;

  if v_before is null then
    raise exception 'teklif bulunamadi ya da baska bir kiraciya ait'
      using errcode = 'P0001';
  end if;

  if v_before ->> 'status' is distinct from 'draft' then
    raise exception 'yayim yalniz taslak tekliften yapilir (mevcut durum: %)',
      v_before ->> 'status'
      using errcode = 'P0001';
  end if;

  -- ÜÇÜ TEK İFADEDE: yayım kapısı satırın SON hâline bakar. Numara/damga/toplam BEFORE tetiğinden
  -- (trg_stamp_quote_published) gelir; RETURNING tetiğin yazdığı son hâli okur.
  update public.venthub_quotes
     set status      = 'quoted',
         valid_until = p_valid_until,
         currency    = v_currency
   where id = p_quote_id and tenant_id = v_tenant
  returning quote_no, sent_at, total_amount into v_no, v_sent, v_toplam;

  if not found then
    raise exception 'yayim yazilamadi (satir eslesmedi)' using errcode = 'P0001';
  end if;

  -- DENETİM GÖVDEDE, yazmayla AYNI transaction'da (CLAUDE.md #11).
  insert into public.admin_audit_log
    (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(),
    'venthub_quotes',
    p_quote_id::text,
    'UPDATE',
    jsonb_build_object(
      'status',       v_before ->> 'status',
      'valid_until',  v_before ->> 'valid_until',
      'currency',     v_before ->> 'currency',
      'quote_no',     v_before ->> 'quote_no',
      'sent_at',      v_before ->> 'sent_at',
      'total_amount', v_before ->> 'total_amount'
    ),
    jsonb_build_object(
      'status',       'quoted',
      'valid_until',  p_valid_until,
      'currency',     v_currency,
      'quote_no',     v_no,
      'sent_at',      v_sent,
      'total_amount', v_toplam
    ),
    'admin_publish_quote',
    v_tenant
  );
end;
$_$;


ALTER FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") IS 'REC-54/E5 Faz 1: taslak teklifi yayimlar (draft -> quoted). Uc alani TEK ifadede yazar cunku yayim kapisi satirin son haline bakar. Yetki gövdede, denetim ayni transaction''da.';



CREATE OR REPLACE FUNCTION "public"."admin_resend_quote_published"("p_quote_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_tenant uuid := public.jwt_tenant_id();
  v_durum  text;
  v_gitti  timestamptz;
begin
  if not public.is_admin_user() then
    raise exception 'yetkisiz: yeniden gonderim admin gerektirir' using errcode = '42501';
  end if;

  -- Satır kilidi: eşzamanlı iki çağrı sıraya girer, tavan kontrolü ikisinde de doğru okur.
  select status, published_email_sent_at into v_durum, v_gitti
    from public.venthub_quotes
   where id = p_quote_id and tenant_id = v_tenant
     for update;

  if v_durum is null then
    raise exception 'teklif bulunamadi ya da baska bir kiraciya ait' using errcode = 'P0001';
  end if;
  if v_durum <> 'quoted' then
    raise exception 'yeniden gonderim yalniz yayimlanmis teklife (mevcut durum: %)', v_durum using errcode = 'P0001';
  end if;
  if v_gitti is not null then
    raise exception 'yayim e-postasi zaten gonderildi (%)', v_gitti using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.admin_audit_log
     where row_pk = p_quote_id::text
       and comment = 'admin_resend_quote_published'
       and at > now() - interval '15 minutes'
  ) then
    raise exception 'ayni teklif icin 15 dakika icinde ikinci yeniden gonderim reddedildi' using errcode = 'P0001';
  end if;

  -- Bayrak kapalıysa HATA (admin "gitti" sanmasın).
  perform public._quote_published_enqueue(p_quote_id, true);

  insert into public.admin_audit_log
    (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(), 'venthub_quotes', p_quote_id::text, 'UPDATE',
    jsonb_build_object('published_email_sent_at', null),
    jsonb_build_object('yeniden_gonderim', 'kuyruga_alindi'),
    'admin_resend_quote_published', v_tenant
  );
end;
$$;


ALTER FUNCTION "public"."admin_resend_quote_published"("p_quote_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_search_products"("p_q" "text", "p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0, "p_category_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "name" "text", "sku" "text", "model_code" "text", "brand" "text", "status" "text", "category_id" "uuid", "price" numeric, "purchase_price" numeric, "stock_qty" integer, "low_stock_threshold" integer, "is_featured" boolean, "slug" "text", "rank" real, "total_count" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  v_limit int;
  v_offset int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
begin
  v_limit  := least(greatest(p_limit, 1), 200);
  v_offset := greatest(p_offset, 0);
  v_raw    := coalesce(trim(p_q), '');
  v_raw_wildcard := replace(v_raw, ' ', '%');

  -- Empty query → return empty (caller should use normal Supabase query)
  if v_raw = '' then
    return;
  end if;

  v_tsq := plainto_tsquery('turkish', v_raw);

  return query
  with matched as (
    select
      p.id, p.name, p.sku, p.model_code, p.brand,
      p.status, p.category_id, p.price,
      -- REC-140 Faz 2-DB: products.purchase_price DEĞİL, product_costs (RLS: yalnız admin; diğeri NULL).
      c.purchase_price,
      p.stock_qty, p.low_stock_threshold, p.is_featured, p.slug,
      ts_rank(
        to_tsvector('turkish',
          coalesce(p.name,'') || ' ' ||
          coalesce(p.model_code,'') || ' ' ||
          coalesce(p.sku,'') || ' ' ||
          coalesce(p.brand,'') || ' ' ||
          coalesce(p.description_i18n->>'tr','') || ' ' ||
          coalesce(p.technical_specs::text,'')
        ),
        v_tsq
      ) as rank
    from public.products p
    left join public.product_costs c on c.product_id = p.id
    where (
      p.name ilike '%' || v_raw_wildcard || '%'
      or p.model_code ilike '%' || v_raw_wildcard || '%'
      or p.sku ilike '%' || v_raw_wildcard || '%'
      or p.brand ilike '%' || v_raw_wildcard || '%'
      or p.slug ilike '%' || v_raw_wildcard || '%'
      or p.technical_specs::text ilike '%' || v_raw || '%'
      or to_tsvector('turkish',
           coalesce(p.name,'') || ' ' ||
           coalesce(p.model_code,'') || ' ' ||
           coalesce(p.sku,'') || ' ' ||
           coalesce(p.brand,'') || ' ' ||
           coalesce(p.description_i18n->>'tr','') || ' ' ||
           coalesce(p.technical_specs::text,'')
         ) @@ v_tsq
    )
    and (p_category_id is null or p.category_id = p_category_id)
  )
  select
    m.id, m.name, m.sku, m.model_code, m.brand,
    m.status, m.category_id, m.price, m.purchase_price,
    m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug,
    m.rank,
    count(*) over() as total_count
  from matched m
  order by m.rank desc nulls last, m.name asc
  limit v_limit
  offset v_offset;
end;
$$;


ALTER FUNCTION "public"."admin_search_products"("p_q" "text", "p_limit" integer, "p_offset" integer, "p_category_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid" DEFAULT NULL::"uuid", "p_dry_run" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_retention_years int := 10;   -- VUK/TTK · legal.ts retentionOrders ile aynı olmalı
  v_cutoff timestamptz := now() - make_interval(years => v_retention_years);
  v_email text;
  v_rapor jsonb;
  v_saklanan int;
  v_anonim_siparis int;
  v_adres int; v_fatura_profil int; v_sepet int; v_proje int; v_sihirbaz int; v_iletisim int;
begin
  if p_user_id is null then
    raise exception 'p_user_id zorunlu';
  end if;

  -- Yetki: bu fonksiyon SECURITY DEFINER'dır, kapı gövdededir.
  if not public.is_admin_user() then
    raise exception 'forbidden: yalnız yönetici anonimleştirebilir';
  end if;

  select email into v_email from auth.users where id = p_user_id;

  -- Saklama yükümlülüğü ALTINDAKİ siparişler: ELLENMEZ.
  select count(*) into v_saklanan
  from public.venthub_orders
  where user_id = p_user_id and created_at >= v_cutoff;

  -- Saklama süresi DOLMUŞ siparişler: kişisel alanlar anonimleştirilir; tutar, tarih ve
  -- kalemler KORUNUR — muhasebe gerçeği silinmez, yalnız kişiyle bağı koparılır.
  select count(*) into v_anonim_siparis
  from public.venthub_orders
  where user_id = p_user_id and created_at < v_cutoff;

  select count(*) into v_adres from public.user_addresses where user_id = p_user_id;
  select count(*) into v_fatura_profil from public.user_invoice_profiles where user_id = p_user_id;
  select count(*) into v_sepet from public.shopping_carts where user_id = p_user_id;
  select count(*) into v_proje from public.user_projects where user_id = p_user_id;
  select count(*) into v_sihirbaz from public.wizard_selections where user_id = p_user_id;
  select count(*) into v_iletisim from public.contact_messages
   where v_email is not null and lower(email) = lower(v_email);

  v_rapor := jsonb_build_object(
    'user_id', p_user_id,
    'dry_run', p_dry_run,
    'silinen', jsonb_build_object(
      'user_addresses', v_adres,
      'user_invoice_profiles', v_fatura_profil,
      'shopping_carts', v_sepet,
      'user_projects', v_proje,
      'wizard_selections', v_sihirbaz
    ),
    'anonimlestirilen', jsonb_build_object(
      'user_profiles', 1,
      'contact_messages', v_iletisim,
      'venthub_orders', v_anonim_siparis
    ),
    'saklanan', jsonb_build_object(
      'venthub_orders', v_saklanan,
      'sebep', format('VUK/TTK saklama yükümlülüğü — %s yıl', v_retention_years),
      'cutoff', v_cutoff
    )
  );

  if p_dry_run then
    return v_rapor || jsonb_build_object('uygulandi', false);
  end if;

  -- ── Saklama yükümlülüğü OLMAYAN veri: silinir ────────────────────────────
  delete from public.user_addresses where user_id = p_user_id;
  delete from public.user_invoice_profiles where user_id = p_user_id;
  delete from public.shopping_carts where user_id = p_user_id;  -- cart_items CASCADE
  delete from public.user_projects where user_id = p_user_id;
  delete from public.wizard_selections where user_id = p_user_id;

  -- ── Kalması gereken kayıtlarda kişisel alanlar ────────────────────────────
  update public.user_profiles
     set full_name = null, phone = null, updated_at = now()
   where id = p_user_id;

  if v_email is not null then
    -- `email` ve `name` NOT NULL (2026-08-16'da prod şemasından doğrulandı) — NULL'a
    -- ÇEKİLEMEZ. İlk yazımı `email = null` idi ve migration temiz uygulanırdı; hata
    -- ancak ilk gerçek KVKK talebinde ortaya çıkardı. Bu yüzden kimliksizleştirici
    -- sabit bir değer yazılıyor; satır kimliği ekleniyor ki farklı kişilerin mesajları
    -- aynı adreste birleşip "tek kişi" gibi görünmesin.
    update public.contact_messages
       set name = '[ANONİMLEŞTİRİLDİ]',
           email = 'anonim+' || id::text || '@kvkk.local',
           phone = null,
           ip_address = null
     where lower(email) = lower(v_email);
  end if;

  -- ── Saklama süresi DOLMUŞ siparişler ──────────────────────────────────────
  update public.venthub_orders
     set customer_name  = '[ANONİMLEŞTİRİLDİ]',
         customer_email = null,
         customer_phone = null,
         shipping_address = jsonb_build_object('anonim', true),
         billing_address  = jsonb_build_object('anonim', true),
         invoice_info     = jsonb_build_object('anonim', true),
         updated_at = now()
   where user_id = p_user_id and created_at < v_cutoff;

  insert into public.admin_audit_log (actor, table_name, row_pk, action, after, comment)
  values (
    auth.uid(), 'data_subject_requests', coalesce(p_request_id::text, p_user_id::text),
    'anonymize', v_rapor,
    'KVKK anonimleştirme — saklama yükümlülüğü altındaki siparişler korundu'
  );

  if p_request_id is not null then
    update public.data_subject_requests
       set status = 'completed',
           completed_at = now(),
           handled_by = auth.uid(),
           retained_data_note = case
             when v_saklanan > 0 then format(
               '%s adet sipariş/fatura kaydı, VUK/TTK %s yıllık saklama yükümlülüğü nedeniyle '
               || 'silinmemiştir. Süre dolduğunda anonimleştirilir.', v_saklanan, v_retention_years)
             else null end,
           updated_at = now()
     where id = p_request_id;
  end if;

  return v_rapor || jsonb_build_object('uygulandi', true);
end;
$$;


ALTER FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid", "p_dry_run" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid", "p_dry_run" boolean) IS 'KVKK silme talebi: saklama yükümlülüğü olmayan veriyi siler, sipariş/fatura kaydını korur. Varsayılan KURU ÇALIŞMA — uygulamak için p_dry_run => false.';



CREATE OR REPLACE FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
  select count(*)::int
    from unnest(tsvector_to_array(to_tsvector('turkish', public.arama_normalize(p_q)))) k
   where k = any (tsvector_to_array(to_tsvector('turkish', public.arama_normalize(p_ad_metni))))
$$;


ALTER FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
  select string_agg(
    case when length(k) <= 4 or k ~ '[0-9]'
      then 'arama_kelime @ ' || extensions.pgroonga_escape(k)
      else 'fuzzy_search(arama_kelime, ' || extensions.pgroonga_escape(k)
           || ', {"with_transposition": true, "max_distance": '
           || (case when length(k) = 5 then 1 else 2 end) || '})'
    end, ' && ')
  from unnest(public.arama_kelimeler(p_q)) k
$$;


ALTER FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
  select coalesce(bool_and(
    exists (
      select 1 from unnest(string_to_array(p_govde, ' ')) w
      where w <> '' and length(w) >= 3 and length(k) >= 3
        and left(w,3) = left(k,3)
        and extensions.levenshtein(left(w, length(k)), k)
            <= (case when length(k) <= 4 then 0 when length(k) <= 6 then 1 else 2 end)
    )), false)
  from unnest(public.arama_kelimeler(p_q)) k
$$;


ALTER FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") RETURNS TABLE("product_id" "uuid", "basamak" integer)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
declare
  v_k        text[] := public.arama_kelimeler(p_q);
  v_n        int    := coalesce(array_length(v_k,1), 0);
  v_duzeltme text[];
  v_yeni     text;
  v_var      boolean;
  k          text;
  m          text;
  i          int;
  v_parca    text := '';
  v_sql      text;
  v_esik     int;
begin
  if v_n = 0 then return; end if;

  -- BASAMAK 1 — kesin
  return query
    select psi.product_id, 1
      from public.product_search_index psi
     where psi.arama_ek &` public.arama_kesin_ifade(p_q);
  if found then return; end if;

  -- BASAMAK 21 — marka sözlüğü düzeltmesi
  v_duzeltme := '{}'::text[];
  v_var := false;
  foreach k in array v_k loop
    m := public.arama_marka_es(k);
    if m is not null and m <> k then v_var := true; end if;
    v_duzeltme := v_duzeltme || coalesce(m, k);
  end loop;
  if v_var then
    v_yeni := array_to_string(v_duzeltme, ' ');
    return query
      select psi.product_id, 21
        from public.product_search_index psi
       where psi.arama_ek &` public.arama_kesin_ifade(v_yeni);
    if found then return; end if;
  end if;

  -- BASAMAK 22 — genel yazım hatası (aday + doğrulama)
  return query
    select psi.product_id, 22
      from public.product_search_index psi
     where psi.arama_kelime &` public.arama_bulanik_ifade(p_q)
       and public.arama_dogrula(psi.arama_kelime, p_q);
  if found then return; end if;

  -- BASAMAK 23 — bitişik yazım ("jetfan" → "jet fan")
  if v_n = 1 and length(v_k[1]) >= 6 then
    for i in 3..(length(v_k[1]) - 3) loop
      v_yeni := left(v_k[1], i) || ' ' || substr(v_k[1], i + 1);
      return query
        select psi.product_id, 23
          from public.product_search_index psi
         where psi.arama_ek &` public.arama_kesin_ifade(v_yeni);
      if found then return; end if;
    end loop;
  end if;

  -- BASAMAK 3 — esnek: kelimelerin tamamı değil, çoğu
  -- ⚠UNION ALL + having: `&\`` boolean bağlamda kullanılamadığı için toplama yapılamıyor.
  if v_n >= 2 then
    foreach k in array v_k loop
      v_parca := v_parca || (case when v_parca = '' then '' else ' union all ' end)
        || format('select psi.product_id from public.product_search_index psi where psi.arama_ek &%s %L',
                  '`', 'arama_ek @ ' || extensions.pgroonga_escape(k));
    end loop;
    for v_esik in reverse (v_n - 1) .. greatest(1, (v_n + 1) / 2) loop
      v_sql := format(
        'select t.product_id, 3 from (%s) t group by t.product_id having count(*) >= %s',
        v_parca, v_esik);
      return query execute v_sql;
      if found then return; end if;
    end loop;
  end if;
end;
$$;


ALTER FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_indeksi_tazele"("p_ids" "uuid"[] DEFAULT NULL::"uuid"[]) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  v_sayi integer;
begin
  insert into public.product_search_index
    (product_id, tenant_id, search_body, search_document, updated_at)
  select
    p.id,
    p.tenant_id,
    -- search_body: kimlik + açıklama (technical_specs HARİÇ, yukarıda gerekçeli)
    concat_ws(' ',
      p.name,
      p.name_i18n->>'tr',  p.name_i18n->>'en',
      p.model_code, p.sku, p.brand,
      f.name, f.name_i18n->>'tr', f.name_i18n->>'en',
      c.name, sc.name,
      p.description_i18n->>'tr', p.description_i18n->>'en'
    ),
    -- search_document: ağırlıklı. Varsayılan ts_rank dizisi {D,C,B,A}={0.1,0.2,0.4,1.0}.
      setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), '')), 'A')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        p.model_code, p.sku, p.brand), '')), 'B')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        f.name, f.name_i18n->>'tr', f.name_i18n->>'en'), '')), 'C')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        c.name, sc.name,
        p.description_i18n->>'tr', p.description_i18n->>'en',
        p.technical_specs::text), '')), 'D'),
    now()
  from public.products p
  left join public.product_families f
    on f.id = p.family_id
   and f.deleted_at is null
   and f.tenant_id = p.tenant_id          -- ⛔tenant sınırı (kural 12)
  left join public.categories c
    on c.id = p.category_id
   and c.tenant_id = p.tenant_id          -- ⛔tenant sınırı (kural 12)
  left join public.categories sc
    on sc.id = p.subcategory_id
   and sc.tenant_id = p.tenant_id         -- ⛔tenant sınırı (kural 12)
  where p_ids is null or p.id = any(p_ids)
  on conflict (product_id) do update
    set tenant_id       = excluded.tenant_id,
        search_body     = excluded.search_body,
        search_document = excluded.search_document,
        updated_at      = now();

  get diagnostics v_sayi = row_count;
  return v_sayi;
end;
$$;


ALTER FUNCTION "public"."arama_indeksi_tazele"("p_ids" "uuid"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."arama_indeksi_tazele"("p_ids" "uuid"[]) IS 'REC-340 Adim 2: verilen urunlerin (NULL ise HEPSININ) arama govdesini yeniden uretir. SECURITY DEFINER — tenant siniri JOIN sartinda ELLE yazili (plan section 6).';



CREATE OR REPLACE FUNCTION "public"."arama_kelimeler"("p_q" "text") RETURNS "text"[]
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
  select coalesce(array_agg(k), '{}'::text[])
  from unnest(string_to_array(public.arama_normalize(p_q), ' ')) k
  where k <> ''
$$;


ALTER FUNCTION "public"."arama_kelimeler"("p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_kesin_ifade"("p_q" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
  select string_agg('arama_ek @ ' || extensions.pgroonga_escape(k), ' && ')
  from unnest(public.arama_kelimeler(p_q)) k
$$;


ALTER FUNCTION "public"."arama_kesin_ifade"("p_q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_kuyrugu_bosalt"("p_tavan" integer DEFAULT 5000) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  v_ids   uuid[];
  v_sayi  integer := 0;
begin
  -- Kuyruktan alınan satırlar AYNI işlemde silinir; `for update skip locked` iki cron
  -- koşumunun çakışmasını engeller (pg_cron bir işi gecikirse üst üste binebilir).
  with alinan as (
    delete from public.search_reindex_queue q
     where q.id in (
       select id from public.search_reindex_queue
        order by id
        limit greatest(p_tavan, 1)
        for update skip locked
     )
    returning q.kapsam, q.ref_id
  )
  select array_agg(distinct p.id)
    into v_ids
    from alinan a
    join public.products p
      on (a.kapsam = 'urun'     and p.id             = a.ref_id)
      or (a.kapsam = 'aile'     and p.family_id      = a.ref_id)
      or (a.kapsam = 'kategori' and (p.category_id   = a.ref_id
                                  or p.subcategory_id = a.ref_id));

  if v_ids is null or cardinality(v_ids) = 0 then
    return 0;
  end if;

  v_sayi := public.arama_indeksi_tazele(v_ids);
  return v_sayi;
end;
$$;


ALTER FUNCTION "public"."arama_kuyrugu_bosalt"("p_tavan" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."arama_kuyrugu_bosalt"("p_tavan" integer) IS 'REC-340 Adim 2: kuyrugu bosaltip etkilenen urunlerin arama govdesini tazeler. pg_cron kosar.';



CREATE OR REPLACE FUNCTION "public"."arama_marka_es"("p_k" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
  select m from unnest(public.arama_marka_kelimeleri()) m
  where extensions.levenshtein(m, p_k) <= (case when length(p_k) <= 4 then 1 else 2 end)
  order by extensions.levenshtein(m, p_k)
  limit 1
$$;


ALTER FUNCTION "public"."arama_marka_es"("p_k" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_marka_kelimeleri"() RETURNS "text"[]
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
  select coalesce(array_agg(distinct k), '{}'::text[])
  from public.brands b,
       unnest(string_to_array(public.arama_normalize(b.name), ' ')) k
  where k <> '' and length(k) >= 3
$$;


ALTER FUNCTION "public"."arama_marka_kelimeleri"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."arama_normalize"("p_t" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
  select replace(
           translate(lower(translate(coalesce(p_t,''), 'İ', 'i')),
                     'ıİşŞğĞüÜöÖçÇâîû', 'iisSgGuUoOcCaiu'),
           chr(775), '')
$$;


ALTER FUNCTION "public"."arama_normalize"("p_t" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bump_rate_limit"("p_key" "text", "p_limit" integer, "p_window_seconds" integer) RETURNS TABLE("allowed" boolean, "remaining" integer, "reset_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
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


ALTER FUNCTION "public"."bump_rate_limit"("p_key" "text", "p_limit" integer, "p_window_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_servis  boolean := (current_user = 'service_role');
  v_user    uuid;
  v_tenant  uuid;
  v_kalem   int;
  v_quote   uuid;
begin
  if p_quote is null or jsonb_typeof(p_quote) <> 'object' then
    raise exception 'teklif basligi nesne olmali' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'teklif en az bir kalem icermeli' using errcode = '22023';
  end if;
  v_kalem := jsonb_array_length(p_items);

  if v_servis then
    v_tenant := nullif(p_quote ->> 'tenant_id', '')::uuid;
    if v_tenant is null then
      raise exception 'misafir teklifinde tenant_id zorunlu' using errcode = '22023';
    end if;
    v_user := null;
    if v_kalem > 50 then
      raise exception 'kalem sayisi siniri asildi (%/50)', v_kalem using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(p_items) e
       where coalesce(nullif(e ->> 'qty', '')::int, 0) not between 1 and 9999
    ) then
      raise exception 'adet 1..9999 araliginda olmali' using errcode = '22023';
    end if;
  else
    v_user := auth.uid();
    if v_user is null then
      raise exception 'oturum yok: teklif talebi kimlik gerektirir' using errcode = '42501';
    end if;
    v_tenant := public.jwt_tenant_id();
  end if;

  insert into public.venthub_quotes
    (tenant_id, user_id, contact_name, contact_email, contact_phone, source, source_project_id)
  values (
    v_tenant,
    v_user,
    p_quote ->> 'contact_name',
    p_quote ->> 'contact_email',
    p_quote ->> 'contact_phone',
    p_quote ->> 'source',
    nullif(p_quote ->> 'source_project_id', '')::uuid
  )
  returning id into v_quote;

  insert into public.venthub_quote_items (quote_id, tenant_id, product_id, product_name, qty, note)
  select v_quote,
         v_tenant,
         (e ->> 'product_id')::uuid,
         e ->> 'product_name',
         (e ->> 'qty')::int,
         nullif(e ->> 'note', '')
    from jsonb_array_elements(p_items) e;

  return v_quote;
end;
$$;


ALTER FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") IS 'REC-295: teklif basligi + kalemleri tek transaction. SECURITY INVOKER (RLS yururlukte). Dal: current_user=service_role (misafir, tenant zorunlu, 1..50 kalem) / authenticated (user_id=auth.uid()). Kalemsiz cagri reddedilir.';



CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
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


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."denetim_izi_yaz"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_eski   jsonb;
  v_yeni   jsonb;
  v_pk     text;
  v_tenant uuid;
  v_before jsonb;
  v_after  jsonb;
  v_anahtar text;
begin
  v_eski := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_yeni := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;

  -- Satır kimliği ve tenant, kolon ADIYLA değil JSONB üzerinden okunur: olmayan alan
  -- hatası doğmaz (yukarıdaki sapma notu).
  v_pk     := coalesce(v_yeni->>'id', v_eski->>'id');
  v_tenant := nullif(coalesce(v_yeni->>'tenant_id', v_eski->>'tenant_id'), '')::uuid;

  if tg_op = 'UPDATE' then
    -- NO-OP UPDATE ELEMESİ. `ON CONFLICT DO UPDATE` satır fiilen değişmese de tetiği
    -- ateşler; `updated_at` de her dokunuşta değişir. İkisi elenmezse tablo kendi
    -- gürültüsüyle dolar ve ev geleneğinin dersi gerçekleşir: OKUNMAYAN ALARM ALARM DEĞİLDİR.
    v_before := '{}'::jsonb;
    v_after  := '{}'::jsonb;
    for v_anahtar in select jsonb_object_keys(v_yeni)
    loop
      if v_anahtar not in ('updated_at') and (v_yeni->v_anahtar) is distinct from (v_eski->v_anahtar) then
        v_before := v_before || jsonb_build_object(v_anahtar, v_eski->v_anahtar);
        v_after  := v_after  || jsonb_build_object(v_anahtar, v_yeni->v_anahtar);
      end if;
    end loop;

    -- Anlamlı değişiklik yoksa satır YAZILMAZ. Bu bir fail-open DEĞİL: yazılacak bir
    -- olgu yok, dolayısıyla kaybedilen bir kanıt da yok.
    if v_after = '{}'::jsonb then
      return new;
    end if;
  else
    -- INSERT/DELETE'te tam satır tutulur: "ne eklendi / ne silindi" sorusunun cevabı
    -- satırın kendisidir, kolon farkı değil.
    v_before := v_eski;
    v_after  := v_yeni;
  end if;

  -- ⛔EXCEPTION BLOĞU YOK — fail-closed, kasıtlı (yukarıdaki H1 notu).
  if v_tenant is null then
    -- tenant_id kolonu OLMAYAN tablo (bugün: site_settings). Kolon INSERT'ten çıkarılır ve
    -- NOT NULL DEFAULT devreye girer. Sabit UUID BURAYA YAZILMAZ: aynı sabiti ikinci bir
    -- yere kopyalamak, iki yerin ayrışması demektir.
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user
        || ' | tenant DAMGASI VARSAYILANDIR (tabloda tenant_id yok)'
    );
  else
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user,
      v_tenant
    );
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;


ALTER FUNCTION "public"."denetim_izi_yaz"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."denetim_izi_yaz"() IS 'REC-292: DML denetim izi. FAIL-CLOSED (exception blogu YOK, kasitli). tenant ve id JSONB uzerinden okunur, kolon adiyla DEGIL: olmayan alan hatasi dogmaz. TRUNCATE bu tetigi ATESLEMEZ (ayri kayit).';



CREATE OR REPLACE FUNCTION "public"."jwt_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
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


ALTER FUNCTION "public"."jwt_tenant_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "brand" "text" NOT NULL,
    "price" numeric(10,2) DEFAULT 0.00,
    "sku" "text" NOT NULL,
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "technical_specs" "jsonb",
    "stock_qty" integer DEFAULT 0,
    "low_stock_threshold" integer DEFAULT 10,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "low_stock_override" boolean DEFAULT false NOT NULL,
    "purchase_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "slug" "text",
    "model_code" "text",
    "warehouse_location" "text",
    "supplier_name" "text",
    "family_id" "uuid",
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "purchase_currency" character varying(3) DEFAULT 'TRY'::character varying NOT NULL,
    "barcode" "text",
    "tax_rate" numeric(5,2) DEFAULT 20.00 NOT NULL,
    "is_taxable" boolean DEFAULT true NOT NULL,
    "weight_kg" numeric(10,3),
    "width_mm" numeric(10,1),
    "height_mm" numeric(10,1),
    "depth_mm" numeric(10,1),
    "deleted_at" timestamp with time zone,
    "description_i18n" "jsonb",
    "purchase_rate_to_base" numeric(18,6),
    "cost_in_base" numeric(14,4),
    "last_purchase_cost" numeric,
    "last_purchase_currency" character(3),
    "last_purchased_at" timestamp with time zone,
    "name_i18n" "jsonb",
    CONSTRAINT "products_last_purchase_cost_check" CHECK (("last_purchase_cost" >= (0)::numeric)),
    CONSTRAINT "products_purchase_price_nonneg" CHECK (("purchase_price" >= (0)::numeric)),
    CONSTRAINT "products_sku_adres_ayirici_yok" CHECK (("sku" !~* '(^p-|-p-)'::"text")),
    CONSTRAINT "products_sku_format_check" CHECK (("sku" ~ '^[A-Z0-9-]+$'::"text")),
    CONSTRAINT "products_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'draft'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."model_code" IS 'Distributor/Manufacturer model code (MPN). Display on PDP as Model; fallback to SKU if null.';



COMMENT ON COLUMN "public"."products"."purchase_rate_to_base" IS 'Alış anı TCMB kuru (snapshot). İlk backfill = backfill günü Efektif Satış; gerçek alım-anı kuru T010 Satınalma ile gelecek.';



COMMENT ON COLUMN "public"."products"."cost_in_base" IS 'Donmuş TL maliyet = purchase_price × purchase_rate_to_base (purchase_currency=TRY ise kur 1).';



CREATE OR REPLACE FUNCTION "public"."display_price"("p" "public"."products") RETURNS numeric
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  select case
           when pl.user_type = 'individual' then pp.gross_price
           else pp.net_price
         end
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
   where pp.product_id = p.id
     and pp.is_active = true
     and pp.currency = 'TRY'
   order by (pl.user_type = public.jwt_price_segment()) desc,  -- önce kendi segmentin
            (pl.user_type = 'individual') desc,                -- sonra herkese açık liste
            pp.valid_from desc
   limit 1
$$;


ALTER FUNCTION "public"."display_price"("p" "public"."products") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."display_price"("p" "public"."products") IS 'Vitrin fiyatı (PostgREST computed column): motor cache''inden çağıranın segmentine uygun satır. Bireysel/anon → brüt (KDV dahil), bayi/kurumsal → net. Fiyat yoksa NULL → "Teklif Alın".';



CREATE OR REPLACE FUNCTION "public"."display_price_tax_included"("p" "public"."products") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  select public.jwt_price_segment() = 'individual'
$$;


ALTER FUNCTION "public"."display_price_tax_included"("p" "public"."products") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."display_price_tax_included"("p" "public"."products") IS 'display_price KDV dahil mi? (bireysel/anon = true). Satır parametresi PostgREST computed column sözleşmesi gereği; değer segmentten türer.';



CREATE OR REPLACE FUNCTION "public"."enforce_invoice_only_for_paid_order"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  odeme text;
BEGIN
  SELECT payment_status INTO odeme
  FROM public.venthub_orders WHERE id = NEW.order_id;

  IF odeme IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION
      'Faturalandirma yalnizca odemesi tamamlanmis siparis icin yapilabilir (siparis odeme durumu: %). Cetvel: legal-compliance-standard 2.3',
      COALESCE(odeme, 'YOK');
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_invoice_only_for_paid_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_quote_status_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  izinli boolean := false;
begin
  -- GİRİŞ KİLİDİ (§4 "GİRİŞLER") — belge yalnız iki kapıdan doğar.
  -- #828'in dersi: kapı yalnız UPDATE'e yazılırsa INSERT yolu kapısız kalır ve
  -- RLS'i atlayan bir bağlam (service_role, betik) belgeyi istediği durumda var eder.
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'requested') then
      raise exception 'giris kilidi: teklif yalnizca draft ya da requested olarak acilabilir (denenen: %)', new.status
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  if old.status = new.status then
    return new;
  end if;

  -- İZİNLİ GEÇİŞLER — SSOT aynası (yukarıdaki sözdizimi sözleşmesine tabi)
  if old.status = 'requested' and new.status in ('draft', 'rejected') then
    izinli := true;
  end if;
  if old.status = 'draft' and new.status in ('quoted', 'cancelled') then
    izinli := true;
  end if;
  if old.status = 'quoted' and new.status in ('accepted', 'rejected', 'expired', 'superseded', 'cancelled') then
    izinli := true;
  end if;
  if old.status = 'accepted' and new.status in ('converted') then
    izinli := true;
  end if;

  if not izinli then
    raise exception 'gecersiz teklif durum gecisi: % -> %', old.status, new.status
      using errcode = 'P0001';
  end if;

  -- ⭐ MUHATAP KİLİDİ (§2.5 / §15 R15) — haritanın ÜSTÜNDE ikinci şart.
  -- Hesapsız belge hazırlanır, iletilir, iptal edilir; ama ONAY yönüne yürüyemez.
  -- Ekranda kabul düğmesini gizlemek ÜÇÜNCÜ kapıdır ve tek başına sayılmaz.
  if new.status in ('accepted', 'converted') and new.user_id is null then
    raise exception 'muhatap kilidi: hesapsiz teklif % durumuna gecemez (cetvel §2.5)', new.status
      using errcode = 'P0001';
  end if;

  -- YAYIM KAPISI (§6, §15 R10) — süresiz ya da para birimsiz belge yayımlanamaz.
  -- currency'nin kolon düzeyinde NOT NULL olmamasının karşılığı budur (S2 sapması).
  if new.status = 'quoted' and (new.valid_until is null or new.currency is null) then
    raise exception 'yayim kapisi: draft -> quoted icin valid_until ve currency zorunlu (cetvel §6/R10)'
      using errcode = 'P0001';
  end if;

  -- DÖNÜŞÜM KAPISI (§10) — köprü V1.1'dir ve bu sürümde YOK. Sipariş üretmeyen bir
  -- 'converted' damgası belgeyi yalancı yapar ve converted_order_id UNIQUE bunu
  -- ENGELLEMEZ (NULL'lar tekillik saymaz). Kapı köprü inene kadar fiilen kapalıdır.
  if new.status = 'converted' and new.converted_order_id is null then
    raise exception 'donusum kapisi: converted_order_id olmadan converted yazilamaz (cetvel §10)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_quote_status_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  aktor text;
  ayricalikli boolean;
begin
  -- Hedef rol whitelist'i. ARTIK INSERT'te de koşar (eski sürümde yalnız UPDATE'te vardı).
  if new.role not in ('user','moderator','admin','super_admin','warehouse','sales','viewer') then
    raise exception 'invalid role %', new.role;
  end if;

  -- Rol değişmiyorsa karışma: ad/telefon güncellemeleri ve ON CONFLICT DO UPDATE
  -- (handle_new_user_profile) serbest kalsın.
  if tg_op = 'UPDATE' and new.role is not distinct from old.role then
    return new;
  end if;

  ayricalikli := new.role in ('admin','super_admin');

  -- ============================ OTURUMSUZ BAĞLAM ============================
  -- NİÇİN VAR: profil satırını auth.users üzerindeki trg_handle_new_user_profile
  -- OTURUMSUZ yaratır (auth.uid() NULL); sağlama/göç betikleri de service_role ile koşar.
  --
  -- ÖNCEKİ TASLAK BU DALI KOŞULSUZ SERBEST BIRAKIYORDU. Ölçüm bunun GEREKMEDİĞİNİ
  -- gösterdi: handle_new_user_profile rolü zorla ayrıcalıksız yapıyor —
  --   IF NOT (auth.role()='service_role' OR is_admin_user()) THEN role_val := 'user'
  -- yani sıradan kayıtta rol DAİMA ayrıcalıksız. Dolayısıyla dal, "her oturumsuz bağlam
  -- serbest" olmak zorunda değil; yalnız AYRICALIKLI yazımlar için gevşetilir.
  if auth.uid() is null or coalesce(auth.role(), '') = 'service_role' then

    -- Sıradan kayıt (ayrıcalıksız rol): sessizce geçer, İZ YAZILMAZ.
    -- Niçin iz yok: her signup'a bir denetim satırı yazmak, asıl sinyali (oturumsuz bir
    -- ayrıcalıklı yazım) gürültüde boğar. Okunmayan alarm alarm değildir.
    if not ayricalikli then
      return new;
    end if;

    -- Ayrıcalıklı rol, oturumsuz bağlamda: YALNIZ service_role.
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'oturumsuz baglamda ayricalikli rol atanamaz (%)', new.role;
    end if;

    -- service_role ile ayrıcalıklı yazım: GEÇER, ama iz bırakır.
    --
    -- ⚠ BU İZİN YAZILABİLMESİ, YAZILMAMIŞ BİR ÖZELLİĞE BAĞLI — adıyla yazıyorum:
    -- admin_audit_log RLS AÇIK (rowsecurity=true) ama force=false ve tablo sahibi postgres.
    -- Bu fonksiyon SECURITY DEFINER/owner=postgres olduğu için sahip RLS'i ATLAR ve INSERT
    -- geçer. INSERT politikası ((tenant_id = jwt_tenant_id()) AND is_admin_user()) oturumsuz
    -- bağlamda YANLIŞ'tır. Biri admin_audit_log'a FORCE ROW LEVEL SECURITY verirse bu alarm
    -- SESSİZCE ölür — çünkü aşağıdaki exception guard hatayı WARNING'e indirir.
    -- Kalıcı çözüm bu migration'da değil, bekçi kaleminde.
    --
    -- NİÇİN exception ile sarılı: denetim yazımı patlarsa KAYIT/GÖÇ AKIŞI KIRILMAMALI.
    -- Alarm, korumaya çalıştığı şeyi bozarsa net zarar üretir.
    begin
      insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
      values (
        auth.uid(),                       -- NULL olabilir: kolon nullable, kasıtlı
        'user_profiles',
        new.id::text,
        case when tg_op = 'INSERT' then 'role_insert_service_role' else 'role_change_service_role' end,
        case when tg_op = 'UPDATE' then jsonb_build_object('role', old.role) else null end,
        jsonb_build_object('role', new.role),
        'service_role ile ayricalikli rol yazimi: auth.uid()=' || coalesce(auth.uid()::text, 'NULL'),
        new.tenant_id
      );
    exception when others then
      raise warning 'enforce_role_change: denetim yazimi basarisiz (% - %), rol degisikligi DEVAM ETTI', sqlstate, sqlerrm;
    end;

    return new;
  end if;
  -- ========================== /OTURUMSUZ BAĞLAM ============================

  select role into aktor from public.user_profiles where id = auth.uid();

  -- Kendi rolünü değiştirme: yalnız super_admin (ESKİ KURAL KORUNDU)
  if new.id = auth.uid() and aktor is distinct from 'super_admin' then
    raise exception 'not authorized to change own role';
  end if;

  -- YENİ: super_admin'e YÜKSELTMEYİ yalnız super_admin yapar (hedef kim olursa olsun)
  if new.role = 'super_admin' and aktor is distinct from 'super_admin' then
    raise exception 'only super_admin can grant super_admin';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_role_change"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venthub_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "shipping_method" "text" DEFAULT 'standard'::"text",
    "shipping_address" "jsonb" NOT NULL,
    "billing_address" "jsonb" NOT NULL,
    "invoice_profile" "jsonb",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "conversation_id" "text",
    "shipping_carrier" "text",
    "shipping_tracking_number" "text",
    "shipped_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_name" "text",
    "customer_email" "text",
    "carrier" "text",
    "tracking_url" "text",
    "subtotal_snapshot" numeric(10,2),
    "legal_consents" "jsonb",
    "invoice_type" "text",
    "invoice_info" "jsonb",
    "payment_token" "text",
    "customer_phone" "text",
    "tracking_number" "text",
    "payment_debug" "jsonb",
    "coupon_code" "text",
    "coupon_discount" numeric DEFAULT 0,
    "locale" "text" DEFAULT 'tr'::"text",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "paid_at" timestamp with time zone,
    "paid_email_sent_at" timestamp with time zone,
    "currency" "text" DEFAULT 'TRY'::"text" NOT NULL,
    CONSTRAINT "venthub_orders_coupon_discount_check" CHECK (("coupon_discount" >= (0)::numeric)),
    CONSTRAINT "venthub_orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text", 'partial_refunded'::"text"]))),
    CONSTRAINT "venthub_orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."venthub_orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."venthub_orders" IS 'Payment system fixed on 2025-09-03 - all required columns added | @graphql({"disabled": true})';



COMMENT ON COLUMN "public"."venthub_orders"."status" IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled';



COMMENT ON COLUMN "public"."venthub_orders"."payment_status" IS 'Payment status: pending, paid, failed, refunded';



COMMENT ON COLUMN "public"."venthub_orders"."paid_at" IS 'Odemenin onaylandigi an (T137-VH). shipped_at/delivered_at ile simetrik. Yalniz payment_status paid OLMAYAN bir degerden paid a GECERKEN, ILK KEZ damgalanir.';



COMMENT ON COLUMN "public"."venthub_orders"."paid_email_sent_at" IS 'IDEMPOTANS ANAHTARI (T137-VH): odeme onayi e-postasinin GONDERILDIGI an. NULL = henuz gonderilmedi. Yalniz gonderim BASARILI olduktan sonra damgalanir; uc gondermeden ONCE buraya bakar. paid_at ile KARISTIRILMAMALI: biri ticari olgu, bu bildirim olgusu.';



COMMENT ON COLUMN "public"."venthub_orders"."currency" IS 'Siparisin islem para birimi (ISO 4217). ADIM-1de DEFAULT TRY tasir; ADIM-2de varsayilan dusurulur ve yazici acikca gonderir. Cetvel: docs/standards/payment-ledger-standard.md';



CREATE OR REPLACE FUNCTION "public"."fn_admin_get_orders"("p_id" "text" DEFAULT NULL::"text", "p_conv" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 10) RETURNS SETOF "public"."venthub_orders"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select *
  from venthub_orders
  where (p_id is null or id = p_id::uuid)
    and (p_conv is null or conversation_id = p_conv)
    and (p_status is null or status = p_status)
  order by created_at desc
  limit coalesce(p_limit, 10);
$$;


ALTER FUNCTION "public"."fn_admin_get_orders"("p_id" "text", "p_conv" "text", "p_status" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_admin_update_order_status"("p_id" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_conv" "text" DEFAULT NULL::"text") RETURNS "public"."venthub_orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."fn_admin_update_order_status"("p_id" "text", "p_status" "text", "p_conv" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_enrich_product_specs"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
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


ALTER FUNCTION "public"."fn_enrich_product_specs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fts_search_products"("p_q" "text", "p_limit" integer DEFAULT 20, "p_filters" "jsonb" DEFAULT '{}'::"jsonb") RETURNS TABLE("id" "uuid", "name" "text", "sku" "text", "brand" "text", "price" numeric, "rank" real, "family_slug" "text", "cover_image_path" "text")
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
declare
  v_limit int;
  v_tsq   tsquery;
begin
  -- Tavan 500: kapı betiği geniş vakalarda GERÇEK sayıyı okuyabilsin diye (istemci 20 yollar).
  v_limit := least(greatest(p_limit, 1), 500);
  v_tsq   := plainto_tsquery('turkish', coalesce(p_q,''));

  return query
  select s.id, s.name, s.sku, s.brand, s.price,
         (s.metin_rank - (s.basamak::real / 100.0::real))::real as rank,   -- anlamı eskisiyle aynı
         s.family_slug, s.cover_image_path
    from (
      select p.id, p.name, p.sku, p.brand,
             public.display_price(p) as price,          -- INV-PRICE-1: ham p.price DEĞİL
             e.basamak,
             public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), p_q) as ad_isabet,
             ts_rank(psi.search_document, v_tsq) as metin_rank,
             f.slug as family_slug,
             img.path as cover_image_path
        from public.arama_eslesen_urunler(p_q) e
        join public.products p on p.id = e.product_id
        join public.product_search_index psi on psi.product_id = p.id
        left join public.product_families f
          on f.id = p.family_id and f.deleted_at is null
        left join lateral (
          select pi.path from public.product_images pi
           where pi.product_id = p.id
           order by pi.sort_order
           limit 1
        ) img on true
       where (
           (not (p_filters ? 'category_id'))
           or p.category_id = (p_filters->>'category_id')::uuid
           or p.subcategory_id = (p_filters->>'category_id')::uuid
         )
         and p.status = 'active'
         and p.deleted_at is null
    ) s
   -- K3.1e: sıra açık sütunlarla. Öneri kutusu AYNI dört anahtarı kullanır.
   order by s.basamak asc, s.ad_isabet desc, s.metin_rank desc, s.name asc
   limit v_limit;
end;
$$;


ALTER FUNCTION "public"."fts_search_products"("p_q" "text", "p_limit" integer, "p_filters" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS character varying
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  bugun date;
  sira  integer;
BEGIN
  -- Gün sınırı işletmenin günü: Europe/Istanbul (bkz. başlıktaki gerekçe).
  bugun := (now() AT TIME ZONE 'Europe/Istanbul')::date;

  -- Tek ifadede oku-artır-döndür: iki eşzamanlı çağrı satır kilidinde sıraya girer,
  -- ikisi de FARKLI değer alır. Artış çağıranın işlemi içindedir → boşluksuz.
  INSERT INTO public.order_number_counters AS c (gun, son_no)
       VALUES (bugun, 1)
  ON CONFLICT (gun) DO UPDATE SET son_no = c.son_no + 1
    RETURNING c.son_no INTO sira;

  -- Taşma ADIYLA: 4 hane 9999 siparişe yeter. Aşılırsa SESSİZCE bozuk numara
  -- üretmek yerine gürültülü şekilde dur — biçim genişletme kararı insana aittir.
  IF sira > 9999 THEN
    RAISE EXCEPTION
      'REC-156: gunluk siparis numarasi tasti (% > 9999, gun %). Bicim genisletilmeli.',
      sira, bugun
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN 'VH-' || to_char(bugun, 'YYYYMMDD') || '-' || lpad(sira::text, 4, '0');
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_order_number"() IS 'REC-156: VH-YYYYMMDD-NNNN; NNNN = o günün sıra sayacı (yarış-güvenli, boşluksuz). Eski saat-tabanlı sürüm: generate_order_number_saat_tabanli_20260906.';



CREATE OR REPLACE FUNCTION "public"."generate_order_number_saat_tabanli_20260906"() RETURNS character varying
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
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


ALTER FUNCTION "public"."generate_order_number_saat_tabanli_20260906"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_users"() RETURNS TABLE("id" "uuid", "email" character varying, "created_at" timestamp with time zone, "role" "text", "full_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin','super_admin','super_admin')
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


ALTER FUNCTION "public"."get_admin_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_counts"() RETURNS TABLE("category_id" "uuid", "product_count" integer)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  SELECT c.id AS category_id,
         COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::int AS product_count
  FROM public.categories c
  LEFT JOIN public.products p
    ON p.category_id = c.id
       OR p.subcategory_id = c.id
       OR p.category_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
       OR p.subcategory_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
  GROUP BY c.id;
$$;


ALTER FUNCTION "public"."get_category_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) RETURNS TABLE("product_id" "uuid", "display_price" numeric, "tax_included" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  select p.id,
         public.display_price(p),
         public.jwt_price_segment() = 'individual'
    from public.products p
   where p.id = any(coalesce(p_product_ids, array[]::uuid[]))
$$;


ALTER FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) IS 'Ürün kimliklerine göre vitrin fiyatı + KDV semantiği (tipli toplu okuma). display_price(products) ile AYNI kaynağı kullanır — TS tarafında ikinci hesap yolu yoktur.';



CREATE OR REPLACE FUNCTION "public"."get_family_detail"("p_slug" "text", "p_lang" "text" DEFAULT 'tr'::"text") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with lang as (
    select case when p_lang in ('tr', 'en') then p_lang else 'tr' end as v
  )
  select jsonb_build_object(
    'family', jsonb_build_object(
      'id', f.id,
      'name', f.name,
      'slug', f.slug,
      'series_code', f.series_code,
      'description', f.description,
      'brand_name', b.name,
      'category_id', f.category_id,
      'subcategory_id', f.subcategory_id,
      'meta_title', f.meta_title,
      'meta_description', f.meta_description
    ),
    -- W4b: gösterilen fiyatların KDV semantiği (bireysel/anon = KDV dahil)
    'price_tax_included', (public.jwt_price_segment() = 'individual'),
    'variants', (
      select coalesce(jsonb_agg(v.item order by v.sku), '[]'::jsonb)
        from (
          select p.sku,
                 jsonb_build_object(
                   'id', p.id,
                   'sku', p.sku,
                   'name', p.name,
                   'slug', p.slug,
                   'model_code', p.model_code,
                   -- W4b: ham p.price DEĞİL, motor fiyatı (INV-PRICE-1)
                   'price', public.display_price(p),
                   'stock_qty', p.stock_qty,
                   'technical_specs', p.technical_specs,
                   -- Genel açıklama: varyantın kendi dili yoksa aile açıklamasına düşer
                   'description', coalesce(
                     p.description_i18n ->> (select v from lang),
                     f.description ->> (select v from lang)
                   ),
                   'images', (
                     select coalesce(
                       jsonb_agg(jsonb_build_object(
                         'path', pi.path, 'alt', pi.alt, 'sort_order', pi.sort_order
                       ) order by pi.sort_order),
                       '[]'::jsonb
                     )
                     from product_images pi
                     where pi.product_id = p.id
                   )
                 ) as item
            from products p
           where p.family_id = f.id
             and p.status = 'active' and p.deleted_at is null
        ) v
    )
  )
    from product_families f
    join brands b on b.id = f.brand_id
   where f.slug = p_slug and f.deleted_at is null
   limit 1  -- UNIQUE (tenant_id, slug) — global tekil değil (B15)
$$;


ALTER FUNCTION "public"."get_family_detail"("p_slug" "text", "p_lang" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_families_enriched"("p_category_ids" "uuid"[] DEFAULT NULL::"uuid"[], "p_limit" integer DEFAULT 24, "p_offset" integer DEFAULT 0, "p_search_query" "text" DEFAULT NULL::"text", "p_brand" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "series_code" "text", "description" "jsonb", "brand_name" "text", "category_id" "uuid", "subcategory_id" "uuid", "cover_image_path" "text", "variant_count" bigint, "min_price" numeric, "total_count" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description,
           b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order,
           count(p.id) as variant_count,
           -- W4b: ham p.price DEĞİL, motor cache'inden türetilmiş vitrin fiyatı (INV-PRICE-1)
           min(public.display_price(p)) as min_price
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
     group by f.id, f.name, f.slug, f.series_code, f.description,
              b.name, f.category_id, f.subcategory_id, f.sort_order
  )
  select fam.id, fam.name, fam.slug, fam.series_code, fam.description,
         fam.brand_name, fam.category_id, fam.subcategory_id,
         cov.path as cover_image_path,
         fam.variant_count, fam.min_price,
         count(*) over () as total_count
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
$$;


ALTER FUNCTION "public"."get_product_families_enriched"("p_category_ids" "uuid"[], "p_limit" integer, "p_offset" integer, "p_search_query" "text", "p_brand" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_search_suggestions"("p_q" "text", "p_limit" integer DEFAULT 6) RETURNS TABLE("type" "text", "label" "text", "url" "text", "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'public', 'extensions'
    AS $$
declare
  v_limit int;
  v_raw   text;
  v_norm  text;
begin
  v_limit := least(greatest(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  if v_raw = '' then return; end if;
  v_norm  := public.arama_normalize(v_raw);

  return query
  (
    -- Ürünler (en çok 4) — TEK gövdeden, fts_search_products ile AYNI sıra (K3.1e).
    -- Eski ek anahtarlar (ad-önek eşleşmesi, is_featured) kaldırıldı: iki yüzey farklı ilk ürünü
    -- gösteriyordu (gölgede `kanal tipi fan`: liste Vortice, öneri AVENS ile başlıyordu).
    select 'product'::text,
           p.name::text,
           (case
              when f.slug is not null and p.sku is not null then '/products/' || f.slug || '?sku=' || p.sku
              when f.slug is not null then '/products/' || f.slug
              when p.slug is not null then '/products/' || p.slug
              else '/products/' || p.id::text
            end)::text,
           jsonb_build_object(
             'sku', p.sku,
             'brand', coalesce(p.brand, ''),
             'model_code', coalesce(p.model_code, ''),
             'family_slug', f.slug)
      from public.arama_eslesen_urunler(v_raw) e
      join public.products p on p.id = e.product_id
      join public.product_search_index psi on psi.product_id = p.id
      left join public.product_families f on f.id = p.family_id and f.deleted_at is null
     where p.status = 'active' and p.deleted_at is null
     order by e.basamak,
              public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), v_raw) desc,
              ts_rank(psi.search_document, plainto_tsquery('turkish', v_raw)) desc,
              p.name
     limit least(v_limit, 4)
  )
  union all
  (
    -- Kategoriler (en çok 2) — aksan/TR körlüğü burada da uygulanır
    select 'category'::text, c.name::text, ('/category/' || c.slug)::text,
           jsonb_build_object('level', c.level, 'slug', c.metadata->'slug')
      from public.categories c
     where c.is_active = true
       and public.arama_normalize(c.name) like '%' || replace(v_norm,' ','%') || '%'
     order by c.level, c.name
     limit 2
  )
  union all
  (
    select distinct on (p.brand)
           'brand'::text, p.brand::text, ('/products?brand=' || p.brand)::text, jsonb_build_object()
      from public.products p
     where p.status = 'active' and p.deleted_at is null and p.brand is not null
       and public.arama_normalize(p.brand) like '%' || replace(v_norm,' ','%') || '%'
     order by p.brand
     limit 2
  )
  limit v_limit;
end;
$$;


ALTER FUNCTION "public"."get_search_suggestions"("p_q" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
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


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_role"("user_id" "uuid") IS 'Kullanıcının rolünü getirir';



CREATE OR REPLACE FUNCTION "public"."handle_new_user_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
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


ALTER FUNCTION "public"."handle_new_user_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
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


ALTER FUNCTION "public"."handle_new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_supabase_webhook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'net', 'vault'
    AS $$
    DECLARE
      payload jsonb;
      webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
      webhook_secret text;
      req_id bigint;
    BEGIN
      -- Sır artık gövdede DEĞİL (T031-VH): düz metin, public repo geçmişinden
      -- okunabiliyordu. Vault'tan okunur; SECURITY DEFINER olduğu için erişim var.
      SELECT decrypted_secret INTO webhook_secret
      FROM vault.decrypted_secrets
      WHERE name = 'supabase_webhook_secret'
      LIMIT 1;

      -- Sır yoksa webhook ATLANIR ama tetiğin asıl işi (veri yazımı) ENGELLENMEZ.
      -- Burada exception atmak, ürün güncellemesinin tamamını düşürürdü: önbellek
      -- tazeleme kaybı, veri kaybından iyidir. Sessiz kalmaması için WARNING
      -- Postgres günlüğüne düşer. (Bu dala düşmek için birinin Vault kaydını
      -- silmesi gerekir — migration taşımayı fail-closed yapar.)
      IF webhook_secret IS NULL OR webhook_secret = '' THEN
        RAISE WARNING '[handle_supabase_webhook] Vault sirri "supabase_webhook_secret" YOK — webhook atlandi, sayfa yenileme yapilmadi (tablo: %)', TG_TABLE_NAME;
        RETURN NEW;
      END IF;

      payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
      );

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


ALTER FUNCTION "public"."handle_supabase_webhook"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_coupon_usage"("p_code" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_code
    AND (usage_limit IS NULL OR used_count < usage_limit);
END;
$$;


ALTER FUNCTION "public"."increment_coupon_usage"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") RETURNS "void"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  UPDATE public.error_groups
  SET count = count + 1,
      last_seen = now()
  WHERE id = p_group_id;
$$;


ALTER FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") IS 'Atomically increments error_groups.count and updates last_seen for the given group id.';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_claim"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- service_role tüm kontrolleri atlar (is_admin_user ile aynı davranış).
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  IF claims IS NULL THEN
    -- JWT yok (tetik/betik bağlamı): claim-only okuyucu TABLOYA DÜŞMEZ — düşerse döngü geri gelir.
    -- Bu bağlamda yetki kararı zaten `is_admin_user()`ın işi, o değişmedi.
    RETURN FALSE;
  END IF;

  -- YALNIZ hook kaynaklı dallar. `user_metadata` BİLEREK YOK — kullanıcı yazabilir
  -- (CLAUDE.md kural 12). Bu satırı eklemek INV-AUTH-ROLE R1'i kırar.
  user_role := COALESCE(
    claims ->> 'user_role',
    claims -> 'app_metadata' ->> 'user_role'
  );

  -- ⚠COALESCE ŞART: `NULL IN (...)` NULL döner. Claim varken `user_role` yoksa fonksiyon NULL
  -- döndürüyordu (2026-09-18 gölgede ölçüldü). Politika bağlamında NULL "izin yok" gibi davranır,
  -- yani zararsız görünür; ama fonksiyon üçlü mantık döndürdüğü an her yeni çağıran yerde
  -- "false mı null mı" sorusu yeniden doğar. Karar mercii üç değerli olmaz.
  RETURN COALESCE(user_role IN ('admin', 'super_admin'), FALSE);
END;
$$;


ALTER FUNCTION "public"."is_admin_claim"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"() RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- service_role tüm kontrolleri atlar
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;

  IF claims IS NOT NULL THEN
    -- YALNIZ hook kaynaklı dallar. `user_metadata` BİLEREK YOK — kullanıcı yazabilir
    -- (CLAUDE.md kural 12). Bu satırı geri eklemek INV-AUTH-ROLE R1'i kırar.
    user_role := COALESCE(
      claims ->> 'user_role',
      claims -> 'app_metadata' ->> 'user_role'
    );
    IF user_role IS NOT NULL THEN
      RETURN user_role IN ('admin', 'super_admin');
    END IF;
  END IF;

  -- JWT yoksa (tetik/betik bağlamı) profil tablosuna düş
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin','super_admin')
  );
END;
$$;


ALTER FUNCTION "public"."is_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_user"() RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$;


ALTER FUNCTION "public"."is_staff_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role IN ('admin','super_admin')
  );
END;
$$;


ALTER FUNCTION "public"."is_user_admin"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_user_admin"("user_id" "uuid") IS 'Kullanıcının admin olup olmadığını kontrol eder';



CREATE OR REPLACE FUNCTION "public"."jwt_price_segment"() RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  with claims as (
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb -> 'app_metadata' as md
  )
  select coalesce(
    (select case when md ->> 'price_segment' in ('dealer', 'corporate') then md ->> 'price_segment' end from claims),
    (select case when md ->> 'user_role' in ('dealer', 'corporate') then md ->> 'user_role' end from claims),
    'individual'
  )
$$;


ALTER FUNCTION "public"."jwt_price_segment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_product_threshold_overrides"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
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


ALTER FUNCTION "public"."normalize_product_threshold_overrides"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_order_paid"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'vault'
    AS $$
declare
  webhook_url text;
  webhook_secret text;
  req_id bigint;
begin
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ: fonksiyon
  -- gövdesi `pg_proc`'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_order_paid] Vault kaydi eksik (order_paid_webhook_secret/url) — bildirim ATLANDI, siparis %s odeme kaydi korundu', new.id;
    return new;
  end if;

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazılır; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('order_id', new.id, 'tenant_id', new.tenant_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  ) into req_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_order_paid"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_quote_published"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  perform public._quote_published_enqueue(new.id, false);
  return new;
end;
$$;


ALTER FUNCTION "public"."notify_quote_published"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_quote_request_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'vault'
    AS $$
declare
  webhook_url text;
  webhook_secret text;
  req_id bigint;
begin
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ:
  -- fonksiyon gövdesi pg_proc'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'quote_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'quote_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_quote_request_created] Vault kaydi eksik (quote_webhook_secret/url) — bildirim ATLANDI, teklif kaydi %s korundu', new.id;
    return new;
  end if;

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazıldı; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('quote_id', new.id, 'record', to_jsonb(new)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  ) into req_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_quote_request_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_goods_receipt"("p_po_id" "uuid", "p_document_no" "text", "p_lines" "jsonb", "p_note" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
declare
  v_po record;
  v_line record;
  v_poi record;
  v_receipt_id uuid;
  v_cost numeric;
  v_processed int := 0;
  v_units int := 0;
  v_total_ordered int;
  v_total_received int;
  v_new_status text;
begin
  -- Yetki kapisi: adjust_stock / process_order_stock_restore ile BIREBIR AYNI desen.
  -- user_profiles.role mesru kaynak: trg_enforce_role_change kullanicinin kendi rolunu
  -- degistirmesini engelliyor (olculdu 2026-08-15, T052 migration'indaki gerekce).
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin', 'warehouse', 'moderator')
  )) then
    raise exception 'not authorized';
  end if;

  if p_document_no is null or btrim(p_document_no) = '' then
    return jsonb_build_object('success', false, 'error', 'document_no required', 'processed_count', 0);
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    return jsonb_build_object('success', false, 'error', 'lines must be a non-empty array', 'processed_count', 0);
  end if;

  -- PO'yu kilitle: es zamanli iki kabul ayni kalan-miktari iki kez kullanamasin
  -- (restore RPC'sindeki FOR UPDATE dersi — kilitsiz hesap-idempotensi yarisa aciktir).
  select * into v_po from public.purchase_orders where id = p_po_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'PO not found', 'processed_count', 0);
  end if;

  -- Tenant kapisi (kural 12): tarayici JWT'siyle gelen cagri baska tenant'in PO'suna
  -- dokunamaz. service_role sunucu tarafidir, kapsam disidir.
  if coalesce(auth.role(), '') <> 'service_role'
     and v_po.tenant_id is distinct from public.jwt_tenant_id() then
    raise exception 'not authorized';
  end if;

  -- Durum kapisi: kabul yalniz ordered / partially_received uzerinde (cetvel §3).
  if v_po.status not in ('ordered', 'partially_received') then
    return jsonb_build_object(
      'success', false,
      'error', 'PO not receivable in status ' || v_po.status,
      'processed_count', 0
    );
  end if;

  -- ---- DOGRULAMA TURU (hicbir yazma yok) ----
  -- Ayni urun p_lines'ta iki kez gecemez: tek tek dogrulama toplami goremezdi;
  -- tavan asimini DB CHECK yakalardi ama zarif zarf yerine exception olurdu.
  if exists (
    select 1 from jsonb_array_elements(p_lines) elem
    group by elem->>'product_id' having count(*) > 1
  ) then
    return jsonb_build_object('success', false, 'error', 'duplicate product in lines', 'processed_count', 0);
  end if;

  for v_line in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'qty')::int         as qty,
      (elem->>'unit_cost')::numeric as unit_cost
    from jsonb_array_elements(p_lines) elem
  loop
    if v_line.product_id is null or v_line.qty is null or v_line.qty <= 0 then
      return jsonb_build_object('success', false, 'error', 'invalid line (product_id/qty)', 'processed_count', 0);
    end if;
    if v_line.unit_cost is not null and v_line.unit_cost < 0 then
      return jsonb_build_object('success', false, 'error', 'invalid line (negative unit_cost)', 'processed_count', 0);
    end if;

    select * into v_poi
    from public.purchase_order_items
    where po_id = p_po_id and product_id = v_line.product_id
    for update;
    if not found then
      return jsonb_build_object('success', false, 'error', 'product not on PO: ' || v_line.product_id, 'processed_count', 0);
    end if;

    -- Asiri kabul yasak (cetvel §4) — DB CHECK'i ikinci kilit, burasi anlasilir mesaj.
    if v_poi.qty_received + v_line.qty > v_poi.qty_ordered then
      return jsonb_build_object(
        'success', false,
        'error', 'over-receipt for product ' || v_line.product_id
                 || ' (received ' || v_poi.qty_received || ' + ' || v_line.qty
                 || ' > ordered ' || v_poi.qty_ordered || ')',
        'processed_count', 0
      );
    end if;
  end loop;

  -- ---- YAZMA TURU ----
  -- Idempotens birinci kilidi: ayni irsaliye no ikinci kez gelirse UNIQUE reddeder.
  begin
    insert into public.goods_receipts (tenant_id, po_id, document_no, received_by, note)
    values (v_po.tenant_id, p_po_id, btrim(p_document_no), auth.uid(), p_note)
    returning id into v_receipt_id;
  exception when unique_violation then
    return jsonb_build_object(
      'success', false,
      'error', 'document_no already processed for this PO (idempotent reject)',
      'processed_count', 0
    );
  end;

  for v_line in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'qty')::int         as qty,
      (elem->>'unit_cost')::numeric as unit_cost
    from jsonb_array_elements(p_lines) elem
  loop
    select * into v_poi
    from public.purchase_order_items
    where po_id = p_po_id and product_id = v_line.product_id;

    -- Fatura farki girildiyse onu, girilmediyse PO satiri snapshot'ini kullan (cetvel §5.1).
    v_cost := coalesce(v_line.unit_cost, v_poi.unit_cost);

    update public.products
      set stock_qty = coalesce(stock_qty, 0) + v_line.qty,
          last_purchase_cost = v_cost,
          last_purchase_currency = v_poi.currency,
          last_purchased_at = now()
      where id = v_line.product_id;

    -- KANIT SATIRI (cetvel §4): stok girisi ancak bu satirla var olur.
    insert into public.inventory_movements
      (product_id, delta, reason, unit_cost, unit_cost_currency, goods_receipt_id)
    values
      (v_line.product_id, v_line.qty, 'purchase_receipt', v_cost, v_poi.currency, v_receipt_id);

    update public.purchase_order_items
      set qty_received = qty_received + v_line.qty
      where id = v_poi.id;

    v_processed := v_processed + 1;
    v_units := v_units + v_line.qty;
  end loop;

  -- Statu TURETME (cetvel §3.2): elle secim yok, miktarlar soyler.
  select sum(qty_ordered), sum(qty_received)
    into v_total_ordered, v_total_received
  from public.purchase_order_items
  where po_id = p_po_id;

  v_new_status := case when v_total_received >= v_total_ordered then 'received' else 'partially_received' end;

  update public.purchase_orders
    set status = v_new_status, updated_at = now()
    where id = p_po_id;

  return jsonb_build_object(
    'success', true,
    'receipt_id', v_receipt_id,
    'processed_count', v_processed,
    'received_units', v_units,
    'po_status', v_new_status
  );
end;
$$;


ALTER FUNCTION "public"."process_goods_receipt"("p_po_id" "uuid", "p_document_no" "text", "p_lines" "jsonb", "p_note" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_order_stock_reduction"("p_order_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
declare
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
begin
  begin
    v_order_uuid := p_order_id::uuid;
  exception when invalid_text_representation then
    return jsonb_build_object('success', false, 'error', 'Invalid order ID format', 'processed_count', 0);
  end;

  -- Satir kilidi: ayni siparis icin ikinci webhook bu islem bitene kadar bekler.
  select exists(
    select 1 from public.venthub_orders
    where id = v_order_uuid
      and status in ('confirmed', 'processing')
      and payment_status = 'paid'
    for update
  ) into v_order_exists;

  if not v_order_exists then
    return jsonb_build_object(
      'success', false,
      'error', 'Order not found or not in a paid/processed state',
      'processed_count', 0
    );
  end if;

  -- Idempotenslik: bu siparis icin zaten `order_sale` hareketi varsa tekrar dusme.
  if exists(
    select 1 from public.inventory_movements
    where (order_id = v_order_uuid or batch_id = v_order_uuid)
      and reason = 'order_sale'
  ) then
    return jsonb_build_object(
      'success', true,
      'message', 'Stock already reduced for this order',
      'processed_count', 0,
      'order_id', p_order_id
    );
  end if;

  for v_item in
    select oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    from public.venthub_order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = v_order_uuid
  loop
    begin
      v_current_stock := coalesce(v_item.stock_qty, 0);

      if v_current_stock >= v_item.quantity then
        perform public.adjust_stock(v_item.product_id, -v_item.quantity, 'order_sale', v_order_uuid);

        -- Hareketi siparise bagla: geri-verme hesabinin KANITI bu satirdir.
        update public.inventory_movements
          set order_id = v_order_uuid
          where batch_id = v_order_uuid
            and product_id = v_item.product_id
            and order_id is null;

        v_processed_count := v_processed_count + 1;
      else
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      end if;

    exception when others then
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || sqlerrm || ')');
    end;
  end loop;

  return jsonb_build_object(
    -- Kismi basarisizlik BASARI DEGILDIR: cagiran taraf damgayi buna gore basar.
    'success', (array_length(v_failed_products, 1) is null),
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );
end;
$$;


ALTER FUNCTION "public"."process_order_stock_reduction"("p_order_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
declare
  v_order_uuid uuid;
  v_item record;
  v_qty int;
  v_restored_count int := 0;
  v_restored_units int := 0;
begin
  -- Yetki kapisi: `public.adjust_stock` ile BIREBIR AYNI. `user_profiles.role` mesru bir
  -- kaynak: `trg_enforce_role_change` kullanicinin KENDI rolunu degistirmesini engelliyor.
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin', 'warehouse', 'moderator')
  )) then
    raise exception 'not authorized';
  end if;

  -- Yazma sebebi sozlugu DEGISMEDI: yeni kayitlar yalniz bu ucunden biriyle yazilir.
  -- `'return'` bilerek burada YOK — okumada sayilir, yazmada kabul edilmez.
  if p_reason is null or p_reason not in ('order_cancel', 'order_refund', 'order_expire') then
    return jsonb_build_object(
      'success', false,
      'error', 'Invalid reason (expected order_cancel|order_refund|order_expire)',
      'restored_count', 0
    );
  end if;

  begin
    v_order_uuid := p_order_id::uuid;
  exception when invalid_text_representation then
    return jsonb_build_object('success', false, 'error', 'Invalid order ID format', 'restored_count', 0);
  end;

  perform 1 from public.venthub_orders where id = v_order_uuid for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Order not found', 'restored_count', 0);
  end if;

  for v_item in
    select
      im.product_id,
      sum(case when im.reason = 'order_sale' then -im.delta else 0 end) as deducted,
      -- 'return' EKLENDI: goc etmemis yollarin izi. Bunu saymamak cift geri-ekleme demek.
      sum(case when im.reason in ('order_cancel', 'order_refund', 'order_expire', 'return')
               then im.delta else 0 end) as restored
    from public.inventory_movements im
    where im.order_id = v_order_uuid
    group by im.product_id
  loop
    v_qty := v_item.deducted - v_item.restored;
    continue when v_qty <= 0;

    update public.products
      set stock_qty = coalesce(stock_qty, 0) + v_qty
      where id = v_item.product_id;

    insert into public.inventory_movements (product_id, order_id, delta, reason)
    values (v_item.product_id, v_order_uuid, v_qty, p_reason);

    v_restored_count := v_restored_count + 1;
    v_restored_units := v_restored_units + v_qty;
  end loop;

  return jsonb_build_object(
    'success', true,
    'restored_count', v_restored_count,
    'restored_units', v_restored_units,
    'reason', p_reason,
    'order_id', p_order_id
  );
end;
$$;


ALTER FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_costs_senkron"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  insert into public.product_costs as c (product_id, tenant_id, purchase_price, purchase_currency,
    purchase_rate_to_base, cost_in_base, last_purchase_cost, last_purchase_currency,
    last_purchased_at, supplier_name, updated_at)
  values (new.id, new.tenant_id, new.purchase_price, new.purchase_currency,
    new.purchase_rate_to_base, new.cost_in_base, new.last_purchase_cost, new.last_purchase_currency,
    new.last_purchased_at, new.supplier_name, now())
  on conflict (product_id) do update set
    tenant_id              = excluded.tenant_id,
    purchase_price         = excluded.purchase_price,
    purchase_currency      = excluded.purchase_currency,
    purchase_rate_to_base  = excluded.purchase_rate_to_base,
    cost_in_base           = excluded.cost_in_base,
    last_purchase_cost     = excluded.last_purchase_cost,
    last_purchase_currency = excluded.last_purchase_currency,
    last_purchased_at      = excluded.last_purchased_at,
    supplier_name          = excluded.supplier_name,
    updated_at             = now();
  return null;
end $$;


ALTER FUNCTION "public"."product_costs_senkron"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_families_single_level_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if new.parent_family_id is not null then
    -- Ebeveynin kendisinin ebeveyni olmamalı (ebeveyn = seri).
    if exists (
      select 1 from public.product_families p
      where p.id = new.parent_family_id and p.parent_family_id is not null
    ) then
      raise exception 'product_families: hiyerarsi TEK SEVIYE (seri -> model); % zaten bir modeldir', new.parent_family_id;
    end if;
  else
    -- Bu satır seri olacaksa, altında model varken ebeveynli hale gelemez (ters yön TG_OP=UPDATE).
    null;
  end if;

  if tg_op = 'UPDATE' and new.parent_family_id is not null and exists (
    select 1 from public.product_families c where c.parent_family_id = new.id
  ) then
    raise exception 'product_families: % satirinin altinda model var, kendisi model yapilamaz', new.id;
  end if;

  return new;
end $$;


ALTER FUNCTION "public"."product_families_single_level_guard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."quote_items_durum_kilidi"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_durum text;
begin
  select status into v_durum from public.venthub_quotes
   where id = case when tg_op = 'DELETE' then old.quote_id else new.quote_id end;
  -- Başlık yoksa (cascade silmede başlık zaten gitmiştir) kilit uygulanmaz.
  if v_durum is not null and v_durum not in ('requested', 'draft') then
    raise exception 'teklif kalemi degistirilemez: belge % durumunda (yalniz requested/draft)', v_durum
      using errcode = 'P0001';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."quote_items_durum_kilidi"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid", "p_max_minutes" integer DEFAULT 30) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
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


ALTER FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid", "p_max_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
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


ALTER FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text", "p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
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


ALTER FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text", "p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin')
  )) then
    raise exception 'not authorized';
  end if;

  if new_role not in ('user','admin','moderator','super_admin','warehouse','sales','viewer') then
    raise exception 'Invalid role: %', new_role;
  end if;

  insert into public.user_profiles (id, role) values (user_id, new_role)
  on conflict (id) do update set role = excluded.role, updated_at = now();

  return true;
end;
$$;


ALTER FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_role"("user_id" "uuid", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role = new_role, updated_at = NOW();
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."set_user_role"("user_id" "uuid", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."stamp_order_paid_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.payment_status = 'paid'
     and (old.payment_status is distinct from 'paid')
     and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."stamp_order_paid_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."stamp_quote_published"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_kalem     int;
  v_fiyatsiz  int;
  v_pb_farkli int;
  v_iskonto   int;
  v_toplam    numeric;
  v_gun       date;
  v_sira      integer;
begin
  -- SUNUCU KAPISI (tüm yollar): istemcideki derivePublishHeader'ın DB aynası.
  select count(*),
         count(*) filter (where unit_price is null),
         count(*) filter (where currency is distinct from new.currency),
         count(*) filter (where coalesce(discount_rate, 0) <> 0),
         round(sum(qty * unit_price), 2)
    into v_kalem, v_fiyatsiz, v_pb_farkli, v_iskonto, v_toplam
    from public.venthub_quote_items
   where quote_id = new.id;

  if v_kalem = 0 then
    raise exception 'yayim reddedildi: teklifin kalemi yok' using errcode = 'P0001';
  end if;
  if v_fiyatsiz > 0 then
    raise exception 'yayim reddedildi: % kalemde fiyat yok', v_fiyatsiz using errcode = 'P0001';
  end if;
  if v_pb_farkli > 0 then
    raise exception 'yayim reddedildi: % kalemin para birimi belge para biriminden (%) farkli', v_pb_farkli, new.currency
      using errcode = 'P0001';
  end if;
  -- İskonto alanı ekranda yazılmıyor ve toplam onu hesaba katmıyor: dolu iskontolu belge yanlış toplamla
  -- müşteriye gitmesin, gürültüyle dursun.
  if v_iskonto > 0 then
    raise exception 'yayim reddedildi: iskontolu kalem henuz desteklenmiyor (% kalem)', v_iskonto
      using errcode = 'P0001';
  end if;

  new.total_amount := v_toplam;          -- §3.1: kalemlerden türetilir, snapshot'lanır (KDV hariç)
  new.sent_at      := now();             -- §12: yayım anı

  -- Numara yalnız kök belgeye (H3) ve bir kez. Anahtar new.tenant_id: service_role yolunda JWT yok.
  if new.amended_from is null and new.quote_no is null then
    v_gun := (now() at time zone 'Europe/Istanbul')::date;
    insert into public.quote_number_counters as c (tenant_id, gun, son_no)
         values (new.tenant_id, v_gun, 1)
    on conflict (tenant_id, gun) do update set son_no = c.son_no + 1
      returning c.son_no into v_sira;
    if v_sira > 9999 then
      raise exception 'REC-384: gunluk teklif numarasi tasti (% > 9999, gun %). Bicim genisletilmeli.', v_sira, v_gun
        using errcode = 'check_violation';
    end if;
    new.quote_no := 'TK-' || to_char(v_gun, 'YYYYMMDD') || '-' || lpad(v_sira::text, 4, '0');
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."stamp_quote_published"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_company" "text" DEFAULT NULL::"text", "p_city" "text" DEFAULT NULL::"text", "p_application_area" "text" DEFAULT NULL::"text", "p_subject" "text" DEFAULT 'web-form'::"text", "p_consent" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
begin
  if p_name is null or btrim(p_name) = '' then
    raise exception 'ad zorunlu' using errcode = '22023';
  end if;
  if p_message is null or btrim(p_message) = '' then
    raise exception 'mesaj zorunlu' using errcode = '22023';
  end if;
  if (p_email is null or btrim(p_email) = '') and (p_phone is null or btrim(p_phone) = '') then
    raise exception 'e-posta ya da telefon zorunlu' using errcode = '22023';
  end if;
  if p_consent is not true then
    raise exception 'kvkk rizasi zorunlu' using errcode = '22023';
  end if;

  insert into public.contact_messages (
    name, email, phone, company, subject, message,
    city, application_area, kvkk_consent, consent_at
  ) values (
    btrim(p_name),
    nullif(btrim(coalesce(p_email, '')), ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_company, '')), ''),
    coalesce(nullif(btrim(coalesce(p_subject, '')), ''), 'web-form'),
    btrim(p_message),
    nullif(btrim(coalesce(p_city, '')), ''),
    nullif(btrim(coalesce(p_application_area, '')), ''),
    true,
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;


ALTER FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) IS 'Musteri-yuzu form gonderiminin TEK yazma kapisi (T104). Dogrulama sunucu tarafinda; id dondurur ki istemci basari ekranini KANITA baglayabilsin. Cetvel: docs/standards/form-submission-standard.md';



CREATE OR REPLACE FUNCTION "public"."sync_payment_status_with_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Yalnizca yasam dongusu 'confirmed' ise ve odeme durumu HENUZ DOLDURULMAMISSA yaz.
  -- Dolu bir deger (paid/failed/refunded/partial_refunded) ASLA ezilmez -- kismi iadeyi
  -- yutan kusur tam olarak buydu (T114-VH).
  IF NEW.status = 'confirmed' AND COALESCE(NEW.payment_status, '') IN ('', 'pending') THEN
    NEW.payment_status := 'paid';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_payment_status_with_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sync_payment_status_with_status"() IS 'Yasam dongusu confirmed olunca BOS/pending odeme durumunu paid yapar. Dolu degeri EZMEZ (T114-VH). status kisiti paid/failed kabul etmedigi icin o dallar kaldirildi.';



CREATE OR REPLACE FUNCTION "public"."tg_arama_aile_kuyrukla"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  insert into public.search_reindex_queue (kapsam, ref_id)
  values ('aile', new.id)
  on conflict (kapsam, ref_id) do nothing;
  return null;
end;
$$;


ALTER FUNCTION "public"."tg_arama_aile_kuyrukla"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_arama_kategori_kuyrukla"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  insert into public.search_reindex_queue (kapsam, ref_id)
  values ('kategori', new.id)
  on conflict (kapsam, ref_id) do nothing;
  return null;
end;
$$;


ALTER FUNCTION "public"."tg_arama_kategori_kuyrukla"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_arama_metin_doldur"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  -- arama_normalize ile BİREBİR aynı ifade (tetik yardımcıya EXECUTE bağımlılığı taşımasın diye gömülü).
  new.arama_ek     := replace(translate(lower(translate(coalesce(new.search_body,''), 'İ', 'i')),
                                        'ıİşŞğĞüÜöÖçÇâîû', 'iisSgGuUoOcCaiu'), chr(775), '');
  new.arama_kelime := new.arama_ek;
  return new;
end;
$$;


ALTER FUNCTION "public"."tg_arama_metin_doldur"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_arama_urun_tazele"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  perform public.arama_indeksi_tazele(array[new.id]);
  return null;  -- AFTER tetiği; dönüş değeri yok sayılır
end;
$$;


ALTER FUNCTION "public"."tg_arama_urun_tazele"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_categories_set_level"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  if new.parent_id is null then
    new.level := 0;
  else
    select c.level + 1 into new.level from public.categories c where c.id = new.parent_id;
    if new.level is null then
      raise exception 'categories level guard: parent % bulunamadı', new.parent_id;
    end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."tg_categories_set_level"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."tg_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_url_takma_ad_yaz"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_sebep text := 'tetik: ' || tg_table_name || ' ' || to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
begin
  -- INSERT'te yalnız "canlı slug önceliği" silmeleri koşar (güvenlik incelemesi bulgu 6: eski adı X
  -- olan bir takma ad varken slug'ı X olan YENİ bir nesne eklenirse takma ad kalkmalı). Eski değer
  -- yazımları yalnız UPDATE'te; boş dize eski değer hiç yazılmaz (bulgu 3 — `eski_slug <> ''`
  -- kısıtına çarpıp admin UPDATE'ini düşürmesin; canlıda boş değer 0, ölçüldü 2026-09-23).
  if tg_table_name = 'products' then
    if tg_op = 'UPDATE' and nullif(old.slug, '') is not null and old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'urun', '*', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if new.slug is not null then
      delete from public.url_takma_adlari
       where tenant_id = new.tenant_id and tur = 'urun' and dil = '*' and eski_slug = lower(new.slug);
    end if;

    if tg_op = 'UPDATE' and nullif(old.sku, '') is not null and old.sku is distinct from new.sku then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'sku', '*', lower(old.sku), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    delete from public.url_takma_adlari
     where tenant_id = new.tenant_id and tur = 'sku' and dil = '*' and eski_slug = lower(new.sku);

  elsif tg_table_name = 'product_families' then
    if tg_op = 'UPDATE' and nullif(old.slug, '') is not null and old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'aile', '*', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    delete from public.url_takma_adlari
     where tenant_id = new.tenant_id and tur = 'aile' and dil = '*' and eski_slug = lower(new.slug);

  elsif tg_table_name = 'categories' then
    -- EN: kanonik `slug` (bugün 31/31 satırda metadata.slug.en ile eşit — ölçüldü 2026-09-23;
    -- ikisi ayrışırsa ikisinin eski değeri de kaydedilir).
    if tg_op = 'UPDATE' and nullif(old.slug, '') is not null and old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'en', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if tg_op = 'UPDATE' and nullif(old.metadata -> 'slug' ->> 'en', '') is not null
       and (old.metadata -> 'slug' ->> 'en') is distinct from (new.metadata -> 'slug' ->> 'en')
       and lower(old.metadata -> 'slug' ->> 'en') is distinct from lower(old.slug) then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'en', lower(old.metadata -> 'slug' ->> 'en'), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if tg_op = 'UPDATE' and nullif(old.metadata -> 'slug' ->> 'tr', '') is not null
       and (old.metadata -> 'slug' ->> 'tr') is distinct from (new.metadata -> 'slug' ->> 'tr') then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'tr', lower(old.metadata -> 'slug' ->> 'tr'), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    -- Canlı slug önceliği, iki dilde.
    delete from public.url_takma_adlari
     where tenant_id = new.tenant_id and tur = 'kategori'
       and ((dil = 'en' and eski_slug in (lower(new.slug), lower(coalesce(new.metadata -> 'slug' ->> 'en', ''))))
         or (dil = 'tr' and eski_slug = lower(coalesce(new.metadata -> 'slug' ->> 'tr', ''))));
  end if;

  -- ⛔EXCEPTION bloğu YOK — fail-closed, kasıtlı: takma ad yazılamıyorsa yeniden adlandırma da
  -- olmamalı; aksi hâlde eski adres sessizce 404'e düşer ve bunu hiçbir kapı görmez.
  return new;
end;
$$;


ALTER FUNCTION "public"."tg_url_takma_ad_yaz"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."tg_url_takma_ad_yaz"() IS 'REC-300 Faz 1-A: slug/SKU yeniden adlandırılınca eski değeri url_takma_adlari''na yazar; yeni değerle çakışan takma adı siler (canlı slug önceliği). SECURITY DEFINER: admin authenticated rolle düzenliyor, invoker yetkisi RLS''e takılıp UPDATE''i düşürürdü.';



CREATE OR REPLACE FUNCTION "public"."touch_product_prices_computed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
begin
  new.computed_at := now();
  return new;
end $$;


ALTER FUNCTION "public"."touch_product_prices_computed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_inventory_settings"("p_default_low_stock_threshold" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
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


ALTER FUNCTION "public"."update_inventory_settings"("p_default_low_stock_threshold" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_inventory_thresholds"("p_default" integer, "p_reset_overrides" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
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


ALTER FUNCTION "public"."update_inventory_thresholds"("p_default" integer, "p_reset_overrides" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select t.hedef_id
    from public.url_takma_adlari t
   where t.tenant_id = public.jwt_tenant_id()
     and t.tur = p_tur
     and t.dil in (p_dil, '*')
     and t.eski_slug = lower(p_eski_slug)
   order by (t.dil = p_dil) desc
   limit 1;
$$;


ALTER FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") IS 'REC-300 Faz 1-A: eski slug → hedef kimliği (yoksa NULL). Kiracı jwt_tenant_id() ile; tam liste dökmez. Hedef nesne çağıranın RLS''iyle ayrıca okunur.';



CREATE OR REPLACE FUNCTION "public"."user_invoice_profiles_ensure_single_default"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."user_invoice_profiles_ensure_single_default"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."cart_items" (
    "id" "uuid",
    "cart_id" "uuid",
    "product_id" "uuid",
    "quantity" integer,
    "unit_price" numeric(10,2),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "price_list_id" "uuid",
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."inventory_movements" (
    "id" "uuid",
    "product_id" "uuid",
    "order_id" "uuid",
    "delta" integer,
    "reason" "text",
    "created_at" timestamp with time zone,
    "batch_id" "uuid",
    "original_movement_id" "uuid",
    "reversed_by_movement_id" "uuid",
    "undo_by_user_id" "uuid",
    "undo_at" timestamp with time zone,
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."inventory_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."payment_transactions" (
    "id" "uuid",
    "transaction_id" "text",
    "order_id" "uuid",
    "user_id" "uuid",
    "amount" numeric(10,2),
    "currency" "text",
    "status" "text",
    "payment_method" "text",
    "provider_response" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "archive_pre_kademe2"."payment_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."product_images" (
    "id" "uuid",
    "product_id" "uuid",
    "path" "text",
    "alt" "text",
    "sort_order" integer,
    "created_at" timestamp with time zone
);


ALTER TABLE "archive_pre_kademe2"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."product_prices" (
    "id" "uuid",
    "product_id" "uuid",
    "price_list_id" "uuid",
    "base_price" numeric(10,2),
    "sale_price" numeric(10,2),
    "discount_percentage" numeric(5,2),
    "is_active" boolean,
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."product_prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."products" (
    "id" "uuid",
    "name" "text",
    "brand" "text",
    "price" numeric(10,2),
    "sku" "text",
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "status" "text",
    "is_featured" boolean,
    "description" "text",
    "technical_specs" "jsonb",
    "image_url" "text",
    "stock_qty" integer,
    "low_stock_threshold" integer,
    "airflow_capacity" numeric(10,2),
    "noise_level" numeric(5,2),
    "pressure_rating" numeric(10,2),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "low_stock_override" boolean,
    "purchase_price" numeric(12,2),
    "slug" "text",
    "meta_title" "text",
    "meta_description" "text",
    "model_code" "text",
    "warehouse_location" "text",
    "supplier_name" "text",
    "is_category_manual" boolean
);


ALTER TABLE "archive_pre_kademe2"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."project_items" (
    "id" "uuid",
    "project_id" "uuid",
    "product_id" "uuid",
    "quantity" integer,
    "notes" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "archive_pre_kademe2"."project_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."shopping_carts" (
    "id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."shopping_carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."venthub_order_items" (
    "id" "uuid",
    "order_id" "uuid",
    "product_id" "uuid",
    "product_name" "text",
    "product_sku" "text",
    "product_brand" "text",
    "unit_price" numeric(10,2),
    "quantity" integer,
    "total_price" numeric(10,2),
    "product_snapshot" "jsonb",
    "created_at" timestamp with time zone,
    "price_at_time" numeric(10,2),
    "product_image_url" "text",
    "unit_price_snapshot" numeric(10,2),
    "price_list_id_snapshot" "uuid",
    "product_name_snapshot" "text",
    "product_sku_snapshot" "text",
    "tax_rate_snapshot" numeric,
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."venthub_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."venthub_orders" (
    "id" "uuid",
    "order_number" "text",
    "user_id" "uuid",
    "status" "text",
    "total_amount" numeric(10,2),
    "shipping_method" "text",
    "shipping_address" "jsonb",
    "billing_address" "jsonb",
    "invoice_profile" "jsonb",
    "payment_method" "text",
    "payment_status" "text",
    "conversation_id" "text",
    "shipping_carrier" "text",
    "shipping_tracking_number" "text",
    "shipped_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "customer_name" "text",
    "customer_email" "text",
    "carrier" "text",
    "tracking_url" "text",
    "subtotal_snapshot" numeric(10,2),
    "legal_consents" "jsonb",
    "invoice_type" "text",
    "invoice_info" "jsonb",
    "payment_token" "text",
    "customer_phone" "text",
    "tracking_number" "text",
    "payment_debug" "jsonb",
    "coupon_code" "text",
    "coupon_discount" numeric,
    "locale" "text",
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."venthub_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "archive_pre_kademe2"."venthub_returns" (
    "id" "uuid",
    "user_id" "uuid",
    "order_id" "uuid",
    "status" "text",
    "reason" "text",
    "description" "text",
    "refund_amount" numeric(10,2),
    "admin_notes" "text",
    "requested_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "processed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "tenant_id" "uuid"
);


ALTER TABLE "archive_pre_kademe2"."venthub_returns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_migration_ledger" (
    "name" "text" NOT NULL,
    "applied_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."_migration_ledger" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "actor" "uuid" DEFAULT "auth"."uid"(),
    "table_name" "text" NOT NULL,
    "row_pk" "text",
    "action" "text" NOT NULL,
    "before" "jsonb",
    "after" "jsonb",
    "comment" "text",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_audit_log" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "role" character varying(20) DEFAULT 'user'::character varying NOT NULL,
    "full_name" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'moderator'::character varying, 'warehouse'::character varying, 'sales'::character varying, 'viewer'::character varying, 'user'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'Kullanıcı profilleri ve rolleri | @graphql({"disabled": true})';



COMMENT ON COLUMN "public"."user_profiles"."role" IS 'Kullanıcı rolü: user, admin, moderator';



CREATE OR REPLACE VIEW "public"."admin_users" WITH ("security_invoker"='on') AS
 SELECT "u"."id",
    "u"."email",
    "up"."full_name",
    "up"."phone",
    "up"."role",
    "up"."created_at",
    "up"."updated_at"
   FROM ("auth"."users" "u"
     LEFT JOIN "public"."user_profiles" "up" ON (("u"."id" = "up"."id")))
  WHERE (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::"text"[]))
  ORDER BY "up"."created_at" DESC;


ALTER VIEW "public"."admin_users" OWNER TO "postgres";


COMMENT ON VIEW "public"."admin_users" IS 'Admin ve moderatör kullanıcıları listesi | @graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cart_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "price_list_id" "uuid",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."cart_items" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "parent_id" "uuid",
    "level" integer DEFAULT 0 NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "seo_title" "text",
    "seo_desc" "text",
    "is_featured" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "authority_content" "jsonb",
    "menu_label" "text",
    "marketing_title" "text",
    "translation_key" "text",
    "display_mode" "text" DEFAULT 'series'::"text",
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    CONSTRAINT "categories_slug_adres_ayirici_yok" CHECK ((("slug" !~* '-p-'::"text") AND (COALESCE((("metadata" -> 'slug'::"text") ->> 'tr'::"text"), ''::"text") !~* '-p-'::"text") AND (COALESCE((("metadata" -> 'slug'::"text") ->> 'en'::"text"), ''::"text") !~* '-p-'::"text")))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."category_mapping_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "priority" integer DEFAULT 0,
    "brand_filter" "text",
    "name_pattern" "text" NOT NULL,
    "exclude_pattern" "text",
    "spec_conditions" "jsonb",
    "target_subcategory_id" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."category_mapping_rules" OWNER TO "postgres";


COMMENT ON TABLE "public"."category_mapping_rules" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."client_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "url" "text",
    "message" "text" NOT NULL,
    "stack" "text",
    "user_agent" "text",
    "release" "text",
    "env" "text",
    "level" "text" DEFAULT 'error'::"text" NOT NULL,
    "extra" "jsonb",
    "group_id" "uuid"
);


ALTER TABLE "public"."client_errors" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_errors" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "company" "text",
    "subject" "text" DEFAULT 'web-form'::"text" NOT NULL,
    "message" "text" NOT NULL,
    "department" "public"."contact_department" DEFAULT 'sales'::"public"."contact_department" NOT NULL,
    "status" "public"."contact_status" DEFAULT 'new'::"public"."contact_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "city" "text",
    "application_area" "text",
    "kvkk_consent" boolean DEFAULT false NOT NULL,
    "consent_at" timestamp with time zone,
    CONSTRAINT "contact_messages_iletisim_var" CHECK (((("email" IS NOT NULL) AND ("btrim"("email") <> ''::"text")) OR (("phone" IS NOT NULL) AND ("btrim"("phone") <> ''::"text"))))
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."contact_messages" IS '@graphql({"disabled": true})';



COMMENT ON COLUMN "public"."contact_messages"."kvkk_consent" IS 'KVKK açık rıza kutusu işaretlendi mi. Rıza kayıtla AYNI satırda saklanır; toplanıp saklanmayan rızanın kanıtı yoktur.';



COMMENT ON COLUMN "public"."contact_messages"."consent_at" IS 'Rızanın alındığı an (sunucu saati).';



CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "discount_type" "text" NOT NULL,
    "discount_value" numeric(10,2) NOT NULL,
    "minimum_order_amount" numeric(10,2) DEFAULT 0,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "coupons_code_check" CHECK ((("length"("code") >= 3) AND ("length"("code") <= 50))),
    CONSTRAINT "coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed_amount'::"text"]))),
    CONSTRAINT "coupons_discount_value_check" CHECK (("discount_value" > (0)::numeric)),
    CONSTRAINT "coupons_minimum_order_amount_check" CHECK (("minimum_order_amount" >= (0)::numeric)),
    CONSTRAINT "coupons_usage_limit_check" CHECK ((("usage_limit" IS NULL) OR ("usage_limit" > 0))),
    CONSTRAINT "coupons_used_count_check" CHECK (("used_count" >= 0)),
    CONSTRAINT "usage_limit_check" CHECK ((("usage_limit" IS NULL) OR ("used_count" <= "usage_limit"))),
    CONSTRAINT "valid_date_range" CHECK ((("valid_until" IS NULL) OR ("valid_until" > "valid_from")))
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


COMMENT ON TABLE "public"."coupons" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."currency_rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "base_ccy" character(3) DEFAULT 'TRY'::"bpchar" NOT NULL,
    "quote_ccy" character(3) NOT NULL,
    "rate" numeric(18,6) NOT NULL,
    "spread_pct" numeric DEFAULT 0 NOT NULL,
    "source" "text" NOT NULL,
    "effective_date" "date" NOT NULL,
    "fetched_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "currency_rates_rate_check" CHECK (("rate" > (0)::numeric)),
    CONSTRAINT "currency_rates_source_check" CHECK (("source" = ANY (ARRAY['tcmb'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."currency_rates" OWNER TO "postgres";


COMMENT ON TABLE "public"."currency_rates" IS 'Append-only kur defteri (pricing-standard §10). rate = TCMB Efektif Satış; en güncel kur = max(effective_date) ≤ bugün, sonra max(fetched_at).';



CREATE TABLE IF NOT EXISTS "public"."data_subject_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "applicant_email" "text" NOT NULL,
    "request_type" "text" NOT NULL,
    "status" "text" DEFAULT 'received'::"text" NOT NULL,
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "due_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval) NOT NULL,
    "identity_verified_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "outcome" "text",
    "retained_data_note" "text",
    "handled_by" "uuid",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "data_subject_requests_request_type_check" CHECK (("request_type" = ANY (ARRAY['access'::"text", 'rectification'::"text", 'erasure'::"text", 'portability'::"text", 'objection'::"text", 'restriction'::"text"]))),
    CONSTRAINT "data_subject_requests_status_check" CHECK (("status" = ANY (ARRAY['received'::"text", 'identity_pending'::"text", 'in_progress'::"text", 'completed'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."data_subject_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."data_subject_requests" IS 'KVKK m.11 veri sahibi talepleri. 30 günlük süre ve sonucun ispatı için tutulur.';



COMMENT ON COLUMN "public"."data_subject_requests"."retained_data_note" IS 'Saklama yükümlülüğü nedeniyle SİLİNMEYEN veri ve hukuki dayanağı — kısmi ret bildirimi.';



CREATE TABLE IF NOT EXISTS "public"."error_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signature" "text" NOT NULL,
    "level" "text" DEFAULT 'error'::"text" NOT NULL,
    "last_message" "text",
    "url_sample" "text",
    "env" "text",
    "release" "text",
    "first_seen" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_seen" timestamp with time zone DEFAULT "now"() NOT NULL,
    "count" bigint DEFAULT 1 NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "assigned_to" "uuid",
    "notes" "text"
);


ALTER TABLE "public"."error_groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."error_groups" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."goods_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "po_id" "uuid" NOT NULL,
    "document_no" "text" NOT NULL,
    "received_by" "uuid",
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "goods_receipts_document_no_check" CHECK (("btrim"("document_no") <> ''::"text"))
);


ALTER TABLE "public"."goods_receipts" OWNER TO "postgres";


COMMENT ON TABLE "public"."goods_receipts" IS 'Mal kabul basligi (purchasing-standard §4). Kanit satirlari inventory_movements''ta (reason=purchase_receipt, goods_receipt_id FK).';



CREATE TABLE IF NOT EXISTS "public"."inventory_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "delta" integer NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "batch_id" "uuid",
    "original_movement_id" "uuid",
    "reversed_by_movement_id" "uuid",
    "undo_by_user_id" "uuid",
    "undo_at" timestamp with time zone,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "unit_cost" numeric,
    "unit_cost_currency" character(3),
    "goods_receipt_id" "uuid",
    CONSTRAINT "inventory_movements_purchase_receipt_evidence" CHECK ((("reason" <> 'purchase_receipt'::"text") OR (("goods_receipt_id" IS NOT NULL) AND ("unit_cost" IS NOT NULL) AND ("unit_cost" >= (0)::numeric) AND ("unit_cost_currency" IS NOT NULL) AND ("delta" > 0) AND ("order_id" IS NULL)))),
    CONSTRAINT "inventory_movements_reason_check" CHECK ((("char_length"("reason") >= 3) AND ("char_length"("reason") <= 32)))
);


ALTER TABLE "public"."inventory_movements" OWNER TO "postgres";


COMMENT ON TABLE "public"."inventory_movements" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."inventory_settings" (
    "id" boolean DEFAULT true NOT NULL,
    "default_low_stock_threshold" integer DEFAULT 5,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "alert_email" "text",
    "alert_webhook_url" "text",
    "reservation_timeout_hours" integer DEFAULT 24,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."inventory_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."inventory_settings" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."product_costs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "purchase_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "purchase_currency" "text" DEFAULT 'TRY'::"text" NOT NULL,
    "purchase_rate_to_base" numeric(18,6),
    "cost_in_base" numeric(14,4),
    "last_purchase_cost" numeric,
    "last_purchase_currency" "text",
    "last_purchased_at" timestamp with time zone,
    "supplier_name" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_costs_last_purchase_cost_check" CHECK (("last_purchase_cost" >= (0)::numeric)),
    CONSTRAINT "product_costs_last_purchase_currency_len" CHECK (("char_length"("last_purchase_currency") = 3)),
    CONSTRAINT "product_costs_purchase_currency_len" CHECK (("char_length"("purchase_currency") = 3)),
    CONSTRAINT "product_costs_purchase_price_nonneg" CHECK (("purchase_price" >= (0)::numeric))
);


ALTER TABLE "public"."product_costs" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_costs" IS 'REC-140: ürün liste/maliyet/tedarikçi alanları — yalnız admin/super_admin (karar 95). Faz 3''e kadar products''taki kopyadan tetikle beslenir; doğrudan YAZILMAZ.';



CREATE OR REPLACE VIEW "public"."inventory_summary" WITH ("security_invoker"='true') AS
 WITH "movement_stats" AS (
         SELECT "inventory_movements"."product_id",
            COALESCE("sum"("abs"("inventory_movements"."delta")), (0)::bigint) AS "total_out_30d"
           FROM "public"."inventory_movements"
          WHERE (("inventory_movements"."delta" < 0) AND (("inventory_movements"."reason" = 'sale'::"text") OR ("inventory_movements"."reason" = 'manual_out'::"text")) AND ("inventory_movements"."created_at" >= ("now"() - '30 days'::interval)))
          GROUP BY "inventory_movements"."product_id"
        )
 SELECT "p"."id" AS "product_id",
    "p"."stock_qty",
    COALESCE("m"."total_out_30d", (0)::bigint) AS "total_out_30d",
    "round"(((COALESCE("m"."total_out_30d", (0)::bigint))::numeric / 30.0), 2) AS "daily_velocity",
        CASE
            WHEN (COALESCE("m"."total_out_30d", (0)::bigint) = 0) THEN (9999)::numeric
            ELSE "round"((("p"."stock_qty")::numeric / ((COALESCE("m"."total_out_30d", (0)::bigint))::numeric / 30.0)))
        END AS "days_until_empty",
    ("c"."purchase_price" * ("p"."stock_qty")::numeric) AS "capital_tied_up",
        CASE
            WHEN (COALESCE("m"."total_out_30d", (0)::bigint) >= 10) THEN 'A'::"text"
            WHEN (COALESCE("m"."total_out_30d", (0)::bigint) >= 3) THEN 'B'::"text"
            ELSE 'C'::"text"
        END AS "abc_class"
   FROM (("public"."products" "p"
     LEFT JOIN "movement_stats" "m" ON (("p"."id" = "m"."product_id")))
     LEFT JOIN "public"."product_costs" "c" ON (("c"."product_id" = "p"."id")));


ALTER VIEW "public"."inventory_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venthub_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "product_sku" "text",
    "product_brand" "text",
    "unit_price" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "product_snapshot" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "price_at_time" numeric(10,2),
    "product_image_url" "text",
    "unit_price_snapshot" numeric(10,2) NOT NULL,
    "price_list_id_snapshot" "uuid",
    "product_name_snapshot" "text" NOT NULL,
    "product_sku_snapshot" "text" NOT NULL,
    "tax_rate_snapshot" numeric NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "display_currency" character(3) DEFAULT 'TRY'::"bpchar" NOT NULL,
    "display_rate" numeric DEFAULT 1 NOT NULL,
    "rate_effective_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT "venthub_order_items_snapshot_sane" CHECK ((("unit_price_snapshot" >= (0)::numeric) AND ("tax_rate_snapshot" >= (0)::numeric) AND ("tax_rate_snapshot" <= (100)::numeric) AND ("display_rate" > (0)::numeric) AND ("char_length"("display_currency") = 3)))
);


ALTER TABLE "public"."venthub_order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."venthub_order_items" IS 'Order items schema fixed on 2025-09-03 - optional fields made nullable | @graphql({"disabled": true})';



COMMENT ON COLUMN "public"."venthub_order_items"."total_price" IS 'unit_price * quantity - calculated field';



CREATE OR REPLACE VIEW "public"."inventory_velocity" WITH ("security_invoker"='true') AS
 WITH "reserved" AS (
         SELECT "voi"."product_id",
            ("sum"("voi"."quantity"))::integer AS "reserved_qty"
           FROM ("public"."venthub_order_items" "voi"
             JOIN "public"."venthub_orders" "o" ON (("o"."id" = "voi"."order_id")))
          WHERE (("o"."status" = ANY (ARRAY['confirmed'::"text", 'paid'::"text", 'processing'::"text"])) AND ("o"."shipped_at" IS NULL))
          GROUP BY "voi"."product_id"
        )
 SELECT "p"."id" AS "product_id",
    "p"."name",
    COALESCE("p"."stock_qty", 0) AS "physical_stock",
    COALESCE("r"."reserved_qty", 0) AS "reserved_stock",
    (COALESCE("p"."stock_qty", 0) - COALESCE("r"."reserved_qty", 0)) AS "available_stock",
    "p"."warehouse_location",
    "c"."supplier_name"
   FROM (("public"."products" "p"
     LEFT JOIN "reserved" "r" ON (("r"."product_id" = "p"."id")))
     LEFT JOIN "public"."product_costs" "c" ON (("c"."product_id" = "p"."id")));


ALTER VIEW "public"."inventory_velocity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_attachments" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "filename" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "description" "text",
    "is_internal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "order_attachments_file_size_check" CHECK (("file_size" > 0)),
    CONSTRAINT "order_attachments_filename_check" CHECK (("length"("filename") >= 1))
);


ALTER TABLE "public"."order_attachments" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_attachments" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."order_email_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "email_to" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "provider" "text" DEFAULT 'resend'::"text" NOT NULL,
    "provider_message_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text",
    "error" "text",
    "kind" "text",
    CONSTRAINT "order_email_events_status_check" CHECK ((("status" IS NULL) OR ("status" = ANY (ARRAY['attempt'::"text", 'sent'::"text", 'failed'::"text"]))))
);


ALTER TABLE "public"."order_email_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_email_events" IS '@graphql({"disabled": true})';



COMMENT ON COLUMN "public"."order_email_events"."status" IS 'attempt | sent | failed | NULL(eski satir). T137-VH: defter yalniz basariyi yazdigi surece "nicin gitmedi" sorusu cevapsiz kalir — atesle-unut cagrida sessiz kayip gorunmez. attempt = gonderim DENENDI, sonucu henuz yazilmadi. Terminal duruma HIC gecmeyen bir attempt satiri, uc ile damga arasinda OLEN bir cagrinin TEK izidir: e-posta gitmis olabilir ama damga atilmamistir, yani tekrar denemede MUKERRER gonderim olur. Bu satir o mukerrerligi ENGELLEMEZ, ACIKLANABILIR kilar.';



COMMENT ON COLUMN "public"."order_email_events"."kind" IS 'Bildirim turu (ornek: order_paid). T137-VH oncesi tek tur vardi ve adlandirilmamisti; defter cok turlu hale gelirken tur ADIYLA yazilmali, yoksa subject metnine bakmak gerekir.';



CREATE TABLE IF NOT EXISTS "public"."order_invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "invoice_no" "text" NOT NULL,
    "invoice_date" "date" NOT NULL,
    "invoice_type" "text",
    "issued_by" "uuid",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_invoices_invoice_no_not_blank" CHECK (("btrim"("invoice_no") <> ''::"text"))
);


ALTER TABLE "public"."order_invoices" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_invoices" IS 'T132-VH fatura defteri. Bir siparisin faturalandigi, BU TABLODA SATIRI OLMASINDAN anlasilir; boolean bayrak bilerek yoktur. Yasal kayit: UPDATE/DELETE politikasi yok.';



CREATE TABLE IF NOT EXISTS "public"."order_notes" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "note" "text" NOT NULL,
    "is_internal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "order_notes_note_check" CHECK (("length"("note") >= 1))
);


ALTER TABLE "public"."order_notes" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_notes" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."order_number_counters" (
    "gun" "date" NOT NULL,
    "son_no" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "order_number_counters_son_no_check" CHECK (("son_no" >= 0))
);


ALTER TABLE "public"."order_number_counters" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_number_counters" IS 'REC-156: sipariş numarasının günlük sıra sayacı. Yalnız generate_order_number() yazar (SECURITY DEFINER).';



CREATE TABLE IF NOT EXISTS "public"."order_refund_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "reason" "text",
    "actor_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."order_refund_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_refund_events" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "tier_level" integer DEFAULT 1,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizations" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "text" NOT NULL,
    "order_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'TRY'::"text" NOT NULL,
    "status" "text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "provider_response" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payment_transactions_status_check" CHECK (("status" = ANY (ARRAY['authorized'::"text", 'captured'::"text", 'failed'::"text", 'voided'::"text", 'refunded'::"text", 'partial_refunded'::"text"])))
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_transactions" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."price_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "user_type" character varying(50) DEFAULT 'individual'::character varying,
    "is_active" boolean DEFAULT true,
    "effective_from" timestamp with time zone DEFAULT "now"(),
    "effective_to" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."price_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_policy" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "scope" smallint NOT NULL,
    "product_id" "uuid",
    "brand_id" "uuid",
    "category_id" "uuid",
    "fx_lock" boolean DEFAULT false NOT NULL,
    "fx_frozen_rate" numeric,
    "frozen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "frozen_by" "uuid",
    "note" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid",
    CONSTRAINT "pricing_policy_lock_provenance" CHECK ((("fx_lock" = false) OR ("fx_frozen_rate" IS NOT NULL))),
    CONSTRAINT "pricing_policy_scope_check" CHECK ((("scope" >= 0) AND ("scope" <= 4))),
    CONSTRAINT "pricing_policy_scope_target" CHECK (((("scope" = ANY (ARRAY[0, 1])) AND ("product_id" IS NOT NULL) AND ("brand_id" IS NULL) AND ("category_id" IS NULL)) OR (("scope" = 2) AND ("brand_id" IS NOT NULL) AND ("product_id" IS NULL) AND ("category_id" IS NULL)) OR (("scope" = 3) AND ("category_id" IS NOT NULL) AND ("product_id" IS NULL) AND ("brand_id" IS NULL)) OR (("scope" = 4) AND ("product_id" IS NULL) AND ("brand_id" IS NULL) AND ("category_id" IS NULL))))
);


ALTER TABLE "public"."pricing_policy" OWNER TO "postgres";


COMMENT ON TABLE "public"."pricing_policy" IS 'Fiyat politikasi katmani (pricing-standard §8.3). Kural DEGIL ayar: "bu kapsam kur degisiminden etkilenmesin". Merdiven pricing_rule ile birebir ayni (scope ASC, priority DESC; en ozel kazanir). v1: yalniz fx_lock; display_currency/min_margin_pct tuketicileriyle birlikte eklenir.';



CREATE TABLE IF NOT EXISTS "public"."pricing_rule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "price_book_id" "uuid",
    "scope" smallint NOT NULL,
    "product_id" "uuid",
    "brand_id" "uuid",
    "category_id" "uuid",
    "method" "text" NOT NULL,
    "base" "text" DEFAULT 'cost'::"text" NOT NULL,
    "margin_pct" numeric,
    "surcharge" numeric DEFAULT 0 NOT NULL,
    "fixed_price" numeric,
    "vat_rate_pct" numeric DEFAULT 20 NOT NULL,
    "price_is_vat_inclusive" boolean DEFAULT false NOT NULL,
    "min_margin_abs" numeric,
    "max_margin_abs" numeric,
    "round_to" numeric,
    "charm_ending" numeric,
    "min_quantity" numeric DEFAULT 1 NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "is_exclusive" boolean DEFAULT true NOT NULL,
    "currency" character(3),
    "valid_from" "date",
    "valid_to" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid",
    CONSTRAINT "pricing_rule_base_check" CHECK (("base" = ANY (ARRAY['cost'::"text", 'list_price'::"text", 'parent_book'::"text"]))),
    CONSTRAINT "pricing_rule_method_check" CHECK (("method" = ANY (ARRAY['cost_plus'::"text", 'fixed'::"text", 'percent_off_list'::"text"]))),
    CONSTRAINT "pricing_rule_method_fields" CHECK (((("method" <> 'cost_plus'::"text") OR ("margin_pct" IS NOT NULL)) AND (("method" <> 'fixed'::"text") OR ("fixed_price" IS NOT NULL)))),
    CONSTRAINT "pricing_rule_min_quantity_check" CHECK (("min_quantity" >= (0)::numeric)),
    CONSTRAINT "pricing_rule_scope_check" CHECK ((("scope" >= 0) AND ("scope" <= 4))),
    CONSTRAINT "pricing_rule_scope_target" CHECK (((("scope" = ANY (ARRAY[0, 1])) AND ("product_id" IS NOT NULL) AND ("brand_id" IS NULL) AND ("category_id" IS NULL)) OR (("scope" = 2) AND ("brand_id" IS NOT NULL) AND ("product_id" IS NULL) AND ("category_id" IS NULL)) OR (("scope" = 3) AND ("category_id" IS NOT NULL) AND ("product_id" IS NULL) AND ("brand_id" IS NULL)) OR (("scope" = 4) AND ("product_id" IS NULL) AND ("brand_id" IS NULL) AND ("category_id" IS NULL))))
);


ALTER TABLE "public"."pricing_rule" OWNER TO "postgres";


COMMENT ON TABLE "public"."pricing_rule" IS 'Marj kural motoru (pricing-standard §10). Çözüm sırası: scope ASC, kitap-özgüllüğü, min_quantity DESC, priority DESC (§11); ilk exclusive eşleşme kazanır. Panel yüzde/katsayı/sabit girer; kanonik = margin_pct.';



CREATE TABLE IF NOT EXISTS "public"."product_authorities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "expert_name" "text" NOT NULL,
    "expert_title" "text",
    "expert_avatar_url" "text",
    "content" "text" NOT NULL,
    "badge_text" "text",
    "rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    CONSTRAINT "product_authorities_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."product_authorities" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_authorities" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."product_families" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "description" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_description_manual" boolean DEFAULT false NOT NULL,
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "meta_title" "jsonb",
    "meta_description" "jsonb",
    "series_code" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "parent_family_id" "uuid",
    "name_i18n" "jsonb",
    CONSTRAINT "product_families_parent_not_self" CHECK ((("parent_family_id" IS NULL) OR ("parent_family_id" <> "id"))),
    CONSTRAINT "product_families_slug_adres_ayirici_yok" CHECK (("slug" !~* '-p-'::"text"))
);


ALTER TABLE "public"."product_families" OWNER TO "postgres";


COMMENT ON COLUMN "public"."product_families"."parent_family_id" IS 'NULL = seri (landing sayfası); NOT NULL = model (kart + ürün sayfası). T138-VH, 2026-08-21.';



COMMENT ON COLUMN "public"."product_families"."name_i18n" IS 'Aile adının dil-anahtarlı hali: {"tr":…,"en":…}. `name` TR SSOT olarak durur; okuma yolu name_i18n[lang] -> name sırasıyla düşer. EN yoksa TR basılır (bugünkü davranış).';



CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "path" "text" NOT NULL,
    "alt" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "price_list_id" "uuid" NOT NULL,
    "base_price" numeric(10,2) NOT NULL,
    "sale_price" numeric(10,2),
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "currency" character(3) DEFAULT 'TRY'::"bpchar" NOT NULL,
    "net_price" numeric,
    "gross_price" numeric,
    "is_derived" boolean DEFAULT false NOT NULL,
    "computed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_prices_cache_sanity" CHECK (((("net_price" IS NULL) OR ("net_price" >= (0)::numeric)) AND (("gross_price" IS NULL) OR ("gross_price" >= (0)::numeric)) AND (("net_price" IS NULL) OR ("gross_price" IS NULL) OR ("gross_price" >= "net_price"))))
);


ALTER TABLE "public"."product_prices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."product_prices"."net_price" IS 'Motor çıktısı KDV-hariç fiyat (kanonik; pricing-standard §5). base/sale_price legacy alanlardır.';



COMMENT ON COLUMN "public"."product_prices"."gross_price" IS 'KDV-dahil gösterim fiyatı (net × (1+KDV)).';



COMMENT ON COLUMN "public"."product_prices"."is_derived" IS 'true = pricing_rule motorundan materialize edildi (cache; elle düzenleme yerine kural değiştir). Varsayılan false: elle satır kendini motor-çıktısı sayamaz.';



COMMENT ON COLUMN "public"."product_prices"."computed_at" IS 'Bu cache satırının motor tarafından türetildiği an (cetvel §8.1 tazelik sözleşmesi).';



CREATE TABLE IF NOT EXISTS "public"."product_search_index" (
    "product_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "search_body" "text" NOT NULL,
    "search_document" "tsvector" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "arama_ek" "text",
    "arama_kelime" "text"
);


ALTER TABLE "public"."product_search_index" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_search_index" IS 'REC-340 Adim 2: urunun aranabilir govdesi. products tablosunda DEGIL cunku products uzerindeki on_products_change (webhook) ve products_set_updated_at tetikleri KOSULSUZ — turetilmis sutunu orada tutmak her tazelemede webhook firtinasi ve bosuna onbellek tazelemesi uretirdi.';



CREATE TABLE IF NOT EXISTS "public"."project_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."project_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_items" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."purchase_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "po_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "qty_ordered" integer NOT NULL,
    "qty_received" integer DEFAULT 0 NOT NULL,
    "unit_cost" numeric NOT NULL,
    "currency" character(3) NOT NULL,
    "tax_rate" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_order_items_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "purchase_order_items_qty_ordered_check" CHECK (("qty_ordered" > 0)),
    CONSTRAINT "purchase_order_items_qty_received_check" CHECK (("qty_received" >= 0)),
    CONSTRAINT "purchase_order_items_receipt_cap" CHECK (("qty_received" <= "qty_ordered")),
    CONSTRAINT "purchase_order_items_tax_rate_check" CHECK ((("tax_rate" >= (0)::numeric) AND ("tax_rate" <= (100)::numeric))),
    CONSTRAINT "purchase_order_items_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."purchase_order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_order_items" IS 'PO satiri (purchasing-standard §5.1). unit_cost+currency siparis ani SNAPSHOT''idir; qty_received yalniz process_goods_receipt tarafindan yazilir.';



CREATE TABLE IF NOT EXISTS "public"."purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "currency" character(3) NOT NULL,
    "expected_at" "date",
    "note" "text",
    "close_note" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_orders_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "purchase_orders_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'ordered'::"text", 'partially_received'::"text", 'received'::"text", 'closed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."purchase_orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_orders" IS 'Satinalma siparisi basligi (purchasing-standard §3). Monoton durum makinesi; ara statuler process_goods_receipt tarafindan TURETILIR, elle secilemez.';



CREATE TABLE IF NOT EXISTS "public"."quote_email_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "email_to" "text",
    "subject" "text",
    "provider" "text" DEFAULT 'resend'::"text" NOT NULL,
    "provider_message_id" "text",
    "status" "text" NOT NULL,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event" "text" DEFAULT 'request_created'::"text" NOT NULL,
    CONSTRAINT "quote_email_events_event_check" CHECK (("event" = ANY (ARRAY['request_created'::"text", 'quote_published'::"text"]))),
    CONSTRAINT "quote_email_events_status_check" CHECK (("status" = ANY (ARRAY['sent'::"text", 'failed'::"text", 'mismatch'::"text"])))
);


ALTER TABLE "public"."quote_email_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."quote_email_events" IS 'Teklif bildirimi gonderim defteri (T068-VH). status=failed satirlari BILEREK tutulur: net.http_post atesle-unut oldugu icin basarisizlik baska hicbir yerde gorunmez.';



CREATE TABLE IF NOT EXISTS "public"."quote_number_counters" (
    "tenant_id" "uuid" NOT NULL,
    "gun" "date" NOT NULL,
    "son_no" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "quote_number_counters_son_no_check" CHECK (("son_no" >= 0))
);


ALTER TABLE "public"."quote_number_counters" OWNER TO "postgres";


COMMENT ON TABLE "public"."quote_number_counters" IS 'REC-384: teklif numarasinin kiraci+gun sira sayaci. Yalniz stamp_quote_published (tetik, DEFINER) yazar.';



CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "key" "text" NOT NULL,
    "bucket" timestamp with time zone NOT NULL,
    "count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


COMMENT ON TABLE "public"."rate_limits" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."refund_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "idempotency_key" "text" NOT NULL,
    "kind" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "state" "text" DEFAULT 'in_flight'::"text" NOT NULL,
    "psp_reference" "text",
    "psp_result" "jsonb",
    "failure_code" "text",
    "actor_user_id" "uuid",
    "reason" "text",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "settled_at" timestamp with time zone,
    CONSTRAINT "refund_attempts_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "refund_attempts_kind_check" CHECK (("kind" = ANY (ARRAY['cancel'::"text", 'refund'::"text"]))),
    CONSTRAINT "refund_attempts_state_check" CHECK (("state" = ANY (ARRAY['in_flight'::"text", 'succeeded'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."refund_attempts" OWNER TO "postgres";


COMMENT ON TABLE "public"."refund_attempts" IS 'Para iadesi talep defteri. Sıra: talebi YAZ -> PSP çağır -> sonucu işle. unique(order_id, idempotency_key) çift iadeyi DB seviyesinde imkânsız kılar. state=in_flight takılı kalırsa OTOMATİK serbest bırakılmaz (para çıktı mı bilinmiyor) — insan kararı.';



CREATE OR REPLACE VIEW "public"."reserved_orders" WITH ("security_invoker"='on') AS
 SELECT "voi"."product_id",
    "o"."id" AS "order_id",
    "o"."created_at",
    "o"."status",
    "o"."payment_status",
    "voi"."quantity"
   FROM ("public"."venthub_order_items" "voi"
     JOIN "public"."venthub_orders" "o" ON (("o"."id" = "voi"."order_id")))
  WHERE (("o"."status" = ANY (ARRAY['confirmed'::"text", 'paid'::"text", 'processing'::"text"])) AND ("o"."shipped_at" IS NULL));


ALTER VIEW "public"."reserved_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."returns_webhook_events" (
    "id" bigint NOT NULL,
    "event_id" "text" NOT NULL,
    "return_id" "uuid",
    "order_id" "uuid",
    "carrier" "text",
    "tracking_number" "text",
    "status_raw" "text",
    "status_mapped" "text",
    "body_hash" "text" NOT NULL,
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."returns_webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."returns_webhook_events" IS '@graphql({"disabled": true})';



CREATE SEQUENCE IF NOT EXISTS "public"."returns_webhook_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."returns_webhook_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."returns_webhook_events_id_seq" OWNED BY "public"."returns_webhook_events"."id";



CREATE TABLE IF NOT EXISTS "public"."search_reindex_queue" (
    "id" bigint NOT NULL,
    "kapsam" "text" NOT NULL,
    "ref_id" "uuid" NOT NULL,
    "eklenme" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "search_reindex_queue_kapsam_check" CHECK (("kapsam" = ANY (ARRAY['urun'::"text", 'aile'::"text", 'kategori'::"text"])))
);


ALTER TABLE "public"."search_reindex_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."search_reindex_queue" IS 'REC-340 Adim 2: arama govdesi tazeleme kuyrugu. Aile/kategori adi degisince buraya tek satir yazilir, pg_cron toplu tazeler. Urun degisikligi kuyruga GIRMEZ — tetikte aninda tazelenir.';



CREATE SEQUENCE IF NOT EXISTS "public"."search_reindex_queue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."search_reindex_queue_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."search_reindex_queue_id_seq" OWNED BY "public"."search_reindex_queue"."id";



CREATE TABLE IF NOT EXISTS "public"."shipping_email_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "email_to" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "provider" "text" DEFAULT 'resend'::"text" NOT NULL,
    "provider_message_id" "text",
    "carrier" "text",
    "tracking_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."shipping_email_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."shipping_email_events" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."shipping_idempotency" (
    "key" "text" NOT NULL,
    "scope" "text" DEFAULT 'admin-update-shipping'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shipping_idempotency" OWNER TO "postgres";


COMMENT ON TABLE "public"."shipping_idempotency" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."shipping_webhook_events" (
    "id" bigint NOT NULL,
    "event_id" "text" NOT NULL,
    "order_id" "uuid",
    "order_number" "text",
    "carrier" "text",
    "status_raw" "text",
    "status_mapped" "text",
    "body_hash" "text" NOT NULL,
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."shipping_webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."shipping_webhook_events" IS '@graphql({"disabled": true})';



CREATE SEQUENCE IF NOT EXISTS "public"."shipping_webhook_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."shipping_webhook_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."shipping_webhook_events_id_seq" OWNED BY "public"."shipping_webhook_events"."id";



CREATE TABLE IF NOT EXISTS "public"."shopping_carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."shopping_carts" OWNER TO "postgres";


COMMENT ON TABLE "public"."shopping_carts" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."site_settings" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" DEFAULT "public"."jwt_tenant_id"() NOT NULL,
    "name" "text" NOT NULL,
    "tax_no" "text",
    "contact_name" "text",
    "email" "text",
    "phone" "text",
    "currency" character(3) DEFAULT 'TRY'::"bpchar" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "note" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "suppliers_currency_check" CHECK (("char_length"("currency") = 3))
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


COMMENT ON TABLE "public"."suppliers" IS 'Tedarikci kartlari (purchasing-standard §2). products.supplier_name serbest metni v1''de kalir; FK gocu v2.';



CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subdomain" "text",
    "custom_domain" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "features" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "styles" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "theme_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."url_takma_adlari" (
    "tenant_id" "uuid" NOT NULL,
    "tur" "text" NOT NULL,
    "dil" "text" NOT NULL,
    "eski_slug" "text" NOT NULL,
    "hedef_id" "uuid" NOT NULL,
    "sebep" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "url_takma_adlari_dil_check" CHECK (("dil" = ANY (ARRAY['tr'::"text", 'en'::"text", '*'::"text"]))),
    CONSTRAINT "url_takma_adlari_eski_slug_check" CHECK ((("eski_slug" <> ''::"text") AND ("eski_slug" = "lower"("eski_slug")))),
    CONSTRAINT "url_takma_adlari_tur_check" CHECK (("tur" = ANY (ARRAY['urun'::"text", 'sku'::"text", 'aile'::"text", 'kategori'::"text"])))
);


ALTER TABLE "public"."url_takma_adlari" OWNER TO "postgres";


COMMENT ON TABLE "public"."url_takma_adlari" IS 'REC-300 Faz 1-A: eski slug → bugünkü nesne. Yeniden adlandırma anında tetik yazar (tg_url_takma_ad_yaz). Sayfa "bulunamadı" dalında url_takma_ad_coz() ile TEK slug sorar ve 308 verir. Tabloya doğrudan erişim YOK. Plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §4.';



CREATE TABLE IF NOT EXISTS "public"."user_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_line" "text" NOT NULL,
    "district" "text" NOT NULL,
    "city" "text" NOT NULL,
    "postal_code" "text",
    "country" "text" DEFAULT 'Turkey'::"text" NOT NULL,
    "address_type" "text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_default_shipping" boolean DEFAULT false,
    "is_default_billing" boolean DEFAULT false,
    "label" "text",
    "full_name" "text",
    "phone" "text",
    "full_address" "text",
    "street_address" "text",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "user_addresses_address_type_check" CHECK (("address_type" = ANY (ARRAY['shipping'::"text", 'billing'::"text"])))
);


ALTER TABLE "public"."user_addresses" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_addresses" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."user_invoice_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_type" "text" NOT NULL,
    "company_name" "text",
    "tax_number" "text",
    "tax_office" "text",
    "first_name" "text",
    "last_name" "text",
    "address_line" "text" NOT NULL,
    "district" "text" NOT NULL,
    "city" "text" NOT NULL,
    "postal_code" "text",
    "country" "text" DEFAULT 'Turkey'::"text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "user_invoice_profiles_profile_type_check" CHECK (("profile_type" = ANY (ARRAY['individual'::"text", 'corporate'::"text"])))
);


ALTER TABLE "public"."user_invoice_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_invoice_profiles" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."user_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_projects" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_projects" IS '@graphql({"disabled": true})';



CREATE TABLE IF NOT EXISTS "public"."venthub_quote_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "qty" integer NOT NULL,
    "note" "text",
    "unit_price" numeric(12,2),
    "currency" "text",
    "valid_until" timestamp with time zone,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "line_no" integer,
    "discount_rate" numeric(5,2),
    "tax_rate" numeric(5,2),
    "line_total" numeric(12,2),
    "group_label" "text",
    CONSTRAINT "venthub_quote_items_currency_check" CHECK ((("currency" IS NULL) OR ("char_length"("currency") = 3))),
    CONSTRAINT "venthub_quote_items_qty_check" CHECK (("qty" > 0)),
    CONSTRAINT "venthub_quote_items_unit_price_check" CHECK ((("unit_price" IS NULL) OR ("unit_price" >= (0)::numeric)))
);


ALTER TABLE "public"."venthub_quote_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."venthub_quote_items" IS 'Teklif kalemi — talep anındaki SNAPSHOT (product_name/qty içerik kopyası; project_items satır IDleri kopyalanmaz). unit_price/currency/valid_until yalnız admin yazar (kolon grant).';



CREATE TABLE IF NOT EXISTS "public"."venthub_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "source" "text" NOT NULL,
    "source_project_id" "uuid",
    "status" "text" DEFAULT 'requested'::"text" NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "request_email_sent_at" timestamp with time zone,
    "quote_no" "text",
    "revision_no" integer DEFAULT 1 NOT NULL,
    "amended_from" "uuid",
    "root_quote_id" "uuid",
    "superseded_by" "uuid",
    "valid_until" timestamp with time zone,
    "currency" character(3),
    "total_amount" numeric(12,2),
    "contact_name" "text" NOT NULL,
    "contact_email" "text" NOT NULL,
    "contact_phone" "text" NOT NULL,
    "sales_project_id" "uuid",
    "party_role" "text",
    "sent_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "accept_channel" "text",
    "accept_ip" "inet",
    "accept_declaration_version" "text",
    "accept_evidence_ref" "text",
    "accept_recorded_by" "uuid",
    "accepted_revision_no" integer,
    "accept_confirmed_at" timestamp with time zone,
    "accept_confirmed_by" "uuid",
    "cancelled_at" timestamp with time zone,
    "cancel_reason" "text",
    "converted_order_id" "uuid",
    "published_email_sent_at" timestamp with time zone,
    CONSTRAINT "venthub_quotes_accept_channel_check" CHECK ((("accept_channel" IS NULL) OR ("accept_channel" = ANY (ARRAY['site'::"text", 'email'::"text", 'phone'::"text"])))),
    CONSTRAINT "venthub_quotes_currency_check" CHECK ((("currency" IS NULL) OR ("currency" ~ '^[A-Z]{3}$'::"text"))),
    CONSTRAINT "venthub_quotes_source_check" CHECK (("source" = ANY (ARRAY['pdp'::"text", 'cart'::"text", 'project'::"text"]))),
    CONSTRAINT "venthub_quotes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'requested'::"text", 'quoted'::"text", 'accepted'::"text", 'rejected'::"text", 'expired'::"text", 'cancelled'::"text", 'superseded'::"text", 'converted'::"text"])))
);


ALTER TABLE "public"."venthub_quotes" OWNER TO "postgres";


COMMENT ON TABLE "public"."venthub_quotes" IS 'Teklif (RFQ) başlığı — T067-VH. Durum makinesi: requested->quoted->accepted/rejected/expired; terminaller soğurucu. SSOT: src/lib/quotes/quoteStatusMachine.ts + docs/standards/quote-standard.md.';



COMMENT ON COLUMN "public"."venthub_quotes"."request_email_sent_at" IS 'Teklif talebi alındı e-postasının GÖNDERİLDİĞİ an (T068-VH). NULL = henüz gönderilmedi. Damga yalnız gönderim BAŞARILI olduktan sonra atılır; idempotency kaynağıdır.';



COMMENT ON COLUMN "public"."venthub_quotes"."published_email_sent_at" IS 'REC-384: yayim e-postasinin GERCEKTEN gonderildigi an (Edge yazar). sent_at = yayim ani (cetvel §12).';



CREATE TABLE IF NOT EXISTS "public"."venthub_returns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'requested'::"text" NOT NULL,
    "reason" "text" NOT NULL,
    "description" "text",
    "refund_amount" numeric(10,2),
    "admin_notes" "text",
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "approved_at" timestamp with time zone,
    "processed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL,
    CONSTRAINT "venthub_returns_status_check" CHECK (("status" = ANY (ARRAY['requested'::"text", 'approved'::"text", 'rejected'::"text", 'in_transit'::"text", 'received'::"text", 'refunded'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."venthub_returns" OWNER TO "postgres";


COMMENT ON TABLE "public"."venthub_returns" IS '@graphql({"disabled": true})';



CREATE OR REPLACE VIEW "public"."view_admin_orders" WITH ("security_invoker"='true') AS
 SELECT "o"."id",
    "o"."order_number",
    "o"."user_id",
    "o"."status",
    "o"."total_amount",
    "o"."shipping_method",
    "o"."shipping_address",
    "o"."billing_address",
    "o"."invoice_profile",
    "o"."payment_method",
    "o"."payment_status",
    "o"."conversation_id",
    "o"."shipping_carrier",
    "o"."shipping_tracking_number",
    "o"."shipped_at",
    "o"."delivered_at",
    "o"."created_at",
    "o"."updated_at",
    "o"."customer_name",
    "o"."customer_email",
    "o"."carrier",
    "o"."tracking_url",
    "o"."subtotal_snapshot",
    "o"."legal_consents",
    "o"."invoice_type",
    "o"."invoice_info",
    "o"."payment_token",
    "o"."customer_phone",
    "o"."tracking_number",
    "o"."payment_debug",
    "o"."coupon_code",
    "o"."coupon_discount",
    "o"."locale",
    "o"."tenant_id",
    ("o"."id")::"text" AS "id_text",
    "o"."conversation_id" AS "conversation_id_text",
    ((((((((((((((((((COALESCE(("o"."id")::"text", ''::"text") || ' '::"text") || COALESCE("o"."conversation_id", ''::"text")) || ' '::"text") || COALESCE("o"."order_number", ''::"text")) || ' '::"text") || COALESCE("o"."customer_email", ''::"text")) || ' '::"text") || COALESCE("o"."customer_name", ''::"text")) || ' '::"text") || COALESCE("o"."customer_phone", ''::"text")) || ' '::"text") || COALESCE(("o"."invoice_info")::"text", ''::"text")) || ' '::"text") || COALESCE(("o"."billing_address")::"text", ''::"text")) || ' '::"text") || COALESCE(("o"."shipping_address")::"text", ''::"text")) || ' '::"text") || COALESCE("p"."full_name", ''::"text")) AS "search_text"
   FROM ("public"."venthub_orders" "o"
     LEFT JOIN "public"."user_profiles" "p" ON (("o"."user_id" = "p"."id")));


ALTER VIEW "public"."view_admin_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_admin_returns" WITH ("security_invoker"='true') AS
 SELECT "r"."id",
    "r"."user_id",
    "r"."order_id",
    "r"."status",
    "r"."reason",
    "r"."description",
    "r"."refund_amount",
    "r"."admin_notes",
    "r"."requested_at",
    "r"."approved_at",
    "r"."processed_at",
    "r"."completed_at",
    "r"."created_at",
    "r"."updated_at",
    "r"."tenant_id",
    "o"."order_number",
    "o"."customer_name",
    "o"."customer_email",
    "o"."total_amount",
    ((((((((COALESCE("r"."reason", ''::"text") || ' '::"text") || COALESCE("r"."description", ''::"text")) || ' '::"text") || COALESCE("o"."order_number", ''::"text")) || ' '::"text") || COALESCE("o"."customer_name", ''::"text")) || ' '::"text") || COALESCE("o"."customer_email", ''::"text")) AS "search_text"
   FROM ("public"."venthub_returns" "r"
     LEFT JOIN "public"."venthub_orders" "o" ON (("o"."id" = "r"."order_id")));


ALTER VIEW "public"."view_admin_returns" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_admin_returns" IS 'Admin iade listesinin okuma yuzeyi. security_invoker=true -- RLS cagirana gore uygulanir. Yazma yolu DEGIL: statu guncellemeleri public.venthub_returns uzerinde yapilir.';



CREATE OR REPLACE VIEW "public"."view_admin_uninvoiced_orders" WITH ("security_invoker"='true') AS
 SELECT "id",
    "order_number",
    "created_at",
    "total_amount",
    "customer_name",
    "customer_email",
    "invoice_type",
    "invoice_info"
   FROM "public"."venthub_orders" "o"
  WHERE (("payment_status" = 'paid'::"text") AND "public"."is_admin_user"() AND (NOT (EXISTS ( SELECT 1
           FROM "public"."order_invoices" "i"
          WHERE ("i"."order_id" = "o"."id")))));


ALTER VIEW "public"."view_admin_uninvoiced_orders" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_admin_uninvoiced_orders" IS 'Odemesi tamamlanmis ama fatura defterinde satiri olmayan siparisler. security_invoker=true; satir kapisi is_admin_user() ile view govdesinde.';



CREATE TABLE IF NOT EXISTS "public"."wizard_selections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text" NOT NULL,
    "door_width_cm" integer NOT NULL,
    "door_height_cm" integer NOT NULL,
    "usage_location" "text",
    "sector" "text",
    "wind_condition" "text",
    "traffic_intensity" "text",
    "heating_needed" "text",
    "climate_zone" "text",
    "calculated_airflow_m3h" integer,
    "calculated_nozzle_velocity" numeric(5,2),
    "calculated_power_w" integer,
    "recommended_series" "text",
    "recommended_product_ids" "uuid"[],
    "selected_product_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    "order_id" "uuid",
    "tenant_id" "uuid" DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::"uuid" NOT NULL
);


ALTER TABLE "public"."wizard_selections" OWNER TO "postgres";


COMMENT ON TABLE "public"."wizard_selections" IS 'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı | @graphql({"disabled": true})';



COMMENT ON COLUMN "public"."wizard_selections"."session_id" IS 'Anonim kullanıcılar için oturum tanımlayıcı';



COMMENT ON COLUMN "public"."wizard_selections"."calculated_airflow_m3h" IS 'Formül ile hesaplanan gerekli debi (m³/h)';



COMMENT ON COLUMN "public"."wizard_selections"."order_id" IS 'Bu seçimle ilişkilendirilen sipariş (varsa)';



ALTER TABLE ONLY "public"."returns_webhook_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."returns_webhook_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."search_reindex_queue" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."search_reindex_queue_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."shipping_webhook_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shipping_webhook_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."_migration_ledger"
    ADD CONSTRAINT "_migration_ledger_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_tenant_id_slug_key" UNIQUE ("tenant_id", "slug");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."category_mapping_rules"
    ADD CONSTRAINT "category_mapping_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_errors"
    ADD CONSTRAINT "client_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."currency_rates"
    ADD CONSTRAINT "currency_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_subject_requests"
    ADD CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_groups"
    ADD CONSTRAINT "error_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_groups"
    ADD CONSTRAINT "error_groups_signature_key" UNIQUE ("signature");



ALTER TABLE ONLY "public"."goods_receipts"
    ADD CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goods_receipts"
    ADD CONSTRAINT "goods_receipts_po_document_uniq" UNIQUE ("po_id", "document_no");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_settings"
    ADD CONSTRAINT "inventory_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_attachments"
    ADD CONSTRAINT "order_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_email_events"
    ADD CONSTRAINT "order_email_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_invoices"
    ADD CONSTRAINT "order_invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_number_counters"
    ADD CONSTRAINT "order_number_counters_pkey" PRIMARY KEY ("gun");



ALTER TABLE ONLY "public"."order_refund_events"
    ADD CONSTRAINT "order_refund_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_transaction_id_key" UNIQUE ("transaction_id");



ALTER TABLE ONLY "public"."price_lists"
    ADD CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_policy"
    ADD CONSTRAINT "pricing_policy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_authorities"
    ADD CONSTRAINT "product_authorities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_costs"
    ADD CONSTRAINT "product_costs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."product_costs"
    ADD CONSTRAINT "product_costs_pkey" PRIMARY KEY ("product_id");



ALTER TABLE ONLY "public"."product_costs"
    ADD CONSTRAINT "product_costs_product_tenant_uk" UNIQUE ("product_id", "tenant_id");



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_tenant_id_slug_key" UNIQUE ("tenant_id", "slug");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_prices"
    ADD CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_prices"
    ADD CONSTRAINT "product_prices_unique" UNIQUE ("product_id", "price_list_id", "currency", "valid_from");



COMMENT ON CONSTRAINT "product_prices_unique" ON "public"."product_prices" IS 'Cache tekil anahtarı: (ürün, fiyat listesi, PARA BİRİMİ, geçerlilik başlangıcı) — cetvel §8.1.';



ALTER TABLE ONLY "public"."product_search_index"
    ADD CONSTRAINT "product_search_index_pkey" PRIMARY KEY ("product_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_id_tenant_uk" UNIQUE ("id", "tenant_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."project_items"
    ADD CONSTRAINT "project_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_items"
    ADD CONSTRAINT "project_items_project_id_product_id_key" UNIQUE ("project_id", "product_id");



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_po_product_uniq" UNIQUE ("po_id", "product_id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_email_events"
    ADD CONSTRAINT "quote_email_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_number_counters"
    ADD CONSTRAINT "quote_number_counters_pkey" PRIMARY KEY ("tenant_id", "gun");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key", "bucket");



ALTER TABLE ONLY "public"."refund_attempts"
    ADD CONSTRAINT "refund_attempts_key_uniq" UNIQUE ("order_id", "idempotency_key");



ALTER TABLE ONLY "public"."refund_attempts"
    ADD CONSTRAINT "refund_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."returns_webhook_events"
    ADD CONSTRAINT "returns_webhook_events_event_id_key" UNIQUE ("event_id");



ALTER TABLE ONLY "public"."returns_webhook_events"
    ADD CONSTRAINT "returns_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_reindex_queue"
    ADD CONSTRAINT "search_reindex_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_email_events"
    ADD CONSTRAINT "shipping_email_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_idempotency"
    ADD CONSTRAINT "shipping_idempotency_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."shipping_webhook_events"
    ADD CONSTRAINT "shipping_webhook_events_event_id_key" UNIQUE ("event_id");



ALTER TABLE ONLY "public"."shipping_webhook_events"
    ADD CONSTRAINT "shipping_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopping_carts"
    ADD CONSTRAINT "shopping_carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_tenant_name_uniq" UNIQUE ("tenant_id", "name");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."url_takma_adlari"
    ADD CONSTRAINT "url_takma_adlari_pkey" PRIMARY KEY ("tenant_id", "tur", "dil", "eski_slug");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_invoice_profiles"
    ADD CONSTRAINT "user_invoice_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_projects"
    ADD CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venthub_order_items"
    ADD CONSTRAINT "venthub_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venthub_orders"
    ADD CONSTRAINT "venthub_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."venthub_orders"
    ADD CONSTRAINT "venthub_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venthub_quote_items"
    ADD CONSTRAINT "venthub_quote_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venthub_returns"
    ADD CONSTRAINT "venthub_returns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wizard_selections"
    ADD CONSTRAINT "wizard_selections_pkey" PRIMARY KEY ("id");



CREATE INDEX "brands_tenant_id_idx" ON "public"."brands" USING "btree" ("tenant_id");



CREATE UNIQUE INDEX "cart_items_cart_product_unique" ON "public"."cart_items" USING "btree" ("cart_id", "product_id");



CREATE INDEX "categories_tenant_id_idx" ON "public"."categories" USING "btree" ("tenant_id");



CREATE INDEX "currency_rates_latest_idx" ON "public"."currency_rates" USING "btree" ("tenant_id", "quote_ccy", "effective_date" DESC, "fetched_at" DESC);



CREATE UNIQUE INDEX "currency_rates_tcmb_daily_uq" ON "public"."currency_rates" USING "btree" ("tenant_id", "quote_ccy", "effective_date") WHERE ("source" = 'tcmb'::"text");



CREATE INDEX "goods_receipts_po_idx" ON "public"."goods_receipts" USING "btree" ("po_id");



CREATE INDEX "idx_admin_audit_log_tenant_id" ON "public"."admin_audit_log" USING "btree" ("tenant_id");



CREATE INDEX "idx_cart_items_price_list_id" ON "public"."cart_items" USING "btree" ("price_list_id");



CREATE INDEX "idx_cart_items_product_id" ON "public"."cart_items" USING "btree" ("product_id");



CREATE INDEX "idx_cart_items_tenant_id" ON "public"."cart_items" USING "btree" ("tenant_id");



CREATE INDEX "idx_categories_menu_label" ON "public"."categories" USING "btree" ("menu_label");



CREATE INDEX "idx_categories_parent_id" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_category_mapping_rules_target_subcategory" ON "public"."category_mapping_rules" USING "btree" ("target_subcategory_id");



CREATE INDEX "idx_client_errors_at" ON "public"."client_errors" USING "btree" ("at");



CREATE INDEX "idx_client_errors_group_id" ON "public"."client_errors" USING "btree" ("group_id");



CREATE INDEX "idx_coupons_active_valid" ON "public"."coupons" USING "btree" ("is_active", "valid_from", "valid_until") WHERE ("is_active" = true);



CREATE INDEX "idx_coupons_code" ON "public"."coupons" USING "btree" ("code");



CREATE INDEX "idx_coupons_created_by" ON "public"."coupons" USING "btree" ("created_by");



CREATE INDEX "idx_coupons_tenant_id" ON "public"."coupons" USING "btree" ("tenant_id");



CREATE INDEX "idx_dsr_status_due" ON "public"."data_subject_requests" USING "btree" ("status", "due_at");



CREATE INDEX "idx_dsr_user" ON "public"."data_subject_requests" USING "btree" ("user_id");



CREATE INDEX "idx_error_groups_assigned_to" ON "public"."error_groups" USING "btree" ("assigned_to");



CREATE INDEX "idx_inventory_movements_batch_id" ON "public"."inventory_movements" USING "btree" ("batch_id");



CREATE INDEX "idx_inventory_movements_original_id" ON "public"."inventory_movements" USING "btree" ("original_movement_id");



CREATE INDEX "idx_inventory_movements_product_id" ON "public"."inventory_movements" USING "btree" ("product_id");



CREATE INDEX "idx_inventory_movements_reversed_by" ON "public"."inventory_movements" USING "btree" ("reversed_by_movement_id");



CREATE INDEX "idx_inventory_movements_tenant_id" ON "public"."inventory_movements" USING "btree" ("tenant_id");



CREATE INDEX "idx_inventory_settings_tenant_id" ON "public"."inventory_settings" USING "btree" ("tenant_id");



CREATE INDEX "idx_order_attachments_created_by" ON "public"."order_attachments" USING "btree" ("created_by");



CREATE INDEX "idx_order_attachments_order_id" ON "public"."order_attachments" USING "btree" ("order_id");



CREATE INDEX "idx_order_attachments_tenant_id" ON "public"."order_attachments" USING "btree" ("tenant_id");



CREATE INDEX "idx_order_email_events_order_id" ON "public"."order_email_events" USING "btree" ("order_id");



CREATE INDEX "idx_order_email_events_order_kind" ON "public"."order_email_events" USING "btree" ("order_id", "kind", "created_at" DESC);



CREATE INDEX "idx_order_notes_order_id" ON "public"."order_notes" USING "btree" ("order_id");



CREATE INDEX "idx_order_notes_tenant_id" ON "public"."order_notes" USING "btree" ("tenant_id");



CREATE INDEX "idx_order_notes_user_id" ON "public"."order_notes" USING "btree" ("user_id");



CREATE INDEX "idx_order_refund_events_tenant_id" ON "public"."order_refund_events" USING "btree" ("tenant_id");



CREATE INDEX "idx_payment_transactions_order_id" ON "public"."payment_transactions" USING "btree" ("order_id");



CREATE INDEX "idx_payment_transactions_user_id" ON "public"."payment_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_price_lists_tenant_id" ON "public"."price_lists" USING "btree" ("tenant_id");



CREATE INDEX "idx_product_authorities_product_id" ON "public"."product_authorities" USING "btree" ("product_id");



CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_product_prices_price_list_id" ON "public"."product_prices" USING "btree" ("price_list_id");



CREATE INDEX "idx_product_prices_tenant_id" ON "public"."product_prices" USING "btree" ("tenant_id");



CREATE INDEX "idx_products_brand_trgm" ON "public"."products" USING "gin" ("brand" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_featured" ON "public"."products" USING "btree" ("is_featured") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_products_name_trgm" ON "public"."products" USING "gin" ("name" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_products_subcategory_id" ON "public"."products" USING "btree" ("subcategory_id");



CREATE INDEX "idx_project_items_product_id" ON "public"."project_items" USING "btree" ("product_id");



CREATE INDEX "idx_quote_email_events_quote" ON "public"."quote_email_events" USING "btree" ("quote_id", "created_at" DESC);



CREATE INDEX "idx_returns_webhook_events_tenant_id" ON "public"."returns_webhook_events" USING "btree" ("tenant_id");



CREATE INDEX "idx_shipping_email_events_order_id" ON "public"."shipping_email_events" USING "btree" ("order_id");



CREATE INDEX "idx_shipping_email_events_tenant_id" ON "public"."shipping_email_events" USING "btree" ("tenant_id");



CREATE INDEX "idx_shipping_webhook_events_tenant_id" ON "public"."shipping_webhook_events" USING "btree" ("tenant_id");



CREATE INDEX "idx_shopping_carts_tenant_id" ON "public"."shopping_carts" USING "btree" ("tenant_id");



CREATE UNIQUE INDEX "idx_shopping_carts_user_unique" ON "public"."shopping_carts" USING "btree" ("user_id");



CREATE INDEX "idx_site_settings_updated_by" ON "public"."site_settings" USING "btree" ("updated_by");



CREATE INDEX "idx_user_addresses_tenant_id" ON "public"."user_addresses" USING "btree" ("tenant_id");



CREATE INDEX "idx_user_invoice_profiles_tenant_id" ON "public"."user_invoice_profiles" USING "btree" ("tenant_id");



CREATE INDEX "idx_user_invoice_profiles_user_id" ON "public"."user_invoice_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_tenant_id" ON "public"."user_profiles" USING "btree" ("tenant_id");



CREATE INDEX "idx_user_projects_user_id" ON "public"."user_projects" USING "btree" ("user_id");



CREATE INDEX "idx_venthub_order_items_order_id" ON "public"."venthub_order_items" USING "btree" ("order_id");



CREATE INDEX "idx_venthub_order_items_product_id" ON "public"."venthub_order_items" USING "btree" ("product_id");



CREATE INDEX "idx_venthub_order_items_tenant_id" ON "public"."venthub_order_items" USING "btree" ("tenant_id");



CREATE INDEX "idx_venthub_orders_tenant_id" ON "public"."venthub_orders" USING "btree" ("tenant_id");



CREATE INDEX "idx_venthub_orders_user_id" ON "public"."venthub_orders" USING "btree" ("user_id");



CREATE INDEX "idx_venthub_quote_items_quote" ON "public"."venthub_quote_items" USING "btree" ("quote_id");



CREATE INDEX "idx_venthub_quotes_created" ON "public"."venthub_quotes" USING "btree" ("created_at");



CREATE INDEX "idx_venthub_quotes_root" ON "public"."venthub_quotes" USING "btree" ("root_quote_id");



CREATE INDEX "idx_venthub_quotes_status" ON "public"."venthub_quotes" USING "btree" ("status");



CREATE INDEX "idx_venthub_quotes_user" ON "public"."venthub_quotes" USING "btree" ("user_id");



CREATE INDEX "idx_venthub_quotes_valid_until" ON "public"."venthub_quotes" USING "btree" ("valid_until");



CREATE INDEX "idx_venthub_returns_order_id" ON "public"."venthub_returns" USING "btree" ("order_id");



CREATE INDEX "idx_venthub_returns_tenant_id" ON "public"."venthub_returns" USING "btree" ("tenant_id");



CREATE INDEX "idx_venthub_returns_user_id" ON "public"."venthub_returns" USING "btree" ("user_id");



CREATE INDEX "idx_wizard_selections_created_at" ON "public"."wizard_selections" USING "btree" ("created_at");



CREATE INDEX "idx_wizard_selections_order_id" ON "public"."wizard_selections" USING "btree" ("order_id");



CREATE INDEX "idx_wizard_selections_selected_product_id" ON "public"."wizard_selections" USING "btree" ("selected_product_id");



CREATE INDEX "idx_wizard_selections_session_id" ON "public"."wizard_selections" USING "btree" ("session_id");



CREATE INDEX "idx_wizard_selections_tenant_id" ON "public"."wizard_selections" USING "btree" ("tenant_id");



CREATE INDEX "idx_wizard_selections_user_id" ON "public"."wizard_selections" USING "btree" ("user_id");



CREATE INDEX "inventory_movements_goods_receipt_idx" ON "public"."inventory_movements" USING "btree" ("goods_receipt_id") WHERE ("goods_receipt_id" IS NOT NULL);



CREATE UNIQUE INDEX "inventory_movements_order_product_reason_key" ON "public"."inventory_movements" USING "btree" ("order_id", "product_id", "reason") WHERE ("order_id" IS NOT NULL);



CREATE UNIQUE INDEX "order_invoices_invoice_no_uniq" ON "public"."order_invoices" USING "btree" ("lower"("btrim"("invoice_no")));



CREATE INDEX "order_invoices_order_id_idx" ON "public"."order_invoices" USING "btree" ("order_id");



CREATE INDEX "pricing_policy_brand_idx" ON "public"."pricing_policy" USING "btree" ("brand_id") WHERE ("brand_id" IS NOT NULL);



CREATE INDEX "pricing_policy_category_idx" ON "public"."pricing_policy" USING "btree" ("category_id") WHERE ("category_id" IS NOT NULL);



CREATE INDEX "pricing_policy_product_idx" ON "public"."pricing_policy" USING "btree" ("product_id") WHERE ("product_id" IS NOT NULL);



CREATE INDEX "pricing_policy_tenant_scope_idx" ON "public"."pricing_policy" USING "btree" ("tenant_id", "scope", "priority" DESC);



CREATE INDEX "pricing_rule_brand_idx" ON "public"."pricing_rule" USING "btree" ("brand_id") WHERE ("brand_id" IS NOT NULL);



CREATE INDEX "pricing_rule_category_idx" ON "public"."pricing_rule" USING "btree" ("category_id") WHERE ("category_id" IS NOT NULL);



CREATE INDEX "pricing_rule_product_idx" ON "public"."pricing_rule" USING "btree" ("product_id") WHERE ("product_id" IS NOT NULL);



CREATE INDEX "pricing_rule_tenant_scope_idx" ON "public"."pricing_rule" USING "btree" ("tenant_id", "scope", "priority" DESC);



CREATE INDEX "product_authorities_tenant_id_idx" ON "public"."product_authorities" USING "btree" ("tenant_id");



CREATE INDEX "product_families_brand_id_idx" ON "public"."product_families" USING "btree" ("brand_id");



CREATE INDEX "product_families_category_idx" ON "public"."product_families" USING "btree" ("category_id", "subcategory_id");



CREATE INDEX "product_families_name_i18n_gin" ON "public"."product_families" USING "gin" ("name_i18n" "jsonb_path_ops");



CREATE INDEX "product_families_parent_idx" ON "public"."product_families" USING "btree" ("parent_family_id") WHERE ("parent_family_id" IS NOT NULL);



CREATE INDEX "product_families_tenant_id_idx" ON "public"."product_families" USING "btree" ("tenant_id");



CREATE INDEX "product_images_tenant_id_idx" ON "public"."product_images" USING "btree" ("tenant_id");



CREATE INDEX "product_search_index_arama_ek_pgroonga" ON "public"."product_search_index" USING "pgroonga" ("arama_ek") WITH ("tokenizer"='TokenBigramSplitSymbolAlphaDigit', "normalizer"='NormalizerAuto');



CREATE INDEX "product_search_index_arama_kelime_pgroonga" ON "public"."product_search_index" USING "pgroonga" ("arama_kelime");



CREATE INDEX "product_search_index_body_trgm" ON "public"."product_search_index" USING "gin" ("search_body" "extensions"."gin_trgm_ops");



CREATE INDEX "product_search_index_document_gin" ON "public"."product_search_index" USING "gin" ("search_document");



CREATE INDEX "product_search_index_tenant_idx" ON "public"."product_search_index" USING "btree" ("tenant_id");



CREATE INDEX "products_family_id_idx" ON "public"."products" USING "btree" ("family_id");



CREATE INDEX "products_technical_specs_gin" ON "public"."products" USING "gin" ("technical_specs" "jsonb_path_ops");



CREATE INDEX "products_tenant_id_idx" ON "public"."products" USING "btree" ("tenant_id");



CREATE INDEX "purchase_order_items_po_idx" ON "public"."purchase_order_items" USING "btree" ("po_id");



CREATE INDEX "purchase_order_items_product_idx" ON "public"."purchase_order_items" USING "btree" ("product_id");



CREATE INDEX "purchase_orders_supplier_idx" ON "public"."purchase_orders" USING "btree" ("supplier_id");



CREATE INDEX "purchase_orders_tenant_status_idx" ON "public"."purchase_orders" USING "btree" ("tenant_id", "status");



CREATE INDEX "rate_limits_bucket_idx" ON "public"."rate_limits" USING "btree" ("bucket");



CREATE INDEX "refund_attempts_created_idx" ON "public"."refund_attempts" USING "btree" ("created_at");



CREATE INDEX "refund_attempts_order_idx" ON "public"."refund_attempts" USING "btree" ("order_id");



CREATE INDEX "refund_attempts_state_idx" ON "public"."refund_attempts" USING "btree" ("state") WHERE ("state" = 'in_flight'::"text");



CREATE INDEX "returns_webhook_events_received_at_idx" ON "public"."returns_webhook_events" USING "btree" ("received_at" DESC);



CREATE INDEX "returns_webhook_events_return_id_idx" ON "public"."returns_webhook_events" USING "btree" ("return_id");



CREATE UNIQUE INDEX "search_reindex_queue_tekil" ON "public"."search_reindex_queue" USING "btree" ("kapsam", "ref_id");



CREATE INDEX "shipping_email_events_created_at_idx" ON "public"."shipping_email_events" USING "btree" ("created_at" DESC);



CREATE INDEX "shipping_idempotency_created_at_idx" ON "public"."shipping_idempotency" USING "btree" ("created_at");



CREATE UNIQUE INDEX "uq_order_email_events_sent_once" ON "public"."order_email_events" USING "btree" ("order_id", "kind") WHERE ("status" = 'sent'::"text");



CREATE UNIQUE INDEX "uq_products_slug_lower" ON "public"."products" USING "btree" ("lower"("slug"));



CREATE UNIQUE INDEX "uq_venthub_quotes_converted_order" ON "public"."venthub_quotes" USING "btree" ("converted_order_id") WHERE ("converted_order_id" IS NOT NULL);



CREATE UNIQUE INDEX "uq_venthub_quotes_tenant_quote_no" ON "public"."venthub_quotes" USING "btree" ("tenant_id", "quote_no") WHERE ("quote_no" IS NOT NULL);



CREATE INDEX "url_takma_adlari_hedef_idx" ON "public"."url_takma_adlari" USING "btree" ("tenant_id", "tur", "hedef_id");



CREATE UNIQUE INDEX "user_addresses_one_default_billing" ON "public"."user_addresses" USING "btree" ("user_id") WHERE "is_default_billing";



CREATE UNIQUE INDEX "user_addresses_one_default_shipping" ON "public"."user_addresses" USING "btree" ("user_id") WHERE "is_default_shipping";



CREATE OR REPLACE TRIGGER "arama_aile_kuyrukla" AFTER UPDATE OF "name", "name_i18n" ON "public"."product_families" FOR EACH ROW WHEN ((("old"."name" IS DISTINCT FROM "new"."name") OR ("old"."name_i18n" IS DISTINCT FROM "new"."name_i18n"))) EXECUTE FUNCTION "public"."tg_arama_aile_kuyrukla"();



CREATE OR REPLACE TRIGGER "arama_kategori_kuyrukla" AFTER UPDATE OF "name" ON "public"."categories" FOR EACH ROW WHEN (("old"."name" IS DISTINCT FROM "new"."name")) EXECUTE FUNCTION "public"."tg_arama_kategori_kuyrukla"();



CREATE OR REPLACE TRIGGER "arama_metin_doldur" BEFORE INSERT OR UPDATE OF "search_body" ON "public"."product_search_index" FOR EACH ROW EXECUTE FUNCTION "public"."tg_arama_metin_doldur"();



CREATE OR REPLACE TRIGGER "arama_urun_tazele" AFTER INSERT OR UPDATE OF "name", "name_i18n", "model_code", "sku", "brand", "description_i18n", "technical_specs", "family_id", "category_id", "subcategory_id", "status", "deleted_at", "tenant_id" ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."tg_arama_urun_tazele"();



CREATE OR REPLACE TRIGGER "brands_set_updated_at" BEFORE UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."tg_set_updated_at"();



CREATE OR REPLACE TRIGGER "cart_items_updated_at" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "categories_set_level" BEFORE INSERT OR UPDATE OF "parent_id" ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."tg_categories_set_level"();



CREATE OR REPLACE TRIGGER "denetim_izi_brands" AFTER INSERT OR DELETE OR UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_categories" AFTER INSERT OR DELETE OR UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_product_families" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_families" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_product_images" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_images" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_products" AFTER INSERT OR DELETE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_products_upd" AFTER UPDATE OF "name", "name_i18n", "brand", "price", "sku", "category_id", "subcategory_id", "status", "is_featured", "technical_specs", "purchase_price", "purchase_currency", "slug", "model_code", "family_id", "barcode", "tax_rate", "is_taxable", "weight_kg", "width_mm", "height_mm", "depth_mm", "description_i18n", "deleted_at", "warehouse_location", "supplier_name", "tenant_id" ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "denetim_izi_site_settings" AFTER INSERT OR DELETE OR UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."denetim_izi_yaz"();



CREATE OR REPLACE TRIGGER "on_brands_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_categories_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_inventory_movements_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."inventory_movements" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_price_lists_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."price_lists" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_product_families_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_families" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_product_images_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_images" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_product_prices_ins_del" AFTER INSERT OR DELETE ON "public"."product_prices" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_product_prices_upd" AFTER UPDATE ON "public"."product_prices" FOR EACH ROW WHEN ((("old"."net_price" IS DISTINCT FROM "new"."net_price") OR ("old"."gross_price" IS DISTINCT FROM "new"."gross_price") OR ("old"."is_active" IS DISTINCT FROM "new"."is_active") OR ("old"."currency" IS DISTINCT FROM "new"."currency"))) EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "on_products_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."handle_supabase_webhook"();



CREATE OR REPLACE TRIGGER "organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "price_lists_updated_at" BEFORE UPDATE ON "public"."price_lists" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "product_families_set_updated_at" BEFORE UPDATE ON "public"."product_families" FOR EACH ROW EXECUTE FUNCTION "public"."tg_set_updated_at"();



CREATE OR REPLACE TRIGGER "product_families_single_level" BEFORE INSERT OR UPDATE OF "parent_family_id" ON "public"."product_families" FOR EACH ROW EXECUTE FUNCTION "public"."product_families_single_level_guard"();



CREATE OR REPLACE TRIGGER "product_prices_updated_at" BEFORE UPDATE ON "public"."product_prices" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "products_set_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."tg_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_order_number_trigger" BEFORE INSERT ON "public"."venthub_orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_order_number"();



CREATE OR REPLACE TRIGGER "shopping_carts_updated_at" BEFORE UPDATE ON "public"."shopping_carts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_cart_items_set_updated_at" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_enforce_quote_status_transition" BEFORE INSERT OR UPDATE ON "public"."venthub_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_quote_status_transition"();



CREATE OR REPLACE TRIGGER "trg_enforce_role_change" BEFORE INSERT OR UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_role_change"();



CREATE OR REPLACE TRIGGER "trg_invoice_requires_paid_order" BEFORE INSERT ON "public"."order_invoices" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_invoice_only_for_paid_order"();



CREATE OR REPLACE TRIGGER "trg_normalize_product_threshold_overrides" AFTER INSERT OR UPDATE ON "public"."inventory_settings" FOR EACH ROW EXECUTE FUNCTION "public"."normalize_product_threshold_overrides"();



CREATE OR REPLACE TRIGGER "trg_notify_order_paid" AFTER UPDATE ON "public"."venthub_orders" FOR EACH ROW WHEN ((("old"."paid_at" IS NULL) AND ("new"."paid_at" IS NOT NULL))) EXECUTE FUNCTION "public"."notify_order_paid"();



CREATE OR REPLACE TRIGGER "trg_notify_quote_published" AFTER UPDATE ON "public"."venthub_quotes" FOR EACH ROW WHEN ((("old"."status" = 'draft'::"text") AND ("new"."status" = 'quoted'::"text"))) EXECUTE FUNCTION "public"."notify_quote_published"();



CREATE OR REPLACE TRIGGER "trg_notify_quote_request_created" AFTER INSERT ON "public"."venthub_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."notify_quote_request_created"();



CREATE OR REPLACE TRIGGER "trg_product_costs_senkron_ins" AFTER INSERT ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."product_costs_senkron"();



CREATE OR REPLACE TRIGGER "trg_product_costs_senkron_upd" AFTER UPDATE OF "purchase_price", "purchase_currency", "purchase_rate_to_base", "cost_in_base", "last_purchase_cost", "last_purchase_currency", "last_purchased_at", "supplier_name", "tenant_id" ON "public"."products" FOR EACH ROW WHEN ((("old"."purchase_price" IS DISTINCT FROM "new"."purchase_price") OR (("old"."purchase_currency")::"text" IS DISTINCT FROM ("new"."purchase_currency")::"text") OR ("old"."purchase_rate_to_base" IS DISTINCT FROM "new"."purchase_rate_to_base") OR ("old"."cost_in_base" IS DISTINCT FROM "new"."cost_in_base") OR ("old"."last_purchase_cost" IS DISTINCT FROM "new"."last_purchase_cost") OR ("old"."last_purchase_currency" IS DISTINCT FROM "new"."last_purchase_currency") OR ("old"."last_purchased_at" IS DISTINCT FROM "new"."last_purchased_at") OR ("old"."supplier_name" IS DISTINCT FROM "new"."supplier_name") OR ("old"."tenant_id" IS DISTINCT FROM "new"."tenant_id"))) EXECUTE FUNCTION "public"."product_costs_senkron"();



CREATE OR REPLACE TRIGGER "trg_product_prices_computed_at" BEFORE INSERT OR UPDATE ON "public"."product_prices" FOR EACH ROW EXECUTE FUNCTION "public"."touch_product_prices_computed_at"();



CREATE OR REPLACE TRIGGER "trg_quote_items_durum_kilidi" BEFORE INSERT OR DELETE OR UPDATE ON "public"."venthub_quote_items" FOR EACH ROW EXECUTE FUNCTION "public"."quote_items_durum_kilidi"();



CREATE OR REPLACE TRIGGER "trg_stamp_order_paid_at" BEFORE UPDATE ON "public"."venthub_orders" FOR EACH ROW EXECUTE FUNCTION "public"."stamp_order_paid_at"();



CREATE OR REPLACE TRIGGER "trg_stamp_quote_published" BEFORE UPDATE ON "public"."venthub_quotes" FOR EACH ROW WHEN ((("old"."status" = 'draft'::"text") AND ("new"."status" = 'quoted'::"text"))) EXECUTE FUNCTION "public"."stamp_quote_published"();



CREATE OR REPLACE TRIGGER "trg_sync_payment_status_ins" BEFORE INSERT ON "public"."venthub_orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_payment_status_with_status"();



CREATE OR REPLACE TRIGGER "trg_sync_payment_status_upd" BEFORE UPDATE OF "status" ON "public"."venthub_orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_payment_status_with_status"();



CREATE OR REPLACE TRIGGER "trg_user_invoice_profiles_single_default" BEFORE INSERT OR UPDATE ON "public"."user_invoice_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."user_invoice_profiles_ensure_single_default"();



CREATE OR REPLACE TRIGGER "trg_user_invoice_profiles_updated_at" BEFORE UPDATE ON "public"."user_invoice_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "trg_venthub_quote_items_updated_at" BEFORE UPDATE ON "public"."venthub_quote_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_venthub_quotes_updated_at" BEFORE UPDATE ON "public"."venthub_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_venthub_returns_updated_at" BEFORE UPDATE ON "public"."venthub_returns" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_coupons_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_order_notes_updated_at" BEFORE UPDATE ON "public"."order_notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_venthub_orders_updated_at" BEFORE UPDATE ON "public"."venthub_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "url_takma_ad_aile" AFTER UPDATE OF "slug" ON "public"."product_families" FOR EACH ROW WHEN (("old"."slug" IS DISTINCT FROM "new"."slug")) EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "url_takma_ad_aile_ekle" AFTER INSERT ON "public"."product_families" FOR EACH ROW EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "url_takma_ad_kategori" AFTER UPDATE OF "slug", "metadata" ON "public"."categories" FOR EACH ROW WHEN ((("old"."slug" IS DISTINCT FROM "new"."slug") OR (("old"."metadata" -> 'slug'::"text") IS DISTINCT FROM ("new"."metadata" -> 'slug'::"text")))) EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "url_takma_ad_kategori_ekle" AFTER INSERT ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "url_takma_ad_urun" AFTER UPDATE OF "slug", "sku" ON "public"."products" FOR EACH ROW WHEN ((("old"."slug" IS DISTINCT FROM "new"."slug") OR ("old"."sku" IS DISTINCT FROM "new"."sku"))) EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "url_takma_ad_urun_ekle" AFTER INSERT ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."tg_url_takma_ad_yaz"();



CREATE OR REPLACE TRIGGER "user_addresses_set_timestamp" BEFORE UPDATE ON "public"."user_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."shopping_carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."category_mapping_rules"
    ADD CONSTRAINT "category_mapping_rules_target_subcategory_id_fkey" FOREIGN KEY ("target_subcategory_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."client_errors"
    ADD CONSTRAINT "client_errors_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."error_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."currency_rates"
    ADD CONSTRAINT "currency_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."data_subject_requests"
    ADD CONSTRAINT "data_subject_requests_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."data_subject_requests"
    ADD CONSTRAINT "data_subject_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."error_groups"
    ADD CONSTRAINT "error_groups_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."goods_receipts"
    ADD CONSTRAINT "goods_receipts_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."goods_receipts"
    ADD CONSTRAINT "goods_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "public"."goods_receipts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_settings"
    ADD CONSTRAINT "inventory_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_attachments"
    ADD CONSTRAINT "order_attachments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_attachments"
    ADD CONSTRAINT "order_attachments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_attachments"
    ADD CONSTRAINT "order_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_email_events"
    ADD CONSTRAINT "order_email_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_invoices"
    ADD CONSTRAINT "order_invoices_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_invoices"
    ADD CONSTRAINT "order_invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_refund_events"
    ADD CONSTRAINT "order_refund_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."price_lists"
    ADD CONSTRAINT "price_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_policy"
    ADD CONSTRAINT "pricing_policy_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_policy"
    ADD CONSTRAINT "pricing_policy_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_policy"
    ADD CONSTRAINT "pricing_policy_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_policy"
    ADD CONSTRAINT "pricing_policy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_price_book_id_fkey" FOREIGN KEY ("price_book_id") REFERENCES "public"."price_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_rule"
    ADD CONSTRAINT "pricing_rule_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_authorities"
    ADD CONSTRAINT "product_authorities_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_authorities"
    ADD CONSTRAINT "product_authorities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_costs"
    ADD CONSTRAINT "product_costs_product_fk" FOREIGN KEY ("product_id", "tenant_id") REFERENCES "public"."products"("id", "tenant_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_parent_family_id_fkey" FOREIGN KEY ("parent_family_id") REFERENCES "public"."product_families"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_families"
    ADD CONSTRAINT "product_families_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_prices"
    ADD CONSTRAINT "product_prices_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_prices"
    ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_prices"
    ADD CONSTRAINT "product_prices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_search_index"
    ADD CONSTRAINT "product_search_index_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."product_families"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."project_items"
    ADD CONSTRAINT "project_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_items"
    ADD CONSTRAINT "project_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."user_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."quote_email_events"
    ADD CONSTRAINT "quote_email_events_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."venthub_quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refund_attempts"
    ADD CONSTRAINT "refund_attempts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refund_attempts"
    ADD CONSTRAINT "refund_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."returns_webhook_events"
    ADD CONSTRAINT "returns_webhook_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_email_events"
    ADD CONSTRAINT "shipping_email_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_email_events"
    ADD CONSTRAINT "shipping_email_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_webhook_events"
    ADD CONSTRAINT "shipping_webhook_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_carts"
    ADD CONSTRAINT "shopping_carts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_carts"
    ADD CONSTRAINT "shopping_carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_invoice_profiles"
    ADD CONSTRAINT "user_invoice_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_invoice_profiles"
    ADD CONSTRAINT "user_invoice_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_projects"
    ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_order_items"
    ADD CONSTRAINT "venthub_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_order_items"
    ADD CONSTRAINT "venthub_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."venthub_order_items"
    ADD CONSTRAINT "venthub_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_orders"
    ADD CONSTRAINT "venthub_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_orders"
    ADD CONSTRAINT "venthub_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_quote_items"
    ADD CONSTRAINT "venthub_quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."venthub_quote_items"
    ADD CONSTRAINT "venthub_quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."venthub_quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_quote_items"
    ADD CONSTRAINT "venthub_quote_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_accept_confirmed_by_fkey" FOREIGN KEY ("accept_confirmed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_accept_recorded_by_fkey" FOREIGN KEY ("accept_recorded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_amended_from_fkey" FOREIGN KEY ("amended_from") REFERENCES "public"."venthub_quotes"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_converted_order_id_fkey" FOREIGN KEY ("converted_order_id") REFERENCES "public"."venthub_orders"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_root_quote_id_fkey" FOREIGN KEY ("root_quote_id") REFERENCES "public"."venthub_quotes"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_source_project_id_fkey" FOREIGN KEY ("source_project_id") REFERENCES "public"."user_projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_superseded_by_fkey" FOREIGN KEY ("superseded_by") REFERENCES "public"."venthub_quotes"("id");



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_quotes"
    ADD CONSTRAINT "venthub_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_returns"
    ADD CONSTRAINT "venthub_returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_returns"
    ADD CONSTRAINT "venthub_returns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venthub_returns"
    ADD CONSTRAINT "venthub_returns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wizard_selections"
    ADD CONSTRAINT "wizard_selections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."venthub_orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wizard_selections"
    ADD CONSTRAINT "wizard_selections_selected_product_id_fkey" FOREIGN KEY ("selected_product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wizard_selections"
    ADD CONSTRAINT "wizard_selections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wizard_selections"
    ADD CONSTRAINT "wizard_selections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can view messages" ON "public"."contact_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))));



CREATE POLICY "Anyone can view organizations" ON "public"."organizations" FOR SELECT USING (true);



CREATE POLICY "Product authorities are manageable by admins." ON "public"."product_authorities" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))));



CREATE POLICY "Users can delete items from their projects" ON "public"."project_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_projects"
  WHERE (("user_projects"."id" = "project_items"."project_id") AND ("user_projects"."user_id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid"))))));



CREATE POLICY "Users can delete their own projects" ON "public"."user_projects" FOR DELETE USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") = "user_id"));



CREATE POLICY "Users can insert items in their projects" ON "public"."project_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_projects"
  WHERE (("user_projects"."id" = "project_items"."project_id") AND ("user_projects"."user_id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid"))))));



CREATE POLICY "Users can insert their own projects" ON "public"."user_projects" FOR INSERT WITH CHECK ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") = "user_id"));



CREATE POLICY "Users can update items in their projects" ON "public"."project_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_projects"
  WHERE (("user_projects"."id" = "project_items"."project_id") AND ("user_projects"."user_id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid"))))));



CREATE POLICY "Users can update their own projects" ON "public"."user_projects" FOR UPDATE USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") = "user_id"));



CREATE POLICY "Users can view items in their projects" ON "public"."project_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_projects"
  WHERE (("user_projects"."id" = "project_items"."project_id") AND ("user_projects"."user_id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid"))))));



CREATE POLICY "Users can view their own projects" ON "public"."user_projects" FOR SELECT USING ((( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") = "user_id"));



ALTER TABLE "public"."_migration_ledger" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_audit_log_insert_v2" ON "public"."admin_audit_log" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "admin_audit_log_select_v2" ON "public"."admin_audit_log" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "admin_audit_log_service_role" ON "public"."admin_audit_log" TO "service_role" USING (true);



CREATE POLICY "admins_read_client_errors" ON "public"."client_errors" FOR SELECT TO "authenticated" USING ("public"."is_admin_user"());



COMMENT ON POLICY "admins_read_client_errors" ON "public"."client_errors" IS 'T136-VH (2026-08-20): 20260225_admin_system_fix_final.sql error_groups icin politika yazdi, client_errors icin YALNIZ grant verdi. RLS acikken grant tek basina 0 satir demektir; 39 gercek hata admin dahil kimseye gorunmuyordu. Kardes tablo deseni birebir kopyalandi. Moderator BILEREK disaridadir (is_admin_user yalniz admin/super_admin).';



CREATE POLICY "admins_read_error_groups" ON "public"."error_groups" FOR SELECT TO "authenticated" USING ("public"."is_admin_user"());



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "brands_admin_write" ON "public"."brands" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::"text"[]))))));



CREATE POLICY "brands_tenant_select" ON "public"."brands" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cart_items_service_role" ON "public"."cart_items" TO "service_role" USING (true);



CREATE POLICY "cat_admin_delete_opt" ON "public"."categories" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "cat_admin_insert_opt" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "cat_admin_update_opt" ON "public"."categories" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "cat_public_read_opt" ON "public"."categories" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category_mapping_rules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ci_auth_all" ON "public"."cart_items" TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("cart_id" IN ( SELECT "shopping_carts"."id"
   FROM "public"."shopping_carts"
  WHERE (("shopping_carts"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("shopping_carts"."tenant_id" = "public"."jwt_tenant_id"())))))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("cart_id" IN ( SELECT "shopping_carts"."id"
   FROM "public"."shopping_carts"
  WHERE (("shopping_carts"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("shopping_carts"."tenant_id" = "public"."jwt_tenant_id"()))))));



ALTER TABLE "public"."client_errors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "coupons_admin_delete" ON "public"."coupons" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "coupons_admin_insert" ON "public"."coupons" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "coupons_admin_update" ON "public"."coupons" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "coupons_select_anon" ON "public"."coupons" FOR SELECT TO "anon" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ("is_active" = true) AND (("valid_until" IS NULL) OR ("valid_until" > "now"()))));



CREATE POLICY "coupons_select_authenticated" ON "public"."coupons" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin") OR (("is_active" = true) AND (("valid_until" IS NULL) OR ("valid_until" > "now"()))))));



CREATE POLICY "coupons_service_role" ON "public"."coupons" TO "service_role" USING (true);



ALTER TABLE "public"."currency_rates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "currency_rates_service_insert" ON "public"."currency_rates" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "currency_rates_tenant_read" ON "public"."currency_rates" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



ALTER TABLE "public"."data_subject_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "error_groups_update_admin" ON "public"."error_groups" FOR UPDATE TO "authenticated" USING ("public"."is_admin_user"()) WITH CHECK ("public"."is_admin_user"());



ALTER TABLE "public"."goods_receipts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "goods_receipts_admin_insert" ON "public"."goods_receipts" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "goods_receipts_admin_select" ON "public"."goods_receipts" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



ALTER TABLE "public"."inventory_movements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_movements_select_admin" ON "public"."inventory_movements" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "inventory_movements_service_role" ON "public"."inventory_movements" TO "service_role" USING (true);



ALTER TABLE "public"."inventory_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_settings_select_all" ON "public"."inventory_settings" FOR SELECT TO "anon", "authenticated" USING (("tenant_id" = "public"."jwt_tenant_id"()));



CREATE POLICY "inventory_settings_service_role" ON "public"."inventory_settings" TO "service_role" USING (true);



CREATE POLICY "inventory_settings_update_admin" ON "public"."inventory_settings" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "merged_brands_authenticated_select" ON "public"."brands" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))) OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"])))))));



CREATE POLICY "merged_category_mapping_rules_service_role_select" ON "public"."category_mapping_rules" FOR SELECT TO "service_role" USING ((true OR true));



CREATE POLICY "merged_client_errors_service_role_select" ON "public"."client_errors" FOR SELECT TO "service_role" USING ((true OR true));



CREATE POLICY "merged_order_email_events_service_role_select" ON "public"."order_email_events" FOR SELECT TO "service_role" USING ((true OR true));



CREATE POLICY "merged_payment_transactions_service_role_select" ON "public"."payment_transactions" FOR SELECT TO "service_role" USING ((true OR true));



CREATE POLICY "merged_product_families_authenticated_select" ON "public"."product_families" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid") AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))) OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT ( SELECT ( SELECT ( SELECT ( SELECT "auth"."uid"() AS "uid") AS "uid") AS "uid") AS "uid") AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"])))))));



CREATE POLICY "merged_shopping_carts_service_role_select" ON "public"."shopping_carts" FOR SELECT TO "service_role" USING ((true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true OR true));



ALTER TABLE "public"."order_attachments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_attachments_admin_delete" ON "public"."order_attachments" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_attachments_admin_insert" ON "public"."order_attachments" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_attachments_admin_update" ON "public"."order_attachments" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_attachments_select_authenticated" ON "public"."order_attachments" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin") OR ((NOT "is_internal") AND ("order_id" IN ( SELECT "venthub_orders"."id"
   FROM "public"."venthub_orders"
  WHERE (("venthub_orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("venthub_orders"."tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")))))))));



CREATE POLICY "order_attachments_service_role" ON "public"."order_attachments" TO "service_role" USING (true);



ALTER TABLE "public"."order_email_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_invoices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_invoices_admin_insert" ON "public"."order_invoices" FOR INSERT WITH CHECK ("public"."is_admin_user"());



CREATE POLICY "order_invoices_admin_select" ON "public"."order_invoices" FOR SELECT USING ("public"."is_admin_user"());



ALTER TABLE "public"."order_notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_notes_admin_delete" ON "public"."order_notes" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_notes_admin_insert" ON "public"."order_notes" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_notes_admin_update" ON "public"."order_notes" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "order_notes_select_authenticated" ON "public"."order_notes" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin") OR ((NOT "is_internal") AND ("order_id" IN ( SELECT "venthub_orders"."id"
   FROM "public"."venthub_orders"
  WHERE (("venthub_orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("venthub_orders"."tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")))))))));



CREATE POLICY "order_notes_service_role" ON "public"."order_notes" TO "service_role" USING (true);



ALTER TABLE "public"."order_number_counters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_refund_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_refund_events_admin_select" ON "public"."order_refund_events" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "order_refund_events_service_role" ON "public"."order_refund_events" TO "service_role" USING (true);



CREATE POLICY "orders_delete_policy" ON "public"."venthub_orders" FOR DELETE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



CREATE POLICY "orders_insert_policy" ON "public"."venthub_orders" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "orders_select_policy" ON "public"."venthub_orders" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "orders_service_role" ON "public"."venthub_orders" TO "service_role" USING (true);



CREATE POLICY "orders_update_policy" ON "public"."venthub_orders" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user")))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "p_dsr_admin_all" ON "public"."data_subject_requests" TO "authenticated" USING ("public"."is_admin_user"()) WITH CHECK ("public"."is_admin_user"());



CREATE POLICY "p_dsr_owner_insert" ON "public"."data_subject_requests" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("applicant_email" = ( SELECT ("auth"."jwt"() ->> 'email'::"text"))) AND ("status" = 'received'::"text") AND ("due_at" = ("received_at" + '30 days'::interval)) AND ("outcome" IS NULL) AND ("completed_at" IS NULL) AND ("identity_verified_at" IS NULL) AND ("handled_by" IS NULL) AND ("retained_data_note" IS NULL)));



COMMENT ON POLICY "p_dsr_owner_insert" ON "public"."data_subject_requests" IS 'Veri sahibi kendi talebini acar. Kimlik tevsiki: applicant_email = JWT email (Teblig m.5). Surec alanlari (status/due_at/outcome/completed_at/identity_verified_at/handled_by/retained_data_note) with check ile DB default''una PIN''lidir -- kolon-GRANT ile DEGIL, cunku tablo-duzeyi grant kolon grant''ini gecersiz kilar. UPDATE politikasi yok.';



CREATE POLICY "p_dsr_owner_select" ON "public"."data_subject_requests" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



COMMENT ON POLICY "p_dsr_owner_select" ON "public"."data_subject_requests" IS 'Veri sahibi yalnız kendi talebini görür; süreci ve 30 günlük son tarihi izleyebilir.';



ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_lists" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "price_lists_admin_delete" ON "public"."price_lists" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "price_lists_admin_insert" ON "public"."price_lists" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "price_lists_admin_update" ON "public"."price_lists" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "price_lists_select_anon" ON "public"."price_lists" FOR SELECT TO "anon" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ("is_active" = true)));



CREATE POLICY "price_lists_select_authenticated" ON "public"."price_lists" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin") OR ("is_active" = true))));



CREATE POLICY "price_lists_service_role" ON "public"."price_lists" TO "service_role" USING (true);



ALTER TABLE "public"."pricing_policy" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pricing_policy_admin_delete" ON "public"."pricing_policy" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_policy_admin_insert" ON "public"."pricing_policy" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_policy_admin_select" ON "public"."pricing_policy" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_policy_admin_update" ON "public"."pricing_policy" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"]))))))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



ALTER TABLE "public"."pricing_rule" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pricing_rule_admin_delete" ON "public"."pricing_rule" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_rule_admin_insert" ON "public"."pricing_rule" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_rule_admin_select" ON "public"."pricing_rule" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "pricing_rule_admin_update" ON "public"."pricing_rule" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"]))))))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "prod_admin_delete_opt" ON "public"."products" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "prod_admin_insert_opt" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "prod_admin_update_opt" ON "public"."products" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text", ('moderator'::character varying)::"text"]))))));



CREATE POLICY "prod_public_read_opt" ON "public"."products" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



ALTER TABLE "public"."product_authorities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_costs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_costs_admin_select" ON "public"."product_costs" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



ALTER TABLE "public"."product_families" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_families_admin_write" ON "public"."product_families" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::"text"[])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::"text"[]))))));



CREATE POLICY "product_families_tenant_select" ON "public"."product_families" FOR SELECT USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_images_select_all" ON "public"."product_images" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



CREATE POLICY "product_images_update_admin" ON "public"."product_images" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("user_profiles"."role")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))));



ALTER TABLE "public"."product_prices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_prices_admin_delete" ON "public"."product_prices" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "product_prices_admin_insert" ON "public"."product_prices" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "product_prices_admin_update" ON "public"."product_prices" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin"))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin")));



CREATE POLICY "product_prices_select_anon" ON "public"."product_prices" FOR SELECT TO "anon" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND ("is_active" = true) AND ("price_list_id" IN ( SELECT "pl"."id"
   FROM "public"."price_lists" "pl"
  WHERE (("pl"."user_type")::"text" = 'individual'::"text")))));



CREATE POLICY "product_prices_select_authenticated" ON "public"."product_prices" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (( SELECT "public"."is_user_admin"(( SELECT "auth"."uid"() AS "uid")) AS "is_user_admin") OR (("is_active" = true) AND ("price_list_id" IN ( SELECT "pl"."id"
   FROM "public"."price_lists" "pl"
  WHERE ((("pl"."user_type")::"text" = 'individual'::"text") OR (("pl"."user_type")::"text" = ( SELECT "public"."jwt_price_segment"() AS "jwt_price_segment")))))))));



CREATE POLICY "product_prices_service_role" ON "public"."product_prices" TO "service_role" USING (true);



ALTER TABLE "public"."product_search_index" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_search_index_tenant_read" ON "public"."product_search_index" FOR SELECT USING (("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")));



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchase_order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "purchase_order_items_admin_delete" ON "public"."purchase_order_items" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_order_items_admin_insert" ON "public"."purchase_order_items" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_order_items_admin_select" ON "public"."purchase_order_items" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_order_items_admin_update" ON "public"."purchase_order_items" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"]))))))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



ALTER TABLE "public"."purchase_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "purchase_orders_admin_delete" ON "public"."purchase_orders" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_orders_admin_insert" ON "public"."purchase_orders" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_orders_admin_select" ON "public"."purchase_orders" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "purchase_orders_admin_update" ON "public"."purchase_orders" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"]))))))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



ALTER TABLE "public"."quote_email_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_email_events_admin_read" ON "public"."quote_email_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = "auth"."uid"()) AND (("up"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::"text"[]))))));



CREATE POLICY "quote_items_insert_admin" ON "public"."venthub_quote_items" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user") AND (EXISTS ( SELECT 1
   FROM "public"."venthub_quotes" "q"
  WHERE (("q"."id" = "venthub_quote_items"."quote_id") AND ("q"."tenant_id" = "public"."jwt_tenant_id"()) AND ("q"."status" = 'draft'::"text"))))));



CREATE POLICY "quote_items_insert_own_requested" ON "public"."venthub_quote_items" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."venthub_quotes" "q"
  WHERE (("q"."id" = "venthub_quote_items"."quote_id") AND ("q"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("q"."status" = 'requested'::"text"))))));



CREATE POLICY "quote_items_select_own_or_admin" ON "public"."venthub_quote_items" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."venthub_quotes" "q"
  WHERE (("q"."id" = "venthub_quote_items"."quote_id") AND (("q"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user")))))));



CREATE POLICY "quote_items_update_admin" ON "public"."venthub_quote_items" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user"))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



ALTER TABLE "public"."quote_number_counters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quotes_insert_admin_draft" ON "public"."venthub_quotes" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user") AND ("status" = 'draft'::"text")));



CREATE POLICY "quotes_insert_own_requested" ON "public"."venthub_quotes" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("status" = 'requested'::"text")));



CREATE POLICY "quotes_select_own_or_admin" ON "public"."venthub_quotes" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "quotes_update_admin" ON "public"."venthub_quotes" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user"))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



CREATE POLICY "quotes_update_customer_decision" ON "public"."venthub_quotes" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("status" = 'quoted'::"text"))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND (("status" = 'rejected'::"text") OR (("status" = 'accepted'::"text") AND ("superseded_by" IS NULL) AND ("valid_until" >= "now"()) AND ("accept_channel" = 'site'::"text") AND ("accept_recorded_by" IS NULL) AND ("accepted_revision_no" = "revision_no")))));



ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."refund_attempts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "refund_attempts_admin_read" ON "public"."refund_attempts" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



CREATE POLICY "refund_attempts_service" ON "public"."refund_attempts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "returns_delete_policy" ON "public"."venthub_returns" FOR DELETE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



CREATE POLICY "returns_insert_policy" ON "public"."venthub_returns" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."venthub_orders" "o"
  WHERE (("o"."id" = "venthub_returns"."order_id") AND ("o"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("o"."tenant_id" = "public"."jwt_tenant_id"()))))) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "returns_select_policy" ON "public"."venthub_returns" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "returns_service_role" ON "public"."venthub_returns" TO "service_role" USING (true);



CREATE POLICY "returns_update_policy" ON "public"."venthub_returns" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user"))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ( SELECT "public"."is_admin_user"() AS "is_admin_user")));



ALTER TABLE "public"."returns_webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "returns_webhook_events_admin_select" ON "public"."returns_webhook_events" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "returns_webhook_events_service_role" ON "public"."returns_webhook_events" TO "service_role" USING (true);



CREATE POLICY "sc_auth_all" ON "public"."shopping_carts" TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."search_reindex_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_only" ON "public"."category_mapping_rules" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_only" ON "public"."client_errors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_only" ON "public"."order_email_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_only" ON "public"."payment_transactions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_only" ON "public"."rate_limits" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_only" ON "public"."shipping_idempotency" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."shipping_email_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shipping_email_events_admin_select" ON "public"."shipping_email_events" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "shipping_email_events_service_role" ON "public"."shipping_email_events" TO "service_role" USING (true);



ALTER TABLE "public"."shipping_idempotency" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shipping_webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shipping_webhook_events_admin_select" ON "public"."shipping_webhook_events" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_user"()));



CREATE POLICY "shipping_webhook_events_service_role" ON "public"."shipping_webhook_events" TO "service_role" USING (true);



ALTER TABLE "public"."shopping_carts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shopping_carts_service_role" ON "public"."shopping_carts" TO "service_role" USING (true);



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_admin_insert" ON "public"."site_settings" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "site_settings_admin_select" ON "public"."site_settings" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "site_settings_admin_update" ON "public"."site_settings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'moderator'::"text"]))))));



ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "suppliers_admin_delete" ON "public"."suppliers" FOR DELETE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "suppliers_admin_insert" ON "public"."suppliers" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "suppliers_admin_select" ON "public"."suppliers" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "suppliers_admin_update" ON "public"."suppliers" FOR UPDATE TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"]))))))) WITH CHECK ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."id" = ( SELECT "auth"."uid"() AS "uid")) AND (("up"."role")::"text" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'moderator'::"text"])))))));



ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenants_all_service_role" ON "public"."tenants" TO "service_role" USING (true);



CREATE POLICY "tenants_select" ON "public"."tenants" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "uip_own" ON "public"."user_invoice_profiles" TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."url_takma_adlari" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_addresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_addresses_delete" ON "public"."user_addresses" FOR DELETE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "user_addresses_insert" ON "public"."user_addresses" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "user_addresses_select" ON "public"."user_addresses" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "user_addresses_service_role" ON "public"."user_addresses" TO "service_role" USING (true);



CREATE POLICY "user_addresses_update" ON "public"."user_addresses" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."user_invoice_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_invoice_profiles_service_role" ON "public"."user_invoice_profiles" TO "service_role" USING (true);



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_delete_policy" ON "public"."user_profiles" FOR DELETE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND "public"."is_admin_claim"()));



CREATE POLICY "user_profiles_insert_policy" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("id" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_admin_claim"())));



CREATE POLICY "user_profiles_select_policy" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("tenant_id" = ( SELECT "public"."jwt_tenant_id"() AS "jwt_tenant_id")) AND (("id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_admin_claim"() AS "is_admin_claim"))));



CREATE POLICY "user_profiles_service_role" ON "public"."user_profiles" TO "service_role" USING (true);



CREATE POLICY "user_profiles_update_policy" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("id" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_admin_claim"()))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("id" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_admin_claim"())));



ALTER TABLE "public"."user_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venthub_order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "venthub_order_items_insert_optimized" ON "public"."venthub_order_items" FOR INSERT TO "authenticated" WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."venthub_orders"
  WHERE (("venthub_orders"."id" = "venthub_order_items"."order_id") AND ("venthub_orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("venthub_orders"."tenant_id" = "public"."jwt_tenant_id"()))))));



CREATE POLICY "venthub_order_items_select_consolidated" ON "public"."venthub_order_items" FOR SELECT TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND (("order_id" IN ( SELECT "venthub_orders"."id"
   FROM "public"."venthub_orders"
  WHERE (("venthub_orders"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("venthub_orders"."tenant_id" = "public"."jwt_tenant_id"())))) OR ( SELECT "public"."is_admin_user"() AS "is_admin_user"))));



CREATE POLICY "venthub_order_items_service_role" ON "public"."venthub_order_items" TO "service_role" USING (true);



ALTER TABLE "public"."venthub_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venthub_quote_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venthub_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venthub_returns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wizard_selections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "wizard_selections_service_role" ON "public"."wizard_selections" TO "service_role" USING (true);



CREATE POLICY "ws_anon_insert" ON "public"."wizard_selections" FOR INSERT TO "anon" WITH CHECK (("tenant_id" = "public"."jwt_tenant_id"()));



CREATE POLICY "ws_auth_all" ON "public"."wizard_selections" TO "authenticated" USING ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("tenant_id" = "public"."jwt_tenant_id"()) AND ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."client_errors";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."error_groups";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";


























































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."_normalize_rls_expr"("expr" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_normalize_rls_expr"("expr" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_normalize_rls_expr"("expr" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."_quote_published_enqueue"("p_quote_id" "uuid", "p_zorunlu" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."_quote_published_enqueue"("p_quote_id" "uuid", "p_zorunlu" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."adjust_stock_v2"("p_product_id" "uuid", "p_delta" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."adjust_stock_v2"("p_product_id" "uuid", "p_delta" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_list_all_users"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_list_all_users"() TO "service_role";
GRANT ALL ON FUNCTION "public"."admin_list_all_users"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."admin_list_users"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_list_users"() TO "service_role";
GRANT ALL ON FUNCTION "public"."admin_list_users"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_publish_quote"("p_quote_id" "uuid", "p_valid_until" timestamp with time zone, "p_currency" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_resend_quote_published"("p_quote_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_resend_quote_published"("p_quote_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_resend_quote_published"("p_quote_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_search_products"("p_q" "text", "p_limit" integer, "p_offset" integer, "p_category_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_search_products"("p_q" "text", "p_limit" integer, "p_offset" integer, "p_category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_search_products"("p_q" "text", "p_limit" integer, "p_offset" integer, "p_category_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid", "p_dry_run" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid", "p_dry_run" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."anonymize_user_personal_data"("p_user_id" "uuid", "p_request_id" "uuid", "p_dry_run" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."arama_ad_isabeti"("p_ad_metni" "text", "p_q" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_bulanik_ifade"("p_q" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_dogrula"("p_govde" "text", "p_q" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_eslesen_urunler"("p_q" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_indeksi_tazele"("p_ids" "uuid"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_indeksi_tazele"("p_ids" "uuid"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."arama_kelimeler"("p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_kelimeler"("p_q" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_kelimeler"("p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_kelimeler"("p_q" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_kesin_ifade"("p_q" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_kesin_ifade"("p_q" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_kesin_ifade"("p_q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_kesin_ifade"("p_q" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_kuyrugu_bosalt"("p_tavan" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_kuyrugu_bosalt"("p_tavan" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."arama_marka_es"("p_k" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_marka_es"("p_k" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_marka_es"("p_k" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_marka_es"("p_k" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_marka_kelimeleri"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_marka_kelimeleri"() TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_marka_kelimeleri"() TO "anon";
GRANT ALL ON FUNCTION "public"."arama_marka_kelimeleri"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."arama_normalize"("p_t" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."arama_normalize"("p_t" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."arama_normalize"("p_t" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."arama_normalize"("p_t" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."bump_rate_limit"("p_key" "text", "p_limit" integer, "p_window_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."bump_rate_limit"("p_key" "text", "p_limit" integer, "p_window_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."bump_rate_limit"("p_key" "text", "p_limit" integer, "p_window_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_quote_with_items"("p_quote" "jsonb", "p_items" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."denetim_izi_yaz"() TO "anon";
GRANT ALL ON FUNCTION "public"."denetim_izi_yaz"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."denetim_izi_yaz"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."jwt_tenant_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."jwt_tenant_id"() TO "service_role";
GRANT ALL ON FUNCTION "public"."jwt_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."jwt_tenant_id"() TO "anon";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON FUNCTION "public"."display_price"("p" "public"."products") TO "anon";
GRANT ALL ON FUNCTION "public"."display_price"("p" "public"."products") TO "authenticated";
GRANT ALL ON FUNCTION "public"."display_price"("p" "public"."products") TO "service_role";



GRANT ALL ON FUNCTION "public"."display_price_tax_included"("p" "public"."products") TO "anon";
GRANT ALL ON FUNCTION "public"."display_price_tax_included"("p" "public"."products") TO "authenticated";
GRANT ALL ON FUNCTION "public"."display_price_tax_included"("p" "public"."products") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_invoice_only_for_paid_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_invoice_only_for_paid_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_invoice_only_for_paid_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_quote_status_transition"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_quote_status_transition"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_quote_status_transition"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_role_change"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_role_change"() TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."venthub_orders" TO "anon";
GRANT ALL ON TABLE "public"."venthub_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."venthub_orders" TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_admin_get_orders"("p_id" "text", "p_conv" "text", "p_status" "text", "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_admin_get_orders"("p_id" "text", "p_conv" "text", "p_status" "text", "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_admin_update_order_status"("p_id" "text", "p_status" "text", "p_conv" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_admin_update_order_status"("p_id" "text", "p_status" "text", "p_conv" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_enrich_product_specs"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_enrich_product_specs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_enrich_product_specs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fts_search_products"("p_q" "text", "p_limit" integer, "p_filters" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."fts_search_products"("p_q" "text", "p_limit" integer, "p_filters" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fts_search_products"("p_q" "text", "p_limit" integer, "p_filters" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_order_number"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number_saat_tabanli_20260906"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number_saat_tabanli_20260906"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number_saat_tabanli_20260906"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_users"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_display_prices"("p_product_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_family_detail"("p_slug" "text", "p_lang" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_family_detail"("p_slug" "text", "p_lang" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_family_detail"("p_slug" "text", "p_lang" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_families_enriched"("p_category_ids" "uuid"[], "p_limit" integer, "p_offset" integer, "p_search_query" "text", "p_brand" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_families_enriched"("p_category_ids" "uuid"[], "p_limit" integer, "p_offset" integer, "p_search_query" "text", "p_brand" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_families_enriched"("p_category_ids" "uuid"[], "p_limit" integer, "p_offset" integer, "p_search_query" "text", "p_brand" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_search_suggestions"("p_q" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_search_suggestions"("p_q" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_search_suggestions"("p_q" "text", "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user_metadata"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user_metadata"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user_profile"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_supabase_webhook"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_supabase_webhook"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."increment_coupon_usage"("p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_coupon_usage"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_error_group_count"("p_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_admin_claim"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin_claim"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_claim"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_staff_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_user_admin"("user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_user_admin"("user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_user_admin"("user_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."jwt_price_segment"() TO "anon";
GRANT ALL ON FUNCTION "public"."jwt_price_segment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."jwt_price_segment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_product_threshold_overrides"() TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_product_threshold_overrides"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_product_threshold_overrides"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_order_paid"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_order_paid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_order_paid"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."notify_quote_published"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_quote_published"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_quote_request_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_quote_request_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_quote_request_created"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."process_goods_receipt"("p_po_id" "uuid", "p_document_no" "text", "p_lines" "jsonb", "p_note" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."process_goods_receipt"("p_po_id" "uuid", "p_document_no" "text", "p_lines" "jsonb", "p_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_goods_receipt"("p_po_id" "uuid", "p_document_no" "text", "p_lines" "jsonb", "p_note" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."process_order_stock_reduction"("p_order_id" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."process_order_stock_reduction"("p_order_id" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."product_costs_senkron"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."product_costs_senkron"() TO "service_role";



GRANT ALL ON FUNCTION "public"."product_families_single_level_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."product_families_single_level_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_families_single_level_guard"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."quote_items_durum_kilidi"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."quote_items_durum_kilidi"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid", "p_max_minutes" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."reverse_inventory_batch"("p_batch_id" "uuid", "p_max_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_order_number"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text", "p_batch_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text", "p_batch_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."set_stock"("p_product_id" "uuid", "p_new_qty" integer, "p_reason" "text", "p_batch_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."set_user_role"("user_id" "uuid", "new_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_user_role"("user_id" "uuid", "new_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."stamp_order_paid_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."stamp_order_paid_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."stamp_order_paid_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."stamp_quote_published"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."stamp_quote_published"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_contact_message"("p_name" "text", "p_message" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_city" "text", "p_application_area" "text", "p_subject" "text", "p_consent" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_payment_status_with_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_payment_status_with_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_payment_status_with_status"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tg_arama_aile_kuyrukla"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tg_arama_aile_kuyrukla"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tg_arama_kategori_kuyrukla"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tg_arama_kategori_kuyrukla"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tg_arama_metin_doldur"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tg_arama_metin_doldur"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tg_arama_urun_tazele"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tg_arama_urun_tazele"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_categories_set_level"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_categories_set_level"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_categories_set_level"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tg_url_takma_ad_yaz"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tg_url_takma_ad_yaz"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_product_prices_computed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_product_prices_computed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_product_prices_computed_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_inventory_settings"("p_default_low_stock_threshold" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_inventory_settings"("p_default_low_stock_threshold" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_inventory_thresholds"("p_default" integer, "p_reset_overrides" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_inventory_thresholds"("p_default" integer, "p_reset_overrides" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."url_takma_ad_coz"("p_tur" "text", "p_dil" "text", "p_eski_slug" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."user_invoice_profiles_ensure_single_default"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_invoice_profiles_ensure_single_default"() TO "service_role";






























GRANT ALL ON TABLE "public"."_migration_ledger" TO "anon";
GRANT ALL ON TABLE "public"."_migration_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."_migration_ledger" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_profiles" TO "supabase_auth_admin";



GRANT SELECT ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."category_mapping_rules" TO "anon";
GRANT ALL ON TABLE "public"."category_mapping_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."category_mapping_rules" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."client_errors" TO "anon";
GRANT ALL ON TABLE "public"."client_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."client_errors" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,TRIGGER,MAINTAIN,UPDATE ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."currency_rates" TO "anon";
GRANT ALL ON TABLE "public"."currency_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."currency_rates" TO "service_role";



GRANT ALL ON TABLE "public"."data_subject_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."data_subject_requests" TO "service_role";



GRANT INSERT("user_id") ON TABLE "public"."data_subject_requests" TO "authenticated";



GRANT INSERT("applicant_email") ON TABLE "public"."data_subject_requests" TO "authenticated";



GRANT INSERT("request_type") ON TABLE "public"."data_subject_requests" TO "authenticated";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."error_groups" TO "anon";
GRANT ALL ON TABLE "public"."error_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."error_groups" TO "service_role";



GRANT ALL ON TABLE "public"."goods_receipts" TO "anon";
GRANT ALL ON TABLE "public"."goods_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."goods_receipts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."inventory_movements" TO "anon";
GRANT ALL ON TABLE "public"."inventory_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_movements" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."inventory_settings" TO "anon";
GRANT ALL ON TABLE "public"."inventory_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_settings" TO "service_role";



GRANT ALL ON TABLE "public"."product_costs" TO "service_role";
GRANT SELECT ON TABLE "public"."product_costs" TO "authenticated";



GRANT SELECT ON TABLE "public"."inventory_summary" TO "authenticated";
GRANT SELECT ON TABLE "public"."inventory_summary" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."venthub_order_items" TO "anon";
GRANT ALL ON TABLE "public"."venthub_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."venthub_order_items" TO "service_role";



GRANT SELECT ON TABLE "public"."inventory_velocity" TO "authenticated";
GRANT SELECT ON TABLE "public"."inventory_velocity" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."order_attachments" TO "anon";
GRANT ALL ON TABLE "public"."order_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."order_attachments" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."order_email_events" TO "anon";
GRANT ALL ON TABLE "public"."order_email_events" TO "authenticated";
GRANT ALL ON TABLE "public"."order_email_events" TO "service_role";



GRANT ALL ON TABLE "public"."order_invoices" TO "anon";
GRANT ALL ON TABLE "public"."order_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."order_invoices" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."order_notes" TO "anon";
GRANT ALL ON TABLE "public"."order_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."order_notes" TO "service_role";



GRANT ALL ON TABLE "public"."order_number_counters" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."order_refund_events" TO "anon";
GRANT ALL ON TABLE "public"."order_refund_events" TO "authenticated";
GRANT ALL ON TABLE "public"."order_refund_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."price_lists" TO "anon";
GRANT ALL ON TABLE "public"."price_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."price_lists" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_policy" TO "anon";
GRANT ALL ON TABLE "public"."pricing_policy" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_policy" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_rule" TO "anon";
GRANT ALL ON TABLE "public"."pricing_rule" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_rule" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."product_authorities" TO "anon";
GRANT ALL ON TABLE "public"."product_authorities" TO "authenticated";
GRANT ALL ON TABLE "public"."product_authorities" TO "service_role";



GRANT ALL ON TABLE "public"."product_families" TO "anon";
GRANT ALL ON TABLE "public"."product_families" TO "authenticated";
GRANT ALL ON TABLE "public"."product_families" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_prices" TO "anon";
GRANT ALL ON TABLE "public"."product_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."product_prices" TO "service_role";



GRANT ALL ON TABLE "public"."product_search_index" TO "service_role";
GRANT SELECT ON TABLE "public"."product_search_index" TO "anon";
GRANT SELECT ON TABLE "public"."product_search_index" TO "authenticated";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."project_items" TO "anon";
GRANT ALL ON TABLE "public"."project_items" TO "authenticated";
GRANT ALL ON TABLE "public"."project_items" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."quote_email_events" TO "anon";
GRANT ALL ON TABLE "public"."quote_email_events" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_email_events" TO "service_role";



GRANT ALL ON TABLE "public"."quote_number_counters" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."refund_attempts" TO "anon";
GRANT ALL ON TABLE "public"."refund_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."refund_attempts" TO "service_role";



GRANT SELECT ON TABLE "public"."reserved_orders" TO "authenticated";
GRANT SELECT ON TABLE "public"."reserved_orders" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."returns_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."returns_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."returns_webhook_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."returns_webhook_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."returns_webhook_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."returns_webhook_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."search_reindex_queue" TO "service_role";



GRANT ALL ON SEQUENCE "public"."search_reindex_queue_id_seq" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."shipping_email_events" TO "anon";
GRANT ALL ON TABLE "public"."shipping_email_events" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_email_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."shipping_idempotency" TO "anon";
GRANT ALL ON TABLE "public"."shipping_idempotency" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_idempotency" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."shipping_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."shipping_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_webhook_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shipping_webhook_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shipping_webhook_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shipping_webhook_events_id_seq" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."shopping_carts" TO "anon";
GRANT ALL ON TABLE "public"."shopping_carts" TO "authenticated";
GRANT ALL ON TABLE "public"."shopping_carts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."url_takma_adlari" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."user_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."user_invoice_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_invoice_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_invoice_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."user_projects" TO "anon";
GRANT ALL ON TABLE "public"."user_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."user_projects" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."venthub_quote_items" TO "authenticated";
GRANT ALL ON TABLE "public"."venthub_quote_items" TO "service_role";



GRANT INSERT("quote_id") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("product_id") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("product_name") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("qty") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("note") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("unit_price") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("currency") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("valid_until") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("tenant_id") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("line_no"),UPDATE("line_no") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("discount_rate") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("tax_rate") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT UPDATE("line_total") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT INSERT("group_label"),UPDATE("group_label") ON TABLE "public"."venthub_quote_items" TO "authenticated";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."venthub_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."venthub_quotes" TO "service_role";



GRANT INSERT("user_id") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("source") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("source_project_id") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("status"),UPDATE("status") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("tenant_id") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("contact_name") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("contact_email") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT("contact_phone") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT UPDATE("accepted_at") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT UPDATE("accept_channel") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT UPDATE("accepted_revision_no") ON TABLE "public"."venthub_quotes" TO "authenticated";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."venthub_returns" TO "anon";
GRANT ALL ON TABLE "public"."venthub_returns" TO "authenticated";
GRANT ALL ON TABLE "public"."venthub_returns" TO "service_role";



GRANT SELECT ON TABLE "public"."view_admin_orders" TO "authenticated";
GRANT SELECT ON TABLE "public"."view_admin_orders" TO "service_role";



GRANT SELECT ON TABLE "public"."view_admin_returns" TO "authenticated";
GRANT SELECT ON TABLE "public"."view_admin_returns" TO "service_role";



GRANT SELECT ON TABLE "public"."view_admin_uninvoiced_orders" TO "authenticated";
GRANT SELECT ON TABLE "public"."view_admin_uninvoiced_orders" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."wizard_selections" TO "anon";
GRANT ALL ON TABLE "public"."wizard_selections" TO "authenticated";
GRANT ALL ON TABLE "public"."wizard_selections" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































