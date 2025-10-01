import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCRAPED_PRODUCTS_FILE = path.join(__dirname, 'scraped-data', 'all_products.json');

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
  console.log('🔍 Avens Scraping Sonuçları Analizi');
  console.log('=====================================\n');

  try {
    // Load scraped products data
    const productsData = JSON.parse(await fs.readFile(SCRAPED_PRODUCTS_FILE, 'utf-8'));
    
    console.log(`📦 Toplam scrape edilmiş kayıt: ${productsData.length}`);
    
    // Filter valid products
    const validProducts = productsData.filter(isValidProduct);
    const invalidProducts = productsData.filter(p => !isValidProduct(p));
    
    console.log(`✅ Geçerli ürün: ${validProducts.length}`);
    console.log(`❌ Geçersiz kayıt: ${invalidProducts.length}\n`);

    // Invalid products breakdown
    if (invalidProducts.length > 0) {
      console.log('🗑️ Geçersiz Kayıtlar:');
      console.log('---------------------');
      invalidProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name?.substring(0, 60)}${product.name?.length > 60 ? '...' : ''}`);
      });
      console.log();
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
    console.log('📂 KATEGORİ ANALİZİ');
    console.log('===================');
    const sortedCategories = Object.entries(categoryGroups).sort((a, b) => b[1].length - a[1].length);
    
    sortedCategories.forEach(([category, products]) => {
      const withPrice = products.filter(p => p.price && p.price > 0);
      const withImage = products.filter(p => p.image_url && !p.image_url.includes('404'));
      
      console.log(`\n📁 ${category} (${products.length} ürün)`);
      console.log(`   💰 Fiyatlı: ${withPrice.length}/${products.length}`);
      console.log(`   🖼️ Resimli: ${withImage.length}/${products.length}`);
      
      if (withPrice.length > 0) {
        const prices = withPrice.map(p => p.price).sort((a, b) => a - b);
        console.log(`   💵 Fiyat aralığı: ${prices[0].toLocaleString('tr-TR')} - ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
      }
      
      // Show sample products
      console.log('   📋 Örnek ürünler:');
      products.slice(0, 3).forEach(product => {
        const cleanName = cleanProductName(product.name);
        const priceText = product.price ? `${product.price.toLocaleString('tr-TR')} TL` : 'Fiyat yok';
        console.log(`      • ${cleanName} - ${priceText}`);
      });
      
      if (products.length > 3) {
        console.log(`      ... ve ${products.length - 3} ürün daha`);
      }
    });

    // Brand analysis
    console.log('\n\n🏷️ MARKA ANALİZİ');
    console.log('=================');
    const sortedBrands = Object.entries(brandGroups).sort((a, b) => b[1].length - a[1].length);
    
    sortedBrands.forEach(([brand, products]) => {
      const withPrice = products.filter(p => p.price && p.price > 0);
      const withImage = products.filter(p => p.image_url && !p.image_url.includes('404'));
      
      console.log(`\n🏷️ ${brand} (${products.length} ürün)`);
      console.log(`   💰 Fiyatlı: ${withPrice.length}/${products.length}`);
      console.log(`   🖼️ Resimli: ${withImage.length}/${products.length}`);
      
      if (withPrice.length > 0) {
        const prices = withPrice.map(p => p.price).sort((a, b) => a - b);
        console.log(`   💵 Fiyat aralığı: ${prices[0].toLocaleString('tr-TR')} - ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
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

      console.log('   📂 Kategori dağılımı:');
      Object.entries(brandCategories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          console.log(`      • ${cat}: ${count} ürün`);
        });
    });

    // Price analysis
    console.log('\n\n💰 FİYAT ANALİZİ');
    console.log('================');
    const productsWithPrice = validProducts.filter(p => p.price && p.price > 0);
    console.log(`📊 Fiyatlı ürün sayısı: ${productsWithPrice.length}/${validProducts.length}`);
    
    if (productsWithPrice.length > 0) {
      const prices = productsWithPrice.map(p => p.price).sort((a, b) => a - b);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      console.log(`💵 En düşük fiyat: ${prices[0].toLocaleString('tr-TR')} TL`);
      console.log(`💰 En yüksek fiyat: ${prices[prices.length-1].toLocaleString('tr-TR')} TL`);
      console.log(`📈 Ortalama fiyat: ${avgPrice.toLocaleString('tr-TR')} TL`);
      
      // Price ranges
      const ranges = {
        'Under 10K': prices.filter(p => p < 10000).length,
        '10K-25K': prices.filter(p => p >= 10000 && p < 25000).length,
        '25K-50K': prices.filter(p => p >= 25000 && p < 50000).length,
        'Over 50K': prices.filter(p => p >= 50000).length
      };
      
      console.log('\n📊 Fiyat aralığı dağılımı:');
      Object.entries(ranges).forEach(([range, count]) => {
        if (count > 0) {
          console.log(`   ${range}: ${count} ürün`);
        }
      });
    }

    // Image analysis
    console.log('\n\n🖼️ RESİM ANALİZİ');
    console.log('================');
    const productsWithImage = validProducts.filter(p => p.image_url && !p.image_url.includes('404') && !p.image_url.includes('undefined'));
    console.log(`📸 Resimli ürün sayısı: ${productsWithImage.length}/${validProducts.length}`);

    // Summary
    console.log('\n\n📋 ÖZET');
    console.log('=======');
    console.log(`✅ Import edilecek geçerli ürün: ${validProducts.length}`);
    console.log(`📂 Oluşturulacak kategori sayısı: ${Object.keys(categoryGroups).length}`);
    console.log(`🏷️ Oluşturulacak marka sayısı: ${Object.keys(brandGroups).length}`);
    console.log(`💰 Fiyat bilgisi olan ürün: ${productsWithPrice.length} (${Math.round(productsWithPrice.length/validProducts.length*100)}%)`);
    console.log(`🖼️ Görsel bilgisi olan ürün: ${productsWithImage.length} (${Math.round(productsWithImage.length/validProducts.length*100)}%)`);

    // Data quality score
    const qualityScore = (
      (productsWithPrice.length / validProducts.length) * 40 +
      (productsWithImage.length / validProducts.length) * 30 +
      (validProducts.length / productsData.length) * 30
    );
    
    console.log(`📊 Veri kalite skoru: ${Math.round(qualityScore)}/100`);
    
    if (qualityScore >= 80) {
      console.log('🎉 Mükemmel! Veri kalitesi çok yüksek, import için hazır.');
    } else if (qualityScore >= 60) {
      console.log('✅ İyi! Veri kalitesi import için yeterli.');
    } else {
      console.log('⚠️ Orta seviye veri kalitesi. Bazı ürünlerde eksik bilgi var.');
    }

  } catch (error) {
    console.error('💥 Analiz hatası:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main().catch(console.error);