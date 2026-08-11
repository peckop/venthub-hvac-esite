import type { UserAddress } from '@/types/ui-models'

import { safeNumber } from '../../utils/type-converters'

export interface CartItemInput {
  id: string
  quantity: number
  product: { id: string; name: string; price: number | null; image_url?: string | null }
}

export interface CustomerInput { 
  name?: string; 
  firstName?: string; 
  lastName?: string; 
  email: string; 
  phone: string 
}

export interface AddressInput { 
  fullAddress?: string; 
  full_address?: string;
  city: string; 
  district: string; 
  postalCode?: string;
  postal_code?: string | null;
}

export type InvoiceType = 'individual' | 'corporate'
export type InvoiceInfo = Partial<{ tckn: string; companyName: string; vkn: string; taxOffice: string; eInvoice?: boolean }>
export interface LegalConsentsInput { kvkk: boolean; distanceSales: boolean; preInfo: boolean; orderConfirm: boolean; marketing?: boolean }

export interface BuildPaymentArgs {
  amount: number
  items: CartItemInput[]
  customer: CustomerInput
  shipping: AddressInput | UserAddress | null
  billing: AddressInput | UserAddress | null
  sameAsShipping: boolean
  userId?: string | null
  invoiceType: InvoiceType
  invoiceInfo: InvoiceInfo
  legalConsents: LegalConsentsInput | Record<string, boolean>
  shippingMethod?: 'standard' | 'express' | string | null
  couponCode?: string | null
}

export function buildPaymentRequest(args: BuildPaymentArgs) {
  const { amount, items, customer, shipping, billing, sameAsShipping, userId, invoiceType, invoiceInfo, legalConsents, shippingMethod } = args

  const cartItems = items.map(it => ({
    product_id: it.product.id,
    quantity: it.quantity,
    price: safeNumber(it.product.price),
    product_name: it.product.name,
    product_image_url: it.product.image_url || null,
  }))

  const normalizeAddress = (addr: AddressInput | UserAddress | null) => {
    if (!addr) return { fullAddress: '', city: '', district: '', postalCode: '' }
    
    // Type Guard style check
    const a = addr as Record<string, unknown>
    return {
      fullAddress: String(a.fullAddress || a.full_address || ''),
      city: String(a.city || ''),
      district: String(a.district || ''),
      postalCode: String(a.postalCode || a.postal_code || ''),
    }
  }

  const shippingAddress = { ...normalizeAddress(shipping), address_type: 'shipping' }
  const billingAddress = sameAsShipping ? { ...shippingAddress, address_type: 'billing' } : { ...normalizeAddress(billing), address_type: 'billing' }

  const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

  const consents = legalConsents as Record<string, boolean | undefined>

  const req = {
    amount,
    cartItems,
    customerInfo: {
      name: customerName,
      email: customer.email,
      phone: customer.phone
    },
    shippingAddress,
    billingAddress,
    user_id: userId || null,
    invoiceType,
    invoiceInfo: { ...invoiceInfo, type: invoiceType },
    legalConsents: {
      kvkk: { accepted: !!consents.kvkk, ts: new Date().toISOString() },
      distanceSales: { accepted: !!consents.distanceSales, ts: new Date().toISOString() },
      preInfo: { accepted: !!consents.preInfo, ts: new Date().toISOString() },
      orderConfirm: { accepted: !!consents.orderConfirm, ts: new Date().toISOString() },
      marketing: { accepted: !!consents.marketing, ts: consents.marketing ? new Date().toISOString() : null },
    },
    shippingMethod: shippingMethod || 'standard',
    couponCode: args.couponCode || null,
  }

  return req
}



