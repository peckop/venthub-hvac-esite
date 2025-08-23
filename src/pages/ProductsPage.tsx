import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts, getCategories, Product, Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { Filter, Grid, List, Search, ChevronDown } from 'lucide-react'

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterCategory, setFilterCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(product => product.category_id === filterCategory)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => parseFloat(product.price) >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => parseFloat(product.price) <= parseFloat(priceRange.max))
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'tr')
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, filterCategory, priceRange, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setFilterCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('name')
  }

  const mainCategories = categories.filter(cat => cat.level === 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-light-gray rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-light-gray rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-steel-gray mb-6">
        <Link to="/" className="hover:text-primary-navy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-industrial-gray font-medium">Ürünler</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-industrial-gray mb-2">
            Tüm Ürünler
          </h1>
          <p className="text-steel-gray">
            {filteredProducts.length} ürün listeleniyor
          </p>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex bg-light-gray rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-navy shadow-sm'
                  : 'text-steel-gray hover:text-primary-navy'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-navy shadow-sm'
                  : 'text-steel-gray hover:text-primary-navy'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
          >
            <option value="name">İsme Göre (A-Z)</option>
            <option value="price-low">Fiyat (Düşük-Yüksek)</option>
            <option value="price-high">Fiyat (Yüksek-Düşük)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-light-gray p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-industrial-gray flex items-center">
                <Filter size={18} className="mr-2" />
                Filtreler
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-steel-gray hover:text-primary-navy"
              >
                Temizle
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                Ürün Ara
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray" size={16} />
                <input
                  type="text"
                  placeholder="Ürün adı, marka..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                Kategori
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
              >
                <option value="">Tüm Kategoriler</option>
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                Fiyat Aralığı
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="flex-1 border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="flex-1 border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-light-gray mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-industrial-gray mb-2">
                Ürün Bulunamadı
              </h3>
              <p className="text-steel-gray mb-4">
                Aradığınız kriterlere uygun ürün bulunamadı.
              </p>
              <button
                onClick={clearFilters}
                className="bg-primary-navy hover:bg-secondary-blue text-white px-6 py-2 rounded-lg transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage