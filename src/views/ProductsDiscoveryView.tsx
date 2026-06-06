'use client'
import { Routes } from '../utils/routes'

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

import React, { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import type { Product } from '@/types/ui-models'
import type { DomainCategory } from '../lib/type-converters'
import ProductCard from '../components/ProductCard'

const CategoryOrbitCarousel = dynamic(
    () => import('../components/products/CategoryOrbitCarousel'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-hvac-section bg-surface-darker flex items-center justify-center overflow-hidden">
                {/* Premium, spinner-less nebula glow placeholder */}
                <div className="w-300px h-300px bg-cyan-500/5 blur-100 rounded-full animate-pulse" />
            </div>
        )
    }
)

interface ProductsDiscoveryViewProps {
    initialCategories?: DomainCategory[]
    products?: Product[]
    isLoading?: boolean
}

type ViewMode = 'grid' | 'list'



const ProductsDiscoveryView: React.FC<ProductsDiscoveryViewProps> = ({ 
    products = [],
    isLoading = false
}) => {
    const router = useRouter()
    const { t } = useI18n()
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const productsRef = useRef<HTMLDivElement>(null)

    const handleSubcategorySelect = useCallback((
        categorySlug: string,
        subcategorySlug?: string
    ) => {
        // Doğrudan unified category yapısına yönlendir
        if (subcategorySlug) {
            router.push(Routes.category(categorySlug, subcategorySlug))
        } else {
            router.push(Routes.category(categorySlug))
        }
    }, [router])

    return (
        <div className="bg-surface-darker min-h-screen relative pb-12 w-full pt-16 md:pt-24">
            
            <div className={`
                transition-max-height-opacity duration-700 ease-hvac-ease z-30 w-full overflow-hidden 
                bg-surface-darker border-b border-white/5 shadow-2xl relative
            `}>
                <div className="relative w-full">
                    <CategoryOrbitCarousel
                        onSubcategorySelect={handleSubcategorySelect}
                        compact={false}
                    />
                </div>
            </div>

            {/* --- Ürün Grid --- */}
            <AnimatePresence>
                    <motion.section
                        ref={productsRef}
                        id="products-grid"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-hvac-2xl relative z-20 px-4 md:px-8 lg:px-12 pt-10 pb-20 mt-8 max-w-page mx-auto min-h-60vh shadow-2xl"
                    >
                        {/* Başlık ve Toolbars */}
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight capitalize mb-2">
                                    {t('products.allProductsTitle')}
                                </h2>
                                {!isLoading && (
                                    <p className="text-slate-500 font-medium text-sm">
                                        {t('products.systemTotalPrefix')} <span className="text-cyan-600 font-bold px-1">{products.length}</span> {t('products.itemsListed')}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={t('products.viewGrid')}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={t('products.viewList')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sonuçlar */}
                        {products.length === 0 && !isLoading ? (
                            <div className="py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <LayoutGrid className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">{t('products.emptyTitle')}</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">{t('products.emptyDesc')}</p>
                            </div>
                        ) : (
                            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'flex flex-col gap-6 max-w-5xl mx-auto'
                            }`}>
                                {products.map((product, index) => {
                                    // SADECE ilk yüklenen görünür (veya ilk sayfa) ürünleri 3D animasyonunu beklesin.
                                    // Aşağıda kalan ürünler zaten scroll edildikçe belirecek, onlar için bekleme (delay) gereksizdir.
                                    const ESTIMATED_3D_ITEMS = 8;
                                    const TOTAL_3D_DURATION = ESTIMATED_3D_ITEMS * 0.18 + 1.2;
                                    const GRID_ENTRY_DELAY = TOTAL_3D_DURATION * 0.6; // 3D show devam ederken %60'ında grid başlar
                                    
                                    const isInitialView = index < 12; // Ortalama ilk ekranda / viewportta görünen ürün sayısı

                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "50px" }}
                                            transition={{
                                                duration: 0.4,
                                                delay: isInitialView ? GRID_ENTRY_DELAY + (index * 0.05) : 0,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                        >
                                            <ProductCard
                                                product={product}
                                                layout={viewMode}
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.section>
            </AnimatePresence>
        </div>
    )
}

export default ProductsDiscoveryView
