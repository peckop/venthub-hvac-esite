// Supabase client gerçek test
// Supabase JS client kullanarak kategori sayısını getir

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// .env dosyasını yükle
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Credentials Check:')
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing')
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Supabase credentials missing in .env file')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRealQuery() {
    console.log('🧪 TEST 1: Counting categories...')
    try {
        const { data, error, count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: false })

        if (error) {
            console.error('❌ FAILED:', error.message)
            console.error('Details:', error)
            return false
        }

        console.log(`✅ SUCCESS: Found ${data.length} categories`)
        console.log('Sample:', data[0]?.name || 'No data')
        console.log('')
        return true
    } catch (err) {
        console.error('❌ EXCEPTION:', err)
        return false
    }
}

async function testProductCount() {
    console.log('🧪 TEST 2: Counting products...')
    try {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('❌ FAILED:', error.message)
            return false
        }

        console.log(`✅ SUCCESS: Found ${count} products`)
        console.log('')
        return true
    } catch (err) {
        console.error('❌ EXCEPTION:', err)
        return false
    }
}

async function runAllTests() {
    console.log('🚀 Starting Supabase Client Tests...\n')

    const test1 = await testRealQuery()
    const test2 = await testProductCount()

    console.log('📊 RESULTS:')
    console.log(`Test 1 (Categories): ${test1 ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Test 2 (Products): ${test2 ? '✅ PASS' : '❌ FAIL'}`)

    if (test1 && test2) {
        console.log('\n🎉 ALL TESTS PASSED! Supabase client is fully functional!')
    } else {
        console.log('\n❌ SOME TESTS FAILED! Client has issues.')
    }
}

runAllTests()
