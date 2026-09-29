// Yeniden koşum: geçici bir klasörde `npm i @electric-sql/pglite`, sonra `node <bu dosya> <migration yolu>`. Depoya bağımlılık EKLENMEZ.
/* eslint-disable no-console -- CLI kanıt betiği: sonucu terminale yazması amaçtır (depoda çalışma zamanı kodu değildir) */
// REC-442 alt işi — gölge kanıtı (bellek-içi PGlite). Ölçülen şey RLS KARARIDIR; gerçek Storage API'nin
// ek kontrolleri (HTTP kodu, RETURNING kullanımı) simüle EDİLMEZ. Politikalar CANLIDAN üretilmiştir
// (pg_get_expr çıktısı, 2026-09-29), elle yazılmamıştır.
import fs from 'node:fs'

import { PGlite } from '@electric-sql/pglite'

const MIGRATION = process.argv[2]
const migrationSql = fs.readFileSync(MIGRATION, 'utf8')

const CANLI = [
  { ad: 'Auth Delete', komut: 'delete', roller: 'public', using: `((bucket_id = 'category-images'::text) AND (auth.role() = 'authenticated'::text))`, check: null },
  { ad: 'Auth Update', komut: 'update', roller: 'public', using: null, check: `((bucket_id = 'category-images'::text) AND (auth.role() = 'authenticated'::text))` },
  { ad: 'Auth Upload', komut: 'insert', roller: 'public', using: null, check: `((bucket_id = 'category-images'::text) AND (auth.role() = 'authenticated'::text))` },
  { ad: 'product_images_delete_tenant', komut: 'delete', roller: 'authenticated', using: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND ((split_part(name, '/'::text, 1))::uuid = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.tenant_id = jwt_tenant_id()) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))))))`, check: null },
  { ad: 'product_images_insert_tenant', komut: 'insert', roller: 'authenticated', using: null, check: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND ((split_part(name, '/'::text, 1))::uuid = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.tenant_id = jwt_tenant_id()) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))))))` },
  { ad: 'product_images_select_tenant', komut: 'select', roller: 'authenticated', using: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND ((split_part(name, '/'::text, 1))::uuid = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.tenant_id = jwt_tenant_id())))))`, check: null },
  { ad: 'product_images_tenant_delete', komut: 'delete', roller: 'authenticated', using: `((bucket_id = 'product-images'::text) AND ((storage.foldername(name))[1] = (( SELECT jwt_tenant_id() AS jwt_tenant_id))::text) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[]))))))`, check: null },
  { ad: 'product_images_tenant_update', komut: 'update', roller: 'authenticated', using: `((bucket_id = 'product-images'::text) AND ((storage.foldername(name))[1] = (( SELECT jwt_tenant_id() AS jwt_tenant_id))::text) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[]))))))`, check: null },
  { ad: 'product_images_tenant_write', komut: 'insert', roller: 'authenticated', using: null, check: `((bucket_id = 'product-images'::text) AND ((storage.foldername(name))[1] = (( SELECT jwt_tenant_id() AS jwt_tenant_id))::text) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[]))))))` },
  { ad: 'product_images_update_tenant', komut: 'update', roller: 'authenticated', using: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND ((split_part(name, '/'::text, 1))::uuid = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.tenant_id = jwt_tenant_id()) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))))))`, check: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND ((split_part(name, '/'::text, 1))::uuid = jwt_tenant_id()) AND (EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.tenant_id = jwt_tenant_id()) AND ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))))))` },
]

const ADMIN = '00000000-0000-0000-0000-0000000000aa'
const SADE = '00000000-0000-0000-0000-0000000000bb'
const TENANT = '11111111-1111-1111-1111-111111111111'

async function kur(ekPolitikalar = []) {
  const db = new PGlite()
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create schema storage;
    create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function public.jwt_tenant_id() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.tenant', true), '')::uuid $$;
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
    create table storage.buckets (id text primary key, public boolean);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, metadata jsonb);
    create table public.user_profiles (id uuid primary key, tenant_id uuid, role varchar);
    insert into storage.buckets values ('category-images', true), ('product-images', true);
    insert into public.user_profiles values ('${ADMIN}', '${TENANT}', 'admin'), ('${SADE}', '${TENANT}', 'user');
    insert into storage.objects (bucket_id, name) values ('category-images','cat_1.webp'),('category-images','cat_2.webp'),('category-images','cat_3.webp');
    grant usage on schema auth, storage, public to anon, authenticated, service_role;
    grant execute on all functions in schema auth, storage, public to anon, authenticated, service_role;
    grant select, insert, update, delete on storage.objects to anon, authenticated, service_role;
    grant select on storage.buckets to anon, authenticated, service_role;
    grant select on public.user_profiles to anon, authenticated, service_role;
    alter table storage.objects enable row level security;
  `)
  for (const p of [...CANLI, ...ekPolitikalar]) {
    const rol = p.roller === 'public' ? 'public' : p.roller
    await db.exec(
      `create policy "${p.ad}" on storage.objects for ${p.komut} to ${rol}` +
        (p.using ? ` using (${p.using})` : '') +
        (p.check ? ` with check (${p.check})` : '')
    )
  }
  return db
}

async function olarak(db, rol, sub, tenant, sql) {
  await db.exec(
    `select set_config('request.jwt.claim.role','${rol === 'anon' ? 'anon' : rol}', false), set_config('request.jwt.claim.sub','${sub ?? ''}', false), set_config('request.jwt.claim.tenant','${tenant ?? ''}', false); set role ${rol};`
  )
  try {
    const r = await db.query(sql)
    return { ok: true, satir: r.affectedRows ?? r.rows.length }
  } catch (e) {
    return { ok: false, hata: String(e.message).slice(0, 90) }
  } finally {
    await db.exec('reset role;')
  }
}

let basarisiz = 0
const kontrol = (ad, kosul, ayrinti = '') => {
  if (!kosul) basarisiz++
  console.log(`${kosul ? 'GECTI  ' : 'KALDI  '} ${ad}${ayrinti ? ' — ' + ayrinti : ''}`)
}
const ekle = (kova, ad) => `insert into storage.objects (bucket_id, name) values ('${kova}', '${ad}')`

// ── FAZ 1: KALDIRMADAN ÖNCE (negatif kontrol: test dişli mi) ──
console.log('\n=== FAZ 1: migration ÖNCESİ (canlı tanımlarla) ===')
let db = await kur()
let r
r = await olarak(db, 'authenticated', SADE, TENANT, ekle('category-images', 'x.png'))
kontrol('ÖNCE sade kullanıcı category-images INSERT (RETURNING\'siz) ALIR', r.ok === true, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, ekle('category-images', 'y.png') + ' returning id')
console.log(`BİLGİ   ÖNCE sade kullanıcı INSERT ... RETURNING → ${JSON.stringify(r)} (kovada SELECT politikası yok; Storage API'nin hangi biçimi kullandığı ÖLÇÜLMEDİ)`)
r = await olarak(db, 'anon', null, null, ekle('category-images', 'z.png'))
kontrol('ÖNCE anon INSERT reddedilir (auth.role()=anon)', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, `update storage.objects set name = name || '_' where bucket_id = 'category-images'`)
console.log(`BİLGİ   ÖNCE sade kullanıcı UPDATE etkilenen satır: ${JSON.stringify(r)} (SELECT politikası yok → beklenti 0)`)
r = await olarak(db, 'authenticated', SADE, TENANT, `delete from storage.objects where bucket_id = 'category-images'`)
console.log(`BİLGİ   ÖNCE sade kullanıcı DELETE etkilenen satır: ${JSON.stringify(r)} (beklenti 0)`)
await db.close()

// ── FAZ 2: MİGRATION SONRASI ──
console.log('\n=== FAZ 2: migration SONRASI (gerçek dosya çalıştırıldı) ===')
db = await kur()
try {
  await db.exec(migrationSql)
  kontrol('migration temiz koştu (ön-guard + son-guard geçti)', true)
} catch (e) {
  kontrol('migration temiz koştu', false, String(e.message).slice(0, 120))
}
const kalan = (await db.query(`select polname from pg_policy where polrelid='storage.objects'::regclass order by 1`)).rows.map((x) => x.polname)
kontrol('üç politika kalktı, 7 product-images politikası yerinde', kalan.length === 7 && kalan.every((n) => n.startsWith('product_images')), kalan.length + ' politika')
r = await olarak(db, 'authenticated', SADE, TENANT, ekle('category-images', 'x.png'))
kontrol('SONRA sade kullanıcı category-images INSERT REDDEDİLİR', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, ekle('category-images', 'y.png') + ' returning id')
kontrol('SONRA sade kullanıcı INSERT ... RETURNING REDDEDİLİR', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'anon', null, null, ekle('category-images', 'z.png'))
kontrol('SONRA anon INSERT reddedilir', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, `update storage.objects set name = name || '_' where bucket_id = 'category-images'`)
kontrol('SONRA sade kullanıcı UPDATE 0 satır', r.ok === true && r.satir === 0, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, `delete from storage.objects where bucket_id = 'category-images'`)
kontrol('SONRA sade kullanıcı DELETE 0 satır', r.ok === true && r.satir === 0, JSON.stringify(r))
r = await olarak(db, 'service_role', null, null, ekle('category-images', 'servis.png'))
kontrol('SONRA service_role INSERT geçer (betikler etkilenmez)', r.ok === true, JSON.stringify(r))
const nesne = (await db.query(`select count(*)::int as n from storage.objects where bucket_id='category-images' and name like 'cat_%'`)).rows[0].n
kontrol('mevcut 3 nesne yerinde (migration nesnelere dokunmadı)', nesne === 3, nesne + ' nesne')
// meşru yol bozulmadı mı: yönetici kendi tenant yoluna yazar, sade kullanıcı yazamaz
r = await olarak(db, 'authenticated', ADMIN, TENANT, ekle('product-images', `${TENANT}/a.png`))
kontrol('REGRESYON: yönetici product-images tenant yoluna yazar', r.ok === true, JSON.stringify(r))
r = await olarak(db, 'authenticated', SADE, TENANT, ekle('product-images', `${TENANT}/b.png`))
kontrol('REGRESYON: sade kullanıcı product-images\'a yazamaz', r.ok === false, JSON.stringify(r))
await db.close()

// ── FAZ 3: GUARD FİKSTÜRLERİ (F1, F2) ──
console.log('\n=== FAZ 3: guard fikstürleri ===')
async function migrationDene(ekPolitikalar) {
  const d = await kur(ekPolitikalar)
  let hata = null
  try { await d.exec(migrationSql) } catch (e) { hata = String(e.message) ; try { await d.exec('rollback') } catch {} }
  const politikalar = (await d.query(`select polname from pg_policy where polrelid='storage.objects'::regclass order by 1`)).rows.map((x) => x.polname)
  await d.close()
  return { hata, politikalar }
}
// F1 ters fikstür: aynı adlı ama BAŞKA kovaya bakan politika → ön-guard raise, hiçbir şey silinmez
let s = await migrationDene([])
{
  const d = await kur()
  await d.exec(`drop policy "Auth Upload" on storage.objects; create policy "Auth Upload" on storage.objects for insert to public with check (bucket_id = 'baska-kova')`)
  let hata = null
  try { await d.exec(migrationSql) } catch (e) { hata = String(e.message); try { await d.exec('rollback') } catch {} }
  const ad = (await d.query(`select polname from pg_policy where polrelid='storage.objects'::regclass and polname like 'Auth %' order by 1`)).rows.map((x) => x.polname)
  kontrol('F1: aynı ad + başka kova → ÖN-GUARD raise eder', hata && hata.includes('ON-GUARD'), (hata ?? 'raise YOK').slice(0, 100))
  kontrol('F1: raise sonrası üç "Auth *" politikası yerinde (atomik geri alma)', ad.length === 3, ad.join(','))
  await d.close()
}
// F2 fikstür: kovaya bağlanmamış kapısız yazma politikası → son-guard raise, atomik geri alma
s = await migrationDene([{ ad: 'herkes_yazar', komut: 'insert', roller: 'authenticated', using: null, check: 'true' }])
kontrol('F2: `with check (true)` kapısız politika → SON-GUARD raise eder', s.hata && s.hata.includes('SON-GUARD'), (s.hata ?? 'raise YOK').slice(0, 100))
kontrol('F2: raise sonrası eski üç politika hâlâ yerinde (atomik)', ['Auth Delete', 'Auth Update', 'Auth Upload'].every((n) => s.politikalar.includes(n)), s.politikalar.length + ' politika')
// idempotans: ikinci koşu
{
  const d = await kur()
  await d.exec(migrationSql)
  let hata = null
  try { await d.exec(migrationSql) } catch (e) { hata = String(e.message) }
  kontrol('idempotent: migration ikinci kez sorunsuz koşar', hata === null, (hata ?? '').slice(0, 100))
  await d.close()
}

console.log(`\nSONUÇ: ${basarisiz === 0 ? 'HEPSİ GEÇTİ' : basarisiz + ' KALDI'}`)
process.exit(basarisiz === 0 ? 0 : 1)
