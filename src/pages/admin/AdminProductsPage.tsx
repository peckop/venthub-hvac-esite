import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import * as Tabs from '@radix-ui/react-tabs'
import { useI18n } from '../../i18n/I18nProvider'

interface ProductRow {
  id: string
  name: string
  sku: string
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
interface ImageRow { id: string; product_id: string; path: string; alt?: string | null; sort_order: number }

const AdminProductsPage: React.FC = () => {
  const { t } = useI18n()
  const [rows, setRows] = React.useState<ProductRow[]>([])
  const [cats, setCats] = React.useState<CategoryOpt[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Toolbar filtreleri (stok özetine uyum)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('')
  const [statusFilter, setStatusFilter] = React.useState<{ active: boolean; inactive: boolean; out_of_stock: boolean }>({ active: false, inactive: false, out_of_stock: false })
  const [featuredOnly, setFeaturedOnly] = React.useState<boolean>(false)

  // Columns & density
const STORAGE_KEY = 'toolbar:products'
  const [visibleCols, setVisibleCols] = React.useState<{ image: boolean; name: boolean; sku: boolean; category: boolean; status: boolean; price: boolean; stock: boolean; actions: boolean }>({ image: true, name: true, sku: true, category: true, status: true, price: true, stock: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
const [defaultThreshold, setDefaultThreshold] = React.useState<number | null>(null)
  const [covers, setCovers] = React.useState<Record<string, string>>({})
  React.useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''

  // selection & form state
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<'info'|'pricing'|'stock'|'images'|'seo'>('info')
  const TAB_KEY = 'products:editTab'
  React.useEffect(()=>{ try { const v=localStorage.getItem(TAB_KEY); if(v==='info'||v==='pricing'||v==='stock'||v==='images'||v==='seo') setTab(v as 'info'|'pricing'|'stock'|'images'|'seo') } catch{} },[])
  React.useEffect(()=>{ try { localStorage.setItem(TAB_KEY, tab) } catch{} }, [tab])

  // info
  const [name, setName] = React.useState('')
  const [sku, setSku] = React.useState('')
  const [brand, setBrand] = React.useState('')
  const [status, setStatus] = React.useState('active')
  const [categoryId, setCategoryId] = React.useState('')
  const [isFeatured, setIsFeatured] = React.useState(false)

  // pricing
  const [price, setPrice] = React.useState<string>('')
  const [purchasePrice, setPurchasePrice] = React.useState<string>('')

  // stock
  const [stockQty, setStockQty] = React.useState<string>('')
  const [lowStock, setLowStock] = React.useState<string>('')

  // images
  const [images, setImages] = React.useState<ImageRow[]>([])
  const [uploading, setUploading] = React.useState(false)

  // seo
  const [slug, setSlug] = React.useState('')
  const [metaTitle, setMetaTitle] = React.useState('')
const [metaDesc, setMetaDesc] = React.useState('')
  const [slugError, setSlugError] = React.useState('')

  const slugify = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|--+/g, '-')

  const load = React.useCallback(async ()=>{
    setLoading(true)
    setError(null)
    try {
      const [p, c, s] = await Promise.all([
        supabase.from('products').select('id,name,sku,brand,status,category_id,price,purchase_price,stock_qty,low_stock_threshold,is_featured').order('name', { ascending: true }),
        supabase.from('categories').select('id,name').order('name', { ascending: true }),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
      ])
      if (p.error) throw p.error
      if (c.error) throw c.error
const list = (p.data || []) as ProductRow[]
      setRows(list)
      setCats((c.data || []) as CategoryOpt[])
      if (!s.error) setDefaultThreshold(((s.data as { default_low_stock_threshold?: number|null } | null)?.default_low_stock_threshold ?? null) as number | null)
      const ids = list.map(x=>x.id)
      if (ids.length>0) {
        const { data: imgs } = await supabase.from('product_images').select('product_id,path,sort_order').in('product_id', ids).order('sort_order', { ascending: true })
        const map: Record<string, string> = {}
        ;(imgs as {product_id:string;path:string;sort_order:number}[]|null|undefined)?.forEach(r=>{ if(map[r.product_id]==null) map[r.product_id]=r.path })
        setCovers(map)
      }
    } catch (e) {
      setError((e as Error).message || 'Yüklenemedi')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(()=>{ load() }, [load])

  const filtered = React.useMemo(()=>{
    const term = q.trim().toLowerCase()
    let base = rows
    if (term) {
      base = base.filter(r => [r.name, r.sku, r.brand || ''].some(v => (v||'').toLowerCase().includes(term)))
    }
    if (selectedCategoryFilter) {
      base = base.filter(r => (r.category_id || '') === selectedCategoryFilter)
    }
    const anyStatus = statusFilter.active || statusFilter.inactive || statusFilter.out_of_stock
    if (anyStatus) {
      base = base.filter(r => (statusFilter as Record<string, boolean>)[(r.status || '').toLowerCase()])
    }
    if (featuredOnly) {
      base = base.filter(r => !!r.is_featured)
    }
    return base
  }, [rows, q, selectedCategoryFilter, statusFilter, featuredOnly])

  const startCreate = () => {
    setSelectedId(null)
    setTab('info')
    setName('')
    setSku('')
    setBrand('')
    setStatus('active')
    setCategoryId('')
    setIsFeatured(false)
    setPrice('')
    setPurchasePrice('')
    setStockQty('')
    setLowStock('')
    setSlug('')
    setMetaTitle('')
    setMetaDesc('')
    setImages([])
  }

  type DBProduct = { id: string; name?: string|null; sku?: string|null; brand?: string|null; status?: string|null; category_id?: string|null; is_featured?: boolean|null; price?: number|null; purchase_price?: number|null; stock_qty?: number|null; low_stock_threshold?: number|null; slug?: string|null; meta_title?: string|null; meta_description?: string|null }
  const startEdit = async (id: string) => {
    setSelectedId(id)
    setTab('info')
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      const p = (data as DBProduct) || ({} as DBProduct)
      setName(p?.name || '')
      setSku(p?.sku || '')
      setBrand(p?.brand || '')
      setStatus(p?.status || 'active')
      setCategoryId(p?.category_id || '')
      setIsFeatured(!!p?.is_featured)
      setPrice(p?.price != null ? String(p.price) : '')
      setPurchasePrice(p?.purchase_price != null ? String(p.purchase_price) : '')
      setStockQty(p?.stock_qty != null ? String(p.stock_qty) : '')
      setLowStock(p?.low_stock_threshold != null ? String(p.low_stock_threshold) : '')
      setSlug(p?.slug || '')
      setMetaTitle(p?.meta_title || '')
      setMetaDesc(p?.meta_description || '')
      await loadImages(id)
    } catch (e) {
      alert('Ürün yüklenemedi: ' + ((e as Error).message || e))
    }
  }

  const loadImages = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, product_id, path, alt, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
    if (!error) setImages((data || []) as ImageRow[])
  }

  const saveInfo = async () => {
    try {
      const payload: { name: string; sku: string; brand?: string; status?: string; category_id: string | null; is_featured: boolean } = {
        name: name.trim(), sku: sku.trim(), brand: brand.trim(), status,
        category_id: categoryId || null, is_featured: isFeatured,
      }
      if (!payload.name || !payload.sku) return
if (selectedId) {
        const before = rows.find(r=>r.id===selectedId) || null
        const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
        if (error) throw error
        const { logAdminAction } = await import('../../lib/audit')
        await logAdminAction(supabase, { table_name: 'products', row_pk: selectedId, action: 'UPDATE', before, after: payload, comment: 'saveInfo' })
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').maybeSingle()
        if (error) throw error
        const inserted = (data as { id: string } | null)
        setSelectedId(inserted?.id || null)
        const { logAdminAction } = await import('../../lib/audit')
        await logAdminAction(supabase, { table_name: 'products', row_pk: inserted?.id || null, action: 'INSERT', before: null, after: payload, comment: 'saveInfo' })
      }
      await load()
    } catch (e) {
      alert('Kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const savePricing = async () => {
    if (!selectedId) return
    try {
      const payload = {
        price: price === '' ? null : Number(price),
        purchase_price: purchasePrice === '' ? null : Number(purchasePrice),
      }
const before = rows.find(r=>r.id===selectedId) || null
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'products', row_pk: selectedId, action: 'UPDATE', before, after: payload, comment: 'savePricing' })
      await load()
    } catch (e) {
      alert('Fiyat kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const saveStock = async () => {
    if (!selectedId) return
    try {
      const isDefault = lowStock === ''
      const payload = {
        stock_qty: stockQty === '' ? null : Number(stockQty),
        low_stock_threshold: isDefault ? null : Number(lowStock),
        low_stock_override: !isDefault,
      }
const before = rows.find(r=>r.id===selectedId) || null
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'products', row_pk: selectedId, action: 'UPDATE', before, after: payload, comment: 'saveStock' })
      await load()
    } catch (e) {
      alert('Stok kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const uploadImages = async (files: FileList | null) => {
    if (!selectedId || !files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${Date.now()}-${slugify(name || 'urun')}.${ext}`
        const path = `product/${selectedId}/${filename}`
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
        if (upErr) throw upErr
        // insert DB ref
const { error: dbErr } = await supabase.from('product_images').insert({ product_id: selectedId, path, alt: '', sort_order: images.length + 1 })
        if (dbErr) throw dbErr
        const { logAdminAction } = await import('../../lib/audit')
        await logAdminAction(supabase, { table_name: 'product_images', row_pk: selectedId, action: 'INSERT', before: null, after: { path }, comment: 'uploadImage' })
      }
      await loadImages(selectedId)
    } catch (e) {
      alert('Yükleme hatası: ' + ((e as Error).message || e))
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (img: ImageRow) => {
    if (!confirm('Görseli silmek istiyor musunuz?')) return
    try {
await supabase.from('product_images').delete().eq('id', img.id)
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'product_images', row_pk: img.id, action: 'DELETE', before: img, after: null, comment: 'deleteImage' })
      // storage’dan da sil (best-effort)
      await supabase.storage.from('product-images').remove([img.path])
      if (selectedId) await loadImages(selectedId)
    } catch (e) {
      alert('Görsel silinemedi: ' + ((e as Error).message || e))
    }
  }

  const makeCover = async (img: ImageRow) => {
    try {
      if (images.length === 0 || images[0].id === img.id) return
      const first = images[0]
      await Promise.all([
        supabase.from('product_images').update({ sort_order: first.sort_order }).eq('id', img.id),
        supabase.from('product_images').update({ sort_order: img.sort_order }).eq('id', first.id),
      ])
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, [
        { table_name: 'product_images', row_pk: img.id, action: 'UPDATE', before: img, after: { sort_order: first.sort_order }, comment: 'makeCover' },
        { table_name: 'product_images', row_pk: first.id, action: 'UPDATE', before: first, after: { sort_order: img.sort_order }, comment: 'makeCover' },
      ])
      if (selectedId) await loadImages(selectedId)
    } catch (e) {
      alert('Kapak ayarlanamadı: '+((e as Error).message||e))
    }
  }

  const bumpImage = async (img: ImageRow, dir: -1 | 1) => {
    const list = [...images]
    const idx = list.findIndex(x => x.id === img.id)
    const swapIdx = idx + dir
    if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return
    const a = list[idx]
    const b = list[swapIdx]
    try {
await Promise.all([
        supabase.from('product_images').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('product_images').update({ sort_order: a.sort_order }).eq('id', b.id)
      ])
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, [
        { table_name: 'product_images', row_pk: a.id, action: 'UPDATE', before: a, after: { sort_order: b.sort_order }, comment: 'bumpImage' },
        { table_name: 'product_images', row_pk: b.id, action: 'UPDATE', before: b, after: { sort_order: a.sort_order }, comment: 'bumpImage' },
      ])
      if (selectedId) await loadImages(selectedId)
    } catch (e) {
      alert('Sıralama değişmedi: ' + ((e as Error).message || e))
    }
  }

  const saveSeo = async () => {
    if (!selectedId) return
    if (slugError) { alert(slugError); return }
    try {
      const payload = {
        slug: (slug || slugify(name)).trim() || null,
        meta_title: metaTitle || null,
        meta_description: metaDesc || null,
      }
const before = rows.find(r=>r.id===selectedId) || null
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'products', row_pk: selectedId, action: 'UPDATE', before, after: payload, comment: 'saveSeo' })
      await load()
    } catch (e) {
      alert('SEO kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return
    try {
const before = rows.find(r=>r.id===id) || null
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'products', row_pk: id, action: 'DELETE', before, after: null, comment: 'remove product' })
      await load()
      if (selectedId === id) startCreate()
    } catch (e) {
      alert('Silinemedi: ' + ((e as Error).message || e))
    }
  }

  type SortKey = 'name'|'sku'|'category'|'status'|'price'|'stock'
  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [sortDir, setSortDir] = React.useState<'asc'|'desc'>('asc')
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortKey(key); setSortDir('asc') }
  }
  const sortIndicator = (key: SortKey) => sortKey!==key ? '' : (sortDir==='asc'?'▲':'▼')

  const sorted = React.useMemo(()=>{
    const arr = [...filtered]
    arr.sort((a,b)=>{
      const dir = sortDir==='asc'?1:-1
      switch (sortKey) {
        case 'name': return dir * a.name.localeCompare(b.name, 'tr')
        case 'sku': return dir * a.sku.localeCompare(b.sku, 'tr')
        case 'category': {
          const an = cats.find(c=>c.id===a.category_id)?.name || ''
          const bn = cats.find(c=>c.id===b.category_id)?.name || ''
          return dir * an.localeCompare(bn, 'tr')
        }
        case 'status': return dir * (String(a.status||'').localeCompare(String(b.status||''), 'tr'))
        case 'price': return dir * (((a.price??-Infinity) as number) - ((b.price??-Infinity) as number))
        case 'stock': return dir * (((a.stock_qty??-Infinity) as number) - ((b.stock_qty??-Infinity) as number))
        default: return 0
      }
    })
    return arr
  }, [filtered, sortKey, sortDir, cats])

  const saveCurrent = async () => {
    if (tab === 'info') return saveInfo()
    if (tab === 'pricing') return savePricing()
    if (tab === 'stock') return saveStock()
    if (tab === 'seo') return saveSeo()
    return
  }

const fmt = React.useMemo(()=> new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY', maximumFractionDigits:2 }), [])
  const statusBadge = (s?: string | null) => {
    const v = (s||'').toLowerCase()
    if (v==='active') return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Aktif</span>
    if (v==='inactive') return <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">Pasif</span>
    if (v==='out_of_stock') return <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">Stokta Yok</span>
    return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">-</span>
  }

  const [importPreview, setImportPreview] = React.useState<{ header: string[]; rows: Record<string,string>[]; total: number } | null>(null)
  const [importRows, setImportRows] = React.useState<Record<string,string>[] | null>(null)

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.products') ?? 'Ürünler'}</h1>

      <AdminToolbar
        storageKey="toolbar:products"
        sticky
        search={{ value: q, onChange: setQ, placeholder: 'ürün adı/SKU/marka ara', focusShortcut: '/' }}
        select={{
          value: selectedCategoryFilter,
          onChange: setSelectedCategoryFilter,
          title: 'Kategori',
          options: [ { value: '', label: 'Tüm Kategoriler' }, ...cats.map(c => ({ value: c.id, label: c.name })) ],
        }}
        chips={[
          { key: 'active', label: 'Aktif', active: statusFilter.active, onToggle: ()=>setStatusFilter(s=>({ ...s, active: !s.active })) },
          { key: 'inactive', label: 'Pasif', active: statusFilter.inactive, onToggle: ()=>setStatusFilter(s=>({ ...s, inactive: !s.inactive })) },
          { key: 'out_of_stock', label: 'Stokta Yok', active: statusFilter.out_of_stock, onToggle: ()=>setStatusFilter(s=>({ ...s, out_of_stock: !s.out_of_stock })) },
        ]}
        toggles={[{ key: 'featured', label: 'Sadece: Öne Çıkan', checked: featuredOnly, onChange: setFeaturedOnly }]}
        onClear={()=>{ setQ(''); setSelectedCategoryFilter(''); setStatusFilter({ active:false, inactive:false, out_of_stock:false }); setFeaturedOnly(false) }}
        recordCount={filtered.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <input id="prod-import-input" type="file" accept=".csv,text/csv" className="hidden" onChange={async (e)=>{
              const f = e.target.files?.[0]
              if (!f) return
              const text = await f.text()
              const lines = text.replace(/^\ufeff/, '').split(/\r?\n/).filter(l=>l.trim().length>0)
              const split = (s: string) => s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v=>v.replace(/^"|"$/g,'').replace(/""/g,'"'))
              const header = split(lines[0]).map(h=>h.trim().toLowerCase())
              const rows = lines.slice(1).map(l=>{ const cells = split(l); const obj: Record<string,string> = {}; header.forEach((h,i)=>obj[h]=cells[i]||''); return obj })
              setImportRows(rows)
              setImportPreview({ header, rows: rows.slice(0, 10), total: rows.length })
            }} />
            <button onClick={()=>document.getElementById('prod-import-input')?.click()} className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">İçe Aktar (beta)</button>
            <ColumnsMenu
              columns={[
{ key: 'image', label: 'Görsel', checked: visibleCols.image, onChange: (v)=>setVisibleCols(s=>({ ...s, image: v })) },
                { key: 'name', label: 'Ad', checked: visibleCols.name, onChange: (v)=>setVisibleCols(s=>({ ...s, name: v })) },
                { key: 'sku', label: 'SKU', checked: visibleCols.sku, onChange: (v)=>setVisibleCols(s=>({ ...s, sku: v })) },
                { key: 'category', label: 'Kategori', checked: visibleCols.category, onChange: (v)=>setVisibleCols(s=>({ ...s, category: v })) },
                { key: 'status', label: 'Durum', checked: visibleCols.status, onChange: (v)=>setVisibleCols(s=>({ ...s, status: v })) },
                { key: 'price', label: 'Fiyat', checked: visibleCols.price, onChange: (v)=>setVisibleCols(s=>({ ...s, price: v })) },
                { key: 'stock', label: 'Stok', checked: visibleCols.stock, onChange: (v)=>setVisibleCols(s=>({ ...s, stock: v })) },
                { key: 'actions', label: 'İşlem', checked: visibleCols.actions, onChange: (v)=>setVisibleCols(s=>({ ...s, actions: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
<ExportMenu
              items={[
                { key: 'csv', label: 'CSV (UTF-8 BOM)', onSelect: ()=>{
                  const cols = ['id','name','sku','category_id','status','price','stock_qty']
                  const header = cols.join(',')
                  const lines = sorted.map(r=>[
r.id, `"${(r.name||'').replace(/"/g,'""')}"`, r.sku, r.category_id||'', r.status||'', r.price!=null?String(r.price):'', r.stock_qty!=null?String(r.stock_qty):''
                  ].join(','))
                  const csv = '\ufeff' + [header, ...lines].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'products.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              ]}
            />
          </div>
        )}
      />

      {importPreview && (
        <div className={`${adminCardClass} p-4`}>
          <div className="mb-2 text-sm text-industrial-gray">CSV Önizleme (ilk 10 satır) — Toplam: {importPreview.total}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {importPreview.header.map(h=> (<th key={h} className="p-2 border-b text-left">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {importPreview.rows.map((r,idx)=> (
                  <tr key={idx} className="border-b">
                    {importPreview.header.map(h=> (<td key={h} className="p-2">{r[h]}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="px-3 h-10 rounded-md border border-light-gray bg-white hover:border-primary-navy text-xs" onClick={()=>{ setImportPreview(null); setImportRows(null); }}>Kapat</button>
            <button className="px-3 h-10 rounded-md border border-light-gray bg-white text-xs" onClick={()=>{
              const h = (importPreview?.header||[])
              const required = ['name','sku']
              const hasRequired = required.every(k=>h.includes(k))
              const okCount = (importPreview?.rows||[]).filter(r=>r['name']&&r['sku']).length
              alert(`Dry-run: zorunlu alanlar ${hasRequired?'tam':'eksik'}. Uygun satır sayısı: ${okCount}/${importPreview?.total||0}`)
            }}>Dry-run</button>
            <button className="px-3 h-10 rounded-md bg-primary-navy text-white text-xs" onClick={async ()=>{
              if (!importRows || !importPreview) return alert('Önce CSV seçin')
              const h = importPreview.header
              if (!h.includes('sku') || !h.includes('name')) { alert('En az sku ve name kolonları gerekli'); return }
              const mapCategorySlugToId = (slug: string)=>{
                const s = (slug||'').toLowerCase().trim()
                const found = cats.find(c=>c.name.toLowerCase()===s)
                return found?.id || null
              }
              const payloads: { sku: string; name: string; brand?: string; status?: string; price?: number; stock_qty?: number; low_stock_threshold?: number | null; category_id?: string | null }[] = []
              for (const r of importRows) {
                if (!r['sku'] || !r['name']) continue
                const p: { sku: string; name: string; brand?: string; status?: string; price?: number; stock_qty?: number; low_stock_threshold?: number | null; category_id?: string | null } = {
                  sku: r['sku'].trim(),
                  name: r['name'].trim(),
                }
                if (r['brand']) p.brand = r['brand'].trim()
                if (r['status']) p.status = r['status'].trim()
                if (r['price']) p.price = Number(r['price'])
                if (r['stock_qty']) p.stock_qty = Number(r['stock_qty'])
                if (r['low_stock_threshold']) p.low_stock_threshold = Number(r['low_stock_threshold'])
                if (r['category_id']) p.category_id = r['category_id'] || null
                else if (r['category_slug']||r['category']) p.category_id = mapCategorySlugToId(r['category_slug']||r['category'])
                payloads.push(p)
              }
              if (payloads.length===0) { alert('Uygun satır bulunamadı'); return }
              try {
                // chunked upsert by sku
                let ok=0, fail=0
                for (let i=0;i<payloads.length;i+=100) {
                  const chunk = payloads.slice(i,i+100)
                  const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'sku' })
                  if (error) { console.warn('import upsert error', error); fail+=chunk.length } else ok+=chunk.length
                }
                alert(`İçe aktarım tamam: ${ok} satır işlendi, ${fail} satır hata`)
                await load()
              } catch (e) {
                alert('İçe aktarım hatası: '+((e as Error).message||e))
              }
            }}>Yaz (upsert by SKU)</button>
          </div>
        </div>
      )}

      {/* Düzenleme Paneli */}
      <div className={`${adminCardClass} p-4`}>
        <div className="rounded-md bg-gray-50 border border-light-gray p-2 md:p-3 mb-3 flex items-center gap-3">
          <span className="text-sm text-steel-gray">{selectedId ? 'Düzenleniyor' : 'Yeni Ürün'}</span>
          <Tabs.Root value={tab} onValueChange={(v)=>setTab(v as typeof tab)}>
            <Tabs.List className="inline-flex items-center gap-1">
              <Tabs.Trigger value="info" className="px-3 py-2 text-sm rounded data-[state=active]:bg-white data-[state=active]:border-primary-navy border border-transparent text-steel-gray">Bilgi</Tabs.Trigger>
              <Tabs.Trigger value="pricing" className="px-3 py-2 text-sm rounded data-[state=active]:bg-white data-[state=active]:border-primary-navy border border-transparent text-steel-gray">Fiyat</Tabs.Trigger>
              <Tabs.Trigger value="stock" className="px-3 py-2 text-sm rounded data-[state=active]:bg-white data-[state=active]:border-primary-navy border border-transparent text-steel-gray">Stok</Tabs.Trigger>
              <Tabs.Trigger value="images" className="px-3 py-2 text-sm rounded data-[state=active]:bg-white data-[state=active]:border-primary-navy border border-transparent text-steel-gray">Görseller</Tabs.Trigger>
              <Tabs.Trigger value="seo" className="px-3 py-2 text-sm rounded data-[state=active]:bg-white data-[state=active]:border-primary-navy border border-transparent text-steel-gray">SEO</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={startCreate} className="px-3 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm">Yeni</button>
            <button onClick={saveCurrent} disabled={tab==='images'} className={`${adminButtonPrimaryClass} h-11 disabled:opacity-50 disabled:cursor-not-allowed`}>Kaydet</button>
            {selectedId && (
              <button onClick={()=>remove(selectedId)} className="px-3 h-11 rounded-md border border-light-gray bg-white text-red-600 hover:border-red-400 text-sm">Sil</button>
            )}
          </div>
        </div>

        {tab === 'info' && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-steel-gray">Ad</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" />
              <label className="text-sm text-steel-gray">SKU</label>
              <input value={sku} onChange={(e)=>setSku(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" />
              <label className="text-sm text-steel-gray">Marka</label>
              <input value={brand} onChange={(e)=>setBrand(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-steel-gray">Durum</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white">
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="out_of_stock">Stokta Yok</option>
              </select>
              <label className="text-sm text-steel-gray">Kategori</label>
              <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white">
                <option value="">(Seçilmemiş)</option>
                {cats.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} /> Öne Çıkan</label>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-steel-gray">Satış Fiyatı</label>
              <input value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="örn. 1999.90" />
              <label className="text-sm text-steel-gray">Alış Maliyeti</label>
              <input value={purchasePrice} onChange={(e)=>setPurchasePrice(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="örn. 1499.50" />
            </div>
          </div>
        )}

        {tab === 'stock' && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-steel-gray">Stok</label>
              <input value={stockQty} onChange={(e)=>setStockQty(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="örn. 50" />
              <label className="text-sm text-steel-gray">Düşük Stok Eşiği</label>
              <input value={lowStock} onChange={(e)=>setLowStock(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="örn. 5" />
              <div className="text-xs text-industrial-gray">Boş bırakılırsa Ayarlar’daki varsayılan eşik kullanılır{defaultThreshold!=null?` (Varsayılan: ${defaultThreshold})`:''}.</div>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-3">
            {!selectedId && <div className="text-sm text-steel-gray">Önce ürünü kaydedin.</div>}
            {selectedId && (
              <>
                <input type="file" multiple onChange={(e)=>uploadImages(e.target.files)} disabled={uploading} />
                {images.length === 0 && (
                  <div className="text-sm text-industrial-gray">Henüz görsel yok. Dosya seçerek yükleyin.</div>
                )}
                <div className="grid md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id} className="border rounded p-2 flex flex-col gap-2">
                      <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${img.path}`} alt={img.alt||''} className="w-full h-32 object-cover" />
                      <input value={img.alt||''} onChange={async (e)=>{ await supabase.from('product_images').update({ alt: e.target.value }).eq('id', img.id); }} className="px-2 py-1 border border-light-gray rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="Alternatif metin" />
                      <div className="flex flex-wrap gap-2">
                        <button className="px-2 py-1 border rounded text-xs" onClick={()=>bumpImage(img, -1)} disabled={idx===0}>Yukarı</button>
                        <button className="px-2 py-1 border rounded text-xs" onClick={()=>bumpImage(img, +1)} disabled={idx===images.length-1}>Aşağı</button>
                        <button className="px-2 py-1 border rounded text-xs" onClick={()=>makeCover(img)} disabled={idx===0}>Kapak Yap</button>
                        <button className="px-2 py-1 border rounded text-xs text-red-600" onClick={()=>deleteImage(img)}>Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'seo' && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-steel-gray">Slug</label>
<input value={slug} onChange={(e)=>{ setSlug(e.target.value); setSlugError('') }} onBlur={async ()=>{ const clean=slugify(slug||name); setSlug(clean); if(!clean){ setSlugError('Slug boş olamaz'); return } const { data }=await supabase.from('products').select('id').eq('slug', clean); const exists=((data||[]) as {id:string}[]).some(row=>row.id!==(selectedId||'')); setSlugError(exists?'Bu slug zaten kullanılıyor':'') }} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="ornek-urun" />
              {slugError && <div className="text-xs text-red-600">{slugError}</div>}
              <label className="text-sm text-steel-gray">Meta Başlık</label>
              <input value={metaTitle} onChange={(e)=>setMetaTitle(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" />
              <div className="text-xs text-industrial-gray">{metaTitle.length} karakter</div>
              <label className="text-sm text-steel-gray">Meta Açıklama</label>
              <textarea value={metaDesc} onChange={(e)=>setMetaDesc(e.target.value)} className="w-full border border-light-gray rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" rows={3} />
              <div className="text-xs text-industrial-gray">{metaDesc.length} karakter</div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={`${adminCardClass} overflow-hidden`}>
        {error && <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.image && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>Görsel</th>
              )}
              {visibleCols.name && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('name')}>Ad {sortIndicator('name')}</button>
                </th>
              )}
              {visibleCols.sku && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('sku')}>SKU {sortIndicator('sku')}</button>
                </th>
              )}
              {visibleCols.category && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('category')}>Kategori {sortIndicator('category')}</button>
                </th>
              )}
              {visibleCols.status && (
                <th className={`${adminTableHeadCellClass} ${headPad}`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>Durum {sortIndicator('status')}</button>
                </th>
              )}
              {visibleCols.price && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('price')}>Fiyat {sortIndicator('price')}</button>
                </th>
              )}
              {visibleCols.stock && (
                <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>
                  <button type="button" className="hover:underline" onClick={()=>toggleSort('stock')}>Stok {sortIndicator('stock')}</button>
                </th>
              )}
              {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>Yükleniyor…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>Kayıt yok</td></tr>
            ) : (
              sorted.map(r => (
<tr key={r.id} className="border-b border-light-gray/60">
                  {visibleCols.image && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      {covers[r.id] ? (
                        <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${covers[r.id]}`} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded" />
                      )}
                    </td>
                  )}
                  {visibleCols.name && <td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>}
                  {visibleCols.sku && <td className={`${adminTableCellClass} ${cellPad}`}>{r.sku}</td>}
                  {visibleCols.category && <td className={`${adminTableCellClass} ${cellPad}`}>{cats.find(c=>c.id===r.category_id)?.name || '-'}</td>}
{visibleCols.status && <td className={`${adminTableCellClass} ${cellPad}`}>{statusBadge(r.status)}</td>}
                  {visibleCols.price && <td className={`${adminTableCellClass} ${cellPad} text-right`}>{r.price!=null?fmt.format(Number(r.price)):'-'}</td>}
                  {visibleCols.stock && <td className={`${adminTableCellClass} ${cellPad} text-right`}>{(r.stock_qty!=null?Number(r.stock_qty):null) ?? '-'}</td>}
                  {visibleCols.actions && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button className="px-2 py-1 rounded border text-xs" onClick={()=>startEdit(r.id)}>Düzenle</button>
                        <button className="px-2 py-1 rounded border text-xs text-red-600" onClick={()=>remove(r.id)}>Sil</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminProductsPage

