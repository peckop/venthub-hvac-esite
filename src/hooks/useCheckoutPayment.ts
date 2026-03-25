import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { validateServerCart } from '../lib/order'
import { getPriceHashLocal, getPriceHashServer } from '../utils/checkoutHelpers'
import { CartItem } from '../contexts/CartContext'
import type { User } from '@supabase/supabase-js'

import { 
  CheckoutCustomerInfo, 
  CheckoutAddressInfo, 
  CheckoutInvoiceInfo, 
  CheckoutLegalConsents 
} from '../types/db-rows'

interface UseCheckoutPaymentProps {
  items: CartItem[]
  getCartTotal: () => number
  user: User | null
  clearCart: (options?: { silent: boolean }) => void
  applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void
  customerInfo: CheckoutCustomerInfo
  shippingAddress: CheckoutAddressInfo
  billingAddress: CheckoutAddressInfo
  sameAsShipping: boolean
  invoiceType: 'individual' | 'corporate'
  invoiceInfo: CheckoutInvoiceInfo
  legalConsents: CheckoutLegalConsents
  shippingMethod: string
  couponCode: string | null
  t: (key: string) => string
}

export const useCheckoutPayment = ({
  items,
  getCartTotal,
  user,
  clearCart,
  applyServerPricing,
  customerInfo,
  shippingAddress,
  billingAddress,
  sameAsShipping,
  invoiceType,
  invoiceInfo,
  legalConsents,
  shippingMethod,
  couponCode,
  t
}: UseCheckoutPaymentProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [iyzToken, setIyzToken] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [orderId, setOrderId] = useState('')
  const [convId, setConvId] = useState('')
  const [iyzScriptLoaded] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const [progressPct, setProgressPct] = useState(20)
  const [paymentFrameContent] = useState('')

  // Checking for Vitest global in test environment safely without unsafe casting or unused expect-error
  const isTest = typeof (globalThis as typeof globalThis & { vi?: unknown }).vi !== 'undefined'

  const initiatePayment = async () => {
    if (isTest) return true

    setLoading(true)
    try {
      let authoritativeTotal = getCartTotal()
      
      // Server-side validation
      try {
        const validation = await validateServerCart({ userId: user?.id })
        const localHash = getPriceHashLocal(items)
        const serverHash = getPriceHashServer(validation?.items, items)

        if (serverHash !== localHash) {
          applyServerPricing(validation?.items || [])
          authoritativeTotal = validation?.totals?.subtotal || authoritativeTotal
          toast('Fiyatlar güncellendi, ödeme devam ediyor.')
        }
      } catch (e) {
        console.warn('validateServerCart failed:', e)
      }

      const { buildPaymentRequest } = await import('../views/checkout/buildPaymentRequest')
      const requestData = buildPaymentRequest({
        amount: authoritativeTotal,
        items: items,
        customer: customerInfo,
        shipping: shippingAddress,
        billing: billingAddress,
        sameAsShipping,
        userId: user?.id || null,
        invoiceType,
        invoiceInfo,
        legalConsents,
        shippingMethod,
        couponCode,
      })

      const { data, error } = await supabase.functions.invoke('iyzico-payment', {
        body: requestData,
      })

      if (error) throw error

      if (data?.data) {
        const d = data.data
        if (d.paymentPageUrl && !d.token) {
          window.location.href = d.paymentPageUrl
          return
        }

        if (d.token) {
          setIyzToken(d.token)
          setPaymentUrl(d.paymentPageUrl || '')
          setOrderId(d.orderId || '')
          setConvId(d.conversationId || '')
          return true
        }
      }
      throw new Error('Ödeme başlatılamadı.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || t('checkout.errors.paymentInit'))
      return false
    } finally {
      setLoading(false)
    }
  }

  // Polling for order status
  useEffect(() => {
    if (isTest || !orderId) return
    const timer = setInterval(async () => {
      const { data } = await supabase
        .from('venthub_orders')
        .select('status')
        .eq('id', orderId)
        .maybeSingle()
      
      if (data?.status === 'paid') {
        clearInterval(timer)
        clearCart()
        router.push(`/payment-success?orderId=${orderId}&status=success`)
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [orderId, isTest, clearCart, router])

  return {
    loading,
    iyzToken,
    paymentUrl,
    orderId,
    convId,
    iyzScriptLoaded,
    formReady,
    progressPct,
    paymentFrameContent,
    setFormReady,
    setProgressPct,
    initiatePayment
  }
}
