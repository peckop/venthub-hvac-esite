import pg from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    try {
        console.log('Connecting...')
        await client.connect()
        console.log('Connected.')

        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20251215_distribute_products.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Executing migration...')
        // Capture notices
        client.on('notice', (msg: any) => console.log('NOTICE:', msg.message))

        await client.query(sql)
        console.log('Migration executed successfully.')

    } catch (e: any) {
        console.error('Migration failed:', e?.message || e)
    } finally {
        await client.end()
    }
}
run()
