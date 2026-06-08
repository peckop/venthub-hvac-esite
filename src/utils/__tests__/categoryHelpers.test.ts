import { describe, expect, it, vi } from 'vitest'

import type { DbCategory } from '../../types/db-rows'
import {
    getCategoryDescription,
    getCategoryDisplayName,
    getCategoryMarketingTitle,
    parsePriceToNumber
} from '../categoryHelpers'

describe('categoryHelpers', () => {

    describe('getCategoryDisplayName', () => {
        it('should return empty string if category is null or undefined', () => {
            expect(getCategoryDisplayName(null)).toBe('')
            expect(getCategoryDisplayName(undefined)).toBe('')
        })

        it('should use translation if t function is provided and translation exists for translation_key', () => {
            const cat = { translation_key: 'test_key', slug: 'test-slug', name: 'Test' } as DbCategory
            const t = vi.fn().mockImplementation((key) => {
                if (key === 'common.categoryList.test_key') return 'Translated Test'
                return key
            })
            expect(getCategoryDisplayName(cat, t)).toBe('Translated Test')
        })

        it('should use translation if t function is provided and translation exists for slug', () => {
             const cat = { slug: 'test-slug', name: 'Test' } as DbCategory
             const t = vi.fn().mockImplementation((key) => {
                 if (key === 'common.categoryList.test-slug') return 'Translated Slug'
                 return key
             })
             expect(getCategoryDisplayName(cat, t)).toBe('Translated Slug')
        })

        it('should fallback to menu_label if translation returns translation path', () => {
             const cat = { translation_key: 'test_key', menu_label: 'Menu Label', name: 'Test' } as DbCategory
             const t = vi.fn().mockImplementation((key) => key) // returns path
             expect(getCategoryDisplayName(cat, t)).toBe('Menu Label')
        })

        it('should fallback to menu_label if no t function is provided', () => {
            const cat = { menu_label: 'Menu Label', name: 'Original Name' } as DbCategory
            expect(getCategoryDisplayName(cat)).toBe('Menu Label')
        })

        it('should fallback to name if menu_label is empty and no translation', () => {
            const cat = { name: 'Original Name' } as DbCategory
            expect(getCategoryDisplayName(cat)).toBe('Original Name')
        })
    })

    describe('getCategoryMarketingTitle', () => {
        it('should return empty string if category is null or undefined', () => {
             expect(getCategoryMarketingTitle(null)).toBe('')
             expect(getCategoryMarketingTitle(undefined)).toBe('')
        })

        it('should return marketing_title if it exists', () => {
            const cat = { marketing_title: 'Marketing Value', name: 'Original Name' } as DbCategory
            expect(getCategoryMarketingTitle(cat)).toBe('Marketing Value')
        })

        it('should fallback to display name if marketing_title is absent', () => {
            const cat = { menu_label: 'Menu Label', name: 'Original Name' } as DbCategory
            expect(getCategoryMarketingTitle(cat)).toBe('Menu Label')
        })
    })

    describe('getCategoryDescription', () => {
         it('should return empty string if category is null or undefined', () => {
             expect(getCategoryDescription(null)).toBe('')
             expect(getCategoryDescription(undefined)).toBe('')
         })

         it('should return hero_description from metadata if present', () => {
             const cat = { metadata: { hero_description: 'Hero Desc' }, description: 'Normal Desc' } as unknown as DbCategory
             expect(getCategoryDescription(cat)).toBe('Hero Desc')
         })

         it('should fallback to description if metadata or hero_description is absent', () => {
             const cat = { description: 'Normal Desc' } as DbCategory
             expect(getCategoryDescription(cat)).toBe('Normal Desc')

             const cat2 = { metadata: {}, description: 'Normal Desc 2' } as DbCategory
             expect(getCategoryDescription(cat2)).toBe('Normal Desc 2')
         })

         it('should return empty string if both hero_description and description are absent', () => {
             const cat = {} as DbCategory
             expect(getCategoryDescription(cat)).toBe('')
         })
    })

    describe('parsePriceToNumber', () => {
        it('should return the same number if input is a number', () => {
            expect(parsePriceToNumber(42.5)).toBe(42.5)
            expect(parsePriceToNumber(0)).toBe(0)
            expect(parsePriceToNumber(-10)).toBe(-10)
        })

        it('should correctly parse standard string numbers', () => {
             expect(parsePriceToNumber('123')).toBe(123)
             expect(parsePriceToNumber('123.45')).toBe(123.45)
        })

        it('should correctly parse Turkish localized string numbers (comma for decimal)', () => {
             expect(parsePriceToNumber('123,45')).toBe(123.45)
             expect(parsePriceToNumber('0,99')).toBe(0.99)
        })

        it('should correctly parse string numbers with currency symbols and spaces (current faulty implementation behavior)', () => {
            // Note: The current implementation of parsePriceToNumber has a bug where it
            // leaves thousands separators in place and then parseFloat truncates it.
            // Example: "1.234,56" -> "1.234.56" -> parseFloat("1.234.56") -> 1.234
            // Since we are not modifying source files to fix bugs (per instructions),
            // we test the existing behavior.
            expect(parsePriceToNumber('₺ 1.234,56')).toBe(1.234)
            expect(parsePriceToNumber('$ 1,234.56')).toBe(1.234)
            expect(parsePriceToNumber('1.234.567,89 TL')).toBe(1.234)
        })

        it('should return 0 for invalid inputs', () => {
            expect(parsePriceToNumber('abc')).toBe(0)
            expect(parsePriceToNumber(null)).toBe(0)
            expect(parsePriceToNumber(undefined)).toBe(0)
            expect(parsePriceToNumber({})).toBe(0)
            expect(parsePriceToNumber([])).toBe(0)
        })
    })

})
