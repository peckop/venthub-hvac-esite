/**
 * REC-300 Faz 3b-2 — bayrak AÇIKKEN (Faz 3-C sonrası) rota × durum × sonuç tablosu.
 *
 * Bayrak derleme sabitidir; bu dosya onu `true` olarak taklit eder (açılış PR'ı yalnız değeri
 * değiştirecek, kararlar bu tabloda şimdiden ölçülür). Evren: canlı DB'den ölçülen 31 satırlık ağaç.
 */
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fiksturdenIdIle, fiksturdenSlugIle } from '../../lib/data/__tests__/fixtures/kategoriAgaci'

const cagri = vi.hoisted(() => ({
  kategori: vi.fn(),
  urunler: vi.fn(),
  marka: vi.fn(),
  kategoriGetir: vi.fn(),
  eskiHedef: vi.fn(),
  ustGetir: vi.fn(),
  staticFrom: vi.fn(),
  eskiUrun: vi.fn(),
  aile: vi.fn(),
}))

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
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

vi.mock('@/lib/data/urunSegmenti', () => ({
  eskiTrUrunAdresiniYonlendir: cagri.eskiUrun,
  urunSegmentiniCoz: vi.fn(),
}))

vi.mock('../_components/aileSayfasi', () => ({ AileSayfasi: cagri.aile, aileSayfasiUstVerisi: vi.fn() }))
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
import MarkaEski, { generateMetadata as markaEskiUst } from '../[lang]/brands/[slug]/page'
import AltKategori, { generateMetadata as altKategoriUst } from '../[lang]/category/[categorySlug]/[subCategorySlug]/page'
import KategoriEski, { generateMetadata as kategoriEskiUst } from '../[lang]/category/[categorySlug]/page'
import KategoriYeni, {
  generateMetadata as kategoriYeniUst,
  generateStaticParams as kategoriYeniParam,
} from '../[lang]/kategori/[kok]/[[...dal]]/page'
import MarkaYeni, { generateMetadata as markaYeniUst, generateStaticParams as markaYeniParam } from '../[lang]/markalar/[slug]/page'
import UrunEski from '../[lang]/products/[slug]/page'
import UrunlerEski, { generateMetadata as urunlerEskiUst } from '../[lang]/products/page'
import UrunlerYeni, { generateMetadata as urunlerYeniUst, generateStaticParams as urunlerYeniParam } from '../[lang]/urunler/page'

const p = <T extends Record<string, unknown>>(o: T) => ({ params: Promise.resolve(o) })

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
  cagri.ustGetir.mockImplementation(async (id: string) => fiksturdenIdIle(id))
  cagri.eskiHedef.mockResolvedValue(null)
})

describe('ön koşul', () => {
  it('bu dosyada bayrak AÇIK taklit ediliyor', () => expect(ADRES_SEMASI_K3B).toBe(true))
})

describe('/tr/kategori (yeni) — rota × durum × sonuç', () => {
  it.each([
    // [kok, dal, beklenen]
    ['fanlar', [], 'CIZ:fans'],
    ['fanlar', ['kanal-tipi-fanlar'], 'CIZ:duct-fans'],
    ['kanal-tipi-fanlar', [], 'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar'], // tek seviye dal
    ['isi-geri-kazanim', ['kanal-tipi-fanlar'], 'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar'], // kök değişimi
    ['fans', ['duct-fans'], 'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar'], // EN biçimli
    ['Fanlar', [], 'REDIRECT:/tr/kategori/fanlar'], // büyük harf
    ['otopark-jet-fanlari', [], 'REDIRECT:/tr/kategori/fanlar'], // pasif → aktif üst
    ['ticari-havalandirma', [], 'REDIRECT:/tr/urunler'], // pasif kök
    ['konut-tipi-havalandirma', ['kanal-ici-hayalet-fanlar'], 'REDIRECT:/tr/urunler'], // pasif üstlü pasif dal
    ['boyle-bir-kategori-yok', [], 'NOT_FOUND'],
    ['fanlar', ['kanal-tipi-fanlar', 'fazla'], 'NOT_FOUND'],
  ])('/tr/kategori/%s/%j → %s', async (kok, dal, beklenen) => {
    await expect(sonuc(() => KategoriYeni(p({ lang: 'tr', kok, dal })), cagri.kategori)).resolves.toBe(beklenen)
  })

  it('EN bu rotayı kullanmaz → 404', async () => {
    await expect(KategoriYeni(p({ lang: 'en', kok: 'fans', dal: [] }))).rejects.toThrow('NOT_FOUND')
  })

  it('DB hatası yutulmaz (404 değil)', async () => {
    cagri.kategoriGetir.mockRejectedValue(new Error('db düştü'))
    await expect(KategoriYeni(p({ lang: 'tr', kok: 'fanlar', dal: [] }))).rejects.toThrow('db düştü')
  })

  it('üst veri: canonical/hreflang/og:url adresUret\'ten, dal iki seviyeli', async () => {
    const m = await kategoriYeniUst(p({ lang: 'tr', kok: 'fanlar', dal: ['kanal-tipi-fanlar'] }))
    expect(m.alternates).toEqual({
      canonical: `${SITE}/tr/kategori/fanlar/kanal-tipi-fanlar`,
      languages: {
        tr: `${SITE}/tr/kategori/fanlar/kanal-tipi-fanlar`,
        en: `${SITE}/en/category/fans/duct-fans`,
        'x-default': `${SITE}/tr/kategori/fanlar/kanal-tipi-fanlar`,
      },
    })
    expect(m.openGraph).toMatchObject({
      url: `${SITE}/tr/kategori/fanlar/kanal-tipi-fanlar`,
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
    })
    expect(m.robots).toBeUndefined()
  })

  it('önceden üretim: 6 kök + 18 dal, TR slug\'larıyla', async () => {
    const satirlar = (await import('../../lib/data/__tests__/fixtures/kategoriAgaci')).KATEGORI_AGACI.filter(
      (c) => c.is_active,
    )
    cagri.staticFrom.mockReturnValue({
      select: () => ({ eq: async () => ({ data: satirlar, error: null }) }),
    })
    const r = await kategoriYeniParam()
    expect(r).toHaveLength(24)
    expect(r).toContainEqual({ lang: 'tr', kok: 'fanlar', dal: [] })
    expect(r).toContainEqual({ lang: 'tr', kok: 'fanlar', dal: ['kanal-tipi-fanlar'] })
    expect(r.every((x) => x.lang === 'tr')).toBe(true)
  })
})

describe('/tr/category (eski) — her çözülebilir slug TEK 308 ile /tr/kategori\'ye', () => {
  it.each([
    ['fanlar', 'REDIRECT:/tr/kategori/fanlar'],
    ['fans', 'REDIRECT:/tr/kategori/fanlar'], // EN biçimli
    ['kanal-tipi-fanlar', 'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar'],
    ['duct-fans', 'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar'],
    ['ticari-havalandirma', 'REDIRECT:/tr/urunler'], // bugün 200 dönen pasif
    ['jet-fans', 'REDIRECT:/tr/kategori/fanlar'],
    ['boyle-bir-kategori-yok', 'NOT_FOUND'],
  ])('/tr/category/%s → %s', async (categorySlug, beklenen) => {
    await expect(sonuc(() => KategoriEski(p({ lang: 'tr', categorySlug })), cagri.kategori)).resolves.toBe(beklenen)
  })

  it.each([
    ['fans', 'duct-fans'],
    ['fanlar', 'kanal-tipi-fanlar'],
    ['isi-geri-kazanim', 'duct-fans'],
  ])('/tr/category/%s/%s → /tr/kategori/fanlar/kanal-tipi-fanlar', async (categorySlug, subCategorySlug) => {
    await expect(AltKategori(p({ lang: 'tr', categorySlug, subCategorySlug }))).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar',
    )
  })

  it('TR eski adreste üst veri yazılmaz (sayfa 308)', async () => {
    await expect(kategoriEskiUst(p({ lang: 'tr', categorySlug: 'fanlar' }))).resolves.toEqual({})
  })
})

describe('/en/category — EN yerinde kalır, dal iki seviyeli (Y4)', () => {
  it.each([
    [['fans'], 'CIZ:fans'],
    [['duct-fans'], 'REDIRECT:/en/category/fans/duct-fans'],
    [['kanal-tipi-fanlar'], 'REDIRECT:/en/category/fans/duct-fans'],
    [['fans', 'duct-fans'], 'CIZ:duct-fans'],
    [['heat-recovery-vmc', 'duct-fans'], 'REDIRECT:/en/category/fans/duct-fans'],
    [['jet-fans'], 'REDIRECT:/en/category/fans'],
    [['commercial-ventilation'], 'REDIRECT:/en/products'],
  ])('/en/category/%j → %s', async (seg, beklenen) => {
    const calis =
      seg.length === 1
        ? () => KategoriEski(p({ lang: 'en', categorySlug: seg[0] }))
        : () => AltKategori(p({ lang: 'en', categorySlug: seg[0], subCategorySlug: seg[1] }))
    await expect(sonuc(calis, cagri.kategori)).resolves.toBe(beklenen)
  })

  it('EN üst verisi: hreflang TR eşi yeni adres, EN dizin dışı (EN_YAYIN kapalı)', async () => {
    const m = await altKategoriUst(p({ lang: 'en', categorySlug: 'fans', subCategorySlug: 'duct-fans' }))
    expect(m.alternates).toMatchObject({
      canonical: `${SITE}/en/category/fans/duct-fans`,
      languages: { tr: `${SITE}/tr/kategori/fanlar/kanal-tipi-fanlar` },
    })
    expect(m.robots).toEqual({ index: false, follow: true })
    const kok = await kategoriEskiUst(p({ lang: 'en', categorySlug: 'fans' }))
    expect(kok.alternates).toMatchObject({ canonical: `${SITE}/en/category/fans`, languages: { tr: `${SITE}/tr/kategori/fanlar` } })
  })
})

describe('tüm ürünler', () => {
  it('/tr/products → /tr/urunler', async () => {
    await expect(UrunlerEski(p({ lang: 'tr' }))).rejects.toThrow('REDIRECT:/tr/urunler')
  })
  it('/en/products çizilir; /tr/urunler çizilir; /en/urunler 404', async () => {
    await expect(sonuc(() => UrunlerEski(p({ lang: 'en' })), cagri.urunler)).resolves.toBe('CIZ:{"lang":"en"}')
    await expect(sonuc(() => UrunlerYeni(p({ lang: 'tr' })), cagri.urunler)).resolves.toBe('CIZ:{"lang":"tr"}')
    await expect(UrunlerYeni(p({ lang: 'en' }))).rejects.toThrow('NOT_FOUND')
  })
  it('üst veri: /tr/urunler ↔ /en/products', async () => {
    const tr = await urunlerYeniUst(p({ lang: 'tr' }))
    expect(tr.alternates).toEqual({
      canonical: `${SITE}/tr/urunler`,
      languages: { tr: `${SITE}/tr/urunler`, en: `${SITE}/en/products`, 'x-default': `${SITE}/tr/urunler` },
    })
    const en = await urunlerEskiUst(p({ lang: 'en' }))
    expect(en.alternates).toMatchObject({ canonical: `${SITE}/en/products`, languages: { tr: `${SITE}/tr/urunler` } })
    await expect(urunlerEskiUst(p({ lang: 'tr' }))).resolves.toEqual({})
    await expect(urunlerYeniParam()).resolves.toEqual([{ lang: 'tr' }])
  })
})

describe('markalar', () => {
  it.each([
    [() => MarkaEski(p({ lang: 'tr', slug: 'avens' })), 'REDIRECT:/tr/markalar/avens'],
    [() => MarkaEski(p({ lang: 'tr', slug: 'AVENS' })), 'REDIRECT:/tr/markalar/avens'],
    [() => MarkaEski(p({ lang: 'tr', slug: 'boyle-marka-yok' })), 'NOT_FOUND'],
    [() => MarkaEski(p({ lang: 'en', slug: 'avens' })), 'CIZ:{"lang":"en","slug":"avens"}'],
    [() => MarkaEski(p({ lang: 'en', slug: 'Avens' })), 'REDIRECT:/en/brands/avens'],
    [() => MarkaEski(p({ lang: 'en', slug: 'boyle-marka-yok' })), 'NOT_FOUND'],
    [() => MarkaYeni(p({ lang: 'tr', slug: 'avens' })), 'CIZ:{"lang":"tr","slug":"avens"}'],
    [() => MarkaYeni(p({ lang: 'tr', slug: 'Avens' })), 'REDIRECT:/tr/markalar/avens'],
    [() => MarkaYeni(p({ lang: 'tr', slug: 'boyle-marka-yok' })), 'NOT_FOUND'],
    [() => MarkaYeni(p({ lang: 'en', slug: 'avens' })), 'NOT_FOUND'],
  ])('%# → %s', async (calis, beklenen) => {
    await expect(sonuc(calis, cagri.marka)).resolves.toBe(beklenen)
  })

  it('üst veri: /tr/markalar/<m> ↔ /en/brands/<m>; önceden üretim yalnız TR', async () => {
    const tr = await markaYeniUst(p({ lang: 'tr', slug: 'avens' }))
    expect(tr.alternates).toEqual({
      canonical: `${SITE}/tr/markalar/avens`,
      languages: { tr: `${SITE}/tr/markalar/avens`, en: `${SITE}/en/brands/avens`, 'x-default': `${SITE}/tr/markalar/avens` },
    })
    const en = await markaEskiUst(p({ lang: 'en', slug: 'avens' }))
    expect(en.alternates).toMatchObject({ languages: { tr: `${SITE}/tr/markalar/avens` } })
    const r = await markaYeniParam()
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((x) => x.lang === 'tr')).toBe(true)
  })
})

describe('/tr/products/<x> — eski ürün adresi hiçbir durumda 200 dönmez', () => {
  it('TR: eski adres çözücüsüne gider (aile gövdesi çizilmez)', async () => {
    cagri.eskiUrun.mockRejectedValue(new Error('REDIRECT:/tr/urun/storm-serisi'))
    await expect(UrunEski(p({ lang: 'tr', slug: 'storm-serisi' }))).rejects.toThrow('REDIRECT:/tr/urun/storm-serisi')
    expect(cagri.eskiUrun).toHaveBeenCalledWith('storm-serisi')
  })

  it('EN: aile adresi yerinde çizilir, eski adres çözücüsü çağrılmaz', async () => {
    const el = (await UrunEski(p({ lang: 'en', slug: 'storm-serisi' }))) as ReactElement<Record<string, unknown>>
    expect(el.type).toBe(cagri.aile)
    expect(cagri.eskiUrun).not.toHaveBeenCalled()
  })
})
