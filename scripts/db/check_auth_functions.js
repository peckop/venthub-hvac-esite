import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

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
    const client = new Client({
        connectionString: env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    try {
        console.log('--- Checking definition of auth.role() ---');
        const res = await client.query("SELECT pg_get_functiondef('auth.role'::regproc);");
        console.log(res.rows[0]?.pg_get_functiondef);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
