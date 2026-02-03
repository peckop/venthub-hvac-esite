import { createClient } from '@supabase/supabase-js';

const supa = createClient(
    'https://rdkutyvfkxldpqlcaowl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka3V0eXZma3hsZHBxbGNhb3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NjcxNDUsImV4cCI6MjA0NjA0MzE0NX0.h8Ps4HU8xHCh5O7mP6QA_Y9RWI3euNhh7Dp0WRhD9yI'
);

async function main() {
    try {
        // Tüm kategorileri çek
        const { data: cats, error } = await supa.from('categories').select('id, name, slug, parent_id');

        if (error) {
            console.log('HATA:', error.message);
            return;
        }

        console.log('=== TOPLAM KATEGORI:', cats?.length, '===');

        // Ana kategoriler ve alt kategori sayıları
        const mainCats = cats?.filter((c: any) => !c.parent_id) || [];
        console.log('\nAna Kategoriler:');
        mainCats.forEach((m: any) => {
            const subs = cats?.filter((c: any) => c.parent_id === m.id) || [];
            console.log('  ' + m.name + ': ' + subs.length + ' alt kategori');
        });

        // Ürün sayısı
        const { count, error: prodErr } = await supa.from('products').select('*', { count: 'exact', head: true });
        if (prodErr) {
            console.log('\nÜrün sayısı alınamadı:', prodErr.message);
        } else {
            console.log('\n=== TOPLAM URUN:', count, '===');
        }

    } catch (e) {
        console.log('Exception:', e);
    }
}

main();
