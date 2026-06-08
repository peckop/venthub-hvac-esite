import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { normalizeImageUrl } from '../imageUtils'

describe('normalizeImageUrl', () => {
  const defaultFallback = '/images/vortice_lineo_futuristic.webp'

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-supabase.co')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return default fallback for null, undefined, or empty values', () => {
    expect(normalizeImageUrl(null)).toBe(defaultFallback)
    expect(normalizeImageUrl(undefined)).toBe(defaultFallback)
    expect(normalizeImageUrl('')).toBe(defaultFallback)
    expect(normalizeImageUrl('   ')).toBe(defaultFallback)
  })

  it('should return custom fallback when provided', () => {
    const customFallback = '/images/custom.png'
    expect(normalizeImageUrl(null, customFallback)).toBe(customFallback)
    expect(normalizeImageUrl('   ', customFallback)).toBe(customFallback)
  })

  it('should return fallback for invalid placeholder strings lacking extensions', () => {
    expect(normalizeImageUrl('image')).toBe(defaultFallback)
    expect(normalizeImageUrl('test')).toBe(defaultFallback)
    expect(normalizeImageUrl('placeholder')).toBe(defaultFallback)
    expect(normalizeImageUrl('img')).toBe(defaultFallback)
  })

  it('should return absolute URLs as is', () => {
    const httpUrl = 'http://example.com/fan.png'
    const httpsUrl = 'https://example.com/fan.webp'
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAA'
    
    expect(normalizeImageUrl(httpUrl)).toBe(httpUrl)
    expect(normalizeImageUrl(httpsUrl)).toBe(httpsUrl)
    expect(normalizeImageUrl(dataUrl)).toBe(dataUrl)
  })

  it('should return root-relative URLs as is', () => {
    const rootRelative = '/custom/local/path.jpg'
    expect(normalizeImageUrl(rootRelative)).toBe(rootRelative)
  })

  it('should resolve Supabase path with domain and clean duplicates', () => {
    const rawPath = 'product-images/fan.png'
    const expected = 'https://test-supabase.co/storage/v1/object/public/product-images/fan.png'
    expect(normalizeImageUrl(rawPath)).toBe(expected)

    // Should deduplicate Supabase URL prefix if already present
    const duplicatePath = 'https://test-supabase.co/storage/v1/object/public/product-images/fan.png'
    expect(normalizeImageUrl(duplicatePath)).toBe(expected)
  })

  it('should prefix bucket name if specified and not already present', () => {
    const rawPath = 'fan.webp'
    const expected = 'https://test-supabase.co/storage/v1/object/public/category-images/fan.webp'
    expect(normalizeImageUrl(rawPath, defaultFallback, 'category-images')).toBe(expected)

    // Should not double prefix if already present
    const prefixedPath = 'category-images/fan.webp'
    expect(normalizeImageUrl(prefixedPath, defaultFallback, 'category-images')).toBe(expected)
  })
})
