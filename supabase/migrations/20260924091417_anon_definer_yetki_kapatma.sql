-- AUTH (İlgili: REC-54, REC-156) — anon'un doğrudan çağırabildiği iki SECURITY DEFINER fonksiyon kapanıyor
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (canlıda salt okuma ile ölçüldü, 2026-09-24)
-- ═════════════════════════════════════════════════════════════════════════════
-- public şemasında anon'un EXECUTE hakkı olan SECURITY DEFINER fonksiyonlar tek tek okundu (7 adet):
--   denetim_izi_yaz · notify_order_paid · notify_quote_request_created
--        → dönüş tipi trigger; doğrudan çağrılamaz, PostgREST RPC olarak sunmaz. DOKUNULMUYOR.
--   submit_contact_message   → KASITLI açık (iletişim formu; doğrulanmış tek INSERT, okuma yok). DOKUNULMUYOR.
--   url_takma_ad_coz         → KASITLI açık (eski adres yönlendirmesi; salt okuma). DOKUNULMUYOR.
--   admin_publish_quote      → gövde is_admin_user() ile reddediyor; sömürülemez ama kapatılması
--                              AMAÇLANMIŞTI (20260828120000). Supabase varsayılan yetkileri anon'a
--                              DOĞRUDAN EXECUTE veriyor; `revoke ... from public` bunu kaldırmaz.
--   generate_order_number    → ⛔ SÖMÜRÜLEBİLİR. Gövdede rol kontrolü yok; her çağrı
--                              order_number_counters'ta günün sayacını KALICI +1 artırıyor ve
--                              9999'u aşınca RAISE ediyor. anon anahtarıyla /rpc/generate_order_number'a
--                              9999 istek = o gün kalan TÜM sipariş INSERT'leri düşer (set_order_number
--                              tetiği aynı fonksiyonu çağırır). Ayrıca "boşluksuz numara" vaadi bozulur.
--                              authenticated da aynı çağrıyı yapabiliyor — üyelik ücretsiz olduğu için
--                              YALNIZ anon'u kapatmak yetmez.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN BU ÇÖZÜM
-- ═════════════════════════════════════════════════════════════════════════════
-- generate_order_number'ın TEK meşru çağıranı set_order_number tetiği (venthub_orders BEFORE INSERT).
-- Depoda başka çağıran yok (src/, supabase/functions/ taranmış: 0). Tetik şu an SECURITY INVOKER,
-- yani INSERT eden rolle (authenticated ya da service_role) koşuyor ve o rolün EXECUTE hakkına
-- muhtaç. Bu yüzden:
--   (1) set_order_number SECURITY DEFINER olur (sahibi postgres) → iç çağrı sahip yetkisiyle yapılır.
--       Tetik fonksiyonu doğrudan çağrılamadığı için bu yetki yüzeyi AÇMAZ.
--   (2) generate_order_number'dan public, anon, authenticated EXECUTE geri alınır. service_role kalır
--       (sunucu tarafı betikler ve elle bakım için).
-- anon'un venthub_orders'a INSERT yolu YOK (tek INSERT politikası authenticated'a, diğeri
-- service_role'a) — misafir akışı kırılmaz.
--
-- Gövde DEĞİŞMİYOR: set_order_number birebir aynı mantık, yalnız fonksiyon çağrısı şemayla
-- nitelendi (DEFINER altında arama yolu sabit olsa da açık yazım tercih edilir).
--
-- GERİ ALMA (elle): `alter function public.set_order_number() security invoker;`
--   `grant execute on function public.generate_order_number() to anon, authenticated;`
--   `grant execute on function public.admin_publish_quote(uuid, timestamptz, text) to anon;`
--   Geri alma sömürülebilir kusuru da geri getirir.

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- 1) Tetik sahip yetkisiyle koşar — sipariş numarası üretimi çağıranın EXECUTE hakkına bağlı kalmaz.
create or replace function public.set_order_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$function$;

-- 2) Sipariş sayacı yalnız tetik (sahip) ve service_role tarafından artırılabilir.
revoke execute on function public.generate_order_number() from public;
revoke execute on function public.generate_order_number() from anon;
revoke execute on function public.generate_order_number() from authenticated;

-- 3) Teklif yayımı yalnız oturum açmış kullanıcıya (yetki kararı gövdede, is_admin_user()).
--    authenticated EXECUTE BİLEREK korunuyor — yönetici ekranı bu yolu kullanacak.
revoke execute on function public.admin_publish_quote(uuid, timestamptz, text) from anon;

commit;

-- Doğrulama (merge sonrası, salt okuma — dört kol; ret kolu kabul kolu olmadan kanıt değildir):
--   has_function_privilege('anon',          'public.generate_order_number()', 'EXECUTE')  → false
--   has_function_privilege('authenticated', 'public.generate_order_number()', 'EXECUTE')  → false
--   (select prosecdef from pg_proc where proname = 'set_order_number')                    → true
--   has_function_privilege('anon',          'public.admin_publish_quote(uuid,timestamptz,text)', 'EXECUTE') → false
--   has_function_privilege('authenticated', 'public.admin_publish_quote(uuid,timestamptz,text)', 'EXECUTE') → true
-- Davranış kolu: sonraki gerçek siparişte order_number dolu (VH-YYYYMMDD-NNNN) gelmeli.
