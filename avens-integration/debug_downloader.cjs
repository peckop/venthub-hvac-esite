const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_BASE_DIR = path.join(__dirname, 'product_pdfs_debug');

async function downloadPDF(url, filename, categoryDir) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = path.join(categoryDir, filename);

        console.log(`      Attempting download: ${url} -> ${filePath}`);

        const file = fs.createWriteStream(filePath);
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(filePath, () => { });
                reject(new Error(`Status code: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`      ⬇️ Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            reject(err);
        });
    });
}

async function processCategory(page, categoryUrl, categoryName) {
    console.log(`\n📂 Category: ${categoryName}`);
    console.log(`   URL: ${categoryUrl}`);

    const safeName = categoryName.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');
    const categoryDir = path.join(OUTPUT_BASE_DIR, safeName);

    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
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

        console.log(`   📦 ${products.length} products found.`);

        if (products.length > 0) {
            const product = products[0];
            console.log(`   🔍 First Product: ${product.name} (${product.url})`);

            try {
                await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Try to find and click the documents tab
                const clicked = await page.evaluate(() => {
                    const tabs = Array.from(document.querySelectorAll('a, li, div, button'));
                    // Look for exact text match or close to it
                    const docTab = tabs.find(el => {
                        const text = el.textContent.trim().toLowerCase();
                        return text === 'dökümanlar' || text === 'dokumanlar' || text.includes('döküman') || text.includes('dokuman');
                    });

                    if (docTab) {
                        console.log('Found tab:', docTab.textContent);
                        docTab.click();
                        return true;
                    }
                    return false;
                });

                console.log(`   🖱️ Tab clicked: ${clicked}`);

                if (clicked) {
                    await page.waitForTimeout(3000); // Wait for content to load
                } else {
                    console.log('   ⚠️ Could not find "Dökümanlar" tab. Dumping page text to check...');
                    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
                    console.log(text);
                }

                const pdfLinks = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a[href$=".pdf"], a[href$=".PDF"]'));
                    return links.map(a => ({
                        url: a.href,
                        name: a.textContent.trim()
                    }));
                });

                console.log(`      📄 ${pdfLinks.length} PDFs found.`);

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
