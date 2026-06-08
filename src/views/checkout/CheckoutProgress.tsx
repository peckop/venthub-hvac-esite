'use client'

import { ArrowLeft } from 'lucide-react'
import React from 'react'

import SecurityRibbon from '../../components/SecurityRibbon'

interface CheckoutProgressProps {
    step: number
    t: (key: string) => string
    onBackToCart: () => void
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ step, t, onBackToCart }) => {
    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBackToCart}
                    className="flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>{t('checkout.backToCart')}</span>
                </button>
                <h1 className="text-3xl font-bold text-industrial-gray">
                    {t('checkout.title')}
                </h1>
            </div>

            <div className="mb-4">
                <SecurityRibbon />
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4].map((n, idx) => (
                        <React.Fragment key={n}>
                            <div className="flex flex-col items-center min-w-110px">
                                <div className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center ${step >= n ? 'bg-primary-navy text-white' : 'bg-light-gray text-steel-gray border-2 border-light-gray'}`}>{n}</div>
                                <span className={`mt-1 text-sm ${step >= n ? 'text-primary-navy font-medium' : 'text-steel-gray'}`}>
                                    {n === 1 ? t('checkout.steps.step1') : n === 2 ? t('checkout.steps.step2') : n === 3 ? t('checkout.steps.step3') : t('checkout.steps.step4')}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`hidden sm:flex flex-1 h-1 ${step > n ? 'bg-primary-navy' : 'bg-light-gray'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </>
    )
}

export default CheckoutProgress
