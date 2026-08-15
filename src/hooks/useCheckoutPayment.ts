import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import type { CartItem } from '@/types/cart'

import { validateServerCart } from '../lib/order'
import {
  CheckoutAddressInfo,
  CheckoutCustomerInfo,
  CheckoutInvoiceInfo,
  CheckoutLegalConsents
} from '../types/db-rows'
import { getPriceHashLocal, getPriceHashServer } from '../utils/checkoutHelpers'

interface UseCheckoutPaymentProps {
  items: CartItem[]
  getCartTotal: () => number
  user: User | null
  clearCart: (options?: { silent: boolean }) => void
  applyServerPricing: (items: { product_id: string, unit_price: number | null }[]) => void
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

/** `PaymentWatcher`'ın okuduğu anahtar — tek kaynak burada tanımlı. */
export const PENDING_ORDER_KEY = 'vh_pending_order'

/**
 * Sunucu fiyat doğrulaması yapılamadığında fırlatılır.
 *
 * `message` makine kodudur (log/Sentry); kullanıcıya gösterilecek metin `i18nKey`
 * üzerinden sözlükten çözülür — `buildPaymentRequest`'teki hata sınıflarıyla aynı sözleşme.
 */
export class ServerValidationUnavailableError extends Error {
  readonly code = 'SERVER_VALIDATION_UNAVAILABLE'
  readonly i18nKey = 'checkout.errors.priceVerificationFailed'

  constructor(cause: unknown) {
    super(`SERVER_VALIDATION_UNAVAILABLE: ${cause instanceof Error ? cause.message : String(cause)}`)
    this.name = 'ServerValidationUnavailableError'
  }
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

  const initiatePayment = async () => {
    setLoading(true)
    try {
      let authoritativeTotal = getCartTotal()

      // ── Sunucu fiyat doğrulaması — FAIL-CLOSED ─────────────────────────────────
      // Eskiden bu blok `try/catch` içindeydi ve hatayı `console.warn` ile yutup yerel
      // toplamla devam ediyordu. Çağrı da anon anahtarla yapıldığı için HER ZAMAN 401
      // alıyordu (ölçüldü — bkz. `lib/order.ts` başlığı): yani doğrulama hiç çalışmadı,
      // çalışmadığı da hiç görülmedi. Doğrulama yapılamıyorsa ödeme BAŞLAMAZ; aksi hâlde
      // tahsil edilecek tutarı tarayıcı belirlemiş olur.
      let validation
      try {
        validation = await validateServerCart(supabase, { userId: user?.id })
      } catch (e) {
        throw new ServerValidationUnavailableError(e)
      }

      const localHash = getPriceHashLocal(items)
      const serverHash = getPriceHashServer(validation.items, items)
      if (serverHash !== localHash) {
        applyServerPricing(validation.items)
        authoritativeTotal = validation.totals?.subtotal ?? authoritativeTotal
        toast(t('checkout.priceUpdated'))
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
        // Sipariş kimliğini KALICI yere yaz: kullanıcı 3DS penceresinden dönemezse
        // (banka uygulamasına geçiş, sekme düşmesi) `PaymentWatcher` onu buradan bulur.
        // Bu anahtarı bugüne kadar hiçbir yer YAZMIYORDU → watcher hiç başlamıyordu.
        if (d.orderId) {
          try {
            localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({
              orderId: d.orderId,
              conversationId: d.conversationId || null,
            }))
          } catch { /* private mode: watcher devre dışı kalır, ödeme etkilenmez */ }
        }

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
      // W4b: bazı hatalar (ör. fiyatsız kalemle ödeme denemesi) makine kodu taşır
      // (`CART_ITEM_PRICE_MISSING: <uuid>`). Onu kullanıcıya olduğu gibi göstermek yerine
      // hatanın taşıdığı i18n anahtarı çözülür — CLAUDE.md §7.
      const i18nKey =
        err !== null && typeof err === 'object' && 'i18nKey' in err
          ? String((err as { i18nKey: unknown }).i18nKey)
          : null
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(i18nKey ? t(i18nKey) : (msg || t('checkout.errors.paymentInit')))
      return false
    } finally {
      setLoading(false)
    }
  }

  // ── Sipariş durumu yoklaması ────────────────────────────────────────────────
  // `status` DEĞİL `payment_status` okunur. `venthub_orders_status_check` yalnız
  // pending/confirmed/processing/shipped/delivered/cancelled kabul ediyor (prod'dan
  // doğrulandı, 2026-08-15) — `'paid'` orada YOK, `payment_status` kolonunun değeri.
  // Bu yüzden `status === 'paid'` bekleyen eski koşul HİÇ gerçekleşemiyordu ve bu
  // yoklama ölü bir güvenlik ağıydı. `sync_payment_status_with_status` tetikleyicisi
  // status 'confirmed' olduğunda payment_status'ü 'paid' yapıyor → doğru sinyal bu.
  useEffect(() => {
    if (!orderId) return
    const timer = setInterval(async () => {
      const { data } = await supabase
        .from('venthub_orders')
        .select('payment_status')
        .eq('id', orderId)
        .maybeSingle()

      if (data?.payment_status === 'paid') {
        clearInterval(timer)
        try { localStorage.removeItem(PENDING_ORDER_KEY) } catch { /* yok sayılır */ }
        clearCart()
        router.push(`/payment-success?orderId=${orderId}&status=success`)
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [orderId, clearCart, router])

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
