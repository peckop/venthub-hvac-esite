#!/usr/bin/env node
/**
 * UYDURMA KİMLİĞİ TEK KURALA GETİRİR — REC-226 / REC-272 / REC-275
 *
 * ⚠BU BETİK İKİ KEZ TASARIM DEĞİŞTİRDİ, ikisi de ölçümle. Sırayı yazıyorum ki gerekçe kaybolmasın:
 *   1. "kaynaktan kod TÜRET"  → 58 belge tarandı, türetilecek kod YOK. Kapandı.
 *   2. "model_code'u BOŞALT"  → yetmedi: üç yüzey `sku`'ya düşüyordu. URUN onardı.
 *   3. (bu hâl) "kimliği TEK KURALA getir" → sku + slug + model_code birlikte.
 *
 * ── SORUN (t119 §3-B3, canlıda doğrulandı)
 * Canlıda aktif, müşteriye görünen 5 gerçek ürünün kodu UYDURMA. Kaynak sayfada KOD sütunu var,
 * bu beş satırın hücresi BOŞ, çıkarım boşluğu ardışık sayıyla (16076–16080) doldurmuş.
 * Ürünler gerçek — "CA IL 4020" sayfada geçiyor; kodlar geçmiyor.
 * Uydurma sayı ÜÇ alana birden bulaşmış: `sku`, `model_code`, `slug`.
 *
 * ── NİÇİN "TÜRET" DEĞİL (Recep emri "türet"ti; ölçüm emri karşılayamadı)
 * Kaynak dizinindeki 58 belgenin tamamı tarandı: "CA IL 4020..8060" YALNIZ avensair s.26'da
 * (+ s.4 içindekiler). Türetilecek üretici kodu ELDE YOK; oradan kod üretmek uydurmayı
 * TEKRARLAMAK olurdu. ⛔Vortice seçim aracının URL'indeki sayı (`29803`) kod SAYILMAZ — araç içi
 * kayıt numarası, ticari sipariş kodu olduğu kanıtlanmadı (URUN'ün uyarısı).
 *
 * ── UYGULANAN KURAL: `kimlik-kurali.mjs` (TEK KAYNAK)
 * Kural burada DEĞİL, ortak modülde yaşar; `kademe2-load/load.mjs` de aynı modülü kullanır.
 * OPS hükmü: "iki yerde iki kural yasak". Kod yoksa kimlik ADDAN türer:
 *     sku = VRT-CA-IL-4020-ES-RECT · slug = vortice-ca-il-4020-es-rect · model_code = null
 * Biçim ÖLÇÜLDÜ: 442 üründen 434'ü yükleyicinin tireli kuralına uyuyor; uymayan 8'in hepsi ENKEC
 * (`AVE-ENKEC155`). Yani tireli biçim kanonik, ENKEC istisna — ilk önerim istisnayı desen sanmıştı.
 *
 * ── ⛔İKİ ÖN KOŞUL, betik ikisini de KENDİ ölçer ve karşılanmadıkça CANLIYA YAZMAZ
 * (1) ÜÇ YÜZEYDE `sku` YEDEĞİ KALMAMALI. `productHelpers.ts`'in kendi kuralı: "`sku`'ya düşmek
 *     YASAK". `pdfGenerator:204`, `jsonld:86`, `VariantSelector:68` bunu yapıyordu ve yedek
 *     bugüne dek HİÇ çalışmamıştı (her üründe model_code doluydu) — kusur latentti. URUN onardı;
 *     kapı yine de ölçer, çünkü geri gelebilir.
 * (2) YENİ KİMLİK BENZERSİZ OLMALI. Ad-temelli SKU/slug ÇAKIŞABİLİR (URUN'ün uyarısı). Çakışmada
 *     doğru davranış satırı ATLAYIP adıyla raporlamaktır; sessizce üstüne yazmak uydurma koddan
 *     daha kötü bir kusur üretir.
 *
 * ⛔FİYATA DOKUNMAZ. (Ölçüldü ve kayda geçti: `products.price` null ama fiyat `product_prices`'ta
 * ZATEN var — 5 ürün × 3 liste, aktif, `is_derived`, kaynakla tutuyor. Fiyat kolunda iş yok.)
 *
 * SLUG değişimi eski adresi kırar; URUN kalıcı yönlendirmeyi AYNI GÜN indirir (üzerinde anlaşıldı).
 *
 * İKİ ANAHTARLI YAZMA: `--yaz` VE `CANLI_YAZIM_ONAYI`. Varsayılan KURU KOŞUM.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { kimlikTuret } from './kimlik-kurali.mjs'

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

const DIZIN = process.env.KAYNAK_DIZINI
  || join(homedir(), 'venthub-pdf-ingestor', 'kaynak-dizini', 'sayfalar.jsonl')
const REPO = process.env.VENTHUB_REPO || join(homedir(), 'venthub-hvac')

const HEDEF = ['VRT-16076', 'VRT-16077', 'VRT-16078', 'VRT-16079', 'VRT-16080']

// ── ÖN KOŞUL 1: üç yüzeyde `sku` yedeği
const YUZEYLER = [
  ['src/lib/pdfGenerator.ts', /model_code\s*\|\|\s*\w*\.?sku/],
  ['src/lib/seo/jsonld.ts', /model_code\s*\?\?\s*\w*\.?sku/],
  ['src/components/products/VariantSelector.tsx', /model_code\s*\|\|\s*\w*\.?sku/],
]
const kalanYedek = []
for (const [yol, desen] of YUZEYLER) {
  let icerik
  try { icerik = readFileSync(join(REPO, yol), 'utf8') }
  catch { kalanYedek.push(`${yol} (OKUNAMADI — fail-closed, var sayiliyor)`); continue }
  if (desen.test(icerik)) kalanYedek.push(yol)
}

// ── Kaynak: kodun GERÇEKTEN olmadığını doğrula (kimliği değiştirmenin gerekçesi bu)
let sayfaMetni = null
try {
  for (const satir of readFileSync(DIZIN, 'utf8').split(/\r?\n/)) {
    if (!satir.trim()) continue
    const o = JSON.parse(satir)
    if (String(o.dosya || '').includes('avens_fiyat') && o.sayfa === 26) { sayfaMetni = o.metin || ''; break }
  }
} catch (e) { console.error(`⛔ kaynak dizini okunamadi: ${DIZIN}\n   ${e.message}`); process.exit(1) }
if (sayfaMetni == null) { console.error('⛔ kaynak sayfa bulunamadi — fail-closed'); process.exit(1) }

// ── Canlı evren (kesin sayı ile doğrulanır; benzersizlik bunun üzerinde ölçülür)
const sayimR = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const kesin = Number((sayimR.headers.get('content-range') || '').split('/')[1])
if (!Number.isInteger(kesin)) { console.error('⛔ kesin sayi alinamadi — fail-closed'); process.exit(1) }
const hepsi = []
for (let off = 0; ; off += 1000) {
  const b = await (await fetch(`${U}/rest/v1/products?select=id,sku,slug,name,brand,model_code&order=sku&limit=1000&offset=${off}`, { headers: H })).json()
  if (!Array.isArray(b)) { console.error('⛔ dizi donmedi'); process.exit(1) }
  hepsi.push(...b); if (b.length < 1000) break
}
if (hepsi.length !== kesin) { console.error(`⛔ cekilen ${hepsi.length} ≠ sunucu ${kesin} — fail-closed`); process.exit(1) }

const degisecek = [], atlanan = []
for (const sku of HEDEF) {
  const x = hepsi.find(y => y.sku === sku)
  if (!x) { atlanan.push({ sku, sebep: 'canlida bulunamadi' }); continue }

  const kod = x.model_code == null ? '' : String(x.model_code).trim()
  // ⭐GEREKÇE KANITI: kod kaynakta GEÇMİYOR olmalı. Geçiyorsa gerçek olabilir -> DOKUNMA.
  if (kod && sayfaMetni.includes(kod)) { atlanan.push({ sku, sebep: `"${kod}" kaynakta GECIYOR — uydurma degil, dokunulmaz` }); continue }

  // Kod uydurma olduğu için YOK sayılır; kimlik ADDAN türetilir (tek kural).
  const onek = String(x.sku).split('-')[0]
  const yeni = kimlikTuret({ onek, ad: x.name, marka: x.brand, model_code: null })
  if (!yeni) { atlanan.push({ sku, sebep: 'ad bos — kimlik uretilemedi' }); continue }

  if (yeni.sku === x.sku && yeni.slug === x.slug && kod === '') { atlanan.push({ sku, sebep: 'zaten kurala uygun (idempotent)' }); continue }

  // ⭐ÖN KOŞUL 2: benzersizlik. Çakışmada SESSİZCE ÜSTÜNE YAZMA — atla ve adıyla söyle.
  const skuCakisan = hepsi.find(y => y.sku === yeni.sku && y.id !== x.id)
  if (skuCakisan) { atlanan.push({ sku, sebep: `CAKISMA: sku ${yeni.sku} zaten ${skuCakisan.sku}/${skuCakisan.name} icin var` }); continue }
  const slugCakisan = hepsi.find(y => y.slug === yeni.slug && y.id !== x.id)
  if (slugCakisan) { atlanan.push({ sku, sebep: `CAKISMA: slug ${yeni.slug} zaten ${slugCakisan.sku} icin var` }); continue }
  // aynı koşum içinde üretilenler arasında da çakışma olmamalı
  const ictenCakisan = degisecek.find(d => d.yeni.sku === yeni.sku || d.yeni.slug === yeni.slug)
  if (ictenCakisan) { atlanan.push({ sku, sebep: `CAKISMA: ayni kosumda ${ictenCakisan.x.sku} ile ayni kimlik` }); continue }

  degisecek.push({ x, yeni, eskiKod: kod })
}

console.log(`KAYNAK     : avens s.26 (${sayfaMetni.length} karakter)`)
console.log(`CANLI      : ${hepsi.length} urun (kesin sayi ile dogrulandi)`)
console.log(`DEGISECEK  : ${degisecek.length} / ${HEDEF.length}\n`)
for (const { x, yeni, eskiKod } of degisecek) {
  console.log(`  ${x.sku}`)
  console.log(`     sku        : ${x.sku}  ->  ${yeni.sku}`)
  console.log(`     slug       : ${x.slug}  ->  ${yeni.slug}`)
  console.log(`     model_code : ${JSON.stringify(eskiKod || null)}  ->  null   (kaynakta GECMIYOR = uydurma)`)
  console.log(`     kimlik kaynagi: ${yeni.kaynak} · confidence ${yeni.confidence}`)
}
if (atlanan.length) {
  console.log(`\n⚠ATLANAN — betik bilerek durdu:`)
  for (const a of atlanan) console.log(`  ${a.sku.padEnd(12)} ${a.sebep}`)
}

console.log(`\n── ON KOSUL 1: uc yuzeydeki \`sku\` yedegi`)
if (kalanYedek.length) {
  console.log(`  ⛔KARSILANMADI — ${kalanYedek.length} yuzey hala sku'ya dusuyor:`)
  for (const y of kalanYedek) console.log(`     ${y}`)
  console.log(`  Cetvel (productHelpers.ts): "sku'ya dusmek YASAK".`)
} else {
  console.log(`  ✓ KARSILANDI — hicbir yuzey sku'ya dusmuyor.`)
}
console.log(`── ON KOSUL 2: benzersizlik — ${degisecek.length} yeni kimlik, cakisma ${atlanan.filter(a => a.sebep.startsWith('CAKISMA')).length}`)

const yaz = process.argv.includes('--yaz')
const onay = process.env.CANLI_YAZIM_ONAYI
if (!yaz) { console.log('\nKURU KOSUM — hicbir sey yazilmadi.'); process.exit(0) }
if (kalanYedek.length) { console.error('\n⛔ YAZIM REDDEDILDI: on kosul 1 karsilanmadi.'); process.exit(1) }
if (!onay) { console.error('\n⛔ YAZIM REDDEDILDI: CANLI_YAZIM_ONAYI yok (Recep\'in KENDI sozu).'); process.exit(1) }
if (!degisecek.length) { console.log('\nYAZILACAK KAYIT YOK.'); process.exit(0) }

console.log(`\nCANLIYA YAZILIYOR (onay: ${onay}) — ${degisecek.length} urun`)
let n = 0
for (const { x, yeni } of degisecek) {
  const res = await fetch(`${U}/rest/v1/products?id=eq.${x.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ sku: yeni.sku, slug: yeni.slug, model_code: null }),
  })
  if (!res.ok) { console.error(`⛔ ${x.sku} YAZILAMADI: ${res.status} ${await res.text()}`); process.exit(1) }
  n++
  console.log(`  ✓ ${x.sku} -> ${yeni.sku}`)
}
console.log(`\n✓ ${n} urun · ikinci kosum 0 gostermeli (idempotent)`)
console.log(`⚠URUN'e haber ver: eski slug'lar icin kalici yonlendirme AYNI GUN inmeli.`)
