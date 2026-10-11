import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

import VentImage from '../VentImage'

/**
 * URN-69 — VentImage'ın yedeği ürün içermeyen tek yer tutucudur; yer tutucu gösterilen yerde alt metin
 * ürün adı değil sözlükteki "görsel hazırlanıyor" ifadesidir.
 *
 * `t` anahtarın kendisini döndürür: alt metnin sözlük anahtarından geldiği, çağıranın verdiği ürün
 * adından gelmediği anahtarla ölçülür. Sözlük değerlerinin varlığı ayrı testle sabitlenir.
 */
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))

const YER_TUTUCU_DOSYASI = 'urun-gorseli-yok.svg'
// Çağıranın verdiği ürün adları: yer tutucu gösterilince alt metne GİRMEMELİ, dolu görselde AYNEN kalmalı.
const URUN_ADI = '12 kW Elektrikli Isıtıcı'
const FAN_ADI = 'Casals NIMAX fan'
const GENEL_AD = 'Ürün'
const srcOku = (img: HTMLElement) => decodeURIComponent(img.getAttribute('src') ?? '')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('VentImage — yedek görsel (URN-69)', () => {
  it('görsel yoksa nötr yer tutucu basılır, alt metin ürün adı değil sözlük anahtarıdır', () => {
    render(<VentImage src={null} alt={URUN_ADI} width={200} height={200} />)
    const img = screen.getByRole('img')
    expect(srcOku(img)).toContain(YER_TUTUCU_DOSYASI)
    expect(img.getAttribute('alt')).toBe('common.imagePreparing')
  })

  it.each(['product', 'category', 'brand', 'generic'] as const)(
    'fallbackType=%s: tipe göre farklı görsel yok, hepsi aynı yer tutucu',
    (tip) => {
      render(<VentImage src={undefined} alt={GENEL_AD} width={200} height={200} fallbackType={tip} />)
      expect(srcOku(screen.getByRole('img'))).toContain(YER_TUTUCU_DOSYASI)
    },
  )

  it('dolu görselde adres ve alt metin çağıranınki kalır', () => {
    render(<VentImage src="/images/fan.jpg" alt={FAN_ADI} width={200} height={200} />)
    const img = screen.getByRole('img')
    expect(srcOku(img)).toContain('fan.jpg')
    expect(srcOku(img)).not.toContain(YER_TUTUCU_DOSYASI)
    expect(img.getAttribute('alt')).toBe(FAN_ADI)
  })

  it('yükleme hatasında yer tutucuya düşer ve alt metni sözlükten alır', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<VentImage src="/images/yok.jpg" alt={FAN_ADI} width={200} height={200} />)
    fireEvent.error(screen.getByRole('img'))
    const img = screen.getByRole('img')
    expect(srcOku(img)).toContain(YER_TUTUCU_DOSYASI)
    expect(img.getAttribute('alt')).toBe('common.imagePreparing')
  })

  it('sözlükte iki dilde "görsel hazırlanıyor" metni dolu ve EN\'de Türkçe harf yok', () => {
    expect(tr.common.imagePreparing.length).toBeGreaterThan(0)
    expect(en.common.imagePreparing.length).toBeGreaterThan(0)
    expect(en.common.imagePreparing).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/)
  })
})
