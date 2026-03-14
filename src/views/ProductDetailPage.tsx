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
import toast from 'react-hot-toast'
import { generateProductDatasheet } from '../lib/pdfGenerator'
import { 
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Star,
  ChevronRight,
  FileText,
  Download,
  Award,
  Ruler,
  Settings,
  Info,
  ChevronDown,
  FolderPlus,
  Loader2
} from 'lucide-react'
import ImageGallery from '../components/ImageGallery'
import { RichTextRenderer } from '../components/products/RichTextRenderer'
import { AddToProjectModal } from '../components/products'
import { useProjectLists } from '../hooks/useProjectLists'
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
  // Clean potential 'cc' suffix from URL id for consistency with database IDs
  const id = (params?.id as string)?.replace(/cc$/, '')
  const router = useRouter()
  const { addToCart } = useCart()
  const { refreshProjects } = useProjectLists()
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialProduct)
  const [mainCategory, setMainCategory] = useState<Category | null>(null)
  const [subCategory, setSubCategory] = useState<Category | null>(null)
  const [images, setImages] = useState<{ path: string; alt?: string | null }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('genel')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isNavSticky, setIsNavSticky] = useState(false)
  const [openSpecSections, setOpenSpecSections] = useState<string[]>(['performance'])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navTriggerRef = useRef<HTMLDivElement>(null)

  const toggleSpecSection = (sectionKey: string) => {
    setOpenSpecSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(k => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      // If we already have the correct product (from initialProduct or previous fetch), don't fetch again
      if (product && (product.id === id || product.sku === id || product.slug === id)) {
        return
      }

      if (initialProduct && (id === initialProduct.id || id === initialProduct.sku || id === initialProduct.slug)) {
        setProduct(initialProduct)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const productData = await getProductBySlugOrId(id)
        if (!productData) {
          setProduct(null)
          return
        }
        setProduct(productData)
        try {
          const { data: imgs } = await supabase
            .from('product_images')
            .select('path, alt, sort_order')
            .eq('product_id', productData.id)
            .order('sort_order', { ascending: true })
          const list = (imgs || []) as { path: string; alt?: string | null }[]
          setImages(list)
        } catch { }
        const cats = await getCategories()
        if (productData.category_id) {
          const mc = cats.find(c => c.id === productData.category_id) || null
          setMainCategory(mc)
        }
        if (productData.subcategory_id) {
          const sc = cats.find(c => c.id === productData.subcategory_id) || null
          setSubCategory(sc)
        }
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
  }, [id, initialProduct, product]) // Included product to satisfy lint, but fetch logic is guarded

  useEffect(() => {
    const handleScroll = () => {
      if (navTriggerRef.current) {
        const triggerTop = navTriggerRef.current.offsetTop
        const scrollY = window.scrollY
        setIsNavSticky(scrollY > (triggerTop - 80))
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [product])

  useEffect(() => {
    const handleScrollSpy = () => {
      const navEl = document.getElementById('pdp-sticky-nav')
      const headerOffset = navEl ? navEl.offsetHeight + 120 : 200
      const scrollPosition = window.scrollY + headerOffset
      const sectionOffsets = Object.entries(sectionRefs.current).map(([id, ref]) => {
        if (!ref) return null
        return { id, top: ref.offsetTop, bottom: ref.offsetTop + ref.offsetHeight }
      }).filter(Boolean) as { id: string, top: number, bottom: number }[]
      for (const section of sectionOffsets) {
        if (scrollPosition >= section.top && scrollPosition < section.bottom) {
          setActiveSection(section.id)
          return
        }
      }
    }
    window.addEventListener('scroll', handleScrollSpy)
    handleScrollSpy()
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [product, activeSection])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const navEl = document.getElementById('pdp-sticky-nav')
      const currentNavHeight = navEl ? navEl.offsetHeight : 0
      const extraGap = 84
      const y = element.getBoundingClientRect().top + window.pageYOffset - currentNavHeight - extraGap
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleAddToCart = () => { if (product) addToCart(product, quantity) }

  const handleDownloadPdf = async () => {
    if (!product || isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      await generateProductDatasheet(
        product, 
        product.image_url || undefined,
        translateSpecKey,
        lang
      )
      toast.success(t('pdp.messages.pdfStarted') || 'PDF üretiliyor...')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error(t('pdp.errors.pdfFailed') || 'PDF üretilemedi.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    if (navigator.share && product) {
      try {
        await navigator.share({ title: product.name, text: `${product.brand} - ${product.name}`, url: window.location.href })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('Share error:', err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t('pdp.shareCopied') || 'Link kopyalandı!')
    }
  }

  const { t, lang } = useI18n()

  const sections = [
    { id: 'genel', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'olcuiler', title: t('pdp.sections.specs') || 'Teknik Özellikler', icon: Ruler, bgClass: 'bg-white' },
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-slate-50/50' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-slate-50/50' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-slate-50/50' }
  ]

  const mapSlugToTopic = (slug?: string | null): string | null => {
    if (!slug) return null
    const s = slug.toLowerCase()
    if (s.includes('hava-perde')) return 'hava-perdesi'
    if (s.includes('jet-fan')) return 'jet-fan'
    if (s.includes('isi-geri-kazanim') || s.includes('hrv')) return 'hrv'
    return null
  }

  const topicSlug = mapSlugToTopic(subCategory?.slug) || mapSlugToTopic(mainCategory?.slug)
  const [origin, setOrigin] = useState('')
  useEffect(() => { if (typeof window !== 'undefined') setOrigin(window.location.origin) }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy mx-auto mb-4" />
          <p className="text-steel-gray text-xs font-bold uppercase tracking-widest">{t('pdp.loading')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="text-center">
          <h1 className="text-xl font-bold text-industrial-gray mb-4">{t('pdp.productNotFound')}</h1>
          <Link href="/" className="text-primary-navy hover:text-secondary-blue font-bold text-sm uppercase tracking-widest">
            {t('pdp.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  const canonicalUrl = `${origin}/products/${product.id}`
  const metaDesc = product.description || `${product.brand} ${product.name} ürünü hakkında detaylar.`

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Seo title={`${product.brand} ${product.name} | VentHub`} description={metaDesc} canonical={canonicalUrl} />
      
      {/* Seamless Integrated Breadcrumb */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <nav className="flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-steel-gray/60">
            <Link href="/" className="hover:text-primary-navy transition-colors">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={10} className="flex-shrink-0" />
            {mainCategory && (
              <>
                <Link href={`/category/${mainCategory.slug}`} className="hover:text-primary-navy transition-colors">
                  {mainCategory.name}
                </Link>
                {subCategory && subCategory.slug !== mainCategory.slug && (
                  <>
                    <ChevronRight size={10} className="flex-shrink-0" />
                    <Link href={`/category/${mainCategory.slug}/${subCategory.slug}`} className="hover:text-primary-navy transition-colors">
                      {subCategory.name}
                    </Link>
                  </>
                )}
                <ChevronRight size={10} className="flex-shrink-0" />
              </>
            )}
            <span className="text-industrial-gray truncate max-w-[150px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button - Lighter Style */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') sessionStorage.setItem('vh_is_pop', 'true');
            let stack: string[] = [];
            try { stack = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]') : []; } catch { stack = []; }
            const lastSafeStop = stack[stack.length - 1];
            if (lastSafeStop) { router.push(lastSafeStop, { scroll: false }); }
            else if (subCategory && mainCategory && subCategory.slug !== mainCategory.slug) { router.push(`/category/${mainCategory.slug}/${subCategory.slug}`, { scroll: false }) }
            else if (mainCategory) { router.push(`/category/${mainCategory.slug}`, { scroll: false }) }
            else { router.push('/', { scroll: false }) }
          }}
          className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-6 sm:mb-8 transition-all group font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Image Gallery (60% width on large screens) */}
          <div className="lg:col-span-7 xl:col-span-8 sticky top-24 self-start z-10">
            <div className="relative group bg-white rounded-3xl border border-light-gray/50 shadow-sm overflow-hidden p-2">
              <ImageGallery
                key={product.id}
                images={images}
                productName={product.name}
                slug={product.slug || product.name}
                modelType={mainCategory?.metadata?.model_type}
              />
              {topicSlug === 'hava-perdesi' && (
                <div className="absolute top-6 left-6 z-20 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md border border-primary-navy/20 px-3 py-2 rounded-full shadow-hvac flex items-center space-x-2 animate-pulse-subtle">
                    <div className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-navy opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-navy"></span>
                    </div>
                    <span className="text-[9px] font-bold text-primary-navy uppercase tracking-widest">
                      {t('pdp.actions.interactive3D')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info (40% width on large screens) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            {/* Brand & Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <BrandIcon brand={product.brand} className="w-8 h-8" />
                <div className="flex flex-col">
                  <span className="text-secondary-blue font-bold text-xs tracking-tight uppercase">{product.brand}</span>
                  <span className="text-steel-gray text-[8px] font-medium tracking-[0.2em]">{t('pdp.officialDistributor') || 'OFFICIAL DISTRIBUTOR'}</span>
                </div>
              </div>
              {product.is_featured && (
                <div className="bg-gold-accent/10 text-gold-accent px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center space-x-1 border border-gold-accent/20">
                  <Star size={10} fill="currentColor" />
                  <span>{t('pdp.featured') || 'ÖNE ÇIKAN'}</span>
                </div>
              )}
            </div>

            {/* Product Name - Refined Size */}
            <h1 className="text-2xl sm:text-3xl font-black text-industrial-gray leading-[1.1] mb-4 tracking-tight">
              {product.name}
            </h1>

            {/* Quick Specs Jump - Accessibility Feature */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {sections.slice(0, 4).map((s) => (
                <button
                  key={`jump-${s.id}`}
                  onClick={() => scrollToSection(s.id)}
                  className="px-3 py-1.5 bg-air-blue/30 hover:bg-air-blue text-primary-navy rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-secondary-blue/10"
                  aria-label={`${s.title} ${t('common.scrollTo') || 'bölümüne git'}`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Price Area - Elegant & Technical */}
            <div className="mb-6 p-5 bg-white rounded-2xl border border-light-gray shadow-sm relative overflow-hidden group">
              <div className="flex flex-col relative z-10">
                <span className="text-[9px] font-bold text-steel-gray uppercase tracking-[0.2em] mb-1 opacity-60">{t('pdp.priceAvailability') || 'Price & Availability'}</span>
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <div className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">
                      {mainCategory?.metadata?.hide_price ? (
                        <span className="text-xl text-industrial-gray font-bold">{t('common.requestQuote') || 'Teklif İste'}</span>
                      ) : (
                        formatCurrency(product.price, lang, { maximumFractionDigits: 0 })
                      )}
                    </div>
                    {!mainCategory?.metadata?.hide_price && (
                      <span className="text-[9px] font-bold text-steel-gray uppercase mt-1">
                        {t('pdp.vatIncluded')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${typeof product.stock_qty === 'number' && product.stock_qty > 0 ? 'bg-success-green/10 text-success-green border border-success-green/20' : 'bg-warning-orange/10 text-warning-orange border border-warning-orange/20'}`}>
                      <div className={`w-1 h-1 rounded-full ${typeof product.stock_qty === 'number' && product.stock_qty > 0 ? 'bg-success-green' : 'bg-warning-orange'}`} />
                      <span>{typeof product.stock_qty === 'number' && product.stock_qty > 0 ? t('pdp.inStock') : t('pdp.outOfStock')}</span>
                    </div>
                    <span className="text-[9px] text-steel-gray font-bold mt-1.5 opacity-50 uppercase tracking-widest">SKU: {product.sku}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Area - Compact & Unified */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-light-gray p-5 space-y-5">
                {/* Quantity Control */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-industrial-gray uppercase tracking-widest">{t('pdp.qty')}</span>
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-light-gray/50">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-lg font-bold text-industrial-gray" aria-label={t('common.decrease') || 'Azalt'}>-</button>
                    <span className="w-10 text-center font-black text-primary-navy text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-lg font-bold text-industrial-gray" aria-label={t('common.increase') || 'Artır'}>+</button>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col gap-2">
                  {mainCategory?.metadata?.hide_price ? (
                    <button
                      onClick={() => setLeadOpen(true)}
                      className="w-full bg-industrial-gray hover:bg-primary-navy text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-3 group"
                    >
                      <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                      <span className="text-xs uppercase tracking-[0.15em]">{t('pdp.techQuote') || 'Teklif Al'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                      className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-primary-navy/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                    >
                      <ShoppingCart size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span className="text-xs uppercase tracking-[0.15em]">{t('pdp.addToCart')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="w-full bg-white border-2 border-primary-navy/10 hover:border-primary-navy text-primary-navy font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
                  >
                    <FolderPlus size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-[0.15em]">{t('pdp.actions.addToProject') || 'Proje Listesine Ekle'}</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 border rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-light-gray text-steel-gray hover:border-red-500 hover:text-red-500'
                      }`}
                    aria-label={isWishlisted ? t('pdp.actions.removeFromWishlist') : t('pdp.actions.addToWishlist')}
                  >
                    <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    <span>{t('pdp.actions.favorite') || 'Favori'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 border border-light-gray text-steel-gray hover:border-primary-navy hover:text-primary-navy rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all"
                    aria-label={t('common.share') || 'Paylaş'}
                  >
                    <Share2 size={14} />
                    <span>{t('pdp.actions.share') || 'Paylaş'}</span>
                  </button>
                </div>
              </div>

              {/* Trust Signals - Lighter Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Truck className="text-success-green mb-1.5" size={18} />
                  <p className="text-[8px] font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.freeShipping') || 'Ücretsiz Kargo'}</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Shield className="text-primary-navy mb-1.5" size={18} />
                  <p className="text-[8px] font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.securePayment') || 'Güvenli Ödeme'}</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Award className="text-secondary-blue mb-1.5" size={18} />
                  <p className="text-[8px] font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.warranty') || '2 Yıl Garanti'}</p>
                </div>
              </div>

              {/* Quick Tech PDF Link */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full bg-slate-900 hover:bg-primary-navy text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center space-x-3 text-left">
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider">{t('pdp.labels.technicalDatasheet') || 'TEKNİK ÜRÜN FÖYÜ'}</span>
                    <span className="text-[8px] text-white/50 font-medium uppercase tracking-[0.2em]">DATASHEET (PDF)</span>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddToProjectModal 
        product={product} 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />

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
            description: metaDesc,
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

      <div ref={navTriggerRef} className="h-0" />

      {/* Section Navigation - Airy Integrated Design */}
      <div
        id="pdp-sticky-nav"
        className={`transition-all duration-500 z-[40] bg-white/80 backdrop-blur-xl border-b border-light-gray/50 ${isNavSticky ? 'fixed top-[56px] md:top-[80px] left-0 right-0 shadow-lg shadow-primary-navy/5' : 'relative mt-8 sm:mt-12'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto py-3 sm:py-4 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all ${activeSection === section.id
                  ? 'bg-primary-navy text-white shadow-hvac scale-105'
                  : 'text-industrial-gray/60 hover:text-primary-navy hover:bg-air-blue/50'
                  }`}
              >
                <section.icon size={12} className={activeSection === section.id ? 'animate-pulse' : ''} />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>

          {isNavSticky && (
            <div className="hidden lg:flex items-center space-x-3 pl-6 border-l border-light-gray ml-4 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-industrial-gray line-clamp-1 max-w-[120px] uppercase tracking-tight">{product.name}</span>
                <span className="text-[10px] text-primary-navy font-black tracking-widest">
                  {mainCategory?.metadata?.hide_price ? 'TEKLİF AL' : formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                className="bg-primary-navy hover:bg-secondary-blue text-white text-[9px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
              >
                <ShoppingCart size={14} />
                <span>{t('pdp.addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0">
        {sections.map((section) => {
          const IconComponent = section.icon
          return (
            <section
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el }}
              data-section={section.id}
              className={`${section.bgClass} py-12 sm:py-20 transition-all duration-500 border-b border-light-gray/20 last:border-0`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4 mb-10 sm:mb-12">
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-sm">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-industrial-gray tracking-tight uppercase">
                      {section.title}
                    </h2>
                    <div className="h-0.5 w-8 bg-secondary-blue mt-1.5 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  {section.id === 'genel' && (
                    <>
                      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray/50 shadow-sm hover:shadow-md transition-all">
                          <h4 className="font-black text-industrial-gray mb-6 flex items-center text-[10px] uppercase tracking-[0.2em] opacity-60">
                            <Info className="text-primary-navy mr-2.5" size={16} />
                            {t('pdp.labels.productDescription')}
                          </h4>
                          <div className="prose prose-slate max-w-none text-steel-gray leading-relaxed text-sm font-medium">
                            <RichTextRenderer content={product.description || t('pdp.descFallback')} />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray/50 shadow-sm sticky top-36">
                          <h4 className="font-black text-industrial-gray mb-6 text-[10px] uppercase tracking-[0.2em] opacity-60">Quick Details</h4>
                          <div className="space-y-4">
                            {[
                              { label: t('pdp.brand'), value: product.brand },
                              { label: t('pdp.model'), value: product.model_code ?? product.sku },
                              { label: t('pdp.labels.category'), value: mainCategory?.name || '-' }
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-3 border-b border-light-gray/30 group">
                                <span className="text-[10px] font-bold text-steel-gray uppercase tracking-widest">{item.label}</span>
                                <span className="text-xs font-black text-industrial-gray group-hover:text-primary-navy transition-colors">{item.value}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center py-4 px-4 bg-slate-50 rounded-xl mt-4">
                              <span className="text-[10px] font-bold text-steel-gray uppercase tracking-[0.2em]">Listing Price</span>
                              <span className="text-lg font-black text-primary-navy">
                                {mainCategory?.metadata?.hide_price ? 'TEKLİF ALIN' : formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'modeller' && (
                    <div className="col-span-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((variant) => (
                          <div key={variant} className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                            <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center border border-light-gray/30 group-hover:bg-air-blue/10 transition-all">
                              <BrandIcon brand={product.brand} className="scale-125 grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <h4 className="font-black text-industrial-gray mb-1 text-sm uppercase tracking-tight">{product.sku}-{variant}</h4>
                            <p className="text-steel-gray text-[10px] font-medium mb-4">{t('pdp.variantDetails') || 'Teknik özelliklerde özelleştirilmiş model varyantı.'}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-light-gray/50">
                              <div className="text-primary-navy font-black text-sm">{formatCurrency((product.price + (variant - 1) * 200), lang, { maximumFractionDigits: 0 })}</div>
                              <button className="p-1.5 bg-slate-100 hover:bg-primary-navy text-industrial-gray hover:text-white rounded-lg transition-all" aria-label="Sonraki"><ChevronRight size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.id === 'olcuiler' && (
                    <div className="col-span-full bg-white rounded-3xl p-6 sm:p-10 border border-light-gray shadow-sm">
                      {product.technical_specs ? (
                        <div className="space-y-4">
                          {Object.entries(groupTechnicalSpecs(product.technical_specs) || {}).map(([groupKey, group]) => {
                            const isOpen = openSpecSections.includes(groupKey);
                            const Icon = group.icon;
                            return (
                              <div key={groupKey} className="border border-light-gray/40 rounded-2xl overflow-hidden">
                                <button onClick={() => toggleSpecSection(groupKey)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-air-blue/10 transition-all group">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1.5 bg-white rounded-lg shadow-xs group-hover:shadow-sm border border-light-gray/50"><Icon size={18} className="text-primary-navy" /></div>
                                    <span className="font-black text-industrial-gray text-xs uppercase tracking-widest">{group.label}</span>
                                  </div>
                                  <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-navy text-white' : 'bg-white text-primary-navy'}`}><ChevronDown size={16} /></div>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                  <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
                                    {Object.entries(group.specs).sort(([kA], [kB]) => (SPEC_SORT_ORDER[kA] || 99) - (SPEC_SORT_ORDER[kB] || 99)).map(([key, val]) => (
                                      <div key={key} className="flex justify-between items-center py-2.5 border-b border-light-gray/20 last:border-0 md:last:border-b group hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                        <span className="text-[10px] font-bold text-steel-gray uppercase tracking-wider">{translateSpecKey(key)}</span>
                                        <span className="text-xs font-black text-industrial-gray">{formatSpecValue(key, val)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="text-steel-gray italic font-medium py-10 text-center text-xs uppercase tracking-widest">{t('pdp.labels.noSpecsAvailable')}</div>}
                    </div>
                  )}

                  {section.id === 'diyagramlar' && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-sm">
                        <h4 className="font-black text-industrial-gray mb-6 text-[10px] uppercase tracking-[0.2em] opacity-60">{t('pdp.diagramsExtra.technicalDiagrams')}</h4>
                        <div className="space-y-4">
                          {['mounting', 'electrical'].map(type => (
                            <div key={type} className="group relative aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-light-gray hover:border-primary-navy/30 transition-all cursor-pointer overflow-hidden">
                              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                <div className="p-2.5 bg-primary-navy text-white rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"><Download size={20} /></div>
                              </div>
                              <div className="text-center">
                                <FileText size={28} className="text-primary-navy/40 mx-auto mb-2" />
                                <p className="text-industrial-gray font-black text-[10px] uppercase tracking-widest">{t(`pdp.diagramsExtra.${type}`)}</p>
                                <p className="text-[8px] text-steel-gray font-bold mt-1 uppercase tracking-tighter">PDF DATASHEET</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-sm">
                        <h4 className="font-black text-industrial-gray mb-6 text-[10px] uppercase tracking-[0.2em] opacity-60">{t('pdp.diagramsExtra.threeDViews')}</h4>
                        <div className="space-y-4">
                          {[ { icon: Settings, label: 'view3DModel', sub: 'interactiveModel' }, { icon: Ruler, label: 'dimensionedDrawing', sub: 'CAD/DWG AVAILABLE' } ].map((item, i) => (
                            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-light-gray/50 flex items-center space-x-5 group hover:bg-white hover:shadow-md transition-all">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary-navy group-hover:text-white transition-all"><item.icon size={22} /></div>
                              <div>
                                <p className="text-xs font-black text-industrial-gray uppercase tracking-tight">{t(`pdp.diagramsExtra.${item.label}`)}</p>
                                <p className="text-[9px] text-steel-gray font-bold uppercase tracking-widest mt-1">{item.sub.startsWith('CAD') ? item.sub : t(`pdp.diagramsExtra.${item.sub}`)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'dokumanlar' && (
                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['installationGuide', 'userManual', 'maintenanceManual', 'safetyInfo', 'warrantyTerms', 'technicalSpecsDoc'].map((doc, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-light-gray shadow-sm hover:shadow-md transition-all group text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-air-blue/20 transition-all"><FileText size={32} className="text-primary-navy/40" /></div>
                          <h4 className="font-black text-industrial-gray uppercase tracking-tight text-xs mb-4 min-h-[2rem]">{t(`pdp.docs.${doc}`)}</h4>
                          <button className="w-full bg-slate-100 hover:bg-primary-navy text-industrial-gray hover:text-white py-3 px-4 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center space-x-2">
                            <Download size={14} /> <span>{t('pdp.actions.download')}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'pdf' && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                      {['productCatalog', 'technicalBrochure'].map(type => (
                        <div key={type} className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-sm">
                          <h4 className="font-black text-industrial-gray mb-6 text-[10px] uppercase tracking-[0.2em] opacity-60">{t(`pdp.docs.${type}`)}</h4>
                          <div className="aspect-[4/3] bg-slate-50 rounded-xl mb-6 flex items-center justify-center border border-light-gray/30"><Download size={40} className="text-primary-navy/20" /></div>
                          <button onClick={type === 'technicalBrochure' ? handleDownloadPdf : undefined} className="w-full bg-slate-900 hover:bg-primary-navy text-white py-3.5 px-6 rounded-xl transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                            <Download size={18} /> <span>{t(`pdp.actions.download${type === 'productCatalog' ? 'Catalog' : 'Brochure'}`)}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'sertifikalar' && (
                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['ceCertificate', 'iso9001', 'tseCertificate', 'energyStar', 'ulCertificate', 'ecoFriendly'].map((cert, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-light-gray shadow-sm text-center">
                          <div className="bg-slate-50 rounded-2xl p-5 mb-5 group-hover:bg-air-blue/10 transition-all"><Award size={36} className="text-primary-navy/30 mx-auto" /></div>
                          <h4 className="font-black text-industrial-gray uppercase tracking-tight text-xs mb-3">{t(`pdp.cert.${cert}`)}</h4>
                          <div className="text-[9px] text-steel-gray space-y-1 font-bold uppercase tracking-widest opacity-60">
                            <p>{t('pdp.certLabels.certificateNo')}: {cert.toUpperCase()}-2024</p>
                            <p>{t('pdp.certLabels.standard')}: ISO/EN-STD</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {relatedProducts.length > 0 && (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-industrial-gray mb-10 uppercase tracking-tight">
                {t('pdp.relatedProducts')}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => <ProductCard key={p.id} product={p} compact />)}
              </div>
            </>
          )}
        </div>
      </div>
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} productName={product.name} productId={product.id} />
    </div>
  )
}

export default ProductDetailPage
