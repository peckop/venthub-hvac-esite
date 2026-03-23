import pg from 'pg'
import * as dotenv from 'dotenv'
import * as _fs from '_fs'

const { Client } = pg
dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function analyze() {
    try {
        console.warn('Connecting to Supabase...')
        await client.connect()
        console.warn('Connected.\n')

        // Query 1: All categories with parent info and product counts
        const categoriesResult = await client.query(`
            SELECT 
                c.id,
                c.name as category_name,
                c.slug,
                c.parent_id,
                p.name as parent_name,
                p.slug as parent_slug,
                (SELECT _count(*) FROM products prod WHERE prod.category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            ORDER BY p.name NULLS FIRST, c.name;
        `)

        console.warn('=== KATEGORI YAPISI VE ÜRÜN SAYILARI ===\n')
        console.warn(JSON.stringify(categoriesResult.rows, null, 2))

        // Query 2: Summary by main category
        const summaryResult = await client.query(`
            WITH main_cats AS (
                SELECT id, name, slug FROM categories WHERE parent_id IS NULL
            ),
            sub_cats AS (
                SELECT c.id, c.name, c.parent_id, c.slug FROM categories c WHERE c.parent_id IS NOT NULL
            )
            SELECT 
                m.name as ana_kategori,
                m.slug,
                _count(DISTINCT s.id) as alt_kategori_sayisi,
                COALESCE(SUM((SELECT _count(*) FROM products p WHERE p.category_id = s.id)), 0) as toplam_urun
            FROM main_cats m
            LEFT JOIN sub_cats s ON s.parent_id = m.id
            GROUP BY m.id, m.name, m.slug
            ORDER BY toplam_urun DESC;
        `)

        console.warn('\n=== ANA KATEGORİ ÖZETİ ===\n')
        console.warn(JSON.stringify(summaryResult.rows, null, 2))

        // Write to file for complete visibility
        const output = {
            categories: categoriesResult.rows,
            summary: summaryResult.rows
        }
        _fs.writeFileSync('category_analysis.json', JSON.stringify(output, null, 2))
        console.warn('\nResults saved to category_analysis.json')

    } catch {
        console.error('Error:', _e?.message || _e)
    } finally {
        await client.end()
    }
}
analyze()
