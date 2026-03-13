import { UserAddress } from '../../lib/supabase'

export interface CartItemInput {
  id: string
  quantity: number
  product: { id: string; name: string; price: number; image_url?: string | null }
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
    price: Number(it.product.price || 0),
    product_name: it.product.name,
    product_image_url: it.product.image_url || null,
  }))

  const normalizeAddress = (addr: any) => ({
    fullAddress: addr?.fullAddress || addr?.full_address || '',
    city: addr?.city || '',
    district: addr?.district || '',
    postalCode: addr?.postalCode || addr?.postal_code || '',
  })

  const shippingAddress = normalizeAddress(shipping)
  const billingAddress = sameAsShipping ? shippingAddress : normalizeAddress(billing)

  const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

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
      kvkk: { accepted: !!(legalConsents as any).kvkk, ts: new Date().toISOString() },
      distanceSales: { accepted: !!(legalConsents as any).distanceSales, ts: new Date().toISOString() },
      preInfo: { accepted: !!(legalConsents as any).preInfo, ts: new Date().toISOString() },
      orderConfirm: { accepted: !!(legalConsents as any).orderConfirm, ts: new Date().toISOString() },
      marketing: { accepted: !!(legalConsents as any).marketing, ts: (legalConsents as any).marketing ? new Date().toISOString() : null },
    },
    shippingMethod: shippingMethod || 'standard',
    couponCode: args.couponCode || null,
  }

  return req
}



