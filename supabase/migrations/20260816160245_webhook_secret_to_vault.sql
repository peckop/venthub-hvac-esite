-- T031-VH — Supabase webhook secret'i düz metinden Vault'a taşı
-- Kanıt: docs/audits/secret-exposure-audit-2026-08-15.md bulgu #4 (🟡 AÇIK)
--
-- ARIZA (2026-08-16'da canlı DB'den ölçüldü):
--   `public.handle_supabase_webhook()` gövdesinde
--       webhook_secret text := '<düz metin>';
--   satırı duruyor. Bu fonksiyon tanımı `supabase/baselines/…_public_schema.sql`
--   içinde de vardı ve **repo 2026-08-15'ten beri PUBLIC** — yani sır, deponun
--   geçmişinden okunabilir durumda. Baseline dosyasındaki kopya redakte edildi
--   (1443c33e) ama GEÇMİŞ silinemez; sırrı bilen biri Vercel'deki
--   `/api/webhook/supabase` ucuna sahte çağrı atıp istediği sayfayı/etiketi
--   sınırsız kez yeniden ürettirebilir (origin yükü + her çağrıda DB sorgusu).
--
-- BU MIGRATION NE YAPAR / NE YAPMAZ:
--   YAPAR : sırrı fonksiyon gövdesinden ÇIKARIR, Vault'a taşır, fonksiyon oradan okur.
--   YAPMAZ: **ROTASYON DEĞİLDİR.** Değer aynı kalır, davranış birebir aynıdır, bu
--           yüzden kesinti penceresi YOKTUR. Gerçek rotasyon (yeni değer üretip
--           Vault + Vercel'e koymak) ayrı ve Recep'e ait bir adımdır — sırası
--           `docs/audits/secret-exposure-audit-2026-08-15.md` §4.1'de yazılı.
--
-- ⚠️ SIR BU DOSYADA YAZILI DEĞİLDİR — yazılsaydı sorunu çözmek yerine YENİDEN
-- ÜRETİRDİK (dosya da public repoya gider). Değer, veritabanının kendi içinde,
-- mevcut fonksiyon tanımından okunup Vault'a aktarılır. Migration dosyası sırrı
-- hiçbir zaman görmez.

begin;

-- ============================================================================
-- 1) Mevcut düz-metin sırrı fonksiyon tanımından oku → Vault'a taşı
-- ============================================================================
-- FAIL-CLOSED: sır çıkarılamazsa migration DURUR. Sessizce devam etseydi 2. bölüm
-- fonksiyonu Vault okuyacak hâle getirir, Vault boş olur ve **revalidation sessizce
-- ölürdü** — vitrin bayatlar, hiçbir alarm çalmaz (bu deponun tekrar eden arıza sınıfı).
do $$
declare
  v_secret text;
  v_id uuid;
begin
  select (regexp_match(
            pg_get_functiondef(p.oid),
            'webhook_secret\s+text\s*:=\s*''([^'']+)'''
         ))[1]
    into v_secret
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'handle_supabase_webhook'
    and p.prokind = 'f';

  -- Zaten taşınmışsa (migration ikinci kez uygulanıyorsa) fonksiyonda literal
  -- kalmamıştır; Vault'ta kayıt varsa bu normaldir ve atlanır.
  if v_secret is null then
    if exists (select 1 from vault.secrets where name = 'supabase_webhook_secret') then
      raise notice 'webhook sirri zaten Vault''ta, tasima atlandi (idempotent)';
      return;
    end if;
    raise exception
      'DURDU: handle_supabase_webhook govdesinden sir cikarilamadi ve Vault''ta da yok. '
      'Fonksiyon elle degistirilmis olabilir. Once sirri Vault''a koyup tekrar deneyin; '
      'aksi halde bu migration revalidation''i sessizce durdururdu.';
  end if;

  if length(v_secret) < 8 then
    raise exception 'DURDU: cikarilan sir beklenmedik sekilde kisa (uzunluk %)', length(v_secret);
  end if;

  select id into v_id from vault.secrets where name = 'supabase_webhook_secret';
  if v_id is null then
    perform vault.create_secret(
      v_secret,
      'supabase_webhook_secret',
      'handle_supabase_webhook() tetigi bu degeri x-webhook-secret basligiyla '
      '/api/webhook/supabase ucuna gonderir. Vercel tarafindaki esi: '
      'SUPABASE_WEBHOOK_SECRET (rotasyon penceresinde ayrica SUPABASE_WEBHOOK_SECRET_NEXT). '
      'T031-VH.'
    );
  else
    perform vault.update_secret(v_id, v_secret);
  end if;
end $$;

-- ============================================================================
-- 2) Fonksiyonu Vault'tan okuyacak şekilde yeniden yaz
-- ============================================================================
-- Tek fark sırrın KAYNAĞI. Payload, başlıklar, zaman aşımı ve dönüş değeri birebir
-- aynıdır; bu fonksiyonu kullanan 6 tetiğin davranışı değişmez.
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
    BEGIN
      -- Sır artık gövdede DEĞİL (T031-VH): düz metin, public repo geçmişinden
      -- okunabiliyordu. Vault'tan okunur; SECURITY DEFINER olduğu için erişim var.
      SELECT decrypted_secret INTO webhook_secret
      FROM vault.decrypted_secrets
      WHERE name = 'supabase_webhook_secret'
      LIMIT 1;

      -- Sır yoksa webhook ATLANIR ama tetiğin asıl işi (veri yazımı) ENGELLENMEZ.
      -- Burada exception atmak, ürün güncellemesinin tamamını düşürürdü: önbellek
      -- tazeleme kaybı, veri kaybından iyidir. Sessiz kalmaması için WARNING
      -- Postgres günlüğüne düşer. (Bu dala düşmek için birinin Vault kaydını
      -- silmesi gerekir — migration taşımayı fail-closed yapar.)
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

      SELECT net.http_post(
        url := webhook_url,
        body := payload,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-webhook-secret', webhook_secret
        ),
        timeout_milliseconds := 5000
      ) INTO req_id;

      RETURN NEW;
    END;
    $function$;

commit;
