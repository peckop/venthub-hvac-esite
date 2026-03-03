'use client'

import React from 'react'
import Link from 'next/link'
import { adminCardPaddedClass } from '../../../utils/adminUi'
import { formatCurrency } from '../../../i18n/format'

interface StatCardProps {
    title: string
    subtitle?: string
    value: number | string | null
    loading: boolean
    isCurrency?: boolean
    lang?: string
    href?: string
    icon?: React.ReactNode
    trend?: { value: number; label?: string }
    accent?: 'navy' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    subtitle,
    value,
    loading,
    isCurrency,
    lang = 'tr',
    href,
    icon,
    trend,
    accent = 'navy'
}) => {
    const accents = {
        navy: { border: 'border-l-primary-navy/80', iconBg: 'bg-primary-navy/5 text-primary-navy', gradient: 'from-primary-navy/5' },
        emerald: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50 text-emerald-600', gradient: 'from-emerald-500/5' },
        amber: { border: 'border-l-amber-500', iconBg: 'bg-amber-50 text-amber-600', gradient: 'from-amber-500/5' },
        rose: { border: 'border-l-rose-500', iconBg: 'bg-rose-50 text-rose-600', gradient: 'from-rose-500/5' },
        violet: { border: 'border-l-violet-500', iconBg: 'bg-violet-50 text-violet-600', gradient: 'from-violet-500/5' },
        sky: { border: 'border-l-sky-500', iconBg: 'bg-sky-50 text-sky-600', gradient: 'from-sky-500/5' },
        orange: { border: 'border-l-orange-500', iconBg: 'bg-orange-50 text-orange-600', gradient: 'from-orange-500/5' }
    }

    const currentAccent = accents[accent]

    const displayValue = loading
        ? '…'
        : value == null
            ? '-'
            : isCurrency && typeof value === 'number'
                ? formatCurrency(value, lang as 'tr' | 'en')
                : value

    const content = (
        <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1 truncate" title={title}>
                    {title}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                        className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight transition-all group-hover:text-primary-navy truncate"
                        title={typeof displayValue === 'string' ? displayValue : undefined}
                    >
                        {displayValue}
                    </span>
                    {trend && !loading && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ${trend.value >= 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
                            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>
                {subtitle && !loading && (
                    <div className="mt-1 text-[10px] font-medium text-slate-400 italic truncate">
                        {subtitle}
                    </div>
                )}
            </div>
            {icon && (
                <div className={`flex shrink-0 w-11 h-11 rounded-xl ${currentAccent.iconBg} items-center justify-center border border-white shadow-sm ml-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                </div>
            )}
        </div>
    )

    const baseClass = `${adminCardPaddedClass} !p-5 relative overflow-hidden group border-l-4 ${currentAccent.border} transition-all duration-300`

    if (href) {
        return (
            <Link href={href} className={`${baseClass} block hover:shadow-xl hover:-translate-y-1 bg-white hover:bg-slate-50/50`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentAccent.gradient} to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 opacity-60`}></div>
                {content}
            </Link>
        )
    }

    return (
        <div className={`${baseClass} bg-white`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentAccent.gradient} to-transparent rounded-full -mr-16 -mt-16 opacity-40`}></div>
            {content}
        </div>
    )
}

export default StatCard
