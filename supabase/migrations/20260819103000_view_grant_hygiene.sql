-- Migration: 20260819103000_view_grant_hygiene.sql
-- T101-VH - public semasindaki VIEW'larda fazla yetkilerin geri alinmasi.
--
-- NICIN VAR (olcum 2026-08-19, prod DB)
--
-- ADMIN seridinin 06:10 bulgusu: admin view'larinda `authenticated` rolu SELECT
-- disinda 6 yetki daha tutuyor. Olcum bulguyu DOGRULADI ve MEKANIZMAYI adiyla
-- buldu -- kusur migration'larda degil, VARSAYILAN AYRICALIKLARDA:
--
--   pg_default_acl / public / objtype='r':
--     anon=arwdDxtm  authenticated=arwdDxtm  service_role=arwdDxtm
--
-- Yani public semasinda olusturulan HER tablo ve HER view, dogar dogmaz
-- anon + authenticated + service_role rollerine SEKIZ yetkiyi birden verir
-- (a=INSERT r=SELECT w=UPDATE d=DELETE D=TRUNCATE x=REFERENCES t=TRIGGER m=MAINTAIN).
-- Bunun sonucu iki tanedir ve ikisi de sayaca degil mekanizmaya bakinca gorunur:
--
--   1) Migration'daki `GRANT SELECT ... TO authenticated` satiri ETKISIZDIR.
--      Rol o yetkiyi zaten dogustan almistir; GRANT hicbir seyi degistirmez.
--      Yalnizca REVOKE bir sey degistirir. (20260818130000_admin_returns_search_view.sql
--      bu deponun EN OZENLI view migration'idir -- yorumu "view'a YALNIZ SELECT verilir"
--      der -- ve olcum `view_admin_returns` uzerinde authenticated'in SEKIZ yetkisi
--      oldugunu gosterir. Niyet dogruydu, arac yanlisti.)
--
--   2) TABLO ile VIEW ayni kurala tabi DEGILDIR. Supabase modelinde tablolarda
--      genis GRANT + RLS politikasi kapidir; yetki acik, satir kapali. VIEW'in ise
--      KENDI RLS politikasi YOKTUR. Bir view'da kapi, yalnizca ve yalnizca GRANT'tir.
--      Bu yuzden varsayilan ayricaliklara DOKUNULMAZ (tablolarin modelini kirardi),
--      view'lar ise TEK TEK geri alinir. Bu migration tam olarak onu yapar.
--
-- BUGUNKU RISK: LATENT (canli acik DEGIL) -- ve neden latent oldugu olculdu:
--
--   · Alti view'in HICBIRI otomatik-guncellenebilir degil (pg_relation_is_updatable=0),
--     INSTEAD OF tetigi yok  -> yazma denemesi bugun hata verir.
--   · Alti view de security_invoker  -> yazilabilir olsa bile alttaki tablonun RLS'i
--     cagirana gore uygulanir.
--   · anon/authenticated NOLOGIN     -> bu rollerle ham SQL baglantisi acilamaz;
--     tek yol PostgREST, o da DDL kabul etmez.
--
-- ...ama merdiven KISA: TRIGGER yetkisi elde durdugu icin, gelecekte bir migration
-- view'i basitlestirir (tek tablo -> otomatik guncellenebilir) ya da INSTEAD OF tetigi
-- eklerse, INSERT/UPDATE/DELETE aninda CANLI hale gelir. Kimse bir sey "acmaz";
-- zaten acik duran sey is gormeye baslar. Sessiz sinif budur.
--
-- NE DEGISMIYOR (olculdu): uygulamanin view'lara TEK dokunusu okumadir
--   resourceSearchers.ts · OrdersTableBody · AdminOrdersBoard · AdminLogisticsTableBody
--   · ReturnsTableBody · InventoryTableBody · AdminDashboardPage · useInventoryDetail
-- hepsi `.select(...)`. Yazma yollari dogrudan tabloya gider. Dolayisiyla yazma
-- yetkilerinin geri alinmasi hicbir cagriyi bozmaz.
--
-- SELECT DURUMU AYNEN KORUNUR (mevcut durum olculdu, degistirilmiyor):
--   admin_users        -> authenticated'da SELECT YOK   (20250910_security_hardening
--                         bilerek aldi; geri VERILMEZ)
--   digerleri (5)      -> authenticated'da SELECT VAR   (aynen birakilir)
--   anon               -> hicbir view'da SELECT YOK     (aynen birakilir)
--
-- CETVEL: docs/standards/db-grant-hygiene-standard.md
-- KAPI:   src/__tests__/conformance/db-view-grant-hygiene.test.ts (INV-VIEW-GRANT-1)
-- OLCUM:  docs/audits/t101-view-grant-hygiene-2026-08-19.md

BEGIN;

-- 1) Fazla yetkiler: alti view'in tamaminda uc rolden de her sey geri alinir.
--    PUBLIC dahildir -- gelecekte tanimlanacak bir rol PUBLIC'ten miras almasin.
DO $$
DECLARE
  v text;
BEGIN
  FOREACH v IN ARRAY ARRAY[
    'admin_users',
    'inventory_summary',
    'inventory_velocity',
    'reserved_orders',
    'view_admin_orders',
    'view_admin_returns'
  ] LOOP
    -- Var olmayan bir view'i sessizce atlamak YERINE hata vermek dogrudur:
    -- liste bayatladiysa bunu bilmek isteriz.
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', v);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', v);
    EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', v);
    EXECUTE format('REVOKE ALL ON public.%I FROM service_role', v);
  END LOOP;
END $$;

-- 2) Okuma yetkisi ADIYLA geri verilir. admin_users BILEREK yok.
GRANT SELECT ON public.inventory_summary  TO authenticated;
GRANT SELECT ON public.inventory_velocity TO authenticated;
GRANT SELECT ON public.reserved_orders    TO authenticated;
GRANT SELECT ON public.view_admin_orders  TO authenticated;
GRANT SELECT ON public.view_admin_returns TO authenticated;

-- service_role sunucu tarafidir (RLS'i asar) ve alti view'i de okuyabilmelidir.
GRANT SELECT ON public.admin_users        TO service_role;
GRANT SELECT ON public.inventory_summary  TO service_role;
GRANT SELECT ON public.inventory_velocity TO service_role;
GRANT SELECT ON public.reserved_orders    TO service_role;
GRANT SELECT ON public.view_admin_orders  TO service_role;
GRANT SELECT ON public.view_admin_returns TO service_role;

-- 3) Uygulandiginin KENDI ICINDE kaniti. Beklenen son durum saglanmazsa migration
--    coker ve prod'a yarim bir yetki tablosu kalmaz.
DO $$
DECLARE
  hata text := '';
  v text;
  fazla text;
BEGIN
  FOREACH v IN ARRAY ARRAY[
    'admin_users','inventory_summary','inventory_velocity',
'view_admin_orders','view_admin_returns'
  ] LOOP
    -- anon: hicbir yetki kalmamali
    IF EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace,
        LATERAL aclexplode(c.relacl) x
      WHERE n.nspname='public' AND c.relname=v
        AND pg_get_userbyid(x.grantee) = 'anon'
    ) THEN
      hata := hata || format(' %s: anon yetkisi kaldi;', v);
    END IF;

    -- authenticated: SELECT disinda hicbir sey kalmamali
    SELECT string_agg(x.privilege_type, ',') INTO fazla
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace,
      LATERAL aclexplode(c.relacl) x
    WHERE n.nspname='public' AND c.relname=v
      AND pg_get_userbyid(x.grantee) = 'authenticated'
      AND x.privilege_type <> 'SELECT';
    IF fazla IS NOT NULL THEN
      hata := hata || format(' %s: authenticated fazla yetki (%s);', v, fazla);
    END IF;
  END LOOP;

  IF hata <> '' THEN
    RAISE EXCEPTION 'INV-VIEW-GRANT-1 dogrulamasi basarisiz:%', hata;
  END IF;
END $$;

COMMIT;
