/**
 * REC-300 Faz 3b-2 — bayrak KAPALIYKEN (bugün) canlı davranış DEĞİŞMEZ.
 *
 * İki yarı:
 *  1. Yeni K3-b rotaları (`/tr/kategori`, `/tr/urunler`, `/tr/markalar`) HİÇBİR adres açmaz ve veri
 *     katmanına gitmez (aynı nesne iki adresten yayınlanmasın — REC-205 sınıfı).
 *  2. Eski rotaların kararları ve üst verisi, gövdeleri `_components/`'a taşındıktan sonra da
 *     bugünküyle BİREBİR (tablo testi; beklenen değerler taşımadan ÖNCEKİ kodun çıktısı).
 */
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fiksturdenSlugIle } from '../../lib/data/__tests__/fixtures/kategoriAgaci'

const cagri = vi.hoisted(() => ({
  kategori: vi.fn(),
  urunler: vi.fn(),
  marka: vi.fn(),
  kategoriGetir: vi.fn(),
  eskiHedef: vi.fn(),
  ustGetir: vi.fn(),
  staticFrom: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
}))

vi.mock('@/lib/data/preload', () => ({
  getCachedCategoryData: cagri.kategoriGetir,
  eskiKategoriHedefi: cagri.eskiHedef,
  getCachedKategoriUstById: cagri.ustGetir,
  preloadCategory: vi.fn(),
}))

vi.mock('@/lib/supabase/static', () => ({ supabaseStaticClient: { from: cagri.staticFrom } }))

vi.mock('../_components/kategoriSayfasi', async (orijinal) => ({
  ...(await orijinal<typeof import('../_components/kategoriSayfasi')>()),
  KategoriSayfasi: cagri.kategori,
}))
vi.mock('../_components/urunlerSayfasi', async (orijinal) => ({
  ...(await orijinal<typeof import('../_components/urunlerSayfasi')>()),
  UrunlerSayfasi: cagri.urunler,
}))
vi.mock('../_components/markaSayfasi', async (orijinal) => ({
  ...(await orijinal<typeof import('../_components/markaSayfasi')>()),
  MarkaSayfasi: cagri.marka,
}))

import { ADRES_SEMASI_K3B } from '../../config/features'
import { SITE_URL as SITE } from '../../config/siteUrl'
import MarkaEski, {
  generateMetadata as markaEskiUst,
  generateStaticParams as markaEskiParam,
} from '../[lang]/brands/[slug]/page'
import AltKategori, { generateMetadata as altKategoriUst } from '../[lang]/category/[categorySlug]/[subCategorySlug]/page'
import KategoriEski, { generateMetadata as kategoriEskiUst } from '../[lang]/category/[categorySlug]/page'
import KategoriYeni, {
  generateMetadata as kategoriYeniUst,
  generateStaticParams as kategoriYeniParam,
} from '../[lang]/kategori/[kok]/[[...dal]]/page'
import MarkaYeni, {
  generateMetadata as markaYeniUst,
  generateStaticParams as markaYeniParam,
} from '../[lang]/markalar/[slug]/page'
import UrunlerEski, {
  generateMetadata as urunlerEskiUst,
  generateStaticParams as urunlerEskiParam,
} from '../[lang]/products/page'
import UrunlerYeni, {
  generateMetadata as urunlerYeniUst,
  generateStaticParams as urunlerYeniParam,
} from '../[lang]/urunler/page'

const p = <T extends Record<string, unknown>>(o: T) => ({ params: Promise.resolve(o) })

/** Rota bileşeni ya çizer (öğe döner) ya da fırlatır (404/308). Sonucu tek dizgeye indirir. */
async function sonuc(calis: () => Promise<unknown>, beklenenBilesen: unknown): Promise<string> {
  try {
    const el = (await calis()) as ReactElement<Record<string, unknown>>
    if (el.type !== beklenenBilesen) return `BASKA:${String(el.type)}`
    const kat = el.props.category as { slug: string } | undefined
    return kat ? `CIZ:${kat.slug}` : `CIZ:${JSON.stringify(el.props)}`
  } catch (e) {
    return (e as Error).message
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  cagri.kategoriGetir.mockImplementation(async (s: string) => fiksturdenSlugIle(s))
  cagri.eskiHedef.mockResolvedValue(null)
})

describe('ön koşul', () => {
  it('bayrak kapalı', () => expect(ADRES_SEMASI_K3B).toBe(false))
})

describe('yeni K3-b rotaları bayrak kapalıyken 404 — veri katmanına HİÇ gidilmez', () => {
  it.each([
    ['tr', 'fanlar', []],
    ['tr', 'fanlar', ['kanal-tipi-fanlar']],
    ['en', 'fans', []],
  ])('/%s/kategori/%s/%j → 404', async (lang, kok, dal) => {
    await expect(KategoriYeni(p({ lang, kok, dal }))).rejects.toThrow('NOT_FOUND')
    await expect(kategoriYeniUst(p({ lang, kok, dal }))).resolves.toEqual({})
    expect(cagri.kategoriGetir).not.toHaveBeenCalled()
  })

  it.each(['tr', 'en'])('/%s/urunler → 404', async (lang) => {
    await expect(UrunlerYeni(p({ lang }))).rejects.toThrow('NOT_FOUND')
    await expect(urunlerYeniUst(p({ lang }))).resolves.toEqual({})
  })

  it.each([
    ['tr', 'avens'],
    ['en', 'avens'],
  ])('/%s/markalar/%s → 404', async (lang, slug) => {
    await expect(MarkaYeni(p({ lang, slug }))).rejects.toThrow('NOT_FOUND')
    await expect(markaYeniUst(p({ lang, slug }))).resolves.toEqual({})
  })

  it('derlemede önceden sayfa üretilmez (DB\'ye de gidilmez)', async () => {
    await expect(kategoriYeniParam()).resolves.toEqual([])
    await expect(urunlerYeniParam()).resolves.toEqual([])
    await expect(markaYeniParam()).resolves.toEqual([])
    expect(cagri.staticFrom).not.toHaveBeenCalled()
  })
})

describe('eski kategori rotası — kararlar bugünküyle aynı', () => {
  it.each([
    ['tr', 'fanlar', 'CIZ:fans'],
    ['tr', 'fans', 'REDIRECT:/tr/category/fanlar'],
    ['en', 'fans', 'CIZ:fans'],
    ['en', 'fanlar', 'REDIRECT:/en/category/fans'],
    // tek seviyeli dal adresi bugün kanonik — çizilir
    ['tr', 'kanal-tipi-fanlar', 'CIZ:duct-fans'],
    // pasif kategori bugün 200 (O4) — bayrak kapalıyken DEĞİŞMEZ
    ['tr', 'ticari-havalandirma', 'CIZ:commercial-ventilation'],
    ['tr', 'boyle-bir-kategori-yok', 'NOT_FOUND'],
  ])('/%s/category/%s → %s', async (lang, categorySlug, beklenen) => {
    await expect(sonuc(() => KategoriEski(p({ lang, categorySlug })), cagri.kategori)).resolves.toBe(beklenen)
  })

  it('gövdeye bugünkü girdiler gider (dil + adresteki slug)', async () => {
    const el = (await KategoriEski(p({ lang: 'tr', categorySlug: 'fanlar' }))) as ReactElement<Record<string, unknown>>
    expect(el.props).toMatchObject({ lang: 'tr', categorySlug: 'fanlar' })
  })

  it('eski slug takma adda → bugünkü slug\'a 308 (REC-300 Faz 1-A dalı korunur)', async () => {
    cagri.eskiHedef.mockResolvedValue('kanal-tipi-fanlar')
    await expect(KategoriEski(p({ lang: 'tr', categorySlug: 'eski-slug' }))).rejects.toThrow(
      'REDIRECT:/tr/category/kanal-tipi-fanlar',
    )
  })

  it('DB hatası yutulmaz', async () => {
    cagri.kategoriGetir.mockRejectedValue(new Error('db düştü'))
    await expect(KategoriEski(p({ lang: 'tr', categorySlug: 'fanlar' }))).rejects.toThrow('db düştü')
  })

  it('iki seviyeli rota yalnız yönlendirir (tek seviyeli kanoniğe), üst veri üretmez', async () => {
    await expect(AltKategori(p({ lang: 'tr', categorySlug: 'fans', subCategorySlug: 'duct-fans' }))).rejects.toThrow(
      'REDIRECT:/tr/category/kanal-tipi-fanlar',
    )
    await expect(AltKategori(p({ lang: 'en', categorySlug: 'fans', subCategorySlug: 'duct-fans' }))).rejects.toThrow(
      'REDIRECT:/en/category/duct-fans',
    )
    await expect(
      altKategoriUst(p({ lang: 'en', categorySlug: 'fans', subCategorySlug: 'duct-fans' })),
    ).resolves.toEqual({})
  })

  it('üst veri BİREBİR bugünkü (TR)', async () => {
    const m = await kategoriEskiUst(p({ lang: 'tr', categorySlug: 'fanlar' }))
    const aciklama = 'Fanlar kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.'
    expect(m).toEqual({
      title: 'Fanlar | VentHub',
      description: aciklama,
      alternates: {
        canonical: `${SITE}/tr/category/fanlar`,
        languages: {
          tr: `${SITE}/tr/category/fanlar`,
          en: `${SITE}/en/category/fans`,
          'x-default': `${SITE}/tr/category/fanlar`,
        },
      },
      openGraph: {
        title: 'Fanlar | VentHub',
        description: aciklama,
        url: `${SITE}/tr/category/fanlar`,
        siteName: 'VentHub',
        images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
        locale: 'tr_TR',
        type: 'website',
      },
    })
  })

  it('üst veri BİREBİR bugünkü (EN) ve bulunamadı başlığı', async () => {
    const m = await kategoriEskiUst(p({ lang: 'en', categorySlug: 'fans' }))
    expect(m.alternates).toEqual({
      canonical: `${SITE}/en/category/fans`,
      languages: {
        tr: `${SITE}/tr/category/fanlar`,
        en: `${SITE}/en/category/fans`,
        'x-default': `${SITE}/tr/category/fanlar`,
      },
    })
    expect(m.openGraph).toMatchObject({ url: `${SITE}/en/category/fans`, locale: 'en_US' })
    await expect(kategoriEskiUst(p({ lang: 'en', categorySlug: 'yok' }))).resolves.toEqual({
      title: 'Category Not Found | VentHub',
    })
  })
})

describe('eski ürünler listesi — bugünküyle aynı', () => {
  it.each(['tr', 'en'])('/%s/products çizilir', async (lang) => {
    await expect(sonuc(() => UrunlerEski(p({ lang })), cagri.urunler)).resolves.toBe(`CIZ:${JSON.stringify({ lang })}`)
  })

  it('iki dil önceden üretilir', async () => {
    await expect(urunlerEskiParam()).resolves.toEqual([{ lang: 'tr' }, { lang: 'en' }])
  })

  it('üst veri BİREBİR bugünkü', async () => {
    const m = await urunlerEskiUst(p({ lang: 'tr' }))
    expect(m.alternates).toEqual({
      canonical: `${SITE}/tr/products`,
      languages: { tr: `${SITE}/tr/products`, en: `${SITE}/en/products`, 'x-default': `${SITE}/tr/products` },
    })
    expect(m.robots).toEqual({ index: true, follow: true })
    expect(m.openGraph).toMatchObject({ url: `${SITE}/tr/products`, locale: 'tr_TR', type: 'website' })
  })
})

describe('eski marka rotası — bugünküyle aynı', () => {
  it.each([
    ['tr', 'avens'],
    ['en', 'avens'],
    // bilinmeyen marka bugün de gövdeye gider (görünüm kendi boş hâlini çizer) — DEĞİŞMEZ
    ['tr', 'boyle-marka-yok'],
  ])('/%s/brands/%s çizilir', async (lang, slug) => {
    await expect(sonuc(() => MarkaEski(p({ lang, slug })), cagri.marka)).resolves.toBe(
      `CIZ:${JSON.stringify({ lang, slug })}`,
    )
  })

  it('iki dil × her marka önceden üretilir (sıra: marka başına tr, en)', async () => {
    const r = await markaEskiParam()
    expect(r.slice(0, 2)).toEqual([
      { lang: 'tr', slug: 'vortice' },
      { lang: 'en', slug: 'vortice' },
    ])
    expect(r.length % 2).toBe(0)
  })

  it('üst veri BİREBİR bugünkü', async () => {
    const m = await markaEskiUst(p({ lang: 'tr', slug: 'avens' }))
    const aciklama =
      "Avens markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da."
    expect(m).toEqual({
      title: 'Avens Ürünleri ve Çözümleri | VentHub',
      description: aciklama,
      alternates: {
        canonical: `${SITE}/tr/brands/avens`,
        languages: {
          tr: `${SITE}/tr/brands/avens`,
          en: `${SITE}/en/brands/avens`,
          'x-default': `${SITE}/tr/brands/avens`,
        },
      },
      openGraph: {
        title: 'Avens Ürünleri ve Çözümleri | VentHub',
        description: aciklama,
        url: `${SITE}/tr/brands/avens`,
        siteName: 'VentHub',
        images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
        locale: 'tr_TR',
        type: 'website',
      },
    })
    await expect(markaEskiUst(p({ lang: 'tr', slug: 'yok' }))).resolves.toEqual({ title: 'Marka Bulunamadı | VentHub' })
  })

  it('gövdenin JSON-LD adresi BİREBİR bugünkü (`adresUret` kapalı kipte = Routes.brand + dil)', async () => {
    const { MarkaSayfasi: GercekMarkaSayfasi } =
      await vi.importActual<typeof import('../_components/markaSayfasi')>('../_components/markaSayfasi')
    // İki dil de ölçülür: EN öneki yeni şemada da `brands` olduğu için yalnız EN'e bakan kol
    // şema kaymasını GÖRMEZ (sabotaj S14 ilk koşumda tam bu yüzden yeşil kaldı).
    for (const lang of ['tr', 'en'] as const) {
      const el = GercekMarkaSayfasi({ lang, slug: 'avens' })
      const cocuklar = (el.props as { children: ReactElement<{ dangerouslySetInnerHTML: { __html: string } }>[] })
        .children
      const jsonLd = JSON.parse(cocuklar[0].props.dangerouslySetInnerHTML.__html) as { url: string }
      expect(jsonLd.url).toBe(`${SITE}/${lang}/brands/avens`)
    }
  })
})
