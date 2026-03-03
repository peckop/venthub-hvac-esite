import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass, adminCardClass, adminButtonPrimaryClass, adminButtonSecondaryClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import EditableCell from '../../components/admin/EditableCell'
import InfoTooltip from '../../components/admin/InfoTooltip'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import toast from 'react-hot-toast'

type Row = {
  product_id: string;
  name: string;
  physical_stock: number;
  reserved_stock: number;
  available_stock: number;
  warehouse_location?: string | null;
  supplier_name?: string | null;
  daily_velocity?: number;
  days_until_empty?: number;
  abc_class?: 'A' | 'B' | 'C' | null;
}

type SortKey = 'name' | 'physical' | 'reserved' | 'available' | 'threshold' | 'status' | 'location' | 'supplier' | 'days_empty' | 'abc'

type Category = { id: string; name: string }

type ReservedRow = { order_id: string; created_at: string; status: string; payment_status: string | null; quantity: number }

enum LoadState { Idle, Loading, Error }

const AdminInventoryPage: React.FC = () => {
  const { t } = useI18n()
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

  // Çekmece içi hızlı hareket durumu
  const [moveQty, setMoveQty] = React.useState<number>(1)
  const [moving, setMoving] = React.useState<boolean>(false)

  // CSV import/export states
  const [csvImportOpen, setCsvImportOpen] = React.useState<boolean>(false)
  const [_csvFile, setCsvFile] = React.useState<File | null>(null)
  const [csvPreview, setCsvPreview] = React.useState<{ sku: string; name: string; current: number; new: number; delta: number; status: 'out' | 'critical' | null }[]>([])
  const [csvProcessing, setCsvProcessing] = React.useState<boolean>(false)
  const [dryRun, setDryRun] = React.useState<boolean>(true)
  const csvUndoingRef = React.useRef(false)
  const [_csvErrors, setCsvErrors] = React.useState<Array<{ line: number; sku: string; message: string }>>([])
  const [csvProgress, setCsvProgress] = React.useState<number>(0)

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
      const reason = `undo:${shortId}`
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
      const [invRes, velRes, settingsRes, catRes] = await Promise.all([
        supabase.from('inventory_summary').select('*'),
        supabase.from('inventory_velocity').select('product_id, daily_velocity, days_until_empty, abc_class'),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
        supabase.from('categories').select('id,name').order('name', { ascending: true })
      ])
      if (invRes.error) throw invRes.error
      const vMap = new Map((velRes.data || []).map((v: any) => [v.product_id, v]))
      const invRows = (invRes.data || []).map((r: any) => ({
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

  React.useEffect(() => { load() }, [load])

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
  const computeEffectiveThresholdLocal = React.useCallback((productId: string): number | null => {
    const hasOverride = !!overrideMap[productId]
    const ovVal = thresholdMap[productId]
    const defVal = defaultThreshold ?? null
    if (!hasOverride || ovVal == null) return defVal
    if (defVal != null && Number(ovVal) === Number(defVal)) return defVal
    return Number(ovVal)
  }, [overrideMap, thresholdMap, defaultThreshold])

  const statusKey = React.useCallback((r: Row): 'out' | 'critical' | 'reserved' | 'ok' => {
    const net = r.available_stock
    const th = computeEffectiveThresholdLocal(r.product_id)
    if (net <= 0) return 'out'
    if (th != null && net <= th) return 'critical'
    if (r.reserved_stock > 0) return 'reserved'
    return 'ok'
  }, [computeEffectiveThresholdLocal])

  const statusRank = React.useCallback((r: Row) => {
    const net = r.available_stock
    const th = computeEffectiveThresholdLocal(r.product_id)
    if (net <= 0) return 0 // Tükendi
    if (th != null && net <= th) return 1 // Kritik
    if (r.reserved_stock > 0) return 2 // Rezervli
    return 3 // Uygun
  }, [computeEffectiveThresholdLocal])

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
          const ea = computeEffectiveThresholdLocal(a.product_id) ?? -Infinity
          const eb = computeEffectiveThresholdLocal(b.product_id) ?? -Infinity
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
  }, [filteredRows, sortKey, sortDir, computeEffectiveThresholdLocal, statusRank])

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

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? '▲' : '▼'
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

  const loadProductDetails = React.useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock_qty, low_stock_threshold, low_stock_override')
        .eq('id', productId)
        .maybeSingle()
      if (error) throw error
      setSelectedStock((data?.stock_qty as number | null) ?? null)
      const th = (data?.low_stock_threshold as number | null)
      const ov = Boolean((data as { low_stock_override?: boolean } | null)?.low_stock_override)
      setSelectedThreshold(!ov || th == null ? '' : th)
    } catch {
      setSelectedStock(null)
      setSelectedThreshold('')
    }
  }, [])

  const effectiveThreshold = React.useCallback((productId: string): number | null => {
    const hasOverride = !!overrideMap[productId]
    const ovVal = thresholdMap[productId]
    const defVal = defaultThreshold ?? null
    // Eğer override yoksa ya da override null ise -> default
    if (!hasOverride || ovVal == null) return defVal
    // Override var ama değer default ile aynıysa -> default’u kullan
    if (defVal != null && Number(ovVal) === Number(defVal)) return defVal
    // Gerçek bir override ise ürün değerini kullan
    return Number(ovVal)
  }, [thresholdMap, overrideMap, defaultThreshold])

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

  // CSV import/export functions
  const handleCsvImport = async (file: File) => {
    setCsvFile(file)
    setCsvPreview([])
    setCsvErrors([])
    try {
      const textRaw = await file.text()
      const text = textRaw.replace(/^\ufeff/, '')
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length < 2) {
        toast.error('CSV dosyası en az bir başlık satırı ve bir veri satırı içermelidir')
        return
      }

      const split = (s: string) =>
        s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))

      const headerRaw = split(lines[0]).map(h => h.trim().toLowerCase())
      // Desteklenen başlıklar: sku,qty | sku,quantity | sku,stock | sku,new_stock
      const skuIdx = headerRaw.indexOf('sku')
      let qtyIdx = headerRaw.indexOf('qty')
      if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('quantity')
      if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('stock')
      if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('new_stock')

      if (skuIdx === -1 || qtyIdx === -1) {
        toast.error('Başlık satırında sku ve qty/quantity/stock sütunları bulunmalı')
        return
      }

      // Satırları ayrıştır
      const parsedRows: Array<{ line: number; sku: string; newQty: number }> = []
      const errors: Array<{ line: number; sku: string; message: string }> = []

      for (let i = 1; i < lines.length; i++) {
        const cells = split(lines[i])
        if (cells.every(c => (c ?? '').trim() === '')) continue
        const sku = String(cells[skuIdx] || '').trim()
        const qtyStr = String(cells[qtyIdx] || '').trim()
        const newQty = qtyStr === '' ? NaN : Number(qtyStr)
        if (!sku) {
          errors.push({ line: i + 1, sku: '', message: 'SKU eksik' })
          continue
        }
        if (!Number.isFinite(newQty)) {
          errors.push({ line: i + 1, sku, message: 'Miktar sayı olmalı' })
          continue
        }
        parsedRows.push({ line: i + 1, sku, newQty: Math.max(0, Math.trunc(newQty)) })
      }

      if (parsedRows.length === 0) {
        setCsvErrors(errors)
        toast.error('Geçerli satır bulunamadı')
        return
      }

      // SKU -> product_id eşlemesi
      const skus = Array.from(new Set(parsedRows.map(r => r.sku)))
      const { data: products } = await supabase
        .from('products')
        .select('id, sku, name, stock_qty, low_stock_threshold, low_stock_override')
        .in('sku', skus as string[])

      if (!products || products.length === 0) {
        toast.error('Eşleşen SKU bulunamadı')
        return
      }

      const skuToProduct = new Map(
        (products as Array<{ sku: string; id: string; name: string; stock_qty: number | null }>)
          .map(p => [p.sku, { id: p.id, name: p.name, stock: Number(p.stock_qty || 0) }])
      )

      const preview: Array<{ sku: string; name: string; current: number; new: number; delta: number; status: 'out' | 'critical' | null }> = []

      for (const row of parsedRows) {
        const product = skuToProduct.get(row.sku)
        if (!product) {
          errors.push({ line: row.line, sku: row.sku, message: 'SKU eşleşmedi' })
          continue
        }
        const th = effectiveThreshold(product.id)
        const status: 'out' | 'critical' | null = (row.newQty <= 0)
          ? 'out'
          : (th != null && row.newQty <= Number(th)) ? 'critical' : null
        preview.push({
          sku: row.sku,
          name: product.name,
          current: product.stock,
          new: row.newQty,
          delta: row.newQty - product.stock,
          status
        })
      }

      setCsvErrors(errors)
      setCsvPreview(preview)
      if (errors.length > 0) {
        toast('Bazı satırlar atlandı; önizlemeyi kontrol edin')
      }
    } catch (err) {
      console.error('CSV parse error:', err)
      toast.error('CSV dosyası işlenirken hata oluştu')
    }
  }

  const processCSV = async () => {
    if (csvPreview.length === 0) {
      toast.error('İşlenecek veri yok')
      return
    }

    setCsvProcessing(true)
    setCsvProgress(0)
    try {
      // SKU -> product_id eşlemesi için tekrar sorgu
      const skus = csvPreview.map(item => item.sku)
      const { data: products } = await supabase
        .from('products')
        .select('id, sku')
        .in('sku', skus as string[])

      if (!products || products.length === 0) {
        throw new Error('Eşleşen ürün bulunamadı')
      }

      const skuToId = new Map((products as Array<{ sku: string; id: string }>).map((p) => [p.sku, p.id]))

      // Dry run modunda gerçek işlem yapma
      if (dryRun) {
        toast.success('Kuru çalıştırma başarılı, işlem yapılmadı')
        setCsvImportOpen(false)
        return
      }

      // Chunked & parallel processing
      let successCount = 0
      const errors: Array<{ sku: string; message: string }> = []
      const genBatchId = (): string => {
        try {
          if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID()
          }
        } catch { }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      }
      const batchId = genBatchId()

      const BATCH_SIZE = 20
      for (let i = 0; i < csvPreview.length; i += BATCH_SIZE) {
        const chunk = csvPreview.slice(i, i + BATCH_SIZE)
        await Promise.all(chunk.map(async (item) => {
          const productId = skuToId.get(item.sku)
          if (!productId || item.delta === 0) return
          try {
            const reason = `CSV import: ${item.delta > 0 ? 'add' : 'remove'} ${Math.abs(item.delta)}`
            const { error } = await supabase.rpc('adjust_stock', {
              p_product_id: productId,
              p_delta: item.delta,
              p_reason: reason,
              p_batch_id: batchId as string
            })
            if (error) throw error
            const { logAdminAction } = await import('../../lib/audit')
            await logAdminAction(supabase, {
              table_name: 'inventory_movements',
              row_pk: productId,
              action: 'INSERT',
              before: null,
              after: { delta: item.delta, reason, batch_id: batchId },
              comment: `CSV import (batch:${batchId})`
            })
            successCount++
          } catch (err) {
            console.error(`Error updating stock for SKU ${item.sku}:`, err)
            errors.push({ sku: item.sku, message: (err as Error)?.message || 'Bilinmeyen hata' })
          }
        }))
        setCsvProgress(Math.min(1, (i + chunk.length) / csvPreview.length))
      }

      setCsvImportOpen(false)
      await load() // Tüm listeyi yenile

      const downloadErrors = () => {
        if (errors.length === 0) return
        const header = ['sku', 'message']
        const lines = errors.map(e => ['"' + e.sku.replace(/"/g, '""') + '"', '"' + e.message.replace(/"/g, '""') + '"'].join(','))
        const csv = '\ufeff' + [header.join(','), ...lines].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inventory_errors_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      // Geri Al + Hata indirme butonlu toast
      toast.custom((t) => (
        <div className="rounded-lg border border-slate-200 bg-white shadow px-3 py-2 text-sm flex items-center gap-3">
          <span>{successCount} ürün güncellendi.</span>
          <a
            href={`/admin/movements?batch=${batchId}`}
            className="px-2 py-1 text-xs rounded border border-slate-200 hover:border-primary-navy text-primary-navy"
          >Hareketleri Gör</a>
          {errors.length > 0 && (
            <button
              className="px-2 py-1 text-xs rounded border border-slate-200 hover:border-primary-navy"
              onClick={() => { downloadErrors(); toast.dismiss(t.id) }}
            >Hataları İndir</button>
          )}
          <button
            className="px-2 py-1 text-xs rounded bg-warning-orange/10 text-warning-orange hover:bg-warning-orange hover:text-white"
            onClick={async () => {
              if (csvUndoingRef.current) return
              csvUndoingRef.current = true
              try {
                const { data, error } = await supabase.rpc('reverse_inventory_batch', { p_batch_id: batchId as string })
                if (error) throw error
                const undone = Number(data || 0)
                toast.success(`${undone} hareket geri alındı`)
                load()
              } catch (e) {
                console.error('csv undo error', e)
                toast.error('Geri alma başarısız')
              } finally {
                csvUndoingRef.current = false
                toast.dismiss(t.id)
              }
            }}
          >Geri Al</button>
        </div>
      ), { duration: 10000 })

    } catch (err) {
      console.error('CSV processing error:', err)
      toast.error('CSV işlenirken hata oluştu')
    } finally {
      setCsvProcessing(false)
      setCsvProgress(0)
    }
  }

  const exportCsv = async () => {
    // Görünür satırlardaki ürün ID'lerinden SKU haritasını oluştur
    const ids = Array.from(new Set(sortedRows.map(r => r.product_id)))
    let idToSku = new Map<string, string>()
    try {
      if (ids.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, sku')
          .in('id', ids)
        if (!error && data) {
          idToSku = new Map((data as Array<{ id: string; sku: string }>).map(p => [p.id, p.sku]))
        }
      }
    } catch {
      // no-op, fallback to product_id if SKU alınamazsa
    }

    // Sadece görünür satırlar için CSV oluştur
    const exportRows = sortedRows.map(r => ({
      sku: idToSku.get(r.product_id) || r.product_id,
      name: r.name,
      physical_stock: r.physical_stock,
      reserved_stock: r.reserved_stock,
      available_stock: r.available_stock
    }))

    // CSV içeriği oluştur
    const header = ['SKU', 'Ürün Adı', 'Fiziksel Stok', 'Rezerve Stok', 'Satılabilir Stok']
    const csvContent = [
      header.join(','),
      ...exportRows.map(row => [
        '"' + row.sku.replace(/"/g, '""') + '"',
        '"' + row.name.replace(/"/g, '""') + '"',
        row.physical_stock,
        row.reserved_stock,
        row.available_stock
      ].join(','))
    ].join('\n')

    // Dosyayı indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportCsvTemplate = () => {
    const header = ['sku', 'qty']
    const csv = '\ufeff' + header.join(',') + '\n' + ['"PRD001"', '10'].join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory_template.csv'
    a.click()
    URL.revokeObjectURL(url)
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

  // Görünür kolonlar ve yoğunluk
  const STORAGE_KEY = 'toolbar:inventory'
  const [visibleCols, setVisibleCols] = React.useState<{ name: boolean; physical: boolean; reserved: boolean; available: boolean; threshold: boolean; status: boolean; location: boolean; supplier: boolean; abc: boolean; days: boolean }>({ name: true, physical: true, reserved: true, available: true, threshold: true, status: true, location: true, supplier: false, abc: true, days: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
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
  const visibleCount = (visibleCols.name ? 1 : 0) + (visibleCols.physical ? 1 : 0) + (visibleCols.reserved ? 1 : 0) + (visibleCols.available ? 1 : 0) + (visibleCols.threshold ? 1 : 0) + (visibleCols.status ? 1 : 0) + (visibleCols.location ? 1 : 0) + (visibleCols.supplier ? 1 : 0) + (visibleCols.abc ? 1 : 0) + (visibleCols.days ? 1 : 0)

  const printQrLabel = async (r: Row) => {
    try {
      setPrintingQr(true)
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(r.product_id)}`

      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      const safeName = (r.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const safeSku = r.product_id.slice(0, 8).toUpperCase().replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const safeLoc = (r.warehouse_location || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Etiket Yazdir - ${safeSku}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');
            @page {
              margin: 0;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 'Inter', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              min-height: 100vh;
              text-align: center;
              background: #f8fafc;
              color: black;
            }
            .card-wrapper {
              width: 100%;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
            }
            .card {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 40px;
              width: 100%;
              max-width: 450px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .qr-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 24px;
            }
            .qr {
              width: 180px;
              height: 180px;
              display: block;
            }
            .title {
              font-size: 20px;
              font-weight: 800;
              letter-spacing: -0.5px;
              line-height: 1.3;
              margin: 0 0 24px 0;
              text-transform: uppercase;
              color: #0f172a;
            }
            .separator {
              width: 100%;
              height: 2px;
              background-color: #e2e8f0;
              margin: 24px 0;
            }
            .meta-grid {
              display: flex;
              width: 100%;
              justify-content: space-between;
              margin-bottom: 32px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 50%;
            }
            .meta-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .meta-value {
              font-weight: 800;
              font-size: 18px;
              color: #0f172a;
            }
            .meta-footer {
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              background-color: #f1f5f9;
              color: #0f172a;
              padding: 14px 24px;
              border-radius: 8px;
              border: 2px dashed #cbd5e1;
              display: inline-block;
            }
            @media print {
              body { background: white; }
              .card-wrapper { padding: 0; flex-direction: column; justify-content: flex-start; align-items: flex-start; }
              .card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div class="card">
              <div class="qr-wrapper">
                <img src="${url}" class="qr" onload="window.print();" />
              </div>
              <div class="title">${safeName}</div>
              <div class="separator"></div>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">SKU Kodu</span>
                  <span class="meta-value">${safeSku}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Depo Rafı</span>
                  <span class="meta-value">${safeLoc}</span>
                </div>
              </div>
              <div class="meta-footer">
                MEVCUT STOK: ${r.physical_stock} ADET
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
      }

      // 5 saniye sonra gizli çerçeveyi DOM'dan temizle
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }, 5000)

    } catch (e) {
      toast.error('Etiket oluşturulamadı')
    } finally {
      setPrintingQr(false)
    }
  }

  // ESC ile çekmeceyi kapat
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function statusBadge(r: Row) {
    const net = r.available_stock
    const th = effectiveThreshold(r.product_id)
    if (net <= 0) return <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">Tükendi</span>
    if (th != null && net <= th) return <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">Kritik</span>
    if (r.reserved_stock > 0) return <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">Rezervli</span>
    return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Uygun</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.inventory') ?? 'Stok Özeti'}</h1>
        <button onClick={() => window.location.href = '/admin/inventory/settings'} className={adminButtonPrimaryClass}>
          Stok Ayarları
        </button>
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
        ]}
        onClear={() => { setQ(''); setSelectedCategory(''); setStatusFilter({ out: false, critical: false, reserved: false, ok: false }) }}
        recordCount={filteredRows.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCsvImportOpen(true)}
              className={`${adminButtonPrimaryClass} shadow-md shadow-primary-navy/10`}
            >
              CSV İçe Aktar
            </button>
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
              { key: 'template', label: 'CSV Şablonu (sku,qty)', onSelect: () => { void exportCsvTemplate() } }
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

      <div className={adminCardClass + " overflow-hidden"}>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {visibleCols.name && (
                <th className={adminTableHeadCellClass + " " + headPad}>
                  <button onClick={() => toggleSort('name')} className="hover:underline flex items-center gap-1 uppercase tracking-wider">
                    Ürün {sortIndicator('name')}
                  </button>
                </th>
              )}
              {visibleCols.physical && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-right uppercase tracking-wider"}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleSort('physical')} className="hover:underline flex items-center gap-1">
                      Fiziksel {sortIndicator('physical')}
                    </button>
                    <InfoTooltip text="Depodaki gerçekte sayılan mevcut ürün adedi." />
                  </div>
                </th>
              )}
              {visibleCols.reserved && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-right uppercase tracking-wider"}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleSort('reserved')} className="hover:underline flex items-center gap-1">
                      Rezerve {sortIndicator('reserved')}
                    </button>
                    <InfoTooltip text="Henüz kargolanmamış ama parası ödenmiş (siparişi verilmiş) ürün miktarı." />
                  </div>
                </th>
              )}
              {visibleCols.available && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-right uppercase tracking-wider"}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleSort('available')} className="hover:underline flex items-center gap-1 text-primary-navy">
                      Müsait {sortIndicator('available')}
                    </button>
                    <InfoTooltip text="Müşterilere satılabilecek durumdaki net stok adedi. (Fiziksel - Rezerve)" />
                  </div>
                </th>
              )}
              {visibleCols.threshold && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-right uppercase tracking-wider"}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleSort('threshold')} className="hover:underline flex items-center gap-1">
                      Eşik {sortIndicator('threshold')}
                    </button>
                    <InfoTooltip text="Müsait stok bu rakamın altına indiğinde sistem 'Kritik Stok' uyarısı verir." />
                  </div>
                </th>
              )}
              {visibleCols.location && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase tracking-wider"}>
                  <button onClick={() => toggleSort('location')} className="hover:underline flex items-center gap-1">
                    Raf {sortIndicator('location')}
                  </button>
                </th>
              )}
              {visibleCols.supplier && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase tracking-wider"}>
                  <button onClick={() => toggleSort('supplier')} className="hover:underline flex items-center gap-1">
                    Tedarikçi {sortIndicator('supplier')}
                  </button>
                </th>
              )}
              {visibleCols.abc && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-center uppercase tracking-wider"}>
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => toggleSort('abc')} className="hover:underline flex items-center gap-1">
                      Sınıf {sortIndicator('abc')}
                    </button>
                    <InfoTooltip text="Satış hacmine göre ürünün önem derecesi: A (En Popüler), B (Orta), C (Az Satan)." />
                  </div>
                </th>
              )}
              {visibleCols.days && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-right uppercase tracking-wider"}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleSort('days_empty')} className="hover:underline flex items-center gap-1">
                      Tükenme Hızı {sortIndicator('days_empty')}
                    </button>
                    <InfoTooltip text="Son 30 günlük satış ivmesine göre eldeki müsait stoğun kaç gün içinde biteceği tahmini." />
                  </div>
                </th>
              )}
              {visibleCols.status && (
                <th className={adminTableHeadCellClass + " " + headPad + " text-center uppercase tracking-wider"}>Durum</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading === LoadState.Loading && filteredRows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Yükleniyor...</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Ürün bulunamadı</td></tr>
            ) : groupByCategory ? (
              groupedRows.map(g => (
                <React.Fragment key={g.cid ?? 'null'}>
                  <tr className="bg-slate-50/80">
                    <th colSpan={5} className={`text-left ${density === 'compact' ? 'px-4 py-2' : 'px-6 py-3'} text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200`}>
                      {g.name || 'Kategorisiz'}
                    </th>
                  </tr>
                  {g.items.map(r => (
                    <tr
                      key={r.product_id}
                      className={`group hover:bg-slate-50/50 cursor-pointer transition-colors ${r.available_stock <= 0 ? 'bg-rose-50/20' : r.available_stock <= (thresholdMap[r.product_id] ?? defaultThreshold ?? 10) ? 'bg-amber-50/20' : ''}`}
                      onClick={() => { setSelected(r); setSelectedThreshold(thresholdMap[r.product_id] ?? ''); setSelectedStock(r.physical_stock); loadMovements(r.product_id); }}
                    >
                      {visibleCols.name && (
                        <td className={adminTableCellClass + " " + cellPad}>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 group-hover:text-primary-navy transition-colors">{r.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 uppercase">{r.product_id.slice(0, 8)}</span>
                          </div>
                        </td>
                      )}
                      {visibleCols.physical && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>{r.physical_stock}</td>}
                      {visibleCols.reserved && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-400"}>{r.reserved_stock}</td>}
                      {visibleCols.available && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-bold text-slate-900"}>{r.available_stock}</td>}
                      {visibleCols.threshold && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>{thresholdMap[r.product_id] ?? defaultThreshold ?? 10}</td>}
                      {visibleCols.location && (
                        <td className={adminTableCellClass + " " + cellPad}>
                          <EditableCell
                            value={r.warehouse_location || ''}
                            placeholder="-"
                            inputWidth="w-20"
                            onSave={async (val) => {
                              if (r.warehouse_location === val) return
                              const { error } = await supabase.from('products').update({ warehouse_location: val || null }).eq('id', r.product_id)
                              if (error) throw error
                              setRows(prev => prev.map(row => row.product_id === r.product_id ? { ...row, warehouse_location: val || null } : row))
                              toast.success('Raf konumu güncellendi')
                            }}
                          />
                        </td>
                      )}
                      {visibleCols.supplier && (
                        <td className={adminTableCellClass + " " + cellPad}>
                          <EditableCell
                            value={r.supplier_name || ''}
                            placeholder="-"
                            inputWidth="w-24"
                            className="max-w-[120px] truncate block"
                            onSave={async (val) => {
                              if (r.supplier_name === val) return
                              const { error } = await supabase.from('products').update({ supplier_name: val || null }).eq('id', r.product_id)
                              if (error) throw error
                              setRows(prev => prev.map(row => row.product_id === r.product_id ? { ...row, supplier_name: val || null } : row))
                              toast.success('Tedarikçi güncellendi')
                            }}
                          />
                        </td>
                      )}
                      {visibleCols.abc && (
                        <td className={adminTableCellClass + " " + cellPad + " text-center"}>
                          {r.abc_class === 'A' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs" title="Sermayenin büyük kısmı ve yüksek hız">A</span> :
                            r.abc_class === 'B' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">B</span> :
                              r.abc_class === 'C' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs" title="Düşük hareket/sermaye">C</span> : '-'}
                        </td>
                      )}
                      {visibleCols.days && (
                        <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>
                          {r.days_until_empty === 9999 ? (
                            <span className="text-slate-400 text-xs">Hareketsiz</span>
                          ) : (
                            <span className={`text-xs ${r.days_until_empty && r.days_until_empty <= 7 ? 'text-rose-600 font-bold flex justify-end items-center gap-1 animate-pulse' : 'text-slate-600'}`}>
                              {r.days_until_empty && r.days_until_empty <= 7 && '🔥 '}
                              ≈ {r.days_until_empty} gün
                            </span>
                          )}
                        </td>
                      )}
                      {visibleCols.status && <td className={adminTableCellClass + " " + cellPad + " text-center"}>{statusBadge(r)}</td>}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              sortedRows.map(r => (
                <tr
                  key={r.product_id}
                  className={`group hover:bg-slate-50/50 cursor-pointer transition-colors ${r.available_stock <= 0 ? 'bg-rose-50/20' : r.available_stock <= (thresholdMap[r.product_id] ?? defaultThreshold ?? 10) ? 'bg-amber-50/20' : ''}`}
                  onClick={() => { setSelected(r); setSelectedThreshold(thresholdMap[r.product_id] ?? ''); setSelectedStock(r.physical_stock); loadMovements(r.product_id); }}
                >
                  {visibleCols.name && (
                    <td className={adminTableCellClass + " " + cellPad}>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 group-hover:text-primary-navy transition-colors">{r.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">{r.product_id.slice(0, 8)}</span>
                      </div>
                    </td>
                  )}
                  {visibleCols.physical && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>{r.physical_stock}</td>}
                  {visibleCols.reserved && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-400"}>{r.reserved_stock}</td>}
                  {visibleCols.available && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-bold text-slate-900"}>{r.available_stock}</td>}
                  {visibleCols.threshold && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>{thresholdMap[r.product_id] ?? defaultThreshold ?? 10}</td>}
                  {visibleCols.location && (
                    <td className={adminTableCellClass + " " + cellPad}>
                      <EditableCell
                        value={r.warehouse_location || ''}
                        placeholder="-"
                        inputWidth="w-20"
                        onSave={async (val) => {
                          if (r.warehouse_location === val) return
                          const { error } = await supabase.from('products').update({ warehouse_location: val || null }).eq('id', r.product_id)
                          if (error) throw error
                          setRows(prev => prev.map(row => row.product_id === r.product_id ? { ...row, warehouse_location: val || null } : row))
                          toast.success('Raf konumu güncellendi')
                        }}
                      />
                    </td>
                  )}
                  {visibleCols.supplier && (
                    <td className={adminTableCellClass + " " + cellPad}>
                      <EditableCell
                        value={r.supplier_name || ''}
                        placeholder="-"
                        inputWidth="w-24"
                        className="max-w-[120px] truncate block"
                        onSave={async (val) => {
                          if (r.supplier_name === val) return
                          const { error } = await supabase.from('products').update({ supplier_name: val || null }).eq('id', r.product_id)
                          if (error) throw error
                          setRows(prev => prev.map(row => row.product_id === r.product_id ? { ...row, supplier_name: val || null } : row))
                          toast.success('Tedarikçi güncellendi')
                        }}
                      />
                    </td>
                  )}
                  {visibleCols.abc && (
                    <td className={adminTableCellClass + " " + cellPad + " text-center"}>
                      {r.abc_class === 'A' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs" title="Sermayenin büyük kısmı ve yüksek hız">A</span> :
                        r.abc_class === 'B' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">B</span> :
                          r.abc_class === 'C' ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs" title="Düşük hareket/sermaye">C</span> : '-'}
                    </td>
                  )}
                  {visibleCols.days && (
                    <td className={adminTableCellClass + " " + cellPad + " text-right font-mono"}>
                      {r.days_until_empty === 9999 ? (
                        <span className="text-slate-400 text-xs">Hareketsiz</span>
                      ) : (
                        <span className={`text-xs ${r.days_until_empty && r.days_until_empty <= 7 ? 'text-rose-600 font-bold flex justify-end items-center gap-1 animate-pulse' : 'text-slate-600'}`}>
                          {r.days_until_empty && r.days_until_empty <= 7 && '🔥 '}
                          ≈ {r.days_until_empty} gün
                        </span>
                      )}
                    </td>
                  )}
                  {visibleCols.status && <td className={adminTableCellClass + " " + cellPad + " text-center"}>{statusBadge(r)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {
          loading === LoadState.Loading && (
            <div className="p-4 text-sm text-slate-500">Yükleniyor…</div>
          )
        }
        {
          loading === LoadState.Error && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )
        }
      </div >

      {/* Sağ detay çekmecesi */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white/95 backdrop-blur z-50 shadow-2xl border-l border-slate-200/80 flex flex-col animate-in slide-in-from-right duration-200">
            <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 truncate pr-4">{selected.name}</h2>
              <div className="flex items-center gap-2">
                <button disabled={printingQr} className={adminButtonPrimaryClass + " h-9 text-xs px-3 shadow-md shadow-primary-navy/10"} onClick={() => void printQrLabel(selected)}>
                  {printingQr ? 'Hazırlanıyor...' : 'QR Etiket'}
                </button>
                <button className={adminButtonSecondaryClass + " h-9"} onClick={() => setSelected(null)}>{t('admin.ui.close') || 'Kapat'}</button>
              </div>
            </header>
            <div className="p-4 space-y-4 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-navy"></div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Güncel Stok</div>
                  <div className="text-2xl font-black text-slate-800 ml-1">{selectedStock ?? '-'}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Eşik (Alarm)</div>
                  <div className="text-2xl font-black text-slate-800 ml-1">{(selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold) as string | number}</div>
                </div>
              </div>

              {selected.daily_velocity !== undefined && selected.daily_velocity > 0 && (
                <section className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
                  <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Zeki Satın Alma Önerisi
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Satış Hızı (30 Gün)</div>
                      <div className="font-mono text-sm font-semibold text-slate-800">{selected.daily_velocity.toFixed(2)} / gün</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Tahmini {Math.ceil(selected.daily_velocity * 30)} adet/ay</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Önerilen Sipariş</div>
                      <div className="font-mono text-2xl font-black text-indigo-600">
                        {Math.max(0, Math.ceil((selected.daily_velocity * 30)) - selected.available_stock)} <span className="text-sm font-semibold">adet</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">30 günlük buffer için</div>
                    </div>
                  </div>

                  {selected.abc_class === 'A' && (
                    <div className="mt-3 text-[10px] bg-indigo-100/50 text-indigo-800 px-2 py-1.5 rounded-md border border-indigo-200/50 flex items-center gap-1.5">
                      <span className="font-bold">A Sınıfı:</span> Bu ürün kritik ciro kaynağıdır, stokta daima bulunmalıdır.
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Eşik Düzenle</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={selectedThreshold}
                    onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Eşik"
                    className="w-28 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
                  />
                  <button
                    disabled={saving}
                    onClick={() => saveThreshold(selected.product_id)}
                    className={adminButtonPrimaryClass + " h-9 text-xs px-4"}>Uygula</button>
                  <button
                    disabled={saving}
                    onClick={() => setSelectedThreshold('')}
                    className={adminButtonSecondaryClass + " h-9 text-xs px-4 text-warning-orange border-warning-orange/30 hover:bg-warning-orange/5"}>Varsayılan</button>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-500">Hızlı Hareket</h3>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all" value={moveQty} min={1} onChange={(e) => setMoveQty(Math.max(1, Number(e.target.value || 1)))} />
                  <button disabled={moving} className={adminButtonSecondaryClass + " h-9 text-xs px-4"} onClick={() => adjustStock(selected.product_id, Math.abs(moveQty), 'manual_in')}>Giriş</button>
                  <button disabled={moving} className={adminButtonSecondaryClass + " h-9 text-xs px-4"} onClick={() => adjustStock(selected.product_id, -Math.abs(moveQty), 'manual_out')}>Çıkış</button>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-500">Rezerve Eden Siparişler</h3>
                {reservedOrders.length === 0 ? (
                  <div className="text-sm text-slate-500">Bekleyen sipariş yok.</div>
                ) : (
                  <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 text-slate-500">Sipariş</th>
                          <th className="text-left p-2 text-slate-500">Tarih</th>
                          <th className="text-right p-2 text-slate-500">Adet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reservedOrders.map(ro => (
                          <tr key={ro.order_id}>
                            <td className="p-2 text-primary-navy font-medium uppercase">{ro.order_id.slice(-8)}</td>
                            <td className="p-2 text-slate-500">{formatDateTime(ro.created_at, 'tr')}</td>
                            <td className="p-2 text-right">{ro.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Hareket Geçmişi</h3>
                  <button onClick={undoLastMovement} disabled={undoing || movements.length === 0} className={adminButtonSecondaryClass + " h-8 !px-2 text-[10px] uppercase font-bold tracking-wider"}>Geri Al</button>
                </div>
                {movements.length === 0 ? (
                  <div className="text-sm text-slate-500">Hareket yok.</div>
                ) : (
                  <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 text-slate-500">Tarih</th>
                          <th className="text-left p-2 text-slate-500">Sebep</th>
                          <th className="text-right p-2 text-slate-500">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {movements.map(m => (
                          <tr key={m.id}>
                            <td className="p-2 text-slate-400">{formatDateTime(m.created_at, 'tr')}</td>
                            <td className="p-2 text-slate-600">{m.reason}</td>
                            <td className={`p-2 text-right font-medium ${Number(m.delta) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {Number(m.delta) > 0 ? '+' : ''}{m.delta}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </aside>
        </>
      )}

      {/* CSV Import Modal */}
      {csvImportOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setCsvImportOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200">
              <header className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">CSV Stok İçe Aktarma</h2>
                <button className={adminButtonSecondaryClass + " w-10 h-10 !p-0 flex items-center justify-center rounded-full"} onClick={() => setCsvImportOpen(false)}>×</button>
              </header>
              <div className="p-6 space-y-6 overflow-auto">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-600 uppercase tracking-tight">CSV Dosyası Seç</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary-navy/40 transition-colors group cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCsvImport(file)
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-slate-400 group-hover:text-primary-navy transition-colors">
                      <p className="text-sm font-medium">Dosyayı buraya sürükleyin veya <span className="text-primary-navy underline">seçin</span></p>
                      <p className="text-xs mt-1">Format: SKU, Miktar (örn: PRD001, 25)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="dryRun"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-navy focus:ring-primary-navy"
                  />
                  <label htmlFor="dryRun" className="text-sm font-medium text-slate-700 select-none">
                    Kuru Çalıştırma (Veritabanını güncelleme, sadece önizle)
                  </label>
                </div>

                {csvPreview.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Önizleme ({csvPreview.length} Ürün)</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-bold text-slate-500">Ürün</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-500">Mevcut</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-500">Yeni</th>
                            <th className="px-3 py-2 text-right font-bold text-slate-500">Delta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {csvPreview.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2">
                                <div className="font-medium text-slate-800">{item.name || item.sku}</div>
                                <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.sku}</div>
                              </td>
                              <td className="px-3 py-2 text-right text-slate-500">{item.current}</td>
                              <td className="px-3 py-2 text-right font-bold text-slate-900">{item.new}</td>
                              <td className={`px-3 py-2 text-right font-bold ${item.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.delta > 0 ? '+' : ''}{item.delta}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <footer className="p-6 border-t border-slate-100 flex justify-end items-center gap-3 bg-slate-50/50">
                <button
                  onClick={() => setCsvImportOpen(false)}
                  className={adminButtonSecondaryClass + " px-6"}
                >
                  İptal
                </button>
                <button
                  onClick={processCSV}
                  disabled={csvPreview.length === 0 || csvProcessing}
                  className={adminButtonPrimaryClass + " px-8 shadow-lg shadow-primary-navy/20"}
                >
                  {csvProcessing ? `İşleniyor... %${Math.round(csvProgress * 100)}` : (dryRun ? 'Kuru Çalıştır' : 'İçe Aktar')}
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
    </div >
  )
}
export default AdminInventoryPage


