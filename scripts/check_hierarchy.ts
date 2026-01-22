
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) process.exit(1)

const supabase = createClient(supabaseUrl, supabaseKey)

// Clear file
fs.writeFileSync('hierarchy_report.log', '', 'utf8')

function log(msg: string) {
    console.log(msg)
    fs.appendFileSync('hierarchy_report.log', msg + '\n', 'utf8')
}

async function checkHierarchy() {
    log('🔍 Checking Category Hierarchy...')

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
    //.eq('is_active', true) // Fetch ALL to see if inactive

    if (error) {
        log(JSON.stringify(error))
        return
    }

    const mains = categories.filter(c => c.level === 0)
    const subs = categories.filter(c => c.level === 1)

    log(`\n📊 Stats: ${mains.length} Main Categories, ${subs.length} Subcategories`)

    mains.forEach(main => {
        const children = subs.filter(s => s.parent_id === main.id)
        log(`\n📂 [${main.name}] (${main.slug}) - ID: ${main.id} (Active: ${main.is_active})`)
        if (children.length === 0) {
            log('   ⚠️  NO SUBCATEGORIES FOUND')
        } else {
            children.forEach(child => {
                log(`   └── [${child.name}] (${child.slug}) (Active: ${child.is_active})`)
            })
        }
    })

    // Check orphans & misaligned parents
    const mainIds = mains.map(m => m.id)
    const orphans = subs.filter(s => !mainIds.includes(s.parent_id))

    if (orphans.length > 0) {
        log('\n👻 ORPHAN SUBCATEGORIES (Parent ID not found in Main List):')
        orphans.forEach(o => {
            log(`   └── [${o.name}] (ParentID: ${o.parent_id})`)
            const parent = categories.find(c => c.id === o.parent_id)
            if (parent) {
                log(`       -> Parent found but it is: [${parent.name}] (Level: ${parent.level}, Active: ${parent.is_active})`)
            } else {
                log(`       -> Parent ID ${o.parent_id} DOES NOT EXIST in DB`)
            }
        })
    } else {
        log('\n✅ No orphan subcategories found.')
    }
}

checkHierarchy()
