import React, { useState, useEffect } from 'react'
import { getProducts, getCategories, Product, Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import HeroSection from '../components/HeroSection'
import CategoriesShowcase from '../components/CategoriesShowcase'
import BrandsShowcase from '../components/BrandsShowcase'
import CartToast from '../components/CartToast'
import { Star, TrendingUp, Clock } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [toastProduct, setToastProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ])

        // Featured products (is_featured = true)
        const featured = productsData.filter(p => p.is_featured).slice(0, 8)
        setFeaturedProducts(featured)

        // New products (latest 8) - fallback to all non-featured products
        const newItems = productsData
          .filter(p => !p.is_featured)
          .slice(0, 8)
        setNewProducts(newItems)

        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleQuickView = (product: Product) => {
    // TODO: Implement quick view modal
    console.log('Quick view:', product)
  }

  const handleCartToast = (product: Product) => {
    setToastProduct(product)
    setShowToast(true)
  }

  const closeToast = () => {
    setShowToast(false)
    setToastProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">VentHub yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Showcase */}
      <CategoriesShowcase categories={categories} />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-12">
              <Star className="text-gold-accent mr-3" size={28} fill="currentColor" />
              <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray">
                Öne Çıkan Ürünler
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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

      {/* Brands Showcase */}
      <BrandsShowcase />

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-12">
              <Clock className="text-secondary-blue mr-3" size={28} />
              <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray">
                Yeni Ürünler
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
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

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-primary-navy to-secondary-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden VentHub?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              15 yıllık deneyimimiz ve dünya standartlarındaki ürünlerimizle 
              HVAC sektöründe güvenilir partneriniziz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-gold-accent" fill="currentColor" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Kalite</h3>
              <p className="text-blue-100">
                Avrupa standartlarında, dünya çapında tanınan markalardan 
                sadece en kaliteli ürünleri seçiyoruz.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-success-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Uzman Destek</h3>
              <p className="text-blue-100">
                HVAC uzmanlarımız size en uygun çözümü bulmak için 
                7/24 teknik destek sağlar.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-warning-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-blue-100">
                Türkiye genelinde hızlı ve güvenli teslimat ağımızla 
                ürünleriniz hızla elinizde.
              </p>
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
    </div>
  )
}

export default HomePage