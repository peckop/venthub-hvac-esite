import { describe, it, expect, vi } from 'vitest'
import { getTranslationWithFallback } from '../checkoutHelpers'

describe('getTranslationWithFallback', () => {
  it('should return the translated string when translation is successful', () => {
    const tMock = vi.fn().mockReturnValue('Translated Value')
    const result = getTranslationWithFallback(tMock, 'some.key', 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith('some.key')
    expect(result).toBe('Translated Value')
  })

  it('should return the fallback when translation returns the same key (missing translation)', () => {
    const tMock = vi.fn().mockImplementation((key: string) => key)
    const result = getTranslationWithFallback(tMock, 'some.key', 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith('some.key')
    expect(result).toBe('Fallback Value')
  })

  it('should return the fallback when translation function throws an error', () => {
    const tMock = vi.fn().mockImplementation(() => {
      throw new Error('Translation failed')
    })
    const result = getTranslationWithFallback(tMock, 'some.key', 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith('some.key')
    expect(result).toBe('Fallback Value')
  })

  it('should handle an empty string key gracefully', () => {
    // If key is empty and returns empty, it matches the key, so fallback should be returned.
    const tMock = vi.fn().mockImplementation((key: string) => key)
    const result = getTranslationWithFallback(tMock, '', 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith('')
    expect(result).toBe('Fallback Value')
  })

  it('should return translation for empty string key if differently translated', () => {
    const tMock = vi.fn().mockReturnValue('Translated Empty')
    const result = getTranslationWithFallback(tMock, '', 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith('')
    expect(result).toBe('Translated Empty')
  })

  it('should handle undefined key edge case gracefully', () => {
    const tMock = vi.fn().mockImplementation((key: unknown) => key)
    // Using any/as string to simulate potential runtime issue where key is undefined
    const result = getTranslationWithFallback(tMock, undefined as unknown as string, 'Fallback Value')

    expect(tMock).toHaveBeenCalledWith(undefined)
    expect(result).toBe('Fallback Value')
  })
})
