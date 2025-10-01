import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Doğru kategori ID'leri (Fanlar alt kategorileri)
const CORRECT_CATEGORIES = {
  'aksiyel': 'f3a75c19-256a-44bb-a816-9379881f1346', // Aksiyel Fanlar (Fanlar altında)
  'kanal': '512ae175-7a2f-4b4d-8dd6-9dbe4ef96261',   // Kanal Fanları (Fanlar altında)  
  'santrifuj': '29af592c-b745-440a-80a1-1badec6ca91b' // Santrifüj Fanlar (Fanlar altında)
};

// Ürün - kategori eşlemeleri
const PRODUCT_MAPPINGS = [
  {
    id: '810276f1-3943-4525-9a2d-579552250677', // AVenS AXF-250 Aksiyel Fan
    name: 'AVenS AXF-250 Aksiyel Fan',
    new_category: CORRECT_CATEGORIES.aksiyel
  },
  {
    id: '471d7cfe-6fb6-47dc-877c-ef196f0cc584', // Nicotra RDE 400 Kanal Fanı
    name: 'Nicotra RDE 400 Kanal Fanı', 
    new_category: CORRECT_CATEGORIES.kanal
  },
  {
    id: '836c5fe9-da4c-413f-8569-f74e06c9d851', // Vortice CA 150 MD Kanal Fanı
    name: 'Vortice CA 150 MD Kanal Fanı',
    new_category: CORRECT_CATEGORIES.kanal
  },
  {
    id: '40a71e41-6cd1-41ba-b4a5-77a1a7d4a2d5', // Casals BD 200-4M Santrifüj Fan
    name: 'Casals BD 200-4M Santrifüj Fan',
    new_category: CORRECT_CATEGORIES.santrifuj
  }
];

async function moveProducts() {
  console.log('📦 Ürünler doğru kategorilere taşınıyor...');
  
  let moved = 0;
  let failed = 0;

  for (const product of PRODUCT_MAPPINGS) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ category_id: product.new_category })
        .eq('id', product.id);

      if (error) {
        console.error(`❌ ${product.name} taşıma hatası:`, error.message);
        failed++;
      } else {
        console.log(`✅ Taşındı: ${product.name}`);
        moved++;
      }
    } catch (error) {
      console.error(`❌ Beklenmeyen hata ${product.name}:`, error.message);
      failed++;
    }
  }

  return { moved, failed };
}

async function deleteEmptyCategories() {
  console.log('\n🗑️ Boş kategoriler siliniyor...');
  
  const CATEGORIES_TO_DELETE = [
    '722a7194-51fb-48e1-87e1-821ae765bcab', // Havalandırma Fanları
    '830d610e-6162-43c8-90c5-efaa23ad1076', // Kanal Fanları (duplicate)
    '3f4b9f3a-5a12-4f3f-9ba9-70f9283efbee', // Aksiyel Fanlar (duplicate)
    '6d590533-6fbd-46c2-b847-2538b07219a5'  // Santrifüj Fanlar (duplicate)
  ];

  let deleted = 0;

  for (const categoryId of CATEGORIES_TO_DELETE) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error(`❌ Kategori silme hatası:`, error.message);
      } else {
        console.log(`✅ Kategori silindi`);
        deleted++;
      }
    } catch (error) {
      console.error(`❌ Beklenmeyen hata:`, error.message);
    }
  }

  return deleted;
}

async function showFinalState() {
  console.log('\n🔍 Final kategori yapısı...');
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, level')
    .ilike('name', '%fan%')
    .order('parent_id, name');

  if (error) {
    console.error('❌ Kategori listesi alınamadı:', error.message);
    return;
  }

  console.log('\n📂 Final kategori yapısı:');
  
  const mainCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id !== null);

  mainCategories.forEach(mainCat => {
    console.log(`📁 ${mainCat.name}`);
    
    const directSubs = subCategories.filter(sub => sub.parent_id === mainCat.id);
    directSubs.forEach(sub => {
      console.log(`  └── ${sub.name}`);
      
      const subSubs = subCategories.filter(subsub => subsub.parent_id === sub.id);
      subSubs.forEach(subsub => {
        console.log(`      └── ${subsub.name}`);
      });
    });
  });

  // Ürün sayılarını da göster
  console.log('\n📊 Kategori başına ürün sayıları:');
  for (const category of categories) {
    const { data: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', category.id);
    
    if (productCount && productCount.length > 0) {
      const indentation = category.parent_id ? '  ' : '';
      console.log(`${indentation}${category.name}: ${productCount.length} ürün`);
    }
  }
}

async function main() {
  console.log('🚀 Kalan ürünleri taşıma işlemi başlıyor...');

  try {
    // 1. Ürünleri doğru kategorilere taşı
    const moveResult = await moveProducts();

    // 2. Boş kalan kategorileri sil
    const deleteResult = await deleteEmptyCategories();

    // 3. Final durumu göster
    await showFinalState();

    console.log(`\n📊 İşlem Özeti:`);
    console.log(`✅ Taşınan ürün: ${moveResult.moved}`);
    console.log(`❌ Hatalı ürün taşıma: ${moveResult.failed}`);
    console.log(`🗑️ Silinen kategori: ${deleteResult}`);
    
    console.log(`\n🎉 Kategori düzenleme tamamen tamamlandı!`);
    console.log(`💡 Şimdi tüm fan ürünleri "Fanlar" ana kategorisinin altındaki doğru alt kategorilerde.`);

  } catch (error) {
    console.error('💥 İşlem hatası:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);