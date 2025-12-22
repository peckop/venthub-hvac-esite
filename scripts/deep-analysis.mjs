import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function deepAnalysis() {
    console.log('🔍 Derin RLS Analizi...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. auth.uid() veya auth.role() içeren TÜM politikaları bul (SELECT wrapper olsa bile)
        const authPolicies = await client.query(`
            SELECT 
                tablename, 
                policyname,
                cmd,
                qual::text as using_clause,
                with_check::text as check_clause
            FROM pg_policies 
            WHERE schemaname = 'public'
              AND (
                  qual::text LIKE '%auth.%'
                  OR with_check::text LIKE '%auth.%'
              )
            ORDER BY tablename, policyname;
        `);

        console.log('=== AUTH FONKSİYONLARI İÇEREN POLİTİKALAR ===\n');

        for (const row of authPolicies.rows) {
            const usingHasPlain = row.using_clause && (
                (row.using_clause.includes('auth.uid()') && !row.using_clause.includes('(SELECT auth.uid())') && !row.using_clause.includes('( SELECT auth.uid())')) ||
                (row.using_clause.includes('auth.role()') && !row.using_clause.includes('(SELECT auth.role())') && !row.using_clause.includes('( SELECT auth.role())'))
            );

            const checkHasPlain = row.check_clause && (
                (row.check_clause.includes('auth.uid()') && !row.check_clause.includes('(SELECT auth.uid())') && !row.check_clause.includes('( SELECT auth.uid())')) ||
                (row.check_clause.includes('auth.role()') && !row.check_clause.includes('(SELECT auth.role())') && !row.check_clause.includes('( SELECT auth.role())'))
            );

            if (usingHasPlain || checkHasPlain) {
                console.log(`⚠️ ${row.tablename}.${row.policyname} [${row.cmd}]`);
                if (usingHasPlain) console.log(`   USING: ${row.using_clause.substring(0, 120)}...`);
                if (checkHasPlain) console.log(`   CHECK: ${row.check_clause.substring(0, 120)}...`);
                console.log('');
            }
        }

        // 2. RLS etkin tablolardan politikası olmayan veya eksik olanları bul
        console.log('\n=== RLS DURUMU ===\n');

        const rlsTables = await client.query(`
            SELECT 
                c.relname as tablename,
                c.relrowsecurity as rls_enabled,
                COALESCE((
                    SELECT COUNT(*) FROM pg_policies p 
                    WHERE p.schemaname = 'public' AND p.tablename = c.relname
                ), 0) as policy_count
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
              AND c.relkind = 'r'
            ORDER BY c.relname;
        `);

        for (const row of rlsTables.rows) {
            if (row.rls_enabled && row.policy_count === 0) {
                console.log(`⚠️ ${row.tablename}: RLS ETKİN ama POLİTİKA YOK!`);
            }
        }

        console.log('\n✅ Analiz tamamlandı.');

    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        await client.end();
    }
}

deepAnalysis();
