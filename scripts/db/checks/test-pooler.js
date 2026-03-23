
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env');
    process.exit(1);
}

// Mask password for logging
const masked = connectionString.replace(/:([^:@]+)@/, ':****@');
console.warn(`Testing connection to: ${masked}`);

if (connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Error: You forgot to replace [YOUR-PASSWORD] with your actual password!');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

async function test() {
    try {
        await client.connect();
        console.warn('✅ Connected successfully via Pooler!');
        const res = await client.query('SELECT version();');
        console.warn('Database version:', res.rows[0].version);
        await client.end();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.message.includes('password')) {
            console.warn('-> Check your password.');
        } else if (err.message.includes('ETIMEDOUT')) {
            console.warn('-> Network timeout. Firewall might still be blocking or port is wrong.');
        }
        process.exit(1);
    }
}

test();
