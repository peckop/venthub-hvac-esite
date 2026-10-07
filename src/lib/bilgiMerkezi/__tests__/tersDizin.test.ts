import { describe, expect, it } from 'vitest'

import type { RehberYazisi } from '../../../data/bilgiMerkezi/yazilar'
import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { enYeniRehberler, ilgiliRehberler, yazininHedefleri } from '../tersDizin'
import { ORNEK_YAZI } from './ornekYazi'

/**
 * INV-REHBER-TERS-BAGLANTI-1 (REC-452, rehber-yazisi-standard.md R3.1): kategori ve aile sayfası
 * kendi konusundaki rehbere bağlanır; dizin yazının kimliklerinden türer, elle liste yoktur.
 */

const ESKI: RehberYazisi = {
  ...ORNEK_YAZI,
  kimlik: 'eski-yazi',
  yayinTarihi: '2026-09-01',
  guncellemeTarihi: '2026-09-01',
  urunler: [],
  diller: { tr: { ...(ORNEK_YAZI.diller.tr as NonNullable<RehberYazisi['diller']['tr']>), slug: 'eski-yazi' } },
}

describe('ters dizin — kategori/aile → rehber', () => {
  it('gövdedeki kategori bağlantısı ve ürün kartı ailesi hedef sayılır; hesaplayıcı sayılmaz', () => {
    const h = yazininHedefleri(ORNEK_YAZI, 'tr')
    expect(h.has('vh:kategori/air-curtains')).toBe(true)
    expect(h.has('vh:aile/vortice-vort-mono')).toBe(true)
    expect([...h].some((k) => k.startsWith('vh:hesaplayici/'))).toBe(false)
  })

  it('kategoriye bağlanan yazı o kategori sayfasına döner: dil önekli adres, H1 başlık, özet', () => {
    const r = ilgiliRehberler('vh:kategori/air-curtains', 'tr', 3, [ORNEK_YAZI], false)
    expect(r).toEqual([
      { baslik: 'Örnek Rehber Yazısı', ozet: ORNEK_YAZI.diller.tr?.ozet, href: '/tr/bilgi-merkezi/ornek-yazi' },
    ])
  })

  it('ilgisiz kategori ve aile için BOŞ (blok basılmaz)', () => {
    expect(ilgiliRehberler('vh:kategori/fans', 'tr', 3, [ORNEK_YAZI], false)).toEqual([])
    expect(ilgiliRehberler('vh:aile/baska-aile', 'tr', 3, [ORNEK_YAZI], false)).toEqual([])
  })

  it('EN kapalıyken EN sayfada BOŞ — kapalı dile bağlantı basılmaz; açıkken EN adres', () => {
    expect(ilgiliRehberler('vh:kategori/air-curtains', 'en', 3, [ORNEK_YAZI], false)).toEqual([])
    const acik = ilgiliRehberler('vh:kategori/air-curtains', 'en', 3, [ORNEK_YAZI], true)
    expect(acik).toHaveLength(1)
    expect(acik[0]?.href.startsWith('/en/knowledge-hub/')).toBe(true)
  })

  it('o dilde yazılmamış yazı listelenmez (başka dile düşme yok)', () => {
    expect(enYeniRehberler('en', 3, [ESKI], true)).toEqual([])
  })

  it('en yeni rehberler: yeniden eskiye, adet sınırı', () => {
    expect(enYeniRehberler('tr', 3, [ESKI, ORNEK_YAZI], false).map((r) => r.href)).toEqual([
      '/tr/bilgi-merkezi/ornek-yazi',
      '/tr/bilgi-merkezi/eski-yazi',
    ])
    expect(enYeniRehberler('tr', 1, [ESKI, ORNEK_YAZI], false)).toHaveLength(1)
    expect(enYeniRehberler('tr', 3, [], false)).toEqual([])
  })

  it('YAYINDAKİ içerik: frekans konvertörü rehberi kendi kategorisine ve üç Danfoss ailesine bağlanır', () => {
    const tr = (h: Parameters<typeof ilgiliRehberler>[0]) =>
      ilgiliRehberler(h, 'tr', 3, YAZILAR, false).map((r) => r.href)
    const adres = '/tr/bilgi-merkezi/frekans-konvertoru-nedir'
    expect(tr('vh:kategori/frequency-converters')).toContain(adres)
    for (const aile of ['danfoss-vlt-micro-drive-fc-51', 'danfoss-vlt-hvac-basic-drive-fc-101', 'danfoss-vlt-hvac-drive-fc-102'] as const) {
      expect(tr(`vh:aile/${aile}`)).toContain(adres)
    }
  })
})
