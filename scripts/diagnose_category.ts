
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---')

    // 1. Check by old slug
    const { data: oldSlug, error: err1 } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'endustriyel-fanlar')
        .single()

    if (oldSlug) {
        console.log('Found "endustriyel-fanlar":')
        console.log(`  ID: ${oldSlug.id}`)
        console.log(`  Name: ${oldSlug.name}`)
        console.log(`  Metadata:`, JSON.stringify(oldSlug.metadata, null, 2))
    } else {
        console.log('"endustriyel-fanlar" not found (might be renamed?)')
    }

    // 2. Check by possible new slug (if migration changed slug too?)
    // Or just check if there is ANY category with 'Exproof' in name
    const { data: exproofSearch, error: err2 } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', '%Exproof%')

    if (exproofSearch && exproofSearch.length > 0) {
        console.log('Found categories with "Exproof" in name:')
        exproofSearch.forEach(cat => {
            console.log(`  ID: ${cat.id}`)
            console.log(`  Name: ${cat.name}`)
            console.log(`  Slug: ${cat.slug}`)
        })
    } else {
        console.log('No categories found with "Exproof" in name.')
    }

    // 3. Search for 'Vortice' product
    const { data: productSearch, error: err3 } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%Vortice%')

    if (productSearch && productSearch.length > 0) {
        console.log('Found Vortice products:')
        productSearch.forEach(p => {
            console.log(`  ID: ${p.id}`)
            console.log(`  Name: ${p.name}`)
            console.log(`  Category ID: ${p.category_id}`)
        })
    } else {
        console.log('No Vortice product found.')
    }

    console.log('--- DIAGNOSTIC END ---')
}

diagnose().catch(console.error)
