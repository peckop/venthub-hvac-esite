import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function fixRemainingIssues() {
    console.log('🔧 Kalan Lint Sorunlarını Düzeltme...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        // 1. categories tablosu - auth.role() -> (SELECT auth.role())
        console.log('1. categories - Enable write access politikası düzeltiliyor...');
        try {
            await client.query(`DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.categories`);
            await client.query(`
                CREATE POLICY "Enable write access for authenticated users" ON public.categories
                FOR ALL TO authenticated
                USING ((SELECT auth.role()) = 'authenticated')
                WITH CHECK ((SELECT auth.role()) = 'authenticated')
            `);
            console.log('   ✅ Düzeltildi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // 2. venthub_order_items - auth.uid() ve auth.role() -> (SELECT ...)
        console.log('2. venthub_order_items_insert politikası düzeltiliyor...');
        try {
            await client.query(`DROP POLICY IF EXISTS venthub_order_items_insert ON public.venthub_order_items`);
            await client.query(`
                CREATE POLICY venthub_order_items_insert ON public.venthub_order_items
                FOR INSERT TO authenticated
                WITH CHECK (
                    order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = (SELECT auth.uid()))
                    OR (SELECT auth.role()) = 'service_role'
                )
            `);
            console.log('   ✅ Düzeltildi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // 3. Aynı tablo/eylem için birden fazla SELECT politikası olanları bul ve temizle
        console.log('\n3. Duplicate SELECT politikaları temizleniyor...');

        // coupons: 3 SELECT politikası var
        try {
            await client.query(`DROP POLICY IF EXISTS merged_coupons_anon_select ON public.coupons`);
            await client.query(`DROP POLICY IF EXISTS merged_coupons_authenticated_select ON public.coupons`);
            // merged_coupons_dashboard_user_select'i tut
            console.log('   ✅ coupons duplicate\'lar temizlendi');
        } catch (e) {
            console.log('   ⚠️ coupons:', e.message);
        }

        // shipping_idempotency: 2 SELECT politikası var
        try {
            await client.query(`DROP POLICY IF EXISTS merged_shipping_idempotency_dashboard_user_select ON public.shipping_idempotency`);
            // merged_shipping_idempotency_service_role_select'i tut
            console.log('   ✅ shipping_idempotency duplicate\'lar temizlendi');
        } catch (e) {
            console.log('   ⚠️ shipping_idempotency:', e.message);
        }

        // 4. organizations: SELECT + 3 diğer işlem (ALL değil ayrı ayrı)
        // Bu normal, düzeltme gerekmiyor

        // 5. Sonuç kontrol
        const countResult = await client.query(`
            SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'
        `);
        console.log(`\n📋 Toplam politika sayısı: ${countResult.rows[0].total}`);

    } catch (err) {
        console.error('❌ Bağlantı hatası:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Düzeltme tamamlandı.');
    }
}

fixRemainingIssues();
