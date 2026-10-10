import { describe, expect, it, vi } from 'vitest'

import { aciklamaKirp } from '@/lib/seo/aciklamaKirp'
import type { DomainCategory } from '@/lib/type-converters'
import { getCategorySeoDescription, getCategorySeoTitle } from '@/utils/categoryHelpers'

import { kategoriSayfasiUstVerisi, kategoriSayfasiUstVerisiK3b } from '../_components/kategoriSayfasi'

/**
 * INV-KATEGORI-SEO-1 (URN-91 alt iş 1 · KTL-21) — kategori sayfasının arama sonucu başlığı ve açıklaması
 * kategorinin `seo_title` / `seo_desc` kaydından okunur; kayıt yoksa bugünkü davranış AYNEN sürer.
 *
 * YUVA KARARI (URUN ↔ KATALOG, 2026-10-10): TR değer sütunda, EN değer `metadata.seo_title_en` /
 * `metadata.seo_desc_en` içinde. Dört tuzağı sabitler:
 *  1. EN sayfa SÜTUNA DÜŞMEZ (sütun Türkçedir; İngilizce arama sonucunda Türkçe başlık çıkardı).
 *  2. TR sayfa `metadata.*_en` alanını okumaz.
 *  3. Site eki " | VentHub" koda aittir; kayda yazılmış ek çift basılmaz.
 *  4. İki rota kipi (bayrak kapalı / K3-b) AYNI metni basar; görünür kategori adı (H1) değişmez.
 *
 * ÖLÇMEDİĞİ: Google'ın sonuçta hangi metni gösterdiği (canlı kapı + GSC, yayın sonrası) ve canlı kayıtların
 * kendisi (veri KATALOG'un yazıcısındadır; bu kapı yalnız okuma davranışını ölçer).
 */

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) }),
    rpc: async () => ({ data: [] }),
  },
}))

const TR_BASLIK = 'Aksiyel Fanlar: Endüstriyel Havalandırma'
const TR_ACIKLAMA =
  'Aksiyel fanlar havayı mil ekseni boyunca iter: yüksek debi, düşük basınç. Depo, atölye ve duvar açıklığı havalandırmasında kullanılır.'
const EN_BASLIK = 'Axial Fans: Industrial Ventilation'
const EN_ACIKLAMA =
  'Axial fans move air along the shaft: high airflow, low pressure. Used for warehouse, workshop and wall-opening ventilation.'
const KENDI_TR = 'Havayı milin ekseni boyunca iten fanlar: yüksek debi, düşük basınç.'
const KENDI_EN = 'Fans that push air along the shaft: high airflow, low pressure.'

interface Alanlar {
  seoTitle?: string | null
  seoDesc?: string | null
  seoTitleEn?: unknown
  seoDescEn?: unknown
  /** `description_i18n` yazılsın mı (bugünkü açıklama kaynağı). */
  kendiMetni?: boolean
}

/** Tam tipli fikstür: seo alanları verilmezse kayıt "boş" (bugünkü canlı durum: 35/35 boş). */
function kategori(a: Alanlar = {}): DomainCategory {
  return {
    authority_content: null,
    created_at: '2026-09-01T00:00:00.000Z',
    description: '',
    display_mode: null,
    id: 'id-aksiyel',
    image_url: null,
    is_active: true,
    is_featured: null,
    level: 0,
    marketing_title: null,
    menu_label: null,
    metadata: {
      slug: { tr: 'aksiyel', en: 'axial' },
      ...(a.kendiMetni ? { description_i18n: { tr: KENDI_TR, en: KENDI_EN } } : {}),
      ...(a.seoTitleEn !== undefined ? { seo_title_en: a.seoTitleEn as string } : {}),
      ...(a.seoDescEn !== undefined ? { seo_desc_en: a.seoDescEn as string } : {}),
    },
    name: 'aksiyel',
    parent_id: null,
    seo_desc: a.seoDesc ?? null,
    seo_title: a.seoTitle ?? null,
    slug: 'aksiyel',
    sort_order: null,
    tenant_id: 'tenant-1',
    translation_key: null,
    updated_at: '2026-09-01T00:00:00.000Z',
  }
}

const KIPLER = [
  ['bugünkü kip (bayrak kapalı)', (lang: string, k: DomainCategory) => kategoriSayfasiUstVerisi(lang, k)],
  ['K3-b kipi (bayrak açık)', (lang: string, k: DomainCategory) => kategoriSayfasiUstVerisiK3b(lang, k, null)],
] as const

describe('getCategorySeoTitle / getCategorySeoDescription', () => {
  it('TR sütundan okur, kenar boşluklarını kırpar', () => {
    const k = kategori({ seoTitle: `  ${TR_BASLIK}  `, seoDesc: ` ${TR_ACIKLAMA} ` })
    expect(getCategorySeoTitle(k, 'tr')).toBe(TR_BASLIK)
    expect(getCategorySeoDescription(k, 'tr')).toBe(TR_ACIKLAMA)
  })

  it('EN yalnız metadata.*_en okur ve SÜTUNA DÜŞMEZ', () => {
    const yalnizSutun = kategori({ seoTitle: TR_BASLIK, seoDesc: TR_ACIKLAMA })
    expect(getCategorySeoTitle(yalnizSutun, 'en')).toBe('')
    expect(getCategorySeoDescription(yalnizSutun, 'en')).toBe('')

    const enDolu = kategori({ seoTitle: TR_BASLIK, seoTitleEn: EN_BASLIK, seoDescEn: EN_ACIKLAMA })
    expect(getCategorySeoTitle(enDolu, 'en')).toBe(EN_BASLIK)
    expect(getCategorySeoDescription(enDolu, 'en')).toBe(EN_ACIKLAMA)
  })

  it('TR metadata.*_en alanını okumaz', () => {
    const k = kategori({ seoTitleEn: EN_BASLIK, seoDescEn: EN_ACIKLAMA })
    expect(getCategorySeoTitle(k, 'tr')).toBe('')
    expect(getCategorySeoDescription(k, 'tr')).toBe('')
  })

  it('hata yolları: boş, yalnız boşluk, metin olmayan değer, null/undefined kayıt → boş dize', () => {
    expect(getCategorySeoTitle(kategori({ seoTitle: '   ' }), 'tr')).toBe('')
    expect(getCategorySeoTitle(kategori({ seoTitleEn: '   ' }), 'en')).toBe('')
    expect(getCategorySeoTitle(kategori({ seoTitleEn: 42 }), 'en')).toBe('')
    expect(getCategorySeoDescription(kategori({ seoDescEn: { tr: 'x' } }), 'en')).toBe('')
    expect(getCategorySeoTitle(null, 'tr')).toBe('')
    expect(getCategorySeoTitle(undefined, 'en')).toBe('')
    expect(getCategorySeoTitle({ seo_title: 'Başlık', metadata: 'metin' }, 'en')).toBe('')
    expect(getCategorySeoTitle({ seo_title: 'Başlık', metadata: null }, 'tr')).toBe('Başlık')
  })
})

describe.each(KIPLER)('kategori üst verisi · %s', (_ad, uret) => {
  it('kayıt BOŞKEN bugünkü davranış: başlık = görünen ad + eki, açıklama = kategorinin kendi metni', () => {
    for (const lang of ['tr', 'en'] as const) {
      const bos = uret(lang, kategori({ kendiMetni: true }))
      expect(String(bos.title), `${lang} başlık`).toBe('aksiyel | VentHub')
      expect(String(bos.description), `${lang} açıklama`).toBe(aciklamaKirp(lang === 'en' ? KENDI_EN : KENDI_TR))
      expect(bos.openGraph?.title, `${lang} og:title`).toBe('aksiyel | VentHub')
    }
  })

  it('TR dolu: başlık ve açıklama sütundan; og:title aynı; site eki korunur', () => {
    const m = uret('tr', kategori({ seoTitle: TR_BASLIK, seoDesc: TR_ACIKLAMA, kendiMetni: true }))
    expect(String(m.title)).toBe(`${TR_BASLIK} | VentHub`)
    expect(m.openGraph?.title).toBe(`${TR_BASLIK} | VentHub`)
    expect(String(m.description)).toBe(aciklamaKirp(TR_ACIKLAMA))
    expect(m.openGraph?.description).toBe(aciklamaKirp(TR_ACIKLAMA))
  })

  it('EN dolu: başlık ve açıklama metadata.*_en alanından', () => {
    const m = uret('en', kategori({ seoTitle: TR_BASLIK, seoDesc: TR_ACIKLAMA, seoTitleEn: EN_BASLIK, seoDescEn: EN_ACIKLAMA }))
    expect(String(m.title)).toBe(`${EN_BASLIK} | VentHub`)
    expect(m.openGraph?.title).toBe(`${EN_BASLIK} | VentHub`)
    expect(String(m.description)).toBe(aciklamaKirp(EN_ACIKLAMA))
  })

  it('yalnız TR dolu: EN sayfa Türkçe başlığa/açıklamaya DÜŞMEZ, bugünkü davranışa döner', () => {
    const m = uret('en', kategori({ seoTitle: TR_BASLIK, seoDesc: TR_ACIKLAMA, kendiMetni: true }))
    expect(String(m.title)).toBe('aksiyel | VentHub')
    expect(String(m.title)).not.toContain('Aksiyel Fanlar')
    expect(String(m.description)).toBe(aciklamaKirp(KENDI_EN))
  })

  it('yalnız EN dolu: TR sayfa metadata.*_en okumaz', () => {
    const m = uret('tr', kategori({ seoTitleEn: EN_BASLIK, seoDescEn: EN_ACIKLAMA, kendiMetni: true }))
    expect(String(m.title)).toBe('aksiyel | VentHub')
    expect(String(m.description)).toBe(aciklamaKirp(KENDI_TR))
  })

  it('kısmi kayıt: yalnız başlık dolu → açıklama kategorinin kendi metninden; yalnız açıklama dolu → başlık görünen ad', () => {
    const yalnizBaslik = uret('tr', kategori({ seoTitle: TR_BASLIK, kendiMetni: true }))
    expect(String(yalnizBaslik.title)).toBe(`${TR_BASLIK} | VentHub`)
    expect(String(yalnizBaslik.description)).toBe(aciklamaKirp(KENDI_TR))

    const yalnizAciklama = uret('tr', kategori({ seoDesc: TR_ACIKLAMA, kendiMetni: true }))
    expect(String(yalnizAciklama.title)).toBe('aksiyel | VentHub')
    expect(String(yalnizAciklama.description)).toBe(aciklamaKirp(TR_ACIKLAMA))
  })

  it('kayda yazılmış site eki çift basılmaz', () => {
    for (const ekli of [`${TR_BASLIK} | VentHub`, `${TR_BASLIK}|VentHub`, `${TR_BASLIK}  |  venthub  `]) {
      const m = uret('tr', kategori({ seoTitle: ekli }))
      expect(String(m.title), ekli).toBe(`${TR_BASLIK} | VentHub`)
    }
  })

  it('yalnız site ekinden oluşan kayıt boş sayılır → görünen ada döner', () => {
    const m = uret('tr', kategori({ seoTitle: ' | VentHub' }))
    expect(String(m.title)).toBe('aksiyel | VentHub')
  })

  it('uzun açıklama tek kırpıcıdan geçer (azami uzunluğu aşmaz)', () => {
    const uzun = `${TR_ACIKLAMA} ${'Kanal tipi ve duvar tipi modeller ayrıca bulunur. '.repeat(8)}`
    const m = uret('tr', kategori({ seoDesc: uzun }))
    expect(String(m.description)).toBe(aciklamaKirp(uzun))
    expect(String(m.description).length).toBeLessThanOrEqual(155)
  })
})
