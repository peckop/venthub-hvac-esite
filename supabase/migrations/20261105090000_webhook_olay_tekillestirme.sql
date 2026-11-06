-- ALT-76 PR 3 — Supabase → Next önbellek webhook'una KALICI olay tekilleştirmesi (CLAUDE.md kural 11).
-- Cetvel: docs/standards/rendering-cache-standard.md; kod tarafı: src/lib/webhook/olayTekil.ts + route.ts.
--
-- ÖNCEKİ DURUM (canlıda ölçüldü 2026-11-05): handle_supabase_webhook() imzalı gönderiyor
-- (20261031230000), düz `x-webhook-secret` başlığı gitmiyor. Sunucudaki tekrar koruması yalnız
-- bellek içi bir küme: sunucusuz örnekler arasında paylaşılmaz, 5 dakikalık pencere içinde başka
-- örneğe düşen tekrar yakalanmaz (karne 2026-11, P8).
--
-- DEĞİŞEN (üç parça, tek işlem):
--   1) public.webhook_olaylari — işlenmiş olay kimlikleri (birincil anahtar = olay kimliği).
--      RLS açık, politika YOK, anon/authenticated'a tablo yetkisi YOK: yalnız aşağıdaki DEFINER
--      fonksiyonu yazar. Satırlar 1 saat sonra aynı fonksiyon tarafından silinir (pencere 5 dk).
--   2) public.webhook_olay_tuket(p_zaman, p_govde, p_imza) — rota bu RPC'yi anon istemciyle çağırır.
--      Fonksiyon imzayı Vault sırrıyla KENDİSİ yeniden doğrular ve zaman penceresini KENDİSİ
--      ölçer; ancak ikisi de geçerse gövdedeki `event_id`'yi tabloya yazar. Bu yüzden anon EXECUTE
--      tabloyu doldurmaya ya da olay kimliği "kapmaya" yaramaz: geçerli imza olmadan satır yazılmaz.
--      Dönüş: 'yeni' | 'tekrar' | 'gecersiz' | 'bayat' | 'yapilandirma'.
--   3) handle_supabase_webhook() — gövdeye `event_id` (gen_random_uuid()) ekler. Alan gövdenin
--      içinde olduğu için imzanın kapsamındadır; başlık eklenmez. Fonksiyonun geri kalanı
--      20261031230000 ile birebir aynıdır (search_path, EXCEPTION bloğu yok, Vault yoksa WARNING).
--
-- KİRACI (kural 12): tablo kiracı verisi taşımaz (yalnız rastgele olay kimliği + zaman); tetik
-- tüm kiracıların önbellek olayını aynı uca gönderir, tekilleştirme kimliği küresel benzersizdir.
--
-- SIR ROTASYONU: tetik ve bu fonksiyon AYNI Vault değerini okur; Vercel tarafındaki
-- SUPABASE_WEBHOOK_SECRET_NEXT penceresi bu doğrulamayı etkilemez (imzayı yalnız tetik üretir).
--
-- GERİ ALMA: scripts/db/rollback/20261105090000_webhook_olay_tekillestirme_geri_al.sql
-- (otomatik uygulanmaz; önce rota geri alınmalıdır — yeni rota event_id'siz gövdeyi reddeder).
--
-- DOĞRULAMA (birleştirme sonrası, salt okuma):
--   select has_function_privilege('anon', 'public.webhook_olay_tuket(text,text,text)', 'execute');  -- true
--   select has_table_privilege('anon', 'public.webhook_olaylari', 'insert');                       -- false
--   select status_code, count(*) from net._http_response where created > now() - interval '1 hour' group by 1;

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

-- ── 1) Olay defteri ─────────────────────────────────────────────────────────────────
create table if not exists public.webhook_olaylari (
  olay_kimligi uuid primary key,
  alindi timestamptz not null default now()
);
create index if not exists webhook_olaylari_alindi_idx on public.webhook_olaylari (alindi);
alter table public.webhook_olaylari enable row level security;
revoke all on table public.webhook_olaylari from public, anon, authenticated;
comment on table public.webhook_olaylari is
  'ALT-76: /api/webhook/supabase tekrar koruması. Yalnız webhook_olay_tuket() yazar; 1 saatten eski satırlar aynı fonksiyonda silinir.';

-- ── 2) Tüketme fonksiyonu ───────────────────────────────────────────────────────────
create or replace function public.webhook_olay_tuket(p_zaman text, p_govde text, p_imza text)
returns text
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'vault'
as $function$
DECLARE
  v_secret text;
  v_beklenen text;
  v_olay text;
  v_eklenen integer;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_webhook_secret'
  LIMIT 1;
  IF v_secret IS NULL OR v_secret = '' THEN
    RETURN 'yapilandirma';
  END IF;

  IF p_zaman IS NULL OR p_zaman !~ '^[0-9]{9,12}$' THEN
    RETURN 'bayat';
  END IF;
  IF abs(extract(epoch FROM clock_timestamp()) - p_zaman::bigint) > 300 THEN
    RETURN 'bayat';
  END IF;

  IF p_govde IS NULL OR p_imza IS NULL THEN
    RETURN 'gecersiz';
  END IF;
  v_beklenen := encode(extensions.hmac(p_zaman || '.' || p_govde, v_secret, 'sha256'), 'hex');
  IF lower(p_imza) <> v_beklenen THEN
    RETURN 'gecersiz';
  END IF;

  -- Gövde imzalı, yani tetiğin ürettiği jsonb metnidir; yine de biçim doğrulanır.
  BEGIN
    v_olay := p_govde::jsonb ->> 'event_id';
  EXCEPTION WHEN others THEN
    RETURN 'gecersiz';
  END;
  IF v_olay IS NULL OR v_olay !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN 'gecersiz';
  END IF;

  DELETE FROM public.webhook_olaylari WHERE alindi < now() - interval '1 hour';

  INSERT INTO public.webhook_olaylari (olay_kimligi) VALUES (v_olay::uuid)
  ON CONFLICT (olay_kimligi) DO NOTHING;
  GET DIAGNOSTICS v_eklenen = ROW_COUNT;
  IF v_eklenen = 1 THEN
    RETURN 'yeni';
  END IF;
  RETURN 'tekrar';
END;
$function$;

-- Supabase varsayılan yetkileri yeni fonksiyona anon/authenticated EXECUTE verir; açıkça daraltılır.
revoke all on function public.webhook_olay_tuket(text, text, text) from public, anon, authenticated;
grant execute on function public.webhook_olay_tuket(text, text, text) to anon, service_role;

-- ── 3) Gönderen tetik: gövdeye event_id ─────────────────────────────────────────────
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
