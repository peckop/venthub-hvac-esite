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
 *  2. model adres listesi (`docs/plans/rec300-model-adres-listesi-2026-09-23.csv`, 442 model, 47 aile) +
 *     YAYINDAKİ MODELLER listesi (`src/config/yayindaModeller.veri.json`, karar 259 kısa pilot): her aileden
 *     en az 1 model (+ `--ornek N` ek örnek). Bir modelin kendi sayfası olup olmadığına SİTENİN KENDİ VERİ DOSYASI
 *     karar verir (CSV adresin ne olacağını söyler, açık olup olmadığını söylemez; ölçüldü: liste boşken 442
 *     modelin hiçbiri sayfa almaz ve CSV'den kurulan beklenti 188 sahte kırmızı üretir):
 *       · listede VAR (açık):  yeni TR/EN adres → 200; bugünkü `/tr|en/products/<slug_bugun>` → TEK 308, hedef
 *         CSV'deki yeni model adresi.
 *       · listede YOK (kapalı): yeni model adresi → 404 (model sayfası yoktur); bugünkü adres → TEK 308, hedef
 *         ÜRÜN AİLESİ sayfası (model adresinin son parçası `aile_yeni` ile değişir), orada 200.
 *     Her iki yön de ölçülür: liste "açık" derken site kapalıysa da, "kapalı" derken site açıksa da KIRMIZI.
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
 *   (--tablo, --model-listesi, --tohum, --yayinda-listesi: girdi dosyalarını değiştirir; varsayılan = bu ağaç)
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const { adresiIzle, ag, sirala } = require('./matris.cjs')

const KOK = path.resolve(__dirname, '..', '..')
const VARSAYILAN_TABAN = 'http://localhost:3000'
const VARSAYILAN_MODEL_LISTESI = path.join(KOK, 'docs', 'plans', 'rec300-model-adres-listesi-2026-09-23.csv')
const YAYINDA_LISTESI_YOLU = path.join(KOK, 'src', 'config', 'yayindaModeller.veri.json')
const TABLO_YOLU = path.join(KOK, 'src', 'config', 'rotaDili.veri.json')
const TOHUM_YOLU = path.join(KOK, 'src', 'data', 'eski-adres-tohum.json')
const DILLER = ['tr', 'en']
const EN_COK_ESZAMANLI = 4
const KATEGORI_ORNEK_SAYISI = 6
/** UTF-8 BOM (U+FEFF): Excel'in yazdığı CSV'nin ilk sütun adına yapışır; görünmez karakter yerine kod noktasıyla denetlenir. */
const BOM_KODU = 0xfeff
/** Ölçüm hatası değil, sitenin kendi yönlendirme kusuru olan `adresiIzle` hataları → KIRMIZI (zincir). */
const ZINCIR_HATALARI = new Map([
  ['dongu', 'DÖNGÜ'],
  ['hop-siniri', 'SIÇRAMA SINIRI AŞILDI'],
])

// ── Saf fonksiyonlar ─────────────────────────────────────────────────────────

/** `;` ayraçlı, BOM'lu CSV → nesne listesi. Tırnaklı hücre kullanılmayan düz biçim (model listesi). */
function csvOku(metin) {
  const govde = metin.charCodeAt(0) === BOM_KODU ? metin.slice(1) : metin
  const satirlar = govde.replace(/\r\n/g, '\n').split('\n').filter((x) => x.trim() !== '')
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

/** SKU kimliği büyük harf ve kenar boşluksuzdur (DB biçimi; `config/yayindaModeller.ts` ile aynı normalleştirme). */
const kimlik = (sku) => String(sku).trim().toUpperCase()

const duzNesne = (x) => x !== null && typeof x === 'object' && !Array.isArray(x)

/**
 * Yayındaki modeller listesi → model adresi (200) olan SKU'ların kümesi. Aile altındaki modeller ve sürümler dahil.
 * Biçim bozuksa ya da liste hiç verilmediyse ATAR: "okunamadı" boş liste sayılmaz (boş liste = hiçbir model açık değil
 * = bambaşka bir beklenti kümesi; sessizce ona düşmek sahte yeşil ya da sahte kırmızı üretir).
 * @param {{modeller: Record<string, Record<string, unknown>>, surumler: Record<string, unknown>}} yayinda
 * @returns {Set<string>}
 */
function yayindaSkuKumesi(yayinda) {
  if (!duzNesne(yayinda) || !duzNesne(yayinda.modeller) || !duzNesne(yayinda.surumler)) {
    throw new Error('yayındaki modeller listesi verilmedi ya da biçimi bozuk ({ modeller: {...}, surumler: {...} } bekleniyordu)')
  }
  const sku = new Set()
  for (const [aile, kayitlar] of Object.entries(yayinda.modeller)) {
    if (!duzNesne(kayitlar)) throw new Error(`yayındaki modeller listesi bozuk: "${aile}" ailesinin kaydı nesne değil`)
    for (const k of Object.keys(kayitlar)) sku.add(kimlik(k))
  }
  for (const k of Object.keys(yayinda.surumler)) sku.add(kimlik(k))
  return sku
}

/** Model adresinin son parçası ürün ailesi adıyla değişir: `/tr/urun/<model>` → `/tr/urun/<aile>` (kapalı modelin düştüğü sayfa). */
function aileAdresi(modelAdresi, aile) {
  return modelAdresi.replace(/[^/]+$/, aile)
}

/**
 * Beklenti listesi (kararlı sıra, tekrarsız). Bir beklenti:
 * { grup, adres, ilkDurum: sayı|sayı[]|null, hop: sayı, sonUrl: yol|null, sonDurum: sayı|null, bekliyor?: string }
 */
function beklentileriUret({ tablo, modeller, tohum, yayinda, ek = 0 }) {
  const acik = yayindaSkuKumesi(yayinda)
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
    if (acik.has(kimlik(m.sku))) {
      ekle({ grup: 'model-yeni', adres: m.adres_tr, ilkDurum: 200, hop: 0, sonUrl: m.adres_tr, sonDurum: 200 })
      ekle({ grup: 'model-yeni', adres: m.adres_en, ilkDurum: 200, hop: 0, sonUrl: m.adres_en, sonDurum: 200 })
      ekle({ grup: 'model-eski', adres: `/tr/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: m.adres_tr, sonDurum: 200 })
      ekle({ grup: 'model-eski', adres: `/en/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: m.adres_en, sonDurum: 200 })
    } else {
      // Kapalı model (pilot listede yok): model sayfası YOKTUR (404), eski adres ürün ailesi sayfasına gider.
      ekle({ grup: 'model-yeni-kapali', adres: m.adres_tr, ilkDurum: 404, hop: 0, sonUrl: m.adres_tr, sonDurum: 404 })
      ekle({ grup: 'model-yeni-kapali', adres: m.adres_en, ilkDurum: 404, hop: 0, sonUrl: m.adres_en, sonDurum: 404 })
      ekle({ grup: 'model-eski-aileye', adres: `/tr/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: aileAdresi(m.adres_tr, m.aile_yeni), sonDurum: 200 })
      ekle({ grup: 'model-eski-aileye', adres: `/en/products/${m.slug_bugun}`, ilkDurum: 308, hop: 1, sonUrl: aileAdresi(m.adres_en, m.aile_yeni), sonDurum: 200 })
    }
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
    yayindaListesi: YAYINDA_LISTESI_YOLU,
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
    else if (a === '--yayinda-listesi') sec.yayindaListesi = deger()
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
  // Hangi modelin sayfası var kararı sitenin kendi veri dosyasındadır; okunamazsa tarama başlamaz (ana → çıkış 2).
  const yayinda = JSON.parse(fs.readFileSync(sec.yayindaListesi || YAYINDA_LISTESI_YOLU, 'utf8'))
  // Tablo geçerliliği çekirdeğin doğrulayıcısıyla ölçülür (tek kaynak); bozuksa tarama başlamaz.
  const cekirdek = await import(pathToFileURL(path.join(KOK, 'src', 'config', 'rotaDiliCekirdek.mjs')).href)
  cekirdek.rotaDiliTablosuDogrula(tablo)
  return { tablo, modeller, tohum, yayinda }
}

/** Pilot listenin okunur özeti: kaç kayıt var, örneklenen modellerden kaçı açık/kapalı. */
function pilotOzeti(girdi, ek) {
  const acik = yayindaSkuKumesi(girdi.yayinda)
  const ornek = modelOrnekle(girdi.modeller, ek)
  const acikOrnek = ornek.filter((m) => acik.has(kimlik(m.sku))).length
  const kayit = Object.values(girdi.yayinda.modeller).reduce((n, k) => n + Object.keys(k).length, 0)
  const surum = Object.keys(girdi.yayinda.surumler).length
  return (
    `PİLOT LİSTE (yayındaki modeller): ${kayit} model + ${surum} sürüm açık. Örneklenen ${ornek.length} modelden ` +
    `açık: ${acikOrnek} (yeni adres 200, eski adres yeni adrese 308); ` +
    `kapalı: ${ornek.length - acikOrnek} (yeni adres 404, eski adres ürün ailesine 308).`
  )
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
  let beklentiler
  try {
    beklentiler = beklentileriUret({ ...girdi, ek: sec.ek })
  } catch (e) {
    hataYaz(`onizleme-tarama: ${e.message}`)
    return 2
  }
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
  yaz(`\n${pilotOzeti(girdi, sec.ek)}`)
  yaz(`TARAMA ${sec.taban}: ${ozet.toplam} beklenti · OK ${ozet.ok} · KIRMIZI ${ozet.kirmizi} · HATA ${ozet.hata} · BEKLİYOR ${ozet.bekliyor}`)
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

module.exports = { csvOku, modelOrnekle, yayindaSkuKumesi, beklentileriUret, degerlendir, tabloYaz, ozetle, argumanlariOku, girdileriOku, ana }

if (require.main === module) {
  ana(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stderr.write(`onizleme-tarama: beklenmeyen hata: ${e && e.message}\n`)
      process.exit(2)
    }
  )
}
