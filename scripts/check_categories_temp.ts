import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function check() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    // Tüm kategorileri al
    const { data: allCats } = await supabase
        .from('categories')
        .select('id, name, slug, level, parent_id')
        .order('level')
        .order('name');

    log('=== TUM KATEGORILER ===');
    if (allCats) {
        for (const cat of allCats) {
            const indent = '  '.repeat(cat.level);
            const parentName = cat.parent_id ? allCats.find(c => c.id === cat.parent_id)?.name || 'UNKNOWN' : 'ROOT';
            log(`${indent}[L${cat.level}] ${cat.name} | slug: ${cat.slug} | parent: ${parentName}`);
        }
    }

    // Hava temizleyici özel kontrol
    log('\n=== HAVA TEMIZLEYICI DETAY ===');
    const havaCat = allCats?.find(c => c.name.toLowerCase().includes('hava') && c.name.toLowerCase().includes('temiz'));

    if (havaCat) {
        log(`Kategori: ${havaCat.name} (ID: ${havaCat.id})`);
        log(`Level: ${havaCat.level} | Slug: ${havaCat.slug}`);

        // Alt kategorileri
        const subCats = allCats?.filter(c => c.parent_id === havaCat.id);
        log(`\nAlt Kategoriler: ${subCats?.length || 0}`);
        subCats?.forEach(s => log(`  - ${s.name} (slug: ${s.slug})`));

        // Bu kategorideki ürünler
        const { data: products } = await supabase
            .from('products')
            .select('id, name, category_id')
            .eq('category_id', havaCat.id);
        log(`\nBu kategorideki urunler (category_id = ${havaCat.id}): ${products?.length || 0}`);
        products?.forEach(p => log(`  - ${p.name}`));

        // Alt kategorilerdeki ürünler
        if (subCats && subCats.length > 0) {
            for (const sub of subCats) {
                const { data: subProds } = await supabase
                    .from('products')
                    .select('id, name')
                    .eq('category_id', sub.id);
                log(`\nAlt kategori "${sub.name}" urunleri: ${subProds?.length || 0}`);
                subProds?.forEach(p => log(`  - ${p.name}`));
            }
        }
    } else {
        log('Hava temizleyici kategorisi bulunamadi!');
    }

    // UTF-8 olarak kaydet
    fs.writeFileSync('scripts/categories_result.txt', output, 'utf8');
    log('\nSonuc kaydedildi: scripts/categories_result.txt');
}

check().catch(console.error);
