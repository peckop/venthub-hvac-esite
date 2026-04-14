import _fs from '_fs/promises';
import _path from '_path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = _path.dirname(__filename);

// Configuration
const SCRAPED_PRODUCTS_FILE = _path.join(__dirname, 'scraped-_data', 'all_products.json');

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
    'flexible': 'Flexible Kanallar'
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
  return name
    .replace(/^(Vortice|VORTICE)\s+/gi, '')
    .replace(/^(NICOTRA|Nicotra)\s+(GEBHARDT|Gebhardt)\s+/gi, '')
    .replace(/^(AVenS|AVENS)\s+/gi, '')
    .trim();
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

async function main() {
  console.warn('🔍 Avens Scraping Sonuçları Analizi');
  console.warn('=====================================\n');

  try {
    // Load scraped products _data
    const productsData = JSON.parse(await _fs.readFile(SCRAPED_PRODUCTS_FILE, 'utf-8'));
    
    console.warn(`📦 Toplam scrape edilmiş kayıt: ${productsData.length}`);
    
    // Filter valid products
    const validProducts = productsData.filter(isValidProduct);
    const invalidProducts = productsData.filter(p => !isValidProduct(p));
    
    console.warn(`✅ Geçerli ürün: ${validProducts.length}`);
    console.warn(`❌ Geçersiz kayıt: ${invalidProducts.length}\n`);

    // Invalid products breakdown
    if (invalidProducts.length > 0) {
      console.warn('🗑️ Geçersiz Kayıtlar:');
      console.warn('---------------------');
      invalidProducts.forEach((product, index) => {
        console.warn(`  ${index + 1}. ${product.name?.substring(0, 60)}${product.name?.length > 60 ? '...' : ''}`);
      });
      console.warn();
    }

    // Group by category
    const categoryGroups = {};
    validProducts.forEach(product => {
      const category = mapCategoryName(product.name);
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(product);
    });

    // Group by brand
    const brandGroups = {};
    validProducts.forEach(product => {
      const brand = normalizeBrandName(product.brand);
      if (!brandGroups[brand]) {
        brandGroups[brand] = [];
      }
      brandGroups[brand].push(product);
    });

    // Category analysis
    console.warn('📂 KATEGORİ ANALİZİ');
    console.warn('===================');
    const sortedCategories = Object.entries(categoryGroups).sort((a, b) => b[1].length - a[1].length);
    
    sortedCategories.forEach(([category, products]) => {
      const withPrice = products.filter(p => p.price && p.price > 0);
      const withImage = products.filter(p => p.image_url && !p.image_url.includes('404'));
      
      console.warn(`\n📁 ${category} (${products.length} ürün)`);
      console.warn(`   💰 Fiyatlı: ${withPrice.length}/${products.length}`);
      console.warn(`   🖼️ Resimli: ${withImage.length}/${products.length}`);
      
      if (withPrice.length > 0) {
        const prices = withPrice.map(p => p.price).sort((a, b) => a - b);
        console.warn(`   💵 Fiyat aralığı: ${prices[0].toLocaleString('tr-TR')} - ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
      }
      
      // Show sample products
      console.warn('   📋 Örnek ürünler:');
      products.slice(0, 3).forEach(product => {
        const cleanName = cleanProductName(product.name);
        const priceText = product.price ? `${product.price.toLocaleString('tr-TR')} TL` : 'Fiyat yok';
        console.warn(`      • ${cleanName} - ${priceText}`);
      });
      
      if (products.length > 3) {
        console.warn(`      ... ve ${products.length - 3} ürün daha`);
      }
    });

    // Brand analysis
    console.warn('\n\n🏷️ MARKA ANALİZİ');
    console.warn('=================');
    const sortedBrands = Object.entries(brandGroups).sort((a, b) => b[1].length - a[1].length);
    
    sortedBrands.forEach(([brand, products]) => {
      const withPrice = products.filter(p => p.price && p.price > 0);
      const withImage = products.filter(p => p.image_url && !p.image_url.includes('404'));
      
      console.warn(`\n🏷️ ${brand} (${products.length} ürün)`);
      console.warn(`   💰 Fiyatlı: ${withPrice.length}/${products.length}`);
      console.warn(`   🖼️ Resimli: ${withImage.length}/${products.length}`);
      
      if (withPrice.length > 0) {
        const prices = withPrice.map(p => p.price).sort((a, b) => a - b);
        console.warn(`   💵 Fiyat aralığı: ${prices[0].toLocaleString('tr-TR')} - ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
      }

      // Group by category within brand
      const brandCategories = {};
      products.forEach(product => {
        const category = mapCategoryName(product.name);
        if (!brandCategories[category]) {
          brandCategories[category] = 0;
        }
        brandCategories[category]++;
      });

      console.warn('   📂 Kategori dağılımı:');
      Object.entries(brandCategories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, _count]) => {
          console.warn(`      • ${cat}: ${_count} ürün`);
        });
    });

    // Price analysis
    console.warn('\n\n💰 FİYAT ANALİZİ');
    console.warn('================');
    const productsWithPrice = validProducts.filter(p => p.price && p.price > 0);
    console.warn(`📊 Fiyatlı ürün sayısı: ${productsWithPrice.length}/${validProducts.length}`);
    
    if (productsWithPrice.length > 0) {
      const prices = productsWithPrice.map(p => p.price).sort((a, b) => a - b);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      console.warn(`💵 En düşük fiyat: ${prices[0].toLocaleString('tr-TR')} TL`);
      console.warn(`💰 En yüksek fiyat: ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
      console.warn(`📈 Ortalama fiyat: ${avgPrice.toLocaleString('tr-TR')} TL`);
      
      // Price ranges
      const ranges = {
        'Under 10K': prices.filter(p => p < 10000).length,
        '10K-25K': prices.filter(p => p >= 10000 && p < 25000).length,
        '25K-50K': prices.filter(p => p >= 25000 && p < 50000).length,
        'Over 50K': prices.filter(p => p >= 50000).length
      };
      
      console.warn('\n📊 Fiyat aralığı dağılımı:');
      Object.entries(ranges).forEach(([range, _count]) => {
        if (_count > 0) {
          console.warn(`   ${range}: ${_count} ürün`);
        }
      });
    }

    // Image analysis
    console.warn('\n\n🖼️ RESİM ANALİZİ');
    console.warn('================');
    const productsWithImage = validProducts.filter(p => p.image_url && !p.image_url.includes('404') && !p.image_url.includes('undefined'));
    console.warn(`📸 Resimli ürün sayısı: ${productsWithImage.length}/${validProducts.length}`);

    // Summary
    console.warn('\n\n📋 ÖZET');
    console.warn('=======');
    console.warn(`✅ Import edilecek geçerli ürün: ${validProducts.length}`);
    console.warn(`📂 Oluşturulacak kategori sayısı: ${Object.keys(categoryGroups).length}`);
    console.warn(`🏷️ Oluşturulacak marka sayısı: ${Object.keys(brandGroups).length}`);
    console.warn(`💰 Fiyat bilgisi olan ürün: ${productsWithPrice.length} (${Math.round(productsWithPrice.length/validProducts.length*100)}%)`);
    console.warn(`🖼️ Görsel bilgisi olan ürün: ${productsWithImage.length} (${Math.round(productsWithImage.length/validProducts.length*100)}%)`);

    // _data quality score
    const qualityScore = (
      (productsWithPrice.length / validProducts.length) * 40 +
      (productsWithImage.length / validProducts.length) * 30 +
      (validProducts.length / productsData.length) * 30
    );
    
    console.warn(`📊 Veri kalite skoru: ${Math.round(qualityScore)}/100`);
    
    if (qualityScore >= 80) {
      console.warn('🎉 Mükemmel! Veri kalitesi çok yüksek, import için hazır.');
    } else if (qualityScore >= 60) {
      console.warn('✅ İyi! Veri kalitesi import için yeterli.');
    } else {
      console.warn('⚠️ Orta seviye veri kalitesi. Bazı ürünlerde eksik bilgi var.');
    }

  } catch (error) {
    console.error('💥 Analiz hatası:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main().catch(console.error);
