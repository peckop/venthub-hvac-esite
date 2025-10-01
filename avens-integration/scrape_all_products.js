import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const PRODUCTS_URL = 'https://www.avensair.com/urunler';
const DELAY = 2000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadAllProducts(page) {
  console.log('🔄 Tüm ürünleri yüklüyorum...');
  
  let clickCount = 0;
  let noButtonCount = 0;
  const maxNoButton = 3;
  
  while (noButtonCount < maxNoButton) {
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

async function scrapeAllProducts(page) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TÜM ÜRÜNLER SAYFASI');
  console.log('='.repeat(60));
  
  try {
    await page.goto(PRODUCTS_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    });
    
    console.log(`📍 Sayfa yüklendi: ${PRODUCTS_URL}`);
    await delay(DELAY);

    // Tüm ürünleri yükle
    await loadAllProducts(page);

    // Ürünleri çek
    const products = await page.evaluate(() => {
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
          const imageElement = element.querySelector('img');
          const priceElement = element.querySelector('.price, .fiyat, .amount, .cost, .money');
          
          const productLink = linkElement ? linkElement.href : '';
          const productTitle = titleElement ? titleElement.textContent.trim() : 
                              linkElement ? linkElement.textContent.trim() : '';
          const productImage = imageElement ? imageElement.src : '';
          const productPrice = priceElement ? priceElement.textContent.trim() : '';
          
          // URL'den kategori çıkar (varsa)
          let category = 'Genel';
          if (productLink) {
            const urlParts = productLink.split('/');
            // Kategori bilgisini URL'den veya breadcrumb'dan al
            const breadcrumb = element.closest('.urunkutu')?.querySelector('.breadcrumb');
            if (breadcrumb) {
              const breadcrumbText = breadcrumb.textContent.trim();
              const parts = breadcrumbText.split('>').map(p => p.trim());
              if (parts.length > 1) {
                category = parts[parts.length - 2] || 'Genel';
              }
            }
          }
          
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
              category: category,
              url: productLink,
              image_url: productImage,
              price: productPrice,
              brand: 'AVenS',
              scraped_at: new Date().toISOString()
            });
          }
        } catch (error) {
          console.log(`Ürün parse hatası (${index}):`, error.message);
        }
      });
      
      return productCards;
    });
    
    console.log(`✅ ${products.length} ürün bulundu`);
    return products;
    
  } catch (error) {
    console.error(`❌ Hata:`, error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 AvensAir Tüm Ürünler Scraper\n');
  
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
  
  const products = await scrapeAllProducts(page);
  
  await browser.close();
  
  // Sonuçları kaydet
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `scraped-data/all_products_${timestamp}.json`;
  
  await fs.writeFile(
    filename,
    JSON.stringify(products, null, 2),
    'utf-8'
  );
  
  // Kategorilere göre grupla
  const byCategory = {};
  products.forEach(p => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = 0;
    }
    byCategory[p.category]++;
  });
  
  // Özet
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING TAMAMLANDI');
  console.log('='.repeat(60));
  console.log(`\nTOPLAM ÜRÜN: ${products.length}\n`);
  
  console.log('Kategori Dağılımı:');
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  
  console.log(`\n💾 Kaydedildi: ${filename}`);
  console.log('='.repeat(60));
}

main().catch(console.error);