/**
 * INV-HAKKIMIZDA-SAYAC-1 (URN-82 yenileme) — Hakkımızda sayfası GERÇEK sözlükle çizilince sayaç kartları:
 *   · her sayı doğru etiketin altında (anahtar-kart kayması: "Ürün Ailesi" altında marka sayısı basılmaz),
 *   · okunamayan sayaçta (`null`) bölüm hiç çizilmez (boş gri şerit kalmaz),
 *   · çizilen sayfada şirketin deneyim yılı iddiası ("15+") yoktur.
 *
 * Kaynak taraması (`__tests__/conformance/hakkimizda-sayac.test.ts`) kodu ve sözlüğü ayrı ayrı sabitler; bu dosya
 * ikisinin BİRLİKTE ekrana ne bastığını ölçer: birleşmede iki dosyanın ayrı ayrı doğru göründüğü ama birlikte yanlış
 * etiket bastığı hâl yalnız burada görünür. Sayılar birbirinden ayırt edilsin diye sentinel değerlerdir.
 */
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

import AboutPage from '../AboutPage'

vi.mock('next/image', () => ({ default: () => null }))
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

const SAYACLAR = { markaSayisi: 7, aktifUrunSayisi: 201, aileSayisi: 33 }
const DIL = [
  ['tr', tr],
  ['en', en],
] as const

/** Sayaç kartları: [değer, etiket]. Değer `text-5xl` kutusudur; etiket hemen ardındaki kutudur. */
function kartlar(container: HTMLElement): Array<[string, string]> {
  return Array.from(container.querySelectorAll('div.text-5xl')).map((deger) => [
    deger.textContent?.trim() ?? '',
    deger.nextElementSibling?.textContent?.trim() ?? '',
  ])
}

describe('AboutPage sayaç kartları', () => {
  it.each(DIL)('%s: marka, aktif ürün ve aile sayısı kendi etiketinin altında basılır', (lang, d) => {
    const { container } = render(<AboutPage lang={lang} sayaclar={SAYACLAR} />)
    const cizilen = kartlar(container)
    // BOŞ EVREN MUHAFIZI: seçici kart bulamazsa aşağıdaki eşleme iddiaları boşuna geçerdi.
    expect(cizilen).toHaveLength(3)
    const etiketi = (deger: string) => cizilen.find(([v]) => v === deger)?.[1]
    expect(etiketi('7'), 'marka sayısı yanlış etiketin altında').toBe(d.aboutPage.distributorship)
    expect(etiketi('201'), 'aktif ürün sayısı yanlış etiketin altında').toBe(d.aboutPage.completedProject)
    expect(etiketi('33'), 'aile sayısı yanlış etiketin altında').toBe(d.aboutPage.productFamilies)
  })

  it('TR etiketleri bağlı oldukları sayıyı anlatır (sözlük metni kayarsa kırmızı)', () => {
    const { container } = render(<AboutPage lang="tr" sayaclar={SAYACLAR} />)
    const cizilen = kartlar(container)
    const etiketi = (deger: string) => (cizilen.find(([v]) => v === deger)?.[1] ?? '').toLocaleLowerCase('tr-TR')
    expect(etiketi('7')).toContain('marka')
    expect(etiketi('7')).not.toContain('aile')
    expect(etiketi('201')).toContain('model')
    expect(etiketi('33')).toContain('aile')
    expect(etiketi('33')).not.toContain('marka')
  })

  it.each(DIL)('%s: sayaç okunamadıysa (null) kart ve bölüm çizilmez; boş gri şerit kalmaz', (lang) => {
    const dolu = render(<AboutPage lang={lang} sayaclar={SAYACLAR} />)
    const bolumDolu = dolu.container.querySelectorAll('section').length
    dolu.unmount()

    const bos = render(<AboutPage lang={lang} sayaclar={null} />)
    expect(kartlar(bos.container)).toEqual([])
    expect(bos.container.querySelectorAll('section').length, 'sayaç bölümü kartsız çiziliyor').toBe(bolumDolu - 1)
  })

  it.each(DIL)('%s: üç kartın ızgarası dar ekranda tek, sm üstünde üç sütundur (2+1 öksüz kart yok)', (lang) => {
    const { container } = render(<AboutPage lang={lang} sayaclar={SAYACLAR} />)
    const izgara = container.querySelector('div.text-5xl')?.parentElement?.parentElement
    expect(izgara?.className).toContain('grid-cols-1')
    expect(izgara?.className).toContain('sm:grid-cols-3')
  })

  it.each(DIL)('%s: çizilen sayfada şirketin deneyim yılı iddiası yok (sayaç dolu ve boş durumda)', (lang) => {
    const iddia = /(^|[^\d.,])15\s*\+|(^|[^\d.,])15[\s-]*(yıl|year)|yıllık\s+(tecrübe|deneyim)|years?\s+of\s+(field\s+|engineering\s+)?experience/i
    for (const sayaclar of [SAYACLAR, null]) {
      const { container, unmount } = render(<AboutPage lang={lang} sayaclar={sayaclar} />)
      const metin = (container.textContent ?? '').replace(/ /g, ' ')
      // Boş evren muhafızı: sayfa gerçekten çizildi (hero başlığı var), ham anahtar da basılmadı.
      expect(metin.length).toBeGreaterThan(500)
      expect(metin).not.toContain('aboutPage.')
      expect(metin, 'Hakkımızda sayfası deneyim yılı iddiası basıyor').not.toMatch(iddia)
      unmount()
    }
  })
})
