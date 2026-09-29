// Yeniden koşum: geçici bir klasörde `npm i @electric-sql/pglite`, sonra `node <bu dosya> <migration yolu>`. Depoya bağımlılık EKLENMEZ.
// REC-168 A — gölge kanıtı (bellek-içi PGlite, Docker YOK). Emsal: rec442-category-images-golge-2026-09-29.mjs.
//
// ÖLÇTİĞİ: `satis_kipi_oku()` davranışı (satır yok / bozuk değer / geçerli değer, anon ve authenticated rolleriyle),
// üç tetiğin HANGİ olaylarda ateşlendiği (stub webhook fonksiyonu kayıt tutar), iki RESTRICTIVE politikanın panel
// yazımını kilitlemesi (`general` yazımı geçer), guard fikstürleri (sabotajlı migration kopyası → EXCEPTION + tam geri alma).
// Tablo/politika tanımları depodaki baseline'dan (supabase/baselines/2026-09-29_public_schema.sql) alınmıştır.
//
// ÖLÇMEDİĞİ (PGlite kapsamaz → "Docker gölgesi gerektiren kalan"): gerçek `handle_supabase_webhook()` (Vault sırrı +
// pg_net HTTP çağrısı) — burada yalnız "tetik ateşlendi mi" ölçülür, webhook'un route'a ulaşması ölçülmez;
// gerçek `auth.uid()`/JWT çözümlemesi (burada `request.jwt.claim.*` ayarıyla taklit); `denetim_izi_site_settings` tetiği.
import fs from 'node:fs'

import { PGlite } from '@electric-sql/pglite'

const yaz = (s) => process.stdout.write(`${s}\n`)
const MIGRATION = process.argv[2]
const migrationSql = fs.readFileSync(MIGRATION, 'utf8')

const ADMIN = '00000000-0000-0000-0000-0000000000aa'
const MODERATOR = '00000000-0000-0000-0000-0000000000cc'
const SADE = '00000000-0000-0000-0000-0000000000bb'

async function kur() {
  const db = new PGlite()
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table public.user_profiles (id uuid primary key, role varchar);
    insert into public.user_profiles values ('${ADMIN}', 'admin'), ('${MODERATOR}', 'moderator'), ('${SADE}', 'user');
    -- canlı tanım (baseline 5422): kolonlar birebir
    create table public.site_settings (
      id uuid default gen_random_uuid() not null primary key, key text not null unique,
      value jsonb default '{}'::jsonb not null, description text, updated_at timestamptz default now(), updated_by uuid);
    alter table public.site_settings enable row level security;
    -- canlı politikalar (baseline 8470-8490), üçü de authenticated'a
    create policy site_settings_admin_insert on public.site_settings for insert to authenticated
      with check (exists (select 1 from public.user_profiles up where up.id = (select auth.uid()) and up.role::text = any (array['admin','super_admin','moderator'])));
    create policy site_settings_admin_select on public.site_settings for select to authenticated
      using (exists (select 1 from public.user_profiles up where up.id = (select auth.uid()) and up.role::text = any (array['admin','super_admin','moderator'])));
    create policy site_settings_admin_update on public.site_settings for update to authenticated
      using (exists (select 1 from public.user_profiles up where up.id = (select auth.uid()) and up.role::text = any (array['admin','super_admin','moderator'])))
      with check (exists (select 1 from public.user_profiles up where up.id = (select auth.uid()) and up.role::text = any (array['admin','super_admin','moderator'])));
    -- canlı GRANT'ler (baseline 10328-10330): anon'un tablo SELECT'i YOK
    grant usage on schema auth, public to anon, authenticated, service_role;
    grant insert, references, delete, trigger, truncate, update on public.site_settings to anon;
    grant all on public.site_settings to authenticated, service_role;
    grant select on public.user_profiles to anon, authenticated, service_role;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
    -- Supabase varsayılanı: yeni public fonksiyona anon/authenticated/service_role EXECUTE (+ PUBLIC varsayılanı)
    alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
    insert into public.site_settings (key, value) values ('general', '{}'), ('payment', '{}');
    -- webhook STUB: gerçek pg_net/Vault YOK; yalnız ateşlenmeyi kaydeder
    create table public.webhook_log (n serial, olay text, anahtar text);
    create function public.handle_supabase_webhook() returns trigger language plpgsql security definer as $$
      begin insert into public.webhook_log (olay, anahtar) values (tg_op, coalesce(new.key, old.key)); return coalesce(new, old); end $$;
  `)
  return db
}

async function olarak(db, rol, sub, sql) {
  await db.exec(
    `select set_config('request.jwt.claim.role','${rol}', false), set_config('request.jwt.claim.sub','${sub ?? ''}', false); set role ${rol};`,
  )
  try {
    const r = await db.query(sql)
    return { ok: true, satir: r.affectedRows ?? r.rows.length, rows: r.rows }
  } catch (e) {
    return { ok: false, hata: String(e.message).slice(0, 100) }
  } finally {
    await db.exec('reset role;')
  }
}
const oku = async (db, rol, sub = null) => (await olarak(db, rol, sub, 'select public.satis_kipi_oku() as k')).rows?.[0]?.k
const logSayisi = async (db) => (await db.query('select count(*)::int as n from public.webhook_log')).rows[0].n

let basarisiz = 0
const kontrol = (ad, kosul, ayrinti = '') => {
  if (!kosul) basarisiz++
  yaz(`${kosul ? 'GECTI  ' : 'KALDI  '} ${ad}${ayrinti ? ' — ' + ayrinti : ''}`)
}

// ── FAZ 1: MİGRATION ÖNCESİ (negatif kontrol) ──
yaz('\n=== FAZ 1: migration ÖNCESİ ===')
let db = await kur()
let r = await olarak(db, 'anon', null, 'select public.satis_kipi_oku()')
kontrol('ÖNCE satis_kipi_oku yok (anon çağrısı düşer) — kod 404→KAPALI ile bugünkü davranış', r.ok === false, JSON.stringify(r))
r = await olarak(db, 'authenticated', ADMIN, `insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": true}')`)
kontrol('ÖNCE yönetici (moderator dahil) satis_kipi satırını YAZABİLİR (Ç3 açığı: kilit yok)', r.ok === true, JSON.stringify(r))
await db.close()

// ── FAZ 2: MİGRATION SONRASI ──
yaz('\n=== FAZ 2: migration SONRASI (gerçek dosya çalıştırıldı) ===')
db = await kur()
try {
  await db.exec(migrationSql)
  kontrol('migration temiz koştu (lock/statement timeout + guard geçti)', true)
} catch (e) {
  kontrol('migration temiz koştu', false, String(e.message).slice(0, 140))
}

// 2.1 satır YOK → KAPALI (vitrin DEĞİŞMEZ)
let k = await oku(db, 'anon')
kontrol('satır YOKKEN anon: {acik:false, damga:null} (vitrin bugünkü gibi KAPALI)', k?.acik === false && k?.damga === null, JSON.stringify(k))
k = await oku(db, 'authenticated', SADE)
kontrol('satır YOKKEN authenticated: {acik:false}', k?.acik === false, JSON.stringify(k))
r = await olarak(db, 'anon', null, 'select * from public.site_settings')
kontrol('anon tabloyu DOĞRUDAN okuyamaz (SELECT GRANT yok) — RPC tek yol', r.ok === false, JSON.stringify(r))
const acl = (await db.query(`select proacl::text as a from pg_proc where proname='satis_kipi_oku'`)).rows[0].a
kontrol('EXECUTE hedefli: PUBLIC yok, anon+authenticated+service_role var', !/(^\{|,)=X/.test(acl) && /anon=X/.test(acl) && /authenticated=X/.test(acl) && /service_role=X/.test(acl), acl)
const def = (await db.query(`select prosecdef, proconfig::text as cfg from pg_proc where proname='satis_kipi_oku'`)).rows[0]
kontrol('DEFINER ve search_path kilitli', def.prosecdef === true && def.cfg.includes("search_path=") && def.cfg.includes("\"\""), JSON.stringify(def))

// 2.2 service_role satır ekler: tetik + RPC
await db.exec('delete from public.webhook_log')
r = await olarak(db, 'service_role', null, `insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": true}')`)
kontrol('service_role satis_kipi INSERT geçer', r.ok === true, JSON.stringify(r))
k = await oku(db, 'anon')
kontrol('geçerli {acik:true} → anon acik=true, damga dolu', k?.acik === true && typeof k?.damga === 'string', JSON.stringify(k))
let log = (await db.query('select olay, anahtar from public.webhook_log order by n')).rows
kontrol('INSERT tetiği ateşlendi (1 kayıt: INSERT/satis_kipi)', log.length === 1 && log[0].olay === 'INSERT' && log[0].anahtar === 'satis_kipi', JSON.stringify(log))

// 2.3 bozuk değerler → KAPALI (fail-closed; cast patlamaz)
for (const [ad, deger] of [['dize "true"', '{"acik": "true"}'], ['sayı 1', '{"acik": 1}'], ['acik yok', '{}'], ['null', '{"acik": null}'], ['skalar', 'true'], ['dizi', '[true]']]) {
  await db.exec(`update public.site_settings set value = '${deger}'::jsonb where key = 'satis_kipi'`)
  k = await oku(db, 'anon')
  kontrol(`bozuk değer (${ad}) → KAPALI`, k?.acik === false, JSON.stringify(k))
}
await db.exec(`update public.site_settings set value = '{"acik": false}'::jsonb where key = 'satis_kipi'`)
k = await oku(db, 'anon')
kontrol('geçerli {acik:false} → KAPALI', k?.acik === false, JSON.stringify(k))

// 2.4 tetik olay kapsamı
await db.exec('delete from public.webhook_log')
await db.exec(`update public.site_settings set value = '{"acik": true}'::jsonb where key = 'satis_kipi'`)
await db.exec(`update public.site_settings set key = 'satis_kipi_eski' where key = 'satis_kipi'`)
k = await oku(db, 'anon')
kontrol('anahtar YENİDEN ADLANDIRILINCA satır kaybolur → KAPALI', k?.acik === false, JSON.stringify(k))
await db.exec(`update public.site_settings set key = 'satis_kipi' where key = 'satis_kipi_eski'`)
await db.exec(`delete from public.site_settings where key = 'satis_kipi'`)
k = await oku(db, 'anon')
kontrol('DELETE sonrası KAPALI', k?.acik === false, JSON.stringify(k))
log = (await db.query('select olay, anahtar from public.webhook_log order by n')).rows
kontrol(
  'tetikler: UPDATE(değer) · UPDATE(yeniden adlandırma, old.key) · UPDATE(geri adlandırma, new.key) · DELETE hepsi ateşlendi',
  log.length === 4 && log.map((l) => l.olay).join(',') === 'UPDATE,UPDATE,UPDATE,DELETE',
  JSON.stringify(log),
)
// yeniden ekle (sonraki senaryolar için)
await db.exec(`insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": true}')`)

// 2.5 ilgisiz anahtarlar webhook ATMAZ
await db.exec('delete from public.webhook_log')
await db.exec(`update public.site_settings set value = '{"x":1}'::jsonb where key = 'payment'`)
await db.exec(`update public.site_settings set value = '{"y":2}'::jsonb where key = 'general'`)
await db.exec(`insert into public.site_settings (key, value) values ('baska', '{}')`)
await db.exec(`delete from public.site_settings where key = 'baska'`)
kontrol('payment/general/başka anahtar yazımı webhook ATMAZ (WHEN koşulu)', (await logSayisi(db)) === 0, `${await logSayisi(db)} kayıt`)

// 2.6 RESTRICTIVE politikalar: paneldeki roller
for (const [rolAd, sub] of [['admin', ADMIN], ['moderator', MODERATOR]]) {
  r = await olarak(db, 'authenticated', sub, `insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": true}')`)
  kontrol(`${rolAd}: satis_kipi INSERT RLS ile REDDEDİLİR (zaten var → unique da olsa politika önce)`, r.ok === false, JSON.stringify(r))
  r = await olarak(db, 'authenticated', sub, `update public.site_settings set value = '{"acik": false}' where key = 'satis_kipi'`)
  kontrol(`${rolAd}: satis_kipi UPDATE 0 satır etkiler (satır görünmez)`, r.ok === true && r.satir === 0, JSON.stringify(r))
  r = await olarak(db, 'authenticated', sub, `update public.site_settings set key = 'satis_kipi' where key = 'general'`)
  kontrol(`${rolAd}: başka anahtarı 'satis_kipi'ne YENİDEN ADLANDIRMA reddedilir (WITH CHECK)`, r.ok === false, JSON.stringify(r))
  r = await olarak(db, 'authenticated', sub, `update public.site_settings set value = '{"z":${rolAd === 'admin' ? 1 : 2}}' where key = 'general'`)
  kontrol(`${rolAd}: general UPDATE GEÇER (panel kırılmaz)`, r.ok === true && r.satir === 1, JSON.stringify(r))
  r = await olarak(db, 'authenticated', sub, `insert into public.site_settings (key, value) values ('yeni_${rolAd}', '{}')`)
  kontrol(`${rolAd}: başka anahtar INSERT GEÇER`, r.ok === true, JSON.stringify(r))
}
k = await oku(db, 'anon')
kontrol('panel denemelerinden sonra satır DEĞİŞMEDİ (acik=true kaldı)', k?.acik === true, JSON.stringify(k))
r = await olarak(db, 'authenticated', SADE, `update public.site_settings set value = '{"h":1}' where key = 'general'`)
kontrol('sade kullanıcı general UPDATE 0 satır (mevcut politika bozulmadı)', r.ok === true && r.satir === 0, JSON.stringify(r))
r = await olarak(db, 'service_role', null, `update public.site_settings set value = '{"acik": false}' where key = 'satis_kipi'`)
kontrol('service_role (betik) satis_kipi UPDATE GEÇER', r.ok === true && r.satir === 1, JSON.stringify(r))
r = await olarak(db, 'authenticated', MODERATOR, `update public.site_settings set value = '{"acik": true}' where key = 'payment'`)
yaz(`BİLGİ   moderator payment (İyzico) satırını yazabilir → ${JSON.stringify(r)} (bu migration'ın kapsamı DIŞI; ayrı kayıt, plan "Ayrı kayıtlar")`)
await db.close()

// ── FAZ 3: GUARD FİKSTÜRLERİ (sabotajlı migration kopyası → EXCEPTION + tam geri alma) ──
yaz('\n=== FAZ 3: guard fikstürleri ===')
async function sabotajli(ad, degistir, beklenenMesaj) {
  const d = await kur()
  const sql = degistir(migrationSql)
  if (sql === migrationSql) {
    kontrol(`fikstür "${ad}": sabotaj uygulanamadı (desen bulunamadı)`, false)
    await d.close()
    return
  }
  let hata = null
  try { await d.exec(sql) } catch (e) { hata = String(e.message); try { await d.exec('rollback') } catch { /* zaten geri alındı */ } }
  const fonk = (await d.query(`select count(*)::int as n from pg_proc where proname='satis_kipi_oku'`)).rows[0].n
  const tetik = (await d.query(`select count(*)::int as n from pg_trigger where tgname like 'on_site_settings_satis_kipi_%'`)).rows[0].n
  kontrol(`fikstür "${ad}": EXCEPTION verdi`, hata !== null && hata.includes(beklenenMesaj), hata?.slice(0, 90))
  kontrol(`fikstür "${ad}": TAM geri alındı (fonksiyon 0, tetik 0)`, fonk === 0 && tetik === 0, `fonksiyon=${fonk} tetik=${tetik}`)
  await d.close()
}
await sabotajli('anon EXECUTE eksik', (s) => s.replace('to anon, authenticated, service_role;', 'to authenticated, service_role;'), 'anon EXECUTE yok')
await sabotajli('DELETE tetiği eksik', (s) => s.replace(/create trigger on_site_settings_satis_kipi_del[\s\S]*?handle_supabase_webhook\(\);/, ''), '3 satis_kipi tetiği')
await sabotajli('bir RESTRICTIVE politika eksik', (s) => s.replace(/create policy site_settings_satis_kipi_yalniz_servis_upd[\s\S]*?with check \(key <> 'satis_kipi'\);/, ''), '2 RESTRICTIVE politika')

yaz(`\n${basarisiz === 0 ? 'SONUÇ: TÜM KONTROLLER GEÇTİ' : `SONUÇ: ${basarisiz} KONTROL KALDI`}`)
process.exit(basarisiz === 0 ? 0 : 1)
