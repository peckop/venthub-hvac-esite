import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductById, getProductsByCategory, Product } from '../lib/supabase'
import { useCart } from '../hooks/useCart'
import { BrandIcon, getCategoryIcon } from '../components/HVACIcons'
import ProductCard from '../components/ProductCard'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Check, 
  Truck,
  Shield,
  Phone,
  Star,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Award,
  Ruler,
  Settings
} from 'lucide-react'

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('genel')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      try {
        setLoading(true)
        const productData = await getProductById(id)
        
        if (!productData) {
          navigate('/404')
          return
        }

        setProduct(productData)

        // Fetch related products from same subcategory
        if (productData.subcategory_id) {
          const related = await getProductsByCategory(productData.subcategory_id)
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        navigate('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  // Intersection Observer for scroll spy
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -35% 0px',
      threshold: 0
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section')
          if (sectionId) {
            setActiveSection(sectionId)
          }
        }
      })
    }, options)

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [product])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const yOffset = -100 // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `${product.brand} - ${product.name}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const sections = [
    { id: 'genel', title: 'Genel Bilgiler', icon: FileText, bgClass: 'bg-white' },
    { id: 'modeller', title: 'Modeller', icon: Settings, bgClass: 'bg-light-gray' },
    { id: 'olcuiler', title: 'Ölçüler', icon: Ruler, bgClass: 'bg-white' },
    { id: 'diyagramlar', title: 'Diyagramlar', icon: FileText, bgClass: 'bg-air-blue' },
    { id: 'dokumanlar', title: 'Dökümanlar', icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: 'Ürün PDF', icon: Download, bgClass: 'bg-light-gray' },
    { id: 'sertifikalar', title: 'Sertifikalar', icon: Award, bgClass: 'bg-white' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">Ürün yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">Ürün Bulunamadı</h1>
          <Link to="/" className="text-primary-navy hover:text-secondary-blue">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-light-gray border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-steel-gray hover:text-primary-navy">
              Ana Sayfa
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            <Link to="/products" className="text-steel-gray hover:text-primary-navy">
              Ürünler
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            <span className="text-industrial-gray font-medium">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-air-blue to-light-gray rounded-xl flex items-center justify-center mb-4">
              <div className="text-8xl text-secondary-blue/30">
                🌪️
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-light-gray rounded-lg cursor-pointer hover:ring-2 hover:ring-primary-navy transition-all">
                  <div className="w-full h-full flex items-center justify-center text-steel-gray">
                    🌪️
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Featured Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BrandIcon brand={product.brand} />
                <span className="text-secondary-blue font-semibold">{product.brand}</span>
              </div>
              {product.is_featured && (
                <div className="bg-gold-accent text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star size={14} fill="currentColor" />
                  <span>Öne Çıkan</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-industrial-gray">
              {product.name}
            </h1>

            {/* SKU & Status */}
            <div className="flex items-center space-x-4">
              <span className="text-steel-gray">
                Model: <span className="font-medium">{product.sku}</span>
              </span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.status === 'active' 
                  ? 'bg-success-green/10 text-success-green' 
                  : 'bg-warning-orange/10 text-warning-orange'
              }`}>
                {product.status === 'active' ? 'Stokta Var' : 'Stokta Yok'}
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-primary-navy">
              ₺{parseFloat(product.price).toLocaleString('tr-TR')}
              <span className="text-sm text-steel-gray font-normal ml-2">
                (KDV Dahil)
              </span>
            </div>

            {/* Description */}
            <p className="text-steel-gray leading-relaxed">
              {product.description || 'Bu ürün için detaylı açıklama yakında eklenecektir.'}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-steel-gray">Miktar:</span>
                <div className="flex items-center border-2 border-light-gray rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-light-gray transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-light-gray transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'active'}
                  className="flex-1 bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  <span>Sepete Ekle</span>
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    isWishlisted 
                      ? 'border-red-500 text-red-500 bg-red-50' 
                      : 'border-light-gray text-steel-gray hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-4 border-2 border-light-gray text-steel-gray hover:border-primary-navy hover:text-primary-navy rounded-lg transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light-gray">
              <div className="text-center">
                <Truck className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">Bedava Kargo</p>
              </div>
              <div className="text-center">
                <Shield className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">2 Yıl Garanti</p>
              </div>
              <div className="text-center">
                <Phone className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">7/24 Destek</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Section Navigation */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-light-gray shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-3">
            {sections.map((section) => {
              const IconComponent = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-primary-navy text-white shadow-sm'
                      : 'text-steel-gray hover:text-primary-navy hover:bg-light-gray'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{section.title}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Vertical Section Layout */}
      <div className="space-y-0">
        {sections.map((section, index) => {
          const IconComponent = section.icon
          return (
            <section 
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el }}
              data-section={section.id}
              className={`${section.bgClass} py-16 transition-all duration-500`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center space-x-3 mb-8">
                  <div className="bg-primary-navy text-white p-3 rounded-lg">
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-industrial-gray">
                      {section.title}
                    </h2>
                    <p className="text-steel-gray mt-1">
                      {product.name} - {section.title.toLowerCase()} bilgileri
                    </p>
                  </div>
                </div>

                {/* Section Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {section.id === 'genel' && (
                    <>
                      {/* Product Features */}
                      <div className="space-y-6">
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4 flex items-center">
                            <Check className="text-success-green mr-2" size={20} />
                            Ürün Özellikleri
                          </h4>
                          <ul className="space-y-3 text-steel-gray">
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              Premium kalite malzeme ve üretim
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              Enerji verimli tasarım ve düşük tüketim
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              Sessiz çalışma ve minimum titreşim
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              Kolay montaj ve bakım
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              Uzun ömürlü ve dayanıklı
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4">Ürün Açıklaması</h4>
                          <p className="text-steel-gray leading-relaxed">
                            {product.description || `${product.brand} ${product.name} modeli, endüstriyel HVAC uygulamaları için tasarlanmış yüksek performanslı bir çözümdür. Avrupa standartlarında üretilen bu ürün, uzun yıllar güvenilir hizmet verecek şekilde tasarlanmıştır.`}
                          </p>
                        </div>
                      </div>

                      {/* Technical Specifications */}
                      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h4 className="font-semibold text-industrial-gray mb-4">Teknik Özellikler</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Marka</span>
                            <span className="font-medium text-industrial-gray">{product.brand}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Model</span>
                            <span className="font-medium text-industrial-gray">{product.sku}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Durum</span>
                            <span className={`font-medium ${
                              product.status === 'active' ? 'text-success-green' : 'text-warning-orange'
                            }`}>
                              {product.status === 'active' ? 'Stokta Mevcut' : 'Stokta Yok'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Kategori</span>
                            <span className="font-medium text-industrial-gray">HVAC Sistemi</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">Fiyat</span>
                            <span className="font-bold text-primary-navy">
                              ₺{parseFloat(product.price).toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'modeller' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Model Variants */}
                          {[1, 2, 3].map((variant) => (
                            <div key={variant} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                              <div className="aspect-square bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10 rounded-lg mb-4 flex items-center justify-center">
                                <BrandIcon brand={product.brand} className="scale-150" />
                              </div>
                              <h4 className="font-semibold text-industrial-gray mb-2">
                                {product.sku}-{variant}
                              </h4>
                              <p className="text-steel-gray text-sm mb-3">
                                Model {variant} varyantı - özel teknik özellikler
                              </p>
                              <div className="text-primary-navy font-semibold">
                                ₺{(parseFloat(product.price) + (variant - 1) * 200).toLocaleString('tr-TR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'olcuiler' && (
                    <>
                      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h4 className="font-semibold text-industrial-gray mb-4">Fiziksel Ölçüler</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Genişlik</span>
                            <span className="font-medium text-industrial-gray">450 mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Yükseklik</span>
                            <span className="font-medium text-industrial-gray">350 mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Derinlik</span>
                            <span className="font-medium text-industrial-gray">200 mm</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">Ağırlık</span>
                            <span className="font-medium text-industrial-gray">15.5 kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h4 className="font-semibold text-industrial-gray mb-4">Performans Ölçüleri</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Hava Debisi</span>
                            <span className="font-medium text-industrial-gray">2.850 m³/h</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Basınç</span>
                            <span className="font-medium text-industrial-gray">245 Pa</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">Güç</span>
                            <span className="font-medium text-industrial-gray">180 W</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">Gürültü Seviyesi</span>
                            <span className="font-medium text-industrial-gray">45 dB(A)</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'diyagramlar' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Technical Diagrams */}
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-4">Teknik Şemalar</h4>
                            <div className="space-y-4">
                              <div className="aspect-video bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText size={32} className="text-primary-navy mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">Montaj Şeması</p>
                                  <p className="text-sm text-steel-gray">PDF - 2.4 MB</p>
                                </div>
                              </div>
                              <div className="aspect-video bg-gradient-to-br from-secondary-blue/10 to-air-blue/20 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText size={32} className="text-secondary-blue mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">Elektrik Şeması</p>
                                  <p className="text-sm text-steel-gray">PDF - 1.8 MB</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-4">3D Görünümler</h4>
                            <div className="space-y-4">
                              <div className="aspect-video bg-gradient-to-br from-air-blue/20 to-light-gray rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Settings size={32} className="text-primary-navy mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">3D Model Görünümü</p>
                                  <p className="text-sm text-steel-gray">Interaktif Model</p>
                                </div>
                              </div>
                              <div className="aspect-video bg-gradient-to-br from-success-green/10 to-light-gray rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Ruler size={32} className="text-success-green mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">Ölçülü Çizim</p>
                                  <p className="text-sm text-steel-gray">CAD - DWG Format</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'dokumanlar' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Technical Documents */}
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-primary-navy mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Kurulum Kılavuzu</h4>
                              <p className="text-sm text-steel-gray">PDF - 3.2 MB</p>
                            </div>
                            <button className="w-full bg-primary-navy hover:bg-secondary-blue text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-secondary-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Kullanım Kılavuzu</h4>
                              <p className="text-sm text-steel-gray">PDF - 2.8 MB</p>
                            </div>
                            <button className="w-full bg-secondary-blue hover:bg-primary-navy text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-success-green mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Bakım Kılavuzu</h4>
                              <p className="text-sm text-steel-gray">PDF - 1.9 MB</p>
                            </div>
                            <button className="w-full bg-success-green hover:bg-success-green/80 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-warning-orange mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Güvenlik Bilgileri</h4>
                              <p className="text-sm text-steel-gray">PDF - 1.5 MB</p>
                            </div>
                            <button className="w-full bg-warning-orange hover:bg-warning-orange/80 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-steel-gray mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Garanti Koşulları</h4>
                              <p className="text-sm text-steel-gray">PDF - 900 KB</p>
                            </div>
                            <button className="w-full bg-steel-gray hover:bg-industrial-gray text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-air-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Teknik Özellikler</h4>
                              <p className="text-sm text-steel-gray">PDF - 1.2 MB</p>
                            </div>
                            <button className="w-full bg-air-blue hover:bg-air-blue/80 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>İndir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'pdf' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Product Catalogs */}
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-6">Ürün Kataloğu</h4>
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-center">
                                <Download size={48} className="text-primary-navy mx-auto mb-3" />
                                <p className="text-steel-gray font-medium">Ürün Kataloğu 2024</p>
                                <p className="text-sm text-steel-gray">PDF - 8.5 MB</p>
                              </div>
                            </div>
                            <button className="w-full bg-primary-navy hover:bg-secondary-blue text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>Kataloğu İndir</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-6">Teknik Broşür</h4>
                            <div className="aspect-[3/4] bg-gradient-to-br from-secondary-blue/10 to-air-blue/20 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-center">
                                <Download size={48} className="text-secondary-blue mx-auto mb-3" />
                                <p className="text-steel-gray font-medium">Teknik Broşür</p>
                                <p className="text-sm text-steel-gray">PDF - 4.2 MB</p>
                              </div>
                            </div>
                            <button className="w-full bg-secondary-blue hover:bg-primary-navy text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>Broşürü İndir</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Additional Resources */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-success-green mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">Ürün Güncelleme Notları</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 800 KB</p>
                            <button className="text-success-green hover:bg-success-green hover:text-white py-1 px-3 rounded border border-success-green transition-colors text-sm">
                              İndir
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-warning-orange mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">Sorun Giderme Rehberi</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 1.1 MB</p>
                            <button className="text-warning-orange hover:bg-warning-orange hover:text-white py-1 px-3 rounded border border-warning-orange transition-colors text-sm">
                              İndir
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-air-blue mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">Yedek Parça Listesi</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 600 KB</p>
                            <button className="text-air-blue hover:bg-air-blue hover:text-white py-1 px-3 rounded border border-air-blue transition-colors text-sm">
                              İndir
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'sertifikalar' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Certifications */}
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-success-green/10 to-success-green/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-success-green mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">CE Sertifikası</h4>
                              <p className="text-sm text-steel-gray">Avrupa Uygunluk Belgesi</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> CE-2024-{product.sku}</p>
                              <p><strong>Geçerlilik:</strong> 2027'ye kadar</p>
                              <p><strong>Standart:</strong> EN 12101-3:2013</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-primary-navy/10 to-primary-navy/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-primary-navy mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">ISO 9001</h4>
                              <p className="text-sm text-steel-gray">Kalite Yönetim Sistemi</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> ISO-9001-{product.brand}</p>
                              <p><strong>Geçerlilik:</strong> 2026'ya kadar</p>
                              <p><strong>Standart:</strong> ISO 9001:2015</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-secondary-blue/10 to-secondary-blue/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-secondary-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">TSE Belgesi</h4>
                              <p className="text-sm text-steel-gray">Türk Standartları Enstitüsü</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> TSE-2024-{product.sku.substring(0, 3)}</p>
                              <p><strong>Geçerlilik:</strong> 2025'ye kadar</p>
                              <p><strong>Standart:</strong> TS EN 12101-3</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-air-blue/20 to-air-blue/10 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-air-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Energy Star</h4>
                              <p className="text-sm text-steel-gray">Enerji Verimliliği</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> ES-2024-{product.id.substring(0, 8)}</p>
                              <p><strong>Geçerlilik:</strong> 2027'ye kadar</p>
                              <p><strong>Verimlilik:</strong> A++ Sınıfı</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-warning-orange/10 to-warning-orange/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-warning-orange mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">UL Belgesi</h4>
                              <p className="text-sm text-steel-gray">Underwriters Laboratories</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> UL-{product.sku}-2024</p>
                              <p><strong>Geçerlilik:</strong> 2026'ya kadar</p>
                              <p><strong>Standart:</strong> UL 555S</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-success-green mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">Çevre Dostu</h4>
                              <p className="text-sm text-steel-gray">RoHS Uyumlu</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>Sertifika No:</strong> RoHS-{product.brand}-2024</p>
                              <p><strong>Geçerlilik:</strong> Sürekli</p>
                              <p><strong>Standart:</strong> EU 2011/65</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4 text-center">Sertifika İndirme Merkezi</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="bg-primary-navy hover:bg-secondary-blue text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>Tüm Sertifikaları İndir (ZIP)</span>
                            </button>
                            <button className="bg-secondary-blue hover:bg-primary-navy text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <FileText size={20} />
                              <span>Sertifika Doğrulama</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>


      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-industrial-gray mb-8 text-center">
                Benzer Ürünler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage