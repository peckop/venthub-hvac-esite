import { describe, expect, it, vi } from 'vitest'

import { buildWhatsAppLink } from '../utils'

describe('buildWhatsAppLink', () => {
  it('should format a basic phone number and message', () => {
    const result = buildWhatsAppLink('905551234567', 'Hello')
    expect(result).toBe('https://wa.me/905551234567?text=Hello')
  })

  it('should strip non-digit characters from the phone number', () => {
    const result = buildWhatsAppLink('+90 (555) 123-4567', 'Test Message')
    expect(result).toBe('https://wa.me/905551234567?text=Test+Message')
  })

  // The function always adds ?text= even if it's empty, we must test its actual behavior (Darwin rule)
  it('should handle an empty message (includes empty text param)', () => {
    const result = buildWhatsAppLink('905551234567', '')
    expect(result).toBe('https://wa.me/905551234567?text=')
  })

  it('should handle undefined or null inputs gracefully (includes empty text param)', () => {
    // @ts-expect-error REASON: testing invalid inputs
    expect(buildWhatsAppLink(null, null)).toBe('https://wa.me/?text=')
    // @ts-expect-error REASON: testing invalid inputs
    expect(buildWhatsAppLink(undefined, undefined)).toBe('https://wa.me/?text=')
  })

  it('should fallback to base URL if URLSearchParams throws an error', () => {
    const OriginalURLSearchParams = globalThis.URLSearchParams

    // Mock URLSearchParams to throw an error
    globalThis.URLSearchParams = vi.fn().mockImplementation(function() {
      throw new Error('Mock error')
    }) as never as typeof URLSearchParams

    const result = buildWhatsAppLink('+90 (555) 123-4567', 'Hello')
    expect(result).toBe('https://wa.me/905551234567')

    // Restore OriginalURLSearchParams
    globalThis.URLSearchParams = OriginalURLSearchParams
  })
})
