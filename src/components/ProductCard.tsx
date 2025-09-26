import React from 'react'
import type { Product } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useI18n } from '../i18n/I18nProvider'
import { getStockInquiryLink } from '../utils/whatsapp'
import { formatCurrency } from '../i18n/format'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  highlightFeatured?: boolean
  showCompare?: boolean
  compareSelected?: boolean
  onToggleCompare?: (productId: string) => void
  layout?: 'grid' | 'list'
  relatedTopicSlug?: string
  /**
   * LCP adayı olan ilk ürün görseli için öncelikli yükleme.
   * true ise loading="eager" ve fetchpriority="high" kullanılır.
   */
  priority?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, highlightFeatured = false, showCompare = false, compareSelected = false, onToggleCompare, layout = 'grid', relatedTopicSlug, priority = false }) => {
  const { t, lang } = useI18n()
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

  // Build responsive image URLs (Supabase Image Transform if available)
  const buildImage = (url: string, w?: number, q: number = 70, format: 'webp' | 'jpeg' = 'webp') => {
    const base = url.split('?')[0]
    const enableTransform = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_IMAGE_TRANSFORM === '1')
    const renderUrl = (enableTransform && base.includes('/object/'))
      ? base.replace('/object/', '/render/image/')
      : base
    if (!enableTransform) {
      // Image Transform kapalıysa doğrudan public object URL'ini kullan
      return renderUrl
    }
    const params = new URLSearchParams()
    if (w) params.set('width', String(w))
    params.set('quality', String(q))
    params.set('format', format)
    const query = params.toString()
    return `${renderUrl}?${query}`
  }

  const src = product.image_url ? buildImage(product.image_url, isList ? 288 : 400) : undefined
  const srcSet = product.image_url
    ? [320, 480, 640, 768, 1024].map(w => `${buildImage(product.image_url, w)} ${w}w`).join(', ')
    : undefined
  const sizes = isList
    ? '(max-width: 768px) 25vw, 144px'
    : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'

  return (
    <Link to={`/product/${product.id}`}>
      <div className={`product-card group relative bg-white rounded-xl shadow hover:shadow-lg hover:bg-gray-50 motion-safe:transition-all motion-safe:duration-200 overflow-hidden border ${
        highlightFeatured && product.is_featured ? 'border-gold-accent border-2' : 'border-transparent'
      } ${isList ? 'md:flex items-stretch' : ''}`}>
        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gold-accent text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <svg width={12} height={12} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
              </svg>
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

        {/* Product Image */}
        <div className={`${isList ? 'w-28 h-28 md:w-36 md:h-36 m-4 md:m-4 flex-shrink-0 rounded-lg overflow-hidden' : 'aspect-square rounded-t-xl overflow-hidden'} bg-gradient-to-br from-air-blue to-light-gray flex items-center justify-center`}>
{product.image_url ? (
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={product.image_alt || product.name}
              className={`${isList ? 'w-full h-full' : 'w-full h-full'} object-cover`}
              {...(priority ? { fetchpriority: 'high' } : {})}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              width={isList ? 144 : 400}
              height={isList ? 144 : 400}
            />
          ) : (
            <div className={`${isList ? 'text-3xl md:text-4xl' : 'text-6xl'} text-secondary-blue/30`}>
              🌪️
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 ${isList ? 'flex-1' : ''}`}>
          {/* Product Name */}
          <h3 className="font-semibold text-industrial-gray motion-safe:group-hover:text-primary-navy motion-safe:transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Brand & Model */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary-blue">
              {product.brand}
            </span>
            <span className="text-xs text-steel-gray bg-light-gray px-2 py-1 rounded">
              {product.model_code ?? product.sku}
            </span>
          </div>

          {/* Price + Stock badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-primary-navy">
              {formatCurrency(price, lang, { maximumFractionDigits: 0 })}
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

          {/* Related Guide (optional) */}
          {relatedTopicSlug ? (
            <div className="mb-2 text-xs">
              <span className="text-steel-gray">{t('pdp.relatedGuide')}:</span>
              <Link
                to={`/destek/konular/${relatedTopicSlug}`}
                onClick={(e) => { e.stopPropagation() }}
                className="ml-1 text-primary-navy hover:text-secondary-blue underline"
              >
                {t(`knowledge.topics.${relatedTopicSlug}.title`)}
              </Link>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={(typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')}
              className="flex-1 bg-secondary-blue hover:bg-primary-navy text-white px-4 py-2 rounded-lg motion-safe:transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h11.5l3.5-8H5.4" />
              </svg>
              <span className="text-sm font-medium">{t('pdp.addToCart')}</span>
            </button>
            {((typeof product.stock_qty === 'number' ? product.stock_qty <= 0 : product.status === 'out_of_stock')) && (() => {
              const whatsappLink = getStockInquiryLink(product.name, product.sku)
              if (whatsappLink) {
                return (
                  <a
                    href={whatsappLink}
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
