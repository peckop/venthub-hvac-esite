-- ALT-135 yerel sınama KURULUMU (BOŞ, ATILABİLİR bir veritabanında koş; gölge/prod DEĞİL).
-- Amaç: migration 20261103140000_alt135_definer_yetki_sikilastirma.sql'in SQL'ini ve süper admin kuralını
-- gerçek bir Postgres'te koşturmak. Supabase yok: roller ve auth.uid()/auth.role() taklit edilir.
--
-- Koşu sırası (hepsi psql -v ON_ERROR_STOP=1, boş veritabanı):
--   1) alt135-yerel-kurulum.sql                      (bu dosya: roller, taklitler)
--   2) taban enforce_role_change gövdesi             (supabase/baselines/2026-11-01_public_schema.sql, 1769-1860. satırlar)
--   3) create trigger trg_enforce_role_change before insert or update on public.user_profiles
--        for each row execute function public.enforce_role_change();
--   4) supabase/migrations/20261103140000_alt135_definer_yetki_sikilastirma.sql
--   5) alt135-yerel-sinama.sql                       (PASS/FAIL basar, FAIL'de hata verir)
--
-- ⚠ SINIR: taklit ortamdır. Gerçek auth.uid()/RLS/PostgREST davranışı yerine geçmez; anon/authenticated
-- yetkisi CI'da ya da gölge DB'de (scripts/db/golge-kur.mjs) gerçek tabanla ayrıca ölçülmelidir.

-- Roller küme geneldir (veritabanı silinse de kalır): yoksa oluştur.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
grant usage on schema auth, public to anon, authenticated, service_role;
-- Supabase varsayılanı: yeni doğan her public fonksiyona anon/authenticated/service_role EXECUTE verir.
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as
$$ select nullif(current_setting('request.jwt.claim.role', true), '') $$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;

create table public.user_profiles (
  id uuid primary key,
  role text not null default 'user',
  tenant_id uuid,
  updated_at timestamptz default now()
);
create table public.admin_audit_log (
  actor uuid, table_name text, row_pk text, action text, before jsonb, after jsonb, comment text, tenant_id uuid
);
alter table public.admin_audit_log enable row level security;
grant select, insert, update, delete on public.user_profiles to anon, authenticated, service_role;

-- Migration'ın dokunduğu nesnelerin taklitleri (taban ACL'i: anon+authenticated+service_role hepsi açık).
create function public.denetim_izi_yaz() returns trigger language plpgsql security definer as $$ begin return new; end $$;
create function public.notify_order_paid() returns trigger language plpgsql security definer as $$ begin return new; end $$;
create function public.notify_quote_request_created() returns trigger language plpgsql security definer as $$ begin return new; end $$;
create function public.set_order_number() returns trigger language plpgsql security definer as $$ begin return new; end $$;
-- stamp_order_paid_at: taban gövdesi birebir (SECURITY INVOKER, search_path yok)
create function public.stamp_order_paid_at() returns trigger language plpgsql as $$
begin
  if new.payment_status = 'paid'
     and (old.payment_status is distinct from 'paid')
     and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end;
$$;
create function public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text) returns void language sql security definer as $$ select 1 $$;
create function public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid) returns void language sql security definer as $$ select 1 $$;
create function public.admin_resend_quote_published(p_quote_id uuid) returns void language sql security definer as $$ select 1 $$;
create function public.anonymize_user_personal_data(p_user_id uuid, p_request_id uuid, p_dry_run boolean) returns void language sql security definer as $$ select 1 $$;
-- DOKUNULMAMASI gerekenlerin temsilcisi
create function public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text) returns void language sql security definer as $$ select 1 $$;

create table public.order_number_counters (gun date primary key, son_no int not null default 0);
create table public.quote_number_counters (tenant_id uuid, gun date, son_no int not null default 0, primary key (tenant_id, gun));
create table public.search_reindex_queue (id serial primary key, kapsam text, ref_id uuid);
create table public.url_takma_adlari (id serial primary key, eski text);
create table public._migration_ledger (name text primary key, applied_at timestamptz not null default now());
alter table public.order_number_counters enable row level security;
alter table public.quote_number_counters enable row level security;
alter table public.search_reindex_queue enable row level security;
alter table public.url_takma_adlari enable row level security;
alter table public._migration_ledger enable row level security;
-- taban: dört tabloda yalnız service_role GRANT'lı; ledger'da anon+authenticated da ALL
grant all on public.order_number_counters, public.quote_number_counters, public.search_reindex_queue, public.url_takma_adlari to service_role;
grant all on public._migration_ledger to anon, authenticated, service_role;

-- Tetik-yalnız fonksiyonun ateşlenirken EXECUTE istemediğini sınamak için (authenticated güncelleyecek)
create table public.siparis_taklit (id int primary key, payment_status text, paid_at timestamptz);
grant select, insert, update on public.siparis_taklit to authenticated;
create trigger trg_stamp before update on public.siparis_taklit for each row execute function public.stamp_order_paid_at();
insert into public.siparis_taklit values (1, 'pending', null);

-- Sayacı yazan DEFINER yazıcı (tablo sahibi olarak RLS'i aşmalı)
create function public.sayac_yaz_taklit() returns void language sql security definer as
$$ insert into public.order_number_counters (gun, son_no) values (current_date, 1)
   on conflict (gun) do update set son_no = public.order_number_counters.son_no + 1 $$;
