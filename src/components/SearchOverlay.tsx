import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { ftsSearchProducts, FtsProductResult } from '../lib/supabase'
import { formatCurrency } from '../i18n/format'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const [q, setQ] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<FtsProductResult[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250)
    return () => clearTimeout(t)
  }, [q])

  React.useEffect(() => {
    let active = true
    async function run() {
      if (!open) return
      if (!debounced) {
        setResults([])
        setError(null)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const rows = await ftsSearchProducts(debounced, 20)
        if (active) setResults(rows)
      } catch {
        if (active) setError('Arama sırasında hata oluştu')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [debounced, open])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-steel-gray" />
          <input
            autoFocus
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Ürün, model veya SKU ara"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy"
            type="text"
          />
          <button aria-label="Kapat" onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {loading && <div className="text-sm text-steel-gray">Yükleniyor…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          results.length === 0 ? (
            <div className="text-sm text-steel-gray">Sonuç yok.</div>
          ) : (
            <ul className="divide-y border rounded-lg overflow-hidden">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => { navigate(`/product/${r.id}`); onClose() }}
                  >
                    <div>
                      <div className="font-medium text-industrial-gray">{r.name}</div>
                      <div className="text-xs text-steel-gray">{r.brand || ''} • {r.sku}</div>
                    </div>
                    <div className="text-sm text-industrial-gray font-medium">
                      {r.price != null ? formatCurrency(Number(r.price) || 0, 'tr') : ''}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  )
}

export default SearchOverlay
