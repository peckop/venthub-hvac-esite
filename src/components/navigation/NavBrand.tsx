import Link from 'next/link'
import React from 'react'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes';


interface NavBrandProps {
    brandName: string
}

const NavBrand: React.FC<NavBrandProps> = React.memo(({ brandName }) => {
    const Routes = useLocalizedRoutes()
    return (
        <Link
            href={Routes.home()}
            className="group flex shrink-0 items-center gap-3 w-auto pr-3 sm:pr-4 lg:pr-5 transition-colors duration-300"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-primary-navy to-secondary-blue text-white shadow-elevation-3 px-3 py-2 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-elevation-4">
                <div className="absolute inset-0 bg-nav-brand-radial opacity-80" />
                <span className="relative block text-xs font-bold tracking-hvac-22">VH</span>
            </div>

            <div className="min-w-0 pr-3 sm:pr-4 border-r border-slate-200/80">
                <div className="whitespace-nowrap text-lg font-semibold tracking-hvac-08 text-slate-900 group-hover:text-primary-navy transition-colors">
                    {brandName}
                </div>
            </div>
        </Link>
    )
})

NavBrand.displayName = 'NavBrand';

export default NavBrand
