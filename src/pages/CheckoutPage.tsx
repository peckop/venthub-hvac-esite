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
    setLoading(true)
    try {
      const cartItems = items.map((item, index) => ({
        id: item.product.id || `item_${index}`,
        product_id: item.product.id,
        name: item.product.name,
        title: item.product.name,
        product_name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.product.price),
        category: 'HVAC Equipment' // Default category
      }))

      // Edge function'ın beklediği formata göre request data hazırla
      const requestData = {
        amount: getCartTotal() * 1.2, // Include VAT - edge function bunu bekliyor
        cartItems: cartItems.map(item => ({
          ...item,
          product_name: item.name,
          product_id: item.id
        })),
        customerInfo: {
          firstName: customerInfo.name.split(' ')[0] || 'Test',
          lastName: customerInfo.name.split(' ').slice(1).join(' ') || 'User',
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          identityNumber: customerInfo.identityNumber || '74300864791',
          address: shippingAddress.fullAddress,
          city: shippingAddress.city,
          zipCode: shippingAddress.postalCode,
          shippingAddress: {
            address: shippingAddress.fullAddress,
            city: shippingAddress.city,
            district: shippingAddress.district,
            zipCode: shippingAddress.postalCode
          },
          billingAddress: sameAsShipping ? {
            address: shippingAddress.fullAddress,
            city: shippingAddress.city,
            district: shippingAddress.district,
            zipCode: shippingAddress.postalCode
          } : {
            address: billingAddress.fullAddress,
            city: billingAddress.city,
            district: billingAddress.district,
            zipCode: billingAddress.postalCode
          }
        }
      }

      const { data, error } = await supabase.functions.invoke('iyzico-payment', {
        body: requestData
      })

      if (error) {
        throw error
      }

      if (data && data.data) {
        console.log('Payment response:', data.data);
        
        // Check if this is real Iyzico payment with paymentPageUrl
        if (data.data.paymentPageUrl && !data.data.demo) {
          console.log('Real Iyzico payment - redirecting to payment page:', data.data.paymentPageUrl);
          // Redirect to Iyzico payment page
          window.location.href = data.data.paymentPageUrl;
          return;
        }
        
        // Demo mode or fallback - complete immediately
        if (data.data.demo || data.data.status === 'success') {
          console.log('Demo payment successful, completing order immediately');
          setOrderId(data.data.paymentId || data.data.conversationId || data.data.orderId || 'demo_order');
          setOrderCompleted(true);
          clearCart();
          
          if (data.data.demo) {
            toast.success('🎉 Demo ödeme başarıyla tamamlandı!');
          } else {
            toast.success('✅ Ödeme başarıyla tamamlandı!');
          }
        } else {
          throw new Error('Ödeme başlatma hatası: Geçersiz yanıt');
        }
      } else {
        throw new Error('Ödeme başlatma hatası: Boş yanıt');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error)
      toast.error(error.message || 'Ödeme başlatma sırasında hata oluştu')
      setStep(2) // Go back to address step
    } finally {
      setLoading(false)
    }
  }

  // Handle payment frame messages
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
  const vatAmount = totalAmount * 0.2
  const finalAmount = totalAmount + vatAmount

  return (
    <div className="min-h-screen bg-light-gray">
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
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  step >= stepNum 
                    ? 'bg-primary-navy text-white' 
                    : 'bg-light-gray text-steel-gray border-2 border-light-gray'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`h-1 w-16 mx-2 ${
                    step > stepNum ? 'bg-primary-navy' : 'bg-light-gray'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-primary-navy font-medium' : 'text-steel-gray'}>
              Kişisel Bilgiler
            </span>
            <span className={step >= 2 ? 'text-primary-navy font-medium' : 'text-steel-gray'}>
              Adres Bilgileri
            </span>
            <span className={step >= 3 ? 'text-primary-navy font-medium' : 'text-steel-gray'}>
              Ödeme
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
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

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary-navy text-white p-2 rounded-lg">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-industrial-gray">
                      Ödeme Bilgileri
                    </h2>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
                      <p className="text-steel-gray">Ödeme ekranı hazırlanıyor...</p>
                    </div>
                  ) : paymentFrameContent ? (
                    <div className="bg-light-gray rounded-lg p-4">
                      <div 
                        dangerouslySetInnerHTML={{ __html: paymentFrameContent }}
                        className="min-h-[400px]"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-steel-gray">
                      Ödeme ekranı yüklenemedi. Lütfen tekrar deneyin.
                    </div>
                  )}

                  <div className="bg-air-blue rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-primary-navy">
                      <Lock size={16} />
                      <span className="text-sm font-medium">
                        Güvenli Ödeme
                      </span>
                    </div>
                    <p className="text-sm text-steel-gray mt-1">
                      Ödeme bilgileriniz SSL sertifikası ile korunmaktadır. Kart bilgileriniz hiçbir şekilde saklanmaz.
                    </p>
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
                  <span>KDV (%20)</span>
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