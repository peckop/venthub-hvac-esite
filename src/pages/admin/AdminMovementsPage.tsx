import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'

type Movement = {
  id: string
  product_id: string
  delta: number
  reason: string | null
  order_id?: string | null
  created_at: string
}

type Product = { id: string; name: string; sku?: string; category_id?: string | null }

type Category = { id: string; name: string }

enum LoadState { Idle, Loading, Error }

const PAGE_SIZE = 50
const ALL_REASONS = ['sale','po_receipt','manual_in','manual_out','adjust','return_in','transfer_out','transfer_in'] as const

function reasonLabel(key: string | null | undefined): string {
  switch (String(key || '')) {
    case 'sale': return 'Satış'
    case 'po_receipt': return 'Satın Alma Kabul'
    case 'manual_in': return 'Manuel Giriş'
    case 'manual_out': return 'Manuel Çıkış'
    case 'adjust': return 'Düzeltme'
    case 'return_in': return 'İade Girişi'
    case 'transfer_out': return 'Transfer Çıkış'
    case 'transfer_in': return 'Transfer Giriş'
    default: return '-'
  }
}

type SortKey = 'date' | 'product' | 'delta' | 'reason' | 'ref'

const AdminMovementsPage: React.FC = () => {
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

  const load = React.useCallback(async(pageNum: number)=>{
    try {
      setLoading(LoadState.Loading)
      // Pagination
      const from = (pageNum - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      // Her zaman hareketleri getir (server-side reason filtresi kaldırıldı; client-side çoklu filtre kullanılacak)
      const { data, error, count } = await supabase
        .from('inventory_movements')
        .select('id, product_id, delta, reason, order_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      const movements = (data || []) as Movement[]
      setRows(movements)

      // Ürün bilgileri (ad, sku, category)
      const ids = Array.from(new Set(movements.map(m=>m.product_id)))
      if (ids.length) {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('id,name,sku,category_id').in('id', ids),
          supabase.from('categories').select('id,name').order('name', { ascending: true })
        ])
        const map: Record<string, Product> = {}
        const cmap: Record<string, string | null> = {}
;(prodRes.data as Product[] | null | undefined)?.forEach(p => { map[p.id] = p; cmap[p.id] = p.category_id ?? null })
        setProductMap(map)
        setProductCategoryMap(cmap)
        if (!catRes.error) setCategories((catRes.data || []) as Category[])
      } else {
        setProductMap({})
        setProductCategoryMap({})
      }

      // pagination
      if (typeof count === 'number') {
        setHasMore(to + 1 < count)
      } else {
        setHasMore(movements.length === PAGE_SIZE) // tahmini
      }
      setError('')
      setLoading(LoadState.Idle)
    } catch {
      setError('Hareketler yüklenemedi')
      setRows([])
      setProductMap({})
      setHasMore(false)
      setLoading(LoadState.Error)
    }
  }, [])

  React.useEffect(()=>{ load(page) }, [load, page])

  // Görünür kategoriler: sadece listelenen hareketlerde geçen kategori id’leri
  const visibleCategories = React.useMemo(() => {
    const idSet = new Set<string>()
    rows.forEach(m => {
      const cid = productCategoryMap[m.product_id]
      if (cid) idSet.add(cid)
    })
    return categories.filter(c => idSet.has(c.id))
  }, [rows, categories, productCategoryMap])

  const filtered = React.useMemo(()=>{
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
    // Kategori filtresi
    if (selectedCategory) {
      base = base.filter(m => (productCategoryMap[m.product_id] || '') === selectedCategory)
    }
    // Reason çoklu filtresi
    const anyReason = Object.values(reasonFilter).some(Boolean)
    if (anyReason) {
      base = base.filter(m => reasonFilter[String(m.reason||'')] === true)
    }
    return base
  }, [rows, q, productMap, selectedCategory, productCategoryMap, reasonFilter])

  const sorted = React.useMemo(()=>{
    const arr = [...filtered]
    arr.sort((a,b)=>{
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
          return dir * String(a.reason||'').localeCompare(String(b.reason||''), 'tr')
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
    const header = ['Tarih','Ürün','SKU','Delta','Sebep','Referans']
    const lines = filtered.map(m => {
      const p = productMap[m.product_id]
      return [
        new Date(m.created_at).toLocaleString('tr-TR'),
        p?.name || m.product_id,
        p?.sku || '',
        m.delta,
        reasonLabel(m.reason),
        m.order_id ? m.order_id.slice(-8).toUpperCase() : ''
].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    })
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_movements_p${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Görünür kolonlar ve yoğunluk
  const STORAGE_KEY = 'toolbar:movements'
  const [visibleCols, setVisibleCols] = React.useState<{ date: boolean; product: boolean; delta: boolean; reason: boolean; ref: boolean }>({ date: true, product: true, delta: true, reason: true, ref: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(()=>{
    try {
      const rawCols = localStorage.getItem(`${STORAGE_KEY}:cols`)
      if (rawCols) setVisibleCols(prev=>({ ...prev, ...JSON.parse(rawCols) }))
      const rawDen = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (rawDen === 'compact' || rawDen === 'comfortable') setDensity(rawDen as Density)
    } catch {}
  },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch {} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch {} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>Hareket Defteri</h1>

      <AdminToolbar
        storageKey="toolbar:movements"
        search={{ value: q, onChange: setQ, placeholder: 'Ürün adı/SKU ara', focusShortcut: '/' }}
        select={{
          value: selectedCategory,
          onChange: (v)=>{ setPage(1); setSelectedCategory(v) },
          title: 'Kategori',
          options: [
            { value: '', label: 'Tüm Kategoriler' },
            ...visibleCategories.map(c => ({ value: c.id, label: c.name }))
          ]
        }}
        chips={ALL_REASONS.map(r => ({
          key: r,
          label: reasonLabel(r),
          active: !!reasonFilter[r],
          onToggle: ()=>setReasonFilter(prev=>({ ...prev, [r]: !prev[r] }))
        }))}
        onClear={()=>{
          setPage(1);
          setQ('');
          setSelectedCategory('');
          setReasonFilter(Object.fromEntries(ALL_REASONS.map(r => [r, true])) as Record<string, boolean>);
        }}
        recordCount={filtered.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <ExportMenu items={[{ key: 'csv', label: 'CSV (görünür filtrelerle)', onSelect: exportCsv }]} />
            <ColumnsMenu
              columns={[
                { key: 'date', label: 'Tarih', checked: visibleCols.date, onChange: (v)=>setVisibleCols(s=>({ ...s, date: v })) },
                { key: 'product', label: 'Ürün', checked: visibleCols.product, onChange: (v)=>setVisibleCols(s=>({ ...s, product: v })) },
                { key: 'delta', label: 'Delta', checked: visibleCols.delta, onChange: (v)=>setVisibleCols(s=>({ ...s, delta: v })) },
                { key: 'reason', label: 'Sebep', checked: visibleCols.reason, onChange: (v)=>setVisibleCols(s=>({ ...s, reason: v })) },
                { key: 'ref', label: 'Referans', checked: visibleCols.ref, onChange: (v)=>setVisibleCols(s=>({ ...s, ref: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
          </div>
        )}
      />

      <div className={`${adminCardClass} overflow-hidden`}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.date && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('date')}>Tarih {sortIndicator('date')}</button>
                </th>
              )}
              {visibleCols.product && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('product')}>Ürün {sortIndicator('product')}</button>
                </th>
              )}
              {visibleCols.delta && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('delta')}>Delta {sortIndicator('delta')}</button>
                </th>
              )}
              {visibleCols.reason && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('reason')}>Sebep {sortIndicator('reason')}</button>
                </th>
              )}
              {visibleCols.ref && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('ref')}>Referans {sortIndicator('ref')}</button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.id} className="border-b">
                {visibleCols.date && (
                  <td className={`${adminTableCellClass} ${cellPad}`}>{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                )}
                {visibleCols.product && (
                  <td className={`${adminTableCellClass} ${cellPad}`}>
                    <div className="flex flex-col">
                      <span>{productMap[m.product_id]?.name || m.product_id}</span>
                      {productMap[m.product_id]?.sku && (
                        <span className="text-xs text-steel-gray">{productMap[m.product_id]?.sku}</span>
                      )}
                    </div>
                  </td>
                )}
                {visibleCols.delta && (
                  <td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right font-mono`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                )}
                {visibleCols.reason && (
                  <td className={`${adminTableCellClass} ${cellPad}`}>{reasonLabel(m.reason)}</td>
                )}
                {visibleCols.ref && (
                  <td className={`${adminTableCellClass} ${cellPad}`}>{m.order_id ? m.order_id.slice(-8).toUpperCase() : '-'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loading === LoadState.Loading && (
          <div className="p-4 text-sm text-steel-gray">Yükleniyor…</div>
        )}
        {loading === LoadState.Error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button className="px-3 py-2 border rounded text-sm" disabled={page===1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Önceki</button>
        <span className="text-sm text-steel-gray">Sayfa {page}</span>
        <button className="px-3 py-2 border rounded text-sm" disabled={!hasMore} onClick={()=>setPage(p=>p+1)}>Sonraki</button>
      </div>
    </div>
  )
}

export default AdminMovementsPage
