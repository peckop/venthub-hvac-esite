'use client'

import React from 'react'
import { Lock } from 'lucide-react'

interface SecurePaymentOverlayProps {
    overlayVisible: boolean
    overlayStep: number
    overlayPercent: number
    t: (key: string) => string
}

const SecurePaymentOverlay: React.FC<SecurePaymentOverlayProps> = ({
    overlayVisible,
    overlayStep,
    overlayPercent,
    t
}) => {
    if (!overlayVisible) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center">
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t('checkout.overlay.dialogLabel')}
                className="bg-white/90 backdrop-saturate-150 border border-white/60 shadow-2xl rounded-2xl p-0 w-[92%] max-w-xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 md:px-8 py-5 border-b border-light-gray/60 bg-white/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-9 h-9 rounded-full bg-primary-navy/10 flex items-center justify-center">
                            <Lock className="text-primary-navy" size={18} />
                        </div>
                        <div>
                            <div className="text-industrial-gray font-semibold">{t('checkout.overlay.header')}</div>
                            <div className="text-xs text-steel-gray" aria-live="polite">
                                {overlayStep === 1 ? t('checkout.overlay.starting') : overlayStep === 2 ? t('checkout.overlay.secureForm') : t('checkout.overlay.bank3d')}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold text-primary-navy">Venthub HVAC</div>
                        <div className="text-[11px] text-steel-gray">{t('checkout.overlay.iyzico')}</div>
                    </div>
                </div>
                {/* Body */}
                <div className="px-6 md:px-8 py-6 bg-white/85">
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary-navy border-t-transparent animate-spin" aria-hidden />
                    </div>
                    <div className="mt-4 grid grid-cols-3 text-xs text-industrial-gray">
                        <div className={`text-center ${overlayStep >= 1 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageInit')}</div>
                        <div className={`text-center ${overlayStep >= 2 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageForm')}</div>
                        <div className={`text-center ${overlayStep >= 3 ? 'font-medium text-primary-navy' : ''}`}>{t('checkout.overlay.stageBank')}</div>
                    </div>
                    <div className="mt-3 w-full h-2 bg-light-gray/70 rounded-full overflow-hidden" aria-hidden>
                        <div className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-500" style={{ width: `${overlayPercent}%` }} />
                    </div>
                    <div className="mt-3 text-[11px] text-steel-gray">
                        {t('checkout.overlay.dontClose')}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SecurePaymentOverlay
