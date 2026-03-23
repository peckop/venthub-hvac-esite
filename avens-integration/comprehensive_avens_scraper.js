import puppeteer from 'puppeteer';
import _fs from '_fs/promises';
import _path from '_path';

const BASE_URL = 'https://avensair.com';
const DELAY = 2000; // 2 saniye bekleme

// Ana kategori sayfalarını tanımla
const CATEGORY_PAGES = [
  { name: 'Konut Tipi Fanlar', url: '/konut-tipi-fanlar' },
  { name: 'Kanal Tipi Fanlar', url: '/kanal-tipi-fanlar' },
  { name: 'Çatı Tipi Fanlar', url: '/cati-tipi-fanlar' },
  { name: 'Santrifüj Fanlar', url: '/santrifuj-fanlar' },
  { name: 'Duvar Tipi Fanlar', url: '/duvar-tipi-fanlar' },
  { name: 'Sessiz Fanlar', url: '/sessiz-fanlar' },
  { name: 'Endüstriyel Fanlar', url: '/endustriyel-fanlar' },
  { name: 'Ex-Proof Fanlar', url: '/ex-proof-fanlar' },
  { name: 'Duman Egzoz Fanları', url: '/duman-egzoz-fanlari' },
  { name: 'Jet Fanlar', url: '/jet-fanlar' },
  { name: 'Basınçlandırma Fanları', url: '/basinclandirma-fanlari' },
  { name: 'Sığınak Fanları', url: '/siginak-fanlari' },
  { name: 'Nicotra Gebhardt', url: '/nicotra-gebhardt' },
  { name: 'Vortice', url: '/vortice' },
  { name: 'Plug Fanlar', url: '/plug-fanlar' },
  { name: 'Hava Perdeleri', url: '/hava-perdeleri' },
  { name: 'Flexible Kanallar', url: '/flexible-kanallar' },
  { name: 'Aksesuarlar', url: '/aksesuarlar' }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCategory(page, categoryInfo) {
  console.warn(`\n🔍 ${categoryInfo.name} kategorisi scraping başlıyor...`);
  
  const fullUrl = `${BASE_URL}${categoryInfo.url}`;
  
  try {
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.warn(`📍 Sayfa yüklendi: ${fullUrl}`);
    await delay(DELAY);

    // Sayfada ürün kartlarını bul
    const products = await page.evaluate(() => {
      const productCards = [];
      
      // Farklı olası ürün selektörlerini dene
      const selectors = [
        '.product-card',
        '.product-item', 
        '.product',
        '.card',
        '.item',
        'article',
        '[_data-product]',
        '.grid-item',
        '.product-box'
      ];
      
      let foundElements = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements = Array.from(elements);
          break;
        }
      }
      
      // Eğer hiç bulamazsa, link içeren elementleri ara
      if (foundElements.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/urun"], a[href*="/product"]');
        foundElements = Array.from(allLinks);
      }
      
      foundElements.forEach((element, index) => {
        try {
          const linkElement = element.tagName === 'A' ? element : element.querySelector('a');
          const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .product-name');
          const imageElement = element.querySelector('img');
          const priceElement = element.querySelector('.price, .fiyat, .amount, .cost');
          
          const productLink = linkElement ? linkElement.href : '';
          const productTitle = titleElement ? titleElement.textContent.trim() : 
                              linkElement ? linkElement.textContent.trim() : `Ürün ${index + 1}`;
          const productImage = imageElement ? imageElement.src : '';
          const productPrice = priceElement ? priceElement.textContent.trim() : '';
          
          if (productLink && productTitle && !productTitle.toLowerCase().includes('404')) {
            productCards.push({
              title: productTitle,
              link: productLink,
              image: productImage,
              price: productPrice,
              found_by: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : '')
            });
          }
        } catch (error) {
          console.warn(`Element ${index} işlenirken hata:`, error.message);
        }
      });
      
      return productCards;
    });

    console.warn(`📦 ${products.length} ürün bulundu`);

    // Her ürün için detaylı bilgi çek
    const detailedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.warn(`📝 ${i + 1}/${products.length}: ${product.title}`);
      
      try {
        // Ürün detay sayfasına git
        await page.goto(product.link, { 
          waitUntil: 'networkidle2',
          timeout: 15000 
        });
        
        await delay(1000);
        
        // Ürün detaylarını çek
        const details = await page.evaluate(() => {
          const getTextContent = (selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : '';
          };
          
          const getImageSrc = (selector) => {
            const element = document.querySelector(selector);
            return element ? element.src : '';
          };
          
          // Farklı olası selektörler dene
          const title = getTextContent('h1') || 
                       getTextContent('.product-title') || 
                       getTextContent('.title') ||
                       document.title;
          
          const description = getTextContent('.description') ||
                            getTextContent('.product-description') ||
                            getTextContent('.content') ||
                            getTextContent('p');
          
          const price = getTextContent('.price') ||
                       getTextContent('.fiyat') ||
                       getTextContent('.amount');
          
          const image = getImageSrc('.product-image img') ||
                       getImageSrc('.main-image') ||
                       getImageSrc('img[alt*="ürün"], img[alt*="product"]') ||
                       getImageSrc('img');
          
          const code = getTextContent('.product-code') ||
                      getTextContent('.model') ||
                      getTextContent('.sku');
          
          // Teknik özellikler
          const specs = {};
          const specElements = document.querySelectorAll('.spec, .specification, .feature');
          specElements.forEach(spec => {
            const key = spec.querySelector('.key, .label')?.textContent?.trim();
            const value = spec.querySelector('.value')?.textContent?.trim();
            if (key && value) {
              specs[key] = value;
            }
          });
          
          return {
            title: title,
            description: description,
            price: price,
            image: image,
            code: code,
            specs: specs,
            url: window.location.href
          };
        });
        
        detailedProducts.push({
          id: `avens_${Date.now()}_${i}`,
          name: details.title || product.title,
          description: details.description,
          price: details.price || product.price,
          image_url: details.image || product.image,
          product_code: details.code,
          url: details.url,
          category: categoryInfo.name,
          brand: categoryInfo.name.includes('Vortice') ? 'Vortice' : 
                categoryInfo.name.includes('Nicotra') ? 'Nicotra Gebhardt' : 'AVenS',
          specs: details.specs,
          scraped_at: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`❌ ${product.title} detay çekilemedi:`, error.message);
        
        // Basit bilgiyle ekle
        detailedProducts.push({
          id: `avens_${Date.now()}_${i}`,
          name: product.title,
          price: product.price,
          image_url: product.image,
          url: product.link,
          category: categoryInfo.name,
          brand: categoryInfo.name.includes('Vortice') ? 'Vortice' : 
                categoryInfo.name.includes('Nicotra') ? 'Nicotra Gebhardt' : 'AVenS',
          scraped_at: new Date().toISOString()
        });
      }
    }
    
    return detailedProducts;
    
  } catch (error) {
    console.error(`❌ ${categoryInfo.name} kategorisinde hata:`, error.message);
    return [];
  }
}

async function scrapeAllCategories() {
  console.warn('🚀 AvensAir sitesi kategori kategori scraping başlıyor...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // User agent ayarla
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const allProducts = [];
  const categoryResults = {};
  
  try {
    for (const category of CATEGORY_PAGES) {
      const categoryProducts = await scrapeCategory(page, category);
      
      categoryResults[category.name] = {
        _count: categoryProducts.length,
        url: category.url
      };
      
      allProducts.push(...categoryProducts);
      
      console.warn(`✅ ${category.name}: ${categoryProducts.length} ürün`);
      
      // Kategoriler arası bekleme
      await delay(DELAY);
    }
    
    // Sonuçları kaydet
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Tüm ürünler
    const allProductsFile = _path.join(process.cwd(), 'scraped-_data', `all_products_comprehensive_${timestamp}.json`);
    await _fs.writeFile(allProductsFile, JSON.stringify(allProducts, null, 2));
    
    // Kategori özeti
    const summaryFile = _path.join(process.cwd(), 'scraped-_data', `category_summary_${timestamp}.json`);
    await _fs.writeFile(summaryFile, JSON.stringify(categoryResults, null, 2));
    
    // Kategori bazlı dosyalar
    for (const [categoryName, products] of Object.entries(
      allProducts.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {})
    )) {
      const categoryFile = _path.join(
        process.cwd(), 
        'scraped-_data', 
        `${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${timestamp}.json`
      );
      await _fs.writeFile(categoryFile, JSON.stringify(products, null, 2));
    }
    
    console.warn('\n📊 Scraping Özeti:');
    console.warn(`📦 Toplam ürün: ${allProducts.length}`);
    console.warn(`📂 Kategori sayısı: ${Object.keys(categoryResults).length}`);
    console.warn('\n📋 Kategori detayları:');
    
    Object.entries(categoryResults).forEach(([name, info]) => {
      console.warn(`  ${name}: ${info._count} ürün (${info.url})`);
    });
    
    console.warn(`\n💾 Veriler kaydedildi:`);
    console.warn(`  - Tüm ürünler: ${allProductsFile}`);
    console.warn(`  - Kategori özeti: ${summaryFile}`);
    console.warn(`  - Kategori dosyaları: scraped-_data/`);
    
  } catch (error) {
    console.error('💥 Scraping hatası:', error.message);
  } finally {
    await browser.close();
  }
}

// Scraping'i başlat
scrapeAllCategories().catch(console.error);
