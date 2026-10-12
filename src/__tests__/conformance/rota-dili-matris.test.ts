// @vitest-environment node
import fs from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * INV-ROTA-DILI-MATRIS-1 — adres matrisi betiği (OPS-52 PR-B, Kapı 2 ve Kapı 3 aracı).
 *
 * Betik "iki ortamda aynı adreslere sor, farkı göster" işini yapar; bu dosya betiğin KENDİSİNİN doğru
 * ölçtüğünü sınar: rota listesi üretici, hop sayacı, karşılaştırıcı (fark bulur / bulmaz) ve A9 bütçe
 * kapısı. Uçtan uca kısım yerel `node:http` sunucusuyla koşar (200 / tek hop 308 / 307+308 / döngü /
 * zaman aşımı); canlıya istek ATILMAZ.
 */

const KOK = path.resolve(__dirname, '../../..')

type Baslik = (ad: string) => string | null
type Yanit = { durum: number; baslik: Baslik }
type Getir = (url: string) => Promise<Yanit>
interface Satir {
  adres: string
  tur: string
  ilk: { durum: number; location: string | null; cacheControl: string | null; xRobotsTag: string | null } | null
  hop: number
  sonDurum: number | null
  sonUrl: string
  zincir: number[]
  hata: string | null
}
interface Matris {
  surum: number
  taban: string
  adresSayisi: number
  satirlar: Satir[]
}
interface Betik {
  sablonlariOku: (dizin: string) => string[]
  sablonuDoldur: (sablon: string, degerler: Record<string, string>) => string
  sablonlariGenislet: (sablonlar: string[], ornekler: Record<string, Record<string, string>[]>) => { adres: string; tur: string }[]
  kaynagiAc: (kaynak: string) => string[]
  rotaListesiUret: (girdi: {
    sablonlar: string[]
    ornekler: Record<string, unknown>
    yonlendirmeKaynaklari: string[]
  }) => { adres: string; tur: string }[]
  dilsizMi: (adres: string) => boolean
  yolaCevir: (konum: string, gecerliUrl: string, tabanOrigin: string) => string
  adresiIzle: (adres: string, getir: Getir, taban: string) => Promise<Satir>
  matrisUret: (liste: { adres: string; tur: string }[], getir: Getir, taban: string, eszamanli?: number) => Promise<Matris>
  ag: (url: string, zamanAsimiMs?: number) => Promise<Yanit>
  matrisleriKarsilastir: (a: Matris, b: Matris) => { adres: string; alan: string; a: unknown; b: unknown }[]
  dilsizIhlalleri: (matris: Matris, enCok: number) => { adres: string; hop: number; hata: string | null }[]
  argumanlariOku: (argv: string[]) => Record<string, unknown>
  ana: (argv: string[], bag?: { liste?: { adres: string; tur: string }[]; getir?: Getir }) => Promise<number>
  EN_COK_HOP: number
}
const betik = createRequire(import.meta.url)(path.join(KOK, 'scripts', 'adres', 'matris.cjs')) as Betik
const ORNEKLER = JSON.parse(fs.readFileSync(path.join(KOK, 'scripts', 'adres', 'matris-ornekler.json'), 'utf8')) as {
  sablonlar: Record<string, Record<string, string>[]>
}

const TABAN = 'https://site.test'

/** Betikli yanıt üretici: `rota[url yolu] = [durum, location?, başlıklar?]`. */
function sahteGetir(rota: Record<string, [number, string?, Record<string, string>?]>): Getir {
  return async (url) => {
    const yol = `${new URL(url).pathname}${new URL(url).search}`
    const kayit = rota[yol]
    if (!kayit) return { durum: 404, baslik: () => null }
    const [durum, location, basliklar = {}] = kayit
    return { durum, baslik: (ad) => (ad === 'location' ? (location ?? null) : (basliklar[ad] ?? null)) }
  }
}

describe('rota listesi üretici', () => {
  it('sablonlariOku: özel (_x) ve paralel (@x) klasörler atlanır, (grup) yoldan çıkar, kararlı sıra', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'matris-sablon-'))
    try {
      for (const yol of ['b/page.tsx', 'a/[slug]/page.tsx', '(grup)/c/page.tsx', '_ozel/page.tsx', '@slot/page.tsx', 'page.tsx', 'd/layout.tsx']) {
        fs.mkdirSync(path.dirname(path.join(gecici, yol)), { recursive: true })
        fs.writeFileSync(path.join(gecici, yol), '')
      }
      expect(betik.sablonlariOku(gecici)).toEqual(['/', '/a/[slug]', '/b', '/c'])
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true })
    }
  })

  it('sablonuDoldur: sabit, dinamik, çok parçalı ve isteğe bağlı catch-all (değerli / değersiz)', () => {
    expect(betik.sablonuDoldur('/about', {})).toBe('/about')
    expect(betik.sablonuDoldur('/category/[a]/[b]', { a: 'x', b: 'y' })).toBe('/category/x/y')
    expect(betik.sablonuDoldur('/kategori/[kok]/[[...dal]]', { kok: 'k' })).toBe('/kategori/k')
    expect(betik.sablonuDoldur('/kategori/[kok]/[[...dal]]', { kok: 'k', dal: 'd/e' })).toBe('/kategori/k/d/e')
    expect(() => betik.sablonuDoldur('/x/[slug]', {})).toThrow(/slug/)
  })

  it('sablonlariGenislet: her şablon × {tr,en}; kök sayfa /tr ve /en olur; örneksiz dinamik rota ATAR', () => {
    const adresler = betik.sablonlariGenislet(['/', '/about', '/brands/[slug]'], { '/brands/[slug]': [{ slug: 'a' }, { slug: 'b' }] })
    expect(adresler.map((s) => s.adres)).toEqual(['/tr', '/en', '/tr/about', '/en/about', '/tr/brands/a', '/tr/brands/b', '/en/brands/a', '/en/brands/b'])
    expect(() => betik.sablonlariGenislet(['/yeni/[x]'], {})).toThrow(/örnek yok/)
  })

  it('⭐GERÇEK DEPO: src/app/[lang] altındaki HER dinamik rotanın matris-ornekler.json içinde örneği var', () => {
    const sablonlar = betik.sablonlariOku(path.join(KOK, 'src', 'app', '[lang]'))
    expect(sablonlar.length).toBeGreaterThan(40)
    expect(sablonlar).toContain('/about')
    expect(() => betik.sablonlariGenislet(sablonlar, ORNEKLER.sablonlar)).not.toThrow()
    for (const ornekAnahtari of Object.keys(ORNEKLER.sablonlar)) {
      expect(sablonlar, `örneği olan ama depoda olmayan rota: ${ornekAnahtari}`).toContain(ornekAnahtari)
    }
  })

  it.each([
    ['/:lang(tr|en)/destek/hesaplayicilar', ['/tr/destek/hesaplayicilar', '/en/destek/hesaplayicilar']],
    ['/category/fanlar/:path*', ['/category/fanlar/ornek', '/category/fanlar']],
    ['/:lang(tr|en)/destek/konular/:eski*', ['/tr/destek/konular/ornek', '/tr/destek/konular', '/en/destek/konular/ornek', '/en/destek/konular']],
    ['/tr/brands/:slug', ['/tr/brands/ornek']],
    ['/tr/x/:p+', ['/tr/x/ornek']],
    ['/tr/sabit', ['/tr/sabit']],
  ])('kaynagiAc %s', (kaynak, beklenen) => {
    expect([...betik.kaynagiAc(kaynak)].sort()).toEqual([...beklenen].sort())
  })

  it('rotaListesiUret: tekilleştirir (şablon önce), kararlı sırada, her çağrıda aynı', () => {
    const girdi = {
      sablonlar: ['/about'],
      ornekler: { sablonlar: {}, dilsizOrnekler: ['/about', '/contact'], dilliEkOrnekler: ['/tr/about'], dosyalar: ['/robots.txt'] },
      yonlendirmeKaynaklari: ['/:lang(tr|en)/contact', '/tr/contact'],
    }
    const liste = betik.rotaListesiUret(girdi)
    expect(liste.map((s) => s.adres)).toEqual(['/about', '/contact', '/en/about', '/en/contact', '/robots.txt', '/tr/about', '/tr/contact'])
    expect(liste.find((s) => s.adres === '/tr/about')?.tur).toBe('sablon') // ilk kaynak kazanır
    expect(liste.find((s) => s.adres === '/tr/contact')?.tur).toBe('eski')
    expect(betik.rotaListesiUret(girdi)).toEqual(liste)
  })

  it('dilsizMi: dil öneksiz yollar (kök dahil) dilsizdir', () => {
    expect(['/', '/about', '/robots.txt', '/category/fanlar'].every(betik.dilsizMi)).toBe(true)
    expect(['/tr', '/en/about', '/tr/x'].some(betik.dilsizMi)).toBe(false)
  })

  it('yolaCevir: aynı origin yola, farklı origin tam adrese çevrilir', () => {
    expect(betik.yolaCevir('/tr/a?x=1', `${TABAN}/b`, TABAN)).toBe('/tr/a?x=1')
    expect(betik.yolaCevir(`${TABAN}/tr/a`, `${TABAN}/b`, TABAN)).toBe('/tr/a')
    expect(betik.yolaCevir('https://baska.test/x', `${TABAN}/b`, TABAN)).toBe('https://baska.test/x')
  })
})

describe('hop sayacı — adresiIzle', () => {
  const izle = (rota: Record<string, [number, string?, Record<string, string>?]>, adres: string) =>
    betik.adresiIzle(adres, sahteGetir(rota), TABAN)

  it('200: hop 0, başlıklar kaydedilir', async () => {
    const s = await izle({ '/a': [200, undefined, { 'cache-control': 'public, max-age=0', 'x-robots-tag': 'noindex, follow' }] }, '/a')
    expect(s).toMatchObject({ hop: 0, sonDurum: 200, sonUrl: '/a', zincir: [200], hata: null })
    expect(s.ilk).toEqual({ durum: 200, location: null, cacheControl: 'public, max-age=0', xRobotsTag: 'noindex, follow' })
  })

  it('tek hop 308: hop 1, ilk yanıt Location ile kaydedilir, son durum 200', async () => {
    const s = await izle({ '/a': [308, '/b', { 'cache-control': 'max-age=0, must-revalidate' }], '/b': [200] }, '/a')
    expect(s).toMatchObject({ hop: 1, sonDurum: 200, sonUrl: '/b', zincir: [308, 200], hata: null })
    expect(s.ilk).toMatchObject({ durum: 308, location: '/b', cacheControl: 'max-age=0, must-revalidate' })
  })

  it('307 sonra 308 (bugünkü dilsiz zincir): hop 2, tam zincir sırası', async () => {
    const s = await izle({ '/about': [307, '/tr/about'], '/tr/about': [308, '/tr/hakkimizda'], '/tr/hakkimizda': [200] }, '/about')
    expect(s).toMatchObject({ hop: 2, zincir: [307, 308, 200], sonUrl: '/tr/hakkimizda', sonDurum: 200 })
  })

  it('mutlak Location (aynı origin) yola çevrilir; farklı origin izlenmez ama kaydedilir', async () => {
    const ayni = await izle({ '/a': [308, `${TABAN}/b`], '/b': [200] }, '/a')
    expect(ayni.ilk?.location).toBe('/b')
    const dis = await izle({ '/a': [308, 'https://baska.test/x'] }, '/a')
    expect(dis).toMatchObject({ hop: 1, sonUrl: 'https://baska.test/x', zincir: [308], hata: null })
  })

  it('döngü: a→b→a "dongu" olarak işaretlenir (sonsuza gitmez)', async () => {
    const s = await izle({ '/a': [308, '/b'], '/b': [308, '/a'] }, '/a')
    expect(s.hata).toBe('dongu')
    expect(s.zincir).toEqual([308, 308])
  })

  it('hop sınırı: tam 5 yönlendirme geçer, 6. yönlendirmede "hop-siniri"', async () => {
    const zincir = (n: number) => Object.fromEntries(Array.from({ length: n + 1 }, (_, i) => [`/z${i}`, (i < n ? [308, `/z${i + 1}`] : [200]) as [number, string?]]))
    const bes = await izle(zincir(5), '/z0')
    expect(bes).toMatchObject({ hop: 5, sonDurum: 200, hata: null })
    const alti = await izle(zincir(6), '/z0')
    expect(alti.hata).toBe('hop-siniri')
    expect(betik.EN_COK_HOP).toBe(5)
  })

  it('404 hata DEĞİLDİR (kayıt edilen bir sonuç); 429 ve 5xx hatadır, tekrar denenmez', async () => {
    expect((await izle({}, '/yok')).hata).toBeNull()
    expect((await izle({ '/y': [429] }, '/y')).hata).toBe('http-429')
    expect((await izle({ '/y': [503] }, '/y')).hata).toBe('http-503')
    let cagri = 0
    const sayan: Getir = async () => {
      cagri += 1
      return { durum: 503, baslik: () => null }
    }
    await betik.adresiIzle('/y', sayan, TABAN)
    expect(cagri).toBe(1)
  })

  it('ağ hatası ve zaman aşımı satıra yazılır, fırlatmaz', async () => {
    const zamanAsimi: Getir = async () => {
      throw new DOMException('zaman', 'TimeoutError')
    }
    const reddedildi: Getir = async () => {
      throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } })
    }
    expect((await betik.adresiIzle('/a', zamanAsimi, TABAN)).hata).toBe('zaman-asimi')
    expect((await betik.adresiIzle('/a', reddedildi, TABAN)).hata).toBe('ag: ECONNREFUSED')
  })
})

describe('karşılaştırıcı', () => {
  const satir = (adres: string, ek: Partial<Satir> = {}): Satir => ({
    adres,
    tur: 'sablon',
    ilk: { durum: 200, location: null, cacheControl: null, xRobotsTag: null },
    hop: 0,
    sonDurum: 200,
    sonUrl: adres,
    zincir: [200],
    hata: null,
    ...ek,
  })
  const matris = (satirlar: Satir[], taban = TABAN): Matris => ({ surum: 1, taban, adresSayisi: satirlar.length, satirlar })

  it('aynı matrisler → fark YOK; taban ve tür farkı fark sayılmaz', () => {
    const a = matris([satir('/a'), satir('/b')])
    const b = matris([satir('/b', { tur: 'eski' }), satir('/a')], 'http://localhost:3000')
    expect(betik.matrisleriKarsilastir(a, b)).toEqual([])
  })

  it('⛔SABOTAJ: her davranış alanı değişince fark BULUR', () => {
    const a = matris([satir('/a', { ilk: { durum: 308, location: '/b', cacheControl: null, xRobotsTag: null }, hop: 1, zincir: [308, 200] })])
    const degisiklikler: [string, Partial<Satir>][] = [
      ['ilk', { ilk: { durum: 307, location: '/b', cacheControl: null, xRobotsTag: null }, hop: 1, zincir: [308, 200] }],
      // yalnız Location değişir (durum, hop, zincir, son adres aynı): ara hedef farkı kaçmamalı
      ['ilk', { ilk: { durum: 308, location: '/c', cacheControl: null, xRobotsTag: null }, hop: 1, zincir: [308, 200] }],
      ['hop', { ilk: a.satirlar[0].ilk, hop: 2, zincir: [308, 200] }],
      ['sonDurum', { ilk: a.satirlar[0].ilk, hop: 1, zincir: [308, 200], sonDurum: 404 }],
      ['sonUrl', { ilk: a.satirlar[0].ilk, hop: 1, zincir: [308, 200], sonUrl: '/baska' }],
      ['zincir', { ilk: a.satirlar[0].ilk, hop: 1, zincir: [308, 308, 200] }],
      ['hata', { ilk: a.satirlar[0].ilk, hop: 1, zincir: [308, 200], hata: 'zaman-asimi' }],
    ]
    for (const [alan, ek] of degisiklikler) {
      const b = matris([satir('/a', { sonUrl: '/a', ...ek })])
      const farklar = betik.matrisleriKarsilastir(a, b)
      expect(farklar.map((f) => f.alan), alan).toContain(alan)
    }
  })

  it('cache-control ve x-robots-tag farkı (ilk yanıt başlığı) fark sayılır', () => {
    const a = matris([satir('/a')])
    const b = matris([satir('/a', { ilk: { durum: 200, location: null, cacheControl: 'no-store', xRobotsTag: null } })])
    expect(betik.matrisleriKarsilastir(a, b)).toHaveLength(1)
  })

  it('bir tarafta eksik adres: yalnizA / yalnizB', () => {
    const farklar = betik.matrisleriKarsilastir(matris([satir('/a'), satir('/x')]), matris([satir('/a'), satir('/y')]))
    expect(farklar.map((f) => `${f.adres}:${f.alan}`)).toEqual(['/x:yalnizA', '/y:yalnizB'])
  })
})

describe('A9 kapısı — dilsizIhlalleri', () => {
  const m = (...satirlar: [string, number, string | null][]): Matris => ({
    surum: 1,
    taban: TABAN,
    adresSayisi: satirlar.length,
    satirlar: satirlar.map(([adres, hop, hata]) => ({
      adres,
      tur: 'dilsiz',
      ilk: null,
      hop,
      sonDurum: 200,
      sonUrl: adres,
      zincir: [],
      hata,
    })),
  })

  it('yeşil: dilsiz adreslerin hop değeri sınırda ya da altında; dilli adres hop 3 olsa da sayılmaz', () => {
    expect(betik.dilsizIhlalleri(m(['/about', 1, null], ['/', 1, null], ['/tr/x', 3, null]), 1)).toEqual([])
  })

  it('kırmızı: dilsiz adreste hop sınırı aşılırsa ihlal listelenir', () => {
    expect(betik.dilsizIhlalleri(m(['/about', 2, null], ['/contact', 1, null]), 1)).toEqual([{ adres: '/about', hop: 2, hata: null }])
  })

  it('kırmızı: ölçülemeyen dilsiz adres (hata) sessizce geçmez', () => {
    expect(betik.dilsizIhlalleri(m(['/about', 0, 'zaman-asimi']), 1)).toHaveLength(1)
  })
})

describe('uçtan uca — yerel http sunucu fikstürü', () => {
  let sunucu: http.Server
  let taban = ''

  beforeAll(async () => {
    sunucu = http.createServer((istek, yanit) => {
      const yol = istek.url ?? '/'
      const yonlendir = (kod: number, konum: string) => {
        yanit.writeHead(kod, { location: konum, 'cache-control': 'public, max-age=0, must-revalidate' })
        yanit.end()
      }
      if (yol === '/ok') {
        yanit.writeHead(200, { 'cache-control': 'public, max-age=60' })
        yanit.end('gövde okunmaz')
      } else if (yol === '/tek') yonlendir(308, '/ok')
      else if (yol === '/iki') yonlendir(307, '/tek')
      else if (yol === '/dongu-a') yonlendir(308, '/dongu-b')
      else if (yol === '/dongu-b') yonlendir(308, '/dongu-a')
      else if (yol === '/dis') yonlendir(308, 'http://baska-origin.invalid/x')
      else if (yol === '/yavas') {
        // Yanıt hiç gelmez: istemci zaman aşımına düşmeli.
      } else if (yol === '/bozuk') {
        yanit.writeHead(503)
        yanit.end()
      } else {
        yanit.writeHead(404)
        yanit.end()
      }
    })
    await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
    taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
  })

  afterAll(async () => {
    sunucu.closeAllConnections()
    await new Promise<void>((coz) => sunucu.close(() => coz()))
  })

  const liste = ['/ok', '/tek', '/iki', '/dongu-a', '/dis', '/yavas', '/bozuk', '/yok'].map((adres) => ({ adres, tur: 'sablon' }))
  const kisaAg: Getir = (url) => betik.ag(url, 300)

  it('gerçek fetch ile: 200 / tek hop / 307+308 / döngü / dış origin / zaman aşımı / 503 / 404', async () => {
    const m = await betik.matrisUret(liste, kisaAg, taban)
    const s = Object.fromEntries(m.satirlar.map((x) => [x.adres, x]))
    expect(s['/ok']).toMatchObject({ hop: 0, sonDurum: 200, hata: null })
    expect(s['/ok'].ilk).toMatchObject({ cacheControl: 'public, max-age=60' })
    expect(s['/tek']).toMatchObject({ hop: 1, zincir: [308, 200], sonUrl: '/ok' })
    expect(s['/tek'].ilk).toMatchObject({ location: '/ok', cacheControl: 'public, max-age=0, must-revalidate' })
    expect(s['/iki']).toMatchObject({ hop: 2, zincir: [307, 308, 200], sonUrl: '/ok' })
    expect(s['/dongu-a'].hata).toBe('dongu')
    expect(s['/dis']).toMatchObject({ hop: 1, sonUrl: 'http://baska-origin.invalid/x', hata: null })
    expect(s['/yavas'].hata).toBe('zaman-asimi')
    expect(s['/bozuk'].hata).toBe('http-503')
    expect(s['/yok']).toMatchObject({ sonDurum: 404, hata: null })
    expect(m.adresSayisi).toBe(liste.length)
  })

  it('kararlılık: aynı sunucuya iki koşu BAYT BAYT aynı JSON (oynak alan yok)', async () => {
    const ikisi = await Promise.all([betik.matrisUret(liste, kisaAg, taban), betik.matrisUret(liste, kisaAg, taban)])
    expect(JSON.stringify(ikisi[0])).toBe(JSON.stringify(ikisi[1]))
    expect(betik.matrisleriKarsilastir(ikisi[0], ikisi[1])).toEqual([])
  })

  it('eşzamanlılık sınırı: aynı anda en çok 4 istek', async () => {
    let anlik = 0
    let enCok = 0
    const sayan: Getir = async () => {
      anlik += 1
      enCok = Math.max(enCok, anlik)
      await new Promise((coz) => setTimeout(coz, 15))
      anlik -= 1
      return { durum: 200, baslik: () => null }
    }
    const uzun = Array.from({ length: 20 }, (_, i) => ({ adres: `/s${i}`, tur: 'sablon' }))
    await betik.matrisUret(uzun, sayan, TABAN)
    expect(enCok).toBeLessThanOrEqual(4)
    expect(enCok).toBeGreaterThan(1)
  })

  describe('komut satırı (ana)', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'matris-cli-'))
    let yazilanOut = ''
    let yazilanErr = ''

    afterEach(() => vi.restoreAllMocks())
    afterAll(() => fs.rmSync(gecici, { recursive: true, force: true }))

    const sessiz = () => {
      yazilanOut = ''
      yazilanErr = ''
      vi.spyOn(process.stdout, 'write').mockImplementation((k) => ((yazilanOut += String(k)), true))
      vi.spyOn(process.stderr, 'write').mockImplementation((k) => ((yazilanErr += String(k)), true))
    }

    it('--dilsiz-hop-en-cok: 307+308 zinciri n=1 iken KIRMIZI (çıkış 1), n=2 iken YEŞİL (çıkış 0)', async () => {
      const dilsiz = [{ adres: '/iki', tur: 'dilsiz' }]
      sessiz()
      expect(await betik.ana(['--taban', taban, '--dilsiz-hop-en-cok', '1'], { liste: dilsiz, getir: kisaAg })).toBe(1)
      expect(yazilanErr).toContain('A9 ihlali')
      expect(yazilanErr).toContain('/iki')
      sessiz()
      expect(await betik.ana(['--taban', taban, '--dilsiz-hop-en-cok', '2'], { liste: dilsiz, getir: kisaAg })).toBe(0)
      expect(yazilanErr).not.toContain('A9 ihlali')
    })

    it('--dilsiz-hop-en-cok olmadan hop sayısı çıkışı etkilemez', async () => {
      sessiz()
      expect(await betik.ana(['--taban', taban], { liste: [{ adres: '/iki', tur: 'dilsiz' }], getir: kisaAg })).toBe(0)
    })

    it('--cikti dosyaya yazar (stdout boş); --karsilastir aynı dosyada 0, farklı dosyada 1 ve farkı yazar', async () => {
      const a = path.join(gecici, 'a.json')
      const b = path.join(gecici, 'b.json')
      sessiz()
      await betik.ana(['--taban', taban, '--cikti', a], { liste: [{ adres: '/ok', tur: 'sablon' }], getir: kisaAg })
      expect(yazilanOut).toBe('')
      expect((JSON.parse(fs.readFileSync(a, 'utf8')) as Matris).satirlar[0]).toMatchObject({ adres: '/ok', sonDurum: 200 })
      await betik.ana(['--taban', taban, '--cikti', b], { liste: [{ adres: '/tek', tur: 'sablon' }], getir: kisaAg })

      sessiz()
      expect(await betik.ana(['--karsilastir', a, a])).toBe(0)
      expect(yazilanOut).toContain('FARK YOK')
      sessiz()
      expect(await betik.ana(['--karsilastir', a, b])).toBe(1)
      expect(yazilanOut).toContain('yalnizA')
      expect(yazilanOut).toContain('/ok')
    })

    it('kullanım hataları çıkış 2: bilinmeyen bayrak, eksik değer, okunamayan karşılaştırma dosyası', async () => {
      sessiz()
      expect(await betik.ana(['--bilinmeyen'])).toBe(2)
      expect(await betik.ana(['--taban'])).toBe(2)
      expect(await betik.ana(['--dilsiz-hop-en-cok', 'x'])).toBe(2)
      expect(await betik.ana(['--karsilastir', path.join(gecici, 'yok1.json'), path.join(gecici, 'yok2.json')])).toBe(2)
    })
  })
})
