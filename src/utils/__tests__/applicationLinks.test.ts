import { describe, expect,it } from 'vitest'

import { getCategoryUrlFromTopic } from '../applicationLinks'

// Faz 3-C (URN-85 2/2) `ADRES_SEMASI_K3B` değerini `true` yaptı. Bu dosya iki kolu da BAYRAKTAN BAĞIMSIZ ölçer:
// kip, işlevin test-içi üçüncü parametresiyle (`bayrak`) açıkça verilir; varsayılana (gerçek sabite) bakılmaz.
// Varsayılanın gerçek değeriyle davranışı `yuzeyAdresleriK3b.test.tsx` ve `yuzeyAdresleri.test.ts`'te ölçülür.
describe('applicationLinks', () => {
    describe('getCategoryUrlFromTopic — KAPALI kip (bayrak=false: bugünkü dilsiz eşleme, geri alma kolu)', () => {
        it('should return correct mapped URL for hava-perdesi', () => {
            expect(getCategoryUrlFromTopic('hava-perdesi', 'tr', false)).toBe('/category/air-curtains')
        })

        it('should return correct mapped URL for jet-fan', () => {
            expect(getCategoryUrlFromTopic('jet-fan', 'tr', false)).toBe('/category/jet-fans')
        })

        it('should return correct mapped URL for hrv', () => {
            expect(getCategoryUrlFromTopic('hrv', 'tr', false)).toBe('/category/heat-recovery-units')
        })

        it('should fallback to /products for unknown topics', () => {
            expect(getCategoryUrlFromTopic('unknown-topic', 'tr', false)).toBe('/products')
            expect(getCategoryUrlFromTopic('', 'tr', false)).toBe('/products')
        })
    })

    describe('getCategoryUrlFromTopic — AÇIK kip (bayrak=true: plan §2 şeması, dile göre görünen slug)', () => {
        it('should return correct mapped URL for hava-perdesi', () => {
            expect(getCategoryUrlFromTopic('hava-perdesi', 'tr', true)).toBe('/tr/kategori/hava-perdeleri')
            expect(getCategoryUrlFromTopic('hava-perdesi', 'en', true)).toBe('/en/category/air-curtains')
        })

        it('should return correct mapped URL for jet-fan (pasif jet-fans dalının aktif üstü: fanlar)', () => {
            expect(getCategoryUrlFromTopic('jet-fan', 'tr', true)).toBe('/tr/kategori/fanlar')
            expect(getCategoryUrlFromTopic('jet-fan', 'en', true)).toBe('/en/category/fans')
        })

        it('should return correct mapped URL for hrv (canlı ısı geri kazanım kökü)', () => {
            expect(getCategoryUrlFromTopic('hrv', 'tr', true)).toBe('/tr/kategori/isi-geri-kazanim')
            expect(getCategoryUrlFromTopic('hrv', 'en', true)).toBe('/en/category/heat-recovery-vmc')
        })

        it('should fallback to all-products page for unknown topics (dile göre)', () => {
            expect(getCategoryUrlFromTopic('unknown-topic', 'tr', true)).toBe('/tr/urunler')
            expect(getCategoryUrlFromTopic('', 'en', true)).toBe('/en/products')
        })
    })
})
