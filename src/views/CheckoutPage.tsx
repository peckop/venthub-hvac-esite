'use client'

import React, { useEffect } from 'react'
import { useCart } from '../hooks/useCartHook'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Routes } from '../utils/routes'
import { InvoiceProfileModal } from './checkout/InvoiceProfileModal'
import { ArrowLeft } from 'lucide-react'
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
import { useCheckoutOrchestrator } from '../hooks/useCheckoutOrchestrator'
import { CheckoutAddressInfo } from '../types/db-rows'

const CheckoutPage: React.FC = () => {
  const { items, getCartTotal, clearCart, applyServerPricing } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()

  // Central Orchestrator
  const orchestrator = useCheckoutOrchestrator()
  const {
    step,
    setStep,
    customerInfo,
    setCustomerInfo,
    shippingAddress,
    setShippingAddress,
    billingAddress,
    setBillingAddress,
    invoiceType,
    setInvoiceType,
    invoiceInfo,
    setInvoiceInfo,
    legalConsents,
    setLegalConsents,
    sameAsShipping,
    setSameAsShipping,
    shippingMethod,
    setShippingMethod,
    showHelp,
    setShowHelp,
    savedAddresses,
    showAddressModal,
    setShowAddressModal,
    addressPickTarget,
    setAddressPickTarget,
    savedInvoiceProfiles,
    showInvoiceModal,
    setShowInvoiceModal,
    handleSelectInvoiceProfile,
    handleNextStep
  } = orchestrator

  // Coupon hook
  const { couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon } = useCheckoutCoupon(getCartTotal())
  
  // Payment hook
  const payment = useCheckoutPayment({
    items,
    getCartTotal,
    user,
    clearCart,
    applyServerPricing,
    orchestrator,
    couponCode: couponApplied?.code || null,
    t
  })

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(Routes.auth.login('/checkout'))
    }
  }, [user, authLoading, router])

  const onNextStep = () => handleNextStep(payment.initiatePayment)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">{t('checkout.emptyCart.title')}</h2>
          <Link href={Routes.home()} className="inline-flex items-center px-6 py-3 bg-primary-navy text-white rounded-lg">
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
            const addr: CheckoutAddressInfo = { 
              full_address: a.address_line || '', 
              city: a.city || '', 
              district: a.district || '', 
              postalCode: a.postal_code || '',
              full_name: a.full_name || '',
              phone: a.phone || ''
            }
            if (addressPickTarget === 'shipping') setShippingAddress(addr)
            else setBillingAddress(addr)
            setShowAddressModal(false)
          }}
          onEdit={() => setShowAddressModal(false)}
          onDelete={() => {}}
          t={t}
        />
      )}

      {showInvoiceModal && (
        <InvoiceProfileModal
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          profiles={savedInvoiceProfiles}
          onSelect={handleSelectInvoiceProfile}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutProgress step={step} t={t} onBackToCart={() => router.push(Routes.cart())} />

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
                    setShowInvoiceModal(true)
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
                    <button onClick={onNextStep} className="px-8 py-3 bg-primary-navy text-white font-semibold rounded-lg">
                      {step === 3 ? t('checkout.nav.proceedPayment') : t('checkout.nav.next')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummarySidebar
              items={items}
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
