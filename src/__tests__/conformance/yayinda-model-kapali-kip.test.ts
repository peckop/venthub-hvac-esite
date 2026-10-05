// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
vi.mock('@/lib/data/preload', () => ({
  getCachedFamilyDetail: vi.fn(),
  preloadFamily: vi.fn(),
  getFamilyDetailForRoute: vi.fn(),
  getCachedSeriesLanding: vi.fn(),
  getCachedProductBySlug: vi.fn(),
  getCachedFamilySlugById: vi.fn(),
  getCachedTakmaAd: vi.fn(),
  getCachedVariantById: vi.fn(),
  getCachedModelBySku: vi.fn(),
}))

import { aileSayfasiAdresleri } from '@/app/_components/aileSayfasi'
import { buildProductGroupJsonLd } from '@/lib/seo/jsonld'
import type { FamilyVariant } from '@/lib/services/family.service'
import { type AdresNesnesi, adresUret } from '@/utils/adresUret'
import { adresRotalari, modelBaglantiAdresi, modelSecimiHedefi } from '@/utils/yuzeyAdresleri'

/**
 * INV-YAYINDA-MODEL-7 — KAPALI KİP LİSTE DUYARSIZLIĞI (URN-31).
 *
 * `ADRES_SEMASI_K3B` kapalıyken (bugün canlı) yayındaki model listesi HİÇBİR çıktıyı etkilemez: boş liste ile
 * dolu liste BAYT BAYT aynı sonuç verir. (Sitemap için aynı kapı: app/__tests__/sitemapYayindaModel.test.ts.)
 * DUYARLILIK: aynı yüzeyler AÇIK kipte liste ile DEĞİŞİR — karşılaştırma gerçekten ayırt ediyor.
 */

const AILE = 'aile-a'
const DOLU = { modeller: { [AILE]: ['AAA-100', 'AAA-200'] }, surumler: { 'AAA-101': 'AAA-100' } }
const SKULAR = ['AAA-100', 'AAA-101', 'AAA-200', 'ZZZ-9', 'aaa-100', '']

const nesneler: AdresNesnesi[] = [
  { tur: 'urunler' },
  { tur: 'kategori', kok: 'fanlar', dal: 'kanal-tipi-fanlar' },
  { tur: 'aile', slug: AILE },
  { tur: 'marka', slug: 'vortice' },
  ...SKULAR.map((sku): AdresNesnesi => ({ tur: 'model', aileSlug: AILE, sku, slug: AILE })),
]

const variant = (sku: string, i: number): FamilyVariant => ({
  id: `v${i}`, sku, name: 'M', slug: 'm', model_code: null, price: 10, stock_qty: 1,
  technical_specs: null, description: null, images: [],
})
const aile = {
  id: 'f', name: 'A', slug: AILE, series_code: null, description: null, brand_name: null,
  category_id: null, subcategory_id: null, meta_title: null, meta_description: null, category: null, subcategory: null,
}

/** Tüm kapalı-kip yüzeylerinin çıktısı tek nesnede (serileştirilebilir). */
function kapaliCikti(bayrak: boolean) {
  return {
    adresUret: ['tr', 'en'].flatMap((dil) => nesneler.map((n) => adresUret(n, dil as 'tr' | 'en', bayrak))),
    rotalar: ['tr', 'en'].flatMap((dil) => SKULAR.map((s) => adresRotalari(dil as 'tr' | 'en', bayrak).product(AILE, s || undefined))),
    baglanti: SKULAR.map((s) => modelBaglantiAdresi('tr', AILE, s, bayrak)),
    secim: SKULAR.flatMap((s) => [false, true].map((sunucu) => modelSecimiHedefi('tr', AILE, s, sunucu, bayrak))),
    jsonld: ['tr', 'en'].map((lang) =>
      JSON.stringify(
        buildProductGroupJsonLd({ family: aile, variants: SKULAR.filter(Boolean).map(variant), lang, baseUrl: 'https://x', mainCategory: null, bayrak }),
      ),
    ),
    canonical: SKULAR.map((s) => aileSayfasiAdresleri(AILE, s || null, bayrak)),
  }
}

describe('INV-YAYINDA-MODEL-7 — kapalı kip: boş liste = dolu liste (bayt bayt)', () => {
  it('KAPALI: adresUret, adresRotalari, modelBaglantiAdresi, modelSecimiHedefi, JSON-LD, canonical aynı', () => {
    yayindaListesiAyarla()
    const bos = kapaliCikti(false)
    yayindaListesiAyarla(DOLU)
    const dolu = kapaliCikti(false)
    expect(JSON.stringify(dolu)).toBe(JSON.stringify(bos))
  })

  it('KAPALI model adresi bugünkü ?sku= biçiminde (liste ne olursa)', () => {
    yayindaListesiAyarla(DOLU)
    expect(adresUret({ tur: 'model', aileSlug: AILE, sku: 'AAA-100' }, 'tr', false)).toBe(`/tr/products/${AILE}?sku=AAA-100`)
  })

  it('⛔DUYARLILIK: AÇIK kipte aynı karşılaştırma FARKLI çıkar (liste gerçekten etkiliyor)', () => {
    yayindaListesiAyarla()
    const bos = kapaliCikti(true)
    yayindaListesiAyarla(DOLU)
    const dolu = kapaliCikti(true)
    expect(JSON.stringify(dolu)).not.toBe(JSON.stringify(bos))
  })

  it('DUYARLILIK: liste içeriği değişince de AÇIK çıktı değişir (yalnız boş/dolu değil)', () => {
    yayindaListesiAyarla({ modeller: { [AILE]: ['AAA-100'] } })
    const bir = kapaliCikti(true)
    yayindaListesiAyarla({ modeller: { [AILE]: ['AAA-100', 'AAA-200'] } })
    expect(JSON.stringify(kapaliCikti(true))).not.toBe(JSON.stringify(bir))
  })
})
