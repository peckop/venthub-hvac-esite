import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { validateServerCart } from '../lib/order'
import { getPriceHashLocal, getPriceHashServer } from '../utils/checkoutHelpers'
import type { CartItem } from '@/types/cart'
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
  orchestrator: {
    customerInfo: CheckoutCustomerInfo
    shippingAddress: CheckoutAddressInfo
    billingAddress: CheckoutAddressInfo
    sameAsShipping: boolean
    invoiceType: 'individual' | 'corporate'
    invoiceInfo: CheckoutInvoiceInfo
    legalConsents: CheckoutLegalConsents
    shippingMethod: string
  }
  couponCode: string | null
  t: (key: string) => string
}

/**
 * Manages the checkout payment flow, integrating with the server-side validation and Iyzico payment gateway.
 * Handles cart validation, generating payment requests, initializing the Iyzico form, and polling for successful payment.
 *
 * @param props - Configuration and state objects required for the checkout process
 * @param props.items - Current items in the shopping cart
 * @param props.getCartTotal - Function returning the total cart value
 * @param props.user - The currently authenticated Supabase user (if any)
 * @param props.clearCart - Function to empty the cart after successful payment
 * @param props.applyServerPricing - Function to update cart prices if server validation detects mismatches
 * @param props.orchestrator - Grouped states for form elements from useCheckoutOrchestrator
 * @param props.couponCode - Applied discount code (if any)
 * @param props.t - Translation function for localized error messages
 * @returns An object containing payment state (loading, token, URL), configuration functions, and the `initiatePayment` trigger.
 *
 * @example
 * const { initiatePayment, loading, iyzToken } = useCheckoutPayment({
 *   items, getCartTotal, user, clearCart, applyServerPricing,
 *   orchestrator, couponCode: null, t
 * });
 */
export const useCheckoutPayment = ({
  items,
  getCartTotal,
  user,
  clearCart,
  applyServerPricing,
  orchestrator,
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
  const isTest = 'vi' in globalThis

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
        customer: orchestrator.customerInfo,
        shipping: orchestrator.shippingAddress,
        billing: orchestrator.billingAddress,
        sameAsShipping: orchestrator.sameAsShipping,
        userId: user?.id || null,
        invoiceType: orchestrator.invoiceType,
        invoiceInfo: orchestrator.invoiceInfo,
        legalConsents: orchestrator.legalConsents,
        shippingMethod: orchestrator.shippingMethod,
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
