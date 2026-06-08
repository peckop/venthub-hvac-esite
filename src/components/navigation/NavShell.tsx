import React from 'react'

import { cn } from '@/lib/utils'

interface NavShellProps {
    fixed?: boolean
    showProgress?: boolean
    progress?: number
    isScrollingDown?: boolean
    isAtTop?: boolean
    isAnyOverlayOpen?: boolean
    // children prop is separated into two tiers
    topTierChildren?: React.ReactNode
    bottomTierChildren: React.ReactNode
    onHoverStart?: () => void
    onHoverEnd?: () => void
}

const NavShell: React.FC<NavShellProps> = ({
    fixed = false,
    showProgress = false,
    progress = 0,
    isScrollingDown = false,
    isAtTop = true,
    isAnyOverlayOpen = false,
    topTierChildren,
    bottomTierChildren,
    onHoverStart,
    onHoverEnd,
}) => {
    // When scrolling down, we translate both headers UP by their total height so they hide.
    // The top tier is ~32px (h-8), the bottom tier is ~64px (h-16).
    // Let's use Tailwind's -translate-y-full and group them inside a container.

    return (
        <div
            className={cn(
                'transition-transform duration-hvac-slow ease-hvac-ease',
                fixed ? 'fixed inset-x-0 top-0 z-50' : 'relative z-40',
                isScrollingDown && !isAtTop ? '-translate-y-full' : 'translate-y-0'
            )}
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
        >
            {showProgress && (
                <div className="absolute inset-x-0 top-0 h-1 bg-slate-200/60 pointer-events-none z-dropdown">
                    <div
                        className="h-full bg-gradient-to-r from-primary-navy via-secondary-blue to-air-blue transition-colors duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Top Tier: The Corporate Bar */}
            <div
                className={cn(
                    'transition-colors duration-hvac-slow ease-hvac-ease bg-primary-navy text-white overflow-hidden',
                    // Hide the top tier if we are not at the top
                    !isAtTop ? 'h-0 opacity-0' : 'h-0 opacity-0 md:h-8 md:opacity-100 relative'
                )}
            >
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {topTierChildren}
                </div>
                {/* Backdrop dimming for top tier when mega menu or search is open */}
                <div className={cn("absolute inset-0 bg-black/40 transition-opacity duration-500 pointer-events-none", isAnyOverlayOpen ? "opacity-100" : "opacity-0")} />
            </div>

            {/* Bottom Tier: The Action Bar */}
            <header
                className={cn(
                    'transition-colors duration-hvac-slow ease-hvac-ease border-b border-slate-200/50',
                    'bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/85 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.15)]',
                    showProgress && 'pt-1'
                )}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-3">
                        {bottomTierChildren}
                    </div>
                </div>
            </header>
        </div>
    )
}

export default NavShell
