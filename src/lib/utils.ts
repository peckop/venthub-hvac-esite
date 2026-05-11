import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes, resolving conflicts safely.
 * Uses `clsx` for conditional classes and `twMerge` to handle tailwind-specific overrides.
 *
 * @param inputs - Array of class values, which can be strings, objects, or arrays
 * @returns A single resolved string of Tailwind classes
 *
 * @example
 * cn('px-2 py-1', { 'bg-red-500': hasError }, 'p-4') // resolves padding correctly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs a WhatsApp deeplink using the wa.me format.
 *
 * Non-digit characters in the phone number are stripped, and the text parameter is properly URL-encoded.
 *
 * @param phone - The target phone number; non-digits will be removed
 * @param text - The pre-filled message text to send
 * @returns The formatted WhatsApp deeplink URL
 *
 * @example
 * buildWhatsAppLink('+90 555 123 4567', 'Merhaba!') // returns "https://wa.me/905551234567?text=Merhaba%21"
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



