#!/usr/bin/env node
/**
 * ADRES MATRİSİ — "hangi adres bugün ne cevap veriyor" ölçümü (OPS-52 PR-B, Kapı 2 ve Kapı 3).
 *
 * NİÇİN VAR: rota dili anahtarı (`NEXT_PUBLIC_ADRES_DILI`) kapalıyken canlıda TEK adres bile değişmemeli
 * (docs/standards/rota-dili-standard.md R3 (cetvel PR #1681 ile gelir)). Birim testi kural LİSTESİNİ ölçer; sunucunun gerçekten ne
 * cevap verdiğini (middleware, rewrite, yönlendirme sırası, önbellek başlığı) yalnız istek atarak görürüz.
 * Betik aynı adres listesine iki ortamda (master / dal, ya da birleşmeden önce / sonra) istek atar, iki
 * matrisi karşılaştırır. Fark boşsa kapı yeşildir.
 *
 * SALT OKUMA: yalnız GET (gövde okunmaz, hemen iptal edilir). POST/PUT yok. Yönlendirmeler ELLE izlenir
 * (`redirect: 'manual'`); farklı origin'e giden yönlendirmeye istek ATILMAZ (yalnız kaydedilir).
 *
 * ADRES LİSTESİ (iki kaynak, kararlı sıra):
 *  1. `src/app/[lang]` altındaki page.tsx şablonları × {tr, en}. Dinamik segmentler
 *     `scripts/adres/matris-ornekler.json` içindeki SABİT örneklerle doldurulur; betik sitemap'e bakmaz.
 *     Örneği olmayan dinamik rota betiği DURDURUR (yeni rota sessizce matrisin dışında kalmasın).
 *  2. Bilinen eski adresler: `next.config.mjs` redirects() kaynakları (`:param` kısımları örnek değerle
 *     açılır) + dilsiz/dilli ek örnekler (aynı JSON). `next.config.mjs` içe aktarılamazsa betik DURUR (çıkış 2).
 *
 * ÇIKTI KARARLIDIR: adres sıralı, zaman damgası/sunucu başlığı/gövde yok. Aynı sunucuya iki koşu aynı JSON'u
 * vermelidir. Yönlendirme hedefleri taban origin'e göre YOLA çevrilir (yerel ve canlı matris karşılaştırılabilsin).
 *
 * KULLANIM
 *   node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti matris.json
 *   node scripts/adres/matris.cjs --taban http://localhost:3000 --dilsiz-hop-en-cok 1
 *   node scripts/adres/matris.cjs --karsilastir a.json b.json        # fark yoksa 0, varsa 1 + fark listesi
 *   node scripts/adres/matris.cjs --liste                            # ağ yok; yalnız adres listesini yazar
 * ÇIKIŞ: 0 temiz · 1 fark / A9 ihlali / hata satırı · 2 kullanım hatası ya da girdi okunamadı.
 *
 * SINIRLAR: en çok 4 eşzamanlı istek, her istekte 10 sn zaman aşımı, bir adreste en çok 5 hop. Ağ hatası,
 * zaman aşımı, 429 ve 5xx o satırın `hata` alanına yazılır; betik düşmez ve TEKRAR DENEMEZ.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const KOK = path.resolve(__dirname, '..', '..')
const VARSAYILAN_TABAN = 'https://venthub.com.tr'
const DILLER = ['tr', 'en']
const EN_COK_ESZAMANLI = 4
const ISTEK_ZAMAN_ASIMI_MS = 10_000
const EN_COK_HOP = 5
/** Dilsiz yönlendirmenin sonucu dil çerezine/başlığına bağlı; sabit başlıkla ölçüm kararlı kalır. */
const ISTEK_BASLIKLARI = { 'accept-language': 'tr-TR,tr;q=0.9', 'user-agent': 'venthub-adres-matrisi/1' }

/** Karşılaştırmaya giren (davranış) alanlar; `tur` kaynak etiketidir, davranış değildir. */
const KARSILASTIRILAN_ALANLAR = ['ilk', 'hop', 'sonDurum', 'sonUrl', 'zincir', 'hata']

// ── Saf fonksiyonlar ───────────────────────────────────────────────────────────────────────────

/** Kod birimi sırası: yerel ayardan bağımsız, her makinede aynı sıra. */
function sirala(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * `src/app/[lang]` altındaki page.tsx şablonlarını okur (özel klasörler `_x` ve paralel `@x` atlanır,
 * `(grup)` yoldan çıkarılır). Dönüş: `/about`, `/category/[categorySlug]` gibi sıralı liste.
 * @param {string} uygulamaDizini `src/app/[lang]` yolu
 * @returns {string[]}
 */
function sablonlariOku(uygulamaDizini) {
  const sonuc = []
  const gez = (dizin, onek) => {
    for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
      if (girdi.isDirectory()) {
        if (girdi.name.startsWith('_') || girdi.name.startsWith('@')) continue
        const parca = /^\(.*\)$/.test(girdi.name) ? '' : `/${girdi.name}`
        gez(path.join(dizin, girdi.name), onek + parca)
      } else if (girdi.name === 'page.tsx') {
        sonuc.push(onek === '' ? '/' : onek)
      }
    }
  }
  gez(uygulamaDizini, '')
  return sonuc.sort(sirala)
}

/**
 * Bir şablonu örnek değerlerle yola açar. `[x]` ve `[...x]` değer ister; `[[...x]]` değersiz de açılır.
 * @param {string} sablon `/category/[categorySlug]/[subCategorySlug]`
 * @param {Record<string,string>} degerler
 * @returns {string}
 */
function sablonuDoldur(sablon, degerler) {
  const parcalar = sablon.split('/').filter(Boolean).map((parca) => {
    const secenekli = parca.match(/^\[\[\.\.\.(\w+)\]\]$/)
    if (secenekli) return degerler[secenekli[1]] ?? null
    const normal = parca.match(/^\[(?:\.\.\.)?(\w+)\]$/)
    if (normal) {
      if (degerler[normal[1]] === undefined) throw new Error(`matris: "${sablon}" için "${normal[1]}" örneği eksik`)
      return degerler[normal[1]]
    }
    return parca
  })
  return `/${parcalar.filter((p) => p !== null).join('/')}`
}

/**
 * Şablon listesini dil × örnek değerlerle adreslere açar.
 * @param {string[]} sablonlar
 * @param {Record<string, Record<string,string>[]>} ornekler `matris-ornekler.json` `sablonlar` alanı
 * @returns {{adres: string, tur: string}[]}
 */
function sablonlariGenislet(sablonlar, ornekler) {
  const sonuc = []
  for (const sablon of sablonlar) {
    const dinamik = sablon.includes('[')
    const degerKumeleri = dinamik ? ornekler[sablon] : [{}]
    if (!degerKumeleri || degerKumeleri.length === 0) {
      throw new Error(`matris: dinamik rota "${sablon}" için matris-ornekler.json içinde örnek yok (yeni rota eklendi mi?)`)
    }
    for (const dil of DILLER) {
      for (const degerler of degerKumeleri) {
        const yol = sablonuDoldur(sablon, degerler)
        sonuc.push({ adres: `/${dil}${yol === '/' ? '' : yol}`, tur: 'sablon' })
      }
    }
  }
  return sonuc
}

/**
 * Next yönlendirme kaynağındaki `:param` parçalarını örnek değerlerle açar:
 * `:lang(tr|en)` her seçenek için; `:ad*` ve `:ad?` hem boş hem `ornek`; `:ad+` ve `:ad` yalnız `ornek`.
 * @param {string} kaynak
 * @returns {string[]}
 */
function kaynagiAc(kaynak) {
  const belirtec = /\/:([A-Za-z_]\w*)(?:\(([^)]*)\))?([*+?])?/g
  let sonuclar = ['']
  let son = 0
  let eslesme
  while ((eslesme = belirtec.exec(kaynak)) !== null) {
    const sabit = kaynak.slice(son, eslesme.index)
    const [, , grup, ek] = eslesme
    const secenekler = grup ? grup.split('|').map((s) => `/${s}`) : ['/ornek']
    if (ek === '*' || ek === '?') secenekler.push('')
    sonuclar = sonuclar.flatMap((onek) => secenekler.map((s) => onek + sabit + s))
    son = eslesme.index + eslesme[0].length
  }
  const kuyruk = kaynak.slice(son)
  return sonuclar.map((s) => s + kuyruk)
}

/**
 * Tüm adres kaynaklarını birleştirir: tekilleştirir (öncelik sırası: şablon, eski, dilsiz, dilli ek, dosya)
 * ve kararlı sıraya koyar.
 * @param {{ sablonlar: string[], ornekler: object, yonlendirmeKaynaklari: string[] }} girdi
 * @returns {{adres: string, tur: string}[]}
 */
function rotaListesiUret({ sablonlar, ornekler, yonlendirmeKaynaklari }) {
  const hepsi = [
    ...sablonlariGenislet(sablonlar, ornekler.sablonlar || {}),
    ...yonlendirmeKaynaklari.flatMap(kaynagiAc).map((adres) => ({ adres, tur: 'eski' })),
    ...(ornekler.dilsizOrnekler || []).map((adres) => ({ adres, tur: 'dilsiz' })),
    ...(ornekler.dilliEkOrnekler || []).map((adres) => ({ adres, tur: 'dilli-ek' })),
    ...(ornekler.dosyalar || []).map((adres) => ({ adres, tur: 'dosya' })),
  ]
  const gorulen = new Map()
  for (const satir of hepsi) if (!gorulen.has(satir.adres)) gorulen.set(satir.adres, satir)
  return [...gorulen.values()].sort((a, b) => sirala(a.adres, b.adres))
}

/** İlk yol parçası `tr` ya da `en` değilse adres dilsizdir (A9: tek sıçrama bütçesi). */
function dilsizMi(adres) {
  const ilk = adres.split('/').filter(Boolean)[0]
  return !DILLER.includes(ilk)
}

/**
 * Konum başlığını taban origin'e göre normalleştirir: aynı origin ise yol+sorgu, değilse tam adres.
 * Böylece yerel (http://localhost) ve canlı matris aynı biçimde yazılır.
 * @param {string} konum
 * @param {string} gecerliUrl
 * @param {string} tabanOrigin
 */
function yolaCevir(konum, gecerliUrl, tabanOrigin) {
  const url = new URL(konum, gecerliUrl)
  return url.origin === tabanOrigin ? `${url.pathname}${url.search}` : url.href
}

/**
 * Bir adresi izler: yönlendirmeleri elle takip eder (en çok `EN_COK_HOP`).
 * `getir(url)` → `{ durum, baslik(ad) }` döner ya da atar (ağ hatası / zaman aşımı); test için enjekte edilir.
 * @param {string} adres taban origin'siz yol
 * @param {(url: string) => Promise<{durum: number, baslik: (ad: string) => string|null}>} getir
 * @param {string} taban
 */
async function adresiIzle(adres, getir, taban) {
  const tabanOrigin = new URL(taban).origin
  let gecerli = new URL(adres, tabanOrigin).href
  const satir = { adres, ilk: null, hop: 0, sonDurum: null, sonUrl: adres, zincir: [], hata: null }
  const gorulen = new Set([gecerli])
  for (let sira = 0; ; sira++) {
    let yanit
    try {
      yanit = await getir(gecerli)
    } catch (e) {
      satir.hata = e && e.name === 'TimeoutError' ? 'zaman-asimi' : `ag: ${(e && e.cause && e.cause.code) || (e && e.name) || 'bilinmeyen'}`
      return satir
    }
    satir.zincir.push(yanit.durum)
    satir.sonDurum = yanit.durum
    satir.sonUrl = yolaCevir(gecerli, gecerli, tabanOrigin)
    if (sira === 0) {
      satir.ilk = {
        durum: yanit.durum,
        location: yanit.baslik('location') === null ? null : yolaCevir(yanit.baslik('location'), gecerli, tabanOrigin),
        cacheControl: yanit.baslik('cache-control'),
        xRobotsTag: yanit.baslik('x-robots-tag'),
      }
    }
    if (yanit.durum === 429 || yanit.durum >= 500) {
      satir.hata = `http-${yanit.durum}`
      return satir
    }
    const konum = yanit.baslik('location')
    if (yanit.durum < 300 || yanit.durum >= 400 || konum === null) return satir
    const sonraki = new URL(konum, gecerli)
    if (sonraki.origin !== tabanOrigin) {
      // Dış origin'e istek atılmaz; hedef kaydedilir.
      satir.hop += 1
      satir.sonUrl = sonraki.href
      return satir
    }
    satir.hop += 1
    if (gorulen.has(sonraki.href)) {
      satir.hata = 'dongu'
      satir.sonUrl = yolaCevir(sonraki.href, gecerli, tabanOrigin)
      return satir
    }
    if (satir.hop > EN_COK_HOP) {
      // Beşinci yönlendirmeden sonra da yönlendirme geldi: sınır aşıldı.
      satir.hata = 'hop-siniri'
      satir.sonUrl = yolaCevir(sonraki.href, gecerli, tabanOrigin)
      return satir
    }
    gorulen.add(sonraki.href)
    gecerli = sonraki.href
  }
}

/**
 * Sınırlı eşzamanlılıkla tüm adresleri izler; sonuç adres sırasındadır.
 * @param {{adres: string, tur: string}[]} liste
 * @param {(url: string) => Promise<object>} getir
 * @param {string} taban
 * @param {number} [eszamanli]
 */
async function matrisUret(liste, getir, taban, eszamanli = EN_COK_ESZAMANLI) {
  const satirlar = new Array(liste.length)
  let sonraki = 0
  const isci = async () => {
    for (;;) {
      const sira = sonraki++
      if (sira >= liste.length) return
      const izlenen = await adresiIzle(liste[sira].adres, getir, taban)
      const { adres, ...gerisi } = izlenen
      satirlar[sira] = { adres, tur: liste[sira].tur, ...gerisi }
    }
  }
  await Promise.all(Array.from({ length: Math.min(eszamanli, liste.length) }, isci))
  return { surum: 1, taban, adresSayisi: satirlar.length, satirlar }
}

/**
 * Gerçek ağ isteği: GET, elle yönlendirme, gövde okunmaz, 10 sn zaman aşımı.
 * @param {string} url
 * @param {number} [zamanAsimiMs] varsayılan 10 sn; testler kısaltır
 */
async function ag(url, zamanAsimiMs = ISTEK_ZAMAN_ASIMI_MS) {
  const yanit = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: ISTEK_BASLIKLARI,
    signal: AbortSignal.timeout(zamanAsimiMs),
  })
  // Gövdeyi okumadan bırak: bağlantı havuzunu tıkamasın.
  if (yanit.body) await yanit.body.cancel().catch(() => {})
  return { durum: yanit.status, baslik: (ad) => yanit.headers.get(ad) }
}

/**
 * İki matrisi DAVRANIŞ alanlarında karşılaştırır (taban, tür ve adres sayısı karşılaştırılmaz).
 * @returns {{adres: string, alan: string, a: unknown, b: unknown}[]} boş liste = fark yok
 */
function matrisleriKarsilastir(a, b) {
  const farklar = []
  const haritaA = new Map(a.satirlar.map((s) => [s.adres, s]))
  const haritaB = new Map(b.satirlar.map((s) => [s.adres, s]))
  const adresler = [...new Set([...haritaA.keys(), ...haritaB.keys()])].sort(sirala)
  for (const adres of adresler) {
    const sa = haritaA.get(adres)
    const sb = haritaB.get(adres)
    if (!sa || !sb) {
      farklar.push({ adres, alan: sa ? 'yalnizA' : 'yalnizB', a: sa ? 'var' : null, b: sb ? 'var' : null })
      continue
    }
    for (const alan of KARSILASTIRILAN_ALANLAR) {
      if (JSON.stringify(sa[alan]) !== JSON.stringify(sb[alan])) farklar.push({ adres, alan, a: sa[alan], b: sb[alan] })
    }
  }
  return farklar
}

/**
 * A9 sıçrama bütçesi: dilsiz adreste hop > en çok ise, ya da ölçülemediyse (hata) ihlaldir.
 * @returns {{adres: string, hop: number, hata: string|null}[]}
 */
function dilsizIhlalleri(matris, enCokHop) {
  return matris.satirlar
    .filter((s) => dilsizMi(s.adres) && (s.hop > enCokHop || s.hata !== null))
    .map((s) => ({ adres: s.adres, hop: s.hop, hata: s.hata }))
}

/** Konsola yazılan kısa özet: durum dağılımı, dilsiz hop dağılımı, hata sayısı. */
function ozetle(matris) {
  const durumlar = {}
  const dilsizHop = {}
  let hatali = 0
  for (const s of matris.satirlar) {
    const durumAnahtari = s.sonDurum === null ? 'yok' : String(s.sonDurum)
    durumlar[durumAnahtari] = (durumlar[durumAnahtari] || 0) + 1
    if (dilsizMi(s.adres)) dilsizHop[s.hop] = (dilsizHop[s.hop] || 0) + 1
    if (s.hata !== null) hatali += 1
  }
  return { adresSayisi: matris.adresSayisi, sonDurumDagilimi: durumlar, dilsizHopDagilimi: dilsizHop, hataSayisi: hatali }
}

// ── Komut satırı ───────────────────────────────────────────────────────────────────────────────

/** @param {string[]} argv */
function argumanlariOku(argv) {
  const sonuc = { taban: VARSAYILAN_TABAN, cikti: null, karsilastir: null, dilsizHopEnCok: null, liste: false }
  for (let i = 0; i < argv.length; i++) {
    const bayrak = argv[i]
    const deger = () => {
      const v = argv[++i]
      if (v === undefined) throw new Error(`${bayrak} değer ister`)
      return v
    }
    if (bayrak === '--taban') sonuc.taban = deger().replace(/\/+$/, '')
    else if (bayrak === '--cikti') sonuc.cikti = deger()
    else if (bayrak === '--karsilastir') sonuc.karsilastir = [deger(), deger()]
    else if (bayrak === '--dilsiz-hop-en-cok') {
      const n = Number(deger())
      if (!Number.isInteger(n) || n < 0) throw new Error('--dilsiz-hop-en-cok negatif olmayan tam sayı ister')
      sonuc.dilsizHopEnCok = n
    } else if (bayrak === '--liste') sonuc.liste = true
    else throw new Error(`bilinmeyen bayrak: ${bayrak}`)
  }
  return sonuc
}

/** next.config.mjs'in yayımladığı yönlendirme kaynakları (anahtar env'i bu süreçten okunur). */
async function yonlendirmeKaynaklariniOku() {
  const modul = await import(pathToFileURL(path.join(KOK, 'next.config.mjs')).href)
  const yonlendirmeler = await modul.default.redirects()
  return yonlendirmeler.map((y) => y.source)
}

/**
 * @param {string[]} argv
 * @param {{ liste?: {adres: string, tur: string}[], getir?: (url: string) => Promise<object> }} [bag] test enjeksiyonu:
 *   verilirse adres listesi next.config'ten üretilmez, istekler `getir` ile atılır
 * @returns {Promise<number>} çıkış kodu
 */
async function ana(argv, bag = {}) {
  let secenekler
  try {
    secenekler = argumanlariOku(argv)
  } catch (e) {
    process.stderr.write(`matris: ${e.message}\n`)
    return 2
  }

  if (secenekler.karsilastir) {
    let a
    let b
    try {
      a = JSON.parse(fs.readFileSync(secenekler.karsilastir[0], 'utf8'))
      b = JSON.parse(fs.readFileSync(secenekler.karsilastir[1], 'utf8'))
    } catch (e) {
      process.stderr.write(`matris: karşılaştırma girdisi okunamadı: ${e.message}\n`)
      return 2
    }
    const farklar = matrisleriKarsilastir(a, b)
    if (farklar.length === 0) {
      process.stdout.write(`FARK YOK (${a.satirlar.length} ve ${b.satirlar.length} adres)\n`)
      return 0
    }
    process.stdout.write(`${JSON.stringify(farklar, null, 2)}\n`)
    process.stderr.write(`matris: ${farklar.length} fark\n`)
    return 1
  }

  let liste = bag.liste
  if (!liste) {
    try {
      const ornekler = JSON.parse(fs.readFileSync(path.join(__dirname, 'matris-ornekler.json'), 'utf8'))
      const sablonlar = sablonlariOku(path.join(KOK, 'src', 'app', '[lang]'))
      const yonlendirmeKaynaklari = await yonlendirmeKaynaklariniOku()
      liste = rotaListesiUret({ sablonlar, ornekler, yonlendirmeKaynaklari })
    } catch (e) {
      process.stderr.write(`matris: adres listesi üretilemedi: ${e.message}\n`)
      return 2
    }
  }

  if (secenekler.liste) {
    process.stdout.write(`${liste.map((s) => `${s.tur}\t${s.adres}`).join('\n')}\n`)
    return 0
  }

  const matris = await matrisUret(liste, bag.getir || ag, secenekler.taban)
  const metin = `${JSON.stringify(matris, null, 2)}\n`
  if (secenekler.cikti) fs.writeFileSync(secenekler.cikti, metin)
  else process.stdout.write(metin)
  process.stderr.write(`matris: ${JSON.stringify(ozetle(matris))}\n`)

  let cikis = 0
  if (secenekler.dilsizHopEnCok !== null) {
    const ihlaller = dilsizIhlalleri(matris, secenekler.dilsizHopEnCok)
    if (ihlaller.length > 0) {
      process.stderr.write(`matris: A9 ihlali (dilsiz adreste hop > ${secenekler.dilsizHopEnCok} ya da ölçülemedi):\n${JSON.stringify(ihlaller, null, 2)}\n`)
      cikis = 1
    }
  }
  return cikis
}

module.exports = {
  sirala,
  sablonlariOku,
  sablonuDoldur,
  sablonlariGenislet,
  kaynagiAc,
  rotaListesiUret,
  dilsizMi,
  yolaCevir,
  adresiIzle,
  matrisUret,
  ag,
  matrisleriKarsilastir,
  dilsizIhlalleri,
  ozetle,
  argumanlariOku,
  ana,
  EN_COK_HOP,
}

if (require.main === module) {
  ana(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stderr.write(`matris: beklenmeyen hata: ${e && e.stack ? e.stack : e}\n`)
      process.exit(2)
    },
  )
}
