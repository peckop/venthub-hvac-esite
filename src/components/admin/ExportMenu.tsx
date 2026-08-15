import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Download, FileDown, Table } from 'lucide-react'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { adminButtonSecondaryClass } from '../../utils/adminUi'

export type ExportMenuItem = {
  key: string
  label: string
  onSelect: () => void
}

const ExportMenu: React.FC<{ items: ExportMenuItem[]; buttonLabel?: string }> = ({ items, buttonLabel }) => {
  const { t: _t } = useI18n()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className={adminButtonSecondaryClass + " h-12 flex items-center gap-2 px-5 min-w-140px"}
          aria-label={_t('admin.a11y.export')}
        >
          <Download size={16} className="text-emerald-400" />
          <span className="truncate">{buttonLabel || _t('admin.common.export')}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          sideOffset={8} 
          align="end"
          className="z-50 min-w-200px glass-strong rounded-hvac-lg border border-white/10 p-2 shadow-elevation-5 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-3 pt-2 pb-2 text-xs font-black uppercase tracking-hvac-normal text-slate-500 flex items-center gap-2 mb-1">
            <FileDown size={12} />
            {_t('admin.dataTable.export.fileFormat')}
          </div>
          
          {(items && items.length > 0) ? items.map(item => (
            <DropdownMenu.Item
              key={item.key}
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors outline-none"
              onSelect={(e) => { e.preventDefault(); item.onSelect() }}
              aria-label={item.label}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Table size={14} />
              </div>
              {item.label}
            </DropdownMenu.Item>
          )) : (
            <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase italic">
              {_t('admin.common.noOptions')}
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ExportMenu
