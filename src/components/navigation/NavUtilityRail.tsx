import React from 'react'

interface NavUtilityRailProps {
    children: React.ReactNode
}

const NavUtilityRail: React.FC<NavUtilityRailProps> = ({ children }) => {
    return (
        <div className="ml-auto flex items-center justify-end rounded-hvac-lg transition-colors duration-500 ease-in-out border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-hvac-nav-rail gap-1 p-1 sm:gap-1.5 sm:p-1.5">
            {children}
        </div>
    )
}

export default NavUtilityRail
