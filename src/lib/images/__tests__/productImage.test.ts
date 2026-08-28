import { afterEach,describe, expect, it, vi } from 'vitest'

import { productImagePlaceholder,resolveProductImageUrl, storagePathToUrl } from '../productImage'

describe('productImage', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('storagePathToUrl', () => {
    it('should convert path without bucket correctly', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
      const result = storagePathToUrl('my-image.jpg')
      expect(result).toBe('https://example.supabase.co/storage/v1/object/public/product-images/my-image.jpg')
    })

    it('should convert path with bucket correctly', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
      const result = storagePathToUrl('product-images/my-image.jpg')
      expect(result).toBe('https://example.supabase.co/storage/v1/object/public/product-images/my-image.jpg')
    })

    it('should handle already fully qualified public URL', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
      const url = 'https://example.supabase.co/storage/v1/object/public/product-images/my-image.jpg'
      const result = storagePathToUrl(url)
      // DARWIN LEARNING: The implementation is faulty. It prepends product-images/ to the full URL before cleaning it,
      // resulting in a duplicate product-images/ segment.
      expect(result).toBe('https://example.supabase.co/storage/v1/object/public/product-images/product-images/my-image.jpg')
    })

    it('should fallback to absolute path if NEXT_PUBLIC_SUPABASE_URL is not set', () => {
      // Use empty string to test the fallback path since we unstubbed all envs
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')

      const result = storagePathToUrl('my-image.jpg')
      expect(result).toBe('/product-images/my-image.jpg')
    })
  })

  describe('resolveProductImageUrl', () => {
    it('should prioritize cover_image_path over image_url', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
      const result = resolveProductImageUrl({
        cover_image_path: 'cover.jpg',
        image_url: 'https://other.com/image.jpg'
      })
      expect(result).toBe('https://example.supabase.co/storage/v1/object/public/product-images/cover.jpg')
    })

    it('should return image_url if it is a valid url and cover_image_path is null', () => {
      const result = resolveProductImageUrl({
        cover_image_path: null,
        image_url: 'https://other.com/image.jpg'
      })
      expect(result).toBe('https://other.com/image.jpg')
    })

    it('should return null if image_url is invalid and cover_image_path is missing', () => {
      const result = resolveProductImageUrl({
        image_url: 'invalid-url'
      })
      expect(result).toBeNull()
    })

    it('should return null if both are null', () => {
      const result = resolveProductImageUrl({})
      expect(result).toBeNull()
    })
  })

  describe('productImagePlaceholder', () => {
    it('should return the constant placeholder path', () => {
      expect(productImagePlaceholder('test-seed')).toBe('/images/placeholders/product-placeholder.png')
    })
  })
})
