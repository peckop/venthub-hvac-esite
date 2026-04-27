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
 * Constructs a secure WhatsApp deeplink (wa.me) for initiating a chat.
 * Automatically sanitizes the phone number by stripping all non-digit characters
 * and safely URL-encodes the pre-filled text message.
 *
 * @param phone - The target phone number, formatted or unformatted.
 * @param text - The initial message to populate in the WhatsApp text field.
 * @returns The fully constructed WhatsApp URL, or a fallback URL without text if parsing fails.
 *
 * @example
 * buildWhatsAppLink('+90 (555) 123-4567', 'Hello from VentHub')
 * // returns "https://wa.me/905551234567?text=Hello+from+VentHub"
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



