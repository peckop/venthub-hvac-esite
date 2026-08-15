import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, Layout, Maximize2,Settings2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { Density } from '../../types/admin-shared'
import { adminButtonSecondaryClass } from '../../utils/adminUi'

export type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
export type { Density }

const ColumnsMenu: React.FC<{
  columns: ColumnToggle[]
  density: Density
  onDensityChange: (d: Density) => void
  buttonLabel?: string
}> = ({ columns, density, onDensityChange, buttonLabel }) => {
  const { t: _t } = useI18n()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className={adminButtonSecondaryClass + " h-12 flex items-center gap-2 px-5 min-w-140px"}
          aria-label={_t('admin.a11y.menu')}
        >
          <Settings2 size={16} className="text-admin-accent" />
          <span className="truncate">{buttonLabel || _t('admin.common.view')}</span>
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-240px bg-admin-surface rounded-admin-lg border border-admin-border p-2 shadow-elevation-4 animate-in fade-in zoom-in-95 duration-200 z-modal"
          align="end"
          sideOffset={8}
        >
          <div className="px-4 pt-3 pb-2 text-xs font-semibold text-admin-fg-muted border-b border-admin-border mb-2 flex items-center gap-2">
            <Layout size={12} />
            {_t('admin.dataTable.columns.title')}
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-300px custom-scrollbar px-1">
            {columns.map(col => (
              <DropdownMenu.CheckboxItem
                key={col.key}
                checked={col.checked}
                onCheckedChange={(v) => col.onChange(Boolean(v))}
                aria-label={col.label}
                className="group flex items-center justify-between px-3 py-2.5 text-xs font-bold text-admin-fg rounded-admin-md hover:bg-admin-surface-2 hover:text-admin-fg cursor-pointer transition-colors outline-none data-[state=checked]:text-admin-accent"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-md border transition-colors flex items-center justify-center ${col.checked ? 'bg-admin-accent border-admin-accent' : 'border-admin-border bg-admin-surface-2'}`}>
                    {col.checked && <Check size={10} className="text-admin-accent-fg stroke-4" />}
                  </div>
                  {col.label}
                </div>
              </DropdownMenu.CheckboxItem>
            ))}
          </div>
          
          <DropdownMenu.Separator className="my-3 h-px bg-admin-surface-2" />
          
          <div className="px-4 pt-1 pb-2 text-xs font-semibold text-admin-fg-muted flex items-center gap-2">
            <Maximize2 size={12} />
            {_t('admin.dataTable.columns.density')}
          </div>
          
          <DropdownMenu.RadioGroup 
            value={density} 
            onValueChange={(v) => onDensityChange(v as Density)}
            className="px-1"
          >
            <DropdownMenu.RadioItem 
              value="comfortable" 
              className="group flex items-center justify-between px-3 py-2.5 text-xs font-bold text-admin-fg rounded-admin-md hover:bg-admin-surface-2 hover:text-admin-fg cursor-pointer transition-colors outline-none data-[state=checked]:text-admin-accent"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${density === 'comfortable' ? 'bg-admin-accent border-admin-accent' : 'border-admin-border bg-admin-surface-2'}`}>
                  {density === 'comfortable' && <div className="w-1.5 h-1.5 rounded-full bg-admin-bg" />}
                </div>
                {_t('admin.dataTable.columns.densityComfortable')}
              </div>
            </DropdownMenu.RadioItem>
            
            <DropdownMenu.RadioItem 
              value="compact" 
              className="group flex items-center justify-between px-3 py-2.5 text-xs font-bold text-admin-fg rounded-admin-md hover:bg-admin-surface-2 hover:text-admin-fg cursor-pointer transition-colors outline-none data-[state=checked]:text-admin-accent"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${density === 'compact' ? 'bg-admin-accent border-admin-accent' : 'border-admin-border bg-admin-surface-2'}`}>
                  {density === 'compact' && <div className="w-1.5 h-1.5 rounded-full bg-admin-bg" />}
                </div>
                {_t('admin.dataTable.columns.densityCompact')}
              </div>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ColumnsMenu
