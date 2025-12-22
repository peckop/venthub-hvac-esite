import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function fixAllRemaining() {
    console.log('🔧 TÜM Kalan Sorunları Düzeltme...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        // Önce TÜM sorunlu politikaları listele
        const issues = await client.query(`
            SELECT tablename, policyname, cmd, qual::text as using_clause, with_check::text as check_clause
            FROM pg_policies 
            WHERE schemaname = 'public'
              AND (
                  (qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' AND qual::text NOT LIKE '%( SELECT auth.uid())%')
                  OR (with_check::text LIKE '%auth.uid()%' AND with_check::text NOT LIKE '%(SELECT auth.uid())%' AND with_check::text NOT LIKE '%( SELECT auth.uid())%')
                  OR (qual::text LIKE '%auth.role()%' AND qual::text NOT LIKE '%(SELECT auth.role())%' AND qual::text NOT LIKE '%( SELECT auth.role())%')
                  OR (with_check::text LIKE '%auth.role()%' AND with_check::text NOT LIKE '%(SELECT auth.role())%' AND with_check::text NOT LIKE '%( SELECT auth.role())%')
              )
            ORDER BY tablename;
        `);

        console.log(`Toplam sorunlu politika: ${issues.rows.length}\n`);

        for (const row of issues.rows) {
            console.log(`Düzeltiliyor: ${row.tablename}.${row.policyname} [${row.cmd}]`);

            try {
                // Politikayı sil
                await client.query(`DROP POLICY IF EXISTS "${row.policyname}" ON public.${row.tablename}`);

                // Yeni using ve check ifadelerini oluştur
                let newUsing = row.using_clause;
                let newCheck = row.check_clause;

                if (newUsing) {
                    newUsing = newUsing.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
                    newUsing = newUsing.replace(/auth\.role\(\)/g, '(SELECT auth.role())');
                }
                if (newCheck) {
                    newCheck = newCheck.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
                    newCheck = newCheck.replace(/auth\.role\(\)/g, '(SELECT auth.role())');
                }

                // Politikayı yeniden oluştur
                let createSQL = `CREATE POLICY "${row.policyname}" ON public.${row.tablename} FOR ${row.cmd}`;
                createSQL += ` TO authenticated`;

                if (newUsing && row.cmd !== 'INSERT') {
                    createSQL += ` USING (${newUsing})`;
                }
                if (newCheck && (row.cmd === 'INSERT' || row.cmd === 'UPDATE' || row.cmd === 'ALL')) {
                    createSQL += ` WITH CHECK (${newCheck})`;
                }

                await client.query(createSQL);
                console.log(`   ✅ Düzeltildi`);
            } catch (e) {
                console.log(`   ⚠️ ${e.message}`);
            }
        }

        // Sonuç kontrol
        const remaining = await client.query(`
            SELECT COUNT(*) as cnt
            FROM pg_policies 
            WHERE schemaname = 'public'
              AND (
                  (qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' AND qual::text NOT LIKE '%( SELECT auth.uid())%')
                  OR (with_check::text LIKE '%auth.uid()%' AND with_check::text NOT LIKE '%(SELECT auth.uid())%' AND with_check::text NOT LIKE '%( SELECT auth.uid())%')
              );
        `);

        console.log(`\n📋 Kalan sorunlu politika: ${remaining.rows[0].cnt}`);

    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Düzeltme tamamlandı.');
    }
}

fixAllRemaining();
