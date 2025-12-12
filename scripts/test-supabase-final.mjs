// GERČEK TEST - Supabase bağlantısı çalışıyor mu?
import { createClient } from '@supabase/supabase-js'

// Credentials (run-direct-migration.ts'den)
const supabaseUrl = 'https://tnofewwkwlyjsqgwjjga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzU4MDAsImV4cCI6MjA0Nzg1MTgwMH0.VUh-XqXqWO08U4Zxr5FjzElJc5eJtjGPqr7m11vvAUc'

console.log('🚀 GERÇEK TEST BAŞLIYOR...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test1() {
    console.log('📁 TEST 1: Kategori sayısı...')
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .limit(3)

        if (error) {
            console.error('  ❌ HATA:', error.message)
            console.error('  Detay:', JSON.stringify(error, null, 2))
            return false
        }

        console.log(`  ✅ BAŞARILI: ${data.length} kategori bulundu`)
        if (data.length > 0) {
            console.log(`  Örnek: "${data[0].name}"`)
        }
        console.log('')
        return true
    } catch (err) {
        console.error('  ❌ İSTİSNA:', err.message)
        return false
    }
}

async function test2() {
    console.log('📦 TEST 2: Ürün sayısı...')
    try {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('  ❌ HATA:', error.message)
            return false
        }

        console.log(`  ✅ BAŞARILI: ${count} ürün bulundu\n`)
        return true
    } catch (err) {
        console.error('  ❌ İSTİSNA:', err.message)
        return false
    }
}

async function test3() {
    console.log('🛍️  TEST 3: İlk 3 ürünü getir...')
    try {
        const { data, error } = await supabase
            .from('products')
            .select('name, brand, price')
            .limit(3)

        if (error) {
            console.error('  ❌ HATA:', error.message)
            return false
        }

        console.log(`  ✅ BAŞARILI: ${data.length} ürün:`)
        data.forEach((p, i) => {
            console.log(`    ${i + 1}. ${p.name} (${p.brand}) - ${p.price} TL`)
        })
        console.log('')
        return true
    } catch (err) {
        console.error('  ❌ İSTİSNA:', err.message)
        return false
    }
}

async function runAll() {
    const r1 = await test1()
    const r2 = await test2()
    const r3 = await test3()

    console.log('━'.repeat(50))
    console.log('📊 SONUÇLAR:')
    console.log(`  Kategori testi: ${r1 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.log(`  Ürün sayısı: ${r2 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.log(`  Ürün listesi: ${r3 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.log('━'.repeat(50))

    if (r1 && r2 && r3) {
        console.log('\n🎉 TÜM TESTLER BAŞARILI!')
        console.log('✅ Supabase client %100 çalışıyor!\n')
    } else {
        console.log('\n❌ BAZI TESTLER BAŞARISIZ')
        console.log('Supabase client sorunlu olabilir.\n')
    }
}

runAll()
