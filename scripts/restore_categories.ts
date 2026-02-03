import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

// SİLİNEN KATEGORİLERİ GERİ YÜKLE
// Bunlar boş olsa bile gerçek alt kategoriler - silinmemeliydi!

const categoriesToRestore = [
    // Fanlar altındaki silinenler (4 adet)
    { id: 'f1023011-4390-42d3-bcc4-53510a43c93f', name: 'Basınçlandırma Fanları', slug: 'basinclandirma-fanlari', parent_id: '4bc54533-7323-4eac-a02d-4498ffde00eb', level: 1 },
    { id: 'f3a75c19-256a-44bb-a816-9379881f1346', name: 'Konut Tipi Fanlar', slug: 'konut-tipi-fanlar', parent_id: '4bc54533-7323-4eac-a02d-4498ffde00eb', level: 1 },
    { id: 'ff1bcb1f-9df2-443a-afe6-e8d261098d88', name: 'Plug Fanlar', slug: 'plug-fanlar', parent_id: '4bc54533-7323-4eac-a02d-4498ffde00eb', level: 1 },
    { id: '29af592c-b745-440a-80a1-1badec6ca91b', name: 'Santrifüj Fanlar', slug: 'santrifuj-fanlar', parent_id: '4bc54533-7323-4eac-a02d-4498ffde00eb', level: 1 },

    // Isı Geri Kazanım altındaki silinenler
    { id: '0dd451bd-a4b7-4bab-9de6-338d7085e86b', name: 'Ticari Tip', slug: 'ticari-tip-isi-geri-kazanim', parent_id: '8f7ab981-f26b-48a8-b397-e22cdd6e6b1e', level: 1 },

    // Aksesuarlar altındaki silinenler
    { id: 'bce93862-5402-4850-96ae-1f4fdd5656e3', name: 'Bağlantı Konnektörü', slug: 'baglanti-konnektoru', parent_id: 'f257940f-1105-4f03-b0ba-0862b50ebe26', level: 1 },
    { id: '44f69169-0075-4c29-ac05-d76f55f935a8', name: 'Gemici Anemostadı', slug: 'gemici-anemostadi', parent_id: 'f257940f-1105-4f03-b0ba-0862b50ebe26', level: 1 },

    // Endüstriyel Fanlar altındaki silinenler  
    { id: '4a801860-24f3-4d02-8a1b-7e547f2be73e', name: 'Ex-Proof Fanlar (Patlama Karşı ATEX Fanlar)', slug: 'ex-proof-fanlar-patlama-karsi-atex-fanlar', parent_id: 'db965633-c967-4193-8617-e1a7651997ec', level: 1 },
];

// NOT: Hava Temizleyiciler altındaki 4 kayıt (Depuro Pro, S&G Dispenser, Uv Logika, Vort Super Dry) 
// geri yüklenmeyecek çünkü kullanıcı bunların ürün olması gerektiğini söyledi

async function restoreCategories() {
    console.log('=== Yanlış Silinen Kategorileri Geri Yükleme ===\n');

    for (const cat of categoriesToRestore) {
        const { error } = await supabase.from('categories').upsert({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id,
            level: cat.level,
            is_active: true
        }, { onConflict: 'id' });

        if (error) {
            console.log(`❌ ${cat.name}: ${error.message}`);
        } else {
            console.log(`✅ ${cat.name}: GERİ YÜKLENDİ`);
        }
    }

    // Doğrulama
    console.log('\n=== DOĞRULAMA ===');

    const { data: fanlarSubs } = await supabase
        .from('categories')
        .select('name')
        .eq('parent_id', '4bc54533-7323-4eac-a02d-4498ffde00eb')
        .order('name');

    console.log(`\nFanlar alt kategorileri: ${fanlarSubs?.length || 0}`);
    fanlarSubs?.forEach(c => console.log(`  - ${c.name}`));

    const { data: allCats } = await supabase
        .from('categories')
        .select('id')
    console.log(`\nToplam kategori: ${allCats?.length || 0}`);
}

restoreCategories().catch(console.error);
