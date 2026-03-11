import React from 'react'
import Link from 'next/link'

interface NavBrandProps {
    brandName: string
}

const NavBrand: React.FC<NavBrandProps> = ({ brandName }) => {
    return (
        <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 w-auto pr-3 sm:pr-4 lg:pr-5 transition-all duration-300"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-primary-navy to-secondary-blue text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.7)] px-3 py-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.75)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)] opacity-80" />
                <span className="relative block text-xs font-bold tracking-[0.22em]">VH</span>
            </div>

            <div className="min-w-0 pr-3 sm:pr-4 border-r border-slate-200/80">
                <div className="whitespace-nowrap text-[17px] font-semibold tracking-[0.08em] text-slate-900 group-hover:text-primary-navy transition-colors">
                    {brandName}
                </div>
            </div>
        </Link>
    )
}

export default NavBrand
