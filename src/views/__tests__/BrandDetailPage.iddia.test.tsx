import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { KAYNAKLI_KURULUS, MARKA_YASAK_IFADELER, yillariBul } from '@/data/__tests__/markaIddiaListesi'
import { HVAC_BRANDS } from '@/data/brands'
import { I18nProvider } from '@/i18n/I18nProvider'

import BrandDetailPage from '../BrandDetailPage'

/**
 * INV-MARKA-IDDIA-1 (URN-79) — ÇİZİLEN marka sayfası: doğrulanamayan iddia yok, kurumsal özet kutusu boş kalmaz.
 *
 *  (a) her marka × iki dil: sayfanın görünen metni yasak ifade listesinden temiz; metindeki her yıl markanın kaynaklı
 *      kuruluş yılıdır (Vortice 1954, SEAT 1968) — Avens 2010, Danfoss 1933, Nicotra 1959 kaynak dizininde geçmediği için yok.
 *  (c) Avens "Garanti: 2 Yıl" satırı kalktı (garanti-servis sayfasıyla çelişiyordu); özet kutusu satırı olmadan DÜZGÜN çizilir:
 *      her satırın etiketi ve değeri dolu, boş kutu yok. Çizilecek satırı olmayan marka (Flexiva) için başlık da çizilmez.
 *  (d) sunucunun DB'den kurduğu `urunOzeti` paragrafı gövdede görünür; verilmezse paragraf yoktur.
 */
vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/tr/brands/avens',
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/services/family.service', () => ({
  getFamiliesEnriched: async () => ({ items: [], total: 0 }),
}))

// `useScrollAnimation` (hero animasyonu) jsdom'da olmayan IntersectionObserver ister; bu testin konusu animasyon değil.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

type Dil = 'tr' | 'en'

async function ciz(slug: string, lang: Dil, urunOzeti?: string) {
  const sonuc = render(
    <I18nProvider lang={lang}>
      <BrandDetailPage initialBrandSlug={slug} urunOzeti={urunOzeti} />
    </I18nProvider>,
  )
  // Aile listesi boş döner → boş-durum dalı çizilince sayfa oturmuştur.
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBeTruthy())
  await waitFor(() => expect(sonuc.container.textContent).toMatch(/catalogue yet|katalogda değil/))
  return sonuc
}

/** "Kurumsal Özet" kutusundaki satırlar: her satır [etiket, değer]. */
function ozetSatirlari(kap: HTMLElement): string[][] {
  const aside = kap.querySelector('aside')
  return [...(aside?.querySelectorAll('.justify-between') ?? [])].map((satir) =>
    [...satir.children].map((c) => (c.textContent ?? '').trim()),
  )
}

describe('çizilen marka sayfası yasak iddia taşımaz (a)', () => {
  for (const lang of ['tr', 'en'] as const) {
    for (const b of HVAC_BRANDS) {
      it(`${lang} · ${b.slug}: yasak ifade yok; yıllar yalnız kaynaklı kuruluş yılı`, async () => {
        const { container, unmount } = await ciz(b.slug, lang)
        const metin = container.textContent ?? ''
        for (const { ifade, neden } of MARKA_YASAK_IFADELER) {
          expect(ifade.test(metin), `${lang} ${b.slug}: ${ifade} (${neden}) → "${metin.slice(0, 240)}"`).toBe(false)
        }
        const izinli = KAYNAKLI_KURULUS[b.slug]?.yil
        for (const yil of yillariBul(metin)) {
          expect(yil, `${lang} ${b.slug}: kaynaksız yıl ${yil}`).toBe(izinli)
        }
        unmount()
      })
    }
  }
})

describe('kurumsal özet kutusu (c)', () => {
  it('Avens: Garanti / "2 Yıl" satırı YOK; kalan satırlar (Üretim, Merkez, Web) dolu — TR', async () => {
    const { container } = await ciz('avens', 'tr')
    const satirlar = ozetSatirlari(container)
    expect(satirlar.map((s) => s[0])).toEqual(['Üretim', 'Merkez', 'Web Otoritesi'])
    expect(satirlar[0]).toEqual(['Üretim', 'Türkiye'])
    expect(container.textContent).not.toMatch(/Garanti|2 Yıl/)
  })

  it('Avens: Warranty / "2 Years" satırı YOK; kalan satırlar dolu — EN', async () => {
    const { container } = await ciz('avens', 'en')
    expect(ozetSatirlari(container).map((s) => s[0])).toEqual(['Manufacturing', 'Headquarters', 'Web Authority'])
    expect(container.textContent).not.toMatch(/Warranty|2 Years/)
  })

  it('her markada her özet satırının etiketi ve değeri dolu (boş hücre / boş kutu yok); kutu çizildiyse en az bir satır var', async () => {
    for (const lang of ['tr', 'en'] as const) {
      for (const b of HVAC_BRANDS) {
        const { container, unmount } = await ciz(b.slug, lang)
        const satirlar = ozetSatirlari(container)
        for (const s of satirlar) {
          expect(s.length, `${lang} ${b.slug}`).toBe(2)
          expect(s[0], `${lang} ${b.slug}: boş etiket`).not.toBe('')
          expect(s[1], `${lang} ${b.slug}: boş değer`).not.toBe('')
          expect(s[0], `${lang} ${b.slug}: ham sözlük anahtarı`).not.toMatch(/^brands\./)
        }
        const baslikVar = /Kurumsal Özet|Corporate Snapshot/.test(container.querySelector('aside')?.textContent ?? '')
        expect(baslikVar, `${lang} ${b.slug}: başlık var ↔ satır var`).toBe(satirlar.length > 0)
        unmount()
      }
    }
  })

  it('Flexiva (çizilecek özet satırı yok): başlıksız kutu, "katalog iste" düğmesi yine çizilir', async () => {
    const { container } = await ciz('flexiva', 'tr')
    expect(ozetSatirlari(container)).toEqual([])
    expect(container.querySelector('aside')?.textContent).not.toContain('Kurumsal Özet')
    expect(screen.getByRole('button', { name: 'Marka Kataloglarını İste' })).toBeTruthy()
  })

  it('Vortice: kaynaklı kuruluş yılı hem üst şeritte hem özet kutusunda görünür (kaynaklı yıl KALIR)', async () => {
    const { container } = await ciz('vortice', 'tr')
    expect(ozetSatirlari(container)).toContainEqual(['Kuruluş', '1954'])
    expect(container.textContent).toContain('Kuruluş 1954')
  })

  it('Nicotra Gebhardt: kaynaksız "Kuruluş 1959" satırı yok; Grup ve Uzmanlık satırları kalır', async () => {
    const { container } = await ciz('nicotra-gebhardt', 'tr')
    expect(ozetSatirlari(container).map((s) => s[0])).toEqual(['Grup', 'Uzmanlık', 'Merkez', 'Web Otoritesi'])
    expect(container.textContent).not.toContain('1959')
  })
})

describe('DB\'den türeyen özet paragrafı (d)', () => {
  const OZET_TR = 'VentHub kataloğunda Vortice markasının ürün ailesi sayısı: 3. Kategoriler: Fanlar. Ürün aileleri: A, B, C.'

  it('urunOzeti verilince açıklamanın altında ayrı paragraf olarak çizilir; marka açıklaması da yerinde', async () => {
    const { container } = await ciz('vortice', 'tr', OZET_TR)
    const p = screen.getByText(OZET_TR)
    expect(p.tagName).toBe('P')
    expect(container.textContent).toContain('İtalya menşeli havalandırma üreticisi.')
  })

  it('urunOzeti verilmezse ya da boşsa paragraf çizilmez', async () => {
    const { container, unmount } = await ciz('vortice', 'tr')
    expect(container.textContent).not.toContain('ürün ailesi sayısı')
    unmount()
    const bos = await ciz('vortice', 'tr', '')
    expect(bos.container.textContent).not.toContain('ürün ailesi sayısı')
  })
})
