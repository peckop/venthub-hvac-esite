import * as Switch from '@radix-ui/react-switch'
import { Search,SlidersHorizontal } from 'lucide-react'
import React, { useEffect,useRef, useState } from 'react'

import { formatNumber } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSelectClass, adminSelectStyle } from '../../utils/adminUi'

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

const defaultChipOn = 'bg-cyan-400 text-surface-deep border-cyan-400 font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]'
const defaultChipOff = 'glass text-slate-400 border-white/5 hover:bg-white/5 hover:text-white hover:border-white/10'

const AdminToolbar: React.FC<AdminToolbarProps> = ({
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
  const { t: _t, lang } = useI18n()
  const hydratedRef = useRef(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mobil filtre badge sayısı
  const activeFilterCount = [
    select && select.value ? 1 : 0,
    ...(toggles || []).map(tog => (tog.checked ? 1 : 0) as number),
    ...(chips || []).map(ch => (ch.active ? 1 : 0) as number),
  ].reduce((a, b) => a + b, 0)

  // shortcut: '/' to focus search
  useEffect(() => {
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
  useEffect(() => {
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
      if (enable.select && select && typeof saved.select === 'string' && saved.select !== select.value) {
        select.onChange(saved.select)
      }
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
  }, [storageKey, persist?.search, persist?.select, persist?.chips, persist?.toggles, select, chips, toggles])

  // Kalıcılık: kaydetme
   
  useEffect(() => {
    if (!storageKey || !hydratedRef.current) return
    try {
      const enable = {
        search: persist?.search !== false,
        select: persist?.select !== false,
        chips: persist?.chips !== false,
        toggles: persist?.toggles !== false,
      }
      const payload: Record<string, unknown> = {}
      if (enable.select && select) payload.select = select.value
      if (enable.chips && chips) payload.chips = Object.fromEntries(chips.map(c => [c.key, !!c.active]))
      if (enable.toggles && toggles) payload.toggles = Object.fromEntries(toggles.map(t => [t.key, !!t.checked]))
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // no-op
    }
  }, [storageKey, persist?.search, persist?.select, persist?.chips, persist?.toggles, select, select?.value, chips, toggles, search])

  const hasFilters = !!(select || (toggles && toggles.length > 0) || (chips && chips.length > 0) || rightExtra || onClear)

  return (
    <div className={`${sticky ? 'sticky top-0 z-30 mx-0 mb-8' : 'mb-8'} ${className || ''} animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className={`rounded-hvac-lg border border-white/5 shadow-2xl ${sticky ? 'glass-strong backdrop-blur-2xl' : 'glass'} p-2.5 md:p-3 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Mobil: Arama + Filtre Butonu (Yan yana) */}
          <div className="flex md:hidden items-center gap-2 w-full">
            {search && (
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" size={16} />
                <input
                  ref={inputRef}
                  type="text"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder || _t('admin.toolbar.searchPlaceholder')}
                  aria-label={_t('admin.a11y.search') || 'Ara'}
                  className="w-full h-11 bg-surface-deep/40 border border-white/20 rounded-xl pl-12 pr-12 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:border-cyan-400/50 transition-colors placeholder:text-slate-600 font-bold shadow-inner"
                />
              </div>
            )}
            {hasFilters && (
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label={_t('admin.a11y.filter') || 'Filtreleri Göster'}
                aria-expanded={filtersOpen}
                className={`relative h-11 px-4 rounded-xl border transition-colors flex items-center gap-2 ${
                  filtersOpen ? 'bg-cyan-400 border-cyan-400 text-surface-deep' : 'glass border-white/10 text-slate-400'
                }`}
              >
                <SlidersHorizontal size={16} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-xs font-black text-white flex items-center justify-center shadow-lg border border-surface-deep">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Desktop: Arama Çubuğu */}
          {search && (
            <div className="hidden md:block relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" size={16} />
              <input
                ref={inputRef}
                type="text"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder || _t('admin.toolbar.searchPlaceholder')}
                aria-label={_t('admin.a11y.search') || 'Ara'}
                className="w-full h-11 bg-white/3 border border-white/10 rounded-xl pl-12 pr-12 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:border-cyan-400/40 transition-colors placeholder:text-slate-600 font-bold"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-2.5 pointer-events-none group-focus-within:opacity-0 transition-opacity">
                <kbd className="min-w-5 h-5 flex items-center justify-center rounded border border-white/10 bg-transparent text-xs font-black text-slate-500 font-sans shadow-sm">/</kbd>
              </div>
            </div>
          )}

          {/* Desktop: select her zaman görünür */}
          {select && (
            <div className="hidden md:flex items-center gap-2">
              <select
                className={`${adminSelectClass} min-w-200px shadow-inner hover:border-white/10 h-12`}
                style={adminSelectStyle}
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                title={select.title || _t('admin.a11y.filter')}
                aria-label={select.title || _t('admin.a11y.filter')}
              >
                {select.options.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-surface-deep text-white font-medium">{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Desktop: toggles + onClear + recordCount + rightExtra her zaman görünür */}
          <div className="hidden md:flex items-center gap-4 flex-wrap justify-end">
            {toggles && toggles.length > 0 && (
              <div className="flex items-center gap-6 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                {toggles.map(tog => (
                  <div key={tog.key} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs whitespace-nowrap">{tog.label}</span>
                    <Switch.Root
                      checked={tog.checked}
                      onCheckedChange={tog.onChange}
                      className="relative w-9 h-5 bg-white/10 rounded-full data-[state=checked]:bg-cyan-400 outline-none cursor-pointer transition-colors shadow-inner"
                      aria-label={tog.title || tog.label}
                    >
                      <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-4.5" />
                    </Switch.Root>
                  </div>
                ))}
              </div>
            )}

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label={_t('admin.a11y.refresh') || 'Filtreleri Temizle'}
                className="h-12 px-5 glass text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors"
              >{_t('admin.toolbar.clear') || 'Temizle'}</button>
            )}

            {typeof recordCount === 'number' && (
              <div className="flex flex-col items-end px-4 border-l border-white/10">
                <span className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal">{_t('admin.toolbar.records') || 'Kayıt'}</span>
                <span className="text-base font-black text-cyan-400 font-mono tracking-tighter" aria-live="polite">
                    {formatNumber(recordCount, lang)}
                </span>
              </div>
            )}

            {rightExtra}
          </div>
        </div>

        {/* Desktop: chip'ler her zaman görünür */}
        {chips && chips.length > 0 && (
          <div className="hidden md:flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
            {chips.map(ch => (
              <button
                key={ch.key}
                type="button"
                onClick={ch.onToggle}
                className={`px-5 h-10 inline-flex items-center rounded-xl border text-xs font-black uppercase tracking-widest transition-colors ${ch.active ? (ch.classOn || defaultChipOn) : (ch.classOff || defaultChipOff)} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/20`}
                title={ch.title || ch.label}
                aria-pressed={ch.active}
                aria-label={ch.label}
              >{ch.label}</button>
            ))}
          </div>
        )}

        {/* ===== MOBİL: Katlanabilir filtre paneli ===== */}
        {filtersOpen && (
          <div className="flex flex-col gap-5 md:hidden pt-5 mt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
            {select && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{select.title || 'Kategori'}</label>
                <select
                  className={adminSelectClass}
                  style={adminSelectStyle}
                  value={select.value}
                  onChange={(e) => select.onChange(e.target.value)}
                  aria-label={select.title || 'Kategori'}
                >
                  {select.options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-surface-deep">{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {toggles && toggles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                {toggles.map(tog => (
                  <div key={tog.key} className="flex items-center justify-between gap-3 text-xs bg-surface-deep/20 p-3 rounded-xl">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{tog.label}</span>
                    <Switch.Root
                      checked={tog.checked}
                      onCheckedChange={tog.onChange}
                      className="relative w-8 h-4 bg-white/10 rounded-full data-[state=checked]:bg-cyan-400 outline-none cursor-pointer transition-colors"
                      aria-label={tog.label}
                    >
                      <Switch.Thumb className="block w-3 h-3 bg-white rounded-full shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-3.5" />
                    </Switch.Root>
                  </div>
                ))}
              </div>
            )}

            {chips && chips.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{_t('admin.common.filter') || 'Filtreler'}</label>
                <div className="flex flex-wrap gap-2 text-xs">
                    {chips.map(ch => (
                    <button
                        key={ch.key}
                        type="button"
                        onClick={ch.onToggle}
                        className={`px-4 h-10 flex-1 min-w-120px inline-flex items-center justify-center rounded-xl border text-xs font-black uppercase tracking-widest transition-colors ${ch.active ? (ch.classOn || defaultChipOn) : (ch.classOff || defaultChipOff)}`}
                        aria-pressed={ch.active}
                        aria-label={ch.label}
                    >{ch.label}</button>
                    ))}
                </div>
              </div>
            )}

            {rightExtra && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {rightExtra}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="h-10 px-6 glass text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/5"
                  aria-label={_t('admin.toolbar.clear') || 'Temizle'}
                >{_t('admin.toolbar.clear') || 'Temizle'}</button>
              )}
              {typeof recordCount === 'number' && (
                <div className="text-right">
                  <span className="block text-xs font-black text-slate-500 uppercase tracking-widest opacity-50">{_t('admin.toolbar.records') || 'Toplam Kayıt'}</span>
                  <span className="text-lg font-black text-cyan-400 font-mono" aria-live="polite">{formatNumber(recordCount, lang)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminToolbar
