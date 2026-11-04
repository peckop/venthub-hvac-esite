-- GERİ ALMA · 20261104110000_alt136_definer_kiraci_kapisi.sql (ALT-136)
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- Bu migration'ın eklediklerini geri alır:
--   adjust_stock x2, admin_list_users, process_order_stock_restore, set_user_admin_role gövdeleri 2026-11-03 şema
--   tabanındaki hâline döner (kiracı kapısı ve atlanan ürün sayacı kalkar; admin_list_users çağıran kapısına moderator
--   geri girer).
--   admin_list_all_users #2243 (ALT-145, 20261104100000) hâline döner: rol listesi ('admin','super_admin'),
--   kiracı süzgeci kalkar. moderator'ü yeniden açmak için ALT-145 rollback'i ayrıca gerekir.
--   url_takma_adlari_listele'ye bu migration dokunmadı, geri alma da dokunmaz.
-- Etki: kiracılar arası erişim kapısı kalkar (bugün tek kiracı var, davranış farkı yok). Veri silinmez; bu migration
--   veriye dokunmadı.

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

-- ───────── adjust_stock (3 argüman): taban ─────────

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

-- ───────── adjust_stock (4 argüman): taban ─────────

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

-- ───────── admin_list_all_users: #2243 (ALT-145) hâli ─────────

CREATE OR REPLACE FUNCTION "public"."admin_list_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: yalnız admin ve super_admin (ALT-145 karne Y4: moderator çıkarıldı).
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','super_admin')
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

-- ───────── admin_list_users: taban ─────────

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

-- ───────── process_order_stock_restore: taban ─────────

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

-- ───────── set_user_admin_role: taban ─────────

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

commit;
