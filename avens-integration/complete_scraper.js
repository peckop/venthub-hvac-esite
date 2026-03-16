import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const BASE_URL = 'https://avensair.com';
const DELAY = 2000;

// TÜM KATEGORİLER
const CATEGORIES = [
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
  { name: 'Plug Fanlar', url: '/plug-fanlar' },
  { name: 'Hava Perdeleri', url: '/hava-perdeleri' },
  { name: 'Flexible Kanallar', url: '/flexible-kanallar' },
  { name: 'Aksesuarlar', url: '/aksesuarlar' },
  { name: 'Nem Alma Cihazları', url: '/nem-alma-cihazlari' },
  { name: 'Isı Geri Kazanım', url: '/isi-geri-kazanim' },
  { name: 'Hız Kontrolü', url: '/hiz-kontrolu' }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function clickLoadMore(page, maxAttempts = 100) {
  console.log('🔄 "Daha fazla" butonlarına tıklanıyor...');
  
  let totalClicks = 0;
  let consecutiveFailures = 0;
  
  while (totalClicks < maxAttempts && consecutiveFailures < 3) {
    try {
      // Sayfayı scroll et
      await autoScroll(page);
      await delay(1000);
      
      // Tüm butonları kontrol et
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, .btn, [role="button"]'));
        
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          const isVisible = button.offsetWidth > 0 && button.offsetHeight > 0 && 
                           window.getComputedStyle(button).display !== 'none';
          
          if (isVisible && (
            text.includes('daha fazla') || 
            text.includes('load more') || 
            text.includes('daha') ||
            text.includes('fazla') ||
            button.classList.contains('load-more') ||
            button.classList.contains('more')
          )) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            button.click();
            return true;
          }
        }
        return false;
      });
      
      if (clicked) {
        totalClicks++;
        consecutiveFailures = 0;
        console.log(`  ✓ Tık ${totalClicks}`);
        await delay(DELAY);
      } else {
        consecutiveFailures++;
        console.log(`  · Buton bulunamadı (${consecutiveFailures}/3)`);
        await delay(500);
      }
      
    } catch (error) {
      console.log(`  ⚠ Hata:`, error.message);
      consecutiveFailures++;
    }
  }
  
  console.log(`📊 Toplam ${totalClicks} kez tıklandı`);
  return totalClicks;
}

async function scrapeCategory(page, category) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${category.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const url = `${BASE_URL}${category.url}`;
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log(`📍 Sayfa yüklendi`);
    await delay(DELAY);
    
    // Tüm ürünleri yükle
    await clickLoadMore(page);
    
    // Son scroll
    await autoScroll(page);
    await delay(2000);
    
    // Ürünleri çek
    const products = await page.evaluate((catName) => {
      const results = [];
      
      // TÜM OLASI SELEKTÖRLERİ DENE
      const selectors = [
        'a[href*="/urun/"]',
        'a[href*="/product/"]',
        'a[href*="/p/"]',
        '.product-card a',
        '.product-item a',
        '.product a',
        'article a',
        '.card a'
      ];
      
      const links = new Set();
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(link => {
          const href = link.href;
          if (href && (href.includes('/urun/') || href.includes('/product/'))) {
            links.add(href);
          }
        });
      });
      
      console.log(`Found ${links.size} unique product links`);
      
      links.forEach(link => {
        // Link'ten ürün ismini çıkar
        const pathParts = link.split('/');
        const productSlug = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
        
        if (productSlug && productSlug.length > 2) {
          const productName = productSlug
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          results.push({
            name: productName,
            category: catName,
            url: link,
            brand: 'AVenS'
          });
        }
      });
      
      return results;
    }, category.name);
    
    console.log(`✅ ${products.length} ürün bulundu`);
    return products;
    
  } catch (error) {
    console.error(`❌ Hata: ${category.name}:`, error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 AvensAir Kapsamlı Scraper Başlatılıyor...\n');
  
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
  
  let allProducts = [];
  const stats = {};
  
  for (const category of CATEGORIES) {
    const products = await scrapeCategory(page, category);
    allProducts.push(...products);
    stats[category.name] = products.length;
    
    // Kısa bekleme
    await delay(1000);
  }
  
  await browser.close();
  
  // Sonuçları kaydet
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `scraped-data/complete_products_${timestamp}.json`;
  
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