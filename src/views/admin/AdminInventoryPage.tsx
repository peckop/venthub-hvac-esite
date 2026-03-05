import React from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { adminSectionTitleClass, adminCardClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import InfoTooltip from '../../components/admin/InfoTooltip'
import { useI18n } from '../../i18n/I18nProvider'
import toast from 'react-hot-toast'
import { useRole } from '../../hooks/useRole'

import InventoryCsvImport from '../../components/admin/InventoryCsvImport'
import InventoryDetailDrawer from '../../components/admin/InventoryDetailDrawer'
import InventoryTable from '../../components/admin/InventoryTable'
import {
  InventoryRow as Row,
  SortKey,
  Category,
  ReservedRow,
  LoadState,
  Density,
  VisibleCols
} from '../../types/inventory'

const AdminInventoryPage: React.FC = () => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('inventory')

  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [error, setError] = React.useState<string>('')
  const [selected, setSelected] = React.useState<Row | null>(null)
  const [reservedOrders, setReservedOrders] = React.useState<ReservedRow[]>([])

  // Eşik (threshold) için global varsayılan
  const [defaultThreshold, setDefaultThreshold] = React.useState<number | null>(null)
  // Seçili ürünün stok/eşik bilgisi
  const [selectedThreshold, setSelectedThreshold] = React.useState<number | ''>('')
  const [selectedStock, setSelectedStock] = React.useState<number | null>(null)
  const [saving, setSaving] = React.useState<boolean>(false)

  // Ürün bazlı eşik haritası (sadece gösterim için)
  const [thresholdMap, setThresholdMap] = React.useState<Record<string, number | null>>({})
  const [overrideMap, setOverrideMap] = React.useState<Record<string, boolean>>({})
  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')
  const [groupByCategory, setGroupByCategory] = React.useState<boolean>(false)

  const [printingQr, setPrintingQr] = React.useState(false)

  // Arama
  const [q, setQ] = React.useState<string>('')
  // Kategori filtresi
  const [categories, setCategories] = React.useState<Category[]>([])
  // Kategorileri id bazında tekilleştir
  function uniqById(list: Category[]): Category[] {
    const seen = new Set<string>()
    const out: Category[] = []
    for (const c of (list || [])) {
      if (c && c.id && !seen.has(c.id)) {
        seen.add(c.id)
        out.push(c)
      }
    }
    return out
  }
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [productCategoryMap, setProductCategoryMap] = React.useState<Record<string, string | null>>({})
  // Durum filtresi (çoklu seçim)
  const [statusFilter, setStatusFilter] = React.useState<{ out: boolean; critical: boolean; reserved: boolean; ok: boolean }>({ out: false, critical: false, reserved: false, ok: false })

  // Görünür kolonlar ve yoğunluk
  const STORAGE_KEY = 'toolbar:inventory'
  const [visibleCols, setVisibleCols] = React.useState<VisibleCols>({
    name: true, physical: true, reserved: true, available: true, threshold: true, status: true, location: true, supplier: false, abc: true, days: true
  })
  const [density, setDensity] = React.useState<Density>('comfortable')

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const c = localStorage.getItem(`${STORAGE_KEY}: cols`);
      if (c) setVisibleCols(prev => ({ ...prev, ...JSON.parse(c) }));
      const d = localStorage.getItem(`${STORAGE_KEY}: density`);
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
    } catch { }
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}: cols`, JSON.stringify(visibleCols)) } catch { }
  }, [visibleCols])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}: density`, density) } catch { }
  }, [density])

  // ESC ile çekmeceyi kapat
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Çekmece içi hızlı hareket durumu
  const [moveQty, setMoveQty] = React.useState<number>(1)
  const [moving, setMoving] = React.useState<boolean>(false)

  // CSV import/export states
  const [csvImportOpen, setCsvImportOpen] = React.useState<boolean>(false)

  // Inventory movement history states
  const [movements, setMovements] = React.useState<Array<{ id: string; delta: number; reason: string; created_at: string }>>([])
  const [undoing, setUndoing] = React.useState<boolean>(false)

  const loadMovements = React.useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('id, delta, reason, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(5)
      if (!error) setMovements((data || []) as Array<{ id: string; delta: number; reason: string; created_at: string }>)
    } catch {
      setMovements([])
    }
  }, [])

  const undoLastMovement = React.useCallback(async () => {
    if (!selected) return
    const last = movements[0]
    if (!last) return
    if (String((last as { reason?: string } | null)?.reason || '').startsWith('undo')) {
      toast.error('Undo hareketi geri alınamaz')
      return
    }
    const tenMinMs = 10 * 60 * 1000
    const age = Date.now() - new Date(last.created_at).getTime()
    if (age > tenMinMs) {
      toast.error('Geri alma süresi geçti (10 dk)')
      return
    }
    try {
      setUndoing(true)
      const inverse = -Number(last.delta || 0)
      if (inverse === 0) return
      const shortId = String(last.id).slice(0, 8)
      const reason = `undo:${shortId} `
      const { error } = await supabase.rpc('adjust_stock', { p_product_id: selected.product_id, p_delta: inverse, p_reason: reason })
      if (error) throw error
      toast.success('Hareket geri alındı')
      // reload movements and update local stocks
      await loadMovements(selected.product_id)
      setRows(prev => prev.map(r => r.product_id === selected.product_id ? ({
        ...r,
        physical_stock: Math.max(0, r.physical_stock + inverse),
        available_stock: Math.max(0, (r.physical_stock + inverse) - r.reserved_stock)
      }) : r))
      setSelectedStock(s => (s == null ? null : Math.max(0, s + inverse)))
    } catch {
      toast.error('Geri alma başarısız')
    } finally {
      setUndoing(false)
    }
  }, [movements, selected, loadMovements])

  const load = React.useCallback(async () => {
    try {
      setLoading(LoadState.Loading)
      // Proaktif oturum kontrolü
      await ensureSessionFresh()

      const [invRes, velRes, settingsRes, catRes] = await Promise.all([
        supabase.from('inventory_summary').select('*'),
        supabase.from('inventory_velocity').select('product_id, daily_velocity, days_until_empty, abc_class'),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
        supabase.from('categories').select('id,name').order('name', { ascending: true })
      ])
      if (invRes.error) throw invRes.error

      const vMap = new Map((velRes.data || []).map((v: { product_id: string; daily_velocity: number | null; days_until_empty: number | null; abc_class: 'A' | 'B' | 'C' | null }) => [v.product_id, v]))
      const invRows = (invRes.data || []).map((r: Row) => ({
        ...r,
        daily_velocity: vMap.get(r.product_id)?.daily_velocity,
        days_until_empty: vMap.get(r.product_id)?.days_until_empty,
        abc_class: vMap.get(r.product_id)?.abc_class
      })) as Row[]
      setRows(invRows)
      if (!settingsRes.error) {
        setDefaultThreshold((settingsRes.data?.default_low_stock_threshold as number | null) ?? null)
      }
      if (!catRes.error) {
        setCategories(uniqById((catRes.data || []) as Category[]))
      }
      // Ürünlerin eşiklerini çek
      const ids = invRows.map(r => r.product_id)
      if (ids.length > 0) {
        const { data: prodData } = await supabase
          .from('products')
          .select('id, low_stock_threshold, low_stock_override, category_id')
          .in('id', ids)
        const tmap: Record<string, number | null> = {}
        const omap: Record<string, boolean> = {}
        const cmap: Record<string, string | null> = {}
          ; (prodData as { id: string; low_stock_threshold: number | null; low_stock_override?: boolean; category_id?: string | null }[] | null | undefined)?.forEach((p) => {
            tmap[p.id] = p.low_stock_threshold
            omap[p.id] = !!p.low_stock_override
            cmap[p.id] = p.category_id ?? null
          })
        setThresholdMap(tmap)
        setOverrideMap(omap)
        setProductCategoryMap(cmap)
      }
    } catch {
      setError('Yükleme hatası')
      setRows([])
      setLoading(LoadState.Error)
      return
    }
    setLoading(LoadState.Idle)
  }, [])

  const pathname = usePathname()
  React.useEffect(() => { load() }, [load, pathname])

  // Realtime: inventory_settings değiştiğinde efektif eşik değerini güncelle
  React.useEffect(() => {
    const ch = supabase
      .channel('inventory-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_settings' }, (payload) => {
        const newVal = (payload.new as { default_low_stock_threshold?: number | null } | null)?.default_low_stock_threshold ?? null
        setDefaultThreshold(newVal)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Görünür kategoriler: sadece listedeki satırlarda geçen kategori id’leri
  const visibleCategories = React.useMemo(() => {
    if (!categories.length) return [] as Category[]
    const idSet = new Set<string>()
    rows.forEach(r => {
      const cid = productCategoryMap[r.product_id]
      if (cid) idSet.add(cid)
    })
    return categories.filter(c => idSet.has(c.id))
  }, [categories, rows, productCategoryMap])

  // Eğer seçili kategori görünür listede yoksa temizle
  React.useEffect(() => {
    if (selectedCategory && !visibleCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('')
    }
  }, [visibleCategories, selectedCategory])


  // Yerel efektif eşik hesaplayıcı (sıralama/filtre için)
  const effectiveThreshold = React.useCallback((productId: string): number | null => {
    const hasOverride = !!overrideMap[productId]
    const ovVal = thresholdMap[productId]
    const defVal = defaultThreshold ?? null
    if (!hasOverride || ovVal == null) return defVal
    if (defVal != null && Number(ovVal) === Number(defVal)) return defVal
    return Number(ovVal)
  }, [overrideMap, thresholdMap, defaultThreshold])

  const statusKey = React.useCallback((r: Row): 'out' | 'critical' | 'reserved' | 'ok' => {
    const net = r.available_stock
    const th = effectiveThreshold(r.product_id)
    if (net <= 0) return 'out'
    if (th != null && net <= th) return 'critical'
    if (r.reserved_stock > 0) return 'reserved'
    return 'ok'
  }, [effectiveThreshold])

  const statusRank = React.useCallback((r: Row) => {
    const net = r.available_stock
    const th = effectiveThreshold(r.product_id)
    if (net <= 0) return 0 // Tükendi
    if (th != null && net <= th) return 1 // Kritik
    if (r.reserved_stock > 0) return 2 // Rezervli
    return 3 // Uygun
  }, [effectiveThreshold])

  const filteredRows = React.useMemo(() => {
    const t = q.trim().toLowerCase()
    let base = rows
    if (t) base = base.filter(r => r.name.toLowerCase().includes(t))
    // kategori filtresi
    if (selectedCategory) {
      base = base.filter(r => (productCategoryMap[r.product_id] || '') === selectedCategory)
    }
    // durum filtresi
    const anyStatus = statusFilter.out || statusFilter.critical || statusFilter.reserved || statusFilter.ok
    if (anyStatus) {
      base = base.filter(r => {
        const key = statusKey(r)
        return (statusFilter as Record<string, boolean>)[key]
      })
    }
    return base
  }, [rows, q, selectedCategory, productCategoryMap, statusFilter, statusKey])

  const sortedRows = React.useMemo(() => {
    const arr = [...filteredRows]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name, 'tr')
        case 'physical':
          return dir * (a.physical_stock - b.physical_stock)
        case 'reserved':
          return dir * (a.reserved_stock - b.reserved_stock)
        case 'available':
          return dir * (a.available_stock - b.available_stock)
        case 'threshold': {
          const ea = effectiveThreshold(a.product_id) ?? -Infinity
          const eb = effectiveThreshold(b.product_id) ?? -Infinity
          return dir * (Number(ea) - Number(eb))
        }
        case 'status':
          return dir * (statusRank(a) - statusRank(b))
        case 'location': return dir * String(a.warehouse_location || '').localeCompare(String(b.warehouse_location || ''), 'tr')
        case 'supplier': return dir * String(a.supplier_name || '').localeCompare(String(b.supplier_name || ''), 'tr')
        case 'days_empty': return dir * ((a.days_until_empty ?? 9999) - (b.days_until_empty ?? 9999))
        case 'abc': return dir * String(a.abc_class || 'Z').localeCompare(String(b.abc_class || 'Z'), 'tr')
        default:
          return 0
      }
    })
    return arr
  }, [filteredRows, sortKey, sortDir, effectiveThreshold, statusRank])

  const getCategoryName = React.useCallback((cid: string | null | undefined): string => {
    if (!cid) return 'Kategorisiz'
    const c = categories.find(x => x.id === cid)
    return c?.name || 'Kategorisiz'
  }, [categories])

  const groupedRows = React.useMemo(() => {
    if (!groupByCategory) return [] as { cid: string | null; name: string; items: Row[] }[]
    const bucket = new Map<string, Row[]>()
    for (const r of sortedRows) {
      const cid = (productCategoryMap[r.product_id] || '') as string
      const key = cid || 'null'
      const arr = bucket.get(key) || []
      arr.push(r)
      bucket.set(key, arr)
    }
    const out: { cid: string | null; name: string; items: Row[] }[] = []
    for (const [key, items] of bucket.entries()) {
      const cid = key === 'null' ? null : key
      out.push({ cid, name: getCategoryName(cid), items })
    }
    out.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    return out
  }, [groupByCategory, sortedRows, productCategoryMap, getCategoryName])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const updateLocation = async (productId: string, val: string) => {
    const r = rows.find(x => x.product_id === productId)
    if (!r || r.warehouse_location === val) return
    const { error } = await supabase.from('products').update({ warehouse_location: val || null }).eq('id', productId)
    if (error) throw error
    setRows(prev => prev.map(row => row.product_id === productId ? { ...row, warehouse_location: val || null } : row))
    toast.success('Raf konumu güncellendi')
  }

  const updateSupplier = async (productId: string, val: string) => {
    const r = rows.find(x => x.product_id === productId)
    if (!r || r.supplier_name === val) return
    const { error } = await supabase.from('products').update({ supplier_name: val || null }).eq('id', productId)
    if (error) throw error
    setRows(prev => prev.map(row => row.product_id === productId ? { ...row, supplier_name: val || null } : row))
    toast.success('Tedarikçi güncellendi')
  }

  const loadReserved = React.useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reserved_orders')
        .select('order_id, created_at, status, payment_status, quantity')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReservedOrders((data || []) as ReservedRow[])
    } catch {
      setReservedOrders([])
    }
  }, [])


  async function saveThreshold(productId: string) {
    try {
      setSaving(true)
      const isDefault = selectedThreshold === ''
      const payload: Record<string, unknown> = {
        low_stock_threshold: (isDefault ? null : Number(selectedThreshold)),
        low_stock_override: !isDefault
      }
      const before = { low_stock_threshold: thresholdMap[productId] ?? null, low_stock_override: !!overrideMap[productId] }
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
      if (error) throw error
      // Audit log
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, {
        table_name: 'products',
        row_pk: productId,
        action: 'UPDATE',
        before,
        after: payload,
        comment: 'update low_stock_threshold'
      })
      // tablo gösterimini güncelle
      setThresholdMap(prev => ({ ...prev, [productId]: (isDefault ? null : Number(selectedThreshold)) }))
      setOverrideMap(prev => ({ ...prev, [productId]: !isDefault }))
    } catch {
      // no-op
    } finally {
      setSaving(false)
    }
  }



  async function adjustStock(productId: string, delta: number, reason: string) {
    try {
      setMoving(true)
      const { error } = await supabase.rpc('adjust_stock', { p_product_id: productId, p_delta: delta, p_reason: reason })
      if (error) throw error
      // Audit log
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, {
        table_name: 'inventory_movements',
        row_pk: productId,
        action: 'INSERT',
        before: null,
        after: { delta, reason },
        comment: 'adjust_stock RPC'
      })
      // Lokal satırı güncelle
      setRows(prev => prev.map(r => r.product_id === productId ? ({
        ...r,
        physical_stock: Math.max(0, r.physical_stock + delta),
        available_stock: Math.max(0, (r.physical_stock + delta) - r.reserved_stock)
      }) : r))
      setSelectedStock((s) => (s == null ? null : Math.max(0, s + delta)))
    } catch {
      // no-op
    } finally {
      setMoving(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.inventory') ?? 'Stok Özeti'}</h1>
        {hasWriteAccess && (
          <button onClick={() => window.location.href = '/admin/inventory/settings'} className={adminButtonPrimaryClass}>
            Stok Ayarları
          </button>
        )}
      </div>

      <AdminToolbar
        storageKey="toolbar:inventory"
        search={{ value: q, onChange: setQ, placeholder: 'ürün adı ile ara', focusShortcut: '/' }}
        select={{
          value: selectedCategory,
          onChange: setSelectedCategory,
          title: 'Kategori',
          options: [{ value: '', label: 'Tüm Kategoriler' }, ...visibleCategories.map(c => ({ value: c.id, label: c.name }))]
        }}
        chips={[
          { key: 'out', label: 'Stok Yok', active: statusFilter.out, onToggle: () => setStatusFilter(s => ({ ...s, out: !s.out })) },
          { key: 'critical', label: 'Kritik', active: statusFilter.critical, onToggle: () => setStatusFilter(s => ({ ...s, critical: !s.critical })) },
          { key: 'reserved', label: 'Rezerve', active: statusFilter.reserved, onToggle: () => setStatusFilter(s => ({ ...s, reserved: !s.reserved })) },
          { key: 'ok', label: 'Normal', active: statusFilter.ok, onToggle: () => setStatusFilter(s => ({ ...s, ok: !s.ok })) },
          { key: 'group', label: 'Grupla', active: groupByCategory, onToggle: () => setGroupByCategory(!groupByCategory) },
        ]}
        onClear={() => { setQ(''); setSelectedCategory(''); setStatusFilter({ out: false, critical: false, reserved: false, ok: false }) }}
        recordCount={filteredRows.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            {hasWriteAccess && (
              <button
                onClick={() => setCsvImportOpen(true)}
                className={`${adminButtonPrimaryClass} shadow-md shadow-primary-navy/10`}
              >
                CSV İçe Aktar
              </button>
            )}
            <ExportMenu items={[
              {
                key: 'csv', label: 'CSV Aktar', onSelect: () => {
                  const head = ['SKU', 'Ürün', 'Fiziksel', 'Rezerve', 'Müsait', 'Durum']
                  const lines = filteredRows.map(r => [r.product_id, `"${r.name.replace(/"/g, '""')}"`, r.physical_stock, r.reserved_stock, r.available_stock, (r.available_stock <= 0 ? 'YOK' : (r.available_stock <= (thresholdMap[r.product_id] ?? (defaultThreshold || 10)) ? 'KRİTİK' : 'OK'))])
                  const csv = '\ufeff' + [head.join(','), ...lines.map(l => l.join(','))].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click(); URL.revokeObjectURL(url)
                }
              },
              {
                key: 'template', label: 'CSV Şablonu (sku,qty)', onSelect: () => {
                  const header = ['sku', 'qty']
                  const csv = '\ufeff' + header.join(',') + '\n' + ['"PRD001"', '10'].join(',') + '\n'
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = 'inventory_template.csv'; a.click(); URL.revokeObjectURL(url)
                }
              }
            ]} />
            <ColumnsMenu
              columns={[
                { key: 'name', label: 'Ürün', checked: visibleCols.name, onChange: (v) => setVisibleCols(s => ({ ...s, name: v })) },
                { key: 'physical', label: 'Fiziksel', checked: visibleCols.physical, onChange: (v) => setVisibleCols(s => ({ ...s, physical: v })) },
                { key: 'reserved', label: 'Rezerve', checked: visibleCols.reserved, onChange: (v) => setVisibleCols(s => ({ ...s, reserved: v })) },
                { key: 'available', label: 'Satılabilir', checked: visibleCols.available, onChange: (v) => setVisibleCols(s => ({ ...s, available: v })) },
                { key: 'threshold', label: 'Eşik', checked: visibleCols.threshold, onChange: (v) => setVisibleCols(s => ({ ...s, threshold: v })) },
                { key: 'location', label: 'Raf', checked: visibleCols.location, onChange: (v) => setVisibleCols(s => ({ ...s, location: v })) },
                { key: 'supplier', label: 'Tedarikçi', checked: visibleCols.supplier, onChange: (v) => setVisibleCols(s => ({ ...s, supplier: v })) },
                { key: 'abc', label: 'ABC Sınıfı', checked: visibleCols.abc, onChange: (v) => setVisibleCols(s => ({ ...s, abc: v })) },
                { key: 'days', label: 'Tükenme Hızı', checked: visibleCols.days, onChange: (v) => setVisibleCols(s => ({ ...s, days: v })) },
                { key: 'status', label: 'Durum', checked: visibleCols.status, onChange: (v) => setVisibleCols(s => ({ ...s, status: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
          </div>
        )}
      />

      <div className={adminCardClass}>
        <InventoryTable
          rows={sortedRows}
          loading={loading}
          error={error}
          selected={selected}
          visibleCols={visibleCols as VisibleCols}
          density={density}
          sortKey={sortKey}
          sortDir={sortDir}
          groupByCategory={groupByCategory}
          groupedRows={groupedRows}
          onSort={toggleSort}
          onSelect={(r) => {
            setSelected(r);
            setSelectedThreshold(thresholdMap[r.product_id] ?? '');
            setSelectedStock(r.physical_stock);
            loadMovements(r.product_id);
            loadReserved(r.product_id);
          }}
          onUpdateLocation={updateLocation}
          onUpdateSupplier={updateSupplier}
          hasWriteAccess={hasWriteAccess}
          thresholdMap={thresholdMap}
          defaultThreshold={defaultThreshold}
          effectiveThreshold={effectiveThreshold}
        />
        {loading === LoadState.Loading && rows.length > 0 && (
          <div className="p-4 text-xs text-slate-500 bg-slate-50/50 flex items-center justify-center gap-2 border-t border-slate-100">
            <span className="w-2 h-2 bg-primary-navy rounded-full animate-bounce"></span>
            Veriler Tazeleniyor...
          </div>
        )}
      </div>

      {/* Sağ detay çekmecesi */}
      <InventoryDetailDrawer
        selected={selected}
        setSelected={setSelected}
        printingQr={printingQr}
        setPrintingQr={setPrintingQr}
        selectedStock={selectedStock}
        selectedThreshold={selectedThreshold}
        setSelectedThreshold={setSelectedThreshold}
        defaultThreshold={defaultThreshold}
        saving={saving}
        saveThreshold={saveThreshold}
        hasWriteAccess={hasWriteAccess}
        moveQty={moveQty}
        setMoveQty={setMoveQty}
        moving={moving}
        adjustStock={adjustStock}
        reservedOrders={reservedOrders}
        movements={movements}
        undoLastMovement={undoLastMovement}
        undoing={undoing}
        t={t}
      />

      {/* CSV Import Modal */}
      <InventoryCsvImport
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onSuccess={() => load()}
        effectiveThreshold={effectiveThreshold}
      />

    </div>
  )
}
export default AdminInventoryPage


