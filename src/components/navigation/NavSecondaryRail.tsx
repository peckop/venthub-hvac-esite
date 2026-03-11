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

const NavSecondaryRail: React.FC<NavSecondaryRailProps> = ({ items }) => {
    return (
        <div className="flex items-center gap-6 text-[13px] font-medium tracking-wide">
            {items.map((item) => (
                <Link
                    key={item.id}
                    href={item.href || '#'}
                    className="text-white/80 transition-colors duration-200 hover:text-white"
                >
                    {item.label}
                </Link>
            ))}
        </div>
    )
}

export default NavSecondaryRail
