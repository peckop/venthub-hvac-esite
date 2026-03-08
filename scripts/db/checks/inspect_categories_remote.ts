
import pg from 'pg'
import fs from 'fs'

const { Client } = pg
const connectionString = 'postgresql://postgres:SgxnZcG8Y79evUfd@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres' // Remote DB

const client = new Client({ connectionString })

async function check() {
    try {
        await client.connect()
        console.log('Connected to REMOTE.')

        const res = await client.query(`
            SELECT 
                c.name as category_name, 
                c.id as category_id,
                p_parent.name as parent_name,
                COUNT(prod.id) as product_count 
            FROM categories c 
            LEFT JOIN categories p_parent ON c.parent_id = p_parent.id
            LEFT JOIN products prod ON c.id = prod.category_id 
            GROUP BY c.id, c.name, p_parent.name 
            ORDER BY c.parent_id NULLS FIRST, product_count DESC;
        `)

        console.table(res.rows)
    } catch (e) {
        console.error(e)
    } finally {
        await client.end()
    }
}
check()
