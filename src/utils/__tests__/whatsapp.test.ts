import { beforeEach,describe, expect, it, vi } from 'vitest'

import * as utils from '../../lib/utils'
import {
  createWhatsAppLink,
  formatPhoneNumber,
  generateContactMessage,
  generateFAQSupportMessage,
  generateStockInquiryMessage,
  generateSupportMessage,
  generateTechnicalQuoteMessage,
  getStockInquiryLink,
  getSupportLink,
  getWhatsAppNumber,
  isWhatsAppAvailable} from '../whatsapp'

vi.mock('../../lib/utils', () => ({
  buildWhatsAppLink: vi.fn((phone, msg) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`)
}))

describe('whatsapp utils', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('getWhatsAppNumber', () => {
    it('should return normalized number if valid', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '+90 (555) 123 45 67')
      expect(getWhatsAppNumber()).toBe('905551234567')
    })

    it('should return null if number is less than 10 digits', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '12345')
      expect(getWhatsAppNumber()).toBeNull()
    })

    it('should return null if env variable is empty', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '')
      expect(getWhatsAppNumber()).toBeNull()
    })

    it('should return null if env variable is missing', () => {
      expect(getWhatsAppNumber()).toBeNull()
    })
  })

  describe('formatPhoneNumber', () => {
    it('should remove all non-digit characters', () => {
      expect(formatPhoneNumber('+90 555-123 45 67')).toBe('905551234567')
      expect(formatPhoneNumber('invalid-123')).toBe('123')
    })
  })

  describe('createWhatsAppLink', () => {
    it('should call buildWhatsAppLink with formatted arguments', () => {
      const link = createWhatsAppLink('905551234567', 'Hello')
      expect(utils.buildWhatsAppLink).toHaveBeenCalledWith('905551234567', 'Hello')
      expect(link).toBe('https://wa.me/905551234567?text=Hello')
    })
  })

  describe('Message Generators', () => {
    it('generateStockInquiryMessage', () => {
      expect(generateStockInquiryMessage('Product X')).toBe('Merhaba! Product X ürünü için stok durumu hakkında bilgi alabilir miyim?')
      expect(generateStockInquiryMessage('Product Y', 'SKU123')).toBe('Merhaba! Product Y (SKU: SKU123) ürünü için stok durumu hakkında bilgi alabilir miyim?')
    })

    it('generateSupportMessage', () => {
      expect(generateSupportMessage()).toBe('Merhaba! Size nasıl yardımcı olabilirim?')
      expect(generateSupportMessage('Billing')).toBe('Merhaba! Size nasıl yardımcı olabilirim?\n\nKonu: Billing')
    })

    it('generateTechnicalQuoteMessage', () => {
      expect(generateTechnicalQuoteMessage()).toBe('Merhaba! Teknik teklif talebi:\n\nProje detaylarınızı paylaşabilir misiniz ? ')
      expect(generateTechnicalQuoteMessage('Product X')).toBe('Merhaba! Teknik teklif talebi:\n\nÜrün: Product X\n\nProje detaylarınızı paylaşabilir misiniz ? ')
      expect(generateTechnicalQuoteMessage('Product X', 'Project Y')).toBe('Merhaba! Teknik teklif talebi:\n\nÜrün: Product X\nProje Bilgileri: Project Y')
    })

    it('generateFAQSupportMessage', () => {
      expect(generateFAQSupportMessage()).toBe('Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?')
    })

    it('generateContactMessage', () => {
      expect(generateContactMessage()).toBe('Merhaba!\n\nSize nasıl yardımcı olabilirim ? ')
      expect(generateContactMessage('Alice')).toBe('Merhaba! Ben Alice.\n\nSize nasıl yardımcı olabilirim ? ')
      expect(generateContactMessage('Alice', 'Feedback')).toBe('Merhaba! Ben Alice.\n\nKonu: Feedback\n\nSize nasıl yardımcı olabilirim ? ')
      expect(generateContactMessage(undefined, 'Support')).toBe('Merhaba!\n\nKonu: Support\n\nSize nasıl yardımcı olabilirim ? ')
    })
  })

  describe('Link Generators', () => {
    describe('isWhatsAppAvailable', () => {
      it('should return true if number exists', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        expect(isWhatsAppAvailable()).toBe(true)
      })

      it('should return false if no number', () => {
        expect(isWhatsAppAvailable()).toBe(false)
      })
    })

    describe('getStockInquiryLink', () => {
      it('should return null if whatsapp is not available', () => {
        expect(getStockInquiryLink('Product')).toBeNull()
      })

      it('should return link if available', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        const link = getStockInquiryLink('Product X', 'SKU1')
        expect(link).toContain('https://wa.me/905551234567')
        expect(link).toContain('Product%20X')
      })
    })

    describe('getSupportLink', () => {
      it('should return null if whatsapp is not available', () => {
        expect(getSupportLink('Issue')).toBeNull()
      })

      it('should return link if available', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        const link = getSupportLink('Order Delay')
        expect(link).toContain('https://wa.me/905551234567')
        expect(link).toContain('Order%20Delay')
      })
    })
  })
})
