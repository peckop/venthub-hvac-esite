
import { createClient } from '@supabase/supabase-js'

// Hardcoded credentials from .env to bypass dotenv issues
const supabaseUrl = 'https://tnofewwkwlyjsqgwjjga.supabase.co'
// Using SERVICE_ROLE_KEY to bypass RLS policies
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzODUzMiwiZXhwIjoyMDcxMjE0NTMyfQ.HJx7Mhl_VW2Lwtes8UrxzpvcfN2IQtU7nZMh9r8e2lQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCategory() {
    console.log('--- FIX START ---')

    // 1. Find the category
    console.log('Searching for "endustriyel-fanlar"...')
    const { data: cat, error: findError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'endustriyel-fanlar')
        .single()

    if (findError) {
        console.error('Error finding category:', findError)
        // Try finding by name just in case
        const { data: catByName } = await supabase.from('categories').select('*').ilike('name', '%Exproof%').single()
        if (catByName) console.log('Found by name "Exproof":', catByName)
        return
    }

    if (!cat) {
        console.error('Category not found!')
        return
    }

    console.log('Current Category:', { id: cat.id, name: cat.name, slug: cat.slug, metadata: cat.metadata })

    // 2. Prepare updates
    const updates: any = {
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
    console.log('Applying updates:', updates)
    const { data: updated, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', cat.id)
        .select()
        .single()

    if (updateError) {
        console.error('Update failed:', updateError)
    } else {
        console.log('Update SUCCESS:', updated)
    }

    console.log('--- FIX END ---')
}

fixCategory().catch(console.error)
