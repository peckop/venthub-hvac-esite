-- ══════════════════════════════════════════════════════════════════════════════
-- GÖLGE VERİTABANI ÖNSÖZÜ — şema replay'inin ilk adımı (REC-336)
--
-- NİÇİN VAR: `baselines/*_public_schema.sql` dökümleri Supabase'in kendi iskelesini
-- HAZIR VARSAYAR — `auth` şeması, `extensions` şeması, `anon`/`authenticated`/
-- `service_role`/`supabase_admin` rolleri, `auth.users` tablosu. Çıplak bir
-- PostgreSQL'de bunların hiçbiri yoktur ve döküm onlarca hatayla akar. Bu dosya o
-- iskeleyi kurar.
--
-- KULLANIM: gölge veritabanına DAİMA İLK bu uygulanır, sonra tam şema dökümü, sonra
-- döküm tarihinden SONRAKİ migration'lar.
--
-- ⚠SINIRI (adıyla yazılı): `auth.uid()` burada NULL döner. Yani bu gölge **ŞEMA
-- KARŞILAŞTIRMASI** içindir, **YETKİ DAVRANIŞI** ölçümü için DEĞİL. Politikaların
-- gerçekte ne yaptığını ölçmek ayrı bir iştir ve bu dosyayla YAPILAMAZ.
--
-- ⚠NE OLMADIĞI: burada tablo/kısıt/indeks YARATILMAZ. Bir gün bu dosyaya
-- `create table` girerse, gölge artık dökümü değil ÖNSÖZÜ ölçüyor demektir ve
-- karşılaştırma yalan söyler. Önsöz yalnız İSKELEDİR.
--
-- ⚠ÖN-TANIM YOK (2026-09-15'te ölçüldü ve KALDIRILDI): ilk yazımda `jwt_tenant_id`
-- gibi fonksiyonları ön-tanımlıyordum, çünkü 2026-08-13 anlık görüntüsü onları
-- kullandıktan SONRA tanımlıyor. Ama o dosya bir şema dökümü değil (kendi başlığı
-- "pg_dump degildir" diyor). GERÇEK dökümde sıra doğrudur ve ön-tanım, dökümün
-- `CREATE FUNCTION` ifadesini "already exists" ile düşürür. Yani ön-tanım iyileştirme
-- değil ZARARDI.
-- ══════════════════════════════════════════════════════════════════════════════

create schema if not exists auth;
create schema if not exists extensions;
create schema if not exists storage;
create schema if not exists graphql_public;
create schema if not exists vault;

-- Supabase rolleri: dökümdeki GRANT / OWNER / policy ifadeleri bunları arar.
-- `supabase_admin` 2026-09-15 ölçümünde eksikti ve tek başına 12 hata üretiyordu.
do $$
declare r text;
begin
  foreach r in array array[
    'anon', 'authenticated', 'service_role', 'authenticator',
    'supabase_auth_admin', 'supabase_admin', 'supabase_storage_admin',
    'dashboard_user', 'pgbouncer'
  ]
  loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I nologin', r);
    end if;
  end loop;
  -- service_role canlıda RLS'i atlar; gölgede de aynı olsun ki politika sayımı
  -- karşılaştırılabilir kalsın.
  execute 'alter role service_role bypassrls';
end $$;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- `auth.users`: dökümdeki yabancı anahtarlar buna bağlanır.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_app_meta_data jsonb default '{}'::jsonb,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- `vault.secrets`: bir migration buna yazıyor (webhook sırrı kasaya taşıma).
-- Gerçek Vault'un şifreleme davranışını TAKLİT ETMEZ; yalnız şeklini sağlar.
create table if not exists vault.secrets (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  secret text,
  created_at timestamptz default now()
);

-- `net` şeması (pg_net): beş migration `net.http_post` çağırıyor (Edge Function
-- tetikleme). Çıplak PostgreSQL'de pg_net yok; imzayı sağlıyoruz. ⚠HİÇBİR İSTEK
-- ATMAZ — gölge ağa çıkmaz, yalnız şema akışını sürdürür.
create schema if not exists net;
create or replace function net.http_post(
  url text, body jsonb default '{}'::jsonb, params jsonb default '{}'::jsonb,
  headers jsonb default '{}'::jsonb, timeout_milliseconds integer default 5000
) returns bigint language sql as $$ select 0::bigint $$;
create or replace function net.http_get(
  url text, params jsonb default '{}'::jsonb, headers jsonb default '{}'::jsonb,
  timeout_milliseconds integer default 5000
) returns bigint language sql as $$ select 0::bigint $$;

-- `cron` şeması (pg_cron): bir migration `cron.schedule` çağırıp `cron.job`'a bakıyor.
-- ⚠UZANTININ KENDİSİ SAĞLANAMAZ: `create extension pg_cron` çıplak kümede
-- "not available" verir. O yüzden o migration ORTAM BAĞIMLI ilan edildi
-- (docs/sema-replay-veri-korumali-migrationlar.json). Buradaki saplamalar, dosyanın
-- `public` şemasına ait kısmının akmasını sağlar; ZAMANLAMA kaybı bilinçlidir ve
-- karşılaştırma `public` şeması üzerinden yapıldığı için sonucu değiştirmez.
create schema if not exists cron;
create table if not exists cron.job (
  jobid bigserial primary key,
  jobname text,
  schedule text,
  command text
);
create or replace function cron.schedule(job_name text, schedule text, command text)
returns bigint language sql as $$
  insert into cron.job (jobname, schedule, command) values (job_name, schedule, command)
  returning jobid
$$;

-- auth yardımcıları: GERÇEĞİ TAKLİT ETMEZ, imzayı sağlar (yukarıdaki SINIRI notu).
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
create or replace function auth.role() returns text language sql stable as $$ select null::text $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
