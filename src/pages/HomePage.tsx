import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import HeroSection from '../components/HeroSection'
import { useI18n } from '../i18n/I18nProvider'
import BrandsShowcase from '../components/BrandsShowcase'
import CartToast from '../components/CartToast'
import QuickViewModal from '../components/QuickViewModal'
import { Star, TrendingUp, Clock } from 'lucide-react'
import { getActiveApplicationCards } from '../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../utils/applicationUi'
import { trackEvent } from '../utils/analytics'
import LeadModal from '../components/LeadModal'

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toastProduct, setToastProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [leadOpen, setLeadOpen] = useState(false)

  const { t } = useI18n()

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData] = await Promise.all([
          getProducts()
        ])

        // Featured products (is_featured = true)
        const featured = productsData.filter(p => p.is_featured).slice(0, 8)
        setFeaturedProducts(featured)

        // New products (latest 8) - fallback to all non-featured products
        const newItems = productsData
          .filter(p => !p.is_featured)
          .slice(0, 8)
        setNewProducts(newItems)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
    setQuickViewOpen(true)
  }

  const closeToast = () => {
    setShowToast(false)
    setToastProduct(null)
  }

  // Global lead modal trigger for HeroSection button
  ;((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">{t('common.loadingApp')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Uygulamaya Göre Çözümler */}
      <section id="by-application" className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('common.byApplication')}</h2>
            <a href="/products#by-application" className="text-primary-navy hover:underline text-sm font-medium">{t('common.viewAll')} →</a>
          </div>
          {(() => {
            const appCards = getActiveApplicationCards()
            return (
              <div className={`${gridColsClass(appCards.length)}`}>
                {appCards.map(card => (
                  <Link
                    key={card.key}
                    to={card.href}
                    className="group relative overflow-hidden rounded-xl border border-light-gray bg-white hover:shadow-md transition transform hover:-translate-y-0.5 ring-1 ring-black/5"
                    onClick={() => {
                      trackEvent('application_click', { key: card.key, source: 'home' })
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${accentOverlayClass(card.accent)} to-transparent`}></div>
                    <div className="p-5 relative z-10">
                      <div className="flex items-center gap-2 text-primary-navy">
                        {iconFor(card.icon, 18)}
                        <span className="text-sm font-semibold">{t(`applications.${card.key}.title`)}</span>
                      </div>
                      <p className="mt-1 text-sm text-steel-gray">{t(`applications.${card.key}.subtitle`)}</p>
                      <div className="mt-4 text-sm font-medium text-primary-navy">{t('common.discover')} →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Why Choose Us Section (öne alındı) */}
      <section className="py-16 bg-gradient-to-br from-primary-navy to-secondary-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('common.whyUs')}
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t('home.whyParagraph')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-gold-accent" fill="currentColor" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.why.premiumTitle')}</h3>
              <p className="text-blue-100">
                {t('home.why.premiumText')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-success-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.why.expertTitle')}</h3>
              <p className="text-blue-100">
                {t('home.why.expertText')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-warning-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.why.fastTitle')}</h3>
              <p className="text-blue-100">
                {t('home.why.fastText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-12">
              <Star className="text-gold-accent mr-3" size={28} fill="currentColor" />
              <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray">
                {t('common.featured')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0,4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  highlightFeatured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands Showcase */}
      <BrandsShowcase />

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-12">
              <Clock className="text-secondary-blue mr-3" size={28} />
              <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray">
                {t('common.newProducts')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.slice(0,4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alt CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-industrial-gray">{t('home.bottomCtaTitle')}</h3>
              <p className="text-steel-gray mt-1">{t('home.bottomCtaSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <a href="/products" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                {t('common.exploreProducts')}
              </a>
              <button
                onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
                className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
              >
                {t('common.getQuote')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Toast */}
      <CartToast
        isVisible={showToast}
        product={toastProduct}
        onClose={closeToast}
      />
      <QuickViewModal
        product={quickViewProduct}
        open={quickViewOpen}
        onClose={() => { setQuickViewOpen(false); setQuickViewProduct(null) }}
      />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </div>
  )
}

export default HomePage