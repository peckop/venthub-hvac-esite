/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react'
import Link from 'next/link'
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
        navy: { 
            border: 'border-cyan-500/20', 
            accent: 'bg-cyan-500',
            iconBg: 'bg-cyan-500/10 text-cyan-400', 
            glow: 'shadow-[0_0_20px_rgba(34,211,238,0.1)]',
            text: 'text-cyan-400'
        },
        emerald: { 
            border: 'border-emerald-500/20', 
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-500/10 text-emerald-400', 
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
            text: 'text-emerald-400'
        },
        amber: { 
            border: 'border-amber-500/20', 
            accent: 'bg-amber-500',
            iconBg: 'bg-amber-400/10 text-amber-400', 
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
            text: 'text-amber-400'
        },
        rose: { 
            border: 'border-rose-500/20', 
            accent: 'bg-rose-500',
            iconBg: 'bg-rose-400/10 text-rose-400', 
            glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
            text: 'text-rose-400'
        },
        violet: { 
            border: 'border-violet-500/20', 
            accent: 'bg-violet-500',
            iconBg: 'bg-violet-400/10 text-violet-400', 
            glow: 'shadow-[0_0_20px_rgba(139,92,246,0.1)]',
            text: 'text-violet-400'
        },
        sky: { 
            border: 'border-sky-500/20', 
            accent: 'bg-sky-500',
            iconBg: 'bg-sky-400/10 text-sky-400', 
            glow: 'shadow-[0_0_20px_rgba(14,165,233,0.1)]',
            text: 'text-sky-400'
        },
        orange: { 
            border: 'border-orange-500/20', 
            accent: 'bg-orange-500',
            iconBg: 'bg-orange-400/10 text-orange-400', 
            glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
            text: 'text-orange-400'
        }
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
        <div className="flex items-start justify-between relative z-10 h-full">
            <div className="flex-1 min-w-0 pr-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight mb-4 truncate group-hover:text-slate-400 transition-colors" title={title}>
                    {title}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                        className="text-3xl lg:text-4xl font-black text-white tracking-tighter transition-all duration-500 group-hover:scale-105 origin-left truncate"
                        title={typeof displayValue === 'string' ? displayValue : undefined}
                    >
                        {displayValue}
                    </span>
                    {trend && !loading && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ring-1 ring-inset inline-flex items-center gap-0.5 ${trend.value >= 0 ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-rose-400/10 text-rose-400 ring-rose-400/20'}`}>
                            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>
                {subtitle && !loading && (
                    <div className="mt-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] truncate opacity-50 italic">
                        {subtitle}
                    </div>
                )}
            </div>
            {icon && (
                <div className={`flex shrink-0 w-14 h-14 rounded-2xl ${currentAccent.iconBg} items-center justify-center border border-white/5 shadow-2xl ml-auto transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                    {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
                </div>
            )}
        </div>
    )

    const baseClass = `glass-strong !p-8 relative overflow-hidden group transition-all duration-500 shadow-2xl border ${currentAccent.border} hover:border-white/20`

    if (href) {
        return (
            <Link href={href} className={`${baseClass} block hover:-translate-y-2`}>
                <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full transition-transform duration-1000 group-hover:scale-150 opacity-20`}></div>
                <div className={`absolute bottom-0 left-0 w-full h-1 ${currentAccent.accent} scale-x-0 transition-transform origin-left duration-700 group-hover:scale-x-100 shadow-[0_0_15px_rgba(34,211,238,0.5)]`}></div>
                {content}
            </Link>
        )
    }

    return (
        <div className={`${baseClass} h-full`}>
            <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-10`}></div>
            {content}
        </div>
    )
}

export default StatCard
