import React, { useState, useEffect } from 'react'
import { X, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { Product } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { Link } from 'react-router-dom'

interface CartToastProps {
  isVisible: boolean
  product: Product | null
  onClose: () => void
}

export const CartToast: React.FC<CartToastProps> = ({ isVisible, product, onClose }) => {
  const [showChoiceModal, setShowChoiceModal] = useState(false)

  useEffect(() => {
    if (isVisible && product) {
      // Show choice modal after toast animation
      const timer = setTimeout(() => {
        setShowChoiceModal(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, product])

  useEffect(() => {
    if (showChoiceModal) {
      // Auto-close modal after 5 seconds
      const timer = setTimeout(() => {
        setShowChoiceModal(false)
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showChoiceModal, onClose])

  const handleContinueShopping = () => {
    setShowChoiceModal(false)
    onClose()
  }

  const handleGoToCart = () => {
    setShowChoiceModal(false)
    onClose()
    // Navigation will be handled by Link component
  }

  if (!isVisible || !product) return null

  return (
    <>
      {/* Success Toast */}
      <div className="fixed top-20 right-4 z-50 animate-slide-up">
        <div className="bg-white border border-success-green rounded-lg shadow-hvac p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-success-green flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-industrial-gray">
                Ürün sepete eklendi!
              </p>
              <p className="text-sm text-steel-gray truncate">
                {product.name}
              </p>
            </div>
            <button onClick={onClose} className="text-steel-gray hover:text-industrial-gray">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Choice Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-bounce-in">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-success-green/10 p-2 rounded-lg">
                  <CheckCircle className="text-success-green" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-industrial-gray">
                    Ürün Başarıyla Eklendi!
                  </h3>
                  <p className="text-sm text-steel-gray">
                    Ne yapmak istiyorsunuz?
                  </p>
                </div>
                <button 
                  onClick={() => { setShowChoiceModal(false); onClose() }}
                  className="ml-auto text-steel-gray hover:text-industrial-gray"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Product Info */}
              <div className="bg-light-gray rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-3">
                  <BrandIcon brand={product.brand} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-industrial-gray truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-steel-gray">
                      {product.brand} • ₺{parseFloat(product.price).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContinueShopping}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold rounded-lg transition-colors"
                >
                  <ShoppingBag size={20} />
                  <span>Alışverişe Devam Et</span>
                </button>
                
                <Link to="/cart" onClick={handleGoToCart}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors">
                    <ArrowRight size={20} />
                    <span>Sepete Git</span>
                  </button>
                </Link>
              </div>

              {/* Auto-close indicator */}
              <p className="text-center text-xs text-steel-gray mt-4">
                Bu pencere 5 saniye sonra otomatik kapanacak
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CartToast