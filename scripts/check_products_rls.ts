import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')
const fs = require('fs')

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    try {
        await client.connect()
        const res = await client.query(`
            SELECT policyname, permissive, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename = 'products';
        `)
        fs.writeFileSync('products_rls.json', JSON.stringify(res.rows, null, 2), 'utf8')
    } catch (e: any) {
        console.error('Failed:', e?.message || e)
    } finally {
        await client.end()
    }
}
run()
