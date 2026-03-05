import React, { lazy, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import AdminToolbar from '../../components/admin/AdminToolbar'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonPrimaryClass, adminTableActionClass, adminTableActionDangerClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'
import { CategoryFormModal } from '../../components/admin/categories/CategoryFormModal'
import { Menu, X, Save, Edit3, Image as ImageIcon, Trash2, Tags, Plus } from 'lucide-react'
import EditableCell from '../../components/admin/EditableCell'
import InfoTooltip from '../../components/admin/InfoTooltip'
import toast from 'react-hot-toast'
import { useRole } from '../../hooks/useRole'

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

  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('categories')

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Columns & density
  const STORAGE_KEY = 'toolbar:categories'
  const [visibleCols, setVisibleCols] = React.useState<{ image: boolean; name: boolean; sortOrder: boolean; slug: boolean; parent: boolean; description: boolean; actions: boolean }>({
    image: true, name: true, sortOrder: true, slug: true, parent: true, description: false, actions: true
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
      setLoading(true)
      setError(null)
      // Proaktif oturum kontrolü
      await ensureSessionFresh()

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

  const pathname = usePathname()
  React.useEffect(() => { load() }, [load, pathname])

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
        {hasWriteAccess && (
          <button onClick={handleCreate} className={`${adminButtonPrimaryClass} flex items-center gap-2`}>
            <Plus size={18} />
            <span>Yeni Kategori</span>
          </button>
        )}
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
                  { key: 'sortOrder', label: 'Sıra', checked: visibleCols.sortOrder, onChange: (v) => setVisibleCols(s => ({ ...s, sortOrder: v })) },
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
                      const cols = ['id', 'name', 'sort_order', 'slug', 'parent_id', 'description']
                      const header = cols.join(',')
                      const lines = filtered.map(r => [r.id, `"${r.name.replace(/"/g, '""')}"`, r.sort_order || 0, r.slug, r.parent_id || '', `"${(r.description || '').replace(/"/g, '""')}"`].join(','))
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
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] max-md:text-xs">
            <thead className="bg-gray-50">
              <tr>
                {visibleCols.image && <th className={`${adminTableHeadCellClass} ${headPad}`}>Görsel</th>}
                {visibleCols.name && <th className={`${adminTableHeadCellClass} ${headPad}`}>Ad</th>}
                {visibleCols.sortOrder && (
                  <th className={`${adminTableHeadCellClass} ${headPad} w-24 text-center`}>
                    Sıra
                    <InfoTooltip text="Kategorilerin sitedeki listelenme sırasını belirler. 1 değeri en üstte görünür." />
                  </th>
                )}
                {visibleCols.slug && <th className={`${adminTableHeadCellClass} ${headPad}`}>Slug</th>}
                {visibleCols.parent && <th className={`${adminTableHeadCellClass} ${headPad}`}>Üst</th>}
                {visibleCols.description && <th className={`${adminTableHeadCellClass} ${headPad}`}>Açıklama</th>}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <AdminSkeleton variant="table" rows={6} count={7} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <AdminEmptyState
                      icon={Tags}
                      title="Kategori bulunamadı"
                      description="Arama kriterlerinize uygun bir kategori bulunamadı veya henüz hiç kategori eklenmemiş."
                    />
                  </td>
                </tr>
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
                          <div className={r.parent_id ? 'pl-1' : ''}>
                            {hasWriteAccess ? (
                              <EditableCell
                                value={r.name}
                                placeholder="Kategori Adı"
                                inputWidth="w-full"
                                className={r.parent_id ? 'text-slate-600 font-normal' : 'font-medium'}
                                onSave={async (val) => {
                                  if (!val || r.name === val) return
                                  const { error } = await supabase.from('categories').update({ name: val }).eq('id', r.id)
                                  if (error) throw error
                                  setRows(prev => prev.map(row => row.id === r.id ? { ...row, name: val } : row))
                                  toast.success('Kategori adı güncellendi')
                                }}
                              />
                            ) : (
                              <span className={r.parent_id ? 'text-slate-600 font-normal' : 'font-medium'}>{r.name}</span>
                            )}
                          </div>
                          {r.is_featured && <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full">Vitrin</span>}
                        </div>
                      </td>
                    )}
                    {visibleCols.sortOrder && (
                      <td className={`${adminTableCellClass} ${cellPad} text-center`}>
                        {hasWriteAccess ? (
                          <EditableCell
                            value={r.sort_order?.toString() || '0'}
                            placeholder="0"
                            type="number"
                            inputWidth="w-16"
                            onSave={async (val) => {
                              const num = parseInt(val || '0', 10)
                              if (isNaN(num)) return
                              if (r.sort_order === num) return
                              const { error } = await supabase.from('categories').update({ sort_order: num }).eq('id', r.id)
                              if (error) throw error
                              setRows(prev => prev.map(row => row.id === r.id ? { ...row, sort_order: num } : row))
                              toast.success('Sıra güncellendi')
                              load()
                            }}
                          />
                        ) : (
                          <span>{r.sort_order || 0}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.slug && <td className={`${adminTableCellClass} ${cellPad} text-gray-500`}>{r.slug}</td>}
                    {visibleCols.parent && <td className={`${adminTableCellClass} ${cellPad}`}>{rows.find(x => x.id === r.parent_id)?.name || <span className="text-gray-400">-</span>}</td>}
                    {visibleCols.description && <td className={`${adminTableCellClass} ${cellPad} text-gray-500 truncate max-w-[200px]`}>{r.description}</td>}
                    {visibleCols.actions && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-2">
                          <button
                            className={adminTableActionClass}
                            onClick={() => handleEdit(r)}
                            disabled={!hasWriteAccess}
                            title={!hasWriteAccess ? "Düzenleme yetkiniz yok" : ""}
                          >
                            {t('admin.ui.edit') || 'Düzenle'}
                          </button>
                          {hasWriteAccess && (
                            <button className={adminTableActionDangerClass} onClick={() => remove(r.id)}>{t('admin.ui.delete') || 'Sil'}</button>
                          )}
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
