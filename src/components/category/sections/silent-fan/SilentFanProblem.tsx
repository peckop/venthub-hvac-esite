import VentImage from '@/components/ui/VentImage'
import React from 'react'
import { VolumeX, Zap, Activity, Info } from 'lucide-react'
import useScrollAnimation, { scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'

interface PainPoint {
    title: string
    description: string
}

const SilentFanProblem: React.FC = () => {
    const { t, dict } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const tr = (key: string) => t(`categorySilentFan.problem.${key}`)
    const pDict = dict.categorySilentFan.problem

    const icons = [VolumeX, Zap, Activity, Info]
    const colors = [
        { text: 'text-blue-500', bg: 'bg-blue-50' },
        { text: 'text-orange-500', bg: 'bg-orange-50' },
        { text: 'text-red-500', bg: 'bg-red-50' },
        { text: 'text-purple-500', bg: 'bg-purple-50' }
    ]

    const painPoints = pDict.painPoints || []

    return (
        <section ref={sectionRef} className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`text-center mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">
                        {String(tr('eyebrow'))}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {String(tr('title'))}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        {String(tr('subtitle'))}
                    </p>
                </div>

                {/* Problem Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                    {painPoints.map((point: PainPoint, index: number) => {
                        const Icon = icons[index % icons.length]
                        const color = colors[index % colors.length]
                        return (
                            <div
                                key={index}
                                className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-shadow duration-300 ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 ${color.bg} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={color.text} size={20} />
                                </div>
                                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1">
                                    {point.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                    {point.description}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Visual Comparison */}
                <div className={`relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ${scrollAnimationClasses.scaleIn(isVisible)}`} style={{ transitionDelay: '400ms' }}>
                    <div className="aspect-video md:aspect-[21/9] relative">
                        <VentImage src="/images/vortice/vortice_lineo_loft.png"
                            alt="Silent Comfort"
                            className="absolute inset-0 w-full h-full object-cover"
                         />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                        
                        <div className="relative z-10 h-full flex items-center p-6 md:p-12">
                            <div className="grid md:grid-cols-2 gap-8 w-full">
                                {/* Without */}
                                <div className="text-left bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">✕</div>
                                        <h3 className="text-lg font-bold text-white">{String(tr('visual.without'))}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {Array.isArray(pDict.visual.withoutPoints) && pDict.visual.withoutPoints.map((p, i) => (
                                            <li key={i} className="text-red-200 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* With */}
                                <div className="text-left bg-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-400/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">✓</div>
                                        <h3 className="text-lg font-bold text-white">{String(tr('visual.with'))}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {Array.isArray(pDict.visual.withPoints) && pDict.visual.withPoints.map((p, i) => (
                                            <li key={i} className="text-blue-100 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SilentFanProblem
