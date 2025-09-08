import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Construct a WhatsApp deeplink using wa.me format.
 * - phone: any format is accepted; non-digits are stripped
 * - text: will be URL-encoded
 */
export function buildWhatsAppLink(phone: string, text: string) {
  try {
    const p = String(phone || '').replace(/[^\d]/g, '')
    const q = new URLSearchParams({ text: String(text || '') }).toString()
    return `https://wa.me/${p}${q ? `?${q}` : ''}`
  } catch {
    const p = String(phone || '').replace(/[^\d]/g, '')
    return `https://wa.me/${p}`
  }
}
