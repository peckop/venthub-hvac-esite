import React, { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/i18n/I18nProvider';
import Link from 'next/link'
import {
    X, ChevronLeft,
    DoorOpen, Snowflake, Factory, ShoppingCart,
    Ruler, ArrowRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toUIProductList, type DomainProduct } from '../../lib/type-converters'
import { DbProduct, DbJson } from '../../types/db-rows'
import { calculateAirCurtain } from '../../lib/hvacCalculations'
import { Routes } from '../../utils/routes'

// Types
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

interface WizardState {
    step: WizardStep
    usageLocation: 'entrance' | 'cold-storage' | 'industrial' | 'retail' | null
    sector: string | null
    doorWidth: number
    doorHeight: number
    windCondition: 'none' | 'light' | 'moderate' | 'strong'
    trafficIntensity: 'low' | 'medium' | 'high'
    heatingNeeded: 'yes' | 'no' | 'unsure' | null
    climateZone: 'cold' | 'moderate' | 'warm' | null
    doorFrequency: 'low' | 'medium' | 'high' | null
    hasHeating: boolean | null
}

interface EnhancedWizardProps {
    isOpen: boolean
    onClose: () => void
    parentSlug: string
}

interface MatchedProduct extends DomainProduct {
    matchScore: number
    matchReason: string
}

// Data
const getUsageLocations = (t: (key: string) => string) => [
    {
        id: 'entrance',
        title: t('needsWizard.entranceDoor'),
        description: t('needsWizard.entranceDesc'),
        icon: DoorOpen,
        tip: t('needsWizard.entranceTip')
    },
    {
        id: 'cold-storage',
        title: t('needsWizard.coldStorage'),
        description: t('needsWizard.coldStorageDesc'),
        icon: Snowflake,
        tip: 'Soğuk zinciri KORUR, ürün bozulmasını engeller'
    },
    {
        id: 'industrial',
        title: t('needsWizard.industrial'),
        description: 'Fabrika, lojistik tesisi',
        icon: Factory,
        tip: 'Toz, duman ve zararlı madde izolasyonu sağlar'
    },
    {
        id: 'retail',
        title: t('needsWizard.retail'),
        description: t('needsWizard.retailDesc'),
        icon: ShoppingCart,
        tip: t('needsWizard.retailTip')
    }
]

const EnhancedNeedsWizard: React.FC<EnhancedWizardProps> = ({ isOpen, onClose, parentSlug }) => {
    const { t } = useI18n();
    const [state, setState] = useState<WizardState>({
        step: 1,
        usageLocation: null,
        sector: null,
        doorWidth: 1.0,
        doorHeight: 2.2,
        windCondition: 'none',
        trafficIntensity: 'low',
        heatingNeeded: null,
        climateZone: null,
        doorFrequency: null,
        hasHeating: null
    })

    const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([])
    const [loading, setLoading] = useState(false)

    const matchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products').select('id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price')
                .eq('status', 'active')
                .contains('category_slugs', [parentSlug])

            if (error) throw error

            // Internal calculation call with correct property names
            calculateAirCurtain({
                doorWidth: state.doorWidth,
                doorHeight: state.doorHeight,
                windCondition: state.windCondition,
                trafficIntensity: state.trafficIntensity,
                application: state.usageLocation === 'cold-storage' ? 'coldRoom' : 'comfort'
            })

            const rawProducts = data as DbProduct[]
            const domainProducts = toUIProductList(rawProducts)

            const scored = domainProducts
                .map(p => {
                    let score = 0
                    const reason = 'Kapasite uyumu'

                    const specs = p.technical_specs as Record<string, DbJson> | null
                    const pWidth = specs?.width ? parseFloat(String(specs.width)) / 1000 : 0
                    const pHeight = specs?.max_height ? parseFloat(String(specs.max_height)) : 0

                    if (pWidth >= state.doorWidth) score += 40
                    if (pHeight >= state.doorHeight) score += 30
                    
                    if (state.heatingNeeded === 'yes' && p.name.toLocaleLowerCase('tr').includes('ısıtıcı')) score += 30
                    if (state.heatingNeeded === 'no' && !p.name.toLocaleLowerCase('tr').includes('ısıtıcı')) score += 30

                    return { ...p, matchScore: score, matchReason: reason }
                })
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 3)

            setMatchedProducts(scored)
        } catch (err) {
            console.error('Match error:', err)
        } finally {
            setLoading(false)
        }
    }, [parentSlug, state.doorHeight, state.doorWidth, state.heatingNeeded, state.trafficIntensity, state.usageLocation, state.windCondition])

    useEffect(() => {
        if (state.step === 6) {
            matchProducts()
        }
    }, [state.step, matchProducts])

    if (!isOpen) return null

    const nextStep = () => setState(prev => ({ ...prev, step: (prev.step + 1) as WizardStep }))
    const prevStep = () => setState(prev => ({ ...prev, step: (prev.step - 1) as WizardStep }))

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
        >
            <button
                type="button"
                className="absolute inset-0 w-full h-full bg-slate-900/60 backdrop-blur-xl cursor-default border-none outline-none" 
                onClick={onClose} 
                aria-label={t("common.close")}
                tabIndex={-1}
            />
            
            <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        {state.step > 1 && state.step < 6 && (
                            <button onClick={prevStep} aria-label={t("needsWizard.goBack")} className="focus-ring p-2 hover:bg-white rounded-xl transition-colors">
                                <ChevronLeft size={20} className="text-slate-400" />
                            </button>
                        )}
                        <div>
                            <h3 id="wizard-title" className="text-lg font-bold text-slate-900">İhtiyaç Analiz Sihirbazı</h3>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5, 6].map(s => (
                                    <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= state.step ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label={t("common.close")} className="focus-ring p-2 hover:bg-white rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {state.step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center max-w-lg mx-auto">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('needsWizard.step1Title')}</h2>
                                <p className="text-slate-500 font-light leading-relaxed">{t('needsWizard.step1Desc')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {getUsageLocations(t).map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => { setState(prev => ({ ...prev, usageLocation: loc.id as WizardState['usageLocation'] })); nextStep() }}
                                        className="focus-ring group p-6 text-left rounded-3xl border border-slate-100 bg-slate-50 hover:border-cyan-500/30 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-500"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                            <loc.icon size={24} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-2">{loc.title}</h4>
                                        <p className="text-sm text-slate-500 font-light leading-relaxed">{loc.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {state.step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center max-w-lg mx-auto">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('needsWizard.step2Title')}</h2>
                                <p className="text-slate-500 font-light leading-relaxed">{t('needsWizard.step2Desc')}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-slate-400 mb-2">
                                        <Ruler size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('needsWizard.widthMeter')}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.8" max="3.0" step="0.1" 
                                        value={state.doorWidth}
                                        onChange={(e) => setState(prev => ({ ...prev, doorWidth: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="text-5xl font-extralight tracking-tighter text-slate-900">{state.doorWidth.toFixed(1)} <span className="text-xl font-bold text-slate-300">m</span></div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-slate-400 mb-2">
                                        <Ruler size={20} className="rotate-90" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('needsWizard.heightMeter')}</span>
                                    </div>
                                    <input 
                                        type="range" min="2.0" max="5.0" step="0.1" 
                                        value={state.doorHeight}
                                        onChange={(e) => setState(prev => ({ ...prev, doorHeight: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="text-5xl font-extralight tracking-tighter text-slate-900">{state.doorHeight.toFixed(1)} <span className="text-xl font-bold text-slate-300">m</span></div>
                                </div>
                            </div>

                            <button onClick={nextStep} className="focus-ring w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-cyan-600 transition-all">
                                {t('needsWizard.next')} <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {state.step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 mb-10 tracking-tight">{t('needsWizard.step3Title')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <button onClick={() => { setState(prev => ({ ...prev, heatingNeeded: 'yes' })); nextStep() }} className="focus-ring p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:border-cyan-500 hover:bg-white transition-all">
                                    <div className="text-4xl mb-4">🔥</div>
                                    <div className="font-bold">{t('admin.common.yes')}</div>
                                    <div className="text-xs text-slate-400 mt-2">{t('needsWizard.heatingYesDesc')}</div>
                                </button>
                                <button onClick={() => { setState(prev => ({ ...prev, heatingNeeded: 'no' })); nextStep() }} className="focus-ring p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:border-cyan-500 hover:bg-white transition-all">
                                    <div className="text-4xl mb-4">🌬️</div>
                                    <div className="font-bold">{t('admin.common.no')}</div>
                                    <div className="text-xs text-slate-400 mt-2">{t('needsWizard.heatingNoDesc')}</div>
                                </button>
                                <button onClick={() => { setState(prev => ({ ...prev, heatingNeeded: 'unsure' })); nextStep() }} className="focus-ring p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:border-cyan-500 hover:bg-white transition-all">
                                    <div className="text-4xl mb-4">❓</div>
                                    <div className="font-bold">{t('needsWizard.notSure')}</div>
                                    <div className="text-xs text-slate-400 mt-2">{t('needsWizard.consultUs')}</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {state.step === 6 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('needsWizard.step6Title')}</h2>
                                <p className="text-slate-500 font-light">{t('needsWizard.step6Desc')}</p>
                            </div>

                            {loading ? (
                                <div className="py-20 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-[10px]">{t('needsWizard.analyzing')}</div>
                            ) : (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {matchedProducts.map((p: MatchedProduct) => (
                                        <Link
                                            key={p.id}
                                            href={Routes.product(p.slug!)}
                                            className="group block p-6 rounded-[2.5rem] bg-white border border-slate-100 hover:border-cyan-500/20 hover:shadow-2xl transition-all duration-500"
                                        >
                                            <div className="aspect-square relative mb-6 grayscale group-hover:grayscale-0 transition-all">
                                                <img src={p.image_url || ''} alt={p.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-2">{t('needsWizard.matchScore', { score: p.matchScore })}</div>
                                            <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{p.name}</h4>
                                            <p className="text-xs text-slate-400 font-light">{p.brand}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => setState(prev => ({ ...prev, step: 1 }))} className="focus-ring px-10 py-5 rounded-2xl border border-slate-200 text-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">{t('needsWizard.restart')}</button>
                                <Link href={Routes.contact()} className="px-10 py-5 rounded-2xl bg-cyan-500 text-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20">{t('needsWizard.customOffer')}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EnhancedNeedsWizard
