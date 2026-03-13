'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlugOrId, getProductsBySubcategory, getCategories, Product, Category } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCartHook'
import { BrandIcon } from '../components/HVACIcons'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import { formatCurrency } from '../i18n/format'
import LeadModal from '../components/LeadModal'
import legalConfig from '../config/legal'
import { getStockInquiryLink } from '../utils/whatsapp'
import toast from 'react-hot-toast'
import { generateProductDatasheet } from '../lib/pdfGenerator'
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Phone,
  Star,
  ChevronRight,
  FileText,
  Download,
  Award,
  Ruler,
  Settings,
  Info,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import ImageGallery from '../components/ImageGallery'
import { RichTextRenderer } from '../components/products/RichTextRenderer'
import { 
  translateSpecKey, 
  formatSpecValue, 
  groupTechnicalSpecs,
  SPEC_SORT_ORDER
} from '../utils/productHelpers'

export interface ProductDetailPageProps {
  initialProduct?: Product | null
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ initialProduct }) => {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialProduct)
  const [mainCategory, setMainCategory] = useState<Category | null>(null)
  const [subCategory, setSubCategory] = useState<Category | null>(null)
  const [images, setImages] = useState<{ path: string; alt?: string | null }[]>([])
  // activeIdx state moved to ImageGallery component
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('genel')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [isNavSticky, setIsNavSticky] = useState(false)
  const [openSpecSections, setOpenSpecSections] = useState<string[]>(['performance']) // First section open by default
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const navTriggerRef = useRef<HTMLDivElement>(null)

  // Toggle accordion section
  const toggleSpecSection = (sectionKey: string) => {
    setOpenSpecSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(k => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      // If we already have the product from SSR, skip first fetch
      if (initialProduct && (id === initialProduct.id || id === initialProduct.sku)) {
        // Still need to fetch ancillary data like images and related products if not in initialProduct
        // But we can skip the main product fetch
        setProduct(initialProduct)
        setLoading(false)
      }

      try {
        if (!product) setLoading(true)
        const productData = await getProductBySlugOrId(id)

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
          const list = (imgs || []) as { path: string; alt?: string | null }[]
          setImages(list)
        } catch { }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router])

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

  // Scroll Spy with manual calculation (More robust than IO)
  useEffect(() => {
    const handleScrollSpy = () => {
      const navEl = document.getElementById('pdp-sticky-nav')
      const headerOffset = navEl ? navEl.offsetHeight + 100 : 180 // Buffer for sticky header + breathing room

      const scrollPosition = window.scrollY + headerOffset

      // Get all section offsets
      const sectionOffsets = Object.entries(sectionRefs.current).map(([id, ref]) => {
        if (!ref) return null
        return {
          id,
          top: ref.offsetTop,
          bottom: ref.offsetTop + ref.offsetHeight
        }
      }).filter(Boolean) as { id: string, top: number, bottom: number }[]

      // Find the active section
      for (const section of sectionOffsets) {
        if (scrollPosition >= section.top && scrollPosition < section.bottom) {
          setActiveSection(section.id)
          return
        }
      }
    }

    window.addEventListener('scroll', handleScrollSpy)
    handleScrollSpy() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScrollSpy)
    }
  }, [product, activeSection])


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
    if (typeof window === 'undefined') return
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

  const { t, lang } = useI18n()

  const handleDownloadPdf = async () => {
    if (!product) return;
    try {
      setIsGeneratingPdf(true);

      let fullImageUrl: string | undefined = undefined;

      if (images?.length > 0 && images[0]?.path) {
        // Resolve absolute URL via Supabase Storage
        const { data } = supabase.storage.from('product-images').getPublicUrl(images[0].path);
        fullImageUrl = data?.publicUrl;
      } else if (product.image_url) {
        // Fallback to legacy field
        fullImageUrl = product.image_url;
      }

      await generateProductDatasheet(product, fullImageUrl, translateSpecKey, lang);
      toast.success(t('pdp.pdfSuccess') || 'Teknik PDF Föyü başarıyla indirildi.');
    } catch (err) {
      console.error(err);
      toast.error(t('pdp.pdfError') || 'PDF oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const sections = [
    { id: 'genel', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'olcuiler', title: 'Teknik Özellikler', icon: Ruler, bgClass: 'bg-white' }, // Was "Ölçüler" - now covers Performance/Physical/Electrical
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-air-blue' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-light-gray' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-light-gray' } // Moved to end per user request
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

  // SEO values for PDP - Safe for SSR
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

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
          <Link href="/" className="text-primary-navy hover:text-secondary-blue">
            {t('pdp.backHome')}
          </Link>
        </div>
      </div>
    )
  }



  const canonicalUrl = `${origin}/products/${product.id}`
  const metaDesc = product.description || `${product.brand} ${product.name} ürünü hakkında detaylar.`

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${product.brand} ${product.name} | VentHub`} description={metaDesc} canonical={canonicalUrl} />
      {/* Breadcrumb */}
      <div className="bg-light-gray border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-steel-gray hover:text-primary-navy">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            {mainCategory && (
              <>
                <Link href={`/category/${mainCategory.slug}`} className="text-steel-gray hover:text-primary-navy">
                  {mainCategory.name}
                </Link>
                {subCategory && subCategory.slug !== mainCategory.slug && (
                  <>
                    <ChevronRight size={16} className="text-steel-gray" />
                    <Link href={`/category/${mainCategory.slug}/${subCategory.slug}`} className="text-steel-gray hover:text-primary-navy">
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
        {/* Back Button - Akıllı: ürünün kategorisine yönlendir */}
        <button
          onClick={() => {
            // POP aksiyonu yapıldığını sisteme bildir (scroll restore için)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('vh_is_pop', 'true');
            }

            // Akıllı Navigasyon (Smart Stack): sessionStorage'daki durak geçmişini kontrol et
            let stack: string[] = [];
            try {
              stack = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]') : [];
            } catch { stack = []; }

            const lastSafeStop = stack[stack.length - 1];

            if (lastSafeStop) {
              // Eğer bir durak geçmişi varsa (Home, Kategori vb.) oraya git
              router.push(lastSafeStop, { scroll: false });
            } else if (subCategory && mainCategory && subCategory.slug !== mainCategory.slug) {
              router.push(`/category/${mainCategory.slug}/${subCategory.slug}`, { scroll: false })
            } else if (mainCategory) {
              router.push(`/category/${mainCategory.slug}`, { scroll: false })
            } else {
              router.push('/', { scroll: false }) // Tam fallback
            }
          }}

          className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery (Premium) */}
          <div className="sticky top-24 self-start z-10">
            <div className="relative group">
              <ImageGallery
                key={product.id}
                images={images}
                productName={product.name}
                slug={product.slug || product.name} // Fallback for 3D model detection
                modelType={mainCategory?.metadata?.model_type}
              />
              {/* 3D Experience Vurgusu (Hava Perdesi ise) */}
              {topicSlug === 'hava-perdesi' && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md border border-primary-navy/20 px-3 py-2 rounded-full shadow-hvac flex items-center space-x-2 animate-pulse-subtle">
                    <div className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-navy opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-navy"></span>
                    </div>
                    <span className="text-[10px] font-bold text-primary-navy uppercase tracking-widest">
                      {t('pdp.actions.interactive3D')}
                    </span>
                  </div>
                </div>
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
              <span className="text-xs px-2 py-1 rounded bg-light-gray text-steel-gray">{t('pdp.model')}: {product.model_code ?? product.sku}</span>
            </div>

            {/* SKU & Status */}
            <div className="flex items-center space-x-4">
              <span className="text-steel-gray">
                SKU: <span className="font-medium">{product.sku}</span>
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
              {mainCategory?.metadata?.hide_price ? (
                <span className="text-lg text-industrial-gray font-normal">Fiyat Teklifi Alın</span>
              ) : (
                <>
                  {formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                  <span className="text-sm text-steel-gray font-normal ml-2">
                    {t('pdp.vatIncluded')}
                  </span>
                </>
              )}
            </div>

            {/* Description */}


            {/* Related Guide */}
            {topicSlug && (
              <div className="pt-2">
                <div className="text-sm text-steel-gray">
                  <span className="font-medium text-industrial-gray">{t('pdp.relatedGuide')}:</span>
                  <Link
                    href={`/destek/konular/${topicSlug}`}
                    className="ml-2 text-primary-navy hover:text-secondary-blue underline"
                  >
                    {t(`knowledge.topics.${topicSlug}.title`)}
                  </Link>
                </div>
              </div>
            )}

            {/* Trust Signals (Standardized - Matches Cart/Checkout) */}
            <div className="bg-gradient-to-r from-light-gray to-white rounded-xl p-4 space-y-3 border border-light-gray/50">
              {/* Stock Urgency - ONLY if stock is low (≤3) */}
              {typeof product.stock_qty === 'number' && product.stock_qty > 0 && product.stock_qty <= 3 && (
                <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                  <span className="text-sm font-semibold text-orange-700">
                    Son {product.stock_qty} ürün! Hızlı karar verin.
                  </span>
                </div>
              )}

              {/* Shipping Guarantee - Consistent with Cart */}
              <div className="flex items-center space-x-3">
                <div className="bg-success-green/10 p-2 rounded-lg">
                  <Truck className="text-success-green" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-industrial-gray">Ücretsiz Kargo</p>
                  <p className="text-xs text-steel-gray">500 TL ve üzeri siparişlerde</p>
                </div>
              </div>

              {/* Secure Payment - iyzico Branding */}
              <div className="flex items-center space-x-3">
                <div className="bg-primary-navy/10 p-2 rounded-lg">
                  <Shield className="text-primary-navy" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-industrial-gray">Güvenli Ödeme</p>
                  <p className="text-xs text-steel-gray">iyzico altyapısı ile 256-bit SSL</p>
                </div>
              </div>

              {/* Warranty Badge */}
              <div className="flex items-center space-x-3">
                <div className="bg-secondary-blue/10 p-2 rounded-lg">
                  <Award className="text-secondary-blue" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-industrial-gray">2 Yıl Garanti</p>
                  <p className="text-xs text-steel-gray">Resmi distribütör garantisi</p>
                </div>
              </div>
            </div>

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
                {mainCategory?.metadata?.hide_price ? (
                  <button
                    onClick={() => setLeadOpen(true)}
                    className="flex-1 bg-industrial-gray hover:bg-primary-navy text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Settings size={18} />
                    <span>{t('pdp.techQuote') || 'Teklif Al'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                    className="flex-1 bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={18} />
                    <span>{t('pdp.addToCart')}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label={isWishlisted ? 'İstek listesinden çıkar' : 'İstek listesine ekle'}
                  aria-pressed={isWishlisted}
                  className={`p-2 sm:p-4 border-2 rounded-lg transition-colors ${isWishlisted
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

                  const whatsappLink = getStockInquiryLink(product.name, product.sku)
                  if (whatsappLink) {
                    return (
                      <a
                        href={whatsappLink}
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

            {/* PDF Generate Button */}
            <div className="mt-2 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-medium text-steel-gray/80 px-2">
                <Info size={14} className="text-secondary-blue" />
                <span>{t('pdp.actions.liveDataNotice')}</span>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full bg-primary-navy hover:bg-industrial-gray text-white shadow-md hover:shadow-lg font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Download size={22} className="animate-bounce-subtle" />
                )}
                <span className="text-lg">{isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'Teknik Ürün Föyü İndir (PDF)'}</span>
              </button>
            </div>

            {/* Value Props - DIFFERENT from Trust Signals above */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light-gray">
              <div className="text-center">
                <Phone className="text-primary-navy mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">{t('pdp.support247')}</p>
              </div>
              <div className="text-center">
                <Settings className="text-primary-navy mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">Teknik Destek</p>
              </div>
              <div className="text-center">
                <Award className="text-primary-navy mx-auto mb-2" size={24} />
                <p className="text-sm text-steel-gray">Hızlı Teslimat</p>
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
        className={`transition-all duration-300 z-30 bg-white/95 backdrop-blur-md border-b border-light-gray shadow-sm ${isNavSticky ? 'fixed top-14 md:top-16 left-0 right-0' : 'relative'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto py-3 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === section.id
                  ? 'bg-primary-navy text-white shadow-sm'
                  : 'text-steel-gray hover:text-primary-navy hover:bg-light-gray'
                  }`}
              >
                <section.icon size={16} />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions (only when sticky) */}
          {isNavSticky && (
            <div className="hidden lg:flex items-center space-x-4 pl-4 border-l border-light-gray ml-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-industrial-gray line-clamp-1 max-w-[200px]">{product.name}</span>
                <span className="text-xs text-primary-navy font-bold">{formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                className="bg-primary-navy hover:bg-secondary-blue text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>{t('pdp.addToCart')}</span>
              </button>
            </div>
          )}
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
            mpn: product.model_code ?? undefined,
            description: product.description || undefined,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'TRY',
              price: product.price || 0,
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
              { '@type': 'ListItem', position: 1, name: (typeof t === 'function' ? t('category.breadcrumbHome') : 'Ana Sayfa'), item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/` },
              ...(mainCategory ? [{ '@type': 'ListItem', position: 2, name: mainCategory.name, item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/category/${mainCategory.slug}` }] : []),
              ...(subCategory ? [{ '@type': 'ListItem', position: mainCategory ? 3 : 2, name: subCategory.name, item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/category/${mainCategory?.slug}/${subCategory.slug}` }] : []),
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
                      {/* Product Dictionary / Rich Description */}
                      <div className="space-y-6">
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h4 className="font-semibold text-industrial-gray mb-4 flex items-center">
                            <Info className="text-primary-navy mr-2" size={20} />
                            {t('pdp.labels.productDescription')}
                          </h4>
                          <RichTextRenderer content={product.description || t('pdp.descFallback')} />
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
                            <span className="font-medium text-industrial-gray">{product.model_code ?? product.sku}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-light-gray/50">
                            <span className="text-steel-gray">{t('pdp.statusLabel')}</span>
                            <span className={`font-medium ${product.status === 'active' ? 'text-success-green' : 'text-warning-orange'
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
                              {formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
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
                                {formatCurrency((product.price + (variant - 1) * 200), lang, { maximumFractionDigits: 0 })}
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
                        {/* Title already shown in navigation tab, no need for redundant header */}

                        {product.technical_specs ? (
                          <>
                            {(() => {
                              const groupedSpecs = groupTechnicalSpecs(product.technical_specs);

                              if (!groupedSpecs || Object.keys(groupedSpecs).length === 0) {
                                return (
                                  <div className="text-steel-gray italic">
                                    {t('pdp.labels.noSpecsAvailable')}
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-4">
                                  {Object.entries(groupedSpecs).map(([groupKey, group]) => {
                                    const isOpen = openSpecSections.includes(groupKey);
                                    const Icon = group.icon;

                                    return (
                                      <div key={groupKey} className="border border-light-gray/40 rounded-lg overflow-hidden shadow-sm">
                                        {/* Accordion Header */}
                                        <button
                                          onClick={() => toggleSpecSection(groupKey)}
                                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-air-blue/20 to-light-gray/30 hover:from-air-blue/30 hover:to-light-gray/40 transition-all"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <Icon size={22} className="text-primary-navy" />
                                            <span className="font-semibold text-industrial-gray">{group.label}</span>
                                            <span className="text-xs text-steel-gray">
                                              ({Object.keys(group.specs).length} özellik)
                                            </span>
                                          </div>
                                          <ChevronDown
                                            size={22}
                                            className={`text-primary-navy transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                              }`}
                                          />
                                        </button>

                                        {/* Accordion Content */}
                                        <div
                                          className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                            } overflow-hidden`}
                                        >
                                          <div className="p-4 bg-white space-y-2">
                                            {Object.entries(group.specs)
                                              .sort(([keyA], [keyB]) => {
                                                // Use standard sort order
                                                const weightA = SPEC_SORT_ORDER[keyA] || 99;
                                                const weightB = SPEC_SORT_ORDER[keyB] || 99;

                                                if (weightA !== weightB) {
                                                  return weightA - weightB;
                                                }

                                                // Fallback for non-listed items: Min -> Max -> Alpha
                                                const a = keyA.toLowerCase();
                                                const b = keyB.toLowerCase();

                                                const isMinA = a.includes('min') || a.includes('1st');
                                                const isMaxA = a.includes('max');

                                                const isMinB = b.includes('min') || b.includes('1st');
                                                const isMaxB = b.includes('max');

                                                if (isMinA && !isMinB) return -1;
                                                if (!isMinA && isMinB) return 1;
                                                if (isMaxA && !isMaxB) return 1;
                                                if (!isMaxA && isMaxB) return -1;

                                                return keyA.localeCompare(keyB);
                                              })
                                              .map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center py-3 border-b border-light-gray/50 last:border-0 group hover:bg-air-blue/10 transition-colors px-2 rounded">
                                                  <span className="text-steel-gray font-medium">{translateSpecKey(key)}</span>
                                                  <span className="font-bold text-industrial-gray text-right">
                                                    {formatSpecValue(key, value)}
                                                  </span>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="text-steel-gray italic">
                            {t('pdp.labels.noSpecsAvailable')}
                          </div>
                        )}
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
                            <button
                              onClick={handleDownloadPdf}
                              disabled={isGeneratingPdf}
                              className="w-full bg-primary-navy hover:bg-industrial-gray text-white shadow-soft font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                              {isGeneratingPdf ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              ) : (
                                <Download size={22} />
                              )}
                              <span className="text-lg">{isGeneratingPdf ? 'Hazırlanıyor...' : t('pdp.actions.downloadBrochure')}</span>
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





