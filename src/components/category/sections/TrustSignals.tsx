import React from 'react'
import { Shield, Award, Lock, Truck, CreditCard, Phone } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

/**
 * TrustSignals - Güven sinyalleri bölümü
 * Yeni site için Vortice itibarını ön plana çıkarır
 */
const TrustSignals: React.FC = () => {
    const { t } = useI18n()

    const signals = [
        {
            icon: Award,
            title: t('categoryAirCurtain.trustSignals.items.0.title'),
            description: t('categoryAirCurtain.trustSignals.items.0.description')
        },
        {
            icon: Shield,
            title: t('categoryAirCurtain.trustSignals.items.1.title'),
            description: t('categoryAirCurtain.trustSignals.items.1.description')
        },
        {
            icon: Lock,
            title: t('categoryAirCurtain.trustSignals.items.2.title'),
            description: t('categoryAirCurtain.trustSignals.items.2.description')
        },
        {
            icon: Truck,
            title: t('categoryAirCurtain.trustSignals.items.3.title'),
            description: t('categoryAirCurtain.trustSignals.items.3.description')
        },
        {
            icon: CreditCard,
            title: t('categoryAirCurtain.trustSignals.items.4.title'),
            description: t('categoryAirCurtain.trustSignals.items.4.description')
        },
        {
            icon: Phone,
            title: t('categoryAirCurtain.trustSignals.items.5.title'),
            description: t('categoryAirCurtain.trustSignals.items.5.description')
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
                        <span className="text-xs font-bold text-gray-500">{t('categoryAirCurtain.trustSignals.certifications.ce')}</span>
                        <span className="text-xs text-gray-400">{t('categoryAirCurtain.trustSignals.certifications.certified')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{t('categoryAirCurtain.trustSignals.certifications.iso')}</span>
                        <span className="text-xs text-gray-400">{t('categoryAirCurtain.trustSignals.certifications.quality')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">{t('categoryAirCurtain.trustSignals.certifications.compasso')}</span>
                        <span className="text-xs text-gray-400">{t('categoryAirCurtain.trustSignals.certifications.designAward')}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TrustSignals
