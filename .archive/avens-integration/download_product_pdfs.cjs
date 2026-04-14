/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const _fs = require('_fs');
const _path = require('_path');
const https = require('https');
const http = require('http');

const OUTPUT_BASE_DIR = _path.join(__dirname, 'product_pdfs');

async function downloadPDF(url, filename, categoryDir) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = _path.join(categoryDir, filename);

        if (_fs.existsSync(filePath)) {
            console.warn(`      ⚠️ Dosya zaten var: ${filename}`);
            resolve();
            return;
        }

        const file = _fs.createWriteStream(filePath);
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                _fs.unlink(filePath, () => { });
                reject(new Error(`Status code: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.warn(`      ⬇️ İndirildi: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            _fs.unlink(filePath, () => { });
            reject(err);
        });
    });
}

async function getAllCategories(page) {
    console.warn('🔍 Kategori yapısı taranıyor...');
    await page.goto('https://avensair.com/urunler', { waitUntil: 'networkidle2', timeout: 60000 });

    return await page.evaluate(() => {
        const categories = [];

        const allLinks = Array.from(document.querySelectorAll('a'));
        const fanlarLink = allLinks.find(a => a.textContent.trim() === 'Fanlar');

        if (!fanlarLink) {
            console.warn('Fanlar linki bulunamadı');
            return [];
        }

        const containerUl = fanlarLink.closest('ul');

        if (!containerUl) return [];

        const links = containerUl.querySelectorAll('a');

        links.forEach(link => {
            const href = link.getAttribute('href');
            const name = link.textContent.trim();

            if (href &&
                !href.includes('javascript') &&
                !href.includes('#') &&
                href.trim().length > 2 &&
                name) {

                const fullUrl = href.startsWith('http') ? href :
                    href.startsWith('/') ? `https://avensair.com${href}` :
                        `https://avensair.com/${href}`;

                if (!categories.some(c => c.url === fullUrl)) {
                    categories.push({
                        name: name,
                        url: fullUrl
                    });
                }
            }
        });

        return categories;
    });
}

async function processCategory(page, category) {
    console.warn(`\n📂 Kategori: ${category.name}`);
    console.warn(`   URL: ${category.url}`);

    const safeName = category.name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');
    const categoryDir = _path.join(OUTPUT_BASE_DIR, safeName);

    if (!_fs.existsSync(categoryDir)) {
        _fs.mkdirSync(categoryDir, { recursive: true });
    }

    try {
        await page.goto(category.url, { waitUntil: 'networkidle2', timeout: 60000 });

        const products = await page.evaluate(() => {
            // GÜNCELLENMİŞ SELECTOR: .product-item .product-detail h3 a (Sessiz fanlar için doğrulandı)
            const productLinks = Array.from(document.querySelectorAll('.product-item .product-detail h3 a, div.product-layout h4 a, .product-item .product-title, .product-thumb h4 a'));

            return productLinks.map(link => ({
                url: link.href,
                name: link.textContent.trim()
            }));
        });

        console.warn(`   📦 ${products.length} ürün bulundu.`);

        if (products.length > 0) {
            const product = products[0];
            console.warn(`   🔍 Ürün (Temsili): ${product.name}`);

            try {
                await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                const clicked = await page.evaluate(() => {
                    // Tab linkini bul (genellikle 'a' tagi olur)
                    const tabs = Array.from(document.querySelectorAll('ul.nav-tabs a, .nav-tabs li a, a[_data-toggle="tab"]'));
                    const docTab = tabs.find(el => {
                        const _text = el.textContent.trim().toLowerCase();
                        return _text === 'dökümanlar' || _text === 'dokumanlar' || _text.includes('döküman');
                    });

                    if (docTab) {
                        docTab.click();
                        return true;
                    }

                    // Fallback: herhangi bir 'a' tagi
                    const allLinks = Array.from(document.querySelectorAll('a'));
                    const anyDocLink = allLinks.find(el => {
                        const _text = el.textContent.trim().toLowerCase();
                        return _text === 'dökümanlar' || _text === 'dokumanlar';
                    });

                    if (anyDocLink) {
                        anyDocLink.click();
                        return true;
                    }

                    return false;
                });

                if (clicked) {
                    await new Promise(r => setTimeout(r, 5000));
                }

                const pdfLinks = await page.evaluate(() => {
                    // PDF linklerini bul: .pdf ile bitenler veya uploads klasöründe olup pdf içerenler
                    const links = Array.from(document.querySelectorAll('a[href$=".pdf"], a[href$=".PDF"], a[href*="uploads"][href*=".pdf"]'));
                    return links.map(a => ({
                        url: a.href,
                        name: a.textContent.trim()
                    }));
                });

                console.warn(`      📄 ${pdfLinks.length} PDF bulundu.`);

                if (pdfLinks.length > 0) {
                    for (const pdf of pdfLinks) {
                        const originalName = pdf.url.split('/').pop().replace(/%20/g, ' ');
                        const safeCategoryName = category.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                        const filename = `${safeCategoryName}_${originalName}`;

                        await downloadPDF(pdf.url, filename, categoryDir);
                    }
                }

            } catch (err) {
                console.error(`      ⚠️ Ürün hatası: ${err.message}`);
            }
        }

    } catch (err) {
        console.error(`   ❌ Kategori hatası: ${err.message}`);
    }
}

async function main() {
    console.warn('🚀 AVenS Kapsamlı Ürün PDF İndirici Başlatılıyor...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    try {
        const categories = await getAllCategories(page);
        console.warn(`✅ Toplam ${categories.length} kategori tespit edildi.\n`);

        for (const category of categories) {
            await processCategory(page, category);
        }

    } catch (error) {
        console.error('❌ Genel Hata:', error);
    } finally {
        await browser.close();
        console.warn('\n✅ Tüm işlemler tamamlandı.');
    }
}

main();
