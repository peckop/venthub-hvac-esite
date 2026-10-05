// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import * as kabuk from '../../../config/rotaDili.mjs'
import * as cekirdek from '../../../config/rotaDiliCekirdek.mjs'

/**
 * INV-ROTA-DILI-CEKIRDEK-1 — fs'siz çekirdek (OPS-52 PR-C0).
 * Çekirdek Edge'de (middleware) ve istemcide yüklenir: Node API'si içeremez. Ayrıca iki yeni saf fonksiyon
 * (`rotaDiliYolu`, `rotaDiliCevir`) ve "kabuk ile çekirdek aynı çıktıyı verir" sözleşmesi burada sınanır.
 */

const KOK = process.cwd()
const CEKIRDEK_YOLU = join(KOK, 'src', 'config', 'rotaDiliCekirdek.mjs')

const HAKKIMIZDA = { id: 'hakkimizda', klasor: 'about', tr: 'hakkimizda', en: 'about' }
const ILETISIM = { id: 'iletisim', klasor: 'contact', tr: 'iletisim', en: 'contact' }
const DESTEK = { id: 'destek', klasor: 'destek', tr: 'destek', en: 'support', altYollar: true }
const SSS = { id: 'sss', klasor: 'destek/sss', tr: 'destek/sss', en: 'support/faq' }
const FOO = { id: 'x', klasor: 'foo', tr: 'bar', en: 'baz' }
/** Algoritma tablosu: en-uzun-eşleşme için DESTEK + SSS birlikte (doğrulayıcıdan geçmez, fonksiyonlar doğrulamaz). */
const TABLO = [HAKKIMIZDA, ILETISIM, DESTEK, SSS, FOO]
/** Doğrulayıcıdan geçen tablo (kabuk ↔ çekirdek karşılaştırması için). */
const GECERLI = [HAKKIMIZDA, ILETISIM, FOO]

/** Yorumları (blok + satır) çıkarır; kapı yalnız KODU ölçsün, başlıktaki açıklama yanlış alarm vermesin. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1')
}

/** Edge'de yüklenemeyecek her şeyi bulur: import ifadesi, `node:` öneki, `fs`/`path` modülü, `process`, `require`. */
function edgeIhlalleri(kaynak: string): string[] {
  const kod = yorumsuz(kaynak)
  const desenler: [string, RegExp][] = [
    ['import ifadesi', /^\s*import\s/m],
    ['dinamik import()', /\bimport\s*\(/],
    ['node: öneki', /node:/],
    ["from 'fs' / 'path'", /from\s+['"](?:fs|path|os|child_process)['"]/],
    ['process.', /\bprocess\b/],
    ['require(', /\brequire\s*\(/],
    ['__dirname / import.meta', /__dirname|__filename|import\.meta/],
  ]
  return desenler.filter(([, desen]) => desen.test(kod)).map(([ad]) => ad)
}

describe('Edge güvenliği — çekirdek dosyası Node API\'si içermez', () => {
  it('rotaDiliCekirdek.mjs kodunda import / node: / fs / process / require YOK', () => {
    expect(edgeIhlalleri(readFileSync(CEKIRDEK_YOLU, 'utf8'))).toEqual([])
  })

  it('⛔SABOTAJ: dosyaya `import fs` eklenirse kapı KIRMIZI', () => {
    const kaynak = readFileSync(CEKIRDEK_YOLU, 'utf8')
    expect(edgeIhlalleri(`import fs from 'node:fs'\n${kaynak}`)).toEqual(expect.arrayContaining(['import ifadesi', 'node: öneki']))
    expect(edgeIhlalleri(`${kaynak}\nconst k = process.env.X`)).toContain('process.')
    expect(edgeIhlalleri(`${kaynak}\nconst k = require('fs')`)).toContain('require(')
    expect(edgeIhlalleri(`${kaynak}\nimport('node:fs')`)).toContain('dinamik import()')
  })

  it('AYIRT EDER: kabuk (rotaDili.mjs) aynı tarayıcıdan KIRMIZI çıkar (fs okur)', () => {
    expect(edgeIhlalleri(readFileSync(join(KOK, 'src', 'config', 'rotaDili.mjs'), 'utf8')).length).toBeGreaterThan(0)
  })

  it('yorumlardaki "process" / "node:fs" sözcükleri yanlış alarm vermez', () => {
    expect(edgeIhlalleri("/** node:fs process require( import */\n// import fs from 'fs'\nexport const a = 1")).toEqual([])
  })
})

describe('tek veri kaynağı — TS erişimcisi tablosu = kabuk tablosu', () => {
  const dosya = JSON.parse(readFileSync(join(KOK, 'src', 'config', 'rotaDili.veri.json'), 'utf8'))
  const ilkDeger = process.env.NEXT_PUBLIC_ADRES_DILI

  afterEach(() => {
    if (ilkDeger === undefined) delete process.env.NEXT_PUBLIC_ADRES_DILI
    else process.env.NEXT_PUBLIC_ADRES_DILI = ilkDeger
    vi.resetModules()
  })

  async function tabloYukle(anahtar: string | undefined) {
    if (anahtar === undefined) delete process.env.NEXT_PUBLIC_ADRES_DILI
    else process.env.NEXT_PUBLIC_ADRES_DILI = anahtar
    vi.resetModules()
    return import('../rotaDiliTablo')
  }

  it('ROTA_DILI_TABLO, kabuktaki ROTA_DILI ve ham JSON ile derin eşit', async () => {
    const m = await tabloYukle(undefined)
    expect(m.ROTA_DILI_TABLO).toEqual(kabuk.ROTA_DILI)
    expect(m.ROTA_DILI_TABLO).toEqual(dosya)
    expect(m.ROTA_DILI_TABLO.length).toBeGreaterThan(0)
  })

  it.each([
    ['tanımsız', undefined],
    ['0', '0'],
    ['true', 'true'],
    ['boş', ''],
  ])('anahtar %s → kapalı: iki sarmalayıcı girdiyi AYNEN döndürür', async (_ad, anahtar) => {
    const m = await tabloYukle(anahtar)
    expect(m.ADRES_DILI_ACIK).toBe(false)
    expect(m.rotaDiliYoluOku('/about?x=1#y', 'tr')).toBe('/about?x=1#y')
    expect(m.rotaDiliCevirOku('/hakkimizda', 'tr', 'en')).toBe('/hakkimizda')
  })

  it('anahtar tam "1" → açık: karar 267/269 satırları çevrilir', async () => {
    const m = await tabloYukle('1')
    expect(m.ADRES_DILI_ACIK).toBe(true)
    expect(m.rotaDiliYoluOku('/about?x=1#y', 'tr')).toBe('/hakkimizda?x=1#y')
    expect(m.rotaDiliYoluOku('/about', 'en')).toBe('/about')
    expect(m.rotaDiliYoluOku('/contact', 'tr')).toBe('/iletisim')
    expect(m.rotaDiliCevirOku('/hakkimizda', 'tr', 'en')).toBe('/about')
    expect(m.rotaDiliCevirOku('/contact', 'en', 'tr')).toBe('/iletisim')
  })
})

describe('rotaDiliYolu — dilsiz klasör yolu → görünen yol', () => {
  const yol = (url: string, dil: 'tr' | 'en', acik = true, tablo = TABLO) => cekirdek.rotaDiliYolu(url, dil, tablo, acik)

  it('kapalı → url AYNEN (sorgu / parçalı da)', () => {
    for (const url of ['/about', '/about?x=1#y', '/destek/sss', '/', '']) {
      expect(yol(url, 'tr', false), url).toBe(url)
      expect(yol(url, 'en', false), url).toBe(url)
    }
  })

  it('açık: hakkımızda / iletişim iki dilde (EN klasörle aynı → /about, /contact)', () => {
    expect(yol('/about', 'tr')).toBe('/hakkimizda')
    expect(yol('/about', 'en')).toBe('/about')
    expect(yol('/contact', 'tr')).toBe('/iletisim')
    expect(yol('/contact', 'en')).toBe('/contact')
  })

  it('sorgu ve parça AYNEN sona eklenir', () => {
    expect(yol('/about?x=1#y', 'tr')).toBe('/hakkimizda?x=1#y')
    expect(yol('/about?x=1', 'tr')).toBe('/hakkimizda?x=1')
    expect(yol('/about#y', 'tr')).toBe('/hakkimizda#y')
    expect(yol('/about?a=/contact&b=%2Fabout', 'tr')).toBe('/hakkimizda?a=/contact&b=%2Fabout')
  })

  it('sondaki eğik çizgi korunur (sorguyla da)', () => {
    expect(yol('/about/', 'tr')).toBe('/hakkimizda/')
    expect(yol('/about/?x=1', 'tr')).toBe('/hakkimizda/?x=1')
  })

  it('altYollar: kuyruk taşınır; altYollar kapalıysa alt yol eşleşmez', () => {
    expect(yol('/destek', 'en')).toBe('/support')
    expect(yol('/destek/ekip', 'en')).toBe('/support/ekip')
    expect(yol('/destek/ekip/derin?q=1', 'en')).toBe('/support/ekip/derin?q=1')
    expect(yol('/destek/ekip', 'tr')).toBe('/destek/ekip')
    expect(yol('/about/ekip', 'tr')).toBe('/about/ekip')
  })

  it('⭐EN UZUN EŞLEŞME kazanır: /destek/sss genel destek satırını ezer', () => {
    expect(yol('/destek/sss', 'en')).toBe('/support/faq')
    expect(yol('/destek/sss/ek', 'en')).toBe('/support/sss/ek') // sss altYollar değil → genel satır
    expect(yol('/destek/iade', 'en')).toBe('/support/iade')
  })

  it('eşleşme yok / kök / boş / eğik çizgisiz / önek eşleşmesi → AYNEN', () => {
    for (const url of ['/bilinmeyen', '/', '', '/?x=1', 'about', '/aboutx', '/destekler', 'https://x.test/about']) {
      expect(yol(url, 'tr'), url).toBe(url)
    }
  })

  it('tablo parametresi ZORUNLU: verilmezse sessizce varsayılana düşmez (açıkken atar)', () => {
    expect(() => Reflect.apply(cekirdek.rotaDiliYolu, null, ['/about', 'tr', undefined, true])).toThrow()
  })
})

describe('rotaDiliCevir — dil değiştirirken görünen yol çevirisi', () => {
  const cevir = (yolu: string, eski: 'tr' | 'en', yeni: 'tr' | 'en', acik = true) => cekirdek.rotaDiliCevir(yolu, eski, yeni, TABLO, acik)

  it('TR → EN ve EN → TR', () => {
    expect(cevir('/hakkimizda', 'tr', 'en')).toBe('/about')
    expect(cevir('/about', 'en', 'tr')).toBe('/hakkimizda')
    expect(cevir('/iletisim', 'tr', 'en')).toBe('/contact')
    expect(cevir('/contact', 'en', 'tr')).toBe('/iletisim')
    expect(cevir('/bar', 'tr', 'en')).toBe('/baz')
    expect(cevir('/baz', 'en', 'tr')).toBe('/bar')
  })

  it('⭐eşleşme GÖRÜNEN yol üzerindendir, klasör adı üzerinden değil: TR\'de /about ve /foo eski adrestir, çevrilmez', () => {
    expect(cevir('/about', 'tr', 'en')).toBe('/about') // TR görünen yol "hakkimizda"; /about eşleşmez (aynen)
    expect(cevir('/contact', 'tr', 'en')).toBe('/contact')
    expect(cevir('/foo', 'tr', 'en')).toBe('/foo') // klasör adı; ne TR ne EN'de görünen
    expect(cevir('/foo', 'en', 'tr')).toBe('/foo')
    expect(cevir('/destek', 'en', 'tr')).toBe('/destek') // EN görünen "support"; klasör adı eşleşmez
    expect(cevir('/destek', 'tr', 'en')).toBe('/support') // TR'de klasörle aynı → görünen
  })

  it('altYollar kuyruğu, sorgu ve parça taşınır; sondaki eğik çizgi korunur', () => {
    expect(cevir('/destek/ekip', 'tr', 'en')).toBe('/support/ekip')
    expect(cevir('/support/ekip', 'en', 'tr')).toBe('/destek/ekip')
    expect(cevir('/support/ekip?x=1#a', 'en', 'tr')).toBe('/destek/ekip?x=1#a')
    expect(cevir('/hakkimizda/?x=1', 'tr', 'en')).toBe('/about/?x=1')
    expect(cevir('/support/', 'en', 'tr')).toBe('/destek/')
  })

  it('⭐EN UZUN EŞLEŞME: /support/faq genel destek satırını ezer', () => {
    expect(cevir('/support/faq', 'en', 'tr')).toBe('/destek/sss')
    expect(cevir('/support/iade', 'en', 'tr')).toBe('/destek/iade')
  })

  it('kapalı / eşleşme yok / kök / aynı dil → AYNEN ya da kimlik', () => {
    expect(cevir('/hakkimizda', 'tr', 'en', false)).toBe('/hakkimizda')
    expect(cevir('/hakkimizda?x=1#y', 'tr', 'en', false)).toBe('/hakkimizda?x=1#y')
    expect(cevir('/bilinmeyen', 'tr', 'en')).toBe('/bilinmeyen')
    expect(cevir('/', 'tr', 'en')).toBe('/')
    expect(cevir('/hakkimizda', 'tr', 'tr')).toBe('/hakkimizda')
  })

  it('bilinmeyen dil değeri (JS çağrısı, doğrulamasız) "/undefined" üretmez: girdi AYNEN', () => {
    const bozuk = (d: string) => d as 'tr'
    expect(cevir('/hakkimizda', bozuk('xx'), 'en')).toBe('/hakkimizda')
    expect(cevir('/hakkimizda', 'tr', bozuk('__proto__'))).toBe('/hakkimizda')
    expect(cekirdek.rotaDiliYolu('/about', bozuk('xx'), TABLO, true)).toBe('/about')
    expect(cekirdek.rotaDiliYolu('/about', bozuk('constructor'), TABLO, true)).toBe('/about')
  })
})

describe('kabuk (rotaDili.mjs) ↔ çekirdek sözleşmesi', () => {
  it('doğrudan yeniden dışa açılanlar AYNI fonksiyondur', () => {
    expect(kabuk.adresDiliOku).toBe(cekirdek.adresDiliOku)
    expect(kabuk.rotaDiliTablosuDogrula).toBe(cekirdek.rotaDiliTablosuDogrula)
    expect(kabuk.zincirVarMi).toBe(cekirdek.zincirVarMi)
    expect(kabuk.DILLER).toBe(cekirdek.DILLER)
    expect(kabuk.ASAMA_2_ONEKLERI).toBe(cekirdek.ASAMA_2_ONEKLERI)
  })

  it.each([false, true])('anahtar=%s: sarmalayıcılar çekirdekle aynı çıktıyı verir (varsayılan ve verilen tablo)', (acik) => {
    for (const tablo of [kabuk.ROTA_DILI, GECERLI]) {
      expect(kabuk.rotaDiliYonlendirmeleri(acik, tablo)).toEqual(cekirdek.rotaDiliYonlendirmeleri(acik, tablo))
      expect(kabuk.rotaDiliYenidenYazimlari(acik, tablo)).toEqual(cekirdek.rotaDiliYenidenYazimlari(acik, tablo))
      for (const yol of ['/about', '/contact', '/foo', '/bilinmeyen']) {
        expect(kabuk.rotaDiliEsle(yol, tablo, acik)).toEqual(cekirdek.rotaDiliEsle(yol, tablo, acik))
        expect(kabuk.rotaDiliYolu(yol, 'tr', tablo, acik)).toBe(cekirdek.rotaDiliYolu(yol, 'tr', tablo, acik))
        expect(kabuk.rotaDiliCevir(yol, 'en', 'tr', tablo, acik)).toBe(cekirdek.rotaDiliCevir(yol, 'en', 'tr', tablo, acik))
      }
    }
  })

  it('kabuk varsayılan tabloyu ekler: tablosuz çağrı ROTA_DILI ile aynı sonucu verir; çekirdek tabloyu bilmez', () => {
    expect(kabuk.rotaDiliYonlendirmeleri(true)).toEqual(cekirdek.rotaDiliYonlendirmeleri(true, kabuk.ROTA_DILI))
    expect(kabuk.rotaDiliYenidenYazimlari(true)).toEqual(cekirdek.rotaDiliYenidenYazimlari(true, kabuk.ROTA_DILI))
    expect(kabuk.rotaDiliEsle('/about', undefined, true)).toEqual(cekirdek.rotaDiliEsle('/about', kabuk.ROTA_DILI, true))
    expect(kabuk.rotaDiliYolu('/about', 'tr', undefined, true)).toBe('/hakkimizda')
    expect(() => Reflect.apply(cekirdek.rotaDiliYonlendirmeleri, null, [true])).toThrow()
    expect(() => Reflect.apply(cekirdek.rotaDiliEsle, null, ['/about', undefined, true])).toThrow()
  })

  it('PR-A değerleri BİREBİR: karar 267/269 kuralları çekirdekten de aynı çıkar', () => {
    expect(cekirdek.rotaDiliYonlendirmeleri(true, [HAKKIMIZDA, ILETISIM])).toEqual([
      { source: '/tr/about', destination: '/tr/hakkimizda', permanent: true },
      { source: '/tr/contact', destination: '/tr/iletisim', permanent: true },
    ])
    expect(cekirdek.rotaDiliYenidenYazimlari(true, [HAKKIMIZDA, ILETISIM])).toEqual([
      { source: '/tr/hakkimizda', destination: '/tr/about' },
      { source: '/tr/iletisim', destination: '/tr/contact' },
    ])
    expect(cekirdek.rotaDiliEsle('/about', [HAKKIMIZDA, ILETISIM], true)).toEqual({ satirId: 'hakkimizda', tr: '/tr/hakkimizda', en: '/en/about' })
  })
})

describe('istek yolu işleme — ikinci dereceden yavaşlama (ReDoS) yok', () => {
  // Middleware dilsiz kolu yol bu fonksiyondan geçer; yol İSTEK'ten gelir (kullanıcı kontrolünde).
  // `replace(/\/+$/, '')` 32.000 ardışık `/` + bir harfte ≈ 600 ms CPU yiyordu (kare büyüme); doğrusal döngü ≈ 0.
  it('kaynakta sondaki-eğik-çizgi kırpan düzenli ifade YOK (yorumlar hariç)', () => {
    const kod = yorumsuz(readFileSync(CEKIRDEK_YOLU, 'utf8'))
    expect(kod).not.toMatch(/\.replace\(\s*\/\\\/\+\$\//)
  })

  it('64.000 ardışık `/` + harf: rotaDiliEsle ve rotaDiliYolu 250 ms altında (eski desen ≈ 2,5 sn)', () => {
    const kotu = `${'/'.repeat(64_000)}x`
    const t0 = performance.now()
    expect(cekirdek.rotaDiliEsle(kotu, TABLO, true)).toBeNull()
    expect(cekirdek.rotaDiliYolu(kotu, 'tr', TABLO, true)).toBe(kotu)
    expect(performance.now() - t0).toBeLessThan(250)
  })

  it('kırpma davranışı eskisiyle aynı: sondaki bir ya da çok `/` aynı satıra eşler, ortadakiler eşlemez', () => {
    for (const yol of ['/about', '/about/', '/about///']) {
      expect(cekirdek.rotaDiliEsle(yol, TABLO, true)?.satirId).toBe('hakkimizda')
    }
    expect(cekirdek.rotaDiliEsle('/about//x', TABLO, true)).toBeNull()
    expect(cekirdek.rotaDiliEsle('//', TABLO, true)).toBeNull()
    expect(cekirdek.rotaDiliYolu('/about///', 'tr', TABLO, true)).toBe('/hakkimizda/')
  })
})

describe('rotaDiliHedefleriniYenile — mevcut kuralların hedefleri tabloyla yenilenir (R4)', () => {
  const SECICI = { id: 'secici', klasor: 'urun-secici', tr: 'secici', en: 'selector' }
  const AYNI = { id: 'ayni', klasor: 'ayni-klasor', tr: 'ortak', en: 'ortak' }
  const T = [...TABLO, SECICI, AYNI]
  const k = (source: string, destination: string, permanent = true) => ({ source, destination, permanent })
  const yenile = (kurallar: ReturnType<typeof k>[], acik = true) => cekirdek.rotaDiliHedefleriniYenile(kurallar, acik, T)

  it('KAPALI: girdi dizisi AYNEN döner (aynı referans), değişecek kural içerse de', () => {
    const girdi = [k('/:lang(tr|en)/destek/hesaplayicilar', '/:lang/urun-secici')]
    expect(yenile(girdi, false)).toBe(girdi)
    expect(kabuk.rotaDiliHedefleriniYenile(girdi, false)).toBe(girdi)
  })

  it('/:lang hedefi dile göre ayrışıyorsa İKİ kurala bölünür (kaynak /tr ve /en, tr önce)', () => {
    expect(yenile([k('/:lang(tr|en)/destek/hesaplayicilar', '/:lang/urun-secici')])).toEqual([
      k('/tr/destek/hesaplayicilar', '/tr/secici'),
      k('/en/destek/hesaplayicilar', '/en/selector'),
    ])
  })

  it('/:lang hedefi iki dilde AYNI görünen yola gidiyorsa TEK kural kalır (/:lang korunur)', () => {
    expect(yenile([k('/:lang(tr|en)/eski', '/:lang/ayni-klasor')])).toEqual([k('/:lang(tr|en)/eski', '/:lang/ortak')])
  })

  it('/:lang hedefi iki dilde değişmiyorsa kural nesnesi AYNI referans', () => {
    const kural = k('/:lang(tr|en)/x', '/:lang/bilinmeyen')
    expect(yenile([kural])[0]).toBe(kural)
  })

  it('açık dilli hedef: yalnız o dilin görünen yolu', () => {
    expect(yenile([k('/en/destek/merkez', '/en/urun-secici'), k('/tr/destek/merkez', '/tr/urun-secici')])).toEqual([
      k('/en/destek/merkez', '/en/selector'),
      k('/tr/destek/merkez', '/tr/secici'),
    ])
  })

  it('bir dilde klasörle aynı kalan hedef değişmez (referans): /en/about', () => {
    const kural = k('/en/eski', '/en/about')
    expect(yenile([kural])[0]).toBe(kural)
    expect(yenile([k('/tr/eski', '/tr/about')])).toEqual([k('/tr/eski', '/tr/hakkimizda')])
  })

  it('sorgu dizesi ve parça hedefte AYNEN; sondaki eğik çizgi korunur', () => {
    expect(yenile([k('/:lang(tr|en)/a', '/:lang/about?x=1&y=%2Fabout')])).toEqual([
      k('/tr/a', '/tr/hakkimizda?x=1&y=%2Fabout'),
      k('/en/a', '/en/about?x=1&y=%2Fabout'),
    ])
    expect(yenile([k('/en/a', '/en/urun-secici/?sku=A#bolum')])).toEqual([k('/en/a', '/en/selector/?sku=A#bolum')])
  })

  it('altYollar: kuyruk belirteci ve alt yol taşınır; altYollar OLMAYAN satırda kuyruklu hedef çevrilmez', () => {
    expect(yenile([k('/en/a', '/en/destek/:path*')])).toEqual([k('/en/a', '/en/support/:path*')])
    expect(yenile([k('/en/a', '/en/destek/ekip')])).toEqual([k('/en/a', '/en/support/ekip')])
    const tr = k('/tr/a', '/tr/destek/:path*') // TR'de klasörle aynı → değişmez
    expect(yenile([tr])[0]).toBe(tr)
    const kuyruklu = k('/en/a', '/en/urun-secici/:path*') // satır altYollar değil: hedef satırın TAMAMINI kapsamıyor
    expect(yenile([kuyruklu])[0]).toBe(kuyruklu)
  })

  it('altYollar: kuyruk klasörün doğrudan sonunda değil, daha derinde olsa da hedef çevrilir (zincir doğmaz)', () => {
    expect(yenile([k('/en/a', '/en/destek/ekip/:path*')])).toEqual([k('/en/a', '/en/support/ekip/:path*')])
    expect(yenile([k('/en/a', '/en/destek/k/:a/:path*')])).toEqual([k('/en/a', '/en/support/k/:a/:path*')])
    expect(yenile([k('/:lang(tr|en)/a', '/:lang/destek/ekip/:path*')])).toEqual([
      k('/tr/a', '/tr/destek/ekip/:path*'),
      k('/en/a', '/en/support/ekip/:path*'),
    ])
  })

  it('⭐EN UZUN EŞLEŞME: /destek/sss genel destek satırını ezer', () => {
    expect(yenile([k('/en/a', '/en/destek/sss')])).toEqual([k('/en/a', '/en/support/faq')])
    expect(yenile([k('/en/a', '/en/destek/iade')])).toEqual([k('/en/a', '/en/support/iade')])
  })

  it('eşleşmeyen kural nesneleri DEĞİŞMEZ (aynı referans): dilsiz hedef, tabloda olmayan yol, mutlak adres', () => {
    const kurallar = [
      k('/category/fanlar/:path*', '/category/fans/:path*'),
      k('/tr/a', '/tr/products/x'),
      k('/en/b', 'https://baska.test/urun-secici'),
      k('/en/c', '/en/urun-secicix'),
    ]
    const cikti = yenile(kurallar)
    cikti.forEach((kural, i) => expect(kural, kurallar[i].source).toBe(kurallar[i]))
  })

  it('girdiyi DEĞİŞTİRMEZ, deterministik ve İDEMPOTENT', () => {
    const girdi = [
      k('/:lang(tr|en)/destek/hesaplayicilar', '/:lang/urun-secici'),
      k('/en/destek/merkez', '/en/urun-secici'),
      k('/category/fanlar/:path*', '/category/fans/:path*'),
    ]
    const once = JSON.stringify(girdi)
    const bir = yenile(girdi)
    expect(JSON.stringify(girdi)).toBe(once)
    expect(yenile(girdi)).toEqual(bir)
    expect(yenile(bir)).toEqual(bir)
    bir.forEach((kural, i) => expect(yenile(bir)[i]).toBe(kural)) // ikinci geçişte hiçbir nesne yeniden üretilmez
  })

  it('bölünemeyen kaynak (":lang(tr|en)" ile başlamıyor) ATAR: sessizce yanlış hedefte bırakılmaz', () => {
    expect(() => yenile([k('/destek/hesaplayicilar', '/:lang/urun-secici')])).toThrow(/bölünemez/)
  })

  it('ek alanlar (permanent) bölünen kurallara taşınır', () => {
    const [tr, en] = yenile([k('/:lang(tr|en)/a', '/:lang/urun-secici', false)])
    expect([tr.permanent, en.permanent]).toEqual([false, false])
  })
})
