#!/usr/bin/env node
/**
 * UYDURMA `model_code` BOŞALTICISI — REC-226 (kaynak kanıtına dayalı)
 *
 * ⚠BU BETİK BİR ÖNCEKİ TASARIMIN YERİNE GEÇTİ. Önce "kaynaktan kod TÜRET" diye yazılmıştı;
 * ölçüm o yolu kapattı (aşağıda). Türetme kolu silindi, yerine boşaltma kolu kondu.
 *
 * ── SORUN (t119 §3-B3, 2026-09-07 canlıda doğrulandı)
 * Canlıda aktif, müşteriye görünen 5 gerçek ürünün `model_code`'u UYDURMA. Kaynak sayfada KOD
 * sütunu var, bu beş satırın hücresi BOŞ, ve çıkarım boşluğu ardışık sayıyla (16076–16080)
 * doldurmuş. Ürünler gerçek — "CA IL 4020" sayfada geçiyor; kodlar gerçek değil.
 *
 * ── NİÇİN "TÜRET" DEĞİL (Recep emri "türet"ti; ölçüm emri karşılayamadı)
 * Kaynak dizinindeki **58 belgenin tamamı** tarandı: "CA IL 4020..8060" YALNIZ avensair fiyat
 * listesi s.26'da geçiyor (bir de s.4 içindekiler). Başka hiçbir belgede yok. Yani türetilecek
 * bir üretici kodu ELDE YOK; oradan kod "türetmek" uydurmayı tekrarlamak olurdu.
 * Model ADINI (`CA IL 4020 ES RECT`) `model_code`'a yazmak da doğru değil: o alan üretici
 * kodunu taahhüt eder, model adı kod değildir (bkz. alan-adı-taahhüdü dersi).
 * ⛔Vortice seçim aracının URL'indeki sayı (ör. `29803`) üretici kodu SAYILMAZ — o bir araç içi
 * kayıt numarasıdır ve ticari sipariş kodu olduğu kanıtlanmadı. Aynı desen (sayı gibi duranı kod
 * sanmak) bu kusuru zaten bir kez doğurdu.
 *
 * ── DOĞRU DAVRANIŞ: alanı BOŞALT
 * `product-schema-standard`'ın kaçış valfi tam bu hâl için: değer yoksa `null`, uydurma değil.
 * `getProductModelLabel` (productHelpers.ts) `model_code` boşsa null döner ve PDP'de etiket hiç
 * çizilmez — yani boşaltmak müşteriye "boş etiket" göstermez, etiketi kaldırır.
 *
 * ── ⛔ÖN KOŞUL: ÜÇ YÜZEYDEKİ `sku` YEDEĞİ ÖNCE KALDIRILMALI (URUN şeridi)
 * productHelpers.ts'in kendi kuralı: "`sku`'ya düşmek YASAK." Ama üç yüzey bugün tam bunu yapar:
 *     pdfGenerator.ts:204-205   `Model Kodu: ${model_code || sku}`
 *     seo/jsonld.ts:86          `mpn: model_code ?? sku`
 *     VariantSelector.tsx:68    `v.model_code || v.sku`
 * Bu yedek bugüne kadar HİÇ çalışmadı (her üründe model_code doluydu) — kusur latentti. Biz
 * `model_code`'u null'a çekince ilk kez tetiklenir ve föy + JSON-LD `mpn` alanı `VRT-16076`
 * gösterir: iç SKU müşteriye ve yapılandırılmış veriye çıkar. Şu an görünen de uydurma,
 * sonra görünecek de uydurma — acil kazanç yok, ama YENİ bir yüzeyde açığa çıkar.
 * Bu yüzden betik ÖN KOŞULU kendi ölçer ve karşılanmadıkça CANLIYA YAZMAZ.
 *
 * ⛔SKU'YA DOKUNMAZ (kimlik göçü ayrı ve daha geniş karar) · ⛔SLUG'A DOKUNMAZ (adres, URUN)
 * ⛔FİYATA DOKUNMAZ (Recep kapısı). Kayıt: kaynak s.26'da bu beşinin fiyatı YAZIYOR
 * (664 / 795 / 1186 / 1852 / 2088 EUR) ama canlıda `price` null — bulgu, iş emri değil.
 *
 * İKİ ANAHTARLI YAZMA: `--yaz` VE `CANLI_YAZIM_ONAYI`. Varsayılan KURU KOŞUM.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

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

// ── ÖN KOŞUL: üç yüzeyde `sku` yedeği kaldı mı? (kaldıysa yazma kolu kapalı kalır)
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

// ── Kaynak: kodun GERÇEKTEN olmadığını doğrula (boşaltmanın gerekçesi bu)
let sayfaMetni = null
try {
  for (const satir of readFileSync(DIZIN, 'utf8').split(/\r?\n/)) {
    if (!satir.trim()) continue
    const o = JSON.parse(satir)
    if (String(o.dosya || '').includes('avens_fiyat') && o.sayfa === 26) { sayfaMetni = o.metin || ''; break }
  }
} catch (e) { console.error(`⛔ kaynak dizini okunamadi: ${DIZIN}\n   ${e.message}`); process.exit(1) }
if (sayfaMetni == null) { console.error('⛔ kaynak sayfa bulunamadi — fail-closed'); process.exit(1) }

const hepsi = []
for (let off = 0; ; off += 1000) {
  const b = await (await fetch(`${U}/rest/v1/products?select=id,sku,name,slug,model_code,price&order=sku&limit=1000&offset=${off}`, { headers: H })).json()
  if (!Array.isArray(b)) { console.error('⛔ dizi donmedi'); process.exit(1) }
  hepsi.push(...b); if (b.length < 1000) break
}

const bosaltilacak = [], atlanan = []
for (const sku of HEDEF) {
  const x = hepsi.find(y => y.sku === sku)
  if (!x) { atlanan.push({ sku, sebep: 'canlida bulunamadi' }); continue }
  if (x.model_code == null || String(x.model_code).trim() === '') { atlanan.push({ sku, sebep: 'zaten bos (idempotent)' }); continue }
  const kod = String(x.model_code).trim()
  // ⭐GEREKÇE KANITI: kod kaynakta GEÇMİYOR olmalı. Geçiyorsa gerçek olabilir -> DOKUNMA.
  if (sayfaMetni.includes(kod)) { atlanan.push({ sku, sebep: `"${kod}" kaynakta GECIYOR — uydurma degil, dokunulmaz` }); continue }
  bosaltilacak.push({ x, kod })
}

console.log(`KAYNAK      : avens s.26 (${sayfaMetni.length} karakter)`)
console.log(`CANLI       : ${hepsi.length} urun`)
console.log(`BOSALTILIR  : ${bosaltilacak.length} / ${HEDEF.length}\n`)
for (const { x, kod } of bosaltilacak) {
  console.log(`  ${x.sku.padEnd(12)} model_code ${JSON.stringify(kod)} -> null   (kaynakta GECMIYOR = uydurma)`)
  console.log(`     sku/slug/price DOKUNULMUYOR`)
}
if (atlanan.length) {
  console.log(`\n⚠ATLANAN:`)
  for (const a of atlanan) console.log(`  ${a.sku.padEnd(12)} ${a.sebep}`)
}

console.log(`\n── ON KOSUL: uc yuzeydeki \`sku\` yedegi`)
if (kalanYedek.length) {
  console.log(`  ⛔KARSILANMADI — ${kalanYedek.length} yuzey hala sku'ya dusuyor:`)
  for (const y of kalanYedek) console.log(`     ${y}`)
  console.log(`  Bunlar durdukca model_code'u null'a cekmek ic SKU'yu foye ve JSON-LD mpn'e cikarir.`)
  console.log(`  Cetvel (productHelpers.ts): "sku'ya dusmek YASAK". Once o kol onarilmali (URUN).`)
} else {
  console.log(`  ✓ KARSILANDI — hicbir yuzey sku'ya dusmuyor.`)
}

const yaz = process.argv.includes('--yaz')
const onay = process.env.CANLI_YAZIM_ONAYI
if (!yaz) { console.log('\nKURU KOSUM — hicbir sey yazilmadi.'); process.exit(0) }
if (kalanYedek.length) { console.error('\n⛔ YAZIM REDDEDILDI: on kosul karsilanmadi (yukaridaki yuzeyler).'); process.exit(1) }
if (!onay) { console.error('\n⛔ YAZIM REDDEDILDI: CANLI_YAZIM_ONAYI yok (Recep\'in KENDI sozu).'); process.exit(1) }
if (!bosaltilacak.length) { console.log('\nYAZILACAK KAYIT YOK.'); process.exit(0) }

console.log(`\nCANLIYA YAZILIYOR (onay: ${onay}) — ${bosaltilacak.length} urun`)
let n = 0
for (const { x } of bosaltilacak) {
  const res = await fetch(`${U}/rest/v1/products?id=eq.${x.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ model_code: null }),
  })
  if (!res.ok) { console.error(`⛔ ${x.sku} YAZILAMADI: ${res.status} ${await res.text()}`); process.exit(1) }
  n++
}
console.log(`✓ ${n} urun · ikinci kosum 0 gostermeli (idempotent)`)
