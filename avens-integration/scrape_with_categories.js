import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const PRODUCTS_URL = 'https://www.avensair.com/urunler';
const DELAY = 1500;
const DETAIL_DELAY = 800;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadAllProducts(page) {
  console.log('🔄 Tüm ürünleri yüklüyorum...');
  
  let clickCount = 0;
  let noButtonCount = 0;
  const maxNoButton = 3;
  const maxClicks = 50; // Maksimum tık sayısı
  
  while (noButtonCount < maxNoButton && clickCount < maxClicks) {
    try {
      // Sayfayı scroll et
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await delay(1000);
      
      // "Daha fazla" butonunu ara
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, .btn, [role="button"]'));
        
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          const isVisible = button.offsetWidth > 0 && button.offsetHeight > 0 && 
                           window.getComputedStyle(button).display !== 'none';
          
          if (isVisible && (
            text.includes('daha fazla') || 
            text.includes('daha') ||
            text.includes('fazla') ||
            text.includes('load more') ||
            button.classList.contains('load-more')
          )) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            button.click();
            return true;
          }
        }
        return false;
      });
      
      if (clicked) {
        clickCount++;
        noButtonCount = 0;
        console.log(`  ✓ Tık ${clickCount}`);
        await delay(DELAY);
      } else {
        noButtonCount++;
        console.log(`  · Buton bulunamadı (${noButtonCount}/${maxNoButton})`);
        await delay(500);
      }
      
    } catch (error) {
      console.log(`  ⚠ Hata:`, error.message);
      break;
    }
  }
  
  console.log(`📊 Toplam ${clickCount} kez "Daha fazla" butonuna tıklandı`);
  
  // Son bir scroll
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await delay(2000);
}

async function getProductLinks(page) {
  const links = await page.evaluate(() => {
    const productCards = [];
    
    // TÜM OLASI SELEKTÖRLERİ DENE
    const selectors = [
      '.urunkutu',
      '.product-card',
      '.product-item', 
      '.product',
      '.thumbnail',
      '.thumbnail-variant-1',
      'article',
      '.card',
      '.col-md-4',
      '.col-sm-6',
      '.col-lg-3'
    ];
    
    let foundElements = [];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements = Array.from(elements);
        console.log(`✓ Selector "${selector}" ile ${elements.length} element bulundu`);
        break;
      }
    }
    
    console.log(`Toplam ${foundElements.length} ürün kartı bulundu`);
    
    foundElements.forEach((element, index) => {
      try {
        const linkElement = element.tagName === 'A' ? element : element.querySelector('a');
        const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .product-name, .caption h3') ||
                            linkElement;
        
        const productLink = linkElement ? linkElement.href : '';
        const productTitle = titleElement ? titleElement.textContent.trim() : 
                            linkElement ? linkElement.textContent.trim() : '';
        
        // Geçerli ürün kontrolü
        if (productLink && 
            productTitle && 
            productTitle.length > 3 &&
            !productTitle.includes('404') &&
            !productTitle.includes('Sepet') &&
            !productTitle.includes('satis@') &&
            !productTitle.includes('Cookie')) {
          
          productCards.push({
            name: productTitle,
            url: productLink
          });
        }
      } catch (error) {
        console.log(`Ürün parse hatası (${index}):`, error.message);
      }
    });
    
    return productCards;
  });
  
  return links;
}

async function scrapeProductDetail(page, productUrl, productName) {
  try {
    console.log(`  🔍 Detay sayfası açılıyor: ${productName.substring(0, 50)}...`);
    
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await delay(DETAIL_DELAY);
    
    // Kategori ve diğer bilgileri çek
    const details = await page.evaluate(() => {
      let category = 'Genel';
      let subcategory = null;
      
      // Breadcrumb'dan kategori al
      const breadcrumbSelectors = [
        '.breadcrumb',
        '.breadcrumbs',
        '.bread-crumb',
        '[aria-label="breadcrumb"]',
        '.page-breadcrumb',
        '.woocommerce-breadcrumb',
        'nav[aria-label="breadcrumb"]'
      ];
      
      for (const selector of breadcrumbSelectors) {
        const breadcrumb = document.querySelector(selector);
        if (breadcrumb) {
          const links = breadcrumb.querySelectorAll('a, span');
          const parts = Array.from(links)
            .map(l => l.textContent.trim())
            .filter(t => t && t !== '>' && t !== '/' && t.toLowerCase() !== 'ana sayfa' && t.toLowerCase() !== 'home' && t.toLowerCase() !== 'ürünler');
          
          if (parts.length > 0) {
            category = parts[0];
            if (parts.length > 1) {
              subcategory = parts[1];
            }
          }
          break;
        }
      }
      
      // Alternatif: Meta tag'lardan kategori al
      if (category === 'Genel') {
        const metaCategory = document.querySelector('meta[property="product:category"]');
        if (metaCategory) {
          category = metaCategory.getAttribute('content') || 'Genel';
        }
      }
      
      // Ürün açıklaması
      const descriptionSelectors = [
        '.product-description',
        '.description',
        '.product-details',
        '[itemprop="description"]',
        '.entry-content',
        '.product-content'
      ];
      
      let description = '';
      for (const selector of descriptionSelectors) {
        const desc = document.querySelector(selector);
        if (desc) {
          description = desc.textContent.trim();
          break;
        }
      }
      
      // Görsel
      const imageSelectors = [
        '.product-image img',
        '.product-main-image img',
        '[itemprop="image"]',
        '.woocommerce-product-gallery img',
        '.product-gallery img',
        'img.wp-post-image'
      ];
      
      let imageUrl = '';
      for (const selector of imageSelectors) {
        const img = document.querySelector(selector);
        if (img) {
          imageUrl = img.src || img.getAttribute('data-src') || '';
          break;
        }
      }
      
      // Fiyat
      const priceSelectors = [
        '.price',
        '.product-price',
        '[itemprop="price"]',
        '.woocommerce-Price-amount',
        '.amount'
      ];
      
      let price = '';
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector);
        if (priceElement) {
          price = priceElement.textContent.trim();
          break;
        }
      }
      
      return {
        category,
        subcategory,
        description: description.substring(0, 500), // İlk 500 karakter
        image_url: imageUrl,
        price
      };
    });
    
    return details;
    
  } catch (error) {
    console.log(`  ❌ Detay çekme hatası: ${error.message}`);
    return {
      category: 'Genel',
      subcategory: null,
      description: '',
      image_url: '',
      price: ''
    };
  }
}

async function main() {
  console.log('🚀 AvensAir Kategori Detaylı Scraper\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // User agent ayarla
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 ADIM 1: ÜRÜN LİSTESİ ÇIKARTILIYOR');
  console.log('='.repeat(60));
  
  await page.goto(PRODUCTS_URL, { 
    waitUntil: 'domcontentloaded',
    timeout: 120000 
  });
  
  console.log(`📍 Sayfa yüklendi: ${PRODUCTS_URL}`);
  await delay(DELAY);
  
  // Tüm ürünleri yükle
  await loadAllProducts(page);
  
  // Ürün linklerini çek
  const productLinks = await getProductLinks(page);
  console.log(`✅ ${productLinks.length} ürün linki toplandı`);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 ADIM 2: ÜRÜN DETAYLARI ÇIKARTILIYOR');
  console.log('='.repeat(60));
  console.log(`⏱️  Tahmini süre: ~${Math.ceil(productLinks.length * DETAIL_DELAY / 1000 / 60)} dakika\n`);
  
  const allProducts = [];
  
  for (let i = 0; i < productLinks.length; i++) {
    const { name, url } = productLinks[i];
    
    console.log(`\n[${i + 1}/${productLinks.length}]`);
    
    try {
      const details = await scrapeProductDetail(page, url, name);
      
      allProducts.push({
        name,
        url,
        category: details.category,
        subcategory: details.subcategory,
        description: details.description,
        image_url: details.image_url,
        price: details.price,
        brand: 'AVenS',
        scraped_at: new Date().toISOString()
      });
      
      console.log(`  ✅ Kategori: ${details.category}${details.subcategory ? ` > ${details.subcategory}` : ''}`);
      
      // İlerleme kaydet (her 10 üründe)
      if ((i + 1) % 10 === 0) {
        const tempFilename = `scraped-data/progress_${i + 1}.json`;
        await fs.writeFile(
          tempFilename,
          JSON.stringify(allProducts, null, 2),
          'utf-8'
        );
        console.log(`  💾 İlerleme kaydedildi: ${tempFilename}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Hata: ${error.message}`);
      allProducts.push({
        name,
        url,
        category: 'Genel',
        subcategory: null,
        description: '',
        image_url: '',
        price: '',
        brand: 'AVenS',
        scraped_at: new Date().toISOString(),
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // Sonuçları kaydet
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const filename = `scraped-data/complete_with_categories_${timestamp}.json`;
  
  await fs.writeFile(
    filename,
    JSON.stringify(allProducts, null, 2),
    'utf-8'
  );
  
  // Kategorilere göre grupla
  const byCategory = {};
  const bySubcategory = {};
  
  allProducts.forEach(p => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = 0;
    }
    byCategory[p.category]++;
    
    if (p.subcategory) {
      const key = `${p.category} > ${p.subcategory}`;
      if (!bySubcategory[key]) {
        bySubcategory[key] = 0;
      }
      bySubcategory[key]++;
    }
  });
  
  // Özet
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING TAMAMLANDI');
  console.log('='.repeat(60));
  console.log(`\nTOPLAM ÜRÜN: ${allProducts.length}\n`);
  
  console.log('Ana Kategori Dağılımı:');
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  
  if (Object.keys(bySubcategory).length > 0) {
    console.log('\nAlt Kategori Dağılımı:');
    Object.entries(bySubcategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // İlk 20 tanesini göster
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
  }
  
  const genelCount = allProducts.filter(p => p.category === 'Genel').length;
  console.log(`\n⚠️  "Genel" kategorisinde kalan: ${genelCount}`);
  
  console.log(`\n💾 Kaydedildi: ${filename}`);
  console.log('='.repeat(60));
}

main().catch(console.error);