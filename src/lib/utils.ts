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
 * Constructs a universally accessible WhatsApp deep link (wa.me) to initiate a direct chat.
 * Robustly handles raw phone number strings by stripping all non-digit characters and ensures the pre-filled message text is properly URL-encoded.
 *
 * @param phone - The raw target phone number (e.g., '+90 555 123 45 67')
 * @param text - The initial text message to pre-populate in the user's WhatsApp client
 * @returns The complete, formatted wa.me HTTPS URL
 *
 * @example
 * buildWhatsAppLink('+90 555 123 4567', 'Hello World!');
 * // returns "https://wa.me/905551234567?text=Hello+World%21"
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



