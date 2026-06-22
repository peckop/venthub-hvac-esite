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
 * Constructs a fully formatted WhatsApp API (wa.me) deep link.
 * Automatically strips all non-digit characters from the phone number and safely URL-encodes the initial text message.
 *
 * @param phone - The target phone number, formatted or unformatted (e.g., '+90 555 123 4567')
 * @param text - The initial text message to populate in the WhatsApp chat window
 * @returns The generated HTTPS URL linking to WhatsApp
 *
 * @example
 * buildWhatsAppLink('+90 555 123 4567', 'Hello!') // returns "https://wa.me/905551234567?text=Hello%21"
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



