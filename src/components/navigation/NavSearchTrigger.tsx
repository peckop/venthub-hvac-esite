import React from 'react'

import { cn } from '@/lib/utils'

interface NavSearchTriggerProps {
    label: string
    shortcutLabel: string
    ariaLabel: string
    onClick: () => void
}

const NavSearchTrigger: React.FC<NavSearchTriggerProps> = ({
    label,
    shortcutLabel,
    ariaLabel,
    onClick,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            className={cn(
                'group inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 text-steel-gray shadow-[0_14px_30px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-primary-navy/20 hover:bg-white hover:text-primary-navy hover:shadow-[0_18px_36px_-24px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2',
                'px-3 py-2.5 w-full' // Always use compact/action bar sizing
            )}
        >
            <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>

            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium hidden md:block">
                {label}
            </span>

            <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-steel-gray shadow-sm hidden lg:block">
                {shortcutLabel}
            </kbd>
        </button>
    )
}

export default NavSearchTrigger
