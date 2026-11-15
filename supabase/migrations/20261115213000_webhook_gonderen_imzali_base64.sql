-- OPS-293 D2 — Üç Postgres gönderen fonksiyonu Edge webhook uçlarının İMZALI sözleşmesiyle istek atar.
-- Cetvel: docs/standards/edge-function-security-standard.md §3.5, docs/standards/migration-safety-standard.md,
-- CLAUDE.md kural 11 (HMAC-SHA256 + replay guard). Sözleşme kaynağı: supabase/functions/_shared/sabit_zaman.ts
-- (webhookImzaMetni / webhookImzaGecerli).
--
-- DEĞİŞEN: public.notify_order_paid(), public.notify_quote_request_created() ve
-- public._quote_published_enqueue(uuid, boolean) artık `x-webhook-secret` (düz sır) GÖNDERMEZ. Gider:
--   x-signature : base64(HMAC-SHA256(anahtar = Vault sırrı, mesaj = `<x-timestamp>.<x-event-id>.<ham gövde>`))
--   x-timestamp : epoch milisaniye (noktasız)
--   x-event-id  : gen_random_uuid()::text (noktasız, ASCII)
-- BASE64 (hex DEĞİL): Edge `hmacSha256Base64` base64 üretir. 20261031230000 (Next rota sözleşmesi) hex + zamansızdır;
-- bu dosya onu KOPYALAMAZ.
-- Ham gövde = `v_govde::text`. pg_net `net.http_post` gövdeyi `convert_to(body::text, 'UTF8')` ile kuyruğa yazar
-- (canlıdan okundu, 2026-11-15; net.http_post tanımı), yani imzalanan metin ile ağa giden baytlar AYNI jsonb metnidir.
-- Gövde tek değişkende kurulur (v_govde) ve hem imzaya hem http_post'a aynı değişken girer.
--
-- DEĞİŞMEYEN: dönüş tipleri, SECURITY DEFINER, search_path, tetik bağları, Vault okuma, uyarı/exception davranışı,
-- gövde alanları (order_id+tenant_id; quote_id+record; event+quote_id), zaman aşımı, REVOKE'ler (aşağıda yeniden yazıldı).
-- Edge uçları düz yolu hâlâ kabul eder (ISTISNA-OPS293-D1), bu yüzden geri alma güvenlidir.
--
-- GERİ ALMA: scripts/db/rollback/20261115213000_webhook_gonderen_imzali_base64_geri_al.sql (otomatik uygulanmaz;
-- üç fonksiyonu 2026-11-15'te canlıdan okunan eski düz-sır tanımına döndürür).
--
-- HATA YOLU: Vault kaydı eksikse eskisi gibi WARNING (tetik) / RAISE (zorunlu enqueue) ve atlama; imza üretimi ve
-- net.http_post için EXCEPTION bloğu YOKTUR, bilerek (eski davranışla aynı; satır başına alt işlem maliyeti yok).

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.notify_order_paid()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions', 'vault'
as $function$
declare
  webhook_url text;
  webhook_secret text;
  req_id bigint;
  v_govde jsonb;
  v_olay text;
  v_zaman text;
  v_imza text;
begin
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ: fonksiyon
  -- gövdesi `pg_proc`'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'order_paid_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_order_paid] Vault kaydi eksik (order_paid_webhook_secret/url) — bildirim ATLANDI, siparis %s odeme kaydi korundu', new.id;
    return new;
  end if;

  -- Gövde TEK değişkende: imzalanan metin ile gönderilen bayt aynı olmak zorunda.
  v_govde := jsonb_build_object('order_id', new.id, 'tenant_id', new.tenant_id);
  v_olay := gen_random_uuid()::text;
  v_zaman := (extract(epoch from now()) * 1000)::bigint::text;
  -- Mesaj: `<zaman>.<olay>.<gövde>`; Edge webhookImzaMetni ile aynı. Çıktı base64.
  v_imza := encode(
    extensions.hmac(v_zaman || '.' || v_olay || '.' || v_govde::text, webhook_secret, 'sha256'),
    'base64'
  );

  select net.http_post(
    url := webhook_url,
    body := v_govde,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-signature', v_imza,
      'x-timestamp', v_zaman,
      'x-event-id', v_olay
    ),
    timeout_milliseconds := 5000
  ) into req_id;

  return new;
end;
$function$;

create or replace function public.notify_quote_request_created()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions', 'vault'
as $function$
declare
  webhook_url text;
  webhook_secret text;
  req_id bigint;
  v_govde jsonb;
  v_olay text;
  v_zaman text;
  v_imza text;
begin
  -- Vault'tan okunur (SECURITY DEFINER erişimi var). Düz metin sır KOYULMAZ:
  -- fonksiyon gövdesi pg_proc'ta okunabilir olduğu için sır oraya yazılamaz (#584 dersi).
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'quote_webhook_secret'
  limit 1;

  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'quote_webhook_url'
  limit 1;

  if webhook_secret is null or webhook_secret = '' or webhook_url is null or webhook_url = '' then
    raise warning '[notify_quote_request_created] Vault kaydi eksik (quote_webhook_secret/url) — bildirim ATLANDI, teklif kaydi %s korundu', new.id;
    return new;
  end if;

  v_govde := jsonb_build_object('quote_id', new.id, 'record', to_jsonb(new));
  v_olay := gen_random_uuid()::text;
  v_zaman := (extract(epoch from now()) * 1000)::bigint::text;
  v_imza := encode(
    extensions.hmac(v_zaman || '.' || v_olay || '.' || v_govde::text, webhook_secret, 'sha256'),
    'base64'
  );

  select net.http_post(
    url := webhook_url,
    body := v_govde,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-signature', v_imza,
      'x-timestamp', v_zaman,
      'x-event-id', v_olay
    ),
    timeout_milliseconds := 5000
  ) into req_id;

  return new;
end;
$function$;

create or replace function public._quote_published_enqueue(p_quote_id uuid, p_zorunlu boolean)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
declare
  v_bayrak text;
  v_url    text;
  v_sir    text;
  v_govde  jsonb;
  v_olay   text;
  v_zaman  text;
  v_imza   text;
begin
  select decrypted_secret into v_bayrak from vault.decrypted_secrets
   where name = 'quote_published_webhook_enabled' limit 1;
  if v_bayrak is distinct from 'on' then
    if p_zorunlu then
      raise exception 'yayim e-postasi kapali (quote_published_webhook_enabled != on) — gonderilmedi'
        using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] bayrak kapali — yayim bildirimi ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  select decrypted_secret into v_sir from vault.decrypted_secrets where name = 'quote_webhook_secret' limit 1;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'quote_webhook_url' limit 1;
  if coalesce(v_sir, '') = '' or coalesce(v_url, '') = '' then
    if p_zorunlu then
      raise exception 'Vault kaydi eksik (quote_webhook_secret/url) — gonderilmedi' using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] Vault kaydi eksik — bildirim ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  -- Gövde YALNIZ olay + kimlik: kişisel veri taşımaz, Edge satırı kendisi okur.
  -- search_path'te extensions yok: hmac şema-nitelikli çağrılır.
  v_govde := jsonb_build_object('event', 'quote_published', 'quote_id', p_quote_id);
  v_olay := gen_random_uuid()::text;
  v_zaman := (extract(epoch from now()) * 1000)::bigint::text;
  v_imza := encode(
    extensions.hmac(v_zaman || '.' || v_olay || '.' || v_govde::text, v_sir, 'sha256'),
    'base64'
  );

  perform net.http_post(
    url := v_url,
    body := v_govde,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-signature', v_imza,
      'x-timestamp', v_zaman,
      'x-event-id', v_olay
    ),
    timeout_milliseconds := 5000
  );
  return true;
end;
$function$;

-- Yetkiler: create or replace korur; yine de AYNEN yeniden yazılır (INV-AUTH-DEFINER-ANON-1).
revoke execute on function public.notify_order_paid() from public, anon, authenticated;
revoke execute on function public.notify_quote_request_created() from public, anon, authenticated;
revoke all on function public._quote_published_enqueue(uuid, boolean) from public, anon, authenticated;

commit;
