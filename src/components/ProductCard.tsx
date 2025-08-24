import React from 'react'
import { Product } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCartHook'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
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
      <div className={`group relative bg-white rounded-xl shadow-sm hover:shadow-hvac transition-all duration-200 overflow-hidden border ${
        product.is_featured ? 'border-gold-accent border-2' : 'border-light-gray'
      }`}>
        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gold-accent text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Star size={12} fill="currentColor" />
              <span>Öne Çıkan</span>
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
        <div className="aspect-square bg-gradient-to-br from-air-blue to-light-gray flex items-center justify-center">
          <div className="text-6xl text-secondary-blue/30">
            {/* HVAC Icon based on category */}
            🌪️
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
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

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold text-primary-navy">
              ₺{price.toLocaleString('tr-TR')}
            </div>
            {product.status === 'out_of_stock' && (
              <span className="text-xs text-warning-orange bg-warning-orange/10 px-2 py-1 rounded">
                Stokta Yok
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={product.status === 'out_of_stock'}
              className="flex-1 bg-secondary-blue hover:bg-primary-navy text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
              <span className="text-sm font-medium">Sepete Ekle</span>
            </button>
            
            {onQuickView && (
              <button
                onClick={handleQuickView}
                className="px-3 py-2 border border-light-gray hover:border-secondary-blue rounded-lg transition-colors"
              >
                <span className="text-sm text-steel-gray hover:text-secondary-blue">
                  Hızlı Bak
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-navy/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  )
}

export default ProductCard