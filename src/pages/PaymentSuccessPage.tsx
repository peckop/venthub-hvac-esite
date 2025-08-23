import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    // Get payment info from URL parameters
    const conversationId = searchParams.get('conversationId')
    const token = searchParams.get('token')
    const status = searchParams.get('status')
    const errorMessage = searchParams.get('errorMessage')
    
    console.log('Payment success page loaded with params:', {
      conversationId,
      token,
      status,
      errorMessage
    })

    // Simulate payment verification (in real app, you'd verify with your backend)
    setTimeout(() => {
      if (status === 'success' || conversationId || token) {
        setStatus('success')
        setPaymentInfo({
          conversationId: conversationId || 'demo_payment',
          token: token || 'demo_token',
          status: status || 'success'
        })
        
        // Clear cart on successful payment
        clearCart()
        
        // Show success message
        toast.success('🎉 Ödeme başarıyla tamamlandı!')
      } else if (errorMessage) {
        setStatus('error')
        setPaymentInfo({ errorMessage })
        toast.error('Ödeme sırasında hata oluştu: ' + errorMessage)
      } else {
        // No clear success or error, assume success for demo
        setStatus('success')
        setPaymentInfo({
          conversationId: 'demo_payment_' + Date.now(),
          token: 'demo_token',
          status: 'success'
        })
        clearCart()
        toast.success('🎉 Demo ödeme tamamlandı!')
      }
    }, 2000) // 2 second delay to show loading
  }, [searchParams, clearCart])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Loader size={32} className="text-primary-navy animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            Ödeme Doğrulanıyor...
          </h2>
          <p className="text-steel-gray">
            Lütfen bekleyin, ödemeniz kontrol ediliyor.
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
            Ödeme Başarısız
          </h2>
          <p className="text-steel-gray mb-6">
            {paymentInfo?.errorMessage || 'Ödeme sırasında bir hata oluştu.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/checkout"
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              Tekrar Dene
            </Link>
            <Link
              to="/cart"
              className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              Sepete Dön
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
          Siparişiniz Tamamlandı!
        </h2>
        <p className="text-steel-gray mb-6">
          Sipariş No: <strong>{paymentInfo?.conversationId || 'DEMO-ORDER'}</strong>
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

export default PaymentSuccessPage