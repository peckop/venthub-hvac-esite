
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env parser
const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, val] = line.split('=')
        if (key && val) acc[key.trim()] = val.trim().replace(/\r/g, '')
        return acc
    }, {} as any)

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnose() {
    const output: string[] = []
    output.push('=== DIAGNOSTIC: Categories ===\n')

    // 1. List ALL categories with parent info
    const { data: cats, error: cErr } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('parent_id', { ascending: true, nullsFirst: true })

    if (cErr) {
        output.push('Error fetching categories: ' + JSON.stringify(cErr))
        fs.writeFileSync('diagnostic_output.txt', output.join('\n'))
        return
    }

    output.push('All Categories:')
    cats?.forEach(c => output.push(`  - ${c.name} | slug: ${c.slug} | parent: ${c.parent_id || 'ROOT'} | id: ${c.id}`))

    // 2. Count products per category
    output.push('\n=== Products per Category ===')

    for (const cat of cats || []) {
        const { count, error } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', cat.id)

        output.push(`  ${cat.name}: ${count ?? 0} products`)
    }

    // 3. Sample products to see their category_id
    output.push('\n=== Sample Products (first 10) ===')
    const { data: prods, error: pErr } = await supabase
        .from('products')
        .select('id, name, category_id')
        .limit(10)

    if (pErr) {
        output.push('Error fetching products: ' + JSON.stringify(pErr))
    } else {
        prods?.forEach(p => output.push(`  - ${p.name} | category_id: ${p.category_id}`))
    }

    fs.writeFileSync('diagnostic_output.txt', output.join('\n'))
    console.log('Diagnostic written to diagnostic_output.txt')
}

diagnose()
