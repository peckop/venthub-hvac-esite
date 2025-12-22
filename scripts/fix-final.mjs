import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function fixFinal() {
    console.log('🔧 Final Düzeltmeler...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        // 1. wizard_selections - Users can view own selections
        console.log('1. wizard_selections - "Users can view own selections" düzeltiliyor...');
        try {
            await client.query(`DROP POLICY IF EXISTS "Users can view own selections" ON public.wizard_selections`);
            await client.query(`
                CREATE POLICY "Users can view own selections" ON public.wizard_selections
                FOR SELECT TO authenticated
                USING (user_id = (SELECT auth.uid()))
            `);
            console.log('   ✅ Düzeltildi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // 2. Tüm auth.uid() içeren politikaları daha kapsamlı güncelle
        console.log('\n2. Diğer sorunlu politikaları arıyorum...');

        const issues = await client.query(`
            SELECT tablename, policyname, cmd, qual::text, with_check::text
            FROM pg_policies 
            WHERE schemaname = 'public'
              AND (
                  (qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' AND qual::text NOT LIKE '%( SELECT auth.uid())%')
                  OR (with_check::text LIKE '%auth.uid()%' AND with_check::text NOT LIKE '%(SELECT auth.uid())%' AND with_check::text NOT LIKE '%( SELECT auth.uid())%')
                  OR (qual::text LIKE '%auth.role()%' AND qual::text NOT LIKE '%(SELECT auth.role())%' AND qual::text NOT LIKE '%( SELECT auth.role())%')
                  OR (with_check::text LIKE '%auth.role()%' AND with_check::text NOT LIKE '%(SELECT auth.role())%' AND with_check::text NOT LIKE '%( SELECT auth.role())%')
              );
        `);

        console.log(`   Kalan sorunlu politika sayısı: ${issues.rows.length}`);
        for (const row of issues.rows) {
            console.log(`   - ${row.tablename}.${row.policyname}`);
        }

        // 3. Sonuç kontrol
        const countResult = await client.query(`
            SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'
        `);
        console.log(`\n📋 Toplam politika sayısı: ${countResult.rows[0].total}`);

    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Düzeltme tamamlandı.');
    }
}

fixFinal();
