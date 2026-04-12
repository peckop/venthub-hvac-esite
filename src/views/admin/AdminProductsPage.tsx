import { VentImage } from '@/components/ui/VentImage'
import React from 'react'
import { supabase, adminSearchProducts, type DbAdminSearchResult } from '../../lib/supabase'
import type { DbProduct } from '../../types/db-rows'
import { toUIProductList, type DomainProduct } from '../../lib/type-converters'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useSearchParams, usePathname } from 'next/navigation'
import AdminToolbar from '../../components/admin/AdminToolbar'
import type { Density } from '../../components/admin/ColumnsMenu'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminTableContainerClass,
  adminButtonPrimaryClass, 
  adminButtonSecondaryClass,
  adminTableActionClass, 
  adminTableActionDangerClass 
} from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import ProductFormModal from '../../components/admin/products/ProductFormModal'
import ProductCsvImport from '../../components/admin/products/ProductCsvImport'
import BulkActionToolbar from '../../components/admin/BulkActionToolbar'
import ProductHealthBadge from '../../components/admin/products/ProductHealthBadge'
import { ChevronRight, Pencil, Plus, SearchX } from 'lucide-react'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useRole } from '../../hooks/useRole'
import { useDragScroll } from '../../hooks/useDragScroll'

interface CategoryOpt { id: string; name: string }

const AdminProductsPage: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('products')
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  const searchParams = useSearchParams()
  const [rows, setRows] = React.useState<DomainProduct[]>([])
  const [cats, setCats] = React.useState<CategoryOpt[]>([])
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const deepLinkAppliedRef = React.useRef(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Multi-select (Bulk)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const toggleSelect = (id: string) => setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id) } else { next.add(id) } return next })
  const toggleSelectAll = () => {
    if (selectedIds.size === rows.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(rows.map(r => r.id)))
  }

  // Inline edit
  const [inlineEdit, setInlineEdit] = React.useState<{ id: string; field: 'price' | 'stock_qty'; value: string } | null>(null)

  // Expandable rows
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  const toggleExpand = (id: string) => setExpandedIds(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id) } else { next.add(id) } return next })
  const [techSpecs, setTechSpecs] = React.useState<Record<string, Record<string, string>>>({})

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
  const [visibleCols, setVisibleCols] = React.useState<{ image: boolean; name: boolean; sku: boolean; category: boolean; status: boolean; health: boolean; price: boolean; stock: boolean; actions: boolean }>({ image: true, name: true, sku: true, category: true, status: true, health: true, price: true, stock: true, actions: true })
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

  // Process deep links (q parameter)
  React.useEffect(() => {
    if (deepLinkAppliedRef.current) return
    const queryParam = searchParams?.get('q') || ''
    if (queryParam) {
      setQ(queryParam)
      setDebouncedQ(queryParam)
      deepLinkAppliedRef.current = true
    }
  }, [searchParams])

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Proaktif oturum kontrolü
      await ensureSessionFresh()

      const term = debouncedQ.trim()
      let list: DomainProduct[] = []
      let totalCount = 0

      if (term) {
        // ── FTS RPC ile akıllı arama ──
        const offset = (page - 1) * PAGE_SIZE
        const results = await adminSearchProducts(
          term,
          PAGE_SIZE,
          offset,
          selectedCategoryFilter || undefined
        )

        // RPC sonuçlarını client-side status/featured filtrelerine uygula
        let filtered: DbAdminSearchResult[] = results as DbAdminSearchResult[]
        const anyStatus = statusFilter.active || statusFilter.inactive || statusFilter.out_of_stock
        if (anyStatus) {
          const statuses: string[] = []
          if (statusFilter.active) statuses.push('active')
          if (statusFilter.inactive) statuses.push('inactive')
          if (statusFilter.out_of_stock) statuses.push('out_of_stock')
          filtered = filtered.filter(r => statuses.includes(r.status || ''))
        }
        if (featuredOnly) {
          filtered = filtered.filter(r => r.is_featured)
        }


        list = toUIProductList(filtered as DbProduct[])
        // total_count: RPC window function üzerinden gelir
        totalCount = results.length > 0 ? Number((results[0] as { total_count?: number }).total_count || results.length) : 0
      } else {
        // ── Normal Supabase query (arama terimi yokken) ──
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

        // Sorting
        const sortableMap: Record<SortKey, string | null> = { name: 'name', sku: 'sku', category: null, status: 'status', price: 'price', stock: 'stock_qty' }
        const col = sortableMap[sortKey]
        if (col) query = query.order(col, { ascending: sortDir === 'asc' })
        else query = query.order('name', { ascending: true })

        // Pagination
        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        const { data, error, count } = await query.range(from, to)
        if (error) throw error

        list = toUIProductList((data as DbProduct[]) || [])
        totalCount = typeof count === 'number' ? count : 0
      }

      setRows(list)
      setTotal(totalCount)

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

  const pathname = usePathname()
  React.useEffect(() => { load() }, [load, pathname])

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

  // Bulk Handlers
  const bulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return
    if (!confirm(`Seçili ${selectedIds.size} ürünün durumunu "${status}" olarak güncellemek istediğinize emin misiniz?`)) return
    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('products').update({ status }).in('id', ids)
      if (error) throw error
      setSelectedIds(new Set())
      await load()
    } catch (e) { alert('Toplu güncelleme hatası: ' + (e as Error).message) }
  }

  const bulkFeatureToggle = async (featured: boolean) => {
    if (selectedIds.size === 0) return
    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('products').update({ is_featured: featured }).in('id', ids)
      if (error) throw error
      setSelectedIds(new Set())
      await load()
    } catch (e) { alert('Vitrin güncelleme hatası: ' + (e as Error).message) }
  }

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Seçili ${selectedIds.size} ürünü SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return
    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('products').delete().in('id', ids)
      if (error) throw error
      setSelectedIds(new Set())
      await load()
    } catch (e) { alert('Toplu silme hatası: ' + (e as Error).message) }
  }

  const bulkPriceAdjust = async (mode: 'percent' | 'fixed', value: number) => {
    if (selectedIds.size === 0) return
    const label = mode === 'percent' ? `%${value}` : `₺${value}`
    if (!confirm(`Seçili ${selectedIds.size} ürüne ${label} fiyat güncellemesi uygulanacak. Onaylıyor musunuz?`)) return
    try {
      const ids = Array.from(selectedIds)
      const { data: products, error: fetchErr } = await supabase.from('products').select('id,price,name,sku,brand').in('id', ids)
      if (fetchErr) throw fetchErr
      const updates = (products || []).map((p: { id: string; price: number | null; name: string; sku: string; brand: string }) => {
        const currentPrice = p.price ?? 0
        const newPrice = mode === 'percent'
          ? Math.round(currentPrice * (1 + value / 100) * 100) / 100
          : Math.round((currentPrice + value) * 100) / 100
        return { id: p.id, price: Math.max(0, newPrice) }
      })

      const results = await Promise.all(
        updates.map(u => supabase.from('products').update({ price: u.price }).eq('id', u.id))
      )
      const errorResult = results.find(r => r.error)
      if (errorResult?.error) throw errorResult.error
      setSelectedIds(new Set())
      await load()
    } catch (e) { alert('Fiyat güncelleme hatası: ' + (e as Error).message) }
  }

  // Inline edit save
  const saveInlineEdit = async () => {
    if (!inlineEdit) return
    const numVal = parseFloat(inlineEdit.value)
    if (isNaN(numVal)) { setInlineEdit(null); return }
    try {
      const payload: Partial<DomainProduct> = inlineEdit.field === 'price' ? { price: numVal } : { stock_qty: numVal }
      const { error } = await supabase.from('products').update(payload).eq('id', inlineEdit.id)
      if (error) throw error
      setRows(prev => prev.map(r => r.id === inlineEdit.id ? { ...r, ...payload } : r))
      setInlineEdit(null)
    } catch (e) { alert('Kayıt hatası: ' + (e as Error).message) }
  }

  // Load tech specs for expanded row
  const loadTechSpecs = async (_productId: string) => {
    if (techSpecs[_productId]) return
    try {
      const { data } = await supabase.from('products').select('technical_specs').eq('id', _productId).maybeSingle()
      if (data?.technical_specs && typeof data.technical_specs === 'object') {
        setTechSpecs(prev => ({ ...prev, [_productId]: data.technical_specs as Record<string, string> }))
      } else {
        setTechSpecs(prev => ({ ...prev, [_productId]: {} }))
      }
    } catch { setTechSpecs(prev => ({ ...prev, [_productId]: {} })) }
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
    const baseClass = "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border"
    if (v === 'active') return <span className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>{t('admin.products.statusLabels.active')}</span>
    if (v === 'inactive') return <span className={`${baseClass} bg-slate-500/10 text-slate-400 border-white/5`}>{t('admin.products.statusLabels.inactive')}</span>
    if (v === 'out_of_stock') return <span className={`${baseClass} bg-rose-500/10 text-rose-400 border-rose-500/20`}>{t('admin.products.statusLabels.out_of_stock')}</span>
    return <span className={`${baseClass} bg-slate-500/10 text-slate-500 border-white/5`}>-</span>
  }


  const ColumnsMenu = React.useMemo(() => React.lazy(() => import('../../components/admin/ColumnsMenu')), [])
  const ExportMenu = React.useMemo(() => React.lazy(() => import('../../components/admin/ExportMenu')), [])

  // Memoize select config with stable onChange reference
  const handleCategoryChange = React.useCallback((value: string) => {
    setSelectedCategoryFilter(value)
  }, [])

  const selectConfig = React.useMemo(() => ({
    value: selectedCategoryFilter,
    onChange: handleCategoryChange,
    options: [{ value: '', label: t('admin.products.toolbar.allCategories') || 'TÜM KATEGORİLER' }, ...cats.map(c => ({ value: c.id, label: c.name.toUpperCase() }))]
  }), [selectedCategoryFilter, t, cats, handleCategoryChange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className={adminSectionTitleClass}>{t('admin.titles.products') ?? 'Ürünler'}</h1>
          <p className={adminSubtitleClass}>Tüm ürün kataloğunu yönetin, stok ve fiyat güncellemelerini anlık olarak takip edin.</p>
        </div>
        {hasWriteAccess && (
          <button onClick={handleCreate} className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}>
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>{t('admin.products.edit.actions.new') ?? 'Yeni Ürün'}</span>
          </button>
        )}
      </div>

      <AdminToolbar
        storageKey="toolbar:products"
        sticky
        search={{
          value: q,
          onChange: setQ,
          placeholder: t('admin.search.products') ?? 'ürün adı/SKU/marka/slug ara',
          focusShortcut: '/'
        }}
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
            {hasWriteAccess && (
              <ProductCsvImport categories={cats} onSuccess={load} />
            )}
            <React.Suspense fallback={<button className={`${adminButtonSecondaryClass} opacity-70`} disabled>Görünüm…</button>}>
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
            <React.Suspense fallback={<button className={`${adminButtonSecondaryClass} opacity-70`} disabled>İndir…</button>}>
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

      <div className={adminTableContainerClass}>
        {error && <div className="p-4 text-rose-400 text-xs font-bold bg-rose-500/10 border-b border-white/5 animate-pulse flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" />{error}</div>}
        
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.ui.total') ?? 'Toplam'}: <span className="text-cyan-400">{total}</span> Ürün</div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page <= 1} 
              className="w-8 h-8 flex items-center justify-center rounded-lg glass border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <span className="text-[10px] font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 min-w-[100px] text-center uppercase tracking-tighter">
              {t('admin.ui.pageLabel', { page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) })}
            </span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} 
              className="w-8 h-8 flex items-center justify-center rounded-lg glass border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div ref={dragScrollRef} className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="glass-strong">
                <th className={`${adminTableHeadCellClass} ${headPad} w-10 text-center py-4`}>
                  {hasWriteAccess && (
                    <input 
                      type="checkbox" 
                      checked={rows.length > 0 && selectedIds.size === rows.length} 
                      onChange={toggleSelectAll} 
                      className="rounded-md border-white/10 bg-white/5 text-cyan-400 focus:ring-cyan-400/30 focus:ring-offset-0 w-4 h-4" 
                    />
                  )}
                </th>
                <th className={`${adminTableHeadCellClass} ${headPad} w-8 py-4`} />
                {visibleCols.image && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>{t('admin.products.table.image')}</th>
                )}
                {visibleCols.name && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('name')}>
                      {t('admin.products.table.name')} 
                      <span className="text-cyan-400/50">{sortIndicator('name')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.sku && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('sku')}>
                      {t('admin.products.table.sku')} 
                      <span className="text-cyan-400/50">{sortIndicator('sku')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.category && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('category')}>
                      {t('admin.products.table.category')} 
                      <span className="text-cyan-400/50">{sortIndicator('category')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.status && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('status')}>
                      {t('admin.products.table.status')} 
                      <span className="text-cyan-400/50">{sortIndicator('status')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.health && (
                  <th className={`${adminTableHeadCellClass} ${headPad} text-center`}>
                    Performans
                  </th>
                )}
                {visibleCols.price && (
                  <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                    <button type="button" className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('price')}>
                      {t('admin.products.table.price')} 
                      <span className="text-cyan-400/50">{sortIndicator('price')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.stock && (
                  <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                    <button type="button" className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors uppercase tracking-widest" onClick={() => toggleSort('stock')}>
                      {t('admin.products.table.stock')} 
                      <span className="text-cyan-400/50">{sortIndicator('stock')}</span>
                    </button>
                  </th>
                )}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} text-center`}>{t('admin.products.table.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-0">
                    <AdminSkeleton variant="table" count={10} rows={5} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-0">
                    <AdminEmptyState
                      icon={SearchX}
                      title={t('admin.ui.noRecords') || 'Kayıt bulunamadı'}
                      description="Arama kriterlerinize uyan ürün bulunamadı. Lütfen filtreleri değiştirin veya yeni ürün ekleyin."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map(r => {
                  const isExpanded = expandedIds.has(r.id);
                  const isSelected = selectedIds.has(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <tr className={`group transition-all duration-300 ${isSelected ? 'bg-cyan-400/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                        <td className={`${adminTableCellClass} ${cellPad} w-10 text-center`}>
                          {hasWriteAccess && (
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => toggleSelect(r.id)} 
                              className="rounded-md border-white/10 bg-white/5 text-cyan-400 focus:ring-cyan-400/30 focus:ring-offset-0" 
                            />
                          )}
                        </td>
                        <td className={`${adminTableCellClass} ${cellPad} w-8`}>
                          <button 
                            onClick={() => { toggleExpand(r.id); loadTechSpecs(r.id) }} 
                            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-300 ${isExpanded ? 'bg-cyan-400/10 text-cyan-400 rotate-90' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </td>
                        {visibleCols.image && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <div className="relative w-12 h-12 rounded-xl border border-white/5 overflow-hidden glass group-hover:border-white/10 transition-all duration-500">
                              {covers[r.id] ? (
                                <VentImage src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${covers[r.id]}`}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                 />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-700 uppercase font-black text-[10px]">No Img</div>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleCols.name && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{r.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{r.brand || 'Markasız'}</span>
                            </div>
                          </td>
                        )}
                        {visibleCols.sku && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <div className="flex flex-col gap-0.5">
                              <code className="text-[11px] font-mono font-black text-cyan-400/70 bg-cyan-400/10 px-2 py-0.5 rounded-md w-max">{r.sku}</code>
                              {r.model_code && <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{r.model_code}</span>}
                            </div>
                          </td>
                        )}
                        {visibleCols.category && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{cats.find(c => c.id === r.category_id)?.name || '-'}</span>
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <div className="flex items-center">
                              {statusBadge(r.status)}
                            </div>
                          </td>
                        )}
                        {visibleCols.health && (
                          <td className={`${adminTableCellClass} ${cellPad} text-center`}>
                            <div className="flex justify-center">
                              <ProductHealthBadge
                                stockQty={r.stock_qty || 0}
                                threshold={r.low_stock_threshold || 10}
                                status={r.status || 'inactive'}
                                isFeatured={!!r.is_featured}
                              />
                            </div>
                          </td>
                        )}
                        {visibleCols.price && (
                          <td className={`${adminTableCellClass} ${cellPad} text-right`}>
                            {hasWriteAccess ? (
                              inlineEdit?.id === r.id && inlineEdit.field === 'price' ? (
                                <div className="relative inline-block animate-in fade-in zoom-in duration-300">
                                  <input
                                    type="number"
                                    value={inlineEdit.value}
                                    onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                    onBlur={saveInlineEdit}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveInlineEdit(); if (e.key === 'Escape') setInlineEdit(null) }}
                                    className="w-24 text-right bg-[#0A0F1E] border-2 border-cyan-400/50 rounded-xl px-2 py-1 text-sm text-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 font-black"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setInlineEdit({ id: r.id, field: 'price', value: String(r.price ?? '') })}
                                  className="group/btn relative bg-white/[0.03] hover:bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col items-end gap-0.5 ml-auto"
                                >
                                  <span className="text-sm font-black text-slate-100 group-hover/btn:text-cyan-400 transition-colors">
                                    {r.price != null ? formatCurrency(Number(r.price), lang) : '-'}
                                  </span>
                                  <Pencil size={8} className="text-slate-600 group-hover/btn:text-cyan-400 transition-colors" />
                                </button>
                              )
                            ) : (
                              <span className="text-sm font-black text-slate-100">{r.price != null ? formatCurrency(Number(r.price), lang) : '-'}</span>
                            )}
                          </td>
                        )}
                        {visibleCols.stock && (
                          <td className={`${adminTableCellClass} ${cellPad} text-right`}>
                            {hasWriteAccess ? (
                              inlineEdit?.id === r.id && inlineEdit.field === 'stock_qty' ? (
                                <div className="relative inline-block animate-in fade-in zoom-in duration-300">
                                  <input
                                    type="number"
                                    value={inlineEdit.value}
                                    onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                    onBlur={saveInlineEdit}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveInlineEdit(); if (e.key === 'Escape') setInlineEdit(null) }}
                                    className="w-20 text-right bg-[#0A0F1E] border-2 border-cyan-400/50 rounded-xl px-2 py-1 text-sm text-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 font-black"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setInlineEdit({ id: r.id, field: 'stock_qty', value: String(r.stock_qty ?? '') })}
                                  className={`group/btn relative px-3 py-1.5 rounded-xl border transition-all duration-300 flex flex-col items-end gap-0.5 ml-auto ${
                                    Number(r.stock_qty) < (r.low_stock_threshold || 10) 
                                      ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' 
                                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                  }`}
                                >
                                  <span className={`text-sm font-black ${Number(r.stock_qty) < (r.low_stock_threshold || 10) ? 'text-rose-400' : 'text-slate-100'}`}>
                                    {(r.stock_qty != null ? Number(r.stock_qty) : null) ?? '-'}
                                  </span>
                                  <Pencil size={8} className="text-slate-600 group-hover/btn:text-slate-400" />
                                </button>
                              )
                            ) : (
                              <span className={`text-sm font-black ${Number(r.stock_qty) < (r.low_stock_threshold || 10) ? 'text-rose-400' : 'text-slate-100'}`}>
                                {(r.stock_qty != null ? Number(r.stock_qty) : null) ?? '-'}
                              </span>
                            )}
                          </td>
                        )}
                        {visibleCols.actions && (
                          <td className={`${adminTableCellClass} ${cellPad}`}>
                            <div className="flex items-center justify-center gap-2">
                              {hasWriteAccess ? (
                                <>
                                  <button onClick={() => handleEdit(r.id)} className={adminTableActionClass}>{t('admin.ui.edit')}</button>
                                  <button onClick={() => remove(r.id)} className={adminTableActionDangerClass}>{t('admin.ui.delete')}</button>
                                </>
                              ) : (
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">Yetki Yok</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-white/[0.01]">
                          <td colSpan={11} className="px-12 py-8 bg-gradient-to-r from-transparent via-cyan-400/[0.02] to-transparent">
                            <div className="max-w-4xl mx-auto">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-0.5 bg-cyan-400" />
                                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em]">Teknik Ürün Parametreleri</h4>
                              </div>
                              {techSpecs[r.id] && Object.keys(techSpecs[r.id]).length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  {Object.entries(techSpecs[r.id]).map(([key, val]) => (
                                    <div key={key} className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/spec">
                                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">{key}</div>
                                      <div className="text-xs font-black text-slate-200 uppercase">{String(val)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="glass p-8 rounded-2xl border border-white/5 text-center">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bu ürün için tanımlanmış ek teknik özellik bulunmuyor.</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasWriteAccess && (
        <BulkActionToolbar
          selectedCount={selectedIds.size}
          onStatusChange={bulkStatusChange}
          onFeatureToggle={bulkFeatureToggle}
          onDelete={bulkDelete}
          onPriceAdjust={bulkPriceAdjust}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        _productId={editingId}
        onSuccess={handleModalSuccess}
        
      />
    </div>

  )
}

export default AdminProductsPage
