import puppeteer from 'puppeteer';
import _fs from '_fs/promises';
import _path from '_path';

const BASE_URL = 'https://avensair.com';
const DELAY = 3000; // 3 saniye bekleme

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

async function loadAllProducts(page) {
  console.warn('🔄 "Daha fazla" butonları kontrol ediliyor...');
  
  let clickCount = 0;
  let maxClicks = 200; // Her kategoride yeterince tıklamak için
  
  while (clickCount < maxClicks) {
    try {
      // "Daha fazla" butonunu ara - farklı yöntemler
      let loadMoreButton = null;
      
      // Yöntem 1: _text içeriğine göre ara
      const buttons = await page.$$('button, a, .btn, [role="button"]');
      for (const button of buttons) {
        const _text = await page.evaluate(el => el.textContent, button);
        if (_text && _text.trim().toLowerCase().includes('daha fazla')) {
          loadMoreButton = button;
          break;
        }
      }
      
      // Yöntem 2: Diğer selektörleri dene
      if (!loadMoreButton) {
        const selectors = [
          '.load-more',
          '.more-button', 
          '.btn-load-more',
          '[_data-load-more]',
          'button[class*="load"]',
          'button[class*="more"]',
          '.show-more',
          '.load-products'
        ];
        
        for (const selector of selectors) {
          loadMoreButton = await page.$(selector);
          if (loadMoreButton) break;
        }
      }

      if (loadMoreButton) {
        // Butonun görünür olup olmadığını kontrol et
        const isVisible = await page.evaluate(button => {
          return button.offsetWidth > 0 && button.offsetHeight > 0 && 
                 window.getComputedStyle(button).display !== 'none';
        }, loadMoreButton);
        
        if (isVisible) {
          console.warn(`📱 "Daha fazla" butonuna tıklanıyor... (${clickCount + 1}. tık)`);
          
          // Butona scroll et
          await page.evaluate(button => {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, loadMoreButton);
          
          await delay(1000);
          
          // Butona tıkla
          await loadMoreButton.click();
          clickCount++;
          
          // Yeni ürünlerin yüklenmesini bekle
          await delay(DELAY);
          
          // Sayfa değişikliklerini bekle  
          await delay(2000);
          
        } else {
          console.warn('💡 "Daha fazla" butonu görünmüyor, tüm ürünler yüklenmiş olabilir');
          break;
        }
      } else {
        console.warn('✅ "Daha fazla" butonu bulunamadı, tüm ürünler yüklenmiş');
        break;
      }
    } catch (error) {
      console.warn('⚠️ "Daha fazla" butonu işleminde hata:', error.message);
      break;
    }
  }
  
  if (clickCount >= maxClicks) {
    console.warn('⚠️ Maksimum tık sayısına ulaşıldı, işlem durduruldu');
  }
  
  console.warn(`📊 Toplam ${clickCount} kez "Daha fazla" butonuna tıklandı`);
  
  // Son kontrol için biraz bekle
  await delay(DELAY);
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

    // Tüm ürünleri yükle
    await loadAllProducts(page);

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
        '.product-box',
        '.col-md-4', // Bootstrap grid
        '.col-sm-6',
        '.col-lg-3'
      ];
      
      let foundElements = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements = Array.from(elements);
          console.warn(`Selector ${selector} ile ${elements.length} element bulundu`);
          break;
        }
      }
      
      // Eğer hiç bulamazsa, link içeren elementleri ara
      if (foundElements.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/urun"], a[href*="/product"], a[href*="detail"]');
        foundElements = Array.from(allLinks).filter(link => {
          // Boş veya anlamsız linkleri filtrele
          const _text = link.textContent.trim();
          return _text.length > 3 && !_text.includes('404') && !_text.includes('Sepet');
        });
        console.warn(`Link selector ile ${foundElements.length} element bulundu`);
      }
      
      foundElements.forEach((element, index) => {
        try {
          const linkElement = element.tagName === 'A' ? element : element.querySelector('a');
          const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .product-name') ||
                              linkElement;
          const imageElement = element.querySelector('img');
          const priceElement = element.querySelector('.price, .fiyat, .amount, .cost, .money');
          
          const productLink = linkElement ? linkElement.href : '';
          const productTitle = titleElement ? titleElement.textContent.trim() : 
                              linkElement ? linkElement.textContent.trim() : `Ürün ${index + 1}`;
          const productImage = imageElement ? imageElement.src : '';
          const productPrice = priceElement ? priceElement.textContent.trim() : '';
          
          // Geçerli ürün kontrolü
          if (productLink && 
              productTitle && 
              productTitle.length > 3 &&
              !productTitle.toLowerCase().includes('404') &&
              !productTitle.toLowerCase().includes('sepet') &&
              !productTitle.toLowerCase().includes('linkedin') &&
              !productTitle.toLowerCase().includes('instagram')) {
            
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
      
      // Duplicate'ları temizle (aynı link)
      const uniqueProducts = [];
      const seenLinks = new Set();
      
      productCards.forEach(product => {
        if (!seenLinks.has(product.link)) {
          seenLinks.add(product.link);
          uniqueProducts.push(product);
        }
      });
      
      return uniqueProducts;
    });

    console.warn(`📦 ${products.length} benzersiz ürün bulundu`);

    // Her ürün için detaylı bilgi çek (sadece ilk 5 ürün için test)
    const detailedProducts = [];
    const maxProducts = Math.min(products.length, 50); // Maksimum 50 ürün
    
    for (let i = 0; i < maxProducts; i++) {
      const product = products[i];
      console.warn(`📝 ${i + 1}/${maxProducts}: ${product.title}`);
      
      try {
        // Ürün detay sayfasına git
        await page.goto(product.link, { 
          waitUntil: 'networkidle2',
          timeout: 15000 
        });
        
        await delay(1500);
        
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
                       document.title.replace(' | AvensAir', '');
          
          const description = getTextContent('.description') ||
                            getTextContent('.product-description') ||
                            getTextContent('.content') ||
                            getTextContent('.product-detail') ||
                            getTextContent('p');
          
          const price = getTextContent('.price') ||
                       getTextContent('.fiyat') ||
                       getTextContent('.amount') ||
                       getTextContent('.money');
          
          const image = getImageSrc('.product-image img') ||
                       getImageSrc('.main-image') ||
                       getImageSrc('img[alt*="ürün"], img[alt*="product"]') ||
                       getImageSrc('.hero img') ||
                       getImageSrc('img');
          
          const code = getTextContent('.product-code') ||
                      getTextContent('.model') ||
                      getTextContent('.sku') ||
                      getTextContent('.code');
          
          return {
            title: title,
            description: description,
            price: price,
            image: image,
            code: code,
            url: window.location.href
          };
        });
        
        detailedProducts.push({
          id: `avens_${categoryInfo.name.replace(/\s+/g, '_')}_${Date.now()}_${i}`,
          name: details.title || product.title,
          description: details.description,
          price: details.price || product.price,
          image_url: details.image || product.image,
          product_code: details.code,
          url: details.url,
          category: categoryInfo.name,
          brand: categoryInfo.name.includes('Vortice') ? 'Vortice' : 
                categoryInfo.name.includes('Nicotra') ? 'Nicotra Gebhardt' : 'AVenS',
          scraped_at: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`❌ ${product.title} detay çekilemedi:`, error.message);
        
        // Basit bilgiyle ekle
        detailedProducts.push({
          id: `avens_${categoryInfo.name.replace(/\s+/g, '_')}_${Date.now()}_${i}`,
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
  console.warn('💡 "Daha fazla" butonlarına tıklayarak tüm ürünler yüklenecek');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();
  
  // User agent ayarla
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const allProducts = [];
  const categoryResults = {};
  
  try {
    // Tüm kategorileri tara
    const testCategories = CATEGORY_PAGES; // Tüm kategoriler
    
    for (const category of testCategories) {
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
    const allProductsFile = _path.join(process.cwd(), 'scraped-_data', `fixed_products_${timestamp}.json`);
    await _fs.writeFile(allProductsFile, JSON.stringify(allProducts, null, 2));
    
    // Kategori özeti
    const summaryFile = _path.join(process.cwd(), 'scraped-_data', `fixed_summary_${timestamp}.json`);
    await _fs.writeFile(summaryFile, JSON.stringify(categoryResults, null, 2));
    
    console.warn('\n📊 Scraping Özeti:');
    console.warn(`📦 Toplam ürün: ${allProducts.length}`);
    console.warn(`📂 Test edilen kategori: ${Object.keys(categoryResults).length}`);
    console.warn('\n📋 Kategori detayları:');
    
    Object.entries(categoryResults).forEach(([name, info]) => {
      console.warn(`  ${name}: ${info._count} ürün (${info.url})`);
    });
    
    console.warn(`\n💾 Veriler kaydedildi:`);
    console.warn(`  - Tüm ürünler: ${allProductsFile}`);
    console.warn(`  - Kategori özeti: ${summaryFile}`);
    
  } catch (error) {
    console.error('💥 Scraping hatası:', error.message);
  } finally {
    await browser.close();
  }
}

// Scraping'i başlat
scrapeAllCategories().catch(console.error);
