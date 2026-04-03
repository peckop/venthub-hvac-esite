'use client'

import React from 'react'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { UserAddress } from '../../lib/supabase'
import { Routes } from '../../utils/routes'

import { CheckoutAddressInfo, CheckoutInvoiceInfo, CheckoutLegalConsents } from '../../types/db-rows'

interface StepAddressInfoProps {
    shippingAddress: CheckoutAddressInfo
    setShippingAddress: (a: CheckoutAddressInfo) => void
    billingAddress: CheckoutAddressInfo
    setBillingAddress: (a: CheckoutAddressInfo) => void
    sameAsShipping: boolean
    setSameAsShipping: (v: boolean) => void
    shippingMethod: 'standard' | 'express'
    setShippingMethod: (v: 'standard' | 'express') => void
    invoiceType: 'individual' | 'corporate'
    setInvoiceType: (v: 'individual' | 'corporate') => void
    invoiceInfo: CheckoutInvoiceInfo
    setInvoiceInfo: (v: CheckoutInvoiceInfo) => void
    legalConsents: CheckoutLegalConsents
    setLegalConsents: (v: CheckoutLegalConsents) => void
    savedAddresses: UserAddress[]
    onOpenAddressModal: (target: 'shipping' | 'billing') => void
    onOpenInvoiceModal: () => void
    t: (key: string) => string
    tf: (key: string, fallback: string) => string
}

const StepAddressInfo: React.FC<StepAddressInfoProps> = ({
    shippingAddress,
    setShippingAddress,
    billingAddress,
    setBillingAddress,
    sameAsShipping,
    setSameAsShipping,
    shippingMethod,
    setShippingMethod,
    invoiceType,
    setInvoiceType,
    invoiceInfo,
    setInvoiceInfo,
    legalConsents,
    setLegalConsents,
    savedAddresses,
    onOpenAddressModal,
    onOpenInvoiceModal,
    t,
    tf
}) => {
    return (
        <div className="space-y-8">
            {/* Shipping Method */}
            <div>
                <h3 className="text-lg font-semibold text-industrial-gray mb-3">{tf('checkout.shipping.methodTitle', 'Teslimat Yöntemi')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${shippingMethod === 'standard' ? 'border-primary-navy' : 'border-light-gray'}`}>
                        <div>
                            <div className="text-sm font-medium text-industrial-gray">Standart</div>
                            <div className="text-xs text-steel-gray">3–5 iş günü</div>
                        </div>
                        <input type="radio" name="shipmethod" className="ml-3" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${shippingMethod === 'express' ? 'border-primary-navy' : 'border-light-gray'}`}>
                        <div>
                            <div className="text-sm font-medium text-industrial-gray">Ekspres</div>
                            <div className="text-xs text-steel-gray">1–2 iş günü</div>
                        </div>
                        <input type="radio" name="shipmethod" className="ml-3" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                    </label>
                </div>
            </div>

            {/* Shipping Address */}
            <div>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary-navy text-white p-2 rounded-lg">
                        <MapPin size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-industrial-gray">
                        {t('checkout.shipping.title')}
                    </h2>
                </div>

                {/* Saved addresses quick pick trigger */}
                {savedAddresses.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-industrial-gray font-medium">{t('checkout.saved.title')}</div>
                            <button type="button" className="text-xs text-primary-navy hover:underline" onClick={() => onOpenAddressModal('shipping')}>
                                {t('checkout.saved.seeAll')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.shipping.addressLabel')}
                        </label>
                        <textarea
                            value={shippingAddress.fullAddress || shippingAddress.full_address || ''}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullAddress: e.target.value })}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            rows={3}
                            placeholder={t('checkout.shipping.addressPlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.shipping.cityLabel')}
                        </label>
                        <input
                            type="text"
                            value={shippingAddress.city || ''}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            placeholder={t('checkout.shipping.cityPlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.shipping.districtLabel')}
                        </label>
                        <input
                            type="text"
                            value={shippingAddress.district || ''}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            placeholder={t('checkout.shipping.districtPlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-industrial-gray mb-2">
                            {t('checkout.shipping.postalLabel')}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={shippingAddress.postalCode || shippingAddress.postal_code || ''}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                                setShippingAddress({ ...shippingAddress, postalCode: v })
                            }}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            placeholder={t('checkout.shipping.postalPlaceholder')}
                        />
                    </div>
                </div>
            </div>

            {/* Billing Address */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-industrial-gray">
                        {t('checkout.billing.title')}
                    </h3>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sameAsShipping}
                            onChange={(e) => setSameAsShipping(e.target.checked)}
                            className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.billing.sameAsShipping')}
                        </span>
                    </label>
                </div>

                {!sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex items-center justify-end -mt-2">
                            <button type="button" className="text-xs text-primary-navy hover:underline" onClick={() => onOpenAddressModal('billing')}>
                                {t('checkout.saved.seeAll')}
                            </button>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-industrial-gray mb-2">
                                {t('checkout.billing.addressLabel')}
                            </label>
                            <textarea
                                value={billingAddress.fullAddress}
                                onChange={(e) => setBillingAddress({ ...billingAddress, fullAddress: e.target.value })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                rows={3}
                                placeholder={t('checkout.billing.addressPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">
                                {t('checkout.billing.cityLabel')}
                            </label>
                            <input
                                type="text"
                                value={billingAddress.city}
                                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.billing.cityPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">
                                {t('checkout.billing.districtLabel')}
                            </label>
                            <input
                                type="text"
                                value={billingAddress.district}
                                onChange={(e) => setBillingAddress({ ...billingAddress, district: e.target.value })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.billing.districtPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">
                                {t('checkout.billing.postalLabel')}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={billingAddress.postalCode}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    setBillingAddress({ ...billingAddress, postalCode: v })
                                }}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.billing.postalPlaceholder')}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Section */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-industrial-gray">{t('checkout.invoice.title')}</h3>
                    <button type="button" className="text-xs text-primary-navy hover:underline" onClick={onOpenInvoiceModal}>
                        {t('checkout.saved.seeAll')}
                    </button>
                </div>
                <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="invoiceType"
                            value="individual"
                            checked={invoiceType === 'individual'}
                            onChange={() => { setInvoiceType('individual'); setInvoiceInfo({ type: 'individual', tckn: '' }) }}
                            className="text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-industrial-gray">{t('checkout.invoice.individual')}</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="invoiceType"
                            value="corporate"
                            checked={invoiceType === 'corporate'}
                            onChange={() => { setInvoiceType('corporate'); setInvoiceInfo({ type: 'corporate', companyName: '', vkn: '', taxOffice: '' }) }}
                            className="text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-industrial-gray">{t('checkout.invoice.corporate')}</span>
                    </label>
                </div>

                {invoiceType === 'individual' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.tcknLabel')}</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={invoiceInfo.tckn || ''}
                                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, tckn: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.invoice.tcknPlaceholder')}
                                maxLength={11}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.companyLabel')}</label>
                            <input
                                type="text"
                                value={invoiceInfo.companyName || ''}
                                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, companyName: e.target.value })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.invoice.companyPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.vknLabel')}</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={invoiceInfo.vkn || ''}
                                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, vkn: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.invoice.vknPlaceholder')}
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('checkout.invoice.taxOfficeLabel')}</label>
                            <input
                                type="text"
                                value={invoiceInfo.taxOffice || ''}
                                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, taxOffice: e.target.value })}
                                className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                                placeholder={t('checkout.invoice.taxOfficePlaceholder')}
                            />
                        </div>
                        <div className="flex items-center mt-2">
                            <input
                                id="einvoice"
                                type="checkbox"
                                checked={!!invoiceInfo.eInvoice}
                                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, eInvoice: e.target.checked })}
                                className="rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                            />
                            <label htmlFor="einvoice" className="ml-2 text-sm text-steel-gray">{t('checkout.invoice.eInvoice')}</label>
                        </div>
                    </div>
                )}
            </div>

            {/* Legal Consents */}
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-industrial-gray mb-3">{t('checkout.consents.title')}</h3>
                <div className="space-y-2">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={legalConsents.kvkk}
                            onChange={(e) => setLegalConsents({ ...legalConsents, kvkk: e.target.checked })}
                            className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.consents.readAcceptPrefix')} <Link href={Routes.legal.kvkk()} className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.kvkk')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                    </label>
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={legalConsents.distanceSales}
                            onChange={(e) => setLegalConsents({ ...legalConsents, distanceSales: e.target.checked })}
                            className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.consents.readAcceptPrefix')} <Link href={Routes.legal.mesafeliSatis()} className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.distanceSales')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                    </label>
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={legalConsents.preInfo}
                            onChange={(e) => setLegalConsents({ ...legalConsents, preInfo: e.target.checked })}
                            className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.consents.readAcceptPrefix')} <Link href={Routes.legal.onBilgilendirme()} className="text-primary-navy hover:text-secondary-blue font-medium" target="_blank">{t('legalLinks.preInformation')}</Link>{t('checkout.consents.readAcceptSuffix')}
                        </span>
                    </label>
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={legalConsents.orderConfirm}
                            onChange={(e) => setLegalConsents({ ...legalConsents, orderConfirm: e.target.checked })}
                            className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.consents.orderConfirmText')}
                        </span>
                    </label>
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={!!legalConsents.marketing}
                            onChange={(e) => setLegalConsents({ ...legalConsents, marketing: e.target.checked })}
                            className="mt-1 rounded border-light-gray text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-steel-gray">
                            {t('checkout.consents.marketingText')}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default StepAddressInfo
