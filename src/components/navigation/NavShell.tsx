import React from 'react'

import { cn } from '@/lib/utils'
import { NAVIGATION_HEIGHT_CLASSES, type NavigationMode } from '@/utils/navigationConfig'

interface NavShellProps {
    mode: NavigationMode
    fixed?: boolean
    showProgress?: boolean
    progress?: number
    children: React.ReactNode
}

const NavShell: React.FC<NavShellProps> = ({
    mode,
    fixed = false,
    showProgress = false,
    progress = 0,
    children,
}) => {
    return (
        <div
            className={cn(
                'transition-all duration-500 ease-in-out',
                fixed ? 'fixed inset-x-0 top-0 z-50' : 'relative z-40'
            )}
        >
            {showProgress && (
                <div className="absolute inset-x-0 top-0 h-1 bg-slate-200/60 pointer-events-none">
                    <div
                        className="h-full bg-gradient-to-r from-primary-navy via-secondary-blue to-air-blue transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <header
                className={cn(
                    'transition-all duration-500 ease-in-out border-b',
                    mode === 'compact'
                        ? 'border-slate-200/50 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 shadow-[0_24px_48px_-26px_rgba(15,23,42,0.34)]'
                        : 'border-transparent bg-white/95 backdrop-blur-md shadow-[0_18px_45px_-28px_rgba(15,23,42,0.15)]',
                    showProgress && 'pt-1' // Progress bar için ekstra boşluk
                )}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className={cn('flex items-center justify-between gap-3', NAVIGATION_HEIGHT_CLASSES[mode])}>
                        {children}
                    </div>
                </div>
            </header>
        </div>
    )
}

export default NavShell
