import React, { useState } from 'react'
import { Zap, Wind, Check, X, HelpCircle, ArrowRight } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../../../hooks/useScrollAnimation'

interface TypeComparisonProps {
    onOpenWizard: () => void
    onSelectType: (type: 'elektrikli' | 'ortam') => void
}

/**
 * TypeComparison - Elektrikli vs Ortam Havalı karşılaştırma
 * Detaylı fayda karşılaştırması + kararsızlar için wizard tetikleyici
 */
const TypeComparison: React.FC<TypeComparisonProps> = ({ onOpenWizard, onSelectType }) => {
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const [hoveredType, setHoveredType] = useState<'elektrikli' | 'ortam' | null>(null)

    const types = [
        {
            id: 'elektrikli' as const,
            title: 'Elektrikli Isıtıcılı',
            subtitle: 'Kış kullanımı için ideal',
            icon: Zap,
            color: 'orange',
            colorClasses: {
                bg: 'bg-orange-50',
                border: 'border-orange-500',
                text: 'text-orange-600',
                button: 'bg-orange-500 hover:bg-orange-600',
                ring: 'ring-orange-200'
            },
            benefits: [
                'Kapı önünde sıcak hava bariyeri',
                'Kış aylarında enerji tasarrufu',
                'Müşteri konforunu artırır',
                'Termostat kontrollü ısıtma'
            ],
            bestFor: ['Mağaza girişleri', 'Restoran kapıları', 'Otel lobileri', 'Soğuk iklimlerde'],
            notFor: ['Soğuk hava depoları', 'Yaz mevsimi kullanımı']
        },
        {
            id: 'ortam' as const,
            title: 'Ortam Havalı',
            subtitle: 'Enerji tasarrufu odaklı',
            icon: Wind,
            color: 'blue',
            colorClasses: {
                bg: 'bg-blue-50',
                border: 'border-blue-500',
                text: 'text-blue-600',
                button: 'bg-blue-500 hover:bg-blue-600',
                ring: 'ring-blue-200'
            },
            benefits: [
                'Düşük enerji tüketimi',
                'Soğuk zincir koruması',
                'Hijyen bariyeri',
                'Mevcut ısıtma sistemine ek'
            ],
            bestFor: ['Soğuk hava depoları', 'Market reyonları', 'Hastaneler', 'Yazlık mekanlar'],
            notFor: ['Isıtmasız mekanlar', 'Çok soğuk iklimlerde']
        }
    ]

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`text-center mb-8 sm:mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Hangi Tip Hava Perdesi Size Uygun?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        İhtiyacınıza göre doğru tipi seçin. İkisi de aynı kalitede, farklı amaçlar için tasarlandı.
                    </p>
                </div>

                {/* Comparison Visual */}
                <div className={`flex justify-center mb-8 sm:mb-12 ${scrollAnimationClasses.scaleIn(isVisible)}`} style={{ transitionDelay: '200ms' }}>
                    <img
                        src="/images/category/electric-vs-ambient.png"
                        alt="Elektrikli vs Ortam Havalı Karşılaştırma"
                        className="max-w-full md:max-w-3xl rounded-xl shadow-lg"
                    />
                </div>

                {/* Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    {types.map((type) => {
                        const Icon = type.icon
                        const isHovered = hoveredType === type.id

                        return (
                            <div
                                key={type.id}
                                onMouseEnter={() => setHoveredType(type.id)}
                                onMouseLeave={() => setHoveredType(null)}
                                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${isHovered
                                    ? `${type.colorClasses.border} ${type.colorClasses.bg} shadow-xl ring-4 ${type.colorClasses.ring}`
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-xl ${type.colorClasses.bg} ${type.colorClasses.text}`}>
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{type.title}</h3>
                                        <p className="text-gray-500">{type.subtitle}</p>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">AVANTAJLARI</h4>
                                    <ul className="space-y-2">
                                        {type.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                                                <span className="text-gray-700">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Best For */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">EN UYGUN:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {type.bestFor.map((item, i) => (
                                            <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${type.colorClasses.bg} ${type.colorClasses.text}`}>
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Not For */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">TERCİH EDİLMEZ:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {type.notFor.map((item, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                <X size={12} className="inline mr-1" />
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => onSelectType(type.id)}
                                    className={`w-full py-3 px-6 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 ${type.colorClasses.button}`}
                                >
                                    {type.title} Modelleri
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Wizard CTA for Uncertain Users */}
                <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                    <HelpCircle className="mx-auto text-purple-500 mb-4" size={40} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Hala kararsız mısınız?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        2 dakikalık ihtiyaç analizi sihirbazımız size en uygun tipi ve modeli önerecek.
                    </p>
                    <button
                        onClick={onOpenWizard}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                        <HelpCircle size={20} />
                        Bana Yardım Et
                    </button>
                </div>
            </div>
        </section>
    )
}

export default TypeComparison



