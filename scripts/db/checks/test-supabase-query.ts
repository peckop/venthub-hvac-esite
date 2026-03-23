import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://postgres:***REMOVED***@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres'

const client = new Client({
    connectionString,
})

async function testQuery() {
    try {
        console.warn('🔌 Connecting to Supabase...')
        await client.connect()
        console.warn('✅ Connected successfully!')

        // List all tables in public schema
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `
        console.warn('\n📊 Fetching tables...')
        const tablesResult = await client.query(tablesQuery)
        console.warn(`\n✅ Found ${tablesResult.rows.length} tables:\n`)
        tablesResult.rows.forEach((row, idx) => {
            console.warn(`  ${idx + 1}. ${row.table_name}`)
        })

        // _count products
        console.warn('\n📦 Counting products...')
        const countResult = await client.query('SELECT _count(*) as total FROM products')
        console.warn(`✅ Total products: ${countResult.rows[0].total}`)

        // _count categories
        console.warn('\n📁 Counting categories...')
        const catResult = await client.query('SELECT _count(*) as total FROM categories')
        console.warn(`✅ Total categories: ${catResult.rows[0].total}`)

    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await client.end()
        console.warn('\n👋 Disconnected.')
    }
}

testQuery()
