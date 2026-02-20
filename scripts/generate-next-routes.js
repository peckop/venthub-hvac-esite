const fs = require('fs');
const path = require('path');

const base = 'c:/Users/alize/venthub-hvac/src/app';

const layouts = [
    { path: 'admin', component: '../../pages/admin/AdminLayout' },
    { path: 'account', component: '../../pages/account/AccountLayout' }
];

const routes = [
    { path: 'products', component: '../../pages/ProductsPage' },
    { path: 'products/[id]', component: '../../../pages/ProductDetailPage' },
    { path: 'cart', component: '../../pages/CartPage' },
    { path: 'checkout', component: '../../pages/CheckoutPage' },
    { path: 'category/[slug]', component: '../../../pages/CategoryPage' },
    { path: 'category/[parentSlug]/[slug]', component: '../../../../pages/CategoryPage' },
    { path: 'brands', component: '../../pages/BrandsPage' },
    { path: 'brands/[slug]', component: '../../../pages/BrandDetailPage' },
    { path: 'about', component: '../../pages/AboutPage' },
    { path: 'contact', component: '../../pages/ContactPage' },
    { path: 'auth/login', component: '../../../pages/LoginPage' },
    { path: 'auth/register', component: '../../../pages/RegisterPage' },
    { path: 'auth/forgot-password', component: '../../../pages/ForgotPasswordPage' },
    { path: 'auth/callback', component: '../../../pages/AuthCallbackPage' },
    { path: 'payment-success', component: '../../pages/PaymentSuccessPage' },

    { path: 'destek/merkez', component: '../../../pages/knowledge/HubPage' },
    { path: 'destek/konular/[slug]', component: '../../../../pages/knowledge/TopicPage' },
    { path: 'destek/hesaplayicilar/hrv', component: '../../../../pages/calculators/HRVCalcPage' },
    { path: 'destek/hesaplayicilar/hava-perdesi', component: '../../../../pages/calculators/AirCurtainCalcPage' },
    { path: 'destek/hesaplayicilar/jet-fan', component: '../../../../pages/calculators/JetFanCalcPage' },
    { path: 'destek/hesaplayicilar/kanal', component: '../../../../pages/calculators/DuctCalcPage' },

    { path: 'support', component: '../../pages/support/SupportHomePage' },
    { path: 'support/sss', component: '../../../pages/support/FAQPage' },
    { path: 'support/iade-degisim', component: '../../../pages/support/ReturnsPage' },
    { path: 'support/teslimat-kargo', component: '../../../pages/support/ShippingPage' },
    { path: 'support/garanti-servis', component: '../../../pages/support/WarrantyPage' },

    { path: 'legal/kvkk', component: '../../../pages/legal/KVKKPage' },
    { path: 'legal/mesafeli-satis-sozlesmesi', component: '../../../pages/legal/DistanceSalesAgreementPage' },
    { path: 'legal/on-bilgilendirme-formu', component: '../../../pages/legal/PreInformationPage' },
    { path: 'legal/cerez-politikasi', component: '../../../pages/legal/CookiePolicyPage' },
    { path: 'legal/gizlilik-politikasi', component: '../../../pages/legal/PrivacyPolicyPage' },
    { path: 'legal/kullanim-kosullari', component: '../../../pages/legal/TermsOfUsePage' },

    { path: 'account', component: '../../pages/account/AccountOverviewPage' },
    { path: 'account/orders', component: '../../../pages/OrdersPage' },
    { path: 'account/orders/[id]', component: '../../../../pages/account/OrderDetailPage' },
    { path: 'account/shipments', component: '../../../pages/account/AccountShipmentsPage' },
    { path: 'account/addresses', component: '../../../pages/account/AccountAddressesPage' },
    { path: 'account/invoices', component: '../../../pages/account/AccountInvoicesPage' },
    { path: 'account/returns', component: '../../../pages/account/AccountReturnsPage' },
    { path: 'account/profile', component: '../../../pages/account/AccountProfilePage' },
    { path: 'account/security', component: '../../../pages/account/AccountSecurityPage' },

    { path: 'admin', component: '../../pages/admin/AdminDashboardPage' },
    { path: 'admin/inventory', component: '../../../pages/admin/AdminInventoryPage' },
    { path: 'admin/inventory/settings', component: '../../../../pages/admin/AdminInventorySettingsPage' },
    { path: 'admin/movements', component: '../../../pages/admin/AdminMovementsPage' },
    { path: 'admin/orders', component: '../../../pages/admin/AdminOrdersPage' },
    { path: 'admin/logs', component: '../../../pages/admin/AdminAuditLogPage' },
    { path: 'admin/errors', component: '../../../pages/admin/AdminErrorsPage' },
    { path: 'admin/error-groups', component: '../../../pages/admin/AdminErrorGroupsPage' },
    { path: 'admin/products', component: '../../../pages/admin/AdminProductsPage' },
    { path: 'admin/categories', component: '../../../pages/admin/AdminCategoriesPage' },
    // { path: 'admin/returns', component: '../../../pages/admin/AdminReturnsPage' }, // wait, AdminReturnsPage is in account/AdminReturnsPage or admin/? Let's point to account
    { path: 'admin/returns', component: '../../../pages/account/AdminReturnsPage' },
    { path: 'admin/webhook-events', component: '../../../pages/admin/AdminWebhookEventsPage' },
    { path: 'admin/coupons', component: '../../../pages/admin/AdminCouponsPage' },
    { path: 'admin/users', component: '../../../pages/account/AdminUsersPage' },
];

for (const layout of layouts) {
    const dir = path.join(base, layout.path);
    fs.mkdirSync(dir, { recursive: true });
    const content = `'use client'\n\nimport LayoutComponent from '${layout.component}'\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <LayoutComponent>{children}</LayoutComponent>\n}\n`;
    fs.writeFileSync(path.join(dir, 'layout.tsx'), content);
}

for (const route of routes) {
    const dir = path.join(base, route.path);
    fs.mkdirSync(dir, { recursive: true });
    const content = `'use client'\n\nimport PageComponent from '${route.component}'\n\nexport default function Page() {\n  return <PageComponent />\n}\n`;
    fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}

console.log("Next.js routes and layouts generated successfully.");
