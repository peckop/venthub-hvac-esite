import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    try {
        await client.connect()
        console.log('Applying SELECT policy to products...')
        await client.query(`
            DROP POLICY IF EXISTS "prod_public_read_opt" ON public.products;
            CREATE POLICY "prod_public_read_opt" ON public.products
                FOR SELECT TO public
                USING (true);
        `)
        console.log('SELECT Policy applied successfully!')
    } catch (e: any) {
        console.error('Failed:', e?.message || e)
    } finally {
        await client.end()
    }
}
run()
