#!/usr/bin/env node
/**
 * YÖNLENDİRME TABLOSU KAPISI (ALT-177, kaynak: adres-semasi-standard.md A5-A7, A9; URN-157 tablosu).
 *
 * Girdi: URUN'un eski -> yeni eşleştirme tablosu (CSV, ayraç ";", başlık `eski;yeni;kod;tur;kaynak;not`).
 * Kapı TABLOYU ölçer, hiçbir yönlendirme üretmez ve canlıya bir şey koymaz. Saf mantık + CLI; ağ yok, LLM yok.
 *
 * Kurallar (her biri tek ihlal koduyla raporlanır):
 *   BASLIK       başlık tam `eski;yeni;kod;tur;kaynak;not` (sağlayıcıya özgü alan yok: A6)
 *   SATIR        sütun sayısı 6; kod 308|410; tur/kaynak izinli listede
 *   ESKI-BICIM   eski: /tr|/en önekli, `#` yok, sondaki `/` yok; sorgu varsa YALNIZ `?sku=<dolu>` ve tur=model
 *   YENI-BICIM   308'de yeni dolu: /tr|/en önekli, sorgu/`#` yok (A7), sondaki `/` yok, eski ile AYNI dil; 410'da yeni boş
 *   KENDINE      eski = yeni (değişmeyen adres tabloda olmaz; kendine yönlendirme döngüdür)
 *   CAKISMA      aynı eski iki satırda (farklı hedef = çakışma, aynı hedef = kopya)
 *   ZINCIR       bir satırın yeni adresi başka bir satırın eski adresi: 2 sıçrama (A9: tek sıçrama)
 *   OLU-HEDEF    yeni adres, 410 verilen bir eski adres
 *   HEDEF-YOK    (yalnız `hedefler` verilirse) yeni adres yeni sitenin yaşayan adres listesinde değil
 *   BUTCE        gzip(kompakt JSON) > bütçe (varsayılan 512 KiB: A7 sınırı 1 MiB, middleware'in kalanına pay bırakılır)
 *   SAGLAYICI    kural dosyaları sağlayıcıya özgü yönlendirme içermez (A6): vercel.json redirects/routes,
 *                public/_redirects içinde 3xx satırı
 *
 * Kip: çıkış 1 = ihlal var. CLI: node scripts/ci/yonlendirme-kapisi.cjs <tablo.csv> [--hedefler <dosya>] [--kok <dizin>]
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const BASLIK = 'eski;yeni;kod;tur;kaynak;not'
const KODLAR = ['308', '410']
const TURLER = ['kategori', 'aile', 'model', 'marka', 'rehber', 'sabit', 'takma-ad', 'eski-sku']
const KAYNAKLAR = ['site-haritasi', 'canli-db', 'takma-ad', 'dizin-listesi']
/** `?sku=` taşıyabilen satır türleri (URUN şeması: model satırları ve eski-sku). */
const SKU_TURLERI = ['model', 'eski-sku']
const DIL_ONEKI = /^\/(tr|en)(\/|$)/
/** Tablo için gzip bütçesi. A7 sınırı 1 MiB'dır (tüm middleware); tabloya yarısı ayrılır. */
const TABLO_BUTCESI_BAYT = 512 * 1024
/** Tablonun varsayılan yeri; URUN commit'li yolu bildirince güncellenir. Yoksa CLI/test no-op'tur. */
const VARSAYILAN_YOL = 'docs/plans/rec-300-adres-esleme/eski-yeni.csv'
/** Yeni sitenin yaşayan adres listesi (URUN, Design adres.json kaynaklı); varsa hedef statik denetlenir. */
const VARSAYILAN_HEDEFLER = 'docs/plans/rec-300-adres-esleme/yeni-site-adresleri.txt'

function csvAyristir(metin) {
  const satirlar = []
  const hatalar = []
  const temiz = String(metin).replace(/^﻿/, '')
  // RFC 4180 benzeri, ayraç ";": "çift tırnaklı" alan ayraç ve satır sonu taşıyabilir, "" = tek tırnak.
  const kayitlar = []
  let alan = ''
  let alanlar = []
  let tirnakta = false
  let baslangic = 1
  let satirNo = 1
  const kayitBitir = () => {
    alanlar.push(alan)
    kayitlar.push({ satir: baslangic, alanlar })
    alan = ''
    alanlar = []
  }
  for (let i = 0; i < temiz.length; i++) {
    const c = temiz[i]
    if (tirnakta) {
      if (c === '"') {
        if (temiz[i + 1] === '"') {
          alan += '"'
          i++
        } else tirnakta = false
      } else {
        if (c === '\n') satirNo++
        alan += c
      }
    } else if (c === '"' && alan === '') tirnakta = true
    else if (c === ';') {
      alanlar.push(alan)
      alan = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && temiz[i + 1] === '\n') i++
      kayitBitir()
      satirNo++
      baslangic = satirNo
    } else alan += c
  }
  if (tirnakta) hatalar.push({ kural: 'SATIR', satir: baslangic, mesaj: 'kapanmamış çift tırnak (ölçülemedi)' })
  if (alan !== '' || alanlar.length) kayitBitir()

  kayitlar.forEach((k, i) => {
    if (i === 0) {
      const b = k.alanlar.join(';').trim()
      if (b !== BASLIK) hatalar.push({ kural: 'BASLIK', satir: 1, mesaj: `başlık "${b}" beklenen "${BASLIK}" değil` })
      return
    }
    if (k.alanlar.length === 1 && k.alanlar[0].trim() === '') return
    if (k.alanlar.length !== 6) {
      hatalar.push({ kural: 'SATIR', satir: k.satir, mesaj: `${k.alanlar.length} sütun (6 olmalı)` })
      return
    }
    const [eski, yeni, kod, tur, kaynak, not] = k.alanlar.map((a) => a.trim())
    satirlar.push({ satir: k.satir, eski, yeni, kod, tur, kaynak, not })
  })
  return { satirlar, hatalar }
}

/** Karşılaştırma anahtarı: yol küçük harf (SKU dahil), sorgu korunur. */
function anahtar(adres) {
  return adres.toLowerCase().split('#')[0]
}

function eskiBicimi(s, ihlal) {
  const e = s.eski
  if (!DIL_ONEKI.test(e)) return ihlal('ESKI-BICIM', s, `eski "${e}" /tr ya da /en önekli değil`)
  if (e.includes('#')) return ihlal('ESKI-BICIM', s, `eski "${e}" parça (#) içeriyor`)
  const [yol, sorgu, ...fazla] = e.split('?')
  if (fazla.length) return ihlal('ESKI-BICIM', s, `eski "${e}" birden çok ?`)
  if (yol.length > 1 && yol.endsWith('/')) ihlal('ESKI-BICIM', s, `eski "${e}" sondaki / ile bitiyor`)
  if (sorgu !== undefined) {
    if (!/^sku=[^&=\s]+$/i.test(sorgu)) ihlal('ESKI-BICIM', s, `eski "${e}": sorgu yalnız ?sku=<değer> olabilir`)
    else if (!SKU_TURLERI.includes(s.tur)) ihlal('ESKI-BICIM', s, `eski "${e}": ?sku= yalnız tur=model|eski-sku satırında`)
  }
}

function yeniBicimi(s, ihlal) {
  if (s.kod === '410') {
    if (s.yeni !== '') ihlal('YENI-BICIM', s, `410 satırında yeni boş olmalı ("${s.yeni}")`)
    return
  }
  const y = s.yeni
  if (y === '') return ihlal('YENI-BICIM', s, '308 satırında yeni boş')
  if (!DIL_ONEKI.test(y)) return ihlal('YENI-BICIM', s, `yeni "${y}" /tr ya da /en önekli değil`)
  if (y.includes('?')) ihlal('YENI-BICIM', s, `yeni "${y}" sorgu taşıyor (A7: hedefte sorgu yok)`)
  if (y.length > 1 && y.endsWith('/')) ihlal('YENI-BICIM', s, `yeni "${y}" sondaki / ile bitiyor`)
  const dilE = (s.eski.match(DIL_ONEKI) || [])[1]
  const dilY = (y.match(DIL_ONEKI) || [])[1]
  if (dilE && dilY && dilE !== dilY) ihlal('YENI-BICIM', s, `dil değişiyor: ${dilE} -> ${dilY} (tek sıçrama aynı dilde kalır)`)
}

function gzipBayt(satirlar) {
  const kompakt = JSON.stringify(satirlar.map((s) => [s.eski, s.yeni, s.kod === '410' ? 410 : 308]))
  return zlib.gzipSync(kompakt, { level: 9 }).length
}

/**
 * @param {Array} satirlar csvAyristir çıktısı
 * @param {{hedefler?: Set<string>|null, butceBayt?: number}} secenek
 */
function denetle(satirlar, secenek = {}) {
  const ihlaller = []
  const ihlal = (kural, s, mesaj) => ihlaller.push({ kural, satir: s ? s.satir : 0, mesaj })
  const butce = secenek.butceBayt || TABLO_BUTCESI_BAYT
  const hedefler = secenek.hedefler || null

  const gorulen = new Map()
  const eskiSorgusuz = new Set()
  const olu = new Set()

  for (const s of satirlar) {
    if (!KODLAR.includes(s.kod)) ihlal('SATIR', s, `kod "${s.kod}" 308 ya da 410 değil`)
    if (!TURLER.includes(s.tur)) ihlal('SATIR', s, `tur "${s.tur}" izinli değil`)
    if (!KAYNAKLAR.includes(s.kaynak)) ihlal('SATIR', s, `kaynak "${s.kaynak}" izinli değil`)
    eskiBicimi(s, ihlal)
    yeniBicimi(s, ihlal)

    const k = anahtar(s.eski)
    if (gorulen.has(k)) {
      const onceki = gorulen.get(k)
      const ayni = anahtar(onceki.yeni) === anahtar(s.yeni) && onceki.kod === s.kod
      ihlal('CAKISMA', s, `${s.eski} satır ${onceki.satir} ile ${ayni ? 'kopya' : 'çakışıyor (farklı hedef)'}`)
    } else gorulen.set(k, s)

    if (!s.eski.includes('?')) eskiSorgusuz.add(k)
    if (s.kod === '410') olu.add(k)
    if (s.kod === '308' && s.yeni && anahtar(s.yeni) === k) ihlal('KENDINE', s, `${s.eski} kendine yönlendiriyor`)
  }

  for (const s of satirlar) {
    if (s.kod !== '308' || !s.yeni) continue
    const y = anahtar(s.yeni)
    if (y !== anahtar(s.eski) && eskiSorgusuz.has(y)) {
      ihlal('ZINCIR', s, `${s.eski} -> ${s.yeni} -> (satır ${gorulen.get(y).satir}'de yine yönlendiriliyor): tek sıçrama değil`)
    }
    if (olu.has(y)) ihlal('OLU-HEDEF', s, `${s.eski} -> ${s.yeni}: hedef 410 veriyor`)
    if (hedefler && !hedefler.has(y)) ihlal('HEDEF-YOK', s, `${s.yeni} yeni sitenin yaşayan adresleri arasında değil`)
  }

  const bayt = gzipBayt(satirlar)
  if (bayt > butce) ihlal('BUTCE', null, `tablo gzip ${bayt} bayt > bütçe ${butce} bayt`)

  return { ihlaller, bayt, butceBayt: butce, satirSayisi: satirlar.length, hedefOlculdu: !!hedefler }
}

/** A6: sağlayıcıya özgü yönlendirme dosyası/özelliği var mı (kök dizin üzerinden, saf okuma). */
function saglayiciOzguDenetle(kok) {
  const ihlaller = []
  const vercel = path.join(kok, 'vercel.json')
  if (fs.existsSync(vercel)) {
    let j = null
    try {
      j = JSON.parse(fs.readFileSync(vercel, 'utf8'))
    } catch {
      ihlaller.push({ kural: 'SAGLAYICI', satir: 0, mesaj: 'vercel.json okunamadı (ölçülemedi)' })
    }
    if (j && (j.redirects !== undefined || j.routes !== undefined)) {
      ihlaller.push({ kural: 'SAGLAYICI', satir: 0, mesaj: 'vercel.json redirects/routes içeriyor (A6: sağlayıcıya özgü yönlendirme yok)' })
    }
  }
  const redirects = path.join(kok, 'public', '_redirects')
  if (fs.existsSync(redirects)) {
    fs.readFileSync(redirects, 'utf8')
      .split(/\r?\n/)
      .forEach((satir, i) => {
        const t = satir.trim()
        if (!t || t.startsWith('#')) return
        const durum = t.split(/\s+/)[2]
        if (durum && /^30[1278]!?$/.test(durum)) {
          ihlaller.push({ kural: 'SAGLAYICI', satir: i + 1, mesaj: `public/_redirects ${durum} satırı içeriyor (A6)` })
        }
      })
  }
  return ihlaller
}

/** Yaşayan adres listesi: satır satır yol; boş satır ve `#` yorumu atlanır; küçük harf. */
function hedefOku(metin) {
  return new Set(
    String(metin)
      .split(/\r?\n/)
      .map((x) => x.trim().toLowerCase())
      .filter((x) => x && !x.startsWith('#')),
  )
}

function rapor(sonuc) {
  const satirlar = sonuc.ihlaller.map((i) => `  ✗ ${i.kural}${i.satir ? ` (satır ${i.satir})` : ''}: ${i.mesaj}`)
  const ozet = `yonlendirme-kapisi: ${sonuc.satirSayisi} satır, gzip ${sonuc.bayt}/${sonuc.butceBayt} bayt, hedef200 ${sonuc.hedefOlculdu ? 'ölçüldü' : 'ÖLÇÜLMEDİ (yaşayan adres listesi verilmedi)'}, ${sonuc.ihlaller.length} ihlal`
  return [ozet, ...satirlar.slice(0, 50), satirlar.length > 50 ? `  … ${satirlar.length - 50} ihlal daha` : ''].filter(Boolean).join('\n')
}

function main(argv, kokVarsayilan) {
  const args = argv.slice(2)
  const al = (ad) => {
    const i = args.indexOf(ad)
    return i >= 0 ? args[i + 1] : null
  }
  const kok = al('--kok') || kokVarsayilan
  const tabloYolu = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))) || path.join(kok, VARSAYILAN_YOL)
  const sag = saglayiciOzguDenetle(kok)
  if (!fs.existsSync(tabloYolu)) {
    console.log(`yonlendirme-kapisi: tablo yok (${tabloYolu}) — tablo kapısı atlandı; sağlayıcı denetimi ${sag.length} ihlal`)
    sag.forEach((i) => console.log(`  ✗ ${i.kural}: ${i.mesaj}`))
    return sag.length ? 1 : 0
  }
  const { satirlar, hatalar } = csvAyristir(fs.readFileSync(tabloYolu, 'utf8'))
  const varsayilanHedef = path.join(kok, VARSAYILAN_HEDEFLER)
  const hedefDosya = al('--hedefler') || (fs.existsSync(varsayilanHedef) ? varsayilanHedef : null)
  const hedefler = hedefDosya ? hedefOku(fs.readFileSync(hedefDosya, 'utf8')) : null
  const sonuc = denetle(satirlar, { hedefler })
  sonuc.ihlaller.unshift(...hatalar)
  sonuc.ihlaller.push(...sag)
  console.log(rapor(sonuc))
  return sonuc.ihlaller.length ? 1 : 0
}

module.exports = {
  BASLIK,
  KODLAR,
  TURLER,
  KAYNAKLAR,
  TABLO_BUTCESI_BAYT,
  VARSAYILAN_YOL,
  VARSAYILAN_HEDEFLER,
  hedefOku,
  csvAyristir,
  denetle,
  saglayiciOzguDenetle,
  rapor,
  main,
}

if (require.main === module) {
  process.exit(main(process.argv, path.resolve(__dirname, '../..')))
}
