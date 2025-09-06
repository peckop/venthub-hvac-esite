import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Download } from 'lucide-react'

export type ExportMenuItem = {
  key: string
  label: string
  onSelect: () => void
}

export const ExportMenu: React.FC<{ items: ExportMenuItem[]; buttonLabel?: string }> = ({ items, buttonLabel }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">
          <Download size={16} />
          {buttonLabel || 'Dışa Aktar'}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-44 rounded-md bg-white shadow-lg border border-light-gray p-1">
          {items.map(item => (
            <DropdownMenu.Item
              key={item.key}
              className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer"
              onSelect={(e) => { e.preventDefault(); item.onSelect() }}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ExportMenu
