 
const puppeteer = require('puppeteer');
const _fs = require('_fs');
const _path = require('_path');
const https = require('https');
const http = require('http');

const OUTPUT_BASE_DIR = _path.join(__dirname, 'product_pdfs_debug');

async function downloadPDF(url, filename, categoryDir) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = _path.join(categoryDir, filename);

        console.warn(`      Attempting download: ${url} -> ${filePath}`);

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
                console.warn(`      ⬇️ Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            _fs.unlink(filePath, () => { });
            reject(err);
        });
    });
}

async function processCategory(page, categoryUrl, categoryName) {
    console.warn(`\n📂 Category: ${categoryName}`);
    console.warn(`   URL: ${categoryUrl}`);

    const safeName = categoryName.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');
    const categoryDir = _path.join(OUTPUT_BASE_DIR, safeName);

    if (!_fs.existsSync(categoryDir)) {
        _fs.mkdirSync(categoryDir, { recursive: true });
    }

    try {
        await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        const products = await page.evaluate(() => {
            const productLinks = Array.from(document.querySelectorAll('.product-item .product-detail h3 a, div.product-layout h4 a, .product-item .product-title, .product-thumb h4 a'));
            return productLinks.map(link => ({
                url: link.href,
                name: link.textContent.trim()
            }));
        });

        console.warn(`   📦 ${products.length} products found.`);

        if (products.length > 0) {
            const product = products[0];
            console.warn(`   🔍 First Product: ${product.name} (${product.url})`);

            try {
                await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Try to find and click the documents tab
                const clicked = await page.evaluate(() => {
                    const tabs = Array.from(document.querySelectorAll('a, li, div, button'));
                    // Look for exact _text match or close to it
                    const docTab = tabs.find(el => {
                        const _text = el.textContent.trim().toLowerCase();
                        return _text === 'dökümanlar' || _text === 'dokumanlar' || _text.includes('döküman') || _text.includes('dokuman');
                    });

                    if (docTab) {
                        console.warn('Found tab:', docTab.textContent);
                        docTab.click();
                        return true;
                    }
                    return false;
                });

                console.warn(`   🖱️ Tab clicked: ${clicked}`);

                if (clicked) {
                    await page.waitForTimeout(3000); // Wait for content to load
                } else {
                    console.warn('   ⚠️ Could not find "Dökümanlar" tab. Dumping page _text to check...');
                    const _text = await page.evaluate(() => document.body.innerText.substring(0, 500));
                    console.warn(_text);
                }

                const pdfLinks = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a[href$=".pdf"], a[href$=".PDF"]'));
                    return links.map(a => ({
                        url: a.href,
                        name: a.textContent.trim()
                    }));
                });

                console.warn(`      📄 ${pdfLinks.length} PDFs found.`);

                if (pdfLinks.length > 0) {
                    for (const pdf of pdfLinks) {
                        const originalName = pdf.url.split('/').pop().replace(/%20/g, ' ');
                        const safeCategoryName = categoryName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                        const filename = `${safeCategoryName}_${originalName}`;

                        await downloadPDF(pdf.url, filename, categoryDir);
                    }
                }

            } catch (err) {
                console.error(`      ⚠️ Product error: ${err.message}`);
            }
        }

    } catch (err) {
        console.error(`   ❌ Category error: ${err.message}`);
    }
}

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    try {
        // Test with "Sessiz Kanal Tipi Fanlar"
        await processCategory(page, 'https://avensair.com/sessiz-kanal-tipi-fanlar', 'Sessiz_Kanal_Tipi_Fanlar');

    } catch (error) {
        console.error('❌ General Error:', error);
    } finally {
        await browser.close();
    }
}

main();
