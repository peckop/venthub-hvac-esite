import { describe, expect, it, vi } from 'vitest'

import type { DbCategory } from '../../types/db-rows'
import type { CategoryDescriptionSource } from '../categoryHelpers'
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

    // ⭐REC-161: `lang` ZORUNLU. Fixture'lar `CategoryDescriptionSource`'u karşıladığı
    // için artık tip dökümü GEREKMİYOR — döküm kuralı susturur, sağlamaz.
    describe('getCategoryDescription', () => {
         it('should return empty string if category is null or undefined', () => {
             expect(getCategoryDescription(null, 'tr')).toBe('')
             expect(getCategoryDescription(undefined, 'en')).toBe('')
         })

         it('should return hero_description from metadata if present', () => {
             const cat: CategoryDescriptionSource = { metadata: { hero_description: 'Hero Desc' }, description: 'Normal Desc' }
             expect(getCategoryDescription(cat, 'tr')).toBe('Hero Desc')
         })

         it('should fallback to description if metadata or hero_description is absent', () => {
             const cat: CategoryDescriptionSource = { description: 'Normal Desc' }
             expect(getCategoryDescription(cat, 'tr')).toBe('Normal Desc')

             const cat2: CategoryDescriptionSource = { metadata: {}, description: 'Normal Desc 2' }
             expect(getCategoryDescription(cat2, 'tr')).toBe('Normal Desc 2')
         })

         it('should return empty string if both hero_description and description are absent', () => {
             const cat: CategoryDescriptionSource = {}
             expect(getCategoryDescription(cat, 'tr')).toBe('')
         })

         // ⭐REC-161 — dile göre çözüm (yeni davranış)
         it('description_i18n varsa aktif dilin metnini doner', () => {
             const cat: CategoryDescriptionSource = {
                 metadata: { description_i18n: { tr: 'Turkce metin', en: 'English text' }, hero_description: 'Hero TR' },
                 description: 'Kolon',
             }
             expect(getCategoryDescription(cat, 'tr')).toBe('Turkce metin')
             expect(getCategoryDescription(cat, 'en')).toBe('English text')
         })

         it('aktif dilin metni yoksa legacy zincire duser (geriye uyum)', () => {
             const sadeceTr: CategoryDescriptionSource = {
                 metadata: { description_i18n: { tr: 'Sadece TR' }, hero_description: 'Hero TR' },
                 description: 'Kolon',
             }
             // EN karsiligi yok → bugunku davranis (hero_description) aynen korunur
             expect(getCategoryDescription(sadeceTr, 'en')).toBe('Hero TR')

             const bosDize: CategoryDescriptionSource = {
                 metadata: { description_i18n: { tr: '', en: '' } },
                 description: 'Kolon',
             }
             // Bos dize "yok" sayilir — bos paragraf basmak yerine kolona duser
             expect(getCategoryDescription(bosDize, 'en')).toBe('Kolon')
         })

         it('bilinmeyen dil kodu TR gibi cozulur (getLocalizedCategorySlug ile ayni kural)', () => {
             const cat: CategoryDescriptionSource = {
                 metadata: { description_i18n: { tr: 'Turkce metin', en: 'English text' } },
             }
             expect(getCategoryDescription(cat, 'de')).toBe('Turkce metin')
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
