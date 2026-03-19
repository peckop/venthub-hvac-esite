import { VentImage } from '@/components/ui/VentImage'
import React, { lazy, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import type { DbCategory, DbJson } from '../../types/db-rows'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import AdminToolbar from '../../components/admin/AdminToolbar'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminTableContainerClass,
  adminButtonPrimaryClass, 
  adminTableActionClass, 
  adminTableActionDangerClass 
} from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'
import { CategoryFormModal } from '../../components/admin/categories/CategoryFormModal'
import { Tags, Plus } from 'lucide-react'
import EditableCell from '../../components/admin/EditableCell'
import InfoTooltip from '../../components/admin/InfoTooltip'
import toast from 'react-hot-toast'
import { useRole } from '../../hooks/useRole'
import { useDragScroll } from '../../hooks/useDragScroll'

// Lazy load menus
const ColumnsMenu = lazy(() => import('../../components/admin/ColumnsMenu'))
const ExportMenu = lazy(() => import('../../components/admin/ExportMenu'))

const AdminCategoriesPage: React.FC = () => {
  const { t } = useI18n()
  const [rows, setRows] = React.useState<DbCategory[]>([])
  const [q, setQ] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('categories')
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  // ... (visibleCols and density useEffects stay same)

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
      setRows((data || []) as unknown as DbCategory[])
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

  const handleEdit = (r: DbCategory) => {
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
      await logAdminAction(supabase, { 
        table_name: 'categories', 
        row_pk: id, 
        action: 'DELETE', 
        before: before as unknown as DbJson, 
        after: null, 
        comment: 'delete category' 
      })
      await load()
    } catch (e) {
      alert('Silinemedi: ' + ((e as Error).message || e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className={adminSectionTitleClass}>{t('admin.titles.categories') ?? 'Kategoriler'}</h1>
          <p className={adminSubtitleClass}>Ürün hiyerarşisini ve kategori ağacını buradan yönetebilirsiniz.</p>
        </div>
        {hasWriteAccess && (
          <button onClick={handleCreate} className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}>
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
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

      <div className={adminTableContainerClass}>
        {error && <div className="p-4 text-rose-400 text-xs font-bold bg-rose-500/10 border-b border-white/5 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" />{error}</div>}
        <div ref={dragScrollRef} className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="glass-strong">
                {visibleCols.image && <th className={`${adminTableHeadCellClass} ${headPad}`}>Görsel</th>}
                {visibleCols.name && <th className={`${adminTableHeadCellClass} ${headPad}`}>Ad</th>}
                {visibleCols.sortOrder && (
                  <th className={`${adminTableHeadCellClass} ${headPad} w-24 text-center`}>
                    <div className="flex items-center justify-center gap-2">
                       Sıra
                       <InfoTooltip text="Kategorilerin sitedeki listelenme sırasını belirler. 1 değeri en üstte görünür." />
                    </div>
                  </th>
                )}
                {visibleCols.slug && <th className={`${adminTableHeadCellClass} ${headPad}`}>Slug</th>}
                {visibleCols.parent && <th className={`${adminTableHeadCellClass} ${headPad}`}>Üst</th>}
                {visibleCols.description && <th className={`${adminTableHeadCellClass} ${headPad}`}>Açıklama</th>}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} text-center`}>İşlem</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <AdminSkeleton variant="table" rows={6} count={7} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <AdminEmptyState
                      icon={Tags}
                      title="Kategori bulunamadı"
                      description="Arama kriterlerinize uygun bir kategori bulunamadı veya henüz hiç kategori eklenmemiş."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors duration-300">
                    {visibleCols.image && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="relative w-12 h-12 rounded-xl border border-white/5 overflow-hidden glass group-hover:border-white/10 transition-all duration-500">
                          {r.image_url ? (
                            <VentImage src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${r.image_url}`}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                             />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-black text-slate-700 uppercase">NO IMG</div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleCols.name && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-2">
                          {r.parent_id && <div className="w-4 h-px bg-slate-700 mt-1" />}
                          <div className="flex flex-col">
                            {hasWriteAccess ? (
                              <EditableCell
                                value={r.name}
                                placeholder="KATEGORİ ADI"
                                inputWidth="w-full"
                                className={`group-hover:text-cyan-400 transition-colors uppercase tracking-wider font-black ${r.parent_id ? 'text-slate-400 text-[11px]' : 'text-white text-xs'}`}
                                onSave={async (val) => {
                                  if (!val || r.name === val) return
                                  const { error } = await supabase.from('categories').update({ name: val }).eq('id', r.id)
                                  if (error) throw error
                                  setRows(prev => prev.map(row => row.id === r.id ? { ...row, name: val } : row))
                                  toast.success('Kategori adı güncellendi')
                                }}
                              />
                            ) : (
                              <span className={`uppercase tracking-wider font-black ${r.parent_id ? 'text-slate-400 text-[11px]' : 'text-white text-xs'}`}>{r.name}</span>
                            )}
                            {r.is_featured && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Öne Çıkan</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.sortOrder && (
                      <td className={`${adminTableCellClass} ${cellPad} text-center`}>
                        {hasWriteAccess ? (
                          <div className="inline-block glass bg-white/5 rounded-xl border border-white/5 group-hover:border-cyan-400/30 transition-all p-1">
                             <EditableCell
                                value={r.sort_order?.toString() || '0'}
                                placeholder="0"
                                type="number"
                                inputWidth="w-12"
                                 className="text-center text-cyan-400 font-black text-[11px] tracking-widest uppercase"
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
                          </div>
                        ) : (
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{r.sort_order || 0}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.slug && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                         <code className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 group-hover:text-cyan-400/60 transition-colors uppercase tracking-[0.15em] font-mono">{r.slug}</code>
                      </td>
                    )}
                    {visibleCols.parent && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                          {rows.find(x => x.id === r.parent_id)?.name || '-'}
                        </span>
                      </td>
                    )}
                    {visibleCols.description && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px] italic">{r.description || '-'}</p>
                      </td>
                    )}
                    {visibleCols.actions && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center justify-center gap-2">
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
