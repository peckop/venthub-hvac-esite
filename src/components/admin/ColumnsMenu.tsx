import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
export type Density = 'comfortable' | 'compact'

export const ColumnsMenu: React.FC<{
  columns: ColumnToggle[]
  density: Density
  onDensityChange: (d: Density) => void
  buttonLabel?: string
}> = ({ columns, density, onDensityChange, buttonLabel }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6c.24 0 .48-.05.7-.14H8.8A1.65 1.65 0 0 0 10 2V2a2 2 0 1 1 4 0v.09c.36.14.69.35 1 .61.29.26.51.59.65.95.08.22.14.46.14.7 0 .24.05.48.14.7.27.64.8 1.15 1.46 1.38.23.08.47.13.71.13.24 0 .48.05.7.14.36.14.69.36.95.65.26.29.47.63.61 1 .08.22.14.46.14.7s-.05.48-.14.7c-.14.36-.35.69-.61.95-.29.26-.63.47-1 .61-.22.08-.46.14-.7.14-.24 0-.48.05-.7.14-.64.27-1.15.8-1.38 1.46-.08.23-.13.47-.13.71z" />
          </svg>
          {buttonLabel || 'Görünüm'}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-56 rounded-md bg-white shadow-lg border border-light-gray p-1">
          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-industrial-gray">Kolonlar</div>
          {columns.map(col => (
            <DropdownMenu.CheckboxItem
              key={col.key}
              checked={col.checked}
              onCheckedChange={(v)=>col.onChange(Boolean(v))}
              className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer flex items-center gap-2"
            >
              <span className={`inline-block w-3 h-3 border rounded ${col.checked ? 'bg-primary-navy border-primary-navy' : 'border-light-gray'}`} />
              {col.label}
            </DropdownMenu.CheckboxItem>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-light-gray" />
          <div className="px-3 pt-1 pb-1 text-[11px] uppercase tracking-wide text-industrial-gray">Yoğunluk</div>
          <DropdownMenu.RadioGroup value={density} onValueChange={(v)=>onDensityChange(v as Density)}>
            <DropdownMenu.RadioItem value="comfortable" className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${density==='comfortable' ? 'bg-primary-navy' : 'bg-transparent border border-light-gray'}`} />
              Rahat
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="compact" className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${density==='compact' ? 'bg-primary-navy' : 'bg-transparent border border-light-gray'}`} />
              Sıkışık
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ColumnsMenu
