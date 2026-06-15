'use client'

import { AlertCircle, CheckCircle, Loader, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useCart } from '../hooks/useCartHook'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { formatDateTime } from '../i18n/datetime'
import { formatCurrency } from '../i18n/format'
import { useI18n } from '../i18n/I18nProvider'
import { reportError } from '../lib/errorReporter'

type PaymentInfo = { conversationId?: string; token?: string; errorMessage?: string }

const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams()
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [orderSummary, setOrderSummary] = useState<{ amount?: number, items?: number, createdAt?: string }>({})

  // Başarı teyit edilmeden sepeti temizleme! Yalnızca doğrulanmış başarıda temizlenecek.

  useEffect(() => {
    const conversationId = searchParams?.get('conversationId') || undefined
    const token = searchParams?.get('token') || undefined
    const errorMessage = searchParams?.get('errorMessage') || undefined
    const orderId = searchParams?.get('orderId') || undefined
    const statusParam = searchParams?.get('status') || undefined


    async function fetchOrderDetails(oid?: string) {
      try {
        if (!oid) return
        const { data, error } = await (supabase
          .from('venthub_orders'))
          .select('total_amount, created_at, venthub_order_items(quantity)')
          .eq('id', oid)
          .maybeSingle()
        if (!error && data) {
          const items = data.venthub_order_items;
          const count = Array.isArray(items) ? (items).reduce((s: number, it) => s + (Number(it?.quantity) || 0), 0) : undefined
          setOrderSummary({ amount: Number(data.total_amount) || undefined, createdAt: data.created_at, items: count })
        }
      } catch { }
    }

    async function verify() {
      try {
        // 1) Eğer callback status=success ile yönlendirdiyse, doğrudan başarı kabul et
        if (statusParam === 'success') {
          setStatus('success')
          setPaymentInfo({ conversationId: conversationId || orderId, token })
          clearCart({ silent: true })
          try {
            localStorage.removeItem('venthub-cart');
            localStorage.removeItem('venthub-cart-version');
            localStorage.removeItem('venthub-cart-owner');
            localStorage.removeItem('vh_pending_order');
            localStorage.setItem('vh_last_order_status', 'success');
            localStorage.setItem('vh_clear_server_cart_once', '1');
          } catch { }
          if (orderId) await fetchOrderDetails(orderId)
          toast.success(t('checkout.paymentSuccess'))
          return
        }

        // 2) Token varsa, Functions üzerinden doğrula
        if (token) {
          const { data, error } = await supabase.functions.invoke('iyzico-callback', {
            body: { token, conversationId, orderId }
          })

          if (error) {
            reportError(error, { context: 'Callback verify error' })
            setStatus('error')
            setPaymentInfo({ errorMessage: error.message || t('payment.verifyError') })
            toast.error(t('payment.verifyError'))
            return
          }

          if (data?.status === 'success') {
            setStatus('success')
            setPaymentInfo({ conversationId: conversationId || orderId || data?.iyzico?.conversationId, token })
            clearCart({ silent: true })
            try {
              localStorage.removeItem('venthub-cart');
              localStorage.removeItem('venthub-cart-version');
              localStorage.removeItem('venthub-cart-owner');
              localStorage.removeItem('vh_pending_order');
              localStorage.setItem('vh_last_order_status', 'success');
              localStorage.setItem('vh_clear_server_cart_once', '1');
            } catch { }
            await fetchOrderDetails(orderId)
            toast.success(t('checkout.paymentSuccess'))
            return
          }

          setStatus('error')
          const msg = data?.iyzico?.errorMessage || t('payment.failedGeneric')
          setPaymentInfo({ errorMessage: msg })
          toast.error(t('payment.failedToast', { msg }))
          return
        }

        // 3) Token yoksa ama orderId varsa: callback'i orderId ile tetikle (token fallback), ardından veritabanından durumu kontrol et
        if (orderId) {
          try {
            await supabase.functions.invoke('iyzico-callback', { body: { orderId, conversationId } })
          } catch { }

          const { data, error } = await (supabase
            .from('venthub_orders'))
            .select('status')
            .eq('id', orderId)
            .maybeSingle()

          if (error) {
            reportError(error, { context: 'Order fetch error' })
            setStatus('error')
            setPaymentInfo({ errorMessage: 'Sipariş doğrulama hatası' })
            toast.error('Sipariş doğrulama hatası')
            return
          }

          if (data && (data.status === 'paid' || data.status === 'confirmed')) {
            setStatus('success')
            setPaymentInfo({ conversationId: conversationId || orderId, token })
            clearCart({ silent: true })
            try {
              localStorage.removeItem('venthub-cart');
              localStorage.removeItem('venthub-cart-version');
              localStorage.removeItem('venthub-cart-owner');
              localStorage.removeItem('vh_pending_order');
              localStorage.setItem('vh_last_order_status', 'success');
              localStorage.setItem('vh_clear_server_cart_once', '1');
            } catch { }
            await fetchOrderDetails(orderId)
            toast.success('🎉 Ödeme başarıyla tamamlandı!')
            return
          }
        }

        // 4) Diğer durumlarda hatayı göster
        if (errorMessage) {
          setStatus('error')
          setPaymentInfo({ errorMessage })
          try { localStorage.setItem('vh_last_order_status', 'failure') } catch { }
          toast.error(t('payment.errorDuring', { msg: errorMessage }))
        } else {
          setStatus('error')
          setPaymentInfo({ errorMessage: t('payment.unverified') })
          try { localStorage.setItem('vh_last_order_status', 'failure') } catch { }
          toast.error(t('payment.unverified'))
        }
      } catch (e: unknown) {
        reportError(e, { context: 'Verify catch error' })
        const err = e as { message?: string }
        setStatus('error')
        setPaymentInfo({ errorMessage: err?.message || t('payment.unexpected') })
        toast.error(t('payment.unexpected'))
      }
    }

    if (status === 'loading') verify()
  }, [searchParams, clearCart, status, t])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Loader size={32} className="text-primary-navy animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {t('payment.verifyingTitle')}
          </h2>
          <p className="text-steel-gray">
            {t('payment.verifyingDesc')}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {t('payment.failedTitle')}
          </h2>
          <p className="text-steel-gray mb-6">
            {paymentInfo?.errorMessage || t('cart.errors.paymentError')}
          </p>
          <div className="space-y-3">
            <Link
              href={Routes.checkout()}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              {t('payment.retry')}
            </Link>
            <Link
              href={Routes.cart()}
              className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              {t('checkout.backToCart')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="bg-success-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-success-green" />
        </div>
        <h2 className="text-2xl font-bold text-industrial-gray mb-4">
          {t('payment.orderCompletedTitle')}
        </h2>
        <p className="text-steel-gray mb-6">
          {t('payment.orderNoLabel')}: <strong>{paymentInfo?.conversationId || 'DEMO-ORDER'}</strong>
        </p>
        <p className="text-steel-gray mb-8">
          {t('payment.orderCompletedDesc')}
        </p>
        {/* Order summary */}
        <div className="grid grid-cols-1 gap-3 mb-6 text-left">
          {orderSummary.createdAt && (
            <div className="flex justify-between text-sm text-steel-gray">
              <span>{t('payment.dateLabel')}</span>
              <span>{formatDateTime(orderSummary.createdAt, lang)}</span>
            </div>
          )}
          {typeof orderSummary.items === 'number' && (
            <div className="flex justify-between text-sm text-steel-gray">
              <span>{t('payment.itemsCountLabel')}</span>
              <span>{orderSummary.items}</span>
            </div>
          )}
          {typeof orderSummary.amount === 'number' && (
            <div className="flex justify-between text-sm font-semibold text-industrial-gray">
              <span>{t('orders.totalAmount')}</span>
              <span>{formatCurrency(orderSummary.amount, lang, { maximumFractionDigits: 0 })}</span>
            </div>
          )}
        </div>
        {/* Trust badge */}
        <div className="flex items-center justify-center space-x-2 text-success-green mb-4">
          <ShieldCheck size={18} />
          <span className="text-sm font-medium">{t('payment.securedBy3d')}</span>
        </div>
        <div className="space-y-3">
          <Link
            href={Routes.account.orderDetail(searchParams?.get('orderId') || '')}
            className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block text-center"
          >
            {t('payment.viewOrderDetails')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage



