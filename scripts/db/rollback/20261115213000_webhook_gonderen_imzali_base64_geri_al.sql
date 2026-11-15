-- OPS-293 D2 GERİ ALMA — üç gönderen fonksiyon, 2026-11-15'te canlıdan (pg_get_functiondef) okunan
-- ESKİ düz-sır tanımına döner (`x-webhook-secret` + `x-timestamp`; Edge uçları düz yolu hâlâ kabul eder).
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
-- ⚠ YALNIZ Edge düz yolu (ISTISNA-OPS293-D1) açıkken geçerlidir. FAZ B / D3 düz yolu Edge'den silerse bu betik
-- ÜÇ göndericiyi 401'e düşürür (e-postalar sessizce kaybolur); o zaman bu betik EMEKLİ edilir, geri alma = yeni ileri migration.

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

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazılır; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('order_id', new.id, 'tenant_id', new.tenant_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
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

  -- `x-timestamp` ZORUNLU: uçtaki replay guard "başlık varsa" değil "başlık YOKSA REDDET"
  -- biçiminde yazıldı; göndermeyen çağıran için guard çalışmasaydı kapı fail-OPEN olurdu.
  select net.http_post(
    url := webhook_url,
    body := jsonb_build_object('quote_id', new.id, 'record', to_jsonb(new)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
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
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('event', 'quote_published', 'quote_id', p_quote_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_sir,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  );
  return true;
end;
$function$;

revoke execute on function public.notify_order_paid() from public, anon, authenticated;
revoke execute on function public.notify_quote_request_created() from public, anon, authenticated;
revoke all on function public._quote_published_enqueue(uuid, boolean) from public, anon, authenticated;

commit;
