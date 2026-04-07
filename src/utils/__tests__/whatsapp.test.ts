import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getWhatsAppNumber,
  formatPhoneNumber,
  createWhatsAppLink,
  generateStockInquiryMessage,
  generateSupportMessage,
  generateTechnicalQuoteMessage,
  generateFAQSupportMessage,
  generateContactMessage,
  isWhatsAppAvailable,
  getStockInquiryLink,
  getSupportLink
} from '../whatsapp';

describe('WhatsApp Utils', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getWhatsAppNumber', () => {
    it('should return null when NEXT_PUBLIC_SHOP_WHATSAPP is undefined', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '');
      expect(getWhatsAppNumber()).toBeNull();
    });

    it('should return null when NEXT_PUBLIC_SHOP_WHATSAPP is less than 10 digits', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '123456789');
      expect(getWhatsAppNumber()).toBeNull();
    });

    it('should extract digits and return the number when it contains letters or special characters', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '+90 (555) 123-4567 ABC');
      expect(getWhatsAppNumber()).toBe('905551234567');
    });

    it('should return the normalized number when a valid number is provided', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567');
      expect(getWhatsAppNumber()).toBe('905551234567');
    });

    it('should return null for whitespace-only env variable', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '   ');
      expect(getWhatsAppNumber()).toBeNull();
    });
  });

  describe('formatPhoneNumber', () => {
    it('should remove non-digit characters from a phone number string', () => {
      expect(formatPhoneNumber('+90 555 123 45 67')).toBe('905551234567');
      expect(formatPhoneNumber('abc123def456')).toBe('123456');
    });
  });

  describe('createWhatsAppLink', () => {
    it('should generate a valid WhatsApp URL with phone and URL-encoded text', () => {
      const link = createWhatsAppLink('+905551234567', 'Hello World!');
      expect(link).toBe('https://wa.me/905551234567?text=Hello+World%21');
    });

    it('should handle empty message correctly', () => {
      const link = createWhatsAppLink('905551234567', '');
      expect(link).toBe('https://wa.me/905551234567?text=');
    });
  });

  describe('generateStockInquiryMessage', () => {
    it('should generate message without SKU when sku is not provided', () => {
      expect(generateStockInquiryMessage('Endüstriyel Fan')).toBe('Merhaba! Endüstriyel Fan ürünü için stok durumu hakkında bilgi alabilir miyim?');
    });

    it('should generate message with SKU when sku is provided', () => {
      expect(generateStockInquiryMessage('Endüstriyel Fan', 'FAN-123')).toBe('Merhaba! Endüstriyel Fan (SKU: FAN-123) ürünü için stok durumu hakkında bilgi alabilir miyim?');
    });
  });

  describe('generateSupportMessage', () => {
    it('should generate basic support message when subject is not provided', () => {
      expect(generateSupportMessage()).toBe('Merhaba! Size nasıl yardımcı olabilirim?');
    });

    it('should include subject in the message when provided', () => {
      expect(generateSupportMessage('Sipariş Durumu')).toBe('Merhaba! Size nasıl yardımcı olabilirim?\n\nKonu: Sipariş Durumu');
    });
  });

  describe('generateTechnicalQuoteMessage', () => {
    it('should generate basic message when no params are provided', () => {
      expect(generateTechnicalQuoteMessage()).toBe('Merhaba! Teknik teklif talebi:\n\nProje detaylarınızı paylaşabilir misiniz ? ');
    });

    it('should include product name', () => {
      expect(generateTechnicalQuoteMessage('Aksiyel Fan')).toBe('Merhaba! Teknik teklif talebi:\n\nÜrün: Aksiyel Fan\n\nProje detaylarınızı paylaşabilir misiniz ? ');
    });

    it('should include project info without the default ending when provided', () => {
      expect(generateTechnicalQuoteMessage(undefined, 'Hastane Projesi')).toBe('Merhaba! Teknik teklif talebi:\nProje Bilgileri: Hastane Projesi');
    });

    it('should include both product name and project info', () => {
      expect(generateTechnicalQuoteMessage('Aksiyel Fan', 'Hastane Projesi')).toBe('Merhaba! Teknik teklif talebi:\n\nÜrün: Aksiyel Fan\nProje Bilgileri: Hastane Projesi');
    });
  });

  describe('generateFAQSupportMessage', () => {
    it('should return the correct FAQ support message', () => {
      expect(generateFAQSupportMessage()).toBe('Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?');
    });
  });

  describe('generateContactMessage', () => {
    it('should return basic contact message when no params provided', () => {
      expect(generateContactMessage()).toBe('Merhaba!\n\nSize nasıl yardımcı olabilirim ? ');
    });

    it('should include name', () => {
      expect(generateContactMessage('Ahmet')).toBe('Merhaba! Ben Ahmet.\n\nSize nasıl yardımcı olabilirim ? ');
    });

    it('should include subject', () => {
      expect(generateContactMessage(undefined, 'İade İşlemi')).toBe('Merhaba!\n\nKonu: İade İşlemi\n\nSize nasıl yardımcı olabilirim ? ');
    });

    it('should include both name and subject', () => {
      expect(generateContactMessage('Ahmet', 'İade İşlemi')).toBe('Merhaba! Ben Ahmet.\n\nKonu: İade İşlemi\n\nSize nasıl yardımcı olabilirim ? ');
    });
  });

  describe('isWhatsAppAvailable', () => {
    it('should return true when getWhatsAppNumber returns a valid number', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567');
      expect(isWhatsAppAvailable()).toBe(true);
    });

    it('should return false when getWhatsAppNumber returns null', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '123');
      expect(isWhatsAppAvailable()).toBe(false);
    });
  });

  describe('getStockInquiryLink', () => {
    it('should return null if WhatsApp number is not available', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '');
      expect(getStockInquiryLink('Test Product')).toBeNull();
    });

    it('should generate a valid link with stock inquiry message', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567');
      const link = getStockInquiryLink('Test Product', 'SKU123');
      expect(link).toContain('https://wa.me/905551234567');
      expect(link).toContain('text=');
      expect(link).toContain('SKU123');
    });
  });

  describe('getSupportLink', () => {
    it('should return null if WhatsApp number is not available', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '');
      expect(getSupportLink('Help')).toBeNull();
    });

    it('should generate a valid link with support message', () => {
      vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551234567');
      const link = getSupportLink('Order Delay');
      expect(link).toContain('https://wa.me/905551234567');
      expect(link).toContain('text=');
      expect(link).toContain('Order+Delay');
    });
  });
});
