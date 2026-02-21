import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('--- Current RLS Policies on venthub_orders ---');
        const res = await client.query(`
            SELECT schemaname, tablename, policyname, definition 
            FROM pg_policies 
            WHERE tablename LIKE 'venthub_%'
        `);
        console.table(res.rows);
    } catch (e: any) {
        console.error('Check failed:', e.message);
    } finally {
        await client.end();
    }
}
run();
