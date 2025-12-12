// Test Supabase access using existing client
// Run with: node --loader ts-node/esm scripts/test-supabase-simple.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnofewwkwlyjsqgwjjga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzU4MDAsImV4cCI6MjA0Nzg1MTgwMH0.VUh-XqXqWO08U4Zxr5FjzElJc5eJtjGPqr7m11vvAUc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
    console.log('🔌 Testing Supabase connection...\n')

    try {
        // Test 1: Count categories
        console.log('📁 Test 1: Counting categories...')
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })

        if (catError) throw catError
        console.log(`✅ Found ${categories?.length || 0} categories`)

        // Test 2: Count products
        console.log('\n📦 Test 2: Counting products...')
        const { count: productCount, error: prodError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        if (prodError) throw prodError
        console.log(`✅ Found ${productCount} products`)

        // Test 3: Fetch first 3 products
        console.log('\n🛍️  Test 3: Fetching first 3 products...')
        const { data: products, error: fetchError } = await supabase
            .from('products')
            .select('id, name, brand, price')
            .limit(3)

        if (fetchError) throw fetchError
        console.log(`✅ Retrieved ${products.length} products:`)
        products.forEach((p, idx) => {
            console.log(`   ${idx + 1}. ${p.name} (${p.brand}) - ${p.price} TL`)
        })

        console.log('\n🎉 ALL TESTS PASSED! Supabase is fully functional without MCP!')

    } catch (error) {
        console.error('\n❌ Error:', error)
    }
}

testSupabase()
