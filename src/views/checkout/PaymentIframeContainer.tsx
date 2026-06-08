'use client'

import { CheckCircle,CreditCard, Lock } from 'lucide-react'
import React from 'react'

interface PaymentIframeContainerProps {
    iyzToken: string
    paymentFrameContent: string
    showHelp: boolean
    setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void
    progressPct: number
    overlayStep: number
    t: (key: string, params?: Record<string, unknown>) => string
}

const PaymentIframeContainer: React.FC<PaymentIframeContainerProps> = ({
    iyzToken,
    paymentFrameContent,
    showHelp,
    setShowHelp,
    progressPct,
    overlayStep,
    t
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-2">
                <div className="bg-primary-navy text-white p-2 rounded-lg">
                    <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-semibold text-industrial-gray">{t('checkout.paymentSectionTitle')}</h2>
            </div>

            {/* Secure Payment Header */}
            <div className="rounded-lg border border-primary-navy/30 bg-white/90 p-3 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary-navy">
                        <Lock size={18} />
                        <div className="text-sm font-semibold">{t('checkout.securePaymentBrand', { brand: 'Venthub HVAC' })}</div>
                    </div>
                    <div className="text-xs text-steel-gray">{t('checkout.securePaymentProvider', { provider: 'iyzico' })}</div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-light-gray/80 rounded-full overflow-hidden" aria-hidden>
                    <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-colors" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="text-xs text-steel-gray">
                    {overlayStep === 1 ? t('checkout.overlay.starting') : overlayStep === 2 ? t('checkout.overlay.secureForm') : t('checkout.overlay.bank3d')}
                </div>
            </div>

            <p className="text-steel-gray text-sm">{t('checkout.paymentLoading')}</p>

            <div className="mt-4">
                {iyzToken ? (
                    <div className="rounded-xl border border-light-gray shadow-lg ring-1 ring-black/5 bg-white p-4 min-h-520px">
                        <div id="iyzipay-checkout-form" className="responsive" data-pay-with-iyzico="true" data-token={iyzToken} />
                    </div>
                ) : paymentFrameContent ? (
                    <div className="rounded-xl border border-light-gray shadow-lg ring-1 ring-black/5 bg-white p-4 min-h-520px" dangerouslySetInnerHTML={{ __html: paymentFrameContent }} />
                ) : (
                    <div className="flex items-center gap-3 text-steel-gray">
                        <CheckCircle className="animate-pulse" />
                        <span>{t('checkout.formPreparing')}</span>
                    </div>
                )}

                <div className="mt-3">
                    <button
                        onClick={() => setShowHelp(v => !v)}
                        type="button"
                        className="text-sm text-primary-navy hover:text-secondary-blue"
                    >
                        {t('checkout.help.smsTitle')}
                    </button>
                    {showHelp && (
                        <div className="mt-2 text-xs text-steel-gray space-y-1 bg-air-blue/20 rounded-lg p-3">
                            <p>• {t('checkout.help.tip1')}</p>
                            <p>• {t('checkout.help.tip2')}</p>
                            <p>• {t('checkout.help.tip3')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentIframeContainer
