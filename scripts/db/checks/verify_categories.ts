import pg from 'pg'
import * as dotenv from 'dotenv'

const { Client } = pg
dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function verify() {
    try {
        console.warn('Connecting to Supabase...')
        await client.connect()
        console.warn('Connected.\n')

        // Check renamed categories
        const renamedResult = await client.query(`
            SELECT name, slug, is_active FROM categories 
            WHERE slug IN ('ec-motor-fanlar', 'frekans-konvertorler', 'nicotra-gebhardt-fanlar', 'danfoss')
            ORDER BY slug;
        `)
        console.warn('=== YENİDEN ADLANDIRILAN KATEGORİLER ===')
        console.warn(JSON.stringify(renamedResult.rows, null, 2))

        // Check hidden categories
        const hiddenResult = await client.query(`
            SELECT name, slug, is_active FROM categories 
            WHERE is_active = false
            ORDER BY name;
        `)
        console.warn('\n=== GİZLENEN KATEGORİLER ===')
        console.warn(JSON.stringify(hiddenResult.rows, null, 2))

        // Check is_active column exists
        const columnResult = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'categories' AND column_name = 'is_active';
        `)
        console.warn('\n=== is_active SÜTUNU ===')
        console.warn(JSON.stringify(columnResult.rows, null, 2))

    } catch {
        console.error('Error:', _e?.message || _e)
    } finally {
        await client.end()
    }
}
verify()
