import { describe, expect, it } from 'vitest'

import { adresNormal, b10Olc, haritaLastmod, metaOku } from '../../../tools/rehber/b10-olc.mjs'

/**
 * INV-REHBER-B10-OLC-1 · B10 canlı ölçüm betiği (ARC-206, HRT-70; rehber-yazisi-standard.md R10.6 madde 6-7).
 *
 * Ağ TAKLİT edilir; her kolun bozma testi vardır: tek bir kusur o kolu KALDI yapar, öteki kollar etkilenmez.
 * ⭐Ders (BLG-15/18): site haritası, canonical ve iç bağlantı ölçümü elle yapılınca iki kez atlandı.
 */

const ADRES = 'https://venthub.com.tr/tr/bilgi-merkezi/yeni-yazi'
const HARITA = 'https://venthub.com.tr/sitemap.xml'

type Cevap = { status: number; headers: { get(a: string): string | null }; text(): Promise<string> }
const cevap = (status: number, govde = '', basliklar: Record<string, string> = {}): Cevap => ({
  status,
  headers: { get: (a: string) => basliklar[a.toLowerCase()] ?? null },
  text: async () => govde,
})

const sayfa = (p: { canonical?: string | null; robots?: string; ic?: string[] } = {}) => {
  const canonical = p.canonical === undefined ? ADRES : p.canonical
  const ic = (p.ic ?? ['/tr/products', '/tr/bilgi-merkezi/baska']).map((h) => `<a href="${h}">x</a>`).join('')
  return (
    `<html><head>${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}` +
    `${p.robots ? `<meta name="robots" content="${p.robots}"/>` : ''}</head><body><article>${ic}</article></body></html>`
  )
}

const harita = (lastmod: string | null = '2026-10-26T00:00:00.000Z', adres = ADRES) =>
  `<urlset><url><loc>${adres}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url></urlset>`

/** Taklit ağ: adres → cevap. Tanımsız adres 200 boş döner (iç bağlantılar). */
function ag(p: { sayfa?: Cevap; harita?: Cevap; ozel?: Record<string, Cevap> } = {}) {
  const tablo: Record<string, Cevap> = {
    [ADRES]: p.sayfa ?? cevap(200, sayfa()),
    [HARITA]: p.harita ?? cevap(200, harita()),
    ...(p.ozel ?? {}),
  }
  return async (a: string) => tablo[a] ?? cevap(200, '')
}

const durumlar = (s: { maddeler: { ad: string; durum: string }[] }) => Object.fromEntries(s.maddeler.map((m) => [m.ad, m.durum]))

describe('INV-REHBER-B10-OLC-1 · tüm kollar temizse GEÇTİ', () => {
  it('200, canonical kendisi, noindex yok, haritada adres + lastmod, iç bağlantılar 200 → GEÇTİ', async () => {
    const s = await b10Olc({ adres: ADRES, yayin: '2026-10-26', getir: ag() })
    expect(s.durum).toBe('GEÇTİ')
    expect(durumlar(s)).toEqual({ '200': 'GEÇTİ', canonical: 'GEÇTİ', noindex: 'GEÇTİ', harita: 'GEÇTİ', 'ic-baglanti': 'GEÇTİ' })
  })
})

describe('INV-REHBER-B10-OLC-1 · bozma testleri (her kusur kendi kolunu düşürür)', () => {
  it('yönlendirme (3xx) izlenmez: 200 kolu KALDI', async () => {
    const s = await b10Olc({ adres: ADRES, getir: ag({ sayfa: cevap(308, '', { location: '/tr/baska' }) }) })
    expect(s.durum).toBe('KALDI')
    expect(durumlar(s)['200']).toBe('KALDI')
    expect(s.maddeler.find((m) => m.ad === '200')!.ayrinti).toContain('308')
  })

  it('404 → KALDI', async () => {
    const s = await b10Olc({ adres: ADRES, getir: ag({ sayfa: cevap(404) }) })
    expect(s.durum).toBe('KALDI')
  })

  it('site haritasında adres yoksa harita KALDI (sessiz yeşil yok)', async () => {
    const s = await b10Olc({
      adres: ADRES,
      getir: ag({ harita: cevap(200, harita('2026-10-26T00:00:00.000Z', 'https://venthub.com.tr/tr/bilgi-merkezi/baska-yazi')) }),
    })
    expect(durumlar(s).harita).toBe('KALDI')
    expect(s.durum).toBe('KALDI')
  })

  it('haritada adres var ama lastmod yoksa KALDI', async () => {
    const s = await b10Olc({ adres: ADRES, getir: ag({ harita: cevap(200, harita(null)) }) })
    expect(durumlar(s).harita).toBe('KALDI')
  })

  it('lastmod yayın tarihinden farklıysa KALDI; --yayin verilmezse yalnız var olması aranır', async () => {
    const eski = ag({ harita: cevap(200, harita('2026-10-14T00:00:00.000Z')) })
    expect(durumlar(await b10Olc({ adres: ADRES, yayin: '2026-10-26', getir: eski })).harita).toBe('KALDI')
    expect(durumlar(await b10Olc({ adres: ADRES, getir: eski })).harita).toBe('GEÇTİ')
  })

  it('canonical başka sayfayı gösteriyorsa ya da hiç yoksa KALDI; sondaki eğik çizgi fark sayılmaz', async () => {
    const baska = ag({ sayfa: cevap(200, sayfa({ canonical: 'https://venthub.com.tr/tr/bilgi-merkezi/baska' })) })
    const yok = ag({ sayfa: cevap(200, sayfa({ canonical: null })) })
    const egik = ag({ sayfa: cevap(200, sayfa({ canonical: `${ADRES}/` })) })
    expect(durumlar(await b10Olc({ adres: ADRES, getir: baska })).canonical).toBe('KALDI')
    expect(durumlar(await b10Olc({ adres: ADRES, getir: yok })).canonical).toBe('KALDI')
    expect(durumlar(await b10Olc({ adres: ADRES, getir: egik })).canonical).toBe('GEÇTİ')
  })

  it('noindex: meta robots, googlebot ve X-Robots-Tag başlığı üçü de yakalanır', async () => {
    const meta = ag({ sayfa: cevap(200, sayfa({ robots: 'noindex, follow' })) })
    const baslik = ag({ sayfa: cevap(200, sayfa(), { 'x-robots-tag': 'noindex' }) })
    expect(durumlar(await b10Olc({ adres: ADRES, getir: meta })).noindex).toBe('KALDI')
    expect(durumlar(await b10Olc({ adres: ADRES, getir: baslik })).noindex).toBe('KALDI')
    const gbot = `<html><head><link rel="canonical" href="${ADRES}"/><meta content="NOINDEX" name="googlebot"/></head><body><article><a href="/tr/x">x</a></article></body></html>`
    expect(durumlar(await b10Olc({ adres: ADRES, getir: ag({ sayfa: cevap(200, gbot) }) })).noindex).toBe('KALDI')
  })

  it('iç bağlantı 404 ya da yönlendirme ise ic-baglanti KALDI', async () => {
    const olu = ag({ ozel: { 'https://venthub.com.tr/tr/products': cevap(404) } })
    const yon = ag({ ozel: { 'https://venthub.com.tr/tr/products': cevap(308, '', { location: '/tr/urunler' }) } })
    expect(durumlar(await b10Olc({ adres: ADRES, getir: olu }))['ic-baglanti']).toBe('KALDI')
    expect(durumlar(await b10Olc({ adres: ADRES, getir: yon }))['ic-baglanti']).toBe('KALDI')
  })

  it('yazıda hiç iç bağlantı yoksa EVREN-BOS TEMİZ değildir: ic-baglanti KALDI', async () => {
    const s = await b10Olc({ adres: ADRES, getir: ag({ sayfa: cevap(200, sayfa({ ic: [] })) }) })
    expect(durumlar(s)['ic-baglanti']).toBe('KALDI')
  })

  it('ağ hatası KALDI değil ÖLÇÜLEMEDİ üretir ve sessiz yeşile dönmez', async () => {
    const s = await b10Olc({
      adres: ADRES,
      getir: async () => {
        throw new Error('ECONNRESET')
      },
    })
    expect(s.durum).toBe('ÖLÇÜLEMEDİ')
    expect(s.maddeler.every((m: { durum: string }) => m.durum !== 'GEÇTİ')).toBe(true)
  })
})

describe('INV-REHBER-B10-OLC-1 · yardımcılar', () => {
  it('adresNormal: eğik çizgi, sorgu, çapa ve büyük harf host farkı atılır', () => {
    expect(adresNormal('https://VentHub.com.tr/tr/x/?a=1#b')).toBe('https://venthub.com.tr/tr/x')
  })
  it('metaOku: öznitelik sırası ve tırnak biçimi serbest', () => {
    const m = metaOku(`<link href='/a' rel='canonical'><meta content="noindex" name="robots">`)
    expect(m).toEqual({ canonical: '/a', robots: ['noindex'] })
  })
  it('haritaLastmod: bulunamayan adres undefined, lastmod’suz null', () => {
    expect(haritaLastmod(harita('2026-10-26T00:00:00.000Z'), ADRES)).toBe('2026-10-26T00:00:00.000Z')
    expect(haritaLastmod(harita(null), ADRES)).toBeNull()
    expect(haritaLastmod(harita(), 'https://venthub.com.tr/tr/yok')).toBeUndefined()
  })
})
