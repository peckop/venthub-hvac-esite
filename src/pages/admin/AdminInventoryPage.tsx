import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass, adminCardClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import toast from 'react-hot-toast'

type Row = { product_id: string; name: string; physical_stock: number; reserved_stock: number; available_stock: number }

type SortKey = 'name' | 'physical' | 'reserved' | 'available' | 'threshold' | 'status'

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
  const [csvPreview, setCsvPreview] = React.useState<{ sku: string; name: string; current: number; new: number; delta: number }[]>([])
  const [csvProcessing, setCsvProcessing] = React.useState<boolean>(false)
  const [dryRun, setDryRun] = React.useState<boolean>(true)

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
      const [invRes, settingsRes, catRes] = await Promise.all([
        supabase.from('inventory_summary').select('*'),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
        supabase.from('categories').select('id,name').order('name', { ascending: true })
      ])
      if (invRes.error) throw invRes.error
      const invRows = (invRes.data || []) as Row[]
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
        ;(prodData as { id: string; low_stock_threshold: number | null; low_stock_override?: boolean; category_id?: string | null }[] | null | undefined)?.forEach((p) => {
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

  React.useEffect(()=>{ load() }, [load])

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
    out.sort((a,b) => a.name.localeCompare(b.name, 'tr'))
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
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/)
      if (lines.length < 2) {
        toast.error('CSV dosyası en az bir başlık satırı ve bir veri satırı içermelidir')
        return
      }
      
      // CSV'den ürün SKU ve stok değerlerini oku
      const skuCol = 0 // SKU sütunu (ilk sütun)
      const qtyCol = 1 // Miktar sütunu (ikinci sütun)
      const parseCSV = (line: string) => {
        return line.split(',').map(field => field.trim().replace(/^"(.*)"$/, '$1'))
      }
      
      const header = parseCSV(lines[0])
      if (header.length < 2) {
        toast.error('CSV dosyası en az SKU ve miktar sütunları içermelidir')
        return
      }
      
      // Önizleme hazırla
      const preview: Array<{ sku: string; name: string; current: number; new: number; delta: number }> = []
      // const skuMap = new Map(rows.map(r => [r.product_id, { name: r.name, stock: r.physical_stock }]))
      
      // SKU'dan product_id'ye eşleme için DB sorgusu gerekiyor
      const skus = lines.slice(1)
        .map(line => parseCSV(line)[skuCol])
        .filter(Boolean)
      
      if (skus.length === 0) {
        toast.error('Geçerli SKU bulunamadı')
        return
      }
      
      // SKU -> product_id eşlemesi
      const { data: products } = await supabase
        .from('products')
        .select('id, sku, name, stock_qty')
        .in('sku', skus)
      
      if (!products || products.length === 0) {
        toast.error('Eşleşen SKU bulunamadı')
        return
      }
      
      // Her bir satır için önizleme bilgisi hazırla
      const skuToProduct = new Map((products as Array<{ sku: string; id: string; name: string; stock_qty: number | null }>).map((p) => [p.sku, { id: p.id, name: p.name, stock: Number(p.stock_qty || 0) }]))
      
      for (let i = 1; i < lines.length; i++) {
        const fields = parseCSV(lines[i])
        if (fields.length < 2) continue
        
        const sku = fields[skuCol]
        const newQty = parseInt(fields[qtyCol], 10)
        
        if (!sku || isNaN(newQty)) continue
        
        const product = skuToProduct.get(sku)
        if (!product) continue
        
        preview.push({
          sku,
          name: product.name,
          current: product.stock,
          new: newQty,
          delta: newQty - product.stock
        })
      }
      
      setCsvPreview(preview)
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
      const { logAdminAction } = await import('../../lib/audit')
      
      // Dry run modunda gerçek işlem yapma
      if (dryRun) {
        toast.success('Kuru çalıştırma başarılı, işlem yapılmadı')
        setCsvImportOpen(false)
        return
      }
      
      // Her ürün için stok güncelleme işlemi yap
      let successCount = 0
      for (const item of csvPreview) {
        const productId = skuToId.get(item.sku)
        if (!productId || item.delta === 0) continue
        
        try {
          const reason = `CSV import: ${item.delta > 0 ? 'add' : 'remove'} ${Math.abs(item.delta)}`
          const { error } = await supabase.rpc('adjust_stock', {
            p_product_id: productId,
            p_delta: item.delta,
            p_reason: reason
          })
          
          if (error) throw error
          
          // Audit log
          await logAdminAction(supabase, {
            table_name: 'inventory_movements',
            row_pk: productId,
            action: 'INSERT',
            before: null,
            after: { delta: item.delta, reason },
            comment: 'CSV import'
          })
          
          successCount++
        } catch (err) {
          console.error(`Error updating stock for SKU ${item.sku}:`, err)
        }
      }
      
      toast.success(`${successCount} ürün başarıyla güncellendi`)
      setCsvImportOpen(false)
      load() // Tüm listeyi yenile
    } catch (err) {
      console.error('CSV processing error:', err)
      toast.error('CSV işlenirken hata oluştu')
    } finally {
      setCsvProcessing(false)
    }
  }
  
  const exportCsv = () => {
    // Sadece görünür satırlar için CSV oluştur
    const exportRows = sortedRows.map(r => ({
      sku: r.product_id, // Normalde SKU olmalı ama basit örnek için
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
        `"${row.sku}"`,
        `"${row.name}"`, 
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
  const [visibleCols, setVisibleCols] = React.useState<{ name: boolean; physical: boolean; reserved: boolean; available: boolean; threshold: boolean; status: boolean }>({ name: true, physical: true, reserved: true, available: true, threshold: true, status: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''
  const visibleCount = (visibleCols.name?1:0)+(visibleCols.physical?1:0)+(visibleCols.reserved?1:0)+(visibleCols.available?1:0)+(visibleCols.threshold?1:0)+(visibleCols.status?1:0)

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
      <h1 className={adminSectionTitleClass}>{t('admin.titles.inventory')}</h1>

      {/* Hızlı arama */}
      <AdminToolbar
        storageKey="toolbar:inventory"
        sticky
        search={{ value: q, onChange: setQ, placeholder: 'Ürün ara (ad)', focusShortcut: '/' }}
        select={{
          value: selectedCategory,
          onChange: setSelectedCategory,
          title: 'Kategori',
          options: [
            { value: '', label: 'Tüm Kategoriler' },
            ...visibleCategories.map(c => ({ value: c.id, label: c.name }))
          ]
        }}
        chips={[
          { key: 'out', label: 'Tükendi', active: statusFilter.out, onToggle: ()=>setStatusFilter(s=>({ ...s, out: !s.out })), classOn: 'bg-gray-200 text-gray-800 border-gray-300', classOff: 'bg-white text-steel-gray border-light-gray' },
          { key: 'critical', label: 'Kritik', active: statusFilter.critical, onToggle: ()=>setStatusFilter(s=>({ ...s, critical: !s.critical })), classOn: 'bg-warning-orange/10 text-warning-orange border-warning-orange/30', classOff: 'bg-white text-steel-gray border-light-gray' },
          { key: 'reserved', label: 'Rezervli', active: statusFilter.reserved, onToggle: ()=>setStatusFilter(s=>({ ...s, reserved: !s.reserved })), classOn: 'bg-blue-100 text-blue-700 border-blue-200', classOff: 'bg-white text-steel-gray border-light-gray' },
          { key: 'ok', label: 'Uygun', active: statusFilter.ok, onToggle: ()=>setStatusFilter(s=>({ ...s, ok: !s.ok })), classOn: 'bg-green-100 text-green-700 border-green-200', classOff: 'bg-white text-steel-gray border-light-gray' },
        ]}
        toggles={[{ key: 'groupByCategory', label: 'Grupla: Kategori', checked: groupByCategory, onChange: setGroupByCategory }]}
        onClear={()=>{ setQ(''); setSelectedCategory(''); setStatusFilter({ out:false, critical:false, reserved:false, ok:false }); setGroupByCategory(false) }}
        recordCount={filteredRows.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <button 
              onClick={()=>setCsvImportOpen(true)}
              className="px-3 py-2 text-sm bg-primary-navy text-white rounded-md hover:bg-primary-navy/90"
            >
              CSV İçe Aktar
            </button>
            <ExportMenu items={[
              { key: 'csv', label: 'CSV İndir', onSelect: exportCsv }
            ]} />
            <ColumnsMenu
              columns={[
                { key: 'name', label: 'Ürün', checked: visibleCols.name, onChange: (v)=>setVisibleCols(s=>({ ...s, name: v })) },
                { key: 'physical', label: 'Fiziksel', checked: visibleCols.physical, onChange: (v)=>setVisibleCols(s=>({ ...s, physical: v })) },
                { key: 'reserved', label: 'Rezerve', checked: visibleCols.reserved, onChange: (v)=>setVisibleCols(s=>({ ...s, reserved: v })) },
                { key: 'available', label: 'Satılabilir', checked: visibleCols.available, onChange: (v)=>setVisibleCols(s=>({ ...s, available: v })) },
                { key: 'threshold', label: 'Eşik', checked: visibleCols.threshold, onChange: (v)=>setVisibleCols(s=>({ ...s, threshold: v })) },
                { key: 'status', label: 'Durum', checked: visibleCols.status, onChange: (v)=>setVisibleCols(s=>({ ...s, status: v })) },
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
              {visibleCols.name && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('name')}>
                    Ürün {sortIndicator('name')}
                  </button>
                </th>
              )}
              {visibleCols.physical && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('physical')}>
                    Fiziksel {sortIndicator('physical')}
                  </button>
                </th>
              )}
              {visibleCols.reserved && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('reserved')}>
                    Rezerve {sortIndicator('reserved')}
                  </button>
                </th>
              )}
              {visibleCols.available && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('available')}>
                    Satılabilir {sortIndicator('available')}
                  </button>
                </th>
              )}
              {visibleCols.threshold && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('threshold')}>
                    Eşik (Efektif) {sortIndicator('threshold')}
                  </button>
                </th>
              )}
              {visibleCols.status && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-sm font-semibold text-industrial-gray text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>
                    Durum {sortIndicator('status')}
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupByCategory ? (
              groupedRows.map(g => (
                <React.Fragment key={g.cid ?? 'null'}>
                  <tr className="bg-gray-100">
                    <th colSpan={visibleCount} className={`text-left ${density==='compact'?'px-2 py-2':'px-3 py-2'} text-industrial-gray font-semibold`}>{g.name}</th>
                  </tr>
                  {g.items.map(r => (
                    <tr
                      key={r.product_id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setSelected(r); loadProductDetails(r.product_id); loadReserved(r.product_id); loadMovements(r.product_id) }}
                    >
                      {visibleCols.name && (<td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>)}
                      {visibleCols.physical && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{r.physical_stock}</td>)}
                      {visibleCols.reserved && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{r.reserved_stock}</td>)}
                      {visibleCols.available && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right font-semibold`}>{r.available_stock}</td>)}
                      {visibleCols.threshold && (
                        <td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>
                          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-light-gray text-steel-gray">
                            {(effectiveThreshold(r.product_id) ?? '-') as number | string}
                          </span>
                        </td>
                      )}
                      {visibleCols.status && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{statusBadge(r)}</td>)}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              sortedRows.map(r => (
                <tr
                  key={r.product_id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => { setSelected(r); loadProductDetails(r.product_id); loadReserved(r.product_id); loadMovements(r.product_id) }}
                >
                  {visibleCols.name && (<td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>)}
                  {visibleCols.physical && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{r.physical_stock}</td>)}
                  {visibleCols.reserved && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{r.reserved_stock}</td>)}
                  {visibleCols.available && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right font-semibold`}>{r.available_stock}</td>)}
                  {visibleCols.threshold && (
                    <td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>
                      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-light-gray text-steel-gray">
                        {(effectiveThreshold(r.product_id) ?? '-') as number | string}
                      </span>
                    </td>
                  )}
                  {visibleCols.status && (<td className={`${density==='compact'?'px-2 py-2':'p-3'} text-right`}>{statusBadge(r)}</td>)}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {loading === LoadState.Loading && (
          <div className="p-4 text-sm text-steel-gray">Yükleniyor…</div>
        )}
        {loading === LoadState.Error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Sağ detay çekmecesi */}
      {selected && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={()=>setSelected(null)} />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-xl border-l border-light-gray flex flex-col">
            <header className="p-4 border-b border-light-gray flex items-center justify-between">
              <h2 className="text-lg font-semibold text-industrial-gray truncate pr-4">{selected.name}</h2>
              <button className="px-3 py-1 text-sm border rounded" onClick={()=>setSelected(null)}>{t('admin.ui.close')}</button>
            </header>
            <div className="p-4 space-y-4 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-light-gray rounded-lg p-3">
                  <div className="text-xs text-steel-gray mb-1">Güncel Stok</div>
                  <div className="text-xl font-semibold text-industrial-gray">{selectedStock ?? '-'}</div>
                </div>
                <div className="bg-white border border-light-gray rounded-lg p-3">
                  <div className="text-xs text-steel-gray mb-1">Etkili Eşik</div>
                  <div className="text-xl font-semibold text-industrial-gray">{(selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold) as number | string}</div>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-industrial-gray">Eşik Düzenle</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={selectedThreshold}
                    onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Eşik"
                    className="w-28 px-3 py-2 border border-light-gray rounded text-sm"
                  />
                  <button
                    disabled={saving}
                    onClick={() => saveThreshold(selected.product_id)}
                    className="px-3 py-2 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50 text-sm"
                  >Uygula</button>
                  <button
                    disabled={saving}
                    onClick={() => setSelectedThreshold('')}
                    className="px-3 py-2 rounded border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white disabled:opacity-50 text-sm"
                  >Varsayılan</button>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-industrial-gray">Hızlı Hareket</h3>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-24 px-2 py-2 border rounded text-sm" value={moveQty} min={1} onChange={(e)=>setMoveQty(Math.max(1, Number(e.target.value||1)))} />
                  <button disabled={moving} className="px-3 py-2 rounded border border-light-gray hover:border-primary-navy text-sm" onClick={()=>adjustStock(selected.product_id, Math.abs(moveQty), 'manual_in')}>Giriş</button>
                  <button disabled={moving} className="px-3 py-2 rounded border border-light-gray hover:border-primary-navy text-sm" onClick={()=>adjustStock(selected.product_id, -Math.abs(moveQty), 'manual_out')}>Çıkış</button>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-industrial-gray">Rezerve Eden Siparişler</h3>
                {reservedOrders.length === 0 ? (
                  <div className="text-sm text-steel-gray">Bekleyen (kargolanmamış) sipariş yok.</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-light-gray">
                      <tr>
                        <th className="text-left p-2 text-xs text-industrial-gray">Sipariş</th>
                        <th className="text-left p-2 text-xs text-industrial-gray">Tarih</th>
                        <th className="text-left p-2 text-xs text-industrial-gray">Durum</th>
                        <th className="text-right p-2 text-xs text-industrial-gray">Adet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservedOrders.map(ro => (
                        <tr key={ro.order_id} className="border-b">
                          <td className="p-2 text-primary-navy text-xs">{ro.order_id.slice(-8).toUpperCase()}</td>
                          <td className="p-2 text-steel-gray text-xs">{formatDateTime(ro.created_at, 'tr')}</td>
                          <td className="p-2 text-steel-gray text-xs">{ro.status}{ro.payment_status ? ` • ${ro.payment_status}` : ''}</td>
                          <td className="p-2 text-right text-xs">{ro.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-industrial-gray">Hareket Geçmişi (Son 5)</h3>
                  <button onClick={undoLastMovement} disabled={undoing || movements.length===0} className="px-3 py-1 rounded border text-xs disabled:opacity-50">Geri Al (10 dk)</button>
                </div>
                {movements.length === 0 ? (
                  <div className="text-sm text-steel-gray">Hareket yok.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-light-gray">
                      <tr>
                        <th className="text-left p-2 text-industrial-gray">Tarih</th>
                        <th className="text-left p-2 text-industrial-gray">Sebep</th>
                        <th className="text-right p-2 text-industrial-gray">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(m => (
                        <tr key={m.id} className="border-b">
                          <td className="p-2">{formatDateTime(m.created_at, 'tr')}</td>
                          <td className="p-2">{m.reason}</td>
                          <td className={`p-2 text-right ${Number(m.delta)>0?'text-green-600':Number(m.delta)<0?'text-red-600':'text-steel-gray'}`}>{Number(m.delta)>0?'+':''}{m.delta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
          </aside>
        </>
      )}

      {/* CSV Import Modal */}
      {csvImportOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={()=>setCsvImportOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-industrial-gray mb-4">CSV Stok İçe Aktarma</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                      CSV Dosyası Seç
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCsvImport(file)
                      }}
                      className="block w-full text-sm text-steel-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-navy file:text-white hover:file:bg-primary-navy/90"
                    />
                    <p className="text-xs text-steel-gray mt-1">
                      Format: SKU,Miktar (örn: "PRD001",25)
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dryRun"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="dryRun" className="text-sm text-industrial-gray">
                      Kuru Çalıştırma (gerçek işlem yapma)
                    </label>
                  </div>

                  {csvPreview.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-industrial-gray mb-2">
                        Önizleme ({csvPreview.length} ürün)
                      </h3>
                      <div className="border rounded max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left">SKU</th>
                              <th className="px-2 py-1 text-left">Ürün</th>
                              <th className="px-2 py-1 text-right">Mevcut</th>
                              <th className="px-2 py-1 text-right">Yeni</th>
                              <th className="px-2 py-1 text-right">Delta</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-2 py-1">{item.sku}</td>
                                <td className="px-2 py-1">{item.name}</td>
                                <td className="px-2 py-1 text-right">{item.current}</td>
                                <td className="px-2 py-1 text-right">{item.new}</td>
                                <td className={`px-2 py-1 text-right ${
                                  item.delta > 0 ? 'text-green-600' : 
                                  item.delta < 0 ? 'text-red-600' : 'text-steel-gray'
                                }`}>
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

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setCsvImportOpen(false)}
                    className="px-4 py-2 text-sm text-steel-gray border border-light-gray rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={processCSV}
                    disabled={csvPreview.length === 0 || csvProcessing}
                    className="px-4 py-2 text-sm bg-primary-navy text-white rounded-md hover:bg-primary-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {csvProcessing ? 'İşleniyor...' : (dryRun ? 'Kuru Çalıştır' : 'İçe Aktar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminInventoryPage
