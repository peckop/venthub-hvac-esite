'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useI18n } from '../i18n/I18nProvider'
import { 
  listAddresses, 
  UserAddress, 
  InvoiceProfile 
} from '../lib/supabase'
import { listInvoiceProfiles } from '../lib/services/invoice.service'
import { 
  CheckoutCustomerInfo, 
  CheckoutAddressInfo, 
  CheckoutInvoiceInfo, 
  CheckoutLegalConsents 
} from '../types/db-rows'
import { toast } from 'sonner'

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
        const rows = await listInvoiceProfiles()
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
        const rows = await listAddresses()
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

  const handleNextStep = useCallback(async (initiatePayment: () => Promise<boolean | undefined>) => {
    if (step === 1 && validateCustomerInfo()) {
      setStep(2)
    } else if (step === 2 && validateAddress(shippingAddress)) {
      setStep(3)
    } else if (step === 3) {
      const success = await initiatePayment()
      if (success) {
        setStep(4)
      }
    }
  }, [step, shippingAddress, validateCustomerInfo, validateAddress])

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
