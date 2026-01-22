import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.DATABASE_URL

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function check() {
    try {
        await client.connect()

        // Show hidden categories with product count
        const result = await client.query(`
            SELECT 
                c.name, 
                c.slug, 
                c.is_active,
                p.name as parent_name,
                (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.is_active = false
            ORDER BY c.name;
        `)
        console.log('=== GİZLENEN KATEGORİLER VE ÜRÜN SAYILARI ===')
        console.log(JSON.stringify(result.rows, null, 2))

    } catch (e: any) {
        console.error('Error:', e?.message || e)
    } finally {
        await client.end()
    }
}
check()
