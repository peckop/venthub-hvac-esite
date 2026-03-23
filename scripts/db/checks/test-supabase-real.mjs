// Supabase client gerçek test
// Supabase JS client kullanarak kategori sayısını getir

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// .env dosyasını yükle
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.warn('🔍 Supabase Credentials Check:')
console.warn('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.warn('Anon Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing')
console.warn('')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Supabase credentials missing in .env file')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRealQuery() {
    console.warn('🧪 TEST 1: Counting categories...')
    try {
        const { data, error, count: _count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: false })

        if (error) {
            console.error('❌ FAILED:', error.message)
            console.error('Details:', error)
            return false
        }

        console.warn(`✅ SUCCESS: Found ${data.length} categories`)
        console.warn('Sample:', data[0]?.name || 'No data')
        console.warn('')
        return true
    } catch (err) {
        console.error('❌ EXCEPTION:', err)
        return false
    }
}

async function testProductCount() {
    console.warn('🧪 TEST 2: Counting products...')
    try {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('❌ FAILED:', error.message)
            return false
        }

        console.warn(`✅ SUCCESS: Found ${count} products`)
        console.warn('')
        return true
    } catch (err) {
        console.error('❌ EXCEPTION:', err)
        return false
    }
}

async function runAllTests() {
    console.warn('🚀 Starting Supabase Client Tests...\n')

    const test1 = await testRealQuery()
    const test2 = await testProductCount()

    console.warn('📊 RESULTS:')
    console.warn(`Test 1 (Categories): ${test1 ? '✅ PASS' : '❌ FAIL'}`)
    console.warn(`Test 2 (Products): ${test2 ? '✅ PASS' : '❌ FAIL'}`)

    if (test1 && test2) {
        console.warn('\n🎉 ALL TESTS PASSED! Supabase client is fully functional!')
    } else {
        console.warn('\n❌ SOME TESTS FAILED! Client has issues.')
    }
}

runAllTests()
