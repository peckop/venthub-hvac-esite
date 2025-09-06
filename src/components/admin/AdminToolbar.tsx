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
  storageKey?: string // kalıcılık için benzersiz anahtar (ör. 'toolbar:orders')
  persist?: { search?: boolean; select?: boolean; chips?: boolean; toggles?: boolean }
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
  storageKey,
  persist,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const hydratedRef = React.useRef(false)

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

  // Kalıcılık: yükleme
  React.useEffect(() => {
    if (!storageKey) return
    try {
      const enable = {
        search: persist?.search !== false,
        select: persist?.select !== false,
        chips: persist?.chips !== false,
        toggles: persist?.toggles !== false,
      }
      const raw = localStorage.getItem(storageKey)
      if (!raw) { hydratedRef.current = true; return }
      const saved = JSON.parse(raw) as {
        search?: string
        select?: string
        chips?: Record<string, boolean>
        toggles?: Record<string, boolean>
      }
      // search/select controlled değerlerini parent'a yaz
      if (enable.search && search && typeof saved.search === 'string' && saved.search !== search.value) {
        search.onChange(saved.search)
      }
      if (enable.select && select && typeof saved.select === 'string' && saved.select !== select.value) {
        select.onChange(saved.select)
      }
      // chips/toggles için farkları uygula (yalnızca bir kez)
      if (enable.chips && chips && saved.chips) {
        chips.forEach(ch => {
          const want = saved.chips?.[ch.key]
          if (typeof want === 'boolean' && want !== ch.active) {
            ch.onToggle()
          }
        })
      }
      if (enable.toggles && toggles && saved.toggles) {
        toggles.forEach(t => {
          const want = saved.toggles?.[t.key]
          if (typeof want === 'boolean' && want !== t.checked) {
            t.onChange(want)
          }
        })
      }
    } catch {
      // no-op
    } finally {
      hydratedRef.current = true
    }
  // chips/toggles dizileri her render'da yeni referans olabilir; mount'ta bir kez çalıştırmak yeterli.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Kalıcılık: kaydetme
  React.useEffect(() => {
    if (!storageKey || !hydratedRef.current) return
    try {
      const enable = {
        search: persist?.search !== false,
        select: persist?.select !== false,
        chips: persist?.chips !== false,
        toggles: persist?.toggles !== false,
      }
      const payload: Record<string, unknown> = {}
      if (enable.search && search) payload.search = search.value
      if (enable.select && select) payload.select = select.value
      if (enable.chips && chips) payload.chips = Object.fromEntries(chips.map(c => [c.key, !!c.active]))
      if (enable.toggles && toggles) payload.toggles = Object.fromEntries(toggles.map(t => [t.key, !!t.checked]))
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // no-op
    }
  }, [storageKey, persist?.search, persist?.select, persist?.chips, persist?.toggles, search, search?.value, select, select?.value, chips, toggles])

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
        <div className="flex flex-wrap items-center gap-3">
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

          <div className="ml-auto flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
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
