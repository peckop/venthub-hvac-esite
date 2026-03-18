'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCartHook'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  listAddresses, 
  UserAddress 
} from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import ReviewSummary from './checkout/ReviewSummary'
import CheckoutProgress from './checkout/CheckoutProgress'
import StepCustomerInfo from './checkout/StepCustomerInfo'
import StepAddressInfo from './checkout/StepAddressInfo'
import OrderSummarySidebar from './checkout/OrderSummarySidebar'
import PaymentIframeContainer from './checkout/PaymentIframeContainer'
import SecurePaymentOverlay from './checkout/SecurePaymentOverlay'
import AddressSelectModal from './checkout/AddressSelectModal'
import { getTranslationWithFallback } from '../utils/checkoutHelpers'
import { useCheckoutCoupon } from '../hooks/useCheckoutCoupon'
import { useCheckoutPayment } from '../hooks/useCheckoutPayment'

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
  const { items, getCartTotal, clearCart, applyServerPricing } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()
  const [step, setStep] = useState(1) // 1: Info, 2: Address, 3: Review, 4: Payment

  // Form states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', email: '', phone: '', identityNumber: ''
  })
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullAddress: '', city: '', district: '', postalCode: ''
  })
  const [billingAddress, setBillingAddress] = useState<Address>({
    fullAddress: '', city: '', district: '', postalCode: ''
  })

  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual')
  const [invoiceInfo, setInvoiceInfo] = useState<any>({ type: 'individual', tckn: '' })
  const [legalConsents, setLegalConsents] = useState<any>({ kvkk: false, distanceSales: false, preInfo: false, orderConfirm: false, marketing: false })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [showHelp, setShowHelp] = useState(false)

  // Hooks
  const { couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon } = useCheckoutCoupon(getCartTotal())
  
  const payment = useCheckoutPayment({
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
    couponCode: couponApplied?.code || null,
    t
  })

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?from=/checkout')
    }
  }, [user, authLoading, router])

  // Pre-fill customer info
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

  // Address book management
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressPickTarget, setAddressPickTarget] = useState<'shipping' | 'billing'>('shipping')


  useEffect(() => {
    async function loadAddresses() {
      if (!user) return
      try {
        const rows = await listAddresses()
        setSavedAddresses(rows)
        const defShip = rows.find(r => r.is_default_shipping)
        if (defShip) {
          const addr = {
            fullAddress: defShip.address_line || '',
            city: defShip.city || '',
            district: defShip.district || '',
            postalCode: defShip.postal_code || ''
          }
          setShippingAddress(addr)
          if (sameAsShipping) setBillingAddress(addr)
        }
      } catch { }
    }
    loadAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sameAsShipping])

  // Validation functions
  const validateCustomerInfo = () => {
    if (!customerInfo.name.trim()) return !!toast.error(t('checkout.errors.nameRequired'))
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) return !!toast.error(t('checkout.errors.emailInvalid'))
    if (!customerInfo.phone.trim()) return !!toast.error(t('checkout.errors.phoneRequired'))
    return true
  }

  const validateAddress = (address: Address) => {
    if (!address.fullAddress.trim()) return !!toast.error(t('checkout.errors.addressRequired'))
    if (!address.city.trim() || !address.district.trim()) return !!toast.error(t('checkout.errors.locationRequired'))
    return true
  }

  const handleNextStep = async () => {
    if (step === 1 && validateCustomerInfo()) setStep(2)
    else if (step === 2 && validateAddress(shippingAddress)) setStep(3)
    else if (step === 3) {
      const success = await payment.initiatePayment()
      if (success) setStep(4)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">{t('checkout.emptyCart.title')}</h2>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-primary-navy text-white rounded-lg">
            <ArrowLeft size={20} className="mr-2" /> {t('checkout.emptyCart.startShopping')}
          </Link>
        </div>
      </div>
    )
  }

  const totalAmount = getCartTotal()
  const vatAmount = Number((totalAmount - totalAmount / 1.2).toFixed(2))
  const finalAmount = Number((totalAmount - (couponApplied?.discount || 0)).toFixed(2))

  return (
    <div className="min-h-screen bg-light-gray">
      <SecurePaymentOverlay
        overlayVisible={step === 4 && !payment.formReady}
        overlayStep={payment.loading ? 1 : 2}
        overlayPercent={payment.progressPct}
        t={t}
      />

      {showAddressModal && (
        <AddressSelectModal
          title={t('checkout.saved.select')}
          addresses={savedAddresses}
          onClose={() => setShowAddressModal(false)}
          onPick={(a) => {
            const addr = { fullAddress: a.address_line || '', city: a.city || '', district: a.district || '', postalCode: a.postal_code || '' }
            if (addressPickTarget === 'shipping') setShippingAddress(addr)
            else setBillingAddress(addr)
            setShowAddressModal(false)
          }}
          onEdit={() => setShowAddressModal(false)}
          onDelete={() => {}}
          t={t}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutProgress step={step} t={t} onBackToCart={() => router.push('/cart')} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
              {step === 1 && <StepCustomerInfo customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} t={t} />}
              
              {step === 2 && (
                <StepAddressInfo
                  shippingAddress={shippingAddress} setShippingAddress={setShippingAddress}
                  billingAddress={billingAddress} setBillingAddress={setBillingAddress}
                  sameAsShipping={sameAsShipping} setSameAsShipping={setSameAsShipping}
                  shippingMethod={shippingMethod} setShippingMethod={setShippingMethod}
                  invoiceType={invoiceType} setInvoiceType={setInvoiceType}
                  invoiceInfo={invoiceInfo} setInvoiceInfo={setInvoiceInfo}
                  legalConsents={legalConsents} setLegalConsents={setLegalConsents}
                  savedAddresses={savedAddresses}
                  onOpenAddressModal={(target) => { setAddressPickTarget(target); setShowAddressModal(true) }}
                  onOpenInvoiceModal={async () => {
                    // Logic for opening invoice modal (redirect or generic modal)
                  }}
                  t={t} tf={(key, fallback) => getTranslationWithFallback(t, key, fallback)}
                />
              )}

              {step === 3 && (
                <ReviewSummary
                  customer={customerInfo} shipping={shippingAddress} billing={billingAddress}
                  sameAsShipping={sameAsShipping} invoiceType={invoiceType} invoiceInfo={invoiceInfo}
                  onEditPersonal={() => setStep(1)} 
                  onEditShipping={() => setStep(2)}
                  onEditBilling={() => setStep(2)}
                  onEditInvoice={() => setStep(2)}
                />
              )}

              {step === 4 && (
                <PaymentIframeContainer
                  iyzToken={payment.iyzToken}
                  paymentFrameContent={payment.paymentFrameContent}
                  showHelp={showHelp}
                  setShowHelp={setShowHelp}
                  progressPct={payment.progressPct}
                  overlayStep={payment.loading ? 1 : 2}
                  t={t}
                />
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-light-gray">
                {step < 4 && (
                  <>
                    <button onClick={() => setStep(step - 1)} disabled={step === 1} className="px-6 py-3 border-2 border-light-gray rounded-lg disabled:opacity-50">
                      {t('checkout.nav.back')}
                    </button>
                    <button onClick={handleNextStep} className="px-8 py-3 bg-primary-navy text-white font-semibold rounded-lg">
                      {step === 3 ? t('checkout.nav.proceedPayment') : t('checkout.nav.next')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummarySidebar
              items={items as any}
              totalAmount={totalAmount} vatAmount={vatAmount} finalAmount={finalAmount}
              couponApplied={couponApplied} couponCode={couponCode} setCouponCode={setCouponCode}
              onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon}
              t={t} lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
