/**
 * URN-84 — sözlükte BOŞ ('') bırakılan değer, ana sayfa / altbilgi / yüzen düğme bileşenlerinde BOŞ ÖĞE olarak
 * çizilmez (kategori bölümlerinin karşılığı: `category/sections/bosDegerKorumasi.test.tsx`).
 *
 * Sözlük GERÇEK `tr`den kopyalanır, ilgili anahtarlar AÇIKÇA yazılır; her bölümde OLUMLU KONTROL vardır (dolu
 * değer çizilir) ki "boş çizilmedi" iddiası seçici hiçbir şey bulamadığı için boşuna geçmesin.
 */
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tr } from '@/i18n/dictionaries/tr'

import CaseStudySection from '../CaseStudySection'
import Footer from '../Footer'
import WhatsAppFloat from '../WhatsAppFloat'

const kaynak = vi.hoisted(() => ({ dict: {} as object }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { getDictValue } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      lang: 'tr' as const,
      t: (anahtar: string) => getDictValue(kaynak.dict, anahtar),
      dict: kaynak.dict,
    }),
  }
})

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({ categories: [] }),
}))

/** Noktalı yolu izleyip değeri yazar. Yol yoksa FIRLATIR: yanlış yazılmış anahtar sessiz geçmesin. */
function yaz(kok: object, yol: string, deger: string): void {
  const parcalar = yol.split('.')
  let gecerli = kok as Record<string, unknown>
  for (const parca of parcalar.slice(0, -1)) {
    const sonraki = gecerli[parca]
    if (sonraki === null || typeof sonraki !== 'object') throw new Error(`sözlükte yol yok: ${yol} (${parca})`)
    gecerli = sonraki as Record<string, unknown>
  }
  const son = parcalar[parcalar.length - 1]
  if (!(son in gecerli)) throw new Error(`sözlükte anahtar yok: ${yol}`)
  gecerli[son] = deger
}

function sozluk(...degisiklikler: Array<Record<string, string>>): object {
  const kopya = JSON.parse(JSON.stringify(tr)) as object
  for (const set of degisiklikler) {
    for (const [yol, deger] of Object.entries(set)) yaz(kopya, yol, deger)
  }
  return kopya
}

afterEach(() => {
  kaynak.dict = {}
  vi.unstubAllEnvs()
})

describe('CaseStudySection — etiketi boş ölçü hapı ve boş kart çizilmez', () => {
  const P = 'home.caseStudies.items.parking.'
  const A = 'home.caseStudies.items.airCurtain.'
  /** Tablonun bıraktığı durum: dört ölçü etiketi de boş. */
  const OLCULER_BOS = {
    [`${P}metrics.energySavings`]: '',
    [`${P}metrics.duration`]: '',
    [`${A}metrics.comfortIncrease`]: '',
    [`${A}metrics.roi`]: '',
  }
  const kartlar = (container: HTMLElement) => Array.from(container.querySelectorAll('div.rounded-2xl'))
  const haplar = (container: HTMLElement) => Array.from(container.querySelectorAll('span.rounded-full'))

  it('etiketsiz ölçü hapı çizilmez: koda gömülü değerler (%35, 2 hafta, %+20, < 6 ay) ekrana çıkmaz, kartlar durur', () => {
    kaynak.dict = sozluk(OLCULER_BOS)
    const { container } = render(<CaseStudySection />)

    expect(kartlar(container)).toHaveLength(2)
    expect(haplar(container)).toHaveLength(0)
    // Ölçülerin hepsi elendiyse hap sarmalayıcısı da çizilmez (boş bir `flex-wrap` kutusu kalmaz).
    expect(container.querySelectorAll('div.flex-wrap')).toHaveLength(0)
    for (const gomulu of ['%35', '2 hafta', '%+20', '< 6 ay']) {
      expect(container.textContent).not.toContain(gomulu)
    }
  })

  it('OLUMLU KONTROL: etiketi dolu ölçü çizilir, boş etiketli kardeşi çizilmez', () => {
    kaynak.dict = sozluk(OLCULER_BOS, { [`${P}metrics.energySavings`]: 'Etiket' })
    const { container } = render(<CaseStudySection />)
    const haplarMetni = haplar(container).map((h) => h.textContent?.replace(/\s+/g, ' ').trim())
    expect(haplarMetni).toEqual(['Etiket: %35'])
    // Sarmalayıcı yalnız ölçüsü kalan kartta var (parking); airCurtain kartında yok.
    expect(container.querySelectorAll('div.flex-wrap')).toHaveLength(1)
  })

  it('başlığı boş kart çizilmez; özeti boş kartta özet satırı basılmaz', () => {
    kaynak.dict = sozluk(OLCULER_BOS, { [`${P}title`]: '', [`${A}summary`]: '' })
    const { container } = render(<CaseStudySection />)
    const cizilen = kartlar(container)
    expect(cizilen).toHaveLength(1)
    expect(cizilen[0].querySelector('h3')?.textContent).toBe(tr.home.caseStudies.items.airCurtain.title)
    expect(cizilen[0].querySelector('p')).toBeNull()
  })

  it('hiç kart kalmadıysa bölüm (başlık ve altyazı dahil) çizilmez', () => {
    kaynak.dict = sozluk(OLCULER_BOS, { [`${P}title`]: '', [`${A}title`]: '' })
    const { container } = render(<CaseStudySection />)
    expect(container.firstChild).toBeNull()
  })
})

// URN-82 ile çalışma saati kutusu (hafta içi / cumartesi saat aralığı) kalktı; yerinde "Teklif ve Sorular" başlığı,
// yönlendirme cümlesi ve iletişim formu bağlantısı durur. URN-84'ün koruması bu yeni kutuya taşındı: başlık ya da cümle
// sözlükte BOŞ bırakılırsa o öğe boş çizilmez; iletişim bağlantısı her durumda kalır.
describe('Footer — "Teklif ve Sorular" kutusunda boş başlık ya da cümle çizilmez', () => {
  /** Kutu = iletişim formu bağlantısının (metniyle bulunur; adres dil önekine bağlı değil) kapsayıcısı. */
  const kutu = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('footer a')).find((a) => a.textContent === tr.footer.contactForm)?.parentElement ?? null

  it('başlık ve cümle boşken kutuda boş <h4> / <p> yok, saat sabiti de yok; iletişim bağlantısı durur', () => {
    kaynak.dict = sozluk({ 'footer.workingHours': '', 'footer.weekdays': '' })
    const { container } = render(<Footer />)
    const cizilen = kutu(container)
    expect(cizilen, 'iletişim formu bağlantısının kutusu bulunamadı').not.toBeNull()
    expect(cizilen!.querySelector('h4')).toBeNull()
    expect(cizilen!.querySelector('p')).toBeNull()
    expect(cizilen!.textContent).toContain(tr.footer.contactForm)
    expect(container.textContent).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('yalnız cümle boşsa yalnız o alan basılmaz (başlık durur)', () => {
    kaynak.dict = sozluk({ 'footer.weekdays': '' })
    const { container } = render(<Footer />)
    const cizilen = kutu(container)
    expect(cizilen!.querySelector('h4')?.textContent).toBe(tr.footer.workingHours)
    expect(cizilen!.querySelector('p')).toBeNull()
  })

  it('OLUMLU KONTROL: ikisi doluyken başlık ve cümle çizilir', () => {
    kaynak.dict = sozluk({})
    const { container } = render(<Footer />)
    const cizilen = kutu(container)
    expect(cizilen!.querySelector('h4')?.textContent).toBe(tr.footer.workingHours)
    expect(cizilen!.querySelector('p')?.textContent).toBe(tr.footer.weekdays)
  })
})

describe('WhatsAppFloat — boş ipucu balonu çizilmez', () => {
  beforeEach(() => {
    // Düğme yalnız numara ENV'i varken çizilir (canlıda yok); test onu açar.
    vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551112233')
  })

  it('ipucu metni boşken düğmede boş <span> yok', () => {
    kaynak.dict = sozluk({ 'common.whatsappTooltip': '' })
    const { container } = render(<WhatsAppFloat />)
    const dugme = container.querySelector('a#whatsapp-float')
    expect(dugme).not.toBeNull()
    expect(dugme!.querySelectorAll('span')).toHaveLength(0)
  })

  it('OLUMLU KONTROL: ipucu doluysa balon çizilir', () => {
    kaynak.dict = sozluk({ 'common.whatsappTooltip': 'İpucu metni' })
    const { container } = render(<WhatsAppFloat />)
    const balon = container.querySelector('a#whatsapp-float span')
    expect(balon?.textContent).toBe('İpucu metni')
  })
})
