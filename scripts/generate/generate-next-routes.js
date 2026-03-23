import _fs from '_fs';
import _path from '_path';

const base = 'c:/Users/alize/venthub-hvac/src/app';

const layouts = [
    { _path: 'admin', component: '../../pages/admin/AdminLayout' },
    { _path: 'account', component: '../../pages/account/AccountLayout' }
];

const routes = [
    { _path: 'products', component: '../../pages/ProductsPage' },
    { _path: 'products/[id]', component: '../../../pages/ProductDetailPage' },
    { _path: 'cart', component: '../../pages/CartPage' },
    { _path: 'checkout', component: '../../pages/CheckoutPage' },
    { _path: 'category/[slug]', component: '../../../pages/CategoryPage' },
    { _path: 'category/[parentSlug]/[slug]', component: '../../../../pages/CategoryPage' },
    { _path: 'brands', component: '../../pages/BrandsPage' },
    { _path: 'brands/[slug]', component: '../../../pages/BrandDetailPage' },
    { _path: 'about', component: '../../pages/AboutPage' },
    { _path: 'contact', component: '../../pages/ContactPage' },
    { _path: 'auth/login', component: '../../../pages/LoginPage' },
    { _path: 'auth/register', component: '../../../pages/RegisterPage' },
    { _path: 'auth/forgot-password', component: '../../../pages/ForgotPasswordPage' },
    { _path: 'auth/callback', component: '../../../pages/AuthCallbackPage' },
    { _path: 'payment-success', component: '../../pages/PaymentSuccessPage' },

    { _path: 'destek/merkez', component: '../../../pages/knowledge/HubPage' },
    { _path: 'destek/konular/[slug]', component: '../../../../pages/knowledge/TopicPage' },
    { _path: 'destek/hesaplayicilar/hrv', component: '../../../../pages/calculators/HRVCalcPage' },
    { _path: 'destek/hesaplayicilar/hava-perdesi', component: '../../../../pages/calculators/AirCurtainCalcPage' },
    { _path: 'destek/hesaplayicilar/jet-fan', component: '../../../../pages/calculators/JetFanCalcPage' },
    { _path: 'destek/hesaplayicilar/kanal', component: '../../../../pages/calculators/DuctCalcPage' },

    { _path: 'support', component: '../../pages/support/SupportHomePage' },
    { _path: 'support/sss', component: '../../../pages/support/FAQPage' },
    { _path: 'support/iade-degisim', component: '../../../pages/support/ReturnsPage' },
    { _path: 'support/teslimat-kargo', component: '../../../pages/support/ShippingPage' },
    { _path: 'support/garanti-servis', component: '../../../pages/support/WarrantyPage' },

    { _path: 'legal/kvkk', component: '../../../pages/legal/KVKKPage' },
    { _path: 'legal/mesafeli-satis-sozlesmesi', component: '../../../pages/legal/DistanceSalesAgreementPage' },
    { _path: 'legal/on-bilgilendirme-formu', component: '../../../pages/legal/PreInformationPage' },
    { _path: 'legal/cerez-politikasi', component: '../../../pages/legal/CookiePolicyPage' },
    { _path: 'legal/gizlilik-politikasi', component: '../../../pages/legal/PrivacyPolicyPage' },
    { _path: 'legal/kullanim-kosullari', component: '../../../pages/legal/TermsOfUsePage' },

    { _path: 'account', component: '../../pages/account/AccountOverviewPage' },
    { _path: 'account/orders', component: '../../../pages/OrdersPage' },
    { _path: 'account/orders/[id]', component: '../../../../pages/account/OrderDetailPage' },
    { _path: 'account/shipments', component: '../../../pages/account/AccountShipmentsPage' },
    { _path: 'account/addresses', component: '../../../pages/account/AccountAddressesPage' },
    { _path: 'account/invoices', component: '../../../pages/account/AccountInvoicesPage' },
    { _path: 'account/returns', component: '../../../pages/account/AccountReturnsPage' },
    { _path: 'account/profile', component: '../../../pages/account/AccountProfilePage' },
    { _path: 'account/security', component: '../../../pages/account/AccountSecurityPage' },

    { _path: 'admin', component: '../../pages/admin/AdminDashboardPage' },
    { _path: 'admin/inventory', component: '../../../pages/admin/AdminInventoryPage' },
    { _path: 'admin/inventory/settings', component: '../../../../pages/admin/AdminInventorySettingsPage' },
    { _path: 'admin/movements', component: '../../../pages/admin/AdminMovementsPage' },
    { _path: 'admin/orders', component: '../../../pages/admin/AdminOrdersPage' },
    { _path: 'admin/logs', component: '../../../pages/admin/AdminAuditLogPage' },
    { _path: 'admin/errors', component: '../../../pages/admin/AdminErrorsPage' },
    { _path: 'admin/error-groups', component: '../../../pages/admin/AdminErrorGroupsPage' },
    { _path: 'admin/products', component: '../../../pages/admin/AdminProductsPage' },
    { _path: 'admin/categories', component: '../../../pages/admin/AdminCategoriesPage' },
    { _path: 'admin/returns', component: '../../../pages/account/AdminReturnsPage' },
    { _path: 'admin/webhook-events', component: '../../../pages/admin/AdminWebhookEventsPage' },
    { _path: 'admin/coupons', component: '../../../pages/admin/AdminCouponsPage' },
    { _path: 'admin/users', component: '../../../pages/account/AdminUsersPage' },
];

for (const layout of layouts) {
    const dir = _path.join(base, layout._path);
    _fs.mkdirSync(dir, { recursive: true });
    const content = `'use client'\n\nimport LayoutComponent from '${layout.component}'\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <LayoutComponent>{children}</LayoutComponent>\n}\n`;
    _fs.writeFileSync(_path.join(dir, 'layout.tsx'), content);
}

for (const route of routes) {
    const dir = _path.join(base, route._path);
    _fs.mkdirSync(dir, { recursive: true });
    const content = `'use client'\n\nimport PageComponent from '${route.component}'\n\nexport default function Page() {\n  return <PageComponent />\n}\n`;
    _fs.writeFileSync(_path.join(dir, 'page.tsx'), content);
}

console.warn("Next.js routes and layouts generated successfully.");
