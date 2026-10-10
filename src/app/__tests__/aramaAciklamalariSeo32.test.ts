// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Metadata } from 'next'
import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { ACIKLAMA_AZAMI } from '@/lib/seo/aciklamaKirp'

/**
 * INV-ACIKLAMA-SEO32-1 (URN-91 alt iş 2 · SEO-32) — destek, yasal ve hesaplayıcı sayfalarının arama
 * sonucu açıklaması ve başlığı sayfanın KENDİ metninden yazılır, aralıkta kalır ve görünür başlıkla
 * karışmaz.
 *
 * NİÇİN VAR (GEO-SEO canlı okuması, 2026-10-10): bu 11 sayfa 41 ile 70 karakter arasında, kısa ve
 * birbirine benzer açıklamalar basıyordu; dört destek başlığı 30 karakterin altındaydı. İki kusur
 * çevresinde üç tuzak vardı ve kapı üçünü de sabitler:
 *  1. Dört hesaplayıcının `description` anahtarı sayfanın GÖRÜNÜR alt başlığıdır; açıklamayı orada
 *     uzatmak sayfada görünen metni de uzatırdı. Arama açıklaması ayrı `metaDescription` anahtarından
 *     okunur, görünür alt başlık olduğu gibi kalır.
 *  2. `support.links.*` footer etiketi ve sayfa H1'idir, `support.returns.title` iade sayfası H1'idir.
 *     `<title>` ayrı `support.seo.*Title` anahtarından okunur; menü ve H1 değişmez.
 *  3. Standart adı (ISO, NFPA, BS) için sitede kaynak kaydı yok (ayrı kart); arama açıklamasına taşınmaz.
 *
 * ÖLÇMEDİĞİ: Google'ın sonuçta hangi metni gösterdiği (canlı kapı + GSC, yayın sonrası) ve metnin
 * sayfanın görünür gövdesiyle birebir örtüştüğü (metinleri GEO-SEO canlı sayfadan elle çıkarmıştır;
 * kaynak tablo depoda değildir, kapı yalnız sözlük ve rota davranışını ölçer).
 */

const ASGARI = 110
const BASLIK_ASGARI = 30
const BASLIK_AZAMI = 60
const SITE_EKI = ' | VentHub'

/** Standart adı: kaynak kaydı olmadan arama açıklamasına girmez. `EN 1234` biçimi de yakalanır. */
const STANDART_ADI = /\b(?:ISO|NFPA|BS|IEC|ASHRAE|AMCA)\b|\b(?:TS\s)?EN\s?\d/
/** Yer tutucu (`{{x}}`, `{x}`) arama açıklamasında çözülmeden kalır. */
const YER_TUTUCU = /[{}]/
/** Çözülmemiş sözlük anahtarı sızıntısı. */
const HAM_ANAHTAR = /\b(?:support|legal|calculators)\.[a-zA-Z]+\.[a-zA-Z]/

type SayfaUstVerisiModulu = {
  generateMetadata: (girdi: { params: Promise<{ lang: string }> }) => Promise<Metadata>
}

interface Sayfa {
  ad: string
  yukle: () => Promise<SayfaUstVerisiModulu>
  /** `generateMetadata` açıklamasının geldiği sözlük anahtarı. */
  aciklama: string
  /** Aynı sayfanın GÖRÜNÜR metni olan anahtar (açıklamayla karışmamalı); yoksa yalnız metadata kullanır. */
  gorunur?: string
}

const SAYFALAR: Sayfa[] = [
  { ad: 'legal/kullanim-kosullari', yukle: () => import('../[lang]/legal/kullanim-kosullari/page'), aciklama: 'legal.seo.terms' },
  { ad: 'legal/on-bilgilendirme-formu', yukle: () => import('../[lang]/legal/on-bilgilendirme-formu/page'), aciklama: 'legal.seo.preInformation' },
  { ad: 'legal/mesafeli-satis-sozlesmesi', yukle: () => import('../[lang]/legal/mesafeli-satis-sozlesmesi/page'), aciklama: 'legal.seo.distanceSales' },
  { ad: 'destek/garanti-servis', yukle: () => import('../[lang]/destek/garanti-servis/page'), aciklama: 'support.seo.warranty' },
  { ad: 'destek/teslimat-kargo', yukle: () => import('../[lang]/destek/teslimat-kargo/page'), aciklama: 'support.seo.shipping' },
  { ad: 'destek/iade-degisim', yukle: () => import('../[lang]/destek/iade-degisim/page'), aciklama: 'support.seo.returns' },
  { ad: 'destek/sss', yukle: () => import('../[lang]/destek/sss/page'), aciklama: 'support.seo.faq' },
  {
    ad: 'hesaplayicilar/jet-fan',
    yukle: () => import('../[lang]/destek/hesaplayicilar/jet-fan/page'),
    aciklama: 'calculators.jetFan.metaDescription',
    gorunur: 'calculators.jetFan.pageDescription',
  },
  {
    ad: 'hesaplayicilar/kanal',
    yukle: () => import('../[lang]/destek/hesaplayicilar/kanal/page'),
    aciklama: 'calculators.duct.metaDescription',
    gorunur: 'calculators.duct.description',
  },
  {
    ad: 'hesaplayicilar/hrv',
    yukle: () => import('../[lang]/destek/hesaplayicilar/hrv/page'),
    aciklama: 'calculators.hrv.metaDescription',
    gorunur: 'calculators.hrv.description',
  },
  {
    ad: 'hesaplayicilar/hava-perdesi',
    yukle: () => import('../[lang]/destek/hesaplayicilar/hava-perdesi/page'),
    aciklama: 'calculators.airCurtain.metaDescription',
    gorunur: 'calculators.airCurtain.description',
  },
]

const SOZLUKLER = [
  ['tr', tr],
  ['en', en],
] as const

function metin(sozluk: typeof tr | typeof en, anahtar: string): string {
  const deger = getDictValue(sozluk, anahtar)
  // `getDictValue` çözülemeyen anahtarda anahtarın kendisini döndürür.
  if (deger === anahtar) throw new Error(`sözlükte yok: ${anahtar}`)
  return deger
}

function kaynak(...parca: string[]): string {
  return readFileSync(join(process.cwd(), 'src', ...parca), 'utf8')
}

describe('SEO-32 · tarayıcı kör değil', () => {
  it('standart adı kalıbı ISO, NFPA, BS ve EN numarasını yakalar; sıradan metni yakalamaz', () => {
    for (const kotu of ['ISO 27327-1 uyumlu', 'NFPA 502 ve BS 7346', 'EN 12101 serisi', 'TS EN 779']) {
      expect(STANDART_ADI.test(kotu), kotu).toBe(true)
    }
    for (const iyi of ['Garanti belgesi ve kullanım kılavuzu', 'Enter the duct type', 'Heat recovery (HRV) and (ERV) units']) {
      expect(STANDART_ADI.test(iyi), iyi).toBe(false)
    }
  })

  it('yer tutucu ve ham anahtar kalıpları yakalar', () => {
    expect(YER_TUTUCU.test('{{count}} ürün')).toBe(true)
    expect(YER_TUTUCU.test('{ad} markası')).toBe(true)
    expect(YER_TUTUCU.test('Düz cümle.')).toBe(false)
    expect(HAM_ANAHTAR.test('support.seo.faq')).toBe(true)
    expect(HAM_ANAHTAR.test('Sık sorulan sorular.')).toBe(false)
  })
})

describe('SEO-32 · açıklama: gerçek generateMetadata, 11 sayfa × TR ve EN', () => {
  it('her sayfa kendi sözlük anahtarından, 110-155 karakterde, standart adsız ve yer tutucusuz açıklama basar', async () => {
    for (const sayfa of SAYFALAR) {
      const modul = await sayfa.yukle()
      for (const [dil, sozluk] of SOZLUKLER) {
        const meta = await modul.generateMetadata({ params: Promise.resolve({ lang: dil }) })
        const aciklama = String(meta.description)
        const etiket = `${sayfa.ad} ${dil}`
        expect(aciklama, `${etiket}: metadata anahtardan okumuyor (${sayfa.aciklama})`).toBe(metin(sozluk, sayfa.aciklama))
        const uzunluk = [...aciklama].length
        expect(uzunluk, `${etiket}: ${uzunluk} kr — ${aciklama}`).toBeGreaterThanOrEqual(ASGARI)
        expect(uzunluk, `${etiket}: ${uzunluk} kr — ${aciklama}`).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
        expect(aciklama, `${etiket}: standart adı`).not.toMatch(STANDART_ADI)
        expect(aciklama, `${etiket}: yer tutucu`).not.toMatch(YER_TUTUCU)
        expect(aciklama, `${etiket}: ham sözlük anahtarı`).not.toMatch(HAM_ANAHTAR)
        expect(aciklama.trim(), `${etiket}: baş/son boşluk`).toBe(aciklama)
        expect(meta.openGraph?.description, `${etiket}: openGraph açıklaması`).toBe(aciklama)
      }
    }
  }, 180_000)

  it('açıklamalar birbirinden farklıdır ve TR ile EN aynı metin değildir', () => {
    for (const [dil, sozluk] of SOZLUKLER) {
      const metinler = SAYFALAR.map((s) => metin(sozluk, s.aciklama))
      expect(new Set(metinler).size, `${dil}: iki sayfa aynı açıklamayı veremez`).toBe(SAYFALAR.length)
    }
    for (const s of SAYFALAR) {
      expect(metin(tr, s.aciklama), `${s.ad}: TR = EN`).not.toBe(metin(en, s.aciklama))
    }
  })
})

describe('SEO-32 · hesaplayıcı: görünür alt başlık DEĞİŞMEDİ, açıklama ayrı anahtardan', () => {
  /** Değerler SEO-32 öncesi master'daki (145af5703) metinlerdir; görünür alt başlığı sabitler. */
  const GORUNUR_ALT_BASLIK: Array<{ gorunur: string; tr: string; en: string; gorunum: string }> = [
    {
      gorunur: 'calculators.jetFan.pageDescription',
      tr: 'Otopark ve tünel jet fan itki ve havalandırma hesabı',
      en: 'Parking and tunnel jet fan thrust and ventilation calculation',
      gorunum: 'calculators/JetFanCalcPage.tsx',
    },
    {
      gorunur: 'calculators.duct.description',
      tr: 'Hava kanalı hız hesaplaması ve basınç düşümü tahmini',
      en: 'Air duct velocity calculation and pressure drop estimation',
      gorunum: 'calculators/DuctCalcPage.tsx',
    },
    {
      gorunur: 'calculators.hrv.description',
      tr: 'Isı geri kazanım cihazı verimliliği ve enerji tasarrufu hesabı',
      en: 'Heat recovery unit efficiency and energy saving calculation',
      gorunum: 'calculators/HRVCalcPage.tsx',
    },
    {
      gorunur: 'calculators.airCurtain.description',
      tr: 'Kapı ölçüleri ve kullanım koşullarına göre ideal hava perdesi seçimi',
      en: 'Ideal air curtain selection based on door dimensions and usage conditions',
      gorunum: 'calculators/AirCurtainCalcPage.tsx',
    },
  ]

  for (const k of GORUNUR_ALT_BASLIK) {
    it(`${k.gorunur}: sözlükteki görünür alt başlık aynı ve görünüm onu okur`, () => {
      expect(metin(tr, k.gorunur)).toBe(k.tr)
      expect(metin(en, k.gorunur)).toBe(k.en)
      const gorunum = kaynak('views', ...k.gorunum.split('/'))
      expect(gorunum, 'görünüm alt başlığı bu anahtardan okumuyor').toContain(`t('${k.gorunur}')`)
      // Açıklama anahtarı görünür metne SIZMAZ: sayfa alt başlığı uzamaz.
      expect(gorunum, 'görünüm arama açıklaması anahtarını okuyor').not.toContain('metaDescription')
    })
  }

  it('her hesaplayıcının arama açıklaması görünür alt başlıktan ayrı anahtardır ve ondan farklı metindir', () => {
    for (const s of SAYFALAR.filter((x) => x.gorunur)) {
      expect(s.aciklama, `${s.ad}: açıklama anahtarı görünür anahtarla aynı`).not.toBe(s.gorunur)
      for (const [dil, sozluk] of SOZLUKLER) {
        expect(metin(sozluk, s.aciklama), `${s.ad} ${dil}`).not.toBe(metin(sozluk, String(s.gorunur)))
      }
    }
  })
})

describe('SEO-32 · destek başlıkları: <title> ayrı anahtardan, menü etiketi ve H1 değişmedi', () => {
  interface Baslik {
    ad: string
    yukle: () => Promise<SayfaUstVerisiModulu>
    title: string
    /** Menü etiketi ya da sayfa H1'i olan anahtar: <title> bunu kullanmaz. */
    gorunur: string
    gorunurTr: string
    gorunurEn: string
    h1Gorunum: string
  }

  const BASLIKLAR: Baslik[] = [
    {
      ad: 'iade-degisim',
      yukle: () => import('../[lang]/destek/iade-degisim/page'),
      title: 'support.seo.returnsTitle',
      gorunur: 'support.returns.title',
      gorunurTr: 'İade ve Değişim',
      gorunurEn: 'Returns & Exchanges',
      h1Gorunum: 'ReturnsPage.tsx',
    },
    {
      ad: 'garanti-servis',
      yukle: () => import('../[lang]/destek/garanti-servis/page'),
      title: 'support.seo.warrantyTitle',
      gorunur: 'support.links.warranty',
      gorunurTr: 'Garanti ve Servis',
      gorunurEn: 'Warranty & Service',
      h1Gorunum: 'WarrantyPage.tsx',
    },
    {
      ad: 'teslimat-kargo',
      yukle: () => import('../[lang]/destek/teslimat-kargo/page'),
      title: 'support.seo.shippingTitle',
      gorunur: 'support.links.shipping',
      gorunurTr: 'Kargo ve Teslimat',
      gorunurEn: 'Shipping & Delivery',
      h1Gorunum: 'ShippingPage.tsx',
    },
    {
      ad: 'sss',
      yukle: () => import('../[lang]/destek/sss/page'),
      title: 'support.seo.faqTitle',
      gorunur: 'support.links.faq',
      gorunurTr: 'SSS',
      gorunurEn: 'FAQ',
      h1Gorunum: 'FAQPage.tsx',
    },
  ]

  for (const b of BASLIKLAR) {
    it(`${b.ad}: <title> ${b.title} anahtarından, 30-60 karakter, " | VentHub" ekli`, async () => {
      const modul = await b.yukle()
      for (const [dil, sozluk] of SOZLUKLER) {
        const meta = await modul.generateMetadata({ params: Promise.resolve({ lang: dil }) })
        const baslik = String(meta.title)
        const etiket = `${b.ad} ${dil}`
        expect(baslik, `${etiket}: <title> anahtardan okunmuyor`).toBe(`${metin(sozluk, b.title)}${SITE_EKI}`)
        const uzunluk = [...baslik].length
        expect(uzunluk, `${etiket}: ${uzunluk} kr — ${baslik}`).toBeGreaterThanOrEqual(BASLIK_ASGARI)
        expect(uzunluk, `${etiket}: ${uzunluk} kr — ${baslik}`).toBeLessThanOrEqual(BASLIK_AZAMI)
        expect(baslik.endsWith(SITE_EKI), `${etiket}: site eki`).toBe(true)
        expect(baslik, `${etiket}: standart adı`).not.toMatch(STANDART_ADI)
        expect(meta.openGraph?.title, `${etiket}: openGraph başlığı`).toBe(baslik)
      }
    })

    it(`${b.ad}: menü etiketi / H1 anahtarı (${b.gorunur}) değişmedi, görünüm onu okur ve <title> ondan ayrı`, () => {
      expect(metin(tr, b.gorunur)).toBe(b.gorunurTr)
      expect(metin(en, b.gorunur)).toBe(b.gorunurEn)
      expect(b.title).not.toBe(b.gorunur)
      expect(kaynak('views', 'support', b.h1Gorunum)).toContain(`t('${b.gorunur}')`)
    })
  }

  it('SSS: <title> H1 kısaltmasını ("SSS" / "FAQ") ve tam adı birlikte taşır', () => {
    expect(metin(tr, 'support.seo.faqTitle')).toMatch(/^SSS: /)
    expect(metin(en, 'support.seo.faqTitle')).toMatch(/^FAQ: /)
  })
})
