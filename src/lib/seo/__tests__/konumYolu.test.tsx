import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * INV-KONUM-YOLU-1 (URN-164, karar K1, 14 Kasım) — arama sonucundaki konum yolu (BreadcrumbList) TÜM sayfa türlerinde
 * aynı kuralla basılır:
 *   1. JSON-LD'de ANA SAYFA halkası yok (görünür `<nav>`'da kalır);
 *   2. kalan her halkanın `item` adresi dolu, SON halka sayfanın kanonik adresi;
 *   3. 2 halkaya ulaşamayan sayfada (kök kategori, Bilgi Merkezi liste) BreadcrumbList BASILMAZ.
 * Google satırı kendi seçer (kırıntı ipucudur, garanti yok); bu test yalnız sayfanın VERDİĞİ veriyi korur.
 */

const durum = vi.hoisted(() => ({ dil: 'tr' as 'tr' | 'en' }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { tr } = await import('@/i18n/dictionaries/tr')
  const { en } = await import('@/i18n/dictionaries/en')
  const { getDictValue } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({ lang: durum.dil, t: (k: string) => getDictValue(durum.dil === 'en' ? en : tr, k) }),
  }
})
// Yazı gövdesi/iç bağlantı çözümü bu testin konusu değil (kırıntı yalnız slug + başlıktan kurulur): hazırlayıcı yazının
// kendi metin ve başlığını döndürür, sayfa gövdesi çizilmez.
vi.mock('../../../lib/bilgiMerkezi/sayfa', async () => {
  const { markdownAyristir } = await import('../../../lib/bilgiMerkezi/markdown')
  return {
    yaziSayfasiHazirla: async (yazi: { diller: Record<string, { slug: string; ozet: string; govde: string }> }, dil: string) => ({
      metin: yazi.diller[dil],
      ayrismis: markdownAyristir(yazi.diller[dil].govde),
    }),
  }
})
vi.mock('../../../views/knowledge/RehberYazisiSayfasi', () => ({ default: () => null }))
vi.mock('../../../views/knowledge/BilgiMerkeziListe', () => ({ default: () => null }))
vi.mock('@/lib/seo/canonicalOrigin', () => ({ canonicalOrigin: () => 'https://venthub.com.tr' }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  usePathname: () => '/tr',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import Breadcrumb from '../../../components/navigation/Breadcrumb'
import { SITE_URL } from '../../../config/siteUrl'
import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { BreadcrumbStep, konumYoluJsonLd } from '../jsonld'

const BASE = 'https://venthub.com.tr'

interface Halka {
  position: number
  name: string
  item?: string
}

function jsonLdler(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1].replace(/\\u003c/g, '<').replace(/\\u003e/g, '>')),
  )
}
const liste = (html: string): Halka[] | null => {
  const l = jsonLdler(html).find((j) => j['@type'] === 'BreadcrumbList')
  return l ? (l.itemListElement as Halka[]) : null
}

/** K1 kuralının tümü tek yerde: ana sayfa yok, her halka adresli, son halka sayfa adresi. */
function kuralaUyar(halkalar: Halka[], sayfaAdresi: string) {
  const kok = new URL(sayfaAdresi).origin
  expect(halkalar.length).toBeGreaterThanOrEqual(2)
  expect(halkalar.every((h) => !!h.item)).toBe(true)
  expect(halkalar.map((h) => h.item)).not.toContain(`${kok}/tr`)
  expect(halkalar.map((h) => h.item)).not.toContain(`${kok}/en`)
  expect(halkalar.at(-1)?.item).toBe(sayfaAdresi)
  expect(halkalar.map((h) => h.position)).toEqual(halkalar.map((_, i) => i + 1))
}

describe('konumYoluJsonLd — tek yardımcı', () => {
  const adimlar: BreadcrumbStep[] = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Fanlar', path: '/tr/category/fanlar' },
    { name: 'Kanal Tipi Fanlar', path: null },
  ]

  it('ana sayfa halkası düşer, son halka sayfa adresini alır', () => {
    const j = konumYoluJsonLd({ lang: 'tr', baseUrl: BASE, steps: adimlar, sayfaAdresi: `${BASE}/tr/category/kanal-tipi-fanlar` })
    kuralaUyar(j?.itemListElement as Halka[], `${BASE}/tr/category/kanal-tipi-fanlar`)
    expect((j?.itemListElement as Halka[]).map((h) => h.name)).toEqual(['Fanlar', 'Kanal Tipi Fanlar'])
  })

  it('2 halkaya ulaşılamıyorsa null (kök kategori, Bilgi Merkezi liste)', () => {
    const j = konumYoluJsonLd({
      lang: 'tr',
      baseUrl: BASE,
      steps: [adimlar[0], { name: 'Fanlar', path: null }],
      sayfaAdresi: `${BASE}/tr/category/fanlar`,
    })
    expect(j).toBeNull()
  })

  it('sözleşme ihlali sessiz geçmez: son basamağa yol, boş ad, boş sayfa adresi ATAR', () => {
    expect(() => konumYoluJsonLd({ lang: 'tr', baseUrl: BASE, steps: [adimlar[0], { name: 'A', path: '/x' }], sayfaAdresi: BASE })).toThrow()
    expect(() =>
      konumYoluJsonLd({ lang: 'tr', baseUrl: BASE, steps: [adimlar[0], adimlar[1], { name: ' ', path: null }], sayfaAdresi: BASE }),
    ).toThrow()
    expect(() => konumYoluJsonLd({ lang: 'tr', baseUrl: BASE, steps: adimlar, sayfaAdresi: '' })).toThrow()
  })

  it('SABOTAJ — kural ayırt eder: ana sayfa halkası kalan ya da adressiz zincir kuralı kırar', () => {
    const kotu: Halka[] = [
      { position: 1, name: 'Ana Sayfa', item: `${BASE}/tr` },
      { position: 2, name: 'Fanlar' },
    ]
    expect(() => kuralaUyar(kotu, `${BASE}/tr/category/fanlar`)).toThrow()
  })
})

describe('Breadcrumb bileşeni (kategori, alt kategori, seri, marka görünümlerinin ortak çıktısı)', () => {
  const render = (items: { label: string; href?: string }[], sayfaYolu?: string) =>
    renderToStaticMarkup(<Breadcrumb items={items} sayfaYolu={sayfaYolu} />)

  it('kök kategori: görünür kırıntı var, JSON-LD YOK (tek halka)', () => {
    const h = render([{ label: 'Ana Sayfa', href: '/' }, { label: 'Fanlar' }], '/category/fanlar')
    expect(h).toContain('Fanlar')
    expect(liste(h)).toBeNull()
  })

  it('alt kategori: ana sayfa halkası yok, son halka sayfanın adresi', () => {
    const h = render(
      [{ label: 'Ana Sayfa', href: '/' }, { label: 'Fanlar', href: '/category/fanlar' }, { label: 'Kanal Tipi Fanlar', href: '' }],
      '/category/kanal-tipi-fanlar',
    )
    kuralaUyar(liste(h) ?? [], `${BASE}/tr/category/kanal-tipi-fanlar`)
    expect(h).toContain('Ana Sayfa') // görünür kırıntıda kalır
  })

  it('üç kademe: tüm atalar kökten başa, her halka adresli', () => {
    const h = render(
      [
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Aksesuarlar', href: '/category/aksesuarlar' },
        { label: 'Elektrik', href: '/category/elektrik' },
        { label: 'Konvertörler', href: '' },
      ],
      '/category/konvertorler',
    )
    const l = liste(h) ?? []
    kuralaUyar(l, `${BASE}/tr/category/konvertorler`)
    expect(l.map((x) => x.name)).toEqual(['Aksesuarlar', 'Elektrik', 'Konvertörler'])
  })

  it('marka sayfası (ana sayfa dil önekli verilir): Ana Sayfa halkası yine düşer', () => {
    const h = render(
      [{ label: 'Ana Sayfa', href: '/tr' }, { label: 'Markalar', href: '/brands' }, { label: 'Vortice' }],
      '/brands/vortice',
    )
    kuralaUyar(liste(h) ?? [], `${BASE}/tr/brands/vortice`)
  })

  it('EN: Home halkası düşer, her halka /en adresli, son halka EN kanonik adresi (kategori, alt kategori, ürün ailesi, marka)', () => {
    durum.dil = 'en'
    try {
      const alt = liste(
        render(
          [{ label: 'Home', href: '/' }, { label: 'Fans', href: '/category/fans' }, { label: 'Duct Fans', href: '' }],
          '/category/duct-fans',
        ),
      )
      kuralaUyar(alt ?? [], `${BASE}/en/category/duct-fans`)
      expect(alt?.map((x) => x.name)).toEqual(['Fans', 'Duct Fans'])

      expect(liste(render([{ label: 'Home', href: '/' }, { label: 'Fans' }], '/category/fans'))).toBeNull()

      const urun = liste(
        render(
          [{ label: 'Home', href: '/' }, { label: 'Shelter Ventilation Systems', href: '/category/shelter' }, { label: 'AVenS', href: '' }],
          '/products/avens',
        ),
      )
      kuralaUyar(urun ?? [], `${BASE}/en/products/avens`)

      const marka = liste(render([{ label: 'Home', href: '/en' }, { label: 'Brands', href: '/brands' }, { label: 'Vortice' }], '/brands/vortice'))
      kuralaUyar(marka ?? [], `${BASE}/en/brands/vortice`)
    } finally {
      durum.dil = 'tr'
    }
  })

  it('EN yardımcı: konumYoluJsonLd Home halkasını düşürür, son halka EN adresi', () => {
    const j = konumYoluJsonLd({
      lang: 'en',
      baseUrl: BASE,
      steps: [{ name: 'Home', path: '/' }, { name: 'Knowledge Hub', path: '/en/knowledge-hub' }, { name: 'Guide', path: null }],
      sayfaAdresi: `${BASE}/en/knowledge-hub/guide`,
    })
    const l = j?.itemListElement as Halka[]
    kuralaUyar(l, `${BASE}/en/knowledge-hub/guide`)
    expect(l.map((h) => h.item)).toEqual([`${BASE}/en/knowledge-hub`, `${BASE}/en/knowledge-hub/guide`])
  })

  it('son öğenin kendi adresi varsa (showcase) prop gerekmez; adres hiç yoksa JSON-LD basılmaz (adressiz halka yok)', () => {
    const adresli = render([{ label: 'Ana Sayfa', href: '/' }, { label: 'Fanlar', href: '/category/fanlar' }, { label: 'Alt', href: '/category/alt' }])
    kuralaUyar(liste(adresli) ?? [], `${BASE}/tr/category/alt`)
    const adressiz = render([{ label: 'Ana Sayfa', href: '/' }, { label: 'Fanlar', href: '/category/fanlar' }, { label: 'Alt' }])
    expect(liste(adressiz)).toBeNull()
  })
})

describe('Bilgi Merkezi (13 yazı + liste)', () => {
  it('her TR yazı: Bilgi Merkezi › yazı başlığı, son halka yazının kanonik adresi; liste sayfasında kırıntı YOK', async () => {
    const { YaziRotasi, ListeRotasi } = await import('../../../views/knowledge/bilgiMerkeziRotasi')
    const trYazilar = YAZILAR.filter((y) => y.diller.tr)
    expect(trYazilar.length, 'ölçüm evreni boş (kör test)').toBeGreaterThanOrEqual(1)
    for (const y of trYazilar) {
      const slug = (y.diller.tr as { slug: string }).slug
      const h = renderToStaticMarkup(await YaziRotasi({ params: Promise.resolve({ lang: 'tr', yazi: slug }), bolumDili: 'tr' }))
      const l = liste(h) ?? []
      // Sunucu sayfaları kökü `SITE_URL`'den alır (test ortamında localhost); biçim aynı.
      kuralaUyar(l, `${SITE_URL}/tr/bilgi-merkezi/${slug}`)
      expect(l).toHaveLength(2)
      expect(l[0].item).toBe(`${SITE_URL}/tr/bilgi-merkezi`)
    }
    const listeHtml = renderToStaticMarkup(await ListeRotasi({ params: Promise.resolve({ lang: 'tr' }), bolumDili: 'tr' }))
    expect(liste(listeHtml)).toBeNull()
  }, 180_000)
})
