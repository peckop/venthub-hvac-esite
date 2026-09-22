#!/usr/bin/env node
/**
 * TAŞINABİLİR KATALOG — CSV KATMANI ROUND-TRIP KAPISI (REC-212, karar 66)
 *
 * ── NİÇİN VAR
 * `katalog-geri-yukle.mjs` paketin HAM yarısını (jsonl) canlıyla karşılaştırır. Ama Recep'in
 * gözle kontrol ettiği ve sözleşmenin tarif ettiği şey CSV'lerdir; CSV'ler ham'dan ÜRETİLİR.
 * Üretim bir kolonu yanlış kaynaktan okursa (2026-09-10'a kadar `fiyat` 1044/1044 BOŞ gitti,
 * çünkü var olmayan `price`/`amount` okunuyordu) ham round-trip yine SIFIR FARK verir — kusur
 * ham ile CSV arasında yaşar ve o katmanı hiçbir şey ölçmüyordu. Bu kapı o katmanı ölçer.
 *
 * OPS hükmü (2026-09-22): K3-b yayın şartı = 8 kolon + BU kapının sıfır farkı. Yazma kolu şart değil.
 *
 * ── NE ÖLÇER (yalnız okur, hiçbir şey yazmaz, ağa çıkmaz)
 *   1. BAŞLIK: her CSV'nin başlığı sözleşmeyle (`paket-sozlesme.mjs`) BİREBİR aynı mı.
 *   2. SATIR: CSV satır sayısı = ham satır sayısı (teknikte: dolu teknik değer sayısı).
 *   3. HÜCRE: `HAM_ESLEME`deki her kolon, ham değerin paket biçimiyle (paketHucresi) eşit mi.
 *   4. BAĞ: görsel/fiyat satırının `sku`'su, ham satırın product_id'sinin ürününe mi ait.
 *   5. DOLULUK (bilgi, kapı değil): pakete özgü kolonlarda kaç hücre dolu — boş kolon
 *      "kolon var" demek değildir; sayı raporda görünür.
 *
 * ── ÇIKIŞ: 0 = sıfır fark · 1 = fark var · 2 = paket eksik/okunamadı (fail-closed)
 *
 * KOŞUM: node scripts/icerik-hatti/paket-csv-dogrula.mjs --paket=<paket-dizini>
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  URUN_BASLIK, TEKNIK_BASLIK, TEKNIK_BASLIK_ADIM3, GORSEL_BASLIK, FIYAT_BASLIK,
  HAM_ESLEME, paketHucresi, csvOku,
} from './paket-sozlesme.mjs'

const PAKET = process.argv.find(a => a.startsWith('--paket='))?.slice(8)
if (!PAKET) { console.error('⛔ --paket=<dizin> gerekli'); process.exit(2) }
const HAM = existsSync(join(PAKET, 'ham')) ? join(PAKET, 'ham') : PAKET

const hamOku = (t) => {
  const yol = join(HAM, `${t}.jsonl`)
  if (!existsSync(yol)) { console.error(`⛔ ${t}.jsonl YOK (${HAM}) — ham yarı eksik`); process.exit(2) }
  return readFileSync(yol, 'utf8').split(/\n/).filter(Boolean).map(s => JSON.parse(s))
}
const csv = (ad) => {
  const yol = join(PAKET, ad)
  if (!existsSync(yol)) { console.error(`⛔ ${ad} YOK — önce katalog-paket-uret.mjs`); process.exit(2) }
  return csvOku(readFileSync(yol, 'utf8'))
}

const urunler = hamOku('products')
const skuById = new Map(urunler.map(u => [u.id, u.sku]))
const fark = []
const rapor = []

function basligiDenetle(ad, gercek, ...kabul) {
  const tutan = kabul.find(b => b.length === gercek.length && b.every((x, i) => x === gercek[i]))
  if (!tutan) fark.push(`${ad}: BAŞLIK sözleşmeyle tutmuyor → [${gercek.join(';')}]`)
}

function hucreleriDenetle(ad, satirlar, ham) {
  const { kolonlar } = HAM_ESLEME[ad]
  if (satirlar.length !== ham.length) {
    fark.push(`${ad}: SATIR ${satirlar.length} ≠ ham ${ham.length}`)
    return 0
  }
  let hucre = 0
  for (let i = 0; i < ham.length; i++) {
    for (const [pk, hk] of Object.entries(kolonlar)) {
      hucre++
      const beklenen = paketHucresi(ham[i][hk])
      if (satirlar[i][pk] !== beklenen) {
        fark.push(`${ad} satır ${i + 2} · ${pk}: CSV "${satirlar[i][pk]}" ≠ ham ${hk} "${beklenen}"`)
      }
    }
    if (ham[i].product_id !== undefined) {
      hucre++
      const sku = skuById.get(ham[i].product_id) ?? ''
      if (satirlar[i].sku !== sku) fark.push(`${ad} satır ${i + 2} · sku BAĞI: "${satirlar[i].sku}" ≠ ürün "${sku}"`)
    }
  }
  return hucre
}

const doluluk = (satirlar, kolonlar) =>
  kolonlar.map(k => `${k} ${satirlar.filter(r => (r[k] ?? '') !== '').length}/${satirlar.length}`).join(' · ')

// ── ürünler
{
  const c = csv('urunler.csv')
  basligiDenetle('urunler.csv', c.basliklar, URUN_BASLIK)
  const h = hucreleriDenetle('urunler.csv', c.satirlar, urunler)
  rapor.push(['urunler.csv', c.satirlar.length, h, doluluk(c.satirlar, ['ust_kategori', 'alt_kategori'])])
}
// ── görseller
{
  const c = csv('gorseller.csv')
  basligiDenetle('gorseller.csv', c.basliklar, GORSEL_BASLIK)
  const h = hucreleriDenetle('gorseller.csv', c.satirlar, hamOku('product_images'))
  rapor.push(['gorseller.csv', c.satirlar.length, h, doluluk(c.satirlar, ['alt_metin'])])
}
// ── fiyatlar
{
  const c = csv('fiyatlar.csv')
  basligiDenetle('fiyatlar.csv', c.basliklar, FIYAT_BASLIK)
  const h = hucreleriDenetle('fiyatlar.csv', c.satirlar, hamOku('product_prices'))
  rapor.push(['fiyatlar.csv', c.satirlar.length, h,
    doluluk(c.satirlar, ['fiyat', 'brut_fiyat', 'kdv', 'kaynak_fiyat_eur', 'fiyat_kaynak_sayfa'])])
}
// ── teknik özellikler: satır = ürün × dolu alan (üreticinin kuralı: null ve '' atlanır)
{
  const c = csv('teknik-ozellikler.csv')
  basligiDenetle('teknik-ozellikler.csv', c.basliklar, TEKNIK_BASLIK, TEKNIK_BASLIK_ADIM3)
  const beklenen = new Map()
  for (const u of urunler) {
    const t = u.technical_specs
    if (!t || typeof t !== 'object') continue
    for (const [alan, d] of Object.entries(t)) {
      if (d == null || d === '') continue
      beklenen.set(`${u.sku}\u0000${alan}`, paketHucresi(d))
    }
  }
  let hucre = 0
  const gorulen = new Set()
  for (const [i, r] of c.satirlar.entries()) {
    const k = `${r.sku}\u0000${r.alan}`
    hucre++
    if (gorulen.has(k)) { fark.push(`teknik satır ${i + 2}: ${r.sku}·${r.alan} İKİ KEZ`); continue }
    gorulen.add(k)
    if (!beklenen.has(k)) fark.push(`teknik satır ${i + 2}: ${r.sku}·${r.alan} hamda YOK`)
    else if (beklenen.get(k) !== r.deger) fark.push(`teknik satır ${i + 2}: ${r.sku}·${r.alan} CSV "${r.deger}" ≠ ham "${beklenen.get(k)}"`)
  }
  for (const k of beklenen.keys()) if (!gorulen.has(k)) fark.push(`teknik: ${k.replace('\u0000', '·')} CSV'de EKSİK`)
  rapor.push(['teknik-ozellikler.csv', c.satirlar.length, hucre, doluluk(c.satirlar, ['birim', 'baslik_tr'])])
}

console.log(`CSV KATMANI ROUND-TRIP · ${PAKET}\n`)
for (const [ad, n, h, d] of rapor) console.log(`  ${ad.padEnd(22)} satır ${String(n).padStart(5)} · karşılaştırılan hücre ${String(h).padStart(6)}\n    doluluk: ${d}`)
console.log('')
if (fark.length) {
  console.log(`⛔ FARK ${fark.length}`)
  for (const f of fark.slice(0, 40)) console.log(`   ${f}`)
  if (fark.length > 40) console.log(`   … ${fark.length - 40} fark daha`)
  process.exit(1)
}
console.log('✓ CSV KATMANI SIFIR FARK — paket CSV\'leri ham döküm ile hücre hücre aynı')
console.log('  (doluluk satırı bilgi içindir: pakete özgü kolonun boş olması fark sayılmaz, beyan edilir)')
