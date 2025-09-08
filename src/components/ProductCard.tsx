import React from 'react'
import { Product } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useI18n } from '../i18n/I18nProvider'
import { buildWhatsAppLink } from '../lib/utils'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  highlightFeatured?: boolean
  showCompare?: boolean
  compareSelected?: boolean
  onToggleCompare?: (productId: string) => void
  layout?: 'grid' | 'list'
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, highlightFeatured = false, showCompare = false, compareSelected = false, onToggleCompare, layout = 'grid' }) => {
  const { t } = useI18n()
  const isList = layout === 'list'
  const { addToCart } = useCart()
  const price = parseFloat(product.price)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    }
  }

  return (
    <Link to={`/product/${product.id}`}>
      <div className={`group relative bg-white rounded-xl shadow hover:shadow-lg hover:bg-gray-50 transition-all duration-200 overflow-hidden border ${
        highlightFeatured && product.is_featured ? 'border-gold-accent border-2' : 'border-transparent'
      } ${isList ? 'md:flex items-stretch' : ''}`}>
        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gold-accent text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Star size={12} fill="currentColor" />
              <span>{t('pdp.featured')}</span>
            </div>
          </div>
        )}


        {/* Brand Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
            <BrandIcon brand={product.brand} />
          </div>
        </div>

        {/* Product Image Placeholder */}
        <div className={`${isList ? 'w-28 h-28 md:w-36 md:h-36 m-4 md:m-4 flex-shrink-0 rounded-lg' : 'aspect-square'} bg-gradient-to-br from-air-blue to-light-gray flex items-center justify-center`}>
          <div className={`${isList ? 'text-3xl md:text-4xl' : 'text-6xl'} text-secondary-blue/30`}>
            {/* HVAC Icon based on category */}
            🌪️
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 ${isList ? 'flex-1' : ''}`}>
          {/* Product Name */}
          <h3 className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Brand & SKU */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary-blue">
              {product.brand}
            </span>
            <span className="text-xs text-steel-gray bg-light-gray px-2 py-1 rounded">
              {product.sku}
            </span>
          </div>

          {/* Price + Stock badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-primary-navy">
              ₺{price.toLocaleString('tr-TR')}
            </div>
            {(() => {
              const inStock = typeof product.stock_qty === 'number' ? product.stock_qty > 0 : product.status !== 'out_of_stock'
              return (
                <span className={`text-xs px-2 py-1 rounded ${inStock ? 'text-success-green bg-success-green/10' : 'text-warning-orange bg-warning-orange/10'}`}>
                  {inStock ? t('pdp.inStock') : t('pdp.outOfStock')}
                </span>
              )
            })()}
          </div>

          {/* Compare inside content (below price, above actions) */}
          {showCompare && (
            <div className="mb-3">
              <label
                className="inline-flex items-center gap-2 text-xs text-steel-gray cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onToggleCompare) {
                    onToggleCompare(product.id)
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={compareSelected}
                  readOnly
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="accent-primary-navy"
                />
                {t('category.compareBar')}
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
              className="flex-1 bg-secondary-blue hover:bg-primary-navy text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
              <span className="text-sm font-medium">{t('pdp.addToCart')}</span>
            </button>
            {((typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')) && (() => {
              const env = (import.meta as unknown as { env?: Record<string, string> }).env
              const wa = env?.VITE_SHOP_WHATSAPP
              if (typeof wa === 'string' && wa.trim()) {
                const href = buildWhatsAppLink(wa, `Stok bilgisi: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}`)
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation() }}
                    className="px-3 py-2 border border-light-gray hover:border-secondary-blue rounded-lg transition-colors text-sm text-steel-gray hover:text-secondary-blue"
                    title={t('pdp.askStock') as string}
                  >
                    {t('pdp.askStock')}
                  </a>
                )
              }
              return (
                <Link
                  to="/contact"
                  onClick={(e) => { e.stopPropagation() }}
                  className="px-3 py-2 border border-light-gray hover:border-secondary-blue rounded-lg transition-colors text-sm text-steel-gray hover:text-secondary-blue"
                  title={t('pdp.askStock') as string}
                >
                  {t('pdp.askStock')}
                </Link>
              )
            })()}
            {onQuickView ? (
              <button
                type="button"
                onClick={handleQuickView}
                className="px-3 py-2 border border-light-gray hover:border-secondary-blue rounded-lg transition-colors"
              >
                <span className="text-sm text-steel-gray hover:text-secondary-blue">
                  {t('quickView.title')}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-navy/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  )
}

export default ProductCard
