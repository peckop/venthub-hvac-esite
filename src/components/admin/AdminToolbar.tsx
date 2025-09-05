import React from 'react'
import { adminCardClass } from '../../utils/adminUi'
import * as Switch from '@radix-ui/react-switch'

export type AdminToolbarChip = {
  key: string
  label: string
  active: boolean
  onToggle: () => void
  classOn?: string
  classOff?: string
  title?: string
}

export type AdminToolbarToggle = {
  key: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  title?: string
}

export type AdminToolbarSelectOption = { value: string; label: string }

export type AdminToolbarProps = {
  search?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    title?: string
    focusShortcut?: string // default '/'
  }
  select?: {
    value: string
    onChange: (v: string) => void
    options: AdminToolbarSelectOption[]
    title?: string
  }
  chips?: AdminToolbarChip[]
  toggles?: AdminToolbarToggle[]
  onClear?: () => void
  recordCount?: number
  rightExtra?: React.ReactNode
  sticky?: boolean // if true, wraps in a sticky card like inventory page
}

const defaultChipOn = 'bg-light-gray text-industrial-gray border-light-gray'
const defaultChipOff = 'bg-white text-steel-gray border-light-gray'

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  search,
  select,
  chips,
  toggles,
  onClear,
  recordCount,
  rightExtra,
  sticky,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    const shortcut = (search?.focusShortcut || '/').trim()
    if (!shortcut) return
    const handler = (e: KeyboardEvent) => {
      // Sadece düz kısayol (modifier olmadan) ve içerikte yazmıyorken çalıştır
      if (e.key !== shortcut || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const isEditable = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable
      )
      if (isEditable) return
      if (inputRef.current) {
        e.preventDefault()
        inputRef.current.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [search?.focusShortcut])

  const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`${adminCardClass} p-4 ${sticky ? 'sticky top-4 z-10' : ''}`}>
      <div className="rounded-md bg-gray-50 border border-light-gray p-3 md:p-3">
        {children}
      </div>
    </div>
  )

  return (
    <Container>
      <div className="flex flex-col gap-3">
        {/* Üst sıra: arama + select + sağ aksiyonlar */}
        <div className="flex items-center gap-3">
          {search && (
            <div className="flex-1 min-w-[240px]">
              <input
                ref={inputRef}
                className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white"
                placeholder={search.placeholder || 'Ara'}
                title={search.title || `Kısayol: ${search.focusShortcut || '/'}`}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
              />
            </div>
          )}

          {select && (
            <div className="flex items-center gap-2">
              <select
                className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm min-w-[180px] bg-white focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1"
                value={select.value}
                onChange={(e)=>select.onChange(e.target.value)}
                title={select.title || 'Seçim'}
              >
                {select.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto shrink-0 flex items-center gap-3">
            {toggles && toggles.length > 0 && (
              <div className="flex items-center gap-4">
                {toggles.map(t => (
                  <div key={t.key} className="flex items-center gap-2 text-xs">
                    <span className="text-industrial-gray whitespace-nowrap">{t.label}</span>
                    <Switch.Root
                      checked={t.checked}
                      onCheckedChange={t.onChange}
                      className="relative w-10 h-5 bg-light-gray rounded-full data-[state=checked]:bg-primary-navy outline-none cursor-pointer transition-colors"
                      aria-label={t.title || t.label}
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                  </div>
                ))}
              </div>
            )}

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="px-3 md:h-12 h-11 text-xs rounded-md border border-light-gray bg-white hover:border-primary-navy whitespace-nowrap"
              >Temizle</button>
            )}

            {typeof recordCount === 'number' && (
              <span className="text-xs text-steel-gray whitespace-nowrap" aria-live="polite">{recordCount} kayıt</span>
            )}

            {rightExtra}
          </div>
        </div>

        {/* Alt sıra: chip'ler */}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {chips.map(ch => (
              <button
                key={ch.key}
                type="button"
                onClick={ch.onToggle}
                className={`px-3 md:h-8 h-9 inline-flex items-center rounded-full border transition ${ch.active ? (ch.classOn || defaultChipOn) : (ch.classOff || defaultChipOff)} focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1`}
                title={ch.title || ch.label}
                aria-pressed={ch.active}
              >{ch.label}</button>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default AdminToolbar
