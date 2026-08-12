'use client'
import {
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  FolderPlus,
  Heart,
  Info,
  Loader2,
  Ruler,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo,useRef, useState } from 'react'
import { toast } from 'sonner'

import { BrandIcon } from '../../components/HVACIcons'
import ImageGallery from '../../components/ImageGallery'
import LeadModal from '../../components/LeadModal'
import { ProductSmartInference } from '../../components/product/ProductSmartInference'
import ProductCard from '../../components/ProductCard'
import { AddToProjectModal } from '../../components/products'
import RichTextRenderer from '../../components/products/RichTextRenderer'
import { VARIANT_PILL_MAX,VariantSelector } from '../../components/products/VariantSelector'
import Seo from '../../components/Seo'
import { useCategories } from '../../contexts/CategoryContext'
import { useCart } from '../../hooks/useCartHook'
import { useProjectLists } from '../../hooks/useProjectLists'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { resolveProductImageUrl,storagePathToUrl } from '../../lib/images/productImage'
import type { FamilyDetail, FamilyVariant } from '../../lib/services/family.service'
import { getProductById, getProductsEnriched } from '../../lib/services/product.service'
import { supabaseBrowserClient as supabase } from '../../lib/supabase/client'
import type { CategoryMetadata } from '../../types/db-rows'
import type { Product } from '../../types/ui-models'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '../../utils/categoryHelpers'
import {
  formatSpecValue,
  groupTechnicalSpecs,
  SPEC_SORT_ORDER,
  translateSpecKey} from '../../utils/productHelpers'
import { localizedHref, Routes } from '../../utils/routes'
import { specFieldLabel, specGroupLabel } from '../../utils/specLabel'

/**
 * F5-B W2.2 — PDP artık AİLE kanoniktir.
 *
 * Veri modeli: `family` (product_families) + `variants` (aktif varyantlar,
 * get_family_detail RPC'sinden dil çözülmüş olarak gelir). Seçili varyant
 * `?sku=` arama parametresiyle taşınır; yoksa ilk varyant seçilidir.
 *
 * Sepet/PDF/proje gibi EYLEMLER tam `Product` satırına ihtiyaç duyar; bu satır
 * seçili varyant için tembel (lazy) çekilir — GÖRÜNÜM asla ona bağlı değildir.
 */

export interface ProductDetailPageProps {
  family: FamilyDetail['family'] | null
  variants: FamilyVariant[]
}

interface ProductDetailBodyProps extends ProductDetailPageProps {
  /** `?sku=` — sunucu ön-render'ında (searchParams okunamadığında) null. */
  selectedSku: string | null
}

type LocalizedText = { tr?: string | null; en?: string | null } | null

function pickLang(value: LocalizedText, lang: string): string | null {
  if (!value) return null
  const preferred = lang === 'en' ? value.en : value.tr
  return preferred || value.tr || value.en || null
}

const ProductDetailBody: React.FC<ProductDetailBodyProps> = ({ family, variants, selectedSku: skuParam }) => {
  const { t, lang } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const { addToCart } = useCart()
  const { refreshProjects } = useProjectLists()
  const { categories } = useCategories()

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [actionProduct, setActionProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('general')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isNavSticky, setIsNavSticky] = useState(false)
  const [openSpecSections, setOpenSpecSections] = useState<string[]>(['performance'])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navTriggerRef = useRef<HTMLDivElement>(null)

  // Seçili varyant: ?sku= → yoksa ailenin ilk varyantı.
  const selectedVariant = useMemo(
    () => variants.find((v) => v.sku === skuParam) ?? variants[0] ?? null,
    [variants, skuParam]
  )
  const selectedVariantId = selectedVariant?.id ?? null

  // --- GATEWAY ADAPTATION: CENTRAL CATEGORY DISPATCH (aile üzerinden) ---
  // useCategories listesi count-filtreli olabilir; kategori çözülemezse breadcrumb
  // kategorisiz KISALIR (kopma/boşluk yok).
  const { mainCategory, subCategory } = useMemo(() => {
    if (!family) return { mainCategory: null, subCategory: null }
    const sc = categories.find((c) => c.id === family.subcategory_id) || null
    const mc = categories.find((c) => c.id === family.category_id) || null
    return { mainCategory: mc, subCategory: sc }
  }, [family, categories])

  // Fiyatı olmayan varyant (null/0) "Teklif Alın" moduna düşer; kategori bazlı
  // hide_price bayrağı da aynı moda düşürür. quoteMode'da sepete-ekle HİÇ render edilmez.
  const quoteMode =
    Boolean((mainCategory?.metadata as CategoryMetadata | null)?.hide_price) ||
    selectedVariant == null ||
    selectedVariant.price == null ||
    Number(selectedVariant.price) <= 0

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

  // Seçili varyantın tam Product satırı — yalnız EYLEMLER için (sepet/PDF/proje).
  useEffect(() => {
    if (!selectedVariantId) {
      setActionProduct(null)
      return
    }
    let cancelled = false
    setActionProduct(null)
    getProductById(supabase, selectedVariantId)
      .then((p) => { if (!cancelled) setActionProduct(p) })
      .catch((err) => { console.warn('Error fetching variant product row:', err) })
    return () => { cancelled = true }
  }, [selectedVariantId])

  // İlgili ürünler — ailenin alt kategorisinden, kendi varyantları hariç.
  useEffect(() => {
    if (!family?.subcategory_id) {
      setRelatedProducts([])
      return
    }
    let cancelled = false
    // get_products_enriched family_id taşımaz (RPC null döner) → kendi varyantlarını
    // id kümesiyle ele; aksi halde aile kendi kendine "ilgili ürün" olarak görünür.
    const ownIds = new Set(variants.map((v) => v.id))
    getProductsEnriched(supabase, { categoryIds: [family.subcategory_id], limit: 12 })
      .then((list) => {
        if (cancelled) return
        setRelatedProducts(list.filter((p) => !ownIds.has(p.id)).slice(0, 4))
      })
      .catch((err) => { console.warn('Error fetching related products:', err) })
    return () => { cancelled = true }
  }, [family?.subcategory_id, variants])

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
  }, [family])

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
  }, [family, activeSection])

  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const navEl = document.getElementById('pdp-sticky-nav')
      const currentNavHeight = navEl ? navEl.offsetHeight : 0
      const extraGap = 84
      const y = element.getBoundingClientRect().top + window.pageYOffset - currentNavHeight - extraGap
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  // Varyant seçimi yalnız ?sku='yı günceller — sayfa yeniden yüklenmez, kaydırma korunur.
  const handleSelectVariant = useCallback((sku: string) => {
    // Tıklama yalnız istemcide olur — mevcut query'yi konumdan okumak useSearchParams
    // bağımlılığını (ve tüm gövdenin Suspense'e düşmesini) gereksiz kılar.
    const next = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
    next.set('sku', sku)
    router.replace(`${pathname}?${next.toString()}` as Route, { scroll: false })
  }, [pathname, router])

  // Galeri: seçili varyantın görselleri → yoksa ailedeki ilk görselli varyant.
  const galleryImages = useMemo(() => {
    const own = selectedVariant?.images ?? []
    const source = own.length > 0 ? own : (variants.find((v) => v.images.length > 0)?.images ?? [])
    return source.map((img) => ({ path: img.path, alt: img.alt }))
  }, [selectedVariant, variants])

  const handleAddToCart = () => { if (actionProduct) addToCart(actionProduct, quantity) }

  const handleDownloadPdf = async () => {
    if (!actionProduct || isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const { generateProductDatasheet } = await import('../../lib/pdfGenerator')
      const coverUrl = galleryImages[0]
        ? storagePathToUrl(galleryImages[0].path)
        : resolveProductImageUrl(actionProduct)
      await generateProductDatasheet(
        actionProduct,
        coverUrl || undefined,
        translateSpecKey,
        lang
      )
      toast.success(t('pdp.messages.pdfStarted') || 'PDF üretiliyor...')
    } catch (error) {
      console.warn('PDF generation error:', error)
      toast.error(t('pdp.errors.pdfFailed') || 'PDF üretilemedi.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    if (navigator.share && family) {
      try {
        await navigator.share({ title: family.name, text: `${family.brand_name ?? ''} - ${family.name}`.trim(), url: window.location.href })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.warn('Share error:', err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t('pdp.shareCopied') || 'Link kopyalandı!')
    }
  }

  const sections = [
    { id: 'general', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'specs', title: t('pdp.sections.specs'), icon: Ruler, bgClass: 'bg-white' },
    { id: 'diagrams', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-slate-50/50' },
    { id: 'documents', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-slate-50/50' },
    { id: 'certificates', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'models', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-slate-50/50' }
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

  if (!family || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="text-center">
          <h1 className="text-xl font-bold text-industrial-gray mb-4">{t('pdp.productNotFound')}</h1>
          <Link href={localizedHref('/', lang)} className="text-primary-navy hover:text-secondary-blue font-bold text-sm uppercase tracking-widest">
            {t('pdp.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  // ?sku= canonical'a GİRMEZ — aile URL'i tek kanonik adrestir.
  const canonicalUrl = `${origin}${Routes.product(family.slug)}`
  const variantDescription = selectedVariant.description || pickLang(family.description, lang)
  const metaDesc = variantDescription || t('pdp.descFallback')
  const variantLabel = selectedVariant.model_code || selectedVariant.sku
  const hasMultipleVariants = variants.length > 1
  const inlineSelector = hasMultipleVariants && variants.length <= VARIANT_PILL_MAX
  const stockQty = selectedVariant.stock_qty
  const inStock = typeof stockQty === 'number' && stockQty > 0

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Seo title={`${family.brand_name ?? ''} ${family.name} | ${t('header.brandName') || 'VentHub'}`.trim()} description={metaDesc} canonical={canonicalUrl} />

      {/* Seamless Integrated Breadcrumb */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <nav className="flex items-center space-x-2 text-xs sm:text-xs uppercase tracking-widest font-bold text-steel-gray/60">
            <Link href={localizedHref('/', lang)} className="hover:text-primary-navy transition-colors">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={10} className="flex-shrink-0" />
            {mainCategory && (
              <>
                <Link href={localizedHref(Routes.category(getLocalizedCategorySlug(mainCategory, lang)), lang)} className="hover:text-primary-navy transition-colors">
                  {getCategoryDisplayName(mainCategory, t)}
                </Link>
                {subCategory && subCategory.slug !== mainCategory.slug && (
                  <>
                    <ChevronRight size={10} className="flex-shrink-0" />
                    <Link href={localizedHref(Routes.category(getLocalizedCategorySlug(mainCategory, lang), getLocalizedCategorySlug(subCategory, lang)), lang)} className="hover:text-primary-navy transition-colors">
                      {getCategoryDisplayName(subCategory, t)}
                    </Link>
                  </>
                )}
                <ChevronRight size={10} className="flex-shrink-0" />
              </>
            )}
            <span className="text-industrial-gray truncate max-w-150px sm:max-w-none">
              {family.name}
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
            if (lastSafeStop) { router.push(localizedHref(lastSafeStop, lang), { scroll: false }); }
            else if (subCategory && mainCategory && subCategory.slug !== mainCategory.slug) { router.push(localizedHref(Routes.category(getLocalizedCategorySlug(mainCategory, lang), getLocalizedCategorySlug(subCategory, lang)), lang), { scroll: false }) }
            else if (mainCategory) { router.push(localizedHref(Routes.category(getLocalizedCategorySlug(mainCategory, lang)), lang), { scroll: false }) }
            else { router.push(localizedHref('/', lang), { scroll: false }) }
          }}
          className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-6 sm:mb-8 transition-colors group font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Image Gallery (60% width on large screens) */}
          <div className="lg:col-span-7 xl:col-span-8 sticky top-24 self-start z-10">
            <div className="relative group bg-white rounded-3xl border border-light-gray/50 shadow-sm overflow-hidden p-2">
              <ImageGallery
              key={selectedVariant.id}
              images={galleryImages}
              productName={selectedVariant.name}
              slug={family.slug}
              modelType={(mainCategory?.metadata as CategoryMetadata | null)?.model_type}
              />

              {topicSlug === 'hava-perdesi' && (
                <div className="absolute top-6 left-6 z-20 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md border border-primary-navy/20 px-3 py-2 rounded-full shadow-hvac flex items-center space-x-2 animate-pulse-subtle">
                    <div className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-navy opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-navy"></span>
                    </div>
                    <span className="text-xs font-bold text-primary-navy uppercase tracking-widest">
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
                <BrandIcon brand={family.brand_name || ''} className="w-8 h-8" />
                <div className="flex flex-col">
                  <span className="text-secondary-blue font-bold text-xs tracking-tight uppercase">{family.brand_name}</span>
                  <span className="text-steel-gray text-xs font-medium tracking-hvac-normal">{t('pdp.officialDistributor')}</span>
                </div>
              </div>
              {actionProduct?.is_featured && (
                <div className="bg-gold-accent/10 text-gold-accent px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 border border-gold-accent/20">
                  <Star size={10} fill="currentColor" />
                  <span>{t('pdp.featured')}</span>
                </div>
              )}
            </div>

            {/* Family Name (kanonik başlık) + seçili varyant */}
            <h1 className="text-2xl sm:text-3xl font-black text-industrial-gray leading-hvac-11 mb-2 tracking-tight">
              {family.name}
            </h1>
            {hasMultipleVariants && (
              <p className="text-xs font-bold text-steel-gray uppercase tracking-widest mb-4">
                {t('pdp.variant.selectedModel')}: <span className="text-primary-navy">{variantLabel}</span>
              </p>
            )}

            {/* Smart Engineering Inference (tam Product satırı gerektirir) */}
            {actionProduct && <ProductSmartInference product={actionProduct} />}

            {/* Quick Specs Jump - Accessibility Feature */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {sections.slice(0, 4).map((s) => (
                <button
                  key={`jump-${s.id}`}
                  onClick={() => scrollToSection(s.id)}
                  className="px-3 py-1.5 bg-air-blue/30 hover:bg-air-blue text-primary-navy rounded-lg text-xs font-black uppercase tracking-widest transition-colors border border-secondary-blue/10"
                  aria-label={`${s.title} ${t('common.scrollTo') || 'bölümüne git'}`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Varyant seçimi — az varyantta yerinde, çoğunda "Modeller" bölümünde */}
            {inlineSelector && (
              <div className="mb-6">
                <VariantSelector
                  variants={variants}
                  selectedSku={selectedVariant.sku}
                  onSelect={handleSelectVariant}
                  quoteMode={quoteMode}
                />
              </div>
            )}
            {hasMultipleVariants && !inlineSelector && (
              <button
                onClick={() => scrollToSection('models')}
                className="mb-6 w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-light-gray hover:border-primary-navy transition-colors group"
              >
                <span className="flex flex-col text-left">
                  <span className="text-xs font-bold text-steel-gray uppercase tracking-widest opacity-60">
                    {t('pdp.variant.heading')}
                  </span>
                  <span className="text-sm font-black text-industrial-gray uppercase tracking-tight">
                    {t('pdp.variant.showAll', { count: variants.length })}
                  </span>
                </span>
                <ChevronRight size={16} className="text-primary-navy opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Price Area - Elegant & Technical */}
            <div className="mb-6 p-5 bg-white rounded-2xl border border-light-gray shadow-sm relative overflow-hidden group">
              <div className="flex flex-col relative z-10">
                <span className="text-xs font-bold text-steel-gray uppercase tracking-hvac-normal mb-1 opacity-60">{t('pdp.priceAvailability') || 'Price & Availability'}</span>
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <div className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">
                      {quoteMode ? (
                        <span className="text-xl text-industrial-gray font-bold">{t('pdp.techQuote')}</span>
                      ) : (
                        formatCurrency(Number(selectedVariant.price ?? 0), lang, { maximumFractionDigits: 0 })
                      )}
                    </div>
                    {!quoteMode && (
                      <span className="text-xs font-bold text-steel-gray uppercase mt-1">
                        {t('pdp.vatIncluded')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {!quoteMode && (
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${inStock ? 'bg-success-green/10 text-success-green border border-success-green/20' : 'bg-warning-orange/10 text-warning-orange border border-warning-orange/20'}`}>
                        <div className={`w-1 h-1 rounded-full ${inStock ? 'bg-success-green' : 'bg-warning-orange'}`} />
                        <span>{inStock ? t('pdp.inStock') : t('pdp.outOfStock')}</span>
                      </div>
                    )}
                    <span className="text-xs text-steel-gray font-bold mt-1.5 opacity-50 uppercase tracking-widest">{t('pdp.labels.sku')}: {selectedVariant.sku}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Area - Compact & Unified */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-light-gray p-5 space-y-5">
                {/* Quantity Control — yalnız satın alınabilir (fiyatlı) varyantta */}
                {!quoteMode && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-industrial-gray uppercase tracking-widest">{t('pdp.qty')}</span>
                    <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-light-gray/50">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-lg font-bold text-industrial-gray" aria-label={t('common.decrease')}>-</button>
                      <span className="w-10 text-center font-black text-primary-navy text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-lg font-bold text-industrial-gray" aria-label={t('common.increase')}>+</button>
                    </div>
                  </div>
                )}

                {/* Primary Actions */}
                <div className="flex flex-col gap-2">
                  {quoteMode ? (
                    <button
                      onClick={() => setLeadOpen(true)}
                      data-testid="pdp-add-to-cart"
                      className="w-full bg-industrial-gray hover:bg-primary-navy text-white font-black py-3.5 px-6 rounded-xl transition-shadow shadow-md flex items-center justify-center space-x-3 group"
                    >
                      <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                      <span className="text-xs uppercase tracking-hvac-snug">{t('pdp.techQuote')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      data-testid="pdp-add-to-cart"
                      disabled={!actionProduct || !inStock}
                      className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-black py-3.5 px-6 rounded-xl transition-transform shadow-lg hover:shadow-primary-navy/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-98"
                    >
                      <ShoppingCart size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span className="text-xs uppercase tracking-hvac-snug">{t('pdp.addToCart')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    disabled={!actionProduct}
                    className="w-full bg-white border-2 border-primary-navy/10 hover:border-primary-navy text-primary-navy font-bold py-3.5 px-6 rounded-xl transition-transform flex items-center justify-center space-x-2 group active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FolderPlus size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-hvac-snug">{t('pdp.actions.addToProject')}</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 border rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-light-gray text-steel-gray hover:border-red-500 hover:text-red-500'
                      }`}
                    aria-label={isWishlisted ? t('pdp.actions.removeFromWishlist') : t('pdp.actions.addToWishlist')}
                  >
                    <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    <span>{t('pdp.actions.favorite')}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 border border-light-gray text-steel-gray hover:border-primary-navy hover:text-primary-navy rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                    aria-label={t('common.share') || 'Paylaş'}
                  >
                    <Share2 size={14} />
                    <span>{t('pdp.actions.share')}</span>
                  </button>
                </div>
              </div>

              {/* Trust Signals - Lighter Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Truck className="text-success-green mb-1.5" size={18} />
                  <p className="text-xs font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.freeShipping')}</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Shield className="text-primary-navy mb-1.5" size={18} />
                  <p className="text-xs font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.securePayment')}</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-light-gray/50 text-center">
                  <Award className="text-secondary-blue mb-1.5" size={18} />
                  <p className="text-xs font-black text-industrial-gray uppercase tracking-tighter">{t('pdp.trust.warranty')}</p>
                </div>
              </div>

              {/* Quick Tech PDF Link */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || !actionProduct}
                className="w-full bg-slate-900 hover:bg-primary-navy text-white font-bold py-3.5 px-6 rounded-xl transition-opacity flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center space-x-3 text-left">
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider">{t('pdp.labels.technicalDatasheet')}</span>
                    <span className="text-xs text-white/50 font-medium uppercase tracking-hvac-normal">{t('pdp.labels.datasheetPdf')}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionProduct && (
        <AddToProjectModal
          product={actionProduct}
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}

      {/* NOT: İstemci tarafı Product JSON-LD bloğu W2.2'de SİLİNDİ —
          tek kaynak sunucu tarafındaki blok (W3.1 ProductGroup'a çevirecek). */}

      <div ref={navTriggerRef} className="h-0" />

      {/* Section Navigation - Airy Integrated Design */}
      <div
        id="pdp-sticky-nav"
        className={`transition-colors duration-500 z-dropdown bg-white/80 backdrop-blur-xl border-b border-light-gray/50 ${isNavSticky ? 'fixed top-56px md:top-80px left-0 right-0 shadow-lg shadow-primary-navy/5' : 'relative mt-8 sm:mt-12'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 overflow-x-auto py-3 sm:py-4 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-xs uppercase tracking-hvac-normal whitespace-nowrap transition-colors ${activeSection === section.id
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
                <span className="text-xs font-black text-industrial-gray line-clamp-1 max-w-120px uppercase tracking-tight">{family.name}</span>
                <span className="text-xs text-primary-navy font-black tracking-widest">
                  {quoteMode ? t('pdp.techQuote') : formatCurrency(Number(selectedVariant.price ?? 0), lang, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {quoteMode ? (
                <button
                  onClick={() => setLeadOpen(true)}
                  className="bg-primary-navy hover:bg-secondary-blue text-white text-xs font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-transform shadow-md active:scale-95 flex items-center space-x-2"
                >
                  <Settings size={14} />
                  <span>{t('pdp.techQuote')}</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!actionProduct || !inStock}
                  className="bg-primary-navy hover:bg-secondary-blue text-white text-xs font-black uppercase tracking-widest py-2.5 px-5 rounded-xl transition-transform shadow-md active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={14} />
                  <span>{t('pdp.addToCart')}</span>
                </button>
              )}
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
              className={`${section.bgClass} py-12 sm:py-20 transition-colors duration-500 border-b border-light-gray/20 last:border-0`}
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
                  {section.id === 'general' && (
                    <>
                      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray/50 shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-black text-industrial-gray mb-6 flex items-center text-xs uppercase tracking-hvac-normal opacity-60">
                            <Info className="text-primary-navy mr-2.5" size={16} />
                            {t('pdp.labels.productDescription')}
                          </h4>
                          <div className="prose prose-slate max-w-none text-steel-gray leading-relaxed text-sm font-medium">
                            {/* RPC dil çözümünü ve aile fallback'ini zaten yaptı. */}
                            <RichTextRenderer content={metaDesc} />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray/50 shadow-sm sticky top-36">
                          <h4 className="font-black text-industrial-gray mb-6 text-xs uppercase tracking-hvac-normal opacity-60">{t('common.quickDetails')}</h4>
                          <div className="space-y-4">
                            {[
                              { label: t('pdp.brand'), value: family.brand_name ?? '-' },
                              { label: t('pdp.model'), value: variantLabel },
                              { label: t('pdp.labels.category'), value: getCategoryDisplayName(mainCategory, t) || '-' }
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-3 border-b border-light-gray/30 group">
                                <span className="text-xs font-bold text-steel-gray uppercase tracking-widest">{item.label}</span>
                                <span className="text-xs font-black text-industrial-gray group-hover:text-primary-navy transition-colors">{item.value}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center py-4 px-4 bg-slate-50 rounded-xl mt-4">
                              <span className="text-xs font-bold text-steel-gray uppercase tracking-hvac-normal">{t('common.listingPrice')}</span>
                              <span className="text-lg font-black text-primary-navy">
                                {quoteMode ? t('pdp.techQuote') : formatCurrency(Number(selectedVariant.price ?? 0), lang, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'models' && (
                    <div className="col-span-full">
                      {hasMultipleVariants ? (
                        <VariantSelector
                          variants={variants}
                          selectedSku={selectedVariant.sku}
                          onSelect={handleSelectVariant}
                          quoteMode={quoteMode}
                        />
                      ) : (
                        <p className="text-steel-gray italic font-medium py-10 text-center text-xs uppercase tracking-widest">
                          {t('pdp.variant.singleModel')}
                        </p>
                      )}
                    </div>
                  )}

                  {section.id === 'specs' && (
                    <div className="col-span-full bg-white rounded-3xl p-6 sm:p-10 border border-light-gray shadow-sm">
                      {selectedVariant.technical_specs ? (
                        <div className="space-y-4">
                          {Object.entries(groupTechnicalSpecs(selectedVariant.technical_specs) || {}).map(([groupKey, group]) => {
                            const isOpen = openSpecSections.includes(groupKey);
                            const Icon = group.icon;
                            return (
                              <div key={groupKey} className="border border-light-gray/40 rounded-2xl overflow-hidden">
                                <button onClick={() => toggleSpecSection(groupKey)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-air-blue/10 transition-colors group">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1.5 bg-white rounded-lg shadow-xs group-hover:shadow-sm border border-light-gray/50"><Icon size={18} className="text-primary-navy" /></div>
                                    <span className="font-black text-industrial-gray text-xs uppercase tracking-widest">{specGroupLabel(groupKey, t, group.label)}</span>
                                  </div>
                                  <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-navy text-white' : 'bg-white text-primary-navy'}`}><ChevronDown size={16} /></div>
                                </button>
                                <div className={`transition-colors duration-500 ease-in-out ${isOpen ? 'max-h-2000px opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                  <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
                                    {Object.entries(group.specs).sort(([kA], [kB]) => (SPEC_SORT_ORDER[kA] || 99) - (SPEC_SORT_ORDER[kB] || 99)).map(([key, val]) => (
                                      <div key={key} className="flex justify-between items-center py-2.5 border-b border-light-gray/20 last:border-0 md:last:border-b group hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                        <span className="text-xs font-bold text-steel-gray uppercase tracking-wider">{specFieldLabel(key, t)}</span>
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

                  {section.id === 'diagrams' && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-sm">
                        <h4 className="font-black text-industrial-gray mb-6 text-xs uppercase tracking-hvac-normal opacity-60">{t('pdp.diagramsExtra.technicalDiagrams')}</h4>
                        <div className="space-y-4">
                          {['mounting', 'electrical'].map(type => (
                            <div key={type} className="group relative aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-light-gray hover:border-primary-navy/30 transition-colors cursor-pointer overflow-hidden">
                              <div className="absolute inset-0 bg-white/40 backdrop-blur-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                <div className="p-2.5 bg-primary-navy text-white rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"><Download size={20} /></div>
                              </div>
                              <div className="text-center">
                                <FileText size={28} className="text-primary-navy/40 mx-auto mb-2" />
                                <p className="text-industrial-gray font-black text-xs uppercase tracking-widest">{t(`pdp.diagramsExtra.${type}`)}</p>
                                <p className="text-xs text-steel-gray font-bold mt-1 uppercase tracking-tighter">{t('common.pdf')} {t('common.pdfDatasheet')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-sm">
                        <h4 className="font-black text-industrial-gray mb-6 text-xs uppercase tracking-hvac-normal opacity-60">{t('pdp.diagramsExtra.threeDViews')}</h4>
                        <div className="space-y-4">
                          {[ { icon: Settings, label: 'view3DModel', sub: 'interactiveModel' }, { icon: Ruler, label: 'dimensionedDrawing', sub: 'CAD/DWG AVAILABLE' } ].map((item, i) => (
                            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-light-gray/50 flex items-center space-x-5 group hover:bg-white hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary-navy group-hover:text-white transition-shadow"><item.icon size={22} /></div>
                              <div>
                                <p className="text-xs font-black text-industrial-gray uppercase tracking-tight">{t(`pdp.diagramsExtra.${item.label}`)}</p>
                                <p className="text-xs text-steel-gray font-bold uppercase tracking-widest mt-1">{item.sub.startsWith('CAD') ? t('pdp.diagramsExtra.cadDwgAvailable') : t(`pdp.diagramsExtra.${item.sub}`)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'documents' && (
                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['installationGuide', 'userManual', 'maintenanceManual', 'safetyInfo', 'warrantyTerms', 'technicalSpecsDoc'].map((doc, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-light-gray shadow-sm hover:shadow-md transition-shadow group text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-air-blue/20 transition-colors"><FileText size={32} className="text-primary-navy/40" /></div>
                          <h4 className="font-black text-industrial-gray uppercase tracking-tight text-xs mb-4 min-h-8">{t(`pdp.docs.${doc}`)}</h4>
                          <button className="w-full bg-slate-100 hover:bg-primary-navy text-industrial-gray hover:text-white py-3 px-4 rounded-xl transition-colors font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
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
                          <h4 className="font-black text-industrial-gray mb-6 text-xs uppercase tracking-hvac-normal opacity-60">{t(`pdp.docs.${type}`)}</h4>
                          <div className="aspect-4/3 bg-slate-50 rounded-xl mb-6 flex items-center justify-center border border-light-gray/30"><Download size={40} className="text-primary-navy/20" /></div>
                          <button onClick={type === 'technicalBrochure' ? handleDownloadPdf : undefined} className="w-full bg-slate-900 hover:bg-primary-navy text-white py-3.5 px-6 rounded-xl transition-colors font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                            <Download size={18} /> <span>{t(`pdp.actions.download${type === 'productCatalog' ? 'Catalog' : 'Brochure'}`)}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'certificates' && (
                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['ceCertificate', 'iso9001', 'tseCertificate', 'energyStar', 'ulCertificate', 'ecoFriendly'].map((cert, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-light-gray shadow-sm text-center">
                          <div className="bg-slate-50 rounded-2xl p-5 mb-5 group-hover:bg-air-blue/10 transition-colors"><Award size={36} className="text-primary-navy/30 mx-auto" /></div>
                          <h4 className="font-black text-industrial-gray uppercase tracking-tight text-xs mb-3">{t(`pdp.cert.${cert}`)}</h4>
                          <div className="text-xs text-steel-gray space-y-1 font-bold uppercase tracking-widest opacity-60">
                            <p>{t('pdp.certLabels.certificateNo')}: {cert.toUpperCase()}{t('pdp.certLabels.yearSuffix')}</p>
                            <p>{t('pdp.certLabels.standard')}: {t('pdp.certLabels.standardValue')}</p>
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
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} productName={selectedVariant.name} _productId={selectedVariant.id} />
    </div>
  )
}

/** `?sku=` köprüsü — useSearchParams YALNIZ burada; Suspense sınırı bunu sarar. */
const PdpSkuBridge: React.FC<ProductDetailPageProps> = (props) => {
  const searchParams = useSearchParams()
  return <ProductDetailBody {...props} selectedSku={searchParams.get('sku')} />
}

/**
 * useSearchParams kullanan ağaç Suspense ile sarılır (PPR/SSR zehirlenme kuralı).
 *
 * Fallback bilinçli olarak boş bir iskelet DEĞİL, VARSAYILAN varyantla render edilmiş
 * tam gövdedir: statik ön-render'da HTML gerçek ürün içeriğiyle çıkar (SEO/LCP),
 * istemci hidrasyonunda ?sku= seçimi devralır.
 */
export const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => (
  <Suspense fallback={<ProductDetailBody {...props} selectedSku={null} />}>
    <PdpSkuBridge {...props} />
  </Suspense>
)
