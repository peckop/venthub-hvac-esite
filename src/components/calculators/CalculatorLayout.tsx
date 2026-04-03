import React from 'react'
import Link from 'next/link'
import { Calculator, ArrowLeft, Info, AlertTriangle } from 'lucide-react'
import Seo from '../Seo'

interface CalculatorLayoutProps {
    title: string
    description: string
    icon?: React.ReactNode
    backLink?: string
    backLabel?: string
    infoText?: string
    warningText?: string
    children: React.ReactNode
}

/**
 * Ortak hesap makinesi layout wrapper
 * Premium görünüm, SEO, breadcrumb içerir
 */
const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
    title,
    description,
    icon,
    backLink = '/products',
    backLabel = 'Ürünlere Dön',
    infoText,
    warningText,
    children
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-light-gray to-white">
            <Seo
                title={`${title} | VentHub Mühendislik Araçları`}
                description={description}
            />

            {/* Header */}
            <div className="bg-primary-navy text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <Link
                        href={backLink as import('next').Route}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {backLabel}
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            {icon || <Calculator size={32} />}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                            <p className="text-white/80 mt-1">{description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info/Warning Banners */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-3">
                {infoText && (
                    <div className="flex items-start gap-3 p-4 bg-secondary-blue/10 border border-secondary-blue/20 rounded-xl">
                        <Info className="text-secondary-blue flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-industrial-gray">{infoText}</p>
                    </div>
                )}
                {warningText && (
                    <div className="flex items-start gap-3 p-4 bg-warning-orange/10 border border-warning-orange/20 rounded-xl">
                        <AlertTriangle className="text-warning-orange flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-industrial-gray">{warningText}</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>

            {/* Footer Note */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="text-center text-sm text-steel-gray border-t border-light-gray pt-6">
                    <p>
                        Bu hesap makinesi ön boyutlandırma amaçlıdır.
                        Kesin proje hesapları için bir HVAC mühendisine danışın.
                    </p>
                    <p className="mt-1 text-xs">
                        Teknik sorularınız için{' '}
                        <Link href="/contact" className="text-primary-navy hover:underline">
                            iletişime geçin
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CalculatorLayout



