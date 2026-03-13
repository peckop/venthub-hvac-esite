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
  const id = params?.id as string
  const router = useRouter()
  const { addToCart } = useCart()
  const { refreshProjects } = useProjectLists()
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
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
    refreshProjects()
  }, [refreshProjects])

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
        setIsNavSticky(scrollY > (triggerTop - 80))
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
      const headerOffset = navEl ? navEl.offsetHeight + 120 : 200 // Adjusted for global header

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
      const extraGap = 84 // Account for sticky header
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
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-air-blue/30' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-light-gray/50' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-light-gray/50' } // Moved to end per user request
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
          <p className="text-steel-gray font-medium">{t('pdp.loading')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('pdp.productNotFound')}</h1>
          <Link href="/" className="text-primary-navy hover:text-secondary-blue font-bold">
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
      
      {/* Dynamic Breadcrumb & Navigation Harmony */}
      <div className="bg-light-gray/50 border-b border-light-gray/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-hide pb-1 sm:pb-0">
            <Link href="/" className="text-steel-gray hover:text-primary-navy transition-colors">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={14} className="text-steel-gray/60 flex-shrink-0" />
            {mainCategory && (
              <>
                <Link href={`/category/${mainCategory.slug}`} className="text-steel-gray hover:text-primary-navy transition-colors">
                  {mainCategory.name}
                </Link>
                {subCategory && subCategory.slug !== mainCategory.slug && (
                  <>
                    <ChevronRight size={14} className="text-steel-gray/60 flex-shrink-0" />
                    <Link href={`/category/${mainCategory.slug}/${subCategory.slug}`} className="text-steel-gray hover:text-primary-navy transition-colors">
                      {subCategory.name}
                    </Link>
                  </>
                )}
                <ChevronRight size={14} className="text-steel-gray/60 flex-shrink-0" />
              </>
            )}
            <span className="text-industrial-gray font-bold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back Button - Akıllı: ürünün kategorisine yönlendir */}
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
          className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-8 transition-all group font-bold text-sm"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Image Gallery (Premium) */}
          <div className="sticky top-24 self-start z-10">
            <div className="relative group">
              <ImageGallery
                key={product.id}
                images={images}
                productName={product.name}
                slug={product.slug || product.name}
                modelType={mainCategory?.metadata?.model_type}
              />
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
          <div className="flex flex-col">
            {/* Brand & Featured Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BrandIcon brand={product.brand} className="w-10 h-10" />
                <div className="flex flex-col">
                  <span className="text-secondary-blue font-bold text-sm tracking-wide uppercase">{product.brand}</span>
                  <span className="text-steel-gray text-[10px] font-medium tracking-widest">OFFICIAL DISTRIBUTOR</span>
                </div>
              </div>
              {product.is_featured && (
                <div className="bg-gold-accent text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center space-x-1.5 shadow-sm tracking-wider">
                  <Star size={12} fill="currentColor" />
                  <span>{t('pdp.featured') || 'ÖNE ÇIKAN'}</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl font-black text-industrial-gray leading-tight mb-4">
              {product.name}
            </h1>

            {/* SKU & Quick technical chips */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center px-3 py-1.5 bg-light-gray rounded-lg border border-light-gray/50">
                <span className="text-[10px] font-bold text-steel-gray uppercase tracking-widest mr-2">SKU:</span>
                <span className="text-sm font-bold text-industrial-gray">{product.sku}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-light-gray rounded-lg border border-light-gray/50">
                <span className="text-[10px] font-bold text-steel-gray uppercase tracking-widest mr-2">MODEL:</span>
                <span className="text-sm font-bold text-industrial-gray">{product.model_code ?? product.sku}</span>
              </div>
              {(() => {
                const inStock = typeof product.stock_qty === 'number' ? product.stock_qty > 0 : product.status !== 'out_of_stock'
                return (
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${inStock ? 'bg-success-green/10 text-success-green border border-success-green/20' : 'bg-warning-orange/10 text-warning-orange border border-warning-orange/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-success-green' : 'bg-warning-orange'}`} />
                    <span>{inStock ? t('pdp.inStock') : t('pdp.outOfStock')}</span>
                  </div>
                )
              })()}
            </div>

            {/* Price Area */}
            <div className="mb-8 p-6 bg-gradient-to-br from-light-gray/30 to-white rounded-2xl border border-light-gray/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-navy/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] font-bold text-steel-gray uppercase tracking-[0.2em] mb-1">Current Price</span>
                <div className="flex items-baseline space-x-2">
                  <div className="text-4xl sm:text-5xl font-black text-primary-navy tracking-tighter">
                    {mainCategory?.metadata?.hide_price ? (
                      <span className="text-2xl text-industrial-gray">{t('common.requestQuote') || 'Teklif İste'}</span>
                    ) : (
                      formatCurrency(product.price, lang, { maximumFractionDigits: 0 })
                    )}
                  </div>
                  {!mainCategory?.metadata?.hide_price && (
                    <span className="text-xs font-bold text-steel-gray uppercase bg-white px-2 py-1 rounded border border-light-gray/80 shadow-xs">
                      {t('pdp.vatIncluded')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Related Guide */}
            {topicSlug && (
              <div className="mb-8 p-4 bg-air-blue/20 rounded-xl border border-secondary-blue/10 flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Info className="text-primary-navy" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary-navy uppercase tracking-wider mb-0.5">{t('pdp.relatedGuide')}</p>
                  <Link href={`/destek/konular/${topicSlug}`} className="text-sm font-semibold text-industrial-gray hover:text-secondary-blue underline underline-offset-4 decoration-secondary-blue/30">
                    {t(`knowledge.topics.${topicSlug}.title`)}
                  </Link>
                </div>
              </div>
            )}

            {/* Action Buttons Area */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 space-y-6">
                {/* Quantity Control */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-industrial-gray uppercase tracking-widest">{t('pdp.qty')}</span>
                  <div className="flex items-center bg-light-gray/50 rounded-xl p-1 border border-light-gray/50">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-xl font-bold text-industrial-gray">-</button>
                    <span className="w-12 text-center font-black text-primary-navy text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-xl font-bold text-industrial-gray">+</button>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {mainCategory?.metadata?.hide_price ? (
                    <button
                      onClick={() => setLeadOpen(true)}
                      className="flex-[2] bg-industrial-gray hover:bg-primary-navy text-white font-black py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-3 group"
                    >
                      <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                      <span className="uppercase tracking-widest">{t('pdp.techQuote') || 'Teklif Al'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                      className="flex-[2] bg-primary-navy hover:bg-secondary-blue text-white font-black py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-primary-navy/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                    >
                      <ShoppingCart size={20} className="group-hover:translate-x-1 transition-transform" />
                      <span className="uppercase tracking-widest">{t('pdp.addToCart')}</span>
                    </button>
                  )}
                  
                  {/* PROJECT LIST BUTTON - Professional Feature */}
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex-1 bg-white border-2 border-primary-navy/10 hover:border-primary-navy text-primary-navy font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 group active:scale-95"
                    title="Proje Listesine Ekle"
                  >
                    <FolderPlus size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="sm:hidden lg:inline text-xs uppercase tracking-widest">Proje Listesi</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 border rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-light-gray text-steel-gray hover:border-red-500 hover:text-red-500'
                      }`}
                  >
                    <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    <span>{isWishlisted ? 'Favorilerimde' : 'Favorilere Ekle'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 border border-light-gray text-steel-gray hover:border-primary-navy hover:text-primary-navy rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    <Share2 size={16} />
                    <span>{t('common.share') || 'Paylaş'}</span>
                  </button>
                </div>
              </div>

              {/* Trust & Logistics Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-light-gray/20 rounded-xl border border-light-gray/50 text-center">
                  <Truck className="text-success-green mb-2" size={24} />
                  <p className="text-[10px] font-black text-industrial-gray uppercase tracking-tighter mb-1">Ücretsiz Kargo</p>
                  <p className="text-[9px] text-steel-gray">500 TL Üzeri</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-light-gray/20 rounded-xl border border-light-gray/50 text-center">
                  <Shield className="text-primary-navy mb-2" size={24} />
                  <p className="text-[10px] font-black text-industrial-gray uppercase tracking-tighter mb-1">Güvenli Ödeme</p>
                  <p className="text-[9px] text-steel-gray">256-bit SSL</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-light-gray/20 rounded-xl border border-light-gray/50 text-center">
                  <Award className="text-secondary-blue mb-2" size={24} />
                  <p className="text-[10px] font-black text-industrial-gray uppercase tracking-tighter mb-1">2 Yıl Garanti</p>
                  <p className="text-[9px] text-steel-gray">Resmi Distribütör</p>
                </div>
              </div>

              {/* PDF & Documentation Action */}
              <div className="p-1 bg-gradient-to-r from-primary-navy via-secondary-blue to-primary-navy rounded-2xl shadow-lg">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full bg-white hover:bg-white/95 text-industrial-gray font-black py-4 px-6 rounded-[14px] transition-all flex items-center justify-center space-x-4 disabled:opacity-50 group"
                >
                  {isGeneratingPdf ? (
                    <Loader2 size={24} className="animate-spin text-primary-navy" />
                  ) : (
                    <Download size={24} className="text-primary-navy group-hover:animate-bounce" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-base uppercase tracking-tighter">TEKNİK ÜRÜN FÖYÜ İNDİR</span>
                    <span className="text-[10px] text-steel-gray font-medium uppercase tracking-widest">DETAYLI ŞARTNAME VE DATA-SHEET (PDF)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddToProjectModal 
        product={product} 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />

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
              ...(subCategory ? [{ '@type': 'ListItem', position: 3, name: subCategory.name, item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/category/${mainCategory?.slug}/${subCategory.slug}` }] : []),
              { '@type': 'ListItem', position: (mainCategory && subCategory) ? 4 : (mainCategory ? 3 : 2), name: product.name, item: canonicalUrl },
            ],
          }),
        }}
      />

      {/* Sticky Nav Trigger Point */}
      <div ref={navTriggerRef} className="h-0" />

      {/* Section Navigation - Refactored for global header harmony */}
      <div
        id="pdp-sticky-nav"
        className={`transition-all duration-500 z-[40] bg-white/90 backdrop-blur-xl border-b border-light-gray shadow-sm ${isNavSticky ? 'fixed top-[56px] md:top-[80px] left-0 right-0' : 'relative'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto py-2.5 sm:py-3 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeSection === section.id
                  ? 'bg-primary-navy text-white shadow-hvac'
                  : 'text-steel-gray hover:text-primary-navy hover:bg-light-gray/50'
                  }`}
              >
                <section.icon size={14} className={activeSection === section.id ? 'animate-pulse' : ''} />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions (only when sticky) */}
          {isNavSticky && (
            <div className="hidden lg:flex items-center space-x-3 pl-6 border-l border-light-gray ml-4 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-black text-industrial-gray line-clamp-1 max-w-[150px] uppercase tracking-tighter">{product.name}</span>
                <span className="text-[10px] text-primary-navy font-black tracking-widest">
                  {mainCategory?.metadata?.hide_price ? t('common.requestQuote') : formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="p-2.5 bg-white border border-primary-navy/20 text-primary-navy rounded-xl hover:bg-primary-navy hover:text-white transition-all shadow-sm active:scale-95"
                title="Projeye Ekle"
              >
                <FolderPlus size={18} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                className="bg-primary-navy hover:bg-secondary-blue text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>{t('pdp.addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Section Layout */}
      <div className="space-y-0">
        {sections.map((section, _index) => {
          const IconComponent = section.icon
          return (
            <section
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el }}
              data-section={section.id}
              className={`${section.bgClass} py-16 sm:py-24 transition-all duration-500 border-b border-light-gray/30 last:border-0`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center space-x-4 mb-12 sm:mb-16">
                  <div className="bg-primary-navy text-white p-4 rounded-2xl shadow-hvac">
                    <IconComponent size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-industrial-gray tracking-tighter uppercase">
                      {section.title}
                    </h2>
                    <div className="h-1 w-12 bg-secondary-blue mt-2 rounded-full" />
                  </div>
                </div>

                {/* Section Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                  {section.id === 'genel' && (
                    <>
                      {/* Product Features */}
                      {/* Product Dictionary / Rich Description */}
                      <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-8 border border-light-gray shadow-sm">
                          <h4 className="font-black text-industrial-gray mb-6 flex items-center text-sm uppercase tracking-[0.2em]">
                            <Info className="text-primary-navy mr-3" size={20} />
                            {t('pdp.labels.productDescription')}
                          </h4>
                          <div className="prose prose-slate max-w-none text-steel-gray leading-relaxed font-medium">
                            <RichTextRenderer content={product.description || t('pdp.descFallback')} />
                          </div>
                        </div>
                      </div>

                      {/* Technical Specifications Summary */}
                      <div className="bg-white rounded-2xl p-8 border border-light-gray shadow-sm">
                        <h4 className="font-black text-industrial-gray mb-6 text-sm uppercase tracking-[0.2em]">{t('pdp.labels.technicalSpecs')}</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-light-gray/50 group">
                            <span className="text-xs font-bold text-steel-gray uppercase tracking-widest">{t('pdp.brand')}</span>
                            <span className="text-sm font-black text-industrial-gray group-hover:text-primary-navy transition-colors">{product.brand}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-light-gray/50 group">
                            <span className="text-xs font-bold text-steel-gray uppercase tracking-widest">{t('pdp.model')}</span>
                            <span className="text-sm font-black text-industrial-gray group-hover:text-primary-navy transition-colors">{product.model_code ?? product.sku}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-light-gray/50 group">
                            <span className="text-xs font-bold text-steel-gray uppercase tracking-widest">{t('pdp.statusLabel')}</span>
                            <span className={`text-sm font-black flex items-center space-x-2 ${product.status === 'active' ? 'text-success-green' : 'text-warning-orange'
                              }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-success-green animate-pulse' : 'bg-warning-orange'}`} />
                              <span>{product.status === 'active' ? t('pdp.inStock') : t('pdp.outOfStock')}</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-light-gray/50 group">
                            <span className="text-xs font-bold text-steel-gray uppercase tracking-widest">{t('pdp.labels.category')}</span>
                            <span className="text-sm font-black text-industrial-gray group-hover:text-primary-navy transition-colors">{mainCategory?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 px-4 bg-light-gray/30 rounded-xl mt-4">
                            <span className="text-xs font-bold text-steel-gray uppercase tracking-[0.2em]">{t('pdp.labels.price')}</span>
                            <span className="text-xl font-black text-primary-navy">
                              {mainCategory?.metadata?.hide_price ? t('common.requestQuote') : formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'modeller' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {/* Model Variants */}
                          {[1, 2, 3].map((variant) => (
                            <div key={variant} className="bg-white rounded-2xl p-8 border border-light-gray shadow-sm hover:shadow-hvac-lg transition-all group overflow-hidden relative">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-primary-navy/5 rounded-bl-3xl" />
                              <div className="aspect-square bg-gradient-to-br from-light-gray/50 to-white rounded-xl mb-6 flex items-center justify-center border border-light-gray/30 group-hover:border-primary-navy/20 transition-all">
                                <BrandIcon brand={product.brand} className="scale-150 grayscale group-hover:grayscale-0 transition-all duration-500" />
                              </div>
                              <h4 className="font-black text-industrial-gray mb-2 text-lg uppercase tracking-tighter">
                                {product.sku}-{variant}
                              </h4>
                              <p className="text-steel-gray text-xs font-medium mb-6 leading-relaxed">
                                {t('pdp.variantDetails') || 'Teknik özelliklerde özelleştirilmiş model varyantı.'}
                              </p>
                              <div className="flex items-center justify-between pt-4 border-t border-light-gray/50">
                                <div className="text-primary-navy font-black text-lg">
                                  {formatCurrency((product.price + (variant - 1) * 200), lang, { maximumFractionDigits: 0 })}
                                </div>
                                <button className="p-2 bg-light-gray hover:bg-primary-navy text-industrial-gray hover:text-white rounded-lg transition-all">
                                  <ChevronRight size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}


                  {section.id === 'olcuiler' && (
                    <>
                      <div className="col-span-full bg-white rounded-3xl p-8 sm:p-12 border border-light-gray shadow-sm">
                        {product.technical_specs ? (
                          <>
                            {(() => {
                              const groupedSpecs = groupTechnicalSpecs(product.technical_specs);

                              if (!groupedSpecs || Object.keys(groupedSpecs).length === 0) {
                                return (
                                  <div className="text-steel-gray italic font-medium py-12 text-center">
                                    {t('pdp.labels.noSpecsAvailable')}
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-6">
                                  {Object.entries(groupedSpecs).map(([groupKey, group]) => {
                                    const isOpen = openSpecSections.includes(groupKey);
                                    const Icon = group.icon;

                                    return (
                                      <div key={groupKey} className="border border-light-gray/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all">
                                        {/* Accordion Header */}
                                        <button
                                          onClick={() => toggleSpecSection(groupKey)}
                                          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-light-gray/30 to-white hover:from-air-blue/10 hover:to-white transition-all group"
                                        >
                                          <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-white rounded-lg shadow-xs group-hover:shadow-sm transition-all border border-light-gray/50">
                                              <Icon size={22} className="text-primary-navy" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                              <span className="font-black text-industrial-gray text-xs sm:text-sm uppercase tracking-widest">{group.label}</span>
                                              <span className="text-[10px] font-bold text-steel-gray uppercase tracking-tighter">
                                                {Object.keys(group.specs).length} SPECIFICATIONS
                                              </span>
                                            </div>
                                          </div>
                                          <div className={`p-2 rounded-full bg-light-gray/50 text-primary-navy transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-navy text-white' : ''}`}>
                                            <ChevronDown size={20} />
                                          </div>
                                        </button>

                                        {/* Accordion Content */}
                                        <div
                                          className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                            } overflow-hidden`}
                                        >
                                          <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                            {Object.entries(group.specs)
                                              .sort(([keyA], [keyB]) => (SPEC_SORT_ORDER[keyA] || 99) - (SPEC_SORT_ORDER[keyB] || 99))
                                              .map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center py-3.5 border-b border-light-gray/40 last:border-0 md:last:border-b group hover:bg-air-blue/5 px-2 rounded-lg transition-colors">
                                                  <span className="text-xs font-bold text-steel-gray uppercase tracking-wider">{translateSpecKey(key)}</span>
                                                  <span className="text-sm font-black text-industrial-gray text-right">
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
                          <div className="text-steel-gray italic font-medium py-12 text-center">
                            {t('pdp.labels.noSpecsAvailable')}
                          </div>
                        )}
                      </div>
                    </>
                  )}


                  {section.id === 'diyagramlar' && (
                    <>
                      <div className="col-span-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Technical Diagrams */}
                          <div className="bg-white rounded-3xl p-8 border border-light-gray shadow-sm">
                            <h4 className="font-black text-industrial-gray mb-8 text-sm uppercase tracking-[0.2em]">{t('pdp.diagramsExtra.technicalDiagrams')}</h4>
                            <div className="space-y-6">
                              <div className="group relative aspect-video bg-gradient-to-br from-primary-navy/5 to-secondary-blue/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-light-gray hover:border-primary-navy/30 transition-all cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                  <div className="p-3 bg-primary-navy text-white rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <Download size={24} />
                                  </div>
                                </div>
                                <div className="text-center relative z-0">
                                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-light-gray/50">
                                    <FileText size={32} className="text-primary-navy" />
                                  </div>
                                  <p className="text-industrial-gray font-black text-xs uppercase tracking-widest">{t('pdp.diagramsExtra.mounting')}</p>
                                  <p className="text-[10px] text-steel-gray font-bold mt-1 uppercase tracking-tighter">PDF - 2.4 MB</p>
                                </div>
                              </div>
                              <div className="group relative aspect-video bg-gradient-to-br from-secondary-blue/5 to-air-blue/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-light-gray hover:border-secondary-blue/30 transition-all cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                  <div className="p-3 bg-secondary-blue text-white rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <Download size={24} />
                                  </div>
                                </div>
                                <div className="text-center relative z-0">
                                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-light-gray/50">
                                    <FileText size={32} className="text-secondary-blue" />
                                  </div>
                                  <p className="text-industrial-gray font-black text-xs uppercase tracking-widest">{t('pdp.diagramsExtra.electrical')}</p>
                                  <p className="text-[10px] text-steel-gray font-bold mt-1 uppercase tracking-tighter">PDF - 1.8 MB</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-3xl p-8 border border-light-gray shadow-sm">
                            <h4 className="font-black text-industrial-gray mb-8 text-sm uppercase tracking-[0.2em]">{t('pdp.diagramsExtra.threeDViews')}</h4>
                            <div className="space-y-6">
                              <div className="p-6 bg-light-gray/30 rounded-2xl border border-light-gray/50 flex items-center space-x-6 group hover:bg-white hover:shadow-md transition-all">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary-navy group-hover:text-white transition-all">
                                  <Settings size={28} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-industrial-gray uppercase tracking-tight">{t('pdp.diagramsExtra.view3DModel')}</p>
                                  <p className="text-[10px] text-steel-gray font-bold uppercase tracking-widest mt-1">{t('pdp.diagramsExtra.interactiveModel')}</p>
                                </div>
                              </div>
                              <div className="p-6 bg-light-gray/30 rounded-2xl border border-light-gray/50 flex items-center space-x-6 group hover:bg-white hover:shadow-md transition-all">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-xs flex items-center justify-center flex-shrink-0 group-hover:bg-success-green group-hover:text-white transition-all">
                                  <Ruler size={28} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-industrial-gray uppercase tracking-tight">{t('pdp.diagramsExtra.dimensionedDrawing')}</p>
                                  <p className="text-[10px] text-steel-gray font-bold uppercase tracking-widest mt-1">CAD/DWG AVAILABLE</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Technical Documents */}
                          <div className="bg-white rounded-3xl p-8 border border-light-gray shadow-sm hover:shadow-md transition-all group">
                            <div className="text-center mb-8">
                              <div className="w-20 h-20 bg-primary-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={40} className="text-primary-navy" />
                              </div>
                              <h4 className="font-black text-industrial-gray uppercase tracking-tight text-base">{t('pdp.docs.installationGuide')}</h4>
                              <p className="text-[10px] font-bold text-steel-gray uppercase tracking-widest mt-2">TECHNICAL PDF - 3.2 MB</p>
                            </div>
                            <button className="w-full bg-light-gray hover:bg-primary-navy text-industrial-gray hover:text-white py-4 px-6 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-3 active:scale-95 shadow-xs">
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





