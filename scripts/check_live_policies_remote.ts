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

async function run() {
    try {
        console.log('Connecting to Supabase to verify RLS Policies...')
        await client.connect()

        const sql = `
            SELECT tablename, policyname, cmd 
            FROM pg_policies 
            WHERE tablename IN ('categories', 'venthub_order_items');
        `
        const res = await client.query(sql)

        console.log('\n=== LIVE RLS POLICIES ON REMOTE DATABASE ===')
        console.table(res.rows)
        console.log('============================================\n')

    } catch (e: any) {
        console.error('Verification failed:', e?.message || e)
    } finally {
        await client.end()
    }
}
run()
