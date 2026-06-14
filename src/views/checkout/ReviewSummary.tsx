import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import { 
  CheckoutAddressInfo, 
  CheckoutCustomerInfo, 
  CheckoutInvoiceInfo 
} from '../../types/db-rows'

export type InvoiceType = 'individual' | 'corporate'

export interface ReviewSummaryProps {
  customer: CheckoutCustomerInfo
  shipping: CheckoutAddressInfo
  billing: CheckoutAddressInfo
  sameAsShipping: boolean
  invoiceType: InvoiceType
  invoiceInfo: CheckoutInvoiceInfo
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
            {(shipping.fullAddress || shipping.full_address || '') + '\n' + t('checkout.review.cityLine', { district: shipping.district, city: shipping.city, postal: (shipping.postalCode || shipping.postal_code || '') })}
          </div>
        </div>
        {!sameAsShipping && (
          <div className="border rounded-lg p-4 bg-white/90">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-industrial-gray">{t('checkout.billing.title')}</div>
              <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onEditBilling}>{t('checkout.review.edit')}</button>
            </div>
            <div className="text-sm text-steel-gray whitespace-pre-line">
              {(billing.fullAddress || billing.full_address || '') + '\n' + t('checkout.review.cityLine', { district: billing.district, city: billing.city, postal: (billing.postalCode || billing.postal_code || '') })}
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
              <div>{t('checkout.review.tckn', { value: invoiceInfo.tckn || '-' })}</div>
            ) : (
              <div>
                <div>{invoiceInfo.companyName}</div>
                <div>{t('checkout.review.vkn', { value: invoiceInfo.vkn })}</div>
                <div>{invoiceInfo.taxOffice}</div>
                {invoiceInfo.eInvoice ? <div>{t('checkout.review.eInvoice')}</div> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewSummary




