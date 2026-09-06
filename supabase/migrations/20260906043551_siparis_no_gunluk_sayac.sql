-- REC-156 — SİPARİŞ NUMARASI: SAAT DEĞİL, GÜNÜN SIRA SAYACI
--
-- ═══════════════════════════════════════════════════════════════════════════
-- NİÇİN (ölçülmüş kusur, 2026-09-06)
-- ═══════════════════════════════════════════════════════════════════════════
-- Eski üretici:
--     'VH-' || TO_CHAR(NOW(),'YYYYMMDD') || '-' ||
--     LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0')
--
-- Son dört hane bir SAYAÇ DEĞİL, saatin 10000'e bölümünden kalandır. Sonuçları:
--
--   1. Aynı saniyedeki iki sipariş AYNI numarayı ister.
--      KANIT (prod'da, salt-okuma, hiçbir şey yazılmadan ölçüldü):
--        SELECT generate_order_number(), generate_order_number(), generate_order_number();
--        → VH-20260906-9343 | VH-20260906-9343 | VH-20260906-9343   (üçü de AYNI)
--   2. `venthub_orders_order_number_key` UNIQUE indeksi VAR. Dolayısıyla çakışma
--      mükerrer kayıt değil **INSERT HATASI** üretir → müşterinin siparişi PATLAR.
--   3. Son ek her 10000 sn'de (2sa 46dk 40sn) başa döner; aynı gün içinde ~8.64 tur atar,
--      yani aynı günün iki farklı saatindeki sipariş de çakışabilir.
--
-- RİSK MATEMATİĞİ (gün içine ~düzgün dağılım varsayımıyla, doğum-günü yaklaşımı
-- P ≈ 1 − exp(−N²/20000)):  50 sipariş/gün → %12 · 100 → %39 · 200 → %86.
-- Bugün gerçekleşmedi çünkü toplam 5 sipariş var ve SATIŞ KİPİ KAPALI — yani kusur,
-- satış açıldığı gün, en pahalı anda ortaya çıkacaktı.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- ÇÖZÜM
-- ═══════════════════════════════════════════════════════════════════════════
-- `NNNN` artık O GÜNÜN SIRA SAYACI: 0001, 0002, 0003 …
--
-- • Yarış-güvenli: sayaç `INSERT … ON CONFLICT DO UPDATE … RETURNING` ile tek
--   ifadede artar; eşzamanlı iki sipariş satır kilidinde sıraya girer, ikisi de
--   FARKLI numara alır.
-- • BOŞLUKSUZ: artış çağıranın işlemi İÇİNDE olur. Sipariş geri alınırsa sayaç da
--   geri alınır — muhasebe tarafında atlanan numara olmaz.
--   ⚖BEDELİ, ADIYLA: kilit işlem sonuna kadar tutulur, yani aynı gün eşzamanlı
--   siparişler bu satırda SERİLEŞİR. Bizim hacmimizde (bugüne dek 5 sipariş)
--   ölçülebilir bir maliyet değil; hacim büyürse alternatif, boşluk kabul eden
--   `sequence`'tır (o zaman bu yorum güncellenmeli).
-- • UNIQUE kısıt EMNİYET KEMERİ olarak KALIR: mantık bozulursa sessizce mükerrer
--   üretmek yerine gürültülü şekilde durur.
--
-- ⭐GÜN SINIRI İSTANBUL'A GÖRE: eski üretici `NOW()`'u oturum saat diliminde
-- biçimlendiriyordu (Supabase'de UTC). Türkiye'de saat 00:00–03:00 arasında verilen
-- bir sipariş bu yüzden BİR ÖNCEKİ günün tarihini alıyordu. Numaranın üzerindeki
-- tarih müşteriye ve muhasebeye "hangi gün" diye okunduğundan, gün sınırı artık
-- açıkça `Europe/Istanbul`. Bu BİLİNÇLİ bir davranış değişikliğidir.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- GERİ ALINABİLİRLİK (OPS şartı)
-- ═══════════════════════════════════════════════════════════════════════════
-- Eski fonksiyon SİLİNMEZ; `generate_order_number_saat_tabanli_20260906` adıyla
-- durur. Geri dönüş tek adımdır — bu dosyanın en altındaki blokta yazılı.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1) Günlük sayaç tablosu ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_number_counters (
  gun     date    PRIMARY KEY,
  son_no  integer NOT NULL DEFAULT 0 CHECK (son_no >= 0)
);

COMMENT ON TABLE public.order_number_counters IS
  'REC-156: sipariş numarasının günlük sıra sayacı. Yalnız generate_order_number() yazar (SECURITY DEFINER).';

-- RLS AÇIK ve POLİTİKA YOK = hiçbir istemci rolü okuyamaz/yazamaz.
-- Tabloya erişen tek yol, sahibi adına koşan SECURITY DEFINER fonksiyondur.
-- (Politika var/GRANT yok karışıklığı olmasın diye: burada ikisi de yok, kasıtlı.)
ALTER TABLE public.order_number_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_number_counters FROM anon, authenticated;

-- ─── 2) Eski üreticiyi ADIYLA SAKLA (silme yok) ─────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'generate_order_number'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'generate_order_number_saat_tabanli_20260906'
  ) THEN
    ALTER FUNCTION public.generate_order_number()
      RENAME TO generate_order_number_saat_tabanli_20260906;
  END IF;
END $$;

-- ─── 3) Yeni üretici: günün sıra sayacı ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

COMMENT ON FUNCTION public.generate_order_number() IS
  'REC-156: VH-YYYYMMDD-NNNN; NNNN = o günün sıra sayacı (yarış-güvenli, boşluksuz). Eski saat-tabanlı sürüm: generate_order_number_saat_tabanli_20260906.';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- KANIT (migration UYGULANDIKTAN SONRA koşulur — bu dosya çalıştırmaz)
-- ═══════════════════════════════════════════════════════════════════════════
-- Aynı ifadede üç çağrı ÜÇ FARKLI numara vermeli:
--
--   SELECT public.generate_order_number() AS n1,
--          public.generate_order_number() AS n2,
--          public.generate_order_number() AS n3;
--   -- BEKLENEN: VH-YYYYMMDD-0001 | -0002 | -0003   (eskiden ÜÇÜ DE AYNIydı)
--
-- Eşzamanlılık kanıtı (iki ayrı oturum, aynı saniye):
--   Oturum A: BEGIN; SELECT public.generate_order_number(); -- COMMIT etme
--   Oturum B: SELECT public.generate_order_number();        -- A commit edene dek BEKLER
--   Oturum A: COMMIT;  → B farklı numara alır (çakışma YOK, kayıp YOK)
--
-- Boşluksuzluk kanıtı:
--   BEGIN; SELECT public.generate_order_number(); ROLLBACK;
--   → sayaç geri alınır; sonraki numara atlamaz.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- GERİ ALMA (tek adım)
-- ═══════════════════════════════════════════════════════════════════════════
--   DROP FUNCTION public.generate_order_number();
--   ALTER FUNCTION public.generate_order_number_saat_tabanli_20260906()
--     RENAME TO generate_order_number;
--   -- (order_number_counters tablosu kalabilir; zararsızdır ve veri taşır.)
-- ═══════════════════════════════════════════════════════════════════════════
