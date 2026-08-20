-- Migration: 20260819160000_payment_status_trigger_fix.sql
-- T114-VH - sync_payment_status_with_status: olu dallar + KISMI IADEYI YUTAN canli kusur.
--
-- IS EMRI "olu dallar" diyordu (AUTH olcumu: status kisiti 'paid'/'failed' kabul etmiyor).
-- Dogruydu. Ama olu dallari temizlerken ayni kosulun ICINDE canli bir kusur cikti ve asil
-- mesele o: KISMI IADE, siparisi sessizce "tam odenmis" haline getiriyor.
--
-- ══ OLCUM (2026-08-19, prod) ═══════════════════════════════════════════════════════
--
-- Tetigin bugunku govdesi:
--
--   IF NEW.status IN ('paid','confirmed') AND COALESCE(NEW.payment_status,'') <> 'refunded'
--     THEN NEW.payment_status := 'paid';
--   ELSIF NEW.status = 'failed' THEN NEW.payment_status := 'failed';
--
-- venthub_orders_status_check yalnizca su degerleri kabul ediyor:
--   pending · confirmed · processing · shipped · delivered · cancelled
--
-- Yani 'paid' ve 'failed' bu kolona HIC yazilamaz:
--   · IN ('paid','confirmed') listesindeki 'paid'  -> OLU
--   · ELSIF NEW.status = 'failed' dali             -> TAMAMEN OLU
--
-- payment_status='failed' degerini gercekte YAZAN yerler baska (olculdu):
--   iyzico-callback (basarisiz odeme) · order-housekeeping · release-expired-reservations.
-- Yani olu dalin kaldirilmasi hicbir davranisi degistirmez -- zaten hic calismiyordu.
--
-- ══ ASIL BULGU: KISMI IADE YUTULUYOR ═══════════════════════════════════════════════
--
-- iyzico-refund kismi iadede su PATCH'i atiyor (index.ts 363-383):
--   payment_status = 'partial_refunded'
--   status         = order.status         <-- DEGISMIYOR ama SET listesinde
--
-- Tetik BEFORE UPDATE OF status; kolon SET listesinde oldugu icin deger degismese de
-- ATESLENIR. Kosul: status='confirmed' listede VAR, payment_status='partial_refunded'
-- ise 'refunded' DEGIL -> koruma tutmuyor -> NEW.payment_status := 'paid'.
--
-- Sonuc: para cikti, kayit "tam odendi" diyor. Sessiz sinif: hicbir hata yok, hicbir log yok.
--
-- Gercek fonksiyonla, gecici tabloda olculdu (prod'a YAZMADAN):
--
--   status      | gelen payment_status | tetikten sonra
--   ------------+----------------------+---------------
--   confirmed   | partial_refunded     | paid      <-- KUSUR
--   confirmed   | refunded             | refunded  (koruma yalniz bu degeri taniyor)
--   shipped     | partial_refunded     | partial_refunded
--   processing  | partial_refunded     | partial_refunded
--   delivered   | partial_refunded     | partial_refunded
--   cancelled   | refunded             | refunded
--
-- Pencere dar ama tam da en olagan iade senaryosu: KARGOLANMAMIS, onaylanmis siparisin
-- kismi iadesi. Bugun prod'da 5 siparis var ve besi de payment_status='pending' -- yani
-- kusur VERIYLE henuz karsilasmadi; kod yolu ise canli ve dogru calisiyor.
--
-- ══ COZUM: IZIN LISTESI, YASAK LISTESI DEGIL ═══════════════════════════════════════
--
-- 'partial_refunded' degerini korumaya eklemek yeterdi. Yetmez sayiyorum: bu, ayni hatanin
-- bir sonraki yeni degerde tekrarlanmasini bekler. Tetigin isi, yasam dongusu 'confirmed'
-- oldugunda BOS kalan odeme durumunu DOLDURMAKTIR; dolu bir degeri ezmek isi degildir.
--
-- Yeni kural: yalnizca payment_status BOS ya da 'pending' ise yaz.
--
-- Bunun tek gorunur sonucu su olurdu: odemesi 'failed' kalmis bir siparis sonradan
-- 'confirmed'e cekilirse artik otomatik 'paid' olmaz. Olculdu: gercek yolda bu bir kayip
-- degil -- iyzico-callback basarili odemede ZATEN { status:'confirmed', payment_status:'paid' }
-- ciftini birlikte yaziyor (index.ts 301). Yani deger acikca yaziliyor, tetige gerek yok.
--
-- Olcum: docs/audits/t114-payment-status-trigger-2026-08-19.md
-- Kapi:  src/__tests__/conformance/payment-status-trigger-contract.test.ts

BEGIN;

CREATE OR REPLACE FUNCTION public.sync_payment_status_with_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Yalnizca yasam dongusu 'confirmed' ise ve odeme durumu HENUZ DOLDURULMAMISSA yaz.
  -- Dolu bir deger (paid/failed/refunded/partial_refunded) ASLA ezilmez -- kismi iadeyi
  -- yutan kusur tam olarak buydu (T114-VH).
  IF NEW.status = 'confirmed' AND COALESCE(NEW.payment_status, '') IN ('', 'pending') THEN
    NEW.payment_status := 'paid';
  END IF;
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_payment_status_with_status() IS
  'Yasam dongusu confirmed olunca BOS/pending odeme durumunu paid yapar. Dolu degeri EZMEZ (T114-VH). status kisiti paid/failed kabul etmedigi icin o dallar kaldirildi.';

-- ══ UYGULANDIGININ KENDI ICINDE KANITI ════════════════════════════════════════════
-- Gecici tabloya GERCEK fonksiyon baglanir ve davranis matrisi olculur. Beklenen sonuc
-- cikmazsa migration coker; prod'a yarim bir tetik kalmaz.
DO $$
DECLARE
  hata text := '';
  r record;
BEGIN
  CREATE TEMP TABLE t114_dogrulama (id int primary key, status text, payment_status text)
    ON COMMIT DROP;
  CREATE TRIGGER t114_ins BEFORE INSERT ON t114_dogrulama
    FOR EACH ROW EXECUTE FUNCTION public.sync_payment_status_with_status();

  INSERT INTO t114_dogrulama VALUES
    (1, 'confirmed',  'partial_refunded'),  -- kismi iade: KORUNMALI
    (2, 'confirmed',  'refunded'),          -- tam iade:   KORUNMALI
    (3, 'confirmed',  'pending'),           -- odeme onayi: paid OLMALI
    (4, 'confirmed',  NULL),                -- bos:         paid OLMALI
    (5, 'shipped',    'partial_refunded'),  -- dokunulmaz
    (6, 'cancelled',  'failed'),            -- dokunulmaz
    (7, 'processing', 'pending');           -- dokunulmaz (yalniz confirmed yazar)

  FOR r IN
    SELECT * FROM (VALUES
      (1, 'partial_refunded'),
      (2, 'refunded'),
      (3, 'paid'),
      (4, 'paid'),
      (5, 'partial_refunded'),
      (6, 'failed'),
      (7, 'pending')
    ) AS beklenen(id, deger)
  LOOP
    IF (SELECT COALESCE(payment_status, '') FROM t114_dogrulama WHERE id = r.id) <> r.deger THEN
      hata := hata || format(' id=%s beklenen=%s gelen=%s;', r.id, r.deger,
        (SELECT COALESCE(payment_status, 'NULL') FROM t114_dogrulama WHERE id = r.id));
    END IF;
  END LOOP;

  IF hata <> '' THEN
    RAISE EXCEPTION 'T114 davranis dogrulamasi basarisiz:%', hata;
  END IF;
END $$;

COMMIT;
