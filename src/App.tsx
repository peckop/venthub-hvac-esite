import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './hooks/useCart'
import { AuthProvider } from './contexts/AuthContext'
import { useScrollThrottle } from './hooks/useScrollThrottle'
import StickyHeader from './components/StickyHeader'
import ScrollToTop from './components/ScrollToTop'
import LanguageSwitcher from './components/LanguageSwitcher'
import Footer from './components/Footer'
import PaymentWatcher from './components/PaymentWatcher'
import BackToTopButton from './components/BackToTopButton'
import AddToCartToast from './components/AddToCartToast'
import LoadingSpinner from './components/LoadingSpinner'
import { prefetchProductsPage } from './utils/prefetch'

// Keep HomePage as direct import for fastest initial load
import HomePage from './pages/HomePage'

// Lazy load major page groups
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))

// Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))

// Account pages
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'))
const AccountOverviewPage = lazy(() => import('./pages/account/AccountOverviewPage'))
const AccountAddressesPage = lazy(() => import('./pages/account/AccountAddressesPage'))
const AccountSecurityPage = lazy(() => import('./pages/account/AccountSecurityPage'))
const AccountInvoicesPage = lazy(() => import('./pages/account/AccountInvoicesPage'))
const AccountProfilePage = lazy(() => import('./pages/account/AccountProfilePage'))
const AccountShipmentsPage = lazy(() => import('./pages/account/AccountShipmentsPage'))
const AccountReturnsPage = lazy(() => import('./pages/account/AccountReturnsPage'))
const OrderDetailPage = lazy(() => import('./pages/account/OrderDetailPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AdminReturnsPage = lazy(() => import('./pages/account/AdminReturnsPage'))
const AdminUsersPage = lazy(() => import('./pages/account/AdminUsersPage'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminMovementsPage = lazy(() => import('./pages/admin/AdminMovementsPage'))
const AdminInventorySettingsPage = lazy(() => import('./pages/admin/AdminInventorySettingsPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminAuditLogPage = lazy(() => import('./pages/admin/AdminAuditLogPage'))
const AdminErrorsPage = lazy(() => import('./pages/admin/AdminErrorsPage'))
const AdminErrorGroupsPage = lazy(() => import('./pages/admin/AdminErrorGroupsPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))

// Brand pages
const BrandsPage = lazy(() => import('./pages/BrandsPage'))
const BrandDetailPage = lazy(() => import('./pages/BrandDetailPage'))

// Support pages
const SupportHomePage = lazy(() => import('./pages/support/SupportHomePage'))
const FAQPage = lazy(() => import('./pages/support/FAQPage'))
const ReturnsPage = lazy(() => import('./pages/support/ReturnsPage'))
const ShippingPage = lazy(() => import('./pages/support/ShippingPage'))
const WarrantyPage = lazy(() => import('./pages/support/WarrantyPage'))

// Knowledge hub & topics
const KnowledgeHubPage = lazy(() => import('./pages/knowledge/HubPage'))
const KnowledgeTopicPage = lazy(() => import('./pages/knowledge/TopicPage'))

// Calculators (v1 skeletons)
const HRVCalcPage = lazy(() => import('./pages/calculators/HRVCalcPage'))
const AirCurtainCalcPage = lazy(() => import('./pages/calculators/AirCurtainCalcPage'))
const JetFanCalcPage = lazy(() => import('./pages/calculators/JetFanCalcPage'))
const DuctCalcPage = lazy(() => import('./pages/calculators/DuctCalcPage'))

// Legal pages (lowest priority)
const KVKKPage = lazy(() => import('./pages/legal/KVKKPage'))
const DistanceSalesAgreementPage = lazy(() => import('./pages/legal/DistanceSalesAgreementPage'))
const PreInformationPage = lazy(() => import('./pages/legal/PreInformationPage'))
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const TermsOfUsePage = lazy(() => import('./pages/legal/TermsOfUsePage'))

// About page (simple corporate landing)
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

function App() {
  // Performance optimize edilmiş scroll handling
  const isScrolled = useScrollThrottle(100, 16)

  // Prefetch ProductsPage chunk on idle so first navigation is instant
  React.useEffect(() => {
    const win = window as unknown as { requestIdleCallback?: (cb: () => void) => number }
    const idle = (cb: () => void) => (typeof win.requestIdleCallback === 'function' ? win.requestIdleCallback(cb) : setTimeout(cb, 600))
    idle(() => prefetchProductsPage())
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
            <div className="min-h-screen bg-white">
              {/* Scroll to top component - her sayfa geçişinde otomatik scroll */}
              <ScrollToTop />
              
              <StickyHeader isScrolled={isScrolled} />
              
              <main id="main-content" className={isScrolled ? 'pt-12' : ''}>
                <BackToTopButton />
                <PaymentWatcher />
                <LanguageSwitcher />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/category/:parentSlug/:slug" element={<CategoryPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/brands/:slug" element={<BrandDetailPage />} />

                {/* Corporate */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="inventory/settings" element={<AdminInventorySettingsPage />} />
                  <Route path="movements" element={<AdminMovementsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="logs" element={<AdminAuditLogPage />} />
                  <Route path="errors" element={<AdminErrorsPage />} />
                  <Route path="error-groups" element={<AdminErrorGroupsPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  {/* Geçici: mevcut admin sayfalarına geçiş */}
                  <Route path="returns" element={<AdminReturnsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>

                {/* Account Routes */}
                <Route path="/account" element={<AccountLayout />}>
                  <Route index element={<AccountOverviewPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="shipments" element={<AccountShipmentsPage />} />
                  <Route path="addresses" element={<AccountAddressesPage />} />
                  <Route path="invoices" element={<AccountInvoicesPage />} />
                  <Route path="returns" element={<AccountReturnsPage />} />
                  <Route path="profile" element={<AccountProfilePage />} />
                  <Route path="security" element={<AccountSecurityPage />} />
                  {/* Admin operations routes kaldırıldı */}
                </Route>
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />

                {/* Knowledge Routes */}
                <Route path="/destek/merkez" element={<KnowledgeHubPage />} />
                <Route path="/destek/konular/:slug" element={<KnowledgeTopicPage />} />

                {/* Calculators (v1) */}
                <Route path="/destek/hesaplayicilar/hrv" element={<HRVCalcPage />} />
                <Route path="/destek/hesaplayicilar/hava-perdesi" element={<AirCurtainCalcPage />} />
                <Route path="/destek/hesaplayicilar/jet-fan" element={<JetFanCalcPage />} />
                <Route path="/destek/hesaplayicilar/kanal" element={<DuctCalcPage />} />

                {/* Support Routes */}
                <Route path="/support" element={<SupportHomePage />} />
                <Route path="/support/sss" element={<FAQPage />} />
                <Route path="/support/iade-degisim" element={<ReturnsPage />} />
                <Route path="/support/teslimat-kargo" element={<ShippingPage />} />
                <Route path="/support/garanti-servis" element={<WarrantyPage />} />
                
                {/* Legal Routes */}
                <Route path="/legal/kvkk" element={<KVKKPage />} />
                <Route path="/legal/mesafeli-satis-sozlesmesi" element={<DistanceSalesAgreementPage />} />
                <Route path="/legal/on-bilgilendirme-formu" element={<PreInformationPage />} />
                <Route path="/legal/cerez-politikasi" element={<CookiePolicyPage />} />
                <Route path="/legal/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
                <Route path="/legal/kullanim-kosullari" element={<TermsOfUsePage />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              
              {/* Global cart toast */}
              <AddToCartToast />
              
              {/* Toast Container */}
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
            </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
