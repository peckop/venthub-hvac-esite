'use client'

import {
  Activity,
  ArrowRight,
  Search,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { ADMIN_RESOURCES, AdminResource } from '@/config/admin-resources'
import { useRole } from '@/hooks/useRole'
import {
  AdminSearcher,
  CommandResult,
  searchAudit,
  searchCategories,
  searchCoupons,
  searchErrorGroups,
  searchInventory,
  searchMovements,
  searchOrders,
  searchProducts,
  searchReturns,
  searchUsers} from '@/lib/admin/search/resourceSearchers'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useI18n } from '../../i18n/I18nProvider'

const resourceSearchers: Record<string, AdminSearcher> = {
  products: searchProducts,
  orders: searchOrders,
  returns: searchReturns,
  categories: searchCategories,
  users: searchUsers,
  coupons: searchCoupons,
  movements: searchMovements,
  error_groups: searchErrorGroups,
  audit: searchAudit,
  inventory: searchInventory
}

interface SelectableItem {
  type: 'nav' | 'searchResult'
  item: AdminResource | CommandResult
}

const CommandPalette: React.FC = () => {
  const { t } = useI18n()
  const { canAccess } = useRole()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [results, setResults] = React.useState<Record<string, CommandResult[]>>({})
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Accessible navigation items
  const accessibleNavItems = React.useMemo(() => {
    return ADMIN_RESOURCES.filter((r) => canAccess(r.requiredAccess))
  }, [canAccess])

  // Filtered navigation items when query matches
  const filteredNavItems = React.useMemo(() => {
    if (!search) return accessibleNavItems
    const lowerQuery = search.toLowerCase()
    return accessibleNavItems.filter((item) => {
      const label = t(item.labelKey) || ''
      return label.toLowerCase().includes(lowerQuery)
    })
  }, [accessibleNavItems, search, t])

  // Searchable resources
  const searchableResources = React.useMemo(() => {
    return ADMIN_RESOURCES.filter((r) => r.searchable && canAccess(r.requiredAccess))
  }, [canAccess])

  // Flat selectable items for keyboard navigation index map
  const selectableItems = React.useMemo<SelectableItem[]>(() => {
    const list: SelectableItem[] = []

    // Add navigation items
    filteredNavItems.forEach((item) => {
      list.push({ type: 'nav', item })
    })

    // Add search results
    searchableResources.forEach((res) => {
      const resResults = results[res.key] || []
      resResults.forEach((item) => {
        list.push({ type: 'searchResult', item })
      })
    })

    return list
  }, [filteredNavItems, searchableResources, results])

  // Toggle open on CTRL+K / CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Reset state when opened
  React.useEffect(() => {
    if (open) {
      setSearch('')
      setResults({})
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Federated search logic (debounced)
  React.useEffect(() => {
    if (search.trim().length < 2) {
      setResults({})
      setLoading(false)
      return
    }

    const runSearch = async () => {
      setLoading(true)
      const term = search.trim()
      const searchPromises = searchableResources.map(async (r) => {
        const searcher = resourceSearchers[r.key]
        if (!searcher) return { key: r.key, data: [] }
        try {
          const data = await searcher(supabase, term, 5)
          return { key: r.key, data }
        } catch (err) {
          console.error(`Searcher error for ${r.key}:`, err)
          return { key: r.key, data: [] }
        }
      })

      const settled = await Promise.allSettled(searchPromises)
      const newResults: Record<string, CommandResult[]> = {}
      settled.forEach((res) => {
        if (res.status === 'fulfilled') {
          const val = res.value
          if (val.data.length > 0) {
            newResults[val.key] = val.data
          }
        }
      })

      setResults(newResults)
      setLoading(false)
    }

    const timer = setTimeout(runSearch, 300)
    return () => clearTimeout(timer)
  }, [search, searchableResources])

  // Reset active index on filter/results changes
  React.useEffect(() => {
    setActiveIndex(0)
  }, [search, results])

  const selectItem = (selectable: SelectableItem) => {
    setOpen(false)
    if (selectable.type === 'nav') {
      const item = selectable.item as AdminResource
      router.push(item.route as import('next').Route)
    } else {
      const item = selectable.item as CommandResult
      router.push(item.route as import('next').Route)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % Math.max(1, selectableItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + selectableItems.length) % Math.max(1, selectableItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectableItems[activeIndex]) {
        selectItem(selectableItems[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (!open) return null

  const noResultsMsg = t('admin.ui.noResultsForTerm', { term: search })
  const skuLabel = t('admin.ui.skuLabel') || 'SKU:'
  const enterKeySymbol = '⏎'
  const arrowKeysSymbol = '↑↓'
  const aiSearchEngineLabel = t('admin.ui.aiSearchEngine') || 'VentHub AI Search Engine'

  return (
    <div
      className="fixed inset-0 z-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t('admin.ui.commandPalette')}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-surface-deep/60 backdrop-blur-md cursor-default border-none outline-none"
        onClick={() => setOpen(false)}
        aria-label={t('admin.ui.closeSearch')}
        tabIndex={-1}
      />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-15vh">
        <div className="w-full max-w-640px glass-strong rounded-hvac-xl shadow-elevation-4 border border-white/10 overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
          {/* Search Input */}
          <div className="flex items-center border-b border-white/5 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mr-4 cyan-glow">
              <Search className="h-5 w-5 text-cyan-400 shrink-0" />
            </div>
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls="command-palette-results-list"
              aria-activedescendant={selectableItems[activeIndex] ? `combobox-item-${activeIndex}` : undefined}
              onKeyDown={handleKeyDown}
              placeholder={t('admin.ui.searchCommandPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg font-medium"
            />
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <kbd className="px-2.5 py-1 text-xs font-black text-cyan-400 bg-cyan-400/10 rounded-lg border border-cyan-400/20 shadow-glow-sm">ESC</kbd>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                aria-label={t('admin.ui.close')}
              >
                <X size={20} className="text-slate-500 hover:text-white" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div
            id="command-palette-results-list"
            role="listbox"
            aria-label={t('admin.ui.commandPalette')}
            className="max-h-450px overflow-y-auto p-3 scrollbar-hide"
          >
            {loading && (
              <div className="p-8 text-center">
                <Activity className="animate-spin text-cyan-400 mx-auto mb-2" size={24} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">{t('admin.ui.scanningSystem')}</p>
              </div>
            )}

            {/* Navigation Group */}
            {filteredNavItems.length > 0 && (
              <div className="mb-4" role="group" aria-label={t('admin.ui.navigation')}>
                <div className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-hvac-normal">{t('admin.ui.navigation')}</div>
                <div className="space-y-1">
                  {filteredNavItems.map((item, idx) => {
                    const Icon = item.icon
                    const isActive = activeIndex === idx
                    return (
                      <button
                        key={item.route}
                        id={`combobox-item-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => selectItem({ type: 'nav', item })}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-colors text-left group ${
                          isActive
                            ? 'bg-cyan-400 text-surface-deep shadow-glow-md'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                          <Icon size={18} className="shrink-0" />
                        </div>
                        <span className="flex-1">{t(item.labelKey)}</span>
                        {isActive && <ArrowRight size={16} className="text-surface-deep" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Search Groups */}
            {searchableResources.map((res) => {
              const resResults = results[res.key] || []
              if (resResults.length === 0) return null

              let groupStartIdx = filteredNavItems.length
              for (const r of searchableResources) {
                if (r.key === res.key) break
                groupStartIdx += (results[r.key] || []).length
              }

              const ResourceIcon = res.icon

              return (
                <div key={res.key} className="mb-4" role="group" aria-label={t(res.labelKey)}>
                  <div className="px-4 my-3 text-xs font-bold text-slate-500 uppercase tracking-hvac-normal">{t(res.labelKey)}</div>
                  <div className="space-y-1">
                    {resResults.map((p, idx) => {
                      const globalIdx = groupStartIdx + idx
                      const isActive = activeIndex === globalIdx
                      return (
                        <button
                          key={p.id}
                          id={`combobox-item-${globalIdx}`}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => selectItem({ type: 'searchResult', item: p })}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-colors text-left group ${
                            isActive
                              ? 'bg-cyan-400 text-surface-deep shadow-glow-md'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-white/5 text-slate-500 group-hover:text-cyan-400'}`}>
                            <ResourceIcon size={18} className="shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{p.title}</div>
                            {p.subtitle && (
                              <div className={`text-xs font-mono mt-0.5 ${isActive ? 'text-surface-deep/60' : 'text-slate-500'}`}>
                                {skuLabel} {p.subtitle}
                              </div>
                            )}
                          </div>
                          {isActive && <ArrowRight size={16} className="text-surface-deep" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {!loading && selectableItems.length === 0 && search.trim().length >= 2 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Search size={32} className="text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-400">{noResultsMsg}</p>
                <p className="text-xs text-slate-600 mt-2 font-medium">{t('admin.ui.tryDifferentKeywords')}</p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">{enterKeySymbol}</kbd>
                {t('admin.ui.select')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <kbd className="px-1.5 py-0.5 glass rounded border border-white/10 text-white">{arrowKeysSymbol}</kbd>
                {t('admin.ui.navigate')}
              </div>
            </div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
              {aiSearchEngineLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
