'use client';
import { motion } from 'framer-motion'
import { Activity, Wind, Zap } from 'lucide-react'
import React from 'react'

import Breadcrumb from '@/components/navigation/Breadcrumb'
import FamilyCard from '@/components/products/FamilyCard'
import type { FamilyListItem } from '@/types/ui-models'

import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import { DomainCategory } from '../../lib/type-converters'
import { getLocalizedCategorySlug } from '../../utils/categoryHelpers'

interface CategorySeriesViewProps {
    category: DomainCategory
    parentCategory?: DomainCategory | null
    /** F5-B W2.1: seri grupları kalktı — liste doğrudan AİLE satırlarıdır. */
    families: FamilyListItem[]
}

/**
 * F5-B W2.1 notu: `groupProductsBySeries` heuristiği (name.split(' ')[0]) ve
 * seri-matris tablosu SİLİNDİ. Aile gerçeği artık DB'den gelir (product_families);
 * varyant karşılaştırma matrisi PDP'ye taşınır (W2.2).
 */
const CategorySeriesView: React.FC<CategorySeriesViewProps> = ({
    category,
    parentCategory,
    families
}) => {
    const { lang, t } = useI18n()
    const Routes = useLocalizedRoutes()
    const { wrapCategory } = useCategoryViewModel()

    const vm = wrapCategory(category)
    const parentVm = wrapCategory(parentCategory)

    // Breadcrumb (VENTHUB SIGNATURE - FIXED LOCATION)
    const breadcrumbItems = [
        { label: t('category.breadcrumbHome'), href: '/' },
        ...(parentVm ? [{ label: parentVm.displayName, href: Routes.category(getLocalizedCategorySlug(parentVm.raw, lang)) }] : []),
        { label: vm?.displayName || category.name, href: '' }
    ]

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

            {/* AİLE LİSTESİ — her kart bir ürün ailesi (varyantlar PDP'de) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8 border-b border-slate-100 pb-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px w-12 bg-secondary-blue" />
                            <span className="text-sm font-black text-secondary-blue uppercase tracking-hvac-relaxed">{t('category.series.seriesDetail')}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-industrial-gray mb-4 tracking-tighter">{vm?.displayName || category.name}</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            {t('category.family.count', { count: families.length })}
                        </p>
                    </div>
                </div>

                {families.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-hvac-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">{t('category.noProductsFound')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 content-auto">
                        {families.map((family) => <FamilyCard key={family.id} family={family} layout="grid" />)}
                    </div>
                )}
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
