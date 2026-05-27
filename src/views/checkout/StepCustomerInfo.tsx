'use client'

import React from 'react'
import { User } from 'lucide-react'

import { CheckoutCustomerInfo } from '../../types/db-rows'

interface StepCustomerInfoProps {
    customerInfo: CheckoutCustomerInfo
    setCustomerInfo: (info: CheckoutCustomerInfo) => void
    t: (key: string) => string
}

const StepCustomerInfo: React.FC<StepCustomerInfoProps> = ({ customerInfo, setCustomerInfo, t }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary-navy text-white p-2 rounded-lg">
                    <User size={20} />
                </div>
                <h2 className="text-xl font-semibold text-industrial-gray">
                    {t('checkout.personal.title')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.nameLabel')}
                    </label>
                    <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                        placeholder={t('checkout.personal.namePlaceholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.emailLabel')}
                    </label>
                    <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                        placeholder={t('checkout.personal.emailPlaceholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.phoneLabel')}
                    </label>
                    <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                        placeholder={t('checkout.personal.phonePlaceholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                        {t('checkout.personal.idLabel')}
                    </label>
                    <input
                        type="text"
                        value={customerInfo.identityNumber}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, identityNumber: e.target.value })}
                        className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                        placeholder={t('checkout.personal.idPlaceholder')}
                        maxLength={11}
                    />
                </div>
            </div>
        </div>
    )
}

export default StepCustomerInfo
