import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
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
  const [visibleCols, setVisibleCols] = React.useState<{ name: boolean; sku: boolean; category: boolean; status: boolean; price: boolean; stock: boolean; actions: boolean }>({ name: true, sku: true, category: true, status: true, price: true, stock: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
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

  const slugify = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|--+/g, '-')

  const load = React.useCallback(async ()=>{
    setLoading(true)
    setError(null)
    try {
      const [p, c] = await Promise.all([
        supabase.from('products').select('id,name,sku,brand,status,category_id,price,purchase_price,stock_qty,low_stock_threshold').order('name', { ascending: true }),
        supabase.from('categories').select('id,name').order('name', { ascending: true })
      ])
      if (p.error) throw p.error
      if (c.error) throw c.error
      setRows((p.data || []) as ProductRow[])
      setCats((c.data || []) as CategoryOpt[])
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
      // Not: rows içinde is_featured alanı yok, bu nedenle bu filtre yalnızca detay çektiğimizde etkili olur.
      // Şimdilik listede yoksa etkisiz kalır; daha sonra products sorgusuna is_featured eklenebilir.
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
        const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').maybeSingle()
        if (error) throw error
        const inserted = (data as { id: string } | null)
        setSelectedId(inserted?.id || null)
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
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
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
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
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
      // storage’dan da sil (best-effort)
      await supabase.storage.from('product-images').remove([img.path])
      if (selectedId) await loadImages(selectedId)
    } catch (e) {
      alert('Görsel silinemedi: ' + ((e as Error).message || e))
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
      if (selectedId) await loadImages(selectedId)
    } catch (e) {
      alert('Sıralama değişmedi: ' + ((e as Error).message || e))
    }
  }

  const saveSeo = async () => {
    if (!selectedId) return
    try {
      const payload = {
        slug: (slug || slugify(name)).trim() || null,
        meta_title: metaTitle || null,
        meta_description: metaDesc || null,
      }
      const { error } = await supabase.from('products').update(payload).eq('id', selectedId)
      if (error) throw error
      await load()
    } catch (e) {
      alert('SEO kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      await load()
      if (selectedId === id) startCreate()
    } catch (e) {
      alert('Silinemedi: ' + ((e as Error).message || e))
    }
  }

  const saveCurrent = async () => {
    if (tab === 'info') return saveInfo()
    if (tab === 'pricing') return savePricing()
    if (tab === 'stock') return saveStock()
    if (tab === 'seo') return saveSeo()
    return
  }

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
            <ColumnsMenu
              columns={[
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
          </div>
        )}
      />

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
              <div className="text-xs text-industrial-gray">Boş bırakılırsa Ayarlar’daki varsayılan eşik kullanılır.</div>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-3">
            {!selectedId && <div className="text-sm text-steel-gray">Önce ürünü kaydedin.</div>}
            {selectedId && (
              <>
                <input type="file" multiple onChange={(e)=>uploadImages(e.target.files)} disabled={uploading} />
                <div className="grid md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id} className="border rounded p-2 flex flex-col gap-2">
                      <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${img.path}`} alt={img.alt||''} className="w-full h-32 object-cover" />
                      <input value={img.alt||''} onChange={async (e)=>{ await supabase.from('product_images').update({ alt: e.target.value }).eq('id', img.id); }} className="px-2 py-1 border border-light-gray rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="Alternatif metin" />
                      <div className="flex gap-2">
                        <button className="px-2 py-1 border rounded text-xs" onClick={()=>bumpImage(img, -1)} disabled={idx===0}>Yukarı</button>
                        <button className="px-2 py-1 border rounded text-xs" onClick={()=>bumpImage(img, +1)} disabled={idx===images.length-1}>Aşağı</button>
                        <button className="px-2 py-1 border rounded text-xs text-red-600 ml-auto" onClick={()=>deleteImage(img)}>Sil</button>
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
              <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="ornek-urun" />
              <label className="text-sm text-steel-gray">Meta Başlık</label>
              <input value={metaTitle} onChange={(e)=>setMetaTitle(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" />
              <label className="text-sm text-steel-gray">Meta Açıklama</label>
              <textarea value={metaDesc} onChange={(e)=>setMetaDesc(e.target.value)} className="w-full border border-light-gray rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" rows={3} />
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
              {visibleCols.name && <th className={`${adminTableHeadCellClass} ${headPad}`}>Ad</th>}
              {visibleCols.sku && <th className={`${adminTableHeadCellClass} ${headPad}`}>SKU</th>}
              {visibleCols.category && <th className={`${adminTableHeadCellClass} ${headPad}`}>Kategori</th>}
              {visibleCols.status && <th className={`${adminTableHeadCellClass} ${headPad}`}>Durum</th>}
              {visibleCols.price && <th className={`${adminTableHeadCellClass} ${headPad}`}>Fiyat</th>}
              {visibleCols.stock && <th className={`${adminTableHeadCellClass} ${headPad}`}>Stok</th>}
              {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>Yükleniyor…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>Kayıt yok</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-b border-light-gray/60">
                  {visibleCols.name && <td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>}
                  {visibleCols.sku && <td className={`${adminTableCellClass} ${cellPad}`}>{r.sku}</td>}
                  {visibleCols.category && <td className={`${adminTableCellClass} ${cellPad}`}>{cats.find(c=>c.id===r.category_id)?.name || '-'}</td>}
                  {visibleCols.status && <td className={`${adminTableCellClass} ${cellPad}`}>{r.status || '-'}</td>}
                  {visibleCols.price && <td className={`${adminTableCellClass} ${cellPad}`}>{(r.price!=null?Number(r.price):null) ?? '-'}</td>}
                  {visibleCols.stock && <td className={`${adminTableCellClass} ${cellPad}`}>{(r.stock_qty!=null?Number(r.stock_qty):null) ?? '-'}</td>}
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

