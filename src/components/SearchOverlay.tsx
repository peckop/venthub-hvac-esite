'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

import type { FtsProductResult, SearchSuggestion } from '@/types/ui-models'

import { useCategories } from '../contexts/CategoryContext'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'
import { resolveProductImageUrl } from '../lib/images/productImage'
import { supabaseBrowserClient } from '../lib/supabase/client'
import type { DbCategory } from '../types/db-rows'
import { getLocalizedCategorySlug } from '../utils/categoryHelpers'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { highlightMatch } from '../utils/searchHighlight'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

type ViewState = 'IDLE' | 'SUGGESTING' | 'RESULTS'

const RECENT_SEARCHES_KEY = 'venthub_recent_searches'

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const { t, lang } = useI18n()
  const { categories: globalCategories } = useCategories()
  const Routes = useLocalizedRoutes()
  const [q, setQ] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [viewState, setViewState] = React.useState<ViewState>('IDLE')
  const [activeIndex, setActiveIndex] = React.useState(-1)

  // Data
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([])
  const [results, setResults] = React.useState<FtsProductResult[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)

  // Popüler kategorileri merkezi hiyerarşiden çek
  const popularCategories = React.useMemo(() => {
    return globalCategories.filter(c => !c.parent_id).slice(0, 5) as Partial<DbCategory>[]
  }, [globalCategories])

  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Load recent searches on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  // Debounce logic
  React.useEffect(() => {
    const t_id = setTimeout(() => setDebounced(q.trim()), 200)
    return () => clearTimeout(t_id)
  }, [q])

  // Reset activeIndex when query or viewState changes
  React.useEffect(() => {
    setActiveIndex(-1)
  }, [debounced, viewState])

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  // Main search logic
  React.useEffect(() => {
    let active = true

    async function fetchData() {
      if (!open) return

      if (!debounced) {
        setViewState('IDLE')
        setSuggestions([])
        setResults([])
        return
      }

      try {
        setLoading(true)
        const { getSearchSuggestions } = await import('../lib/services/product.service')
        const items = await getSearchSuggestions(supabaseBrowserClient, debounced, 6)

        if (active) {
          setSuggestions(items)
          setViewState('SUGGESTING')
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => { active = false }
  }, [debounced, open])

  // Focus management
  React.useEffect(() => {
    if (open) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Handlers
  const handleClose = () => {
    setQ('')
    setResults([])
    setSuggestions([])
    setViewState('IDLE')
    setActiveIndex(-1)
    onClose()
  }

  const addToRecent = (term: string) => {
    if (!term.trim()) return
    const next = [term, ...recentSearches.filter(x => x !== term)].slice(0, 5)
    setRecentSearches(next)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  const performFullSearch = async (term: string) => {
    if (!term.trim()) return
    setLoading(true)
    setError(null)
    setViewState('RESULTS')
    addToRecent(term)
    setActiveIndex(-1)

    try {
      const { ftsSearchProducts } = await import('../lib/services/product.service')
      const rows = await ftsSearchProducts(supabaseBrowserClient, term, 20)
      setResults(rows)
    } catch {
      setError(t('search.noResults') || 'Arama sırasında hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()

    const maxIndex = viewState === 'SUGGESTING' ? suggestions.length - 1 : viewState === 'RESULTS' ? results.length - 1 : -1

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < maxIndex ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > -1 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex > -1) {
        if (viewState === 'SUGGESTING') {
          const s = suggestions[activeIndex]
          router.push((s.url || '#') as import('next').Route)
          addToRecent(s.label || '')
          handleClose()
        } else if (viewState === 'RESULTS') {
          const res = results[activeIndex]
          router.push(Routes.product(res.slug!))
          handleClose()
        }
      } else {
        performFullSearch(q)
      }
    }
  }

  // Render Helpers
  const renderSuggestion = (s: SearchSuggestion, idx: number) => {
    const isActive = idx === activeIndex

    const icon = s.type === 'product' ? (
      (s.metadata as Record<string, string>)?.image_url ? (
        <div className="w-8 h-8 relative rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0">
          <Image src={(s.metadata as Record<string, string>).image_url || ''} alt={s.label || ''} fill sizes="32px" className="object-cover" />
        </div>
      ) : (
        <svg className="w-5 h-5 text-steel-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      )
    ) : s.type === 'category' ? (
      <svg className="w-5 h-5 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ) : (
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    )

    const label = s.type === 'brand' ? `${t('search.brandPrefix')}${s.label}` : s.label

    return (
      <button
        key={`${s.type}-${Math.random()}`} // Avoid strict index mapping issues
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => {
          router.push((s.url || '#') as import('next').Route)
          addToRecent(q)
          handleClose()
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-transform duration-200 group outline-none hover:scale-101 hover:shadow-md hover:z-10 relative ${isActive ? 'bg-air-blue/10 ring-inset ring-2 ring-primary-navy/20 shadow-sm' : 'hover:bg-gray-50'}`}
      >
        <div className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${isActive ? 'bg-white border-primary-ocean/30 shadow-sm' : 'bg-gray-50 border-transparent group-hover:bg-white group-hover:border-gray-200'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-industrial-gray">{highlightMatch(label || '', debounced)}</div>
          {s.type === 'product' && (s.metadata as Record<string, string>)?.sku && (
            <div className="text-xs text-steel-gray mt-0.5">
              {(s.metadata as Record<string, string>).brand && <span className="font-semibold">{highlightMatch((s.metadata as Record<string, string>).brand, debounced)}</span>}
              {(s.metadata as Record<string, string>).brand && (s.metadata as Record<string, string>).sku && <span> • </span>}
              {highlightMatch((s.metadata as Record<string, string>).sku, debounced)}
            </div>
          )}
        </div>
        <div className={`transition-opacity flex items-center gap-1.5 ${isActive ? 'opacity-100 text-primary-navy' : 'opacity-0 text-primary-ocean group-hover:opacity-100'}`}>
          <span className="text-xs font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 hidden xs:inline-block shadow-sm">{t('search.overlay.enterKey')}</span>
        </div>
      </button>
    )
  }

  // --- VIEW: IDLE ---
  const renderIdle = () => (
    <div className="py-2 animate-in fade-in duration-300">
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-semibold text-steel-gray uppercase tracking-wider">{t('search.recentSearches')}</h3>
            <button
              onClick={() => {
                setRecentSearches([])
                localStorage.removeItem(RECENT_SEARCHES_KEY)
              }}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              {t('search.clearRecent')}
            </button>
          </div>
          <ul>
            {recentSearches.map((term, i) => (
              <li key={i}>
                <button
                  onClick={() => { setQ(term); performFullSearch(term); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm text-industrial-gray group transition-colors"
                >
                  <svg className="w-4 h-4 text-steel-gray group-hover:text-primary-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="px-4 mb-2 text-xs font-semibold text-steel-gray uppercase tracking-wider">{t('search.popularCategories')}</h3>
        <div className="px-4 flex flex-wrap gap-2">
          {popularCategories.length > 0 ? popularCategories.map(cat => (
            <button
              key={String(cat.id)}
              onClick={() => { router.push(Routes.category(getLocalizedCategorySlug({ slug: cat.slug ?? null, metadata: cat.metadata }, lang))); handleClose(); }}
              className="px-3 py-1.5 bg-gray-50 text-sm text-industrial-gray rounded-full border border-gray-200 hover:border-primary-ocean hover:text-primary-ocean transition-colors flex items-center gap-1.5"
            >
              {getCategoryIcon(String(cat.slug), { size: 14 })}
              {String(cat.name)}
            </button>
          )) : (
            [
              { name: t('home.hero.quickChips.fans'), slug: 'fans' },
              { name: t('home.hero.quickChips.airCurtains'), slug: 'air-curtains' },
              { name: t('home.hero.quickChips.heatRecovery'), slug: 'heat-recovery-units' }
            ].map(cat => (
              <button
                key={cat.slug}
                onClick={() => { router.push(Routes.category(cat.slug)); handleClose(); }}
                className="px-3 py-1.5 bg-gray-50 text-sm text-industrial-gray rounded-full border border-gray-200 hover:border-primary-ocean hover:text-primary-ocean transition-colors"
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )

  // --- VIEW: SUGGESTING ---
  const renderSuggestions = () => {
    if (suggestions.length === 0) {
      return (
        <div className="px-4 py-12 text-center text-sm text-steel-gray flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <svg className="w-12 h-12 text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium">{t('search.noResults')}</span>
          <button
            onClick={() => performFullSearch(debounced)}
            className="text-primary-ocean font-bold mt-2 hover:underline inline-flex items-center gap-1"
          >
            <span>"{debounced}"</span> {t('search.detailedSearch')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      )
    }

    return (
      <div className="py-2" ref={listRef}>
        <div className="divide-y divide-gray-100">
          {suggestions.map((s, idx) => renderSuggestion(s, idx))}
        </div>
        <button
          onClick={() => performFullSearch(debounced)}
          className="w-full text-center py-3 text-sm text-primary-ocean font-medium hover:bg-gray-50 border-t transition-colors focus:bg-air-blue/10 focus-visible:outline-none"
        >
          {t('search.overlay.allResultsFor', { term: debounced })}
        </button>
      </div>
    )
  }

  // --- VIEW: RESULTS (Full Search) ---
  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div className="p-12 text-center text-industrial-gray flex flex-col items-center animate-in zoom-in-95 duration-300">
          <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-lg font-medium">{t('search.noResults')}</span>
          <span className="text-sm text-steel-gray mt-1">{t('search.noResultsAdvice')}</span>
        </div>
      )
    }

    const hasFuzzy = results.some(r => r.is_fuzzy_match)

    return (
      <div className="pb-2 animate-in fade-in duration-300" ref={listRef}>
        {hasFuzzy && (
          <div className="bg-amber-50 px-4 py-2.5 text-sm text-amber-800 border-b border-amber-100 flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{t('search.fuzzyMatchNotice')}</span>
          </div>
        )}
        <ul className="divide-y">
          {results.map((r, idx) => {
            const isActive = idx === activeIndex
            const rImgUrl = resolveProductImageUrl(r)
            return (
              <li key={r.id}>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center justify-between group outline-none transition-colors ${isActive ? 'bg-air-blue/10 ring-inset ring-2 ring-primary-navy/20' : 'hover:bg-slate-50'}`}
                  onClick={() => { router.push(Routes.product(r.slug!)); handleClose() }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex items-center gap-4">
                    {rImgUrl ? (
                      <div className="w-10 h-10 relative rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0 shadow-sm">
                        <Image src={rImgUrl} alt={r.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-steel-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-industrial-gray group-hover:text-primary-navy transition-colors">{highlightMatch(r.name, debounced)}</div>
                      <div className="text-xs text-steel-gray flex items-center gap-1.5 mt-0.5">
                        {r.brand && <span className="font-semibold text-slate-600">{highlightMatch(r.brand, debounced)}</span>}
                        {r.brand && <span className="text-gray-300">•</span>}
                        <span>{highlightMatch(r.sku, debounced)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`transition-opacity flex items-center gap-2 ${isActive ? 'opacity-100 text-primary-navy' : 'opacity-0 text-primary-ocean group-hover:opacity-100'}`}>
                    <span className="text-xs font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 hidden sm:inline-block shadow-sm">{t('search.overlay.enterKey')}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center pt-4 sm:pt-16 pb-4 px-2">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={handleClose} 
        onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
        role="presentation"
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col max-h-full"
      >
          {/* Header / Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white relative z-10">
            <svg className="w-5 h-5 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholderAi')}
              className="flex-1 text-lg placeholder:text-gray-400 focus-visible:outline-none text-industrial-gray bg-transparent font-medium"
            />
            {loading && (
              <svg className="animate-spin h-5 w-5 text-primary-ocean mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <button
              onClick={handleClose}
              className="px-2.5 py-1.5 text-xs font-bold text-steel-gray bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-slate-900 transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy"
              aria-label={t('common.close')}
            >
              ESC
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
            {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-medium">{error}</div>}

            {!error && !loading && (
              <>
                {viewState === 'IDLE' && renderIdle()}
                {viewState === 'SUGGESTING' && renderSuggestions()}
                {viewState === 'RESULTS' && renderResults()}
              </>
            )}
          </div>

          {/* Footer Hint */}
          {(viewState === 'SUGGESTING' || viewState === 'RESULTS') && (suggestions.length > 0 || results.length > 0) && (
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-steel-gray">
              <span className="flex items-center gap-1">
                <span className="bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm leading-none">{t('search.overlay.arrowUp')}</span>
                <span className="bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm leading-none">{t('search.overlay.arrowDown')}</span>
                <span className="ml-1">{t('search.keyboardHint')}</span>
              </span>
              <span className="flex items-center gap-1">
                {t('search.enterHint')} <strong className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm ml-1 text-slate-700">{t('search.overlay.enterKey')}</strong>
              </span>
            </div>
          )}
      </div>
    </div>
  )
}

export default React.memo(SearchOverlay)
