import React from 'react'
import Link from 'next/link'

interface ResolvedNavigationItem {
    id: string
    label: string
    href?: string
}

interface NavSecondaryRailProps {
    items: ResolvedNavigationItem[]
}

const getIconForId = (id: string) => {
    switch (id) {
        case 'brands':
            return (
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        case 'knowledgeHub':
            return (
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        case 'about':
            return (
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        case 'contact':
            return (
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        case 'account':
            return (
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        default:
            return null
    }
}

const NavSecondaryRail: React.FC<NavSecondaryRailProps> = ({ items }) => {
    // Separate left-aligned corporate links from right-aligned profile link
    const leftItems = items.filter(item => item.id !== 'account')
    const rightItems = items.filter(item => item.id === 'account')

    return (
        <div className="flex w-full items-center justify-between text-[13px] font-medium tracking-wide">
            {/* Left side: Corporate Links */}
            <div className="flex items-center gap-6">
                {leftItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href || '#'}
                        className="group flex items-center gap-2 text-white/80 transition-colors duration-200 hover:text-white"
                    >
                        {getIconForId(item.id)}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Right side: Profile / Account Link */}
            <div className="flex items-center gap-6">
                {rightItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href || '#'}
                        className="group flex items-center gap-2 text-white/90 transition-all duration-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg"
                    >
                        {getIconForId(item.id)}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default React.memo(NavSecondaryRail)
