import puppeteer from 'puppeteer';
import _fs from '_fs/promises';
import _path from '_path';

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
  console.warn('🔄 "Daha fazla" butonları kontrol ediliyor...');
  
  let clickCount = 0;
  let maxClicks = 500; // ÇOK FAZLA TIKLAMAK İÇİN
  
  while (clickCount < maxClicks) {
    try {
      const buttons = await page.$$('button, a, .btn, [role="button"]');
      let foundButton = false;
      
      for (const button of buttons) {
        const _text = await page.evaluate(el => el.textContent, button);
        if (_text && _text.trim().toLowerCase().includes('daha fazla')) {
          const isVisible = await page.evaluate(button => {
            return button.offsetWidth > 0 && button.offsetHeight > 0 && 
                   window.getComputedStyle(button).display !== 'none';
          }, button);
          
          if (isVisible) {
            console.warn(`📱 Tık ${clickCount + 1}...`);
            
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
        console.warn('✅ Tüm ürünler yüklendi');
        break;
      }
    } catch (error) {
      console.warn('⚠️ Hata:', error.message);
      break;
    }
  }
  
  console.warn(`📊 Toplam ${clickCount} kez tıklandı`);
  await delay(DELAY);
}

async function scrapeCategory(page, categoryInfo) {
  console.warn(`\n${'='.repeat(60)}`);
  console.warn(`🔍 ${categoryInfo.name}`);
  console.warn(`${'='.repeat(60)}`);
  
  const fullUrl = `${BASE_URL}${categoryInfo.url}`;
  
  try {
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.warn(`📍 Sayfa yüklendi`);
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
        '[_data-product]',
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
          console.warn(`✓ Selector ${selector} ile ${elements.length} element bulundu`);
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
          console.warn(`Ürün parse hatası:`, error.message);
        }
      });
      
      return productCards;
    }, categoryInfo.name);
    
    console.warn(`✅ ${products.length} ürün bulundu`);
    return products;
    
  } catch (error) {
    console.error(`❌ ${categoryInfo.name} hatası:`, error.message);
    return [];
  }
}

async function main() {
  console.warn('🚀 AvensAir Eksik Kategoriler Scraper\n');
  
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
  const filename = `scraped-_data/complete_avens_${timestamp}.json`;
  
  await _fs.writeFile(
    filename,
    JSON.stringify(allProducts, null, 2),
    'utf-8'
  );
  
  // Özet
  console.warn('\n' + '='.repeat(60));
  console.warn('📊 SCRAPING TAMAMLANDI');
  console.warn('='.repeat(60));
  console.warn(`\nTOPLAM ÜRÜN: ${allProducts.length}\n`);
  
  console.warn('Kategori Dağılımı:');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, _count]) => {
      console.warn(`  ${cat}: ${_count}`);
    });
  
  console.warn(`\n💾 Kaydedildi: ${filename}`);
  console.warn('='.repeat(60));
}

main().catch(console.error);
