-- Migration: 20261104110000_alt136_definer_kiraci_kapisi.sql
-- ALT-136 — authenticated rolüne açık SECURITY DEFINER fonksiyonlarına KİRACI KAPISI. (Kanban: ALT-136)
-- Cetvel: docs/standards/migration-safety-standard.md · CLAUDE.md kural 12 (tenant-scoped), 13, 14 · ölçüm: ALT-136 DEFINER ölçümü (2026-11-04).
--
-- ⚠ MIGRATION = PROD (kural 13): master'a birleşince supabase-migrate.yml canlıya OTOMATİK uygular.
--   Yalnız Recep onayıyla birleşir. Sıra: ALT-145 (20261104100000, #2243) canlıda; bu dosya damga sırasıyla onun ardından
--   uygulanır ve admin_list_all_users'ı #2243 sürümünün üstüne kurar (rol listesi ('admin','super_admin')).
--
-- NİÇİN BU DOSYA VAR: DEFINER fonksiyonun rol kapısı yalnız "çağıran admin mi" diye bakar, KİRACIYI bilmez. Rolü uygun
--   bir kullanıcı, fonksiyonun sahip yetkisiyle başka kiracının ürününe stok yazabilir, başka kiracının kullanıcı
--   e-postasını okuyabilir, başka kiracının siparişinin stoğunu geri verebilir ya da başka kiracının kullanıcısının rolünü
--   değiştirebilirdi (RLS sahip yetkisiyle atlanır). Doğru desen process_goods_receipt'te (2026-11-03 tabanı,
--   "Tenant kapısı (kural 12)"): service_role değilse hedef satırın tenant_id'si public.jwt_tenant_id()'ye eşit olmalı,
--   değilse RAISE. Bu dosya aynı deseni beş fonksiyona taşır.
--   Bugün TEK kiracı var ve jwt_tenant_id() claim yoksa varsayılan kiracıyı döndürür: tek kiracılı davranış DEĞİŞMEZ.
--   Kapı Faz 2 (çok kiracılı) açılmadan önce kapanır; sonradan eklemek, veri sızdıktan sonra eklemek demektir.
--
-- NE YAPAR (her gövde 2026-11-03 şema tabanından PROGRAMLA kopyalandı; fark yalnız ALT-136 satırlarıdır):
--   1) adjust_stock(uuid,integer,text) ve adjust_stock(uuid,integer,text,uuid): rol kapısı AYNEN; ardından service_role
--      değilse products.tenant_id = jwt_tenant_id() şartı (ürün başka kiracınınsa ya da yoksa RAISE). inventory_movements
--      satırı tenant_id'yi ÜRÜNDEN alır.
--   2) admin_list_all_users(): #2243 sürümünün üstüne kiracı süzgeci. Profili olmayan auth.users satırı (LEFT JOIN, up NULL)
--      kiracısı bilinemediği için listelenmez (gövdede gerekçe yazılı).
--   3) admin_list_users(): ÇAĞIRAN kapısından moderator çıkar (personelin e-postasını ve telefonunu açıyordu; moderator'ün
--      /admin/users rotası yok, src/lib/rbac.ts) ve kiracı süzgeci eklenir. Satır ÖZNESİ listesi (WHERE) DEĞİŞMEDİ:
--      moderator hesapları yöneticinin personel listesinde görünmeye devam eder, yoksa rolleri düşürülemez.
--   4) process_order_stock_restore(text,text): service_role değilse venthub_orders.tenant_id = jwt_tenant_id() (sipariş yok
--      ya da başka kiracınınsa RAISE); ürün güncellemesi aynı kiracıyla süzülür; geri-verme hareketi kiracıyı siparişten
--      alır. Kiracısı uyuşmayan ürün SESSİZ atlanmaz: sayılır ve dönüşe 'skipped' yazılır; skipped > 0 ise tarayıcı oturumunda
--      RAISE (işlem geri alınır), service_role'de success:false zarfı döner (iyzico-refund yalnız success'e bakar ve bunu hata
--      sayar). Sipariş/iade durumu ve monotonluk mantığı (kural 11) DEĞİŞMEDİ. Edge release-expired-reservations ve
--      iyzico-refund service_role ile çağırır: normal yol (skipped = 0) DEĞİŞMEDİ, zarfa yalnız 'skipped': 0 eklendi.
--   5) set_user_admin_role(uuid,text): service_role değilse hedef kullanıcının user_profiles.tenant_id'si = jwt_tenant_id()
--      olmalı; hedefin profili YOKSA da RAISE (tarayıcı oturumu çağıranın kiracısında profil yaratamaz). service_role
--      profili yoksa yaratır. enforce_role_change tetiğine DOKUNULMADI.
--
-- NE YAPMAZ: imza, SECURITY DEFINER, search_path, dönüş tipi ve GRANT'lar aynı; CREATE OR REPLACE ACL'i korur.
--   url_takma_adlari_listele() ACL'ine DOKUNULMAZ: anon EXECUTE AÇIK kalır. Sebep: scripts/onizleme.mjs (satır 185 ve 313)
--   anon anahtarı SUPABASE_SERVICE_ROLE_KEY değişken adıyla scripts/adres/harita-uret.ts'ye verir ve harita üreteci bu RPC'yi
--   ANON olarak çağırır (ön izleme: haritaUret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ...)). Çağıran taramasında (ilk geçişte
--   scripts/ altındaki bu dosya gözden kaçmıştı) gerçek anon çağıranı budur; tam liste kiracı süzgecine dayanır
--   (gövdede: tenant_id = jwt_tenant_id()), anon claim'inde kiracı olmadığından varsayılan kiracının satırları döner.
--   search_path değerleri tabandaki hâliyle AYNEN kopyalandı (adjust_stock ve process_order_stock_restore'da tek
--   tanımlayıcı olarak 'pg_catalog, public'; bu dosya onu değiştirmez, tüm başvurular zaten public. ile nitelikli).
--   Dokunulmayanlar ve nedeni: admin_publish_quote ve process_goods_receipt (kiracı kapısı ZATEN var); set_stock x2,
--   anonymize_user_personal_data, get_admin_users (GRANT yalnız service_role; authenticated ve anon çağıramaz);
--   adjust_stock_v2 (yalnız service_role). src/types/database.types.ts güncellemesi GEREKMEZ (imza değişmedi).
--
-- GERİ ALMA: scripts/db/rollback/20261104110000_alt136_definer_kiraci_kapisi_geri_al.sql — gövdeler tabana, admin_list_all_users #2243 hâline döner.
--   Veri değişmez (yalnız fonksiyon gövdeleri).

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

-- ───────── 1) adjust_stock (3 argüman) ─────────

CREATE OR REPLACE FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
DECLARE
  v_tenant uuid;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- ALT-136 (kural 12) kiracı kapısı: rol kapısı kiracıyı bilmez. Ürün çağıranın kiracısına ait değilse (ya da yoksa)
  -- çağrı reddedilir; hangisi olduğu sızdırılmaz. service_role sunucu tarafıdır, kapsam dışı
  -- (process_goods_receipt ile aynı desen). Hareket satırı kiracıyı ÜRÜNDEN alır (sütun varsayılanı değil).
  -- service_role + ürün yok: v_tenant NULL olur, INSERT NOT NULL ihlaliyle düşer (eskiden FK ihlaliyle düşüyordu).
  SELECT p.tenant_id INTO v_tenant FROM public.products p WHERE p.id = p_product_id;
  IF COALESCE(auth.role(), '') <> 'service_role'
     AND v_tenant IS DISTINCT FROM public.jwt_tenant_id() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason, tenant_id) 
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), v_tenant);
END;
$$;

-- ───────── 1) adjust_stock (4 argüman, batch) ─────────

CREATE OR REPLACE FUNCTION "public"."adjust_stock"("p_product_id" "uuid", "p_delta" integer, "p_reason" "text", "p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
DECLARE
  v_tenant uuid;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- ALT-136 (kural 12) kiracı kapısı: rol kapısı kiracıyı bilmez. Ürün çağıranın kiracısına ait değilse (ya da yoksa)
  -- çağrı reddedilir; hangisi olduğu sızdırılmaz. service_role sunucu tarafıdır, kapsam dışı
  -- (process_goods_receipt ile aynı desen). Hareket satırı kiracıyı ÜRÜNDEN alır (sütun varsayılanı değil).
  -- service_role + ürün yok: v_tenant NULL olur, INSERT NOT NULL ihlaliyle düşer (eskiden FK ihlaliyle düşüyordu).
  SELECT p.tenant_id INTO v_tenant FROM public.products p WHERE p.id = p_product_id;
  IF COALESCE(auth.role(), '') <> 'service_role'
     AND v_tenant IS DISTINCT FROM public.jwt_tenant_id() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id, tenant_id)
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), p_batch_id, v_tenant);
END;
$$;

-- ───────── 2) admin_list_all_users: kiracı süzgeci (#2243 sürümünün üstüne) ─────────

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
  -- ALT-136 (kural 12) kiracı süzgeci: yalnız çağıranın kiracısındaki profiller. Profili olmayan auth.users satırı
  -- (LEFT JOIN, up NULL) kiracısı bilinemediği için LİSTELENMEZ: kiracısı bilinmeyen satırı yönetici listesine
  -- koymak başka kiracının e-postasını sızdırma riskidir. Her kayıt trg_handle_new_user_profile ile profil alır;
  -- profilsiz satır istisnadır ve bu listede görünmemesi bilinçli bir kayıptır (yönetim ekranı ona ulaşamaz).
  WHERE up.tenant_id = public.jwt_tenant_id()
  ORDER BY COALESCE(up.created_at, u.created_at) DESC;
END;
$$;

-- ───────── 3) admin_list_users: çağıran kapısından moderator çıkar + kiracı süzgeci ─────────

CREATE OR REPLACE FUNCTION "public"."admin_list_users"() RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Authorization: yalnız admin ve super_admin (ALT-136: moderator ÇAĞIRAN olarak çıkarıldı; personelin e-postasını
  -- ve telefonunu açıyordu, moderator'ün /admin/users rotası yok: src/lib/rbac.ts).
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
         (up.role)::text        AS role,
         up.created_at,
         up.updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  -- Satır ÖZNESİ: personel rolleri (moderator hesapları yöneticinin listesinde görünmeye DEVAM eder; yoksa
  -- yönetici onların rolünü düşüremez). Çağıran kapısından ayrıdır.
  WHERE up.role IN ('admin','moderator','super_admin')
    -- ALT-136 (kural 12) kiracı süzgeci: yalnız çağıranın kiracısındaki personel.
    AND up.tenant_id = public.jwt_tenant_id()
  ORDER BY up.created_at DESC;
END;
$$;

-- ───────── 4) process_order_stock_restore: kiracı kapısı + atlanan ürün sayacı ─────────

CREATE OR REPLACE FUNCTION "public"."process_order_stock_restore"("p_order_id" "text", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog, public'
    AS $$
declare
  v_order_uuid uuid;
  v_order_tenant uuid;
  v_item record;
  v_qty int;
  v_restored_count int := 0;
  v_restored_units int := 0;
  v_skipped int := 0;
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

  select o.tenant_id into v_order_tenant from public.venthub_orders o where o.id = v_order_uuid for update;
  if not found then
    -- ALT-136: tarayıcı oturumu için "yok" ile "başka kiracının" ayırt edilemez (var olma sızıntısı yok): ikisi de RAISE.
    -- service_role (edge: release-expired-reservations, iyzico-refund) eski zarfı alır, davranışı DEĞİŞMEDİ.
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'not authorized';
    end if;
    return jsonb_build_object('success', false, 'error', 'Order not found', 'restored_count', 0);
  end if;

  -- ALT-136 (kural 12) kiracı kapısı: sipariş çağıranın kiracısına ait değilse reddedilir (sipariş satırı yukarıda
  -- kilitlendi; kiracı değişmez). Durum/monotonluk mantığı (kural 11) DEĞİŞMEDİ: bu yalnız erişim süzgecidir.
  if coalesce(auth.role(), '') <> 'service_role'
     and v_order_tenant is distinct from public.jwt_tenant_id() then
    raise exception 'not authorized';
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

    -- ALT-136: ürün güncellemesi de siparişin kiracısıyla süzülür. Kiracısı uyuşmayan ürün için satır etkilenmez, hareket
    -- YAZILMAZ (stoğa dokunmayan hareket sayaçları saptırırdı) ve ürün SAYILIR (v_skipped); sessiz başarı YOKTUR, döngü
    -- sonundaki kapı bunu hataya çevirir. Yeniden denemek aynı ürünü yine atlar: veri (ürünün ya da siparişin kiracısı)
    -- onarılana dek her çağrı hata verir.
    update public.products
      set stock_qty = coalesce(stock_qty, 0) + v_qty
      where id = v_item.product_id
        and tenant_id = v_order_tenant;
    if not found then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    insert into public.inventory_movements (product_id, order_id, delta, reason, tenant_id)
    values (v_item.product_id, v_order_uuid, v_qty, p_reason, v_order_tenant);

    v_restored_count := v_restored_count + 1;
    v_restored_units := v_restored_units + v_qty;
  end loop;

  -- ALT-136: atlanan ürün varsa (ürünün kiracısı siparişinkiyle uyuşmuyor) başarı DÖNMEZ. Tarayıcı oturumunda RAISE: işlem
  -- geri alınır, kısmi geri-verme kalmaz. service_role (edge) success:false zarfı alır; iyzico-refund yalnız success'e bakar
  -- ve bunu hata sayar (gelir alarmı). Zarfa yazılan restored_* o çağrıda GERÇEKTEN geri verilenlerdir.
  if v_skipped > 0 then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'stock restore: % product(s) skipped (tenant mismatch)', v_skipped;
    end if;
    return jsonb_build_object(
      'success', false,
      'error', 'Product tenant mismatch',
      'restored_count', v_restored_count,
      'restored_units', v_restored_units,
      'skipped', v_skipped,
      'reason', p_reason,
      'order_id', p_order_id
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'restored_count', v_restored_count,
    'restored_units', v_restored_units,
    'skipped', v_skipped,
    'reason', p_reason,
    'order_id', p_order_id
  );
end;
$$;

-- ───────── 5) set_user_admin_role: kiracı kapısı (profil yoksa da RAISE) ─────────

CREATE OR REPLACE FUNCTION "public"."set_user_admin_role"("user_id" "uuid", "new_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  v_hedef_tenant uuid;
  v_etkilenen int;
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

  -- ALT-136 (kural 12) kiracı kapısı: hedef kullanıcının profili yoksa ya da çağıranın kiracısında değilse reddedilir.
  -- Profil YOKSA da RAISE: tarayıcı oturumu çağıranın kiracısında profil YARATAMAZ (kiracısı bilinmeyen kullanıcıyı
  -- sahiplenmek olurdu; her kayıt trg_handle_new_user_profile ile profil alır). service_role sunucu tarafıdır, kapsam dışı
  -- (profil yoksa onu yaratır). enforce_role_change tetiği (rol kuralları) bu fonksiyondan bağımsızdır, DEĞİŞMEDİ.
  if coalesce(auth.role(), '') <> 'service_role' then
    select up.tenant_id into v_hedef_tenant from public.user_profiles up where up.id = user_id;
    if not found or v_hedef_tenant is distinct from public.jwt_tenant_id() then
      raise exception 'not authorized';
    end if;
  end if;

  -- Yeni satır (yalnız service_role ulaşır; tarayıcı için profil yukarıda zorunlu) jwt_tenant_id() kiracısını yazar.
  -- DO UPDATE ... WHERE, yukarıdaki okuma ile bu yazma arasında başka kiracının satırının doğmasına karşı yarışı kapatır:
  -- etkilenen satır 0 ise reddedilir.
  insert into public.user_profiles as up (id, role, tenant_id) values (user_id, new_role, public.jwt_tenant_id())
  on conflict (id) do update set role = excluded.role, updated_at = now()
    where coalesce(auth.role(), '') = 'service_role' or up.tenant_id = public.jwt_tenant_id();
  get diagnostics v_etkilenen = row_count;
  if v_etkilenen = 0 then
    raise exception 'not authorized';
  end if;

  return true;
end;
$$;

commit;

-- Merge sonrası canlı doğrulama (salt okuma; beklenen değerler):
--   select p.proname, pg_get_function_identity_arguments(p.oid) as imza, p.prosrc like '%jwt_tenant_id()%' as kiraci_kapisi
--     from pg_proc p
--    where p.pronamespace = 'public'::regnamespace
--      and p.proname in ('adjust_stock','admin_list_all_users','admin_list_users','process_order_stock_restore','set_user_admin_role')
--    order by 1, 2;
--     -- beklenen: 6 satır, hepsinde kiraci_kapisi = true
--   select (select count(*) from auth.users) as auth_kullanici, (select count(*) from public.user_profiles) as profil,
--          (select count(distinct tenant_id) from public.user_profiles) as kiraci;
--     -- bilgi: auth_kullanici > profil ise profilsiz satırlar admin_list_all_users'tan çıkmıştır
