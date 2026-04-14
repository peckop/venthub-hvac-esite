const fs = require('fs');

const files = [
  'src/views/HomePage.tsx',
  'src/components/home/GuidedCategoryDiscovery.tsx',
  'src/views/CartPage.tsx',
  'src/views/CheckoutPage.tsx',
  'src/views/PaymentSuccessPage.tsx',
  'src/views/OrdersPage.tsx',
  'src/views/AuthCallbackPage.tsx',
  'src/views/ForgotPasswordPage.tsx',
  'src/views/LoginPage.tsx',
  'src/views/RegisterPage.tsx',
  'src/views/ProductDetailPage.tsx',
  'src/contexts/AuthContext.tsx',
  'src/components/home/HomeSinevizyon.tsx',
  'src/components/home/CinematicProductShowcase.tsx',
  'src/components/home/ApplicationSolutions.tsx',
  'src/components/home/TrustProofSection.tsx',
  'src/components/home/FeaturedCommercialBlocks.tsx',
  'src/components/home/StrategicBrands.tsx',
  'src/components/home/KnowledgeBlock.tsx',
  'src/components/home/RevealSection.tsx',
  'src/components/home/HomePageClientWrapper.tsx',
  'src/components/Seo.tsx',
  'src/components/SecurityRibbon.tsx',
  'src/components/admin/AdminToolbar.tsx',
  'src/components/ui/VentImage.tsx',
  'src/components/admin/categories/CategoryFormModal.tsx',
  'src/components/admin/InfoTooltip.tsx',
  'src/components/admin/ColumnsMenu.tsx',
  'src/components/admin/ExportMenu.tsx',
  'src/components/admin/DateRangePicker.tsx',
  'src/components/navigation/Breadcrumb.tsx',
  'src/components/products/RichTextRenderer.tsx',
  'src/components/StickyHeader.tsx',
  'src/components/PaymentWatcher.tsx',
  'src/components/AddToCartToast.tsx',
  'src/components/ProductCard.tsx',
  'src/components/BrandsShowcase.tsx',
  'src/components/products/3d/Product3DViewer.tsx',
  'src/components/products/BlueprintCanvas.tsx',
  'src/components/BuildTag.tsx',
  'src/components/navigation/EliteMegaMenu.tsx',
  'src/hooks/useScrollAnimation.ts',
  'src/components/products/3d/factory/VorticeLineoModel.tsx',
  'src/components/products/3d/factory/parts/MainChassis.tsx',
  'src/components/products/3d/factory/parts/GreenClamps.tsx',
  'src/components/products/3d/factory/parts/BoxAndBase.tsx',
  'src/components/products/3d/factory/parts/InternalFanRotor.tsx'
];

let fixed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping missing file: ${file}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match "export default Name" or "export default function Name"
  const defaultMatch = content.match(/export\s+default\s+([A-Za-z0-9_]+)/);
  if (defaultMatch) {
    const name = defaultMatch[1];
    
    // Look for 'export const NAME =' or 'export function NAME'
    const constRegex = new RegExp(`export\\s+const\\s+${name}\\s*[:=]`, 'g');
    const funcRegex = new RegExp(`export\\s+function\\s+${name}\\b`, 'g');
    
    let changed = false;
    if (constRegex.test(content)) {
      content = content.replace(constRegex, (match) => match.replace('export const ', 'const '));
      changed = true;
    }
    if (funcRegex.test(content)) {
      content = content.replace(funcRegex, (match) => match.replace('export function ', 'function '));
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed: ${file} (Removed duplicate named export for ${name})`);
      fixed++;
    }
  }
}

console.log(`\nTotal duplicate exports fixed: ${fixed}`);
