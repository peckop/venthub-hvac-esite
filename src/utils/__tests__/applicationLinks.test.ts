import { describe, expect,it } from 'vitest'

import { getCategoryUrlFromTopic } from '../applicationLinks'

describe('applicationLinks', () => {
    describe('getCategoryUrlFromTopic', () => {
        it('should return correct mapped URL for hava-perdesi', () => {
            expect(getCategoryUrlFromTopic('hava-perdesi')).toBe('/category/air-curtains')
        })

        it('should return correct mapped URL for jet-fan', () => {
            expect(getCategoryUrlFromTopic('jet-fan')).toBe('/category/jet-fans')
        })

        it('should return correct mapped URL for hrv', () => {
            expect(getCategoryUrlFromTopic('hrv')).toBe('/category/heat-recovery-units')
        })

        it('should fallback to /products for unknown topics', () => {
            expect(getCategoryUrlFromTopic('unknown-topic')).toBe('/products')
            expect(getCategoryUrlFromTopic('')).toBe('/products')
        })
    })
})
