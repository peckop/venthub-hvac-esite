'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { FileUp } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

import AdminToolbar from '../../components/admin/AdminToolbar'
import ExportMenu from '../../components/admin/ExportMenu'
import InventoryCsvImport from '../../components/admin/InventoryCsvImport'
import InventoryDetailDrawer from '../../components/admin/InventoryDetailDrawer'
import InventoryTable from '../../components/admin/InventoryTable'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useInventoryDetail } from '../../hooks/useInventoryDetail'
import { useRole } from '../../hooks/useRole'
import { useI18n } from '../../i18n/I18nProvider'
import type { InventoryRow } from '../../types/inventory'

type InventoryRowWithCategory = InventoryRow & {
  category_id?: string | null
  low_stock_threshold?: number | null
}

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

  // View üzerinde category_id ve low_stock_threshold olmadığı için products tablosundan eşleştirme yapılır
  const categoryMap: Record<string, string> = {}
  const thresholdMap: Record<string, number> = {}
  // `abc` ve `days` kolonları ile çekmecedeki satın alma önerisi `inventory_summary`
  // görünümünden gelir; `inventory_velocity` bu alanları TAŞIMIYOR. Eksikti: iki kolon
  // her satırda boş, çekmecenin öneri bloğu ise hiç render olmuyordu.
  const velocityMap: Record<string, { daily?: number; days?: number; abc?: 'A' | 'B' | 'C' | null }> = {}

  if (productIds.length > 0) {
    const [{ data: productsData }, { data: summaryData }] = await Promise.all([
      supabase.from('products').select('id, category_id, low_stock_threshold').in('id', productIds),
      supabase
        .from('inventory_summary')
        .select('product_id, daily_velocity, days_until_empty, abc_class')
        .in('product_id', productIds),
    ])
    if (productsData) {
      productsData.forEach((p) => {
        if (p.category_id) categoryMap[p.id] = p.category_id
        if (typeof p.low_stock_threshold === 'number') thresholdMap[p.id] = p.low_stock_threshold
      })
    }
    if (summaryData) {
      summaryData.forEach((v) => {
        const pid = v.product_id
        if (!pid) return
        const abc = v.abc_class
        velocityMap[pid] = {
          daily: v.daily_velocity ?? undefined,
          days: v.days_until_empty ?? undefined,
          abc: abc === 'A' || abc === 'B' || abc === 'C' ? abc : null,
        }
      })
    }
  }

  const rows: InventoryRowWithCategory[] = items.map((r) => {
    const item = r as Record<string, unknown>
    const pId = String(item.product_id || '')
    const vel = pId ? velocityMap[pId] : undefined
    return {
      product_id: pId,
      name: String(item.name || ''),
      physical_stock: Number(item.physical_stock || 0),
      reserved_stock: Number(item.reserved_stock || 0),
      available_stock: Number(item.available_stock || 0),
      warehouse_location: item.warehouse_location ? String(item.warehouse_location) : null,
      supplier_name: item.supplier_name ? String(item.supplier_name) : null,
      category_id: pId ? categoryMap[pId] || null : null,
      low_stock_threshold: pId ? thresholdMap[pId] ?? null : null,
      daily_velocity: vel?.daily,
      days_until_empty: vel?.days,
      abc_class: vel?.abc ?? undefined,
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
  const [csvImportOpen, setCsvImportOpen] = useState(false)

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

  const table = useAdminTable<InventoryRowWithCategory>({
    resource: 'inventory',
    rowId: (r) => r.product_id,
    fetcher: inventoryFetcher,
    pageSize: PAGE_SIZE,
    syncUrl: true,
  })

  /**
   * Stok detay çekmecesinin konteyneri. `3c7ea6ff` purge'ünde bu mantık silinmişti;
   * dosyayı tekrar 700 satıra şişirmemek için ayrı bir kancada yaşıyor.
   */
  const detail = useInventoryDetail({
    hasWriteAccess,
    rows: table.rows,
    onMutated: table.reload,
  })

  const handleUpdateLocation = useCallback(
    async (productId: string, val: string) => {
      try {
        const row = table.rows.find((r) => r.product_id === productId)
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
        await table.reload()
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
    [table, hasWriteAccess, t],
  )

  const handleUpdateSupplier = useCallback(
    async (productId: string, val: string) => {
      try {
        const row = table.rows.find((r) => r.product_id === productId)
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
        await table.reload()
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
    [table, hasWriteAccess, t],
  )

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  )

  const exportCsv = useCallback(async () => {
    const allRows = await table.fetchAllForExport()
    const cols = [
      t('admin.inventory.table.productCol'),
      t('admin.inventory.table.physicalCol'),
      t('admin.inventory.table.reservedCol'),
      t('admin.inventory.table.availableCol'),
      t('admin.inventory.table.thresholdCol'),
      t('admin.inventory.table.locationCol'),
      t('admin.inventory.table.supplierCol'),
    ]
    const header = cols.join(',')
    const lines = allRows.map((r) =>
      [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.physical_stock,
        r.reserved_stock,
        r.available_stock,
        r.low_stock_threshold ?? 5,
        `"${(r.warehouse_location || '').replace(/"/g, '""')}"`,
        `"${(r.supplier_name || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    const csv = '\uFEFF' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t])

  return (
    <div className="space-y-4">
      <AdminToolbar
        storageKey="toolbar:inventory"
        sticky
        search={{
          value: table.filtering.query,
          onChange: table.filtering.setQuery,
          placeholder: t('admin.inventory.searchPlaceholder') || 'Ürünlerde ara...',
          focusShortcut: '/',
        }}
        select={{
          value: table.filtering.filters.category?.[0] || '',
          onChange: (v) => table.filtering.setFilter('category', v ? [v] : []),
          title: t('admin.inventory.allCategories') || 'Tüm Kategoriler',
          options: [
            { value: '', label: t('admin.inventory.allCategories') || 'Tüm Kategoriler' },
            ...categoryOptions,
          ],
        }}
        onClear={table.filtering.clearAll}
        recordCount={table.totalMatched}
        rightExtra={
          <div className="flex items-center gap-2">
            {/* RBAC katman-1: yazma yetkisi yoksa içe aktarma yüzeyi HİÇ render edilmez. */}
            {hasWriteAccess && (
              <button
                type="button"
                onClick={() => setCsvImportOpen(true)}
                className="h-12 px-6 rounded-admin-lg bg-admin-accent text-admin-accent-fg text-xs font-semibold hover:bg-admin-accent-hover transition-colors flex items-center gap-2"
              >
                <FileUp size={16} aria-hidden="true" />
                {t('admin.inventory.csvLoad')}
              </button>
            )}
            <ExportMenu
              items={[
                {
                  key: 'csv',
                  label: t('admin.inventory.export.csv') || 'Sayfa Verilerini İndir (.csv)',
                  onSelect: () => void exportCsv(),
                },
              ]}
            />
          </div>
        }
      />

      <InventoryTable
        table={table}
        hasWriteAccess={hasWriteAccess}
        onUpdateLocation={handleUpdateLocation}
        onUpdateSupplier={handleUpdateSupplier}
        onSelectRow={detail.open}
      />

      <InventoryDetailDrawer
        selected={detail.selected}
        onClose={detail.close}
        printingQr={detail.printingQr}
        setPrintingQr={detail.setPrintingQr}
        selectedStock={detail.selectedStock}
        selectedThreshold={detail.selectedThreshold}
        setSelectedThreshold={detail.setSelectedThreshold}
        defaultThreshold={detail.defaultThreshold}
        saving={detail.saving}
        saveThreshold={detail.saveThreshold}
        hasWriteAccess={hasWriteAccess}
        moveQty={detail.moveQty}
        setMoveQty={detail.setMoveQty}
        moving={detail.moving}
        adjustStock={detail.adjustStock}
        reservedOrders={detail.reservedOrders}
        movements={detail.movements}
        undoLastMovement={detail.undoLastMovement}
        undoing={detail.undoing}
      />

      {hasWriteAccess && (
        <InventoryCsvImport
          isOpen={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          onSuccess={() => void table.reload()}
          effectiveThreshold={detail.effectiveThreshold}
        />
      )}
    </div>
  )
}

export default InventoryTableBody
