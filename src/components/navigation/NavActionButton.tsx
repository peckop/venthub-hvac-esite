import React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type NavActionTone = 'default' | 'accent' | 'success' | 'warning'

interface NavActionButtonProps {
    icon: React.ReactNode
    label?: React.ReactNode
    href?: string
    onClick?: () => void
    ariaLabel: string
    title?: string
    badge?: React.ReactNode
    tone?: NavActionTone
    className?: string
    iconClassName?: string
    labelClassName?: string
}

const toneClasses: Record<NavActionTone, string> = {
    default: 'text-steel-gray hover:text-primary-navy hover:bg-air-blue/30',
    accent: 'text-steel-gray hover:text-primary-navy hover:bg-primary-navy/10',
    success: 'text-steel-gray hover:text-success-green hover:bg-success-green/10',
    warning: 'text-steel-gray hover:text-warning-orange hover:bg-warning-orange/12',
}

const NavActionButton: React.FC<NavActionButtonProps> = ({
    icon,
    label,
    href,
    onClick,
    ariaLabel,
    title,
    badge,
    tone = 'default',
    className,
    iconClassName,
    labelClassName,
}) => {
    const content = (
        <>
            <span className={cn('relative shrink-0 transition-transform duration-300 group-hover:scale-105', iconClassName)}>
                {icon}
                {badge}
            </span>
            {label && (
                <span
                    className={cn(
                        'min-w-0 truncate text-sm font-semibold transition-colors',
                        labelClassName
                    )}
                >
                    {label}
                </span>
            )}
        </>
    )

    const classes = cn(
        'group relative inline-flex items-center gap-2 rounded-2xl border border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2',
        'px-3 py-2.5', // Using compact sizing as default for the Action Bar
        toneClasses[tone],
        className
    )

    if (href) {
        return (
            <Link href={href as import('next').Route} aria-label={ariaLabel} title={title} className={classes}>
                {content}
            </Link>
        )
    }

    return (
        <button type="button" onClick={onClick} aria-label={ariaLabel} title={title} className={classes}>
            {content}
        </button>
    )
}

export default NavActionButton
