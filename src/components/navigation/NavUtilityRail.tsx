import React from 'react'

import { cn } from '../../lib/utils'
import type { NavigationMode } from '../../utils/navigationConfig'

interface NavUtilityRailProps {
  mode: NavigationMode
  children: React.ReactNode
}

const NavUtilityRail: React.FC<NavUtilityRailProps> = ({ mode, children }) => {
  return (
    <div
      className={cn(
        'ml-auto flex items-center justify-end rounded-[1.4rem] border border-slate-200/70 bg-white/75 backdrop-blur-md shadow-[0_18px_36px_-28px_rgba(15,23,42,0.32)]',
        mode === 'compact' ? 'gap-1 p-1.5' : 'gap-1.5 p-2'
      )}
    >
      {children}
    </div>
  )
}

export default NavUtilityRail
