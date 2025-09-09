import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'

interface CategoryRow { id: string; name: string; slug: string; parent_id: string | null }

const AdminCategoriesPage: React.FC = () => {
  const { t } = useI18n()
  const [rows, setRows] = React.useState<CategoryRow[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Columns & density (stok özet standardı)
  const STORAGE_KEY = 'toolbar:categories'
  const [visibleCols, setVisibleCols] = React.useState<{ name: boolean; slug: boolean; parent: boolean; actions: boolean }>({ name: true, slug: true, parent: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''

  // form state
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [parentId, setParentId] = React.useState<string>('')

  const slugify = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|--+/g, '-')

  const load = React.useCallback(async ()=>{
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name,slug,parent_id')
        .order('name', { ascending: true })
      if (error) throw error
      setRows((data || []) as CategoryRow[])
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
    if (!term) return rows
    return rows.filter(r => r.name.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term))
  }, [rows, q])

  const startCreate = () => {
    setEditingId(null)
    setName('')
    setSlug('')
    setParentId('')
  }
  const startEdit = (r: CategoryRow) => {
    setEditingId(r.id)
    setName(r.name)
    setSlug(r.slug || '')
    setParentId(r.parent_id || '')
  }

  const save = async () => {
    try {
      const payload: Partial<CategoryRow> = {
        name: name.trim(),
        slug: (slug || slugify(name)).trim(),
        parent_id: parentId || null,
      }
      if (!payload.name || !payload.slug) return
      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
      }
      await load()
      startCreate()
    } catch (e) {
      alert('Kaydedilemedi: ' + ((e as Error).message || e))
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istiyor musunuz?')) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      await load()
      if (editingId === id) startCreate()
    } catch (e) {
      alert('Silinemedi: ' + ((e as Error).message || e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.categories') ?? 'Kategoriler'}</h1>

      <AdminToolbar
        storageKey="toolbar:categories"
        sticky
        search={{ value: q, onChange: setQ, placeholder: 'kategori adı/slug ara', focusShortcut: '/' }}
        onClear={()=>setQ('')}
        recordCount={filtered.length}
        rightExtra={(
          <ColumnsMenu
            columns={[
              { key: 'name', label: 'Ad', checked: visibleCols.name, onChange: (v)=>setVisibleCols(s=>({ ...s, name: v })) },
              { key: 'slug', label: 'Slug', checked: visibleCols.slug, onChange: (v)=>setVisibleCols(s=>({ ...s, slug: v })) },
              { key: 'parent', label: 'Üst', checked: visibleCols.parent, onChange: (v)=>setVisibleCols(s=>({ ...s, parent: v })) },
              { key: 'actions', label: 'İşlem', checked: visibleCols.actions, onChange: (v)=>setVisibleCols(s=>({ ...s, actions: v })) },
            ]}
            density={density}
            onDensityChange={setDensity}
          />
        )}
      />

      <div className={`${adminCardClass} p-4`}>
        <div className="rounded-md bg-gray-50 border border-light-gray p-2 md:p-3 mb-3 flex items-center gap-2">
          <span className="text-sm text-steel-gray">{editingId ? 'Düzenleniyor' : 'Yeni Kategori'}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={startCreate} className="px-3 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm">Yeni</button>
            <button onClick={save} className={`${adminButtonPrimaryClass} h-11`}>Kaydet</button>
            {editingId && (
              <button onClick={()=>remove(editingId)} className="px-3 h-11 rounded-md border border-light-gray bg-white text-red-600 hover:border-red-400 text-sm">Sil</button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-steel-gray">Ad</label>
            <input value={name} onChange={(e)=>{ setName(e.target.value) }} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="Kategori adı" />
            <label className="text-sm text-steel-gray">Slug</label>
            <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white" placeholder="ornek-kategori" />
            <label className="text-sm text-steel-gray">Üst Kategori</label>
            <select value={parentId} onChange={(e)=>setParentId(e.target.value)} className="w-full border border-light-gray rounded-md px-3 md:h-12 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/30 ring-offset-1 bg-white">
              <option value="">(Yok)</option>
              {rows.map(c=> (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-industrial-gray">
            {editingId ? 'Düzenleniyor' : 'Yeni kategori'}
          </div>
        </div>
      </div>

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.name && <th className={`${adminTableHeadCellClass} ${headPad}`}>Ad</th>}
              {visibleCols.slug && <th className={`${adminTableHeadCellClass} ${headPad}`}>Slug</th>}
              {visibleCols.parent && <th className={`${adminTableHeadCellClass} ${headPad}`}>Üst</th>}
              {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="p-4" colSpan={4}>Yükleniyor…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={4}>Kayıt yok</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-b border-light-gray/60">
                  {visibleCols.name && <td className={`${adminTableCellClass} ${cellPad}`}>{r.name}</td>}
                  {visibleCols.slug && <td className={`${adminTableCellClass} ${cellPad}`}>{r.slug}</td>}
                  {visibleCols.parent && <td className={`${adminTableCellClass} ${cellPad}`}>{rows.find(x=>x.id===r.parent_id)?.name || '-'}</td>}
                  {visibleCols.actions && (
                    <td className={`${adminTableCellClass} ${cellPad} space-x-2`}>
                      <button className="px-2 py-1 rounded border text-xs" onClick={()=>startEdit(r)}>Düzenle</button>
                      <button className="px-2 py-1 rounded border text-xs text-red-600" onClick={()=>remove(r.id)}>Sil</button>
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

export default AdminCategoriesPage

