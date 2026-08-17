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
        className="absolute inset-0 w-full h-full bg-surface-deep/60 cursor-default border-none outline-none"
        onClick={() => setOpen(false)}
        aria-label={t('admin.ui.closeSearch')}
        tabIndex={-1}
      />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-15vh">
        <div className="w-full max-w-640px bg-admin-surface rounded-admin-lg shadow-elevation-4 border border-admin-border overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
          {/* Search Input */}
          <div className="flex items-center border-b border-admin-border px-6 py-5">
            <div className="w-10 h-10 rounded-admin-md bg-admin-accent-weak border border-admin-accent/30 flex items-center justify-center mr-4 cyan-glow">
              <Search className="h-5 w-5 text-admin-accent shrink-0" />
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
              className="flex-1 bg-transparent border-none outline-none text-admin-fg placeholder:text-admin-fg-muted text-lg font-medium"
            />
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <kbd className="px-2.5 py-1 text-xs font-semibold text-admin-accent bg-admin-accent-weak rounded-admin-md border border-admin-accent/30">ESC</kbd>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-admin-md hover:bg-admin-surface-2 transition-colors"
                aria-label={t('admin.ui.close')}
              >
                <X size={20} className="text-admin-fg-muted hover:text-admin-fg" aria-hidden="true" />
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
                <Activity className="animate-spin text-admin-accent mx-auto mb-2" size={24} />
                <p className="text-xs font-bold text-admin-fg-muted italic">{t('admin.ui.scanningSystem')}</p>
              </div>
            )}

            {/* Navigation Group */}
            {filteredNavItems.length > 0 && (
              <div className="mb-4" role="group" aria-label={t('admin.ui.navigation')}>
                <div className="px-4 mb-3 text-xs font-bold text-admin-fg-muted">{t('admin.ui.navigation')}</div>
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
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-admin-lg text-sm font-bold cursor-pointer transition-colors text-left group ${
                          isActive
                            ? 'bg-admin-accent text-admin-accent-fg'
                            : 'text-admin-fg-muted hover:bg-admin-surface-2 hover:text-admin-fg'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-admin-md flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-admin-surface-2 text-admin-fg-muted group-hover:text-admin-accent'}`}>
                          <Icon size={18} className="shrink-0" />
                        </div>
                        <span className="flex-1">{t(item.labelKey)}</span>
                        {isActive && <ArrowRight size={16} className="text-admin-accent-fg" />}
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
                  <div className="px-4 my-3 text-xs font-bold text-admin-fg-muted">{t(res.labelKey)}</div>
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
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-admin-lg text-sm font-bold cursor-pointer transition-colors text-left group ${
                            isActive
                              ? 'bg-admin-accent text-admin-accent-fg'
                              : 'text-admin-fg-muted hover:bg-admin-surface-2 hover:text-admin-fg'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-admin-md flex items-center justify-center ${isActive ? 'bg-surface-deep/10' : 'bg-admin-surface-2 text-admin-fg-muted group-hover:text-admin-accent'}`}>
                            <ResourceIcon size={18} className="shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{p.title}</div>
                            {p.subtitle && (
                              <div className={`text-xs font-mono mt-0.5 ${isActive ? 'text-surface-deep/60' : 'text-admin-fg-muted'}`}>
                                {skuLabel} {p.subtitle}
                              </div>
                            )}
                          </div>
                          {isActive && <ArrowRight size={16} className="text-admin-accent-fg" />}
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
                <div className="w-16 h-16 rounded-full bg-admin-surface-2 flex items-center justify-center mx-auto mb-4 border border-admin-border">
                  <Search size={32} className="text-admin-fg-subtle" />
                </div>
                <p className="text-sm font-bold text-admin-fg-muted">{noResultsMsg}</p>
                <p className="text-xs text-admin-fg-subtle mt-2 font-medium">{t('admin.ui.tryDifferentKeywords')}</p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="bg-admin-surface-2 px-6 py-4 flex items-center justify-between border-t border-admin-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-admin-fg-muted">
                <kbd className="px-1.5 py-0.5 bg-admin-surface rounded border border-admin-border text-admin-fg">{enterKeySymbol}</kbd>
                {t('admin.ui.select')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-admin-fg-muted">
                <kbd className="px-1.5 py-0.5 bg-admin-surface rounded border border-admin-border text-admin-fg">{arrowKeysSymbol}</kbd>
                {t('admin.ui.navigate')}
              </div>
            </div>
            <div className="text-xs font-bold text-admin-accent flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-admin-accent animate-pulse"></div>
              {aiSearchEngineLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
