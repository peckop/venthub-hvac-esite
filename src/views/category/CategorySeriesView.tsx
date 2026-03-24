'use client';

import React from 'react'
import Image from 'next/image'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import ProductCard from '@/components/ProductCard'
import { DomainCategory, DomainProduct } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'


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
    const { wrapCategory } = useCategoryViewModel()
    const vm = wrapCategory(category)
    const parentVm = wrapCategory(parentCategory)

    // Breadcrumb Items
    const breadcrumbItems = [
        { label: 'Ana Sayfa', href: '/' },
        ...(parentVm ? [{ label: parentVm.displayName, href: `/category/${parentVm.slug}` }] : []),
        { label: vm?.displayName || category.name, href: '' }
    ]

    const heroImage = category.image_url || '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

    return (
        <div className="bg-white min-h-screen">
            {/* WHITE CLEAN HERO */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeIn">
                            <Breadcrumb items={breadcrumbItems} className="mb-8" />
                            <h1 className="text-4xl md:text-5xl font-black text-industrial-gray mb-6 leading-tight uppercase">
                                {vm?.displayName}
                            </h1>
                            <p className="text-lg text-steel-gray max-w-xl leading-relaxed">
                                {vm?.description || 'Yüksek performanslı havalandırma serilerini teknik detaylarıyla inceleyin.'}
                            </p>
                            <div className="mt-8 flex items-center gap-4 text-sm font-bold text-primary-navy">
                                <span className="bg-primary-navy/5 px-4 py-2 rounded-full border border-primary-navy/10">
                                    {products.length} Profesyonel Model
                                </span>
                            </div>
                        </div>
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group">
                            <Image
                                src={heroImage}
                                alt={vm?.displayName || ''}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            layout="grid" 
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Bu kategoride henüz ürün bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategorySeriesView
