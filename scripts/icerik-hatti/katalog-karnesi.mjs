#!/usr/bin/env node
/**
 * KATALOG KARNESİ — hattın dokuz satırı, TEK komutla (KOL 6 ilk çıktısı)
 *
 * NİÇİN VAR: 2026-09-07'de bu tabloyu çıkarmak için ALTI ayrı ölçüm koşuldu ve hiçbiri
 * tekrarlanabilir değildi. Ölçemediğimiz ilerlemeyi raporlayamayız; her hafta elle
 * kurulan bir ölçüm, bir sonraki hafta farklı bir evren ölçer ve iki sayı kıyaslanamaz.
 * Bu betik evreni SABİTLER.
 *
 * SALT OKUR. Çıktı hem insana hem `--json` ile makineye.
 *
 * ⚠EVREN UYARISI — bu projenin en pahalı hatası: aynı soru, farklı bağlantı yolu, farklı sayı.
 * Kategori doluluğu `products.category_id` ile ölçülürse 6, `+ subcategory_id` ile 23 çıkar.
 * VİTRİNİN OKUDUĞU İKİNCİSİDİR (family.service.ts). Karne vitrinin yolunu kullanır ve
 * hangi yolu kullandığını her satırda yazar — çünkü "31 boş kategori" diye rapor edilen
 * sayı 2026-09-07'de tam bu yüzden yanlıştı.
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
const H = { apikey: K, authorization: `Bearer ${K}` }

async function hepsi(t, sec) {
  const r = await fetch(`${U}/rest/v1/${t}?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
  const kesin = Number((r.headers.get('content-range') || '').split('/')[1])
  let out = []
  for (let off = 0; ; off += 1000) {
    const b = await (await fetch(`${U}/rest/v1/${t}?select=${sec}&order=id&limit=1000&offset=${off}`, { headers: H })).json()
    if (!Array.isArray(b)) { console.error(`⛔ ${t} okunamadı`); process.exit(1) }
    out = out.concat(b); if (b.length < 1000) break
  }
  if (out.length !== kesin) { console.error(`⛔ ${t}: çekilen ${out.length} ≠ sunucu ${kesin} — KARNE ÜRETİLMEDİ (fail-closed)`); process.exit(1) }
  return out
}

const urun = await hepsi('products', 'id,sku,name,name_i18n,description_i18n,technical_specs,category_id,subcategory_id,family_id')
const kategori = await hepsi('categories', 'id,name,metadata,description')
const aile = await hepsi('product_families', 'id,name,name_i18n,description')
const fiyat = await hepsi('product_prices', 'id,product_id')
const gorsel = await hepsi('product_images', 'id,product_id')

const dolu = (v) => v != null && v !== '' && !(typeof v === 'object' && Object.keys(v).length === 0)
const alanSayisi = (x) => Object.keys(x.technical_specs || {}).length

// Kategori doluluğu: VİTRİNİN yolu — category_id VEYA subcategory_id
const kategorideUrun = new Map(kategori.map(c => [c.id, 0]))
for (const u of urun) {
  for (const k of [u.category_id, u.subcategory_id]) if (k && kategorideUrun.has(k)) kategorideUrun.set(k, kategorideUrun.get(k) + 1)
}
const bosKategori = [...kategorideUrun.values()].filter(n => n === 0).length

const fiyatliUrun = new Set(fiyat.map(f => f.product_id)).size
const gorselliUrun = new Set(gorsel.map(g => g.product_id)).size

const satir = [
  ['Ürün', urun.length, ''],
  ['Teknik alanı HİÇ olmayan ürün', urun.filter(u => alanSayisi(u) === 0).length, `ortalama alan: ${(urun.reduce((n, u) => n + alanSayisi(u), 0) / urun.length).toFixed(1)}`],
  ['EN adı olan ürün', urun.filter(u => dolu(u.name_i18n?.en)).length + ' / ' + urun.length, 'name_i18n.en'],
  ['TR açıklaması olan ürün', urun.filter(u => dolu(u.description_i18n?.tr)).length + ' / ' + urun.length, 'description_i18n.tr'],
  ['EN açıklaması olan ürün', urun.filter(u => dolu(u.description_i18n?.en)).length + ' / ' + urun.length, 'description_i18n.en'],
  ['Fiyat satırı olan ürün', fiyatliUrun + ' / ' + urun.length, `product_prices ${fiyat.length} satır`],
  ['Görseli olan ürün', gorselliUrun + ' / ' + urun.length, `product_images ${gorsel.length} kayıt`],
  ['TR metni olan kategori', kategori.filter(c => dolu(c.metadata?.description_i18n?.tr)).length + ' / ' + kategori.length, 'metadata.description_i18n.tr'],
  ['BOŞ kategori (ürünü yok)', bosKategori + ' / ' + kategori.length, '⚠ category_id VEYA subcategory_id — vitrinin yolu'],
  ['TR metni olan aile', aile.filter(a => dolu(a.description?.tr)).length + ' / ' + aile.length, 'description.tr'],
  ['EN metni olan aile', aile.filter(a => dolu(a.description?.en)).length + ' / ' + aile.length, 'description.en'],
]

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ damga: new Date().toISOString(), satir: Object.fromEntries(satir.map(([a, b]) => [a, String(b)])) }, null, 2))
} else {
  console.log(`KATALOG KARNESİ — ${new Date().toISOString()}\n`)
  for (const [ad, deg, not] of satir) console.log(`  ${ad.padEnd(32)} ${String(deg).padStart(12)}   ${not}`)
  console.log(`\n  Her satır kendi ölçüt yolunu yazar. Yol değişirse SAYI DEĞİŞİR — kıyaslamadan önce yola bak.`)
}
