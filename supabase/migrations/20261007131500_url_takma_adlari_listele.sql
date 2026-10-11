-- ALT-37e (karar 310 = A, Recep 2026-10-07) — url_takma_adlari İÇİN YALNIZ-OKUMA LİSTE İŞLEVİ
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §4.1; üreteç: src/lib/adres/haritaUret.ts)
-- ═════════════════════════════════════════════════════════════════════════════
-- Eski adres haritasının üreteci `url_takma_adlari` tablosunun TAMAMINI okur. Tablo anon/authenticated'a
-- KAPALI (20260923083021: revoke all + RLS açık + politika YOK) ve çözücü `url_takma_ad_coz` yalnız TEK slug
-- sorar; tam liste vermez. Üretecin derleme anında koşabilmesi için iki yol vardı:
--   (a) Vercel ortamına service_role anahtarı koymak: derleme yüzeyine EN güçlü anahtarı taşır;
--   (b) tabloyu anon'a açmak: 20260923'ün "Tabloya doğrudan erişim YOK" kararını (güvenlik incelemesi bulgu 4)
--       geri alır.
-- Karar 310 = A: ikisi de DEĞİL. Tablo kapalı kalır; kiracı süzgeçli, YALNIZ-OKUMA bir liste işlevi eklenir ve
-- üreteç `supabase.rpc('url_takma_adlari_listele')` ile anon anahtarla çalışır.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NE AÇILIYOR, NE AÇILMIYOR (canlıda salt-okuma ile ölçüldü, 2026-10-07)
-- ═════════════════════════════════════════════════════════════════════════════
-- · Tabloya HİÇBİR yetki ve politika eklenmez: RLS açık, politika yok, anon/authenticated tabloyu hâlâ okuyamaz.
-- · İşlev yalnız (tenant_id, tur, dil, eski_slug, hedef_id) döner. `sebep` (tohum/denetim iç kimlikleri) ve
--   `created_at` DÖNMEZ.
-- · Kiracı = jwt_tenant_id(). İşlev kiracı PARAMETRESİ ALMAZ: çağıran başka kiracıyı okuyamaz (kural 12).
--   Ölçüm: jwt_tenant_id() claim yoksa, claim'de app_metadata.tenant_id yoksa ya da ayrıştırma hata verirse
--   VARSAYILAN kiracıyı döner. Yani anon ve service_role AYNI satırları görür (tutarlı). Bu yüzden `tenant_id`
--   çıktıda DÖNER: üreteç başka bir kiracının satırını görürse düşer, sessizce yanlış harita üretmez.
-- · Sızıntı yüzeyi: anon zaten products ve categories tablolarını kiracı süzgeciyle, product_families'i
--   deleted_at is null ile okuyabiliyor (prod_public_read_opt, cat_public_read_opt, product_families_tenant_select).
--   Liste bu nesnelerin ESKİ adlarını (geçmiş) ekler. Bugün 49 satır (aile 40, ürün 7, kategori 2); hepsinin
--   hedefi canlı nesne. Bu açılışı Recep karar 310 ile bilerek kabul etti.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TASARIM
-- ═════════════════════════════════════════════════════════════════════════════
-- · SECURITY DEFINER + sabit search_path: tablo anon'a kapalı olduğu için okuma ancak sahip yetkisiyle olur.
--   Kalıp url_takma_ad_coz ile aynı (20260923083021) ve satis_kipi_oku ile aynı yetki biçimi (20260929150000).
-- · STABLE + LANGUAGE sql: tek SELECT, yazma yok. Üreteç çağrıyı `get: true` ile yapar; PostgREST GET çağrısını
--   salt-okunur işlemde koşturur (ikinci güvence).
-- · `(select public.jwt_tenant_id())`: kiracı bir kez çözülür, birincil anahtar (tenant_id, tur, dil, eski_slug)
--   kullanılır. Depodaki *_opt politikalarının aynı biçimi.
-- · ORDER BY (tur, dil, eski_slug) birincil anahtarın kalanıdır → toplam sıra; sayfalı okuma (offset/limit)
--   tekrar ve atlama üretmez.
-- · İdempotent: create or replace; aynı imza ve dönüş tipi. Yetkiler her koşuda aynı son duruma getirilir.
--
-- GERİ ALMA (elle, Recep onayıyla; migration'lar ileri yönlüdür): drop function public.url_takma_adlari_listele();
--   Üreteç işlev yokken fail-closed düşer (PostgREST 404, "okunamadı"): harita üretilmez, eski harita dosyası ve
--   canlı sayfalar etkilenmez.
--
-- Cetvel: docs/standards/migration-safety-standard.md (salt-ekleyici; INV-MIGRATION-1 biçim a) · CLAUDE.md
-- kural 2 (DI), 11, 12 (tenant), 13 (merge = prod).

-- ⭐ZAMAN AŞIMLARI (INV-MIGRATION-3): yalnız yeni bir işlev; yine de kilit beklerse migration hızlı düşsün.
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

create or replace function public.url_takma_adlari_listele()
returns table (
  tenant_id uuid,
  tur       text,
  dil       text,
  eski_slug text,
  hedef_id  uuid
)
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select t.tenant_id, t.tur, t.dil, t.eski_slug, t.hedef_id
    from public.url_takma_adlari t
   where t.tenant_id = (select public.jwt_tenant_id())
   order by t.tur, t.dil, t.eski_slug;
$function$;

-- anon-DEFINER sınıfı (url_takma_ad_coz ve satis_kipi_oku emsali): önce HERKESTEN geri al, sonra hedefli ver.
-- Supabase varsayılan yetkileri yeni işleve anon/authenticated/service_role EXECUTE verir; PUBLIC'in de varsayılan
-- EXECUTE'u vardır. `revoke ... from public` tek başına anon'un DOĞRUDAN hakkını kaldırmaz, bu yüzden üçü birlikte.
revoke all on function public.url_takma_adlari_listele() from public, anon, authenticated;
grant execute on function public.url_takma_adlari_listele() to anon, authenticated, service_role;

comment on function public.url_takma_adlari_listele() is
  'ALT-37e (karar 310): url_takma_adlari tablosunun kiracı süzgeçli, yalnız-okuma listesi (tenant_id, tur, dil, '
  'eski_slug, hedef_id). Kiracı jwt_tenant_id() ile; parametre almaz. Tabloya doğrudan erişim hâlâ YOK. '
  'Tüketici: src/lib/adres/haritaUret.ts (eski adres haritası üreteci).';

-- GUARD: inen şey beklenen şeyle birebir mi (yalnız ad değil; tanım, yetki, tablonun kapalı kalışı, davranış).
-- Boş veritabanında (gölge tabanı) davranış kolu 0 = 0 ile geçer ve bunu NOTICE ile SÖYLER, sessiz geçmez.
do $$
declare
  v_fonk  oid := 'public.url_takma_adlari_listele()'::regprocedure;
  v_rol   text;
  v_liste bigint;
  v_tablo bigint;
  v_yabanci bigint;
begin
  -- 1) Tanım: SECURITY DEFINER, STABLE, sabit search_path.
  if not exists (
    select 1 from pg_proc p
     where p.oid = v_fonk
       and p.prosecdef
       and p.provolatile = 's'
       and p.proconfig @> array['search_path=public, pg_temp']
  ) then
    raise exception 'GUARD: url_takma_adlari_listele() DEFINER / STABLE / sabit search_path degil';
  end if;

  -- 2) Yetki: anon, authenticated, service_role EXECUTE; PUBLIC (grantee 0) YOK.
  foreach v_rol in array array['anon', 'authenticated', 'service_role'] loop
    if not has_function_privilege(v_rol, v_fonk, 'EXECUTE') then
      raise exception 'GUARD: % url_takma_adlari_listele() cagiramiyor', v_rol;
    end if;
  end loop;
  if (select p.proacl is null or exists (select 1 from aclexplode(p.proacl) a where a.grantee = 0)
        from pg_proc p where p.oid = v_fonk) then
    raise exception 'GUARD: url_takma_adlari_listele() PUBLIC icin acik (revoke ... from public eksik)';
  end if;

  -- 3) Tablo KAPALI kalıyor: bu migration tabloya hiçbir yetki ve politika vermez.
  if exists (select 1
               from unnest(array['anon', 'authenticated']) r(rol),
                    unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) y(yetki)
              where has_table_privilege(r.rol, 'public.url_takma_adlari', y.yetki)) then
    raise exception 'GUARD: url_takma_adlari anon/authenticated icin ACIK';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.url_takma_adlari'::regclass) then
    raise exception 'GUARD: url_takma_adlari RLS kapali';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'url_takma_adlari') then
    raise exception 'GUARD: url_takma_adlari uzerinde politika var (tablo kapali kalmali, liste yalniz islevden)';
  end if;

  -- 4) Davranış: işlev, tablonun jwt_tenant_id() kiracısındaki satırlarının TAMAMINI döner; başka kiracı satırı YOK.
  select count(*) into v_liste from public.url_takma_adlari_listele();
  select count(*) into v_tablo from public.url_takma_adlari where tenant_id = public.jwt_tenant_id();
  select count(*) into v_yabanci from public.url_takma_adlari_listele() where tenant_id <> public.jwt_tenant_id();
  if v_liste <> v_tablo then
    raise exception 'GUARD: islev % satir dondu, tablo % satir (kiraci %)', v_liste, v_tablo, public.jwt_tenant_id();
  end if;
  if v_yabanci <> 0 then
    raise exception 'GUARD: islev baska kiracinin % satirini dondurdu', v_yabanci;
  end if;
  if v_tablo = 0 then
    raise notice 'GUARD: url_takma_adlari bu kiracida bos (bos veritabani / golge tabani); davranis kolu 0 = 0 ile gecti';
  else
    raise notice 'GUARD: islev % satir dondu (tablo ile esit, baska kiraci 0)', v_liste;
  end if;
end
$$;

commit;

-- Doğrulama (merge sonrası, salt okuma; ret kolu kabul kolu olmadan kanıt değildir):
--   kabul : set local role anon; select count(*) from public.url_takma_adlari_listele();        → 49 (bugün)
--   ret   : has_table_privilege('anon', 'public.url_takma_adlari', 'SELECT')                     → false
--   yetki : proacl = {postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}
--           (PUBLIC girdisi YOK; url_takma_ad_coz ile aynı biçim)
