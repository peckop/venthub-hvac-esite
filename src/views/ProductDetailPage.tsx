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
import { UI_SYSTEM } from '../utils/uiSystem'
import { usePageContext } from '../contexts/PageContext'

export interface ProductDetailPageProps {
  initialProduct?: Product | null
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ initialProduct }) => {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { addToCart } = useCart()
  const { refreshProjects } = useProjectLists()
  const { setPageContext, clearPageContext } = usePageContext()
  
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialProduct)
  const [mainCategory, setMainCategory] = useState<Category | null>(null)
  const [subCategory, setSubCategory] = useState<Category | null>(null)
  const [images, setImages] = useState<{ path: string; alt?: string | null }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeSection, _setActiveSection] = useState('genel')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [openSpecSections, setOpenSpecSections] = useState<string[]>(['performance'])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const { t, lang } = useI18n()

  const sections = React.useMemo(() => [
    { id: 'genel', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'olcuiler', title: 'Teknik Özellikler', icon: Ruler, bgClass: 'bg-white' },
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-slate-50/50' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-slate-50/50' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-slate-50/50' }
  ], [t])

  const toggleSpecSection = (sectionKey: string) => {
    setOpenSpecSections(prev =>
      prev.includes(sectionKey) ? prev.filter(k => k !== sectionKey) : [...prev, sectionKey]
    );
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return
    if (navigator.share && product) {
      navigator.share({ title: product.name, text: `${product.brand} - ${product.name}`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Bağlantı kopyalandı.')
    }
  }

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      // If we already have the product from SSR, use it
      if (initialProduct && (id === initialProduct.id || id === initialProduct.sku)) {
        setProduct(initialProduct)
        setLoading(false)
      }

      try {
        if (!product || (initialProduct && id !== initialProduct.id && id !== initialProduct.sku)) {
          setLoading(true)
        }
        
        const productData = await getProductBySlugOrId(id)
        if (!productData) {
          setProduct(null)
          return
        }
        setProduct(productData)
        
        // Fetch categories for breadcrumb
        const cats = await getCategories()
        const mc = cats.find(c => c.id === productData.category_id) || null
        const sc = cats.find(c => c.id === productData.subcategory_id) || null
        
        setMainCategory(mc)
        setSubCategory(sc)

        // Sync with Header
        setPageContext({
          productName: productData.name,
          modelCode: productData.model_code || productData.sku,
          technicalLinks: sections.map(s => ({ id: s.id, label: s.title })),
          breadcrumb: [
            ...(mc ? [{ label: mc.name, href: `/category/${mc.slug}` }] : []),
            ...(sc && sc.slug !== mc?.slug ? [{ label: sc.name, href: `/category/${mc?.slug}/${sc.slug}` }] : [])
          ]
        })

        // Images
        try {
          const { data: imgs } = await supabase
            .from('product_images')
            .select('path, alt, sort_order')
            .eq('product_id', productData.id)
            .order('sort_order', { ascending: true })
          setImages((imgs || []) as { path: string; alt?: string | null }[])
        } catch { }

        // Related
        if (productData.subcategory_id) {
          const related = await getProductsBySubcategory(productData.subcategory_id)
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching PDP:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
    return () => clearPageContext()
  }, [id, initialProduct, sections, setPageContext, clearPageContext])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const offset = 140
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleAddToCart = () => { if (product) addToCart(product, quantity) }

  const handleDownloadPdf = async () => {
    if (!product) return;
    try {
      setIsGeneratingPdf(true);
      let fullImageUrl: string | undefined = undefined;
      if (images?.length > 0 && images[0]?.path) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(images[0].path);
        fullImageUrl = data?.publicUrl;
      } else if (product.image_url) {
        fullImageUrl = product.image_url;
      }
      await generateProductDatasheet(product, fullImageUrl, translateSpecKey, lang);
      toast.success(t('pdp.pdfSuccess') || 'Teknik PDF Föyü indirildi.');
    } catch (err) {
      console.error(err);
      toast.error(t('pdp.pdfError') || 'PDF hatası.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [origin, setOrigin] = useState('')
  useEffect(() => { if (typeof window !== 'undefined') setOrigin(window.location.origin) }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy mx-auto mb-4" />
        <p className={UI_SYSTEM.typography.label}>{t('pdp.loading')}</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
      <div className="text-center">
        <h1 className={UI_SYSTEM.typography.h1}>{t('pdp.productNotFound')}</h1>
        <Link href="/" className="text-primary-navy hover:text-secondary-blue font-semibold text-xs uppercase tracking-widest mt-4 block">
          {t('pdp.backHome')}
        </Link>
      </div>
    </div>
  )

  const canonicalUrl = `${origin}/products/${product.id}`
  const metaDesc = product.description || `${product.brand} ${product.name} ürünü.`

  return (
    <div className="min-h-screen bg-slate-50/20 pt-[64px] md:pt-[104px]">
      <Seo title={`${product.brand} ${product.name} | VentHub`} description={metaDesc} canonical={canonicalUrl} />
      
      <div className={UI_SYSTEM.layout.containerNarrow + " py-8 sm:py-12"}>
        {/* Back Button */}
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
          className="flex items-center space-x-2 text-steel-gray/60 hover:text-primary-navy mb-8 transition-all group font-semibold text-[9px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          <span>{t('pdp.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="sticky top-32 space-y-6">
              <div className={"bg-white rounded-2xl p-1.5 overflow-hidden " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry}>
                <ImageGallery
                  key={product.id}
                  images={images}
                  productName={product.name}
                  slug={product.slug || product.name}
                  modelType={mainCategory?.metadata?.model_type}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {sections.slice(0, 4).map(s => (
                  <button key={s.id} onClick={() => scrollToSection(s.id)} className={"p-3 rounded-xl bg-white transition-all text-center group hover:bg-air-blue/10 " + UI_SYSTEM.layout.borderLight}>
                    <s.icon size={16} className="mx-auto mb-2 text-steel-gray group-hover:text-primary-navy transition-colors" />
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-steel-gray group-hover:text-primary-navy">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <div className={"w-7 h-7 bg-white rounded-lg p-1 flex items-center justify-center " + UI_SYSTEM.layout.borderLight}>
                  <BrandIcon brand={product.brand} className="w-full h-full" />
                </div>
                <span className="text-secondary-blue font-semibold text-[10px] tracking-[0.2em] uppercase">{product.brand}</span>
              </div>
              {product.is_featured && (
                <div className="bg-gold-accent/10 text-gold-accent px-2 py-1 rounded text-[8px] font-semibold flex items-center space-x-1 border border-gold-accent/20 tracking-widest uppercase">
                  <Star size={10} fill="currentColor" />
                  <span>FEATURED</span>
                </div>
              )}
            </div>

            <h1 className={UI_SYSTEM.typography.h1 + " uppercase leading-tight mb-6"}>
              {product.name}
            </h1>

            <div className={"bg-white rounded-2xl p-6 space-y-6 " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry}>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className={UI_SYSTEM.typography.label + " mb-1 opacity-40"}>Unit Price</span>
                  <div className={UI_SYSTEM.typography.price}>
                    {mainCategory?.metadata?.hide_price ? 'TEKLİF ALIN' : formatCurrency(product.price, lang, { maximumFractionDigits: 0 })}
                  </div>
                  {!mainCategory?.metadata?.hide_price && <span className="text-[8px] font-semibold text-steel-gray/40 uppercase tracking-widest mt-1">VAT INCLUDED</span>}
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-widest ${typeof product.stock_qty === 'number' && product.stock_qty > 0 ? 'bg-success-green/10 text-success-green' : 'bg-warning-orange/10 text-warning-orange'}`}>
                    {typeof product.stock_qty === 'number' && product.stock_qty > 0 ? 'IN STOCK' : 'PRE-ORDER'}
                  </div>
                  <span className="text-[8px] text-steel-gray font-semibold mt-1.5 opacity-20 tracking-widest uppercase">SKU: {product.sku}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className={UI_SYSTEM.typography.label + " opacity-50"}>Quantity</span>
                <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-200/40">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all font-semibold text-industrial-gray">-</button>
                  <span className="w-10 text-center font-semibold text-primary-navy text-xs">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all font-semibold text-industrial-gray">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={mainCategory?.metadata?.hide_price ? () => setLeadOpen(true) : handleAddToCart}
                  disabled={!mainCategory?.metadata?.hide_price && (typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
                  className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-3 group active:scale-[0.98] disabled:opacity-50"
                >
                  {mainCategory?.metadata?.hide_price ? <Settings size={16} /> : <ShoppingCart size={16} />}
                  <span className="text-[10px] uppercase tracking-[0.2em]">{mainCategory?.metadata?.hide_price ? 'TEKLİF AL' : t('pdp.addToCart')}</span>
                </button>
                
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="w-full bg-white border border-slate-200 hover:border-primary-navy text-primary-navy font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
                >
                  <FolderPlus size={16} className="opacity-60 group-hover:opacity-100" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">PROJE LİSTESİ</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setIsWishlisted(!isWishlisted)} className="flex-1 flex items-center justify-center space-x-2 py-2 border border-slate-100 rounded-lg font-semibold text-[8px] uppercase tracking-[0.2em] text-steel-gray hover:text-red-500 transition-all">
                  <Heart size={12} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
                  <span>FAVORİ</span>
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center space-x-2 py-2 border border-slate-100 rounded-lg font-semibold text-[8px] uppercase tracking-[0.2em] text-steel-gray hover:text-primary-navy transition-all">
                  <Share2 size={12} />
                  <span>PAYLAŞ</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[ { icon: Truck, label: 'KARGO' }, { icon: Shield, label: 'GÜVENLİ' }, { icon: Award, label: 'GARANTİ' } ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <item.icon className="text-industrial-gray opacity-30 mb-1" size={14} />
                  <p className="text-[7px] font-semibold text-industrial-gray uppercase tracking-tighter opacity-40">{item.label}</p>
                </div>
              ))}
            </div>

            <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full bg-slate-900 hover:bg-primary-navy text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-between group mt-6 disabled:opacity-50 shadow-sm">
              <div className="flex items-center space-x-4 text-left">
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-semibold">TEKNİK ÜRÜN FÖYÜ</span>
                  <span className="text-[7px] text-white/30 font-medium uppercase tracking-[0.2em]">DOWNLOAD DATASHEET PDF</span>
                </div>
              </div>
              <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </div>
      </div>

      <AddToProjectModal product={product} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />

      <div className="space-y-0">
        {sections.map((section) => {
          const IconComponent = section.icon
          return (
            <section
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el }}
              id={section.id}
              className={`${section.bgClass} py-12 sm:py-24 border-b border-light-gray/20 last:border-0`}
            >
              <div className={UI_SYSTEM.layout.containerNarrow}>
                <div className="flex items-center space-x-4 mb-12">
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-sm">
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <h2 className={UI_SYSTEM.typography.h2 + " uppercase"}>{section.title}</h2>
                    <div className="h-0.5 w-8 bg-secondary-blue mt-2 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  {section.id === 'genel' && (
                    <>
                      <div className="lg:col-span-8 space-y-8">
                        <div className={"bg-white rounded-3xl p-8 transition-all " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry}>
                          <h4 className={UI_SYSTEM.typography.label + " mb-8 opacity-40 flex items-center"}>
                            <Info className="text-primary-navy mr-2.5" size={16} />
                            PRODUCT OVERVIEW
                          </h4>
                          <div className={UI_SYSTEM.typography.body}>
                            <RichTextRenderer content={product.description || t('pdp.descFallback')} />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-4">
                        <div className={"bg-white rounded-3xl p-8 sticky top-40 " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry}>
                          <h4 className={UI_SYSTEM.typography.label + " mb-8 opacity-40"}>Quick Reference</h4>
                          <div className="space-y-5">
                            {[
                              { label: t('pdp.brand'), value: product.brand },
                              { label: t('pdp.model'), value: product.model_code ?? product.sku },
                              { label: t('pdp.labels.category'), value: mainCategory?.name || '-' }
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 group">
                                <span className={UI_SYSTEM.typography.label + " opacity-60"}>{item.label}</span>
                                <span className="text-[11px] font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'olcuiler' && (
                    <div className="col-span-full">
                      <div className={"bg-white rounded-3xl p-8 sm:p-12 " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry}>
                        {product.technical_specs ? (
                          <div className="space-y-6">
                            {Object.entries(groupTechnicalSpecs(product.technical_specs)).map(([groupKey, group]) => {
                              const isOpen = openSpecSections.includes(groupKey);
                              const Icon = group.icon;
                              return (
                                <div key={groupKey} className={"rounded-2xl overflow-hidden " + UI_SYSTEM.layout.borderLight}>
                                  <button onClick={() => toggleSpecSection(groupKey)} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-air-blue/10 transition-all group text-left">
                                    <div className="flex items-center space-x-4">
                                      <div className="p-2 bg-white rounded-lg shadow-xs group-hover:shadow-sm border border-slate-200/40"><Icon size={20} className="text-primary-navy" /></div>
                                      <div className="flex flex-col">
                                        <span className={UI_SYSTEM.typography.h3 + " uppercase"}>{group.label}</span>
                                        <span className="text-[8px] font-black text-steel-gray/40 uppercase tracking-[0.2em]">{Object.keys(group.specs).length} SPECIFICATIONS</span>
                                      </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-navy text-white' : 'bg-white text-primary-navy shadow-sm'}`}><ChevronDown size={18} /></div>
                                  </button>
                                  <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                    <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                                      {Object.entries(group.specs).sort(([kA], [kB]) => (SPEC_SORT_ORDER[kA] || 99) - (SPEC_SORT_ORDER[kB] || 99)).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center py-3.5 border-b border-slate-50 group hover:bg-slate-50/50 px-3 rounded-lg transition-colors">
                                          <span className={UI_SYSTEM.typography.label + " opacity-60"}>{translateSpecKey(key)}</span>
                                          <span className="text-xs font-semibold text-industrial-gray">{formatSpecValue(key, val)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : <div className="text-steel-gray italic font-medium py-16 text-center text-xs uppercase tracking-widest opacity-40">TECHNICAL DATA COMING SOON</div>}
                      </div>
                    </div>
                  )}

                  {section.id === 'modeller' && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3].map((v) => (
                        <div key={v} className={"bg-white rounded-2xl p-8 transition-all group overflow-hidden " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry + " hover:scale-[1.02]"}>
                          <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center border border-slate-100 group-hover:bg-air-blue/5 transition-colors">
                            <BrandIcon brand={product.brand} className="scale-125 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                          </div>
                          <h4 className="font-semibold text-industrial-gray mb-2 text-base tracking-tight uppercase">{product.sku}-{v}</h4>
                          <p className="text-steel-gray text-[10px] font-medium mb-6 leading-relaxed">Advanced variant with optimized performance metrics for professional HVAC deployments.</p>
                          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                            <div className="text-primary-navy font-semibold text-lg">{formatCurrency((product.price + (v - 1) * 200), lang, { maximumFractionDigits: 0 })}</div>
                            <button className="p-2 bg-slate-100 hover:bg-primary-navy text-industrial-gray hover:text-white rounded-xl transition-all shadow-sm"><ChevronRight size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'dokumanlar' && (
                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {['installationGuide', 'userManual', 'maintenanceManual', 'safetyInfo', 'warrantyTerms', 'technicalSpecsDoc'].map((doc, i) => (
                        <div key={i} className={"bg-white rounded-3xl p-8 transition-all group text-center " + UI_SYSTEM.layout.borderLight + " " + UI_SYSTEM.layout.shadowAiry + " hover:shadow-md"}>
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-navy group-hover:rotate-12 transition-all duration-500 shadow-inner"><FileText size={36} className="text-primary-navy group-hover:text-white transition-colors" /></div>
                          <h4 className="font-semibold text-industrial-gray uppercase tracking-tight text-xs mb-6 min-h-[2.5rem] leading-relaxed px-4">{t(`pdp.docs.${doc}`)}</h4>
                          <button className="w-full bg-slate-100 hover:bg-primary-navy text-industrial-gray hover:text-white py-4 px-6 rounded-xl transition-all font-semibold text-[9px] uppercase tracking-widest flex items-center justify-center space-x-3 active:scale-95">
                            <Download size={16} /> <span>DOWNLOAD PDF</span>
                          </button>
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

      {relatedProducts.length > 0 && (
        <div className="bg-white py-20 sm:py-32">
          <div className={UI_SYSTEM.layout.containerNarrow + " text-center"}>
            <h2 className={UI_SYSTEM.typography.h2 + " mb-12 uppercase"}>{t('pdp.relatedProducts')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} compact />)}
            </div>
          </div>
        </div>
      )}
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} productName={product.name} productId={product.id} />
    </div>
  )
}

export default ProductDetailPage
