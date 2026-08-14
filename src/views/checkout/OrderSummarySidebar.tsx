'use client'

import { Lock } from 'lucide-react'
import React from 'react'

import { formatCurrency } from '../../i18n/format'
import { Lang } from '../../i18n/I18nContext'

/**
 * W4b: kalem fiyatı YALNIZ `unitPrice`tan okunur (sunucunun doğruladığı fiyat).
 * Ham `product.price` alanı bilinçli olarak KALDIRILDI — o kolon Kademe-2'de emekli
 * edildi ve ona düşmek özet ekranında 0 TL gösteriyordu. Fiyat yoksa "Teklif Alın".
 */
export interface OrderSummaryItem {
    id: string
    product: {
        name: string
    }
    quantity: number
    unitPrice?: number
}

export interface OrderSummarySidebarProps {
    items: OrderSummaryItem[]
    totalAmount: number
    vatAmount: number
    finalAmount: number
    couponApplied: { code: string; discount: number } | null
    couponCode: string
    setCouponCode: (v: string) => void
    onApplyCoupon: () => void
    onRemoveCoupon: () => void
    t: (key: string, params?: Record<string, unknown>) => string
    lang: Lang
}

const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
    items,
    totalAmount,
    vatAmount,
    finalAmount,
    couponApplied,
    couponCode,
    setCouponCode,
    onApplyCoupon,
    onRemoveCoupon,
    t,
    lang
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-industrial-gray mb-4">
                {t('checkout.summaryTitle')}
            </h3>

            {/* Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                    // Fiyatı çözülemeyen kalem "Teklif Alın" gösterir — 0 TL YAZILMAZ.
                    const unitPrice = typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice)
                        ? item.unitPrice
                        : null
                    return (
                    <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-light-gray rounded-lg flex items-center justify-center">
                            <span className="text-xs text-steel-gray">{t('checkout.summaryThumb')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-industrial-gray text-sm truncate">
                                {item.product.name}
                            </p>
                            <p className="text-xs text-steel-gray">
                                {unitPrice === null
                                    ? `${item.quantity} ${t('orders.qtyCol')}`
                                    : `${item.quantity} ${t('orders.qtyCol')} x ${formatCurrency(unitPrice, lang, { currency: 'TRY', maximumFractionDigits: 0 })}`}
                            </p>
                        </div>
                        <div className="text-sm font-medium text-industrial-gray">
                            {unitPrice === null
                                ? t('common.requestQuote')
                                : formatCurrency(unitPrice * item.quantity, lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    )
                })}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-steel-gray">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatCurrency(totalAmount, lang, { currency: 'TRY', maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                    <span>{t('cart.vatIncluded')}</span>
                    <span>{formatCurrency(vatAmount, lang, { currency: 'TRY', maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-success-green">{t('cart.free')}</span>
                </div>
                {couponApplied ? (
                    <div className="flex justify-between text-success-green">
                        <span>{t('checkout.couponDiscount', { code: couponApplied.code })}</span>
                        <span>-{formatCurrency(couponApplied.discount, lang, { currency: 'TRY', maximumFractionDigits: 0 })}</span>
                    </div>
                ) : null}
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder={t('checkout.orderSummary.couponPlaceholder')}
                        className="flex-1 border border-light-gray rounded px-3 py-2 text-sm"
                    />
                    <button
                        type="button"
                        className="px-3 py-2 rounded bg-primary-navy text-white text-sm"
                        onClick={onApplyCoupon}
                    >{t('checkout.orderSummary.applyCoupon')}</button>
                    {couponApplied ? (
                        <button type="button" className="px-3 py-2 rounded border text-sm" onClick={onRemoveCoupon}>{t('checkout.orderSummary.removeCoupon')}</button>
                    ) : null}
                </div>
                <hr className="border-light-gray" />
                <div className="flex justify-between text-lg font-semibold text-industrial-gray">
                    <span>{t('cart.total')}</span>
                    <span className="text-primary-navy">
                        {formatCurrency(finalAmount, lang, { currency: 'TRY', maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-air-blue rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-2 text-primary-navy mb-1">
                    <Lock size={16} />
                    <span className="text-sm font-medium">256-bit SSL</span>
                </div>
                <p className="text-xs text-steel-gray">
                    {t('checkout.security.secureNote')}
                </p>
            </div>
        </div>
    )
}

export default OrderSummarySidebar
