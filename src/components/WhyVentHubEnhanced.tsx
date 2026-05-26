import React from 'react'
import { Award, Shield, Truck, Clock, CheckCircle, Star } from 'lucide-react'
import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/I18nProvider'

/**
 * WhyVentHubEnhanced - Neden VentHub + Güven Sinyalleri
 * Proje tema renklerine uyumlu profesyonel tasarım
 */
const WhyVentHubEnhanced: React.FC = () => {
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const { t } = useI18n()

    const features = [
        {
            icon: Star,
            title: t('home.whyVentHub.features.brands.title'),
            description: t('home.whyVentHub.features.brands.description'),
            color: 'text-gold-accent',
            bgColor: 'bg-warning-orange/10'
        },
        {
            icon: Shield,
            title: t('home.whyVentHub.features.support.title'),
            description: t('home.whyVentHub.features.support.description'),
            color: 'text-success-green',
            bgColor: 'bg-success-green/10'
        },
        {
            icon: Truck,
            title: t('home.whyVentHub.features.delivery.title'),
            description: t('home.whyVentHub.features.delivery.description'),
            color: 'text-primary-navy',
            bgColor: 'bg-primary-navy/10'
        }
    ]

    const trustBadges = [
        { icon: Award, label: t('home.whyVentHub.badges.premium'), color: 'text-gold-accent' },
        { icon: Shield, label: t('home.whyVentHub.badges.ce'), color: 'text-success-green' },
        { icon: CheckCircle, label: t('home.whyVentHub.badges.warranty'), color: 'text-primary-navy' },
        { icon: Clock, label: t('home.whyVentHub.badges.shipping'), color: 'text-secondary-blue' }
    ]

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 bg-gradient-to-br from-primary-navy via-primary-navy to-industrial-gray text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className={`text-center mb-10 sm:mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                        {t('home.whyVentHub.title')} <span className="text-secondary-blue">VentHub</span>?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
                        {t('home.whyVentHub.subtitle')}
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className={`text-center p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors duration-300 ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${feature.bgColor}`}>
                                    <Icon className={feature.color} size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Trust Badges Row */}
                <div className={`border-t border-white/10 pt-8 ${scrollAnimationClasses.fadeUp(isVisible)}`} style={{ transitionDelay: '300ms' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trustBadges.map((badge, index) => {
                            const Icon = badge.icon
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-center gap-2 sm:gap-3 py-3 px-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300"
                                >
                                    <Icon className={badge.color} size={20} />
                                    <span className="text-xs sm:text-sm font-medium text-gray-200">{badge.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Vortice Authorized Dealer Highlight */}
                <div className={`mt-8 text-center ${scrollAnimationClasses.fadeIn(isVisible)}`} style={{ transitionDelay: '400ms' }}>
                    <p className="text-sm text-gray-400">
                        {t('home.whyVentHub.authorizedDealer.prefix')}{' '}
                        <strong className="text-gold-accent">
                            {t('home.whyVentHub.authorizedDealer.brand')}
                        </strong>{' '}
                        {t('home.whyVentHub.authorizedDealer.suffix')}
                    </p>
                </div>
            </div>
        </section>
    )
}

export default WhyVentHubEnhanced
