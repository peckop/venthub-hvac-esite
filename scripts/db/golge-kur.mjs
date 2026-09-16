#!/usr/bin/env node
/**
 * GÖLGE VERİTABANI KURUCUSU — tek komutla, canlıya dokunmadan, geçerli test ortamı.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Recep (2026-09-16): *"sizin istediğiniz geçerli test ortamı için ben size her türlü izni
 * veririm. Sen bana kısıtları ve çözüm önerisini söyle ve yapalım."*
 *
 * ⛔**RESMİ YOL (`supabase db reset`) BİZİM ZİNCİRİMİZLE ÇALIŞMIYOR — ölçüldü 2026-09-16:**
 * 233 migration'ın **2'sinde** düşüyor (`202508241205_rpc_admin_orders.sql` →
 * `type "venthub_orders" does not exist`). O yol 1. dosyadan başlar; zincir orada kırık.
 * Yani engel izin DEĞİL, kendi zincirimiz.
 *
 * ⭐**ÇALIŞAN YOL: TABAN + SONRASI.** Baseline 1. dosyadan başlamıyor, bu yüzden kırık halkayı
 * hiç görmüyor. İki kez ölçüldü: 2026-09-15'te 8 ölçütte parite, 2026-09-16'da gölgede
 * **163 politika / 67 fonksiyon / 48 tetik canlıyla BİREBİR**.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ⛔İKİ SERT KURAL — İKİSİ DE SAHADA ÖĞRENİLDİ
 * ══════════════════════════════════════════════════════════════════════════════
 * 1. **`supabase db reset` BU BETİKTE YOK ve olmayacak.** 2026-09-16'da onu koşturdum ve
 *    **aynı kümedeki BAŞKA bir şeridin gölge veritabanını SİLDİ** (`arama_golge`, fikstür
 *    yüklenmek üzereydi). Küme tek makinede PAYLAŞILAN bir kaynaktır — `git stash` yığınıyla
 *    aynı sınıf. "Yalnız yerel" olması "yalnız BENİM" demek DEĞİLDİR.
 * 2. **VAR OLAN BİR VERİTABANI EZİLMEZ.** `--ad` ile verilen isim zaten varsa betik DURUR ve
 *    `--yeniden` istenmedikçe dokunmaz. Varsayılan ad `golge_<damga>` — çakışma üretmez.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NE YAPAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Docker'daki mevcut Supabase konteynerinin İÇİNDE ayrı bir veritabanı açar ve şu sırayı
 * uygular: önsöz → en yeni TAM taban → tabandan SONRAKİ migration'lar → (varsa) `--migration`.
 * `postgres` veritabanına **hiç dokunmaz**. `initdb`/`pg_ctl`/port yönetimi GEREKMEZ —
 * bu kısayol URUN'un ölçümünden geldi ve beş adımlık kendi tarifimden kısa.
 *
 * ⚠**SINIRLARI, ADIYLA — "gölgede koştu" ≠ "prod'da koşar":**
 * · `auth.uid()` gölgede **NULL** döner → bu ortam **ŞEMA/DDL** ölçümü içindir, **YETKİ
 *   DAVRANIŞI** ölçümü için DEĞİL. Politikanın doğru kişiyi engellediğini KANITLAMAZ.
 * · `pg_cron` kurulamaz (konteynerde yalnız `postgres` veritabanında olabiliyor) →
 *   `cron.schedule` çağrısı DÜŞER. Migration'ın o kolu koşullu/guard'lı olmalı.
 * · Önsöz ve taban **beklenen ortam/yetki hataları** üretir (ölçüldü: 1 + 9). Bunlar ŞEMA
 *   PARÇASI KAYBI DEĞİLDİR; betik sonunda sadakati SAYARAK doğrular.
 *
 * ÇIKIŞ KODLARI (sözleşme):
 *   0 = gölge kuruldu ve sadakat eşiklerini geçti
 *   1 = kuruldu AMA sadakat TUTMADI (eksik şema) — İHLAL
 *   2 = ÖLÇEMEDİ (Docker yok, konteyner yok, taban yok) — atlanmışla AYNI ŞEY DEĞİL
 *   3 = ad ÇAKIŞTI, hiçbir şeye dokunulmadı (akranın işi korundu)
 */

import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const AD = 'golge-kur'
const TABAN_DIZIN = path.join(KOK, 'supabase', 'baselines')
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const ONSOZ = path.join(TABAN_DIZIN, '00_golge_onsoz.sql')

function arg(ad, varsayilan) {
  const a = process.argv.slice(2)
  const i = a.findIndex((x) => x === `--${ad}` || x.startsWith(`--${ad}=`))
  if (i === -1) return varsayilan
  if (a[i].includes('=')) return a[i].split('=').slice(1).join('=')
  return a[i + 1] ?? varsayilan
}
const bayrak = (ad) => process.argv.slice(2).includes(`--${ad}`)

const KONTEYNER = arg('konteyner', 'supabase_db_venthub-hvac')
const EK_MIGRATION = arg('migration', null)
const YENIDEN = bayrak('yeniden')

/**
 * Varsayılan ad damgalıdır — ⭐GEREKÇE OLAYDIR: sabit bir ad kullanan betik, aynı kümede
 * çalışan bir akranın gölgesini ezer. 2026-09-16'da tam bu oldu (başka bir yolla).
 */
const DAMGA = execFileSync('node', ['-e', "process.stdout.write(String(Date.now()))"], {
  encoding: 'utf8',
}).trim()
const VERITABANI = arg('ad', `golge_${DAMGA}`)

/**
 * ⛔SQL KİMLİK ENJEKSİYONU — BU KONTROL BİR GÜVENLİK BULGUSUNDAN SONRA EKLENDİ (2026-09-16).
 *
 * Betiğin ilk hâlinde veritabanı adı doğrudan SQL'e gömülüyordu
 * (`create database "${VERITABANI}"`). Commit sonrası güvenlik taraması bunu
 * **`sql-identifier-injection`** olarak işaretledi ve HAKLIYDI: `--ad 'x"; drop database
 * postgres; --'` gibi bir değer, tırnağı kapatıp kendi komutunu ekleyebilirdi.
 *
 * ⭐NİÇİN PARAMETRE KULLANILAMAZ: PostgreSQL'de **kimlikler** (veritabanı/tablo/kolon adı)
 * `$1` ile parametrelenemez — yalnız DEĞERLER parametrelenir. Yani doğru çözüm kaçış değil,
 * **izin verilen karakter kümesini ÖNCEDEN daraltmaktır** (allowlist).
 *
 * Kural: yalnız küçük harf, rakam ve altçizgi; harf ya da altçizgi ile başlar; en çok 63
 * karakter (PostgreSQL'in `NAMEDATALEN-1` sınırı — daha uzun ad SESSİZCE kırpılır ve
 * "yarattığım DB" ile "sorguladığım DB" ayrışır).
 *
 * ⚠BU KOL BİR DERSİN DE KAYDI: betiği yazarken "ad zaten benim verdiğim bir şey" diye
 * düşündüm. Ama betik **başkası da koşturacak** diye tasarlandı (Recep'in "bir başkası
 * kursaydı çalışır mı" sınavı) — o an girdi artık BENİM girdim değildir.
 */
const AD_DESENI = /^[a-z_][a-z0-9_]{0,62}$/
if (!AD_DESENI.test(VERITABANI)) {
  console.error(`${AD}: REDDEDILDI — veritabani adi izin verilen bicimde DEGIL.`)
  console.error(`  verilen: ${JSON.stringify(VERITABANI).slice(0, 80)}`)
  console.error('  izin verilen: yalniz [a-z0-9_], harf/altcizgi ile baslar, en cok 63 karakter.')
  console.error('  SEBEP: SQL kimlikleri parametrelenemez; guvenli yol izin verilen kumeyi daraltmaktir.')
  process.exit(2)
}

function dur(kod, ...satirlar) {
  for (const s of satirlar) console.error(`${AD}: ${s}`)
  process.exit(kod)
}

/** Konteyner içinde SQL koşturur. `dur` = ON_ERROR_STOP değeri. */
function psql(sql, { db = VERITABANI, dur: durdur = false } = {}) {
  return spawnSync(
    'docker',
    ['exec', '-i', KONTEYNER, 'psql', '-U', 'postgres', '-d', db, '-v', `ON_ERROR_STOP=${durdur ? 1 : 0}`, '-c', sql],
    { encoding: 'utf8', timeout: 300_000 },
  )
}

/** Konteyner içinde bir DOSYAYI koşturur (stdin ile — dosya konteynere kopyalanmaz). */
function psqlDosya(dosya, { db = VERITABANI, dur: durdur = false } = {}) {
  return spawnSync(
    'docker',
    ['exec', '-i', KONTEYNER, 'psql', '-U', 'postgres', '-d', db, '-v', `ON_ERROR_STOP=${durdur ? 1 : 0}`],
    { encoding: 'utf8', input: fs.readFileSync(dosya, 'utf8'), timeout: 900_000 },
  )
}

function tekDeger(sql, db = VERITABANI) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', KONTEYNER, 'psql', '-U', 'postgres', '-d', db, '-tAc', sql],
    { encoding: 'utf8', timeout: 120_000 },
  )
  return (r.stdout ?? '').trim()
}

/**
 * ⭐TAM/KISMİ TABAN AYRIMI İÇERİKLE YAPILIR, DOSYA ADIYLA DEĞİL.
 * 2026-09-14'te bu klasörden "en yeni" dosya alınıp taban sanıldı; o dosya `pg_dump` değildi.
 * Ölçülmüş ayırt edici: tam döküm RLS politikası taşır (06-12 → 101, 09-15 → 163), kısmi
 * olan taşımaz (08-13 → 0).
 */
function enYeniTamTaban() {
  const adaylar = fs
    .readdirSync(TABAN_DIZIN)
    .filter((d) => /^\d{4}-\d{2}-\d{2}_public_schema\.sql$/.test(d))
    .filter((d) => /create\s+policy/i.test(fs.readFileSync(path.join(TABAN_DIZIN, d), 'utf8')))
    .sort()
  return adaylar.at(-1) ?? null
}

/** Migration damgası → `YYYY-MM-DD`. Sahada ÜÇ biçim var: 14, 12 ve 8 hane (ölçüldü). */
function migrationTarihi(dosya) {
  const m = /^(\d{8})(\d{4}|\d{6})?_/.exec(dosya)
  return m ? `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}` : null
}

// ── ÖN KOŞULLAR ──────────────────────────────────────────────────────────────
if (spawnSync('docker', ['--version'], { encoding: 'utf8' }).status !== 0) {
  dur(2, 'OLCEMEDI — docker bulunamadi.')
}
const ayakta = spawnSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' })
if (ayakta.status !== 0 || !(ayakta.stdout ?? '').includes(KONTEYNER)) {
  dur(
    2,
    `OLCEMEDI — konteyner AYAKTA DEGIL: ${KONTEYNER}`,
    'Docker Desktop motoru kapali olabilir, ya da yigin hic baslatilmamis.',
  )
}

// ── --dusur: YALNIZ KENDI VERITABANINI DUSUR (reset'in YERINE) ───────────────
/**
 * ⛔NİÇİN VAR — 2026-09-16 OLAYI: gölgeyi tazelemek için `supabase db reset` koştum.
 * O komut TEK BİR veritabanını sıfırlamıyor; **aynı kümedeki BAŞKA veritabanlarını da
 * siliyor** ve URUN'un `arama_golge`'sini iş ortasında uçurdu. Küme, git stash yığını
 * ile aynı sınıfta **paylaşılan kaynaktır**; "yalnız yerel" demek "yalnız benim" demek
 * değildir.
 *
 * Bu bayrak o komutun yerine geçer: **yalnız adı verilen veritabanını** düşürür ve
 * küme düzeyinde hiçbir şeye dokunmaz. Betiğin tamamında `db reset` GEÇMEZ.
 *
 * ⭐KORUMA: küme altyapısına ait adlar (`postgres`, `_supabase`, `template*`) REDDEDİLİR.
 * Sebep: bu betik başkası da koşturacak diye tasarlandı; o an girdi benim girdim değildir.
 */
if (bayrak('dusur')) {
  const KORUMALI = new Set(['postgres', '_supabase', 'template0', 'template1'])
  if (KORUMALI.has(VERITABANI)) {
    dur(
      2,
      `REDDEDILDI — "${VERITABANI}" kume altyapisi, golge DEGIL. Hicbir seye dokunulmadi.`,
      'Yalnizca kendi golgenin adini ver: --dusur --ad <golge-adi>',
    )
  }
  const varMi = tekDeger(
    `select count(*) from pg_database where datname = '${VERITABANI.replace(/'/g, "''")}'`,
    'postgres',
  )
  if (varMi === '0') {
    console.log(`${AD}: "${VERITABANI}" YOK — dusurulecek bir sey yok.`)
    process.exit(0)
  }
  const d = psql(`drop database "${VERITABANI}"`, { db: 'postgres', dur: true })
  if (d.status !== 0) {
    dur(1, `DUSURULEMEDI: ${String(d.stderr).slice(0, 200)}`)
  }
  console.log(`${AD}: DUSURULDU -> ${VERITABANI} (kume duzeyinde hicbir seye dokunulmadi)`)
  process.exit(0)
}
if (!fs.existsSync(ONSOZ)) dur(2, `OLCEMEDI — onsoz YOK: ${path.relative(KOK, ONSOZ)}`)
const tabanAd = enYeniTamTaban()
if (!tabanAd) {
  dur(2, 'OLCEMEDI — TAM taban bulunamadi (hicbir dosyada create policy gecmiyor).')
}
const tabanTarih = tabanAd.slice(0, 10)

// ── AD ÇAKIŞMASI — AKRANIN İŞİ KORUNUR ───────────────────────────────────────
const mevcut = tekDeger(
  `select count(*) from pg_database where datname = '${VERITABANI.replace(/'/g, "''")}'`,
  'postgres',
)
if (mevcut !== '0') {
  if (!YENIDEN) {
    dur(
      3,
      `AD CAKISTI: "${VERITABANI}" ZATEN VAR — hicbir seye DOKUNULMADI.`,
      'Baska bir seridin golgesi olabilir; ezmek isini silmek demektir (2026-09-16 da yasandi).',
      'Cozum: --ad <baska-ad> ver, ya da GERCEKTEN eziyorsan --yeniden ekle.',
    )
  }
  console.log(`${AD}: "${VERITABANI}" DUSURULUYOR (--yeniden verildi)`)
  psql(`drop database if exists "${VERITABANI}"`, { db: 'postgres' })
}

// ── KURULUM ──────────────────────────────────────────────────────────────────
console.log(`${AD}: konteyner ${KONTEYNER} · veritabani ${VERITABANI} · taban ${tabanAd}`)
const yarat = psql(`create database "${VERITABANI}"`, { db: 'postgres', dur: true })
if (yarat.status !== 0) {
  dur(2, `OLCEMEDI — veritabani yaratilamadi: ${String(yarat.stderr).slice(0, 200)}`)
}

/**
 * ⚠ONSOZ ve TABAN `ON_ERROR_STOP=0` ile koşar ve bu BİLİNÇLİ: ikisi de konteynerde
 * BEKLENEN ortam/yetki hataları üretir (ölçüldü 2026-09-16: önsöz 1, taban 9 — hepsi
 * `create extension in database postgres`, `pg_read_file` izni, `publication does not exist`
 * sınıfı). Bunlar şema parçası kaybı DEĞİLDİR. Kanıt, hata sayısı değil, SONDAKİ SAYIMDIR.
 */
const asamalar = [
  { ad: 'onsoz', dosya: ONSOZ, durdur: false },
  { ad: 'taban', dosya: path.join(TABAN_DIZIN, tabanAd), durdur: false },
]

const sonrakiler = fs
  .readdirSync(MIG_DIZIN)
  .filter((d) => d.endsWith('.sql'))
  .filter((d) => {
    const t = migrationTarihi(d)
    return t !== null && t > tabanTarih
  })
  .sort()
for (const d of sonrakiler) {
  asamalar.push({ ad: `migration ${d}`, dosya: path.join(MIG_DIZIN, d), durdur: true })
}
if (EK_MIGRATION) {
  const p = path.isAbsolute(EK_MIGRATION) ? EK_MIGRATION : path.join(KOK, EK_MIGRATION)
  if (!fs.existsSync(p)) dur(2, `OLCEMEDI — --migration dosyasi YOK: ${EK_MIGRATION}`)
  asamalar.push({ ad: `EK migration ${path.basename(p)}`, dosya: p, durdur: true })
}

let hataSayisi = 0
for (const a of asamalar) {
  const r = psqlDosya(a.dosya, { durdur: a.durdur })
  const hata = ((r.stdout ?? '') + (r.stderr ?? '')).match(/^(ERROR|psql:.*ERROR)/gim) ?? []
  hataSayisi += hata.length
  const durum = r.status === 0 ? 'OK' : 'DUSTU'
  console.log(`${AD}: ${a.ad} -> ${durum}${hata.length ? ` (hata ${hata.length})` : ''}`)
  if (a.durdur && r.status !== 0) {
    console.error(`${AD}: ${a.ad} DUSTU — ilk hata:`)
    console.error(
      '  ' +
        (((r.stderr ?? '') + (r.stdout ?? '')).split('\n').find((s) => /ERROR/i.test(s)) ?? '').slice(0, 300),
    )
    dur(1, `IHLAL — zorunlu asama dustu: ${a.ad}. Golge AYAKTA birakildi (inceleyebilirsin): ${VERITABANI}`)
  }
}

// ── SADAKAT SAYIMI — kanıt hata sayısı DEĞİL, BU ─────────────────────────────
const say = (sql) => Number(tekDeger(sql) || '0')
const olcum = {
  tablo: say(`select count(*) from pg_tables where schemaname='public'`),
  politika: say(`select count(*) from pg_policies where schemaname='public'`),
  fonksiyon: say(
    `select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'`,
  ),
  tetik: say(`select count(*) from pg_trigger where not tgisinternal`),
  indeks: say(`select count(*) from pg_indexes where schemaname='public'`),
}

console.log(
  `${AD}: SADAKAT · tablo ${olcum.tablo} · politika ${olcum.politika} · fonksiyon ${olcum.fonksiyon} · tetik ${olcum.tetik} · indeks ${olcum.indeks}`,
)
console.log(`${AD}: beklenen ortam/yetki hatasi toplami ${hataSayisi} (sema kaybi DEGIL — sayim ustte)`)

/**
 * ⭐EŞİKLER "BOŞ GÖLGEYİ REDDETMEK" İÇİNDİR, birebir parite iddiası DEĞİL.
 * Gerekçe ölçülmüş: 2026-08-13 dökümü tablo listesi taşıyordu ama politika/indeks/FK'si
 * SIFIRDI ve aylarca taban sanıldı. Eşik o sınıfı yakalar.
 */
const ESIK = { tablo: 50, politika: 100, fonksiyon: 40, tetik: 20, indeks: 100 }
const ihlaller = Object.entries(ESIK)
  .filter(([k, v]) => olcum[k] < v)
  .map(([k, v]) => `${k} ${olcum[k]} < esik ${v}`)

if (ihlaller.length > 0) {
  console.error(`${AD}: IHLAL ${ihlaller.length} — golge EKSIK kuruldu:`)
  for (const i of ihlaller) console.error(`  - ${i}`)
  dur(1, `Golge AYAKTA birakildi (inceleyebilirsin): ${VERITABANI}`)
}

console.log(`${AD}: GOLGE HAZIR -> ${VERITABANI}`)
console.log(
  `${AD}: baglanti: docker exec -it ${KONTEYNER} psql -U postgres -d ${VERITABANI}`,
)
console.log(`${AD}: silmek icin: docker exec ${KONTEYNER} psql -U postgres -c 'drop database "${VERITABANI}"'`)
console.log(
  `${AD}: ⚠SINIR: auth.uid() burada NULL — YETKI DAVRANISI olculmez, yalniz SEMA/DDL. pg_cron YOK.`,
)
process.exit(0)
