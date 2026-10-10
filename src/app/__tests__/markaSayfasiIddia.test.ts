import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MARKA_YASAK_IFADELER, yasakIfadeIhlalleri } from '@/data/__tests__/markaIddiaListesi'
import { HVAC_BRANDS, type HVACBrand } from '@/data/brands'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { ovguVarMi } from '@/lib/seo/ovguAyikla'
import type { BrandCatalogSummary } from '@/lib/services/family.service'

import {
  markaAciklamasi,
  markaKatalogOzetMetni,
  markaKatalogSayilari,
  MarkaSayfasi,
  OZET_AILE_AZAMI,
  OZET_KATEGORI_AZAMI,
} from '../_components/markaSayfasi'

/**
 * INV-MARKA-IDDIA-1 (URN-79) — Brand JSON-LD açıklaması ve sayfa gövdesinin DB'den türeyen özeti.
 *
 *  (b) Brand JSON-LD `description` ham `brand.description` DEĞİL: arama sonucu açıklamasıyla AYNI süzgeçten (ovguAyikla +
 *      yedek) geçer; ham `**` ya da üstünlük cümlesi taşımaz. Eskiden ham metin basıyordu — meta süzgeci iddiayı arama
 *      sonucundan atıyor, yapısal veri ise aynı iddiayı Google'a söylemeye devam ediyordu.
 *  (d) Gövdedeki ürün aileleri/kategorileri cümlesi DB özetinden, sözlük şablonuyla kurulur (TR+EN); özet yoksa paragraf
 *      yoktur, ürünsüz markada özet sorgusu hiç atılmaz, okuyucu hata verirse sayfa özetsiz çizilir (hata yutulmaz: uyarı).
 */
vi.mock('@/lib/supabase/static', () => ({ supabaseStaticClient: {} }))

afterEach(() => {
  vi.restoreAllMocks()
})

const SENTETIK: HVACBrand = {
  name: 'Testfan',
  slug: 'testfan',
  description: {
    tr: '**Dünya lideri** bir üreticidir. Kanal tipi fanlar üretir.',
    en: '**A world leader** in fans. It makes duct fans.',
  },
  specialty: { tr: 'Kanal Fanları', en: 'Duct Fans' },
}

describe('markaAciklamasi: tek kaynak (meta + JSON-LD), süzgeçli', () => {
  it('ham ** ve üstünlük cümlesi atılır; kalan iddiasız cümle korunur; kısa kalırsa uzmanlık yedeği gelir (TR+EN)', () => {
    const trMetin = markaAciklamasi('tr', SENTETIK, false)
    expect(trMetin).toBe('Testfan: Kanal tipi fanlar üretir. VentHub kataloğunda kanal fanları alanındaki ürünleri inceleyin.')
    const enMetin = markaAciklamasi('en', SENTETIK, false)
    expect(enMetin).toBe(`Testfan: It makes duct fans. ${en.brands.seoYedekUzmanlik.replace('{{uzmanlik}}', 'duct fans')}`)
    for (const m of [trMetin, enMetin]) {
      expect(m).not.toContain('**')
      expect(ovguVarMi(m), m).toBe(false)
    }
  })

  it('tüm kayıt övgüyse yalnız yedek kalır, uydurma metin üretilmez; marka adı başa eklenir', () => {
    const sadeceOvgu: HVACBrand = { ...SENTETIK, specialty: undefined, description: { tr: 'Dünya lideri.', en: 'A world leader.' } }
    // TR yedek cümlesi zaten marka adıyla başlar → ad ikinci kez eklenmez; EN yedeği "Browse…" ile başlar → ad başa eklenir.
    expect(markaAciklamasi('tr', sadeceOvgu, false)).toBe(
      'Testfan markasının ürün ailelerini, modellerini ve teknik özelliklerini VentHub kataloğunda inceleyin.',
    )
    expect(markaAciklamasi('en', sadeceOvgu, false)).toBe(
      'Testfan: Browse the product families, models and technical specifications of Testfan in the VentHub catalog.',
    )
  })

  it('kayıt marka adıyla başlıyorsa ad tekrarlanmaz; ürünsüz markada sözlükteki "teklif isteyin" olgusu döner', () => {
    const adli: HVACBrand = { ...SENTETIK, description: { tr: 'Testfan, kanal fanı üreticisidir. Kanallı sistemlere uygun modeller sunar.', en: 'Testfan makes duct fans of many kinds.' } }
    expect(markaAciklamasi('tr', adli, false).startsWith('Testfan, kanal fanı üreticisidir.')).toBe(true)
    expect(markaAciklamasi('tr', adli, false).startsWith('Testfan: ')).toBe(false)
    expect(markaAciklamasi('tr', SENTETIK, true)).toBe(tr.brands.seoUrunsuz.replace('{{ad}}', 'Testfan'))
    expect(markaAciklamasi('en', SENTETIK, true)).toBe(en.brands.seoUrunsuz.replace('{{ad}}', 'Testfan'))
  })
})

/** `MarkaSayfasi` çıktısı: [JSON-LD <script>, görünüm]. */
function parcalar(el: unknown) {
  const cocuklar = (el as ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>).props.children
  const jsonLd = JSON.parse(
    (cocuklar[0].props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html,
  ) as { description: string; name: string; url: string }
  return {
    jsonLd,
    gorunum: cocuklar[1].props as {
      urunsuz: boolean
      urunOzeti: string
      katalogSayilari: { aile: number; model: number } | null
    },
  }
}

describe('Brand JSON-LD açıklaması (b)', () => {
  it('her gerçek marka × iki dil: JSON-LD açıklaması markaAciklamasi ile BİREBİR aynı, ** ve üstünlük iddiası taşımaz', async () => {
    for (const lang of ['tr', 'en'] as const) {
      for (const b of HVAC_BRANDS) {
        const { jsonLd } = parcalar(await MarkaSayfasi({ lang, slug: b.slug, sayac: async () => 5, katalogOzeti: async () => null }))
        expect(jsonLd.description, `${lang} ${b.slug}`).toBe(markaAciklamasi(lang, b, false))
        expect(jsonLd.description).not.toContain('**')
        expect(ovguVarMi(jsonLd.description), `${lang} ${b.slug}: ${jsonLd.description}`).toBe(false)
        expect(yasakIfadeIhlalleri(b.slug, jsonLd.description).map((y) => String(y.ifade)), `${lang} ${b.slug}: ${jsonLd.description}`).toEqual([])
      }
    }
  })

  it('ürünsüz markada (sayı 0) JSON-LD açıklaması sayfanın söylediğiyle aynı olgu (meta ile aynı kaynak)', async () => {
    const { jsonLd } = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'flexiva', sayac: async () => 0, katalogOzeti: async () => null }))
    expect(jsonLd.description).toBe(tr.brands.seoUrunsuz.replace('{{ad}}', 'Flexiva'))
  })
})

const AILE = (name: string, trAd?: string, enAd?: string): BrandCatalogSummary['families'][number] => ({
  name,
  name_i18n: trAd || enAd ? { tr: trAd ?? null, en: enAd ?? null } : null,
})

const KAT = (name: string, menuLabel: string | null = null, key: string | null = null, slug = 'zz-test') => ({
  name,
  slug,
  menu_label: menuLabel,
  translation_key: key,
})

describe('markaKatalogOzetMetni: DB özetinden sözlük şablonuyla (d)', () => {
  const OZET: BrandCatalogSummary = {
    total: 3,
    families: [AILE('Aksiyel Fanlar', 'Aksiyel Fanlar', 'Axial Fans'), AILE('Plug Fanlar', undefined, 'Plug Fans'), AILE('Kanal Fanları')],
    categories: [KAT('Fans', 'Fanlar'), KAT('Industrial', null, 'industrial', 'industrial'), KAT('Fans', 'Fanlar')],
  }

  it('TR: aile sayısı + kategoriler + aileler; kategori adı sözlük > menu_label > name sırasıyla, tekil', () => {
    expect(markaKatalogOzetMetni('tr', 'Vortice', OZET)).toBe(
      'VentHub kataloğunda Vortice markasının ürün ailesi sayısı: 3. Kategoriler: Fanlar, Endüstriyel Havalandırma. Ürün aileleri: Aksiyel Fanlar, Plug Fanlar, Kanal Fanları.',
    )
  })

  it('EN: ad çevirisi (name_i18n.en) önceliklidir, yoksa ham ad; kategori sözlükten İngilizce', () => {
    expect(markaKatalogOzetMetni('en', 'Vortice', OZET)).toBe(
      'Product families of Vortice in the VentHub catalog: 3. Categories: Fanlar, Industrial Ventilation. Product families: Axial Fans, Plug Fans, Kanal Fanları.',
    )
  })

  it('listedeki aile sayısı toplamdan azsa "ve N aile daha" yazılır; kategori ve aile adları sınırlıdır', () => {
    const cok: BrandCatalogSummary = {
      total: 20,
      families: Array.from({ length: 12 }, (_, i) => AILE(`Aile ${i + 1}`)),
      categories: Array.from({ length: 9 }, (_, i) => KAT(`Kategori ${i + 1}`)),
    }
    const metin = markaKatalogOzetMetni('tr', 'Vortice', cok)
    expect(metin).toContain(`Ürün aileleri: ${Array.from({ length: OZET_AILE_AZAMI }, (_, i) => `Aile ${i + 1}`).join(', ')} ve ${20 - OZET_AILE_AZAMI} aile daha.`)
    expect(metin).toContain(Array.from({ length: OZET_KATEGORI_AZAMI }, (_, i) => `Kategori ${i + 1}`).join(', '))
    expect(metin).not.toContain(`Kategori ${OZET_KATEGORI_AZAMI + 1}`)
    expect(markaKatalogOzetMetni('en', 'Vortice', cok)).toContain(`and ${20 - OZET_AILE_AZAMI} more.`)
  })

  it('kategori ya da aile adı yoksa o cümle hiç yazılmaz; özet yok ya da aile sayısı 0 ise boş metin (uydurma metin üretilmez)', () => {
    expect(markaKatalogOzetMetni('tr', 'Vortice', { total: 2, families: [], categories: [] })).toBe(
      'VentHub kataloğunda Vortice markasının ürün ailesi sayısı: 2.',
    )
    expect(markaKatalogOzetMetni('tr', 'Vortice', null)).toBe('')
    expect(markaKatalogOzetMetni('tr', 'Vortice', { total: 0, families: [], categories: [] })).toBe('')
    expect(markaKatalogOzetMetni('tr', 'Vortice', { total: Number.NaN, families: [AILE('x')], categories: [] })).toBe('')
  })

  it('üretilen metin üstünlük iddiası ve yasak ifade taşımaz', () => {
    for (const lang of ['tr', 'en']) {
      const m = markaKatalogOzetMetni(lang, 'Vortice', OZET)
      expect(ovguVarMi(m), m).toBe(false)
      for (const { ifade } of MARKA_YASAK_IFADELER) expect(ifade.test(m), `${lang}: ${ifade}`).toBe(false)
    }
  })
})

describe('MarkaSayfasi: gövde özet paragrafı (d)', () => {
  const OZET: BrandCatalogSummary = { total: 1, families: [AILE('Aksiyel Fanlar')], categories: [KAT('Fans', 'Fanlar')] }

  it('ürünlü markada özet okunur, markaKatalogOzetMetni ile aynı metin görünüme `urunOzeti` olarak geçer', async () => {
    const oku = vi.fn(async (ad: string) => (ad === 'Vortice' ? OZET : null))
    const { gorunum } = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'vortice', sayac: async () => 5, katalogOzeti: oku }))
    expect(oku).toHaveBeenCalledWith('Vortice')
    expect(gorunum.urunsuz).toBe(false)
    expect(gorunum.urunOzeti).toBe(markaKatalogOzetMetni('tr', 'Vortice', OZET))
    expect(gorunum.urunOzeti).toContain('Aksiyel Fanlar')
  })

  it('ürünsüz markada (sayı 0) özet sorgusu HİÇ atılmaz ve paragraf boştur', async () => {
    const oku = vi.fn(async () => OZET)
    const { gorunum } = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'flexiva', sayac: async () => 0, katalogOzeti: oku }))
    expect(oku).not.toHaveBeenCalled()
    expect(gorunum.urunsuz).toBe(true)
    expect(gorunum.urunOzeti).toBe('')
  })

  it('özet okunamazsa (ağ yok / DB hatası) sayfa özetsiz çizilir, hata FIRLATILMAZ ama uyarı basılır', async () => {
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { gorunum } = parcalar(
      await MarkaSayfasi({
        lang: 'en',
        slug: 'vortice',
        sayac: async () => 5,
        katalogOzeti: async () => {
          throw new Error('ağ yok')
        },
      }),
    )
    expect(gorunum.urunOzeti).toBe('')
    expect(gorunum.urunsuz).toBe(false)
    expect(uyari).toHaveBeenCalledTimes(1)
  })

  it('veri boşsa (özet null) paragraf boştur', async () => {
    const { gorunum } = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'avens', sayac: async () => 5, katalogOzeti: async () => null }))
    expect(gorunum.urunOzeti).toBe('')
  })
})

describe('markaKatalogSayilari: "Katalogda" kutusunun sayıları (URN-82)', () => {
  const OZET = (total: number, models: number | null | undefined): BrandCatalogSummary => ({
    total,
    families: [],
    categories: [],
    ...(models === undefined ? {} : { models }),
  })

  it('aile VE model geçerli pozitif tam sayıysa kutu sayıları döner', () => {
    expect(markaKatalogSayilari(OZET(12, 87))).toEqual({ aile: 12, model: 87 })
  })

  it.each([
    ['özet yok', null],
    ['aile 0', OZET(0, 0)],
    ['model bilinmiyor (liste kesilmiş → null)', OZET(12, null)],
    ['model alanı yok', OZET(12, undefined)],
    ['model 0', OZET(3, 0)],
    ['aile tam sayı değil', OZET(2.5, 10)],
    ['model NaN', OZET(3, Number.NaN)],
  ])('%s → null (eksik ya da kesik sayı basılmaz, kutu çizilmez)', (_ad, ozet) => {
    expect(markaKatalogSayilari(ozet)).toBeNull()
  })

  it('MarkaSayfasi görünüme `katalogSayilari` olarak aile + model geçirir; ürünsüz markada null', async () => {
    const oku = async (): Promise<BrandCatalogSummary> => ({ total: 4, families: [], categories: [], models: 19 })
    const urunlu = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'vortice', sayac: async () => 5, katalogOzeti: oku }))
    expect(urunlu.gorunum.katalogSayilari).toEqual({ aile: 4, model: 19 })
    const urunsuz = parcalar(await MarkaSayfasi({ lang: 'tr', slug: 'flexiva', sayac: async () => 0, katalogOzeti: oku }))
    expect(urunsuz.gorunum.katalogSayilari).toBeNull()
  })
})
