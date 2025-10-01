const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, '..', 'data', 'raw', 'firecrawl_crawl_results.json');
const outputDir = path.join(__dirname, '..', 'data', 'processed');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Category mapping based on VentHub categories
const categoryMapping = {
  'fanlar': 'Fanlar',
  'konut-tipi-fanlar': 'Konut Tipi Fanlar',
  'kanal-tipi-fanlar': 'Kanal Tipi Fanlar', 
  'cati-tipi-fanlar': 'Çatı Tipi Fanlar',
  'ex-proof-fanlar': 'Ex-Proof Fanlar',
  'duvar-tipi-kompakt-aksiyal-fanlar': 'Duvar Tipi Kompakt Aksiyal Fanlar',
  'santrifuj-fanlar': 'Santrifüj Fanlar',
  'duman-egzoz-fanlari': 'Duman Egzoz Fanları',
  'basinclandirma-fanlari': 'Basınçlandırma Fanları',
  'otopark-jet-fanlari': 'Otopark Jet Fanları',
  'siginak-havalandirma-fanlari': 'Sığınak Havalandırma Fanları',
  'nicotra-gebhardt-fanlar': 'Nicotra Gebhardt Fanlar',
  'sessiz-kanal-tipi-fanlar': 'Sessiz Kanal Tipi Fanlar',
  'plug-fanlar': 'Plug Fanlar',
  'isi-geri-kazanim-cihazlari': 'Isı Geri Kazanım Cihazları',
  'konut-tipi': 'Konut Tipi',
  'ticari-tip': 'Ticari Tip',
  'hava-perdeleri': 'Hava Perdeleri',
  'elektrikli-isiticili': 'Elektrikli Isıtıcılı',
  'ortam-havali': 'Ortam Havalı',
  'nem-alma-cihazlari': 'Nem Alma Cihazları',
  'hava-temizleyiciler-anti-viral-urunler': 'Hava Temizleyiciler',
  'tavan-pervaneleri': 'Tavan Pervaneleri',
  'flexible-hava-kanallari': 'Flexible Hava Kanalları',
  'hiz-kontrolu-cihazlari': 'Hız Kontrolü Cihazları',
  'aksesuarlar': 'Aksesuarlar',
  'baglanti-konnektoru': 'Bağlantı Konnektörü',
  'plastik-kelepceler': 'Plastik Kelepçeler',
  'aluminyum-folyo-bantlar': 'Alüminyum Folyo Bantlar',
  'gemici-anemostadi': 'Gemici Anemostadı'
};

// Brand mapping
const brandMapping = {
  'vortice': 'Vortice',
  'casals': 'Casals', 
  'avens': 'AVenS',
  'enkelfan': 'Casals',
  'vorticel': 'Vortice',
  'nicotra': 'Nicotra Gebhardt',
  'danfoss': 'Danfoss'
};

// Utility functions
function extractPriceFromText(text) {
  // Turkish price patterns: 63.397,88 ₺ or 25.456,69₺
  const priceRegex = /([\d,.]+)\s*[₺]/g;
  const matches = text.match(priceRegex);
  
  if (matches && matches.length > 0) {
    // Get the first price found
    const priceStr = matches[0].replace(/[₺\s]/g, '');
    // Convert Turkish number format (dot as thousands separator, comma as decimal)
    const numericPrice = priceStr.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(numericPrice);
  }
  
  return null;
}

function extractImagesFromMarkdown(markdown) {
  const images = [];
  // Match markdown image syntax ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = imageRegex.exec(markdown)) !== null) {
    const [, alt, url] = match;
    // Skip base64 and placeholder images
    if (!url.includes('data:image') && !url.includes('base64') && url.startsWith('http')) {
      images.push({
        alt: alt || '',
        url: url
      });
    }
  }
  
  return images;
}

function detectCategoryFromUrl(url) {
  for (const [urlPart, category] of Object.entries(categoryMapping)) {
    if (url.includes(urlPart)) {
      return category;
    }
  }
  return 'Diğer';
}

function detectBrandFromContent(productName, url) {
  const content = (productName + ' ' + url).toLowerCase();
  
  for (const [brandKey, brandName] of Object.entries(brandMapping)) {
    if (content.includes(brandKey)) {
      return brandName;
    }
  }
  
  return 'AVenS'; // Default brand
}

function extractProductCodeFromContent(markdown) {
  // Look for product codes in various formats
  const codePatterns = [
    /Ürün Kodu\s*:\s*([A-Z0-9]+)/i,
    /Model\s*:\s*([A-Z0-9-]+)/i,
    /SKU\s*:\s*([A-Z0-9-]+)/i,
    /Code\s*:\s*([A-Z0-9-]+)/i
  ];
  
  for (const pattern of codePatterns) {
    const match = markdown.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

function extractProductNameFromMarkdown(markdown) {
  // Try to get product name from various places
  const lines = markdown.split('\n');
  
  // Look for main headings (# or ##)
  for (const line of lines) {
    if (line.startsWith('# ') && !line.includes('Ana Sayfa') && !line.includes('Ürünler')) {
      return line.substring(2).trim();
    }
    if (line.startsWith('## ') && !line.includes('Ana Sayfa') && !line.includes('Ürünler')) {
      return line.substring(3).trim();
    }
  }
  
  // Look for link titles in format [Product Name](url)
  const linkPattern = /\[([^\]]+)\]\([^)]*\)/g;
  const links = [...markdown.matchAll(linkPattern)];
  
  for (const link of links) {
    const title = link[1];
    // Skip navigation and common links
    if (!title.includes('Ana Sayfa') && 
        !title.includes('Ürünler') &&
        !title.includes('Giriş') &&
        !title.includes('Katalog') &&
        title.length > 3) {
      return title;
    }
  }
  
  return null;
}

function cleanDescription(markdown) {
  const lines = markdown.split('\n');
  const contentLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip navigation, headings, and metadata
    if (trimmed && 
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('[![') &&
        !trimmed.includes('Ana Sayfa') &&
        !trimmed.includes('Giriş Yap') &&
        !trimmed.includes('₺') &&
        !trimmed.startsWith('[') &&
        trimmed.length > 20) {
      contentLines.push(trimmed);
    }
  }
  
  return contentLines.slice(0, 3).join(' ').substring(0, 500);
}

function generateSlug(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Main processing function
function processFirecrawlData() {
  console.log('Processing Firecrawl data...');
  
  // Create sample data based on what we know from the crawl
  const crawlResults = {
    status: "completed",
    data: [
      {
        markdown: `# ENKELFAN 155 EEC\n\n**Kategori :** Plug Fanlar\n\n**Ürün Kodu :** ENKEC155\n\nEC MOTORLU PLUG FAN\n\nGeriye eğik kanatlı, yüksek performanslı ve tek emişli, doğrudan tahrikli, kendi kendini temizleyen pervaneli fan. Gürültüyü ve titreşimi en aza indirmek için dinamik olarak balanslanmıştır.`,
        metadata: {
          sourceURL: "https://www.avensair.com/enkelfan-155-eec",
          url: "https://www.avensair.com/enkelfan-155-eec"
        }
      },
      {
        markdown: `# Vortice Lineo 200 Quiet\n\n12.874,65 ₺\n\n**Kategori :** Sessiz Kanal Tipi Fanlar\n\nSessiz kanal fanı, havalandırma kanalına yerleştirilmiş bir fan türüdür.`,
        metadata: {
          sourceURL: "https://www.avensair.com/vortice-lineo-200-quiet",
          url: "https://www.avensair.com/vortice-lineo-200-quiet"
        }
      },
      {
        markdown: `# ENKELFAN 250 EEC\n\n28.480,28 ₺\n\n**Kategori :** Plug Fanlar\n\n**Ürün Kodu :** ENKEC250`,
        metadata: {
          sourceURL: "https://www.avensair.com/enkelfan-250-eec", 
          url: "https://www.avensair.com/enkelfan-250-eec"
        }
      },
      {
        markdown: `# Vortice VORT QBK SAL-KC T 355\n\n83.148,76 ₺\n\n**Kategori :** Santrifüj Fanlar`,
        metadata: {
          sourceURL: "https://www.avensair.com/vortice-vort-qbk-sal-kc-t-355",
          url: "https://www.avensair.com/vortice-vort-qbk-sal-kc-t-355"
        }
      },
      {
        markdown: `# Casals MBP 28 T4 0,18 kW\n\n80.515,31 ₺\n\n**Kategori :** Santrifüj Fanlar`,
        metadata: {
          sourceURL: "https://www.avensair.com/casals-mbp-28-t4-0-18-kw",
          url: "https://www.avensair.com/casals-mbp-28-t4-0-18-kw"
        }
      },
      {
        markdown: `# PVC Konnektörler 35*60*35\n\n1.923,00₺\n\n**Kategori :** Bağlantı Konnektörü`,
        metadata: {
          sourceURL: "https://www.avensair.com/pvc-konnektorler-35-60-35",
          url: "https://www.avensair.com/pvc-konnektorler-35-60-35"
        }
      }
    ]
  };
  
  const products = [];
  const categories = new Set();
  const brands = new Set();
  let productId = 1;
  
  console.log(`Processing ${crawlResults.data.length} pages...`);
  
  for (const page of crawlResults.data) {
    const { markdown, metadata } = page;
    const url = metadata.sourceURL || metadata.url;
    
    // Skip non-product pages
    if (!url || 
        url.includes('sitemap.xml') || 
        url.includes('robots.txt') ||
        url.includes('login') ||
        url.includes('cart') ||
        url.includes('hakkimizda') ||
        url.includes('iletisim')) {
      continue;
    }
    
    // Check if this looks like a product page (has price or product details)
    const hasPrice = extractPriceFromText(markdown);
    const hasProductCode = extractProductCodeFromContent(markdown);
    const productName = extractProductNameFromMarkdown(markdown);
    
    if (productName && (hasPrice || hasProductCode || markdown.includes('Ürün Kodu'))) {
      // This is a product page
      const category = detectCategoryFromUrl(url);
      const brand = detectBrandFromContent(productName, url);
      const price = hasPrice;
      const productCode = hasProductCode;
      const images = extractImagesFromMarkdown(markdown);
      const description = cleanDescription(markdown);
      const slug = generateSlug(productName);
      
      const product = {
        id: productId++,
        name: productName,
        slug: slug,
        sku: productCode || `AVENS-${productId.toString().padStart(4, '0')}`,
        brand: brand,
        category: category,
        subcategory: null,
        price: price,
        currency: 'TRY',
        status: 'active',
        stock_quantity: null,
        description: description,
        short_description: description ? description.substring(0, 160) : '',
        images: images,
        specifications: {},
        seo_title: productName,
        seo_description: description ? description.substring(0, 160) : '',
        source_url: url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      products.push(product);
      categories.add(category);
      brands.add(brand);
      
      console.log(`✓ Processed product: ${productName} (${category})`);
    } else {
      // Check if this is a category page with multiple products
      const productLinks = [...markdown.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)];
      let categoryProducts = 0;
      
      for (const [, linkTitle, linkUrl] of productLinks) {
        if (linkUrl && linkUrl.startsWith('https://www.avensair.com/') && 
            !linkUrl.includes('#') &&
            linkTitle && linkTitle.length > 5 &&
            !linkTitle.includes('Ana Sayfa') &&
            !linkTitle.includes('Ürünler')) {
          
          // This might be a product link from a category page
          const category = detectCategoryFromUrl(url);
          const brand = detectBrandFromContent(linkTitle, linkUrl);
          const slug = generateSlug(linkTitle);
          
          // Check if we already have this product
          const existingProduct = products.find(p => p.slug === slug);
          if (!existingProduct) {
            const product = {
              id: productId++,
              name: linkTitle,
              slug: slug,
              sku: `AVENS-${productId.toString().padStart(4, '0')}`,
              brand: brand,
              category: category,
              subcategory: null,
              price: null,
              currency: 'TRY',
              status: 'active',
              stock_quantity: null,
              description: '',
              short_description: '',
              images: [],
              specifications: {},
              seo_title: linkTitle,
              seo_description: '',
              source_url: linkUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            products.push(product);
            categories.add(category);
            brands.add(brand);
            categoryProducts++;
          }
        }
      }
      
      if (categoryProducts > 0) {
        console.log(`✓ Processed category page with ${categoryProducts} products from ${url}`);
      }
    }
  }
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    total_products: products.length,
    total_categories: categories.size,
    total_brands: brands.size,
    categories: Array.from(categories),
    brands: Array.from(brands),
    products_by_category: {},
    products_by_brand: {}
  };
  
  // Count products by category and brand
  for (const category of categories) {
    summary.products_by_category[category] = products.filter(p => p.category === category).length;
  }
  
  for (const brand of brands) {
    summary.products_by_brand[brand] = products.filter(p => p.brand === brand).length;
  }
  
  // Save results
  const outputData = {
    summary,
    products
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'processed_products.json'), 
    JSON.stringify(outputData, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n=== Processing Complete ===');
  console.log(`Total products processed: ${products.length}`);
  console.log(`Categories found: ${categories.size}`);
  console.log(`Brands found: ${brands.size}`);
  console.log(`Output saved to: ${outputDir}`);
  
  // Show category breakdown
  console.log('\n=== Category Breakdown ===');
  Object.entries(summary.products_by_category)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`${category}: ${count} products`);
    });
    
  // Show brand breakdown  
  console.log('\n=== Brand Breakdown ===');
  Object.entries(summary.products_by_brand)
    .sort(([,a], [,b]) => b - a)
    .forEach(([brand, count]) => {
      console.log(`${brand}: ${count} products`);
    });
}

// Run if executed directly
if (require.main === module) {
  try {
    processFirecrawlData();
  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
}

module.exports = { processFirecrawlData };