import React from 'react'

import { cn } from '@/lib/utils'
import type { NavigationMode } from '@/utils/navigationConfig'

interface NavUtilityRailProps {
    mode: NavigationMode
    children: React.ReactNode
}

const NavUtilityRail: React.FC<NavUtilityRailProps> = ({ mode, children }) => {
    return (
        <div
            className={cn(
                'ml-auto flex items-center justify-end rounded-[1.4rem] transition-all duration-500 ease-in-out border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-[0_14px_30px_-26px_rgba(15,23,42,0.45)]',
                mode === 'compact' ? 'gap-1 p-1' : 'gap-1.5 p-1.5 sm:p-2'
            )}
        >
            {children}
        </div>
    )
}

export default NavUtilityRail
