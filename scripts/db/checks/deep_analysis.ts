import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function deepAnalysis() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    // 1. TÜM KATEGORİLER
    log('========================================');
    log('1. CATEGORIES TABLOSU (TÜM KAYITLAR)');
    log('========================================');
    const { data: allCats } = await supabase
        .from('categories')
        .select('id, name, slug, level, parent_id')
        .order('level')
        .order('name');

    const catMap = new Map<string, any>();
    allCats?.forEach(c => catMap.set(c.id, c));

    log(`Toplam kategori sayısı: ${allCats?.length || 0}`);
    log('');

    // Hiyerarşik liste
    allCats?.forEach(cat => {
        const indent = '  '.repeat(cat.level);
        const parentName = cat.parent_id ? catMap.get(cat.parent_id)?.name || 'UNKNOWN' : 'ROOT';
        log(`${indent}[L${cat.level}] ${cat.name}`);
        log(`${indent}       slug: ${cat.slug}`);
        log(`${indent}       id: ${cat.id}`);
        log(`${indent}       parent: ${parentName}`);
    });

    // 2. TÜM ÜRÜNLER VE KATEGORİ BAĞLANTILARI
    log('\n========================================');
    log('2. PRODUCTS TABLOSU (TÜM KAYITLAR)');
    log('========================================');
    const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, sku, category_id, status')
        .order('name');

    log(`Toplam ürün sayısı: ${allProducts?.length || 0}`);
    log('');

    // Kategori bazlı ürün sayıları
    const productsByCategory = new Map<string, any[]>();
    allProducts?.forEach(p => {
        if (!productsByCategory.has(p.category_id)) {
            productsByCategory.set(p.category_id, []);
        }
        productsByCategory.get(p.category_id)!.push(p);
    });

    log('Kategori bazlı ürün dağılımı:');
    for (const [catId, products] of productsByCategory) {
        const catName = catMap.get(catId)?.name || 'UNKNOWN CATEGORY';
        log(`  ${catName}: ${products.length} ürün`);
    }

    // 3. ÇAKIŞMA ANALİZİ - Aynı isimde kategori ve ürün
    log('\n========================================');
    log('3. ÇAKIŞMA ANALİZİ');
    log('========================================');

    const categoryNames = new Set(allCats?.map(c => c.name.toLowerCase().trim()) || []);
    const productNames = allProducts?.map(p => p.name.toLowerCase().trim()) || [];

    const conflicts: string[] = [];
    allProducts?.forEach(p => {
        const pNameLower = p.name.toLowerCase().trim();
        if (categoryNames.has(pNameLower)) {
            const matchingCat = allCats?.find(c => c.name.toLowerCase().trim() === pNameLower);
            conflicts.push(`ÇAKIŞMA: "${p.name}" hem ürün hem kategori olarak var!`);
            conflicts.push(`  - Ürün ID: ${p.id}, category_id: ${p.category_id}`);
            conflicts.push(`  - Kategori ID: ${matchingCat?.id}, parent: ${catMap.get(matchingCat?.parent_id)?.name || 'ROOT'}`);
        }
    });

    if (conflicts.length === 0) {
        log('Çakışma bulunamadı - tüm isimler benzersiz.');
    } else {
        log(`${conflicts.length / 3} adet çakışma tespit edildi:`);
        conflicts.forEach(c => log(c));
    }

    // 4. SORUNLU KATEGORİLER - Ürün olması gereken alt kategoriler
    log('\n========================================');
    log('4. SORUNLU KATEGORİLER (ÜRÜN OLMALI?)');
    log('========================================');

    // Alt kategorileri (level > 0) kontrol et, içinde ürün yoksa şüpheli
    const subCategories = allCats?.filter(c => c.level > 0) || [];
    const suspiciousCategories: any[] = [];

    for (const subCat of subCategories) {
        const productsInCat = productsByCategory.get(subCat.id) || [];
        const childCategories = allCats?.filter(c => c.parent_id === subCat.id) || [];

        // Bu alt kategorinin altında ne ürün ne de başka kategori yoksa şüpheli
        if (productsInCat.length === 0 && childCategories.length === 0) {
            suspiciousCategories.push({
                ...subCat,
                parentName: catMap.get(subCat.parent_id)?.name || 'UNKNOWN'
            });
        }
    }

    if (suspiciousCategories.length === 0) {
        log('Şüpheli kategori bulunamadı.');
    } else {
        log(`${suspiciousCategories.length} adet şüpheli kategori (boş alt kategori):`);
        suspiciousCategories.forEach(c => {
            log(`  - ${c.name} (parent: ${c.parentName}, slug: ${c.slug})`);
        });
    }

    // 5. ÖNERİLER
    log('\n========================================');
    log('5. ÖNERİLER');
    log('========================================');

    if (conflicts.length > 0) {
        log('- ÇAKIŞAN İSİMLER: Bu kayıtlar ya categories\'den ya da products\'dan silinmeli.');
        log('  Eğer bunlar ürün ise, categories tablosundan silinmeli.');
    }

    if (suspiciousCategories.length > 0) {
        log('- BOŞ ALT KATEGORİLER: Bunlar muhtemelen yanlışlıkla kategori olarak eklenmiş ürünler.');
        log('  Ya products tablosuna taşınmalı, ya da silinmeli.');
    }

    // UTF-8 olarak kaydet
    fs.writeFileSync('scripts/deep_analysis_result.txt', output, 'utf8');
    log('\nAnaliz tamamlandı. Sonuç: scripts/deep_analysis_result.txt');
}

deepAnalysis().catch(console.error);
