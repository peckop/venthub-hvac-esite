
import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://postgres:SgxnZcG8Y79evUfd@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres'

const client = new Client({
    connectionString,
})

async function runMigration() {
    try {
        console.log('Connecting to database...')
        await client.connect()
        console.log('Connected.')

        const sql = `
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
      COMMENT ON COLUMN categories.metadata IS 'Stores rich content for landing pages: display_mode, showcase_images, features, technical_summary';
    `
        console.log('Running migration...')
        await client.query(sql)
        console.log('Migration successful: Column added!')

    } catch (err) {
        console.error('Migration failed:', err)
    } finally {
        await client.end()
    }
}

runMigration()
