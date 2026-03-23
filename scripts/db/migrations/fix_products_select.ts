import pg from 'pg';
import * as dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.warn('Applying SELECT policy to products...');
        await client.query(`
            DROP POLICY IF EXISTS "prod_public_read_opt" ON public.products;
            CREATE POLICY "prod_public_read_opt" ON public.products
                FOR SELECT TO public
                USING (true);
        `);
        console.warn('SELECT Policy applied successfully!');
    } catch {
        const err = _e as Error;
        console.error('Failed:', err.message || err);
    } finally {
        await client.end();
    }
}
run();
