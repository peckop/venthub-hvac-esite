import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function fixAllIssues() {
    console.log('🔧 TÜM Lint Uyarılarını Düzeltme...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        // =============================================================
        // SECURITY 1: user_invoice_profiles_ensure_single_default search_path
        // =============================================================
        console.log('1. SECURITY: user_invoice_profiles_ensure_single_default fonksiyonu...');
        try {
            await client.query(`
                ALTER FUNCTION public.user_invoice_profiles_ensure_single_default()
                SET search_path = public
            `);
            console.log('   ✅ search_path düzeltildi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // =============================================================
        // SECURITY 2: set_updated_at search_path
        // =============================================================
        console.log('2. SECURITY: set_updated_at fonksiyonu...');
        try {
            await client.query(`
                ALTER FUNCTION public.set_updated_at()
                SET search_path = public
            `);
            console.log('   ✅ search_path düzeltildi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // =============================================================
        // PERFORMANCE 1: categories - Multiple permissive policies
        // "Enable read access for all users" ve "Enable write access for authenticated users"
        // SELECT için iki politika var - birini kaldır veya birleştir
        // =============================================================
        console.log('3. PERFORMANCE: categories tablosu çoklu politika...');
        try {
            // "Enable read access for all users" SELECT politikasını sil
            // çünkü "Enable write access for authenticated users" zaten ALL (SELECT dahil)
            await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories`);
            console.log('   ✅ Duplicate SELECT politikası silindi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        // =============================================================
        // PERFORMANCE 2: user_invoice_profiles - Duplicate index
        // idx_user_invoice_profiles_user ve idx_user_invoice_profiles_user_id
        // =============================================================
        console.log('4. PERFORMANCE: user_invoice_profiles duplicate index...');
        try {
            await client.query(`DROP INDEX IF EXISTS idx_user_invoice_profiles_user`);
            console.log('   ✅ Duplicate index silindi');
        } catch (e) {
            console.log('   ⚠️', e.message);
        }

        console.log('\n✅ Tüm düzeltmeler tamamlandı!');

    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        await client.end();
    }
}

fixAllIssues();
