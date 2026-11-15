-- ALT-190 (OPS-280) — handle_supabase_webhook() hedef adresi: Vercel alt adresi → kendi sunucumuzun kanonik adresi.
--
-- NEDEN: Site 16 Kasım 2026'da Vercel'den DigitalOcean + Coolify'a taşınıyor. Tetik fonksiyonu webhook adresini
-- SERT YAZILI taşıyordu (`https://venthub-hvac-esite.vercel.app/...`). DNS çevrilince site yeni sunucuda, ama fiyat/ürün
-- değişikliği olayları hâlâ Vercel'e giderdi: yeni sunucudaki sayfalar ISR ömrü (24 saat) boyunca BAYAT kalırdı
-- (kural: statik vitrin sayfasında görünen her tablonun tetiği + webhook dalı çalışmalı, rendering-cache-standard.md).
-- Canlıda ölçüldü (2026-11-15): fonksiyon 9 tabloda tetikli (brands, categories, inventory_movements, price_lists,
-- product_families, product_images, product_prices, products, site_settings); vercel.app tek sert yazılı yer.
--
-- NE DEĞİŞİR: YALNIZ `webhook_url` sabiti. İmza (HMAC-SHA256, zaman damgası), event_id, Vault sırrı, search_path, güvenlik
-- tanımı, yetkiler (CREATE OR REPLACE mevcutları korur) AYNIDIR. Tablo/tetik/veri değişmez.
--
-- ÖN KOŞUL: Coolify uygulamasındaki SUPABASE_WEBHOOK_SECRET, Vault'taki `supabase_webhook_secret` ile aynı olmalı
-- (Vercel'deki değerden alındı; Vercel bugün aynı sırla doğruluyor).
--
-- GERİ ALMA (Vercel'e dönüş): aşağıdaki fonksiyonu `webhook_url`i
-- 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase' yaparak yeniden uygulayan yeni bir migration.
--
-- ⚠ Kural 13: migration'lı PR yalnız Recep onayıyla birleştirilir (master'a girince prod'a otomatik uygulanır).

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
      webhook_url text := 'https://venthub.com.tr/api/webhook/supabase';
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

      -- event_id: alıcının kalıcı tekrar koruması (ALT-76 PR 3). Gövdede olduğu için imzalıdır.
      payload := jsonb_build_object(
        'event_id', gen_random_uuid(),
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
