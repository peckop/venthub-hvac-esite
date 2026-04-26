import { describe, it, expect } from 'vitest'
import { WHATSAPP_ICON_URL } from '../brand'

describe('brand constants', () => {
  it('should export a valid WhatsApp icon URL', () => {
    expect(WHATSAPP_ICON_URL).toBe('https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg')
    expect(WHATSAPP_ICON_URL).toMatch(/^https?:\/\/.+/)
    expect(WHATSAPP_ICON_URL.endsWith('.svg')).toBe(true)
  })
})
