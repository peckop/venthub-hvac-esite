import { describe, it, expect } from 'vitest'
import {
  HOME_DATA_TAG,
  PRODUCTS_DISCOVERY_TAG,
  homeDataTag,
  discoveryTag,
  familyTag,
  variantStockTag
} from '../tags'

describe('tags', () => {
  describe('homeDataTag', () => {
    it('should return global tag when tenantId is not provided', () => {
      expect(homeDataTag()).toBe(HOME_DATA_TAG)
    })

    it('should return tenant specific tag when tenantId is provided', () => {
      expect(homeDataTag('tenant-123')).toBe('home-data-tenant-123')
    })
  })

  describe('discoveryTag', () => {
    it('should return global tag when tenantId is not provided', () => {
      expect(discoveryTag()).toBe(PRODUCTS_DISCOVERY_TAG)
    })

    it('should return tenant specific tag when tenantId is provided', () => {
      expect(discoveryTag('tenant-456')).toBe('products-discovery-tenant-456')
    })
  })

  describe('familyTag', () => {
    it('should return correctly formatted family tag with slug', () => {
      expect(familyTag('my-family-slug')).toBe('product-family-my-family-slug')
    })
  })

  describe('variantStockTag', () => {
    it('should return the static variant stock tag', () => {
      expect(variantStockTag()).toBe('variant-stock')
    })
  })
})
