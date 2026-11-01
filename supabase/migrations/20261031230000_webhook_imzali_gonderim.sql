-- ALT-76 PR 2 — handle_supabase_webhook() artık HMAC-SHA256 İMZALI gönderir (CLAUDE.md kural 11).
-- Cetvel: docs/standards/rendering-cache-standard.md; kod tarafı: PR 1 (src/lib/webhook/imza.ts).
--
-- DEĞİŞEN: tetik, sırrı düz başlıkla (`x-webhook-secret`) GÖNDERMEZ. Yalnız iki başlık gider:
--   x-webhook-timestamp : saniye cinsinden Unix zamanı
--   x-webhook-signature : hex(HMAC-SHA256(anahtar = Vault `supabase_webhook_secret`,
--                                          mesaj  = `<zaman>.<ham gövde>`))
-- Ham gövde = `payload::text`. pg_net gövdeyi `convert_to(body::text, 'UTF8')` ile kuyruğa yazar
-- (net.http_post gövdesi 2026-10-31'de canlıdan okundu), yani imzalanan metin ile ağa giden
-- baytlar AYNI jsonb metnidir. SQL ve Node HMAC çıktısı aynı metin üzerinde birebir eşleşti.
--
-- DEĞİŞMEYEN: sır (Vault, rotasyon yok), adres, gövde, zaman aşımı, 12 tetiğin tanımı.
-- Sunucu tarafı (PR 1, canlı) imza başlığını görünce yalnız imzaya bakar; geçersiz/bayat/tekrar → 401.
--
-- ÖLÇÜLEN ÖN KOŞULLAR (canlı veritabanı, 2026-10-31): pg_net 0.19.5, pgcrypto 1.3, supabase_vault 0.3.1,
-- `extensions.hmac` var ve erişilebilir, Vault'ta `supabase_webhook_secret` var, fonksiyon 12 tetikte kullanılıyor.
--
-- GERİ ALMA: scripts/db/rollback/20261031230000_webhook_imzali_gonderim_geri_al.sql (otomatik uygulanmaz).
-- Sunucu imzasız isteği (eski düz secret yolu) hâlâ kabul ettiği için geri alma güvenlidir.
--
-- HATA YOLU (kural 14): Vault'ta sır yoksa tetik WARNING verip atlar (veri yazımı sürer; T031-VH ile aynı).
-- İmza üretimi ve net.http_post için EXCEPTION bloğu YOKTUR, bilerek: blok her satırda alt işlem (subtransaction)
-- açar; tek işlemde yüzlerce satır yazan toplu işlerde (1044 fiyat satırı örneği) bu snapshot maliyeti getirir.
-- Girdiler doğrulandı (metin anahtar + metin mesaj, extensions.hmac erişilebilir); net.http_post eski sürümde de
-- korumasızdı. Bu çağrılar beklenmedik biçimde patlarsa AFTER tetik yazımı geri alır; bu eski davranışla aynıdır.
-- Düz secret'e GERİ DÜŞÜLMEZ (imzalı yolun amacı o başlığın hiç gitmemesi).
--
-- BİLİNEN SINIRLAR (security-reviewer, PR #2150):
--   1) Zaman damgası TETİK anında alınır, pg_net isteği COMMIT sonrası gönderir: 5 dakikadan uzun tek işlem
--      ya da birikmiş kuyruk olayları sunucuya 'bayat' (401) varır; ilgili sayfalar ISR yedeğine (1 saat) kalır.
--      İzleme: net._http_response.status_code = 401.
--   2) Aynı saniyede gövdesi birebir aynı iki olay aynı imzayı üretir; ikincisi aynı örnekte tekrar sayılır.

begin;

-- Tek bir CREATE OR REPLACE FUNCTION: fonksiyon kilidi kısa tutulur, bekleyen yazımı uzun süre tıkamaz.
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

commit;
