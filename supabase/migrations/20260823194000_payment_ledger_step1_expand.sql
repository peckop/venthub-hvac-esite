-- =============================================================================
-- T116 · ODEME DEFTERI · ADIM-1 (GENISLET)
-- Cetvel: docs/standards/payment-ledger-standard.md §6.1
--
-- NICIN "GENISLET": master'a push, supabase-migrate.yml ile deploy-functions.yml
-- is akislarini PARALEL tetikler ve aralarinda sira garantisi YOKTUR. Bu yuzden
-- venthub_orders.currency VARSAYILANLA eklenir: migration once inerse eski
-- fonksiyon (alani gondermeyen) calismaya devam eder, yazici once inerse kolon
-- zaten gelmis olur. Varsayilan ADIM-2'de dusurulur (cetvel §6.1 adim 3).
-- =============================================================================

-- 1) venthub_orders.currency — GENISLET (varsayilan BILEREK var)
ALTER TABLE public.venthub_orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'TRY';

COMMENT ON COLUMN public.venthub_orders.currency IS
  'Siparisin islem para birimi (ISO 4217). ADIM-1de DEFAULT TRY tasir; ADIM-2de varsayilan dusurulur ve yazici acikca gonderir. Cetvel: docs/standards/payment-ledger-standard.md';

-- 2) Defter sozlugu — ONCE ONKOSULU KANITLA, SONRA DEGISTIR
--    (kisit mevcut satirlari dogrular; sessizce patlamasin diye once sayiyoruz)
DO $$
DECLARE uymayan integer;
BEGIN
  SELECT count(*) INTO uymayan
    FROM public.payment_transactions
   WHERE status IS NOT NULL
     AND status NOT IN ('authorized','captured','failed','voided','refunded','partial_refunded');
  IF uymayan > 0 THEN
    RAISE EXCEPTION 'ADIM-1 DURDU: payment_transactions icinde yeni sozluge uymayan % satir var. Once esleme migrationu yazilmali (cetvel §2.1).', uymayan;
  END IF;
END $$;

ALTER TABLE public.payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_status_check;

ALTER TABLE public.payment_transactions
  ADD CONSTRAINT payment_transactions_status_check
  CHECK (status IN ('authorized','captured','failed','voided','refunded','partial_refunded'));

-- 3) Defter silinmez — CASCADE yerine RESTRICT (cetvel §3 degismez 4)
ALTER TABLE public.payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_order_id_fkey;

ALTER TABLE public.payment_transactions
  ADD CONSTRAINT payment_transactions_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.venthub_orders(id) ON DELETE RESTRICT;
