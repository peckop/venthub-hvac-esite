
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('DATABASE_URL missing'); process.exit(1); }

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251212_fix_rls_performance.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.connect();
        console.log('Connected. Running migration: 20251212_fix_rls_performance.sql...');

        await client.query(sql);
        console.log('✅ Migration executed successfully!');

    } catch (err) {
        console.error('Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        await client.end();
    }
}

runMigration();
