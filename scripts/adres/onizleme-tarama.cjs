#!/usr/bin/env node
/**
 * ÖNİZLEME ADRES TARAMASI (ALT-37b; Cuma 9 Ekim ADRES önizlemesi, karar 68, adres planı Faz 4).
 *
 * NE YAPAR: yerelde açık kipte derlenmiş sunucuya (varsayılan http://localhost:3000) yalnız GET atar ve
 * her adresin BEKLENEN cevabı verip vermediğini tablo olarak yazar: adres · beklenen · gerçek · durum.
 *
 * BEKLENTİ KAYNAKLARI (hiçbiri elle yazılmış adres listesi değildir):
 *  1. rota dili tablosu (`src/config/rotaDili.veri.json`): her satır × {tr, en}
 *       · yeni adres → 200, yönlendirme yok;
 *       · eski dilli adres (`/tr/legal/kvkk`) → TEK 308, hedef tablodaki yeni adres, hedef 200;
 *       · eski DİLSİZ adres (`/legal/kvkk`) → TEK sıçrama (307/308), hedef yeni adres (R4).
 *  2. model adres listesi (`docs/plans/rec300-model-adres-listesi-2026-09-23.csv`, 442 model, 47 aile):
 *     her aileden en az 1 model (+ `--ornek N` ek örnek): yeni TR/EN adres → 200; bugünkü
 *     `/tr|en/products/<slug_bugun>` → TEK 308, hedef CSV'deki yeni adres.
 *  3. eski kategori adresleri (tohum `src/data/eski-adres-tohum.json`): hedef yeni ağacın (#1352,
 *     Faz 1-B) adresidir, canlı veritabanında henüz yok → durum BEKLİYOR (gerçek yazılır, hata sayılmaz).
 *
 * DURUM: OK · KIRMIZI (beklenenden farklı ya da ZİNCİR: 2+ sıçrama, döngü, sıçrama sınırı aşımı: bunlar
 * ölçüm hatası değil sitenin yönlendirme kusurudur) · HATA (ölçülemedi: ağ/zaman aşımı/429/5xx) ·
 * BEKLİYOR (bağlı olduğu veri henüz yok). "Ölçemedim" ile "ihlal" ayrı sayılır, ayrı yazılır.
 * Çıkış: 0 KIRMIZI ve HATA yok · 1 var · 2 kullanım/girdi hatası (BOŞ beklenti listesi de 2: hiçbir şey
 * taranmadan yeşil çıkılmaz).
 *
 * SALT OKUMA: yalnız GET (matris.cjs ile aynı istemci: gövde okunmaz, elle yönlendirme, 10 sn zaman aşımı).
 *
 * KULLANIM
 *   node scripts/adres/onizleme-tarama.cjs --taban http://localhost:3000 [--cikti tarama.json] [--ornek 2]
 *   node scripts/adres/onizleme-tarama.cjs --liste        # ağ yok; yalnız beklenen adresleri yazar
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const { adresiIzle, ag, sirala } = require('./matris.cjs')

const KOK = path.resolve(__dirname, '..', '..')
const VARSAYILAN_TABAN = 'http://localhost:3000'
const VARSAYILAN_MODEL_LISTESI = path.join(KOK, 'docs', 'plans', 'rec300-model-adres-listesi-2026-09-23.csv')
const TABLO_YOLU = path.join(KOK, 'src', 'config', 'rotaDili.veri.json')
const TOHUM_YOLU = path.join(KOK, 'src', 'data', 'eski-adres-tohum.json')
const DILLER = ['tr', 'en']
const EN_COK_ESZAMANLI = 4
const KATEGORI_ORNEK_SAYISI = 6
/** Ölçüm hatası değil, sitenin kendi yönlendirme kusuru olan `adresiIzle` hataları → KIRMIZI (zincir). */
const ZINCIR_HATALARI = new Map([
  ['dongu', 'DÖNGÜ'],
  ['hop-siniri', 'SIÇRAMA SINIRI AŞILDI'],
])

// ── Saf fonksiyonlar ─────────────────────────────────────────────────────────

/** `;` ayraçlı, BOM'lu CSV → nesne listesi. Tırnaklı hücre kullanılmayan düz biçim (model listesi). */
function csvOku(metin) {
  const satirlar = metin.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n').filter((s) => s.trim() !== '')
  if (satirlar.length < 2) throw new Error('CSV boş ya da yalnız başlık')
  const baslik = satirlar[0].split(';')
  return satirlar.slice(1).map((satir) => {
    const hucre = satir.split(';')
    const nesne = {}
    baslik.forEach((ad, i) => {
      nesne[ad] = hucre[i] === undefined ? '' : hucre[i]
    })
    return nesne
  })
}

/** Her aileden (aile_yeni) SKU sırasıyla ilk `1 + ek` model; kararlı sıra. */
function modelOrnekle(modeller, ek = 0) {
  const aileler = new Map()
  for (const m of [...modeller].sort((a, b) => sirala(a.sku, b.sku))) {
    if (!aileler.has(m.aile_yeni)) aileler.set(m.aile_yeni, [])
    aileler.get(m.aile_yeni).push(m)
  }
  const secilen = []
  for (const aile of [...aileler.keys()].sort(sirala)) secilen.push(...aileler.get(aile).slice(0, 1 + ek))
  return secilen
}

/**
 * Beklenti listesi (kararlı sıra, tekrarsız). Bir beklenti:
 * { grup, adres, ilkDurum: sayı|sayı[]|null, hop: sayı, sonUrl: yol|null, sonDurum: sayı|null, bekliyor?: string }
 */
function beklentileriUret({ tablo, modeller, tohum, ek = 0 }) {
  const liste = []
  const gorulen = new Set()
  const ekle = (b) => {
    const anahtar = `${b.grup}|${b.adres}`
    if (gorulen.has(anahtar)) return
    gorulen.add(anahtar)
    liste.push(b)
  }

  for (const satir of tablo) {
    for (const dil of DILLER) {
      const yeni = `/${dil}/${satir[dil]}`
      const eski = `/${dil}/${satir.klasor}`
      if (yeni === eski) {
        ekle({ grup: 'rota-dili-ayni', adres: yeni, ilkDurum: 200, hop: 0, sonUrl: yeni, sonDurum: 200 })
        continue
      }
      ekle({ grup: 'rota-dili-yeni', adres: yeni, ilkDurum: 200, hop: 0, sonUrl: yeni, sonDurum: 200 })
      ekle({ grup: 'rota-dili-eski', adres: eski, ilkDurum: 308, hop: 1, sonUrl: yeni, sonDurum: 200 })
    }
    // Dilsiz eski adres: istek `accept-language: tr` taşır (matris.cjs istemcisi) → hedef TR adres.
    ekle({
      grup: 'rota-dili-dilsiz',
      adres: `/${satir.klasor}`,
      ilkDurum: [307, 308],
      hop: 1,
      sonUrl: `/tr/${satir.tr}`,
      sonDurum: 200,
    })
  }

  for (const m of modelOrnekle(modeller, ek)) {
    ekle({ grup: 'model-yeni', adres: m.adres_tr, ilkDurum: 200, hop: 0, sonUrl: m.adres_tr, sonDurum: 200 })
    ekle({ grup: 'model-yeni', adres: m.adres_en, ilkDurum: 200, hop: 0, sonUrl: m.adres_en, sonDurum: 200 })
    ekle({ grup: 'model-eski', adres: `/tr/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: m.adres_tr, sonDurum: 200 })
    ekle({ grup: 'model-eski', adres: `/en/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: m.adres_en, sonDurum: 200 })
  }

  const kategoriler = (tohum && tohum.kategoriler) || []
  for (const k of kategoriler.slice(0, KATEGORI_ORNEK_SAYISI)) {
    ekle({
      grup: 'kategori-eski',
      adres: `/category/${k.eski}`,
      ilkDurum: null,
      hop: 1,
      sonUrl: null,
      sonDurum: 200,
      bekliyor: 'yeni kategori ağacı #1352 (Faz 1-B) uygulanana kadar hedef adres yok',
    })
  }
  return liste
}

/** Tek satır sonucu → { durum, gercek }. `satir` = adresiIzle çıktısı. */
function degerlendir(beklenti, satir) {
  const gercek = satir.hata
    ? `HATA ${satir.hata}`
    : `${satir.ilk ? satir.ilk.durum : '?'}${satir.hop > 0 ? ` → ${satir.sonUrl}` : ''} (son ${satir.sonDurum}, sıçrama ${satir.hop})`
  if (beklenti.bekliyor) return { durum: 'BEKLİYOR', gercek }
  if (satir.hata && ZINCIR_HATALARI.has(satir.hata)) {
    return { durum: 'KIRMIZI', gercek: `ZİNCİR (${ZINCIR_HATALARI.get(satir.hata)}): sıçrama ${satir.hop}, son ${satir.sonUrl}` }
  }
  if (satir.hata) return { durum: 'HATA', gercek }
  if (satir.hop >= 2) return { durum: 'KIRMIZI', gercek: `${gercek} · ZİNCİR` }
  const ilk = satir.ilk ? satir.ilk.durum : null
  const ilkTamam =
    beklenti.ilkDurum === null || (Array.isArray(beklenti.ilkDurum) ? beklenti.ilkDurum.includes(ilk) : beklenti.ilkDurum === ilk)
  const sonUrlYolu = String(satir.sonUrl || '').split('?')[0]
  const tamam =
    ilkTamam &&
    satir.hop === beklenti.hop &&
    (beklenti.sonUrl === null || sonUrlYolu === beklenti.sonUrl) &&
    (beklenti.sonDurum === null || satir.sonDurum === beklenti.sonDurum)
  return { durum: tamam ? 'OK' : 'KIRMIZI', gercek }
}

function beklenenMetni(b) {
  const ilk = b.ilkDurum === null ? 'yönlendirme' : Array.isArray(b.ilkDurum) ? b.ilkDurum.join('/') : String(b.ilkDurum)
  return b.hop === 0 ? `${ilk}` : `${ilk} → ${b.sonUrl === null ? 'yeni adres' : b.sonUrl} (son ${b.sonDurum})`
}

/** Markdown tablo + özet satırı. */
function tabloYaz(sonuclar) {
  const satirlar = ['| Grup | Adres | Beklenen | Gerçek | Durum |', '|---|---|---|---|---|']
  for (const s of sonuclar) {
    satirlar.push(`| ${s.grup} | \`${s.adres}\` | ${beklenenMetni(s.beklenti)} | ${s.gercek} | ${s.durum} |`)
  }
  return satirlar.join('\n')
}

function ozetle(sonuclar) {
  const say = (d) => sonuclar.filter((s) => s.durum === d).length
  return { toplam: sonuclar.length, ok: say('OK'), kirmizi: say('KIRMIZI'), hata: say('HATA'), bekliyor: say('BEKLİYOR') }
}

// ── Giriş/çıkış ──────────────────────────────────────────────────────────────

/** `--taban` yalnız http/https olabilir (yalnız GET atılır; başka protokol ölçüm değildir). Sondaki `/` atılır. */
function tabanDogrula(deger) {
  let url
  try {
    url = new URL(deger)
  } catch {
    throw new Error(`--taban geçerli bir adres değil: ${deger}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error(`--taban yalnız http ya da https olabilir: ${deger}`)
  return deger.replace(/\/+$/, '')
}

function argumanlariOku(argv) {
  const sec = {
    taban: VARSAYILAN_TABAN,
    cikti: null,
    modelListesi: VARSAYILAN_MODEL_LISTESI,
    tablo: TABLO_YOLU,
    tohum: TOHUM_YOLU,
    ek: 0,
    liste: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const deger = () => {
      if (argv[i + 1] === undefined) throw new Error(`${a} bir değer ister`)
      return argv[++i]
    }
    if (a === '--taban') sec.taban = tabanDogrula(deger())
    else if (a === '--cikti') sec.cikti = deger()
    else if (a === '--model-listesi') sec.modelListesi = deger()
    else if (a === '--ornek') {
      const n = Number(deger())
      if (!Number.isInteger(n) || n < 0 || n > 20) throw new Error('--ornek 0-20 arası tam sayı ister')
      sec.ek = n
    } else if (a === '--liste') sec.liste = true
    else throw new Error(`bilinmeyen bayrak: ${a}`)
  }
  return sec
}

async function girdileriOku(sec) {
  const tablo = JSON.parse(fs.readFileSync(sec.tablo || TABLO_YOLU, 'utf8'))
  const modeller = csvOku(fs.readFileSync(sec.modelListesi || VARSAYILAN_MODEL_LISTESI, 'utf8'))
  const tohum = JSON.parse(fs.readFileSync(sec.tohum || TOHUM_YOLU, 'utf8'))
  // Tablo geçerliliği çekirdeğin doğrulayıcısıyla ölçülür (tek kaynak); bozuksa tarama başlamaz.
  const cekirdek = await import(pathToFileURL(path.join(KOK, 'src', 'config', 'rotaDiliCekirdek.mjs')).href)
  cekirdek.rotaDiliTablosuDogrula(tablo)
  return { tablo, modeller, tohum }
}

async function ana(argv, bag = {}) {
  const yaz = bag.yaz || ((m) => process.stdout.write(m + '\n'))
  const hataYaz = bag.hata || ((m) => process.stderr.write(m + '\n'))
  let sec
  let girdi
  try {
    sec = argumanlariOku(argv)
    girdi = bag.girdi || (await girdileriOku(sec))
  } catch (e) {
    hataYaz(`onizleme-tarama: ${e.message}`)
    return 2
  }
  const beklentiler = beklentileriUret({ ...girdi, ek: sec.ek })
  if (beklentiler.length === 0) {
    // Boş evren yeşil sayılmaz: hiçbir şey taranmadan "kırmızı 0" demek ölçüm değildir.
    hataYaz('onizleme-tarama: beklenti listesi boş (rota dili tablosu ve model listesi okunamadı mı?)')
    return 2
  }
  if (sec.liste) {
    for (const b of beklentiler) yaz(`${b.grup}\t${b.adres}\t${beklenenMetni(b)}${b.bekliyor ? '\t(bekliyor)' : ''}`)
    return 0
  }

  const getir = bag.getir || ag
  const sonuclar = new Array(beklentiler.length)
  let sonraki = 0
  const isci = async () => {
    for (;;) {
      const sira = sonraki++
      if (sira >= beklentiler.length) return
      const b = beklentiler[sira]
      const izlenen = await adresiIzle(b.adres, getir, sec.taban)
      sonuclar[sira] = { grup: b.grup, adres: b.adres, beklenti: b, ...degerlendir(b, izlenen) }
    }
  }
  await Promise.all(Array.from({ length: Math.min(EN_COK_ESZAMANLI, beklentiler.length) }, isci))

  const ozet = ozetle(sonuclar)
  yaz(tabloYaz(sonuclar))
  const sorunlu = sonuclar.filter((s) => s.durum === 'KIRMIZI' || s.durum === 'HATA')
  if (sorunlu.length > 0) {
    yaz('\nSORUNLU SATIRLAR')
    for (const s of sorunlu) yaz(`  ${s.durum} ${s.adres} · beklenen: ${beklenenMetni(s.beklenti)} · gerçek: ${s.gercek}`)
  }
  yaz(`\nTARAMA ${sec.taban}: ${ozet.toplam} beklenti · OK ${ozet.ok} · KIRMIZI ${ozet.kirmizi} · HATA ${ozet.hata} · BEKLİYOR ${ozet.bekliyor}`)
  if (sec.cikti) {
    try {
      fs.writeFileSync(sec.cikti, JSON.stringify({ surum: 1, taban: sec.taban, ozet, sonuclar }, null, 2) + '\n')
    } catch (e) {
      hataYaz(`onizleme-tarama: çıktı yazılamadı: ${e.message}`)
      return 2
    }
  }
  return ozet.kirmizi > 0 || ozet.hata > 0 ? 1 : 0
}

module.exports = { csvOku, modelOrnekle, beklentileriUret, degerlendir, tabloYaz, ozetle, argumanlariOku, girdileriOku, ana }

if (require.main === module) {
  ana(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stderr.write(`onizleme-tarama: beklenmeyen hata: ${e && e.message}\n`)
      process.exit(2)
    }
  )
}
