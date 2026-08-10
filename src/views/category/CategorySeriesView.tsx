'use client';
import { motion } from 'framer-motion'
import { Activity, LayoutGrid,Table as TableIcon, Wind, Zap } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import Breadcrumb from '@/components/navigation/Breadcrumb'
import ProductCard from '@/components/ProductCard'

import { useCart } from '../../hooks/useCartHook'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { DomainCategory, DomainProduct } from '../../lib/type-converters'
import { getLocalizedCategorySlug } from '../../utils/categoryHelpers'
import { isRecord } from '../../utils/type-converters'

interface CategorySeriesViewProps {
    category: DomainCategory
    parentCategory?: DomainCategory | null
    products: DomainProduct[]
}

const CategorySeriesView: React.FC<CategorySeriesViewProps> = ({
    category,
    parentCategory,
    products
}) => {
    const { lang, t } = useI18n()
    const { addToCart } = useCart()
    const Routes = useLocalizedRoutes()
    const { wrapCategory, groupProductsBySeries } = useCategoryViewModel()
    const [viewModes, setViewModes] = useState<Record<string, 'grid' | 'matrix'>>({})
    
    const vm = wrapCategory(category)
    const parentVm = wrapCategory(parentCategory)
    const seriesGroups = groupProductsBySeries(products)

    const toggleViewMode = (seriesName: string) => {
        setViewModes(prev => ({
            ...prev,
            [seriesName]: prev[seriesName] === 'matrix' ? 'grid' : 'matrix'
        }))
    }

    // Breadcrumb (VENTHUB SIGNATURE - FIXED LOCATION)
    const breadcrumbItems = [
        { label: t('category.breadcrumbHome'), href: '/' },
        ...(parentVm ? [{ label: parentVm.displayName, href: Routes.category(getLocalizedCategorySlug(parentVm.raw, lang)) }] : []),
        { label: vm?.displayName || category.name, href: '' }
    ]

    const heroImage = category.image_url || '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

    const getSpec = (p: DomainProduct, key: string) => {
        const specs = isRecord(p.technical_specs) ? p.technical_specs : {}
        const val = specs[key] || specs[key.toLowerCase()]
        return val ? String(val) : '-'
    }

    return (
        <div className="bg-white min-h-screen">
            {/* HERO SECTION - VENTHUB SIGNATURE (WHITE CLEAN) */}
            <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* FIXED BREADCRUMB - VENTHUB SIGNATURE */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-12"
                    >
                        <Breadcrumb items={breadcrumbItems} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-hvac-loose text-cyan-600">{t('category.series.technicalFamily')}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl lg:text-8xl font-extralight tracking-tighter text-slate-900 leading-hvac-11 mb-10"
                    >
                        {vm?.displayName?.split(' ').slice(0, -1).join(' ')} <span className="font-medium text-slate-950 italic">{vm?.displayName?.split(' ').slice(-1)}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed"
                    >
                        {vm?.description || t('category.series.heroDefaultDesc')}
                    </motion.p>
                </div>
            </section>

            {/* SERIES COLLECTIONS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-40">
                {seriesGroups.map((series, _idx) => {
                    const isMatrix = viewModes[series.name] === 'matrix'
                    return (
                        <section key={series.name} className="animate-fadeIn">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8 border-b border-slate-100 pb-10">
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="h-px w-12 bg-secondary-blue" />
                                        <span className="text-sm font-black text-secondary-blue uppercase tracking-hvac-relaxed">{t('category.series.seriesDetail')}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-industrial-gray mb-4 tracking-tighter">{t('category.series.seriesHeading', { name: series.name })}</h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                        {t('category.series.seriesConfigCount', { count: series.products.length })}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 shadow-inner">
                                        <button onClick={() => toggleViewMode(series.name)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-colors ${!isMatrix ? 'bg-white text-primary-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /> <span>{t('category.series.showcaseView')}</span></button>
                                        <button onClick={() => toggleViewMode(series.name)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-colors ${isMatrix ? 'bg-white text-primary-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><TableIcon size={16} /> <span>{t('category.series.matrixView')}</span></button>
                                    </div>
                                    <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('category.series.startingFrom')}</p>
                                        <p className="text-xl font-black">{series.minPrice !== Infinity ? formatCurrency(series.minPrice, lang) : t('category.series.requestQuote')}</p>
                                    </div>
                                </div>
                            </div>

                            {!isMatrix ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {series.products.map((product) => <ProductCard key={product.id} product={product} layout="grid" />)}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-hvac-2xl border border-slate-100 shadow-2xl bg-white">
                                    <table className="w-full text-left border-collapse min-w-1000px">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colModel')}</th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colAirflow')}</th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colNoise')}</th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colPower')}</th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colPrice')}</th>
                                                <th className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">{t('category.series.colAction')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {series.products.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6 flex items-center gap-4">
                                                        <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0"><Image src={p.image_url || heroImage} alt={p.name} fill className="object-contain p-1" /></div>
                                                        <div><p className="text-sm font-black text-industrial-gray uppercase tracking-tight">{p.name}</p><p className="text-xs font-bold text-slate-400">{t('category.series.skuLabel', { sku: p.sku })}</p></div>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'airflow_capacity') || getSpec(p, 'debi')}</td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'noise_level') || getSpec(p, 'ses')}</td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'power_consumption') || getSpec(p, 'guc')}</td>
                                                    <td className="px-6 py-6"><span className="text-sm font-black text-primary-navy">{formatCurrency(p.price, lang)}</span></td>
                                                    <td className="px-8 py-6 text-right"><button onClick={() => addToCart(p, 1)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg shadow-slate-900/10">{t('common.addToCart')}</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )
                })}
            </div>

            {/* TRUST STRIP */}
            <div className="bg-slate-950 py-32 text-white overflow-hidden relative">
                <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-16 text-center">
                        <div className="space-y-6"><Activity className="mx-auto text-cyan-400" size={40} /><h4 className="text-xl font-bold">{t('category.series.trust1Title')}</h4><p className="text-slate-400 font-light">{t('category.series.trust1Desc')}</p></div>
                        <div className="space-y-6"><Wind className="mx-auto text-cyan-400" size={40} /><h4 className="text-xl font-bold">{t('category.series.trust2Title')}</h4><p className="text-slate-400 font-light">{t('category.series.trust2Desc')}</p></div>
                        <div className="space-y-6"><Zap className="mx-auto text-cyan-400" size={40} /><h4 className="text-xl font-bold">{t('category.series.trust3Title')}</h4><p className="text-slate-400 font-light">{t('category.series.trust3Desc')}</p></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategorySeriesView
