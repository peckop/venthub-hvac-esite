import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function check() {
    try {
        console.log('Connecting...')
        await client.connect()
        console.log('Connected.\n')

        // Check is_active values
        const result = await client.query(`
            SELECT name, slug, is_active, 
                   CASE WHEN is_active IS NULL THEN 'NULL' 
                        WHEN is_active = true THEN 'TRUE' 
                        ELSE 'FALSE' END as status
            FROM categories
            ORDER BY is_active NULLS FIRST, name;
        `)
        console.log('=== KATEGORİ is_active DURUMU ===')
        console.log(JSON.stringify(result.rows, null, 2))

        // Count by status
        const countResult = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE is_active IS NULL) as null_count,
                COUNT(*) FILTER (WHERE is_active = true) as true_count,
                COUNT(*) FILTER (WHERE is_active = false) as false_count
            FROM categories;
        `)
        console.log('\n=== ÖZET ===')
        console.log(JSON.stringify(countResult.rows[0], null, 2))

    } catch (e: any) {
        console.error('Error:', e?.message || e)
    } finally {
        await client.end()
    }
}
check()
