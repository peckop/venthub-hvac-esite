
import { createClient } from '@supabase/supabase-js'

import * as dotenv from 'dotenv';
dotenv.config();

// Load credentials dynamically from environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co';
// Using SERVICE_ROLE_KEY to bypass RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '[SERVICE_ROLE_KEY]';

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCategory() {
    console.warn('--- FIX START ---')

    // 1. Find the category
    console.warn('Searching for "endustriyel-fanlar"...')
    const { _data: cat, error: findError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'endustriyel-fanlar')
        .single()

    if (findError) {
        console.error('Error finding category:', findError)
        // Try finding by name just in case
        const { _data: catByName } = await supabase.from('categories').select('*').ilike('name', '%Exproof%').single()
        if (catByName) console.warn('Found by name "Exproof":', catByName)
        return
    }

    if (!cat) {
        console.error('Category not found!')
        return
    }

    console.warn('Current Category:', { id: cat.id, name: cat.name, slug: cat.slug, metadata: cat.metadata })

    // 2. Prepare updates
    const updates: unknown = {
        name: 'Exproof Fanlar', // FORCE THIS NAME
    }

    // Ensure metadata has proper display mode and model type
    const currentMeta = cat.metadata || {}
    const newMeta = {
        ...currentMeta,
        model_type: 'ExproofFanModel', // Bind to new 3D model
        hero_title: 'Exproof Fanlar',
        display_mode: 'showcase'
    }
    updates.metadata = newMeta

    // 3. Update
    console.warn('Applying updates:', updates)
    const { _data: updated, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', cat.id)
        .select()
        .single()

    if (updateError) {
        console.error('Update failed:', updateError)
    } else {
        console.warn('Update SUCCESS:', updated)
    }

    console.warn('--- FIX END ---')
}

fixCategory().catch(console.error)
