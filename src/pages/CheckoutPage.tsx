import React, { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCartHook'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CreditCard, MapPin, User, Lock, CheckCircle } from 'lucide-react'
import SecurityRibbon from '../components/SecurityRibbon'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'

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
  const { items, getCartTotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Info, 2: Address, 3: Payment
  const { t } = useI18n()

  // Auth check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login', {
        state: { from: { pathname: '/checkout' } }
      })
      return
    }
  }, [user, authLoading, navigate])

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
        setStep(3)
        initiatePayment()
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const initiatePayment = async () => {
    console.log('=== İNITATE PAYMENT STARTED ===');
    console.log('Cart items:', items);
    console.log('Cart total:', getCartTotal());
    console.log('Customer info:', customerInfo);
    console.log('Shipping address:', shippingAddress);
    
    setLoading(true)
    try {
      // Edge function'ın beklediği format
      const requestData = {
        amount: getCartTotal(), // KDV zaten ürün fiyatlarına dahil (brüt) kabul edilir
        cartItems: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
          product_name: item.product.name,
          product_image_url: item.product.image_url || null
        })),
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        shippingAddress: {
          fullAddress: shippingAddress.fullAddress,
          city: shippingAddress.city,
          district: shippingAddress.district,
          postalCode: shippingAddress.postalCode
        },
        billingAddress: sameAsShipping ? {
          fullAddress: shippingAddress.fullAddress,
          city: shippingAddress.city,
          district: shippingAddress.district,
          postalCode: shippingAddress.postalCode
        } : {
          fullAddress: billingAddress.fullAddress,
          city: billingAddress.city,
          district: billingAddress.district,
          postalCode: billingAddress.postalCode
        },
        user_id: user?.id || null,
        // Yeni alanlar: fatura tipi/bilgileri ve yasal onaylar
        invoiceType: invoiceType,
        invoiceInfo: { ...invoiceInfo, type: invoiceType },
        legalConsents: {
          kvkk: { accepted: !!legalConsents.kvkk, ts: new Date().toISOString() },
          distanceSales: { accepted: !!legalConsents.distanceSales, ts: new Date().toISOString() },
          preInfo: { accepted: !!legalConsents.preInfo, ts: new Date().toISOString() },
          orderConfirm: { accepted: !!legalConsents.orderConfirm, ts: new Date().toISOString() },
          marketing: { accepted: !!legalConsents.marketing, ts: legalConsents.marketing ? new Date().toISOString() : null }
        }
      }

      const { data, error } = await supabase.functions.invoke('iyzico-payment', {
        body: requestData
      })

      if (error) {
        console.error('İyzico payment error:', error);
        throw error;
      }

      if (data && data.data) {
        console.log('İyzico payment response:', data.data);
        
        // En güvenilir yol: token ile gömme (React, innerHTML içindeki <script> etiketlerini çalıştırmaz)
        if (data.data.token) {
          setIyzToken(data.data.token || '')
          setPaymentUrl(data.data.paymentPageUrl || '')
          setOrderId(data.data.orderId || '')
          setConvId(data.data.conversationId || '')
          try {
            localStorage.setItem('vh_pending_order', JSON.stringify({ orderId: data.data.orderId, conversationId: data.data.conversationId }))
            localStorage.setItem('vh_last_order_id', String(data.data.orderId || ''))
          } catch {}
          setStep(3)
          return
        }

        // İkinci tercih: checkoutFormContent (script yürütme garantisi olmayabilir)
        if (data.data.checkoutFormContent) {
          setPaymentFrameContent(data.data.checkoutFormContent)
          setOrderId(data.data.orderId || '')
          setConvId(data.data.conversationId || '')
          setStep(3)
          return
        }

        // Fallback: ödeme sayfasına yönlendirme (aynı sekme)
        if (data.data.paymentPageUrl) {
          console.log('Redirecting to İyzico payment page:', data.data.paymentPageUrl);
          try {
            localStorage.setItem('vh_pending_order', JSON.stringify({ orderId: data.data.orderId, conversationId: data.data.conversationId }))
            localStorage.setItem('vh_last_order_id', String(data.data.orderId || ''))
          } catch {}
          window.location.href = data.data.paymentPageUrl;
          return;
        }
        
        // Hemen tamamlanan ödeme (demo)
        if (data.data.status === 'success') {
          console.log('Payment completed immediately');
          setOrderId(data.data.orderId || data.data.conversationId || 'completed_order');
          setOrderCompleted(true);
          clearCart();
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
      setStep(2) // Go back to address step
    } finally {
      setLoading(false)
    }
  }

  // Handle payment frame messages (bazı entegrasyonlar postMessage kullanabilir)
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.event === 'payment_success') {
        setOrderCompleted(true)
        clearCart()
        toast.success(t('checkout.paymentSuccess'))
      } else if (event.data.event === 'payment_error') {
        toast.error(event.data.error || t('checkout.paymentError'))
        setStep(2)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [clearCart])

  // İyzico token ile script'i yükle ve formu çalıştır. 8 sn içinde iframe gelmezse paymentPageUrl'e yönlendir.
  useEffect(() => {
    if (!iyzToken) return

    // Step 3 başlangıcında formReady/progress resetle
    setFormReady(false)
    setProgressPct(20)

    // Eski script ve iframe'i temizle
    try {
      const oldScript = document.querySelector('script[data-iyz-checkout="1"]') as HTMLScriptElement | null
      if (oldScript && oldScript.parentElement) oldScript.parentElement.removeChild(oldScript)
      const mount = document.getElementById('iyzipay-checkout-form')
      if (mount) mount.innerHTML = ''
    } catch {}

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
        } catch {}
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
        } catch {}
        return
      }
      // Yoksa değişiklikleri izle
      const obs = new MutationObserver((_mut) => {
        const ifr = mount.querySelector('iframe') as HTMLIFrameElement | null
        if (ifr) {
          try { ifr.addEventListener('load', () => setFormReady(true), { once: true } as AddEventListenerOptions) } catch {}
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
  }, [iyzToken, paymentUrl, orderId, convId])

  // Ödeme başlatıldıktan sonra sipariş durumunu periyodik kontrol et
  useEffect(() => {
    let timer: number | undefined
    if (step === 3 && orderId) {
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
              navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}&conversationId=${encodeURIComponent(convId || '')}&status=success`)
            } else if (data.status === 'failed') {
              clearInterval(timer)
              navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}&conversationId=${encodeURIComponent(convId || '')}&status=failure`)
            }
          }
        } catch {}
      }, 3000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [step, orderId, convId, clearCart, navigate])

  // Görsel ilerleme (yumuşak dolma) — formReady olana kadar %95'e kadar artar
  useEffect(() => {
    if (step !== 3 || formReady) return
    const t = window.setInterval(() => {
      setProgressPct((p) => {
        const next = p + 2
        return next >= 95 ? 95 : next
      })
    }, 250)
    return () => window.clearInterval(t)
  }, [step, formReady])

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
            to="/"
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
              to="/"
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              to="/orders"
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
  // KDV dahil fiyat varsayımı: brüt = net * 1.20 => KDV payı = brüt - (brüt / 1.20)
  const vatAmount = Number((totalAmount - totalAmount / 1.2).toFixed(2))
  const finalAmount = totalAmount // Toplam zaten KDV dahil

  // Overlay görünürlüğü ve adımları (1: başlatılıyor, 2: form yükleniyor, 3: banka 3D)
  const overlayVisible = step === 3 && !formReady
  const overlayStep = loading ? 1 : (step === 3 && iyzToken && !formReady ? (iyzScriptLoaded ? 3 : 2) : 3)
  const overlayPercent = overlayStep === 1 ? 33 : overlayStep === 2 ? 66 : (formReady ? 100 : 90)

  return (
    <div className="min-h-screen bg-light-gray">
      {overlayVisible && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('checkout.overlay.dialogLabel')}
            className="bg-white/90 backdrop-saturate-150 border border-white/60 shadow-2xl rounded-2xl p-0 w-[92%] max-w-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 md:px-8 py-5 border-b border-light-gray/60 bg-white/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary-navy/10 flex items-center justify-center">
                  <Lock className="text-primary-navy" size={18} />
                </div>
                <div>
                  <div className="text-industrial-gray font-semibold">{t('checkout.overlay.header')}</div>
                  <div className="text-xs text-steel-gray" aria-live="polite">
                    {overlayStep === 1 ? t('checkout.overlay.starting') : overlayStep === 2 ? t('checkout.overlay.secureForm') : t('checkout.overlay.bank3d')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary-navy">Venthub HVAC</div>
                <div className="text-[11px] text-steel-gray">iyzico ile güvenli ödeme</div>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 md:px-8 py-6 bg-white/85">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary-navy border-t-transparent animate-spin" aria-hidden />
              </div>
              <div className="mt-4 grid grid-cols-3 text-xs text-industrial-gray">
                <div className={`text-center ${overlayStep >= 1 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageInit')}</div>
                <div className={`text-center ${overlayStep >= 2 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageForm')}</div>
                <div className={`text-center ${overlayStep >= 3 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageBank')}</div>
              </div>
              <div className="mt-3 w-full h-2 bg-light-gray/70 rounded-full overflow-hidden" aria-hidden>
                <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-500" style={{ width: `${overlayPercent}%` }} />
              </div>
              <div className="mt-3 text-[11px] text-steel-gray">
                {t('checkout.overlay.dontClose')}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('checkout.backToCart')}</span>
          </button>
          <h1 className="text-3xl font-bold text-industrial-gray">
            {t('checkout.title')}
          </h1>
        </div>

        <div className="mb-4">
          <SecurityRibbon />
        </div>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {[1,2,3].map((n, idx) => (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center min-w-[110px]">
                  <div className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center ${step >= n ? 'bg-primary-navy text-white' : 'bg-light-gray text-steel-gray border-2 border-light-gray'}`}>{n}</div>
                  <span className={`mt-1 text-sm ${step >= n ? 'text-primary-navy font-medium' : 'text-steel-gray'}`}>
                    {n===1 ? t('checkout.steps.step1') : n===2 ? t('checkout.steps.step2') : t('checkout.steps.step3')}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 ${step > n ? 'bg-primary-navy' : 'bg-light-gray'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
              {/* Step 3: Payment - İyzico Checkout Form gömme */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-primary-navy text-white p-2 rounded-lg">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-industrial-gray">{t('checkout.paymentSectionTitle')}</h2>
                  </div>
                  {/* Güvenli ödeme üst barı (her zaman görünür) */}
                  <div className="rounded-lg border border-primary-navy/30 bg-white/90 p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-navy">
                        <Lock size={18} />
                        <div className="text-sm font-semibold">{t('checkout.securePaymentBrand', { brand: 'Venthub HVAC' })}</div>
                      </div>
                      <div className="text-[11px] text-steel-gray">{t('checkout.securePaymentProvider', { provider: 'iyzico' })}</div>
                    </div>
                    {/* İlerleme barı */}
                    <div className="w-full h-2 bg-light-gray/80 rounded-full overflow-hidden" aria-hidden>
                      <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="text-[11px] text-steel-gray">{overlayStep === 1 ? t('checkout.overlay.starting') : overlayStep === 2 ? t('checkout.overlay.secureForm') : t('checkout.overlay.bank3d')}</div>
                  </div>
                  <p className="text-steel-gray text-sm">{t('checkout.paymentLoading')}</p>
                  <div className="mt-4">
                    {iyzToken ? (
                      <div className="rounded-xl border border-light-gray shadow-lg ring-1 ring-black/5 bg-white p-4 min-h-[520px]">
                        <div id="iyzipay-checkout-form" className="responsive" data-pay-with-iyzico="true" data-token={iyzToken} />
                      </div>
                    ) : paymentFrameContent ? (
                      <div className="rounded-xl border border-light-gray shadow-lg ring-1 ring-black/5 bg-white p-4 min-h-[520px]" dangerouslySetInnerHTML={{ __html: paymentFrameContent }} />
                    ) : (
                      <div className="flex items-center gap-3 text-steel-gray">
                        <CheckCircle className="animate-pulse" />
                        <span>{t('checkout.formPreparing')}</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => setShowHelp(v => !v)}
                        type="button"
                        className="text-sm text-primary-navy hover:text-secondary-blue"
                      >
                        {t('checkout.help.smsTitle')}
                      </button>
                      {showHelp && (
                        <div className="mt-2 text-xs text-steel-gray space-y-1 bg-air-blue/20 rounded-lg p-3">
                          <p>• {t('checkout.help.tip1')}</p>
                          <p>• {t('checkout.help.tip2')}</p>
                          <p>• {t('checkout.help.tip3')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Customer Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary-navy text-white p-2 rounded-lg">
                      <User size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-industrial-gray">
                      {t('checkout.personal.title')}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.nameLabel')}
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder={t('checkout.personal.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.emailLabel')}
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder={t('checkout.personal.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder={t('checkout.personal.phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.idLabel')}
                      </label>
                      <input
                        type="text"
                        value={customerInfo.identityNumber}
                        onChange={(e) => setCustomerInfo({...customerInfo, identityNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder={t('checkout.personal.idPlaceholder')}
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address Information */}
              {step === 2 && (
                <div className="space-y-8">
                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-primary-navy text-white p-2 rounded-lg">
                        <MapPin size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-industrial-gray">
                        {t('checkout.shipping.title')}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          {t('checkout.shipping.addressLabel')}
                        </label>
                        <textarea
                          value={shippingAddress.fullAddress}
                          onChange={(e) => setShippingAddress({...shippingAddress, fullAddress: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          rows={3}
                          placeholder={t('checkout.shipping.addressPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          {t('checkout.shipping.cityLabel')}
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder={t('checkout.shipping.cityPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          {t('checkout.shipping.districtLabel')}
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder={t('checkout.shipping.districtPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          {t('checkout.shipping.postalLabel')}
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder={t('checkout.shipping.postalPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-industrial-gray">
                        {t('checkout.billing.title')}
                      </h3>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.billing.sameAsShipping')}
                        </span>
                      </label>
                    </div>

                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.billing.addressLabel')}
                          </label>
                          <textarea
                            value={billingAddress.fullAddress}
                            onChange={(e) => setBillingAddress({...billingAddress, fullAddress: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            rows={3}
                            placeholder={t('checkout.billing.addressPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.billing.cityLabel')}
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.billing.cityPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.billing.districtLabel')}
                          </label>
                          <input
                            type="text"
                            value={billingAddress.district}
                            onChange={(e) => setBillingAddress({...billingAddress, district: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.billing.districtPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.billing.postalLabel')}
                          </label>
                          <input
                            type="text"
                            value={billingAddress.postalCode}
                            onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.billing.postalPlaceholder')}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice Type & Info */}
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold text-industrial-gray mb-4">{t('checkout.invoice.title')}</h3>
                    {/* Tip seçimi */}
                    <div className="flex items-center gap-6 mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="invoiceType"
                          value="individual"
                          checked={invoiceType === 'individual'}
                          onChange={() => { setInvoiceType('individual'); setInvoiceInfo({ type: 'individual', tckn: '' }) }}
                          className="text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-industrial-gray">{t('checkout.invoice.individual')}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="invoiceType"
                          value="corporate"
                          checked={invoiceType === 'corporate'}
                          onChange={() => { setInvoiceType('corporate'); setInvoiceInfo({ type: 'corporate', companyName: '', vkn: '', taxOffice: '' }) }}
                          className="text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-industrial-gray">{t('checkout.invoice.corporate')}</span>
                      </label>
                    </div>

                    {/* Koşullu alanlar */}
                    {invoiceType === 'individual' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.tcknLabel')}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={invoiceInfo.tckn || ''}
                            onChange={(e) => setInvoiceInfo({ ...invoiceInfo, tckn: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.invoice.tcknPlaceholder')}
                            maxLength={11}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.companyLabel')}</label>
                          <input
                            type="text"
                            value={invoiceInfo.companyName || ''}
                            onChange={(e) => setInvoiceInfo({ ...invoiceInfo, companyName: e.target.value })}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.invoice.companyPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.vknLabel')}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={invoiceInfo.vkn || ''}
                            onChange={(e) => setInvoiceInfo({ ...invoiceInfo, vkn: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.invoice.vknPlaceholder')}
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.taxOfficeLabel')}</label>
                          <input
                            type="text"
                            value={invoiceInfo.taxOffice || ''}
                            onChange={(e) => setInvoiceInfo({ ...invoiceInfo, taxOffice: e.target.value })}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder={t('checkout.invoice.taxOfficePlaceholder')}
                          />
                        </div>
                        <div className="flex items-center mt-2">
                          <input
                            id="einvoice"
                            type="checkbox"
                            checked={!!invoiceInfo.eInvoice}
                            onChange={(e) => setInvoiceInfo({ ...invoiceInfo, eInvoice: e.target.checked })}
                            className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                          />
                          <label htmlFor="einvoice" className="ml-2 text-sm text-steel-gray">{t('checkout.invoice.eInvoice')}</label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Legal Consents */}
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold text-industrial-gray mb-3">{t('checkout.consents.title')}</h3>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={legalConsents.kvkk}
                          onChange={(e) => setLegalConsents({ ...legalConsents, kvkk: e.target.checked })}
                          className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.consents.readAcceptPrefix')} <Link to="/legal/kvkk" className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.kvkk')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={legalConsents.distanceSales}
                          onChange={(e) => setLegalConsents({ ...legalConsents, distanceSales: e.target.checked })}
                          className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.consents.readAcceptPrefix')} <Link to="/legal/mesafeli-satis-sozlesmesi" className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.distanceSales')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={legalConsents.preInfo}
                          onChange={(e) => setLegalConsents({ ...legalConsents, preInfo: e.target.checked })}
                          className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.consents.readAcceptPrefix')} <Link to="/legal/on-bilgilendirme-formu" className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.preInformation')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={legalConsents.orderConfirm}
                          onChange={(e) => setLegalConsents({ ...legalConsents, orderConfirm: e.target.checked })}
                          className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.consents.orderConfirmText')}
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!legalConsents.marketing}
                          onChange={(e) => setLegalConsents({ ...legalConsents, marketing: e.target.checked })}
                          className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          {t('checkout.consents.marketingText')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 3 && (
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
                    {step === 2 ? t('checkout.nav.proceedPayment') : t('checkout.nav.next')}
                  </button>
                </div>
              )}

              {step === 3 && !loading && (
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
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-industrial-gray mb-4">
                {t('checkout.summaryTitle')}
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-xs text-steel-gray">{t('checkout.summaryThumb')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-industrial-gray text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-steel-gray">
                        {item.quantity} {t('orders.qtyCol')} x ₺{parseFloat(item.product.price).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-industrial-gray">
                      ₺{(parseFloat(item.product.price) * item.quantity).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-steel-gray">
                  <span>{t('cart.subtotal')}</span>
                  <span>₺{totalAmount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                  <span>{t('cart.vatIncluded')}</span>
                  <span>₺{vatAmount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-success-green">{t('cart.free')}</span>
                </div>
                <hr className="border-light-gray" />
                <div className="flex justify-between text-lg font-semibold text-industrial-gray">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary-navy">
                    ₺{finalAmount.toLocaleString('tr-TR')}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage