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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, loading, isCurrency, lang = 'tr', href }) => {
    const displayValue = loading
        ? '…'
        : value == null
            ? '-'
            : isCurrency && typeof value === 'number'
                ? formatCurrency(value, lang as 'tr' | 'en')
                : value

    const content = (
        <>
            <div className="text-xs text-industrial-gray font-medium uppercase tracking-wide">{title}</div>
            <div className="text-2xl font-bold text-primary-navy mt-1">{displayValue}</div>
        </>
    )

    if (href) {
        return (
            <Link href={href} className={`${adminCardPaddedClass} block hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                {content}
            </Link>
        )
    }

    return (
        <div className={adminCardPaddedClass}>
            {content}
        </div>
    )
}

export default StatCard
