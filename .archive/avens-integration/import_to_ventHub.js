import { createClient } from '@supabase/supabase-js';
import _fs from '_fs/promises';
import _path from '_path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = _path.dirname(__filename);

// Supabase configuration - .env dosyasından okumalı
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
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

function mapCategoryName(productName) {
  const categoryMap = {
    'fan': 'Fanlar',
    'kanal': 'Kanal Fanları',
    'sessiz': 'Sessiz Fanlar',
    'çatı': 'Çatı Fanları',
    'konut': 'Konut Fanları',
    'duvar': 'Duvar Fanları',
    'santrifüj': 'Santrifüj Fanlar',
    'duman': 'Duman Egzoz Fanları',
    'otopark': 'Otopark Fanları',
    'jet': 'Jet Fanlar',
    'atex': 'Ex-Proof Fanlar',
    'nicotra': 'Nicotra Gebhardt',
    'vortice': 'Vortice Ürünleri',
    'hava perdesi': 'Hava Perdeleri',
    'ısı geri': 'Isı Geri Kazanım',
    'nem alma': 'Nem Alma Cihazları',
    'temizleyici': 'Hava Temizleyiciler',
    'kanal': 'Flexible Kanallar'
  };

  const name = productName.toLowerCase();
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (name.includes(keyword)) {
      return category;
    }
  }
  return 'Genel Ürünler';
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
  // Remove common prefixes and clean up
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

// Database functions
async function ensureCategory(categoryName) {
  const slug = generateSlug(categoryName);
  
  // Check if category exists
  const { _data: existing, error: checkError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (existing) {
    console.warn(`✅ Category exists: ${existing.name}`);
    return existing.id;
  }

  // Create new category
  const { _data: newCategory, error: createError } = await supabase
    .from('categories')
    .insert([{
      name: categoryName,
      slug: slug,
      description: `${categoryName} - Avens'ten aktarıldı`,
      is_active: true
    }])
    .select('id')
    .single();

  if (createError) {
    throw createError;
  }

  console.warn(`✨ Created new category: ${categoryName}`);
  return newCategory.id;
}

async function ensureBrand(brandName) {
  const slug = generateSlug(brandName);
  
  // Check if brand exists
  const { _data: existing, error: checkError } = await supabase
    .from('brands')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (existing) {
    console.warn(`✅ Brand exists: ${existing.name}`);
    return existing.id;
  }

  // Create new brand
  const { _data: newBrand, error: createError } = await supabase
    .from('brands')
    .insert([{
      name: brandName,
      slug: slug,
      description: `${brandName} markası - Avens distribütörü`,
      is_active: true
    }])
    .select('id')
    .single();

  if (createError) {
    throw createError;
  }

  console.warn(`✨ Created new brand: ${brandName}`);
  return newBrand.id;
}

async function importProduct(product, categoryId, brandId) {
  const cleanedName = cleanProductName(product.name);
  const slug = generateSlug(cleanedName);
  const brandName = normalizeBrandName(product.brand);
  
  // Check if product already exists by slug
  const { _data: existing, error: checkError } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (existing) {
    console.warn(`⚠️ Product already exists: ${existing.name} (${slug})`);
    return existing.id;
  }

  // Generate SKU
  const sku = product.product_code || generateSKU(brandName, cleanedName, product.id);

  // Prepare product _data
  const productData = {
    name: cleanedName,
    slug: slug,
    description: `${cleanedName} - Avens distribütörlüğü ile VentHub'da`,
    category_id: categoryId,
    brand_id: brandId,
    sku: sku,
    price: product.price || 0,
    cost_price: product.price ? (product.price * 0.75) : 0, // 25% margin
    stock_quantity: 0, // Start with 0 stock
    min_stock_threshold: 1,
    max_stock_threshold: 20,
    is_active: true,
    is_featured: false,
    weight: 0,
    meta_title: `${cleanedName} - ${brandName} | VentHub`,
    meta_description: `${cleanedName} ürününü VentHub'dan uygun fiyatlarla satın alın. ${brandName} kalitesi ile güvenli alışveriş.`,
    __specifications: {},
    tags: [brandName, 'Avens', 'HVAC', 'Havalandırma'],
    external_id: product.id,
    source_url: product.product_url
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

  console.warn(`✨ Created product: ${newProduct.name} (${brandName})`);

  // Create product image record if we have an image
  if (productData.image_url) {
    const { error: imageError } = await supabase
      .from('product_images')
      .insert([{
        product_id: newProduct.id,
        image_url: productData.image_url,
        alt_text: cleanedName,
        is_primary: true,
        display_order: 1
      }]);

    if (imageError) {
      console.error(`❌ Error creating product image for ${newProduct.name}:`, imageError.message);
    } else {
      console.warn(`📷 Added image for: ${newProduct.name}`);
    }
  }

  return newProduct.id;
}

async function main() {
  console.warn('🚀 Starting Avens product import to VentHub...');

  try {
    // Load scraped products _data
    console.warn('📖 Loading scraped products _data...');
    const productsData = JSON.parse(await _fs.readFile(SCRAPED_PRODUCTS_FILE, 'utf-8'));
    console.warn(`📦 Found ${productsData.length} products to import`);

    // Filter out invalid products (404s, empty titles, etc.)
    const validProducts = productsData.filter(product => 
      product.name && 
      product.name.trim().length > 0 &&
      !product.name.includes('404') &&
      !product.name.includes('Sepetim') &&
      !product.name.includes('Kataloglar') &&
      !product.name.includes('linkedin.com') &&
      !product.name.includes('instagram.com') &&
      !product.name.includes('argenova.com') &&
      !product.name.toLowerCase().includes('marmara sanayi')
    );

    console.warn(`✅ Found ${validProducts.length} valid products after filtering`);

    // Process each product
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      categories: new Set(),
      brands: new Set()
    };

    for (const product of validProducts) {
      try {
        console.warn(`\\n🔄 Processing: ${product.name}`);

        // Determine category
        const categoryName = mapCategoryName(product.name);
        results.categories.add(categoryName);

        // Normalize brand name
        const brandName = normalizeBrandName(product.brand);
        results.brands.add(brandName);

        // Ensure category exists
        const categoryId = await ensureCategory(categoryName);

        // Ensure brand exists
        const brandId = await ensureBrand(brandName);

        // Import product
        const __productId = await importProduct(product, categoryId, brandId);

        results.success++;
        console.warn(`✅ Successfully processed: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to process ${product.name}:`, error.message);
        results.failed++;
      }
    }

    // Summary
    console.warn('\\n📊 Import Summary:');
    console.warn(`✅ Success: ${results.success}`);
    console.warn(`❌ Failed: ${results.failed}`);
    console.warn(`⚠️ Skipped: ${results.skipped}`);
    console.warn(`📂 Categories created/used: ${results.categories.size}`);
    console.warn(`🏷️ Brands created/used: ${results.brands.size}`);

    console.warn('\\n📂 Categories:');
    [...results.categories].forEach(cat => console.warn(`  - ${cat}`));
    
    console.warn('\\n🏷️ Brands:');
    [...results.brands].forEach(brand => console.warn(`  - ${brand}`));

    console.warn('\\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
main().catch(console.error);
