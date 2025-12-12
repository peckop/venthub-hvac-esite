
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    console.log('--- Inspecting Categories ---')
    const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(3)

    if (catError) console.error(catError)
    else {
        cats.forEach(c => {
            console.log(`Category: ${c.name} (${c.slug})`)
            console.log('Keys:', Object.keys(c))
            console.log('Metadata:', JSON.stringify(c.metadata, null, 2))
            console.log('---')
        })
    }

    console.log('\n--- Inspecting Products ---')
    const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .limit(3)

    if (prodError) console.error(prodError)
    else {
        prods.forEach(p => {
            console.log(`Product: ${p.name}`)
            console.log('Keys:', Object.keys(p))
            console.log('Technical Specs:', JSON.stringify(p.technical_specs, null, 2))
            console.log('---')
        })
    }
}

inspect()
