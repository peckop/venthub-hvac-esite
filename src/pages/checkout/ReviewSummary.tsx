import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'

export interface CustomerInfo {
  name: string
  email: string
  phone: string
}
export interface AddressInfo {
  fullAddress: string
  city: string
  district: string
  postalCode: string
}
export type InvoiceType = 'individual' | 'corporate'
export interface InvoiceInfoIndividual { tckn?: string }
export interface InvoiceInfoCorporate { companyName?: string; vkn?: string; taxOffice?: string; eInvoice?: boolean }
export type InvoiceInfo = Partial<InvoiceInfoIndividual & InvoiceInfoCorporate>

export interface ReviewSummaryProps {
  customer: CustomerInfo
  shipping: AddressInfo
  billing: AddressInfo
  sameAsShipping: boolean
  invoiceType: InvoiceType
  invoiceInfo: InvoiceInfo
  onEditPersonal: () => void
  onEditShipping: () => void
  onEditBilling: () => void
  onEditInvoice: () => void
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  customer,
  shipping,
  billing,
  sameAsShipping,
  invoiceType,
  invoiceInfo,
  onEditPersonal,
  onEditShipping,
  onEditBilling,
  onEditInvoice,
}) => {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-industrial-gray">{t('checkout.review.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-white/90">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-industrial-gray">{t('checkout.personal.title')}</div>
            <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onEditPersonal}>{t('checkout.review.edit')}</button>
          </div>
          <div className="text-sm text-steel-gray">
            <div>{customer.name}</div>
            <div>{customer.email}</div>
            <div>{customer.phone}</div>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white/90">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-industrial-gray">{t('checkout.shipping.title')}</div>
            <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onEditShipping}>{t('checkout.review.edit')}</button>
          </div>
          <div className="text-sm text-steel-gray whitespace-pre-line">
            {shipping.fullAddress + '\n' + shipping.district + ', ' + shipping.city + ' ' + shipping.postalCode}
          </div>
        </div>
        {!sameAsShipping && (
          <div className="border rounded-lg p-4 bg-white/90">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-industrial-gray">{t('checkout.billing.title')}</div>
              <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onEditBilling}>{t('checkout.review.edit')}</button>
            </div>
            <div className="text-sm text-steel-gray whitespace-pre-line">
              {billing.fullAddress + '\n' + billing.district + ', ' + billing.city + ' ' + billing.postalCode}
            </div>
          </div>
        )}
        <div className="border rounded-lg p-4 bg-white/90">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-industrial-gray">{t('checkout.invoice.title')}</div>
            <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onEditInvoice}>{t('checkout.review.edit')}</button>
          </div>
          <div className="text-sm text-steel-gray">
            <div>{invoiceType === 'individual' ? t('checkout.invoice.individual') : t('checkout.invoice.corporate')}</div>
            {invoiceType === 'individual' ? (
              <div>TCKN: {invoiceInfo.tckn || '-'}</div>
            ) : (
              <div>
                <div>{invoiceInfo.companyName}</div>
                <div>VKN: {invoiceInfo.vkn}</div>
                <div>{invoiceInfo.taxOffice}</div>
                {invoiceInfo.eInvoice ? <div>e‑Fatura</div> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewSummary

