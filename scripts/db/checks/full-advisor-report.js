
import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function runFullAdvisor() {
    try {
        await client.connect();
        console.warn('=== SUPABASE ADVISOR FULL REPORT ===\n');

        // 1. Unindexed Foreign Keys (with proper casting)
        console.warn('--- 1. Unindexed Foreign Keys ---');
        const fkQuery = `
          WITH fks AS (
            SELECT n.nspname AS schema_name, c.relname AS table_name, con.conname AS fk_name, con.conkey::int[], con.conrelid
            FROM pg_constraint con
            JOIN pg_class c ON c.oid = con.conrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE con.contype = 'f' AND n.nspname = 'public'
          )
          SELECT schema_name, table_name, fk_name
          FROM fks f
          WHERE NOT EXISTS (
            SELECT 1 FROM pg_index i
            WHERE i.indrelid = f.conrelid
              AND (i.indkey::int[] @> f.conkey::int[] OR i.indkey::int[] = f.conkey::int[])
          )
          ORDER BY 1,2;
        `;
        const fkRes = await client.query(fkQuery);
        if (fkRes.rows.length === 0) console.warn('  ✅ None');
        else fkRes.rows.forEach(r => console.warn(`  ⚠️ ${r.table_name}.${r.fk_name}`));


        // 2. Duplicate Indexes
        console.warn('\n--- 2. Duplicate Indexes ---');
        const dupQuery = `
          WITH idx AS (
            SELECT n.nspname AS schema_name, c.relname AS table_name, i.relname AS index_name,
                   regexp_replace(pg_get_indexdef(i.oid), '\\s+', ' ', 'g') AS indexdef_norm
            FROM pg_class c
            JOIN pg_index ix ON ix.indrelid = c.oid
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
          )
          SELECT schema_name, table_name, string_agg(index_name, ', ') AS duplicates
          FROM idx
          GROUP BY schema_name, table_name, indexdef_norm
          HAVING _count(*) > 1
          ORDER BY 1,2;
        `;
        const dupRes = await client.query(dupQuery);
        if (dupRes.rows.length === 0) console.warn('  ✅ None');
        else dupRes.rows.forEach(r => console.warn(`  ⚠️ ${r.table_name}: ${r.duplicates}`));


        // 3. Unused Indexes (idx_scan = 0, excluding pkey/unique)
        console.warn('\n--- 3. Unused Indexes (idx_scan=0) ---');
        const unusedQuery = `
          SELECT schemaname, relname AS table_name, indexrelname AS index_name
          FROM pg_stat_user_indexes
          WHERE idx_scan = 0 AND schemaname = 'public'
            AND indexrelname NOT LIKE '%_pkey'
          ORDER BY 1,2;
        `;
        const unusedRes = await client.query(unusedQuery);
        if (unusedRes.rows.length === 0) console.warn('  ✅ None');
        else unusedRes.rows.forEach(r => console.warn(`  ⚠️ ${r.table_name}.${r.index_name}`));


        // 4. Multiple Permissive RLS Policies (same table, same command)
        console.warn('\n--- 4. Multiple Permissive RLS Policies ---');
        const rlsQuery = `
          SELECT schemaname, tablename, cmd, _count(*) AS cnt, string_agg(policyname, ', ') AS policies
          FROM pg_policies
          WHERE permissive = 'PERMISSIVE' AND schemaname = 'public'
          GROUP BY schemaname, tablename, cmd
          HAVING _count(*) > 1
          ORDER BY 1,2,3;
        `;
        const rlsRes = await client.query(rlsQuery);
        if (rlsRes.rows.length === 0) console.warn('  ✅ None');
        else rlsRes.rows.forEach(r => console.warn(`  ⚠️ ${r.tablename} (${r.cmd}): ${r.policies}`));


        // 5. RLS initplan issues (auth.uid() in policies - rough heuristic)
        console.warn('\n--- 5. RLS using auth.uid() directly (potential initplan issue) ---');
        const initplanQuery = `
          SELECT tablename, policyname, qual
          FROM pg_policies
          WHERE schemaname = 'public' AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
          ORDER BY 1,2;
        `;
        const initplanRes = await client.query(initplanQuery);
        if (initplanRes.rows.length === 0) console.warn('  ✅ None (or using sub-select pattern)');
        else initplanRes.rows.forEach(r => console.warn(`  ⚠️ ${r.tablename}.${r.policyname}`));


        console.warn('\n=== END OF REPORT ===');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

runFullAdvisor();
