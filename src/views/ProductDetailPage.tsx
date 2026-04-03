'use client'
import { Routes } from '../utils/routes'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  getProductBySlugOrId, 
  
  type Product, 
  supabase 
} from '../lib/supabase'
import { useCart } from '../hooks/useCartHook'
import { BrandIcon } from '../components/HVACIcons'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import { formatCurrency } from '../i18n/format'
import LeadModal from '../components/LeadModal'
import type { Tables } from '../types/db-rows'
import type { CategoryMetadata } from '../types/db-rows'
import { 
  ShoppingCart,
  FileText,
  Download,
  Award,
  Ruler,
  Settings,
  
  FolderPlus
} from 'lucide-react'
import ImageGallery from '../components/ImageGallery'
import { RichTextRenderer } from '../components/products/RichTextRenderer'
import { AddToProjectModal } from '../components/products'
import PageShell from '../components/layout/PageShell'
import { useCategories } from '../contexts/CategoryContext'
import Breadcrumb from '../components/navigation/Breadcrumb'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import { motion } from 'framer-motion'

type DbProductImage = Tables['product_images']['Row']

export interface ProductDetailPageProps {
  initialProduct?: Product | null
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ initialProduct }) => {
  const { t, lang } = useI18n()
  const params = useParams()
  const currentSlug = (params?.slug as string)?.replace(/cc$/, '')
  const { addToCart } = useCart()
  const { categories } = useCategories()
  const { wrapCategory } = useCategoryViewModel()
  
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [loading, setLoading] = useState(!initialProduct)
  const [images, setImages] = useState<{ path: string; alt?: string | null }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState('genel')
  const [leadOpen, setLeadOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isNavSticky, setIsNavSticky] = useState(false)
  
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navTriggerRef = useRef<HTMLDivElement>(null)

  const hierarchy = useMemo(() => {
    if (!product || categories.length === 0) return { main: null, sub: null };
    
    let rawSub = categories.find(c => c.id === product.subcategory_id);
    let rawMain = categories.find(c => c.id === product.category_id);

    // Fallback: Data integrity recovery.
    // If the database has a missing or null product.category_id, but the subcategory
    // exists and has a parent_id, we can reliably infer the parent category!
    if (rawSub?.parent_id) {
      rawMain = categories.find(c => c.id === rawSub!.parent_id) || rawMain;
    } else if (rawMain?.parent_id && !rawSub) {
      // Anomaly: category_id is actually pointing to a subcategory
      rawSub = rawMain;
      rawMain = categories.find(c => c.id === rawMain!.parent_id) || undefined;
    }

    return { main: wrapCategory(rawMain), sub: wrapCategory(rawSub) };
  }, [product, categories, wrapCategory]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: t('category.breadcrumbHome'), href: '/' }];
    if (hierarchy.main) items.push({ label: hierarchy.main.displayName, href: Routes.category(hierarchy.main.slug) });
    if (hierarchy.sub && hierarchy.sub.slug !== hierarchy.main?.slug) items.push({ label: hierarchy.sub.displayName, href: Routes.category(hierarchy.main?.slug || 'all', hierarchy.sub.slug) });
    if (product) items.push({ label: product.name, href: '' });
    return items;
  }, [hierarchy, product, t]);

  useEffect(() => {
    async function fetchProduct() {
      if (!currentSlug) return
      if (product && (product.id === currentSlug || product.sku === currentSlug || product.slug === currentSlug)) return
      if (initialProduct && (currentSlug === initialProduct.id || currentSlug === initialProduct.sku || currentSlug === initialProduct.slug)) {
        setProduct(initialProduct)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const productData = await getProductBySlugOrId(currentSlug)
        if (!productData) { setProduct(null); return; }
        setProduct(productData)
        try {
          const { data: imgs } = await supabase.from('product_images').select('path, alt, sort_order').eq('product_id', productData.id).order('sort_order', { ascending: true })
          const list = (imgs as DbProductImage[] | null || []).map(img => ({ path: img.path, alt: img.alt }))
          setImages(list)
        } catch { }
      } catch (error) { console.error('Error fetching product:', error); setProduct(null); } finally { setLoading(false) }
    }
    fetchProduct()
  }, [currentSlug, initialProduct, product])

  useEffect(() => {
    const handleScroll = () => { if (navTriggerRef.current) setIsNavSticky(window.scrollY > (navTriggerRef.current.offsetTop - 80)) }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [product])

  useEffect(() => {
    const handleScrollSpy = () => {
      const navEl = document.getElementById('pdp-sticky-nav')
      const headerOffset = navEl ? navEl.offsetHeight + 120 : 200
      const scrollPosition = window.scrollY + headerOffset
      const sectionOffsets = Object.entries(sectionRefs.current).map(([sectionId, ref]) => {
        if (!ref) return null
        return { id: sectionId, top: ref.offsetTop, bottom: ref.offsetTop + ref.offsetHeight }
      }).filter(Boolean) as { id: string, top: number, bottom: number }[]
      for (const section of sectionOffsets) { if (scrollPosition >= section.top && scrollPosition < section.bottom) { setActiveSection(section.id); return; } }
    }
    window.addEventListener('scroll', handleScrollSpy); handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [product, activeSection])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const navEl = document.getElementById('pdp-sticky-nav')
      window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - (navEl ? navEl.offsetHeight : 0) - 84, behavior: 'smooth' })
    }
  }

  const handleAddToCart = () => { if (product) addToCart(product, quantity) }

  const sections = [
    { id: 'genel', title: t('pdp.sections.general'), icon: FileText, bgClass: 'bg-white' },
    { id: 'olcuiler', title: t('pdp.sections.specs') || 'Teknik Özellikler', icon: Ruler, bgClass: 'bg-white' },
    { id: 'diyagramlar', title: t('pdp.sections.diagrams'), icon: FileText, bgClass: 'bg-slate-50/50' },
    { id: 'dokumanlar', title: t('pdp.sections.documents'), icon: FileText, bgClass: 'bg-white' },
    { id: 'pdf', title: t('pdp.sections.brochure'), icon: Download, bgClass: 'bg-slate-50/50' },
    { id: 'sertifikalar', title: t('pdp.sections.certificates'), icon: Award, bgClass: 'bg-white' },
    { id: 'modeller', title: t('pdp.sections.models'), icon: Settings, bgClass: 'bg-slate-50/50' }
  ]

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50/30"><div className="text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy mx-auto mb-4" /><p className="text-steel-gray text-xs font-bold uppercase tracking-widest">{t('pdp.loading')}</p></div></div>
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-slate-50/30"><div className="text-center"><h1 className="text-xl font-bold text-industrial-gray mb-4">{t('pdp.productNotFound')}</h1><Link href="/" className="text-primary-navy hover:text-secondary-blue font-bold text-sm uppercase tracking-widest">{t('pdp.backHome')}</Link></div></div>

  const categoryMetadata = hierarchy.main?.raw?.metadata as CategoryMetadata | null

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${product.brand} ${product.name} | VentHub`} description={product.description || `${product.brand} ${product.name} ürünü hakkında detaylar.`} />
      
      {/* HERO SECTION - VENTHUB SIGNATURE (WHITE PRODUCT) */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* FIXED BREADCRUMB - VENTHUB SIGNATURE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-12"
          >
            <Breadcrumb items={breadcrumbItems} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Premium Product Specifications</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl lg:text-7xl font-extralight tracking-tighter text-slate-900 leading-[1.1] mb-10"
          >
            {product.name.split(' ').slice(0, -1).join(' ')} <span className="font-medium text-slate-950 italic">{product.name.split(' ').slice(-1)}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed"
          >
            {product.brand} mühendisliği ile {hierarchy.sub?.displayName || 'HVAC'} alanında yüksek verimli çözüm.
          </motion.p>
        </div>
      </section>

      <PageShell spacing="none" className="py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative group bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
              <ImageGallery images={images} productName={product.name} slug={product.slug || product.name} modelType={categoryMetadata?.model_type} />
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col pt-10">
            <div className="flex items-center gap-4 mb-8">
              <BrandIcon brand={product.brand} className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="text-cyan-600 font-black text-[10px] tracking-[0.2em] uppercase">{product.brand} Official</span>
                <span className="text-slate-400 text-[8px] font-medium tracking-[0.2em]">{t('pdp.officialDistributor')}</span>
              </div>
            </div>

            <div className="mb-10 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">{t('pdp.priceAvailability')}</span>
              <div className="flex flex-col">
                <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter mb-2">
                  {categoryMetadata?.hide_price ? t('common.requestQuote') : formatCurrency(product.price, lang)}
                </div>
                {!categoryMetadata?.hide_price && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('pdp.vatIncluded')}</span>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('pdp.qty')}</span>
                  <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-xl font-bold text-slate-900">-</button>
                    <span className="w-12 text-center font-black text-slate-950 text-base">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-xl font-bold text-slate-900">+</button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {categoryMetadata?.hide_price ? (
                    <button onClick={() => setLeadOpen(true)} className="w-full bg-slate-950 hover:bg-cyan-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"><Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" /><span className="text-xs uppercase tracking-[0.2em]">{t('pdp.techQuote')}</span></button>
                  ) : (
                    <button onClick={handleAddToCart} disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')} className="w-full bg-slate-950 hover:bg-cyan-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50 group active:scale-95"><ShoppingCart size={20} className="group-hover:translate-x-1 transition-transform" /><span className="text-xs uppercase tracking-[0.2em]">{t('pdp.addToCart')}</span></button>
                  )}
                  <button onClick={() => setIsProjectModalOpen(true)} className="w-full bg-white border-2 border-slate-100 hover:border-slate-900 text-slate-950 font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-95"><FolderPlus size={20} /><span className="text-xs uppercase tracking-[0.2em]">{t('pdp.actions.addToProject')}</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      <AddToProjectModal product={product} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <div ref={navTriggerRef} className="h-0" />

      <div id="pdp-sticky-nav" className={`transition-all duration-500 z-[40] bg-white/90 backdrop-blur-2xl border-b border-slate-100 ${isNavSticky ? 'fixed top-[56px] md:top-[80px] left-0 right-0 shadow-xl shadow-slate-900/5' : 'relative mt-12'}`}>
        <PageShell spacing="none" className="flex items-center justify-between">
          <nav className="flex space-x-2 overflow-x-auto py-4 no-scrollbar">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all ${activeSection === section.id ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
                <section.icon size={14} /> <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </PageShell>
      </div>

      <div className="space-y-0">
        {sections.map((section) => (
          <PageShell key={section.id} ref={(el) => { sectionRefs.current[section.id] = el }} data-section={section.id} spacing="lg" className={`${section.bgClass} transition-all duration-500 border-b border-slate-50 last:border-0`}>
            <div className="flex items-center gap-6 mb-16">
              <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/10"><section.icon size={24} /></div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">{section.title}</h2>
            </div>
            {section.id === 'genel' && (
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg font-light italic"><RichTextRenderer content={product.description || t('pdp.descFallback')} /></div>
              </div>
            )}
          </PageShell>
        ))}
      </div>

      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} productName={product.name} _productId={product.id} />
    </div>
  )
}

export default ProductDetailPage
