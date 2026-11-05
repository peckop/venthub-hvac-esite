-- ALT-76 PR 3 GERİ ALMA — handle_supabase_webhook() event_id'siz imzalı gövdeye döner (20261031230000 ile
-- birebir), webhook_olay_tuket() ve webhook_olaylari kaldırılır.
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- SIRA ÖNEMLİ: PR 3 rotası event_id'siz gövdeyi 400 ile reddeder ve RPC yoksa 503 döner. Önce rota
-- geri alınır (Vercel'de önceki dağıtıma dönülür), SONRA bu dosya koşulur; aksi hâlde önbellek
-- tazeleme durur ve sayfalar ISR yedeğine (1 saat) kalır.

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.handle_supabase_webhook()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'net', 'vault'
as $function$
    DECLARE
      payload jsonb;
      webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
      webhook_secret text;
      req_id bigint;
      zaman_sn text;
      imza text;
    BEGIN
      SELECT decrypted_secret INTO webhook_secret
      FROM vault.decrypted_secrets
      WHERE name = 'supabase_webhook_secret'
      LIMIT 1;

      -- Sır yoksa webhook ATLANIR ama tetiğin asıl işi (veri yazımı) ENGELLENMEZ (T031-VH ile aynı).
      IF webhook_secret IS NULL OR webhook_secret = '' THEN
        RAISE WARNING '[handle_supabase_webhook] Vault sirri "supabase_webhook_secret" YOK — webhook atlandi, sayfa yenileme yapilmadi (tablo: %)', TG_TABLE_NAME;
        RETURN NEW;
      END IF;

      payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
      );

      zaman_sn := floor(extract(epoch FROM clock_timestamp()))::bigint::text;
      -- Mesaj: `<zaman>.<ham gövde>`; ham gövde pg_net'in ağa yazdığı metinle aynıdır (payload::text).
      imza := encode(
        extensions.hmac(zaman_sn || '.' || payload::text, webhook_secret, 'sha256'),
        'hex'
      );

      SELECT net.http_post(
        url := webhook_url,
        body := payload,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-webhook-timestamp', zaman_sn,
          'x-webhook-signature', imza
        ),
        timeout_milliseconds := 5000
      ) INTO req_id;

      RETURN NEW;
    END;
    $function$;

drop function if exists public.webhook_olay_tuket(text, text, text);
drop table if exists public.webhook_olaylari;

commit;
