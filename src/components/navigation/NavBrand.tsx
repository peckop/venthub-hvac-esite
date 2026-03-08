import React from 'react'
import Link from 'next/link'

import { cn } from '../../lib/utils'
import type { NavigationMode } from '../../utils/navigationConfig'

interface NavBrandProps {
  mode: NavigationMode
  brandName: string
  tagline: string
}

const NavBrand: React.FC<NavBrandProps> = ({ mode, brandName, tagline }) => {
  const isCompact = mode === 'compact'

  return (
    <Link
      href="/"
      className={cn(
        'group flex shrink-0 items-center gap-3',
        isCompact ? 'min-w-[172px] pr-3' : 'min-w-[244px] pr-5 xl:pr-6'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-primary-navy to-secondary-blue text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.7)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.75)]',
          isCompact ? 'px-3 py-2' : 'px-3.5 py-3'
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)] opacity-80" />
        <span className={cn('relative block font-bold tracking-[0.22em]', isCompact ? 'text-xs' : 'text-sm')}>VH</span>
      </div>

      <div className="min-w-0 border-r border-slate-200/80 pr-3 sm:pr-4">
        <div
          className={cn(
            'truncate font-semibold tracking-[0.08em] text-slate-900 transition-colors duration-300 group-hover:text-primary-navy',
            isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          )}
        >
          {brandName}
        </div>
        {!isCompact && (
          <div className="hidden truncate text-[11px] font-medium uppercase tracking-[0.3em] text-steel-gray sm:block">
            {tagline}
          </div>
        )}
      </div>
    </Link>
  )
}

export default NavBrand
