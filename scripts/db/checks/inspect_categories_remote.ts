import pg from 'pg'

const { Client } = pg
const connectionString = 'postgresql://postgres:***REMOVED***@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres' // Remote DB

const client = new Client({ connectionString })

async function check() {
    try {
        await client.connect()
        console.warn('Connected to REMOTE.')

        const res = await client.query(`
            SELECT 
                c.name as category_name, 
                c.id as category_id,
                p_parent.name as parent_name,
                count(prod.id) as product_count 
            FROM categories c 
            LEFT JOIN categories p_parent ON c.parent_id = p_parent.id
            LEFT JOIN products prod ON c.id = prod.category_id 
            GROUP BY c.id, c.name, p_parent.name 
            ORDER BY c.parent_id NULLS FIRST, product_count DESC;
        `)

        console.warn(JSON.stringify(res.rows, null, 2))
    } catch (err: unknown) {
        console.error(err)
    } finally {
        await client.end()
    }
}
check()
