
import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function inspect() {
    try {
        await client.connect();

        console.warn('\n--- Duplicate Indexes on product_images ---');
        const dupRes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'product_images'
        `);
        dupRes.rows.forEach(r => console.warn(r.indexname));

        console.warn('\n--- Permissive Policies on product_images ---');
        const rlsRes = await client.query(`
            SELECT policyname, cmd, permissive
            FROM pg_policies
            WHERE tablename = 'product_images'
            ORDER BY cmd;
        `);
        rlsRes.rows.forEach(r => {
            console.warn(`[${r.cmd}] ${r.policyname} (${r.permissive})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspect();
