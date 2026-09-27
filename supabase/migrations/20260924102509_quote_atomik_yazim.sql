-- AUTH (REC-295) — teklif başlığı + kalemleri TEK transaction'da: create_quote_with_items
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (canlıda salt okuma ile ölçüldü, 2026-09-24)
-- ═════════════════════════════════════════════════════════════════════════════
-- Teklif talebi iki ayrı INSERT ile yazılıyor (başlık, sonra kalemler), aralarında transaction yok:
--   · oturumlu: src/lib/services/quoteService.ts → createQuoteRequest (PostgREST, authenticated)
--   · misafir : supabase/functions/quote-request-guest/index.ts (service_role)
-- Kalem INSERT'i düşerse başlık 'requested', KALEMSİZ ve kalıcı kalır (DELETE yolu bilinçli olarak yok) ve
-- AFTER INSERT bildirim tetiği (pg_net, 5000 ms) zaten ateşlenmiştir. Webhook kalemleri ~3 sn yeniden okuyarak
-- yarışı daraltıyor (quote-notification-webhook, 09-23 bulgu 4) ama kapatamıyor. Bugün kalemsiz teklif 0/1.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN BU ÇÖZÜM — SECURITY INVOKER (kaydın DEFINER önerisinden bilinçli sapma, OPS kabul etti)
-- ═════════════════════════════════════════════════════════════════════════════
-- Atomiklik için DEFINER gerekmez: plpgsql gövdesindeki iki INSERT zaten çağıranın tek transaction'ındadır.
-- INVOKER'da oturumlu çağrıda RLS politikaları (quotes_insert_own_requested, quote_items_insert_own_requested)
-- ve kolon GRANT'leri AYNEN yürürlükte kalır — yetki genişlemez. DEFINER'da gövde tek koruma olurdu.
-- Bildirim tetiğine DOKUNULMAZ: pg_net isteği transaction içinde kuyruğa yazılır, işçi yalnız commit edilmiş
-- satırı işler; tek transaction'da kalem düşerse bildirim de düşer (kanıt: PR açıklaması, yerel deney).
--
-- İKİ DAL (dal ayrımı JWT claim'ine değil OTURUM ROLÜNE bağlıdır — RLS atlamanın gerçek belirleyicisi rol):
--   · current_user = 'service_role' (misafir uç): tenant_id girdiden, zorunlu; user_id NULL; kalem 1..50, adet 1..9999
--     (misafir uçtaki sınırların DB aynası).
--   · aksi (authenticated): user_id := auth.uid() (NULL → 42501), tenant_id := jwt_tenant_id(); üst sınır YOK
--     (bugünkü davranış). Fonksiyon ileride bir DEFINER'ın içinden çağrılırsa current_user sahip rol olur ve
--     bu dala düşer; orada auth.uid() NULL olduğu için 42501 verir — fail-closed.
--   · İKİ DALDA DA: p_items dizi ve en az 1 eleman olmalı. (Yoksa kalemsiz teklifi bu fonksiyon kendisi üretirdi.)
--   · status HİÇBİR dalda girdiden okunmaz (varsayılan 'requested'); user_id oturumlu dalda girdiden okunmaz.
--
-- Bu migration TEK BAŞINA davranış değiştirmez: fonksiyonu henüz kimse çağırmıyor. Çağıranlar ayrı PR'larda
-- ve ancak bu fonksiyon prod'da ölçüldükten sonra geçer (plan §3).
--
-- GERİ ALMA (elle): drop function public.create_quote_with_items(jsonb, jsonb);

set lock_timeout = '5s';
set statement_timeout = '30s';

BEGIN;

create or replace function public.create_quote_with_items(p_quote jsonb, p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_servis  boolean := (current_user = 'service_role');
  v_user    uuid;
  v_tenant  uuid;
  v_kalem   int;
  v_quote   uuid;
begin
  if p_quote is null or jsonb_typeof(p_quote) <> 'object' then
    raise exception 'teklif basligi nesne olmali' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'teklif en az bir kalem icermeli' using errcode = '22023';
  end if;
  v_kalem := jsonb_array_length(p_items);

  if v_servis then
    v_tenant := nullif(p_quote ->> 'tenant_id', '')::uuid;
    if v_tenant is null then
      raise exception 'misafir teklifinde tenant_id zorunlu' using errcode = '22023';
    end if;
    v_user := null;
    if v_kalem > 50 then
      raise exception 'kalem sayisi siniri asildi (%/50)', v_kalem using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(p_items) e
       where coalesce(nullif(e ->> 'qty', '')::int, 0) not between 1 and 9999
    ) then
      raise exception 'adet 1..9999 araliginda olmali' using errcode = '22023';
    end if;
  else
    v_user := auth.uid();
    if v_user is null then
      raise exception 'oturum yok: teklif talebi kimlik gerektirir' using errcode = '42501';
    end if;
    v_tenant := public.jwt_tenant_id();
  end if;

  insert into public.venthub_quotes
    (tenant_id, user_id, contact_name, contact_email, contact_phone, source, source_project_id)
  values (
    v_tenant,
    v_user,
    p_quote ->> 'contact_name',
    p_quote ->> 'contact_email',
    p_quote ->> 'contact_phone',
    p_quote ->> 'source',
    nullif(p_quote ->> 'source_project_id', '')::uuid
  )
  returning id into v_quote;

  insert into public.venthub_quote_items (quote_id, tenant_id, product_id, product_name, qty, note)
  select v_quote,
         v_tenant,
         (e ->> 'product_id')::uuid,
         e ->> 'product_name',
         (e ->> 'qty')::int,
         nullif(e ->> 'note', '')
    from jsonb_array_elements(p_items) e;

  return v_quote;
end;
$function$;

revoke all on function public.create_quote_with_items(jsonb, jsonb) from public;
revoke execute on function public.create_quote_with_items(jsonb, jsonb) from anon;
grant execute on function public.create_quote_with_items(jsonb, jsonb) to authenticated, service_role;

comment on function public.create_quote_with_items(jsonb, jsonb) is
  'REC-295: teklif basligi + kalemleri tek transaction. SECURITY INVOKER (RLS yururlukte). Dal: current_user=service_role '
  '(misafir, tenant zorunlu, 1..50 kalem) / authenticated (user_id=auth.uid()). Kalemsiz cagri reddedilir.';

COMMIT;

-- Doğrulama (merge sonrası, salt okuma):
--   select prosecdef, proconfig from pg_proc where proname = 'create_quote_with_items';      → false, {search_path=...}
--   has_function_privilege('anon',          'public.create_quote_with_items(jsonb,jsonb)', 'EXECUTE') → false
--   has_function_privilege('authenticated', 'public.create_quote_with_items(jsonb,jsonb)', 'EXECUTE') → true
--   has_function_privilege('service_role',  'public.create_quote_with_items(jsonb,jsonb)', 'EXECUTE') → true
