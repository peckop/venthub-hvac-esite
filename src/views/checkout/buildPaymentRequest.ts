import { resolveProductImageUrl } from '@/lib/images/productImage'
import type { UserAddress } from '@/types/ui-models'

/**
 * W4b (T001-VH) · ödeme payload'ı artık YALNIZ doğrulanmış fiyatı taşır.
 *
 * Önceki hâlde kalem fiyatı ham `it.product.price`'tan geliyordu. O kolon Kademe-2'de
 * emekli edildi (374 üründe NULL) → `safeNumber(null)` = 0 → İyzico'ya 0 TL'lik kalemler
 * gidiyor, `amount` ile kalem toplamı tutmuyordu (tutarsız sipariş / muhasebe kaydı).
 * Artık fiyat `unitPrice`tan (sunucunun doğruladığı fiyat) okunur; fiyatı olmayan kalem
 * ödemeye HİÇ girmez — sessizce atlanmaz da, çağıran hata ile uyarılır.
 */
export interface CartItemInput {
  id: string
  quantity: number
  /** Doğrulanmış birim fiyat. Yoksa kalem fiyatlanamaz → ödeme reddedilir. */
  unitPrice?: number
  product: { id: string; name: string; image_url?: string | null; cover_image_path?: string | null }
}

/**
 * Sepette fiyatı çözülememiş kalem varken ödeme başlatılamaz.
 * `message` makine kodudur (log/Sentry); kullanıcıya gösterilecek metin `i18nKey`
 * üzerinden sözlükten çözülmelidir — bu modül i18n'e erişmez (saf payload kurucu).
 */
/**
 * Çekilecek tutar (`amount`) ile kalem dökümünün toplamı ayrışırsa ödeme kurulamaz.
 * İkisi FARKLI kaynaklardan gelir: `amount` sunucunun doğruladığı toplam, kalem fiyatları
 * ise sepetteki `unitPrice`. Sunucu bir kalemi 0'a düşürürse tutar kalem toplamının altına
 * iner ve müşteriden eksik tahsilat yapılır (İyzico sepet-tutar uyuşmazlığı). Kargo/ek
 * ücret tutarı BÜYÜTEBİLİR — o yön serbest; tehlikeli olan yalnız küçültme yönüdür.
 */
export class PaymentAmountMismatchError extends Error {
  readonly code = 'PAYMENT_AMOUNT_MISMATCH'
  readonly i18nKey = 'checkout.errors.paymentInit'

  constructor(amount: number, itemsSum: number) {
    super(`PAYMENT_AMOUNT_MISMATCH: amount=${amount} < itemsSum=${itemsSum}`)
    this.name = 'PaymentAmountMismatchError'
  }
}

export class CartItemPriceMissingError extends Error {
  readonly code = 'CART_ITEM_PRICE_MISSING'
  readonly i18nKey = 'checkout.errors.itemPriceMissing'
  readonly productIds: string[]

  constructor(productIds: string[]) {
    super(`CART_ITEM_PRICE_MISSING: ${productIds.join(', ')}`)
    this.name = 'CartItemPriceMissingError'
    this.productIds = productIds
  }
}

/** Ödemeye girebilecek fiyat: sonlu ve pozitif. 0 = "fiyat yok"un eski maskesiydi. */
function isPayablePrice(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
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

  // Tek geçiş: fiyatı olan kalem payload'a girer, olmayan toplanır. Fiyatsız kalem
  // varsa ödeme HİÇ kurulmaz — kalemi sessizce düşürmek, müşterinin gördüğü sepetle
  // çekilen tutarı ayrıştırırdı.
  const cartItems: {
    product_id: string
    quantity: number
    price: number
    product_name: string
    product_image_url: string | null
  }[] = []
  const unpricedProductIds: string[] = []

  for (const it of items) {
    if (!isPayablePrice(it.unitPrice)) {
      unpricedProductIds.push(it.product.id)
      continue
    }
    cartItems.push({
      product_id: it.product.id,
      quantity: it.quantity,
      // Ham products.price DEĞİL: sunucunun doğruladığı birim fiyat (W4b).
      price: it.unitPrice,
      product_name: it.product.name,
      // F5-B W3.2: legacy products.image_url doğrudan okunmuyor — tek-kaynak resolver.
      product_image_url: resolveProductImageUrl(it.product),
    })
  }

  if (unpricedProductIds.length > 0) {
    throw new CartItemPriceMissingError(unpricedProductIds)
  }

  // Tahsil edilecek tutar, kalem toplamının ALTINA inemez (eksik tahsilat koruması).
  // Üstüne çıkması meşru: kargo/ek ücret `amount`a dahil olabilir.
  const itemsSum = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  if (amount + 0.01 < itemsSum) {
    throw new PaymentAmountMismatchError(amount, itemsSum)
  }

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



