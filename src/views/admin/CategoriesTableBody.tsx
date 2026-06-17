'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Layout, Plus, SearchX, Tags } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import VentImage from '@/components/ui/VentImage'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import BulkActionToolbar from '../../components/admin/BulkActionToolbar'
import CategoryFormModal from '../../components/admin/categories/CategoryFormModal'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import EditableCell from '../../components/admin/EditableCell'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'
import type { DbCategory } from '../../types/db-rows'
import {
  adminButtonPrimaryClass,
  adminTableActionClass,
  adminTableActionDangerClass,
} from '../../utils/adminUi'

/* ---- aynı geniş kolon listesi (eski load() ile birebir) ---- */
const CATEGORY_SELECT =
  'id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content'

/* ---- fetcher: client-mode (sayfa-bağımsız, tüm kategoriler) ---- */
async function categoriesFetcher(
  supabase: SupabaseClient<Database>,
  _params: FetchParams,
): Promise<FetchResult<DbCategory>> {
  await ensureSessionFresh()
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  const rows = (data as DbCategory[]) || []
  return { rows, totalMatched: rows.length }
}

const CategoriesTableBody: React.FC = () => {
  const { t } = useI18n()
  const router = useRouter()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('categories')

  const table = useAdminTable<DbCategory>({
    resource: 'categories',
    rowId: (r) => r.id,
    fetcher: categoriesFetcher,
    paginationMode: 'none',
    sortMode: 'client',
    initialSort: { key: 'sort_order', dir: 'asc' },
    syncUrl: true,
  })

  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const parentVal = filters.parent_id?.[0] ?? ''
  const activeStatuses = useMemo(() => filters.is_active ?? [], [filters.is_active])

  // modal state (bu bileşende; CategoryFormModal create/edit'i taşır)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingCategory = useMemo(
    () => table.allRows.find((r) => r.id === editingId) ?? null,
    [table.allRows, editingId],
  )

  // üst-kategori adı çözümü için harita (filtre-öncesi tüm satırlardan)
  const categoryNameMap = useMemo(
    () => new Map(table.allRows.map((r) => [r.id, r.name])),
    [table.allRows],
  )

  const openCreate = useCallback(() => {
    setEditingId(null)
    setIsModalOpen(true)
  }, [])

  const openEdit = useCallback((r: DbCategory) => {
    setEditingId(r.id)
    setIsModalOpen(true)
  }, [])

  /* ---- inline ad düzenleme — ARTIK mutateWithAudit kapısından (K4 boşluğu kapandı) ---- */
  const saveName = useCallback(
    async (r: DbCategory, raw: string | number) => {
      const val = String(raw).trim()
      if (!val || r.name === val) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'categories',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: r.id,
          before: { name: r.name },
          after: { name: val },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('categories').update({ name: val }).eq('id', r.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.categories.toasts.nameUpdated'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.categories.toasts.noPermission')
            : t('admin.categories.toasts.nameUpdateFailed'),
        )
        throw e instanceof Error ? e : new Error('name_update_failed')
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- inline sıra düzenleme — ARTIK mutateWithAudit kapısından (K4 boşluğu kapandı) ---- */
  const saveSortOrder = useCallback(
    async (r: DbCategory, raw: string | number) => {
      const num = parseInt(String(raw || '0'), 10)
      if (Number.isNaN(num) || r.sort_order === num) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'categories',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: r.id,
          before: { sort_order: r.sort_order },
          after: { sort_order: num },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('categories').update({ sort_order: num }).eq('id', r.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.categories.toasts.sortOrderUpdated'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.categories.toasts.noPermission')
            : t('admin.categories.toasts.sortOrderUpdateFailed'),
        )
        throw e instanceof Error ? e : new Error('sort_order_update_failed')
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- silme — mutateWithAudit kapısından (DELETE) ---- */
  const removeCategory = useCallback(
    async (r: DbCategory) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.categories.toasts.noPermission'))
        return
      }
      if (!confirm(t('admin.categories.deleteConfirm'))) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'categories',
          canWrite: hasWriteAccess,
          action: 'DELETE',
          rowPk: r.id,
          before: { ...r },
          after: null,
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('categories').delete().eq('id', r.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.categories.toasts.deleted'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.categories.toasts.noPermission')
            : t('admin.categories.toasts.deleteFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- export (CSV, tüm filtreli sonuç fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['id', 'name', 'slug', 'parent_id', 'is_active', 'sort_order', 'description']
    const header = cols.join(',')
    const lines = rows.map((r) =>
      [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.slug || '',
        r.parent_id || '',
        r.is_active ? 'true' : 'false',
        r.sort_order != null ? String(r.sort_order) : '',
        `"${(r.description || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    const csv = '\ufeff' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'categories.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

  /* ---- toplu durum güncelleme — UPDATE, mutateWithAudit kapısından ---- */
  const bulkStatusChange = useCallback(
    async (status: string) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      const isActive = status === 'active'
      if (
        !window.confirm(
          t('admin.categories.bulk.statusConfirm', {
            count: String(ids.length),
            status: t(`admin.categories.statusLabels.${status}`),
          }),
        )
      )
        return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'categories',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { is_active: isActive, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('categories')
              .update({ is_active: isActive })
              .in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.categories.toasts.noPermission')
            : t('admin.categories.bulk.statusFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- toplu öne çıkarma — UPDATE, mutateWithAudit kapısından ---- */
  const bulkFeatureToggle = useCallback(
    async (featured: boolean) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'categories',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { is_featured: featured, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('categories')
              .update({ is_featured: featured })
              .in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.categories.toasts.noPermission')
            : t('admin.categories.toasts.saveError'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- toplu silme — DELETE, mutateWithAudit kapısından ---- */
  const bulkDelete = useCallback(async () => {
    const ids = table.selection.selectedIds
    if (ids.length === 0) return
    if (!window.confirm(t('admin.categories.bulk.deleteConfirm', { count: String(ids.length) }))) return
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'categories',
        canWrite: hasWriteAccess,
        action: 'DELETE',
        rowPk: null,
        before: { ids },
        after: null,
        auditedByEdge: false,
        fn: async () => {
          const { error } = await supabaseBrowserClient.from('categories').delete().in('id', ids)
          if (error) throw error
        },
      })
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.categories.toasts.noPermission')
          : t('admin.categories.bulk.deleteFailed'),
      )
    }
  }, [hasWriteAccess, t, table])

  /* ---- status chip'leri (is_active) ---- */
  const statusChips = useMemo(
    () =>
      [
        { key: 'true', label: t('admin.categories.statusLabels.active') },
        { key: 'false', label: t('admin.categories.statusLabels.inactive') },
      ].map((s) => ({
        key: s.key,
        label: s.label,
        active: activeStatuses.includes(s.key),
        onToggle: () => {
          const next = activeStatuses.includes(s.key)
            ? activeStatuses.filter((x) => x !== s.key)
            : [...activeStatuses, s.key]
          setFilter('is_active', next)
        },
      })),
    [t, activeStatuses, setFilter],
  )

  /* ---- parent category select options ---- */
  const parentOptions = useMemo(
    () => [
      { value: '', label: t('admin.categories.toolbar.allParents') },
      ...table.allRows
        .filter((c) => !c.parent_id)
        .map((c) => ({ value: c.id, label: c.name.toUpperCase() })),
    ],
    [table.allRows, t],
  )

  /* ---- filtre sıfırlama ---- */
  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('parent_id', [])
    setFilter('is_active', [])
  }, [setQuery, setFilter])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<DbCategory>[]>(
    () => [
      {
        key: 'image',
        header: t('admin.categories.table.image'),
        hideable: true,
        cell: (r) => (
          <div className="relative w-12 h-12 rounded-xl border border-white/5 overflow-hidden glass group-hover:border-white/10 transition-colors duration-500">
            {r.image_url ? (
              <VentImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${r.image_url}`}
                alt=""
                fallbackType="category"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs font-black text-slate-700 uppercase">
                {t('admin.categories.noImage')}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'name',
        header: t('admin.categories.table.name'),
        sortable: true,
        cell: (r) => (
          <div className="flex items-center gap-2">
            {r.parent_id && <div className="w-4 h-px bg-slate-700 mt-1" />}
            <div className="flex flex-col">
              {hasWriteAccess ? (
                <EditableCell
                  value={r.name}
                  placeholder={t('admin.categories.namePlaceholder')}
                  inputWidth="w-full"
                  className={`group-hover:text-cyan-400 transition-colors uppercase tracking-wider font-black ${
                    r.parent_id ? 'text-slate-400 text-xs' : 'text-white text-xs'
                  }`}
                  onSave={(val) => saveName(r, val)}
                />
              ) : (
                <span
                  className={`uppercase tracking-wider font-black ${
                    r.parent_id ? 'text-slate-400 text-xs' : 'text-white text-xs'
                  }`}
                >
                  {r.name}
                </span>
              )}
              {r.is_featured && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-admin-categories-glow" />
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                    {t('admin.categories.featuredBadge')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'sort_order',
        header: t('admin.categories.table.sortOrder'),
        sortable: true,
        align: 'right',
        cell: (r) =>
          hasWriteAccess ? (
            <div
              title={t('admin.categories.sortOrderTooltip')}
              className="inline-block glass bg-white/5 rounded-xl border border-white/5 group-hover:border-cyan-400/30 transition-colors p-1"
            >
              <EditableCell
                value={r.sort_order ?? 0}
                placeholder="0"
                type="number"
                inputWidth="w-12"
                className="text-center text-cyan-400 font-black text-xs tracking-widest uppercase"
                onSave={(val) => saveSortOrder(r, val)}
              />
            </div>
          ) : (
            <span
              title={t('admin.categories.sortOrderTooltip')}
              className="text-xs font-black text-slate-500 uppercase tracking-widest"
            >
              {r.sort_order ?? 0}
            </span>
          ),
      },
      {
        key: 'slug',
        header: t('admin.categories.table.slug'),
        hideable: true,
        cell: (r) => (
          <code className="text-xs font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 group-hover:text-cyan-400/60 transition-colors uppercase tracking-hvac-snug font-mono">
            {r.slug}
          </code>
        ),
      },
      {
        key: 'parent',
        header: t('admin.categories.table.parent'),
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-black text-slate-500 uppercase tracking-hvac-snug">
            {r.parent_id ? categoryNameMap.get(r.parent_id) ?? t('admin.categories.noPlaceholder') : t('admin.categories.noPlaceholder')}
          </span>
        ),
      },
      {
        key: 'description',
        header: t('admin.categories.table.description'),
        hideable: true,
        defaultHidden: true,
        cell: (r) => (
          <p className="text-xs text-slate-500 line-clamp-1 max-w-200px italic">
            {r.description || t('admin.categories.noPlaceholder')}
          </p>
        ),
      },
      {
        key: 'actions',
        header: t('admin.categories.table.actions'),
        align: 'center',
        cell: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              className={`${adminTableActionClass} bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white`}
              onClick={() => router.push(`/admin/categories/${r.id}/builder`)}
              title={t('admin.categories.designAction')}
              aria-label={t('admin.categories.designAction')}
            >
              <Layout size={14} />
            </button>
            <button
              type="button"
              className={adminTableActionClass}
              onClick={() => openEdit(r)}
              disabled={!hasWriteAccess}
              title={hasWriteAccess ? t('admin.categories.editAction') : t('admin.categories.noEditPermission')}
            >
              {t('admin.categories.editAction')}
            </button>
            {hasWriteAccess && (
              <button
                type="button"
                className={adminTableActionDangerClass}
                onClick={() => removeCategory(r)}
              >
                {t('admin.categories.deleteAction')}
              </button>
            )}
          </div>
        ),
      },
    ],
    [t, hasWriteAccess, categoryNameMap, router, saveName, saveSortOrder, removeCategory, openEdit],
  )

  return (
    <div className="space-y-6">
      {hasWriteAccess && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>{t('admin.categories.newCategory')}</span>
          </button>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="categories"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={Tags}
            title={t('admin.categories.emptyTitle')}
            description={t('admin.categories.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.categories.emptyTitle')}
            description={t('admin.categories.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.categories.columnsButton')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:categories"
            sticky
            search={{
              value: table.filtering.query,
              onChange: setQuery,
              placeholder: t('admin.categories.searchPlaceholder'),
              focusShortcut: '/',
            }}
            select={{
              value: parentVal,
              onChange: (v) => setFilter('parent_id', v ? [v] : []),
              title: t('admin.categories.toolbar.parentTitle'),
              options: parentOptions,
            }}
            chips={statusChips}
            recordCount={table.totalMatched}
            onClear={resetFilters}
            rightExtra={
              <ExportMenu
                items={[
                  { key: 'csv', label: t('admin.categories.export.csvLabel'), onSelect: () => void exportCsv() },
                ]}
              />
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkActionToolbar
              selectedCount={table.selection.selectedIds.length}
              onStatusChange={(status) => void bulkStatusChange(status)}
              onFeatureToggle={(featured) => void bulkFeatureToggle(featured)}
              onDelete={() => void bulkDelete()}
              onPriceAdjust={() => {
                toast.error('Categories do not support price adjustments')
              }}
              onClearSelection={table.selection.clear}
            />
          ) : null
        }
      />

      <CategoryFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={editingCategory}
        onSuccess={() => {
          void table.reload()
        }}
      />
    </div>
  )
}

export default CategoriesTableBody
