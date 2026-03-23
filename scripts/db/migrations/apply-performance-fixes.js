
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

async function applyFixes() {
    try {
        await client.connect();
        console.warn('Connected to database...');

        const commands = [
            `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);`,
            `CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);`,
            `CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured) WHERE status = 'active';`,
            `ANALYZE products;`
        ];

        for (const cmd of commands) {
            console.warn(`Executing: ${cmd}`);
            await client.query(cmd);
        }

        console.warn('✅ Applied performance fixes.');

    } catch (err) {
        console.error('Error applying fixes:', err);
    } finally {
        await client.end();
    }
}

applyFixes();
