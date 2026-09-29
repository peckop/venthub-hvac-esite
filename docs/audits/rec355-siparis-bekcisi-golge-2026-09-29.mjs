// Yeniden koşum: geçici bir klasörde `npm i @electric-sql/pglite`, sonra `node <bu dosya> <migration yolu>`. Depoya bağımlılık EKLENMEZ.
// REC-355 VULN-002 (#1454) — gölge kanıtı (bellek-içi PGlite). Ölçülen şey: müşterinin sipariş / kalem / iade
// verisine yazması (RLS + bekçi tetikleri). Politikalar, is_admin_claim/is_admin_user/jwt_tenant_id ve iki
// hassas tetik fonksiyonu (sync_payment_status_with_status, stamp_order_paid_at) CANLIDAN üretilmiştir
// (pg_policy / pg_get_functiondef, 2026-09-29), elle yazılmamıştır.
// SINIR (sınanmayan): gerçek Supabase JWT doğrulaması (burada claim'ler elle kurulur), PostgREST katmanı,
// canlıdaki diğer sipariş tetikleri (set_order_number, notify_order_paid → burada yalnız kukla), pg_net e-posta.
import fs from 'node:fs'

import { PGlite } from '@electric-sql/pglite'

// no-console kuralı: CLI kanıt betiği sonucu standart çıktıya yazar (kural gevşetilmedi, lint kapatılmadı)
const yaz = (s) => process.stdout.write(`${s}\n`)

const MIGRATION = process.argv[2]
const migrationSql = fs.readFileSync(MIGRATION, 'utf8')

const T = 'd3b07384-d113-495f-a558-8c38634e0000'
const A = '00000000-0000-0000-0000-0000000000a1'
const B = '00000000-0000-0000-0000-0000000000b2'
const ADM = '00000000-0000-0000-0000-0000000000ad'
const URUN = '00000000-0000-0000-0000-0000000000c3'

const KIMLIK = {
  A: { role: 'authenticated', sub: A, user_role: 'user', app_metadata: { tenant_id: T, user_role: 'user' } },
  B: { role: 'authenticated', sub: B, user_role: 'user', app_metadata: { tenant_id: T, user_role: 'user' } },
  // Müşterinin yazabildiği user_metadata'ya rol koyması: is_admin_claim BUNA BAKMAZ (kural 12)
  SAHTE: { role: 'authenticated', sub: A, app_metadata: { tenant_id: T, user_role: 'user' }, user_metadata: { user_role: 'admin' } },
  ADMIN: { role: 'authenticated', sub: ADM, user_role: 'admin', app_metadata: { tenant_id: T, user_role: 'admin' } },
  SERVIS: { role: 'service_role' },
  ANON: { role: 'anon' },
}
const ROL = { A: 'authenticated', B: 'authenticated', SAHTE: 'authenticated', ADMIN: 'authenticated', SERVIS: 'service_role', ANON: 'anon' }

const CANLI_SQL = `
  create role anon nologin; create role authenticated nologin;
  create role service_role nologin bypassrls; create role supabase_admin nologin;
  create schema auth;
  create function auth.role() returns text language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', 'anon') $$;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;

  create table public.user_profiles (id uuid primary key, tenant_id uuid, role varchar);

  create table public.venthub_orders (
    id uuid primary key default gen_random_uuid(),
    order_number text not null,
    user_id uuid not null,
    status text not null default 'pending',
    total_amount numeric(10,2) not null default 0.00,
    shipping_address jsonb not null default '{}',
    billing_address jsonb not null default '{}',
    payment_method text,
    payment_status text default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    customer_email text,
    paid_at timestamptz,
    paid_email_sent_at timestamptz,
    tenant_id uuid not null default '${T}',
    currency text not null default 'TRY'
  );
  create table public.venthub_order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.venthub_orders(id),
    product_id uuid not null,
    product_name text not null,
    unit_price numeric(10,2) not null,
    quantity integer not null default 1,
    total_price numeric(10,2) not null,
    product_snapshot jsonb not null default '{}',
    created_at timestamptz not null default now(),
    unit_price_snapshot numeric(10,2) not null default 0,
    product_name_snapshot text not null default 'x',
    product_sku_snapshot text not null default 'x',
    tax_rate_snapshot numeric not null default 0,
    tenant_id uuid not null default '${T}'
  );
  create table public.venthub_returns (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    order_id uuid not null references public.venthub_orders(id),
    status text not null default 'requested',
    reason text not null,
    description text,
    refund_amount numeric(10,2),
    admin_notes text,
    requested_at timestamptz not null default now(),
    approved_at timestamptz,
    processed_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    tenant_id uuid not null default '${T}'
  );
  create table public.test_bildirim (id serial primary key, order_id uuid);

  -- ═══ CANLIDAN BİREBİR (pg_get_functiondef) ═══
  CREATE OR REPLACE FUNCTION public.jwt_tenant_id() RETURNS uuid LANGUAGE plpgsql SET search_path TO 'public', 'pg_catalog' AS $f$
  DECLARE claims_str text; tenant_id_val text;
  BEGIN
    claims_str := current_setting('request.jwt.claims', true);
    IF claims_str IS NULL OR claims_str = '' THEN RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid; END IF;
    tenant_id_val := claims_str::jsonb -> 'app_metadata' ->> 'tenant_id';
    IF tenant_id_val IS NULL OR tenant_id_val = '' THEN RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid; END IF;
    RETURN tenant_id_val::uuid;
  EXCEPTION WHEN OTHERS THEN RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END; $f$;

  CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $f$
  DECLARE claims jsonb; user_role text;
  BEGIN
    IF auth.role() = 'service_role' THEN RETURN TRUE; END IF;
    claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
    IF claims IS NOT NULL THEN
      user_role := COALESCE(claims ->> 'user_role', claims -> 'app_metadata' ->> 'user_role');
      IF user_role IS NOT NULL THEN RETURN user_role IN ('admin', 'super_admin'); END IF;
    END IF;
    RETURN EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'));
  END; $f$;

  CREATE OR REPLACE FUNCTION public.is_admin_claim() RETURNS boolean LANGUAGE plpgsql STABLE SET search_path TO 'public', 'pg_temp' AS $f$
  DECLARE claims jsonb; user_role text;
  BEGIN
    IF auth.role() = 'service_role' THEN RETURN TRUE; END IF;
    claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
    IF claims IS NULL THEN RETURN FALSE; END IF;
    user_role := COALESCE(claims ->> 'user_role', claims -> 'app_metadata' ->> 'user_role');
    RETURN COALESCE(user_role IN ('admin', 'super_admin'), FALSE);
  END; $f$;

  CREATE OR REPLACE FUNCTION public.sync_payment_status_with_status() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $f$
  BEGIN
    IF NEW.status = 'confirmed' AND COALESCE(NEW.payment_status, '') IN ('', 'pending') THEN NEW.payment_status := 'paid'; END IF;
    RETURN NEW;
  END; $f$;

  CREATE OR REPLACE FUNCTION public.stamp_order_paid_at() RETURNS trigger LANGUAGE plpgsql AS $f$
  begin
    if new.payment_status = 'paid' and (old.payment_status is distinct from 'paid') and new.paid_at is null then new.paid_at := now(); end if;
    return new;
  end; $f$;

  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $f$
  BEGIN NEW.updated_at := now(); RETURN NEW; END; $f$;

  CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'pg_catalog', 'public' AS $f$
  BEGIN NEW.updated_at = now(); RETURN NEW; END; $f$;

  -- KUKLA (canlıdaki notify_order_paid pg_net ile e-posta atar; burada yalnız "ödendi bildirimi üretildi" kaydı)
  CREATE OR REPLACE FUNCTION public.notify_order_paid() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $f$
  BEGIN insert into public.test_bildirim(order_id) values (new.id); RETURN NEW; END; $f$;

  -- Canlı tetikler (pg_get_triggerdef)
  CREATE TRIGGER trg_notify_order_paid AFTER UPDATE ON public.venthub_orders FOR EACH ROW WHEN (((old.paid_at IS NULL) AND (new.paid_at IS NOT NULL))) EXECUTE FUNCTION notify_order_paid();
  CREATE TRIGGER trg_stamp_order_paid_at BEFORE UPDATE ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION stamp_order_paid_at();
  CREATE TRIGGER trg_sync_payment_status_ins BEFORE INSERT ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION sync_payment_status_with_status();
  CREATE TRIGGER trg_sync_payment_status_upd BEFORE UPDATE OF status ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION sync_payment_status_with_status();
  CREATE TRIGGER update_venthub_orders_updated_at BEFORE UPDATE ON public.venthub_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER trg_venthub_returns_updated_at BEFORE UPDATE ON public.venthub_returns FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  -- Yetkiler: canlıda anon 'awdDxtm' (tüm yazma), authenticated geniş
  grant usage on schema auth, public to anon, authenticated, service_role;
  grant all on all tables in schema public to anon, authenticated, service_role;
  grant execute on all functions in schema auth, public to anon, authenticated, service_role;

  alter table public.venthub_orders enable row level security;
  alter table public.venthub_order_items enable row level security;
  alter table public.venthub_returns enable row level security;

  -- Politikalar CANLIDAN (pg_policy)
  create policy orders_delete_policy on public.venthub_orders for delete to authenticated using ((tenant_id = jwt_tenant_id()) AND ( SELECT is_admin_user() ));
  create policy orders_insert_policy on public.venthub_orders for insert to authenticated with check ((tenant_id = jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() )) OR ( SELECT is_admin_user() )));
  create policy orders_select_policy on public.venthub_orders for select to authenticated using ((tenant_id = jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() )) OR ( SELECT is_admin_user() )));
  create policy orders_service_role on public.venthub_orders for all to service_role using (true);
  create policy orders_update_policy on public.venthub_orders for update to authenticated
    using ((tenant_id = jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() )) OR ( SELECT is_admin_user() )))
    with check ((tenant_id = jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() )) OR ( SELECT is_admin_user() )));

  create policy venthub_order_items_insert_optimized on public.venthub_order_items for insert to authenticated
    with check ((tenant_id = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM venthub_orders WHERE ((venthub_orders.id = venthub_order_items.order_id) AND (venthub_orders.user_id = ( SELECT auth.uid() )) AND (venthub_orders.tenant_id = jwt_tenant_id())))));
  create policy venthub_order_items_select_consolidated on public.venthub_order_items for select to authenticated
    using ((tenant_id = jwt_tenant_id()) AND ((order_id IN ( SELECT venthub_orders.id FROM venthub_orders WHERE ((venthub_orders.user_id = ( SELECT auth.uid() )) AND (venthub_orders.tenant_id = jwt_tenant_id())))) OR ( SELECT is_admin_user() )));
  create policy venthub_order_items_service_role on public.venthub_order_items for all to service_role using (true);

  create policy returns_delete_policy on public.venthub_returns for delete to authenticated using ((tenant_id = jwt_tenant_id()) AND ( SELECT is_admin_user() ));
  create policy returns_insert_policy on public.venthub_returns for insert to authenticated
    with check ((tenant_id = jwt_tenant_id()) AND (((user_id = ( SELECT auth.uid() )) AND (EXISTS ( SELECT 1 FROM venthub_orders o WHERE ((o.id = venthub_returns.order_id) AND (o.user_id = ( SELECT auth.uid() )) AND (o.tenant_id = jwt_tenant_id()))))) OR ( SELECT is_admin_user() )));
  create policy returns_select_policy on public.venthub_returns for select to authenticated using ((tenant_id = jwt_tenant_id()) AND ((user_id = ( SELECT auth.uid() )) OR ( SELECT is_admin_user() )));
  create policy returns_service_role on public.venthub_returns for all to service_role using (true);
  create policy returns_update_policy on public.venthub_returns for update to authenticated
    using ((tenant_id = jwt_tenant_id()) AND ( SELECT is_admin_user() ))
    with check ((tenant_id = jwt_tenant_id()) AND ( SELECT is_admin_user() ));

  -- Meşru sunucu yolu örneği (B2): sahibi postgres olan DEFINER fonksiyon müşteri oturumundan çağrılır
  create function public.test_definer_onayla(p_id uuid) returns void language plpgsql security definer as $f$
  begin update public.venthub_orders set status = 'confirmed' where id = p_id; end; $f$;
  grant execute on function public.test_definer_onayla(uuid) to authenticated;

  -- Tohum: 5 sipariş (A:3, B:2), A'nın ilk siparişinde 1 kalem
  insert into public.user_profiles values ('${A}','${T}','user'),('${B}','${T}','user'),('${ADM}','${T}','admin');
  insert into public.venthub_orders (id, order_number, user_id, total_amount) values
    ('10000000-0000-0000-0000-000000000001','VH-1','${A}',1000),
    ('10000000-0000-0000-0000-000000000002','VH-2','${A}',2000),
    ('10000000-0000-0000-0000-000000000003','VH-3','${A}',3000),
    ('10000000-0000-0000-0000-000000000004','VH-4','${B}',4000),
    ('10000000-0000-0000-0000-000000000005','VH-5','${B}',5000);
  insert into public.venthub_order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
    values ('10000000-0000-0000-0000-000000000001','${URUN}','Fan',1000,1,1000);
`

const S1 = '10000000-0000-0000-0000-000000000001'
const S4 = '10000000-0000-0000-0000-000000000004'

async function kur() {
  const db = new PGlite()
  await db.exec(CANLI_SQL)
  return db
}

async function olarak(db, kim, sql) {
  const claims = JSON.stringify(KIMLIK[kim]).replace(/'/g, "''")
  await db.exec(`select set_config('request.jwt.claims', '${claims}', false); set role ${ROL[kim]};`)
  try {
    const r = await db.query(sql)
    return { ok: true, satir: r.rows.length || (r.affectedRows ?? 0) }
  } catch (e) {
    return { ok: false, kod: e.code, hata: String(e.message).slice(0, 110) }
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claims', '', false);`)
  }
}

let basarisiz = 0
const kontrol = (ad, kosul, ayrinti = '') => {
  if (!kosul) basarisiz++
  yaz(`${kosul ? 'GECTI  ' : 'KALDI  '} ${ad}${ayrinti ? ' — ' + ayrinti : ''}`)
}
const bekci = (r) => r.ok === false && r.kod === '42501' && String(r.hata).includes('REC355_BEKCI')
const ozet = async (db) =>
  (await db.query(`select md5(string_agg(id||status||coalesce(payment_status,'')||total_amount||order_number||coalesce(paid_at::text,''), ',' order by id)) as h from public.venthub_orders where id::text like '10000000-%'`)).rows[0].h

// ── SALDIRILAR (hepsi müşteri A, KENDİ siparişi üzerinde) ──
const SALDIRI = {
  siparis_status: `update public.venthub_orders set status = 'confirmed' where id = '${S1}'`,
  siparis_odendi: `update public.venthub_orders set payment_status = 'paid' where id = '${S1}'`,
  siparis_tutar: `update public.venthub_orders set total_amount = 0.01 where id = '${S1}'`,
  siparis_no: `update public.venthub_orders set order_number = 'VH-2' where id = '${S1}'`,
  siparis_ekle: `insert into public.venthub_orders (order_number, user_id, status) values ('VH-HAYALI','${A}','confirmed')`,
  kalem_ekle: `insert into public.venthub_order_items (order_id, product_id, product_name, unit_price, quantity, total_price) values ('${S1}','${URUN}','Fan',0.01,1,0.01)`,
  iade_onayli: `insert into public.venthub_returns (order_id, user_id, reason, status, refund_amount, approved_at) values ('${S1}','${A}','x','approved',999,now())`,
  iade_notlu: `insert into public.venthub_returns (order_id, user_id, reason, admin_notes) values ('${S1}','${A}','x','yonetici notu')`,
}

// ── FAZ 1: ÖNCE (açığın gerçek olduğunun kanıtı; test dişli mi) ──
yaz('\n=== FAZ 1: migration ÖNCESİ (canlı tanımlarla) — müşteri A, kendi siparişinde ===')
for (const [ad, sql] of Object.entries(SALDIRI)) {
  const db = await kur()
  const r = await olarak(db, 'A', sql)
  kontrol(`ÖNCE ${ad}: müşteri yazabiliyor (AÇIK)`, r.ok === true, JSON.stringify(r))
  if (ad === 'siparis_status' || ad === 'siparis_odendi') {
    const s = (await db.query(`select payment_status, paid_at is not null as odendi from public.venthub_orders where id='${S1}'`)).rows[0]
    const b = (await db.query('select count(*)::int as n from public.test_bildirim')).rows[0].n
    if (ad === 'siparis_status') {
      // Tetik sırası (stamp_order_paid_at, sync_payment_status'tan ÖNCE koşar): tek başına status yazmak paid_at'ı damgalamaz
      kontrol('ÖNCE zincir (status yolu): payment_status kendiliğinden "paid" olur; paid_at ve bildirim tek adımda oluşmaz', s.payment_status === 'paid' && !s.odendi && b === 0, JSON.stringify({ ...s, bildirim: b }))
    } else {
      kontrol('ÖNCE zincir (payment_status yolu): paid_at damgalanır + ödendi bildirimi üretilir (parasız "ödendi")', s.payment_status === 'paid' && s.odendi && b === 1, JSON.stringify({ ...s, bildirim: b }))
    }
  }
  await db.close()
}

// ── FAZ 2: SONRA (gerçek migration dosyası) ──
yaz('\n=== FAZ 2: migration SONRASI (gerçek dosya çalıştırıldı) ===')
let db = await kur()
const oncekiHash = await ozet(db)
try {
  await db.exec(migrationSql)
  kontrol('migration temiz koştu (yapısal + davranış guard\'ı, tohum siparişlerle)', true)
} catch (e) {
  kontrol('migration temiz koştu', false, String(e.message).slice(0, 160))
}
kontrol('5 tohum siparişin özeti migration sonrası DEĞİŞMEDİ (guard satır değiştirmedi)', (await ozet(db)) === oncekiHash)
const tetikler = (await db.query(`select tgname from pg_trigger where not tgisinternal and tgname in ('orders_istemci_yazma_bekcisi','order_items_istemci_yazma_bekcisi','iade_istemci_kayit_bekcisi') order by 1`)).rows.length
kontrol('üç bekçi tetiği kurulu', tetikler === 3, tetikler + ' tetik')
await db.close()

for (const [ad, sql] of Object.entries(SALDIRI)) {
  db = await kur()
  await db.exec(migrationSql)
  const once = await ozet(db)
  const r = await olarak(db, 'A', sql)
  const ek = ad === 'siparis_status' || ad === 'siparis_odendi' ? ' + durum/ödendi değişmedi' : ''
  const degismedi = (await ozet(db)) === once
  kontrol(`SONRA ${ad}: REDDEDİLİR (REC355_BEKCI, 42501)${ek}`, bekci(r) && degismedi, JSON.stringify(r))
  await db.close()
}

db = await kur()
await db.exec(migrationSql)
let r
r = await olarak(db, 'A', `insert into public.venthub_returns (order_id, user_id, reason, requested_at, created_at, updated_at) values ('${S1}','${A}','urun bozuk','2000-01-01','2000-01-01','2000-01-01')`)
const damga = (await db.query(`select requested_at > now() - interval '1 hour' as taze from public.venthub_returns where order_id='${S1}'`)).rows[0]
kontrol('SONRA meşru iade talebi (status=requested) AÇILIR; istemcinin gönderdiği eski damgalar sunucu saatine ezilir', r.ok === true && damga?.taze === true, JSON.stringify({ ...r, damga }))
r = await olarak(db, 'A', `update public.venthub_returns set reason = 'degistir' where order_id = '${S1}'`)
kontrol('SONRA müşteri kendi iadesini GÜNCELLEYEMEZ (RLS yalnız yöneticiye açık → 0 satır)', r.ok === true && r.satir === 0, JSON.stringify(r))
r = await olarak(db, 'B', `update public.venthub_orders set status = 'confirmed' where id = '${S1}'`)
kontrol('SONRA başka müşteri (B) A\'nın siparişini güncelleyemez (0 satır)', r.ok === true && r.satir === 0, JSON.stringify(r))
r = await olarak(db, 'A', `select id from public.venthub_orders`)
kontrol('REGRESYON: müşteri kendi siparişlerini OKUR (3)', r.ok === true && r.satir === 3, JSON.stringify(r))
r = await olarak(db, 'A', `select id from public.venthub_order_items`)
kontrol('REGRESYON: müşteri kendi sipariş kalemlerini OKUR (1)', r.ok === true && r.satir === 1, JSON.stringify(r))
r = await olarak(db, 'SAHTE', SALDIRI.siparis_status)
kontrol('SONRA user_metadata\'ya "admin" yazmış müşteri de REDDEDİLİR (kural 12)', bekci(r), JSON.stringify(r))
r = await olarak(db, 'ANON', `update public.venthub_orders set status = 'confirmed' where id = '${S1}'`)
kontrol('SONRA anon UPDATE reddedilir', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'ANON', `insert into public.venthub_returns (order_id, user_id, reason) values ('${S1}','${A}','x')`)
kontrol('SONRA anon INSERT reddedilir', r.ok === false, JSON.stringify(r))
await db.close()

// ── FAZ 3: MEŞRU YOLLAR BOZULMADI ──
yaz('\n=== FAZ 3: meşru yazma yolları (yönetici claim, service_role, postgres, DEFINER fonksiyon) ===')
db = await kur()
await db.exec(migrationSql)
r = await olarak(db, 'ADMIN', `update public.venthub_orders set status = 'shipped' where id = '${S4}'`)
kontrol('yönetici claim sipariş durumunu günceller', r.ok === true && r.satir === 1, JSON.stringify(r))
{
  const KALEM = `insert into public.venthub_order_items (order_id, product_id, product_name, unit_price, quantity, total_price) values ('${S4}','${URUN}','Fan',10,1,10)`
  const eski = await kur()
  const rOnce = await olarak(eski, 'ADMIN', KALEM)
  await eski.close()
  r = await olarak(db, 'ADMIN', KALEM)
  kontrol('REGRESYON: yönetici claim kalem ekleme sonucu migration ÖNCESİYLE AYNI (canlı kalem politikası yalnız sipariş sahibine açık; bekçi değil RLS reddediyor)', rOnce.ok === r.ok && !String(r.hata).includes('REC355_BEKCI'), JSON.stringify({ once: rOnce.ok, sonra: r.ok }))
}
await db.exec(`insert into public.venthub_returns (order_id, user_id, reason) values ('${S4}','${B}','x')`)
r = await olarak(db, 'ADMIN', `update public.venthub_returns set status='approved', refund_amount=100, admin_notes='ok' where order_id='${S4}'`)
kontrol('yönetici claim iadeyi onaylar (refund_amount + admin_notes)', r.ok === true && r.satir === 1, JSON.stringify(r))
r = await olarak(db, 'SERVIS', `update public.venthub_orders set status = 'confirmed' where id = '${S4}'`)
kontrol('service_role (webhook/edge işlevleri) sipariş günceller', r.ok === true && r.satir === 1, JSON.stringify(r))
r = await olarak(db, 'SERVIS', `insert into public.venthub_returns (order_id, user_id, reason, status, refund_amount) values ('${S4}','${B}','y','approved',50)`)
kontrol('service_role onaylı iade yazar', r.ok === true, JSON.stringify(r))
const pg = await db.query(`update public.venthub_orders set status = 'confirmed' where id = '${S4}'`)
kontrol('postgres (migration/bakım) sipariş günceller', pg.affectedRows === 1, String(pg.affectedRows))
r = await olarak(db, 'A', `select public.test_definer_onayla('${S1}')`)
const s1 = (await db.query(`select status from public.venthub_orders where id='${S1}'`)).rows[0].status
kontrol('SECURITY DEFINER sunucu fonksiyonu müşteri oturumundan çağrılınca YAZAR (meşru sunucu yolu, B2)', r.ok === true && s1 === 'confirmed', JSON.stringify({ ...r, durum: s1 }))
await db.close()

// ── FAZ 4: GUARD BOZULURSA MIGRATION KENDİ KENDİNİ DURDURUR + İDEMPOTANS ──
yaz('\n=== FAZ 4: guard fikstürü + idempotans ===')
db = await kur()
const bozuk = migrationSql.replace(
  /if current_user not in \('service_role', 'postgres', 'supabase_admin'\)\s+and not public\.is_admin_claim\(\) then/,
  "if false and current_user not in ('service_role', 'postgres', 'supabase_admin') and not public.is_admin_claim() then"
)
kontrol('fikstür geçerli: bekçi koşulu gerçekten bozuldu (metin değişti)', bozuk !== migrationSql)
let hata = null
try { await db.exec(bozuk) } catch (e) { hata = String(e.message); try { await db.exec('rollback') } catch { /* açık işlem yok */ } }
kontrol('bekçi ateşlemezse migration\'ın davranış guard\'ı RAISE eder', hata !== null && hata.includes('ATESLENMEDI'), (hata ?? 'raise YOK').slice(0, 110))
const kalan = (await db.query(`select count(*)::int as n from pg_trigger where not tgisinternal and (tgname like '%istemci%bekcisi' or tgname = 'iade_istemci_kayit_bekcisi')`)).rows[0].n
kontrol('raise sonrası bekçi tetikleri KALMADI (atomik geri alma)', kalan === 0, kalan + ' tetik')
await db.close()

db = await kur()
await db.exec(migrationSql)
hata = null
try { await db.exec(migrationSql) } catch (e) { hata = String(e.message) }
kontrol('idempotent: migration ikinci kez sorunsuz koşar', hata === null, (hata ?? '').slice(0, 100))
await db.close()

yaz(`\nSONUÇ: ${basarisiz === 0 ? 'HEPSİ GEÇTİ' : basarisiz + ' KALDI'}`)
process.exit(basarisiz === 0 ? 0 : 1)
