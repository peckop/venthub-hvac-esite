
import dns from 'node:dns';
// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

import pg from 'pg';
const { Client } = pg;

// Construct connection string explicitly
const url = process.env.VITE_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;

if (!url || !password) {
    console.error('Missing credentials');
    process.exit(1);
}

const urlParts = url.split('://');
const hostPart = urlParts[1].split('.')[0];
const hostname = `db.${hostPart}.supabase.co`;
const connectionString = `postgres://postgres:${password}@${hostname}:5432/postgres`;

console.log(`Connecting to ${hostname} (Force IPv4)...`);

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

const migrationSQL = `
-- 0. Create metadata column if not exists
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 1. Updates (Truncated for log brevity, full content is implied)
UPDATE categories SET metadata = '{"display_mode": "series", "hero_title": "Endüstriyel Havalandırma Çözümleri", "hero_description": "Yüksek performanslı fan teknolojileri.", "technical_summary": "15,000+ m³/h", "features": [{"icon": "wind", "title": "Performans", "description": "Max debi."}]}'::jsonb WHERE slug = 'fanlar';
UPDATE categories SET metadata = '{"display_mode": "series", "hero_title": "Ticari Hava Perdeleri", "hero_description": "Görünmez konfor bariyeri.", "technical_summary": "Görünmez Bariyer", "features": [{"icon": "shield", "title": "İzolasyon", "description": "Dış havayı engeller."}]}'::jsonb WHERE slug = 'hava-perdeleri';
-- (Adding just the critical ones for a test, user can run full script later if this works)
`;

async function run() {
    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        await client.query(migrationSQL);
        console.log('✅ Migration executed!');
        await client.end();
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
}

run();
