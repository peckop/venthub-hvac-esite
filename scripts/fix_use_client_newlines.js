import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    'src/components/StickyHeader.tsx',
    'src/components/LanguageSwitcher.tsx',
    'src/components/PaymentWatcher.tsx',
    'src/components/BackToTopButton.tsx',
    'src/components/LoadingSpinner.tsx',
    'src/components/LazyInView.tsx',
    'src/components/AddToCartToast.tsx',
    'src/components/WhatsAppFloat.tsx',
    'src/components/navigation/CategoryHubOverlay.tsx',
    'src/components/MegaMenu.tsx',
    'src/components/pages/HomePageClient.tsx'
];

files.forEach(f => {
    const p = path.resolve(__dirname, '..', f);
    if (fs.existsSync(p)) {
        let c = fs.readFileSync(p, 'utf8');
        if (c.startsWith("'use client'\\n\\n")) {
            fs.writeFileSync(p, c.replace("'use client'\\n\\n", "'use client'\\n\\n"), 'utf8');
            console.log('Fixed', f);
        }
    }
});
