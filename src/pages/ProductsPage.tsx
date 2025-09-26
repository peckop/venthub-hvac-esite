import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRef } from 'react'
import type { Product, Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import BrandsShowcase from '../components/BrandsShowcase'
import TrustSection from '../components/TrustSection'
import LeadModal from '../components/LeadModal'
import { getActiveApplicationCards } from '../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../utils/applicationUi'
import { trackEvent } from '../utils/analytics'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

const ProductsPage: React.FC = () => {
  const location = useLocation()
  const [leadOpen, setLeadOpen] = useState(false)
  const params = new URLSearchParams(location.search)
  const q = params.get('q')?.trim() || ''
  const appParam = params.get('app') || ''
  const { t } = useI18n()
  const appSectionRef = useRef<HTMLDivElement | null>(null)

  // Teklif/lead modalını global tetikleyiciye bağla (sayfa içinde kullanılacak)
  ;((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)

  const [featured, setFeatured] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [_loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState(q)
  const [hasLoadedAll, setHasLoadedAll] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const isAllNow = searchParams.get('all') === '1'
    const hasQuery = (searchQuery ?? '').length > 0

    const buildPublicUrl = (path: string) => `${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`

    async function attachCovers(list: Product[]): Promise<Product[]> {
      if (!Array.isArray(list) || list.length === 0) return list
      try {
        const ids = list.map(p => p.id)
        const { getSupabase } = await import('../lib/supabase')
        const supabase = await getSupabase()
        const { data: imgs, error: imgErr } = await supabase
          .from('product_images')
          .select('product_id,path,sort_order,alt')
          .in('product_id', ids)
          .order('sort_order', { ascending: true })
        if (imgErr) return list
        const firstMap = new Map<string, { path: string, alt?: string | null }>()
        for (const r of (imgs || []) as { product_id: string, path: string, sort_order: number, alt?: string | null }[]) {
          if (!firstMap.has(r.product_id)) firstMap.set(r.product_id, { path: r.path, alt: r.alt ?? null })
        }
        return list.map(p => {
          const cover = firstMap.get(p.id)
          return cover ? { ...p, image_url: buildPublicUrl(cover.path), image_alt: cover.alt ?? null } : p
        })
      } catch {
        return list
      }
    }

    async function fetchDiscoverLight() {
      try {
        setLoading(true)
        // Fetch only what we need for Discover: featured, categories, and a small slice of products
        const { getFeaturedProducts, getCategories, getProducts } = await import('../lib/supabase')
        const [featuredData, categoriesData, limitedProducts] = await Promise.all([
          getFeaturedProducts(),
          getCategories(),
          getProducts(24),
        ])
        const [featuredWithCovers, limitedWithCovers] = await Promise.all([
          attachCovers(featuredData),
          attachCovers(limitedProducts),
        ])
        setFeatured(featuredWithCovers)
        // Derive "new" products from non-featured items in the limited list
        const newItems = limitedWithCovers.filter((p) => !p.is_featured).slice(0, 12)
        setNewProducts(newItems)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching discover data:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllIfNeeded() {
      try {
        if (hasLoadedAll) return
        // For All Products mode, fetch the complete list only when needed
        setLoading(true)
        const { getAllProducts } = await import('../lib/supabase')
        const productsData = await getAllProducts()
        const productsWithCovers = await attachCovers(productsData)
        setAllProducts(productsWithCovers)
        setHasLoadedAll(true)
      } catch (error) {
        console.error('Error fetching all products:', error)
      } finally {
        setLoading(false)
      }
    }

    // Scroll to application section if deep-linked via app param
    const targetApp = searchParams.get('app')
    if (targetApp && appSectionRef.current) {
      try {
        appSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {}
    }

    // Decide what to fetch based on URL and query
    if (isAllNow) {
      // When entering All Products view directly, fetch the full list.
      // We intentionally avoid fetching featured/categories here to reduce payload.
      // Keep existing discover data if any for quick toggle back.
      if (!hasLoadedAll) {
        fetchAllIfNeeded()
      }
    } else if (!hasQuery) {
      // Discover view without a search query: fetch the light set
      if (featured.length === 0 || categories.length === 0 || newProducts.length === 0) {
        fetchDiscoverLight()
      }
    }
  }, [location.search, hasLoadedAll, featured.length, categories.length, newProducts.length, searchQuery])

  // Sync searchQuery with URL param q (when navigated from header or sticky search)
  useEffect(() => {
    const paramsNow = new URLSearchParams(location.search)
    const nextQ = paramsNow.get('q')?.trim() || ''
    setSearchQuery(nextQ)
  }, [location.search])

  // Arama sonuçlarını (varsa) yükle
  useEffect(() => {
    let active = true
    const buildPublicUrl = (path: string) => `${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
    async function attachCovers(list: Product[]): Promise<Product[]> {
      if (!Array.isArray(list) || list.length === 0) return list
      try {
        const ids = list.map(p => p.id)
        const { getSupabase } = await import('../lib/supabase')
        const supabase = await getSupabase()
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
      } catch {
        return list
      }
    }
    async function run() {
      if (!searchQuery) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }
      try {
        setSearchLoading(true)
        const { searchProducts } = await import('../lib/supabase')
        const results = await searchProducts(searchQuery)
        const withCovers = await attachCovers(results)
        if (active) setSearchResults(withCovers)
      } catch (e) {
        console.error('Search error:', e)
        if (active) setSearchResults([])
      } finally {
        if (active) setSearchLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const mainCategories = categories.filter(cat => cat.level === 0)
  const applicationCards = getActiveApplicationCards()


  const isAll = params.get('all') === '1'
  const canonicalUrl = `${window.location.origin}/products`
  const noindex = Boolean(searchQuery) || isAll
  const breadcrumbLabel = searchQuery ? t('products.searchResultsTitle') : (isAll ? t('common.allProducts') : t('common.discoverPage'))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo
        title={noindex ? `${t('products.searchSeoTitle', { q: searchQuery })} | VentHub` : `${t('common.discover')} | VentHub`}
        description={noindex ? t('products.searchSeoDesc', { q: searchQuery }) : t('products.discoverSeoDesc')}
        canonical={canonicalUrl}
        noindex={noindex}
      />
      {/* JSON-LD: ItemList for /products (All or Search modes) */}
      {(isAll || !!searchQuery) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: (searchQuery ? searchResults : isAll ? allProducts : []).map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${window.location.origin}/product/${p.id}`,
                name: p.name,
              })),
            }),
          }}
        />
      )}
      {/* JSON-LD: BreadcrumbList for /products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('common.home'), item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: canonicalUrl },
            ],
          }),
        }}
      />
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-steel-gray mb-4">
        <Link to="/" className="hover:text-primary-navy">{t('common.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-industrial-gray font-medium">{breadcrumbLabel}</span>
      </div>

      {/* Keşfet / Tüm Ürünler toggle */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg bg-light-gray p-1">
          <Link to="/products" className={`px-4 py-2 rounded-md text-sm font-medium transition ${!isAll && !searchQuery ? 'bg-white text-primary-navy shadow-sm' : 'text-industrial-gray hover:text-primary-navy'}`}>{t('common.discover')}</Link>
          <Link to="/products?all=1" className={`px-4 py-2 rounded-md text-sm font-medium transition ${isAll ? 'bg-white text-primary-navy shadow-sm' : 'text-industrial-gray hover:text-primary-navy'}`}>{t('common.allProducts')}</Link>
        </div>
      </div>

      {/* Header + Search (yalnızca All veya Search modunda) */}
      {(isAll || searchQuery) && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-industrial-gray mb-2">
              {searchQuery ? t('products.searchResultsTitle') : isAll ? t('common.allProducts') : t('products.searchResultsTitle')}
            </h1>
            <p className="text-steel-gray">
              {searchQuery ? `${searchResults.length} ${t('products.resultsFound')}` : isAll ? `${allProducts.length} ${t('products.itemsListed')}` : `${searchResults.length} ${t('products.resultsFound')}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
            <div className="flex bg-light-gray rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-navy shadow-sm'
                    : 'text-steel-gray hover:text-primary-navy'
                }`}
              >
                <GridIcon size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-navy shadow-sm'
                    : 'text-steel-gray hover:text-primary-navy'
                }`}
              >
                <ListIcon size={16} />
              </button>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[18rem]">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray" size={16} />
              <input
                type="text"
placeholder={t('common.searchPlaceholder') || 'Ürün, model veya SKU ara'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>
        </div>
      )}

      {/* Keşfet hero (yalnızca Keşfet modunda) */}
      {!isAll && !searchQuery && (
        <>
        <section className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-secondary-blue to-sky-400 text-white">
          <div className="px-6 py-10 sm:px-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t('products.heroTitle')}</h1>
              <p className="mt-3 text-white/90">{t('products.heroSubtitle')}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/products?all=1" className="inline-flex items-center justify-center rounded-lg bg-white text-primary-navy px-5 py-2.5 font-semibold shadow-sm hover:bg-gray-100 transition">
                  {t('common.seeAllProducts')}
                </Link>
                <a href="#by-application" className="inline-flex items-center justify-center rounded-lg bg-primary-navy/20 backdrop-blur px-5 py-2.5 font-semibold border border-white/30 hover:bg-primary-navy/30 transition">
                  {t('common.selectByNeed')}
                </a>
              </div>
              <div className="relative mt-6 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" size={16} />
                  <input
                  type="text"
placeholder={t('common.searchPlaceholderLong') || 'Ürün, model veya SKU ara'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg text-industrial-gray focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-56 rounded-xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-white/80">{t('products.discoverVisual')}</span>
              </div>
            </div>
          </div>
          {/* Value props strip */}
          <div className="bg-white/10 border-t border-white/20">
            <div className="px-6 sm:px-10 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3">
                <BadgeCheckIcon size={18} />
                <span className="text-sm">{t('products.heroValue1')}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon size={18} />
                <span className="text-sm">{t('products.heroValue2')}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon size={18} />
                <span className="text-sm">{t('products.heroValue3')}</span>
              </div>
            </div>
          </div>
        </section>
        {/* Keşfet kahramanının hemen altında Güven/Uygunluk */}
        <TrustSection />
        </>
      )}

      {/* Liste alanı: Arama / Tüm Ürünler / Keşfet bölümleri */}
      {searchQuery ? (
        <div className="bg-gray-50 rounded-xl p-2 sm:p-3">
          {searchLoading ? (
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {[1,2,3,4,5,6,7,8,9].map((i) => (
                <div key={i} className="bg-light-gray rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-light-gray mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-industrial-gray mb-2">
                {t('common.notFound')}
              </h3>
              <button onClick={clearSearch} className="bg-primary-navy hover:bg-secondary-blue text-white px-6 py-2 rounded-lg transition-colors">
                {t('common.clearSearch')}
              </button>
            </div>
          ) : (
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {searchResults.map((product, i) => (
                <ProductCard key={product.id} product={product} layout={viewMode} priority={i === 0} />
              ))}
            </div>
          )}
        </div>
      ) : isAll ? (
        <div className="bg-gray-50 rounded-xl p-2 sm:p-3">
          {!hasLoadedAll ? (
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {[1,2,3,4,5,6,7,8,9].map((i) => (
                <div key={i} className="bg-light-gray rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-light-gray mb-4">📦</div>
              <h3 className="text-xl font-semibold text-industrial-gray mb-2">
                {t('products.noProducts')}
              </h3>
              <p className="text-steel-gray">{t('products.noProductsDesc')}</p>
            </div>
          ) : (
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
{([...allProducts].sort((a,b)=>{
                switch (sortBy) {
                  case 'price-low': return parseFloat(a.price)-parseFloat(b.price)
                  case 'price-high': return parseFloat(b.price)-parseFloat(a.price)
                  case 'name':
                  default: return a.name.localeCompare(b.name, 'tr')
                }
              })).map((product, i) => (
                <ProductCard key={product.id} product={product} layout={viewMode} priority={i === 0} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Uygulama alanına göre keşfet - öne alındı */}
          <section id="by-application" ref={appSectionRef} className="mb-12">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-industrial-gray">{t('products.applicationTitle')}</h2>
            </div>
            <div className={`${gridColsClass(applicationCards.length)}`}>
              {applicationCards.map((card) => {
                const selected = card.key === appParam
                return (
                <Link
                  key={card.key}
                  to={card.href}
                  className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition ${selected ? 'border-primary-navy ring-2 ring-primary-navy' : 'border-light-gray'}`}
                  aria-current={selected ? 'true' : undefined}
onClick={() => {
                    trackEvent('application_click', { key: card.key, source: 'products' })
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${accentOverlayClass(card.accent)} to-transparent`}></div>
                  <div className="p-5 relative z-10">
                    <div className="flex items-center gap-2 text-primary-navy">
                      {iconFor(card.icon, 18)}
                      <span className="text-sm font-semibold">{t(`applications.${card.key}.title`)}</span>
                    </div>
                    <p className="mt-1 text-sm text-steel-gray">{t(`applications.${card.key}.subtitle`)}</p>
                    <div className="mt-4 text-sm font-medium text-primary-navy">{t('common.discover')} →</div>
                  </div>
                </Link>
              )})}
            </div>
          </section>

          {/* Popüler kategoriler - daha belirgin görsel */}
          {mainCategories.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-industrial-gray">{t('products.popularCategories')}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {mainCategories.slice(0, 6).map((cat) => (
                  <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative overflow-hidden rounded-xl border border-light-gray bg-white hover:shadow-md transition" onClick={() => { trackEvent('category_click', { level: 0, slug: cat.slug, source: 'products' }) }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-primary-navy">
                        <LayersIcon size={16} />
                        <div className="font-medium text-industrial-gray group-hover:text-primary-navy">{cat.name}</div>
                      </div>
                      <div className="text-xs text-steel-gray mt-1">{t('common.gotoCategory')} →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Öne çıkanlar */}
          {featured.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-4">
                <StarIconSmall className="text-gold-accent mr-2" size={20} />
                <h2 className="text-2xl font-semibold text-industrial-gray">{t('common.featured')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.slice(0, 9).map((product) => (
                  <ProductCard key={product.id} product={product} highlightFeatured layout={viewMode} />
                ))}
              </div>
            </section>
          )}

          {/* Yeni ürünler */}
          {newProducts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-4">
                <ClockIcon className="text-secondary-blue mr-2" size={20} />
                <h2 className="text-2xl font-semibold text-industrial-gray">{t('common.newProducts')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newProducts.slice(0, 9).map((product) => (
                  <ProductCard key={product.id} product={product} layout={viewMode} />
                ))}
              </div>
            </section>
          )}

          {/* Yardım CTA */}
          <section className="mb-12">
            <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-industrial-gray">{t('products.helpCtaTitle')}</h3>
                <p className="text-steel-gray mt-1">{t('products.helpCtaSubtitle')}</p>
              </div>
              <button
                onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
                className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition"
              >
                {t('common.getQuote')}
              </button>
            </div>
          </section>

          {/* Markalar vitrin */}
          <BrandsShowcase />
        </>
      )}
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </div>
  )
}

// Minimal inline SVG icons to avoid lucide-react in this route chunk
function GridIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
function ListIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="4" cy="6" r="1"/>
      <circle cx="4" cy="12" r="1"/>
      <circle cx="4" cy="18" r="1"/>
    </svg>
  )
}
function SearchIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function BadgeCheckIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M7.5 2.5l2 1 2.5-1 2.5 1 2-1 2 2-.5 2.5 1 2.5-1 2.5.5 2.5-2 2-2-1-2.5 1-2.5-1-2 1-2-2 .5-2.5-1-2.5 1-2.5-.5-2.5 2-2z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}
function ShieldCheckIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2l7 4v5c0 5-3 8-7 11C8 19 5 16 5 11V6l7-4z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}
function ClockIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function LayersIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 12 12 17 22 12"/>
      <polyline points="2 17 12 22 22 17"/>
    </svg>
  )
}
function StarIconSmall({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

export default ProductsPage
