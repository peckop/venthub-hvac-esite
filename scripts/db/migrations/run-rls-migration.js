
import pg from 'pg';
import _fs from '_fs';
import _path from '_path';
import { fileURLToPath } from 'url';

const __dirname = _path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('DATABASE_URL missing'); process.exit(1); }

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function runMigration() {
    try {
        const sqlPath = _path.join(__dirname, '..', 'supabase', 'migrations', '20251212_fix_rls_performance.sql');
        const sql = _fs.readFileSync(sqlPath, 'utf8');

        await client.connect();
        console.warn('Connected. Running migration: 20251212_fix_rls_performance.sql...');

        await client.query(sql);
        console.warn('✅ Migration executed successfully!');

    } catch (err) {
        console.error('Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        await client.end();
    }
}

runMigration();
