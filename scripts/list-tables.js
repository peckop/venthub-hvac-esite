
import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('DATABASE_URL missing'); process.exit(1); }

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function listTables() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
        `);
        console.log('=== PUBLIC TABLES ===');
        res.rows.forEach(r => console.log(r.tablename));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listTables();
