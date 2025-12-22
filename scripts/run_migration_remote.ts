
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Client } = pg
const connectionString = 'postgresql://postgres:SgxnZcG8Y79evUfd@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres'

const client = new Client({ connectionString })

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
