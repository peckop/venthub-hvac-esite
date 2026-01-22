
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Proje rootundaki .env dosyasını yüklemeye çalış
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCategoryName() {
    console.log('🔄 Updating category name to "Frekans Konvertörü"...')

    const { data, error } = await supabase
        .from('categories')
        .update({
            name: 'Frekans Konvertörü',
            slug: 'frekans-konvertoru',
            description: 'Yüksek verimli hız kontrolü ve motor sürücü teknolojileri'
        })
        .in('slug', ['danfoss', 'frekans-konvertorler', 'frekans-konvertorleri', 'vlt'])
        .select()

    if (error) {
        console.error('❌ Update failed:', error.message)
        return
    }

    if (data && data.length > 0) {
        console.log('✅ Success! Updated categories:', data.map(c => c.name).join(', '))
    } else {
        console.log('⚠️ No categories found with slug "danfoss" or variants. Maybe already updated?')

        // Check if it exists with the new name
        const { data: check } = await supabase.from('categories').select('*').eq('slug', 'frekans-konvertoru')
        if (check && check.length > 0) {
            console.log('ℹ️ Category already exists as:', check[0].name)
        }
    }
}

fixCategoryName()
