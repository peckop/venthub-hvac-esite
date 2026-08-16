'use client'

import { useCallback,useEffect, useState } from 'react'
import { toast } from 'sonner'

import { listAddresses } from '@/lib/services/address.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import { isValidTckn, isValidVkn } from '@/lib/validation/taxIdentity'
import type { InvoiceProfile,UserAddress } from '@/types/ui-models'

import { useI18n } from '../i18n/I18nProvider'
import { listInvoiceProfiles } from '../lib/services/invoice.service'
import { 
  CheckoutAddressInfo, 
  CheckoutCustomerInfo, 
  CheckoutInvoiceInfo, 
  CheckoutLegalConsents 
} from '../types/db-rows'
import { useAuth } from './useAuth'

export const useCheckoutOrchestrator = () => {
  const { user } = useAuth()
  const { t } = useI18n()
  const [step, setStep] = useState<number>(1)

  // Form states
  const [customerInfo, setCustomerInfo] = useState<CheckoutCustomerInfo>({
    name: '', firstName: '', lastName: '', email: '', phone: '', identityNumber: ''
  })
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddressInfo>({
    full_name: '', phone: '', full_address: '', fullAddress: '', city: '', district: '', postalCode: '', postal_code: ''
  })
  const [billingAddress, setBillingAddress] = useState<CheckoutAddressInfo>({
    full_name: '', phone: '', full_address: '', fullAddress: '', city: '', district: '', postalCode: '', postal_code: ''
  })

  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual')
  const [invoiceInfo, setInvoiceInfo] = useState<CheckoutInvoiceInfo>({ 
    type: 'individual', 
    tckn: '', 
    companyName: '', 
    taxOffice: '', 
    taxNumber: '' 
  })
  const [legalConsents, setLegalConsents] = useState<CheckoutLegalConsents>({ 
    kvkk: false, 
    sales_agreement: false, 
    privacy_policy: false,
    distanceSales: false, 
    preInfo: false, 
    orderConfirm: false, 
    marketing: false 
  })
  const [sameAsShipping, setSameAsShipping] = useState<boolean>(true)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [showHelp, setShowHelp] = useState<boolean>(false)

  // Address book management
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
  const [addressPickTarget, setAddressPickTarget] = useState<'shipping' | 'billing'>('shipping')

  // Invoice profile book management
  const [savedInvoiceProfiles, setSavedInvoiceProfiles] = useState<InvoiceProfile[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false)

  // Pre-fill customer info
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || ''
      const parts = fullName.split(' ')
      setCustomerInfo({
        name: fullName,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        identityNumber: ''
      })
    }
  }, [user])

  // Load Invoice profiles
  useEffect(() => {
    async function loadInvoiceProfiles() {
      if (!user) return
      try {
        const rows = await listInvoiceProfiles(supabaseBrowserClient)
        setSavedInvoiceProfiles(rows)
        // Find default or first profile to pre-fill
        const defProfile = rows.find(r => r.is_default) || rows[0]
        if (defProfile) {
          const pType = (defProfile.profile_type === 'corporate' ? 'corporate' : 'individual') as 'individual' | 'corporate'
          setInvoiceType(pType)
          setInvoiceInfo({
            type: pType,
            tckn: defProfile.tax_number || '',
            companyName: defProfile.company_name || '',
            taxOffice: defProfile.tax_office || '',
            taxNumber: defProfile.tax_number || ''
          })
        }
      } catch {
        // Safe fail
      }
    }
    loadInvoiceProfiles()
  }, [user])

  const handleSelectInvoiceProfile = useCallback((p: InvoiceProfile) => {
    const pType = (p.profile_type === 'corporate' ? 'corporate' : 'individual') as 'individual' | 'corporate'
    setInvoiceType(pType)
    setInvoiceInfo({
      type: pType,
      tckn: pType === 'individual' ? p.tax_number || '' : '',
      companyName: p.company_name || '',
      taxOffice: p.tax_office || '',
      taxNumber: p.tax_number || ''
    })
    setShowInvoiceModal(false)
    toast.success('Fatura profili başarıyla seçildi.')
  }, [])

  // Load Addresses
  useEffect(() => {
    async function loadAddresses() {
      if (!user) return
      try {
        const rows = await listAddresses(supabaseBrowserClient)
        setSavedAddresses(rows)
        const defShip = rows.find(r => r.is_default_shipping)
        if (defShip) {
          const addr: CheckoutAddressInfo = {
            full_address: defShip.address_line || '',
            city: defShip.city || '',
            district: defShip.district || '',
            postalCode: defShip.postal_code || '',
            full_name: defShip.full_name || '',
            phone: defShip.phone || ''
          }
          setShippingAddress(addr)
          if (sameAsShipping) setBillingAddress(addr)
        }
      } catch {
        // Safe fail
      }
    }
    loadAddresses()
  }, [user, sameAsShipping])

  // Validation functions
  const validateCustomerInfo = useCallback(() => {
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
  }, [customerInfo, t])

  const validateAddress = useCallback((address: CheckoutAddressInfo) => {
    const full = (address.full_address || address.fullAddress || '').trim()
    if (!full) {
      toast.error(t('checkout.errors.addressRequired'))
      return false
    }
    if (!address.city.trim() || !address.district.trim()) {
      toast.error(t('checkout.errors.locationRequired'))
      return false
    }
    return true
  }, [t])

  /**
   * Fatura kimliği doğrulaması — ödeme adımına geçmeden ÖNCE.
   *
   * Bu kontrol 2026-08-16'ya kadar HİÇ yoktu: `validateAddress` yalnız adres/il/ilçe
   * bakıyordu, dolayısıyla kurumsal faturada VKN ve vergi dairesi, bireysel faturada
   * TCKN **boş** bırakılarak ödeme başlatılabiliyordu. Sözlükteki altı hata metni
   * (`tcknRequired`, `vknFormat` …) yazılmış ama kodda tek bir çağıranı yoktu.
   *
   * Neden kapı burada: fatura, siparişin `invoice_info` alanından kesilir. Sipariş
   * yazıldıktan sonra fark edilen eksik kimlik, müşteriye geri dönmeyi ve sevkiyatı
   * bekletmeyi gerektirir. Bkz. `docs/standards/legal-compliance-standard.md` §4.
   *
   * Okunan alanlar, ödeme isteğine gerçekten giden alanlardır (`buildPaymentRequest.ts`
   * `InvoiceInfo`: tckn · companyName · vkn · taxOffice). Tip birden çok takma ad
   * taşıdığı için (`taxNumber`, `tax_number`) onlar da yedek olarak okunuyor —
   * doğrulanan alan ile faturaya giden alan AYNI olmalıdır.
   */
  const validateInvoiceInfo = useCallback(() => {
    if (invoiceType === 'individual') {
      const tckn = (invoiceInfo.tckn || invoiceInfo.t_c_id || '').trim()
      if (!tckn) {
        toast.error(t('checkout.errors.tcknRequired'))
        return false
      }
      if (!isValidTckn(tckn)) {
        toast.error(t('checkout.errors.tcknFormat'))
        return false
      }
      return true
    }

    const companyName = (invoiceInfo.companyName || invoiceInfo.company_name || '').trim()
    if (!companyName) {
      toast.error(t('checkout.errors.companyRequired'))
      return false
    }

    const vkn = (invoiceInfo.vkn || invoiceInfo.taxNumber || invoiceInfo.tax_number || '').trim()
    if (!vkn) {
      toast.error(t('checkout.errors.vknRequired'))
      return false
    }
    if (!isValidVkn(vkn)) {
      toast.error(t('checkout.errors.vknFormat'))
      return false
    }

    const taxOffice = (invoiceInfo.taxOffice || invoiceInfo.tax_office || '').trim()
    if (!taxOffice) {
      toast.error(t('checkout.errors.taxOfficeRequired'))
      return false
    }

    return true
  }, [invoiceType, invoiceInfo, t])

  /**
   * Zorunlu yasal onaylar işaretlenmeden ödeme BAŞLATILAMAZ.
   *
   * Mesafeli Sözleşmeler Yönetmeliği: tüketicinin Ön Bilgilendirme Formunu ve Mesafeli Satış
   * Sözleşmesini sözleşme kurulmadan ÖNCE teyit etmesi zorunludur. Bu kontrol olmadan
   * `buildPaymentRequest` onayları `accepted: false` olarak damgalıyordu — yani sistem
   * tüketicinin kabul ETMEDİĞİNİN kaydını tutup ödemeyi yine de alıyordu.
   * `marketing` bilerek dışarıda: ticari elektronik ileti onayı opsiyoneldir, zorunlu tutulamaz.
   */
  const validateLegalConsents = useCallback(() => {
    const required: Array<keyof CheckoutLegalConsents> = ['kvkk', 'distanceSales', 'preInfo', 'orderConfirm']
    if (required.some((key) => !legalConsents[key])) {
      toast.error(t('checkout.errors.consentsRequired'))
      return false
    }
    return true
  }, [legalConsents, t])

  const handleNextStep = useCallback(async (initiatePayment: () => Promise<boolean | undefined>) => {
    if (step === 1 && validateCustomerInfo()) {
      setStep(2)
    } else if (step === 2 && validateAddress(shippingAddress)) {
      // Fatura alanları da bu adımda (StepAddressInfo) → uyarıyı alanların GÖRÜNDÜĞÜ yerde ver.
      if (!validateInvoiceInfo()) return
      // Onay kutuları bu adımda (StepAddressInfo) → uyarıyı kutuların GÖRÜNDÜĞÜ yerde ver.
      if (!validateLegalConsents()) return
      setStep(3)
    } else if (step === 3) {
      // Savunma katmanı: adım 3'e başka bir yoldan gelinmişse (geri/ileri, doğrudan setStep)
      // ödeme yine de onaysız VE faturasız kimlikle başlamasın.
      if (!validateInvoiceInfo()) return
      if (!validateLegalConsents()) return
      const success = await initiatePayment()
      if (success) {
        setStep(4)
      }
    }
  }, [step, shippingAddress, validateCustomerInfo, validateAddress, validateInvoiceInfo, validateLegalConsents])

  return {
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
    setSavedAddresses,
    showAddressModal,
    setShowAddressModal,
    addressPickTarget,
    setAddressPickTarget,
    savedInvoiceProfiles,
    setSavedInvoiceProfiles,
    showInvoiceModal,
    setShowInvoiceModal,
    handleSelectInvoiceProfile,
    validateCustomerInfo,
    validateAddress,
    handleNextStep
  }
}

export type CheckoutOrchestrator = ReturnType<typeof useCheckoutOrchestrator>
