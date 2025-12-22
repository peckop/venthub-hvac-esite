import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

// Duplicate politikaları temizle - her tablo için sadece "merged" versiyonları tut
// veya eski basit versiyonları sil
const cleanupQueries = [
    // cart_items: cart_items_policy (ALL) var, diğerlerini sil
    "DROP POLICY IF EXISTS cart_items_delete ON public.cart_items",
    "DROP POLICY IF EXISTS cart_items_insert ON public.cart_items",
    "DROP POLICY IF EXISTS cart_items_select ON public.cart_items",
    "DROP POLICY IF EXISTS cart_items_update ON public.cart_items",

    // shopping_carts: shopping_carts_policy (ALL) var, diğerlerini sil
    "DROP POLICY IF EXISTS shopping_carts_delete ON public.shopping_carts",
    "DROP POLICY IF EXISTS shopping_carts_insert ON public.shopping_carts",
    "DROP POLICY IF EXISTS shopping_carts_select ON public.shopping_carts",
    "DROP POLICY IF EXISTS shopping_carts_update ON public.shopping_carts",

    // user_addresses: merged_ versiyonları tut, diğerlerini sil
    "DROP POLICY IF EXISTS user_addresses_delete ON public.user_addresses",
    "DROP POLICY IF EXISTS user_addresses_insert ON public.user_addresses",
    "DROP POLICY IF EXISTS user_addresses_select ON public.user_addresses",
    "DROP POLICY IF EXISTS user_addresses_update ON public.user_addresses",

    // user_invoice_profiles: merged_ versiyonları tut, diğerlerini sil
    "DROP POLICY IF EXISTS user_invoice_profiles_delete ON public.user_invoice_profiles",
    "DROP POLICY IF EXISTS user_invoice_profiles_insert ON public.user_invoice_profiles",
    "DROP POLICY IF EXISTS user_invoice_profiles_select ON public.user_invoice_profiles",
    "DROP POLICY IF EXISTS user_invoice_profiles_update ON public.user_invoice_profiles",

    // user_profiles: basit versiyonları sil (policy olanları tut)
    "DROP POLICY IF EXISTS user_profiles_insert ON public.user_profiles",
    "DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles",
    "DROP POLICY IF EXISTS user_profiles_update ON public.user_profiles",

    // venthub_orders: orders_ versiyonlarını tut, venthub_orders_ olanları sil
    "DROP POLICY IF EXISTS venthub_orders_insert ON public.venthub_orders",
    "DROP POLICY IF EXISTS venthub_orders_select ON public.venthub_orders",
    "DROP POLICY IF EXISTS venthub_orders_update ON public.venthub_orders",

    // venthub_order_items: duplicate select'i sil
    "DROP POLICY IF EXISTS venthub_order_items_select ON public.venthub_order_items",

    // venthub_returns: returns_ versiyonlarını tut, venthub_returns_ olanları sil
    "DROP POLICY IF EXISTS venthub_returns_insert ON public.venthub_returns",
    "DROP POLICY IF EXISTS venthub_returns_select ON public.venthub_returns",

    // wizard_selections: basit olanları sil
    "DROP POLICY IF EXISTS wizard_selections_insert ON public.wizard_selections",
    "DROP POLICY IF EXISTS wizard_selections_select ON public.wizard_selections",

    // categories: merged_ versiyonları sil (Enable olanları tut)
    "DROP POLICY IF EXISTS merged_categories_authenticated_insert ON public.categories",
    "DROP POLICY IF EXISTS merged_categories_authenticated_select ON public.categories",
    "DROP POLICY IF EXISTS merged_categories_authenticated_update ON public.categories",

    // products: merged sil, products_ politikalarını tut
    "DROP POLICY IF EXISTS merged_products_anon_select ON public.products",
];

async function cleanup() {
    console.log('🧹 Duplicate RLS Politikalarını Temizleme...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        let successCount = 0;
        let errorCount = 0;

        for (const query of cleanupQueries) {
            try {
                await client.query(query);
                console.log(`✅ ${query.substring(0, 60)}...`);
                successCount++;
            } catch (err) {
                console.log(`⚠️ ${query.substring(0, 40)}... - ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n📊 Sonuç: ${successCount} başarılı, ${errorCount} hata`);

        // Sonucu kontrol et
        const countResult = await client.query(`
            SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'
        `);
        console.log(`\n📋 Kalan toplam politika sayısı: ${countResult.rows[0].total}`);

    } catch (err) {
        console.error('❌ Bağlantı hatası:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Temizlik tamamlandı.');
    }
}

cleanup();
