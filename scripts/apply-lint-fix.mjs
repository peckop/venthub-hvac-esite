import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Kullanıcının sağladığı çalışan Pooler dizesi
const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function runMigration() {
    console.log('🚀 Applying RLS Performance Lint Fix Migration...');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database.');

        // Migration SQL dosyasını oku
        const sql = fs.readFileSync('supabase/migrations/20251222_restore_rls_policies.sql', 'utf8');

        // SQL'i çalıştır
        const result = await client.query(sql);
        console.log('✅ Migration completed successfully!');
        console.log('Result:', result);

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('Details:', err);
    } finally {
        await client.end();
    }
}

runMigration();
