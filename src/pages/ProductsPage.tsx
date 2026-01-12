import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Product, Category, FtsProductResult } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import BrandsShowcase from '../components/BrandsShowcase'
import TrustSection from '../components/TrustSection'
import LeadModal from '../components/LeadModal'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { UndecidedUserCTA } from '../components/UndecidedUserCTA'
import { ProductsHero, CategoryShowcaseCards, ApplicationCards } from '../components/products'

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
interface CategoryNode extends Category {
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
        map.get(c.parent_id)!.children.push(map.get(c.id))
      } else {
        roots.push(map.get(c.id))
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
          <span className="truncate">{node.name}</span>
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
  // Prefix unused var with underscore
  const _rootCats = categories.filter(c => c.level === 0)

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

const ProductsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [leadOpen, setLeadOpen] = useState(false)

  // URL Params State
  const params = new URLSearchParams(location.search)
  const qParam = params.get('q')?.trim() || ''
  const catParam = params.get('category')
  const brandsParam = params.get('brands')?.split(',').filter(Boolean) || []
  const minPriceParam = params.get('min_price') || ''
  const maxPriceParam = params.get('max_price') || ''
  const isAll = params.get('all') === '1'

  // Internal State
  const [inputValue, setInputValue] = useState(qParam)
  const [activeQuery, setActiveQuery] = useState(qParam)

  // Data State
  const [products, setProducts] = useState<Product[] | FtsProductResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // Filter State
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Scroll Restoration
  useManualScrollRestoration(loading)

  // Create map of category ID -> hide_price for efficient lookup
  const categoryHidePriceMap = React.useMemo(() => {
    const map = new Map<string, boolean>()
    categories.forEach(c => {
      // Check for strict boolean true to avoid accidental hiding
      if (c.metadata?.hide_price === true) map.set(c.id, true)
    })
    return map
  }, [categories])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const appSectionRef = useRef<HTMLDivElement>(null)

    // Global Lead Modal Trigger
    ; ((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)

  // 1. Initialize & Fetch Metadata (Cats, Brands)
  useEffect(() => {
    async function init() {
      try {
        const { getCategories, getAllProducts } = await import('../lib/supabase')
        const cats = await getCategories()
        setCategories(cats)

        // Extract unique brands for filter
        // Note: Ideally this comes from a 'brands' table or RPC, but distinct on products works for now
        const allProds = await getAllProducts()
        const brands = Array.from(new Set(allProds.map(p => p.brand).filter(Boolean))) as string[]
        setAvailableBrands(brands.sort())
      } catch (e) {
        console.error('Init error', e)
      }
    }
    init()
  }, [])

  // 2. Sync Input with URL
  useEffect(() => {
    setInputValue(qParam)
    setActiveQuery(qParam)
  }, [qParam])

  // 3. Debounce Input -> URL Update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== qParam) {
        updateUrl({ q: inputValue })
      }
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, qParam])

  // 4. Main Data Fetcher
  useEffect(() => {
    let active = true

    async function fetchData() {
      setLoading(true)
      try {
        const { ftsSearchProducts, getAllProducts } = await import('../lib/supabase')

        // Mode A: Search (Query or Filters active)
        const hasFilters = catParam || brandsParam.length > 0 || minPriceParam || maxPriceParam

        if (activeQuery || hasFilters) {
          // Construct Filters
          const filters: Record<string, string | string[] | undefined> = {}
          // For category: Get all descendant IDs for hierarchical filtering
          const categoryIdsToFilter = catParam ? getAllDescendantIds(categories, catParam) : []
          if (categoryIdsToFilter.length > 0) filters.category_ids = categoryIdsToFilter
          if (brandsParam.length > 0) filters.brand = brandsParam[0] // Single brand support
          if (minPriceParam) filters.price_min = minPriceParam
          if (maxPriceParam) filters.price_max = maxPriceParam

          // Fetch products - if no query but category filter, get all products in those categories
          let results: FtsProductResult[]
          if (activeQuery) {
            results = await ftsSearchProducts(activeQuery, 50, Object.keys(filters).length ? filters : undefined)
          } else {
            // No search query, just filtering by category - fetch all products and filter client-side
            const allProds = await getAllProducts()
            results = allProds
              .filter(p => {
                // Category filter
                if (categoryIdsToFilter.length > 0 && !categoryIdsToFilter.includes(p.category_id)) return false
                // Brand filter
                if (filters.brand && p.brand !== filters.brand) return false
                // Price filters
                const price = parseFloat(p.price || '0')
                if (filters.price_min && price < parseFloat(String(filters.price_min))) return false
                if (filters.price_max && price > parseFloat(String(filters.price_max))) return false
                return true
              })
              .map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                brand: p.brand,
                price: p.price,
                rank: null,
                is_fuzzy_match: false,
                status: p.status,
                image_url: p.image_url,
                image_alt: p.image_alt,
                is_featured: p.is_featured,
                stock_qty: p.stock_qty,
                model_code: p.model_code
              }))
          }

          // Enhanced results with generic attachCovers + active status patch
          const buildPublicUrl = (path: string) => `${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`

          async function attachCovers<T extends { id: string }>(list: T[]): Promise<(T & { image_url?: string, image_alt?: string | null })[]> {
            if (!Array.isArray(list) || list.length === 0) return list
            try {
              const ids = list.map(p => p.id)
              const { supabase } = await import('../lib/supabase')
              const { data: imgs } = await supabase
                .from('product_images')
                .select('product_id,path,sort_order,alt')
                .in('product_id', ids)
                .order('sort_order', { ascending: true })
              const firstMap = new Map<string, { path: string, alt?: string | null }>()
              for (const r of (imgs || []) as { product_id: string, path: string, sort_order: number, alt?: string | null }[]) {
                if (!firstMap.has(r.product_id)) firstMap.set(r.product_id, { path: r.path, alt: r.alt ?? null })
              }
              return list.map(p => {
                const cover = firstMap.get(p.id)
                return cover ? { ...p, image_url: buildPublicUrl(cover.path), image_alt: cover.alt ?? null } : p
              })
            } catch { return list }
          }

          const withCovers = await attachCovers(results)

          if (active) {
            // Cast to compatible type
            const compatible = withCovers.map(p => ({
              ...p,
              status: 'active' as const, // Patch status
              is_featured: false, // Default
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              category_id: (p as any).category_id || (filters.category_id as string) || '', // Try to preserve category_id from result, fallback to filter
              subcategory_id: '' // Missing
            }))
            // We cast to Product[] for state simplicity as we know ProductCard handles partials if status is present
            setProducts(compatible as unknown as Product[])
          }
        }
        // Mode B: All Products
        else if (isAll) {
          const all = await getAllProducts()
          if (active) setProducts(all)
        }
        // Mode C: Discovery (Empty)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, catParam, brandsParam.join(','), minPriceParam, maxPriceParam, isAll, categories])


  // Helper: Update URL params
  const updateUrl = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    })
    navigate({ search: next.toString() }, { replace: true })
  }


  // Handlers
  const handleCategorySelect = (id: string | null) => updateUrl({ category: id })
  const handleBrandToggle = (brand: string) => {
    // Single brand mode for current SQL
    const current = brandsParam[0]
    updateUrl({ brands: current === brand ? null : brand })
  }
  const handlePriceChange = (type: 'min' | 'max', val: string) => updateUrl({ [`${type}_price`]: val })

  const showSidebar = isAll || activeQuery || catParam || brandsParam.length > 0
  const isDiscovery = !showSidebar

  // Breadcrumb
  const breadcrumbLabel = activeQuery ? `"${activeQuery}"` : (isAll ? t('common.allProducts') : t('common.discover'))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo
        title={`${breadcrumbLabel} | VentHub`}
        description={t('products.discoverSeoDesc')}
        noindex={Boolean(activeQuery)}
      />

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-steel-gray mb-6">
        <Link to="/" className="hover:text-primary-navy">{t('common.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-industrial-gray font-medium">{breadcrumbLabel}</span>
      </div>

      {/* Search Header (Always Visible in Search Mode) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={searchInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('common.searchPlaceholderLong') || 'Ürün ara...'}
            className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-all"
          />
        </div>
        {!isDiscovery && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg border ${viewMode === 'grid' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-steel-gray border-gray-200 hover:border-primary-navy'}`}
            >
              <GridIcon size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg border ${viewMode === 'list' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-steel-gray border-gray-200 hover:border-primary-navy'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
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

        {/* Listenin Ana Gövdesi */}
        <div className="flex-1">
          {/* Discovery Content (Hero, Featured, etc.) */}
          {isDiscovery && (
            <DiscoveryContent
              appSectionRef={appSectionRef}
              searchValue={inputValue}
              onSearchChange={setInputValue}
              searchInputRef={searchInputRef}
            />
          )}



          // Inside ProductsPage component render, after product grid:
          {/* Product Grid */}
          {!isDiscovery && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="bg-gray-100 rounded-xl h-80 animate-pulse" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-industrial-gray">Sonuç Bulunamadı</h3>
                  <p className="text-steel-gray mt-1">Lütfen filtreleri temizleyin veya başka bir terim deneyin.</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {products.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p as Product} // Safe cast now due to compatibility patch
                        layout={viewMode}
                        hidePrice={Boolean(p.category_id && categoryHidePriceMap.get(p.category_id))}
                      />
                    ))}
                  </div>

                  {/* Undecided User CTA - Only show if we found results, or even if filtered but empty? Better if results exist or generally bottom of list */}
                  {products.length > 0 && <UndecidedUserCTA />}
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

// Sub-component to keep main file clean
const DiscoveryContent = ({
  appSectionRef,
  searchValue,
  onSearchChange,
  searchInputRef
}: {
  appSectionRef: React.RefObject<HTMLDivElement | null>
  searchValue: string
  onSearchChange: (value: string) => void
  searchInputRef?: React.RefObject<HTMLInputElement>
}) => {
  return (
    <div className="space-y-6">
      {/* Premium Hero with Search */}
      <ProductsHero
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchInputRef={searchInputRef}
      />

      {/* Category Showcase Cards */}
      <CategoryShowcaseCards />

      {/* Application Areas */}
      <div ref={appSectionRef}>
        <ApplicationCards />
      </div>

      <BrandsShowcase />
      <TrustSection />
    </div>
  )
}

// Icons
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
