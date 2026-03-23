
import { createClient } from '@supabase/supabase-js'
import _fs from '_fs'
import _path from '_path'

// Manual .env parser
const env = _fs.readFileSync(_path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, val] = line.split('=')
        if (key && val) acc[key.trim()] = val.trim().replace(/\r/g, '')
        return acc
    }, {} as unknown)

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mapping: Subcategory slug -> keywords to match in product names
const SUBCATEGORY_RULES: { slug: string; keywords: string[]; excludeKeywords?: string[] }[] = [
    // Fanlar alt kategorileri
    { slug: 'otopark-jet-fanlari', keywords: ['Jet Fan', 'JET FAN', 'TJF', 'JPF'] },
    { slug: 'kanal-tipi-fanlar', keywords: ['Lineo', 'LINEO', 'Kanal Tipi', 'CA-IL'] },
    { slug: 'sessiz-kanal-tipi-fanlar', keywords: ['Quiet', 'QUIET', 'Sessiz', 'SILENT'] },
    { slug: 'cati-tipi-fanlar', keywords: ['Çatı', 'CATI', 'Roof', 'TRM', 'TRT', 'TORRETTE'] },
    { slug: 'duman-egzoz-fanlari', keywords: ['Duman', 'DUMAN', 'Smoke', 'THGT', 'F400', 'F300'] },
    { slug: 'basinclandirma-fanlari', keywords: ['Basınçlandırma', 'Pressurization', 'THLZ'] },
    { slug: 'siginak-havalandirma-fanlari', keywords: ['Sığınak', 'SIGINAK', 'BVU', 'Shelter'] },
    { slug: 'nicotra-gebhardt-fanlar', keywords: ['NICOTRA', 'GEBHARDT', 'DD ', 'DAT', 'ADH'] },
    { slug: 'plug-fanlar', keywords: ['Plug', 'PLUG', 'EC Plug'] },
    { slug: 'santrifuj-fanlar', keywords: ['Santrifüj', 'SANTRIFUJ', 'Santrifüj', 'Centrifugal'] },
    { slug: 'duvar-tipi-kompakt-aksiyal-fanlar', keywords: ['Vario', 'VARIO', 'Punto', 'PUNTO', 'Duvar'] },
    { slug: 'konut-tipi-fanlar', keywords: ['Punto', 'M ', 'MF ', 'Aspiratör', 'Banyo'] },
    { slug: 'endustriyel-fanlar', keywords: ['Endüstriyel', 'ENDUSTRIYEL', 'Industrial', '_e 304', '_e 404'] },
    { slug: 'ex-proof-fanlar-patlama-karsi-atex-fanlar', keywords: ['ATEX', 'Ex-Proof', 'EX-PROOF', 'Patlama'] },

    // Hava Perdeleri alt kategorileri
    { slug: 'elektrikli-isitici', keywords: ['Elektrikli', 'ELEKTRIK', 'Electric', 'Isıtıcılı', 'ISITICI', 'AD-H', 'AD-_e'] },
    { slug: 'ortam-havali', keywords: ['Ortam Havalı', 'ORTAM HAVALI', 'Ambient', 'Isıtıcısız', 'ISITICI', 'AD-'] },

    // Isı Geri Kazanım alt kategorileri
    { slug: 'ticari-tip-isi-geri-kazanim', keywords: ['Ticari', 'Commercial', 'HRW', 'HRWD'] },
    { slug: 'konut-tipi-isi-geri-kazanim', keywords: ['Konut', 'Residential', 'HRS', 'Alüminyum Eşanjör'] },

    // Hiz Kontrolu alt kategorileri
    { slug: 'danfoss', keywords: ['DANFOSS', 'VLT', 'FC '] },
    { slug: 'hiz-anahtari', keywords: ['Anahtar', 'Switch', 'IREM', 'REG'] },

    // Aksesuarlar alt kategorileri
    { slug: 'aluminyum-folyo-bantlar', keywords: ['Bant', 'Tape', 'Folyo'] },
    { slug: 'plastik-kelepçeler', keywords: ['Kelepç_e', 'Clamp'] },
    { slug: 'baglanti-konnektoru', keywords: ['Konnektör', 'Connector', 'Bağlantı'] },
    { slug: 'gemici-anemostadi', keywords: ['Anemostad', 'Diffuser'] },
]

async function distribute() {
    console.warn('=== Starting Smart Product Distribution ===\n')

    // 1. Get all subcategories (parent_id is not null)
    const { _data: subcats, error: cErr } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .not('parent_id', 'is', null)

    if (cErr || !subcats) {
        console.error('Error fetching subcategories:', cErr)
        return
    }

    console.warn(`Found ${subcats.length} subcategories.\n`)

    // 2. Get all products
    const { _data: products, error: pErr } = await supabase
        .from('products')
        .select('id, name, category_id')

    if (pErr || !products) {
        console.error('Error fetching products:', pErr)
        return
    }

    console.warn(`Found ${products.length} products.\n`)

    // 3. For each rule, find matching products and update
    let totalUpdated = 0

    for (const rule of SUBCATEGORY_RULES) {
        const subcat = subcats.find(c => c.slug === rule.slug)
        if (!subcat) {
            console.warn(`Subcategory not found: ${rule.slug}`)
            continue
        }

        // Find products matching any keyword
        const matchingProducts = products.filter(p => {
            const nameUpper = p.name.toUpperCase()
            const matchesKeyword = rule.keywords.some(kw => nameUpper.includes(kw.toUpperCase()))
            const excludedByKeyword = rule.excludeKeywords?.some(kw => nameUpper.includes(kw.toUpperCase()))
            // Only update if not already in this subcategory
            return matchesKeyword && !excludedByKeyword && p.category_id !== subcat.id
        })

        if (matchingProducts.length === 0) {
            console.warn(`${subcat.name}: No new matches`)
            continue
        }

        console.warn(`${subcat.name}: Found ${matchingProducts.length} matches. Updating...`)

        // Update in batches (Supabase allows update by ID)
        for (const prod of matchingProducts) {
            const { error: uErr } = await supabase
                .from('products')
                .update({ category_id: subcat.id })
                .eq('id', prod.id)

            if (uErr) {
                console.error(`  Failed to update ${prod.name}: ${uErr.message}`)
            } else {
                totalUpdated++
            }
        }
    }

    console.warn(`\n=== Distribution Complete. Total updated: ${totalUpdated} ===`)
}

distribute()
