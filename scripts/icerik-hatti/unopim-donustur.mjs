#!/usr/bin/env node
/**
 * KTL-80 · UnoPIM dışa aktarma CSV'si → katalog_model satırları (KURU KOŞU; hiçbir yere YAZMAZ, ağa çıkmaz).
 *
 * Girdi : UnoPIM "Export Now" CSV'si (ürün başına en_US + tr_TR satırı), birim-etiketi-esleme.csv,
 *         isteğe bağlı gorsel-sinif-listesi.csv (sku, sinif, gorsel_dosyasi).
 * Çıktı : --cikti klasörüne (depo DIŞI olmalı) katalog_model.json, katalog_model_gorsel.json,
 *         hata.csv, ozet.json. Canlı Supabase'e ve UnoPIM'e yazım YOK.
 * Çıkış : 0 = koşum tamam (hata satırı olması çıkışı bozmaz; ozet.json'a bakılır),
 *         2 = girdi okunamadı / eşleme tablosu kendi içinde tutarsız (ÖLÇÜLEMEDİ, fail-closed).
 *
 * Kullanım:
 *   node scripts/icerik-hatti/unopim-donustur.mjs --csv <unopim-urunler.csv> \
 *     --birim <birim-etiketi-esleme.csv> [--sinif <gorsel-sinif-listesi.csv>] --cikti <klasör>
 *
 * Kurallar: unopim-donustur-kurallar.mjs (KTL-76 planı §1).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  birimHaritasi, csvAyristir, csvNesneler, dilGrupla, modelDonustur, teknikSutunlar, yayinEngelleri,
} from './unopim-donustur-kurallar.mjs'

function arguman(ad) {
  const i = process.argv.indexOf(`--${ad}`)
  return i > -1 ? process.argv[i + 1] : null
}

function csvYaz(satirlar, sutunlar) {
  const kac = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [sutunlar.join(','), ...satirlar.map((r) => sutunlar.map((s) => kac(r[s])).join(','))].join('\n') + '\n'
}

function dur(mesaj) {
  console.error(`ÖLÇÜLEMEDİ: ${mesaj}`)
  process.exit(2)
}

const csvYolu = arguman('csv')
const birimYolu = arguman('birim')
const sinifYolu = arguman('sinif')
const cikti = arguman('cikti')
if (!csvYolu || !birimYolu || !cikti) dur('--csv, --birim ve --cikti zorunlu')

let ham
let birimMetni
try {
  ham = readFileSync(csvYolu, 'utf8')
  birimMetni = readFileSync(birimYolu, 'utf8')
} catch (hata) {
  dur(`girdi okunamadı: ${hata.message}`)
}

const { harita: birimler, hatalar: birimHatalari } = birimHaritasi(csvNesneler(birimMetni))
if (birimHatalari.length) dur(`birim eşleme tablosu tutarsız:\n  ${birimHatalari.join('\n  ')}`)

const baslik = csvAyristir(ham)[0]
if (!baslik || !baslik.includes('sku') || !baslik.includes('locale')) dur('CSV başlığında sku/locale yok')
const teknikAlanlar = teknikSutunlar(baslik)
const { gruplar, tekrar } = dilGrupla(csvNesneler(ham))

const modeller = []
const hatalar = tekrar.map((t) => ({ sku: t.sku, kod: 'DIL_SATIRI', ayrinti: t.ayrinti }))
const eksikSayac = {}
const engelSayac = {}
let kabul = 0
let yayinHazir = 0
let egriKaynaksiz = 0
for (const [sku, g] of gruplar) {
  const sonuc = modelDonustur(g, teknikAlanlar, birimler)
  for (const h of sonuc.hatalar) hatalar.push({ sku, ...h })
  for (const e of sonuc.eksikler) eksikSayac[e] = (eksikSayac[e] || 0) + 1
  const engel = yayinEngelleri(sonuc.eksikler)
  for (const e of engel) engelSayac[e] = (engelSayac[e] || 0) + 1
  if (sonuc.kabul) kabul++
  if (sonuc.kabul && engel.length === 0) yayinHazir++
  if (sonuc.egriKaynaksiz) egriKaynaksiz++
  modeller.push({ ...sonuc.satir, kabul: sonuc.kabul, yayin_engelleri: engel })
}

// Görsel: kaynak arşivdir (sku → arşiv yolu). UnoPIM yolu YENİ şemada anlamsızdır. Yükleme (Storage) ayrı onaydır.
let gorseller = []
let gorselYok = []
if (sinifYolu) {
  let sinifMetni
  try {
    sinifMetni = readFileSync(sinifYolu, 'utf8')
  } catch (hata) {
    dur(`sınıf listesi okunamadı: ${hata.message}`)
  }
  const sinif = new Map(csvNesneler(sinifMetni).map((r) => [r.sku, r]))
  for (const m of modeller) {
    const s = sinif.get(m.sku)
    if (!s) { if (m.unopim_gorsel_yolu) gorselYok.push(m.sku); continue }
    gorseller.push({
      sku: m.sku, sira: 1, arsiv_dosyasi: s.gorsel_dosyasi, sinif: s.sinif,
      yayin_uyarisi: s.sinif === 'seri-tahmin' ? 'seri-tahmin: yayına alınmaz' : null,
      alt_tr: null, alt_en: null,
    })
  }
}

mkdirSync(cikti, { recursive: true })
writeFileSync(join(cikti, 'katalog_model.json'), JSON.stringify(modeller, null, 1))
writeFileSync(join(cikti, 'katalog_model_gorsel.json'), JSON.stringify(gorseller, null, 1))
writeFileSync(join(cikti, 'hata.csv'), csvYaz(hatalar, ['sku', 'kod', 'ayrinti']))
const hataKodlari = {}
for (const h of hatalar) hataKodlari[h.kod] = (hataKodlari[h.kod] || 0) + 1
const ozet = {
  girdi: { csv: csvYolu, satir: gruplar.size * 2, urun: gruplar.size, teknik_sutun: teknikAlanlar.length },
  kabul_edilen: kabul,
  reddedilen: gruplar.size - kabul,
  yayina_hazir: yayinHazir,
  yayin_engelleri: engelSayac,
  eksik: eksikSayac,
  hata_kodlari: hataKodlari,
  egri_kaynaksiz_urun: egriKaynaksiz,
  gorsel: { satir: gorseller.length, unopim_gorselli_ama_arsivde_yok: gorselYok.length, seri_tahmin: gorseller.filter((x) => x.sinif === 'seri-tahmin').length },
  not: 'Kuru koşu: canlı Supabase ve UnoPIM\'e yazım YOK. Slug karar bekliyor (Adres Şeması v3). Teknik anahtar denetimi: ozellik-sozlugu bulunmadı, YAPILMADI.',
}
writeFileSync(join(cikti, 'ozet.json'), JSON.stringify(ozet, null, 1))
console.log(JSON.stringify(ozet, null, 1))
