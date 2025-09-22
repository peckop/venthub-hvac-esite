import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 3v12"/>
            <polyline points="8 11 12 15 16 11"/>
            <rect x="4" y="19" width="16" height="2" rx="1"/>
          </svg>
          {buttonLabel || 'Dışa Aktar'}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={6} className="z-50 min-w-56 rounded-md bg-white text-steel-gray shadow-lg border border-light-gray p-1">
          {(items && items.length > 0) ? items.map(item => (
            <DropdownMenu.Item
              key={item.key}
              className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer"
              onSelect={(e) => { e.preventDefault(); item.onSelect() }}
            >
              {item.label}
            </DropdownMenu.Item>
          )) : (
            <div className="px-3 py-2 text-sm text-industrial-gray">Öğe yok</div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ExportMenu
