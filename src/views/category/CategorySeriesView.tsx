'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import { DomainCategory, DomainProduct } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { Layers, Activity, Wind, Volume2, Zap, ShoppingCart, Table as TableIcon, LayoutGrid } from 'lucide-react'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { useCart } from '../../hooks/useCartHook'

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
    const { lang } = useI18n()
    const { addToCart } = useCart()
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

    const breadcrumbItems = [
        { label: 'Ana Sayfa', href: '/' },
        ...(parentVm ? [{ label: parentVm.displayName, href: `/category/${parentVm.slug}` }] : []),
        { label: vm?.displayName || category.name, href: '' }
    ]

    const heroImage = category.image_url || '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

    // Yardımcı: Teknik veri çekme
    const getSpec = (p: DomainProduct, key: string) => {
        const specs = (p.technical_specs as unknown as Record<string, string>) || {}
        return specs[key] || specs[key.toLowerCase()] || '-'
    }

    return (
        <div className="bg-white min-h-screen">
            {/* MAXIMUM HERO - PREMIUM WHITE */}
            <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fadeIn">
                            <Breadcrumb items={breadcrumbItems} className="mb-10" />
                            <div className="flex items-center gap-3 mb-6 text-primary-navy font-bold text-sm tracking-widest uppercase bg-primary-navy/5 w-fit px-4 py-2 rounded-full border border-primary-navy/10">
                                <Layers size={16} />
                                <span>Premium Ürün Katalogu</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-industrial-gray mb-8 leading-[1.1] tracking-tight">
                                {vm?.displayName}
                            </h1>
                            <p className="text-xl text-steel-gray max-w-xl leading-relaxed font-medium">
                                {vm?.description || 'Teknik verimlilik ve estetik tasarımın buluştuğu profesyonel serileri inceleyin.'}
                            </p>
                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-slate-100 pt-10">
                                <div><p className="text-2xl font-black text-primary-navy">{seriesGroups.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Koleksiyon</p></div>
                                <div><p className="text-2xl font-black text-primary-navy">{products.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teknik Model</p></div>
                                <div className="hidden sm:block"><p className="text-2xl font-black text-secondary-blue">100%</p><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orijinal</p></div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-secondary-blue/5 rounded-full blur-3xl" />
                            <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white group">
                                <Image src={heroImage} alt={vm?.displayName || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-[2s]" priority />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SERIES COLLECTIONS - WITH MATRIX CAPABILITY */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-40">
                {seriesGroups.map((series, _idx) => {
                    const isMatrix = viewModes[series.name] === 'matrix'
                    return (
                        <section key={series.name} className="animate-fadeInScroll">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8 border-b border-slate-100 pb-10">
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="h-px w-12 bg-secondary-blue" />
                                        <span className="text-sm font-black text-secondary-blue uppercase tracking-[0.3em]">Seri İncelemesi</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-industrial-gray mb-4 tracking-tighter">{series.name} SERİSİ</h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                        {series.name} ailesi, enerji verimliliği ve akustik konfor odaklı {series.products.length} farklı teknik konfigürasyon sunar.
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    {/* VIEW SWITCHER */}
                                    <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 shadow-inner">
                                        <button 
                                            onClick={() => toggleViewMode(series.name)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${!isMatrix ? 'bg-white text-primary-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <LayoutGrid size={16} /> <span>VİTRİN</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleViewMode(series.name)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${isMatrix ? 'bg-white text-primary-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <TableIcon size={16} /> <span>MATRİS</span>
                                        </button>
                                    </div>
                                    <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Başlangıç</p>
                                        <p className="text-xl font-black">{series.minPrice !== Infinity ? formatCurrency(series.minPrice, lang) : 'Teklif Alın'}</p>
                                    </div>
                                </div>
                            </div>

                            {!isMatrix ? (
                                /* GRID VIEW - VISUAL FOCUS */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {series.products.map((product) => (
                                        <ProductCard key={product.id} product={product} layout="grid" />
                                    ))}
                                </div>
                            ) : (
                                /* MATRIX VIEW - TECHNICAL FOCUS */
                                <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-500">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Model Bilgisi</th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><Wind size={14} className="text-secondary-blue" /> Debi (m³/h)</div></th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><Volume2 size={14} className="text-secondary-blue" /> Ses (dB)</div></th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><Zap size={14} className="text-secondary-blue" /> Güç (W)</div></th>
                                                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Liste Fiyatı</th>
                                                <th className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {series.products.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                                                <Image src={p.image_url || heroImage} alt={p.name} fill className="object-contain p-1" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-industrial-gray uppercase tracking-tight">{p.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {p.sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'airflow_capacity') || getSpec(p, 'debi')}</td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'noise_level') || getSpec(p, 'ses')}</td>
                                                    <td className="px-6 py-6 font-bold text-industrial-gray">{getSpec(p, 'power_consumption') || getSpec(p, 'guc')}</td>
                                                    <td className="px-6 py-6">
                                                        <span className="text-sm font-black text-primary-navy">{formatCurrency(p.price, lang)}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button 
                                                            onClick={() => addToCart(p, 1)}
                                                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-primary-navy text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                                        >
                                                            <ShoppingCart size={14} />
                                                            <span>EKLE</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )
                })}

                {seriesGroups.length === 0 && (
                    <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Layers className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-industrial-gray mb-2">Seri Detayları Hazırlanıyor</h3>
                        <p className="text-slate-400 max-w-xs mx-auto">Bu kategorideki teknik karşılaştırma matrisi yakında aktif edilecektir.</p>
                    </div>
                )}
            </div>

            {/* BOTTOM TRUST STRIP */}
            <div className="bg-slate-950 py-20 text-white overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-secondary-blue/50 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <Activity className="mx-auto text-secondary-blue" size={32} />
                            <h4 className="text-lg font-bold">Gerçek Performans Verisi</h4>
                            <p className="text-slate-400 text-sm">Tüm veriler fabrikasyon test raporlarına dayanır.</p>
                        </div>
                        <div className="space-y-4">
                            <Wind className="mx-auto text-secondary-blue" size={32} />
                            <h4 className="text-lg font-bold">Hassas Boyutlandırma</h4>
                            <p className="text-slate-400 text-sm">Projeniz için en doğru kapasite eşleşmesi.</p>
                        </div>
                        <div className="space-y-4">
                            <Zap className="mx-auto text-secondary-blue" size={32} />
                            <h4 className="text-lg font-bold">Hızlı Teknik Destek</h4>
                            <p className="text-slate-400 text-sm">Mühendis ekibimizden anlık döküman desteği.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategorySeriesView
