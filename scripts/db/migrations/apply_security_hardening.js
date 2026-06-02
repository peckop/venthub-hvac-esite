import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

// Read .env file manually
function loadEnv() {
    const envPath = path.join(rootDir, '.env');
    if (!fs.existsSync(envPath)) return {};

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const cleanLine = line.replace(/\r/g, '').split('#')[0].trim();
        if (!cleanLine) return;

        const parts = cleanLine.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });
    return env;
}

async function run() {
    const env = loadEnv();
    let connectionString = env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    const tryConnect = async (url) => {
        const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
        console.warn(`🔗 Attempting connection to: ${maskedUrl}`);
        const client = new Client({
            connectionString: url,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 15000,
        });

        try {
            await client.connect();
            return client;
        } catch (err) {
            console.error(`  ⚠️ Connection failed: ${err.message}`);
            return null;
        }
    };

    let client = await tryConnect(connectionString);

    if (!client && connectionString.includes('pooler')) {
        console.warn('🔄 Secondary protocol: Trying direct connection (port 5432)...');
        const directUrl = connectionString
            .replace(':6543', ':5432')
            .replace('.pooler.', '.')
            .replace('?pgbouncer=true', '');
        client = await tryConnect(directUrl);
    }

    if (!client && connectionString.includes('.supabase.co')) {
        console.warn('🔄 Tertiary protocol: Trying .com variation...');
        const comUrl = connectionString.replace('.supabase.co', '.supabase.com');
        client = await tryConnect(comUrl);
    }

    if (!client) {
        console.error('❌ PROTOCOL ERROR: All connection attempts failed.');
        process.exit(1);
    }

    try {
        console.warn('✅ Connected to Supabase.');

        const migrationFile = 'supabase/migrations/20260602080000_security_hardening_fixes.sql';
        const sqlPath = path.join(rootDir, migrationFile);

        if (!fs.existsSync(sqlPath)) {
            console.error(`❌ Migration file not found: ${migrationFile}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.warn(`🚀 Executing migration: ${migrationFile}...`);

        await client.query(sql);
        console.warn('✅ Migration applied successfully.');

    } catch (err) {
        console.error('❌ Migration Execution failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
