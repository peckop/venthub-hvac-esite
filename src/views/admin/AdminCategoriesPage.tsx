import React, { lazy, Suspense } from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonPrimaryClass, adminTableActionClass, adminTableActionDangerClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'
import { CategoryFormModal } from '../../components/admin/categories/CategoryFormModal'
import { Plus } from 'lucide-react'

// Lazy load menus
const ColumnsMenu = lazy(() => import('../../components/admin/ColumnsMenu'))
const ExportMenu = lazy(() => import('../../components/admin/ExportMenu'))

import type { Density } from '../../components/admin/ColumnsMenu'

interface CategoryRow {
  id: string
  name: string
  slug: string
  parent_id: string | null
  description?: string | null
  image_url?: string | null
  is_featured?: boolean
  sort_order?: number
}

const AdminCategoriesPage: React.FC = () => {
  const { t } = useI18n()
  const [rows, setRows] = React.useState<CategoryRow[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Columns & density
  const STORAGE_KEY = 'toolbar:categories'
  const [visibleCols, setVisibleCols] = React.useState<{ image: boolean; name: boolean; slug: boolean; parent: boolean; description: boolean; actions: boolean }>({
    image: true, name: true, slug: true, parent: true, description: false, actions: true
  })
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

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true }) // Sort by order first
        .order('name', { ascending: true })

      if (error) throw error
      setRows((data || []) as CategoryRow[])
    } catch (e) {
      setError((e as Error).message || 'Kategoriler yüklenemedi')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(r => r.name.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term))
  }, [rows, q])

  const handleCreate = () => {
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (r: CategoryRow) => {
    setEditingId(r.id)
    setIsModalOpen(true)
  }

  const remove = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istiyor musunuz? Alt kategorileri varsa silinemeyebilir.')) return
    try {
      const before = rows.find(r => r.id === id) || null
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'categories', row_pk: id, action: 'DELETE', before, after: null, comment: 'delete category' })
      await load()
    } catch (e) {
      alert('Silinemedi: ' + ((e as Error).message || e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.categories') ?? 'Kategoriler'}</h1>
        <button onClick={handleCreate} className={`${adminButtonPrimaryClass} flex items-center gap-2`}>
          <Plus size={18} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      <AdminToolbar
        storageKey="toolbar:categories"
        sticky
        search={{ value: q, onChange: setQ, placeholder: 'kategori adı/slug ara', focusShortcut: '/' }}
        onClear={() => setQ('')}
        recordCount={filtered.length}
        rightExtra={(
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <ColumnsMenu
                columns={[
                  { key: 'image', label: 'Görsel', checked: visibleCols.image, onChange: (v) => setVisibleCols(s => ({ ...s, image: v })) },
                  { key: 'name', label: 'Ad', checked: visibleCols.name, onChange: (v) => setVisibleCols(s => ({ ...s, name: v })) },
                  { key: 'slug', label: 'Slug', checked: visibleCols.slug, onChange: (v) => setVisibleCols(s => ({ ...s, slug: v })) },
                  { key: 'parent', label: 'Üst', checked: visibleCols.parent, onChange: (v) => setVisibleCols(s => ({ ...s, parent: v })) },
                  { key: 'description', label: 'Açıklama', checked: visibleCols.description, onChange: (v) => setVisibleCols(s => ({ ...s, description: v })) },
                  { key: 'actions', label: 'İşlem', checked: visibleCols.actions, onChange: (v) => setVisibleCols(s => ({ ...s, actions: v })) },
                ]}
                density={density}
                onDensityChange={setDensity}
              />
              <ExportMenu
                items={[
                  {
                    key: 'csv', label: 'CSV (UTF-8 BOM)', onSelect: () => {
                      const cols = ['id', 'name', 'slug', 'parent_id', 'description']
                      const header = cols.join(',')
                      const lines = filtered.map(r => [r.id, `"${r.name.replace(/"/g, '""')}"`, r.slug, r.parent_id || '', `"${(r.description || '').replace(/"/g, '""')}"`].join(','))
                      const csv = '\ufeff' + [header, ...lines].join('\n')
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'categories.csv'
                      a.click()
                      URL.revokeObjectURL(url)
                    }
                  }
                ]}
              />
            </Suspense>
          </div>
        )}
      />

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {visibleCols.image && <th className={`${adminTableHeadCellClass} ${headPad}`}>Görsel</th>}
              {visibleCols.name && <th className={`${adminTableHeadCellClass} ${headPad}`}>Ad</th>}
              {visibleCols.slug && <th className={`${adminTableHeadCellClass} ${headPad}`}>Slug</th>}
              {visibleCols.parent && <th className={`${adminTableHeadCellClass} ${headPad}`}>Üst</th>}
              {visibleCols.description && <th className={`${adminTableHeadCellClass} ${headPad}`}>Açıklama</th>}
              {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td className="p-4" colSpan={6}>Yükleniyor…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-4" colSpan={6}>Kayıt yok</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-200/60 hover:bg-gray-50/50 transition-colors">
                  {visibleCols.image && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      {r.image_url ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${r.image_url}`}
                          alt=""
                          className="w-10 h-10 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-300">
                          -
                        </div>
                      )}
                    </td>
                  )}
                  {visibleCols.name && (
                    <td className={`${adminTableCellClass} ${cellPad} font-medium text-gray-900`}>
                      <div className="flex items-center">
                        {r.parent_id && <span className="text-slate-300 mr-2">└─</span>}
                        <span className={r.parent_id ? 'pl-1 text-slate-600 font-normal' : ''}>{r.name}</span>
                        {r.is_featured && <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full">Vitrin</span>}
                      </div>
                    </td>
                  )}
                  {visibleCols.slug && <td className={`${adminTableCellClass} ${cellPad} text-gray-500`}>{r.slug}</td>}
                  {visibleCols.parent && <td className={`${adminTableCellClass} ${cellPad}`}>{rows.find(x => x.id === r.parent_id)?.name || <span className="text-gray-400">-</span>}</td>}
                  {visibleCols.description && <td className={`${adminTableCellClass} ${cellPad} text-gray-500 truncate max-w-[200px]`}>{r.description}</td>}
                  {visibleCols.actions && (
                    <td className={`${adminTableCellClass} ${cellPad}`}>
                      <div className="flex items-center gap-2">
                        <button className={adminTableActionClass} onClick={() => handleEdit(r)}>{t('admin.ui.edit') || 'Düzenle'}</button>
                        <button className={adminTableActionDangerClass} onClick={() => remove(r.id)}>{t('admin.ui.delete') || 'Sil'}</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categoryId={editingId}
        onSuccess={load}
        categories={rows}
      />
    </div>
  )
}

export default AdminCategoriesPage



