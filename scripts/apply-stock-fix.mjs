import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This script is in scripts/ folder, so root is one level up
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
    const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
        process.exit(1);
    }

    const migrationFile = 'supabase/migrations/20260524_idempotent_stock_reduction.sql';
    const sqlPath = path.join(rootDir, migrationFile);
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ Migration file not found: ${migrationFile}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.warn(`🚀 Executing migration via RPC (exec) on ${url}...`);

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
            console.warn('✅ Migration applied successfully!');
            console.warn('Result:', result);
        } else {
            const errorText = await response.text();
            console.error(`❌ Migration failed (Status ${response.status}):`, errorText);
            if (response.status === 404) {
                console.warn('💡 Tip: RPC "exec" function might not exist in your database. Attempting alternative "execute_sql" RPC...');
                
                // Try execute_sql RPC
                const response2 = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'apikey': key,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: sql })
                });
                
                if (response2.ok) {
                    const result2 = await response2.text();
                    console.warn('✅ Migration applied successfully via execute_sql RPC!');
                    console.warn('Result:', result2);
                } else {
                    const errorText2 = await response2.text();
                    console.error(`❌ Migration failed via execute_sql (Status ${response2.status}):`, errorText2);
                }
            }
        }
    } catch (err) {
        console.error('❌ Network error:', err.message);
    }
}

run();
