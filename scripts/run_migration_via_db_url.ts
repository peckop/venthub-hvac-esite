
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Client } = pg

// Parse .env
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/\r/g, '')
    }
}

const DATABASE_URL = env.DATABASE_URL

if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in .env')
    process.exit(1)
}

console.log('Using DATABASE_URL to connect...')

const client = new Client({ connectionString: DATABASE_URL })

async function run() {
    try {
        await client.connect()
        console.log('Connected successfully!')

        // Read the migration SQL
        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20251215_distribute_products_v2.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Executing migration...')

        // Capture NOTICE messages
        client.on('notice', (msg) => {
            console.log('NOTICE:', msg.message)
        })

        await client.query(sql)

        console.log('\n✅ Migration executed successfully!')

    } catch (e) {
        console.error('Error:', e)
    } finally {
        await client.end()
    }
}

run()
