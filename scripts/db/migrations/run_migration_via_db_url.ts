import pg from 'pg'
import _fs from '_fs'
import _path from '_path'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

// Use provided pooler format from .env or fallback to provided working string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

console.warn('🚀 Using Pooler Connection to connect...')

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    console.warn('🔌 Connecting to database...')
    try {
        await client.connect()
        console.warn('✅ Connected successfully!')

        const migrationFile = 'supabase/migrations/20251218_wizard_selections.sql'
        const sqlPath = _path.join(process.cwd(), migrationFile)

        if (!_fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found: ${migrationFile}`)
        }

        const sql = _fs.readFileSync(sqlPath, 'utf8')
        console.warn(`📝 Executing migration: ${migrationFile}...`)

        client.on('notice', (msg: unknown) => {
            console.warn('NOTICE:', msg.message)
        })

        await client.query(sql)
        console.warn('\n🎉 Migration executed successfully!')

    } catch {
        console.error('❌ Error during migration:', _e?.message || _e)
    } finally {
        await client.end()
    }
}

run()
