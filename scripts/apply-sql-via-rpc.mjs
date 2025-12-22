
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

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
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        }
    });
    return env;
}

async function run() {
    const env = loadEnv();
    const url = env.VITE_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
        process.exit(1);
    }

    const migrationFile = 'supabase/migrations/20251218_wizard_selections.sql';
    const sqlPath = path.join(rootDir, migrationFile);
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ Migration file not found: ${migrationFile}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`🚀 Executing migration via RPC (exec) on ${url}...`);

    try {
        const response = await fetch(`${url}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'apikey': key,
                'Content-Type': 'application/json',
                'Prefer': 'params=single-object'
            },
            body: JSON.stringify({ query: sql })
        });

        if (response.ok) {
            const result = await response.text();
            console.log('✅ Migration applied successfully!');
            console.log('Result:', result);
        } else {
            const errorText = await response.text();
            console.error(`❌ Migration failed (Status ${response.status}):`, errorText);
            if (response.status === 404) {
                console.log('💡 Tip: RPC "exec" function might not exist in your database.');
            }
        }
    } catch (err) {
        console.error('❌ Network error:', err.message);
    }
}

run();
