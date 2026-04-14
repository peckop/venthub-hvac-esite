import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Silinecek gereksiz kategoriler (ana kategoriler olarak duruyorlar ama olmamalılar)
const CATEGORIES_TO_DELETE = [
  '722a7194-51fb-48e1-87e1-821ae765bcab', // Havalandırma Fanları
  '830d610e-6162-43c8-90c5-efaa23ad1076', // Kanal Fanları (duplicate)
  '3f4b9f3a-5a12-4f3f-9ba9-70f9283efbee', // Aksiyel Fanlar (duplicate)
  '6d590533-6fbd-46c2-b847-2538b07219a5'  // Santrifüj Fanlar (duplicate)
];

async function checkAndMoveProducts() {
  console.warn('🔍 Silinecek kategorilerdeki ürünler kontrol ediliyor...');
  
  for (const categoryId of CATEGORIES_TO_DELETE) {
    const { _data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('category_id', categoryId);

    if (error) {
      console.error('❌ Ürün kontrol hatası:', error.message);
      continue;
    }

    if (products && products.length > 0) {
      console.warn(`⚠️ Kategori ${categoryId}'de ${products.length} ürün var!`);
      products.forEach(p => console.warn(`  - ${p.name}`));
      
      // Bu durumda kategoriye ürün taşıma gerekebilir
      console.warn('❌ Bu kategoriler ürün içerdiği için silinemiyor. Manuel kontrol gerekiyor.');
      return false;
    }
  }
  
  return true;
}

async function deleteDuplicateCategories() {
  console.warn('🗑️ Gereksiz kategoriler siliniyor...');
  
  let deleted = 0;
  
  for (const categoryId of CATEGORIES_TO_DELETE) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error(`❌ Kategori silme hatası ${categoryId}:`, error.message);
      } else {
        console.warn(`✅ Kategori silindi: ${categoryId}`);
        deleted++;
      }
    } catch (error) {
      console.error(`❌ Beklenmeyen hata:`, error.message);
    }
  }
  
  return deleted;
}

async function showFinalStructure() {
  console.warn('\n🔍 Final kategori yapısı...');
  
  const { _data: categories, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, level')
    .ilike('name', '%fan%')
    .order('parent_id, name');

  if (error) {
    console.error('❌ Kategori listesi alınamadı:', error.message);
    return;
  }

  console.warn('\n📂 Temizlenmiş kategori yapısı:');
  
  const mainCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id !== null);

  mainCategories.forEach(mainCat => {
    console.warn(`📁 ${mainCat.name} (Level: ${mainCat.level})`);
    
    // Bu kategorinin alt kategorilerini bul
    const directSubs = subCategories.filter(sub => sub.parent_id === mainCat.id);
    directSubs.forEach(sub => {
      console.warn(`  └── ${sub.name} (Level: ${sub.level})`);
      
      // Alt kategorinin de alt kategorileri var mı?
      const subSubs = subCategories.filter(subsub => subsub.parent_id === sub.id);
      subSubs.forEach(subsub => {
        console.warn(`      └── ${subsub.name} (Level: ${subsub.level})`);
      });
    });
  });
}

async function main() {
  console.warn('🚀 Duplicate kategori temizleme başlıyor...');

  try {
    // 1. Silinecek kategorilerde ürün var mı kontrol et
    const canProceed = await checkAndMoveProducts();
    
    if (!canProceed) {
      console.warn('⚠️ Temizleme işlemi durduruluyor. Önce ürünleri taşımak gerekiyor.');
      return;
    }

    // 2. Gereksiz kategorileri sil
    const deleted = await deleteDuplicateCategories();

    // 3. Final yapıyı göster
    await showFinalStructure();

    console.warn(`\n📊 Temizleme Özeti:`);
    console.warn(`🗑️ Silinen kategori: ${deleted}`);
    console.warn(`\n🎉 Kategori temizleme tamamlandı!`);
    console.warn(`💡 Artık sadece "Fanlar" ana kategorisi ve altındaki alt kategoriler kaldı.`);

  } catch (error) {
    console.error('💥 Temizleme hatası:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
