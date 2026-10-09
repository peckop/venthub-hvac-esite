import React from 'react'

import VentImage from '@/components/ui/VentImage'
import useScrollAnimation, { scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'
import { doluMu } from '@/utils/bosDegerKorumasi'

const SilentFanTypeComparison: React.FC = () => {
    const { t, dict } = useI18n()
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()
    const tr = (key: string) => t(`categorySilentFan.comparison.${key}`)

    // URN-84: tablo bazı hücreleri BOŞ bırakır (kaldırma). Üç alanı da boş satır çizilmez; tek hücre boşsa
    // o hücrenin kutusu basılmaz (masaüstünde yerine görünmez boşluk konur ki yanındaki kutu kaymasın).
    const features = (dict.categorySilentFan.comparison.features || []).filter(
        f => doluMu(f.label) || doluMu(f.standard) || doluMu(f.quiet)
    )
    const baslik = String(tr('title'))
    const solBaslik = String(tr('standard'))
    const sagBaslik = String(tr('quiet'))
    const solEtiket = String(tr('standardLabel'))
    const sagEtiket = String(tr('quietLabel'))

    // Başlık ve tüm satırlar boşsa bölümün gösterecek hiçbir şeyi kalmaz: boş çerçeve çizilmez.
    if (!doluMu(baslik) && features.length === 0) return null

    return (
        <section ref={sectionRef} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {doluMu(baslik) && (
                    <div className={`text-center mb-16 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            {baslik}
                        </h2>
                    </div>
                )}

                <div className="grid lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative">
                    {/* Left: Background visual for standard (dimmed) */}
                    <div className="lg:col-span-2 relative min-h-300px flex items-center justify-center bg-slate-100">
                        <div className="absolute inset-0 opacity-20 grayscale bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800')" }} />
                        <div className="relative text-center z-10 p-8">
                            {/* AC motorlu model. ✕/✓ simgeleri ve soluk stil kalktı: iki eşit motor seçeneği (URN-81). */}
                            {doluMu(solBaslik) && (
                                <h3 className="text-2xl font-bold text-slate-700 uppercase tracking-hvac-normal mb-4">
                                    {solBaslik}
                                </h3>
                            )}
                        </div>
                    </div>

                    {/* Middle: Feature list */}
                    <div className="lg:col-span-1 bg-slate-900 flex flex-col justify-center py-8">
                        {features.map((f, i: number) => (
                            <div key={i} className="py-4 px-2 text-center border-b border-white/5 last:border-0">
                                {doluMu(f.label) && (
                                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
                                        {f.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Neon Visual for Lineo Quiet */}
                    <div className="lg:col-span-2 relative min-h-300px flex items-center justify-center group overflow-hidden">
                        <VentImage src="/images/vortice/vortice_lineo_neon.png"
                            alt={t('category.lineoNeonAlt')}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            fill
                         />
                        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-2" />
                        <div className="relative text-center z-10 p-8">
                            {doluMu(sagBaslik) && (
                                <h3 className="text-2xl font-bold text-white uppercase tracking-hvac-normal mb-4">
                                    {sagBaslik}
                                </h3>
                            )}
                        </div>
                    </div>

                    {/* Floating Cards Over Comparison (Desktop only) */}
                    <div className="hidden lg:block absolute inset-0 pointer-events-none">
                        <div className="grid lg:grid-cols-5 h-full">
                            <div className="lg:col-start-3 lg:col-span-1 flex flex-col justify-center">
                                {features.map((f, i: number) => (
                                    <div key={i} className="h-73px flex items-center justify-center gap-12 -mx-48">
                                        {/* Standard value (Left side of middle col) */}
                                        {doluMu(f.standard) ? (
                                            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700 w-48 text-center">
                                                {f.standard}
                                            </div>
                                        ) : <div className="w-48" aria-hidden="true" />}
                                        {/* Quiet value (Right side of middle col) */}
                                        {doluMu(f.quiet) ? (
                                            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700 w-48 text-center">
                                                {f.quiet}
                                            </div>
                                        ) : <div className="w-48" aria-hidden="true" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile view feature details (since floating cards are desktop only) */}
                <div className="lg:hidden mt-8 space-y-4">
                    {features.map((f, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            {doluMu(f.label) && <span className="text-xs uppercase font-bold text-slate-400 mb-2 block">{f.label}</span>}
                            <div className="grid grid-cols-2 gap-4">
                                {doluMu(f.standard) && (
                                    <div>
                                        {doluMu(solEtiket) && <span className="text-xs font-bold text-slate-500 uppercase">{solEtiket}</span>}
                                        <p className="text-sm font-medium text-slate-900">{f.standard}</p>
                                    </div>
                                )}
                                {doluMu(f.quiet) && (
                                    <div>
                                        {doluMu(sagEtiket) && <span className="text-xs font-bold text-slate-500 uppercase">{sagEtiket}</span>}
                                        <p className="text-sm font-medium text-slate-900">{f.quiet}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SilentFanTypeComparison
