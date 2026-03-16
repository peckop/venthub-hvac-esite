import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://avensair.com';
const DELAY = 3000;

// EKSİK KATEGORİLER (1 üründen az olanlar)
const MISSING_CATEGORIES = [
  { name: 'Duvar Tipi Fanlar', url: '/duvar-tipi-fanlar' },
  { name: 'Sessiz Fanlar', url: '/sessiz-fanlar' },
  { name: 'Endüstriyel Fanlar', url: '/endustriyel-fanlar' },
  { name: 'Ex-Proof Fanlar', url: '/ex-proof-fanlar' },
  { name: 'Duman Egzoz Fanları', url: '/duman-egzoz-fanlari' },
  { name: 'Jet Fanlar', url: '/jet-fanlar' },
  { name: 'Basınçlandırma Fanları', url: '/basinclandirma-fanlari' },
  { name: 'Sığınak Fanları', url: '/siginak-fanlari' },
  { name: 'Nicotra Gebhardt', url: '/nicotra-gebhardt' },
  { name: 'Flexible Kanallar', url: '/flexible-kanallar' },
  // Eksik olanlar
  { name: 'Hava Perdeleri', url: '/hava-perdeleri' },
  { name: 'Aksesuarlar', url: '/aksesuarlar' },
  { name: 'Konut Tipi Fanlar', url: '/konut-tipi-fanlar' },
  { name: 'Kanal Tipi Fanlar', url: '/kanal-tipi-fanlar' },
  { name: 'Çatı Tipi Fanlar', url: '/cati-tipi-fanlar' },
  { name: 'Santrifüj Fanlar', url: '/santrifuj-fanlar' }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadAllProducts(page) {
  console.log('🔄 "Daha fazla" butonları kontrol ediliyor...');
  
  let clickCount = 0;
  let maxClicks = 500; // ÇOK FAZLA TIKLAMAK İÇİN
  
  while (clickCount < maxClicks) {
    try {
      const buttons = await page.$$('button, a, .btn, [role="button"]');
      let foundButton = false;
      
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && text.trim().toLowerCase().includes('daha fazla')) {
          const isVisible = await page.evaluate(button => {
            return button.offsetWidth > 0 && button.offsetHeight > 0 && 
                   window.getComputedStyle(button).display !== 'none';
          }, button);
          
          if (isVisible) {
            console.log(`📱 Tık ${clickCount + 1}...`);
            
            await page.evaluate(button => {
              button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, button);
            
            await delay(1000);
            await button.click();
            clickCount++;
            foundButton = true;
            await delay(DELAY);
            break;
          }
        }
      }
      
      if (!foundButton) {
        console.log('✅ Tüm ürünler yüklendi');
        break;
      }
    } catch (error) {
      console.log('⚠️ Hata:', error.message);
      break;
    }
  }
  
  console.log(`📊 Toplam ${clickCount} kez tıklandı`);
  await delay(DELAY);
}

async function scrapeCategory(page, categoryInfo) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${categoryInfo.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const fullUrl = `${BASE_URL}${categoryInfo.url}`;
  
  try {
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log(`📍 Sayfa yüklendi`);
    await delay(DELAY);

    // Tüm ürünleri yükle
    await loadAllProducts(page);

    // Sayfada ürün kartlarını bul
    const products = await page.evaluate((catName) => {
      const productCards = [];
      
      // TÜM OLASI SELEKTÖRLERİ DENE
      const selectors = [
        '.urunkutu',  // AvensAir'in kullandığı class
        '.product-card',
        '.product-item', 
        '.product',
        '.card',
        '.item',
        'article',
        '[data-product]',
        '.grid-item',
        '.product-box',
        '.col-md-4',
        '.col-sm-6',
        '.col-lg-3',
        '.thumbnail',
        '.thumbnail-variant-1'
      ];
      
      let foundElements = [];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements = Array.from(elements);
          console.log(`✓ Selector ${selector} ile ${elements.length} element bulundu`);
          break;
        }
      }
      
      foundElements.forEach((element, index) => {
        try {
          const linkElement = element.tagName === 'A' ? element : element.querySelector('a');
          const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .name, .product-name, .caption h3') ||
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
              !productTitle.includes('404') &&
              !productTitle.includes('Sepet') &&
              !productTitle.includes('satis@')) {
            
            productCards.push({
              name: productTitle,
              category: catName,
              url: productLink,
              image_url: productImage,
              price: productPrice,
              brand: 'AVenS',
              scraped_at: new Date().toISOString()
            });
          }
        } catch (error) {
          console.log(`Ürün parse hatası:`, error.message);
        }
      });
      
      return productCards;
    }, categoryInfo.name);
    
    console.log(`✅ ${products.length} ürün bulundu`);
    return products;
    
  } catch (error) {
    console.error(`❌ ${categoryInfo.name} hatası:`, error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 AvensAir Eksik Kategoriler Scraper\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  let allProducts = [];
  const stats = {};
  
  for (const category of MISSING_CATEGORIES) {
    const products = await scrapeCategory(page, category);
    allProducts.push(...products);
    stats[category.name] = products.length;
    await delay(2000);
  }
  
  await browser.close();
  
  // Sonuçları kaydet
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `scraped-data/complete_avens_${timestamp}.json`;
  
  await fs.writeFile(
    filename,
    JSON.stringify(allProducts, null, 2),
    'utf-8'
  );
  
  // Özet
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING TAMAMLANDI');
  console.log('='.repeat(60));
  console.log(`\nTOPLAM ÜRÜN: ${allProducts.length}\n`);
  
  console.log('Kategori Dağılımı:');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  
  console.log(`\n💾 Kaydedildi: ${filename}`);
  console.log('='.repeat(60));
}

main().catch(console.error);