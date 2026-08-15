'use client'

import Link from 'next/link'
import React from 'react'

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
            border: 'border-admin-accent/30', 
            accent: 'bg-admin-accent',
            iconBg: 'bg-admin-accent-weak text-admin-accent', 
            glow: '',
            text: 'text-admin-accent'
        },
        emerald: { 
            border: 'border-admin-success/30', 
            accent: 'bg-admin-success',
            iconBg: 'bg-admin-success-weak text-admin-success', 
            glow: '',
            text: 'text-admin-success'
        },
        amber: { 
            border: 'border-admin-warning/30', 
            accent: 'bg-admin-warning',
            iconBg: 'bg-admin-warning-weak text-admin-warning', 
            glow: '',
            text: 'text-admin-warning'
        },
        rose: { 
            border: 'border-admin-danger/30', 
            accent: 'bg-admin-danger',
            iconBg: 'bg-admin-danger-weak text-admin-danger', 
            glow: '',
            text: 'text-admin-danger'
        },
        violet: { 
            border: 'border-admin-accent/30', 
            accent: 'bg-admin-accent',
            iconBg: 'bg-admin-accent-weak text-admin-accent', 
            glow: '',
            text: 'text-admin-accent'
        },
        sky: { 
            border: 'border-admin-accent/30', 
            accent: 'bg-admin-accent',
            iconBg: 'bg-admin-accent-weak text-admin-accent', 
            glow: '',
            text: 'text-admin-accent'
        },
        orange: { 
            border: 'border-admin-warning/30', 
            accent: 'bg-admin-warning',
            iconBg: 'bg-admin-warning-weak text-admin-warning', 
            glow: '',
            text: 'text-admin-warning'
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
                <div className="text-xs font-semibold text-admin-fg-muted leading-tight mb-4 truncate group-hover:text-admin-fg-muted transition-colors" title={title}>
                    {title}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                        className="text-3xl lg:text-4xl font-semibold text-admin-fg tracking-tighter transition-transform duration-500 group-hover:scale-105 origin-left truncate"
                        title={typeof displayValue === 'string' ? displayValue : undefined}
                    >
                        {displayValue}
                    </span>
                    {trend && !loading && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset inline-flex items-center gap-0.5 ${trend.value >= 0 ? 'bg-admin-success-weak text-admin-success ring-admin-success/30' : 'bg-admin-danger-weak text-admin-danger ring-admin-danger/30'}`}>
                            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>
                {subtitle && !loading && (
                    <div className="mt-2 text-xs font-semibold text-admin-fg-muted truncate opacity-50 italic">
                        {subtitle}
                    </div>
                )}
            </div>
            {icon && (
                <div className={`flex shrink-0 w-14 h-14 rounded-admin-lg ${currentAccent.iconBg} items-center justify-center border border-admin-border shadow-admin-lg ml-auto transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-hvac-stat-card-hover`}>
                    {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 24, strokeWidth: 2.5 })}
                </div>
            )}
        </div>
    )

    const baseClass = `bg-admin-surface !p-8 relative overflow-hidden group transition-colors duration-500 shadow-admin-lg border ${currentAccent.border} hover:border-admin-border`

    if (href) {
        return (
            <Link href={href as import('next').Route} className={`${baseClass} block hover:-translate-y-2`}>
                <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full transition-transform duration-1000 group-hover:scale-150 opacity-20`}></div>
                <div className={`absolute bottom-0 left-0 w-full h-1 ${currentAccent.accent} scale-x-0 transition-transform origin-left duration-700 group-hover:scale-x-100`}></div>
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
