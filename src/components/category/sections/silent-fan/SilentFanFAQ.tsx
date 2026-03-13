import React, { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../../../../hooks/useScrollAnimation'
import { useI18n } from '../../../../i18n/I18nProvider'

const SilentFanFAQ: React.FC = () => {
    const { t } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    
    const tr = (key: string) => t(`categorySilentFan.faq.${key}`) as any
    const items = tr('items') || []

    return (
        <section ref={sectionRef} className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                        <HelpCircle className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {tr('title')}
                    </h2>
                </div>

                <div className="space-y-4">
                    {items.map((item: any, index: number) => {
                        const isOpen = openIndex === index
                        return (
                            <div 
                                key={index}
                                className={`bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-slate-200 shadow-sm'} ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span className={`text-lg font-bold ${isOpen ? 'text-blue-600' : 'text-slate-900'}`}>
                                        {item.q}
                                    </span>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>
                                
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-1">
                                        <div className="pt-4">
                                            {item.a}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default SilentFanFAQ
