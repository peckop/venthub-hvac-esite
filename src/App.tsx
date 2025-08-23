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
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/category/:parentSlug/:slug" element={<CategoryPage />} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
              </Routes>
            </main>

            <Footer />
            
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