
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Client } = pg
const connectionString = 'postgresql://postgres:***REMOVED***@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres'

const client = new Client({ connectionString })

async function run() {
    try {
        console.log('Connecting to Supabase (Postgres)...')
        await client.connect()
        console.log('Connected.')

        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20251218_wizard_selections.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Executing migration [wizard_selections]...')
        await client.query(sql)
        console.log('Migration executed successfully.')

    } catch (e) {
        console.error('Migration failed:', e)
    } finally {
        await client.end()
    }
}
run()
