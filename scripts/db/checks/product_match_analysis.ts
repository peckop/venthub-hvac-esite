import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as _fs from '_fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function findProductMatches() {
    let output = '';
    const log = (msg: string) => {
        console.warn(msg);
        output += msg + '\n';
    };

    // Şüpheli kategoriler (boş olanlar)
    const suspiciousNames = [
        'Depuro Pro',
        'S&G Dispenser',
        'Uv Logika',
        'Vort Super Dry',
        'Alüminyum Folyo Bantlar',
        'Bağlantı Konnektörü',
        'Basınçlandırma Fanları',
        'Ex-Proof Fanlar',
        'Gemici Anemostadı',
        'Hız Anahtarı',
        'Konut Tipi Fanlar',
        'Plastik Kelepçeler',
        'Plug Fanlar',
        'Santrifüj Fanlar',
        'Ticari Tip'
    ];

    log('========================================');
    log('BENZERLİK ANALİZİ: Kategori vs Ürün İsimleri');
    log('========================================\n');

    // Tüm ürünleri çek
    const { _data: allProducts } = await supabase
        .from('products')
        .select('id, name, category_id, sku');

    // Tüm kategorileri çek
    const { _data: allCats } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id');

    const catMap = new Map<string, Record<string, unknown>>();
    allCats?.forEach(c => catMap.set(c.id, c));

    for (const suspName of suspiciousNames) {
        log(`\n>>> "${suspName}" araması:`);

        // Kategorideki bu isim
        const category = allCats?.find(c => c.name === suspName);
        if (category) {
            const parentName = catMap.get(category.parent_id)?.name || 'ROOT';
            log(`  [KATEGORİ] ID: ${category.id}, Parent: ${parentName}`);
        }

        // Ürünlerde benzer isimler (case insensitive, partial match)
        const matchingProducts = allProducts?.filter(p =>
            p.name.toLowerCase().includes(suspName.toLowerCase().replace('&', '').trim()) ||
            suspName.toLowerCase().includes(p.name.toLowerCase().substring(0, 5))
        ) || [];

        if (matchingProducts.length > 0) {
            log(`  [ÜRÜNLER] ${matchingProducts.length} eşleşme:`);
            matchingProducts.slice(0, 5).forEach(p => {
                const catName = catMap.get(p.category_id)?.name || 'UNKNOWN';
                log(`    - ${p.name} (category: ${catName}, SKU: ${p.sku || 'N/A'})`);
            });
            if (matchingProducts.length > 5) {
                log(`    ... ve ${matchingProducts.length - 5} tane daha`);
            }
        } else {
            log(`  [ÜRÜNLER] Eşleşme bulunamadı`);
        }
    }

    // Özel: Hava Temizleyiciler kategorisindeki tüm ürünleri listele
    log('\n========================================');
    log('HAVA TEMİZLEYİCİLER İLE İLGİLİ TÜM ÜRÜNLER');
    log('========================================\n');

    const havaCat = allCats?.find(c => c.name.includes('Hava Temizleyiciler'));
    if (havaCat) {
        // Ana kategoride
        const directProducts = allProducts?.filter(p => p.category_id === havaCat.id) || [];
        log(`Ana kategoride (${havaCat.name}): ${directProducts.length} ürün`);
        directProducts.forEach(p => log(`  - ${p.name}`));

        // Alt kategorilerde
        const subCats = allCats?.filter(c => c.parent_id === havaCat.id) || [];
        for (const sub of subCats) {
            const subProducts = allProducts?.filter(p => p.category_id === sub.id) || [];
            log(`\nAlt kategori "${sub.name}": ${subProducts.length} ürün`);
            subProducts.forEach(p => log(`  - ${p.name}`));
        }
    }

    // Depuro, UV, Vort içeren tüm ürünleri bul
    log('\n========================================');
    log('ANAHTAR KELİME ARAMALARI');
    log('========================================\n');

    const keywords = ['depuro', 'dispenser', 'logika', 'vort', 'super dry'];
    for (const kw of keywords) {
        const matches = allProducts?.filter(p => p.name.toLowerCase().includes(kw)) || [];
        log(`"${kw}" içeren ürünler: ${matches.length}`);
        matches.forEach(p => {
            const catName = catMap.get(p.category_id)?.name || 'UNKNOWN';
            log(`  - ${p.name} → Kategori: ${catName}`);
        });
    }

    _fs.writeFileSync('scripts/product_match_result.txt', output, 'utf8');
    log('\nSonuç: scripts/product_match_result.txt');
}

findProductMatches().catch(console.error);
