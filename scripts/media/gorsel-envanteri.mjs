#!/usr/bin/env node
/**
 * GÖRSEL ENVANTERİ — mükerrer görseller + "yeni fotoğraf gerekli" listesi (REC-282 / REC-284)
 *
 * ── NİÇİN VAR (Recep kararı 2026-09-08, lafzıyla)
 *   *"tekrar edenler aynen kalsınlar ama bunarı kaydet bilelim görsel olarak mükkerre olnalar
 *    ve bunlar yeni foto lazım diye bilelim."*
 * Yani iş SİLME değil KAYIT üretme. Bu betik o kaydı üretir ve tekrar koşulabilir.
 *
 * ── ÖLÇTÜĞÜ ÜÇ ŞEY
 *   1. Hangi görsel dosyası birden fazla üründe kullanılıyor (byte-eşit, sha256).
 *   2. Bunlardan hangileri KATEGORİ SINIRINI AŞIYOR — asıl şüpheli olan bu.
 *      (Aynı kategori içinde paylaşım meşru olabilir: bir ailenin varyantları aynı fotoğrafı
 *       kullanır. Kategori sınırını aşması ise "yanlış ürüne yapıştırılmış" demektir; REC-282
 *       tam böyle doğdu — ısı geri kazanım fotoğrafı altı sulu batarya ürününe kopyalanmıştı.)
 *   3. Hiç görseli olmayan ürünler.
 *
 * ── ⭐NİÇİN TÜM DOSYALARI İNDİRMİYOR (ve bu neden eksiklik DEĞİL)
 * Farklı bayt boyutundaki iki dosya birbirinin aynısı OLAMAZ. Bu yüzden önce `storage.objects`
 * metadata'sından boyutlar okunur ve YALNIZ aynı boyutu paylaşan dosyalar indirilip hash'lenir.
 * Boyutu benzersiz olan dosya tanım gereği tekildir; indirilmesi bilgi katmaz.
 * Ölçüm (2026-09-08): 1084 dosyanın 930'u aynı-boyut grubunda → 154 dosya indirilmeden elenir.
 * Kayıp yok, sadece işten tasarruf. (Boyut eşitliği içerik eşitliği DEĞİLDİR — o yüzden aynı
 * boyuttakiler yine de hash'lenir; boyut sadece ELEME ölçütüdür, karar ölçütü değil.)
 *
 * ── SALT OKUMA
 * Bu betik hiçbir şey YAZMAZ — ne DB'ye ne storage'a. Yalnız rapor üretir.
 * `--yaz` gibi bir kolu bilerek YOKTUR: envanterden çıkacak düzeltme Recep kapısıdır.
 *
 * KULLANIM:  node scripts/media/gorsel-envanteri.mjs [--rapor <dizin>]
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok — fail-closed'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}` }
const KOVA = 'product-images'

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(ad)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan
}

async function sor(yol) {
  const r = await fetch(`${U}/rest/v1/${yol}`, { headers: H })
  if (!r.ok) { console.error(`⛔ sorgu basarisiz (${r.status}): ${yol}`); process.exit(1) }
  return r.json()
}

/** Sayfalama: PostgREST varsayilan tavani var; tavana DAYANIRSA sessizce eksik doner. */
async function tumu(tablo, secim) {
  const hepsi = []
  for (let ofset = 0; ; ofset += 1000) {
    const p = await sor(`${tablo}?select=${secim}&limit=1000&offset=${ofset}`)
    hepsi.push(...p)
    if (p.length < 1000) break
  }
  return hepsi
}

const sinirli = async (isler, tavan = 12) => {
  const sonuc = new Array(isler.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(tavan, isler.length) }, async () => {
    while (i < isler.length) { const k = i++; sonuc[k] = await isler[k]() }
  }))
  return sonuc
}

console.log('GORSEL ENVANTERI — salt okuma\n')

// ── 1. Veri
const gorseller = await tumu('product_images', 'product_id,path,sort_order')
const urunler = await tumu('products', 'id,sku,name,category_id,subcategory_id,status')
const kategoriler = await tumu('categories', 'id,slug,name,is_active')

const katAdi = new Map(kategoriler.map(c => [c.id, c.slug]))
const urunById = new Map(urunler.map(p => [p.id, p]))
const katOf = (p) => katAdi.get(p?.category_id) || katAdi.get(p?.subcategory_id) || '(kategorisiz)'

console.log(`  ${gorseller.length} gorsel kaydi · ${urunler.length} urun · ${kategoriler.length} kategori`)

// ── 2. Boyutları oku, aynı-boyut gruplarını bul (eleme ölçütü)
// Storage `list` ucu yalnız bir düzeyi listeler ve yollar zaten `product_images.path`'te var;
// bu yüzden boyut doğrudan HEAD isteğinin `content-length` başlığından okunur.
const yollar = [...new Set(gorseller.map(g => g.path))]
console.log(`  ${yollar.length} benzersiz dosya yolu\n  boyutlar okunuyor...`)

const boyutlar = await sinirli(yollar.map(y => async () => {
  const r = await fetch(`${U}/storage/v1/object/public/${KOVA}/${y}`, { method: 'HEAD' })
  return { yol: y, boyut: Number(r.headers.get('content-length') || -1) }
}), 16)

const boyutGrup = new Map()
for (const { yol, boyut } of boyutlar) {
  if (boyut < 0) continue
  if (!boyutGrup.has(boyut)) boyutGrup.set(boyut, [])
  boyutGrup.get(boyut).push(yol)
}
const adaylar = [...boyutGrup.values()].filter(v => v.length > 1).flat()
console.log(`  ${adaylar.length} dosya ayni-boyut grubunda -> hash'lenecek`)
console.log(`  ${yollar.length - adaylar.length} dosya boyutu BENZERSIZ -> tanim geregi tekil, indirilmiyor\n`)

// ── 3. Adayları indir + sha256
let sayac = 0
const hashler = await sinirli(adaylar.map(y => async () => {
  const r = await fetch(`${U}/storage/v1/object/public/${KOVA}/${y}`)
  if (!r.ok) return { yol: y, hash: null }
  const b = Buffer.from(await r.arrayBuffer())
  if (++sayac % 100 === 0) process.stdout.write(`    ${sayac}/${adaylar.length}\r`)
  return { yol: y, hash: createHash('sha256').update(b).digest('hex').slice(0, 16) }
}), 12)
console.log(`    ${sayac}/${adaylar.length} indirildi        \n`)

const hashOf = new Map(hashler.filter(h => h.hash).map(h => [h.yol, h.hash]))

// ── 4. Aynı hash'i paylaşan dosyalar → hangi ürünler, hangi kategoriler
const hashGrup = new Map()
for (const g of gorseller) {
  const h = hashOf.get(g.path)
  if (!h) continue
  if (!hashGrup.has(h)) hashGrup.set(h, [])
  hashGrup.get(h).push(g)
}

const mukerrer = []
for (const [h, kayitlar] of hashGrup) {
  const urunSeti = [...new Set(kayitlar.map(k => k.product_id))]
  if (urunSeti.length < 2) continue
  const kats = [...new Set(urunSeti.map(id => katOf(urunById.get(id))))]
  mukerrer.push({
    hash: h,
    dosya_sayisi: kayitlar.length,
    urun_sayisi: urunSeti.length,
    kategoriler: kats,
    kategori_sinirini_asiyor: kats.length > 1,
    urunler: urunSeti.map(id => {
      const p = urunById.get(id)
      return { sku: p?.sku ?? '(bilinmiyor)', ad: p?.name ?? '', kategori: katOf(p) }
    }).sort((a, b) => a.sku.localeCompare(b.sku)),
  })
}
mukerrer.sort((a, b) =>
  (b.kategori_sinirini_asiyor - a.kategori_sinirini_asiyor) || (b.urun_sayisi - a.urun_sayisi))

// ── 5. Görselsiz ürünler
const gorselli = new Set(gorseller.map(g => g.product_id))
const gorselsiz = urunler.filter(p => !gorselli.has(p.id))
  .map(p => ({ sku: p.sku, ad: p.name, kategori: katOf(p), durum: p.status }))
  .sort((a, b) => a.sku.localeCompare(b.sku))

// ── 6. Rapor
const asan = mukerrer.filter(m => m.kategori_sinirini_asiyor)
const rapor = {
  damga: new Date().toISOString(),
  olcum: {
    gorsel_kaydi: gorseller.length,
    benzersiz_dosya: yollar.length,
    hashlenen: adaylar.length,
    boyutu_benzersiz_elenen: yollar.length - adaylar.length,
    mukerrer_grup: mukerrer.length,
    kategori_sinirini_asan_grup: asan.length,
    gorselsiz_urun: gorselsiz.length,
  },
  kategori_sinirini_asanlar: asan,
  kategori_ici_paylasim: mukerrer.filter(m => !m.kategori_sinirini_asiyor),
  gorselsiz_urunler: gorselsiz,
}

const dizin = arg('--rapor', join(process.cwd(), 'docs', 'audits'))
mkdirSync(dizin, { recursive: true })
const gun = rapor.damga.slice(0, 10)
const jsonYol = join(dizin, `icerik-hatti-gorsel-envanteri-${gun}.json`)
writeFileSync(jsonYol, JSON.stringify(rapor, null, 2))

console.log('== SONUC')
console.log(`  mukerrer grup                 : ${mukerrer.length}`)
console.log(`  ⛔KATEGORI SINIRINI ASAN grup : ${asan.length}   <- suphe burada`)
console.log(`  gorselsiz urun                : ${gorselsiz.length}`)
console.log(`\n  rapor: ${jsonYol}`)

if (asan.length) {
  console.log('\n== KATEGORI SINIRINI ASANLAR (yeni fotograf adaylari)')
  for (const m of asan) {
    console.log(`  hash ${m.hash} · ${m.urun_sayisi} urun · kategoriler: ${m.kategoriler.join(' + ')}`)
    for (const u of m.urunler.slice(0, 8)) console.log(`      ${u.sku.padEnd(14)} ${u.kategori.padEnd(26)} ${u.ad.slice(0, 46)}`)
    if (m.urunler.length > 8) console.log(`      ... +${m.urunler.length - 8} urun daha`)
  }
}
