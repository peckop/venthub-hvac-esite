-- Migration: 20260818130000_admin_returns_search_view.sql
-- T090-VH · Admin iade listesinin ARAMA yuzeyi.
--
-- NICIN VAR
--
-- `/admin/returns` aramasi bugune kadar HIC calismadi. Fetcher su filtreyi kuruyordu:
--
--     .or('reason.ilike.%X%,venthub_orders.customer_name.ilike.%X%, ...')
--
-- PostgREST'te ust-duzey `or=` icindeki bir kosul GOMULU tabloya atifta bulunamaz;
-- `venthub_orders.customer_name` bir kolon adi degil, ayrist(iril)amayan bir yoldur.
-- Sonuc: sorgu 400 ile dusuyor ve arayuz "Veriler yuklenirken bir hata olustu" diyordu.
-- Kusur uretimden beri oradaydi; prod'da 0 iade oldugu icin kimse fark edemedi
-- (olculdu 2026-08-18: venthub_returns=0, venthub_orders=0).
--
-- NICIN VIEW, NICIN DENORMALIZE KOLON DEGIL
--
-- Aranan alanlarin bir kismi IADE satirinda (reason, description), bir kismi ANA
-- siparistedir (order_number, customer_name, customer_email). Tek bir `or()` bunlari
-- ifade edemez. Iki cozum vardi:
--
--   (a) venthub_returns'e trigger ile beslenen `search_text` kolonu  -> iki tetik,
--       bayatlama riski, siparis guncellenince cocuk satirlari tazeleme yuku,
--   (b) JOIN'i ve birlesimi VIEW icinde yapmak                       -> tek kaynak,
--       bayatlama imkansiz (her okumada hesaplanir).
--
-- (b) secildi. Ayrica bu depoda ZATEN kanitlanmis desen: `view_admin_orders`
-- (20260225_admin_orders_search_view.sql) siparis aramasini tam boyle cozuyor ve
-- calisiyor. Ikinci bir desen uretmek, ayni sorunun iki farkli cevabini birakirdi.
--
-- GUVENLIK
--
-- `security_invoker = true` SART: view, cagiranin yetkisiyle calisir, yani
-- venthub_returns ve venthub_orders uzerindeki RLS politikalari AYNEN uygulanir.
-- Varsayilan (security_definer) davranis, view sahibinin yetkisini kullanip
-- musterinin BASKASININ iadesini gormesine yol acardi.
--
-- LEFT JOIN, INNER DEGIL: eski kod `venthub_orders!inner(...)` kullaniyordu. Inner
-- olsaydi, RLS ana siparisi gizledigi anda IADE SATIRI DA kaybolurdu -- yani yetki
-- eksigi "kayit yok" gibi gorunurdu (sessiz-bos sinifi). Left join'de satir kalir,
-- musteri alanlari NULL gelir.
--
-- ARAMANIN TAVANI (durust sinir)
--
-- `search_text` hesaplanmis bir view kolonudur; uzerine indeks konamaz, dolayisiyla
-- ILIKE taramasi sirali okumadir. Bugunku olcekte (0 satir) anlamsiz, on binlerde de
-- kabul edilebilir. Gercekten darlasirsa yol: iade satirinda materyalize kolon +
-- pg_trgm GIN indeksi (pg_trgm bu projede ZATEN kurulu, olculdu).
--
-- YAZMA YOLU DEGISMEDI: statu guncellemeleri (compare-and-swap) hala dogrudan
-- public.venthub_returns'e yazar. Bu yuzden view'a YALNIZ SELECT verilir --
-- `view_admin_orders`'taki INSERT/UPDATE/DELETE grant'lari burada BILEREK yok.

BEGIN;

DROP VIEW IF EXISTS public.view_admin_returns;

CREATE VIEW public.view_admin_returns WITH (security_invoker = true) AS
SELECT
  r.*,
  o.order_number,
  o.customer_name,
  o.customer_email,
  o.total_amount,
  -- Aranabilir alanlar = LISTEDE GORUNEN alanlar. `admin_notes` bilerek disarida:
  -- listede gorunmez, sonuc satirinda eslesmenin NEDEN geldigi anlasilmazdi.
  coalesce(r.reason, '') || ' ' ||
  coalesce(r.description, '') || ' ' ||
  coalesce(o.order_number, '') || ' ' ||
  coalesce(o.customer_name, '') || ' ' ||
  coalesce(o.customer_email, '') AS search_text
FROM public.venthub_returns r
LEFT JOIN public.venthub_orders o ON o.id = r.order_id;

COMMENT ON VIEW public.view_admin_returns IS
  'Admin iade listesinin okuma yuzeyi. security_invoker=true -- RLS cagirana gore uygulanir. Yazma yolu DEGIL: statu guncellemeleri public.venthub_returns uzerinde yapilir.';

GRANT SELECT ON public.view_admin_returns TO authenticated;
GRANT SELECT ON public.view_admin_returns TO service_role;
REVOKE ALL ON public.view_admin_returns FROM anon;
REVOKE ALL ON public.view_admin_returns FROM public;

COMMIT;
