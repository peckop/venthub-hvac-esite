/**
 * AVenS Katalog PDF İndirici
 * Tüm kategorilerdeki PDF'leri indirir
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const KATALOG_URL = 'https://avenstr.com/tr/ticari-havalandirma';
const OUTPUT_DIR = path.join(__dirname, 'pdfs');

// PDF klasörünü oluştur
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// PDF indirme fonksiyonu
async function downloadPDF(url, filename) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = path.join(OUTPUT_DIR, filename);

        console.log(`📥 İndiriliyor: ${filename}`);

        const file = fs.createWriteStream(filePath);
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ İndirildi: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            reject(err);
        });
    });
}

// Kategori sayfasındaki PDF'leri bul ve indir
async function downloadCategoryPDFs(page, categoryName, categoryUrl) {
    console.log(`\n🔍 Kategori: ${categoryName}`);
    console.log(`   URL: ${categoryUrl}`);

    try {
        await page.goto(categoryUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        // PDF linklerini bul
        const pdfLinks = await page.evaluate(() => {
            const links = [];
            // PDF içeren tüm linkleri bul
            const allLinks = document.querySelectorAll('a[href*=".pdf"], a[href*="PDF"]');

            allLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.includes('.pdf') || href.includes('.PDF'))) {
                    // Tam URL'yi oluştur
                    const fullUrl = href.startsWith('http') ? href :
                        href.startsWith('/') ? `https://avenstr.com${href}` :
                            `https://avenstr.com/${href}`;

                    // Link metnini veya başka bir tanımlayıcıyı al
                    const text = link.textContent?.trim() ||
                        link.querySelector('img')?.alt ||
                        'unnamed';

                    links.push({
                        url: fullUrl,
                        text: text
                    });
                }
            });

            return links;
        });

        console.log(`   Bulunan PDF sayısı: ${pdfLinks.length}`);

        // Her PDF'i indir
        for (let i = 0; i < pdfLinks.length; i++) {
            const { url, text } = pdfLinks[i];

            // Dosya adını oluştur
            const urlParts = url.split('/');
            const originalFilename = urlParts[urlParts.length - 1];
            const sanitizedCategory = categoryName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${sanitizedCategory}_${i + 1}_${originalFilename}`;

            try {
                await downloadPDF(url, filename);
            } catch (error) {
                console.error(`   ❌ Hata (${filename}):`, error.message);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return pdfLinks.length;

    } catch (error) {
        console.error(`   ❌ Kategori hatası: ${error.message}`);
        return 0;
    }
}

async function main() {
    console.log('🚀 AVenS PDF İndirici Başlatılıyor...\n');
    console.log(`📁 İndirme klasörü: ${OUTPUT_DIR}\n`);

    const browser = await puppeteer.launch({
        headless: false, // Görsel olarak takip etmek için
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    // Ana kataloglar sayfasına git
    console.log('📖 Kataloglar sayfası açılıyor...');
    await page.goto('https://avenstr.com/kataloglar', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Kategorileri ve linklerini al
    const categories = await page.evaluate(() => {
        const cats = [];

        // Sol menüdeki kategori linklerini bul
        const menuLinks = document.querySelectorAll('.kategoriBaslik a, .category-menu a, ul.list-unstyled a');

        menuLinks.forEach(link => {
            const text = link.textContent?.trim();
            const href = link.getAttribute('href');

            if (text && href && !href.includes('#')) {
                const fullUrl = href.startsWith('http') ? href :
                    href.startsWith('/') ? `https://avenstr.com${href}` :
                        `https://avenstr.com/${href}`;

                cats.push({
                    name: text,
                    url: fullUrl
                });
            }
        });

        return cats;
    });

    console.log(`\n✅ ${categories.length} kategori bulundu:\n`);
    categories.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.name}`);
    });

    // Her kategori için PDF'leri indir
    let totalPDFs = 0;
    for (const category of categories) {
        const count = await downloadCategoryPDFs(page, category.name, category.url);
        totalPDFs += count;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Tamamlandı!`);
    console.log(`📊 Toplam ${totalPDFs} PDF indirildi`);
    console.log(`📁 Konum: ${OUTPUT_DIR}`);
    console.log('='.repeat(60));

    await browser.close();
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
