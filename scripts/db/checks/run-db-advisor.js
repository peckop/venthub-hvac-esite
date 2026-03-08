
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

async function runAdvisor() {
    try {
        await client.connect();
        console.log('Connected to database... Running Advisor Checks...');

        // 1. Unindexed Foreign Keys
        console.log('\n--- Unindexed Foreign Keys ---');
        const unindexedFKs = `
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
              AND (i.indkey::int[] @> f.conkey::int[] OR i.indkey::int[] = f.conkey::int[])
          )
          ORDER BY 1,2;
        `;
        const resFK = await client.query(unindexedFKs);
        if (resFK.rows.length === 0) console.log('✅ None found.');
        else resFK.rows.forEach(r => console.log(`[WARNING] Unindexed FK: ${r.schema_name}.${r.table_name} (${r.fk_name})`));


        // 2. Duplicate Indexes
        console.log('\n--- Duplicate Indexes ---');
        const duplicateIndexes = `
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
        `;
        const resDup = await client.query(duplicateIndexes);
        if (resDup.rows.length === 0) console.log('✅ None found.');
        else resDup.rows.forEach(r => console.log(`[WARNING] Duplicate Indexes on ${r.schema_name}.${r.table_name}: ${r.duplicates}`));


        // 3. Unused Indexes (idx_scan = 0)
        console.log('\n--- Unused Indexes (idx_scan=0) ---');
        const unusedIndexes = `
          SELECT schemaname, relname AS table_name, indexrelname AS index_name, idx_scan
          FROM pg_stat_user_indexes
          WHERE idx_scan = 0
            AND indexrelname NOT LIKE '%_pkey' 
            AND indexrelname NOT LIKE '%_unique'
          ORDER BY 1,2;
        `;
        const resUnused = await client.query(unusedIndexes);
        if (resUnused.rows.length === 0) console.log('✅ None found.');
        else resUnused.rows.forEach(r => console.log(`[WARNING] Unused Index: ${r.table_name}.${r.index_name}`));


        // 4. Multiple Permissive RLS Policies
        console.log('\n--- Multiple Permissive RLS Policies ---');
        const permissivePolicies = `
          SELECT schemaname, tablename, cmd, COUNT(*) AS policy_count, string_agg(policyname, ', ') AS policies
          FROM pg_policies
          WHERE permissive = 'PERMISSIVE'
          GROUP BY schemaname, tablename, cmd
          HAVING COUNT(*) > 1
          ORDER BY 1,2,3;
        `;
        const resRLS = await client.query(permissivePolicies);
        if (resRLS.rows.length === 0) console.log('✅ None found.');
        else resRLS.rows.forEach(r => console.log(`[WARNING] Multiple Permissive RLS on ${r.tablename} (${r.cmd}): ${r.policies}`));

    } catch (err) {
        console.error('Error running advisor:', err);
    } finally {
        await client.end();
    }
}

runAdvisor();
