import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategories, getProductsByCategory, Category, Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { ChevronRight, Filter, Grid, List } from 'lucide-react'

export const CategoryPage: React.FC = () => {
  const { slug, parentSlug } = useParams<{ slug: string; parentSlug?: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const categories = await getCategories()
        
        let targetCategory: Category | null = null
        let targetParentCategory: Category | null = null

        if (parentSlug && slug) {
          // Sub-category page
          targetParentCategory = categories.find(c => c.slug === parentSlug && c.level === 0) || null
          targetCategory = categories.find(c => c.slug === slug && c.level === 1) || null
        } else if (slug) {
          // Main category page
          targetCategory = categories.find(c => c.slug === slug && c.level === 0) || null
        }

        if (!targetCategory) {
          setLoading(false)
          return
        }

        setCategory(targetCategory)
        setParentCategory(targetParentCategory)

        // Get subcategories if this is a main category
        if (targetCategory.level === 0) {
          const subs = categories.filter(c => c.parent_id === targetCategory.id)
          setSubCategories(subs)
        }

        // Fetch products
        const productsData = await getProductsByCategory(targetCategory.id)
        setProducts(productsData)

      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, parentSlug])

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const price = parseFloat(product.price)
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand)
      return matchesPrice && matchesBrand
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Get unique brands
  const availableBrands = Array.from(new Set(products.map(p => p.brand)))

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray">Kategori yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">Kategori Bulunamadı</h1>
          <Link to="/" className="text-primary-navy hover:text-secondary-blue">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-steel-gray hover:text-primary-navy">
              Ana Sayfa
            </Link>
            <ChevronRight size={16} className="text-steel-gray" />
            {parentCategory && (
              <>
                <Link 
                  to={`/category/${parentCategory.slug}`} 
                  className="text-steel-gray hover:text-primary-navy"
                >
                  {parentCategory.name}
                </Link>
                <ChevronRight size={16} className="text-steel-gray" />
              </>
            )}
            <span className="text-industrial-gray font-medium">
              {category.name}
            </span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="text-primary-navy">
              {getCategoryIcon(parentCategory?.slug || category.slug, { size: 64 })}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-industrial-gray mb-2">
                {category.name}
              </h1>
              <p className="text-xl text-steel-gray mb-4">
                {category.description}
              </p>
              <div className="text-steel-gray">
                {filteredProducts.length} ürün bulundu
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h3 className="font-semibold text-industrial-gray mb-4 flex items-center">
                <Filter size={20} className="mr-2" />
                Filtreler
              </h3>

              {/* Sub-categories */}
              {subCategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-industrial-gray mb-3">Alt Kategoriler</h4>
                  <div className="space-y-2">
                    {subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${category.slug}/${sub.slug}`}
                        className="block px-3 py-2 text-sm text-steel-gray hover:text-primary-navy hover:bg-light-gray rounded transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-industrial-gray mb-3">Fiyat Aralığı</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-steel-gray">
                    <span>₺0</span>
                    <span>₺{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-industrial-gray mb-3">Markalar</h4>
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

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 10000])
                  setSelectedBrands([])
                }}
                className="w-full text-center text-sm text-steel-gray hover:text-primary-navy transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  >
                    <option value="name">Ada Göre Sırala</option>
                    <option value="price-low">Fiyat: Düşükten Yüksee</option>
                    <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary-navy text-white' 
                        : 'text-steel-gray hover:bg-light-gray'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
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
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    highlightFeatured={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-industrial-gray mb-4">
                  Ürün Bulunamadı
                </h3>
                <p className="text-steel-gray mb-6">
                  Seçtiğiniz filtrelere uygun ürün bulunamadı.
                </p>
                <button
                  onClick={() => {
                    setPriceRange([0, 10000])
                    setSelectedBrands([])
                  }}
                  className="text-primary-navy hover:text-secondary-blue transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage