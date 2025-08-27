import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './hooks/useCart'
import { AuthProvider } from './contexts/AuthContext'
import { useScrollThrottle } from './hooks/useScrollThrottle'
import StickyHeader from './components/StickyHeader'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import LanguageSwitcher from './components/LanguageSwitcher'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import OrdersPage from './pages/OrdersPage'
import Footer from './components/Footer'
import PaymentWatcher from './components/PaymentWatcher'
import BackToTopButton from './components/BackToTopButton'
import AddToCartToast from './components/AddToCartToast'
import KVKKPage from './pages/legal/KVKKPage'
import DistanceSalesAgreementPage from './pages/legal/DistanceSalesAgreementPage'
import PreInformationPage from './pages/legal/PreInformationPage'
import CookiePolicyPage from './pages/legal/CookiePolicyPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import TermsOfUsePage from './pages/legal/TermsOfUsePage'
import SupportHomePage from './pages/support/SupportHomePage'
import FAQPage from './pages/support/FAQPage'
import ReturnsPage from './pages/support/ReturnsPage'
import ShippingPage from './pages/support/ShippingPage'
import WarrantyPage from './pages/support/WarrantyPage'
import BrandsPage from './pages/BrandsPage'
import BrandDetailPage from './pages/BrandDetailPage'
import AccountLayout from './pages/account/AccountLayout'
import AccountOverviewPage from './pages/account/AccountOverviewPage'
import AccountAddressesPage from './pages/account/AccountAddressesPage'
import AccountSecurityPage from './pages/account/AccountSecurityPage'
import AccountInvoicesPage from './pages/account/AccountInvoicesPage'
import AccountProfilePage from './pages/account/AccountProfilePage'
import AccountShipmentsPage from './pages/account/AccountShipmentsPage'
import AccountReturnsPage from './pages/account/AccountReturnsPage'

function App() {
  // Performance optimize edilmiş scroll handling
  const isScrolled = useScrollThrottle(100, 16)

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
                
                {/* Account Routes */}
                <Route path="/account" element={<AccountLayout />}>
                  <Route index element={<AccountOverviewPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="shipments" element={<AccountShipmentsPage />} />
                  <Route path="addresses" element={<AccountAddressesPage />} />
                  <Route path="invoices" element={<AccountInvoicesPage />} />
                  <Route path="returns" element={<AccountReturnsPage />} />
                  <Route path="profile" element={<AccountProfilePage />} />
                  <Route path="security" element={<AccountSecurityPage />} />
                </Route>
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />

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