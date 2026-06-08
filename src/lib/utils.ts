import { ClassValue,clsx } from 'clsx';
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
 * Construct a WhatsApp deeplink using wa.me format.
 * - phone: unknown format is accepted; non-digits are stripped
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



