// Quick test to fetch categories from database and find correct slugs
import { getCategories } from './src/lib/supabase'

async function testCategories() {
    try {
        console.log('Fetching all categories...\n')
        const categories = await getCategories()

        console.log(`Found ${categories.length} categories:\n`)

        console.log('MAIN CATEGORIES (level 0):')
        const mainCats = categories.filter(c => c.level === 0)
        mainCats.forEach(cat => {
            console.log(`  - ${cat.name} → slug: "${cat.slug}"`)
        })

        console.log('\nSUB-CATEGORIES (level > 0):')
        const subCats = categories.filter(c => c.level > 0)
        subCats.forEach(cat => {
            console.log(`  - ${cat.name} → slug: "${cat.slug}" (level ${cat.level})`)
        })

        console.log('\n\nLOOKING FOR RELEVANT CATEGORIES:')

        const havaPattern = categories.filter(c => c.name.toLowerCase().includes('hava') || c.slug.includes('hava'))
        console.log('\nHava Perdesi related:')
        havaPattern.forEach(c => console.log(`  ${c.name} → ${c.slug}`))

        const jetPattern = categories.filter(c => c.name.toLowerCase().includes('jet') || c.slug.includes('jet'))
        console.log('\nJet Fan related:')
        jetPattern.forEach(c => console.log(`  ${c.name} → ${c.slug}`))

        const hrvPattern = categories.filter(c => c.name.toLowerCase().includes('ısı') || c.name.toLowerCase().includes('hrv') || c.slug.includes('isi') || c.slug.includes('hrv'))
        console.log('\nHRV / Isı Geri Kazanım related:')
        hrvPattern.forEach(c => console.log(`  ${c.name} → ${c.slug}`))

    } catch (error) {
        console.error('Error fetching categories:', error)
    }
}

testCategories()
