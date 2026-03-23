/* eslint-disable @typescript-eslint/no-require-imports */

const { Client } = require('pg');

const connectionString = 'postgresql://postgres:SgxnZcG8Y79evUfd@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres';

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
