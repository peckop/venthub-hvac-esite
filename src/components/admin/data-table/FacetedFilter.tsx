'use client'

import * as Popover from '@radix-ui/react-popover'
import { Check, Filter, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { adminButtonSecondaryClass } from '../../../utils/adminUi'
import type { DataTableFacet } from './types'

export interface FacetedFilterProps {
  facet: DataTableFacet
  selected: string[]
  onChange: (next: string[]) => void
  clearLabel: string
}

export function FacetedFilter({ facet, selected, onChange, clearLabel }: FacetedFilterProps): ReactNode {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={adminButtonSecondaryClass + ' h-12 flex items-center gap-2 px-5'}
          aria-label={facet.label}
        >
          <Filter size={16} className="text-cyan-400" />
          <span className="truncate">{facet.label}</span>
          {selected.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-cyan-400 text-surface-deep text-xs font-black tabular-nums">
              {selected.length}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="min-w-240px glass-strong rounded-3xl border border-white/10 p-2 shadow-elevation-4 animate-in fade-in zoom-in-95 duration-200 z-modal"
          align="start"
          sideOffset={8}
        >
          <div className="px-4 pt-3 pb-2 text-xs font-black uppercase tracking-hvac-normal text-slate-500 border-b border-white/5 mb-2 flex items-center gap-2">
            <Filter size={12} />
            {facet.label}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-300px custom-scrollbar px-1">
            {facet.options.map((option) => {
              const checked = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  aria-label={option.label}
                  aria-pressed={checked}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${checked ? 'text-cyan-400' : 'text-slate-300'}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-4 h-4 rounded-md border transition-colors flex items-center justify-center ${checked ? 'bg-cyan-400 border-cyan-400 shadow-glow-sm' : 'border-white/10 bg-white/5'}`}
                    >
                      {checked && <Check size={10} className="text-surface-deep stroke-4" />}
                    </span>
                    {option.label}
                  </span>
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/5 text-slate-400 text-xs font-black tabular-nums group-hover:bg-white/10">
                    {option.count}
                  </span>
                </button>
              )
            })}
          </div>

          {selected.length > 0 && (
            <>
              <div className="my-3 h-px bg-white/5" />
              <button
                type="button"
                onClick={() => onChange([])}
                aria-label={clearLabel}
                className="group w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-black uppercase tracking-hvac-normal text-slate-400 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/10"
              >
                <X size={12} />
                {clearLabel}
              </button>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default FacetedFilter
