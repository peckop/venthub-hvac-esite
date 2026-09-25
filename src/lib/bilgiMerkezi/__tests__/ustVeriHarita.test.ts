import { describe, expect, it } from 'vitest'

import { SITE_URL } from '../../../config/siteUrl'
import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { sayfaUstVerisi } from '../../seo/sayfaUstVerisi'
import { makaleJsonLd } from '../jsonld'
import { bilgiMerkeziSiteHaritasi } from '../siteHaritasi'

/**
 * INV-BILGI-MERKEZI-SEO-1 — site haritası, hreflang ve yapısal veri (rehber-yazisi-standard.md R6):
 * EN yalnız `EN_YAYIN` açıkken; hreflang yalnız iki dil de yayındaysa; JSON-LD `Article` (FAQPage yok).
 */
describe('bilgiMerkeziSiteHaritasi', () => {
  it('EN kapalı: yalnız TR liste + TR yazılar, alternates YOK', () => {
    const satirlar = bilgiMerkeziSiteHaritasi(SITE_URL, false)
    const trYazi = YAZILAR.filter((y) => y.diller.tr).length
    expect(satirlar.length).toBe(1 + trYazi)
    expect(satirlar.every((s) => s.url.startsWith(`${SITE_URL}/tr/bilgi-merkezi`))).toBe(true)
    expect(satirlar.some((s) => s.alternates)).toBe(false)
    expect(satirlar.some((s) => s.url.includes('/destek/'))).toBe(false)
  })

  it('EN açık: iki dilde satır, her satır iki dilli alternates taşır', () => {
    const satirlar = bilgiMerkeziSiteHaritasi(SITE_URL, true)
    expect(satirlar.some((s) => s.url === `${SITE_URL}/en/knowledge-hub`)).toBe(true)
    for (const s of satirlar) {
      expect(Object.keys(s.alternates?.languages ?? {}).sort(), s.url).toEqual(['en', 'tr'])
    }
  })

  it('yalnız TR metni olan yazı EN açıkken de tek dilli kalır (hreflang yazılmaz)', () => {
    const [a] = YAZILAR
    const yalnizTr = [{ ...a, diller: { tr: a.diller.tr } }]
    const satirlar = bilgiMerkeziSiteHaritasi(SITE_URL, true, yalnizTr)
    expect(satirlar.map((s) => s.url)).toEqual([`${SITE_URL}/tr/bilgi-merkezi`, `${SITE_URL}/tr/bilgi-merkezi/${a.diller.tr?.slug}`])
    expect(satirlar.some((s) => s.alternates)).toBe(false)
  })
})

describe('sayfaUstVerisi — dilYollari (dile göre farklı yol)', () => {
  it('eşi olmayan sayfa: yalnız canonical, languages YOK', () => {
    const m = sayfaUstVerisi({ lang: 'tr', yol: '/bilgi-merkezi/x', dilYollari: { tr: '/bilgi-merkezi/x' }, baslik: 'B | VentHub', aciklama: 'A' })
    expect(m.alternates).toEqual({ canonical: `${SITE_URL}/tr/bilgi-merkezi/x` })
  })

  it('iki dil de varsa: her dil KENDİ yolunu gösterir, x-default = tr', () => {
    const m = sayfaUstVerisi({
      lang: 'en',
      yol: '/knowledge-hub/y',
      dilYollari: { tr: '/bilgi-merkezi/x', en: '/knowledge-hub/y' },
      baslik: 'B | VentHub',
      aciklama: 'A',
      ogTuru: 'article',
    })
    expect(m.alternates).toEqual({
      canonical: `${SITE_URL}/en/knowledge-hub/y`,
      languages: { tr: `${SITE_URL}/tr/bilgi-merkezi/x`, en: `${SITE_URL}/en/knowledge-hub/y`, 'x-default': `${SITE_URL}/tr/bilgi-merkezi/x` },
    })
    expect((m.openGraph as { type?: string }).type).toBe('article')
  })

  it('bulunulan dilin yolu yoksa ATAR', () => {
    expect(() => sayfaUstVerisi({ lang: 'en', yol: '/x', dilYollari: { tr: '/x' }, baslik: 'B', aciklama: 'A' })).toThrow()
  })

  it('dilYollari verilmeyen eski çağrılar DEĞİŞMEDİ (tr/en/x-default)', () => {
    const m = sayfaUstVerisi({ lang: 'tr', yol: '/destek/sss', baslik: 'B', aciklama: 'A' })
    expect(m.alternates).toEqual({
      canonical: `${SITE_URL}/tr/destek/sss`,
      languages: { tr: `${SITE_URL}/tr/destek/sss`, en: `${SITE_URL}/en/destek/sss`, 'x-default': `${SITE_URL}/tr/destek/sss` },
    })
  })
})

describe('makaleJsonLd', () => {
  it('Article türü; TechArticle/FAQPage değil; yazar Kurum', () => {
    const j = makaleJsonLd({ baseUrl: SITE_URL, yol: '/tr/bilgi-merkezi/x', baslik: 'X', aciklama: 'Y', dil: 'tr', yayinTarihi: '2026-09-24', guncellemeTarihi: '2026-09-24' })
    expect(j['@type']).toBe('Article')
    expect(JSON.stringify(j)).not.toMatch(/FAQPage|TechArticle/)
    expect(j.author).toEqual({ '@type': 'Organization', name: 'VentHub', url: SITE_URL })
    expect(j.url).toBe(`${SITE_URL}/tr/bilgi-merkezi/x`)
  })
})
