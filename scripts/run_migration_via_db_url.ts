import pg from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

// Use provided pooler format from .env or fallback to provided working string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

console.log('🚀 Using Pooler Connection to connect...')

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    console.log('🔌 Connecting to database...')
    try {
        await client.connect()
        console.log('✅ Connected successfully!')

        const migrationFile = 'supabase/migrations/20251218_wizard_selections.sql'
        const sqlPath = path.join(process.cwd(), migrationFile)

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found: ${migrationFile}`)
        }

        const sql = fs.readFileSync(sqlPath, 'utf8')
        console.log(`📝 Executing migration: ${migrationFile}...`)

        client.on('notice', (msg: any) => {
            console.log('NOTICE:', msg.message)
        })

        await client.query(sql)
        console.log('\n🎉 Migration executed successfully!')

    } catch (e: any) {
        console.error('❌ Error during migration:', e?.message || e)
    } finally {
        await client.end()
    }
}

run()
