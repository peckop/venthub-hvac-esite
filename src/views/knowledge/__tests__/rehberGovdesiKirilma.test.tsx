import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { markdownAyristir } from '../../../lib/bilgiMerkezi/markdown'
import RehberGovdesi from '../RehberGovdesi'

/**
 * INV-REHBER-UZUN-KELIME-1 — rehber gövdesinde bölünemeyen uzun dizi (kaynak adresi) satırı taşırmaz.
 * 2026-09-25 ön izleme ölçümü: 390 px'te "Kaynaklar" listesi scrollWidth 847 px'e çıktı, sayfa yana
 * kaydı. Onarım gövde kökünde `break-words` (overflow-wrap: break-word). jsdom yerleşim hesaplamadığı
 * için burada sınıfın KÖKTE ve kalıtımla uzun adresi taşıyan her öğenin üstünde olduğu ölçülür; gerçek
 * piksel ölçümü ön izlemede (document.scrollWidth == clientWidth, 390 px) yapılır.
 * Tablo istisnası: tablolar kendi `overflow-x-auto` kabında kalır (kabı kaldırmak da KIRMIZI).
 */
const UZUN = 'https://www.danfoss.com/en/about-danfoss/our-businesses/drives/knowledge-center/cok-uzun-bir-adres-parcasi'

const KAYNAK = [
  '# Örnek rehber',
  '',
  '## Kaynaklar',
  '',
  `1. Danfoss, ${UZUN}`,
  `2. Ayrıca bakınız ${UZUN}`,
  '',
  `Paragraf içinde de ${UZUN} geçebilir.`,
  '',
  '| Model | Güç |',
  '| --- | --- |',
  '| FC 102 | 5,5 kW |',
].join('\n')

function ciz() {
  const { bloklar } = markdownAyristir(KAYNAK)
  return render(<RehberGovdesi bloklar={bloklar} hrefler={new Map()} />).container
}

describe('INV-REHBER-UZUN-KELIME-1 — rehber gövdesi uzun kelimeyi kırar', () => {
  it('gövde kökü break-words taşır', () => {
    const kok = ciz().firstElementChild
    expect(kok, 'gövde kökü çizilmedi').not.toBeNull()
    expect(kok?.classList.contains('break-words'), 'kökte break-words yok — uzun adres satırı taşırır').toBe(true)
  })

  it('uzun adresi taşıyan her liste öğesi ve paragraf kökün altında (kalıtım yolu kesilmemiş)', () => {
    const kap = ciz()
    const kok = kap.firstElementChild as HTMLElement
    const tasiyanlar = Array.from(kap.querySelectorAll('li, p')).filter((el) => el.textContent?.includes(UZUN))
    expect(tasiyanlar.length, 'fikstürdeki uzun adres çizilmedi — ölçüm kör').toBe(3)
    for (const el of tasiyanlar) {
      expect(kok.contains(el)).toBe(true)
      // Arada kalıtımı geri alan bir sınıf olmamalı.
      let n: Element | null = el
      while (n && n !== kok) {
        expect(n.classList.contains('break-normal'), 'ara öğe break-normal ile kalıtımı kesiyor').toBe(false)
        n = n.parentElement
      }
    }
  })

  it('tablo kendi kaydırma kabında kalır', () => {
    const tablo = ciz().querySelector('table')
    expect(tablo, 'tablo çizilmedi').not.toBeNull()
    expect(tablo?.parentElement?.classList.contains('overflow-x-auto')).toBe(true)
  })
})
