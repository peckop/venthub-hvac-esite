import { render, screen } from '@testing-library/react'
import type { Route } from 'next'
import { describe, expect, it, vi } from 'vitest'

import KnowledgeBlock from '../../../components/home/KnowledgeBlock'
import { type RehberYazisi, YAZILAR, type YaziMetni } from '../../../data/bilgiMerkezi/yazilar'
import { tr } from '../../../i18n/dictionaries/tr'
import { YaziRotasi,yaziUstVerisi } from '../../../views/knowledge/bilgiMerkeziRotasi'
import IlgiliRehberler from '../../../views/knowledge/IlgiliRehberler'
import RehberYazisiSayfasi from '../../../views/knowledge/RehberYazisiSayfasi'
import { yaziSayfasiHazirla } from '../sayfa'
import { enYeniRehberler, ilgiliRehberler } from '../tersDizin'
import { ORNEK_YAZI } from './ornekYazi'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-KART-2 (URN-92, SEO-30 devamı) — KART basan her yüzey `kartOzeti`ni basar; meta
 * açıklaması, og:description ve Article JSON-LD `ozet`te AYNEN kalır. Liste kartı ve araması
 * `kartOzeti.test.tsx`te (INV-BILGI-MERKEZI-KART-1); burada kalan üç yüzey:
 *   1. ana sayfa Bilgi bloğu (KnowledgeBlock ← enYeniRehberler),
 *   2. kategori ve aile sayfasının "ilgili rehberler" kartları (IlgiliRehberler ← ilgiliRehberler),
 *   3. yazı altı "ilgili yazılar" (RehberYazisiSayfasi ← yaziSayfasiHazirla).
 * BOŞ KUTU: kart özeti boşsa paragraf çizilmez ve meta açıklaması yerine BASILMAZ.
 */

// Gerçek kaynak (Supabase) yerine sahte katalog: YaziRotasi sayfa modelini DB'siz hazırlar.
vi.mock('../../data/bilgiMerkeziKaynak', async () => {
  const { sahteKaynak: sahte } = await import('./sahteKaynak')
  return { varsayilanKaynak: sahte() }
})

// Ana sayfa bloğunun yazı listesi `enYeniRehberler(lang)`ten gelir (yazı parametresi geçirilemez); varsayılan
// geçişli, boş kutu kolu için tek seferlik değer verilir.
vi.mock('../tersDizin', async (orijinal) => {
  const gercek = await orijinal<typeof import('../tersDizin')>()
  return { ...gercek, enYeniRehberler: vi.fn(gercek.enYeniRehberler) }
})

const GERCEK = YAZILAR.map((y) => ({ y, m: y.diller.tr as YaziMetni })).filter((x) => x.m)

/** Bir yüzeyin kart metni olmayan, ama kart başına bir `<a>` taşıyan bağlantıları. */
const kartMetinleri = (kap: ParentNode, secici: string): string[] =>
  Array.from(kap.querySelectorAll(`${secici} li a span`)).map((s) => s.textContent ?? '')

const anaBlok = () => <KnowledgeBlock dictionary={tr.home.knowledge} finalCtaDict={tr.home.finalCta} lang="tr" />

describe('ana sayfa Bilgi bloğu — kart özetini basar', () => {
  it('⭐yayındaki her TR yazının kart özeti blokta, meta açıklaması YOK', () => {
    expect(GERCEK.length).toBeGreaterThan(0)
    const { container } = render(anaBlok())
    const metinler = kartMetinleri(container, 'section[aria-labelledby="son-rehberler"]')
    for (const { y, m } of GERCEK) {
      expect(metinler, `${y.kimlik}: kart özeti blokta yok`).toContain(m.kartOzeti)
      expect(metinler, `${y.kimlik}: meta açıklaması blokta basılmış`).not.toContain(m.ozet)
    }
  })

  it('⭐BOŞ KUTU: kart özeti boşsa metin çizilmez, meta açıklaması yerine konmaz, bağlantı ve başlık kalır', () => {
    const m = GERCEK[0]?.m as YaziMetni
    vi.mocked(enYeniRehberler).mockReturnValueOnce([{ baslik: 'Boş özetli rehber', kartOzeti: '', href: '/tr/bilgi-merkezi/bos' as Route }])
    const { container } = render(anaBlok())
    expect(screen.getByText('Boş özetli rehber')).toBeTruthy()
    expect(screen.queryByText(m.ozet)).toBeNull()
    const blok = 'section[aria-labelledby="son-rehberler"]'
    expect(kartMetinleri(container, blok)).toEqual(['Boş özetli rehber'])
  })
})

describe('kategori ve aile sayfası "ilgili rehberler" — kart özetini basar', () => {
  const baslik = tr.bilgiMerkezi.ilgiliRehberler

  it('⭐kategori ve aile kimliğiyle gelen kartta kart özeti var, meta açıklaması yok (yayındaki içerik)', () => {
    for (const hedef of ['vh:kategori/frequency-converters', 'vh:aile/danfoss-vlt-micro-drive-fc-51'] as const) {
      const rehberler = ilgiliRehberler(hedef, 'tr', 3, YAZILAR, false)
      expect(rehberler.length, hedef).toBeGreaterThan(0)
      const { container, unmount } = render(<IlgiliRehberler rehberler={rehberler} baslik={baslik} />)
      const metinler = kartMetinleri(container, 'section[aria-labelledby="ilgili-rehberler"]')
      for (const r of rehberler) {
        const m = GERCEK.map((x) => x.m).find((x) => x.kartOzeti.trim() === r.kartOzeti) as YaziMetni
        expect(m, `${hedef}: kart özeti hiçbir yazının kartOzeti'yle eşleşmiyor`).toBeDefined()
        expect(metinler, hedef).toContain(m.kartOzeti)
        expect(metinler, `${hedef}: meta açıklaması basılmış`).not.toContain(m.ozet)
      }
      unmount()
    }
  })

  it('⭐BOŞ KUTU: kart özeti boşsa metin çizilmez, meta açıklaması yerine konmaz, kart bağlantısı kalır', () => {
    const m0 = ORNEK_YAZI.diller.tr as YaziMetni
    const bos: RehberYazisi = { ...ORNEK_YAZI, diller: { tr: { ...m0, kartOzeti: '  ' } } }
    const rehberler = ilgiliRehberler('vh:kategori/air-curtains', 'tr', 3, [bos], false)
    expect(rehberler).toHaveLength(1)
    expect(rehberler[0]?.kartOzeti).toBe('')
    const { container } = render(<IlgiliRehberler rehberler={rehberler} baslik={baslik} />)
    expect(screen.queryByText(m0.ozet)).toBeNull()
    expect(kartMetinleri(container, 'section[aria-labelledby="ilgili-rehberler"]')).toEqual(['Örnek Rehber Yazısı'])
  })
})

describe('yazı altı "ilgili yazılar" — kart özetini basar', () => {
  const m0 = ORNEK_YAZI.diller.tr as YaziMetni
  const es = (ek: Partial<YaziMetni>): RehberYazisi => ({
    ...ORNEK_YAZI,
    kimlik: 'es-konu',
    diller: { tr: { ...m0, slug: 'es-konu', ozet: 'Eş yazının meta açıklaması ayrı bir cümledir.', kartOzeti: 'Eş yazının kart metni farklıdır.', ...ek } },
  })

  it('⭐ilgili yazı kartında kart özeti var, meta açıklaması yok; sayfa modeli kartOzeti taşır', async () => {
    const e = es({})
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI, e])
    expect(sayfa.ilgiliYazilar).toHaveLength(1)
    expect(sayfa.ilgiliYazilar[0]).toEqual({ baslik: 'Örnek Rehber Yazısı', kartOzeti: 'Eş yazının kart metni farklıdır.', href: '/tr/bilgi-merkezi/es-konu' })
    expect(sayfa.ilgiliYazilar[0]).not.toHaveProperty('ozet')
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    const metinler = kartMetinleri(container, 'section[aria-labelledby="ilgili-yazilar"]')
    expect(metinler).toContain('Eş yazının kart metni farklıdır.')
    expect(metinler).not.toContain('Eş yazının meta açıklaması ayrı bir cümledir.')
  })

  it('⭐BOŞ KUTU: kart özeti boşsa metin çizilmez, meta açıklaması yerine konmaz', async () => {
    const e = es({ kartOzeti: '' })
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI, e])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(screen.queryByText('Eş yazının meta açıklaması ayrı bir cümledir.')).toBeNull()
    expect(kartMetinleri(container, 'section[aria-labelledby="ilgili-yazilar"]')).toEqual(['Örnek Rehber Yazısı'])
  })
})

describe('meta açıklaması, og:description ve Article JSON-LD ozet’te AYNEN kalır', () => {
  it('yayındaki her TR yazı: meta description, og:description ve JSON-LD description = ozet; kartOzeti hiçbirinde yok', async () => {
    for (const { y, m } of GERCEK) {
      const params = Promise.resolve({ lang: 'tr', yazi: m.slug })
      const ust = await yaziUstVerisi(params, 'tr')
      expect(ust.description, `${y.kimlik}: meta description`).toBe(m.ozet)
      expect(ust.openGraph?.description, `${y.kimlik}: og:description`).toBe(m.ozet)

      const { container, unmount } = render(await YaziRotasi({ params, bolumDili: 'tr' }))
      const betikler = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>,
      )
      const makale = betikler.find((j) => j['@type'] === 'Article')
      expect(makale, `${y.kimlik}: Article JSON-LD yok`).toBeDefined()
      expect(makale?.description, `${y.kimlik}: JSON-LD description`).toBe(m.ozet)
      expect(JSON.stringify(betikler), `${y.kimlik}: kart özeti yapısal veriye sızmış`).not.toContain(m.kartOzeti)
      expect(makale?.dateModified, `${y.kimlik}: dateModified`).toBe(y.guncellemeTarihi)
      unmount()
    }
  })
})
