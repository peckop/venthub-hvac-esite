#!/usr/bin/env node
/**
 * TAŞINABİLİR KATALOG — DIŞA AKTARICI (REC-212)
 *
 * NİÇİN VAR:
 * Recep 2026-09-07: "bugün PC alsam, USB'yi bir kullanıcıya versem 'al bunları yükle' desem,
 * yükleyebiliyor muyuz? tüm ürünler için". Cevap o gün ölçüldü: HAYIR. Katalog yalnız canlı
 * DB'de yaşıyordu; elimizdeki tek dışa aktarım admin CSV'siydi ve o 7 kolon veriyor
 * (id,name,sku,category_id,status,price,stock_qty) — 38 kolonluk ürünün beşte biri, teknik
 * özellik yok, fiyat listesi yok, görsel yok, aile/kategori yok. Yani "katalogu taşıdım"
 * denebilecek bir çıktı hiç üretilmemişti.
 *
 * NE YAPAR: canlı DB'yi SALT OKUR ve yedi tabloyu tek bir pakete yazar. Hiçbir şey yazmaz.
 *
 * ⚠BU BETİK PAKETİN YARISIDIR. Geri yükleyici (paket -> DB) AYRI bir iştir ve canlıya
 * yazdığı için Recep kapısındadır. Dışa aktarım tek başına "taşınabilir katalog" DEĞİLDİR;
 * geri yüklenebildiği ölçüde taşınabilirdir. Bu betik o iddiayı ETMEZ.
 *
 * DETERMİNİZM: satırlar id'ye göre sıralanır, JSON anahtarları sabit sırayla yazılır ve
 * zaman damgası YALNIZ manifest'e girer. Böylece iki koşum bayt-eşit veri dosyaları üretir
 * (kaynak dizini betiğiyle aynı desen) ve "değişti mi" sorusu diff ile cevaplanabilir.
 *
 * KESİN SAYI KAPISI: her tablo için önce Prefer:count=exact ile sunucunun saydığı satır
 * alınır; çekilen satır sayısı ona eşit değilse paket YAZILMAZ (fail-closed). PostgREST
 * varsayılan sayfa tavanı sessizce keser — eksik paket, tam paket gibi görünür ve bu
 * projede tam bu tuzağa daha önce düşüldü (veri tavanı, REC-124).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}` }

const HEDEF = process.argv.find(a => a.startsWith('--hedef='))?.slice(8) || 'katalog-paketi'

// Sıra ÖNEMLİ: bağımlılık yönünde yazılır ki geri yükleyici aynı sırayla okuyabilsin.
const TABLOLAR = [
  { ad: 'brands',           sirala: 'id' },
  { ad: 'categories',       sirala: 'id' },
  { ad: 'product_families', sirala: 'id' },
  { ad: 'price_lists',      sirala: 'id' },
  { ad: 'products',         sirala: 'id' },
  { ad: 'product_prices',   sirala: 'id' },
  { ad: 'product_images',   sirala: 'id' },
]

const sirala = (o) => {
  // Anahtar sırası sabit olmalı: aynı veri iki koşumda aynı baytı vermeli.
  const y = {}
  for (const k of Object.keys(o).sort()) y[k] = o[k]
  return y
}

async function kesinSayi(t) {
  const r = await fetch(`${U}/rest/v1/${t}?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
  if (!r.ok) return null
  const n = Number((r.headers.get('content-range') || '').split('/')[1])
  return Number.isInteger(n) ? n : null
}

async function tumSatirlar(t, kolon) {
  const hepsi = []
  const adim = 1000
  for (let off = 0; ; off += adim) {
    const r = await fetch(`${U}/rest/v1/${t}?select=*&order=${kolon}&limit=${adim}&offset=${off}`, { headers: H })
    if (!r.ok) { console.error(`⛔ ${t} okunamadı: ${r.status} ${await r.text()}`); process.exit(1) }
    const b = await r.json()
    if (!Array.isArray(b)) { console.error(`⛔ ${t} dizi dönmedi`); process.exit(1) }
    hepsi.push(...b)
    if (b.length < adim) break
  }
  return hepsi
}

const manifest = { uretildi: new Date().toISOString(), kaynak: U.replace(/https:\/\/([^.]+).*/, '$1'), tablolar: {} }
let toplam = 0

// İKİ FAZ — ÖNCE HEPSİNİ TOPLA VE DOĞRULA, SONRA YAZ.
// Niçin: tek fazlı sürüm sabotaj sınavında kapıyı doğru kırmızı verdi ama YARIM PAKET
// bırakıyordu (brands.jsonl diskte, manifest yok). Yarım paket, USB'ye kopyalanınca tam
// paketten ayırt edilemez. Yazım ya hep ya hiç olmalı.
const govdeler = []
for (const { ad, sirala: kol } of TABLOLAR) {
  const kesin = await kesinSayi(ad)
  if (kesin === null) { console.error(`⛔ ${ad}: kesin sayı alınamadı — fail-closed, HİÇBİR ŞEY yazılmadı`); process.exit(1) }
  const satirlar = await tumSatirlar(ad, kol)
  if (satirlar.length !== kesin) {
    console.error(`⛔ ${ad}: çekilen ${satirlar.length} ≠ sunucu ${kesin} — EKSİK VERİ, HİÇBİR ŞEY yazılmadı`)
    process.exit(1)
  }
  const govde = satirlar.map(s => JSON.stringify(sirala(s))).join('\n') + '\n'
  const hash = createHash('sha256').update(govde).digest('hex')
  govdeler.push({ ad, govde, ornek: satirlar[0] })
  manifest.tablolar[ad] = { satir: satirlar.length, kolon: Object.keys(satirlar[0] || {}).length, sha256: hash }
  toplam += satirlar.length
  console.log(`  ${ad.padEnd(18)} ${String(satirlar.length).padStart(5)} satır  ${hash.slice(0, 12)}  (okundu)`)
}

// ⭐jsonl HAM/ ALTINA yazılır (REC-212 F1, OPS hükmü 2026-09-09): insan-okur CSV'ler bundan
// ÜRETİLİR (uretilmis-artefakt kuralı) ve elle düzenlenmez. Round-trip eşitlik kapısı da
// CSV üzerinde DEĞİL, bu jsonl'ler üzerinde ölçülür — CSV'de bayt eşitliği işletim sistemine
// bağlıdır (bugün ölçüldü: CRLF/LF farkı aynı dosyayı farklı gösterdi).
const HAM = join(HEDEF, 'ham')
mkdirSync(HAM, { recursive: true })
for (const { ad, govde } of govdeler) writeFileSync(join(HAM, `${ad}.jsonl`), govde, 'utf8')

// Görseller: dosyaların KENDİSİ pakette değil, yolları var. Bunu saklamıyoruz.
const gorselYolu = govdeler.find(g => g.ad === 'product_images')?.ornek || {}
manifest.uyari = [
  'Bu betik paketin HAM yarısıdır: ham/*.jsonl üretir. İnsan-okur CSV ve görsel DOSYALARI için `katalog-paket-uret.mjs` koşulmalıdır; o koşulmadan paket EKSİKTİR.',
  'Geri yükleyici bu pakette YOKTUR. Paket tek başına "taşınabilir katalog" değildir; geri yüklenebildiği ölçüde taşınabilirdir.',
  'tenant_id kolonları olduğu gibi taşınır — başka bir kuruluma yüklenirken yeniden eşlenmelidir.',
  'PAKET GİT\'E GİRMEZ: fiyat (Euro) ve ~36 MB görsel taşır, ingestor deposu REC-215 ile PUBLIC olacak. `paket/` .gitignore\'dadır; USB kopyası = dizinin KENDİSİ.',
]
manifest.toplam_satir = toplam
writeFileSync(join(HEDEF, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')

console.log(`\n✓ paket: ${HEDEF}  ·  ${TABLOLAR.length} tablo  ·  ${toplam} satır`)
console.log(`  görsel yolu örneği: ${gorselYolu.path || '(yok)'}`)
console.log(`\n⚠ Bu paket GERİ YÜKLENEBİLİRLİĞİ KANITLANMIŞ DEĞİLDİR — geri yükleyici henüz yok.`)
