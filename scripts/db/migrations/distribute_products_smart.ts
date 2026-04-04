
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env parser
const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')
    .reduce((acc: Record<string, string>, line: string) => {
        const [key, val] = line.split('=')
        if (key && val) acc[key.trim()] = val.trim().replace(/\r/g, '')
        return acc
    }, {} as Record<string, string>)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapping: slug -> keywords to match in product names
// This maps directly to the active slugs in the categories table.
const RULES: { slug: string; keywords: string[]; excludeKeywords?: string[] }[] = [
    // Subcategories under Industrial Ventilation
    { slug: 'jet-fans', keywords: ['Jet Fan', 'JET FAN', 'TJF', 'JPF'] },
    { slug: 'radyal-fanlar', keywords: ['Radyal', 'NICOTRA', 'GEBHARDT', 'DD ', 'AT ', 'ADH', 'RDH', 'AVENS', 'Santrifüj', 'MBRU', 'MTCA'] },
    { slug: 'cati-tipi-fanlar', keywords: ['Çatı', 'CATI', 'Roof', 'TRM', 'TRT', 'TORRETTE', 'TR ', 'SLIMROOF', 'PRESTUR', 'AAZA'] },
    { slug: 'aksiyel-sanayi-fanlari', keywords: ['Aksiyel', 'Sanayi', 'Industrial', '_e 304', '_e 404', 'MBP', 'MBPC', 'VORTICEL', 'ENKELFAN', 'AATZA', 'AATVC', 'AAVM', 'AATVG'] },
    { slug: 'smoke-exhaust-fans', keywords: ['Duman', 'DUMAN', 'Smoke', 'THGT', 'F400', 'F300', 'CIKSTORM', 'CLIBOS', 'HEATMASTER'] },
    { slug: 'siginak-havalandirma', keywords: ['Sığınak', 'SIGINAK', 'BVU'] },
    { slug: 'ex-proof-atex-fanlar', keywords: ['ATEX', 'Ex-Proof', 'Ex-'] },
    
    // Subcategories under Commercial Ventilation
    { slug: 'air-curtains', keywords: ['Hava Perdesi', 'AIR DOOR', 'AD ', 'AD-', 'Air Curtain'] },
    { slug: 'iklimlendirme-cozumleri', keywords: ['İklimlendirme', 'Klima'] },
    
    // Subcategories under Residential Ventilation
    { slug: 'banyo-ve-tuvalet-fanlari', keywords: ['Punto', 'M ', 'MF ', 'Aspiratör', 'Banyo', 'MICRO', 'MEDIO', 'SUPER'] },
    { slug: 'cam-ve-pencere-tipi-fanlar', keywords: ['Vario', 'VARIO', 'Cam', 'Pencere'] },
    { slug: 'kanal-ici-hayalet-fanlar', keywords: ['Lineo', 'LINEO', 'Kanal', 'CA ', 'CA-IL', 'Quiet', 'QUIET'] },
    
    // Subcategories under Air Treatment
    { slug: 'dehumidifiers', keywords: ['Nem Alma', 'DEUMIDO'] },
    
    // TOP LEVEL Categories without children
    { slug: 'heat-recovery-vmc', keywords: ['Isı Geri Kazanım', 'VORT HRW', 'HRW', 'HRS'] },
    { slug: 'accessories-components', keywords: ['Danfoss', 'Hız Anahtarı', 'Konnektör', 'Kelepçe', 'Bant', 'Anemostad', 'PVC', 'SKY', 'Sono SKY', 'HIZ ANAHTARI'] },
]

async function distribute() {
    console.warn('=== Starting Enterprise Smart Product Distribution ===\n')

    // 1. Get all active categories (Top and Sub)
    const { data: allCategories, error: cErr } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')

    if (cErr || !allCategories) {
        console.error('Error fetching categories:', cErr)
        return
    }

    console.warn(`Found ${allCategories.length} categories in DB.\n`)

    // 2. Get all orphan products (missing either category or subcategory)
    const { data: products, error: pErr } = await supabase
        .from('products')
        .select('id, name, category_id, subcategory_id')

    if (pErr || !products) {
        console.error('Error fetching products:', pErr)
        return
    }

    // Only process products that are missing either main or sub category
    const orphanProducts = products.filter(p => !p.category_id || !p.subcategory_id)
    console.warn(`Found ${orphanProducts.length} orphan products matching criteria.\n`)

    // 3. For each rule, find matching products and update
    let totalUpdated = 0

    for (const rule of RULES) {
        // Find which DB category this rule refers to
        const catNode = allCategories.find(c => c.slug === rule.slug)
        if (!catNode) {
            console.warn(`Category slug not found in DB: ${rule.slug}`)
            continue
        }

        // Determine correct main and sub category logic for Enterprise Architecture
        const matchedMainCategory = catNode.parent_id ? catNode.parent_id : catNode.id
        const matchedSubCategory = catNode.parent_id ? catNode.id : null

        // Find orphan products matching any keyword for this rule
        const matchingProducts = orphanProducts.filter(p => {
            const nameUpper = p.name.toUpperCase()
            const matchesKeyword = rule.keywords.some(kw => nameUpper.includes(kw.toUpperCase()))
            const excludedByKeyword = rule.excludeKeywords?.some(kw => nameUpper.includes(kw.toUpperCase()))
            
            // Allow update if matched and either ID doesn't currently equal our target
            return matchesKeyword && !excludedByKeyword && (p.category_id !== matchedMainCategory || p.subcategory_id !== matchedSubCategory)
        })

        if (matchingProducts.length === 0) {
            console.warn(`[${catNode.name}]: No new matches`)
            continue
        }

        console.warn(`[${catNode.name}]: Found ${matchingProducts.length} orphan matches. Fixing...`)

        // Update in batches
        for (const prod of matchingProducts) {
            const { error: uErr } = await supabase
                .from('products')
                .update({ 
                    category_id: matchedMainCategory, 
                    subcategory_id: matchedSubCategory 
                })
                .eq('id', prod.id)

            if (uErr) {
                console.error(`  Failed to update ${prod.name}: ${uErr.message}`)
            } else {
                totalUpdated++
                // Remove from orphan pool to prevent multi-matching logic
                const idx = orphanProducts.findIndex(o => o.id === prod.id)
                if (idx !== -1) orphanProducts.splice(idx, 1)
            }
        }
    }

    console.warn(`\n=== Distribution Complete. Total strictly mapped: ${totalUpdated} ===`)
    
    if (orphanProducts.length > 0) {
        console.warn(`\nNote: There are still ${orphanProducts.length} leftover products that did not match any of the strict keywords.`)
    }
}

distribute()
