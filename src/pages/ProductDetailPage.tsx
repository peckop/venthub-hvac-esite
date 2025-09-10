import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductById, getProductsBySubcategory, getCategories, Product, Category } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart'
import { BrandIcon } from '../components/HVACIcons'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import LeadModal from '../components/LeadModal'
import legalConfig from '../config/legal'
import { buildWhatsAppLink } from '../lib/utils'
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
  const [mainCategory, setMainCategory] = useState<Category | null>(null)
  const [subCategory, setSubCategory] = useState<Category | null>(null)
  const [images, setImages] = useState<{ path: string; alt?: string | null }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('genel')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [isNavSticky, setIsNavSticky] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const observerRef = useRef<IntersectionObserver | null>(null)
  const navTriggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      try {
        setLoading(true)
        const productData = await getProductById(id)
        
        if (!productData) {
          setProduct(null)
          return
        }

        setProduct(productData)

        // Fetch product images (cover + gallery)
        try {
          const { data: imgs } = await supabase
            .from('product_images')
            .select('path, alt, sort_order')
            .eq('product_id', productData.id)
            .order('sort_order', { ascending: true })
          setImages((imgs || []) as { path: string; alt?: string | null }[])
        } catch {}

        // Fetch categories for breadcrumb
        const cats = await getCategories()
        if (productData.category_id) {
          const mc = cats.find(c => c.id === productData.category_id) || null
          setMainCategory(mc)
        }
        if (productData.subcategory_id) {
          const sc = cats.find(c => c.id === productData.subcategory_id) || null
          setSubCategory(sc)
        }

        // Fetch related products from same subcategory (exact match)
        if (productData.subcategory_id) {
          const related = await getProductsBySubcategory(productData.subcategory_id)
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  // Scroll listener for sticky nav behavior
  useEffect(() => {
    const handleScroll = () => {
      if (navTriggerRef.current) {
        const triggerTop = navTriggerRef.current.offsetTop
        const scrollY = window.scrollY
        
        // Nav becomes sticky when we scroll past the trigger point
        setIsNavSticky(scrollY > triggerTop)
      }
    }

    window.addEventListener('scroll', handleScroll)
    // Call once to set initial state
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [product])

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
      const navEl = document.getElementById('pdp-sticky-nav')
      const currentNavHeight = navEl ? navEl.offsetHeight : 0
      const extraGap = 8
      const y = element.getBoundingClientRect().top + window.pageYOffset - currentNavHeight - extraGap
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

  const { t } = useI18n()

  const sections = [
    { id: 'genel', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-light-gray' },
    { id: 'olcuiler', title: t('pdp.sections.dimensions'), icon: Ruler, bgClass: 'bg-white' },
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-air-blue' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-light-gray' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' }
  ]

  // Knowledge Hub: kategori/alt kategori slug → konu slug eşleme
  const mapSlugToTopic = (slug?: string | null): string | null => {
    if (!slug) return null
    const s = slug.toLowerCase()
    if (s.includes('hava-perde')) return 'hava-perdesi'
    if (s.includes('jet-fan')) return 'jet-fan'
    if (s.includes('isi-geri-kazanim') || s.includes('hrv')) return 'hrv'
    return null
  }

  const topicSlug = mapSlugToTopic(subCategory?.slug) || mapSlugToTopic(mainCategory?.slug)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">{t('pdp.loading')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('pdp.productNotFound')}</h1>
          <Link to="/" className="text-primary-navy hover:text-secondary-blue">
            {t('pdp.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  // SEO values for PDP
  const canonicalUrl = `${window.location.origin}/product/${product.id}`
  const metaDesc = product.description || `${product.brand} ${product.name} ürünü hakkında detaylar.`

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${product.brand} ${product.name} | VentHub`} description={metaDesc} canonical={canonicalUrl} />
      {/* Breadcrumb */}
      <div className="bg-light-gray border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-steel-gray hover:text-primary-navy">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            {mainCategory && (
              <>
                <Link to={`/category/${mainCategory.slug}`} className="text-steel-gray hover:text-primary-navy">
                  {mainCategory.name}
                </Link>
                {subCategory && (
                  <>
                    <ChevronRight size={16} className="text-steel-gray" />
                    <Link to={`/category/${mainCategory.slug}/${subCategory.slug}`} className="text-steel-gray hover:text-primary-navy">
                      {subCategory.name}
                    </Link>
                  </>
                )}
                <ChevronRight size={16} className="text-steel-gray" />
              </>
            )}
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
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-air-blue to-light-gray rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={`${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${images[0].path}`}
                  alt={images[0].alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl text-secondary-blue/30">🌪️</div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {images.length > 0 ? (
                images.slice(0, 8).map((img, i) => (
                  <div key={`${img.path}-${i}`} className="aspect-square rounded-lg cursor-pointer hover:ring-2 hover:ring-primary-navy transition-all overflow-hidden bg-light-gray">
                    <img
                      src={`${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${img.path}`}
                      alt={img.alt || product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-light-gray rounded-lg" />
                ))
              )}
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
                  <span>{t('pdp.featured')}</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-industrial-gray">
              {product.name}
            </h1>

            {/* Quick technical chips (varsa) */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-2 py-1 rounded bg-light-gray text-steel-gray">{t('pdp.brand')}: {product.brand}</span>
              <span className="text-xs px-2 py-1 rounded bg-light-gray text-steel-gray">{t('pdp.model')}: {product.sku}</span>
            </div>

            {/* SKU & Status */}
            <div className="flex items-center space-x-4">
              <span className="text-steel-gray">
                {t('pdp.model')}: <span className="font-medium">{product.sku}</span>
              </span>
              {(() => {
                const inStock = typeof product.stock_qty === 'number' ? product.stock_qty > 0 : product.status !== 'out_of_stock'
                return (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${inStock ? 'bg-success-green/10 text-success-green' : 'bg-warning-orange/10 text-warning-orange'}`}>
                    {inStock ? t('pdp.inStock') : t('pdp.outOfStock')}
                  </div>
                )
              })()}
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-primary-navy">
              ₺{parseFloat(product.price).toLocaleString('tr-TR')}
              <span className="text-sm text-steel-gray font-normal ml-2">
                {t('pdp.vatIncluded')}
              </span>
            </div>

            {/* Description */}
            <p className="text-steel-gray leading-relaxed">
              {product.description || t('pdp.descFallback')}
            </p>

            {/* Related Guide */}
            {topicSlug && (
              <div className="pt-2">
                <div className="text-sm text-steel-gray">
                  <span className="font-medium text-industrial-gray">{t('pdp.relatedGuide')}:</span>
                  <Link
                    to={`/destek/konular/${topicSlug}`}
                    className="ml-2 text-primary-navy hover:text-secondary-blue underline"
                  >
                    {t(`knowledge.topics.${topicSlug}.title`)}
                  </Link>
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-steel-gray">{t('pdp.qty')}</span>
                <div className="flex items-center border-2 border-light-gray rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Adeti azalt"
                    className="px-3 py-2 hover:bg-light-gray transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium" aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Adeti artır"
                    className="px-3 py-2 hover:bg-light-gray transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                  className="flex-1 bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} />
                  <span>{t('pdp.addToCart')}</span>
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label={isWishlisted ? 'İstek listesinden çıkar' : 'İstek listesine ekle'}
                  aria-pressed={isWishlisted}
                  className={`p-2 sm:p-4 border-2 rounded-lg transition-colors ${
                    isWishlisted 
                      ? 'border-red-500 text-red-500 bg-red-50' 
                      : 'border-light-gray text-steel-gray hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                
                <button
                  onClick={handleShare}
                  aria-label="Paylaş"
                  className="p-2 sm:p-4 border-2 border-light-gray text-steel-gray hover:border-primary-navy hover:text-primary-navy rounded-lg transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Lead CTA and Stock Inquiry */}
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <button
                  onClick={() => setLeadOpen(true)}
                  className="w-full md:w-auto mt-2 bg-success-green hover:bg-success-green/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t('pdp.techQuote')}
                </button>
                {(() => {
                  const inStock = typeof product.stock_qty === 'number' ? product.stock_qty > 0 : product.status !== 'out_of_stock'
                  if (inStock) return null
                  const env = (import.meta as unknown as { env?: Record<string, string> }).env
                  const wa = env?.VITE_SHOP_WHATSAPP
                  if (typeof wa === 'string' && wa.trim()) {
                    const href = buildWhatsAppLink(wa, `Stok bilgisi: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}`)
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto mt-2 text-primary-navy hover:text-secondary-blue underline"
                      >
                        {t('pdp.askStock') || 'Stok sor'}
                      </a>
                    )
                  }
                  const mail = legalConfig?.sellerEmail || 'info@example.com'
                  const subject = encodeURIComponent('Stok Bilgisi Talebi')
                  const body = encodeURIComponent(`Merhaba, ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''} ürünü için stok durumu hakkında bilgi alabilir miyim?`)
                  return (
                    <a
                      href={`mailto:${mail}?subject=${subject}&body=${body}`}
                      className="w-full md:w-auto mt-2 text-primary-navy hover:text-secondary-blue underline"
                    >
                      {t('pdp.askStock') || 'Stok sor'}
                    </a>
                  )
                })()}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light-gray">
              <div className="text-center">
                <Truck className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">{t('pdp.freeShipping')}</p>
              </div>
              <div className="text-center">
                <Shield className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">{t('pdp.warranty2y')}</p>
              </div>
              <div className="text-center">
                <Phone className="text-success-green mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">{t('pdp.support247')}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Nav Trigger Point */}
      <div ref={navTriggerRef} className="h-0" />

      {/* Section Navigation */}
      <div 
        id="pdp-sticky-nav" 
        className={`transition-all duration-300 z-30 bg-white/95 backdrop-blur-md border-b border-light-gray shadow-sm ${
          isNavSticky ? 'fixed top-14 md:top-16 left-0 right-0' : 'relative'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-primary-navy text-white shadow-sm'
                    : 'text-steel-gray hover:text-primary-navy hover:bg-light-gray'
                }`}
              >
                <section.icon size={16} />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Sticky Nav Spacer - prevents content from jumping when nav becomes fixed */}
      {isNavSticky && (
        <div className="bg-white/95 border-b border-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 overflow-x-auto py-3 invisible">
              {sections.map((section) => (
                <button
                  key={`spacer-${section.id}`}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
                >
                  <section.icon size={16} />
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            brand: product.brand,
            sku: product.sku,
            image: product.image_url ? [product.image_url] : [],
            description: product.description || undefined,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'TRY',
              price: parseFloat(product.price || '0') || 0,
              availability: product.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: canonicalUrl,
            },
          }),
        }}
      />
      {/* JSON-LD BreadcrumbList for PDP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: (typeof t === 'function' ? t('category.breadcrumbHome') : 'Ana Sayfa'), item: `${window.location.origin}/` },
              ...(mainCategory ? [{ '@type': 'ListItem', position: 2, name: mainCategory.name, item: `${window.location.origin}/category/${mainCategory.slug}` }] : []),
              ...(subCategory ? [{ '@type': 'ListItem', position: mainCategory ? 3 : 2, name: subCategory.name, item: `${window.location.origin}/category/${mainCategory?.slug}/${subCategory.slug}` }] : []),
              { '@type': 'ListItem', position: (mainCategory && subCategory) ? 4 : (mainCategory ? 3 : 2), name: product.name, item: canonicalUrl },
            ],
          }),
        }}
      />

      {/* Vertical Section Layout */}
      <div className="space-y-0">
        {sections.map((section, _index) => {
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
                            {t('pdp.labels.productFeatures')}
                          </h4>
                          <ul className="space-y-3 text-steel-gray">
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              {t('pdp.features.materialQuality')}
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              {t('pdp.features.energyEfficient')}
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              {t('pdp.features.quietOperation')}
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              {t('pdp.features.easyMaintenance')}
                            </li>
                            <li className="flex items-center">
                              <Check size={16} className="text-success-green mr-3 flex-shrink-0" /> 
                              {t('pdp.features.durable')}
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.labels.productDescription')}</h4>
                          <p className="text-steel-gray leading-relaxed">
                            {product.description || t('pdp.descFallback')}
                          </p>
                        </div>
                      </div>

                      {/* Technical Specifications */}
                      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.labels.technicalSpecs')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.brand')}</span>
                            <span className="font-medium text-industrial-gray">{product.brand}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.model')}</span>
                            <span className="font-medium text-industrial-gray">{product.sku}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.statusLabel')}</span>
                            <span className={`font-medium ${
                              product.status === 'active' ? 'text-success-green' : 'text-warning-orange'
                            }`}>
                              {product.status === 'active' ? t('pdp.inStock') : t('pdp.outOfStock')}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.category')}</span>
                            <span className="font-medium text-industrial-gray">{mainCategory?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">{t('pdp.labels.price')}</span>
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
                                {t('pdp.variantDetails')}
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
                        <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.labels.physicalDimensions')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.width')}</span>
                            <span className="font-medium text-industrial-gray">450 mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.height')}</span>
                            <span className="font-medium text-industrial-gray">350 mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.depth')}</span>
                            <span className="font-medium text-industrial-gray">200 mm</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">{t('pdp.labels.weight')}</span>
                            <span className="font-medium text-industrial-gray">15.5 kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.labels.performanceMetrics')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.airflow')}</span>
                            <span className="font-medium text-industrial-gray">2.850 m³/h</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.pressure')}</span>
                            <span className="font-medium text-industrial-gray">245 Pa</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.labels.power')}</span>
                            <span className="font-medium text-industrial-gray">180 W</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-steel-gray">{t('pdp.labels.noise')}</span>
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
                            <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.diagramsExtra.technicalDiagrams')}</h4>
                            <div className="space-y-4">
                              <div className="aspect-video bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText size={32} className="text-primary-navy mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">{t('pdp.diagramsExtra.mounting')}</p>
                                  <p className="text-sm text-steel-gray">PDF - 2.4 MB</p>
                                </div>
                              </div>
                              <div className="aspect-video bg-gradient-to-br from-secondary-blue/10 to-air-blue/20 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText size={32} className="text-secondary-blue mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">{t('pdp.diagramsExtra.electrical')}</p>
                                  <p className="text-sm text-steel-gray">PDF - 1.8 MB</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-4">{t('pdp.diagramsExtra.threeDViews')}</h4>
                            <div className="space-y-4">
                              <div className="aspect-video bg-gradient-to-br from-air-blue/20 to-light-gray rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Settings size={32} className="text-primary-navy mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">{t('pdp.diagramsExtra.view3DModel')}</p>
                                  <p className="text-sm text-steel-gray">{t('pdp.diagramsExtra.interactiveModel')}</p>
                                </div>
                              </div>
                              <div className="aspect-video bg-gradient-to-br from-success-green/10 to-light-gray rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Ruler size={32} className="text-success-green mx-auto mb-2" />
                                  <p className="text-steel-gray font-medium">{t('pdp.diagramsExtra.dimensionedDrawing')}</p>
                                  <p className="text-sm text-steel-gray">{t('pdp.diagramsExtra.cadDwg')}</p>
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
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.installationGuide')}</h4>
                              <p className="text-sm text-steel-gray">PDF - 3.2 MB</p>
                            </div>
                            <button className="w-full bg-primary-navy hover:bg-secondary-blue text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>{t('pdp.actions.download')}</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-secondary-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.userManual')}</h4>
                              <p className="text-sm text-steel-gray">PDF - 2.8 MB</p>
                            </div>
                            <button className="w-full bg-secondary-blue hover:bg-primary-navy text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
<span>{t('pdp.actions.download')}</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-success-green mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.maintenanceManual')}</h4>
                              <p className="text-sm text-steel-gray">PDF - 1.9 MB</p>
                            </div>
                            <button className="w-full bg-success-green hover:bg-success-green/80 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={16} />
                              <span>{t('pdp.actions.download')}</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="text-center mb-4">
                              <FileText size={48} className="text-warning-orange mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.safetyInfo')}</h4>
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
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.warrantyTerms')}</h4>
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
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.docs.technicalSpecsDoc')}</h4>
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
                            <h4 className="font-semibold text-industrial-gray mb-6">{t('pdp.docs.productCatalog')}</h4>
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-center">
                                <Download size={48} className="text-primary-navy mx-auto mb-3" />
                                <p className="text-steel-gray font-medium">{t('pdp.docs.productCatalog')} 2024</p>
                                <p className="text-sm text-steel-gray">PDF - 8.5 MB</p>
                              </div>
                            </div>
                            <button className="w-full bg-primary-navy hover:bg-secondary-blue text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>{t('pdp.actions.downloadCatalog')}</span>
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="font-semibold text-industrial-gray mb-6">{t('pdp.docs.technicalBrochure')}</h4>
                            <div className="aspect-[3/4] bg-gradient-to-br from-secondary-blue/10 to-air-blue/20 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-center">
                                <Download size={48} className="text-secondary-blue mx-auto mb-3" />
                                <p className="text-steel-gray font-medium">{t('pdp.docs.technicalBrochure')}</p>
                                <p className="text-sm text-steel-gray">PDF - 4.2 MB</p>
                              </div>
                            </div>
                            <button className="w-full bg-secondary-blue hover:bg-primary-navy text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>{t('pdp.actions.downloadBrochure')}</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Additional Resources */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-success-green mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">{t('pdp.docs.productReleaseNotes')}</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 800 KB</p>
                            <button className="text-success-green hover:bg-success-green hover:text-white py-1 px-3 rounded border border-success-green transition-colors text-sm">
                              {t('pdp.actions.download')}
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-warning-orange mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">{t('pdp.docs.troubleshootingGuide')}</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 1.1 MB</p>
                            <button className="text-warning-orange hover:bg-warning-orange hover:text-white py-1 px-3 rounded border border-warning-orange transition-colors text-sm">
                              {t('pdp.actions.download')}
                            </button>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <FileText size={32} className="text-air-blue mx-auto mb-2" />
                            <h5 className="font-medium text-industrial-gray mb-1">{t('pdp.docs.sparePartsList')}</h5>
                            <p className="text-xs text-steel-gray mb-3">PDF - 600 KB</p>
                            <button className="text-air-blue hover:bg-air-blue hover:text-white py-1 px-3 rounded border border-air-blue transition-colors text-sm">
                              {t('pdp.actions.download')}
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
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.ceCertificate')}</h4>
                              <p className="text-sm text-steel-gray">Avrupa Uygunluk Belgesi</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>{t('pdp.certLabels.certificateNo')}:</strong> CE-2024-{product.sku}</p>
                              <p><strong>{t('pdp.certLabels.validity')}:</strong> 2027</p>
                              <p><strong>{t('pdp.certLabels.standard')}:</strong> EN 12101-3:2013</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-primary-navy/10 to-primary-navy/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-primary-navy mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.iso9001')}</h4>
                              <p className="text-sm text-steel-gray">Quality Management System</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
                              <p><strong>{t('pdp.certLabels.certificateNo')}:</strong> ISO-9001-{product.brand}</p>
                              <p><strong>{t('pdp.certLabels.validity')}:</strong> 2026</p>
                              <p><strong>{t('pdp.certLabels.standard')}:</strong> ISO 9001:2015</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-secondary-blue/10 to-secondary-blue/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-secondary-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.tseCertificate')}</h4>
                              <p className="text-sm text-steel-gray">Turkish Standards Institute</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
<p><strong>{t('pdp.certLabels.certificateNo')}:</strong> TSE-2024-{product.sku.substring(0, 3)}</p>
<p><strong>{t('pdp.certLabels.validity')}:</strong> 2025</p>
                              <p><strong>{t('pdp.certLabels.standard')}:</strong> TS EN 12101-3</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-air-blue/20 to-air-blue/10 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-air-blue mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.energyStar')}</h4>
                              <p className="text-sm text-steel-gray">{t('pdp.certLabels.efficiency')}</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
<p><strong>{t('pdp.certLabels.certificateNo')}:</strong> ES-2024-{product.id.substring(0, 8)}</p>
<p><strong>{t('pdp.certLabels.validity')}:</strong> 2027</p>
<p><strong>{t('pdp.certLabels.efficiency')}:</strong> A++</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-warning-orange/10 to-warning-orange/5 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-warning-orange mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.ulCertificate')}</h4>
                              <p className="text-sm text-steel-gray">Underwriters Laboratories</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
<p><strong>{t('pdp.certLabels.certificateNo')}:</strong> UL-{product.sku}-2024</p>
<p><strong>{t('pdp.certLabels.validity')}:</strong> 2026</p>
<p><strong>{t('pdp.certLabels.standard')}:</strong> UL 555S</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                            <div className="bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-lg p-4 mb-4">
                              <Award size={48} className="text-success-green mx-auto mb-3" />
                              <h4 className="font-semibold text-industrial-gray">{t('pdp.cert.ecoFriendly')}</h4>
                              <p className="text-sm text-steel-gray">{t('pdp.cert.rohsCompliant')}</p>
                            </div>
                            <div className="text-xs text-steel-gray space-y-1">
<p><strong>{t('pdp.certLabels.certificateNo')}:</strong> RoHS-{product.brand}-2024</p>
<p><strong>{t('pdp.certLabels.validity')}:</strong> Continuous</p>
<p><strong>{t('pdp.certLabels.standard')}:</strong> EU 2011/65</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4 text-center">{t('pdp.cert.downloadCenter')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="bg-primary-navy hover:bg-secondary-blue text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Download size={20} />
                              <span>{t('pdp.cert.downloadAllZip')}</span>
                            </button>
                            <button className="bg-secondary-blue hover:bg-primary-navy text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <FileText size={20} />
                              <span>{t('pdp.cert.verify')}</span>
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
                {t('pdp.relatedProducts')}
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
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} productName={product.name} productId={product.id} />
    </div>
  )
}

export default ProductDetailPage
