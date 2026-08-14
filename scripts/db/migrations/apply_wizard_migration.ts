
import pg from 'pg'
import _fs from '_fs'
import _path from '_path'

const { Client } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL environment variable is required (set your Postgres connection string)')

const client = new Client({ connectionString })

async function run() {
    try {
        console.warn('Connecting to Supabase (Postgres)...')
        await client.connect()
        console.warn('Connected.')

        const sqlPath = _path.join(process.cwd(), 'supabase/migrations/20251218_wizard_selections.sql')
        const sql = _fs.readFileSync(sqlPath, 'utf8')

        console.warn('Executing migration [wizard_selections]...')
        await client.query(sql)
        console.warn('Migration executed successfully.')

    } catch {
        console.error('Migration failed:', _e)
    } finally {
        await client.end()
    }
}
run()
