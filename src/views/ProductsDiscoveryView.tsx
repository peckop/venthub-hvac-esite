'use client'

/**
 * @view ProductsDiscoveryView
 * @description "Ürünleri Keşfet" sayfası.
 *
 * MİMARİ & UX:
 * 1. 3D Carousel sticky olarak sayfanın üstünde kalır.
 * 2. Varsayılan (seçim yokken veya tepe noktasındayken) büyüktür (500px).
 * 3. Kategori seçildiğinde ürünler yüklenirken aşağıya doğru ekran kayar,
 *    bu esnada 3D Carousel de 120px/200px bandına küçülür (compact mod).
 * 4. Sabit (sticky) küçülmüş moddayken üstüne tıklanırsa YERİNDE genişler.
 * 5. Kullanıcı ekranın en tepesine döndüğünde eski büyük haline döner.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2, LayoutGrid, List } from 'lucide-react'
import type { Product } from '../lib/supabase'
import type { DomainCategory } from '../lib/type-converters'
import ProductCard from '../components/ProductCard'

// 3D Carousel dinamik import
const CategoryOrbitCarousel = dynamic(
    () => import('../components/products/CategoryOrbitCarousel'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-[#020617] flex flex-col items-center justify-center animate-pulse gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-cyan-400/50 text-sm">3D Yükleniyor...</span>
            </div>
        )
    }
)

interface ProductsDiscoveryViewProps {
    initialCategories?: DomainCategory[]
}

type ViewMode = 'grid' | 'list'

function ProductsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl bg-slate-100 animate-pulse"
                    style={{ height: 340 }}
                />
            ))}
        </div>
    )
}

const ProductsDiscoveryView: React.FC<ProductsDiscoveryViewProps> = () => {
    const [selectionLabel, setSelectionLabel] = useState<string | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // Carousel modları
    // isCompact: Aşağı inildiğinde veya seçim yapıldığında mini hale gelir
    // isExpanded: Mini moddayken (isCompact) içi tıklanırsa YERİNDE genişler
    const [isCompact, setIsCompact] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const productsRef = useRef<HTMLDivElement>(null)

    // Subcategory (veya ana sub olmayan category) seçildiğinde
    const handleSubcategorySelect = useCallback(async (
        categorySlug: string,
        subcategorySlug?: string
    ) => {
        const label = subcategorySlug
            ? subcategorySlug.replace(/-/g, ' ')
            : categorySlug.replace(/-/g, ' ')

        setSelectionLabel(label)
        setIsCompact(true)     // Seçimi yapınca compact mod devreye girsin
        setIsExpanded(false)   // Genişleme varsa kapansın
        setIsLoading(true)
        setHasLoaded(false)

        try {
            const { getProductsEnriched } = await import('../lib/supabase')
            const catIds = [categorySlug, subcategorySlug].filter(Boolean) as string[]
            const data = await getProductsEnriched({ categoryIds: catIds, limit: 100 })
            setProducts(data)
        } catch (err) {
            console.error('Ürün yükleme hatası:', err)
            setProducts([])
        } finally {
            setIsLoading(false)
            setHasLoaded(true)
        }
    }, [])

    // Ürünler yüklenince smooth scroll
    useEffect(() => {
        if (hasLoaded && productsRef.current && isCompact && !isExpanded) {
            // Biraz boşluk bırakarak scroll (header payı)
            const yOffset = -220 // compact header'ın tahmini yüksekliği kadar offset
            const element = productsRef.current
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset

            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }, [hasLoaded, isCompact, isExpanded])

    // Scroll takibi: Sayfa başına gelince eski tam formuna döner
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < 30) {
                if (isCompact) setIsCompact(false)
                if (isExpanded) setIsExpanded(false)
            } else if (hasLoaded && !isCompact) {
                // Eğer ekran aşağı doğru kendi kendine scrol ediliyorsa ve 
                // zaten bir şeyler yuklendiyse ve buyuk isek tekrar kuculelim:
                setIsCompact(true)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isCompact, isExpanded, hasLoaded])

    // Mini hale geldiğinde genişletme geçişi
    const handleCompactCarouselClick = useCallback(() => {
        setIsExpanded(prev => !prev)
    }, [])

    const handleBackToCarousel = useCallback(() => {
        setIsCompact(false)
        setIsExpanded(false)
        setSelectionLabel(null)
        setProducts([])
        setHasLoaded(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    // Kapatma butonu aksiyonu
    const handleCollapse = useCallback(() => {
        setIsExpanded(false)
    }, [])

    return (
        <div className="bg-[#020617] min-h-screen relative pb-12 w-full pt-16 md:pt-24">
            
            {/* CAROUSEL KAPSAYICISI: Sticky element.
                Site Header'ı (z-50) kapatmamak için z-30 kullanıyoruz.
                Normal modda (isCompact=false) top-0 veya top-header farketmez çünkü büyük.
                Compact modda (isCompact=true) mutlaka header yüksekliği kadar offset (top-16/24) almalıdır ki 
                header'ın altında kalarak takip edebilsin.
            */}
            <div className={`
                sticky transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 w-full overflow-hidden 
                bg-[#020617] border-b border-white/5 shadow-2xl
                ${isCompact ? 'top-16 md:top-24' : 'top-0'}
            `}>
                <div className="relative w-full">
                    
                    {/* Compact Mode Overlay - Sadece Tıklama İçin */}
                    {isCompact && !isExpanded && (
                        <button
                            onClick={handleCompactCarouselClick}
                            className="absolute inset-0 z-20 w-full h-full cursor-pointer bg-transparent focus:outline-none"
                            title="Kategori değiştirmek için tıklayın"
                            aria-label="Carousel'i genişlet"
                        />
                    )}

                    <CategoryOrbitCarousel
                        onSubcategorySelect={handleSubcategorySelect}
                        compact={isCompact && !isExpanded}
                    />

                    {/* Expand/Collapse İpuçları ve Butonları */}
                    <AnimatePresence>
                        {isCompact && !isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none flex items-end justify-center pb-2 z-10"
                            >
                                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4 text-cyan-400 rotate-180" />
                                    SEÇİMİ DEĞİŞTİR
                                </span>
                            </motion.div>
                        )}
                        {isCompact && isExpanded && (
                            <motion.button
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onClick={handleCollapse}
                                className="absolute bottom-4 right-4 md:right-10 z-30 flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-600/90 backdrop-blur-md text-white font-bold text-sm border border-cyan-400 hover:bg-cyan-500 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all shadow-xl"
                            >
                                <ChevronDown className="w-4 h-4" />
                                KÜÇÜLT
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- Ürün Grid --- */}
            <AnimatePresence>
                {(isLoading || hasLoaded) && (
                    <motion.section
                        ref={productsRef}
                        id="products-grid"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-[2.5rem] relative z-20 px-4 md:px-8 lg:px-12 pt-10 pb-20 mt-8 max-w-[1600px] mx-auto min-h-[60vh] shadow-2xl"
                    >
                        {/* Başlık ve Toolbars */}
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight capitalize mb-2">
                                    {selectionLabel}
                                </h2>
                                {!isLoading && (
                                    <p className="text-slate-500 font-medium text-sm">
                                        Toplam <span className="text-cyan-600 font-bold px-1">{products.length}</span> ürün listeleniyor
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Izgara"
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Liste"
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleBackToCarousel}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-cyan-600 hover:shadow-cyan-500/20 hover:shadow-lg transition-all duration-300"
                                >
                                    Filtreyi Temizle
                                    <ChevronDown className="w-4 h-4 rotate-180 opacity-70" />
                                </button>
                            </div>
                        </div>

                        {/* Sonuçlar */}
                        {isLoading ? (
                            <ProductsGridSkeleton />
                        ) : products.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <LayoutGrid className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Ürün Bulunamadı</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">Bu kategori altında henüz listelenen bir ürün bulunmuyor.</p>
                                <button
                                    onClick={handleBackToCarousel}
                                    className="px-6 py-2 bg-white border border-slate-200 text-cyan-700 font-semibold rounded-full shadow-sm hover:border-cyan-200 hover:bg-cyan-50 transition-colors"
                                >
                                    Farklı bir kategori seç
                                </button>
                            </div>
                        ) : (
                            <div className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'flex flex-col gap-6 max-w-5xl mx-auto'
                            }>
                                {products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        layout={viewMode}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Sadece sayfa ilk açıldığında görünen inceden ipucu */}
            {!hasLoaded && !isLoading && (
                <div className="absolute top-[80vh] left-1/2 -translate-x-1/2 pointer-events-none">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="text-white/40 text-xs font-medium tracking-widest flex flex-col items-center gap-2"
                    >
                        <span>SEÇİM YAPIN</span>
                        <ChevronDown className="w-5 h-5 opacity-60" />
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default ProductsDiscoveryView
