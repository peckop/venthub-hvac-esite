import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Routes } from '../../../utils/routes'
import { useI18n } from '@/i18n/I18nProvider'

/**
 * FAQ - Sık Sorulan Sorular Accordion
 * Hava perdeleri hakkında en çok sorulan sorular
 */
const FAQ: React.FC = () => {
    const { t } = useI18n()
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: t('categoryAirCurtain.faq.items.0.q'),
            answer: t('categoryAirCurtain.faq.items.0.a')
        },
        {
            question: t('categoryAirCurtain.faq.items.1.q'),
            answer: t('categoryAirCurtain.faq.items.1.a')
        },
        {
            question: t('categoryAirCurtain.faq.items.2.q'),
            answer: t('categoryAirCurtain.faq.items.2.a')
        },
        {
            question: t('categoryAirCurtain.faq.items.3.q'),
            answer: t('categoryAirCurtain.faq.items.3.a')
        },
        {
            question: t('categoryAirCurtain.faq.items.4.q'),
            answer: t('categoryAirCurtain.faq.items.4.a')
        },
        {
            question: t('categoryAirCurtain.faq.items.5.q'),
            answer: t('categoryAirCurtain.faq.items.5.a')
        }
    ]

    return (
        <section className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <HelpCircle className="mx-auto text-blue-500 mb-4" size={40} />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('categoryAirCurtain.faq.title')}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {t('categoryAirCurtain.faq.subtitle')}
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index

                        return (
                            <div
                                key={index}
                                className={`border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-blue-200 shadow-md' : 'border-gray-200'
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-content-${index}`}
                                    className={`focus-ring w-full text-left p-5 flex items-center justify-between gap-4 transition-colors ${isOpen ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <h3 className={`font-semibold ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {faq.question}
                                    </h3>
                                    {isOpen ? (
                                        <ChevronUp className="text-blue-500 flex-shrink-0" size={20} />
                                    ) : (
                                        <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                                    )}
                                </button>

                                <div
                                    id={`faq-content-${index}`}
                                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'
                                        }`}
                                >
                                    <div className="p-5 pt-0 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 mb-4">
                        {t('categoryAirCurtain.faq.moreQuestions')}
                    </p>
                    <a
                        href={Routes.contact()}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                        {t('categoryAirCurtain.faq.contactBtn')}
                    </a>
                </div>
            </div>
        </section>
    )
}

export default FAQ
