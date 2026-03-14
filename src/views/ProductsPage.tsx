'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Product, Category, FtsProductResult } from '../lib/supabase'
import dynamic from 'next/dynamic'
import ProductCard from '../components/ProductCard'

// Lazy load heavy components
const CategoryOrbitCarousel = dynamic(() => import('../components/products').then(mod => mod.CategoryOrbitCarousel), { 
  ssr: true,
  loading: () => <div className="h-[400px] bg-slate-900 animate-pulse rounded-3xl" />
})
const ApplicationCards = dynamic(() => import('../components/products').then(mod => mod.ApplicationCards), { ssr: true })
const BrandsShowcase = dynamic(() => import('../components/BrandsShowcase'), { ssr: true })
const UndecidedUserCTA = dynamic(() => import('../components/UndecidedUserCTA').then(mod => mod.UndecidedUserCTA), { ssr: true })
const TrustSection = dynamic(() => import('../components/TrustSection'), { ssr: true })
const LeadModal = dynamic(() => import('../components/LeadModal'), { ssr: false })
const Seo = dynamic(() => import('../components/Seo'), { ssr: true })

import { useI18n } from '../i18n/I18nProvider'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { getCategoryDisplayName } from '../utils/categoryHelpers'


// Helper: Get all descendant category IDs (including self)
const getAllDescendantIds = (categories: Category[], parentId: string): string[] => {
  const result = [parentId]
  const queue = [parentId]
  while (queue.length > 0) {
    const currentId = queue.shift()!
    const children = categories.filter(c => c.parent_id === currentId)
    for (const child of children) {
      result.push(child.id)
      queue.push(child.id)
    }
  }
  return result
}

// Recursive Category Item
type CategoryNode = Category & {
  children: CategoryNode[]
}

const CategoryTree = ({ categories, selectedCategory, onSelectCategory, t }: { categories: Category[], selectedCategory: string | null, onSelectCategory: (id: string | null) => void, t: (key: string) => string }) => {
  // Build hierarchy
  const buildTree = (cats: Category[]): CategoryNode[] => {
    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []
    cats.forEach(c => map.set(c.id, { ...c, children: [] }))
    cats.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.children.push(map.get(c.id)!)
      } else {
        roots.push(map.get(c.id)!)
      }
    })
    return roots
  }

  const tree = React.useMemo(() => buildTree(categories), [categories])

  const renderNode = (node: CategoryNode, depth: number = 0) => {
    const isSelected = selectedCategory === node.id
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = isSelected || (selectedCategory && node.children.some((c: CategoryNode) => c.id === selectedCategory)) // Simple expansion logic

    return (
      <li key={node.id} className="relative">
        <button
          onClick={() => onSelectCategory(node.id)}
          className={`w-full text-left py-1.5 rounded transition-colors flex items-center justify-between group
            ${isSelected ? 'text-primary-navy font-bold bg-primary-navy/5' : 'text-steel-gray hover:text-industrial-gray hover:bg-gray-50'}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="truncate">{getCategoryDisplayName(node)}</span>
          {hasChildren && (
            <span className="text-gray-400 group-hover:text-gray-600 text-xs mr-2">
              ▼
            </span>
          )}
        </button>
        {hasChildren && (
          <ul className={`mt-1 space-y-1 ${isExpanded ? 'block' : 'hidden'}`}>
            {node.children.map((child: CategoryNode) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <ul className="space-y-1 text-sm">
      <li>
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 ${!selectedCategory ? 'font-bold text-primary-navy bg-primary-navy/5' : 'text-steel-gray'}`}
        >
          {t('common.allCategories')}
        </button>
      </li>
      {tree.map(root => renderNode(root))}
    </ul>
  )
}

// Filter Sidebar Component
const FilterSidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  availableBrands,
  selectedBrands,
  onToggleBrand,
  priceRange,
  onPriceChange,
  t
}: {
  categories: Category[],
  selectedCategory: string | null,
  onSelectCategory: (id: string | null) => void,
  availableBrands: string[],
  selectedBrands: string[],
  onToggleBrand: (brand: string) => void,
  priceRange: { min: string, max: string },
  onPriceChange: (type: 'min' | 'max', val: string) => void,
  t: (key: string) => string
}) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-industrial-gray mb-3">{t('common.categories')}</h3>
        <CategoryTree
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          t={t}
        />
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold text-industrial-gray mb-3">{t('common.brands')}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {availableBrands.map(brand => (
            <label key={brand} className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onToggleBrand(brand)}
                className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-industrial-gray mb-3">{t('common.priceRange')}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-primary-navy focus:border-primary-navy"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-primary-navy focus:border-primary-navy"
          />
        </div>
      </div>
    </aside>
  )
}

interface ProductsPageProps {
  initialCategories: Category[]
  initialBrands?: string[]
  serverProducts?: any[]
}

const ProductsPage: React.FC<ProductsPageProps> = ({ 
  initialCategories = [], 
  initialBrands = [],
  serverProducts = []
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const hookSearchParams = useSearchParams()
  const { t } = useI18n()
  const [leadOpen, setLeadOpen] = useState(false)

  // Use server params for initial paint, fallback to hook for dynamic updates
  const getParam = (key: string): string => {
    const val = {}[key] || (hookSearchParams ? hookSearchParams.get(key) : null)
    return typeof val === 'string' ? val : (Array.isArray(val) ? val[0] : '')
  }

  const qParam = getParam('q').trim()
  const catParam = getParam('category') || null
  const brandsParam = useMemo(() => {
    const b = {}['brands'] || (hookSearchParams ? hookSearchParams.get('brands') : null)
    const str = typeof b === 'string' ? b : (Array.isArray(b) ? b[0] : '')
    return str ? str.split(',').filter(Boolean) : []
  }, [{}, hookSearchParams])

  const minPriceParam = getParam('min_price')
  const maxPriceParam = getParam('max_price')
  const isAll = getParam('all') === '1'

  // Internal State
  const [inputValue, setInputValue] = useState(qParam)
  const [activeQuery, setActiveQuery] = useState(qParam)

  // Data State
  const [products, setProducts] = useState<Product[] | FtsProductResult[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setProducts(serverProducts)
  }, [serverProducts])

  // Filter State
  const [availableBrands, setAvailableBrands] = useState<string[]>(initialBrands)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Scroll Restoration
  useManualScrollRestoration(loading)

  const categoryHidePriceMap = useMemo(() => {
    const map = new Map<string, boolean>()
    categories.forEach(c => {
      if (c.metadata?.hide_price === true) map.set(c.id, true)
    })
    return map
  }, [categories])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const appSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openLeadModal = () => setLeadOpen(true)
    }
  }, [])

  // Sync Input with URL
  useEffect(() => {
    setInputValue(qParam)
    setActiveQuery(qParam)
  }, [qParam])

  // Debounce Input -> URL Update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== qParam) {
        updateUrl({ q: inputValue })
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [inputValue, qParam, pathname, router])

  const joinedBrands = brandsParam.join(',')

  // Main Data Fetcher
  useEffect(() => {
    let active = true

    async function fetchData() {
      setLoading(true)
      try {
        const { getProductsEnriched } = await import('../lib/supabase')
        const hasFilters = catParam || brandsParam.length > 0 || minPriceParam || maxPriceParam

        if (activeQuery || hasFilters) {
          const categoryIds = catParam ? getAllDescendantIds(categories, catParam) : undefined
          
          const results = await getProductsEnriched({
            searchQuery: activeQuery || undefined,
            categoryIds,
            brand: brandsParam[0],
            minPrice: minPriceParam ? Number(minPriceParam) : undefined,
            maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
            limit: 50
          })

          if (active) {
            setProducts(results)
          }
        }
        else if (isAll) {
          const all = await getProductsEnriched({ limit: 1000 })
          if (active) setProducts(all)
        }
        else {
          setProducts([])
        }
      } catch (e) {
        console.error('Fetch error', e)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => { active = false }
  }, [activeQuery, catParam, joinedBrands, minPriceParam, maxPriceParam, isAll, categories, brandsParam])


  // Helper: Update URL params
  const updateUrl = (patch: Record<string, string | null>) => {
    const current = hookSearchParams ? new URLSearchParams(hookSearchParams.toString()) : new URLSearchParams()
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') current.delete(k)
      else current.set(k, v)
    })
    router.push(`${pathname}?${current.toString()}`)
  }


  // Handlers
  const handleCategorySelect = (id: string | null) => updateUrl({ category: id })
  const handleBrandToggle = (brand: string) => {
    const current = brandsParam[0]
    updateUrl({ brands: current === brand ? null : brand })
  }
  const handlePriceChange = (type: 'min' | 'max', val: string) => updateUrl({ [`${type}_price`]: val })

  const showSidebar = isAll || activeQuery || catParam || brandsParam.length > 0
  const isDiscovery = !showSidebar

  const breadcrumbLabel = activeQuery ? `"${activeQuery}"` : (isAll ? t('common.allProducts') : t('common.discover'))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Seo
        title={`${breadcrumbLabel} | VentHub`}
        description={t('products.discoverSeoDesc')}
        noindex={Boolean(activeQuery)}
      />

      <div className="flex items-center text-sm text-steel-gray mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span className="text-industrial-gray font-medium">{
          activeQuery
            ? breadcrumbLabel
            : (isAll
              ? t('common.allProducts')
              : (catParam
                ? (categories.find(c => c.id === catParam) ? getCategoryDisplayName(categories.find(c => c.id === catParam)!) : t('common.products'))
                : t('common.discover'))
            )
        }</span>
      </div>

      {!isDiscovery && (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('common.searchPlaceholderLong') || 'Ürün ara...'}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-all text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 sm:p-3 rounded-lg border ${viewMode === 'grid' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-steel-gray border-gray-200 hover:border-primary-navy'}`}
            >
              <GridIcon size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 sm:p-3 rounded-lg border ${viewMode === 'list' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-steel-gray border-gray-200 hover:border-primary-navy'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {showSidebar && (
          <FilterSidebar
            categories={categories}
            availableBrands={availableBrands}
            selectedCategory={catParam}
            onSelectCategory={handleCategorySelect}
            selectedBrands={brandsParam}
            onToggleBrand={handleBrandToggle}
            priceRange={{ min: minPriceParam, max: maxPriceParam }}
            onPriceChange={handlePriceChange}
            t={t}
          />
        )}

        <div className="flex-1 w-full min-w-0">
          {isDiscovery && (
            <DiscoveryContent appSectionRef={appSectionRef} />
          )}

          {!isDiscovery && (
            <div className="w-full">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n} className="bg-gray-100 rounded-xl h-64 sm:h-80 animate-pulse" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 sm:py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-3xl sm:text-4xl mb-4">🔍</div>
                  <h3 className="text-base sm:text-lg font-medium text-industrial-gray">Sonuç Bulunamadı</h3>
                  <p className="text-sm sm:text-base text-steel-gray mt-1">Lütfen filtreleri temizleyin veya başka bir terim deneyin.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="mt-6 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {products.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p as Product}
                        layout={viewMode}
                        hidePrice={Boolean(p.category_id && categoryHidePriceMap.get(p.category_id))}
                        compact={viewMode === 'grid'}
                      />
                    ))}
                  </div>
                  <div className="mt-12 sm:mt-16">
                    <UndecidedUserCTA />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </div>
  )
}

const DiscoveryContent = ({
  appSectionRef
}: {
  appSectionRef: React.RefObject<HTMLDivElement>
}) => {
  return (
    <div className="space-y-12 sm:space-y-16">
      <div className="-mx-4 sm:mx-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-primary-navy/10 border border-white/10 bg-[#020617]">
        <CategoryOrbitCarousel />
      </div>
      <div ref={appSectionRef} className="px-1">
        <ApplicationCards />
      </div>
      <div className="space-y-12 sm:space-y-16">
        <BrandsShowcase />
        <TrustSection />
      </div>
    </div>
  )
}

function GridIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
}
function ListIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>
}
function SearchIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}

export default ProductsPage
