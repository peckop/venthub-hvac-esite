'use client'

import { AlertTriangle,CheckCircle,CreditCard, Lock } from 'lucide-react'
import React from 'react'

import type { PaymentPhase } from '../../hooks/useCheckoutPayment'
import { FORM_RENDER_TIMEOUT_MS } from '../../hooks/useCheckoutPayment'
import { hasRenderedSurface,injectCheckoutForm } from './injectCheckoutForm'

interface PaymentIframeContainerProps {
    iyzToken: string
    paymentFrameContent: string
    showHelp: boolean
    setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void
    progressPct: number
    overlayStep: number
    phase: PaymentPhase
    errorMessage: string
    /** Form yüzeyi GERÇEKTEN belirdiğinde çağrılır (ölçümle, varsayımla değil). */
    onFormReady: () => void
    /** Yüzey kurulamadı — sebep makine okunur bir dize. */
    onFormFailed: (reason: string) => void
    onRetry?: () => void
    t: (key: string, params?: Record<string, unknown>) => string
}

const PaymentIframeContainer: React.FC<PaymentIframeContainerProps> = ({
    iyzToken,
    paymentFrameContent,
    showHelp,
    setShowHelp,
    progressPct,
    overlayStep,
    phase,
    errorMessage,
    onFormReady,
    onFormFailed,
    onRetry,
    t
}) => {
    const formHostRef = React.useRef<HTMLDivElement | null>(null)

    // ── Form yüzeyinin kurulması ve GERÇEKTEN belirdiğinin ölçülmesi ──────────────
    //
    // Üç şey aynı etkide olmak zorunda, çünkü üçü de tek bir yaşam döngüsüne ait:
    //   1. enjeksiyon (betikleri çalıştır),
    //   2. gözlem (kapta görünür bir yüzey belirdi mi),
    //   3. zaman aşımı (belirmezse sessiz kalma, hata bildir).
    // Ayrılırlarsa, sökülme sırasında gözlemci ya da sayaç arkada kalır ve sökülmüş
    // bileşende durum güncellemesi denenir.
    React.useEffect(() => {
        const host = formHostRef.current
        if (!host) return
        if (phase !== 'formLoading') return

        // Yalnız `token` gelip içerik gelmediyse enjekte edilecek bir şey yoktur; kabın
        // `data-token`'ı PSP betiği tarafından okunur. Bu dalda da gözlem AYNEN çalışır —
        // "içerik yok" sessiz beklemeyi meşrulaştırmaz.
        let cleanupInjection: (() => void) | null = null
        if (paymentFrameContent) {
            try {
                cleanupInjection = injectCheckoutForm(host, paymentFrameContent).cleanup
            } catch (e) {
                onFormFailed(`inject_threw: ${e instanceof Error ? e.message : String(e)}`)
                return
            }
        }

        if (hasRenderedSurface(host)) { onFormReady(); return cleanupInjection ?? undefined }

        const observer = new MutationObserver(() => {
            if (!hasRenderedSurface(host)) return
            observer.disconnect()
            window.clearTimeout(timer)
            onFormReady()
        })
        observer.observe(host, { childList: true, subtree: true })

        // Sessizliği görünür kılan tek mekanizma (bkz. FORM_RENDER_TIMEOUT_MS).
        const timer = window.setTimeout(() => {
            observer.disconnect()
            onFormFailed('render_timeout')
        }, FORM_RENDER_TIMEOUT_MS)

        return () => {
            observer.disconnect()
            window.clearTimeout(timer)
            cleanupInjection?.()
        }
    }, [phase, paymentFrameContent, onFormReady, onFormFailed])

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
                {phase === 'error' ? (
                    <div
                        role="alert"
                        data-testid="payment-form-error"
                        className="rounded-xl border border-danger-red/40 bg-danger-red/5 p-4 flex items-start gap-3"
                    >
                        <AlertTriangle className="text-danger-red shrink-0 mt-0.5" size={20} />
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-industrial-gray">{t('checkout.errors.paymentFormRenderTitle')}</p>
                            <p className="text-sm text-steel-gray">{errorMessage || t('checkout.errors.paymentFormRender')}</p>
                            {onRetry && (
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    data-testid="payment-form-retry"
                                    className="text-sm font-semibold text-primary-navy hover:text-secondary-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 rounded"
                                >
                                    {t('checkout.errors.paymentRetry')}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (paymentFrameContent || iyzToken) ? (
                    // Kap: içeriği React DEĞİL, `injectCheckoutForm` doldurur.
                    // Sebep: PSP parçasının içindeki betik `dangerouslySetInnerHTML` ile
                    // ASLA çalışmaz (HTML standardı) — eski kod tam bu yüzden boş kutu basıyordu.
                    <div className="rounded-xl border border-light-gray shadow-lg ring-1 ring-black/5 bg-white p-4 min-h-520px">
                        <div
                            ref={formHostRef}
                            id="iyzipay-checkout-form"
                            className="responsive"
                            data-pay-with-iyzico="true"
                            data-token={iyzToken || undefined}
                            data-testid="payment-form-host"
                        />
                    </div>
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
