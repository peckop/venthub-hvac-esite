import React from 'react'
import { Product } from '../lib/supabase'
import { X, ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '../hooks/useCartHook'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

interface QuickViewModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, open, onClose }) => {
  const { t } = useI18n()
  const { addToCart } = useCart()

  if (!open || !product) return null

  const price = Number(product.price)

  const handleAdd = () => {
    addToCart(product)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-[92%] max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
          <h3 className="text-lg font-semibold text-industrial-gray">{t('quickView.title')}</h3>
          <button onClick={onClose} aria-label={t('quickView.close')} className="p-2 rounded hover:bg-light-gray">
            <X size={18} className="text-steel-gray" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-square bg-gradient-to-br from-air-blue to-light-gray rounded-xl flex items-center justify-center">
            <div className="text-6xl text-secondary-blue/30">🌪️</div>
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-industrial-gray mb-1 line-clamp-2">{product.name}</h4>
            <div className="text-sm text-steel-gray mb-2">{product.brand} • {product.sku}</div>
            <div className="text-2xl font-bold text-primary-navy mb-4">₺{price.toLocaleString('tr-TR')}</div>
            <p className="text-sm text-steel-gray line-clamp-4 mb-6">
              {product.description || t('quickView.descFallback')}
            </p>
            <div className="mt-auto flex gap-2">
              <button onClick={handleAdd} className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-primary-navy hover:bg-secondary-blue text-white rounded-lg transition-colors">
                <ShoppingCart size={18} className="mr-2" /> {t('quickView.addToCart')}
              </button>
              <Link to={`/product/${product.id}`} onClick={onClose} className="inline-flex items-center justify-center px-4 py-3 border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-lg transition-colors">
                <Eye size={18} className="mr-2" /> {t('quickView.viewProduct')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal

