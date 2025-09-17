import { buildWhatsAppLink } from '../lib/utils'

/**
 * Get WhatsApp phone number from environment variables
 */
export function getWhatsAppNumber(): string | null {
  // Vite: production build'da değişkenleri build-time inline eder.
  // Bu nedenle doğrudan import.meta.env.VITE_SHOP_WHATSAPP kullanıyoruz.
  const whatsapp = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SHOP_WHATSAPP
  return (typeof whatsapp === 'string' && whatsapp.trim()) ? whatsapp : null
}

/**
 * Format phone number for WhatsApp (removes non-digits)
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * Create WhatsApp link with formatted phone and message
 */
export function createWhatsAppLink(phone: string, message: string): string {
  return buildWhatsAppLink(phone, message)
}

/**
 * Generate stock inquiry message for a product
 */
export function generateStockInquiryMessage(productName: string, sku?: string): string {
  return `Merhaba! ${productName}${sku ? ` (SKU: ${sku})` : ''} ürünü için stok durumu hakkında bilgi alabilir miyim?`
}

/**
 * Generate general support message
 */
export function generateSupportMessage(subject?: string): string {
  const baseMessage = 'Merhaba! Size nasıl yardımcı olabilirim?'
  return subject ? `${baseMessage}\n\nKonu: ${subject}` : baseMessage
}

/**
 * Generate technical quote request message
 */
export function generateTechnicalQuoteMessage(productName?: string, projectInfo?: string): string {
  let message = 'Merhaba! Teknik teklif talebi:'
  
  if (productName) {
    message += `\n\nÜrün: ${productName}`
  }
  
  if (projectInfo) {
    message += `\nProje Bilgileri: ${projectInfo}`
  } else {
    message += '\n\nProje detaylarınızı paylaşabilir misiniz?'
  }
  
  return message
}

/**
 * Generate FAQ support message
 */
export function generateFAQSupportMessage(): string {
  return 'Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?'
}

/**
 * Generate contact page message
 */
export function generateContactMessage(name?: string, subject?: string): string {
  let message = 'Merhaba!'
  
  if (name) {
    message += ` Ben ${name}.`
  }
  
  if (subject) {
    message += `\n\nKonu: ${subject}`
  }
  
  message += '\n\nSize nasıl yardımcı olabilirim?'
  
  return message
}

/**
 * Check if WhatsApp is available/configured
 */
export function isWhatsAppAvailable(): boolean {
  return getWhatsAppNumber() !== null
}

/**
 * Get WhatsApp link for stock inquiry
 */
export function getStockInquiryLink(productName: string, sku?: string): string | null {
  const phone = getWhatsAppNumber()
  if (!phone) return null
  
  const message = generateStockInquiryMessage(productName, sku)
  return createWhatsAppLink(phone, message)
}

/**
 * Get WhatsApp link for general support
 */
export function getSupportLink(subject?: string): string | null {
  const phone = getWhatsAppNumber()
  if (!phone) return null
  
  const message = generateSupportMessage(subject)
  return createWhatsAppLink(phone, message)
}