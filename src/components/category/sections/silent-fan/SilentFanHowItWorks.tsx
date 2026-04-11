import { VentImage } from '@/components/ui/VentImage'
import React from 'react'
import { Microscope, Wind, ShieldCheck } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'

const SilentFanHowItWorks: React.FC = () => {
    const { t, dict } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const tr = (key: string) => t(`categorySilentFan.howItWorks.${key}`)

    const icons = [Microscope, Wind, ShieldCheck]
    const steps = dict.categorySilentFan.howItWorks.steps || []

    return (
        <section ref={sectionRef} className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual Breakdown */}
                    <div className={`${scrollAnimationClasses.slideRight(isVisible)} relative`}>
                        <div className="bg-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/5 relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                            <VentImage src="/images/vortice/vortice_lineo_technical.png"
                                alt="Silent Tech Breakdown"
                                className="w-full h-auto rounded-xl relative z-10"
                             />
                        </div>
                    </div>

                    {/* Content */}
                    <div className={scrollAnimationClasses.slideLeft(isVisible)}>
                        <span className="text-blue-400 font-bold tracking-wider text-sm uppercase mb-3 block">
                            {String(tr('eyebrow'))}
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {String(tr('title'))}
                        </h2>
                        <p className="text-lg text-slate-400 mb-10 max-w-xl">
                            {String(tr('subtitle'))}
                        </p>

                        <div className="space-y-8">
                            {steps.map((step, index: number) => {
                                const Icon = icons[index % icons.length]
                                return (
                                    <div key={index} className="flex gap-5 group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <Icon className="text-blue-400" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SilentFanHowItWorks
