import { HelpCircle,Minus, Plus } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import React, { useState } from 'react'

import type { SesOzeti } from '@/data/sessizFan/sesOzeti'
import useScrollAnimation, { scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'
import { doluMu } from '@/utils/bosDegerKorumasi'

import { cumleleriDoldur, sesEtiketSozlugu, sesYerTutucular } from './sesMetni'

interface SilentFanFAQProps {
    /** URN-135: ses aralığı (sunucudan; canlı model kodları ∩ ses verisi). Yoksa ses sayısı taşıyan cümleler çizilmez. */
    sesOzeti?: SesOzeti | null
    /** URN-135: rehber yazısının dil önekli adresi (sunucuda, yalnız yazı kaydı varsa); yoksa bağlantı çizilmez. */
    rehberHref?: string | null
}

const SilentFanFAQ: React.FC<SilentFanFAQProps> = ({ sesOzeti, rehberHref }) => {
    const { t, dict, lang } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const tr = (key: string) => t(`categorySilentFan.faq.${key}`)

    // URN-135 (Design D2): yedi soru. Cevap CÜMLE dizisidir; ses sayısı taşıyan cümle yalnız canlı kodların ses
    // verisiyle kesişimi varsa çizilir. Hiç cümlesi kalmayan soru çizilmez (boş cevap kutusu basılmaz).
    const yerTutucular = sesYerTutucular(sesOzeti, lang, sesEtiketSozlugu(dict.categorySilentFan.ses))
    const items = (dict.categorySilentFan.faq.items || []).flatMap((item) => {
        const cevap = cumleleriDoldur(item.a || [], yerTutucular).join(' ')
        return doluMu(item.q) && doluMu(cevap) ? [{ q: item.q, a: cevap, k: item.k }] : []
    })

    return (
        <section ref={sectionRef} className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                        <HelpCircle className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {String(tr('title'))}
                    </h2>
                </div>

                <div className="space-y-4">
                    {items.map((item, index: number) => {
                        const isOpen = openIndex === index
                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl border transition-colors duration-300 ${isOpen ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-slate-200 shadow-sm'} ${scrollAnimationClasses.fadeUp(isVisible)}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`silent-faq-content-${index}`}
                                    className="focus-ring w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                >
                                    <span className={`text-lg font-bold ${isOpen ? 'text-blue-600' : 'text-slate-900'}`}>
                                        {item.q}
                                    </span>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>

                                <div
                                    id={`silent-faq-content-${index}`}
                                    className={`overflow-hidden transition-colors duration-300 ease-in-out ${isOpen ? 'max-h-500px opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-1">
                                        <div className="pt-4">
                                            {item.a}
                                        </div>
                                        {doluMu(item.k) && (
                                            <p className="mt-3 text-xs text-steel-gray">
                                                {dict.categorySilentFan.ses.kaynakEtiketi}: {item.k}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {doluMu(rehberHref) && (
                    <p className="mt-8 text-center">
                        <Link
                            href={rehberHref as Route}
                            className="font-bold text-secondary-blue underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink"
                        >
                            {t('categorySilentFan.faq.rehberBaglantisi')}
                        </Link>
                    </p>
                )}
            </div>
        </section>
    )
}

export default SilentFanFAQ
