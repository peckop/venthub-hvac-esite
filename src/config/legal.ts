export interface LegalConfig {
  sellerTitle: string
  sellerAddress: string
  sellerEmail: string
  sellerPhone: string
  taxOffice: string
  taxNumber: string
  mersis: string
  websiteUrl: string
  deliveryTime: string
  shippingFee: string
  returnAddress: string
  cargoCompanies: string
  refundTime: string
  retentionOrders: string
  retentionSupport: string
  retentionMarketing: string
  retentionLogs: string
  applicationEmail: string
  lastUpdated: string
}

const legalConfig: LegalConfig = {
  sellerTitle: '[SATICI_UNVAN]',
  sellerAddress: '[SATICI_ADRES]',
  sellerEmail: 'destek@ornek.com',
  sellerPhone: '+90 555 000 0000',
  taxOffice: '[VERGI_DAIRESI]',
  taxNumber: '[VERGI_NO]',
  mersis: '[MERSIS]',
  websiteUrl: 'venthub-hvac.com',
  deliveryTime: '1-5 iş günü',
  shippingFee: 'Bedava',
  returnAddress: '[IADE_ADRESI]',
  cargoCompanies: '[KARGO_FIRMALARI]',
  refundTime: '14 gün',
  retentionOrders: '10 yıl',
  retentionSupport: '3 yıl',
  retentionMarketing: '2 yıl',
  retentionLogs: '2 yıl',
  applicationEmail: 'kvkk@ornek.com',
  lastUpdated: new Date().toISOString().slice(0,10)
}

export default legalConfig

