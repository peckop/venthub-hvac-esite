import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    try {
        console.log('Connecting to Supabase Advisor...')
        await client.connect()

        console.log('\n--- 1. PERFORMANCE ADVISOR (Unindexed Foreign Keys) ---')
        const unindexedFKs = await client.query(`
            WITH fks AS (
            SELECT n.nspname AS schema_name, c.relname AS table_name, con.conname AS fk_name, con.conkey, con.conrelid
            FROM pg_constraint con
            JOIN pg_class c ON c.oid = con.conrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE con.contype = 'f'
            )
            SELECT schema_name, table_name, fk_name
            FROM fks f
            WHERE NOT EXISTS (
            SELECT 1 FROM pg_index i
            WHERE i.indrelid = f.conrelid
                AND (i.indkey::int[] @> f.conkey OR i.indkey::int[] = f.conkey)
            ) AND schema_name = 'public'
            ORDER BY 1,2;
        `)
        console.table(unindexedFKs.rows)


        console.log('\n--- 2. PERFORMANCE ADVISOR (Duplicate Indexes) ---')
        const duplicateIdx = await client.query(`
            WITH idx AS (
              SELECT n.nspname AS schema_name, c.relname AS table_name, i.relname AS index_name,
                     regexp_replace(pg_get_indexdef(i.oid), '\\s+', ' ', 'g') AS indexdef_norm
              FROM pg_class c
              JOIN pg_index ix ON ix.indrelid = c.oid
              JOIN pg_class i ON i.oid = ix.indexrelid
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname NOT IN ('pg_catalog','information_schema')
            )
            SELECT schema_name, table_name, string_agg(index_name, ', ') AS duplicates, indexdef_norm
            FROM idx
            GROUP BY schema_name, table_name, indexdef_norm
            HAVING COUNT(*) > 1
            ORDER BY 1,2;
        `)
        console.table(duplicateIdx.rows)

        console.log('\n--- 3. PERFORMANCE ADVISOR (Unused Indexes) ---')
        const unusedIdx = await client.query(`
            SELECT schemaname, relname AS table_name, indexrelname AS index_name, idx_scan
            FROM pg_stat_user_indexes
            WHERE idx_scan = 0
            ORDER BY 1,2;
        `)
        console.table(unusedIdx.rows)

        console.log('\n--- 4. PERFORMANCE ADVISOR (Multiple Permissive RLS Policies) ---')
        const multiPerm = await client.query(`
            SELECT schemaname, tablename, cmd, COUNT(*) AS policy_count
            FROM pg_policies
            WHERE permissive = 'PERMISSIVE'
            GROUP BY schemaname, tablename, cmd
            HAVING COUNT(*) > 1
            ORDER BY 1,2,3;
        `)
        console.table(multiPerm.rows)

        console.log('\n--- 5. SECURITY ADVISOR (Functions with broad search_path) ---')
        console.log('Note: We check if custom functions lack strict search_path definition.')
        const funcs = await client.query(`
            SELECT p.proname, p.proconfig
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
              AND (p.proconfig IS NULL OR NOT 'search_path=pg_catalog, public' = ANY(p.proconfig));
        `)
        console.table(funcs.rows)


    } catch (e: any) {
        console.error('Advisor query failed:', e?.message || e)
    } finally {
        await client.end()
    }
}
run()
