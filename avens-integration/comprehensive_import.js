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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const COMPREHENSIVE_DATA_FILE = _path.join(__dirname, 'scraped-_data', 'fixed_products_2025-09-29T10-49-48-208Z.json');

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
    .replace(/[^a-z0-9\s]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanProductName(name) {
  return name
    .replace(/^(Vortice|VORTICE)\s+/gi, '')
    .replace(/^(NICOTRA|Nicotra)\s+(GEBHARDT|Gebhardt)\s+/gi, '')
    .replace(/^(AVenS|AVENS)\s+/gi, '')
    .trim();
}

function normalizeBrandName(brandName) {
  const brandMap = {
    'GENEL': 'AVenS',
    'NICOTRA': 'Nicotra Gebhardt', 
    'VORTICE': 'Vortice'
  };
  return brandMap[brandName] || brandName;
}

function extractPrice(priceText) {
  if (!priceText) return null;
  
  // "6.985,54 ₺" formatından fiyatı çıkar
  const match = priceText.match(/([0-9.,]+)\s*₺/);
  if (match) {
    const numericPrice = match[1].replace(/\./g, '').replace(',', '.');
    return parseFloat(numericPrice);
  }
  return null;
}

// _mapCategoryToVentHub kept for future reference but prefixed to satisfy lint
function _mapCategoryToVentHub(avensCategory) {
  const categoryMapping = {
    'Konut Tipi Fanlar': 'f3a75c19-256a-44bb-a816-9379881f1346',
    'Kanal Tipi Fanlar': '512ae175-7a2f-4b4d-8dd6-9dbe4ef96261',
    'Çatı Tipi Fanlar': 'b7642434-3cbb-4b6c-97e3-66f45ff077f3',
    'Santrifüj Fanlar': '29af592c-b745-440a-80a1-1badec6ca91b',
    'Duvar Tipi Fanlar': '36f701a5-eb64-4c2b-a9da-a6f525c22e81',
    'Sessiz Fanlar': '807cc1ed-6e08-47da-bc94-d4be0d2b4c0c',
    'Endüstriyel Fanlar': 'db965633-c967-4193-8617-e1a7651997ec',
    'Ex-Proof Fanlar': '4a801860-24f3-4d02-8a1b-7e547f2be73e',
    'Duman Egzoz Fanları': 'duman-egzoz-fanlar-id',
    'Jet Fanlar': '29d5dc81-b8bd-4b0f-ba23-29795b3d62e9',
    'Basınçlandırma Fanları': 'basinclandirma-fanlar-id',
    'Sığınak Fanları': 'siginak-fanlar-id',
    'Nicotra Gebhardt': 'nicotra-gebhardt-id',
    'Vortice': '4bc54533-7323-4eac-a02d-4498ffde00eb',
    'Plug Fanlar': 'plug-fanlar-id',
    'Hava Perdeleri': '5c2e91a4-8b6f-4c5a-a7d9-2e8f1c3a9b7e',
    'Flexible Kanallar': '8f3a5b2c-1d4e-4a6b-9c7f-3e9a2d5c8b1f',
    'Aksesuarlar': '7a1b4c8d-2e5f-4g9h-8i7j-6k5l4m3n2o1p'
  };
  
  return categoryMapping[avensCategory] || '4bc54533-7323-4eac-a02d-4498ffde00eb';
}

function generateSKU(brand, name, _id) {
  const brandPrefix = brand.substring(0, 3).toUpperCase();
  const namePrefix = name.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${brandPrefix}-${namePrefix}-${timestamp}`;
}

function isValidProduct(product) {
  return product.name && 
         product.name.trim().length > 3 &&
         !product.name.includes('404') &&
         !product.name.includes('Sepetim') &&
         !product.name.includes('satis@avensair.com') &&
         !product.name.toLowerCase().includes('linkedin') &&
         !product.name.toLowerCase().includes('instagram');
}

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

async function createMissingCategory(categoryName, parentId = '4bc54533-7323-4eac-a02d-4498ffde00eb') {
  const slug = generateSlug(categoryName);
  
  const { _data, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryName,
      slug: slug,
      description: `${categoryName} - Comprehensive Avens import ile eklendi`,
      parent_id: parentId,
      level: 1
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
  const brandName = normalizeBrandName(product.brand || 'AVenS');
  const price = extractPrice(product.price);
  
  // Check if product already exists by name
  const { _data: existing } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', cleanedName)
    .single();

  if (existing) {
    console.warn(`⚠️ Ürün zaten mevcut: ${existing.name}`);
    return { status: 'exists', id: existing.id };
  }

  const sku = generateSKU(brandName, cleanedName, product.id);

  // Prepare product _data
  const productData = {
    name: cleanedName,
    slug: slug,
    description: `${cleanedName} - Comprehensive Avens import`,
    brand: brandName,
    category_id: categoryId,
    sku: sku,
    price: price || 0,
    purchase_price: price ? (price * 0.75) : 0,
    stock_qty: 0,
    low_stock_threshold: 5,
    status: 'active',
    is_featured: false,
    meta_title: `${cleanedName} - ${brandName} | VentHub`,
    meta_description: `${cleanedName} ürününü VentHub'dan uygun fiyatlarla satın alın. ${brandName} kalitesi ile güvenli alışveriş.`,
    technical_specs: {},
    model_code: product.product_code || null
  };

  // Add image URL if available and valid
  if (product.image_url && 
      !product.image_url.includes('404') && 
      !product.image_url.includes('undefined') &&
      !product.image_url.includes('avens.svg')) {
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

  console.warn(`✅ Ürün oluşturuldu: ${newProduct.name} (${brandName})`);

  // Create product image record if we have a valid image
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

  return { status: 'created', id: newProduct.id, _data: newProduct };
}

async function main() {
  console.warn('🚀 Comprehensive Avens ürünleri VentHub\'a import ediliyor...');

  try {
    // Load comprehensive products _data
    console.warn('📖 Comprehensive ürün verilerini yüklüyorum...');
    const productsData = JSON.parse(await _fs.readFile(COMPREHENSIVE_DATA_FILE, 'utf-8'));
    
    // Filter valid products
    const validProducts = productsData.filter(isValidProduct);
    console.warn(`✅ İmport edilecek geçerli ürün: ${validProducts.length} / ${productsData.length}`);

    // Group by category
    const productsByCategory = {};
    validProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product);
    });

    console.warn('\n📊 Kategori dağılımı:');
    Object.entries(productsByCategory).forEach(([category, products]) => {
      console.warn(`  ${category}: ${products.length} ürün`);
    });

    // Import results
    const results = {
      success: 0,
      exists: 0,
      failed: 0,
      newCategories: 0,
      categories: {}
    };

    // Process each category
    for (const [categoryName, products] of Object.entries(productsByCategory)) {
      console.warn(`\n📂 ${categoryName} kategorisi işleniyor...`);

      // Get or create category
      let categoryData = await getCategoryByName(categoryName);
      
      if (!categoryData) {
        // Create missing category
        categoryData = await createMissingCategory(categoryName);
        results.newCategories++;
      } else {
        console.warn(`✅ Mevcut kategori kullanılıyor: ${categoryData.name}`);
      }

      results.categories[categoryName] = {
        id: categoryData.id,
        name: categoryData.name,
        products: 0,
        success: 0,
        exists: 0,
        failed: 0
      };

      // Import products for this category
      for (const product of products) {
        try {
          const result = await importProduct(product, categoryData.id);
          
          if (result.status === 'created') {
            results.success++;
            results.categories[categoryName].success++;
          } else if (result.status === 'exists') {
            results.exists++;
            results.categories[categoryName].exists++;
          }
          
          results.categories[categoryName].products++;
          
        } catch (error) {
          console.error(`❌ Ürün import hatası ${product.name}:`, (error as Error).message);
          results.failed++;
          results.categories[categoryName].failed++;
        }
      }
    }

    // Summary
    console.warn('\n📊 Comprehensive Import Özeti:');
    console.warn(`✅ Yeni ürün: ${results.success}`);
    console.warn(`⚠️ Mevcut ürün: ${results.exists}`);
    console.warn(`❌ Hatalı: ${results.failed}`);
    console.warn(`🆕 Yeni kategori: ${results.newCategories}`);
    console.warn(`📦 Toplam işlenen: ${validProducts.length}`);

    // Category breakdown
    console.warn('\n📋 Kategori bazlı sonuçlar:');
    Object.entries(results.categories).forEach(([name, stats]) => {
      console.warn(`  ${name}: ${stats.success} yeni, ${stats.exists} mevcut, ${stats.failed} hatalı`);
    });

    // Brand summary
    const brandCounts = {};
    validProducts.forEach(product => {
      const brand = normalizeBrandName(product.brand || 'AVenS');
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    console.warn('\n🏷️ Marka dağılımı:');
    Object.entries(brandCounts).forEach(([brand, _count]) => {
      console.warn(`  ${brand}: ${_count} ürün`);
    });

    console.warn('\n🎉 Comprehensive import başarıyla tamamlandı!');
    console.warn('💡 Sonraki adımlar:');
    console.warn('  • Admin panelinden kategori hiyerarşisini kontrol edin');
    console.warn('  • Ürün fiyatlarını ve stok miktarlarını güncelleyin');
    console.warn('  • Ürün açıklamalarını gözden geçirin');

  } catch (error) {
    console.error('💥 Import hatası:', (error as Error).message);
    process.exit(1);
  }
}

// Run the import
main().catch(console.warn);
