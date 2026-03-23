
import dns from 'dns/promises';
import net from 'net';
import pg from 'pg';
const { Client } = pg;

const url = process.env.VITE_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;

console.warn('--- Connection Diagnosis ---');

if (!url) {
    console.error('❌ VITE_SUPABASE_URL not found in environment.');
    process.exit(1);
}

// 1. Parse Hostname
const _urlParts = url.split('://');
if (_urlParts.length < 2) {
    console.error('❌ Invalid VITE_SUPABASE_URL format.');
    process.exit(1);
}
const projectRef = _urlParts[1].split('.')[0];
const hostname = `db.${projectRef}.supabase.co`;
console.warn(`Target Hostname: ${hostname}`);
console.warn(`Password Present: ${!!password}`);

async function diagnose() {
    // 2. DNS Lookup
    console.warn('\n--- DNS Lookup ---');
    try {
        const ip = await dns.lookup(hostname);
        console.warn(`✅ DNS Resolved: ${hostname} -> ${ip.address} (Family: ${ip.family})`);
    } catch (err) {
        console.error(`❌ DNS Verification Failed: ${err.message}`);
        console.warn('Possible Causes: Wrong Project ID, Database Paused, or No Internet.');
        return;
    }

    // 3. Port Reachability (5432 vs 6543)
    const ports = [5432, 6543];

    for (const port of ports) {
        console.warn(`\n--- Testing Port ${port} ---`);
        await new Promise(resolve => {
            const socket = new net.Socket();
            socket.setTimeout(3000);

            socket.on('connect', () => {
                console.warn(`✅ Port ${port} is OPEN and reachable.`);
                socket.destroy();
                resolve();
            });

            socket.on('timeout', () => {
                console.error(`❌ Port ${port} TIMED OUT.`);
                socket.destroy();
                resolve();
            });

            socket.on('error', (err) => {
                console.error(`❌ Port ${port} ERROR: ${err.message}`);
                resolve();
            });

            socket.connect(port, hostname);
        });
    }

    // 4. Auth Test (Direct Mode)
    if (password) {
        console.warn('\n--- Testing Authentication (Port 5432) ---');
        const client = new Client({
            connectionString: `postgres://postgres:${password}@${hostname}:5432/postgres`,
            connectionTimeoutMillis: 5000,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.warn('✅ Authentication SUCCESSFUL!');
            const res = await client.query('SELECT version();');
            console.warn('DB Version:', res.rows[0].version);
            await client.end();
        } catch (err) {
            console.error(`❌ Authentication FAILED: ${err.message}`);
            if (err.message.includes('password')) {
                console.warn('-> Password might be incorrect.');
            }
            await client.end();
        }
    } else {
        console.warn('Skipping Auth test (No password provided).');
    }
}

diagnose();
