/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    try {
        const url = 'https://avensair.com/vortice-lineo-100-quiet';
        console.warn(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Click tab
        const clicked = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('a'));
            const docTab = tabs.find(el => el.textContent.trim() === 'Dökümanlar');
            if (docTab) {
                docTab.click();
                return true;
            }
            return false;
        });

        console.warn(`Tab clicked: ${clicked}`);

        console.warn('Waiting 10 seconds...');
        await new Promise(r => setTimeout(r, 10000));

        // Dump HTML of tab content
        const debugInfo = await page.evaluate(() => {
            const tabContent = document.querySelector('.tab-content');
            const div5a = document.getElementById('5a');

            const allLinks = Array.from(document.querySelectorAll('a'));
            const pdfLinks = allLinks.filter(a => a.href.includes('.pdf'));

            return {
                tabContentHTML: tabContent ? tabContent.innerHTML.substring(0, 500) + '...' : 'Not found',
                div5aHTML: div5a ? div5a.innerHTML : 'Not found',
                pdfLinksCount: pdfLinks.length,
                pdfLinks: pdfLinks.map(a => a.href)
            };
        });

        console.warn('Debug Info:', JSON.stringify(debugInfo, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

main();
