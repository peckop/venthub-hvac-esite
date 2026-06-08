import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import React, { useState } from 'react'

import { Routes } from '../../../utils/routes';


/**
 * FAQ - Sık Sorulan Sorular Accordion
 * Hava perdeleri hakkında en çok sorulan sorular
 */
const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: 'Hava perdesi gerçekten enerji tasarrufu sağlar mı?',
            answer: 'Evet, hava perdesi kapı açıkken iç ortamın sıcaklığını koruyarak %30\'a varan enerji tasarrufu sağlayabilir. Özellikle sık kapı açılışı olan işletmelerde (mağaza, restoran, market) bu tasarruf çok belirgindir.'
        },
        {
            question: 'Elektrikli mi yoksa ortam havalı mı tercih etmeliyim?',
            answer: 'Bu, kullanım yerinize bağlıdır. Kış aylarında kapı önünde ısıtma istiyorsanız elektrikli isıtıcılı model idealdir. Soğuk hava deposu veya mevcut ısıtma sisteminiz varsa ortam havalı model yeterlidir ve daha ekonomiktir.'
        },
        {
            question: 'Hava perdesi hangi boyutta olmalı?',
            answer: 'Hava perdesi genişliği, kapı genişliğine eşit veya biraz daha geniş olmalıdır. Örneğin 120 cm\'lik bir kapı için 120 cm veya 150 cm\'lik model uygundur. Montaj yüksekliği de önemlidir - cihazın teknik özelliklerinde belirtilen maksimum yüksekliğe dikkat edin.'
        },
        {
            question: 'Kurulum zor mu?',
            answer: 'Hava perdeleri genellikle kapı üstüne asılarak monte edilir. Profesyonel montaj önerilir ancak temel elektrik bilgisi olan bir teknisyen kolayca kurabilir. Kurulum kiti ve montaj kılavuzu ürünle birlikte gelir.'
        },
        {
            question: 'Bakım gerektirir mi?',
            answer: 'Minimal bakım yeterlidir. Yılda 1-2 kez filtrelerin temizlenmesi ve fan kanatlarının toz alınması önerilir. Düzenli bakım, cihazın ömrünü uzatır ve performansını korur.'
        },
        {
            question: 'Vortice garantisi ne kadar?',
            answer: 'Vortice ürünleri 2 yıl üretici garantisi ile satılmaktadır. Garanti kapsamında üretim hatalarından kaynaklanan arızalar ücretsiz onarılır veya değiştirilir. Yetkili bayi olarak garanti işlemlerinizi hızlıca yönetiyoruz.'
        }
    ]

    return (
        <section className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <HelpCircle className="mx-auto text-blue-500 mb-4" size={40} />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Sık Sorulan Sorular
                    </h2>
                    <p className="text-lg text-gray-600">
                        Hava perdeleri hakkında en çok merak edilenler
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index

                        return (
                            <div
                                key={index}
                                className={`border rounded-xl overflow-hidden transition-colors ${isOpen ? 'border-blue-200 shadow-md' : 'border-gray-200'
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
                                    className={`overflow-hidden transition-colors duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'
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
                        Başka sorularınız mı var?
                    </p>
                    <a
                        href={Routes.contact()}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                        Bize ulaşın →
                    </a>
                </div>
            </div>
        </section>
    )
}

export default FAQ



