#!/usr/bin/env node
/**
 * KAYIP ÜRÜN AKTARIMI — İKİNCİ YARI: AİLE BAĞI + KATEGORİ ONARIMI (REC-226)
 *
 * NİÇİN: 67 ürün canlı DB'ye yazıldı ama VİTRİNDE HİÇ GÖRÜNMEDİ. URUN şeridi ölçtü:
 * ürün sayfası 404, sitemap'te sıfır, kategori sayfasında yok. `catalog-integrity` kapısı
 * bağımsız olarak aynı şeyi söyledi:
 *
 *   [orphan]                  "Aile URL kanonik adrestir; ailesiz ürünün kanonik bir
 *                              vitrin adresi yoktur."
 *   [product-no-subcategory]  "subcategory_id boş olan ürün hiçbir yaprak kategori
 *                              sayfasında GÖRÜNEMEZ. Boş alan burada eksik veri değil,
 *                              GÖRÜNMEZ ÜRÜN demektir."
 *
 * DERS, ADIYLA: "canlıya yazıldı" ile "müşteri görebiliyor" AYRI İDDİALARDIR. Ben birincisini
 * ölçüp ikincisini duyurdum. Vitrin listesi AİLE birimiyle çalışır; ailesiz ürün veritabanında
 * durur ama hiçbir yoldan erişilemez.
 *
 * BU BETİK ÜÇ ŞEY YAPAR:
 *   1. Kaynak sayfalarından yedi AİLE açar (metinleri kaynaktan alır, UYDURMAZ)
 *   2. 67 ürünü ailelerine bağlar
 *   3. İki kategori kusurunu onarır:
 *      a. `rectangular-duct-fans` yaprağı `commercial-ventilation` altında, `fans` altında
 *         DEĞİL — 7 AVENS ürününü yanlış üst kategoriye yazmıştım (ölçmeden varsaymıştım)
 *      b. `accessories` kökünün HİÇ yaprağı yok; oraya yazdığım 10 ürün görünmez kalırdı.
 *         Yeni kategori AÇMIYORUM (yapısal karar) — kaynak sayfanın işaret ettiği mevcut
 *         yapraklara taşıyorum:
 *           QE-B kasaları -> fans/bathroom-toilet-fans  (kaynak: DIN 18017-3, konut banyo
 *                            havalandırma standardı; sayfa 21 valf/kasa ürünleri)
 *           PTC sensörü   -> fans/ex-proof-atex-fans    (kaynak sayfa 44 "SEAT ATEX SERİSİ")
 *
 * İKİ ANAHTARLI YAZMA: --yaz + CANLI_YAZIM_ONAYI. Fiyat YAZMAZ, ürün SİLMEZ.
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
if (!U || !K) { console.error('SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }
const TENANT = 'd3b07384-d113-495f-a558-8c38634e0000'

// Aile tanımları. `metin` alanı KAYNAK SAYFADAN alınmış tanım cümlesidir — bu betik
// pazarlama metni üretmez; kaynakta ne yazıyorsa o gider.
const AILELER = [
  {
    slug: 'avens-qe-b-kasa', ad: 'AVenS QE-B Kasa Serisi', marka: 'avens', seri: 'QE-B',
    kok: 'fans', yaprak: 'bathroom-toilet-fans', sku: /^AVE-1156[0-9]$/,
    metin: 'Gömme ya da duvar/tavan montajı için ABS plastikten üretilen temel fan kasası ve valf grubu. TÜV Alman Enstitüsü onaylı, DIN 18017-3 standardına uygun; toz ve sıva girişini önleyen kare çerçeve ile birlikte gelir. Yangına dayanıklı K90 ve paslanmaz çelik valfli çeşitleri, ikinci bir odadan hava çıkarmaya izin veren bağlantı noktalı sürümleri vardır.',
  },
  {
    slug: 'avens-dikdortgen-kanal-radyal', ad: 'AVenS Dikdörtgen Kanal Tipi Radyal Fanlar', marka: 'avens', seri: 'AVENS-DK',
    kok: 'commercial-ventilation', yaprak: 'rectangular-duct-fans', sku: /^AVE-1(200|250|316|317|355|360|410)$/,
    metin: 'Galvaniz çelik metal gövdeli, kendinden flanşlı, standart kablo ile uzatılmış elektrik bağlantı terminaline sahip, aşırı yük korumalı dikdörtgen kanal tipi radyal fan.',
  },
  {
    slug: 'vortice-vorticent-cms-atex', ad: 'Vortice VORTICENT CMS ATEX Santrifüj Fanlar', marka: 'vortice', seri: 'CMS-ATEX',
    kok: 'fans', yaprak: 'ex-proof-atex-fans', sku: /^VRT-253/,
    metin: 'ATEX sertifikalı, patlayıcı ortamlara kurulum için tasarlanmış santrifüj fan ailesi. Çelik sactan, tamamen birleştirilmiş veya kaynaklı gövde; alüminyum sacdan yapılmış öne eğik pervane; bakır veya alüminyumdan yapılmış, kıvılcım önleyici giriş halkası. Zone 1 ve Zone 2 sürümleri, fan ve motor için ayrı ATEX işaretleriyle listelenir.',
  },
  {
    slug: 'seat-atex-ptc-sensor', ad: 'SEAT ATEX PTC Sensörü', marka: 'seat', seri: 'PTC',
    kok: 'fans', yaprak: 'ex-proof-atex-fans', sku: /^SEA-810105$/,
    metin: 'SEAT ATEX serisi fanlarda motor sargı sıcaklığını izleyen PTC termistör sensörü. ATEX kurulumlarında motor korumasının parçasıdır.',
  },
  {
    slug: 'avens-nimus', ad: 'AVenS NIMUS Santrifüj Fanlar', marka: 'avens', seri: 'NIMUS',
    kok: 'fans', yaprak: 'centrifugal-fans', sku: /^AVE-NS/,
    metin: 'Çelik gövdeli, direkt akuple, orta basınçlı, korozyona dayanıklı santrifüj fan. IP-55 koruma ve F sınıfı elektrik yalıtımına sahiptir. Taşınan hava en fazla 130 °C, ortam sıcaklığı en fazla 60 °C olacak şekilde sürekli çalışır. Temiz veya tozlu hava taşımaya uygundur; boya kabinleri, toz toplama, gıda işleme ve endüstriyel koku kontrolü gibi uygulamalarda kullanılır.',
  },
  {
    slug: 'avens-nimax', ad: 'AVenS NIMAX Santrifüj Fanlar', marka: 'avens', seri: 'NIMAX',
    kok: 'fans', yaprak: 'centrifugal-fans', sku: /^AVE-NX/,
    metin: 'Çelik gövdeli, direkt akuple, orta basınçlı, korozyona dayanıklı santrifüj fan. IP-55 koruma ve F sınıfı elektrik yalıtımına sahiptir; emme veya boşaltma kanalına monte edilmek üzere tasarlanmıştır. Taşınan hava en fazla 130 °C, ortam sıcaklığı en fazla 60 °C olacak şekilde sürekli çalışır.',
  },
  {
    slug: 'avens-enkelfan-ec-plug', ad: 'AVenS ENKELFAN EC Motorlu Plug Fanlar', marka: 'avens', seri: 'ENKEC',
    kok: 'fans', yaprak: 'centrifugal-fans', sku: /^AVE-ENKEC/,
    metin: 'Geriye eğik seyrek kanatlı, tek emişli, doğrudan tahrikli EC motorlu OEM plug fan. Sürekli çalışma sıcaklık aralığı -20 °C ile +60 °C arasındadır. Klima santralleri, ısı geri kazanım cihazları ve plenum kutularında kullanılır.',
  },
]

const say = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
let urun = []
for (let off = 0; ; off += 1000) {
  const b = await (await fetch(`${U}/rest/v1/products?select=id,sku,name,brand,family_id,category_id,subcategory_id&order=sku&limit=1000&offset=${off}`, { headers: H })).json()
  urun = urun.concat(b); if (b.length < 1000) break
}
if (urun.length !== kesin) { console.error(`cekilen ${urun.length} != ${kesin} - fail-closed`); process.exit(1) }

const kat = await (await fetch(`${U}/rest/v1/categories?select=id,slug`, { headers: H })).json()
const katId = new Map(kat.map(c => [c.slug, c.id]))
const marka = await (await fetch(`${U}/rest/v1/brands?select=id,slug`, { headers: H })).json()
const markaId = new Map(marka.map(b => [b.slug, b.id]))
const mevcutAile = await (await fetch(`${U}/rest/v1/product_families?select=id,slug`, { headers: H })).json()
const aileId = new Map(mevcutAile.map(f => [f.slug, f.id]))

// Plan
const acilacak = [], baglanacak = []
for (const a of AILELER) {
  const kapsam = urun.filter(u => a.sku.test(u.sku))
  if (!kapsam.length) { console.log(`  UYARI ${a.slug}: eslesen urun YOK`); continue }
  if (!katId.get(a.kok) || !katId.get(a.yaprak)) { console.error(`kategori bulunamadi: ${a.kok}/${a.yaprak}`); process.exit(1) }
  if (!aileId.has(a.slug)) acilacak.push(a)
  for (const u of kapsam) {
    const gerek = {}
    if (!u.family_id) gerek.family_id = '(aile)'
    if (u.category_id !== katId.get(a.kok)) gerek.category_id = a.kok
    if (u.subcategory_id !== katId.get(a.yaprak)) gerek.subcategory_id = a.yaprak
    if (Object.keys(gerek).length) baglanacak.push({ u, a, gerek })
  }
}

console.log(`AILE ACILACAK   : ${acilacak.length}`)
for (const a of acilacak) console.log(`   ${a.slug.padEnd(32)} ${a.ad}  ->  ${a.kok}/${a.yaprak}`)
console.log(`URUN GUNCELLENIR: ${baglanacak.length}`)
const ozet = new Map()
for (const b of baglanacak) { const k = `${b.a.slug} [${Object.keys(b.gerek).join('+')}]`; ozet.set(k, (ozet.get(k) || 0) + 1) }
for (const [k, n] of ozet) console.log(`   ${String(n).padStart(3)}  ${k}`)

const ailesizKalan = urun.filter(u => !u.family_id && !baglanacak.some(b => b.u.id === u.id))
const yapraksizKalan = urun.filter(u => !u.subcategory_id && !baglanacak.some(b => b.u.id === u.id))
console.log(`\nBU KOSUMDAN SONRA KALAN  ailesiz: ${ailesizKalan.length} · yapraksiz: ${yapraksizKalan.length}`)
for (const u of ailesizKalan.slice(0, 10)) console.log(`   ailesiz: ${u.sku} ${u.name.slice(0, 40)}`)

const yaz = process.argv.includes('--yaz')
if (!yaz) { console.log('\nKURU KOSUM - hicbir sey yazilmadi. Canliya: --yaz + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('\nCANLI_YAZIM_ONAYI yok - reddedildi.'); process.exit(1) }

// 1) Aileleri aç
for (const a of acilacak) {
  const govde = {
    tenant_id: TENANT, name: a.ad, slug: a.slug, brand_id: markaId.get(a.marka),
    category_id: katId.get(a.kok), subcategory_id: katId.get(a.yaprak),
    series_code: a.seri, is_description_manual: false,
    description: { tr: a.metin },
  }
  const r = await fetch(`${U}/rest/v1/product_families`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify([govde]) })
  if (!r.ok) { console.error(`AILE ACILAMADI ${a.slug}: ${r.status} ${await r.text()}`); process.exit(1) }
  const [yeni] = await r.json()
  aileId.set(a.slug, yeni.id)
  console.log(`  aile acildi: ${a.slug}`)
}

// 2) Ürünleri bağla
let n = 0
for (const { u, a } of baglanacak) {
  const govde = { family_id: aileId.get(a.slug), category_id: katId.get(a.kok), subcategory_id: katId.get(a.yaprak) }
  const r = await fetch(`${U}/rest/v1/products?id=eq.${u.id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(govde) })
  if (!r.ok) { console.error(`URUN GUNCELLENEMEDI ${u.sku}: ${r.status} ${await r.text()}`); process.exit(1) }
  n++
}
console.log(`\n${acilacak.length} aile acildi · ${n} urun baglandi`)
console.log('ikinci kosum 0 gostermeli (idempotent)')
