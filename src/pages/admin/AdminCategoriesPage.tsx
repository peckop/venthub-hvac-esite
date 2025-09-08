import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'

interface CategoryRow { id: string; name: string; slug: string; parent_id: string | null }

const AdminCategoriesPage: React.FC = () => {
  const { t } = useI18n()
  const [rows, setRows] = React.useState<CategoryRow[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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
        search={{ value: q, onChange: setQ, placeholder: 'kategori adı/slug ara', focusShortcut: '/' }}
        rightExtra={(
          <div className="flex items-center gap-2">
            <button onClick={startCreate} className="px-3 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm">Yeni</button>
            <button onClick={save} className="px-3 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm">Kaydet</button>
          </div>
        )}
      />

      <div className={`${adminCardClass} p-4 grid md:grid-cols-2 gap-4`}>
        <div className="space-y-2">
          <label className="text-sm text-steel-gray">Ad</label>
          <input value={name} onChange={(e)=>{ setName(e.target.value) }} className="w-full px-3 py-2 border rounded" placeholder="Kategori adı" />
          <label className="text-sm text-steel-gray">Slug</label>
          <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="ornek-kategori" />
          <label className="text-sm text-steel-gray">Üst Kategori</label>
          <select value={parentId} onChange={(e)=>setParentId(e.target.value)} className="w-full px-3 py-2 border rounded">
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

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={`${adminTableHeadCellClass}`}>Ad</th>
              <th className={`${adminTableHeadCellClass}`}>Slug</th>
              <th className={`${adminTableHeadCellClass}`}>Üst</th>
              <th className={`${adminTableHeadCellClass}`}>İşlem</th>
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
                  <td className={`${adminTableCellClass}`}>{r.name}</td>
                  <td className={`${adminTableCellClass}`}>{r.slug}</td>
                  <td className={`${adminTableCellClass}`}>{rows.find(x=>x.id===r.parent_id)?.name || '-'}</td>
                  <td className={`${adminTableCellClass} space-x-2`}>
                    <button className="px-2 py-1 rounded border text-xs" onClick={()=>startEdit(r)}>Düzenle</button>
                    <button className="px-2 py-1 rounded border text-xs text-red-600" onClick={()=>remove(r.id)}>Sil</button>
                  </td>
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

