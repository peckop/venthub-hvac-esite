// GERČEK TEST - Supabase bağlantısı çalışıyor mu?
import { createClient } from '@supabase/supabase-js'

// Credentials (run-direct-migration.ts'den)
const supabaseUrl = 'https://tnofewwkwlyjsqgwjjga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzU4MDAsImV4cCI6MjA0Nzg1MTgwMH0.VUh-XqXqWO08U4Zxr5FjzElJc5eJtjGPqr7m11vvAUc'

console.warn('🚀 GERÇEK TEST BAŞLIYOR...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test1() {
    console.warn('📁 TEST 1: Kategori sayısı...')
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

        console.warn(`  ✅ BAŞARILI: ${data.length} kategori bulundu`)
        if (data.length > 0) {
            console.warn(`  Örnek: "${data[0].name}"`)
        }
        console.warn('')
        return true
    } catch (err) {
        console.error('  ❌ İSTİSNA:', err.message)
        return false
    }
}

async function test2() {
    console.warn('📦 TEST 2: Ürün sayısı...')
    try {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('  ❌ HATA:', error.message)
            return false
        }

        console.warn(`  ✅ BAŞARILI: ${count} ürün bulundu\n`)
        return true
    } catch (err) {
        console.error('  ❌ İSTİSNA:', err.message)
        return false
    }
}

async function test3() {
    console.warn('🛍️  TEST 3: İlk 3 ürünü getir...')
    try {
        const { data, error } = await supabase
            .from('products')
            .select('name, brand, price')
            .limit(3)

        if (error) {
            console.error('  ❌ HATA:', error.message)
            return false
        }

        console.warn(`  ✅ BAŞARILI: ${data.length} ürün:`)
        data.forEach((p, i) => {
            console.warn(`    ${i + 1}. ${p.name} (${p.brand}) - ${p.price} TL`)
        })
        console.warn('')
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

    console.warn('━'.repeat(50))
    console.warn('📊 SONUÇLAR:')
    console.warn(`  Kategori testi: ${r1 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.warn(`  Ürün sayısı: ${r2 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.warn(`  Ürün listesi: ${r3 ? '✅ GEÇTI' : '❌ BAŞARISIZ'}`)
    console.warn('━'.repeat(50))

    if (r1 && r2 && r3) {
        console.warn('\n🎉 TÜM TESTLER BAŞARILI!')
        console.warn('✅ Supabase client %100 çalışıyor!\n')
    } else {
        console.warn('\n❌ BAZI TESTLER BAŞARISIZ')
        console.warn('Supabase client sorunlu olabilir.\n')
    }
}

runAll()
