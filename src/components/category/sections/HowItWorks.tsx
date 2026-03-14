import { VentImage } from '@/components/ui/VentImage'
import React, { useState } from 'react'
import { Wind, ArrowDown, Shield, Thermometer, ChevronDown, ChevronUp } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../../../hooks/useScrollAnimation'

/**
 * HowItWorks - İnteraktif "Nasıl Çalışır" bölümü
 * Hava perdesinin çalışma prensibini görselleştirir
 */
const HowItWorks: React.FC = () => {
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const [activeStep, setActiveStep] = useState(0)

    const steps = [
        {
            icon: Wind,
            title: 'Güçlü Hava Akışı',
            description: 'Cihaz, yüksek hızda kontrollü bir hava akışı oluşturur.',
            detail: 'Özel tasarımlı fan ve kanatlar sayesinde düzgün ve güçlü bir hava akımı sağlanır.'
        },
        {
            icon: ArrowDown,
            title: 'Görünmez Bariyer',
            description: 'Hava akışı, kapı açıklığında görünmez bir perde oluşturur.',
            detail: 'Bu hava perdesi, iç ve dış ortamı fiziksel bir engel olmadan birbirinden ayırır.'
        },
        {
            icon: Shield,
            title: 'İzolasyon',
            description: 'Dış hava, toz, böcek ve koku içeri giremez.',
            detail: 'İç ortam sıcaklığı korunur, hijyen standartları sağlanır.'
        },
        {
            icon: Thermometer,
            title: 'Konfor',
            description: 'Müşteriler ve çalışanlar için ideal ortam sağlanır.',
            detail: 'Kapı açık kalsa bile iç mekan konforu bozulmaz.'
        }
    ]

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`text-center mb-8 sm:mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Hava Perdesi Nasıl Çalışır?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Basit ama etkili bir prensip: Görünmez hava duvarı
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Technical Diagram Image */}
                    <div className={`relative rounded-2xl overflow-hidden shadow-xl ${scrollAnimationClasses.scaleIn(isVisible)}`} style={{ transitionDelay: '200ms' }}>
                        <VentImage src="/images/category/air-curtain-diagram.png"
                            alt="Hava Perdesi Çalışma Prensibi"
                            className="w-full h-auto"
                            loading="lazy"
                         />
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = activeStep === index

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveStep(isActive ? -1 : index)}
                                    className={`relative z-10 w-full text-left p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${isActive
                                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-bold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                                    {index + 1}. {step.title}
                                                </h3>
                                                {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                            {isActive && (
                                                <p className="text-sm text-blue-600 mt-3 animate-fade-in">
                                                    💡 {step.detail}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks



