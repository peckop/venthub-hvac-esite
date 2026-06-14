import { Bug, DollarSign, Thermometer,Wind } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import useScrollAnimation, { scrollAnimationClasses } from '../../../hooks/useScrollAnimation'

/**
 * ProblemSection - "Problemi Tanı" bölümü
 * Kullanıcıya hava perdesi ihtiyacını hissettiren empati bölümü
 */
const ProblemSection: React.FC = () => {
    const { t } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const problems = [
        {
            icon: DollarSign,
            title: t('category.problemSection.energyLossTitle'),
            stat: '%30',
            description: t('category.problemSection.energyLossDesc'),
            color: 'text-red-500',
            bgColor: 'bg-red-50'
        },
        {
            icon: Thermometer,
            title: t('category.problemSection.tempDiffTitle'),
            stat: '15°C',
            description: t('category.problemSection.tempDiffDesc'),
            color: 'text-orange-500',
            bgColor: 'bg-orange-50'
        },
        {
            icon: Wind,
            title: t('category.problemSection.airflowTitle'),
            stat: '2.5 m/s',
            description: t('category.problemSection.airflowDesc'),
            color: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            icon: Bug,
            title: t('category.problemSection.pestTitle'),
            stat: '7/24',
            description: t('category.problemSection.pestDesc'),
            color: 'text-green-500',
            bgColor: 'bg-green-50'
        }
    ]

    return (
        <section ref={sectionRef} className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`text-center mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('category.problemSection.headerTitle')}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        {t('category.problemSection.headerSubtitle')}
                    </p>
                </div>

                {/* Problem Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                    {problems.map((problem, index) => {
                        const Icon = problem.icon
                        return (
                            <div
                                key={index}
                                className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-shadow duration-300 ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 ${problem.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={problem.color} size={20} />
                                </div>

                                {/* Stat */}
                                <div className={`text-2xl sm:text-4xl font-bold ${problem.color} mb-1 sm:mb-2`}>
                                    {problem.stat}
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1">
                                    {problem.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                    {problem.description}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Visual Comparison */}
                <div className={`relative bg-gradient-to-r from-red-500 to-blue-500 rounded-xl sm:rounded-2xl overflow-hidden ${scrollAnimationClasses.scaleIn(isVisible)}`} style={{ transitionDelay: '400ms' }}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 md:p-12">
                        {/* Without Air Curtain */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-300">
                                <span className="text-4xl">{t('category.problemSection.crossMark')}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('category.problemSection.withoutTitle')}</h3>
                            <ul className="text-red-100 text-sm space-y-1">
                                <li>• {t('category.problemSection.withoutPoint1')}</li>
                                <li>• {t('category.problemSection.withoutPoint2')}</li>
                                <li>• {t('category.problemSection.withoutPoint3')}</li>
                                <li>• {t('category.problemSection.withoutPoint4')}</li>
                            </ul>
                        </div>

                        {/* With Air Curtain */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-300">
                                <span className="text-4xl">{t('category.problemSection.checkMark')}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('category.problemSection.withTitle')}</h3>
                            <ul className="text-blue-100 text-sm space-y-1">
                                <li>• {t('category.problemSection.withPoint1')}</li>
                                <li>• {t('category.problemSection.withPoint2')}</li>
                                <li>• {t('category.problemSection.withPoint3')}</li>
                                <li>• {t('category.problemSection.withPoint4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProblemSection



