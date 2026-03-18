'use client'

import { VentImage } from '@/components/ui/VentImage'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategories, Product } from '../lib/supabase'
import { mapDatabaseCategoryToDomain, toUICategoryList, DomainCategory } from '../lib/type-converters'
import ProductCard from '../components/ProductCard'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { 
  getCategoryDisplayName
} from '../utils/categoryHelpers'
import { ChevronRight, Filter, Grid, List, ArrowLeft } from 'lucide-react'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import { formatCurrency } from '../i18n/format'
import CategoryShowcase from '../components/category/CategoryShowcase'
import CategoryLanding from '../components/category/CategoryLanding'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { UndecidedUserCTA } from '../components/UndecidedUserCTA'
import type { DbCategory } from '../types/db-rows'

export interface CategoryPageProps {
  initialCategory?: DbCategory | null
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory }) => {
  const params = useParams()
  const slug = (params?.slug || params?.subCategorySlug || params?.categorySlug) as string
  const parentSlug = (params?.parentSlug || (params?.subCategorySlug ? params?.categorySlug : undefined)) as string | undefined
  const navigate = useRouter()
  const [category, setCategory] = useState<DomainCategory | null>(initialCategory ? mapDatabaseCategoryToDomain(initialCategory) : null)
  const [parentCategory, setParentCategory] = useState<DomainCategory | null>(null)
  const [subCategories, setSubCategories] = useState<DomainCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialCategory)
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Varsayılan fiyat aralığını geniş tut (ürünler yüksek fiyatlı olabilir)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  // Teknik filtreler
  const [airflowMin, setAirflowMin] = useState<string>('')
  const [airflowMax, setAirflowMax] = useState<string>('')
  const [pressureMin, setPressureMin] = useState<string>('')
  const [pressureMax, setPressureMax] = useState<string>('')
  const [noiseMax, setNoiseMax] = useState<string>('')
  // Karşılaştırma
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Scroll Restoration
  useManualScrollRestoration(loading)

  useEffect(() => {
    async function fetchData() {
      try {
        // Hydration check: if initialCategory matches current slug, we can skip initial category fetch
        let targetCategoryRow: DbCategory | null = initialCategory || null
        let targetParentCategoryRow: DbCategory | null = null
        let categories: DbCategory[] = []

        if (!targetCategoryRow || targetCategoryRow.slug !== slug) {
          setLoading(true)
          const rawCats = await getCategories()
          categories = rawCats as unknown as DbCategory[]

          if (parentSlug && slug) {
            // Sub-category page
            targetParentCategoryRow = categories.find(c => c.slug === parentSlug && !c.parent_id) || null
            targetCategoryRow = categories.find(c => c.slug === slug && !!c.parent_id) || null
          } else if (slug) {
            // Main category page
            targetCategoryRow = categories.find(c => c.slug === slug && !c.parent_id) || null
          }
        } else if (!targetCategoryRow.parent_id) {
          // Fetch categories to find subcategories even if targetCategoryRow is from props
          const rawCats = await getCategories()
          categories = rawCats as unknown as DbCategory[]
        }

        if (!targetCategoryRow) {
          setLoading(false)
          return
        }

        setCategory(mapDatabaseCategoryToDomain(targetCategoryRow))
        setParentCategory(targetParentCategoryRow ? mapDatabaseCategoryToDomain(targetParentCategoryRow) : null)

        // Get subcategories if this is a main category
        let subs: DbCategory[] = []
        if (!targetCategoryRow.parent_id) {
          subs = categories
            .filter(c => c.parent_id === targetCategoryRow.id)
            .sort((a, b) => {
              const orderA = (a as any).sort_order ?? 0
              const orderB = (b as any).sort_order ?? 0
              if (orderA !== orderB) return orderA - orderB
              return a.name.localeCompare(b.name)
            })
          setSubCategories(toUICategoryList(subs))
        }

        // Fetch products via enriched RPC
        let productsData: Product[] = []
        const { getProductsEnriched } = await import('../lib/supabase')

        if (!targetCategoryRow.parent_id && subs.length > 0) {
          // Ana kategori ve alt kategorileri varsa: tümünü kapsayan liste
          const allCategoryIds = [targetCategoryRow.id, ...subs.map(s => s.id)]
          productsData = await getProductsEnriched({
            categoryIds: allCategoryIds,
            limit: 100
          })
        } else {
          // Alt kategori veya tekil kategori
          productsData = await getProductsEnriched({
            categoryIds: [targetCategoryRow.id],
            limit: 100
          })
        }
        
        setProducts(productsData)

        // Ürünlerden dinamik maksimum fiyatı hesapla
        const prices = productsData
          .map(p => p.price)
          .filter((v): v is number => v != null && Number.isFinite(v))
        if (prices.length > 0) {
          const maxPrice = Math.max(...prices)
          setPriceRange(([lo, hi]) => [lo, Math.max(hi, Math.ceil(maxPrice))])
        }

      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, parentSlug, initialCategory])

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const term = catSearch.trim().toLowerCase()
      if (term) {
        const modelCode = product.model_code || ''
        const hay = [product.name, product.brand, modelCode, product.sku].map(v => String(v || '').toLowerCase())
        if (!hay.some(h => h.includes(term))) return false
      }
      const priceNum = product.price
      const matchesPrice = Number.isFinite(priceNum)
        ? priceNum >= priceRange[0] && priceNum <= priceRange[1]
        : true
      const matchesBrand = selectedBrands.length === 0 || (product.brand ? selectedBrands.includes(product.brand) : false)

      // Teknik filtreler
      const af = product.airflow_capacity ?? null
      const pr = product.pressure_rating !== null && product.pressure_rating !== undefined ? Number(product.pressure_rating) : null
      const nl = product.noise_level ?? null

      const matchesAirflow = (!airflowMin || (af !== null && af >= Number(airflowMin))) && (!airflowMax || (af !== null && af <= Number(airflowMax)))
      const matchesPressure = (!pressureMin || (pr !== null && pr >= Number(pressureMin))) && (!pressureMax || (pr !== null && pr <= Number(pressureMax)))
      const matchesNoise = (!noiseMax || (nl !== null && nl <= Number(noiseMax)))

      return matchesPrice && matchesBrand && matchesAirflow && matchesPressure && matchesNoise
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return Number(a.price) - Number(b.price)
        case 'price-high':
          return Number(b.price) - Number(a.price)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Get unique brands
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter((b): b is string => !!b)))

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const { t, lang } = useI18n()

  // SEO değerleri - Safe for SSR
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">{t('category.loading')}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('category.notFound')}</h1>
          <Link href="/" className="text-primary-navy hover:text-secondary-blue">
            {t('category.backHome')}
          </Link>
        </div>
      </div>
    )
  }



  const canonicalUrl = (parentCategory && parentCategory.slug !== category.slug)
    ? `${origin}/category/${parentCategory.slug}/${category.slug}`
    : `${origin}/category/${category.slug}`

  // Construct image URL if available
  const categoryImageUrl = category.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
    : null

  // --- Display Mode Handling ---
  // Pure DB metadata approach (P04-002)
  const mergedMetadata = (category.metadata as any) || {}

  // Inheritance for hide_price from parent if not set on current
  if (mergedMetadata.hide_price === undefined && parentCategory?.metadata) {
    const pMeta = parentCategory.metadata as any
    if (pMeta.hide_price !== undefined) {
      mergedMetadata.hide_price = pMeta.hide_price
    }
  }

  const displayMode = mergedMetadata.display_mode
    || (parentCategory ? 'series' : (subCategories.length > 0 ? 'showcase' : undefined))

  if (displayMode === 'showcase') {
    // Inject metadata into category object for the component
    const enrichedCategory = { ...category, metadata: mergedMetadata }
    return (
      <>
        <Seo
          title={(category as any).seo_title || `${getCategoryDisplayName(category)} | VentHub`}
          description={(category as any).seo_desc || category.description || undefined}
          canonical={(canonicalUrl || undefined) as string | undefined}
          ogImage={categoryImageUrl || undefined}
        />
        <CategoryShowcase category={enrichedCategory} subCategories={subCategories} parentCategory={parentCategory} />
      </>
    )
  }

  if (displayMode === 'series') {
    const enrichedCategory = { ...category, metadata: mergedMetadata }
    return (
      <>
        <Seo
          title={(category as any).seo_title || `${getCategoryDisplayName(category)} | VentHub`}
          description={(category as any).seo_desc || category.description || undefined}
          canonical={(canonicalUrl || undefined) as string | undefined}
          ogImage={categoryImageUrl || undefined}
        />
        <CategoryLanding category={enrichedCategory} products={products} subCategories={subCategories} parentCategory={parentCategory} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <Seo
        title={(category as any).seo_title || `${getCategoryDisplayName(category)} | VentHub`}
        description={(category as any).seo_desc || category.description || undefined}
        canonical={(canonicalUrl || undefined) as string | undefined}
        noIndex={false}
        ogImage={categoryImageUrl || undefined} 
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('category.breadcrumbHome'), item: `${origin}/` },
              ...(parentCategory && parentCategory.slug !== category.slug ? [{ '@type': 'ListItem', position: 2, name: getCategoryDisplayName(parentCategory), item: `${origin}/category/${parentCategory.slug}` }] : []),
              { '@type': 'ListItem', position: (parentCategory && parentCategory.slug !== category.slug) ? 3 : 2, name: getCategoryDisplayName(category), item: canonicalUrl },
            ],
          }),
        }}
      />
      {/* JSON-LD: ItemList for products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: filteredProducts.map((p, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `${origin}/products/${p.id}`,
              name: p.name,
            })),
          }),
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-steel-gray hover:text-primary-navy">
              {t('category.breadcrumbHome')}
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            {parentCategory && (
              <>
                <Link
                  href={`/category/${parentCategory.slug}`}
                  className="text-steel-gray hover:text-primary-navy"
                >
                  {getCategoryDisplayName(parentCategory)}
                </Link>
                <ChevronRight size={16} className="text-steel-gray" />
              </>
            )}
            <span className="text-industrial-gray font-medium">
              {getCategoryDisplayName(category)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Geri Butonu */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('vh_is_pop', 'true');
              }
              let stack: string[] = [];
              try {
                stack = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]') : [];
              } catch { stack = []; }

              // Mevcut sayfa stack'in en üstündeyse (normal durum), bir altındaki durağa git.
              const prevPath = stack.length >= 2 ? stack[stack.length - 2] : '/';

              navigate.push(prevPath);
            }}
            className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center space-x-6">
            <div className="text-primary-navy shrink-0">
              {categoryImageUrl ? (
                <VentImage src={categoryImageUrl}
                  alt={getCategoryDisplayName(category)}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm border border-light-gray"
                 />
              ) : (
                getCategoryIcon(parentCategory?.slug || category.slug, { size: 64 })
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-industrial-gray mb-2">
                {getCategoryDisplayName(category)}
              </h1>
              <p className="text-xl text-steel-gray mb-4">
                {category.description}
              </p>
              <div className="text-steel-gray">
                {filteredProducts.length} {t('products.resultsFound')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category local search (desktop only) */}
        <div className="mb-4 hidden sm:block">
          <div className="relative max-w-md">
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder={t('category.localSearchPlaceholder') as string}
              className="w-full pl-3 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (hidden on mobile) */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h3 className="font-semibold text-industrial-gray mb-4 flex items-center">
                <Filter size={20} className="mr-2" />
                {t('category.filters')}
              </h3>

              {/* Sub-categories */}
              {subCategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-industrial-gray mb-3">{t('category.subcategories')}</h4>
                  <div className="space-y-2">
                    {subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${parentCategory?.slug || category.slug}/${sub.slug}`}
                        className="block px-3 py-2 text-sm text-steel-gray hover:text-primary-navy hover:bg-light-gray rounded transition-colors"
                      >
                        {getCategoryDisplayName(sub)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-industrial-gray mb-3">{t('category.priceRange')}</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(100000, priceRange[1])}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    aria-label={t('category.priceRange') as string}
                  />
                  <div className="flex justify-between text-sm text-steel-gray">
                    <span>{formatCurrency(0, lang, { maximumFractionDigits: 0 })}</span>
                    <span>{formatCurrency(priceRange[1], lang, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-industrial-gray mb-3">{t('category.brands')}</h4>
                  <div className="space-y-2">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Teknik Filtreler */}
              <div className="mb-6">
                <h4 className="font-medium text-industrial-gray mb-3">{t('category.techFilters')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.airflow')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder={t('category.minPlaceholder') as string} value={airflowMin} onChange={e => setAirflowMin(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                      <input type="number" placeholder={t('category.maxPlaceholder') as string} value={airflowMax} onChange={e => setAirflowMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.pressure')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder={t('category.minPlaceholder') as string} value={pressureMin} onChange={e => setPressureMin(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                      <input type="number" placeholder={t('category.maxPlaceholder') as string} value={pressureMax} onChange={e => setPressureMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.noise')}</label>
                    <input type="number" placeholder={t('category.ltePlaceholder') as string} value={noiseMax} onChange={e => setNoiseMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 1000000000])
                  setSelectedBrands([])
                  setAirflowMin(''); setAirflowMax(''); setPressureMin(''); setPressureMax(''); setNoiseMax('')
                }}
                className="w-full text-center text-sm text-steel-gray hover:text-primary-navy transition-colors"
              >
                {t('category.clearFilters')}
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-4 mb-6">
              <div className="flex items-center justify-between">
                {/* Mobile filter button */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 border border-light-gray rounded-lg text-sm text-industrial-gray hover:bg-light-gray"
                >
                  <Filter size={16} /> {t('category.filters')}
                </button>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  >
                    <option value="name">{t('category.sortByName')}</option>
                    <option value="price-low">{t('category.sortByPriceLow')}</option>
                    <option value="price-high">{t('category.sortByPriceHigh')}</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label={t('category.gridViewAria') as string}
                    aria-pressed={viewMode === 'grid'}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid'
                      ? 'bg-primary-navy text-white'
                      : 'text-steel-gray hover:bg-light-gray'
                      }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label={t('category.listViewAria') as string}
                    aria-pressed={viewMode === 'list'}
                    className={`p-2 rounded transition-colors ${viewMode === 'list'
                      ? 'bg-primary-navy text-white'
                      : 'text-steel-gray hover:bg-light-gray'
                      }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-xl p-2 sm:p-3">
              {filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                  : 'space-y-4'
                }>
                  {filteredProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      highlightFeatured={false}
                      layout={viewMode}
                      priority={i === 0}
                      hidePrice={!!(category.metadata as any)?.hide_price}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-industrial-gray mb-4">
                    {t('category.noProducts')}
                  </h3>
                  <p className="text-steel-gray mb-6">
                    {t('category.noProductsDesc')}
                  </p>
                  <button
                    onClick={() => {
                      setPriceRange([0, 10000])
                      setSelectedBrands([])
                    }}
                    className="text-primary-navy hover:text-secondary-blue transition-colors"
                  >
                    {t('category.clearFilters')}
                  </button>
                </div>
              )}
            </div>

            {/* Undecided User CTA - Only if products exist (or always? Implementation plan didn't specify, but consistent with ProductsPage) */}
            {filteredProducts.length > 0 && <UndecidedUserCTA />}

          </div>
        </div>
      </div>

      {/* Compare bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white border border-light-gray shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-industrial-gray">{t('category.compareBar')}: {compareIds.length}</span>
          <button onClick={() => setCompareOpen(true)} className="text-sm bg-primary-navy hover:bg-secondary-blue text-white px-3 py-1 rounded-full">{t('category.open')}</button>
          <button onClick={() => setCompareIds([])} className="text-sm text-steel-gray hover:text-red-600">{t('category.clean')}</button>
        </div>
      )}

      {/* Compare modal */}
      {compareOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setCompareOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-xl font-bold text-industrial-gray">{t('category.compareTitle')}</h3>
              <button onClick={() => setCompareOpen(false)} className="text-steel-gray hover:text-primary-navy">{t('category.close')}</button>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-industrial-gray">
                    <th className="py-2 pr-4">{t('category.feature')}</th>
                    {filteredProducts.filter(p => compareIds.includes(p.id)).map(p => (
                      <th key={p.id} className="py-2 pr-4 whitespace-nowrap">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-steel-gray">
                  {[
                    { label: t('category.labelBrand'), key: 'brand' },
                    { label: t('category.labelModel'), key: 'sku' },
                    { label: t('category.labelPrice'), key: 'price', render: (v: unknown) => formatCurrency(parseFloat(String(v ?? '0')), lang, { maximumFractionDigits: 0 }) },
                    { label: t('category.airflow'), key: 'airflow_capacity' },
                    { label: t('category.pressure'), key: 'pressure_rating' },
                    { label: t('category.noise'), key: 'noise_level' },
                  ].map(row => (
                    <tr key={row.label} className="border-t">
                      <td className="py-2 pr-4 font-medium text-industrial-gray">{row.label}</td>
                      {filteredProducts.filter(p => compareIds.includes(p.id)).map(p => (
                        <td key={p.id + String(row.key)} className="py-2 pr-4">
                          {row.render ? row.render((p as unknown as Record<string, unknown>)[row.key]) : String((p as unknown as Record<string, unknown>)[row.key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl p-5 animate-slideDown overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-industrial-gray">{t('category.filters')}</h3>
              <button onClick={() => setIsFilterOpen(false)} className="text-steel-gray hover:text-primary-navy">{t('category.close')}</button>
            </div>
            {/* Local search (mobile) */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder={t('category.localSearchPlaceholder') as string}
                  className="w-full pl-3 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>
            </div>
            <div className="space-y-6">
              {/* Sub-categories */}
              {subCategories.length > 0 && (
                <div>
                  <h4 className="font-medium text-industrial-gray mb-3">{t('category.subcategories')}</h4>
                  <div className="space-y-2">
                    {subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${parentCategory?.slug || category.slug}/${sub.slug}`}
                        className="block px-3 py-2 text-sm text-steel-gray hover:text-primary-navy hover:bg-light-gray rounded transition-colors"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        {getCategoryDisplayName(sub)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-industrial-gray mb-3">{t('category.priceRange')}</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(100000, priceRange[1])}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    aria-label={t('category.priceRange') as string}
                  />
                  <div className="flex justify-between text-sm text-steel-gray">
                    <span>{formatCurrency(0, lang, { maximumFractionDigits: 0 })}</span>
                    <span>{formatCurrency(priceRange[1], lang, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="font-medium text-industrial-gray mb-3">{t('category.brands')}</h4>
                <div className="space-y-2">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                      />
                      <span className="text-sm text-steel-gray">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Teknik Filtreler */}
              <div>
                <h4 className="font-medium text-industrial-gray mb-3">{t('category.techFilters')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.airflow')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder={t('category.minPlaceholder') as string} value={airflowMin} onChange={e => setAirflowMin(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                      <input type="number" placeholder={t('category.maxPlaceholder') as string} value={airflowMax} onChange={e => setAirflowMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.pressure')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder={t('category.minPlaceholder') as string} value={pressureMin} onChange={e => setPressureMin(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                      <input type="number" placeholder={t('category.maxPlaceholder') as string} value={pressureMax} onChange={e => setPressureMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-industrial-gray mb-1">{t('category.noise')}</label>
                    <input type="number" placeholder={t('category.ltePlaceholder') as string} value={noiseMax} onChange={e => setNoiseMax(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary-navy hover:bg-secondary-blue text-white rounded-lg px-4 py-2 text-sm"
                >
                  {t('category.applyFilters')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPage
