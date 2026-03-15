'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Product, Category } from '../lib/supabase'
import dynamic from 'next/dynamic'
import ProductCard from '../components/ProductCard'
import { Filter, Search as SearchIcon, LayoutGrid, List } from 'lucide-react'

// Skeleton components for lazy-loaded components to prevent CLS
const OrbitSkeleton = () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
const ApplicationSkeleton = () => <div className="h-[300px] bg-slate-50 animate-pulse rounded-xl" />

// Lazy load heavy components with proper skeletons
const CategoryOrbitCarousel = dynamic(() => import('../components/products').then(mod => mod.CategoryOrbitCarousel), { 
  ssr: false,
  loading: () => <OrbitSkeleton />
})
const ApplicationCards = dynamic(() => import('../components/products').then(mod => mod.ApplicationCards), { 
  ssr: false,
  loading: () => <ApplicationSkeleton />
})

import { supabase } from '../lib/supabase'
import { mapDatabaseProductToDomain } from '../lib/type-converters'
import { useI18n } from '../i18n/I18nProvider'
import Seo from '../components/Seo'
import { DbProduct } from '../types/db-rows'

interface ProductsPageProps {
  initialProducts?: Product[]
  initialCategories?: Category[]
}

/**
 * Modernize edilmiş Products Page.
 * Inline filtreleme ve otonom veri akışı ile donatılmıştır.
 */
const ProductsPage: React.FC<ProductsPageProps> = ({ 
  initialProducts = [],
  initialCategories = []
}) => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized Filter Params
  const categoryParam = searchParams.get('category')
  const brandsParam = useMemo(() => searchParams.get('brands')?.split(',').filter(Boolean) || [], [searchParams])
  const sortParam = searchParams.get('sort') || 'newest'

  // Update URL helper
  const updateUrl = (newParams: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) params.delete(key)
      else params.set(key, Array.isArray(value) ? value.join(',') : value)
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Data Fetching
  useEffect(() => {
    const fetchProducts = async () => {
      if (initialProducts.length > 0 && !searchParams.toString() && products.length === initialProducts.length) return

      setLoading(true)
      try {
        let query = supabase.from('products').select('*').eq('status', 'active')

        const q = searchParams.get('q')
        if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`)

        const cat = searchParams.get('category')
        if (cat) query = query.contains('category_slugs', [cat])

        const br = searchParams.get('brands')?.split(',')
        if (br && br.length > 0) query = query.in('brand', br)

        if (sortParam === 'price-asc') query = query.order('price', { ascending: true })
        else if (sortParam === 'price-desc') query = query.order('price', { ascending: false })
        else query = query.order('created_at', { ascending: false })

        const { data, error } = await query
        if (error) throw error
        setProducts((data as DbProduct[]).map(mapDatabaseProductToDomain))
      } catch (err) {
        console.error('Fetch products error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchParams, initialProducts.length, sortParam, products.length])

  // Unique Brands for filtering
  const availableBrands = useMemo(() => {
    const b = new Set<string>()
    initialProducts.forEach(p => b.add(p.brand))
    return Array.from(b).sort()
  }, [initialProducts])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => updateUrl({ q: val || null }), 500)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Seo title={`${t('common.products')} | VentHub`} description={t('home.seoDesc')} />

      {/* Hero Layer */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-16 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,450px] gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Filter size={12} /> {t('common.discover')}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extralight tracking-tighter text-slate-950 leading-tight">
                Premium HVAC <br /> <span className="font-medium italic">Koleksiyonu</span>
              </h1>
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
            <div className="relative">
              <CategoryOrbitCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[280px,1fr] gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block space-y-10">
            <div className="space-y-8 sticky top-32">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">{t('common.categories')}</h3>
                <div className="space-y-2">
                  <button onClick={() => updateUrl({ category: null })} className={`block text-sm transition-colors ${!categoryParam ? 'text-cyan-600 font-bold' : 'text-slate-500 hover:text-slate-950'}`}>Tümü</button>
                  {initialCategories.filter(c => !c.parent_id).map(cat => (
                    <button key={cat.id} onClick={() => updateUrl({ category: cat.slug })} className={`block text-sm text-left transition-colors ${categoryParam === cat.slug ? 'text-cyan-600 font-bold' : 'text-slate-500 hover:text-slate-950'}`}>{cat.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">{t('common.brands')}</h3>
                <div className="space-y-3">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" checked={brandsParam.includes(brand)}
                        onChange={() => {
                          const newBrands = brandsParam.includes(brand) ? brandsParam.filter(b => b !== brand) : [...brandsParam, brand]
                          updateUrl({ brands: newBrands })
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-slate-500 group-hover:text-slate-950 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Feed */}
          <main className="space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}><List size={18} /></button>
              </div>
              <select value={sortParam} onChange={(e) => updateUrl({ sort: e.target.value })} className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer">
                <option value="newest">En Yeniler</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map(product => <ProductCard key={product.id} product={product} layout={viewMode} />)}
              </div>
            ) : (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Ürün Bulunamadı</h3>
                <button onClick={() => updateUrl({ category: null, brands: null, q: null })} className="mt-8 px-10 py-4 bg-slate-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-cyan-600 transition-all">Tümünü Gör</button>
              </div>
            )}
          </main>
        </div>
      </div>

      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <ApplicationCards />
        </div>
      </section>
    </div>
  )
}

export default ProductsPage
