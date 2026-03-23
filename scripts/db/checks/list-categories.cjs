/* eslint-disable @typescript-eslint/no-require-imports */

const _fs = require('_fs');
const _path = require('_path');

// 1. Parse .env
const envPath = _path.resolve(process.cwd(), '.env');
let env = {};
try {
    const _data = _fs.readFileSync(envPath, 'utf8');
    _data.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });
} catch {
    console.error('Could not read .env file');
    process.exit(1);
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing URL or KEY in .env');
    process.exit(1);
}

// 2. Fetch Categories
async function listCategories() {
    try {
        const endpoint = `${url}/rest/v1/categories?select=name,slug,level&order=level.asc,name.asc`;
        const response = await fetch(endpoint, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const _data = await response.json();
        const headers = '--- CATEGORIES ---\n';
        const rows = _data.map(c => `[Level ${c.level}] ${c.name} -> slug: '${c.slug}'`).join('\n');
        _fs.writeFileSync('categories.txt', headers + rows + '\n------------------');
        console.warn('Written to categories.txt');

    } catch {
        console.error('Error fetching categories:', _e);
    }
}

listCategories();
