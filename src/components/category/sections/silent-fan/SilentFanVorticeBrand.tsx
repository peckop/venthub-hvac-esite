import VentImage from '@/components/ui/VentImage'
import React from 'react'
import { Award, Globe, Clock, Star } from 'lucide-react'
import useScrollAnimation, { scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'

const SilentFanVorticeBrand: React.FC = () => {
    const { t, dict } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const tr = (key: string) => t(`categorySilentFan.brand.${key}`)
    const bDict = dict.categorySilentFan.brand

    // We know the order or we can just use the icons array directly like before.
    const icons = [Clock, Globe, Award, Star]
    const stats = bDict.stats || []

    return (
        <section ref={sectionRef} className="py-20 bg-slate-900 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className={scrollAnimationClasses.slideRight(isVisible)}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex h-6 rounded-sm overflow-hidden shadow-lg ring-1 ring-white/20">
                                <div className="w-4 bg-vortice-green" />
                                <div className="w-4 bg-white" />
                                <div className="w-4 bg-italian-red" />
                            </div>
                            <span className="text-sm font-bold tracking-hvac-normal text-slate-400 uppercase">{String(tr('eyebrow'))}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                            {String(tr('title')).split(':')[0]}:<br />
                            <span className="text-blue-500">{String(tr('title')).split(':')[1]}</span>
                        </h2>

                        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                            {String(tr('description'))}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            {stats.map((item, index: number) => {
                                const Icon = icons[index % icons.length]
                                return (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                            <Icon className="text-blue-400" size={24} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white">{item.value}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {(bDict.badges || []).map((badge: string, i: number) => (
                                <div key={i} className={`px-6 py-3 rounded-full text-sm font-bold ${i === 0 ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white/5 border border-white/10'}`}>
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${scrollAnimationClasses.slideLeft(isVisible)} relative`}>
                        <div className="relative z-10 rounded-hvac-2xl overflow-hidden border-8 border-slate-800 shadow-2xl">
                            <VentImage src="/images/vortice/vortice_lineo_hero.png"
                                alt="Vortice Lineo Heritage"
                                className="w-full h-auto"
                             />
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SilentFanVorticeBrand
