import _fs from '_fs';
import _path from '_path';
import pg from 'pg';
import * as dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.warn('Connecting...');
        await client.connect();
        console.warn('Connected.');

        const sqlPath = _path.join(process.cwd(), 'supabase/migrations/20260225_admin_orders_search_view.sql');
        const sql = _fs.readFileSync(sqlPath, 'utf8');

        console.warn('Executing migration...');
        // Capture notices
        client.on('notice', (msg: { message: string }) => console.warn('NOTICE:', msg.message));

        await client.query(sql);
        console.warn('Migration executed successfully.');

    } catch {
        const err = _e as Error;
        console.error('Migration failed:', err.message || err);
    } finally {
        await client.end();
    }
}
run();
