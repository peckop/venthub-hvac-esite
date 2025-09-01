export interface CartItemInput {
  id: string
  quantity: number
  product: { id: string; name: string; price: string; image_url?: string | null }
}

export interface CustomerInput { name: string; email: string; phone: string }
export interface AddressInput { fullAddress: string; city: string; district: string; postalCode: string }
export type InvoiceType = 'individual' | 'corporate'
export type InvoiceInfo = Partial<{ tckn: string; companyName: string; vkn: string; taxOffice: string; eInvoice?: boolean }>
export interface LegalConsentsInput { kvkk: boolean; distanceSales: boolean; preInfo: boolean; orderConfirm: boolean; marketing?: boolean }

export interface BuildPaymentArgs {
  amount: number
  items: CartItemInput[]
  customer: CustomerInput
  shipping: AddressInput
  billing: AddressInput
  sameAsShipping: boolean
  userId?: string | null
  invoiceType: InvoiceType
  invoiceInfo: InvoiceInfo
  legalConsents: LegalConsentsInput
  preferredCarrier?: string | null
}

export function buildPaymentRequest(args: BuildPaymentArgs) {
  const { amount, items, customer, shipping, billing, sameAsShipping, userId, invoiceType, invoiceInfo, legalConsents, preferredCarrier } = args

  const cartItems = items.map(it => ({
    product_id: it.product.id,
    quantity: it.quantity,
    price: parseFloat(it.product.price),
    product_name: it.product.name,
    product_image_url: it.product.image_url || null,
  }))

  const shippingAddress = {
    fullAddress: shipping.fullAddress,
    city: shipping.city,
    district: shipping.district,
    postalCode: shipping.postalCode,
  }

  const billingAddress = sameAsShipping ? shippingAddress : {
    fullAddress: billing.fullAddress,
    city: billing.city,
    district: billing.district,
    postalCode: billing.postalCode,
  }

  const req = {
    amount,
    cartItems,
    customerInfo: customer,
    shippingAddress,
    billingAddress,
    user_id: userId || null,
    invoiceType,
    invoiceInfo: { ...invoiceInfo, type: invoiceType },
    legalConsents: {
      kvkk: { accepted: !!legalConsents.kvkk, ts: new Date().toISOString() },
      distanceSales: { accepted: !!legalConsents.distanceSales, ts: new Date().toISOString() },
      preInfo: { accepted: !!legalConsents.preInfo, ts: new Date().toISOString() },
      orderConfirm: { accepted: !!legalConsents.orderConfirm, ts: new Date().toISOString() },
      marketing: { accepted: !!legalConsents.marketing, ts: legalConsents.marketing ? new Date().toISOString() : null },
    },
    preferredCarrier: preferredCarrier || null,
  }

  return req
}
