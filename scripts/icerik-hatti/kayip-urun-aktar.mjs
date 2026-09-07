#!/usr/bin/env node
/**
 * KAYIP ÜRÜN AKTARIMI — REC-226
 *
 * NİÇİN: 2026-08-20'de ölçüldü — tedarikçi fiyat listesinden 74 ürün kodu çıkarım sırasında
 * atlanmıştı (aracın kod biçimi varsayımı yüzünden). Araç `e7e5f7b`'de DÜZELTİLDİ ama BİR DAHA
 * KOŞULMADI; CSV hâlâ Haziran tarihli. Yani bu eksik 20 Ağustos'tan beri kapanabilirdi.
 * Recep 2026-09-07: "evet aktar".
 *
 * BUGÜN ÖLÇÜLDÜ: 74'ün 6'sı (sulu batarya 13052-13057) canlıda ZATEN VAR — o rapor CSV
 * eksiğini ölçüyordu, DB'yi değil. Gerçek eksik 68.
 *
 * VERİ İKİ BAĞIMSIZ KAYNAKTAN DOĞRULANDI:
 *   fiyat  <- t119 EK-A (2026-08-20, 25 alt-ajanın GÖRSEL okuması)
 *   ad+kod <- kaynak dizini sayfalar.jsonl (METİN çıkarımı, bugün)
 *   65/65 fiyat iki yöntemde aynı çıktı; 74/74 kod dizinde bulundu.
 *
 * FİYAT YAZMAZ. OPS/Recep sınırı: "silme ve fiyat değişikliği Recep'te". Ürünler fiyatsız
 * yazılır — canlıdaki 375 ürünün 374'ü zaten price=null (fiyat product_prices'ta).
 *
 * ADI OLMAYAN ÜRÜNÜ YAZMAZ. Kaynakta kodun ardından model adı okunamıyorsa kalem ATLANIR ve
 * raporlanır. Ad uydurmak, eksik üründen kötüdür.
 *
 * İKİ ANAHTARLI YAZMA: --yaz + CANLI_YAZIM_ONAYI.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

// Yollar KIMLIK TASIMAZ: depo koku ve ev dizini uzerinden turetilir (INV-MUTLAK-YOL-1).
const DEPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const RAPOR = process.env.T119_RAPOR || join(DEPO, 'docs', 'audits', 't119-katalog-cikarim-dogrulama-2026-08-20.md')
const DIZIN = process.env.KAYNAK_DIZINI || join(homedir(), 'venthub-pdf-ingestor', 'kaynak-dizini', 'sayfalar.jsonl')

// Sayfa -> (kök kategori, alt kategori, marka, SKU öneki).
// Kaynak sayfa BAŞLIKLARINA dayanır, tahmine değil:
//   s21 "temel kasa ... ABS plastikten"      -> aksesuar
//   s27 "AVENS dikdörtgen kanal"             -> dikdörtgen kanal tipi fanlar
//   s39 "CMS ATEX SANTRİFÜJ" (EX-PROOF böl.) -> ex-proof (ATEX) fanlar, VORTICENT = Vortice
//   s44 "SEAT ATEX SERİSİ" (PTC sensörü)     -> aksesuar
//   s47 NIMUS / s48 NIMAX "SANTRİFÜJ FANLAR" -> santrifüj / radyal fanlar
//   s49 "ENKELFAN - EC MOTORLU PLUG FAN"     -> santrifüj / radyal fanlar
const ESLEME = {
  21: { kok: 'accessories', alt: null, marka: 'AVenS', onek: 'AVE' },
  27: { kok: 'fans', alt: 'rectangular-duct-fans', marka: 'AVenS', onek: 'AVE' },
  39: { kok: 'fans', alt: 'ex-proof-atex-fans', marka: 'Vortice', onek: 'VRT' },
  44: { kok: 'accessories', alt: null, marka: 'SEAT', onek: 'SEA' },
  47: { kok: 'fans', alt: 'centrifugal-fans', marka: 'AVenS', onek: 'AVE' },
  48: { kok: 'fans', alt: 'centrifugal-fans', marka: 'AVenS', onek: 'AVE' },
  49: { kok: 'fans', alt: 'centrifugal-fans', marka: 'AVenS', onek: 'AVE' },
  62: null, // VORT MASTER - kaynak sayfa metni BOŞ çıktı; kategori dayanağı yok, YAZILMAZ
  69: null, // sulu batarya - canlıda ZATEN VAR (13052-13057)
}

const slugify = (s) => s.toLowerCase()
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// 1) EK-A: kod -> sayfa
const rapor = readFileSync(RAPOR, 'utf8')
const ekA = rapor.slice(rapor.indexOf('### EK-A'), rapor.indexOf('### EK-B'))
if (!ekA || ekA.length < 100) { console.error('EK-A okunamadi - fail-closed'); process.exit(1) }
const kodlar = []
for (const blok of ekA.split(/\*\*Sayfa /).slice(1)) {
  const sayfa = Number(blok.match(/^(\d+)/)?.[1])
  for (const m of blok.matchAll(/`([A-Z0-9][A-Z0-9 ]{2,20}?)`/g)) kodlar.push({ kod: m[1].trim(), sayfa })
}
console.log(`EK-A: ${kodlar.length} kod`)

// 2) Kaynak dizini sayfa metinleri
const sayfaMetin = new Map()
for (const l of readFileSync(DIZIN, 'utf8').split(/\r?\n/)) {
  if (!l) continue
  let o; try { o = JSON.parse(l) } catch { continue }
  if (/avens_fiyat_listesi_2026/.test(o.dosya)) sayfaMetin.set(o.sayfa, o.metin)
}

// 3) Canlı durum (fail-closed sayım)
const say = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const oncekiSayi = Number((say.headers.get('content-range') || '').split('/')[1])
let mevcut = []
for (let off = 0; ; off += 1000) {
  const b = await (await fetch(`${U}/rest/v1/products?select=sku,model_code&order=sku&limit=1000&offset=${off}`, { headers: H })).json()
  mevcut = mevcut.concat(b); if (b.length < 1000) break
}
if (mevcut.length !== oncekiSayi) { console.error(`cekilen ${mevcut.length} != ${oncekiSayi} - fail-closed`); process.exit(1) }
const varMc = new Set(mevcut.map(x => x.model_code).filter(Boolean))
const varSku = new Set(mevcut.map(x => x.sku))

const kat = await (await fetch(`${U}/rest/v1/categories?select=id,slug`, { headers: H })).json()
const katId = new Map(kat.map(c => [c.slug, c.id]))
const TENANT = 'd3b07384-d113-495f-a558-8c38634e0000'

// 4) Adaylar
const yazilacak = [], atlanan = []
for (const { kod, sayfa } of kodlar) {
  const e = ESLEME[sayfa]
  if (!e) { atlanan.push({ kod, sayfa, sebep: sayfa === 69 ? 'canlida ZATEN VAR' : 'kaynak sayfa metni bos - kategori dayanagi yok' }); continue }
  if (varMc.has(kod)) { atlanan.push({ kod, sayfa, sebep: 'model_code canlida zaten var' }); continue }
  const metin = sayfaMetin.get(sayfa) || ''
  const i = metin.indexOf(kod)
  if (i < 0) { atlanan.push({ kod, sayfa, sebep: 'kaynak metinde kod bulunamadi' }); continue }
  const ad = (metin.slice(i + kod.length).split('\n').map(x => x.trim()).filter(Boolean)[0] || '')
  if (!ad || ad.length < 3 || /^\d+([.,]\d+)?$/.test(ad)) { atlanan.push({ kod, sayfa, sebep: `ad okunamadi ("${ad}") - UYDURULMADI` }); continue }
  const sku = `${e.onek}-${kod.replace(/\s+/g, '')}`
  if (varSku.has(sku)) { atlanan.push({ kod, sayfa, sebep: `SKU cakismasi ${sku}` }); continue }
  yazilacak.push({
    sku, name: ad, model_code: kod, brand: e.marka,
    category_id: katId.get(e.kok), subcategory_id: e.alt ? katId.get(e.alt) : null,
    slug: `${slugify(ad)}-${slugify(kod)}`, status: 'active', tenant_id: TENANT,
  })
}

console.log(`\nYAZILACAK : ${yazilacak.length}`)
console.log(`ATLANAN   : ${atlanan.length}`)
for (const a of atlanan) console.log(`   ${a.kod.padEnd(13)} s${a.sayfa}  ${a.sebep}`)
console.log()
for (const y of yazilacak) console.log(`  ${y.sku.padEnd(18)} ${y.brand.padEnd(8)} ${y.name.slice(0, 46)}`)

const yaz = process.argv.includes('--yaz')
if (!yaz) { console.log('\nKURU KOSUM - hicbir sey yazilmadi. Canliya: --yaz + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('\nCANLI_YAZIM_ONAYI yok - reddedildi.'); process.exit(1) }
if (!yazilacak.length) { console.log('\nyazilacak kalem yok'); process.exit(0) }

console.log(`\nCANLIYA YAZILIYOR (onay: ${process.env.CANLI_YAZIM_ONAYI}) - ${yazilacak.length} urun, FIYATSIZ`)
const r = await fetch(`${U}/rest/v1/products`, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(yazilacak) })
if (!r.ok) { console.error(`YAZILAMADI: ${r.status} ${await r.text()}`); process.exit(1) }
const say2 = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const sonrakiSayi = Number((say2.headers.get('content-range') || '').split('/')[1])
console.log(`urun sayisi ${oncekiSayi} -> ${sonrakiSayi} (fark ${sonrakiSayi - oncekiSayi}, beklenen ${yazilacak.length})`)
if (sonrakiSayi - oncekiSayi !== yazilacak.length) { console.error('FARK BEKLENENDEN BASKA - incele'); process.exit(1) }
console.log('ikinci kosum 0 yazilacak gostermeli (idempotent: model_code kontrolu)')
