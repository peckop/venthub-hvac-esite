'use client'

import React, { useState, useEffect } from 'react' // refresh
import { useCart } from '../hooks/useCartHook'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { listAddresses, UserAddress, updateAddress, deleteAddress, listInvoiceProfiles, fetchDefaultInvoiceProfile, type InvoiceProfile } from '../lib/supabase'
import { ArrowLeft, CreditCard, MapPin, User, Lock, CheckCircle } from 'lucide-react'
import SecurityRibbon from '../components/SecurityRibbon'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import { formatCurrency } from '../i18n/format'
import ReviewSummary from './checkout/ReviewSummary'
import CheckoutProgress from './checkout/CheckoutProgress'
import StepCustomerInfo from './checkout/StepCustomerInfo'
import StepAddressInfo from './checkout/StepAddressInfo'
import OrderSummarySidebar from './checkout/OrderSummarySidebar'
import PaymentIframeContainer from './checkout/PaymentIframeContainer'
import SecurePaymentOverlay from './checkout/SecurePaymentOverlay'
import AddressSelectModal from './checkout/AddressSelectModal'
import InvoiceProfileModal from './checkout/InvoiceProfileModal'
import AddressFormModal from './checkout/AddressFormModal'
import { validateServerCart } from '../lib/order'

interface CustomerInfo {
  name: string
  email: string
  phone: string
  identityNumber?: string
}

interface Address {
  fullAddress: string
  city: string
  district: string
  postalCode: string
}

export const CheckoutPage: React.FC = () => {
  const { items, getCartTotal, clearCart, removeFromCart, updateQuantity, applyServerPricing } = useCart()
  // Test ortamı tespiti (Vitest) — global "vi" varlığını kontrol et
  const isTest = typeof (globalThis as unknown as { vi?: unknown }).vi !== 'undefined'
  const { user, loading: authLoading } = useAuth()

  // Dev-only debug logger to avoid leaking PII in production
  const debug = (...args: unknown[]) => {
    let on = process.env.NEXT_PUBLIC_DEBUG === 'true'
    try { if (!on && typeof localStorage !== 'undefined') on = localStorage.getItem('vh_debug') === '1' } catch { }
    if (on) {
      try { console.warn(...args) } catch { }
    }
  }
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Info, 2: Address, 3: Review, 4: Payment
  const { t, lang } = useI18n()
  // i18n fallback helper
  const tf = (key: string, fallback: string) => {
    try {
      const v = t(key)
      return v === key ? fallback : v
    } catch {
      return fallback
    }
  }
  // Price hash helpers to prevent repeated confirmation loops
  const to2 = (n: number) => Number(Number(n).toFixed(2))
  const priceHashLocal = () => {
    const norm = items.map(i => ({ id: i.id, qty: i.quantity, unit: to2(Number((typeof i.unitPrice === 'number' ? i.unitPrice : Number(i.product.price)))) }))
      .sort((a, b) => a.id.localeCompare(b.id))
    return JSON.stringify(norm)
  }
  const priceHashServer = (serverItems: Array<{ product_id: string; quantity?: number; unit_price: number }> | undefined | null) => {
    const arr = Array.isArray(serverItems) ? serverItems : []
    const norm = arr.map(i => ({ id: String(i.product_id), qty: Number(i.quantity ?? items.find(it => it.id === String(i.product_id))?.quantity ?? 0), unit: to2(Number(i.unit_price)) }))
      .sort((a, b) => a.id.localeCompare(b.id))
    return JSON.stringify(norm)
  }

  // Auth check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?from=/checkout')
      return
    }
  }, [user, authLoading, router])

  // Pre-fill customer info if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        identityNumber: ''
      })
    }
  }, [user])

  // Prefill addresses from address book (defaults) and keep list for quick selection
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressPickTarget, setAddressPickTarget] = useState<'shipping' | 'billing'>('shipping')
  const [savedInvoiceProfiles, setSavedInvoiceProfiles] = useState<InvoiceProfile[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [defaultInvoiceApplied, setDefaultInvoiceApplied] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null)
  useEffect(() => {
    let mounted = true
    async function prefillAddresses() {
      if (!user) return
      try {
        // Load addresses
        const rows: UserAddress[] = await listAddresses()
        if (!mounted) return
        setSavedAddresses(rows)
        const defShip = rows.find(r => r.is_default_shipping)
        const defBill = rows.find(r => r.is_default_billing)
        if (defShip) {
          setShippingAddress({
            fullAddress: defShip.full_address || '',
            city: defShip.city || '',
            district: defShip.district || '',
            postalCode: defShip.postal_code || ''
          })
        }
        if (defBill) {
          setBillingAddress({
            fullAddress: defBill.full_address || '',
            city: defBill.city || '',
            district: defBill.district || '',
            postalCode: defBill.postal_code || ''
          })
          // Kullanıcının tercihini otomatik bozmayalım; varsayılan olarak aynı kalsın
        } else if (defShip) {
          // Fatura varsayılanı yoksa, başlangıçta teslimat ile aynı bilgileri yansıt
          setBillingAddress({
            fullAddress: defShip.full_address || '',
            city: defShip.city || '',
            district: defShip.district || '',
            postalCode: defShip.postal_code || ''
          })
          // sameAsShipping başlangıçta true kalsın
        }
      } catch {
        // no-op
      }
    }
    prefillAddresses()
    return () => { mounted = false }
  }, [user])

  // Form states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    identityNumber: ''
  })

  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullAddress: '',
    city: '',
    district: '',
    postalCode: ''
  })

  const [billingAddress, setBillingAddress] = useState<Address>({
    fullAddress: '',
    city: '',
    district: '',
    postalCode: ''
  })

  // Fatura ve yasal onaylar durumları
  type InvoiceType = 'individual' | 'corporate'
  interface InvoiceInfoIndividual { tckn: string }
  interface InvoiceInfoCorporate { companyName: string; vkn: string; taxOffice: string; eInvoice?: boolean }
  type InvoiceInfo = Partial<InvoiceInfoIndividual & InvoiceInfoCorporate> & { type?: InvoiceType }
  interface LegalConsents { kvkk: boolean; distanceSales: boolean; preInfo: boolean; orderConfirm: boolean; marketing?: boolean }

  const [invoiceType, setInvoiceType] = useState<InvoiceType>('individual')
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({ type: 'individual', tckn: '' })
  const [legalConsents, setLegalConsents] = useState<LegalConsents>({ kvkk: false, distanceSales: false, preInfo: false, orderConfirm: false, marketing: false })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentFrameContent, setPaymentFrameContent] = useState('')
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [convId, setConvId] = useState('')
  const [iyzToken, setIyzToken] = useState('')
  const [iyzScriptLoaded, setIyzScriptLoaded] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [formReady, setFormReady] = useState(false)
  const [progressPct, setProgressPct] = useState(20)
  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)

  // Validation functions
  const validateCustomerInfo = () => {
    if (!customerInfo.name.trim()) {
      toast.error(t('checkout.errors.nameRequired'))
      return false
    }
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      toast.error(t('checkout.errors.emailInvalid'))
      return false
    }
    if (!customerInfo.phone.trim()) {
      toast.error(t('checkout.errors.phoneRequired'))
      return false
    }
    return true
  }

  const validateAddress = (address: Address) => {
    if (!address.fullAddress.trim()) {
      toast.error(t('checkout.errors.addressRequired'))
      return false
    }
    if (!address.city.trim()) {
      toast.error(t('checkout.errors.cityRequired'))
      return false
    }
    if (!address.district.trim()) {
      toast.error(t('checkout.errors.districtRequired'))
      return false
    }
    if (!address.postalCode.trim()) {
      toast.error(t('checkout.errors.postalRequired'))
      return false
    }
    return true
  }

  // Basit rakam ve uzunluk kontrollü doğrulamalar (saha gerçekleri nedeniyle aşırı kuralcı olmayan)
  const isDigits = (s: string) => /^\d+$/.test(s)
  const validateInvoiceAndConsents = () => {
    if (invoiceType === 'individual') {
      const tcknVal = (invoiceInfo.tckn || '').trim()
      if (!tcknVal) { toast.error(t('checkout.errors.tcknRequired')); return false }
      if (!(isDigits(tcknVal) && tcknVal.length === 11)) { toast.error(t('checkout.errors.tcknFormat')); return false }
    } else {
      const vkn = (invoiceInfo.vkn || '').trim()
      const companyName = (invoiceInfo.companyName || '').trim()
      const taxOffice = (invoiceInfo.taxOffice || '').trim()
      if (!companyName) { toast.error(t('checkout.errors.companyRequired')); return false }
      if (!vkn) { toast.error(t('checkout.errors.vknRequired')); return false }
      if (!(isDigits(vkn) && vkn.length === 10)) { toast.error(t('checkout.errors.vknFormat')); return false }
      if (!taxOffice) { toast.error(t('checkout.errors.taxOfficeRequired')); return false }
    }

    if (!legalConsents.kvkk) { toast.error(t('checkout.errors.kvkkRequired')); return false }
    if (!legalConsents.distanceSales) { toast.error(t('checkout.errors.distanceSalesRequired')); return false }
    if (!legalConsents.preInfo) { toast.error(t('checkout.errors.preInfoRequired')); return false }
    if (!legalConsents.orderConfirm) { toast.error(t('checkout.errors.orderConfirmRequired')); return false }

    return true
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (validateCustomerInfo()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateAddress(shippingAddress) && (sameAsShipping || validateAddress(billingAddress)) && validateInvoiceAndConsents()) {
        setStep(3) // go to Review
      }
    } else if (step === 3) {
      // from Review -> Payment
      setStep(4)
      initiatePayment()
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const initiatePayment = async () => {
    debug('=== İNITATE PAYMENT STARTED ===');
    debug('Cart items:', items);
    debug('Cart total:', getCartTotal());
    debug('Customer info present:', Boolean(customerInfo?.email));
    debug('Shipping city:', shippingAddress?.city);

    // Test ortamında yan etkileri tamamen kapat ve direkt 4. adıma geç
    if (isTest) {
      setStep(4)
      return
    }

    setLoading(true)
    let lastRequestData: unknown = null
    try {
      // 0) Server-side fiyat doğrulaması (sessiz)
      let authoritativeTotal = getCartTotal()
      try {
        const validation = await validateServerCart({ userId: user?.id || undefined })
        // 0.a) Stok problemleri varsa sepeti uyumla ve kullanıcıyı Review'a döndür
        const stockIssues = validation?.stock_issues ?? []
        if (Array.isArray(stockIssues) && stockIssues.length > 0) {
          for (const s of stockIssues) {
            const pid = s.product_id
            const avail = Number(s.available)
            if (!Number.isFinite(avail) || avail <= 0) {
              try { removeFromCart(pid) } catch { }
            } else {
              try { updateQuantity(pid, avail) } catch { }
            }
          }
          toast('Bazı ürünlerin stokları güncellendi. Lütfen kontrol edin ve onaylayın.')
          setStep(3)
          setLoading(false)
          return
        }
        // 0.b) Fiyatlar değişmiş mi? Önce hash ile kontrol et (idempotent)
        const serverTotal = validation?.totals?.subtotal ?? authoritativeTotal
        const localTotal = authoritativeTotal
        const s2 = Number(Number(serverTotal).toFixed(2))
        const l2 = Number(Number(localTotal).toFixed(2))
        const localHash = priceHashLocal()
        const serverHash = priceHashServer(validation?.items)
        const hashesDiffer = serverHash !== localHash
        debug('validation diff check', { s2, l2, diff: Number(Math.abs(s2 - l2).toFixed(4)), hashesDiffer, localHash, serverHash })

        if (hashesDiffer || Math.abs(s2 - l2) > 0.01) {
          // Sunucunun fiyatlarını uygula ve ÖDEMEYE DEVAM ET (kullanıcıyı geri döndürme)
          try { applyServerPricing(validation?.items || []) } catch { }
          try { localStorage.setItem('vh_last_price_hash', serverHash) } catch { }
          authoritativeTotal = s2
          toast('Fiyatlar güncellendi, ödeme devam ediyor.')
          // Not: Artık geri dönmüyoruz; ödeme isteği düzeltilmiş tutarla devam edecek
        }
      } catch (e) {
        // Doğrulama hatasını kullanıcıya yansıtmayalım; ödeme akışını engellemesin
        console.warn('validateServerCart failed:', e)
      }

      // İstek verisini tek bir saf fonksiyonla oluştur
      const { buildPaymentRequest } = await import('./checkout/buildPaymentRequest')
      const requestData = buildPaymentRequest({
        amount: authoritativeTotal,
        items: items as any,
        customer: { name: customerInfo.name, email: customerInfo.email, phone: customerInfo.phone },
        shipping: shippingAddress,
        billing: billingAddress,
        sameAsShipping,
        userId: user?.id || null,
        invoiceType,
        invoiceInfo,
        legalConsents,
        shippingMethod,
        couponCode: couponApplied?.code || null,
      })
      lastRequestData = requestData

      // Debug: özet log (PII maskelemeden minimal alanlarla)
      debug('iyz init payload summary', {
        amount: requestData?.amount,
        items: Array.isArray(requestData?.cartItems) ? requestData.cartItems.map(({ product_id, quantity, price }: { product_id: string; quantity: number; price: number }) => ({ id: product_id, q: quantity, p: price })) : [],
        shipCity: requestData?.shippingAddress?.city,
        billCity: requestData?.billingAddress?.city,
      })

      const headers: Record<string, string> = {}
      try { if (process.env.NEXT_PUBLIC_DEBUG === 'true' || (typeof localStorage !== 'undefined' && localStorage.getItem('vh_debug') === '1')) headers['x-debug'] = '1' } catch { }

      const { data, error } = await supabase.functions.invoke('iyzico-payment', {
        body: requestData,
        headers,
      })

      debug('iyz init response', { ok: !error, hasData: !!data, status: data?.data?.status, hasUrl: !!data?.data?.paymentPageUrl, hasToken: !!data?.data?.token, err: error?.message })

      if (error) {
        console.error('İyzico payment error:', error);
        throw error;
      }

      if (data && data.data) {
        debug('İyzico payment response:', { status: data.data?.status, hasToken: !!data.data?.token, hasUrl: !!data.data?.paymentPageUrl });

        // Öncelik: hosted ödeme sayfasına yönlendirme (3D sonrası otomatik dönüş daha sorunsuz)
        if (data.data.paymentPageUrl) {
          debug('Redirecting to İyzico payment page:', data.data.paymentPageUrl);
          try {
            localStorage.setItem('vh_pending_order', JSON.stringify({ orderId: data.data.orderId, conversationId: data.data.conversationId }))
            localStorage.setItem('vh_last_order_id', String(data.data.orderId || ''))
          } catch { }
          window.location.href = data.data.paymentPageUrl;
          return;
        }

        // İkinci tercih: token ile gömme (iframe)
        if (data.data.token) {
          setIyzToken(data.data.token || '')
          setPaymentUrl(data.data.paymentPageUrl || '')
          setOrderId(data.data.orderId || '')
          setConvId(data.data.conversationId || '')
          try {
            localStorage.setItem('vh_pending_order', JSON.stringify({ orderId: data.data.orderId, conversationId: data.data.conversationId }))
            localStorage.setItem('vh_last_order_id', String(data.data.orderId || ''))
          } catch { }
          setStep(4)
          return
        }

        // Üçüncü tercih: checkoutFormContent (script yürütme garantisi olmayabilir)
        if (data.data.checkoutFormContent) {
          setPaymentFrameContent(data.data.checkoutFormContent)
          setOrderId(data.data.orderId || '')
          setConvId(data.data.conversationId || '')
          setStep(3)
          return
        }

        // Hemen tamamlanan ödeme (demo)
        if (data.data.status === 'success') {
          debug('Payment completed immediately');
          setOrderId(data.data.orderId || data.data.conversationId || 'completed_order');
          setOrderCompleted(true);
          clearCart({ silent: true });
          toast.success(t('checkout.paymentSuccess'));
        } else {
          throw new Error('Ödeme başlatma hatası: Geçersiz yanıt');
        }
      } else {
        throw new Error('Ödeme başlatma hatası: Boş yanıt');
      }
    } catch (error: unknown) {
      console.error('Payment initiation error:', error)
      const err = error as { message?: string; details?: unknown; code?: unknown; stack?: unknown }
      console.error('Full error details:', {
        message: err?.message,
        details: err?.details,
        code: err?.code,
        stack: err?.stack
      })

      // Try to fetch detailed error body directly (debug only)
      try {
        const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true' || (typeof localStorage !== 'undefined' && localStorage.getItem('vh_debug') === '1')
        if (isDebug) {
          const base = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
          const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          if (base && anon) {
            const resp = await fetch(`${base}/functions/v1/iyzico-payment?debug=1`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}`, 'x-debug': '1' },
              body: JSON.stringify(lastRequestData || {})
            })
            const txt = await resp.text()
            debug('iyz direct response', { status: resp.status, body: txt })
            try {
              const j = JSON.parse(txt) as { error?: { code?: string; message?: string; details?: unknown } }
              if (j?.error?.message) {
                toast.error(`${j.error.code || 'ERR'}: ${j.error.message}`)
              }
            } catch { /* no-op */ }
          }
        }
      } catch (e) {
        console.warn('debug direct fetch failed:', e)
      }

      // More detailed error message
      let errorMessage = t('checkout.errors.paymentInit')
      if (err?.message && err.message.includes('VALIDATION_ERROR')) {
        errorMessage = t('checkout.errors.validation')
      } else if (err?.message && err.message.includes('DATABASE_ERROR')) {
        errorMessage = t('checkout.errors.database')
      } else if (err?.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
      setStep(3) // Go back to review step
    } finally {
      setLoading(false)
    }
  }

  // Handle payment frame messages (bazı entegrasyonlar postMessage kullanabilir)
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.event === 'payment_success') {
        setOrderCompleted(true)
        clearCart({ silent: true })
        toast.success(t('checkout.paymentSuccess'))
      } else if (event.data.event === 'payment_error') {
        toast.error(event.data.error || t('checkout.paymentError'))
        setStep(2)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [clearCart, t])

  // İyzico token ile script'i yükle ve formu çalıştır. 8 sn içinde iframe gelmezse paymentPageUrl'e yönlendir.
  useEffect(() => {
    if (!iyzToken) return
    if (isTest) return // Testte gerçek script/timeout kurma

    // Step 3 başlangıcında formReady/progress resetle
    setFormReady(false)
    setProgressPct(20)

    // Eski script ve iframe'i temizle
    try {
      const oldScript = document.querySelector('script[data-iyz-checkout="1"]') as HTMLScriptElement | null
      if (oldScript && oldScript.parentElement) oldScript.parentElement.removeChild(oldScript)
      const mount = document.getElementById('iyzipay-checkout-form')
      if (mount) mount.innerHTML = ''
    } catch { }

    // Yeni scripti token ile ekle (İyzico beklentisi: token script tag'inde data olarak verilir)
    const script = document.createElement('script')
    script.src = 'https://sandbox-static.iyzipay.com/checkoutform/iyzipay-checkout-form.js'
    script.async = true
    script.setAttribute('data-iyz-checkout', '1')
    script.setAttribute('data-pay-with-iyzico', 'true')
    script.setAttribute('data-token', iyzToken)
    script.onload = () => setIyzScriptLoaded(true)
    document.body.appendChild(script)

    const timeout = window.setTimeout(() => {
      const formIframe = document.querySelector('#iyzipay-checkout-form iframe')
      if (!formIframe && paymentUrl) {
        try {
          localStorage.setItem('vh_pending_order', JSON.stringify({ orderId, conversationId: convId }))
          localStorage.setItem('vh_last_order_id', String(orderId || ''))
        } catch { }
        // Fallback: hosted ödeme sayfasına yönlendir (aynı sekme)
        window.location.href = paymentUrl
      }
    }, 8000)

    // İframe yüklendiğinde formReady=true yap
    const observeMount = () => {
      const mount = document.getElementById('iyzipay-checkout-form')
      if (!mount) return
      // Mevcut iframe var mı?
      const iframe = mount.querySelector('iframe') as HTMLIFrameElement | null
      if (iframe) {
        try {
          iframe.addEventListener('load', () => setFormReady(true), { once: true } as AddEventListenerOptions)
        } catch { }
        return
      }
      // Yoksa değişiklikleri izle
      const obs = new MutationObserver((_mut) => {
        const ifr = mount.querySelector('iframe') as HTMLIFrameElement | null
        if (ifr) {
          try { ifr.addEventListener('load', () => setFormReady(true), { once: true } as AddEventListenerOptions) } catch { }
          obs.disconnect()
        }
      })
      obs.observe(mount, { childList: true, subtree: true })
    }
    // Biraz gecikmeyle mount'u kontrol et
    const check = window.setTimeout(observeMount, 150)

    // En fazla 20 saniye sonra yine de devam
    const hardTimeout = window.setTimeout(() => setFormReady(true), 20000)

    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(check)
      window.clearTimeout(hardTimeout)
    }
  }, [iyzToken, paymentUrl, orderId, convId, isTest])

  // Ödeme başlatıldıktan sonra sipariş durumunu periyodik kontrol et
  useEffect(() => {
    if (isTest) return // Testte polling devre dışı
    let timer: number | undefined
    if (step === 4 && orderId) {
      timer = window.setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('venthub_orders')
            .select('status')
            .eq('id', orderId)
            .maybeSingle()
          if (!error && data?.status) {
            if (data.status === 'paid') {
              clearInterval(timer)
              clearCart()
              router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}&conversationId=${encodeURIComponent(convId || '')}&status=success`)
            } else if (data.status === 'failed') {
              clearInterval(timer)
              router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}&conversationId=${encodeURIComponent(convId || '')}&status=failure`)
            }
          }
        } catch { }
      }, 3000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [step, orderId, convId, clearCart, router, isTest])

  // Varsayılan fatura profilini, 2. adıma girildiğinde ve alanlar boşsa bir defa uygula
  useEffect(() => {
    const tryApplyDefault = async () => {
      if (step !== 2 || defaultInvoiceApplied) return
      // Alanlar anlamlı biçimde doluysa kullanıcıyı ezme
      if (invoiceType === 'individual') {
        if ((invoiceInfo.tckn || '').trim().length > 0) { setDefaultInvoiceApplied(true); return }
      } else {
        if ((invoiceInfo.companyName || '').trim().length > 0 || (invoiceInfo.vkn || '').trim().length > 0 || (invoiceInfo.taxOffice || '').trim().length > 0) { setDefaultInvoiceApplied(true); return }
      }
      try {
        const def = await fetchDefaultInvoiceProfile()
        if (def) {
          if (def.type === 'individual') {
            setInvoiceType('individual')
            setInvoiceInfo({ type: 'individual', tckn: def.tckn || '' })
          } else {
            setInvoiceType('corporate')
            setInvoiceInfo({ type: 'corporate', companyName: def.company_name || '', vkn: def.vkn || '', taxOffice: def.tax_office || '', eInvoice: !!def.e_invoice })
          }
        }
      } catch { }
      setDefaultInvoiceApplied(true)
    }
    tryApplyDefault()
  }, [step, defaultInvoiceApplied, invoiceInfo, invoiceType])

  // Görsel ilerleme (yumuşak dolma) — formReady olana kadar %95'e kadar artar
  useEffect(() => {
    if (isTest) return // Testte görsel ilerleme devre dışı
    if (step !== 4 || formReady) return
    const t = window.setInterval(() => {
      setProgressPct((p) => {
        const next = p + 2
        return next >= 95 ? 95 : next
      })
    }, 250)
    return () => window.clearInterval(t)
  }, [step, formReady, isTest])

  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {t('checkout.emptyCart.title')}
          </h2>
          <p className="text-steel-gray mb-6">
            {t('checkout.emptyCart.desc')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('checkout.emptyCart.startShopping')}
          </Link>
        </div>
      </div>
    )
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-success-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-success-green" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            Siparişiniz Tamamlandı!
          </h2>
          <p className="text-steel-gray mb-6">
            Sipariş No: <strong>{orderId}</strong>
          </p>
          <p className="text-steel-gray mb-8">
            Siparişiniz başarıyla alındı. E-posta adresinize sipariş detayları gönderilecektir.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/orders"
              className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              Siparişlerim
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalAmount = getCartTotal()
  const vatAmount = Number((totalAmount - totalAmount / 1.2).toFixed(2))
  const finalAmount = Number((totalAmount - (couponApplied?.discount || 0)).toFixed(2))

  const overlayVisible = step === 4 && !formReady
  const overlayStep = loading ? 1 : (step === 4 && iyzToken && !formReady ? (iyzScriptLoaded ? 3 : 2) : 3)
  const overlayPercent = overlayStep === 1 ? 33 : overlayStep === 2 ? 66 : (formReady ? 100 : 90)

  // Modals are now handled by sub-components

  return (
    <div className="min-h-screen bg-light-gray">
      <SecurePaymentOverlay
        overlayVisible={overlayVisible}
        overlayStep={overlayStep}
        overlayPercent={overlayPercent}
        t={t}
      />

      {showAddressModal && step === 2 && (
        <AddressSelectModal
          title={t('checkout.saved.select')}
          addresses={savedAddresses}
          onClose={() => setShowAddressModal(false)}
          onPick={(a) => {
            if (addressPickTarget === 'shipping') {
              setShippingAddress({ fullAddress: a.full_address || '', city: a.city || '', district: a.district || '', postalCode: a.postal_code || '' })
            } else {
              setBillingAddress({ fullAddress: a.full_address || '', city: a.city || '', district: a.district || '', postalCode: a.postal_code || '' })
            }
            setShowAddressModal(false)
          }}
          onEdit={(a) => {
            setAddressToEdit(a)
            setShowAddressModal(false)
          }}
          onDelete={async (id) => {
            if (!confirm(t('checkout.saved.confirmDelete'))) return
            try {
              await deleteAddress(id)
              toast.success(t('checkout.saved.deleted'))
              const rows = await listAddresses(); setSavedAddresses(rows)
            } catch (e) {
              console.error(e)
              toast.error(t('checkout.saved.deleteError'))
            }
          }}
          t={t}
        />
      )}

      {showInvoiceModal && step === 2 && (
        <InvoiceProfileModal
          title={t('account.invoices.title')}
          profiles={savedInvoiceProfiles}
          onClose={() => setShowInvoiceModal(false)}
          onPick={(p) => {
            if (p.type === 'individual') {
              setInvoiceType('individual')
              setInvoiceInfo({ type: 'individual', tckn: p.tckn || '' })
            } else {
              setInvoiceType('corporate')
              setInvoiceInfo({ type: 'corporate', companyName: p.company_name || '', vkn: p.vkn || '', taxOffice: p.tax_office || '', eInvoice: !!p.e_invoice })
            }
            setShowInvoiceModal(false)
          }}
          t={t}
        />
      )}

      {addressToEdit && (
        <AddressFormModal
          address={addressToEdit}
          onClose={() => setAddressToEdit(null)}
          onSaved={async () => {
            const rows = await listAddresses()
            setSavedAddresses(rows)
          }}
          t={t}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutProgress
          step={step}
          t={t}
          onBackToCart={() => router.push('/cart')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
              {/* Step 4: Payment */}
              {step === 4 && (
                <PaymentIframeContainer
                  iyzToken={iyzToken}
                  paymentFrameContent={paymentFrameContent}
                  showHelp={showHelp}
                  setShowHelp={setShowHelp}
                  progressPct={progressPct}
                  overlayStep={overlayStep}
                  t={t}
                />
              )}

              {/* Step 1: Customer Information */}
              {step === 1 && (
                <StepCustomerInfo
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  t={t}
                />
              )}

              {/* Step 2: Address Information */}
              {step === 2 && (
                <StepAddressInfo
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  billingAddress={billingAddress}
                  setBillingAddress={setBillingAddress}
                  sameAsShipping={sameAsShipping}
                  setSameAsShipping={setSameAsShipping}
                  shippingMethod={shippingMethod}
                  setShippingMethod={setShippingMethod}
                  invoiceType={invoiceType}
                  setInvoiceType={setInvoiceType}
                  invoiceInfo={invoiceInfo}
                  setInvoiceInfo={setInvoiceInfo}
                  legalConsents={legalConsents}
                  setLegalConsents={setLegalConsents}
                  savedAddresses={savedAddresses}
                  onOpenAddressModal={(target) => { setAddressPickTarget(target); setShowAddressModal(true) }}
                  onOpenInvoiceModal={async () => {
                    try {
                      const rows = await listInvoiceProfiles()
                      setSavedInvoiceProfiles(rows)
                    } catch { } finally {
                      setShowInvoiceModal(true)
                    }
                  }}
                  t={t}
                  tf={tf}
                />
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <ReviewSummary
                  customer={{ name: customerInfo.name, email: customerInfo.email, phone: customerInfo.phone }}
                  shipping={{ fullAddress: shippingAddress.fullAddress, city: shippingAddress.city, district: shippingAddress.district, postalCode: shippingAddress.postalCode }}
                  billing={{ fullAddress: billingAddress.fullAddress, city: billingAddress.city, district: billingAddress.district, postalCode: billingAddress.postalCode }}
                  sameAsShipping={sameAsShipping}
                  invoiceType={invoiceType}
                  invoiceInfo={invoiceInfo}
                  onEditPersonal={() => setStep(1)}
                  onEditShipping={() => setStep(2)}
                  onEditBilling={() => setStep(2)}
                  onEditInvoice={() => setStep(2)}
                />
              )}

              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-light-gray">
                  <button
                    onClick={handlePrevStep}
                    disabled={step === 1}
                    className="px-6 py-3 border-2 border-light-gray text-steel-gray rounded-lg hover:border-primary-navy hover:text-primary-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('checkout.nav.back')}
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
                  >
                    {step === 3 ? t('checkout.nav.proceedPayment') : t('checkout.nav.next')}
                  </button>
                </div>
              )}

              {step === 4 && !loading && (
                <div className="flex justify-start mt-8 pt-6 border-t border-light-gray">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-light-gray text-steel-gray rounded-lg hover:border-primary-navy hover:text-primary-navy transition-colors"
                  >
                    {t('checkout.nav.backToAddress')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummarySidebar
              items={items}
              totalAmount={totalAmount}
              vatAmount={vatAmount}
              finalAmount={finalAmount}
              couponApplied={couponApplied}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={async () => {
                const code = couponCode.trim();
                if (code.length < 3) { toast.error('Kupon kodu geçersiz'); return }
                try {
                  const base = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL) || ''
                  const resp = await fetch(`${base}/functions/v1/apply-coupon`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, subtotal: totalAmount })
                  });
                  const json = await resp.json().catch(() => ({}));
                  if (!resp.ok || !json?.valid) {
                    toast.error('Kupon uygulanamadı');
                    setCouponApplied(null)
                    return;
                  }
                  setCouponApplied({ code: json.normalized_code || code, discount: Number(json.discount_amount || 0) })
                  toast.success('Kupon uygulandı');
                } catch (e) {
                  console.error(e); toast.error('Kupon doğrulanamadı');
                }
              }}
              onRemoveCoupon={() => { setCouponApplied(null); setCouponCode(''); }}
              t={t}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage



