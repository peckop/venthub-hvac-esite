'use client'

import React from 'react'
import Link from 'next/link'
import { adminCardPaddedClass } from '../../../utils/adminUi'
import { formatCurrency } from '../../../i18n/format'

interface StatCardProps {
    title: string
    value: number | string | null
    loading: boolean
    isCurrency?: boolean
    lang?: string
    href?: string
    icon?: React.ReactNode
    trend?: { value: number; label?: string }
}

const StatCard: React.FC<StatCardProps> = ({ title, value, loading, isCurrency, lang = 'tr', href, icon, trend }) => {
    const displayValue = loading
        ? '…'
        : value == null
            ? '-'
            : isCurrency && typeof value === 'number'
                ? formatCurrency(value, lang as 'tr' | 'en')
                : value

    const content = (
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{title}</div>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{displayValue}</span>
                    {trend && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trend.value >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {trend.value >= 0 ? '+' : ''}{trend.value}%
                        </span>
                    )}
                </div>
            </div>
            {icon && (
                <div className="flex shrink-0 w-12 h-12 rounded-xl bg-slate-50 text-slate-400 items-center justify-center border border-slate-100/80 shadow-sm ml-4">
                    {icon}
                </div>
            )}
        </div>
    )

    const baseClass = `${adminCardPaddedClass} relative overflow-hidden group border-l-4 border-l-primary-navy/80`

    if (href) {
        return (
            <Link href={href} className={`${baseClass} block hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-navy/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                {content}
            </Link>
        )
    }

    return (
        <div className={baseClass}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/80 to-transparent rounded-full -mr-16 -mt-16"></div>
            {content}
        </div>
    )
}

export default StatCard
