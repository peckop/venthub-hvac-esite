
import pg from 'pg';
const { Client } = pg;

// Kullanıcının sağladığı çalışan Pooler dizesi
const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function test() {
    console.warn('Testing direct connection to postgres database...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.warn('✅ Success! Connected to postgres database.');
        const res = await client.query('SELECT current_database();');
        console.warn('Current Database:', res.rows[0].current_database);
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}
test();
