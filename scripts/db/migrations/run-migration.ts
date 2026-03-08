import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
    console.log('🚀 Migration başlatılıyor...')

    // Migration dosyasını oku
    const migrationPath = path.join(__dirname, '../../../supabase/migrations/20260209_add_model_type_mapping.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // SQL'i satırlara böl ve temizle
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 ${statements.length} SQL statement bulundu`)

    // Her statement'ı çalıştır
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]

        // BEGIN, COMMIT gibi transaction komutlarını atla
        if (statement.match(/^(BEGIN|COMMIT)/i)) {
            console.log(`⏭️  Atlanan: ${statement.substring(0, 50)}...`)
            continue
        }

        console.log(`\n▶️  Statement ${i + 1}/${statements.length} çalıştırılıyor...`)

        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql_query: statement + ';'
            })

            if (error) {
                console.error(`❌ Hata:`, error)
                // Devam et, bazı hatalar normal olabilir (örn: kolon zaten var)
            } else {
                console.log(`✅ Başarılı`)
            }
        } catch (err) {
            console.error(`❌ Exception:`, err)
        }
    }

    console.log('\n🎉 Migration tamamlandı!')

    // Doğrulama
    console.log('\n🔍 Doğrulama yapılıyor...')
    const { data, error } = await supabase
        .from('categories')
        .select('slug, metadata')
        .not('metadata->model_type', 'is', null)

    if (error) {
        console.error('❌ Doğrulama hatası:', error)
    } else {
        console.log(`✅ ${data?.length || 0} kategori için model_type eklendi:`)
        data?.forEach(cat => {
            console.log(`   - ${cat.slug} → ${cat.metadata?.model_type}`)
        })
    }
}

runMigration().catch(console.error)
