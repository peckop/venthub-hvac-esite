import React, { useState, useRef, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const paymentFrameRef = useRef<HTMLIFrameElement>(null)

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
      toast.error('Ad Soyad alanı zorunludur')
      return false
    }
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      toast.error('Geçerli bir e-posta adresi giriniz')
      return false
    }
    if (!customerInfo.phone.trim()) {
      toast.error('Telefon numarası zorunludur')
      return false
    }
    return true
  }

  const validateAddress = (address: Address) => {
    if (!address.fullAddress.trim()) {
      toast.error('Adres alanı zorunludur')
      return false
    }
    if (!address.city.trim()) {
      toast.error('Şehir alanı zorunludur')
      return false
    }
    if (!address.district.trim()) {
      toast.error('İlçe alanı zorunludur')
      return false
    }
    if (!address.postalCode.trim()) {
      toast.error('Posta kodu zorunludur')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (validateCustomerInfo()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateAddress(shippingAddress) && (sameAsShipping || validateAddress(billingAddress))) {
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
          product_image_url: item.product.imageUrl || null
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
        user_id: user?.id || null
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
          toast.success('✅ Ödeme başarıyla tamamlandı!');
        } else {
          throw new Error('Ödeme başlatma hatası: Geçersiz yanıt');
        }
      } else {
        throw new Error('Ödeme başlatma hatası: Boş yanıt');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error)
      console.error('Full error details:', {
        message: error.message,
        details: error.details,
        code: error.code,
        stack: error.stack
      })
      
      // More detailed error message
      let errorMessage = 'Ödeme başlatma sırasında hata oluştu'
      if (error.message && error.message.includes('VALIDATION_ERROR')) {
        errorMessage = 'Form bilgilerinde eksiklik var. Lütfen kontrol edin.'
      } else if (error.message && error.message.includes('DATABASE_ERROR')) {
        errorMessage = 'Veritabanı hatası. Lütfen tekrar deneyin.'
      } else if (error.message) {
        errorMessage = error.message
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
        toast.success('Ödeme başarıyla tamamlandı!')
      } else if (event.data.event === 'payment_error') {
        toast.error(event.data.error || 'Ödeme sırasında hata oluştu')
        setStep(2)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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
          iframe.addEventListener('load', () => setFormReady(true), { once: true } as any)
        } catch {}
        return
      }
      // Yoksa değişiklikleri izle
      const obs = new MutationObserver((mut) => {
        const ifr = mount.querySelector('iframe') as HTMLIFrameElement | null
        if (ifr) {
          try { ifr.addEventListener('load', () => setFormReady(true), { once: true } as any) } catch {}
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
  }, [iyzToken, paymentUrl])

  // Ödeme başlatıldıktan sonra sipariş durumunu periyodik kontrol et
  useEffect(() => {
    let timer: any
    if (step === 3 && orderId) {
      timer = setInterval(async () => {
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
            Sepetiniz Boş
          </h2>
          <p className="text-steel-gray mb-6">
            Ödeme sayfasına erişmek için sepetinizde ürün bulunması gerekir.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Alışverişe Başla
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
            aria-label="Güvenli ödeme başlatılıyor"
            className="bg-white/90 backdrop-saturate-150 border border-white/60 shadow-2xl rounded-2xl p-0 w-[92%] max-w-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 md:px-8 py-5 border-b border-light-gray/60 bg-white/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary-navy/10 flex items-center justify-center">
                  <Lock className="text-primary-navy" size={18} />
                </div>
                <div>
                  <div className="text-industrial-gray font-semibold">Güvenli ödeme başlatılıyor…</div>
                  <div className="text-xs text-steel-gray" aria-live="polite">
                    {overlayStep === 1 ? 'Ödeme başlatılıyor' : overlayStep === 2 ? 'Güvenli form yükleniyor' : 'Banka 3D doğrulaması'}
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
                <div className={`text-center ${overlayStep >= 1 ? 'font-medium text-primary-navy' : ''}`}>Başlatılıyor</div>
                <div className={`text-center ${overlayStep >= 2 ? 'font-medium text-primary-navy' : ''}`}>Güvenli form</div>
                <div className={`text-center ${overlayStep >= 3 ? 'font-medium text-primary-navy' : ''}`}>Banka 3D</div>
              </div>
              <div className="mt-3 w-full h-2 bg-light-gray/70 rounded-full overflow-hidden" aria-hidden>
                <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-500" style={{ width: `${overlayPercent}%` }} />
              </div>
              <div className="mt-3 text-[11px] text-steel-gray">
                Bu işlem sırasında sayfayı kapatmayın veya geri tuşuna basmayın. İşlem birkaç saniye sürebilir.
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
            <span>Sepete Dön</span>
          </button>
          <h1 className="text-3xl font-bold text-industrial-gray">
            Ödeme
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {[1,2,3].map((n, idx) => (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center min-w-[110px]">
                  <div className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center ${step >= n ? 'bg-primary-navy text-white' : 'bg-light-gray text-steel-gray border-2 border-light-gray'}`}>{n}</div>
                  <span className={`mt-1 text-sm ${step >= n ? 'text-primary-navy font-medium' : 'text-steel-gray'}`}>
                    {n===1 ? 'Kişisel Bilgiler' : n===2 ? 'Adres Bilgileri' : 'Ödeme'}
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
                    <h2 className="text-xl font-semibold text-industrial-gray">Ödeme İşlemi</h2>
                  </div>
                  {/* Güvenli ödeme üst barı (her zaman görünür) */}
                  <div className="rounded-lg border border-primary-navy/30 bg-white/90 p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-navy">
                        <Lock size={18} />
                        <div className="text-sm font-semibold">Güvenli ödeme • Venthub HVAC</div>
                      </div>
                      <div className="text-[11px] text-steel-gray">iyzico ile güvenli ödeme</div>
                    </div>
                    {/* İlerleme barı */}
                    <div className="w-full h-2 bg-light-gray/80 rounded-full overflow-hidden" aria-hidden>
                      <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="text-[11px] text-steel-gray">{overlayStep === 1 ? 'Ödeme başlatılıyor' : overlayStep === 2 ? 'Güvenli form yükleniyor' : 'Banka 3D doğrulaması'}</div>
                  </div>
                  <p className="text-steel-gray text-sm">Ödeme formu yükleniyor. Lütfen 3D doğrulamayı tamamlayın. İşlem bittiğinde bu sayfa otomatik olarak güncellenecektir.</p>
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
                        <span>Form hazırlanıyor...</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => setShowHelp(v => !v)}
                        type="button"
                        className="text-sm text-primary-navy hover:text-secondary-blue"
                      >
                        Kod gelmedi mi?
                      </button>
                      {showHelp && (
                        <div className="mt-2 text-xs text-steel-gray space-y-1 bg-air-blue/20 rounded-lg p-3">
                          <p>• 30–60 sn bekleyip tekrar deneyin (bankanız gecikmeli SMS gönderebilir).</p>
                          <p>• Telefonunuzda uçak modu/sinyal sorunları yoksa farklı karta/cihaza deneyebilirsiniz.</p>
                          <p>• Numara doğruluğunu kontrol edin ve bankanızla iletişime geçin.</p>
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
                      Kişisel Bilgileriniz
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        E-posta Adresi *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder="+90 (5xx) xxx xx xx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        T.C. Kimlik No (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={customerInfo.identityNumber}
                        onChange={(e) => setCustomerInfo({...customerInfo, identityNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                        placeholder="12345678901"
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
                        Teslimat Adresi
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          Adres *
                        </label>
                        <textarea
                          value={shippingAddress.fullAddress}
                          onChange={(e) => setShippingAddress({...shippingAddress, fullAddress: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          rows={3}
                          placeholder="Mahalle, sokak, apartman/site adı, kapı no, daire no"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          Şehir *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder="İstanbul"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          İlçe *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder="Pendik"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                          Posta Kodu *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                          className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                          placeholder="34890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-industrial-gray">
                        Fatura Adresi
                      </h3>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                          Teslimat adresi ile aynı
                        </span>
                      </label>
                    </div>

                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            Fatura Adresi *
                          </label>
                          <textarea
                            value={billingAddress.fullAddress}
                            onChange={(e) => setBillingAddress({...billingAddress, fullAddress: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            rows={3}
                            placeholder="Fatura adresi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            Şehir *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder="Şehir"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            İlçe *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.district}
                            onChange={(e) => setBillingAddress({...billingAddress, district: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder="İlçe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-industrial-gray mb-2">
                            Posta Kodu *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.postalCode}
                            onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                            className="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            placeholder="Posta kodu"
                          />
                        </div>
                      </div>
                    )}
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
                    Geri
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
                  >
                    {step === 2 ? 'Ödemeye Geç' : 'Devam Et'}
                  </button>
                </div>
              )}

              {step === 3 && !loading && (
                <div className="flex justify-start mt-8 pt-6 border-t border-light-gray">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-light-gray text-steel-gray rounded-lg hover:border-primary-navy hover:text-primary-navy transition-colors"
                  >
                    Adres Bilgilerine Dön
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-industrial-gray mb-4">
                Sipariş Özeti
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-xs text-steel-gray">Ürün</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-industrial-gray text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-steel-gray">
                        {item.quantity} adet x ₺{parseFloat(item.product.price).toLocaleString('tr-TR')}
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
                  <span>Ara Toplam</span>
                  <span>₺{totalAmount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                  <span>KDV (%20, dahil)</span>
                  <span>₺{vatAmount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-steel-gray">
                  <span>Kargo</span>
                  <span className="text-success-green">Bedava</span>
                </div>
                <hr className="border-light-gray" />
                <div className="flex justify-between text-lg font-semibold text-industrial-gray">
                  <span>Toplam</span>
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
                  Ödeme bilgileriniz güvenli bir şekilde şifrelenmektedir
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