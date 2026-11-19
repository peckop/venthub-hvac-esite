import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { type RehberYazisi, YAZILAR, type YaziMetni } from '../../../data/bilgiMerkezi/yazilar'
import BilgiMerkeziListe, { listeKartlari } from '../../../views/knowledge/BilgiMerkeziListe'
import { YaziRotasi } from '../../../views/knowledge/bilgiMerkeziRotasi'
import RehberYazisiSayfasi from '../../../views/knowledge/RehberYazisiSayfasi'
import { makaleJsonLd } from '../jsonld'
import { yaziSayfasiHazirla } from '../sayfa'
import { bilgiMerkeziSiteHaritasi } from '../siteHaritasi'
import { ORNEK_YAZI } from './ornekYazi'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-TARIH-GIZLI-1 (OPS-332 pilotu) — yazı kaydında `tarihGizli` açıksa:
 *   1. yazı künyesinde ne yayın ne güncelleme tarihi basılır (`<time>` yok),
 *   2. liste kartında o yazının tarihi basılmaz,
 *   3. Article JSON-LD `datePublished` ve `dateModified` taşımaz,
 *   4. site haritası `lastmod` DEĞİŞMEZ (`guncellemeTarihi`ni izler).
 * Bayrak kapalı yazı eski hâliyle kalır (karşı kol; kör test olmasın).
 */
vi.mock('../../data/bilgiMerkeziKaynak', async () => {
  const { sahteKaynak: sahte } = await import('./sahteKaynak')
  return { varsayilanKaynak: sahte() }
})

const ACIK: RehberYazisi = { ...ORNEK_YAZI, kimlik: 'tarihsiz-ornek', yayinTarihi: '2026-09-25', guncellemeTarihi: '2026-10-10' }
const GIZLI: RehberYazisi = { ...ACIK, tarihGizli: true }

const zamanlar = (kap: ParentNode): Array<string | null> => Array.from(kap.querySelectorAll('time')).map((t) => t.getAttribute('datetime'))

describe('tarihGizli — yazı künyesi', () => {
  it('bayrak açık: künyede <time> yok, "Güncelleme" yok, tarih metni yok; yazar ve okuma süresi kalır', async () => {
    const sayfa = await yaziSayfasiHazirla(GIZLI, 'tr', sahteKaynak(), [GIZLI])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    const kunye = container.querySelector('header') as HTMLElement
    expect(zamanlar(container)).toEqual([])
    expect(kunye.textContent).not.toContain('Güncelleme')
    expect(kunye.textContent).not.toContain('2026')
    expect(kunye.querySelectorAll('p > span:not([aria-hidden])').length).toBe(2)
  })

  it('karşı kol, bayrak kapalı: iki <time> basılır', async () => {
    const sayfa = await yaziSayfasiHazirla(ACIK, 'tr', sahteKaynak(), [ACIK])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(zamanlar(container)).toEqual(['2026-09-25', '2026-10-10'])
  })
})

describe('tarihGizli — liste kartı', () => {
  it('bayrak açık: kart verisinde dört tarih alanı null, kartta <time> yok; öteki kartın tarihi durur', () => {
    const [gizli] = listeKartlari('tr', [GIZLI])
    expect([gizli.tarih, gizli.tarihIso, gizli.guncelleme, gizli.guncellemeIso]).toEqual([null, null, null, null])

    const oteki: RehberYazisi = {
      ...ACIK,
      kimlik: 'tarihli-ornek',
      diller: { tr: { ...(ACIK.diller.tr as YaziMetni), slug: 'tarihli-ornek' } },
    }
    const { container } = render(<BilgiMerkeziListe dil="tr" yazilar={[GIZLI, oteki]} />)
    expect(zamanlar(container)).toEqual(['2026-09-25', '2026-10-10'])
    expect(container.querySelectorAll('ul > li')).toHaveLength(2)
  })
})

describe('tarihGizli — Article JSON-LD ve site haritası', () => {
  const girdi = { baseUrl: 'https://venthub.com.tr', yol: '/tr/bilgi-merkezi/x', baslik: 'B', aciklama: 'A', dil: 'tr' as const, yayinTarihi: '2026-09-25', guncellemeTarihi: '2026-10-10' }

  it('bayrak açık: datePublished ve dateModified anahtarı yok; kapalıyken ikisi de var', () => {
    const gizli = makaleJsonLd({ ...girdi, tarihGizli: true })
    expect(gizli).not.toHaveProperty('datePublished')
    expect(gizli).not.toHaveProperty('dateModified')
    expect(gizli.headline).toBe('B')
    const acik = makaleJsonLd(girdi)
    expect(acik.datePublished).toBe('2026-09-25')
    expect(acik.dateModified).toBe('2026-10-10')
  })

  it('site haritası lastmod bayraktan etkilenmez', () => {
    const lastmod = (y: RehberYazisi) =>
      bilgiMerkeziSiteHaritasi('https://venthub.com.tr', false, [y])
        .map((s) => (s.lastModified instanceof Date ? s.lastModified.toISOString() : String(s.lastModified)))
        .sort()
    expect(lastmod(GIZLI)).toEqual(lastmod(ACIK))
    expect(lastmod(GIZLI).some((d) => d.startsWith('2026-10-10'))).toBe(true)
  })
})

describe('tarihGizli — yayındaki içerik (BLG-88: bütün yazılar)', () => {
  it('yayındaki HER yazıda bayrak açık (yeni yazı da bayrakla girer)', () => {
    expect(YAZILAR.length).toBeGreaterThan(0)
    expect(YAZILAR.filter((y) => !y.tarihGizli).map((y) => y.kimlik)).toEqual([])
  })

  it('her yazının rotası: sayfada <time> yok, Article tarih taşımıyor', async () => {
    for (const yazi of YAZILAR) {
      const m = yazi.diller.tr
      if (!m) continue
      const params = Promise.resolve({ lang: 'tr', yazi: m.slug })
      const { container, unmount } = render(await YaziRotasi({ params, bolumDili: 'tr' }))
      expect(zamanlar(container), yazi.kimlik).toEqual([])
      const makale = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>)
        .find((j) => j['@type'] === 'Article')
      expect(makale, yazi.kimlik).toBeDefined()
      expect(makale, yazi.kimlik).not.toHaveProperty('datePublished')
      expect(makale, yazi.kimlik).not.toHaveProperty('dateModified')
      unmount()
    }
  })

  it('liste sayfası: hiçbir kartta tarih yok', () => {
    const { container } = render(<BilgiMerkeziListe dil="tr" />)
    expect(container.querySelectorAll('ul > li').length).toBe(YAZILAR.filter((y) => y.diller.tr).length)
    expect(zamanlar(container)).toEqual([])
  })

  it('site haritası lastmod yine güncelleme tarihini izler (bayrak dokunmaz)', () => {
    const satirlar = bilgiMerkeziSiteHaritasi('https://venthub.com.tr', false, YAZILAR)
    for (const y of YAZILAR) {
      const m = y.diller.tr
      if (!m) continue
      const satir = satirlar.find((s) => s.url.endsWith(`/${m.slug}`))
      expect(satir, y.kimlik).toBeDefined()
      expect((satir?.lastModified as Date).toISOString().slice(0, 10), y.kimlik).toBe(y.guncellemeTarihi)
    }
  })
})
