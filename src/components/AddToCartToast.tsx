import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { Product } from '../lib/supabase'
import { useI18n } from '../i18n/I18nProvider'

const EVENT = 'vh_cart_item_added'

export const AddToCartToast: React.FC = () => {
  const { t } = useI18n()
  const [visible, setVisible] = React.useState(false)
  const [product, setProduct] = React.useState<Product | null>(null)
  const hideTimer = React.useRef<number | null>(null)

  React.useEffect(() => {
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail as { product?: Product }
      if (detail?.product) {
        setProduct(detail.product)
        setVisible(true)
        if (hideTimer.current) window.clearTimeout(hideTimer.current)
        hideTimer.current = window.setTimeout(() => setVisible(false), 5000)
      }
    }
    window.addEventListener(EVENT, onAdded as EventListener)
    return () => {
      window.removeEventListener(EVENT, onAdded as EventListener)
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [])

  if (!visible || !product) return null

  return (
    <div className="fixed z-[60] inset-x-3 bottom-3 md:inset-auto md:bottom-6 md:right-6">
      <div className="w-full md:w-[360px] max-w-[92vw] rounded-2xl shadow-2xl border border-light-gray bg-white ring-1 ring-black/5 overflow-hidden animate-slide-up">
        <div className="p-3 md:p-4 flex items-start gap-3">
          <div className="bg-success-green/10 p-2 rounded-lg">
            <CheckCircle className="text-success-green" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-industrial-gray font-semibold truncate">{t('cartToast.added')}</div>
            <div className="text-sm text-steel-gray truncate">{product.name}</div>
          </div>
          <button onClick={() => setVisible(false)} className="text-steel-gray hover:text-industrial-gray">×</button>
        </div>
        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            <button
              onClick={() => setVisible(false)}
              className="inline-flex items-center justify-center gap-2 px-3 py-3 md:py-2 border rounded-lg text-primary-navy border-primary-navy hover:bg-primary-navy hover:text-white transition"
            >
              <ShoppingBag size={16} />
              <span className="text-sm font-medium">{t('cartToast.continue')}</span>
            </button>
            <Link to="/cart" onClick={() => setVisible(false)} className="inline-flex items-center justify-center">
              <span className="inline-flex items-center justify-center gap-2 px-3 py-3 md:py-2 bg-primary-navy hover:bg-secondary-blue text-white rounded-lg transition text-sm font-medium w-full">
                <ArrowRight size={16} /> {t('cartToast.goToCart')}
              </span>
            </Link>
          </div>
          <div className="text-[11px] text-steel-gray text-center mt-2">{t('cartToast.autoClose')}</div>
        </div>
      </div>
    </div>
  )
}

export default AddToCartToast
