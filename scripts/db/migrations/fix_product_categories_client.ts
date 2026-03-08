
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env parser
const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, val] = line.split('=')
        if (key && val) acc[key.trim()] = val.trim()
        return acc
    }, {} as any)

/*
  Since reading .env returned keys with possible \r (windows), we clean them.
*/
const cleanEnv = (key: string) => (env[key] || '').replace(/\r/g, '')

const supabaseUrl = cleanEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = cleanEnv('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

console.log('Using Supabase URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    console.log('Starting product distribution (Client-side)...')

    // Helper to update categories by name match
    const updateCategory = async (catKeyword: string, productKeyword: string, excludeCriterias: string[] = []) => {
        // 1. Find Category ID
        const { data: cats, error: cErr } = await supabase
            .from('categories')
            .select('id, name')
            .ilike('name', `%${catKeyword}%`)
            .limit(1)

        if (cErr || !cats || cats.length === 0) {
            console.log(`Category not found for keyword: ${catKeyword}`)
            return
        }

        const cat = cats[0]
        console.log(`Found Category: ${cat.name} (${cat.id})`)

        // 2. Find Products matching keyword but NOT in this category
        let query = supabase
            .from('products')
            .select('id, name, category_id')
            .ilike('name', `%${productKeyword}%`)
            .neq('category_id', cat.id)

        // Exclude special cases (e.g. Jet Fan for Smoke Exhaust)
        for (const ex of excludeCriterias) {
            query = query.not('name', 'ilike', `%${ex}%`)
        }

        const { data: products, error: pErr } = await query

        if (pErr) {
            console.error('Error fetching products:', pErr)
            return
        }

        if (!products || products.length === 0) {
            console.log(`No products to move for ${cat.name}`)
            return
        }

        console.log(`Moving ${products.length} products to ${cat.name}...`)

        for (const p of products) {
            const { error: uErr } = await supabase
                .from('products')
                .update({ category_id: cat.id })
                .eq('id', p.id)

            if (uErr) {
                console.error(`Failed to update product ${p.name}:`, uErr.message)
            } else {
                console.log(`Updated: ${p.name}`)
            }
        }
    }

    await updateCategory('Aksiyal Fan', 'Aksiyal')
    await updateCategory('Radyal Fan', 'Radyal')
    await updateCategory('Kanal Tipi', 'Kanal Tipi')
    await updateCategory('Çatı Tipi', 'Çatı Tipi')
    await updateCategory('Jet Fan', 'Jet Fan')
    await updateCategory('Duman', 'Duman', ['Jet']) // Duman/Egzoz but NOT Jet
    await updateCategory('Isıtıcılı', 'Isıtıcılı')
    await updateCategory('Isıtıcısız', 'Isıtıcısız')

    console.log('Done.')
}

run()
