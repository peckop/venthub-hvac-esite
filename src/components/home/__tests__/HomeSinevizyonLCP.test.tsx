import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeSinevizyon from '../HomeSinevizyon'

// Mock useI18n hook to prevent translation dependency errors
vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('HomeSinevizyon LCP & Chrome Performance Guidelines', () => {
  it('should enforce strict fetchpriority and decoding attributes on slide images', () => {
    render(<HomeSinevizyon />)
    
    // Alt text ile tüm ürün görsellerini seç (3 slayt * 2 ürün = 6 adet)
    const images = screen.getAllByAltText('home.hero.sinevizyon.altProduct')
    expect(images.length).toBe(6)

    // Slayt 0: Ürün 0 ve 1 (LCP Adayları)
    const slide0Products = images.slice(0, 2)
    slide0Products.forEach((img) => {
      // 1. Fetch Priority yüksek öncelikli olmalı (JSDOM'da lowercase 'fetchpriority' olarak render edilir)
      expect(img.getAttribute('fetchpriority')).toBe('high')
      // 2. Decoding senkron olmalı (anlık çizim için)
      expect(img.getAttribute('decoding')).toBe('sync')
    })

    // Slayt 1 & 2: Ürün 2, 3, 4, 5 (Lazy/Ekran dışı görseller)
    const lazyProducts = images.slice(2)
    lazyProducts.forEach((img) => {
      // 1. Fetch Priority düşük öncelikli olmalı
      expect(img.getAttribute('fetchpriority')).toBe('low')
      // 2. Decoding asenkron olmalı (main thread blokajını önlemek için)
      expect(img.getAttribute('decoding')).toBe('async')
    })
  })
})
