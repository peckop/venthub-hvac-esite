import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Service role key gerekli - anon key ile silme yapılamayabilir
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function runMigration() {
    console.log('=== Kategori-Ürün Tutarlılık Migration ===\n');

    // AŞAMA 1: Ürünleri doğru kategorilere taşı
    console.log('AŞAMA 1: Ürünleri taşıma...');

    // Plastik Kelepçe
    const plasticResult = await supabase
        .from('products')
        .update({ category_id: '8195387b-2bf5-4576-935a-0293ea0b0f34' })
        .ilike('name', 'Plastik Kelepçe%')
        .neq('category_id', '8195387b-2bf5-4576-935a-0293ea0b0f34');
    console.log('  Plastik Kelepçe:', plasticResult.error ? `HATA: ${plasticResult.error.message}` : 'OK');

    // Alüminyum Folyo Bant
    const aluResult = await supabase
        .from('products')
        .update({ category_id: '591c0ea4-5e24-4214-b9fb-ed32d741cdd7' })
        .ilike('name', 'Alüminyum Folyo Bant%')
        .neq('category_id', '591c0ea4-5e24-4214-b9fb-ed32d741cdd7');
    console.log('  Alüminyum Folyo Bant:', aluResult.error ? `HATA: ${aluResult.error.message}` : 'OK');

    // Hız Anahtarı
    const hizResult = await supabase
        .from('products')
        .update({ category_id: '882982be-e355-4ccb-aea9-b5480b0fadf3' })
        .ilike('name', 'Hız Anahtarı%')
        .neq('category_id', '882982be-e355-4ccb-aea9-b5480b0fadf3');
    console.log('  Hız Anahtarı:', hizResult.error ? `HATA: ${hizResult.error.message}` : 'OK');

    // AŞAMA 2: Boş kategorileri sil
    console.log('\nAŞAMA 2: Boş kategorileri silme...');

    const categoriesToDelete = [
        { id: 'ca83b3d1-9958-461b-acbb-4196cdeda9b0', name: 'Depuro Pro' },
        { id: '79e6a033-cfc2-4417-b5a6-20224e64b6fe', name: 'S&G Dispenser' },
        { id: '515c15b9-e7a4-4a1c-b704-e2c3928c1be5', name: 'Uv Logika' },
        { id: '626113e0-927f-4d25-9678-5f259fc3f49c', name: 'Vort Super Dry' },
        { id: 'bce93862-5402-4850-96ae-1f4fdd5656e3', name: 'Bağlantı Konnektörü' },
        { id: 'f1023011-4390-42d3-bcc4-53510a43c93f', name: 'Basınçlandırma Fanları' },
        { id: '4a801860-24f3-4d02-8a1b-7e547f2be73e', name: 'Ex-Proof Fanlar' },
        { id: '44f69169-0075-4c29-ac05-d76f55f935a8', name: 'Gemici Anemostadı' },
        { id: 'f3a75c19-256a-44bb-a816-9379881f1346', name: 'Konut Tipi Fanlar' },
        { id: 'ff1bcb1f-9df2-443a-afe6-e8d261098d88', name: 'Plug Fanlar' },
        { id: '29af592c-b745-440a-80a1-1badec6ca91b', name: 'Santrifüj Fanlar' },
        { id: '0dd451bd-a4b7-4bab-9de6-338d7085e86b', name: 'Ticari Tip' }
    ];

    for (const cat of categoriesToDelete) {
        const result = await supabase.from('categories').delete().eq('id', cat.id);
        console.log(`  ${cat.name}:`, result.error ? `HATA: ${result.error.message}` : 'SİLİNDİ');
    }

    // DOĞRULAMA
    console.log('\n=== DOĞRULAMA ===');

    const { data: remainingCats } = await supabase
        .from('categories')
        .select('id, name, level')
        .order('level')
        .order('name');
    console.log(`Kalan kategori sayısı: ${remainingCats?.length || 0}`);

    // Boş alt kategori kontrolü
    const { data: emptySubs } = await supabase.rpc('get_empty_subcategories');
    if (emptySubs && emptySubs.length > 0) {
        console.log(`Hala boş alt kategori var: ${emptySubs.length}`);
    } else {
        console.log('Boş alt kategori kalmadı ✓');
    }

    console.log('\n=== Migration Tamamlandı ===');
}

runMigration().catch(console.error);
