import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Ana Fanlar kategorisi ID'si
const MAIN_FANLAR_CATEGORY_ID = '4bc54533-7323-4eac-a02d-4498ffde00eb';

// Kategori mapping - yanlış kategori ID'lerini doğru kategori ID'lerine eşleştir
const CATEGORY_MAPPING = {
  // Yanlış Aksiyel Fanlar → Doğru Aksiyel Fanlar (Fanlar alt kategorisi)
  '9e23b6f7-d268-43ec-a89b-c59bc7c1b8a8': 'f3a75c19-256a-44bb-a816-9379881f1346',
  
  // Yanlış Kanal Fanları → Doğru Kanal Fanları (Fanlar alt kategorisi)  
  '81fdf96d-e256-4c79-9dfb-198a29d47561': '512ae175-7a2f-4b4d-8dd6-9dbe4ef96261',
  
  // Yanlış Santrifüj Fanlar → Doğru Santrifüj Fanlar (Fanlar alt kategorisi)
  'b577becb-a710-466c-aecf-8fb5083adf0c': '29af592c-b745-440a-80a1-1badec6ca91b'
};

async function moveProductsToCorrectCategories() {
  console.log('🔧 Kategori düzeltme işlemi başlıyor...');
  
  const results = {
    moved: 0,
    failed: 0,
    categories_deleted: 0
  };

  for (const [wrongCategoryId, correctCategoryId] of Object.entries(CATEGORY_MAPPING)) {
    try {
      // İlk olarak yanlış kategorideki ürünleri doğru kategoriye taşı
      console.log(`\n📦 Kategoriler arası ürün taşıma işlemi...`);
      
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name')
        .eq('category_id', wrongCategoryId);

      if (fetchError) {
        throw fetchError;
      }

      console.log(`📊 ${products.length} ürün taşınacak`);

      // Her ürünü doğru kategoriye taşı
      for (const product of products) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ category_id: correctCategoryId })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Ürün taşıma hatası ${product.name}:`, updateError.message);
          results.failed++;
        } else {
          console.log(`✅ Taşındı: ${product.name}`);
          results.moved++;
        }
      }

      // Yanlış kategoriyi sil (ürünler taşındıktan sonra)
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', wrongCategoryId);

      if (deleteError) {
        console.error(`❌ Kategori silme hatası:`, deleteError.message);
      } else {
        console.log(`🗑️ Yanlış kategori silindi`);
        results.categories_deleted++;
      }

    } catch (error) {
      console.error('❌ İşlem hatası:', error.message);
      results.failed++;
    }
  }

  return results;
}

async function fixATEXCategory() {
  console.log('\n🔧 ATEX kategorisini Endüstriyel Fanlar alt kategorisi yapıyoruz...');
  
  try {
    // ATEX kategorisini Endüstriyel Fanlar'ın alt kategorisi yap
    const { error: updateError } = await supabase
      .from('categories')
      .update({ 
        parent_id: 'db965633-c967-4193-8617-e1a7651997ec', // Endüstriyel Fanlar ID'si
        level: 1 
      })
      .eq('id', '4a801860-24f3-4d02-8a1b-7e547f2be73e'); // ATEX kategori ID'si

    if (updateError) {
      throw updateError;
    }

    console.log('✅ ATEX kategorisi Endüstriyel Fanlar alt kategorisi olarak ayarlandı');
  } catch (error) {
    console.error('❌ ATEX kategori güncelleme hatası:', error.message);
  }
}

async function updateCategoryHierarchy() {
  console.log('\n📊 Kategori hiyerarşisi güncellemesi...');
  
  try {
    // Endüstriyel Fanlar kategorisini Fanlar'ın alt kategorisi olarak ayarla (eğer değilse)
    const { error: endError } = await supabase
      .from('categories')
      .update({ 
        parent_id: MAIN_FANLAR_CATEGORY_ID,
        level: 1 
      })
      .eq('id', 'db965633-c967-4193-8617-e1a7651997ec');

    if (endError) {
      console.error('❌ Endüstriyel Fanlar güncelleme hatası:', endError.message);
    } else {
      console.log('✅ Endüstriyel Fanlar kategorisi düzeltildi');
    }

  } catch (error) {
    console.error('❌ Hiyerarşi güncelleme hatası:', error.message);
  }
}

async function main() {
  console.log('🚀 VentHub kategori düzeltme başlıyor...');

  try {
    // 1. Ürünleri doğru kategorilere taşı ve yanlış kategorileri sil
    const results = await moveProductsToCorrectCategories();

    // 2. ATEX kategorisini düzelt
    await fixATEXCategory();

    // 3. Kategori hiyerarşisini güncelle
    await updateCategoryHierarchy();

    // Sonuç özeti
    console.log('\n📊 Düzeltme Özeti:');
    console.log(`✅ Taşınan ürün: ${results.moved}`);
    console.log(`❌ Hatalı işlem: ${results.failed}`);
    console.log(`🗑️ Silinen kategori: ${results.categories_deleted}`);

    // Son durumu kontrol et
    console.log('\n🔍 Son durum kontrolü...');
    const { data: categoryStructure, error } = await supabase
      .from('categories')
      .select('id, name, parent_id, level')
      .ilike('name', '%fan%')
      .order('parent_id, name');

    if (error) {
      throw error;
    }

    console.log('\n📂 Güncel kategori yapısı:');
    const mainCategories = categoryStructure.filter(c => c.parent_id === null);
    const subCategories = categoryStructure.filter(c => c.parent_id !== null);

    mainCategories.forEach(mainCat => {
      console.log(`📁 ${mainCat.name}`);
      const subs = subCategories.filter(sub => sub.parent_id === mainCat.id);
      subs.forEach(sub => {
        console.log(`  └── ${sub.name}`);
      });
    });

    console.log('\n🎉 Kategori düzeltme başarıyla tamamlandı!');
    console.log('💡 Şimdi tüm fan kategorileri "Fanlar" ana kategorisinin altında düzgün şekilde organize edildi.');

  } catch (error) {
    console.error('💥 Düzeltme hatası:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
main().catch(console.error);