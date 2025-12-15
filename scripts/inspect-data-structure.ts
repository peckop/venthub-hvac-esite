import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Simulate __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env manually
try {
    const envPath = path.resolve(__dirname, '../.env')
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
        const [key, ...values] = line.split('=')
        if (key && values.length > 0) {
            const val = values.join('=').trim().replace(/^["']|["']$/g, '') // remove quotes
            if (!process.env[key.trim()]) {
                process.env[key.trim()] = val
            }
        }
    })
} catch (e) {
    // .env might not exist or we are in prod
}

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
