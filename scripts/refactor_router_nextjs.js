import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToRefactor = [
    'src/components/StickyHeader.tsx',
    'src/components/Footer.tsx',
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

filesToRefactor.forEach(relativeFilePath => {
    const filePath = path.join(__dirname, '..', relativeFilePath);

    if (!fs.existsSync(filePath)) {
        console.log(`Skipping: ${relativeFilePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client'\\n\\n" + content;
    }

    if (content.includes('react-router-dom')) {
        content = content.replace(/import\s*{\s*([^}]*?)\s*}\s*from\s*['"]react-router-dom['"];?/g, (match, p1) => {
            let nextImports = [];
            const imports = p1.split(',').map(s => s.trim());

            let hasLink = imports.includes('Link');
            let hasUseNavigate = imports.includes('useNavigate');
            let hasUseLocation = imports.includes('useLocation');
            let hasUseParams = imports.includes('useParams');

            if (hasLink) {
                nextImports.push("import Link from 'next/link'");
            }

            let navigationHooks = [];
            if (hasUseNavigate) navigationHooks.push('useRouter');
            if (hasUseLocation) navigationHooks.push('usePathname', 'useSearchParams');
            if (hasUseParams) navigationHooks.push('useParams');

            if (navigationHooks.length > 0) {
                nextImports.push(`import { ${navigationHooks.join(', ')} } from 'next/navigation'`);
            }

            return nextImports.join('\\n');
        });

        content = content.replace(/useNavigate\(\)/g, "useRouter()");
        content = content.replace(/useLocation\(\)/g, "usePathname()");
        content = content.replace(/navigate\s*\(/g, "router.push(");
        content = content.replace(/<Link([^>]*?)to=/g, "<Link$1href=");

        if (content.includes('react-router-dom')) {
            console.log(`Manual review needed for react-router-dom in ${relativeFilePath}`);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refactored: ${relativeFilePath}`);
    } else {
        console.log(`No changes: ${relativeFilePath}`);
    }
});
