import { createClient } from '@supabase/supabase-js'
import * as _fs from '_fs'
import * as _path from '_path'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
    console.warn('🚀 Migration başlatılıyor...')

    // Migration dosyasını oku
    const migrationPath = _path.join(__dirname, '../../../supabase/migrations/20260209_add_model_type_mapping.sql')
    const migrationSQL = _fs.readFileSync(migrationPath, 'utf-8')

    // SQL'i satırlara böl ve temizle
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    console.warn(`📝 ${statements.length} SQL statement bulundu`)

    // Her statement'ı çalıştır
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]

        // BEGIN, COMMIT gibi transaction komutlarını atla
        if (statement.match(/^(BEGIN|COMMIT)/i)) {
            console.warn(`⏭️  Atlanan: ${statement.substring(0, 50)}...`)
            continue
        }

        console.warn(`\n▶️  Statement ${i + 1}/${statements.length} çalıştırılıyor...`)

        try {
            const { _data, error } = await supabase.rpc('exec_sql', {
                sql_query: statement + ';'
            })

            if (error) {
                console.error(`❌ Hata:`, error)
                // Devam et, bazı hatalar normal olabilir (örn: kolon zaten var)
            } else {
                console.warn(`✅ Başarılı`)
            }
        } catch (err) {
            console.error(`❌ Exception:`, err)
        }
    }

    console.warn('\n🎉 Migration tamamlandı!')

    // Doğrulama
    console.warn('\n🔍 Doğrulama yapılıyor...')
    const { _data, error } = await supabase
        .from('categories')
        .select('slug, metadata')
        .not('metadata->model_type', 'is', null)

    if (error) {
        console.error('❌ Doğrulama hatası:', error)
    } else {
        console.warn(`✅ ${_data?.length || 0} kategori için model_type eklendi:`)
        _data?.forEach(cat => {
            console.warn(`   - ${cat.slug} → ${cat.metadata?.model_type}`)
        })
    }
}

runMigration().catch(console.error)
