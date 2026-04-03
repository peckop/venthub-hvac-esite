import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass,
    adminTableCellClass,
    adminButtonSecondaryClass,
    adminTableActionWarningClass
} from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import { ArrowUpRight, ArrowDownRight, PackageMinus } from 'lucide-react'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { endOfDay } from 'date-fns'
import { useDragScroll } from '../../hooks/useDragScroll'

type Movement = {
  id: string
  product_id: string
  delta: number
  reason: string | null
  order_id?: string | null
  created_at: string
  batch_id?: string | null
}

type Product = { id: string; name: string; sku?: string; category_id?: string | null }

type Category = { id: string; name: string }

enum LoadState { Idle, Loading, Error }

const PAGE_SIZE = 50
const ALL_REASONS = ['sale', 'po_receipt', 'manual_in', 'manual_out', 'adjust', 'return_in', 'transfer_out', 'transfer_in'] as const

function reasonLabel(key: string | null | undefined, t: (k: string) => string): string {
  const val = String(key || '')
  if (val.startsWith('undo')) return t('admin.movements.reasons.undo')
  switch (val) {
    case 'sale': return t('admin.movements.reasons.sale')
    case 'po_receipt': return t('admin.movements.reasons.po_receipt')
    case 'manual_in': return t('admin.movements.reasons.manual_in')
    case 'manual_out': return t('admin.movements.reasons.manual_out')
    case 'adjust': return t('admin.movements.reasons.adjust')
    case 'return_in': return t('admin.movements.reasons.return_in')
    case 'transfer_out': return t('admin.movements.reasons.transfer_out')
    case 'transfer_in': return t('admin.movements.reasons.transfer_in')
    default: return '-'
  }
}

type SortKey = 'date' | 'product' | 'delta' | 'reason' | 'ref'

const AdminMovementsPage: React.FC = () => {
  const { t, lang } = useI18n()
  const dragScrollRef = useDragScroll<HTMLDivElement>()
  const router = useRouter()
  const [rows, setRows] = React.useState<Movement[]>([])
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [error, setError] = React.useState<string>('')
  const [page, setPage] = React.useState<number>(1)
  const [hasMore, setHasMore] = React.useState<boolean>(false)
  const [q, setQ] = React.useState<string>('')
  const [productMap, setProductMap] = React.useState<Record<string, Product>>({})
  const [productCategoryMap, setProductCategoryMap] = React.useState<Record<string, string | null>>({})
  const [categories, setCategories] = React.useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [reasonFilter, setReasonFilter] = React.useState<Record<string, boolean>>(
    Object.fromEntries(ALL_REASONS.map(r => [r, true])) as Record<string, boolean>
  )
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')
  const [batchFilter, setBatchFilter] = React.useState<string>('')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  const load = React.useCallback(async (pageNum: number) => {
    try {
      setLoading(LoadState.Loading)
      await ensureSessionFresh()

      const from = (pageNum - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('inventory_movements')
        .select('id, product_id, delta, reason, order_id, created_at, batch_id', { count: 'exact' })
      if (batchFilter) query = query.eq('batch_id', batchFilter)
      if (dateRange?.from) query = query.gte('created_at', dateRange.from.toISOString())
      if (dateRange?.to) query = query.lte('created_at', endOfDay(dateRange.to).toISOString())
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      const movements = (data || []) as Movement[]
      setRows(movements)

      const ids = Array.from(new Set(movements.map(m => m.product_id)))
      if (ids.length) {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('id,name,sku,category_id').in('id', ids),
          supabase.from('categories').select('id,name').order('name', { ascending: true })
        ])
        const map: Record<string, Product> = {}
        const cmap: Record<string, string | null> = {}
          ; (prodRes.data as Product[] | null | undefined)?.forEach(p => { map[p.id] = p; cmap[p.id] = p.category_id ?? null })
        setProductMap(map)
        setProductCategoryMap(cmap)
        if (!catRes.error) setCategories((catRes.data || []) as Category[])
      } else {
        setProductMap({})
        setProductCategoryMap({})
      }

      if (typeof count === 'number') {
        setHasMore(to + 1 < count)
      } else {
        setHasMore(movements.length === PAGE_SIZE)
      }
      setError('')
      setLoading(LoadState.Idle)
    } catch {
      setError(t('admin.ui.failed'))
      setRows([])
      setProductMap({})
      setHasMore(false)
      setLoading(LoadState.Error)
    }
  }, [batchFilter, dateRange, t])

  const pathname = usePathname()
  React.useEffect(() => { load(page) }, [load, page, pathname])

  const searchParams = useSearchParams()
  React.useEffect(() => {
    const b = (searchParams?.get('batch') || '').trim()
    setBatchFilter(b)
  }, [searchParams])

  const visibleCategories = React.useMemo(() => {
    const idSet = new Set<string>()
    rows.forEach(m => {
      const cid = productCategoryMap[m.product_id]
      if (cid) idSet.add(cid)
    })
    return categories.filter(c => idSet.has(c.id))
  }, [rows, categories, productCategoryMap])

  const filtered = React.useMemo(() => {
    let base = rows
    const term = q.trim().toLowerCase()
    if (term) {
      base = base.filter(r => {
        const p = productMap[r.product_id]
        const name = (p?.name || '').toLowerCase()
        const sku = (p?.sku || '').toLowerCase()
        return name.includes(term) || sku.includes(term)
      })
    }
    if (selectedCategory) {
      base = base.filter(m => (productCategoryMap[m.product_id] || '') === selectedCategory)
    }
    const anyReason = Object.values(reasonFilter).some(Boolean)
    if (anyReason) {
      base = base.filter(m => reasonFilter[String(m.reason || '')] === true)
    }
    return base
  }, [rows, q, productMap, selectedCategory, productCategoryMap, reasonFilter])

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'date':
          return dir * (Date.parse(a.created_at) - Date.parse(b.created_at))
        case 'product': {
          const an = (productMap[a.product_id]?.name || '').toLowerCase()
          const bn = (productMap[b.product_id]?.name || '').toLowerCase()
          return dir * an.localeCompare(bn, 'tr')
        }
        case 'delta':
          return dir * (a.delta - b.delta)
        case 'reason':
          return dir * String(a.reason || '').localeCompare(String(b.reason || ''), 'tr')
        case 'ref': {
          const ar = a.order_id ? a.order_id : ''
          const br = b.order_id ? b.order_id : ''
          return dir * ar.localeCompare(br)
        }
        default:
          return 0
      }
    })
    return arr
  }, [filtered, sortKey, sortDir, productMap])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'desc' : 'asc')
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? '▲' : '▼'
  }

  function exportCsv() {
    const h = [t('admin.movements.export.headers.date'), t('admin.movements.export.headers.product'), 'SKU', t('admin.movements.export.headers.delta'), t('admin.movements.export.headers.reason'), t('admin.movements.export.headers.ref')]
    const lines = filtered.map(m => {
      const p = productMap[m.product_id]
      return [
        formatDateTime(m.created_at, lang),
        p?.name || m.product_id,
        p?.sku || '',
        m.delta,
        reasonLabel(m.reason, t),
        m.order_id ? m.order_id.slice(-8).toUpperCase() : ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    const bom = '\ufeff'
    const csvData = [h.join(','), ...lines].join('\n')
    const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory_movements_p${page}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportXls() {
    const rowsHtml = filtered.map(m => {
      const p = productMap[m.product_id]
      const d = formatDateTime(m.created_at, lang)
      const pr = p?.name || m.product_id
      const s = p?.sku || ''
      const dl = m.delta
      const r = reasonLabel(m.reason, t)
      const o = m.order_id ? m.order_id.slice(-8).toUpperCase() : ''
      return `<tr><td>${d}</td><td>${pr}</td><td>${s}</td><td>${dl}</td><td>${r}</td><td>${o}</td></tr>`
    }).join('')
    const tHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr><th>${t('admin.movements.export.headers.date')}</th><th>${t('admin.movements.export.headers.product')}</th><th>SKU</th><th>${t('admin.movements.export.headers.delta')}</th><th>${t('admin.movements.export.headers.reason')}</th><th>${t('admin.movements.export.headers.ref')}</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
    const blob = new Blob([tHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory_movements_p${page}.xls`
    link.click()
    URL.revokeObjectURL(url)
  }

  const STORAGE_KEY = 'toolbar:movements'
  const [visibleCols, setVisibleCols] = React.useState<{ date: boolean; product: boolean; delta: boolean; reason: boolean; ref: boolean }>({ date: true, product: true, delta: true, reason: true, ref: true })
  const [density, setDensity] = React.useState<Density>('comfortable')

  React.useEffect(() => {
    try {
      const rawCols = localStorage.getItem(`${STORAGE_KEY}:cols`)
      if (rawCols) setVisibleCols(prev => ({ ...prev, ...JSON.parse(rawCols) }))
      const rawDen = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (rawDen === 'compact' || rawDen === 'comfortable') setDensity(rawDen as Density)
    } catch { }
  }, [])

  React.useEffect(() => { try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch { } }, [visibleCols])
  React.useEffect(() => { try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch { } }, [density])

  const headPad = density === 'compact' ? 'px-2 py-2' : ''
  const cellPad = density === 'compact' ? 'px-2 py-2' : ''

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.movements')}</h1>

      {batchFilter && (
        <div className="p-4 glass-strong border border-amber-500/20 rounded-2xl text-sm text-amber-400 flex items-center justify-between mb-6">
          <span className="font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            {t('admin.movements.batchFilterPrefix')} <span className="font-mono text-white ml-1 tracking-wider">{batchFilter}</span>
          </span>
          <button
            className={`${adminTableActionWarningClass} !h-8 !px-4`}
            onClick={() => { setBatchFilter(''); const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost'); url.searchParams.delete('batch'); router.push(url.pathname + (url.search ? '?' + url.searchParams.toString() : '') as import('next').Route, { scroll: false }) }}
          >{t('admin.ui.clear')}</button>
        </div>
      )}

      <AdminToolbar
        storageKey="toolbar:movements"
        search={{ value: q, onChange: setQ, placeholder: t('admin.search.movements'), focusShortcut: '/' }}
        select={{
          value: selectedCategory,
          onChange: (v) => { setPage(1); setSelectedCategory(v) },
          title: t('admin.movements.toolbar.categoryTitle'),
          options: [
            { value: '', label: t('admin.movements.toolbar.allCategories') },
            ...visibleCategories.map(c => ({ value: c.id, label: c.name }))
          ]
        }}
        chips={ALL_REASONS.map(r => ({
          key: r,
          label: reasonLabel(r, t),
          active: !!reasonFilter[r],
          onToggle: () => setReasonFilter(prev => ({ ...prev, [r]: !prev[r] }))
        }))}
        onClear={() => {
          setPage(1);
          setQ('');
          setSelectedCategory('');
          setDateRange(undefined);
          setReasonFilter(Object.fromEntries(ALL_REASONS.map(r => [r, true])) as Record<string, boolean>);
        }}
        recordCount={filtered.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportMenu items={[
              { key: 'csv', label: t('admin.movements.export.csvLabel'), onSelect: exportCsv },
              { key: 'xls', label: t('admin.orders.export.xlsLabel'), onSelect: exportXls }
            ]} />
            <ColumnsMenu
              columns={[
                { key: 'date', label: t('admin.movements.table.date'), checked: visibleCols.date, onChange: (v) => setVisibleCols(s => ({ ...s, date: v })) },
                { key: 'product', label: t('admin.movements.table.product'), checked: visibleCols.product, onChange: (v) => setVisibleCols(s => ({ ...s, product: v })) },
                { key: 'delta', label: t('admin.movements.table.delta'), checked: visibleCols.delta, onChange: (v) => setVisibleCols(s => ({ ...s, delta: v })) },
                { key: 'reason', label: t('admin.movements.table.reason'), checked: visibleCols.reason, onChange: (v) => setVisibleCols(s => ({ ...s, reason: v })) },
                { key: 'ref', label: t('admin.movements.table.ref'), checked: visibleCols.ref, onChange: (v) => setVisibleCols(s => ({ ...s, ref: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
          </div>
        )}
      />

      <div className={`${adminCardClass} overflow-hidden`}>
        <div ref={dragScrollRef} className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px]">
            <thead className="glass-strong">
              <tr>
                {visibleCols.date && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]" onClick={() => toggleSort('date')}>{t('admin.movements.table.date')} {sortIndicator('date')}</button>
                  </th>
                )}
                {visibleCols.product && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]" onClick={() => toggleSort('product')}>{t('admin.movements.table.product')} {sortIndicator('product')}</button>
                  </th>
                )}
                {visibleCols.delta && (
                  <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                    <button type="button" className="hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]" onClick={() => toggleSort('delta')}>{t('admin.movements.table.delta')} {sortIndicator('delta')}</button>
                  </th>
                )}
                {visibleCols.reason && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]" onClick={() => toggleSort('reason')}>{t('admin.movements.table.reason')} {sortIndicator('reason')}</button>
                  </th>
                )}
                {visibleCols.ref && (
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>
                    <button type="button" className="hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]" onClick={() => toggleSort('ref')}>{t('admin.movements.table.ref')} {sortIndicator('ref')}</button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading === LoadState.Loading && sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <AdminSkeleton variant="table" count={5} rows={8} />
                  </td>
                </tr>
              ) : loading === LoadState.Error ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-red-600">
                    Hata: {error}
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <AdminEmptyState
                      icon={PackageMinus}
                      title="Hareket Bulunamadı"
                      description="Seçilen filtrelere veya arama kriterlerine uygun envanter hareketi bulunmuyor."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map((m) => (
                  <tr key={m.id} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {visibleCols.date && (
                      <td className={`${adminTableCellClass} ${cellPad} font-black text-slate-400 text-[10px] uppercase tracking-widest`}>{formatDateTime(m.created_at, lang)}</td>
                    )}
                    {visibleCols.product && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-white uppercase tracking-tight">{productMap[m.product_id]?.name || m.product_id}</span>
                          {productMap[m.product_id]?.sku && (
                            <span className="text-[10px] font-black text-slate-500 tracking-widest bg-white/5 w-fit px-2 py-0.5 rounded uppercase">{productMap[m.product_id]?.sku}</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleCols.delta && (
                      <td className={`${adminTableCellClass} ${cellPad} text-right`}>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black font-mono px-3 py-1.5 rounded-xl border uppercase tracking-widest ${m.delta > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : m.delta < 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white/5 text-slate-500 border-white/5'}`}>
                          {m.delta > 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : m.delta < 0 ? <ArrowDownRight size={10} strokeWidth={3} /> : null}
                          {m.delta > 0 ? `+${m.delta}` : m.delta}
                        </span>
                      </td>
                    )}
                    {visibleCols.reason && (
                      <td className={`${adminTableCellClass} ${cellPad} uppercase font-black text-[10px] tracking-widest text-[#22D3EE]`}>
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-cyan-500/50"></div>
                           {reasonLabel(m.reason, t)}
                        </div>
                      </td>
                    )}
                    {visibleCols.ref && (
                      <td className={`${adminTableCellClass} ${cellPad} font-black font-mono text-white/60 text-[10px] uppercase tracking-[0.1em]`}>{m.order_id ? (
                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">
                          #{m.order_id.slice(-8).toUpperCase()}
                        </span>
                      ) : '-'}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 px-4 py-6 border-t border-white/5 bg-white/[0.02] rounded-3xl">
        <button className={adminButtonSecondaryClass} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>{t('admin.ui.prev')}</button>
        <span className="text-[10px] font-black text-slate-400 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 uppercase tracking-[0.2em]">{t('admin.movements.pageLabel', { page: String(page) })}</span>
        <button className={adminButtonSecondaryClass} disabled={!hasMore} onClick={() => setPage(p => p + 1)}>{t('admin.ui.next')}</button>
      </div>
    </div>
  )
}

export default AdminMovementsPage
