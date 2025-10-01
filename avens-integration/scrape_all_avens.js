import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://www.avensair.com';
const OUTPUT_DIR = path.join(__dirname, 'scraped-data');
const DELAY_MS = 2000; // Respectful delay between requests

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function cleanPrice(priceText) {
  if (!priceText) return null;
  
  // Remove currency symbols and clean up
  const cleaned = priceText.replace(/[₺\s]/g, '').replace(/\./g, '').replace(',', '.');
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}

function extractBrand(productName) {
  const brands = ['NICOTRA', 'ENKELFAN', 'VORTICE', 'GEBHARDT', 'SYSTEMAIR', 'SOLER', 'PALAU'];
  for (const brand of brands) {
    if (productName.toUpperCase().includes(brand)) {
      return brand;
    }
  }
  return 'GENEL'; // Default brand
}

// Main scraping functions
async function scrapeMainCategories(page) {
  console.log('🔍 Discovering main categories...');
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Take a screenshot to debug
  await page.screenshot({ path: 'scraped-data/homepage.png', fullPage: true });
  
  // Look for category links with more specific criteria
  const categories = await page.evaluate(() => {
    const categoryLinks = [];
    
    // Get all links and analyze them
    const allLinks = document.querySelectorAll('a[href]');
    console.log(`Found ${allLinks.length} total links`);
    
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim();
      
      if (href && text) {
        // Log all links for debugging
        console.log(`Link: "${text}" -> ${href}`);
        
        // Look for HVAC-related category patterns
        const hvacKeywords = ['fan', 'hava', 'klima', 'motor', 'ventil', 'soğutma', 'ısıtma', 'vortice', 'nicotra'];
        const isHvacRelated = hvacKeywords.some(keyword => 
          text.toLowerCase().includes(keyword) || href.toLowerCase().includes(keyword)
        );
        
        // Filter valid category links
        if (isHvacRelated && 
            href.length > 3 && 
            !href.includes('.pdf') && 
            !href.includes('login') && 
            !href.includes('contact') && 
            !href.includes('hakkimizda') && 
            !href.includes('about') &&
            !categoryLinks.find(c => c.url === href)) {
          
          categoryLinks.push({
            name: text,
            url: href.startsWith('http') ? href : `https://www.avensair.com${href.startsWith('/') ? href : '/' + href}`
          });
        }
      }
    }
    
    return categoryLinks;
  });
  
  console.log(`📋 Found ${categories.length} potential HVAC categories`);
  
  // If no HVAC categories found, try direct product discovery
  if (categories.length === 0) {
    console.log('🔍 No HVAC categories found, trying direct product pages...');
    
    const directPages = [
      { name: 'Fanlar', url: `${BASE_URL}` }, // Start from homepage
      { name: 'Ana Sayfa', url: `${BASE_URL}` }
    ];
    
    return directPages;
  }
  
  return categories;
}

async function scrapeProductLinks(page, categoryUrl) {
  console.log(`🔍 Scraping products from: ${categoryUrl}`);
  
  try {
    await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    
    // Take a screenshot for debugging
    await page.screenshot({ path: `scraped-data/category_${Date.now()}.png`, fullPage: false });
    
    const productLinks = await page.evaluate(() => {
      const links = [];
      
      console.log('Looking for products on page...');
      
      // Get all links and analyze them for HVAC products
      const allLinks = document.querySelectorAll('a[href]');
      console.log(`Found ${allLinks.length} total links on page`);
      
      // HVAC product patterns
      const productKeywords = [
        'nicotra', 'gebhardt', 'vortice', 'enkelfan', 'systemair', 'soler', 'palau',
        'fan', 'motor', 'klima', 'hava', 'aspirator', 'blower', 'centrifugal',
        'axial', 'radyal', 'inline', 'kanal', 'tavan', 'duvar', 'bacalı'
      ];
      
      for (const link of allLinks) {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        const title = link.getAttribute('title') || '';
        
        if (href && (text || title)) {
          const combinedText = `${text} ${title}`.toLowerCase();
          
          // Check if this looks like a product
          const looksLikeProduct = productKeywords.some(keyword => 
            combinedText.includes(keyword) || href.toLowerCase().includes(keyword)
          );
          
          // Additional checks for product URLs
          const hasProductPath = href.includes('/') && 
            (href.includes('-') || href.includes('_')) && 
            !href.includes('.pdf') && 
            !href.includes('.jpg') && 
            !href.includes('.png') && 
            !href.includes('login') && 
            !href.includes('contact');
          
          if ((looksLikeProduct || hasProductPath) && href.length > 5) {
            const fullUrl = href.startsWith('http') ? href : `https://www.avensair.com${href.startsWith('/') ? href : '/' + href}`;
            
            if (!links.includes(fullUrl) && !fullUrl.includes('#')) {
              console.log(`Found potential product: "${text}" -> ${fullUrl}`);
              links.push(fullUrl);
            }
          }
        }
      }
      
      // Also look for images that might indicate products
      const images = document.querySelectorAll('img[src*="upload"], img[alt]');
      for (const img of images) {
        const parent = img.closest('a[href]');
        if (parent) {
          const href = parent.getAttribute('href');
          if (href && href.length > 5) {
            const fullUrl = href.startsWith('http') ? href : `https://www.avensair.com${href.startsWith('/') ? href : '/' + href}`;
            if (!links.includes(fullUrl) && !fullUrl.includes('#')) {
              console.log(`Found product via image: ${fullUrl}`);
              links.push(fullUrl);
            }
          }
        }
      }
      
      return links;
    });
    
    // Remove duplicates and invalid URLs
    const cleanLinks = [...new Set(productLinks)].filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
    
    console.log(`📦 Found ${cleanLinks.length} potential product links`);
    return cleanLinks;
    
  } catch (error) {
    console.error(`❌ Error scraping category ${categoryUrl}:`, error.message);
    return [];
  }
}

async function scrapeProductDetails(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    
    const productData = await page.evaluate((url) => {
      // Try to extract product information
      const title = document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('.product-title')?.textContent?.trim() ||
                   document.querySelector('title')?.textContent?.trim();
      
      // Try different price selectors
      const priceSelectors = ['.price', '.product-price', '.fiyat', '[class*="price"]', '[class*="fiyat"]'];
      let priceElement = null;
      
      for (const selector of priceSelectors) {
        priceElement = document.querySelector(selector);
        if (priceElement) break;
      }
      
      const priceText = priceElement?.textContent?.trim();
      
      // Try to find images
      const imageSelectors = ['img[src*="upload"]', '.product-image img', '.gallery img', 'img[alt*="product"]'];
      let imageElement = null;
      
      for (const selector of imageSelectors) {
        imageElement = document.querySelector(selector);
        if (imageElement) break;
      }
      
      const imageSrc = imageElement?.getAttribute('src');
      
      // Try to find product code/SKU
      const codeSelectors = [
        '[class*="code"]', '[class*="sku"]', '[class*="model"]',
        '.product-code', '.sku', '.model-number'
      ];
      
      let productCode = null;
      for (const selector of codeSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          productCode = element.textContent.trim();
          break;
        }
      }
      
      // Try to extract description
      const descriptionSelectors = [
        '.product-description', '.description', '.product-content',
        '[class*="description"]', '.content', '.details'
      ];
      
      let description = null;
      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          description = element.textContent.trim();
          break;
        }
      }
      
      return {
        title,
        priceText,
        imageSrc: imageSrc ? (imageSrc.startsWith('http') ? imageSrc : `https://www.avensair.com${imageSrc}`) : null,
        productCode,
        description,
        url
      };
    }, productUrl);
    
    // Process the scraped data
    if (!productData.title) {
      console.log(`⚠️ No title found for ${productUrl}`);
      return null;
    }
    
    const price = cleanPrice(productData.priceText);
    const brand = extractBrand(productData.title);
    
    return {
      id: generateId(),
      name: productData.title,
      price,
      currency: 'TRY',
      brand,
      image_url: productData.imageSrc,
      product_code: productData.productCode,
      description: productData.description,
      product_url: productUrl,
      source_url: productUrl,
      scraped_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error scraping product ${productUrl}:`, error.message);
    return null;
  }
}

async function saveData(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Saved ${data.length} items to ${filename}`);
}

async function ensureOutputDirectory() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log('📁 Output directory ready');
}

async function main() {
  console.log('🚀 Starting comprehensive Avens scraping...');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  
  try {
    await ensureOutputDirectory();
    
    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Step 1: Find all categories
    const categories = await scrapeMainCategories(page);
    await saveData('categories.json', categories);
    
    if (categories.length === 0) {
      console.log('❌ No categories found. Let\'s try direct product discovery...');
      
      // Fallback: try common HVAC product pages
      const commonPages = [
        `${BASE_URL}/fanlar`,
        `${BASE_URL}/havalandirma`,
        `${BASE_URL}/klimalar`,
        `${BASE_URL}/urunler`,
        `${BASE_URL}/products`,
        `${BASE_URL}/katalog`
      ];
      
      for (const pageUrl of commonPages) {
        console.log(`🔍 Trying: ${pageUrl}`);
        const products = await scrapeProductLinks(page, pageUrl);
        if (products.length > 0) {
          categories.push({ name: 'Ürünler', url: pageUrl });
          break;
        }
      }
    }
    
    // Step 2: Collect all product links
    const allProductLinks = [];
    const categoryProducts = {};
    
    for (const category of categories.slice(0, 15)) { // Limit to first 15 categories for comprehensive data
      console.log(`\n📂 Processing category: ${category.name}`);
      
      const productLinks = await scrapeProductLinks(page, category.url);
      categoryProducts[category.name] = productLinks;
      allProductLinks.push(...productLinks);
      
      await new Promise(resolve => setTimeout(resolve, DELAY_MS)); // Be respectful
    }
    
    // Remove duplicates
    const uniqueProductLinks = [...new Set(allProductLinks)];
    console.log(`\n📦 Total unique products found: ${uniqueProductLinks.length}`);
    
    await saveData('product_links.json', uniqueProductLinks);
    await saveData('category_products.json', categoryProducts);
    
    // Step 3: Scrape product details
    const allProducts = [];
    const batchSize = 5; // Process in small batches
    
    for (let i = 0; i < uniqueProductLinks.length; i += batchSize) {
      const batch = uniqueProductLinks.slice(i, i + batchSize);
      
      console.log(`\n🔄 Processing products ${i + 1}-${i + batch.length} of ${uniqueProductLinks.length}`);
      
      for (const productUrl of batch) {
        console.log(`📦 Scraping: ${productUrl}`);
        
        const product = await scrapeProductDetails(page, productUrl);
        if (product) {
          allProducts.push(product);
          console.log(`✅ ${product.name} - ${product.price ? product.price + ' TL' : 'Fiyat yok'}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, DELAY_MS)); // Be respectful
      }
      
      // Save progress every batch
      await saveData(`products_batch_${Math.floor(i / batchSize) + 1}.json`, allProducts);
    }
    
    // Final save
    await saveData('all_products.json', allProducts);
    
    // Summary
    console.log('\n📊 Scraping Summary:');
    console.log(`📂 Categories found: ${categories.length}`);
    console.log(`🔗 Product links found: ${uniqueProductLinks.length}`);
    console.log(`📦 Products scraped: ${allProducts.length}`);
    console.log(`💰 Products with prices: ${allProducts.filter(p => p.price).length}`);
    console.log(`🖼️ Products with images: ${allProducts.filter(p => p.image_url).length}`);
    
    // Group by brand
    const brandCounts = {};
    allProducts.forEach(product => {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    });
    
    console.log('\n📊 Brand breakdown:');
    Object.entries(brandCounts).forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} products`);
    });
    
    console.log('\n🎉 Scraping completed successfully!');
    console.log(`📁 Data saved to: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('💥 Scraping failed:', error);
  } finally {
    await browser.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⏹️ Scraping interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the scraper
main().catch(console.error);