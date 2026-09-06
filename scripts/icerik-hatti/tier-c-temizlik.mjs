#!/usr/bin/env node
/**
 * scripts/icerik-hatti/tier-c-temizlik.mjs — REC-155 B
 *
 * NIÇIN VAR: canlı vitrinde 187 ürün ve 11 aile, açıklama alanında ŞU iç notu taşıyor:
 *   "Avensair 2026 fiyat listesinden aktarılan temel ürün (Tier C)."
 *   "Basic product imported from Avensair 2026 price list (Tier C)."
 * Bu müşteri metni değil, içeri dönük kademe etiketidir. 2026-09-06'da venthub.com.tr üzerinde
 * doğrulandı: ürün sayfasında "Ürün Açıklaması" başlığı altında görünüyor.
 * Vaat bütünlüğü cetveli (docs/standards/vaat-butunlugu-standard.md) ve K7 gereği
 * kaynağı olmayan alan METIN TASIMAZ, BOŞ KALIR. Bu betik o alanları boşaltır.
 *
 * BU BETIK YAZMAZ (varsayılan). --yaz verilmedikçe yalnız SAYAR ve rapor üretir.
 * KOŞAN: OPS (prod yazımı ayrı el — rogue-subagent-prod-write dersi).
 *
 * ÖLÇÜLMÜŞ EVREN (2026-09-06, canlı DB):
 *   products.description_i18n        187 / 375   (tr ve en AYNI kümede, ikisi de desenli)
 *   product_families.description      11 /  40
 *   Taranıp SIFIR çıkan yerler: categories.description, categories.metadata,
 *   product_families.meta_title, product_families.meta_description, products.name.
 *   Yani evren bu iki alandan ibarettir — tahmin değil, ölçüm.
 *
 * ⚠ RENDER/ÖNBELLEK — İŞ BU BETİKLE BİTMEZ:
 *   docs/standards/rendering-cache-standard.md: statik vitrin sayfasında görünen her tablonun
 *   DB tetiği + webhook handler dalı olmalı. Bu UPDATE'ten sonra ürün ve aile sayfaları
 *   TAZELENMEZSE eski metin sayfada kalmaya devam eder — "DB değişti, vitrin değişmedi"
 *   tam olarak 2026-08-15'te 1044 fiyat satırında yaşanan hatadır.
 *   Yazımdan sonra ilgili yüzeylerin revalidate edildiği AYRICA doğrulanmalı (URUN şeridi).
 *
 * KULLANIM:
 *   node scripts/icerik-hatti/tier-c-temizlik.mjs                 # kuru koşu (varsayılan)
 *   node scripts/icerik-hatti/tier-c-temizlik.mjs --yaz           # GERÇEK YAZIM
 *   node scripts/icerik-hatti/tier-c-temizlik.mjs --yaz --zorla   # beklenen sayı tutmasa da yaz
 *   --cikti <yol>   rapor/yedek dosyası (varsayılan: tier-c-temizlik-<damga>.json)
 *
 * ENV: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (anon anahtar YETMEZ, RLS yazmayı durdurur)
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

/** Kaldırılacak metnin imzası. Tam eşitlik ARANMAZ (baştaki/sondaki boşluk, ufak varyant olabilir),
 *  ama desen DAR tutulur: "Tier C" tek başına yetmez, cümlenin kendisi aranır. */
const DESEN = /Tier C/i
const IMZA_TR = 'fiyat listesinden aktarılan temel ürün'
const IMZA_EN = 'imported from Avensair'

/** Ölçülmüş beklenen sayılar (ilk koşum, 2026-09-06). Bulunan sayı bunlardan FAZLAysa evren
 *  büyümüş demektir ve betik DURUR (--zorla ile geçilir). AZ ise iş kısmen yapılmış demektir;
 *  0 ise zaten temizdir — ikisi de hata DEĞİLDİR (ilk koşumda öyle sayılıyordu, düzeltildi).
 *  Niçin sapma kapısı var: "düşen 0" yetmez, beklenen küme listede mi — bkz.
 *  var-olmayan-kapi-pending-gorunmez. */
const BEKLENEN = { urun: 187, aile: 11 }

/** BOŞ DEĞER TABLOSU — ŞEMADAN ÖLÇÜLDÜ, VARSAYILMADI (2026-09-06).
 *  İlk sürüm iki alana da `null` yazıyordu; `product_families.description` NOT NULL olduğu için
 *  11 ailenin hepsi "violates not-null constraint" ile düştü, ürün tarafı (nullable) geçti.
 *  Hata bendeydi: şemayı ölçmeden varsaydım. Ölçüm:
 *    products.description_i18n        jsonb, NULLABLE,  varsayılan yok      -> boş = null
 *    product_families.description     jsonb, NOT NULL,  varsayılan '{}'     -> boş = {}
 *  Kolonun KENDİ varsayılanı `{}` — doğru boş değeri şema zaten söylüyordu. */
const BOS = { urun: null, aile: {} }

const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i > -1 ? process.argv[i + 1] : undefined
}
const bayrak = (ad) => process.argv.includes(ad)

const YAZ = bayrak('--yaz')
const ZORLA = bayrak('--zorla')
const damga = new Date().toISOString().replace(/[:.]/g, '-')
const CIKTI = arg('--cikti') || `tier-c-temizlik-${damga}.json`

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const anahtar = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anahtar) {
  console.error('ONKOSUL-HATASI: VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.')
  console.error('  anon anahtar KABUL EDILMEZ — RLS yazmayi sessizce durdurur ve betik "0 satir')
  console.error('  guncellendi" der; bu basari gibi gorunen bir basarisizliktir.')
  process.exit(2)
}

const db = createClient(url, anahtar, { auth: { persistSession: false } })

/** Bir i18n objesinden desenli anahtarları çıkarır. Hepsi düşerse alanın ŞEMAYA UYGUN boş
 *  değeri döner (`bosDeger`) — bkz. BOS tablosu; tek bir "null" her iki tabloya uymaz. */
function temizlenmis(obj, bosDeger) {
  if (!obj || typeof obj !== 'object') return { yeni: bosDeger, dusen: [] }
  const yeni = {}
  const dusen = []
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && DESEN.test(v)) dusen.push(k)
    else yeni[k] = v
  }
  return { yeni: Object.keys(yeni).length ? yeni : bosDeger, dusen }
}

async function tumSayfalar(tablo, alanlar, filtre) {
  const hepsi = []
  const boy = 1000
  for (let bas = 0; ; bas += boy) {
    let q = db.from(tablo).select(alanlar).range(bas, bas + boy - 1)
    q = filtre(q)
    const { data, error } = await q
    if (error) throw new Error(`${tablo} okunamadi: ${error.message}`)
    hepsi.push(...data)
    if (data.length < boy) break
  }
  return hepsi
}

const rapor = {
  _ne: 'REC-155 B — "Tier C" ic kademe notunun musteriye gorunen aciklama alanlarindan temizlenmesi',
  _kip: YAZ ? 'YAZIM' : 'KURU KOSU (hicbir sey yazilmadi)',
  _damga: new Date().toISOString(),
  _beklenen: BEKLENEN,
  _imza: { tr: IMZA_TR, en: IMZA_EN, desen: String(DESEN) },
  _geri_alma:
    'YEDEK bu dosyadadir: her kaydin onceki degeri "onceki" alaninda durur. Geri almak icin ' +
    'ayni id ye o degeri yazmak yeterlidir; betigin geri-alma kipi YOKTUR (bilerek — geri alma ' +
    'elle ve gozle yapilir).',
  urunler: [],
  aileler: [],
  ozet: {},
}

// ---------------------------------------------------------------- 1) ÜRÜNLER
const urunler = await tumSayfalar('products', 'id, slug, name, description_i18n', (q) =>
  q.like('description_i18n->>tr', '%Tier C%'),
)
// tr'de desen yoksa ama en'de varsa da yakala (olculdu: ayni kume, yine de korumali)
const urunlerEn = await tumSayfalar('products', 'id, slug, name, description_i18n', (q) =>
  q.like('description_i18n->>en', '%Tier C%'),
)
const urunHarita = new Map()
for (const u of [...urunler, ...urunlerEn]) urunHarita.set(u.id, u)

// ---------------------------------------------------------------- 2) AİLELER
// NOT: .or() icinde jsonb ok operatoru (`description->>tr`) kullanmaktan KACINILDI —
// ortam anahtari bende olmadigi icin bu betigi kuru kosuyla DENEYEMEDIM, ve deneyemedigim
// sozdizimini betige koymam. Iki ayri sorgu + birlestirme ayni sonucu verir, riski yoktur.
const aileTr = await tumSayfalar('product_families', 'id, slug, name, description', (q) =>
  q.is('deleted_at', null).like('description->>tr', '%Tier C%'),
)
const aileEn = await tumSayfalar('product_families', 'id, slug, name, description', (q) =>
  q.is('deleted_at', null).like('description->>en', '%Tier C%'),
)
const aileHarita = new Map()
for (const a of [...aileTr, ...aileEn]) aileHarita.set(a.id, a)
const aileler = [...aileHarita.values()]

console.log(`BULUNAN — urun ${urunHarita.size} (beklenen ${BEKLENEN.urun}) · ` +
            `aile ${aileler.length} (beklenen ${BEKLENEN.aile})`)

// SAPMA KAPISI — YÖN AYRIMI YAPAR (ilk surumde yapmiyordu, duzeltildi):
//   bulunan > beklenen  -> evren BUYUMUS, bilmedigimiz kayit var  -> DUR
//   bulunan < beklenen  -> is kismen yapilmis (ornegin urun gecti, aile dustu) -> DEVAM, bilgi ver
//   bulunan = 0         -> zaten temiz -> yapilacak yok, BASARIYLA cik
// Niçin: ikinci kosumda 0 bulmak BEKLENEN sonuctur; ilk surum bunu "sapma" sayip --zorla
// istiyordu ve temiz bir veritabaninda basarisiz gibi gorunuyordu.
const fazla = urunHarita.size > BEKLENEN.urun || aileler.length > BEKLENEN.aile
const eksik = urunHarita.size < BEKLENEN.urun || aileler.length < BEKLENEN.aile
const sapma = fazla || eksik

if (urunHarita.size === 0 && aileler.length === 0) {
  console.log('TEMIZ — desen eslesen kayit YOK, yapilacak is yok.')
  rapor.ozet = { urun_bulunan: 0, aile_bulunan: 0, urun_yazilan: 0, aile_yazilan: 0, sapma: false,
                 sonuc: 'zaten temiz' }
  writeFileSync(CIKTI, JSON.stringify(rapor, null, 1), 'utf8')
  console.log(`RAPOR -> ${CIKTI}`)
  process.exit(0)
}
if (fazla) {
  console.warn('⚠ BEKLENENDEN FAZLA kayit bulundu — evren buyumus, bilmedigimiz kayitlar var.')
  console.warn('  Bu bir hata DEGIL, bir SORU: aradan yeni urun mu eklendi?')
  if (YAZ && !ZORLA) {
    console.error('YAZIM DURDURULDU. Sayiyi dogrulayip --zorla ile tekrar kosun.')
    process.exit(3)
  }
} else if (eksik) {
  console.log('bilgi: beklenenden AZ kayit var — is kismen yapilmis olabilir. Yazim DEVAM EDIYOR.')
}

// ---------------------------------------------------------------- 3) PLAN / YAZIM
let urunYazilan = 0
for (const u of urunHarita.values()) {
  const { yeni, dusen } = temizlenmis(u.description_i18n, BOS.urun)
  rapor.urunler.push({ id: u.id, slug: u.slug, dusen_anahtar: dusen, onceki: u.description_i18n, yeni })
  if (!YAZ) continue
  const { error } = await db.from('products').update({ description_i18n: yeni }).eq('id', u.id)
  if (error) console.error(`  URUN YAZILAMADI ${u.slug}: ${error.message}`)
  else urunYazilan++
}

let aileYazilan = 0
for (const a of aileler) {
  const { yeni, dusen } = temizlenmis(a.description, BOS.aile)
  rapor.aileler.push({ id: a.id, slug: a.slug, dusen_anahtar: dusen, onceki: a.description, yeni })
  if (!YAZ) continue
  const { error } = await db.from('product_families').update({ description: yeni }).eq('id', a.id)
  if (error) console.error(`  AILE YAZILAMADI ${a.slug}: ${error.message}`)
  else aileYazilan++
}

rapor.ozet = {
  urun_bulunan: urunHarita.size,
  aile_bulunan: aileler.length,
  urun_yazilan: urunYazilan,
  aile_yazilan: aileYazilan,
  sapma,
}

writeFileSync(CIKTI, JSON.stringify(rapor, null, 1), 'utf8')
console.log(`RAPOR/YEDEK -> ${CIKTI}`)

if (!YAZ) {
  console.log('\nKURU KOSU — hicbir sey yazilmadi. Gercek yazim icin: --yaz')
  process.exit(0)
}

// ---------------------------------------------------------------- 4) YAZIM SONRASI ÖLÇÜM
const { count: kalanUrun } = await db
  .from('products').select('id', { count: 'exact', head: true }).like('description_i18n->>tr', '%Tier C%')
const { count: kalanAile } = await db
  .from('product_families').select('id', { count: 'exact', head: true })
  .is('deleted_at', null).like('description->>tr', '%Tier C%')

console.log(`YAZILDI — urun ${urunYazilan}/${urunHarita.size} · aile ${aileYazilan}/${aileler.length}`)
console.log(`YAZIM SONRASI KALAN — urun ${kalanUrun} · aile ${kalanAile} (ikisi de 0 OLMALI)`)
if (kalanUrun || kalanAile) {
  console.error('⛔ KALAN VAR — yazim EKSIK. Rapor dosyasindaki hatalara bakin.')
  process.exit(4)
}
console.log('\n⚠ SIRADAKI ADIM BU BETIGIN ISI DEGIL: vitrin TAZELENMELI.')
console.log('  DB degisti; ilgili urun/aile sayfalari revalidate edilmezse ESKI METIN SAYFADA KALIR.')
console.log('  rendering-cache-standard.md · dogrulama URUN seridinde.')
