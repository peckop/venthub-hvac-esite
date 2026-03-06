import React from 'react'
import { useRouter } from 'next/navigation'
import type { FtsProductResult, SearchSuggestion } from '../lib/supabase'
import { formatCurrency } from '../i18n/format'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

type ViewState = 'IDLE' | 'SUGGESTING' | 'RESULTS'

const RECENT_SEARCHES_KEY = 'venthub_recent_searches'

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const [q, setQ] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [viewState, setViewState] = React.useState<ViewState>('IDLE')

  // Data
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([])
  const [results, setResults] = React.useState<FtsProductResult[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load recent searches on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  // Debounce logic
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200)
    return () => clearTimeout(t)
  }, [q])

  // Main search logic
  React.useEffect(() => {
    let active = true

    async function fetchData() {
      if (!open) return

      // Case 1: Empty input -> IDLE
      if (!debounced) {
        setViewState('IDLE')
        setSuggestions([])
        setResults([])
        return
      }

      // Case 2: Input exists -> Decide based on length or user action
      // For now, let's treat generic typing as SUGGESTING, and explicit Enter as RESULTS (handled in onKeyDown)
      // But we also want "live results" if suggestions are sparse? 
      // Plan: Fetch suggestions on type. Enter forces full FTS.

      try {
        setLoading(true)
        const { getSearchSuggestions } = await import('../lib/supabase')
        const items = await getSearchSuggestions(debounced, 6)

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
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Handlers
  const handleClose = () => {
    setQ('')
    setResults([])
    setSuggestions([])
    setViewState('IDLE')
    onClose()
  }

  const addToRecent = (term: string) => {
    const next = [term, ...recentSearches.filter(x => x !== term)].slice(0, 5)
    setRecentSearches(next)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  const performFullSearch = async (term: string) => {
    if (!term) return
    setLoading(true)
    setError(null)
    setViewState('RESULTS')
    addToRecent(term)

    try {
      const { ftsSearchProducts } = await import('../lib/supabase')
      const rows = await ftsSearchProducts(term, 20)
      setResults(rows)
    } catch {
      setError('Arama sırasında hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
    if (e.key === 'Enter') performFullSearch(q)
  }

  // Render Helpers
  const renderSuggestion = (s: SearchSuggestion, idx: number) => {
    const icon = s.type === 'product' ? (
      <svg className="w-4 h-4 text-steel-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    ) : s.type === 'category' ? (
      <svg className="w-4 h-4 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ) : (
      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    )

    const label = s.type === 'brand' ? `Marka: ${s.label}` : s.label

    return (
      <button
        key={`${s.type}-${idx}`}
        onClick={() => {
          router.push(s.url)
          addToRecent(q)
          handleClose()
        }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors group"
      >
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-industrial-gray">{label}</div>
          {s.type === 'product' && (s.metadata as any)?.sku && (
            <div className="text-xs text-steel-gray mt-0.5">
              {(s.metadata as any).brand && <span className="font-semibold">{(s.metadata as any).brand}</span>}
              {(s.metadata as any).brand && (s.metadata as any).sku && <span> • </span>}
              {(s.metadata as any).sku}
            </div>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 text-primary-ocean">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </button>
    )
  }

  // --- VIEW: IDLE ---
  const renderIdle = () => (
    <div className="py-2">
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-semibold text-steel-gray uppercase tracking-wider">Son Aramalar</h3>
            <button
              onClick={() => {
                setRecentSearches([])
                localStorage.removeItem(RECENT_SEARCHES_KEY)
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Temizle
            </button>
          </div>
          <ul>
            {recentSearches.map((term, i) => (
              <li key={i}>
                <button
                  onClick={() => { setQ(term); performFullSearch(term); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm text-industrial-gray"
                >
                  <svg className="w-4 h-4 text-steel-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="px-4 mb-2 text-xs font-semibold text-steel-gray uppercase tracking-wider">Popüler Kategoriler</h3>
        <div className="px-4 flex flex-wrap gap-2">
          {['Fanlar', 'Hava Perdeleri', 'Isı Geri Kazanım'].map(cat => (
            <button
              key={cat}
              onClick={() => { router.push(`/category/${cat.toLowerCase().replace(/ /g, '-')}`); handleClose(); }}
              className="px-3 py-1.5 bg-gray-50 text-sm text-industrial-gray rounded-full border border-gray-200 hover:border-primary-ocean hover:text-primary-ocean transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // --- VIEW: SUGGESTING ---
  const renderSuggestions = () => {
    if (suggestions.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-steel-gray">
          Sonuç bulunamadı. <br />
          <button
            onClick={() => performFullSearch(debounced)}
            className="text-primary-ocean font-medium mt-1 hover:underline"
          >
            "{debounced}" için detaylı ara
          </button>
        </div>
      )
    }

    // Group by Type roughly or just list them (current RPC returns mixed sorted by relevance)
    return (
      <div className="py-2 divide-y divide-gray-100">
        {suggestions.map((s, idx) => renderSuggestion(s, idx))}
        <button
          onClick={() => performFullSearch(debounced)}
          className="w-full text-center py-3 text-sm text-primary-ocean font-medium hover:bg-gray-50 border-t"
        >
          Tüm sonuçları gör ({debounced})
        </button>
      </div>
    )
  }

  // --- VIEW: RESULTS (Full Search) ---
  const renderResults = () => {
    if (results.length === 0) {
      return <div className="p-8 text-center text-industrial-gray">Sonuç bulunamadı.</div>
    }

    const hasFuzzy = results.some(r => r.is_fuzzy_match)

    return (
      <div className="pb-2">
        {hasFuzzy && (
          <div className="bg-yellow-50 px-4 py-2 text-sm text-yellow-800 border-b border-yellow-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Tam eşleşme bulunamadı, benzer sonuçlar gösteriliyor.</span>
          </div>
        )}
        <ul className="divide-y">
          {results.map((r) => (
            <li key={r.id}>
              <button
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group"
                onClick={() => { router.push(`/products/${r.id}`); handleClose() }}
              >
                <div>
                  <div className="font-medium text-industrial-gray group-hover:text-primary-navy transition-colors">{r.name}</div>
                  <div className="text-xs text-steel-gray flex items-center gap-1">
                    {r.brand && <span className="font-semibold text-slate-600">{r.brand}</span>}
                    {r.brand && <span>•</span>}
                    <span>{r.sku}</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-primary-ocean opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Detay
                  <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="max-w-2xl mx-auto mt-4 sm:mt-16 bg-white rounded-xl shadow-2xl overflow-hidden transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <svg className="w-5 h-5 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ürün, kategori veya marka ara..."
            className="flex-1 text-lg placeholder:text-gray-400 focus:outline-none text-industrial-gray"
          />
          {loading && (
            <svg className="animate-spin h-5 w-5 text-primary-ocean" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <button
            onClick={handleClose}
            className="px-2 py-1 text-xs font-medium text-steel-gray bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {error && <div className="p-4 bg-red-50 text-red-600 text-sm">{error}</div>}

          {!error && !loading && (
            <>
              {viewState === 'IDLE' && renderIdle()}
              {viewState === 'SUGGESTING' && renderSuggestions()}
              {viewState === 'RESULTS' && renderResults()}
            </>
          )}
        </div>

        {/* Footer Hint */}
        {viewState === 'SUGGESTING' && suggestions.length > 0 && (
          <div className="bg-gray-50 px-4 py-2 border-t flex justify-between items-center text-xs text-steel-gray">
            <span>Ok tuşları ile gezinebilirsiniz</span>
            <span>Tüm sonuçlar için <strong>Enter</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchOverlay




