import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function check() {
    try {
        console.log('Connecting...')
        await client.connect()
        console.log('Connected.\n')

        // Tüm ana kategoriler ve alt kategori sayıları
        const result = await client.query(`
            WITH category_counts AS (
                SELECT 
                    parent.id as parent_id,
                    parent.name as parent_name,
                    parent.slug as parent_slug,
                    COUNT(child.id) as subcategory_count
                FROM categories parent
                LEFT JOIN categories child ON child.parent_id = parent.id
                WHERE parent.level = 0
                GROUP BY parent.id, parent.name, parent.slug
                ORDER BY parent.name
            )
            SELECT * FROM category_counts;
        `)
        console.log('=== ANA KATEGORİLER VE ALT KATEGORİ SAYILARI ===')
        result.rows.forEach((row: any) => {
            console.log(`${row.parent_name}: ${row.subcategory_count} alt kategori`)
        })

        // Fanlar özelinde detaylı liste
        console.log('\n=== FANLAR ALT KATEGORİLERİ ===')
        const fanlarsubs = await client.query(`
            SELECT c.name, c.slug, c.is_active, c.is_visible
            FROM categories c
            WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'fanlar')
            ORDER BY c.name;
        `)
        console.log(`Toplam: ${fanlarsubs.rows.length} alt kategori`)
        fanlarsubs.rows.forEach((row: any) => {
            const status = row.is_active ? '✅' : '❌'
            const visible = row.is_visible ? '👁️' : '🚫'
            console.log(`${status}${visible} ${row.name} (${row.slug})`)
        })

    } catch (e: any) {
        console.error('Error:', e?.message || e)
    } finally {
        await client.end()
    }
}
check()
