import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useCallback,useEffect,useState } from 'react'
import { toast } from 'sonner'

import { reportError } from '@/lib/errorReporter'
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
 * Ödeme yüzeyinin GÖRÜNÜR durumu — cetvel §4'ün (yüzey sözleşmesi) kod karşılığı.
 *
 * NİÇİN AYRI BİR AŞAMA ALANI (T080-A · 2026-08-18): eskiden görünen şey `loading` ve
 * `formReady` ikilisinden türetiliyordu ve iki ölümcül kusur vardı:
 *   1. `setFormReady` **hiçbir yerde çağrılmıyordu** → `formReady` kalıcı `false` → örtünün
 *      kapanma koşulu hiç yoktu. Form kusursuz render olsa bile üstünü örtmeye devam ederdi.
 *   2. `loading === false` "bitti", "hiç başlamadı" ve "hata aldı" hâllerinin ÜÇÜNÜ birden
 *      gösteriyordu; ekran bu yüzden hatayı da "Güvenli form yükleniyor" diye okuyordu.
 * Sonuç: **arıza ilerlemeden ayırt edilemiyordu.** Aşamalar ayrık olmak zorunda.
 */
export type PaymentPhase =
  /** Henüz başlatılmadı. */
  | 'idle'
  /** İstek uçuşta — PSP'den yanıt bekleniyor. */
  | 'starting'
  /** Yanıt geldi, form yüzeyi kuruluyor (betik enjekte edildi, render bekleniyor). */
  | 'formLoading'
  /** Form GERÇEKTEN ekranda — ölçülerek doğrulandı, varsayılmadı. */
  | 'ready'
  /** Başarısız. Kullanıcı hata görür; sessiz bekleme YOK. */
  | 'error'

/**
 * Form yüzeyinin belirmesi için tanınan süre. Aşılırsa `error`'a düşülür.
 *
 * NİÇİN ZAMAN AŞIMI ŞART: betik enjeksiyonu başarısız olduğunda (CSP reddi, ağ arızası, PSP
 * tarafı) tarayıcı bize hiçbir olay göndermez — `script.onerror` yalnız DIŞ kaynaklı betikte
 * ateşler, CSP tarafından engellenen satır-içi betik **sessizce** ölür. Zaman aşımı, o
 * sessizliği kullanıcıya görünür bir sonuca çeviren tek mekanizmadır.
 */
export const FORM_RENDER_TIMEOUT_MS = 15000

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
  const [formReady, setFormReady] = useState(false)
  const [progressPct, setProgressPct] = useState(20)
  const [paymentFrameContent, setPaymentFrameContent] = useState('')
  const [phase, setPhase] = useState<PaymentPhase>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Yüzey "form gerçekten çıktı" dediğinde çağrılır — VARSAYIMLA değil ÖLÇÜMLE.
   * Cetvel K2: başarı yolu boş ekran üretemez.
   */
  const markFormReady = useCallback(() => {
    setFormReady(true)
    setPhase('ready')
    setProgressPct(100)
  }, [])

  /**
   * Yüzey kurulamadı. Kullanıcıya hata gösterilir ve olay `client_errors`'a düşer.
   *
   * NİÇİN RAPORLAMA BURADA: bu dal sessiz kalırsa arıza yalnız kullanıcının ekranında
   * yaşar ve hiçbir yere iz bırakmaz — T080 tam olarak böyle aylarca görünmez kaldı.
   */
  const markFormFailed = useCallback((reason: string) => {
    setPhase('error')
    setErrorMessage(t('checkout.errors.paymentFormRender'))
    reportError(new Error(`PAYMENT_FORM_RENDER_FAILED: ${reason}`), {
      context: 'useCheckoutPayment.formRender',
      reason,
    })
  }, [t])

  const initiatePayment = async () => {
    setLoading(true)
    setPhase('starting')
    setErrorMessage('')
    setFormReady(false)
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

        // Gömülü form (T080 kararı = varyant A). PSP'nin döndürdüğü form parçası
        // `checkoutFormContent`'tir; formu KURAN betik onun içindedir.
        //
        // BUGÜNE KADAR OKUNMUYORDU: uç bu alanı 2026-08-15'ten beri gönderiyor, istemci
        // yalnız `token`'ı alıp boş bir kap basıyordu. Kabı dolduracak hiçbir şey yoktu —
        // T080'in kök sebebi buydu. `token` da tutulmaya devam ediyor: PSP bazı akışlarda
        // içerik yerine yalnız token döndürebiliyor ve kap `data-token` ile çalışıyor.
        if (d.checkoutFormContent || d.token) {
          setIyzToken(d.token || '')
          setPaymentFrameContent(d.checkoutFormContent || '')
          setPaymentUrl(d.paymentPageUrl || '')
          setOrderId(d.orderId || '')
          setConvId(d.conversationId || '')
          setPhase('formLoading')
          setProgressPct(60)
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
      const shown = i18nKey ? t(i18nKey) : (msg || t('checkout.errors.paymentInit'))
      toast.error(shown)

      // Ekran da hatayı GÖSTERMELİ. Eskiden yalnız geçici bir toast atılıyordu; toast
      // sönünce geriye sonsuza kadar "Güvenli form yükleniyor" yazan bir örtü kalıyordu.
      setPhase('error')
      setErrorMessage(shown)

      // Ve olay bir yere İZ BIRAKMALI: bu dal bugüne kadar hiçbir kayıt üretmiyordu,
      // bu yüzden arıza yalnız kullanıcının ekranında yaşıyordu (fail-closed dikiş yeri
      // alarm ister). `reportError` fire-and-forget'tir, akışı etkilemez.
      reportError(err, { context: 'useCheckoutPayment.initiatePayment', code: i18nKey ?? 'unknown' })
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
    formReady,
    progressPct,
    paymentFrameContent,
    phase,
    errorMessage,
    markFormReady,
    markFormFailed,
    setFormReady,
    setProgressPct,
    initiatePayment
  }
}
