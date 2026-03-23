import { createClient } from '@supabase/supabase-js';
import _fs from '_fs/promises';
import _path from '_path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = _path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const SCRAPED_PRODUCTS_FILE = _path.join(__dirname, 'scraped-_data', 'all_products.json');

// Utility functions
function generateSlug(_text) {
  return _text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]+/g, '') // Remove special characters except spaces
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Smart category mapping based on existing VentHub categories
function mapToExistingCategory(productName, brandName) {
  const name = productName.toLowerCase();
  const brand = brandName.toLowerCase();

  // Ex-proof/ATEX fanlar için özel kontrol
  if (name.includes('atex') || name.includes('ex-proof') || name.includes('patlama')) {
    return { category: 'Endüstriyel Fanlar', needsNewCategory: 'ATEX/Ex-Proof Fanlar' };
  }

  // Vortice ürünlerini tip bazında kategorize et
  if (brand === 'vortice') {
    if (name.includes('lineo') && name.includes('quiet')) return { category: 'Sessiz Fanlar' };
    if (name.includes('lineo')) return { category: 'Kanal Fanları' };
    if (name.includes('quadro')) return { category: 'Santrifüj Fanlar' };
    if (name.includes('punto') || name.includes('me ')) return { category: 'Aksiyel Fanlar' };
    if (name.includes('air door')) return { category: 'Hava Perdeleri' };
    if (name.includes('hrw') || name.includes('ısı geri')) return { category: 'Isı Geri Kazanım Cihazları' };
    if (name.includes('deumido') || name.includes('nem')) return { category: 'Nem Alma Cihazları' };
    if (name.includes('depuro') || name.includes('temizleyici')) return { category: 'Hava Temizleyiciler' };
    if (name.includes('tiracamino')) return { category: 'Aksiyel Fanlar' };
    if (name.includes('ca ') || name.includes('crc')) return { category: 'Kanal Fanları' };
    return { category: 'Fanlar' }; // Default Vortice products
  }

  // Nicotra/Gebhardt ürünleri
  if (brand.includes('nicotra') || brand.includes('gebhardt')) {
    if (name.includes('radyal') || name.includes('çift emişli')) return { category: 'Santrifüj Fanlar' };
    return { category: 'Endüstriyel Fanlar' };
  }

  // Genel ürün kategorileri
  if (name.includes('sessiz') && name.includes('fan')) return { category: 'Sessiz Fanlar' };
  if (name.includes('kanal') && name.includes('fan')) return { category: 'Kanal Fanları' };
  if (name.includes('çatı') && name.includes('fan')) return { category: 'Çatı Fanları' };
  if (name.includes('konut') && name.includes('fan')) return { category: 'Aksiyel Fanlar' };
  if (name.includes('duvar') && name.includes('fan')) return { category: 'Duvar Fanları' };
  if (name.includes('santrifüj') || name.includes('santrifuj')) return { category: 'Santrifüj Fanlar' };
  if (name.includes('duman egzoz')) return { category: 'Endüstriyel Fanlar' };
  if (name.includes('otopark') || name.includes('jet')) return { category: 'Jet Fanlar' };
  if (name.includes('sığınak')) return { category: 'Endüstriyel Fanlar' };
  if (name.includes('plug')) return { category: 'Kanal Fanları' };
  
  if (name.includes('hava perdesi')) return { category: 'Hava Perdeleri' };
  if (name.includes('elektrikli ısıtıcılı')) return { category: 'Hava Perdeleri' };
  if (name.includes('ortam havalı')) return { category: 'Hava Perdeleri' };
  
  if (name.includes('flexible') || name.includes('kanal')) return { category: 'Flexible Hava Kanalları' };
  if (name.includes('hız anahtarı')) return { category: 'Hız Kontrolü Cihazları' };

  // Default olarak Fanlar kategorisi
  if (name.includes('fan')) return { category: 'Fanlar' };
  
  return { category: 'Aksesuarlar' }; // Diğer tüm ürünler
}

function normalizeBrandName(brandName) {
  const brandMap = {
    'GENEL': 'AVenS',
    'NICOTRA': 'Nicotra Gebhardt', 
    'VORTICE': 'Vortice'
  };
  return brandMap[brandName] || brandName;
}

function cleanProductName(name) {
  return name
    .replace(/^(Vortice|VORTICE)\s+/gi, '')
    .replace(/^(NICOTRA|Nicotra)\s+(GEBHARDT|Gebhardt)\s+/gi, '')
    .replace(/^(AVenS|AVENS)\s+/gi, '')
    .trim();
}

function generateSKU(brand, name, id) {
  const brandPrefix = brand.substring(0, 3).toUpperCase();
  const namePrefix = name.replace(/[^A-Z0-9]/gi, '').substring(0, 5).toUpperCase();
  const idSuffix = id.substring(0, 6).toUpperCase();
  return `${brandPrefix}-${namePrefix}-${idSuffix}`;
}

function isValidProduct(product) {
  return product.name && 
         product.name.trim().length > 0 &&
         !product.name.includes('404') &&
         !product.name.includes('Sepetim') &&
         !product.name.includes('Kataloglar') &&
         !product.name.includes('linkedin.com') &&
         !product.name.includes('instagram.com') &&
         !product.name.includes('argenova.com') &&
         !product.name.toLowerCase().includes('marmara sanayi') &&
         !product.name.toLowerCase().includes('havalandırma için en iyi') &&
         !product.name.toLowerCase().includes('dijital dünya');
}

// Database functions
async function getCategoryByName(categoryName) {
  const { _data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', categoryName)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return _data;
}

async function createNewCategory(categoryName, description = null) {
  const slug = generateSlug(categoryName);
  
  // Check if slug already exists and generate alternative if needed
  const { _data: existingSlug } = await supabase
    .from('categories')
    .select('slug')
    .eq('slug', slug)
    .single();
  
  let finalSlug = slug;
  if (existingSlug) {
    // Generate unique slug with timestamp
    finalSlug = `${slug}-${Date.now()}`;
    console.warn(`⚠️ Slug çakışması, alternatif kullanılıyor: ${finalSlug}`);
  }
  
  const { _data, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryName,
      slug: finalSlug,
      description: description || `${categoryName} - Avens entegrasyonu ile eklendi`,
      level: 0
    }])
    .select('id, name, slug')
    .single();

  if (error) {
    throw error;
  }

  console.warn(`✨ Yeni kategori oluşturuldu: ${categoryName}`);
  return _data;
}

async function importProduct(product, categoryId) {
  const cleanedName = cleanProductName(product.name);
  const slug = generateSlug(cleanedName);
  const brandName = normalizeBrandName(product.brand);
  
  // Check if product already exists by SKU or slug
  const sku = product.product_code || generateSKU(brandName, cleanedName, product.id);
  
  const { _data: existing, error: checkError } = await supabase
    .from('products')
    .select('id, name, sku')
    .or(`sku.eq.${sku},slug.eq.${slug}`)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (existing) {
    console.warn(`⚠️ Ürün zaten mevcut: ${existing.name} (${existing.sku})`);
    return existing.id;
  }

  // Prepare product _data
  const productData = {
    name: cleanedName,
    slug: slug,
    description: `${cleanedName} - Avens distribütörlüğü ile VentHub'da`,
    brand: brandName,
    category_id: categoryId,
    sku: sku,
    price: product.price || 0,
    purchase_price: product.price ? (product.price * 0.75) : 0, // 25% margin
    stock_qty: 0, // Start with 0 stock
    low_stock_threshold: 5,
    status: 'active',
    is_featured: false,
    meta_title: `${cleanedName} - ${brandName} | VentHub`,
    meta_description: `${cleanedName} ürününü VentHub'dan uygun fiyatlarla satın alın. ${brandName} kalitesi ile güvenli alışveriş.`,
    technical_specs: {},
    model_code: product.product_code || null
  };

  // Add image URL if available
  if (product.image_url && !product.image_url.includes('404') && !product.image_url.includes('undefined')) {
    productData.image_url = product.image_url;
  }

  // Create product
  const { _data: newProduct, error: createError } = await supabase
    .from('products')
    .insert([productData])
    .select('id, name')
    .single();

  if (createError) {
    throw createError;
  }

  console.warn(`✨ Ürün oluşturuldu: ${newProduct.name} (${brandName})`);

  // Create product image record if we have an image
  if (productData.image_url) {
    const { error: imageError } = await supabase
      .from('product_images')
      .insert([{
        product_id: newProduct.id,
        _path: productData.image_url,
        alt: cleanedName,
        sort_order: 1
      }]);

    if (imageError) {
      console.error(`❌ Ürün resmi eklenemedi ${newProduct.name}:`, imageError.message);
    } else {
      console.warn(`📷 Resim eklendi: ${newProduct.name}`);
    }
  }

  return newProduct.id;
}

async function main() {
  console.warn('🚀 Avens ürünlerini VentHub\'a akıllı import başlıyor...');

  try {
    // Load products _data
    console.warn('📖 Ürün verilerini yüklüyorum...');
    const productsData = JSON.parse(await _fs.readFile(SCRAPED_PRODUCTS_FILE, 'utf-8'));
    
    // Filter valid products
    const validProducts = productsData.filter(isValidProduct);
    console.warn(`✅ İmport edilecek geçerli ürün: ${validProducts.length}`);

    // Analyze category mapping
    const categoryAnalysis = {};
    const needsNewCategory = new Set();

    validProducts.forEach(product => {
      const brandName = normalizeBrandName(product.brand);
      const mapping = mapToExistingCategory(product.name, brandName);
      
      if (!categoryAnalysis[mapping.category]) {
        categoryAnalysis[mapping.category] = [];
      }
      categoryAnalysis[mapping.category].push(product);

      if (mapping.needsNewCategory) {
        needsNewCategory.add(mapping.needsNewCategory);
      }
    });

    console.warn('\n📊 Kategori dağılımı:');
    Object.entries(categoryAnalysis).forEach(([category, products]) => {
      console.warn(`  ${category}: ${products.length} ürün`);
    });

    if (needsNewCategory.size > 0) {
      console.warn(`\n🆕 Oluşturulacak yeni kategoriler: ${[...needsNewCategory].join(', ')}`);
    }

    // Process each category
    const results = {
      success: 0,
      failed: 0,
      newCategories: 0,
      existingCategories: 0
    };

    const categoryCache = new Map();

    for (const [categoryName, products] of Object.entries(categoryAnalysis)) {
      console.warn(`\n📂 ${categoryName} kategorisi işleniyor...`);

      let categoryData = await getCategoryByName(categoryName);
      
      if (!categoryData) {
        // Kategori mevcut değil, yeni oluştur
        categoryData = await createNewCategory(categoryName);
        results.newCategories++;
      } else {
        console.warn(`✅ Mevcut kategori kullanılıyor: ${categoryData.name}`);
        results.existingCategories++;
      }

      categoryCache.set(categoryName, categoryData);

      // Import products for this category
      for (const product of products) {
        try {
          await importProduct(product, categoryData.id);
          results.success++;
        } catch (error) {
          console.error(`❌ Ürün import hatası ${product.name}:`, error.message);
          results.failed++;
        }
      }
    }

    // Create ATEX category if needed
    if (needsNewCategory.has('ATEX/Ex-Proof Fanlar')) {
      console.warn('\n🆕 ATEX/Ex-Proof Fanlar kategorisi oluşturuluyor...');
      const endCategoryData = categoryCache.get('Endüstriyel Fanlar');
      if (endCategoryData) {
        await createNewCategory('ATEX/Ex-Proof Fanlar', 'Patlamaya dayanıklı ATEX sertifikalı fanlar');
      }
    }

    // Summary
    console.warn('\n📊 Import Özeti:');
    console.warn(`✅ Başarılı: ${results.success}`);
    console.warn(`❌ Hatalı: ${results.failed}`);
    console.warn(`🆕 Yeni kategori: ${results.newCategories}`);
    console.warn(`📂 Mevcut kategori kullanıldı: ${results.existingCategories}`);
    console.warn(`📦 Toplam ürün: ${validProducts.length}`);

    // Brand summary
    const brandCounts = {};
    validProducts.forEach(product => {
      const brand = normalizeBrandName(product.brand);
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    console.warn('\n🏷️ Marka dağılımı:');
    Object.entries(brandCounts).forEach(([brand, _count]) => {
      console.warn(`  ${brand}: ${_count} ürün`);
    });

    console.warn('\n🎉 İmport başarıyla tamamlandı!');
    console.warn('💡 Öneriler:');
    console.warn('  • Ürün fiyatlarını admin panelinden güncelleyin');
    console.warn('  • Stok miktarlarını ayarlayın');
    console.warn('  • Ürün açıklamalarını gözden geçirin');

  } catch (error) {
    console.error('💥 Import hatası:', error.message);
    process.exit(1);
  }
}

// Run the import
main().catch(console.error);
