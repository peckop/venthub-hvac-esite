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
import { Loader2, LayoutGrid, List } from 'lucide-react'
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
    products?: Product[]
    isLoading?: boolean
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

const ProductsDiscoveryView: React.FC<ProductsDiscoveryViewProps> = ({ 
    products = [],
    isLoading = false
}) => {
    const router = useRouter()
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
        <div className="bg-[#020617] min-h-screen relative pb-12 w-full pt-16 md:pt-24">
            
            <div className={`
                transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 w-full overflow-hidden 
                bg-[#020617] border-b border-white/5 shadow-2xl relative
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
                        className="bg-white rounded-[2.5rem] relative z-20 px-4 md:px-8 lg:px-12 pt-10 pb-20 mt-8 max-w-[1600px] mx-auto min-h-[60vh] shadow-2xl"
                    >
                        {/* Başlık ve Toolbars */}
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight capitalize mb-2">
                                    Tüm Ürünlerimiz
                                </h2>
                                {!isLoading && (
                                    <p className="text-slate-500 font-medium text-sm">
                                        Sistemdeki tüm <span className="text-cyan-600 font-bold px-1">{products.length}</span> ürün listeleniyor
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
                                <p className="text-slate-500 mb-6 max-w-sm">Daha fazla ürün görmek için kategorilerden birini seçin.</p>
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
            </AnimatePresence>
        </div>
    )
}

export default ProductsDiscoveryView
