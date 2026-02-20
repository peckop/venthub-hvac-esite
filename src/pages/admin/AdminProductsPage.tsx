import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import type { Density } from '../../components/admin/ColumnsMenu'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { ProductFormModal } from '../../components/admin/products/ProductFormModal'

interface ProductRow {
  id: string
  name: string
  sku: string
  model_code?: string | null
  brand?: string | null
  status?: string | null
  category_id?: string | null
  price?: number | null
  purchase_price?: number | null
  stock_qty?: number | null
  low_stock_threshold?: number | null
  is_featured?: boolean | null
}

interface CategoryOpt { id: string; name: string }

const AdminProductsPage: React.FC = () => {
  const { t, lang } = useI18n()
  const [rows, setRows] = React.useState<ProductRow[]>([])
  const [cats, setCats] = React.useState<CategoryOpt[]>([])
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Pagination
  const PAGE_SIZE = 50
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  // Toolbar filtreleri
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('')
  const [statusFilter, setStatusFilter] = React.useState<{ active: boolean; inactive: boolean; out_of_stock: boolean }>({ active: false, inactive: false, out_of_stock: false })
  const [featuredOnly, setFeaturedOnly] = React.useState<boolean>(false)

  // Columns & density
  const STORAGE_KEY = 'toolbar:products'
  const [visibleCols, setVisibleCols] = React.useState<{ image: boolean; name: boolean; sku: boolean; category: boolean; status: boolean; price: boolean; stock: boolean; actions: boolean }>({ image: true, name: true, sku: true, category: true, status: true, price: true, stock: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')

  const [covers, setCovers] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const c = localStorage.getItem(`${STORAGE_KEY}:cols`);
      if (c) setVisibleCols(prev => ({ ...prev, ...JSON.parse(c) }));
      const d = localStorage.getItem(`${STORAGE_KEY}:density`);
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
    } catch { }
  }, [])
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch { }
  }, [visibleCols])
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch { }
  }, [density])
  const headPad = density === 'compact' ? 'px-2 py-2' : ''
  const cellPad = density === 'compact' ? 'px-2 py-2' : ''

  // Persist sort settings
  type SortKey = 'name' | 'sku' | 'category' | 'status' | 'price' | 'stock'
  const SORT_KEY_STORAGE = `${STORAGE_KEY}:sortKey`
  const SORT_DIR_STORAGE = `${STORAGE_KEY}:sortDir`
  const [sortKey, setSortKey] = React.useState<SortKey>(() => {
    try { const v = localStorage.getItem(SORT_KEY_STORAGE) as SortKey | null; if (v === 'name' || v === 'sku' || v === 'category' || v === 'status' || v === 'price' || v === 'stock') return v; } catch { }
    return 'name'
  })
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(() => {
    try { const v = localStorage.getItem(SORT_DIR_STORAGE) as 'asc' | 'desc' | null; if (v === 'asc' || v === 'desc') return v } catch { }
    return 'asc'
  })
  React.useEffect(() => { try { localStorage.setItem(SORT_KEY_STORAGE, sortKey) } catch { } }, [sortKey, SORT_KEY_STORAGE])
  React.useEffect(() => { try { localStorage.setItem(SORT_DIR_STORAGE, sortDir) } catch { } }, [sortDir, SORT_DIR_STORAGE])

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Build products query with server-side filters and pagination
      let query = supabase
        .from('products')
        .select('id,name,sku,model_code,brand,status,category_id,price,purchase_price,stock_qty,low_stock_threshold,is_featured,slug', { count: 'exact' })

      // Filters
      if (selectedCategoryFilter) query = query.eq('category_id', selectedCategoryFilter)
      if (featuredOnly) query = query.eq('is_featured', true)
      const anyStatus = statusFilter.active || statusFilter.inactive || statusFilter.out_of_stock
      if (anyStatus) {
        const statuses: string[] = []
        if (statusFilter.active) statuses.push('active')
        if (statusFilter.inactive) statuses.push('inactive')
        if (statusFilter.out_of_stock) statuses.push('out_of_stock')
        if (statuses.length === 1) query = query.eq('status', statuses[0])
        else if (statuses.length > 1) query = query.in('status', statuses)
      }
      const term = debouncedQ.trim()
      if (term) {
        // Sanitize term to prevent PostgREST delimiter issues in .or()
        const safeTerm = term.replace(/[(),]/g, ' ')
        const like = `%${safeTerm}%`
        query = query.or(`name.ilike.${like},sku.ilike.${like},model_code.ilike.${like},brand.ilike.${like},slug.ilike.${like}`)
      }

      // Sorting (only supported keys)
      const sortableMap: Record<SortKey, string | null> = { name: 'name', sku: 'sku', category: null, status: 'status', price: 'price', stock: 'stock_qty' }
      const col = sortableMap[sortKey]
      if (col) query = query.order(col, { ascending: sortDir === 'asc' })
      else query = query.order('name', { ascending: true })

      // Pagination
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error
      const list = (data || []) as ProductRow[]
      setRows(list)
      setTotal(typeof count === 'number' ? count : 0)

      // Categories + settings
      const [c, s] = await Promise.all([
        supabase.from('categories').select('id,name').order('name', { ascending: true }),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
      ])
      if (c.error) throw c.error
      setCats((c.data || []) as CategoryOpt[])
      if (!s.error) {
        // default threshold logic removed as unused state caused infinite loop
      }

      // Cover images for current page
      const ids = list.map(x => x.id)
      if (ids.length > 0) {
        try {
          // Chunk IDs to avoid URL length constraints (CORS/502 errors)
          const chunkSize = 20
          const chunks: string[][] = []
          for (let i = 0; i < ids.length; i += chunkSize) chunks.push(ids.slice(i, i + chunkSize))

          const results = await Promise.all(chunks.map(c =>
            supabase.from('product_images').select('product_id,path,sort_order').in('product_id', c).order('sort_order', { ascending: true })
          ))

          const map: Record<string, string> = {}
          results.forEach(({ data }) => {
            if (data) {
              (data as { product_id: string; path: string; sort_order: number }[]).forEach(r => {
                if (map[r.product_id] == null) map[r.product_id] = r.path
              })
            }
          })
          setCovers(map)
        } catch (err) {
          console.warn('Cover image fetch failed (non-fatal):', err)
        }
      }
    } catch (e) {
      console.error('Load Error:', e)
      setError((e as Error).message || 'Ürünler yüklenemedi')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [selectedCategoryFilter, featuredOnly, statusFilter, debouncedQ, sortKey, sortDir, page])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  // Server-side filtered rows already; keep as identity
  const filtered = React.useMemo(() => rows, [rows])

  const handleCreate = () => {
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    load()
    // Modal will be closed by the modal itself or we can close it here if needed, 
    // but the modal calls onSuccess then onOpenChange(false) usually.
    // Actually our modal implementation calls onSuccess then onOpenChange(false).
    // So we just need to reload data.
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.products.confirm.deleteProduct'))) return
    try {
      const before = rows.find(r => r.id === id) || null
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'products', row_pk: id, action: 'DELETE', before, after: null, comment: 'remove product' })
      await load()
    } catch (e) {
      alert(t('admin.products.toasts.deleteFailed', { msg: ((e as Error).message || String(e)) }))
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }
  const sortIndicator = (key: SortKey) => sortKey !== key ? '' : (sortDir === 'asc' ? '▲' : '▼')

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name': return dir * a.name.localeCompare(b.name, 'tr')
        case 'sku': return dir * a.sku.localeCompare(b.sku, 'tr')
        case 'category': {
          const an = cats.find(c => c.id === a.category_id)?.name || ''
          const bn = cats.find(c => c.id === b.category_id)?.name || ''
          return dir * an.localeCompare(bn, 'tr')
        }
        case 'status': return dir * (String(a.status || '').localeCompare(String(b.status || ''), 'tr'))
        case 'price': return dir * (((a.price ?? -Infinity) as number) - ((b.price ?? -Infinity) as number))
        case 'stock': return dir * (((a.stock_qty ?? -Infinity) as number) - ((b.stock_qty ?? -Infinity) as number))
        default: return 0
      }
    })
    return arr
  }, [filtered, sortKey, sortDir, cats])

  const statusBadge = (s?: string | null) => {
    const v = (s || '').toLowerCase()
    if (v === 'active') return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">{t('admin.products.statusLabels.active')}</span>
    if (v === 'inactive') return <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">{t('admin.products.statusLabels.inactive')}</span>
    if (v === 'out_of_stock') return <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">{t('admin.products.statusLabels.out_of_stock')}</span>
    return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">-</span>
  }

  const [importPreview, setImportPreview] = React.useState<{ header: string[]; rows: Record<string, string>[]; total: number } | null>(null)
  const [importRows, setImportRows] = React.useState<Record<string, string>[] | null>(null)

  const ColumnsMenu = React.useMemo(() => React.lazy(() => import('../../components/admin/ColumnsMenu')), [])
  const ExportMenu = React.useMemo(() => React.lazy(() => import('../../components/admin/ExportMenu')), [])

  // Memoize select config with stable onChange reference
  const handleCategoryChange = React.useCallback((value: string) => {
    setSelectedCategoryFilter(value)
  }, [])

  const selectConfig = React.useMemo(() => ({
    value: selectedCategoryFilter,
    onChange: handleCategoryChange,
    title: t('admin.products.toolbar.categoryTitle') ?? 'Kategori',
    options: [{ value: '', label: t('admin.products.toolbar.allCategories') ?? 'Tüm Kategoriler' }, ...cats.map(c => ({ value: c.id, label: c.name }))]
  }), [selectedCategoryFilter, t, cats, handleCategoryChange])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.products') ?? 'Ürünler'}</h1>
        <button onClick={handleCreate} className={`${adminButtonPrimaryClass} flex items-center gap-2`}>
          <span>+</span> {t('admin.products.edit.actions.new') ?? 'Yeni Ürün'}
        </button>
      </div>

      {/* SIMPLE DIRECT SEARCH INPUT - NO ADMIN TOOLBAR COMPLEXITY */}
      <div className={adminCardClass + " p-4"}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              className="w-full border border-light-gray rounded-md px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white"
              placeholder={t('admin.search.products') ?? 'ürün adı/SKU/marka/slug ara'}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {q && (
            <button
              onClick={() => setQ('')}
              className="text-sm text-steel-gray hover:text-primary-navy"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      <AdminToolbar
        storageKey="toolbar:products"
        sticky
        select={selectConfig}
        chips={[
          { key: 'active', label: t('admin.products.statusLabels.active'), active: statusFilter.active, onToggle: () => setStatusFilter(s => ({ ...s, active: !s.active })) },
          { key: 'inactive', label: t('admin.products.statusLabels.inactive'), active: statusFilter.inactive, onToggle: () => setStatusFilter(s => ({ ...s, inactive: !s.inactive })) },
          { key: 'out_of_stock', label: t('admin.products.statusLabels.out_of_stock'), active: statusFilter.out_of_stock, onToggle: () => setStatusFilter(s => ({ ...s, out_of_stock: !s.out_of_stock })) },
        ]}
        toggles={[{ key: 'featured', label: t('admin.products.toggles.featuredOnly'), checked: featuredOnly, onChange: setFeaturedOnly }]}
        onClear={() => { setQ(''); setSelectedCategoryFilter(''); setStatusFilter({ active: false, inactive: false, out_of_stock: false }); setFeaturedOnly(false); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <input id="prod-import-input" type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const text = await f.text()
              const lines = text.replace(/^\ufeff/, '').split(/\r?\n/).filter(l => l.trim().length > 0)
              const split = (s: string) => s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
              const header = split(lines[0]).map(h => h.trim().toLowerCase())
              const rows = lines.slice(1).map(l => { const cells = split(l); const obj: Record<string, string> = {}; header.forEach((h, i) => obj[h] = cells[i] || ''); return obj })
              setImportRows(rows)
              setImportPreview({ header, rows: rows.slice(0, 10), total: rows.length })
            }} />
            <button onClick={() => document.getElementById('prod-import-input')?.click()} className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">{t('admin.products.import.button')}</button>
            <React.Suspense fallback={<button className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white text-sm opacity-70" disabled>Görünüm…</button>}>
              <ColumnsMenu
                columns={[
                  { key: 'image', label: t('admin.products.table.image'), checked: visibleCols.image, onChange: (v) => setVisibleCols(s => ({ ...s, image: v })) },
                  { key: 'name', label: t('admin.products.table.name'), checked: visibleCols.name, onChange: (v) => setVisibleCols(s => ({ ...s, name: v })) },
                  { key: 'sku', label: t('admin.products.table.sku'), checked: visibleCols.sku, onChange: (v) => setVisibleCols(s => ({ ...s, sku: v })) },
                  { key: 'category', label: t('admin.products.table.category'), checked: visibleCols.category, onChange: (v) => setVisibleCols(s => ({ ...s, category: v })) },
                  { key: 'status', label: t('admin.products.table.status'), checked: visibleCols.status, onChange: (v) => setVisibleCols(s => ({ ...s, status: v })) },
                  { key: 'price', label: t('admin.products.table.price'), checked: visibleCols.price, onChange: (v) => setVisibleCols(s => ({ ...s, price: v })) },
                  { key: 'stock', label: t('admin.products.table.stock'), checked: visibleCols.stock, onChange: (v) => setVisibleCols(s => ({ ...s, stock: v })) },
                  { key: 'actions', label: t('admin.products.table.actions'), checked: visibleCols.actions, onChange: (v) => setVisibleCols(s => ({ ...s, actions: v })) },
                ]}
                density={density}
                onDensityChange={setDensity}
              />
            </React.Suspense>
            <React.Suspense fallback={<button className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white text-sm opacity-70" disabled>İndir…</button>}>
              <ExportMenu
                items={[
                  {
                    key: 'csv', label: t('admin.products.export.csvLabel'), onSelect: () => {
                      const cols = ['id', 'name', 'sku', 'category_id', 'status', 'price', 'stock_qty']
                      const header = cols.join(',')
                      const lines = sorted.map(r => [
                        r.id, `"${(r.name || '').replace(/"/g, '""')}"`, r.sku, r.category_id || '', r.status || '', r.price != null ? String(r.price) : '', r.stock_qty != null ? String(r.stock_qty) : ''
                      ].join(','))
                      const csv = '\ufeff' + [header, ...lines].join('\n')
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'products.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }
                  }
                ]}
              />
            </React.Suspense>
          </div>
        )}
      />

      {importPreview && (
        <div className={`${adminCardClass} p-4`}>
          <div className="mb-2 text-sm text-industrial-gray">{t('admin.products.import.previewTitle', { total: importPreview.total }) ?? `CSV Önizleme (ilk 10 satır) — Toplam: ${importPreview.total}`}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {importPreview.header.map(h => (<th key={h} className="p-2 border-b text-left">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {importPreview.rows.map((r, idx) => (
                  <tr key={idx} className="border-b">
                    {importPreview.header.map(h => (<td key={h} className="p-2">{r[h]}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="px-3 h-10 rounded-md border border-light-gray bg-white hover:border-primary-navy text-xs" onClick={() => { setImportPreview(null); setImportRows(null); }}>{t('admin.products.import.close')}</button>
            <button className="px-3 h-10 rounded-md border border-light-gray bg-white text-xs" onClick={() => {
              const h = (importPreview?.header || [])
              const required = ['name', 'sku']
              const hasRequired = required.every(k => h.includes(k))
              const okCount = (importPreview?.rows || []).filter(r => r['name'] && r['sku']).length
              alert(t('admin.products.import.dryRunResult', { status: t(`admin.products.import.${hasRequired ? 'statusComplete' : 'statusMissing'}`), ok: okCount, total: importPreview?.total || 0 }))
            }}>{t('admin.products.import.dryRun')}</button>
            <button className="px-3 h-10 rounded-md bg-primary-navy text-white text-xs" onClick={async () => {
              if (!importRows || !importPreview) return alert(t('admin.products.import.needCsv'))
              const h = importPreview.header
              if (!h.includes('sku') || !h.includes('name')) { alert(t('admin.products.import.minColumns')); return }
              const mapCategorySlugToId = (slug: string) => {
                const s = (slug || '').toLowerCase().trim()
                const found = cats.find(c => c.name.toLowerCase() === s)
                return found?.id || null
              }
              const payloads: { sku: string; name: string; model_code?: string | null; brand?: string; status?: string; price?: number; stock_qty?: number; low_stock_threshold?: number | null; category_id?: string | null }[] = []
              for (const r of importRows) {
                if (!r['sku'] || !r['name']) continue
                const p: { sku: string; name: string; model_code?: string | null; brand?: string; status?: string; price?: number; stock_qty?: number; low_stock_threshold?: number | null; category_id?: string | null } = {
                  sku: r['sku'].trim(),
                  name: r['name'].trim(),
                }
                if (r['model_code']) p.model_code = r['model_code'].trim()
                else if (r['model']) p.model_code = r['model'].trim()
                if (r['brand']) p.brand = r['brand'].trim()
                if (r['status']) p.status = r['status'].trim()
                if (r['price']) p.price = Number(r['price'])
                if (r['stock_qty']) p.stock_qty = Number(r['stock_qty'])
                if (r['low_stock_threshold']) p.low_stock_threshold = Number(r['low_stock_threshold'])
                if (r['category_id']) p.category_id = r['category_id'] || null
                else if (r['category_slug'] || r['category']) p.category_id = mapCategorySlugToId(r['category_slug'] || r['category'])
                payloads.push(p)
              }
              if (payloads.length === 0) { alert(t('admin.products.import.noneFound')); return }
              try {
                // chunked upsert by sku
                let ok = 0, fail = 0
                for (let i = 0; i < payloads.length; i += 100) {
                  const chunk = payloads.slice(i, i + 100)
                  const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'sku' })
                  if (error) { console.warn('import upsert error', error); fail += chunk.length } else ok += chunk.length
                }
                alert(t('admin.products.import.done', { ok, fail }))
                await load()
              } catch (e) {
                alert(t('admin.products.import.error', { msg: ((e as Error).message || String(e)) }))
              }
            }}>{t('admin.products.import.writeButton')}</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${adminCardClass} overflow-hidden`}>
        {error && <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>}
        <div className="p-2 flex items-center justify-between text-sm text-steel-gray">
          <div>{t('admin.ui.total') ?? 'Toplam'}: {total}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-light-gray bg-white disabled:opacity-50">{t('admin.ui.prev')}</button>
            <span>{t('admin.ui.pageLabel', { page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) })}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} className="px-3 py-1 rounded border border-light-gray bg-white disabled:opacity-50">{t('admin.ui.next')}</button>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.image && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>{t('admin.products.table.image')}</th>
              )}
              {visibleCols.name && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('name')}>{t('admin.products.table.name')} {sortIndicator('name')}</button>
                </th>
              )}
              {visibleCols.sku && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('sku')}>{t('admin.products.table.sku')} {sortIndicator('sku')}</button>
                </th>
              )}
              {visibleCols.category && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('category')}>{t('admin.products.table.category')} {sortIndicator('category')}</button>
                </th>
              )}
              {visibleCols.status && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('status')}>{t('admin.products.table.status')} {sortIndicator('status')}</button>
                </th>
              )}
              {visibleCols.price && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('price')}>{t('admin.products.table.price')} {sortIndicator('price')}</button>
                </th>
              )}
              {visibleCols.stock && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                  <button type="button" className="hover:underline" onClick={() => toggleSort('stock')}>{t('admin.products.table.stock')} {sortIndicator('stock')}</button>
                </th>
              )}
              {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>{t('admin.products.table.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>{t('admin.ui.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>{t('admin.ui.noRecords')}</td></tr>
            ) : (
              sorted.map(r => (
                <tr key={r.id} className="border-b border-light-gray/60">
                  {visibleCols.image && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      {covers[r.id] ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${covers[r.id]}`}
                          alt=""
                          className="w-10 h-10 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded" />
                      )}
                    </td>
                  )}
                  {visibleCols.name && <td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>}
                  {visibleCols.sku && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      {r.sku}
                      {r.model_code && <div className="text-xs text-gray-500 mt-0.5">{r.model_code}</div>}
                    </td>
                  )}
                  {visibleCols.category && <td className={`${adminTableCellClass} ${cellPad}`}>{cats.find(c => c.id === r.category_id)?.name || '-'}</td>}
                  {visibleCols.status && <td className={`${adminTableCellClass} ${cellPad}`}>{statusBadge(r.status)}</td>}
                  {visibleCols.price && <td className={`${adminTableCellClass} ${cellPad} text-right`}>{r.price != null ? formatCurrency(Number(r.price), lang) : '-'}</td>}
                  {visibleCols.stock && <td className={`${adminTableCellClass} ${cellPad} text-right`}>{(r.stock_qty != null ? Number(r.stock_qty) : null) ?? '-'}</td>}
                  {visibleCols.actions && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button className="px-2 py-1 rounded border text-xs" onClick={() => handleEdit(r.id)}>{t('admin.ui.edit')}</button>
                        <button className="px-2 py-1 rounded border text-xs text-red-600" onClick={() => remove(r.id)}>{t('admin.ui.delete')}</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        productId={editingId}
        onSuccess={handleModalSuccess}
        categories={cats.map(c => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}

export default AdminProductsPage
