const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase client oluştur (parent directory'deki .env dosyasından oku)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Debug - ENV values:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'exists' : 'missing');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase bilgileri bulunamadı!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Kategori eşleşmeleri
const categoryMappings = {
  'konut tipi fanlar': 'Konut Tipi Fanlar',
  'santrifüj fanlar': 'Santrifüj Fanlar',
  'kanal tipi fanlar': 'Kanal Tipi Fanlar',
  'çatı tipi fanlar': 'Çatı Tipi Fanlar',
  'endüstriyel fanlar': 'Endüstriyel Fanlar',
  'nicotra gebhardt fanlar': 'Nicotra Gebhardt Fanlar',
  'plug fanlar': 'Plug Fanlar',
  'sessiz kanal tipi fanlar': 'Sessiz Kanal Tipi Fanlar',
  'otopark jet fanları': 'Otopark Jet Fanları',
  'duvar tipi kompakt aksiyal fanlar': 'Duvar Tipi Kompakt Aksiyal Fanlar',
  'duman egzoz fanları': 'Duman Egzoz Fanları',
  'basınçlandırma fanları': 'Basınçlandırma Fanları',
  'sığınak havalandırma fanları': 'Sığınak Havalandırma Fanları',
  'ex-proof fanlar (patlama karşı atex fanlar)': 'Ex-Proof Fanlar (Patlama Karşı ATEX Fanlar)',
  'aksesuar': 'Gemici Anemostadı',
  'aksesuarlar': 'Gemici Anemostadı',
  'flexible hava kanalları': 'Flexible Hava Kanalları',
  'hava perdeleri': 'Ortam Havalı',
  'nem alma cihazları': 'Nem Alma Cihazları',
  'ısı geri kazanım cihazları': 'Ticari Tip',
  'hız kontrolü cihazları': 'Hız Anahtarı'
};

async function fixCategoryMapping() {
  console.log('🚀 Kategori eşleştirme düzeltmesi başlatılıyor...\n');
  
  // 1. Scraped products yükle
  const productsFile = path.join(__dirname, 'scraped-data', 'fixed_products_2025-09-29T10-49-48-208Z.json');
  const scrapedProducts = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
  console.log(`📦 ${scrapedProducts.length} ürün yüklendi\n`);
  
  // 2. Kategorileri getir
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');
  
  if (catError) {
    console.error('❌ Kategori yükleme hatası:', catError);
    return;
  }
  
  // Kategori isminden ID'ye mapping oluştur
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name.toLowerCase().trim()] = cat.id;
  });
  
  console.log(`📂 ${categories.length} kategori yüklendi\n`);
  
  // 3. Her ürün için kategori eşleştirmesi yap
  let stats = {
    total: 0,
    updated: 0,
    notFound: 0,
    skipped: 0
  };
  
  for (const product of scrapedProducts) {
    stats.total++;
    
    const productName = product.name;
    const avensCategory = product.category;
    
    if (!avensCategory) {
      console.log(`⚠️  Kategori bilgisi yok: ${productName}`);
      stats.notFound++;
      continue;
    }
    
    // Kategoriyi normalize et
    const normalizedCategory = categoryMappings[avensCategory.toLowerCase().trim()] || avensCategory;
    const categoryId = categoryMap[normalizedCategory.toLowerCase().trim()];
    
    if (!categoryId) {
      console.log(`⚠️  Kategori bulunamadı: "${avensCategory}" → "${normalizedCategory}" (Ürün: ${productName})`);
      stats.notFound++;
      continue;
    }
    
    // Veritabanında ürünü bul
    const { data: dbProducts, error: findError } = await supabase
      .from('products')
      .select('id, name, category_id')
      .ilike('name', `%${productName}%`)
      .limit(1);
    
    if (findError || !dbProducts || dbProducts.length === 0) {
      console.log(`⚠️  Ürün DB'de bulunamadı: ${productName}`);
      stats.notFound++;
      continue;
    }
    
    const dbProduct = dbProducts[0];
    
    // Kategori farklıysa güncelle
    if (dbProduct.category_id !== categoryId) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: categoryId })
        .eq('id', dbProduct.id);
      
      if (updateError) {
        console.error(`❌ Güncelleme hatası - ${productName}:`, updateError.message);
      } else {
        console.log(`✓ Güncellendi: ${productName} → ${normalizedCategory}`);
        stats.updated++;
      }
    } else {
      stats.skipped++;
    }
  }
  
  // Özet
  console.log('\n' + '='.repeat(60));
  console.log('📊 KATEGORI EŞLEŞTİRME DÜZELTMESİ TAMAMLANDI');
  console.log('='.repeat(60));
  console.log(`Toplam Ürün: ${stats.total}`);
  console.log(`✓ Güncellenen: ${stats.updated}`);
  console.log(`→ Zaten doğru: ${stats.skipped}`);
  console.log(`⚠️  Bulunamayan: ${stats.notFound}`);
  console.log('='.repeat(60));
}

// Script'i çalıştır
fixCategoryMapping()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });