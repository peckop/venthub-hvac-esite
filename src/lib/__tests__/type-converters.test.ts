import { describe, expect,it } from 'vitest'

import type { DbCategory, DbProduct } from '../../types/db-rows'
import {
    isRecord,
    mapCategoryWithLocale,
    mapDatabaseCategoryToDomain,
    mapDatabaseProductToDomain,
    toSupabaseJson,
    toUICategoryList,
    toUIProductList
} from '../type-converters'

describe('type-converters', () => {
    describe('toSupabaseJson', () => {
        it('should properly serialize and deserialize to satisfy JSON type', () => {
            const input = { a: 1, b: 'two', c: null, d: [1, 2] }
            const result = toSupabaseJson(input)
            expect(result).toEqual(input)
        })

        it('should strip out non-JSON values like undefined', () => {
            const input = { a: 1, b: undefined }
            const result = toSupabaseJson(input)
            expect(result).toEqual({ a: 1 })
        })
    })

    describe('isRecord', () => {
        it('should return true for generic objects', () => {
            expect(isRecord({ a: 1 })).toBe(true)
            expect(isRecord({})).toBe(true)
        })

        it('should return false for null, arrays, and primitives', () => {
            expect(isRecord(null)).toBe(false)
            expect(isRecord([])).toBe(false)
            expect(isRecord([1, 2])).toBe(false)
            expect(isRecord('string')).toBe(false)
            expect(isRecord(123)).toBe(false)
            expect(isRecord(undefined)).toBe(false)
        })
    })

    describe('mapDatabaseCategoryToDomain', () => {
        it('should map fully populated fields correctly', () => {
            const dbCat: Partial<DbCategory> = {
                id: '1',
                name: 'HVAC',
                menu_label: 'HVAC Menu',
                marketing_title: 'Best HVAC',
                description: 'Desc'
            }
            const result = mapDatabaseCategoryToDomain(dbCat as DbCategory)
            expect(result.name).toBe('HVAC')
            expect(result.menu_label).toBe('HVAC Menu')
            expect(result.description).toBe('Desc')
            // ⭐HÜKÜM DEĞİŞTİ (REC-297, 2026-09-09) ve DEĞİŞMEZİ TAM YAZIYORUM, çünkü ilk
            // yazışımda FAZLA GENİŞ ifade ettim ve test bana yanıldığımı söyledi.
            //
            // Eskiden burada `expect(result.marketing_title).toBe('Best HVAC')` vardı:
            // dönüştürücü alanı `name`'e düşen bir YEDEKLE ÜRETİYORDU. O satır kalktı.
            //
            // AMA dönüştürücü `...dbCat` yayar. Yani satırda alan VARSA çıktıya GEÇER —
            // ve bu DOĞRUDUR: yönetim yüzeyleri kolonu okumaya devam eder (kolon DB'de
            // duruyor, emekli edildi ama SİLİNMEDİ). Dönüştürücüyü "her koşulda ayıkla"
            // yapmak, emekli etmek ile silmek arasındaki farkı yok ederdi.
            //
            // Korunan gerçek değişmez: dönüştürücü bu alanı **ÜRETMEZ**. Vitrin tarafında
            // alan zaten `select` listesinde olmadığı için satıra hiç girmez — ölçüm
            // oradadır (INV-MARKETING-YUK-1), burada değil.
            expect(result.marketing_title).toBe('Best HVAC') // geçiş, üretim DEĞİL
        })

        it('should fallback to name for menu_label if missing (marketing_title ÜRETİLMEZ)', () => {
            const dbCat: Partial<DbCategory> = {
                id: '2',
                name: 'Fans'
            }
            const result = mapDatabaseCategoryToDomain(dbCat as DbCategory)
            expect(result.name).toBe('Fans')
            expect(result.menu_label).toBe('Fans')
            expect(result.description).toBe('')
            // Eski hâl `marketing_title`'ı da `name`'e düşürüyordu; emekli alan için
            // yedek üretmek, ölü veriyi diri göstermekti.
            expect(result).not.toHaveProperty('marketing_title')
        })

        it('should fallback to empty strings if everything is missing', () => {
            const dbCat: Partial<DbCategory> = { id: '3' }
            const result = mapDatabaseCategoryToDomain(dbCat as DbCategory)
            expect(result.name).toBe('')
            expect(result.menu_label).toBe('')
            expect(result.description).toBe('')
            expect(result).not.toHaveProperty('marketing_title')
        })
    })

    describe('mapDatabaseProductToDomain', () => {
        it('should map fully populated fields correctly', () => {
            const dbProd: Partial<DbProduct> = {
                id: '1',
                name: 'Jet Fan',
                description_i18n: { tr: 'Fast fan' },
                brand: 'SuperCool'
            }
            const result = mapDatabaseProductToDomain(dbProd as DbProduct)
            expect(result.name).toBe('Jet Fan')
            expect(result.description).toBe('Fast fan')
            expect(result.brand).toBe('SuperCool')
        })

        it('should fallback to empty strings and default brand', () => {
            const dbProd: Partial<DbProduct> = { id: '2' }
            const result = mapDatabaseProductToDomain(dbProd as DbProduct)
            expect(result.name).toBe('')
            expect(result.description).toBe('')
            expect(result.brand).toBe('Venthub')
        })
    })

    describe('list converters', () => {
        it('toUICategoryList should map an array of categories', () => {
            const dbCats: Partial<DbCategory>[] = [{ id: '1', name: 'Cat1' }, { id: '2', name: 'Cat2' }]
            const results = toUICategoryList(dbCats as DbCategory[])
            expect(results.length).toBe(2)
            expect(results[0].name).toBe('Cat1')
            expect(results[1].name).toBe('Cat2')
        })

        it('toUIProductList should map an array of products', () => {
            const dbProds: Partial<DbProduct>[] = [{ id: '1', name: 'Prod1' }, { id: '2', name: 'Prod2' }]
            const results = toUIProductList(dbProds as DbProduct[])
            expect(results.length).toBe(2)
            expect(results[0].name).toBe('Prod1')
            expect(results[1].name).toBe('Prod2')
        })
    })

    describe('mapCategoryWithLocale', () => {
        const baseCat: Partial<DbCategory> = {
            id: '1',
            name: 'Klima',
            slug: 'klima',
            translation_key: 'ac',
        }

        it('aktif dilin (en) yerelleştirilmiş metadata alanlarını üste taşır', () => {
            const dbCat: Partial<DbCategory> = {
                ...baseCat,
                metadata: {
                    hero_title: 'Varsayılan',
                    tr: { hero_title: 'TR Başlık' },
                    en: { hero_title: 'EN Title' },
                },
            }
            const result = mapCategoryWithLocale(dbCat as DbCategory, 'en')
            expect(result.metadata?.hero_title).toBe('EN Title')
        })

        it('istenen dil yoksa tr metadatasına düşer', () => {
            const dbCat: Partial<DbCategory> = {
                ...baseCat,
                metadata: {
                    tr: { hero_title: 'TR Başlık' },
                },
            }
            const result = mapCategoryWithLocale(dbCat as DbCategory, 'en')
            expect(result.metadata?.hero_title).toBe('TR Başlık')
        })

        it('lang verilmezse varsayılan olarak tr kullanır', () => {
            const dbCat: Partial<DbCategory> = {
                ...baseCat,
                metadata: {
                    tr: { hero_title: 'TR Başlık' },
                    en: { hero_title: 'EN Title' },
                },
            }
            const result = mapCategoryWithLocale(dbCat as DbCategory)
            expect(result.metadata?.hero_title).toBe('TR Başlık')
        })

        it('metadata yoksa base kategoriyi döndürür (metadata null)', () => {
            const dbCat: Partial<DbCategory> = { ...baseCat, metadata: null }
            const result = mapCategoryWithLocale(dbCat as DbCategory, 'en')
            expect(result.name).toBe('Klima')
            expect(result.metadata).toBeNull()
        })
    })
})
