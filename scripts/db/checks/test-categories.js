// Quick test to fetch categories from database and find correct slugs
import { getCategories } from '../../../src/lib/supabase'

async function testCategories() {
    try {
        console.warn('Fetching all categories...\n')
        const categories = await getCategories()

        console.warn(`Found ${categories.length} categories:\n`)

        console.warn('MAIN CATEGORIES (level 0):')
        const mainCats = categories.filter(c => c.level === 0)
        mainCats.forEach(cat => {
            console.warn(`  - ${cat.name} → slug: "${cat.slug}"`)
        })

        console.warn('\nSUB-CATEGORIES (level > 0):')
        const subCats = categories.filter(c => c.level > 0)
        subCats.forEach(cat => {
            console.warn(`  - ${cat.name} → slug: "${cat.slug}" (level ${cat.level})`)
        })

        console.warn('\n\nLOOKING FOR RELEVANT CATEGORIES:')

        const havaPattern = categories.filter(c => c.name.toLowerCase().includes('hava') || c.slug.includes('hava'))
        console.warn('\nHava Perdesi related:')
        havaPattern.forEach(c => console.warn(`  ${c.name} → ${c.slug}`))

        const jetPattern = categories.filter(c => c.name.toLowerCase().includes('jet') || c.slug.includes('jet'))
        console.warn('\nJet Fan related:')
        jetPattern.forEach(c => console.warn(`  ${c.name} → ${c.slug}`))

        const hrvPattern = categories.filter(c => c.name.toLowerCase().includes('ısı') || c.name.toLowerCase().includes('hrv') || c.slug.includes('isi') || c.slug.includes('hrv'))
        console.warn('\nHRV / Isı Geri Kazanım related:')
        hrvPattern.forEach(c => console.warn(`  ${c.name} → ${c.slug}`))

    } catch (error) {
        console.error('Error fetching categories:', error)
    }
}

testCategories()
