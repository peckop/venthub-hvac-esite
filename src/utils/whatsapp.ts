import { en } from '../i18n/dictionaries/en'
import { tr } from '../i18n/dictionaries/tr'
import { buildWhatsAppLink } from '../lib/utils'

/**
 * Retrieves and sanitizes the WhatsApp phone number from environment variables.
 * Returns null if the environment variable is missing or the parsed number is less than 10 digits.
 *
 * @returns The sanitized digits-only phone number, or null if invalid/unavailable
 *
 * @example
 * const number = getWhatsAppNumber();
 * if (number) console.log(`Configured number: ${number}`);
 */
/**
 * WhatsApp mesaj metinleri SÖZLÜKTEN gelir (CLAUDE.md kural 7: kullanıcıya görünen
 * metin sözlükte yaşar). Bu dosya `lib/services/*` DEĞİL, dolayısıyla sözlük importu
 * DI kuralını (kural 2 — Supabase client enjeksiyonu) ilgilendirmez.
 *
 * `lang` parametresi tüm üreticilere OPSİYONEL eklendi ve varsayılanı `'tr'`:
 * mevcut çağıranlar (ve mevcut testler) davranış değiştirmeden çalışmaya devam eder,
 * dil geçiren çağıran doğru dili alır. Zorunlu yapmak her çağıranı aynı anda
 * değiştirmeyi gerektirirdi; opsiyonel-varsayılan burada fail-open DEĞİL çünkü
 * eksik `lang` yanlış YETKİ değil yalnız eski davranış üretir.
 */
export type WhatsAppLang = 'tr' | 'en'

function msg(lang: WhatsAppLang, key: keyof typeof tr.whatsappMessages, vars?: Record<string, string>): string {
  const dict = lang === 'en' ? en : tr
  const table = dict.whatsappMessages
  let out = table[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\{\{${k}\}\}`, 'g'), v)
    }
  }
  return out
}

export function getWhatsAppNumber(): string | null {
  // Not: Pre-live aşamasında fallback numarası kullanmayız. ENV yoksa WhatsApp öğeleri gizlenir.
  const envWa = process.env.NEXT_PUBLIC_SHOP_WHATSAPP
  const raw = (typeof envWa === 'string' && envWa.trim()) ? envWa : ''
  const normalized = raw.replace(/[^\d]/g, '')
  return normalized.length >= 10 ? normalized : null
}

/**
 * Formats a phone number for WhatsApp by stripping all non-digit characters.
 *
 * @param phone - The raw phone number string (e.g., '+90 (555) 123-4567')
 * @returns A strictly numeric string representation of the phone number
 *
 * @example
 * formatPhoneNumber('+90 (555) 123-4567') // returns '905551234567'
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * Creates a fully formatted WhatsApp API link (wa.me) using the provided phone number and message.
 *
 * @param phone - The target phone number
 * @param message - The initial text message to populate in the WhatsApp chat
 * @returns The complete HTTPS URL to open WhatsApp
 *
 * @example
 * createWhatsAppLink('905551234567', 'Hello!') // returns "https://wa.me/905551234567?text=Hello!"
 */
export function createWhatsAppLink(phone: string, message: string): string {
  return buildWhatsAppLink(phone, message)
}

/**
 * Generates a standard pre-filled message for inquiring about product stock availability.
 *
 * @param productName - The name of the product
 * @param sku - Optional Stock Keeping Unit identifier
 * @returns A formatted Turkish string asking about stock
 *
 * @example
 * generateStockInquiryMessage('Fan X1', 'SKU-999') // returns "Merhaba! Fan X1 (SKU: SKU-999) ürünü için stok durumu hakkında bilgi alabilir miyim?"
 */
export function generateStockInquiryMessage(productName: string, sku?: string, lang: WhatsAppLang = 'tr'): string {
  return sku
    ? msg(lang, 'stockInquiryWithSku', { product: productName, sku })
    : msg(lang, 'stockInquiry', { product: productName })
}

/**
 * Generates a general support inquiry message.
 *
 * @param subject - Optional subject or topic for the support request
 * @returns A formatted Turkish string for initiating a support conversation
 *
 * @example
 * generateSupportMessage('Order Issue') // returns "Merhaba! Size nasıl yardımcı olabilirim?\n\nKonu: Order Issue"
 */
export function generateSupportMessage(subject?: string, lang: WhatsAppLang = 'tr'): string {
  const baseMessage = msg(lang, 'support')
  return subject ? `${baseMessage}

${msg(lang, 'subjectLine', { subject })}` : baseMessage
}

/**
 * Generates a structured message requesting a technical quote, accommodating optional product and project details.
 *
 * @param productName - Optional specific product name of interest
 * @param projectInfo - Optional details regarding the project scope
 * @returns A formatted Turkish string for a technical quote request
 *
 * @example
 * generateTechnicalQuoteMessage('Heavy Fan', 'Mall Project') // includes "Ürün: Heavy Fan" and "Proje Bilgileri: Mall Project"
 */
export function generateTechnicalQuoteMessage(
  productName?: string,
  projectInfo?: string,
  lang: WhatsAppLang = 'tr',
): string {
  let message = msg(lang, 'quoteIntro')

  if (productName) {
    message += `

${msg(lang, 'quoteProduct', { product: productName })}`
  }

  if (projectInfo) {
    message += `
${msg(lang, 'quoteProjectInfo', { info: projectInfo })}`
  } else {
    message += `

${msg(lang, 'quoteAskProject')}`
  }

  return message
}

/**
 * Generates a message for users who could not find their answer in the FAQ section.
 *
 * @returns A standard Turkish string requesting help from the FAQ context
 *
 * @example
 * generateFAQSupportMessage() // returns "Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?"
 */
export function generateFAQSupportMessage(lang: WhatsAppLang = 'tr'): string {
  return msg(lang, 'faqSupport')
}

/**
 * Generates a general contact message, optionally including the sender's name and subject.
 *
 * @param name - Optional name of the sender
 * @param subject - Optional subject of the inquiry
 * @returns A formatted Turkish string suitable for general contact initiation
 *
 * @example
 * generateContactMessage('Ali', 'Partnership') // returns "Merhaba! Ben Ali.\n\nKonu: Partnership\n\nSize nasıl yardımcı olabilirim ? "
 */
export function generateContactMessage(
  name?: string,
  subject?: string,
  lang: WhatsAppLang = 'tr',
): string {
  let message = name ? msg(lang, 'contactIntro', { name }) : msg(lang, 'greeting')

  if (subject) {
    message += `

${msg(lang, 'subjectLine', { subject })}`
  }

  message += `

${msg(lang, 'contactHelp')}`

  return message
}

/**
 * Checks if the WhatsApp feature is fully configured and available for use in the current environment.
 *
 * @returns True if a valid WhatsApp number is present in the environment variables, otherwise false
 *
 * @example
 * if (isWhatsAppAvailable()) { renderWhatsAppButton(); }
 */
export function isWhatsAppAvailable(): boolean {
  return getWhatsAppNumber() !== null
}

/**
 * Constructs a complete WhatsApp URL specifically for a stock inquiry regarding a product.
 *
 * @param productName - The name of the product
 * @param sku - Optional SKU of the product
 * @returns The fully constructed WhatsApp URL, or null if WhatsApp is not configured
 *
 * @example
 * const link = getStockInquiryLink('Fan X1');
 * if (link) window.open(link);
 */
export function getStockInquiryLink(
  productName: string,
  sku?: string,
  lang: WhatsAppLang = 'tr',
): string | null {
  const phone = getWhatsAppNumber()
  if (!phone) return null

  const message = generateStockInquiryMessage(productName, sku, lang)
  return createWhatsAppLink(phone, message)
}

/**
 * Constructs a complete WhatsApp URL specifically for general support inquiries.
 *
 * @param subject - Optional topic of the support request
 * @returns The fully constructed WhatsApp URL, or null if WhatsApp is not configured
 *
 * @example
 * const link = getSupportLink('Login Issue');
 * if (link) window.open(link);
 */
export function getSupportLink(subject?: string, lang: WhatsAppLang = 'tr'): string | null {
  const phone = getWhatsAppNumber()
  if (!phone) return null

  const message = generateSupportMessage(subject, lang)
  return createWhatsAppLink(phone, message)
}



