import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { Shield, Award, Lock, Truck, CreditCard, Phone } from 'lucide-react'

/**
 * TrustSignals - Güven sinyalleri bölümü
 * Yeni site için Vortice itibarını ön plana çıkarır
 */
const TrustSignals: React.FC = () => {
    const { t } = useI18n()
    const signals = [
        {
            icon: Award,
            title: t('category.trustSignals.authorizedDealer'),
            description: t('category.trustSignals.authorizedDealerDesc')
        },
        {
            icon: Shield,
            title: t('category.trustSignals.warranty'),
            description: t('category.trustSignals.warrantyDesc')
        },
        {
            icon: Lock,
            title: t('category.trustSignals.securePayment'),
            description: t('category.trustSignals.securePaymentDesc')
        },
        {
            icon: Truck,
            title: t('category.trustSignals.fastShipping'),
            description: t('category.trustSignals.fastShippingDesc')
        },
        {
            icon: CreditCard,
            title: t('category.trustSignals.installments'),
            description: t('category.trustSignals.installmentsDesc')
        },
        {
            icon: Phone,
            title: t('category.trustSignals.techSupport'),
            description: t('category.trustSignals.techSupportDesc')
        }
    ]

    return (
        <section className="py-12 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {signals.map((signal, index) => {
                        const Icon = signal.icon
                        return (
                            <div
                                key={index}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-200">
                                    <Icon className="text-blue-600" size={24} />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{signal.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{signal.description}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Certifications */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center gap-6 opacity-60">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{t('category.trustSignals.ce')}</span>
                        <span className="text-xs text-gray-400">{t('category.trustSignals.ceDesc')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{t('category.trustSignals.iso')}</span>
                        <span className="text-xs text-gray-400">{t('category.trustSignals.isoDesc')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{t('category.trustSignals.compasso')}</span>
                        <span className="text-xs text-gray-400">{t('category.trustSignals.compassoDesc')}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TrustSignals



