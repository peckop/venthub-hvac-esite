-- REC-355 (karar 43) — `user_profiles` YETKİ DÖNGÜSÜ KESİLDİ (54001)
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (ölçüldü 2026-09-18, iki bağımsız ortamda)
-- ═════════════════════════════════════════════════════════════════════════════
-- `public.is_admin_user()` SECURITY INVOKER'dır (2026-06-02 kararı,
-- 20260602110000_hardened_invoker_functions.sql) ve JWT'de `user_role` claim'i YOKSA yedek dalda
-- `public.user_profiles` okur. `user_profiles` politikaları da `is_admin_user()` çağırır:
--     politika → fonksiyon → politika → …  ⇒  54001 stack depth limit exceeded
--
-- Sonuç KARARSIZ, yani "gizli kusur"dan kötü: özyineleme, yedek dalın iç sorgusu kendi satırını
-- `id = auth.uid()` kolundan görebildiğinde duruyor, göremediğinde sürüyor — hangisi olacağı satır
-- sayısına ve sorgu planına bağlı. Ölçüm: gölgede (2 profil) claim'siz ÜÇ jeton şekli de 54001;
-- canlıda (3 profil) claim'siz super_admin 3 satır alıyor ama claim'siz normal kullanıcı 54001.
--
-- Maskeleyen: `custom_access_token_hook` her JWT'ye `user_role` yazıyor (profilsize 'user').
-- Kusur claim'siz jetonda görünür: hook kapanması, hook'tan önce üretilmiş uzun ömürlü jeton,
-- doğrudan PostgREST çağrısı.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN BU ÇÖZÜM (üç seçenek ölçüldü — plan: docs/plans/rec355-yetki-dongusu-2026-09-18.md)
-- ═════════════════════════════════════════════════════════════════════════════
-- Döngü FONKSİYONDA değil POLİTİKADA kesiliyor. `is_admin_user()` SECURITY DEFINER yapılsaydı
-- döngü de kapanırdı ama 06-02'nin bilinçli INVOKER kararı tersine çevrilir ve yetki yüzeyi
-- genişlerdi. Bunun yerine `user_profiles` politikaları **tablo okumayan** claim-only bir
-- yardımcıya bağlanıyor: döngü artık yapısal olarak İMKÂNSIZ, `is_admin_user()` hiç değişmiyor
-- ve onun yedek dalı bundan sonra döngüsüz çalışıyor. `is_user_admin(uuid)` üzerinden geçen
-- 20 politika (coupons, product_prices, price_lists, order_notes, order_attachments,
-- inventory_movements, inventory_settings) ve üç security_invoker görünüm de aynı boğazdan
-- geçtiği için onlar da döngüsüzleşir.
--
-- ⚠ÖLÇÜLMÜŞ TAKAS (raporda ve Recep'in kararında yazılı): claim'siz bir YÖNETİCİ artık
-- `user_profiles` üzerinde yönetici sayılmaz — yalnız kendi satırını görür, silme reddedilir.
-- Karşılığında claim'siz normal kullanıcı 54001'den kurtulur. Hook biçimli jetonlarda (bugünkü
-- normal akış) davranış BİREBİR aynı: kullanıcı 1 satır, yönetici 2 satır, yönetici silmesi çalışır.
--
-- Cetvel: docs/standards/rls-yetki-karari-standard.md §1 (aynı PR'da güncellendi — karar mercii
-- artık iki fonksiyon). Kapılar: INV-AUTH-YETKI-DONGUSU-1, INV-SEARCH-BEHAVIOR-1 claim'siz kol.
--
-- GERİ ALMA (elle, tek işlem): politikaları `public.is_admin_claim()` yerine
-- `public.is_admin_user()` ile yeniden yaz ve `drop function public.is_admin_claim();`.
-- Böyle bir geri alma kusuru da geri getirir; sebebi bilinerek yapılır.

-- ⭐ZAMAN AŞIMLARI İŞLEMDEN ÖNCE (INV-MIGRATION-3 / squawk require-lock-timeout, 09-18 kırmızı
-- verdi): bu dosya `user_profiles` politikalarını DROP/CREATE ediyor ve o iş tablo üzerinde kilit
-- ister. Kilit beklerse tabloya gelen tüm istekler süresiz durur; zaman aşımı "beklemek" yerine
-- "hızlı başarısız olmak" demektir — migration kırmızı olur ama vitrin ayakta kalır.
set lock_timeout = '5s';
set statement_timeout = '30s';

BEGIN;

-- 1) CLAIM-ONLY YETKİ OKUYUCU — tablo okuması YOK, bu yüzden hiçbir politikadan döngü doğuramaz.
CREATE OR REPLACE FUNCTION public.is_admin_claim()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- 2) EXECUTE DURUŞU emsale göre DAR (20260916113803_arama_fonksiyon_yetki_daraltma.sql).
--    Yeni fonksiyon varsayılan olarak PUBLIC EXECUTE ile doğar; önce geri alınır.
--    `anon` YOK: `user_profiles` üzerinde anon politikası hiç yok, ihtiyacı da yok.
REVOKE EXECUTE ON FUNCTION public.is_admin_claim() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin_claim() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin_claim() TO authenticated, service_role;

-- 3) POLİTİKALAR — adlar BİREBİR korunur, tenant ve self kolları aynı kalır, yalnız yetki
--    mercii değişir. DELETE politikasında self kolu ZATEN YOKTUR (ölçüldü), eklenmiyor:
--    kendi profilini silme bir ürün kararıdır, bu işin kapsamı değil.
DROP POLICY IF EXISTS user_profiles_select_policy ON public.user_profiles;
CREATE POLICY user_profiles_select_policy ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    tenant_id = (SELECT public.jwt_tenant_id())
    AND ((id = (SELECT auth.uid())) OR (SELECT public.is_admin_claim()))
  );

DROP POLICY IF EXISTS user_profiles_insert_policy ON public.user_profiles;
CREATE POLICY user_profiles_insert_policy ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.jwt_tenant_id()
    AND ((id = (SELECT auth.uid())) OR public.is_admin_claim())
  );

DROP POLICY IF EXISTS user_profiles_update_policy ON public.user_profiles;
CREATE POLICY user_profiles_update_policy ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id()
    AND ((id = (SELECT auth.uid())) OR public.is_admin_claim())
  )
  WITH CHECK (
    tenant_id = public.jwt_tenant_id()
    AND ((id = (SELECT auth.uid())) OR public.is_admin_claim())
  );

DROP POLICY IF EXISTS user_profiles_delete_policy ON public.user_profiles;
CREATE POLICY user_profiles_delete_policy ON public.user_profiles
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id()
    AND public.is_admin_claim()
  );

-- 4) GUARD — onarım gerçekten yerinde mi (kontrol listesi maddesi: guard fail-closed).
DO $guard$
DECLARE
  eski int;
  yeni int;
  yetki boolean;
BEGIN
  SELECT count(*) INTO eski
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'user_profiles'
     AND (coalesce(qual, '') LIKE '%is_admin_user%' OR coalesce(with_check, '') LIKE '%is_admin_user%');
  IF eski > 0 THEN
    RAISE EXCEPTION 'REC-355 guard: user_profiles politikalarinda hala is_admin_user() var (%)', eski;
  END IF;

  SELECT count(*) INTO yeni
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'user_profiles'
     AND (coalesce(qual, '') LIKE '%is_admin_claim%' OR coalesce(with_check, '') LIKE '%is_admin_claim%');
  IF yeni <> 4 THEN
    RAISE EXCEPTION 'REC-355 guard: is_admin_claim() cagiran politika sayisi 4 degil (%)', yeni;
  END IF;

  SELECT has_function_privilege('authenticated', 'public.is_admin_claim()', 'EXECUTE') INTO yetki;
  IF NOT yetki THEN
    RAISE EXCEPTION 'REC-355 guard: authenticated EXECUTE yok — politika 42501 verir';
  END IF;

  IF has_function_privilege('anon', 'public.is_admin_claim()', 'EXECUTE') THEN
    RAISE EXCEPTION 'REC-355 guard: anon EXECUTE acik — yuzey daraltma karari geri kacti';
  END IF;
END
$guard$;

COMMIT;
