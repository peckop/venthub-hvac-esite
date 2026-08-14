'use client'

import { ArrowLeft,Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { BrandIcon } from '../components/HVACIcons'
import SecurityRibbon from '../components/SecurityRibbon'
import { useCart } from '../hooks/useCartHook'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { formatCurrency } from '../i18n/format'
import { useI18n } from '../i18n/I18nProvider'

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart()

  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()

  // W4b: fiyatı çözülemeyen ("Teklif Alın") kalem var mı? Varsa toplam onu KAPSAMAZ ve
  // ödemeye geçilemez — buildPaymentRequest fiyatsız kalemi zaten reddediyor.
  const hasUnpricedItems = items.some(
    (item) => typeof item.unitPrice !== 'number' || !Number.isFinite(item.unitPrice)
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag size={48} className="text-steel-gray" />
            </div>
            <h2 className="text-2xl font-bold text-industrial-gray mb-4">
              {t('cart.emptyTitle')}
            </h2>
            <p className="text-steel-gray mb-8">
              {t('cart.emptyDesc')}
            </p>
            <Link
              href={Routes.home()}
              className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              {t('cart.startShopping')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <SecurityRibbon />
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-industrial-gray mb-2">
            {t('cart.title')}
          </h1>
          <p className="text-steel-gray">
            {t('cart.countLabel', { count: getCartCount() })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              // W4b: fiyatı çözülemeyen kalem "Teklif Alın" gösterir — 0 TL YAZILMAZ.
              // Ham products.price fallback'i kaldırıldı (o kolon emekli, çoğunlukla NULL).
              const unitPrice = typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice)
                ? item.unitPrice
                : null
              return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-br from-air-blue to-light-gray rounded-lg flex items-center justify-center flex-shrink-0">
                    <BrandIcon brand={item.product.brand} />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={Routes.product(item.product.slug!)}
                      className="block hover:text-primary-navy transition-colors"
                    >
                      <h3 className="font-semibold text-industrial-gray mb-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-steel-gray mb-2">
                      {item.product.brand} • {item.product.sku}
                    </p>
                    <div className="flex items-center space-x-4">
                      {unitPrice === null ? (
                        <span className="text-lg font-semibold text-steel-gray">
                          {t('common.requestQuote')}
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-primary-navy">
                            {formatCurrency(unitPrice, lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-sm text-steel-gray">
                              {t('cart.itemTotal')}: {formatCurrency(unitPrice * item.quantity, lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center border border-light-gray rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-light-gray transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Miktarı azalt"
                      >
                        <Minus size={16} className="text-steel-gray" aria-hidden="true" />
                      </button>
                      <span className="px-4 py-2 font-medium text-industrial-gray">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-light-gray transition-colors"
                        aria-label="Miktarı artır"
                      >
                        <Plus size={16} className="text-steel-gray" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-steel-gray hover:text-red-500 transition-colors"
                      title={t('cart.removeItem')}
                      aria-label={t('cart.removeItem')}
                    >
                      <Trash2 size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}

            {/* Clear Cart Button */}
            <div className="pt-4">
              <button
                onClick={() => clearCart()}
                className="text-steel-gray hover:text-red-500 text-sm transition-colors"
              >
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-industrial-gray mb-6">
                {t('cart.summary')}
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-steel-gray">{t('cart.subtotal')}</span>
                  <span className="font-medium text-industrial-gray">
                    {formatCurrency(getCartTotal(), lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-gray">{t('cart.shipping')}</span>
                  <span className="text-success-green font-medium">{t('cart.free')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-gray">{t('cart.vatIncluded')}</span>
                  <span className="font-medium text-industrial-gray">
                    {formatCurrency(getCartTotal() - getCartTotal() / 1.2, lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <hr className="border-light-gray" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-industrial-gray">{t('cart.total')}</span>
                  {/* W4b: fiyatı bekleyen kalem varken KISMİ toplamı "Toplam" diye sunmak
                      yanıltıcı olur (kalem satırı "Teklif Alın" derken özet ₺0 basıyordu).
                      O durumda rakam yerine teklif ifadesi gösterilir. */}
                  <span className="font-bold text-primary-navy">
                    {hasUnpricedItems
                      ? t('common.requestQuote')
                      : formatCurrency(getCartTotal(), lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* W4b: toplam yalnız fiyatlı kalemleri kapsar; fiyatı bekleyen kalem varsa
                  bunu söyle ve ödemeyi engelle — ödeme hattı fiyatsız kalemi reddeder. */}
              {hasUnpricedItems && (
                <div className="mb-4 p-3 bg-air-blue rounded-lg">
                  <p className="text-sm text-steel-gray">{t('cart.quoteItemsNotice')}</p>
                </div>
              )}

              {/* Checkout Button */}
              {hasUnpricedItems ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-light-gray text-steel-gray font-semibold py-3 px-6 rounded-lg text-center block cursor-not-allowed"
                >
                  {t('cart.checkout')}
                </button>
              ) : (
                <Link
                  href={Routes.checkout()}
                  className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
                >
                  {t('cart.checkout')}
                </Link>
              )}

              {/* Continue Shopping */}
              <Link
                href={Routes.home()}
                className="w-full mt-3 border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                {t('cart.continueShopping')}
              </Link>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-air-blue rounded-lg">
                <p className="text-sm text-steel-gray text-center">
                  {t('cart.securePayment')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage



