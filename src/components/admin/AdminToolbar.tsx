import React, { useState } from 'react'
import { adminButtonSecondaryClass } from '../../utils/adminUi'
import * as Switch from '@radix-ui/react-switch'
import { useI18n } from '../../i18n/I18nProvider'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

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
  className?: string
}

const defaultChipOn = 'bg-slate-100 text-primary-navy border-slate-200 font-bold shadow-sm'
const defaultChipOff = 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'

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
  className
}) => {
  const { t } = useI18n()
  const hydratedRef = React.useRef(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Mobil filtre badge sayısı
  const activeFilterCount = [
    select && select.value ? 1 : 0,
    ...(toggles || []).map(tog => tog.checked ? 1 : 0 as number),
    ...(chips || []).map(ch => ch.active ? 1 : 0 as number),
  ].reduce((a, b) => a + b, 0)

  // shortcut: '/' to focus search
  React.useEffect(() => {
    if (!search) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [search])

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
      // DISABLED: search persistence causes cursor position issues
      // if (enable.search && search && typeof saved.search === 'string' && saved.search !== search.value) {
      //   search.onChange(saved.search)
      // }
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
      // DISABLED: search persistence removed to prevent cursor issues
      // if (enable.search && search) payload.search = search.value
      if (enable.select && select) payload.select = select.value
      if (enable.chips && chips) payload.chips = Object.fromEntries(chips.map(c => [c.key, !!c.active]))
      if (enable.toggles && toggles) payload.toggles = Object.fromEntries(toggles.map(t => [t.key, !!t.checked]))
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // no-op
    }
  }, [storageKey, persist?.search, persist?.select, persist?.chips, persist?.toggles, select, select?.value, chips, toggles])

  // NOTE: Container was previously defined here as an inline component.
  // This caused React to see a NEW component on every render, destroying and recreating all children
  // (including the input), which reset cursor position. Fixed by using direct JSX instead.

  const hasFilters = !!(select || (toggles && toggles.length > 0) || (chips && chips.length > 0) || rightExtra || onClear)

  return (
    <div className={`${sticky ? 'sticky top-4 z-40 mx-2 mb-6' : 'mb-6'} ${className || ''}`}>
      <div className={`rounded-2xl border border-slate-200/60 shadow-xl ${sticky ? 'bg-white/80 backdrop-blur-xl' : 'bg-white'} p-3 md:p-4 transition-all duration-300`}>
        <div className="flex flex-col gap-3">
          {/* Mobil: Arama + Filtre Butonu (Yan yana) */}
          <div className="flex md:hidden items-center gap-2 w-full">
            {search && (
              <div className="flex-1 min-w-0 relative">
                <input
                  ref={inputRef}
                  className="w-full border border-slate-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy bg-slate-50/50 font-medium text-slate-900 transition-all placeholder:text-slate-400 shadow-inner"
                  placeholder={search.placeholder || t('admin.toolbar.searchPlaceholder')}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                />
              </div>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFiltersOpen(prev => !prev)}
                className={`flex-none inline-flex items-center gap-2 h-11 px-3 rounded-xl border text-xs font-bold transition-all ${filtersOpen ? 'bg-primary-navy text-white border-primary-navy shadow-lg shadow-blue-900/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 && (
                  <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${filtersOpen ? 'bg-white/20 text-white' : 'bg-primary-navy text-white'}`}>{activeFilterCount}</span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Desktop: Arama Çubuğu */}
          {search && (
            <div className="hidden md:block flex-1 min-w-0">
              <input
                ref={inputRef}
                className="w-full border border-slate-200 rounded-xl px-5 h-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy bg-slate-50/50 font-medium text-slate-900 transition-all placeholder:text-slate-400 group-hover:bg-white"
                placeholder={search.placeholder || t('admin.toolbar.searchPlaceholder')}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-200/50 border border-slate-300/50 text-[10px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none">
                <span className="text-[12px]">/</span> Focus
              </div>
            </div>
          )}

          {/* Desktop: select her zaman görünür */}
          {select && (
            <div className="hidden md:flex items-center gap-2">
              <select
                className="border border-slate-200 rounded-lg px-3 h-10 text-sm min-w-[180px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy font-medium text-slate-700 transition-all cursor-pointer"
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                title={select.title || 'Seçim'}
              >
                {select.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Desktop: toggles + onClear + recordCount + rightExtra her zaman görünür */}
          <div className="ml-auto hidden md:flex items-center gap-3 flex-wrap justify-end">
            {toggles && toggles.length > 0 && (
              <div className="flex items-center gap-4">
                {toggles.map(tog => (
                  <div key={tog.key} className="flex items-center gap-2 text-xs">
                    <span className="text-industrial-gray whitespace-nowrap">{tog.label}</span>
                    <Switch.Root
                      checked={tog.checked}
                      onCheckedChange={tog.onChange}
                      className="relative w-10 h-5 bg-light-gray rounded-full data-[state=checked]:bg-primary-navy outline-none cursor-pointer transition-colors"
                      aria-label={tog.title || tog.label}
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
                className={`${adminButtonSecondaryClass} !px-4 text-xs`}
              >{t('admin.toolbar.clear')}</button>
            )}

            {typeof recordCount === 'number' && (
              <span className="text-xs text-steel-gray whitespace-nowrap" aria-live="polite">{recordCount} {t('admin.toolbar.records')}</span>
            )}

            {rightExtra}
          </div>
        </div>

        {/* Desktop: chip'ler her zaman görünür */}
        {chips && chips.length > 0 && (
          <div className="hidden md:flex flex-wrap items-center gap-2 text-xs">
            {chips.map(ch => (
              <button
                key={ch.key}
                type="button"
                onClick={ch.onToggle}
                className={`px-4 h-10 inline-flex items-center rounded-lg border transition-all ${ch.active ? (ch.classOn || defaultChipOn) : (ch.classOff || defaultChipOff)} focus:outline-none focus:ring-2 focus:ring-primary-navy/10`}
                title={ch.title || ch.label}
                aria-pressed={ch.active}
              >{ch.label}</button>
            ))}
          </div>
        )}

        {/* ===== MOBİL: Katlanabilir filtre paneli ===== */}
        {filtersOpen && (
          <div className="flex flex-col gap-4 md:hidden pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            {select && (
              <select
                className="border border-slate-200 rounded-lg px-3 h-10 text-sm w-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy font-medium text-slate-700 transition-all cursor-pointer"
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                title={select.title || 'Seçim'}
              >
                {select.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {toggles && toggles.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {toggles.map(tog => (
                  <div key={tog.key} className="flex items-center gap-2 text-xs">
                    <span className="text-industrial-gray whitespace-nowrap">{tog.label}</span>
                    <Switch.Root
                      checked={tog.checked}
                      onCheckedChange={tog.onChange}
                      className="relative w-10 h-5 bg-light-gray rounded-full data-[state=checked]:bg-primary-navy outline-none cursor-pointer transition-colors"
                      aria-label={tog.title || tog.label}
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                  </div>
                ))}
              </div>
            )}

            {chips && chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {chips.map(ch => (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={ch.onToggle}
                    className={`px-4 h-8 inline-flex items-center rounded-lg border transition-all text-xs ${ch.active ? (ch.classOn || defaultChipOn) : (ch.classOff || defaultChipOff)} focus:outline-none focus:ring-2 focus:ring-primary-navy/10`}
                    title={ch.title || ch.label}
                    aria-pressed={ch.active}
                  >{ch.label}</button>
                ))}
              </div>
            )}

            {rightExtra && (
              <div className="flex flex-wrap items-center gap-2">
                {rightExtra}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    className={`${adminButtonSecondaryClass} !px-4 text-xs`}
                  >{t('admin.toolbar.clear')}</button>
                )}
              </div>
              {typeof recordCount === 'number' && (
                <span className="text-xs text-steel-gray whitespace-nowrap" aria-live="polite">{recordCount} {t('admin.toolbar.records')}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminToolbar



