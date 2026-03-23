import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Simulate __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env manually
try {
    const envPath = path.resolve(__dirname, '../../../.env')
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
} catch {
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
    console.warn('--- Inspecting Categories ---')
    const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(3)

    if (catError) {
        console.error(catError)
    } else if (cats) {
        cats.forEach(c => {
            console.warn(`Category: ${c.name} (${c.slug})`)
            console.warn('Keys:', Object.keys(c))
            console.warn('---')
        })
    }

    console.warn('\n--- Inspecting Products ---')
    const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .limit(3)

    if (prodError) {
        console.error(prodError)
    } else if (prods) {
        prods.forEach(p => {
            console.warn(`Product: ${p.name}`)
            console.warn('Keys:', Object.keys(p))
            console.warn('---')
        })
    }
}

inspect()
