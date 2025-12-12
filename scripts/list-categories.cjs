
const fs = require('fs');
const path = require('path');

// 1. Parse .env
const envPath = path.resolve(process.cwd(), '.env');
let env = {};
try {
    const data = fs.readFileSync(envPath, 'utf8');
    data.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });
} catch (e) {
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

        const data = await response.json();
        const headers = '--- CATEGORIES ---\n';
        const rows = data.map(c => `[Level ${c.level}] ${c.name} -> slug: '${c.slug}'`).join('\n');
        fs.writeFileSync('categories.txt', headers + rows + '\n------------------');
        console.log('Written to categories.txt');

    } catch (e) {
        console.error('Error fetching categories:', e);
    }
}

listCategories();
