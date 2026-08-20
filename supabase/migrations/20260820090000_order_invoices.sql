-- Migration: 20260820090000_order_invoices.sql
-- T132-VH - Fatura v1: faturalandi isareti + admin fatura kayit defteri.
--
-- ══ NICIN TABLO, NICIN payment_debug DEGIL ═══════════════════════════════════════
--
-- legal-compliance-standard 2.3 (kopru proseduru) bugune kadar sunu diyordu:
-- "Kayit: siparis faturalandi olarak isaretlenir (kopru doneminde payment_debug icine
-- invoice_no + invoice_date; kalici cozumde invoices tablosu)". Recep 08-20'de KALICI
-- yolu secti. Gerekce dortlu ve olculdu:
--
--   1) payment_debug'i ODEME ve IADE yollari da yaziyor (iyzico-refund index.ts 383).
--      Hukuki kaydi para yolunun yazdigi kolonda tutmak, T114-VH'de olctugum sessiz-ezme
--      sinifini davet eder: orada kismi iade, korumasi olmayan bir degeri ezip siparisi
--      "tam odendi" yapiyordu. Fatura kaydi ezilirse yasal delil kaybolur.
--   2) Defterin ANA SORUSU "hangi odenmis siparis faturalanmadi". JSON'da bu indekssiz
--      tarama; tabloda tek NOT EXISTS sorgusu (asagidaki view).
--   3) FATURA NUMARASI TEKILLIGI: JSON'da zorlanamaz. Ayni numaranin iki siparise
--      yazilmasi vergi hukukunda ciddi bir kusurdur; burada UNIQUE indeks zorluyor.
--   4) KVKK: fatura kaydi kisisel veridir. Ayri tablo = ayri RLS + ayri denetim yuzeyi.
--
-- ══ "FATURALANDI" BIR KOLON DEGIL ════════════════════════════════════════════════
--
-- Bilerek boolean bir `is_invoiced` kolonu EKLENMEDI. Isaret, satirin VARLIGINDAN
-- turetilir. Aksi hâlde iki dogruluk kaynagi olurdu (bayrak ve defter) ve ayristiklari
-- gun hangisinin dogru oldugunu kimse bilemezdi. Bu depoda ayni sinif yasandi:
-- "status" ile "payment_status" karistirildi ve satista stok hic dusmedi (T052).
--
-- ══ ODENMEMIS SIPARISE FATURA KESILEMEZ ══════════════════════════════════════════
--
-- Cetvelin tetigi acik: 2.3 "payment_status = 'paid' olan her yeni siparis". Bunu bir
-- tetikle zorluyorum. Bugun hicbir seyi bloklamiyor (olculdu 08-20: 5 siparis, ODENMIS
-- SIFIR), yani kural bedelsizce simdi konur. Proforma/avans faturasi v1 KAPSAMINDA
-- DEGILDIR; gerekirse tetigin gevsetilmesi bilincli bir karar olarak yapilir.
--
-- ══ YETKI MODELI ═════════════════════════════════════════════════════════════════
--
-- TABLO: Supabase modeli geregi yetki genis, kapi RLS'tir (bkz. db-grant-hygiene-standard
-- 3 - T101-VH). Bu tabloda anon/authenticated icin POLITIKA YOK, dolayisiyla RLS reddeder.
-- Model disina cikip elle REVOKE yazmiyorum; iki farkli desen birakmak, okuyani yanıltır.
--
-- VIEW: view'in kendi RLS'i YOKTUR, orada kapi GRANT'tir - o yuzden ayni cetvelin 1.
-- maddesi geregi dort rolden de REVOKE ALL yapilip SELECT adiyla geri veriliyor.
-- INV-VIEW-GRANT-1 bunu zorluyor.
--
-- UPDATE/DELETE POLITIKASI YOK: fatura kaydi yasal kayittir, degistirilmez. Duzeltme
-- gerekiyorsa yol, iptal + yeni fatura satiridir (v1 kapsami disi; geldiginde bu tabloya
-- cancelled_at + cancel_reason eklenir ve "faturalandi" turetimi ona gore daralir).
--
-- Cetvel: docs/standards/legal-compliance-standard.md 2.3
-- Kapi:   src/__tests__/conformance/invoice-ledger-contract.test.ts (INV-INVOICE-1)
-- Olcum:  docs/audits/t132-invoice-ledger-2026-08-20.md

BEGIN;

CREATE TABLE IF NOT EXISTS public.order_invoices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES public.venthub_orders(id) ON DELETE RESTRICT,
  invoice_no   text NOT NULL,
  invoice_date date NOT NULL,
  -- Kesim anindaki fatura tipi ANLIK GORUNTU olarak saklanir: siparisteki invoice_type
  -- sonradan degisirse kesilmis faturanin tipi degismemelidir.
  invoice_type text,
  issued_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_invoices_invoice_no_not_blank CHECK (btrim(invoice_no) <> '')
);

COMMENT ON TABLE public.order_invoices IS
  'T132-VH fatura defteri. Bir siparisin faturalandigi, BU TABLODA SATIRI OLMASINDAN anlasilir; boolean bayrak bilerek yoktur. Yasal kayit: UPDATE/DELETE politikasi yok.';

-- Fatura numarasi TEKILDIR. Normalize edilerek kilitlenir: "ABC-1", "abc-1" ve
-- " ABC-1 " ayni numaradir; aksi hâlde tekillik bosluk/buyuk-kucuk farkiyla delinir.
CREATE UNIQUE INDEX IF NOT EXISTS order_invoices_invoice_no_uniq
  ON public.order_invoices (lower(btrim(invoice_no)));

CREATE INDEX IF NOT EXISTS order_invoices_order_id_idx
  ON public.order_invoices (order_id);

-- ── Odenmemis siparise fatura kesilemez ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_invoice_only_for_paid_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

DROP TRIGGER IF EXISTS trg_invoice_requires_paid_order ON public.order_invoices;
CREATE TRIGGER trg_invoice_requires_paid_order
  BEFORE INSERT ON public.order_invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_only_for_paid_order();

-- ── RLS: yalniz admin okur ve yazar ────────────────────────────────────────────
ALTER TABLE public.order_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_invoices_admin_select ON public.order_invoices;
CREATE POLICY order_invoices_admin_select ON public.order_invoices
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS order_invoices_admin_insert ON public.order_invoices;
CREATE POLICY order_invoices_admin_insert ON public.order_invoices
  FOR INSERT WITH CHECK (public.is_admin_user());

-- ── Faturalanmamis odenmis siparisler (defterin ana sorusu) ────────────────────
DROP VIEW IF EXISTS public.view_admin_uninvoiced_orders;

CREATE VIEW public.view_admin_uninvoiced_orders WITH (security_invoker = true) AS
SELECT
  o.id,
  o.order_number,
  o.created_at,
  o.total_amount,
  o.customer_name,
  o.customer_email,
  o.invoice_type,
  o.invoice_info
FROM public.venthub_orders o
WHERE o.payment_status = 'paid'
  -- View'in KENDI RLS'i yoktur; satir kapisi burada ADIYLA duruyor. Aksi hâlde
  -- security_invoker altinda musteri kendi odenmis siparisini "faturalanmamis" listesinde
  -- gorurdu -- kendi verisi olsa da yanlis ekran.
  AND public.is_admin_user()
  AND NOT EXISTS (
    SELECT 1 FROM public.order_invoices i WHERE i.order_id = o.id
  );

COMMENT ON VIEW public.view_admin_uninvoiced_orders IS
  'Odemesi tamamlanmis ama fatura defterinde satiri olmayan siparisler. security_invoker=true; satir kapisi is_admin_user() ile view govdesinde.';

-- INV-VIEW-GRANT-1 (T101-VH): view'da kapi GRANT'tir, varsayilan ayricaliklar sekiz
-- yetkiyi zaten vermistir; once dort rolden de geri alinir, sonra SELECT adiyla verilir.
REVOKE ALL ON public.view_admin_uninvoiced_orders FROM PUBLIC;
REVOKE ALL ON public.view_admin_uninvoiced_orders FROM anon;
REVOKE ALL ON public.view_admin_uninvoiced_orders FROM authenticated;
REVOKE ALL ON public.view_admin_uninvoiced_orders FROM service_role;

GRANT SELECT ON public.view_admin_uninvoiced_orders TO authenticated;
GRANT SELECT ON public.view_admin_uninvoiced_orders TO service_role;

-- ══ UYGULANDIGININ KENDI ICINDE KANITI ═══════════════════════════════════════════
-- "SUCCESS" satiri kanit degildir; nesnelerin kendi durumu olculur (T101/T114 dersi).
DO $$
DECLARE
  hata text := '';
  fazla text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                 WHERE n.nspname='public' AND c.relname='order_invoices' AND c.relrowsecurity) THEN
    hata := hata || ' order_invoices RLS kapali;';
  END IF;

  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='order_invoices') <> 2 THEN
    hata := hata || ' order_invoices politika sayisi 2 degil;';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_invoices'
             AND cmd IN ('UPDATE','DELETE')) THEN
    hata := hata || ' order_invoices UPDATE/DELETE politikasi var (yasal kayit degistirilemez);';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public'
                 AND indexname='order_invoices_invoice_no_uniq') THEN
    hata := hata || ' fatura numarasi tekil indeksi yok;';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
                 WHERE c.relname='order_invoices' AND t.tgname='trg_invoice_requires_paid_order') THEN
    hata := hata || ' odeme kapisi tetigi yok;';
  END IF;

  -- View: anon'da hicbir yetki kalmamali, authenticated'da SELECT DISI yetki kalmamali.
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace,
      LATERAL aclexplode(c.relacl) x
    WHERE n.nspname='public' AND c.relname='view_admin_uninvoiced_orders'
      AND pg_get_userbyid(x.grantee)='anon'
  ) THEN
    hata := hata || ' view uzerinde anon yetkisi kaldi;';
  END IF;

  SELECT string_agg(x.privilege_type, ',') INTO fazla
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace,
    LATERAL aclexplode(c.relacl) x
  WHERE n.nspname='public' AND c.relname='view_admin_uninvoiced_orders'
    AND pg_get_userbyid(x.grantee)='authenticated'
    AND x.privilege_type <> 'SELECT';
  IF fazla IS NOT NULL THEN
    hata := hata || format(' view authenticated fazla yetki (%s);', fazla);
  END IF;

  IF hata <> '' THEN
    RAISE EXCEPTION 'T132 dogrulamasi basarisiz:%', hata;
  END IF;
END $$;

COMMIT;
