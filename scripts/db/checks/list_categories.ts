import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) { process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey)

async function listCategories() {
    console.warn('📋 Listing all categories...')
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, level, parent_id, is_active')
        .order('level', { ascending: true })
        .order('name', { ascending: true })

    if (error) {
        console.error(error)
        return
    }

    if (data) {
        console.warn(JSON.stringify(data, null, 2))
    }
}

listCategories()
