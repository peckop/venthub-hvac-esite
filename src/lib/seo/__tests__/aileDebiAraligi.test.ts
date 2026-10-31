/**
 * URN-149 — aile başlığına debi aralığı: saf yardımcıların kapısı.
 * Ölçer: yalnız `max_delivery_m3h` sayılır (nominal/min/ls sayılmaz), min=max tek değer, TR/EN sayı biçimi,
 * title toplam ≤60 tavanı, hata yolları (boş/alan yok/sayı dışı). Ölçmez: sayfa bağlantısı (aileBaslikDebi.test.tsx).
 */
import { describe, expect, it } from 'vitest'

import { AILE_TITLE_AZAMI, aileBasligiDebili, aileDebiAraligi, aileTitleDebili } from '../aileDebiAraligi'

const v = (technical_specs: Record<string, string | number | boolean | null> | null) => ({ technical_specs })

describe('aileDebiAraligi', () => {
  it('(a) debisiz ve yalnız-nominal aile null döner (başlığa ek yok)', () => {
    expect(aileDebiAraligi([], 'tr')).toBeNull()
    expect(aileDebiAraligi(null, 'tr')).toBeNull()
    expect(aileDebiAraligi([v(null), v({})], 'tr')).toBeNull()
    expect(aileDebiAraligi([v({ nominal_delivery_m3h: 500 }), v({ nominal_delivery_m3h: 900 })], 'tr')).toBeNull()
    expect(aileDebiAraligi([v({ min_delivery_m3h: 10, max_delivery_ls: 50 })], 'tr')).toBeNull()
  })

  it('(b) min=max tek değer yazar', () => {
    expect(aileDebiAraligi([v({ max_delivery_m3h: 100 }), v({ max_delivery_m3h: 100 })], 'tr')).toBe('100 m³/h')
    expect(aileDebiAraligi([v({ max_delivery_m3h: 260 })], 'en')).toBe('260 m³/h')
  })

  it('(d) TR binlik nokta, EN virgül; aralık en dash', () => {
    const girdi = [v({ max_delivery_m3h: 22100 }), v({ max_delivery_m3h: 2540 })]
    expect(aileDebiAraligi(girdi, 'tr')).toBe('2.540–22.100 m³/h')
    expect(aileDebiAraligi(girdi, 'en')).toBe('2,540–22,100 m³/h')
  })

  it('(e) karma ailede yalnız max alanı olan modeller aralığa girer', () => {
    const karma = [
      v({ max_delivery_m3h: 300 }),
      v({ nominal_delivery_m3h: 5 }), // sayılmaz
      v({ max_delivery_m3h: 800, nominal_delivery_m3h: 9000 }), // nominal aralığı genişletmez
      v({ min_delivery_m3h: 1, max_delivery_ls: 99999 }), // sayılmaz
    ]
    expect(aileDebiAraligi(karma, 'tr')).toBe('300–800 m³/h')
  })

  it('hata yolu: string sayı çevrilir; sonlu pozitif olmayan atlanır', () => {
    expect(aileDebiAraligi([v({ max_delivery_m3h: '1160' }), v({ max_delivery_m3h: '2890' })], 'tr')).toBe('1.160–2.890 m³/h')
    expect(aileDebiAraligi([v({ max_delivery_m3h: 'abc' }), v({ max_delivery_m3h: 0 }), v({ max_delivery_m3h: -5 }), v({ max_delivery_m3h: null }), v({ max_delivery_m3h: true }), v({ max_delivery_m3h: '' })], 'tr')).toBeNull()
    expect(aileDebiAraligi([v({ max_delivery_m3h: Number.NaN }), v({ max_delivery_m3h: 400 })], 'tr')).toBe('400 m³/h')
  })
})

describe('aileBasligiDebili / aileTitleDebili', () => {
  it('H1 debi yoksa aynen döner, varsa boşlukla eklenir', () => {
    expect(aileBasligiDebili('Vortice VORT Quadro Evo', null)).toBe('Vortice VORT Quadro Evo')
    expect(aileBasligiDebili('Vortice VORT Quadro Evo', '60–100 m³/h')).toBe('Vortice VORT Quadro Evo 60–100 m³/h')
  })

  it('(c) title toplam ≤60 ise debi alır (örnek 45 karakter), aşarsa debisiz kalır', () => {
    const kisa = aileTitleDebili('Vortice VORT Quadro Evo', '60–100 m³/h')
    expect(kisa).toBe('Vortice VORT Quadro Evo 60–100 m³/h | VentHub')
    expect(kisa.length).toBe(45)
    const uzunAd = 'Avens Hücreli Aspiratörler HF Serisi Uzun Ad'
    const uzun = aileTitleDebili(uzunAd, '2.540–22.100 m³/h')
    expect(`${uzunAd} 2.540–22.100 m³/h | VentHub`.length).toBeGreaterThan(AILE_TITLE_AZAMI)
    expect(uzun).toBe(`${uzunAd} | VentHub`)
  })

  it('(c) sınır: tam 60 karakter debi alır, 61 almaz; debi yoksa title değişmez', () => {
    const debi = '1–2 m³/h' // 9 karakter
    const ek = ` ${debi} | VentHub`.length
    const tam = 'a'.repeat(AILE_TITLE_AZAMI - ek)
    expect(aileTitleDebili(tam, debi).length).toBe(AILE_TITLE_AZAMI)
    expect(aileTitleDebili(tam, debi)).toContain(debi)
    expect(aileTitleDebili(`${tam}a`, debi)).toBe(`${tam}a | VentHub`)
    expect(aileTitleDebili('Ad', null)).toBe('Ad | VentHub')
  })
})
