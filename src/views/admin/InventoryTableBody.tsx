'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import React, { useCallback, useMemo,useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

import AdminToolbar from '../../components/admin/AdminToolbar'
import InventoryTable from '../../components/admin/InventoryTable'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { useI18n } from '../../i18n/I18nProvider'
import { Density, InventoryRow, LoadState, SortKey } from '../../types/inventory'

type InventoryRowWithCategory = InventoryRow & { category_id?: string | null }

const PAGE_SIZE = 50

interface Category {
  id: string
  name: string
}

async function inventoryFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<InventoryRowWithCategory>> {
  // Veritabanındaki gerçek view 'inventory_velocity' tablosudur. 
  // TS tipleri ile veri tabanı kolonları yer değiştirdiği için 'as never' kullanılarak gerçek view sorgulanır.
  let query = supabase
    .from('inventory_velocity' as never)
    .select('product_id, name, physical_stock, reserved_stock, available_stock, warehouse_location, supplier_name')

  // Sıralama
  const sortKey = params.sort?.key ?? 'name'
  const ascending = params.sort?.dir === 'asc'

  const colMap: Record<string, string> = {
    name: 'name',
    physical: 'physical_stock',
    reserved: 'reserved_stock',
    available: 'available_stock',
    location: 'warehouse_location',
    supplier: 'supplier_name',
  }

  const col = colMap[sortKey]
  if (col) {
    query = query.order(col, { ascending })
  } else {
    query = query.order('name', { ascending: true })
  }

  // Arama filtrelemesi
  if (params.query) {
    const like = `%${params.query}%`
    query = query.ilike('name', like)
  }

  const { data, error } = await query
  if (error) throw error

  const items = data || []
  const productIds = items
    .map((r) => String((r as Record<string, unknown>).product_id || ''))
    .filter(Boolean)

  // View üzerinde category_id olmadığı için products tablosundan eşleştirme yapılır
  const categoryMap: Record<string, string> = {}
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, category_id')
      .in('id', productIds)
    if (productsData) {
      productsData.forEach((p) => {
        if (p.category_id) categoryMap[p.id] = p.category_id
      })
    }
  }

  const rows: InventoryRowWithCategory[] = items.map((r) => {
    const item = r as Record<string, unknown>
    return {
      product_id: String(item.product_id || ''),
      name: String(item.name || ''),
      physical_stock: Number(item.physical_stock || 0),
      reserved_stock: Number(item.reserved_stock || 0),
      available_stock: Number(item.available_stock || 0),
      warehouse_location: item.warehouse_location ? String(item.warehouse_location) : null,
      supplier_name: item.supplier_name ? String(item.supplier_name) : null,
      category_id: String(item.product_id || '') ? categoryMap[String(item.product_id)] || null : null,
    }
  })

  // Kategori filtresi
  const categoryFilter = params.filters.category?.[0]
  let filteredRows = rows
  if (categoryFilter) {
    filteredRows = rows.filter((r) => r.category_id === categoryFilter)
  }

  const totalMatched = filteredRows.length
  const offset = (params.page - 1) * params.pageSize
  const paginatedRows = filteredRows.slice(offset, offset + params.pageSize)

  return { rows: paginatedRows, totalMatched }
}

const InventoryTableBody: React.FC = () => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('inventory')

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null)

  // Fetch categories for the filter select
  React.useEffect(() => {
    let active = true
    void (async () => {
      const { data } = await supabaseBrowserClient
        .from('categories')
        .select('id, name')
        .order('name')
      if (active && data) {
        setCategories(data)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const {
    rows,
    totalMatched,
    isLoading,
    error,
    reload,
    pagination,
    sorting,
    filtering,
  } = useAdminTable<InventoryRowWithCategory>({
    resource: 'inventory',
    rowId: (r) => r.product_id,
    fetcher: inventoryFetcher,
    pageSize: PAGE_SIZE,
    syncUrl: true,
  })

  const handleUpdateLocation = useCallback(
    async (productId: string, val: string) => {
      try {
        const row = rows.find((r) => r.product_id === productId)
        const before = { warehouse_location: row?.warehouse_location || null }
        const after = { warehouse_location: val || null }

        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'inventory',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: productId,
          before,
          after,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('products')
              .update({ warehouse_location: val || null })
              .eq('id', productId)
            if (error) throw error
          },
        })
        toast.success(t('admin.inventory.toasts.locationUpdated') || 'Konum güncellendi.')
        await reload()
      } catch (e: unknown) {
        console.error('Update location error:', e)
        const msg =
          e instanceof AdminPermissionError
            ? t('admin.inventory.settings.noPermission') || 'Bu işlem için yetkiniz yok.'
            : e instanceof Error
            ? e.message
            : 'Güncelleme sırasında hata oluştu.'
        toast.error(msg)
      }
    },
    [rows, hasWriteAccess, reload, t],
  )

  const handleUpdateSupplier = useCallback(
    async (productId: string, val: string) => {
      try {
        const row = rows.find((r) => r.product_id === productId)
        const before = { supplier_name: row?.supplier_name || null }
        const after = { supplier_name: val || null }

        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'inventory',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: productId,
          before,
          after,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('products')
              .update({ supplier_name: val || null })
              .eq('id', productId)
            if (error) throw error
          },
        })
        toast.success(t('admin.inventory.toasts.supplierUpdated') || 'Tedarikçi güncellendi.')
        await reload()
      } catch (e: unknown) {
        console.error('Update supplier error:', e)
        const msg =
          e instanceof AdminPermissionError
            ? t('admin.inventory.settings.noPermission') || 'Bu işlem için yetkiniz yok.'
            : e instanceof Error
            ? e.message
            : 'Güncelleme sırasında hata oluştu.'
        toast.error(msg)
      }
    },
    [rows, hasWriteAccess, reload, t],
  )

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  )

  return (
    <div className="space-y-4">
      <AdminToolbar
        storageKey="toolbar:inventory"
        sticky
        search={{
          value: filtering.query,
          onChange: filtering.setQuery,
          placeholder: t('admin.inventory.searchPlaceholder') || 'Ürünlerde ara...',
          focusShortcut: '/',
        }}
        select={{
          value: filtering.filters.category?.[0] || '',
          onChange: (v) => filtering.setFilter('category', v ? [v] : []),
          title: t('admin.inventory.allCategories') || 'Tüm Kategoriler',
          options: [
            { value: '', label: t('admin.inventory.allCategories') || 'Tüm Kategoriler' },
            ...categoryOptions,
          ],
        }}
        onClear={filtering.clearAll}
        recordCount={totalMatched}
      />

      <InventoryTable
        rows={rows}
        loading={isLoading ? LoadState.Loading : LoadState.Idle}
        error={error || ''}
        selected={selectedRow}
        visibleCols={{
          name: true,
          physical: true,
          reserved: true,
          available: true,
          threshold: true,
          status: true,
          location: true,
          supplier: true,
          abc: false,
          days: false,
        }}
        density={'comfortable' as Density}
        sortKey={(sorting.sort?.key as SortKey) || 'name'}
        sortDir={sorting.sort?.dir || 'asc'}
        groupByCategory={false}
        groupedRows={[]}
        onSort={sorting.toggleSort}
        onSelect={setSelectedRow}
        onUpdateLocation={handleUpdateLocation}
        onUpdateSupplier={handleUpdateSupplier}
        hasWriteAccess={hasWriteAccess}
        thresholdMap={{}}
        defaultThreshold={5}
        effectiveThreshold={() => 5}
      />

      {/* Pagination controls */}
      {totalMatched > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {t('admin.common.total')}: <span className="text-cyan-400">{totalMatched}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-slate-900 border border-white/5 text-xs font-bold text-white rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              {t('admin.ui.prev') || 'Önceki'}
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {pagination.page} / {pagination.pageCount}
            </span>
            <button
              onClick={() => pagination.setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pageCount}
              className="px-4 py-2 bg-slate-900 border border-white/5 text-xs font-bold text-white rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              {t('admin.ui.next') || 'Sonraki'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryTableBody
