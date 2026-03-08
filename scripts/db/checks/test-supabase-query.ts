import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://postgres:SgxnZcG8Y79evUfd@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres'

const client = new Client({
    connectionString,
})

async function testQuery() {
    try {
        console.log('🔌 Connecting to Supabase...')
        await client.connect()
        console.log('✅ Connected successfully!')

        // List all tables in public schema
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `
        console.log('\n📊 Fetching tables...')
        const tablesResult = await client.query(tablesQuery)
        console.log(`\n✅ Found ${tablesResult.rows.length} tables:\n`)
        tablesResult.rows.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.table_name}`)
        })

        // Count products
        console.log('\n📦 Counting products...')
        const countResult = await client.query('SELECT COUNT(*) as total FROM products')
        console.log(`✅ Total products: ${countResult.rows[0].total}`)

        // Count categories
        console.log('\n📁 Counting categories...')
        const catResult = await client.query('SELECT COUNT(*) as total FROM categories')
        console.log(`✅ Total categories: ${catResult.rows[0].total}`)

    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await client.end()
        console.log('\n👋 Disconnected.')
    }
}

testQuery()
