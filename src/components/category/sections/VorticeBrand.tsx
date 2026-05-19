import VentImage from '@/components/ui/VentImage'
import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { Award, Globe, Clock, Shield, Star } from 'lucide-react'
import useScrollAnimation, { scrollAnimationClasses } from '../../../hooks/useScrollAnimation'

/**
 * VorticeBrand - Marka Hikayesi Bölümü
 * 70 yıllık İtalyan mühendisliği ve güvenilirlik
 */
const VorticeBrand: React.FC = () => {
    const { t } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()

    const highlights = [
        {
            icon: Clock,
            value: '70+',
            label: t('category.vorticeBrand.yearsExp'),
            description: t('category.vorticeBrand.yearsExpDesc')
        },
        {
            icon: Globe,
            value: '90+',
            label: t('category.vorticeBrand.countries'),
            description: t('category.vorticeBrand.countriesDesc')
        },
        {
            icon: Award,
            value: '3x',
            label: t('category.vorticeBrand.compasso'),
            description: t('category.vorticeBrand.compassoDesc')
        },
        {
            icon: Star,
            value: '#1',
            label: t('category.vorticeBrand.europe'),
            description: t('category.vorticeBrand.europeDesc')
        }
    ]

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left: Brand Story */}
                    <div className={scrollAnimationClasses.slideRight(isVisible)}>
                        {/* Italian Flag Accent */}
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <div className="flex h-5 sm:h-6 rounded overflow-hidden shadow">
                                <div className="w-3 sm:w-4 bg-green-500" />
                                <div className="w-3 sm:w-4 bg-white" />
                                <div className="w-3 sm:w-4 bg-red-500" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-400">{t('category.vorticeBrand.italianEngineering')}</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                            {t('category.vorticeBrand.whyVorticePrefix')} <span className="text-orange-400">Vortice</span>?
                        </h2>

                        <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6">
                            {t('category.vorticeBrand.desc1')}
                        </p>

                        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 hidden sm:block">
                            {t('category.vorticeBrand.desc2Part1')} <strong className="text-orange-400">Compasso d'Oro</strong>{t('category.vorticeBrand.desc2Part2')}
                        </p>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                                <Shield className="text-green-400" size={16} />
                                <span className="text-xs sm:text-sm">{t('category.trustSignals.authorizedDealer')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                                <Award className="text-yellow-400" size={16} />
                                <span className="text-xs sm:text-sm">{t('category.trustSignals.ce')} {t('category.trustSignals.ceDesc')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                                <Star className="text-orange-400" size={16} />
                                <span className="text-xs sm:text-sm">{t('category.trustSignals.warranty')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Hero Image + Stats */}
                    <div className={scrollAnimationClasses.slideLeft(isVisible)} style={{ transitionDelay: '200ms' }}>
                        {/* Vortice Hero Image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6">
                            <VentImage src="/images/category/hero-vortice.png"
                                alt="Vortice Air Curtain Application"
                                className="w-full h-auto"
                             />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <span className="text-yellow-400 text-xs font-bold tracking-wider uppercase">{t('category.vorticeBrand.premiumComfort')}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-2">
                            {highlights.map((item, index) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={index}
                                        className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-all ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                        style={{ transitionDelay: `${400 + index * 100}ms` }}
                                    >
                                        <Icon className="text-orange-400 mx-auto mb-1" size={20} />
                                        <div className="text-xl font-bold text-white">{item.value}</div>
                                        <div className="text-xs text-gray-400">{item.label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Vortice Logo Mention */}
                <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 text-center ${scrollAnimationClasses.fadeIn(isVisible)}`} style={{ transitionDelay: '600ms' }}>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {t('category.vorticeBrand.authorizedSellerPart1')} <strong className="text-white">Vortice</strong> {t('category.vorticeBrand.authorizedSellerPart2')}
                    </p>
                </div>
            </div>
        </section>
    )
}

export default VorticeBrand



