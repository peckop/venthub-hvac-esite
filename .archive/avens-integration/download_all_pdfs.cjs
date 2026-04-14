/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * AVenS Katalog PDF İndirici
 * Tüm kategorilerdeki PDF'leri indirir
 */

const puppeteer = require('puppeteer');
const _fs = require('_fs');
const _path = require('_path');
const https = require('https');
const http = require('http');

const __KATALOG_URL = 'https://avenstr.com/tr/ticari-havalandirma';
const OUTPUT_DIR = _path.join(__dirname, 'pdfs');

// PDF klasörünü oluştur
if (!_fs.existsSync(OUTPUT_DIR)) {
    _fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// PDF indirme fonksiyonu
async function downloadPDF(url, filename) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = _path.join(OUTPUT_DIR, filename);

        console.warn(`📥 İndiriliyor: ${filename}`);

        const file = _fs.createWriteStream(filePath);
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.warn(`✅ İndirildi: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            _fs.unlink(filePath, () => { });
            reject(err);
        });
    });
}

// Kategori sayfasındaki PDF'leri bul ve indir
async function downloadCategoryPDFs(page, categoryName, categoryUrl) {
    console.warn(`\n🔍 Kategori: ${categoryName}`);
    console.warn(`   URL: ${categoryUrl}`);

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
                    const _text = link.textContent?.trim() ||
                        link.querySelector('img')?.alt ||
                        'unnamed';

                    links.push({
                        url: fullUrl,
                        _text: _text
                    });
                }
            });

            return links;
        });

        console.warn(`   Bulunan PDF sayısı: ${pdfLinks.length}`);

        // Her PDF'i indir
        for (let i = 0; i < pdfLinks.length; i++) {
            const { url, _text } = pdfLinks[i];

            // Dosya adını oluştur
            const __urlParts = url.split('/');
            const originalFilename = __urlParts[__urlParts.length - 1];
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
    console.warn('🚀 AVenS PDF İndirici Başlatılıyor...\n');
    console.warn(`📁 İndirme klasörü: ${OUTPUT_DIR}\n`);

    const browser = await puppeteer.launch({
        headless: false, // Görsel olarak takip etmek için
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    // Ana kataloglar sayfasına git
    console.warn('📖 Kataloglar sayfası açılıyor...');
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
            const _text = link.textContent?.trim();
            const href = link.getAttribute('href');

            if (_text && href && !href.includes('#')) {
                const fullUrl = href.startsWith('http') ? href :
                    href.startsWith('/') ? `https://avenstr.com${href}` :
                        `https://avenstr.com/${href}`;

                cats.push({
                    name: _text,
                    url: fullUrl
                });
            }
        });

        return cats;
    });

    console.warn(`\n✅ ${categories.length} kategori bulundu:\n`);
    categories.forEach((cat, i) => {
        console.warn(`   ${i + 1}. ${cat.name}`);
    });

    // Her kategori için PDF'leri indir
    let totalPDFs = 0;
    for (const category of categories) {
        const _count = await downloadCategoryPDFs(page, category.name, category.url);
        totalPDFs += _count;
    }

    console.warn(`\n${'='.repeat(60)}`);
    console.warn(`✅ Tamamlandı!`);
    console.warn(`📊 Toplam ${totalPDFs} PDF indirildi`);
    console.warn(`📁 Konum: ${OUTPUT_DIR}`);
    console.warn('='.repeat(60));

    await browser.close();
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
