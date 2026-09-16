#!/usr/bin/env node
/**
 * KATALOG KARNESİ — EVREN = PAKET (OPS hükmü 2026-09-09 12:32Z, Recep kararı K13)
 *
 * ── NİÇİN EVREN PAKET, DB DEĞİL
 * K13: *"Paket ANA KAYNAKTIR, DB pakete göre denetlenir."* Karne DB'ye bakarsa, paket ile
 * DB ayrıştığında karne **DB'nin** karnesi olur ve asıl kaynağın durumu ölçülmemiş kalır.
 * 2026-09-09'daki %59'luk karne DB evreniyle çıkarılmıştı; bu betik aynı eksenleri
 * paketten okur. DB ile karşılaştırma **adım 5'in fark raporunun** işidir, karnenin değil.
 *
 * ── KARNE BİR BETİKTİR, BİR BELGE DEĞİL
 * Önceki karne elle altı ayrı ölçümle çıkarılmıştı ve tekrarlanabilir değildi — bayat sayı
 * yalan söyler. Bu betik her koşumda aynı satırları üretir; belgeye sayı YAZILMAZ,
 * belgeye betiğin ÇIKTISI yapıştırılır.
 *
 * KOŞUM: node scripts/icerik-hatti/paket-karnesi.mjs --hedef=<paket>
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). Canlı DB'ye DOKUNMAZ — dosya okur.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const HEDEF = process.argv.find(a => a.startsWith('--hedef='))?.slice(8) || 'katalog-paketi'

const csvOku = (ad) => {
  const yol = join(HEDEF, `${ad}.csv`)
  if (!existsSync(yol)) return null
  const ham = readFileSync(yol, 'utf8').replace(/^﻿/, '')
  const satirlar = []
  let hucre = '', satir = [], tirnak = false
  for (let i = 0; i < ham.length; i++) {
    const c = ham[i]
    if (tirnak) {
      if (c === '"' && ham[i + 1] === '"') { hucre += '"'; i++ }
      else if (c === '"') tirnak = false
      else hucre += c
    } else if (c === '"') tirnak = true
    else if (c === ';') { satir.push(hucre); hucre = '' }
    else if (c === '\n') { satir.push(hucre); satirlar.push(satir); satir = []; hucre = '' }
    else if (c !== '\r') hucre += c
  }
  if (hucre || satir.length) { satir.push(hucre); satirlar.push(satir) }
  const bas = satirlar.shift()
  return satirlar.filter(s => s.some(v => v !== ''))
    .map(s => Object.fromEntries(bas.map((b, i) => [b, s[i] ?? ''])))
}

const urunler = csvOku('urunler')
if (!urunler) { console.error(`ÖLÇÜLEMEDİ — paket YOK: ${HEDEF}`); process.exit(2) }
const N = urunler.length

// Bir eksen ÖLÇÜLEMEDİYSE sıfır yazılmaz — dosya yoksa satır "ÖLÇÜLEMEDİ" der.
// Eksik dosyayı %0 saymak, olmayan bir kusuru rapor etmek olurdu.
const skuKume = (ad, sart = () => true) => {
  const r = csvOku(ad)
  if (!r) return null
  return new Set(r.filter(sart).map(x => x.sku).filter(Boolean))
}

const eksenler = []
const ekle = (ad, kume, not = '') => {
  if (kume === null) { eksenler.push({ ad, metin: 'ÖLÇÜLEMEDİ (dosya yok)', oran: null, not }); return }
  eksenler.push({ ad, metin: `${kume.size} / ${N}`, oran: kume.size / N, not })
}

ekle('Görsel', skuKume('gorseller'))
ekle('Teknik özellik', skuKume('teknik-ozellikler'))
ekle('Fiyat', skuKume('fiyatlar'))
ekle('Türkçe açıklama', skuKume('aciklamalar', r => r.aciklama_tr?.trim()))
ekle('İngilizce açıklama', skuKume('aciklamalar', r => r.aciklama_en?.trim()))
ekle('İngilizce ad', skuKume('aciklamalar', r => r.ad_en?.trim()))

// Belge ekseni ürün değil AİLE üzerinden ölçülür — belge bağı aile düzeyindedir (K8).
const belgeler = csvOku('belgeler')
const aileler = csvOku('aileler')
let belgeSatiri
if (!belgeler || !aileler) belgeSatiri = { ad: 'Belge bağı (aile)', metin: 'ÖLÇÜLEMEDİ (dosya yok)', oran: null }
else {
  const bagli = new Set(belgeler.map(b => b.aile_slug).filter(Boolean))
  belgeSatiri = { ad: 'Belge bağı (aile)', metin: `${bagli.size} / ${aileler.length}`,
    oran: bagli.size / aileler.length, not: 'pakette belgeler.csv — DB tablosu HÂLÂ YOK (REC-145)' }
}

// Kaynak kanıtı ekseni: adım 3'ün `durum` kolonu. Kolon yoksa ölçülemedi denir.
const teknik = csvOku('teknik-ozellikler')
let kanitSatiri = { ad: 'Teknik değer KANITI', metin: 'ÖLÇÜLEMEDİ (durum kolonu yok)', oran: null }
if (teknik && teknik[0] && 'durum' in teknik[0]) {
  const say = (d) => teknik.filter(t => t.durum === d).length
  const turev = say('TUREV'), kodsuz = say('KOD YOK')
  const aranabilir = teknik.length - turev - kodsuz
  kanitSatiri = { ad: 'Teknik değer KANITI', metin: `${say('VAR')} / ${aranabilir}`,
    oran: say('VAR') / aranabilir,
    not: `aranabilir evren (${teknik.length} − türev ${turev} − kodsuz ${kodsuz}); tesadüf payı ~%16` }
}

const yuzde = (o) => o == null ? '—' : `%${(o * 100).toFixed(0)}`
console.log(`KATALOG KARNESİ — EVREN: PAKET (${HEDEF})`)
console.log(`Ürün evreni: ${N}\n`)
console.log('| eksen | var | oran |')
console.log('|---|---|---|')
for (const e of [...eksenler, kanitSatiri, belgeSatiri]) {
  console.log(`| ${e.ad} | ${e.metin} | **${yuzde(e.oran)}** |${e.not ? ` <!-- ${e.not} -->` : ''}`)
}

const olculen = [...eksenler, kanitSatiri, belgeSatiri].filter(e => e.oran != null)
const genel = olculen.reduce((a, e) => a + e.oran, 0) / olculen.length
console.log(`\nGENEL: %${(genel * 100).toFixed(0)} (${olculen.length} eksenin ortalaması)`)
console.log('⚠Ortalama bir ÖZETTİR, hedef değildir: eksenlerin ağırlığı eşit değil —')
console.log('  müşteriye açık belge ile İngilizce ad aynı şey değil. Satırları oku.')
for (const e of [...eksenler, kanitSatiri, belgeSatiri]) {
  if (e.oran == null) console.log(`⛔ÖLÇÜLEMEDİ: ${e.ad}`)
}
