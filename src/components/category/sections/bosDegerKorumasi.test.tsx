/**
 * URN-84 — sözlükte BOŞ ('') bırakılan değer, kategori anlatı bölümlerinde BOŞ ÖĞE / BOŞ KUTU olarak çizilmez.
 *
 * NİÇİN: Blog BLG-6 kesin metin tablosu bazı maddeleri, sayaç kartlarını ve tablo hücrelerini BOŞ yazıyor
 * ("kaldırma"). Sözlük anahtarı silinmez (TR/EN parite testi anahtar kümesini ölçer), bu yüzden bileşen ''
 * değerini olduğu gibi basarsa ekranda boş madde, boş kart ya da boş kutu çıkar.
 *
 * Testler sözlüğü GERÇEK `tr`den kopyalayıp ilgili anahtarları AÇIKÇA yazar (boş da dolu da): sonuç, gerçek
 * sözlükte o anahtarın bugün ne olduğuna bağlı değildir. Her bölümde bir OLUMLU KONTROL var (dolu değer
 * çizilir); yoksa "boş çizilmedi" iddiası, seçici hiçbir şey bulamadığı için boşuna geçebilirdi.
 */
import { render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { tr } from '@/i18n/dictionaries/tr'

import SilentFanProblem from './silent-fan/SilentFanProblem'
import SilentFanVorticeBrand from './silent-fan/SilentFanVorticeBrand'
import TypeComparison from './TypeComparison'
import VorticeBrand from './VorticeBrand'

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

// Görsel bileşeni bu testin konusu değil (next/image + sözlük bağımlılığı); düz <img> yeter.
vi.mock('@/components/ui/VentImage', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  kaynak.dict = {}
})

/** Noktalı yolu ('a.b[0].c') izleyip değeri yazar. Yol yoksa FIRLATIR: yanlış yazılmış anahtar sessiz geçmesin. */
function yaz(kok: object, yol: string, deger: string): void {
  const parcalar = yol.replace(/\[(\d+)\]/g, '.$1').split('.')
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

/** Gerçek TR sözlüğünün kopyası; verilen yollar yazılır (sonraki yazı öncekini ezer). */
function sozluk(...degisiklikler: Array<Record<string, string>>): object {
  const kopya = JSON.parse(JSON.stringify(tr)) as object
  for (const set of degisiklikler) {
    for (const [yol, deger] of Object.entries(set)) yaz(kopya, yol, deger)
  }
  return kopya
}

const bosMetin = (el: Element) => !el.textContent?.trim()
// Test ortamında lucide simgeleri `<div data-testid="lucide-…">` olarak taklit edilir (vitest.setup); bunlar boş kutu DEĞİL, simgedir.
const ikonMu = (el: Element) => Boolean(el.getAttribute('data-testid')?.startsWith('lucide-'))
/** Çocuğu ve metni olmayan, simge olmayan kutu = ekranda boş kutu. */
const bosYaprak = (el: Element) => el.children.length === 0 && bosMetin(el) && !ikonMu(el)

describe('TypeComparison — boş UYGUN / TERCİH EDİLMEZ maddesi boş hap çizmez', () => {
  const T = 'category.typeComparison.'
  /** Her tipin 1. maddeleri dolu, geri kalanı boş: tablonun bıraktığı durum. */
  const TABAN = {
    [`${T}electricBestFor1`]: 'E-uygun-1',
    [`${T}electricBestFor2`]: '',
    [`${T}electricBestFor3`]: '',
    [`${T}electricBestFor4`]: '',
    [`${T}electricNotFor1`]: 'E-degil-1',
    [`${T}electricNotFor2`]: '',
    [`${T}ambientBestFor1`]: 'A-uygun-1',
    [`${T}ambientBestFor2`]: '',
    [`${T}ambientBestFor3`]: '',
    [`${T}ambientBestFor4`]: '',
    [`${T}ambientNotFor1`]: 'A-degil-1',
    [`${T}ambientNotFor2`]: '',
  }
  const ciz = () => render(<TypeComparison onOpenWizard={() => {}} onSelectType={() => {}} />)
  const haplar = (container: HTMLElement) => Array.from(container.querySelectorAll('span.rounded-full'))

  it('boş maddeler atılır; yalnız dolu dört hap kalır, sırası korunur', () => {
    kaynak.dict = sozluk(TABAN)
    const { container } = ciz()

    expect(haplar(container).filter(bosMetin)).toHaveLength(0)
    expect(haplar(container).map((h) => h.textContent?.trim())).toEqual([
      'E-uygun-1',
      'E-degil-1',
      'A-uygun-1',
      'A-degil-1',
    ])
  })

  it('OLUMLU KONTROL: madde dolduruldu mu çizilir', () => {
    kaynak.dict = sozluk(TABAN, { [`${T}electricBestFor2`]: 'Deneme maddesi' })
    const { container } = ciz()
    expect(haplar(container).map((h) => h.textContent?.trim())).toEqual([
      'E-uygun-1',
      'Deneme maddesi',
      'E-degil-1',
      'A-uygun-1',
      'A-degil-1',
    ])
  })

  it('bir tipin UYGUN listesi tümden boşsa başlığı da basılmaz (altı boş başlık kalmaz)', () => {
    kaynak.dict = sozluk(TABAN, { [`${T}electricBestFor1`]: '' })
    ciz()
    // İki tipten yalnız ısıtıcısız tipin UYGUN listesi kaldı → başlık bir kez; TERCİH EDİLMEZ iki tipte de var.
    expect(screen.getAllByText(tr.category.typeComparison.bestForLabel)).toHaveLength(1)
    expect(screen.getAllByText(tr.category.typeComparison.notForLabel)).toHaveLength(2)
  })

  it('yalnız boşluk içeren madde de boş sayılır', () => {
    kaynak.dict = sozluk(TABAN, { [`${T}ambientBestFor2`]: '   ' })
    const { container } = ciz()
    expect(haplar(container).filter(bosMetin)).toHaveLength(0)
    expect(haplar(container)).toHaveLength(4)
  })

  /** Bir tipin dört AVANTAJ maddesine aynı değeri yazar. */
  const avantajlar = (tip: 'electric' | 'ambient', deger: string): Record<string, string> =>
    Object.fromEntries([1, 2, 3, 4].map((n) => [`${T}${tip}Benefit${n}`, deger]))
  const notForBos = (tip: 'electric' | 'ambient'): Record<string, string> => ({
    [`${T}${tip}NotFor1`]: '',
    [`${T}${tip}NotFor2`]: '',
  })
  const advantagesLabel = tr.category.typeComparison.advantagesLabel
  const notForLabel = tr.category.typeComparison.notForLabel

  it('OLUMLU KONTROL: avantajlar doluyken iki tipte de başlık ve dört madde çizilir', () => {
    kaynak.dict = sozluk(TABAN, avantajlar('electric', 'Avantaj'), avantajlar('ambient', 'Avantaj'))
    const { container } = ciz()
    expect(screen.getAllByText(advantagesLabel)).toHaveLength(2)
    expect(container.querySelectorAll('ul')).toHaveLength(2)
    expect(container.querySelectorAll('li')).toHaveLength(8)
  })

  it('bir tipin AVANTAJ listesi tümden boşsa başlığı ve listesi de basılmaz (boş <ul> kalmaz)', () => {
    kaynak.dict = sozluk(TABAN, avantajlar('electric', ''), avantajlar('ambient', 'Avantaj'))
    const { container } = ciz()
    expect(screen.getAllByText(advantagesLabel)).toHaveLength(1)
    expect(container.querySelectorAll('ul')).toHaveLength(1)
    expect(container.querySelectorAll('li')).toHaveLength(4)
  })

  it('iki tipin de AVANTAJ listesi boşsa başlık, liste ve madde hiç basılmaz', () => {
    kaynak.dict = sozluk(TABAN, avantajlar('electric', ''), avantajlar('ambient', '   '))
    const { container } = ciz()
    expect(screen.queryAllByText(advantagesLabel)).toHaveLength(0)
    expect(container.querySelectorAll('ul')).toHaveLength(0)
    expect(container.querySelectorAll('li')).toHaveLength(0)
  })

  it('bir tipin TERCİH EDİLMEZ listesi tümden boşsa başlığı basılmaz, öbür tipinki durur', () => {
    kaynak.dict = sozluk(TABAN, notForBos('electric'))
    const { container } = ciz()
    expect(screen.getAllByText(notForLabel)).toHaveLength(1)
    expect(haplar(container).map((h) => h.textContent?.trim())).toEqual(['E-uygun-1', 'A-uygun-1', 'A-degil-1'])
  })

  it('iki tipin de TERCİH EDİLMEZ listesi boşsa başlık hiç basılmaz', () => {
    kaynak.dict = sozluk(TABAN, notForBos('electric'), notForBos('ambient'))
    ciz()
    expect(screen.queryAllByText(notForLabel)).toHaveLength(0)
    // UYGUN başlığı bundan etkilenmez: tipler hâlâ birer UYGUN maddesi taşıyor.
    expect(screen.getAllByText(tr.category.typeComparison.bestForLabel)).toHaveLength(2)
  })
})

describe('VorticeBrand — boş sayaç kartı ve boş ödül parçası çizilmez', () => {
  const V = 'category.vorticeBrand.'
  /** Kuruluş yılı kartı (0) boş; kalan üç kart bilinen değerde. */
  const TABAN = {
    [`${V}highlights[0].value`]: '',
    [`${V}highlights[0].label`]: '',
    [`${V}highlights[1].value`]: 'D1',
    [`${V}highlights[1].label`]: 'E1',
    [`${V}highlights[2].value`]: 'D2',
    [`${V}highlights[2].label`]: 'E2',
    [`${V}highlights[3].value`]: 'D3',
    [`${V}highlights[3].label`]: 'E3',
    [`${V}compassoDoro`]: '',
  }
  /** Sayaç satırı: yalnız o satır `grid … gap-2` taşır (kök ızgara gap-8/12). */
  const sayacSatiri = (container: HTMLElement) => container.querySelector('div.grid.gap-2')

  it('değer VE etiket boş kart atılır: dört kart üçe iner, ızgara üç sütun olur', () => {
    kaynak.dict = sozluk(TABAN)
    const { container } = render(<VorticeBrand />)

    const satir = sayacSatiri(container)
    expect(satir).not.toBeNull()
    expect(satir!.children).toHaveLength(3)
    expect(satir!.className).toContain('grid-cols-3')
    expect(satir!.className).not.toContain('grid-cols-4')
    expect(Array.from(satir!.children).filter(bosMetin)).toHaveLength(0)
    expect(Array.from(satir!.children).map((k) => k.textContent)).toEqual(['D1E1', 'D2E2', 'D3E3'])
  })

  it('OLUMLU KONTROL: kart dolu bırakılırsa dört kart çizilir, ızgara dört sütun', () => {
    kaynak.dict = sozluk(TABAN, { [`${V}highlights[0].value`]: 'DEĞER', [`${V}highlights[0].label`]: 'ETİKET' })
    const { container } = render(<VorticeBrand />)
    const satir = sayacSatiri(container)
    expect(satir!.children).toHaveLength(4)
    expect(satir!.className).toContain('grid-cols-4')
    expect(satir!.children[0].textContent).toBe('DEĞERETİKET')
  })

  it('yalnız değer boşsa kart durur, boş değer kutusu basılmaz', () => {
    kaynak.dict = sozluk(TABAN, { [`${V}highlights[0].label`]: 'Yalnız etiket' })
    const { container } = render(<VorticeBrand />)
    const ilk = sayacSatiri(container)!.children[0]
    expect(ilk.textContent).toBe('Yalnız etiket')
    expect(Array.from(ilk.querySelectorAll('div')).filter((d) => !ikonMu(d))).toHaveLength(1)
    expect(Array.from(ilk.querySelectorAll('div')).filter(bosYaprak)).toHaveLength(0)
  })

  it('tüm kartlar boşsa sayaç satırı hiç basılmaz', () => {
    const hepsiBos: Record<string, string> = {}
    for (let i = 0; i < 4; i += 1) {
      hepsiBos[`${V}highlights[${i}].value`] = ''
      hepsiBos[`${V}highlights[${i}].label`] = ''
    }
    kaynak.dict = sozluk(TABAN, hepsiBos)
    const { container } = render(<VorticeBrand />)
    expect(sayacSatiri(container)).toBeNull()
  })

  it('boş ödül parçası boş <strong> bırakmaz; açıklama düz metin çizilir', () => {
    kaynak.dict = sozluk(TABAN)
    const { container } = render(<VorticeBrand />)
    expect(Array.from(container.querySelectorAll('strong')).filter(bosMetin)).toHaveLength(0)
    expect(container.textContent).toContain(tr.category.vorticeBrand.description2)
  })

  it('OLUMLU KONTROL: ödül parçası doluysa vurgulu <strong> çizilir', () => {
    kaynak.dict = sozluk(TABAN, { [`${V}compassoDoro`]: 'VURGU' })
    const { container } = render(<VorticeBrand />)
    expect(Array.from(container.querySelectorAll('strong')).map((s) => s.textContent)).toContain('VURGU')
  })
})

describe('SilentFanVorticeBrand — boş sayaç kartı çizilmez', () => {
  const S = 'categorySilentFan.brand.'
  const TABAN = {
    [`${S}stats[0].value`]: '',
    [`${S}stats[0].label`]: '',
    [`${S}stats[1].value`]: 'D1',
    [`${S}stats[1].label`]: 'E1',
    [`${S}stats[2].value`]: 'D2',
    [`${S}stats[2].label`]: 'E2',
    [`${S}stats[3].value`]: 'D3',
    [`${S}stats[3].label`]: 'E3',
  }
  /** Sayaç ızgarası: kök ızgara `gap-16`, bu `gap-6`. */
  const sayac = (container: HTMLElement) => container.querySelector('div.grid.grid-cols-2.gap-6')

  it('değer VE etiket boş kart atılır: dört kart üçe iner, hiçbiri boş değildir', () => {
    kaynak.dict = sozluk(TABAN)
    const { container } = render(<SilentFanVorticeBrand />)
    const kutu = sayac(container)
    expect(kutu).not.toBeNull()
    expect(kutu!.children).toHaveLength(3)
    expect(Array.from(kutu!.children).filter(bosMetin)).toHaveLength(0)
    expect(Array.from(kutu!.children).map((k) => k.textContent)).toEqual(['D1E1', 'D2E2', 'D3E3'])
  })

  it('OLUMLU KONTROL: kart dolu bırakılırsa dört kart çizilir', () => {
    kaynak.dict = sozluk(TABAN, { [`${S}stats[0].value`]: 'DEĞER', [`${S}stats[0].label`]: 'ETİKET' })
    const { container } = render(<SilentFanVorticeBrand />)
    expect(sayac(container)!.children).toHaveLength(4)
    expect(sayac(container)!.children[0].textContent).toBe('DEĞERETİKET')
  })

  it('yalnız etiket boşsa kart durur, boş etiket kutusu basılmaz', () => {
    kaynak.dict = sozluk(TABAN, { [`${S}stats[0].value`]: 'Yalnız değer' })
    const { container } = render(<SilentFanVorticeBrand />)
    const ilk = sayac(container)!.children[0]
    expect(ilk.textContent).toBe('Yalnız değer')
    expect(Array.from(ilk.querySelectorAll('div')).filter(bosYaprak)).toHaveLength(0)
  })

  it('tüm kartlar boşsa sayaç ızgarası hiç basılmaz', () => {
    const hepsiBos: Record<string, string> = {}
    for (let i = 0; i < 4; i += 1) {
      hepsiBos[`${S}stats[${i}].value`] = ''
      hepsiBos[`${S}stats[${i}].label`] = ''
    }
    kaynak.dict = sozluk(TABAN, hepsiBos)
    const { container } = render(<SilentFanVorticeBrand />)
    expect(sayac(container)).toBeNull()
  })
})

describe('SilentFanProblem — boş sorun kartı ve boş açıklama çizilmez', () => {
  const P = 'categorySilentFan.problem.'
  const TABAN = {
    [`${P}painPoints[0].title`]: 'B0',
    [`${P}painPoints[0].description`]: 'A0',
    [`${P}painPoints[1].title`]: 'B1',
    [`${P}painPoints[1].description`]: 'A1',
    [`${P}painPoints[2].title`]: 'B2',
    [`${P}painPoints[2].description`]: 'A2',
    [`${P}painPoints[3].title`]: '',
    [`${P}painPoints[3].description`]: '',
  }
  /** Kart ızgarası: `grid … gap-4` (içerideki karşılaştırma ızgarası gap-8). */
  const kartlar = (container: HTMLElement) => container.querySelector('div.grid.gap-4')

  it('başlık VE açıklama boş kart atılır: dört kart üçe iner, ızgara üç sütun olur', () => {
    kaynak.dict = sozluk(TABAN)
    const { container } = render(<SilentFanProblem />)
    const kutu = kartlar(container)
    expect(kutu!.children).toHaveLength(3)
    expect(kutu!.className).toContain('lg:grid-cols-3')
    expect(kutu!.className).not.toContain('lg:grid-cols-4')
    expect(Array.from(kutu!.querySelectorAll('h3')).map((h) => h.textContent)).toEqual(['B0', 'B1', 'B2'])
  })

  it('OLUMLU KONTROL: dördüncü kart doluysa dört kart, dört sütun', () => {
    kaynak.dict = sozluk(TABAN, { [`${P}painPoints[3].title`]: 'BAŞLIK', [`${P}painPoints[3].description`]: 'AÇIKLAMA' })
    const { container } = render(<SilentFanProblem />)
    const kutu = kartlar(container)
    expect(kutu!.children).toHaveLength(4)
    expect(kutu!.className).toContain('lg:grid-cols-4')
    expect(kutu!.children[3].textContent).toBe('BAŞLIKAÇIKLAMA')
  })

  it('yalnız açıklama boşsa kart başlıkla durur, boş <p> basılmaz', () => {
    kaynak.dict = sozluk(TABAN, { [`${P}painPoints[3].title`]: 'Yalnız başlık' })
    const { container } = render(<SilentFanProblem />)
    const dorduncu = kartlar(container)!.children[3]
    expect(dorduncu.textContent).toBe('Yalnız başlık')
    expect(dorduncu.querySelector('p')).toBeNull()
    expect(Array.from(container.querySelectorAll('p, h3')).filter(bosMetin)).toHaveLength(0)
  })
})
