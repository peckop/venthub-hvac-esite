 

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL env degiskeni eksik. .env dosyanizi kontrol edin.');
    process.exit(1);
}

const client = new Client({
    connectionString,
});

async function runMigration() {
    try {
        console.warn('Connecting to database...');
        await client.connect();
        console.warn('Connected.');

        const sql = `
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
      COMMENT ON COLUMN categories.metadata IS 'Stores rich content for landing pages: display_mode, showcase_images, features, technical_summary';
    `;
        console.warn('Running migration...');
        await client.query(sql);
        console.warn('Migration successful: Column added!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
