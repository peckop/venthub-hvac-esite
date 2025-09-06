import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Settings2 } from 'lucide-react'

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
          <Settings2 size={16} />
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
