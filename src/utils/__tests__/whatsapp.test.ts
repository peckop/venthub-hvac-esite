import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatPhoneNumber,
  generateStockInquiryMessage,
  generateSupportMessage,
  generateTechnicalQuoteMessage,
  generateFAQSupportMessage,
  generateContactMessage,
  isWhatsAppAvailable,
  getWhatsAppNumber,
  getStockInquiryLink,
  getSupportLink,
  createWhatsAppLink,
} from '../whatsapp'

describe('WhatsApp Utilities', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('formatPhoneNumber', () => {
    it('sadece rakamlardan oluşan numarayı olduğu gibi döndürmelidir', () => {
      expect(formatPhoneNumber('905551234567')).toBe('905551234567')
    })

    it('boşluk içeren numarayı temizlemelidir', () => {
      expect(formatPhoneNumber('90 555 123 45 67')).toBe('905551234567')
    })

    it('özel karakterleri (+, -, (, )) temizlemelidir', () => {
      expect(formatPhoneNumber('+90 (555) 123-4567')).toBe('905551234567')
    })

    it('harfleri ve diğer karakterleri temizlemelidir', () => {
      expect(formatPhoneNumber('90abc555-def-123')).toBe('90555123')
    })

    it('boş string için boş string döndürmelidir', () => {
      expect(formatPhoneNumber('')).toBe('')
    })

    it('sadece rakam dışı karakterlerden oluşan string için boş string döndürmelidir', () => {
      expect(formatPhoneNumber('++-- (()) ')).toBe('')
    })
  })

  describe('Message Generation Helpers', () => {
    describe('generateStockInquiryMessage', () => {
      it('SKU olmadan doğru mesaj üretmelidir', () => {
        const msg = generateStockInquiryMessage('Klima')
        expect(msg).toContain('Klima')
        expect(msg).not.toContain('SKU')
      })

      it('SKU ile doğru mesaj üretmelidir', () => {
        const msg = generateStockInquiryMessage('Klima', 'KLM-123')
        expect(msg).toContain('Klima')
        expect(msg).toContain('SKU: KLM-123')
      })
    })

    describe('generateSupportMessage', () => {
      it('konu olmadan genel destek mesajı üretmelidir', () => {
        const msg = generateSupportMessage()
        expect(msg).toBe('Merhaba! Size nasıl yardımcı olabilirim?')
      })

      it('konu ile detaylı destek mesajı üretmelidir', () => {
        const msg = generateSupportMessage('Sipariş Durumu')
        expect(msg).toContain('Sipariş Durumu')
      })
    })

    describe('generateTechnicalQuoteMessage', () => {
      it('parametreler olmadan genel teklif mesajı üretmelidir', () => {
        const msg = generateTechnicalQuoteMessage()
        expect(msg).toContain('Teknik teklif talebi')
        expect(msg).toContain('Proje detaylarınızı paylaşabilir misiniz')
      })

      it('ürün ve proje bilgisi ile tam mesaj üretmelidir', () => {
        const msg = generateTechnicalQuoteMessage('Vantilatör', 'Hastane Projesi')
        expect(msg).toContain('Ürün: Vantilatör')
        expect(msg).toContain('Proje Bilgileri: Hastane Projesi')
      })
    })

    describe('generateFAQSupportMessage', () => {
      it('sabit SSS yardım mesajını döndürmelidir', () => {
        expect(generateFAQSupportMessage()).toContain('SSS sayfasında aradığım bilgiyi bulamadım')
      })
    })

    describe('generateContactMessage', () => {
      it('parametreler olmadan mesaj üretmelidir', () => {
        const msg = generateContactMessage()
        expect(msg).toBe('Merhaba!\n\nSize nasıl yardımcı olabilirim ? ')
      })

      it('isim ve konu ile tam mesaj üretmelidir', () => {
        const msg = generateContactMessage('Ahmet', 'İş Ortaklığı')
        expect(msg).toContain('Ben Ahmet')
        expect(msg).toContain('Konu: İş Ortaklığı')
      })
    })
  })

  describe('Environment & Link Helpers', () => {
    describe('getWhatsAppNumber', () => {
      it('geçerli bir numara tanımlandığında normalize edilmiş numara döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '+90 (555) 123-4567')
        expect(getWhatsAppNumber()).toBe('905551234567')
      })

      it('numara tanımlanmadığında null döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '')
        expect(getWhatsAppNumber()).toBeNull()
      })

      it('geçersiz (kısa) numara tanımlandığında null döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '123')
        expect(getWhatsAppNumber()).toBeNull()
      })
    })

    describe('isWhatsAppAvailable', () => {
      it('numara varsa true döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        expect(isWhatsAppAvailable()).toBe(true)
      })

      it('numara yoksa false döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '')
        expect(isWhatsAppAvailable()).toBe(false)
      })
    })

    describe('createWhatsAppLink', () => {
      it('geçerli numara ve mesaj ile link oluşturmalıdır', () => {
        const link = createWhatsAppLink('905551234567', 'Merhaba')
        expect(link).toBe('https://wa.me/905551234567?text=Merhaba')
      })

      it('özel karakterli mesajı encode etmelidir', () => {
        const link = createWhatsAppLink('905551234567', 'Selam & Merhaba')
        expect(link).toContain('text=Selam+%26+Merhaba')
      })
    })

    describe('getStockInquiryLink', () => {
      it('numara tanımlı değilse null döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '')
        expect(getStockInquiryLink('Ürün')).toBeNull()
      })

      it('numara tanımlıysa link döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        const link = getStockInquiryLink('Klima', 'SKU-1')
        expect(link).toContain('https://wa.me/905551234567')
        expect(link).toContain('Klima')
        expect(link).toContain('SKU-1')
      })
    })

    describe('getSupportLink', () => {
      it('numara tanımlı değilse null döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '')
        expect(getSupportLink()).toBeNull()
      })

      it('numara tanımlıysa link döndürmelidir', () => {
        vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567')
        const link = getSupportLink('Ödeme')
        expect(link).toContain('https://wa.me/905551234567')
        expect(link).toContain('text=Merhaba%21+Size+nas%C4%B1l+yard%C4%B1mc%C4%B1+olabilirim%3F%0A%0AKonu%3A+%C3%96deme')
      })
    })
  })
})
