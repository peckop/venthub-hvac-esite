const fs = require('fs');
const path = require('path');

// Configuration
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://www.avensair.com';
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay between requests
const MAX_RETRIES = 3;

// Load sitemap data
const sitemapPath = path.join(__dirname, '..', 'data', 'sitemap.json');
const rawSitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));

// Convert sitemap format to expected structure
const sitemap = {
  categories: Object.values(rawSitemap).map(category => ({
    name: category.name,
    url: category.url,
    subcategories: category.subcategories || []
  }))
};

// Output directories
const dataDir = path.join(__dirname, '..', 'data');
const rawDataDir = path.join(dataDir, 'raw');
const processedDataDir = path.join(dataDir, 'processed');

// Ensure directories exist
[rawDataDir, processedDataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Utility function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to make Firecrawl API calls
async function scrapeUrl(url, retries = 0) {
  try {
    console.log(`Scraping: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        removeBase64Images: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Scraping failed: ${result.error || 'Unknown error'}`);
    }

    return result.data;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    
    if (retries < MAX_RETRIES) {
      console.log(`Retrying... (${retries + 1}/${MAX_RETRIES})`);
      await delay(DELAY_BETWEEN_REQUESTS * (retries + 1));
      return scrapeUrl(url, retries + 1);
    } else {
      console.error(`Failed to scrape ${url} after ${MAX_RETRIES} retries`);
      return null;
    }
  }
}

// Function to extract product URLs from category page
function extractProductUrls(markdown) {
  const productUrls = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    // Look for product links in markdown
    const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(line)) !== null) {
      const [, title, url] = match;
      
      // Filter for product URLs (typically contain /product/ or similar patterns)
      if (url.includes('/product/') || url.includes('/item/') || 
          (url.startsWith('/') && url.split('/').length >= 3 && 
           !url.includes('/category/') && !url.includes('/page/'))) {
        productUrls.push({
          title: title.trim(),
          url: BASE_URL + url
        });
      }
    }
  }
  
  return productUrls;
}

// Function to parse product data from markdown
function parseProductData(markdown, productUrl) {
  const lines = markdown.split('\n');
  let product = {
    url: productUrl,
    name: '',
    sku: '',
    brand: 'AVENS',
    price: '',
    description: '',
    specifications: {},
    images: [],
    category: '',
    subcategory: ''
  };

  let currentSection = '';
  let description = [];
  let specifications = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract product name (usually first h1 or prominent heading)
    if (line.startsWith('# ') && !product.name) {
      product.name = line.substring(2).trim();
    } else if (line.startsWith('## ') && !product.name) {
      product.name = line.substring(3).trim();
    }
    
    // Extract SKU (look for patterns like "SKU:", "Model:", "Part Number:")
    if (line.toLowerCase().includes('sku:') || 
        line.toLowerCase().includes('model:') || 
        line.toLowerCase().includes('part number:')) {
      const skuMatch = line.match(/(?:sku|model|part number):\s*([^\s,]+)/i);
      if (skuMatch) {
        product.sku = skuMatch[1].trim();
      }
    }
    
    // Extract price (look for currency symbols)
    const priceMatch = line.match(/[\$€£]\s*([0-9,]+\.?[0-9]*)/);
    if (priceMatch && !product.price) {
      product.price = priceMatch[0];
    }
    
    // Extract images (markdown image syntax)
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
    if (imageMatch) {
      imageMatch.forEach(img => {
        const imgData = img.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgData) {
          let imageUrl = imgData[2];
          // Convert relative URLs to absolute
          if (imageUrl.startsWith('/')) {
            imageUrl = BASE_URL + imageUrl;
          } else if (!imageUrl.startsWith('http')) {
            imageUrl = BASE_URL + '/' + imageUrl;
          }
          
          product.images.push({
            alt: imgData[1] || '',
            url: imageUrl
          });
        }
      });
    }
    
    // Build description from content
    if (line && !line.startsWith('#') && !line.match(/^[\|\-\+\*\s]*$/) && 
        !line.toLowerCase().includes('sku:') && 
        !line.toLowerCase().includes('price:') &&
        !priceMatch) {
      description.push(line);
    }
  }
  
  product.description = description.join('\n').trim();
  
  return product;
}

// Main scraping function
async function scrapeProducts() {
  console.log('Starting product scraping...');
  console.log(`Total categories to process: ${sitemap.categories.length}`);
  
  let totalProducts = 0;
  const allProducts = [];
  
  for (const category of sitemap.categories) {
    console.log(`\n=== Processing Category: ${category.name} ===`);
    
    for (const subcategory of category.subcategories) {
      console.log(`\n--- Processing Subcategory: ${subcategory.name} ---`);
      
      // Scrape category page to get product list
      const categoryData = await scrapeUrl(subcategory.url);
      
      if (!categoryData) {
        console.log(`Skipping subcategory ${subcategory.name} due to scraping failure`);
        continue;
      }
      
      // Save raw category data
      const categoryFileName = `category_${category.name}_${subcategory.name}`.replace(/[^a-z0-9]/gi, '_');
      fs.writeFileSync(
        path.join(rawDataDir, `${categoryFileName}.json`), 
        JSON.stringify(categoryData, null, 2)
      );
      
      // Extract product URLs from category page
      const productUrls = extractProductUrls(categoryData.markdown);
      console.log(`Found ${productUrls.length} products in ${subcategory.name}`);
      
      // Scrape each product
      for (const productInfo of productUrls) {
        await delay(DELAY_BETWEEN_REQUESTS);
        
        const productData = await scrapeUrl(productInfo.url);
        
        if (productData) {
          // Parse product data
          const product = parseProductData(productData.markdown, productInfo.url);
          product.category = category.name;
          product.subcategory = subcategory.name;
          
          // Use title from category page if product name is missing
          if (!product.name && productInfo.title) {
            product.name = productInfo.title;
          }
          
          allProducts.push(product);
          totalProducts++;
          
          // Save individual product data
          const productFileName = `product_${totalProducts}`.replace(/[^a-z0-9]/gi, '_');
          fs.writeFileSync(
            path.join(rawDataDir, `${productFileName}.json`), 
            JSON.stringify({ ...productData, parsed: product }, null, 2)
          );
          
          console.log(`  ✓ Scraped: ${product.name || productInfo.title || 'Unnamed Product'}`);
        } else {
          console.log(`  ✗ Failed: ${productInfo.title || productInfo.url}`);
        }
      }
    }
  }
  
  // Save consolidated products data
  const outputData = {
    timestamp: new Date().toISOString(),
    total_products: totalProducts,
    categories: sitemap.categories.length,
    products: allProducts
  };
  
  fs.writeFileSync(
    path.join(processedDataDir, 'all_products.json'), 
    JSON.stringify(outputData, null, 2)
  );
  
  console.log(`\n=== Scraping Complete ===`);
  console.log(`Total products scraped: ${totalProducts}`);
  console.log(`Data saved to: ${processedDataDir}/all_products.json`);
  
  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    total_products: totalProducts,
    categories_processed: sitemap.categories.length,
    products_by_category: {}
  };
  
  sitemap.categories.forEach(category => {
    const categoryProducts = allProducts.filter(p => p.category === category.name);
    summary.products_by_category[category.name] = {
      total: categoryProducts.length,
      subcategories: {}
    };
    
    category.subcategories.forEach(sub => {
      const subProducts = categoryProducts.filter(p => p.subcategory === sub.name);
      summary.products_by_category[category.name].subcategories[sub.name] = subProducts.length;
    });
  });
  
  fs.writeFileSync(
    path.join(dataDir, 'scraping_summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`Summary report saved to: ${dataDir}/scraping_summary.json`);
}

// Error handling for the main function
async function main() {
  try {
    await scrapeProducts();
  } catch (error) {
    console.error('Fatal error during scraping:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  // Check if API key is set
  if (FIRECRAWL_API_KEY === 'your_api_key_here') {
    console.error('Error: FIRECRAWL_API_KEY environment variable is not set');
    console.error('Please set it using: $env:FIRECRAWL_API_KEY="your_actual_api_key"');
    process.exit(1);
  }
  
  main();
}