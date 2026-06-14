'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { endOfDay } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, PackageMinus, SearchX } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import DateRangePicker from '../../components/admin/DateRangePicker'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import { adminTableActionWarningClass } from '../../utils/adminUi'

/* ---- modeller ---- */
interface MovementProduct {
  id: string
  name: string
  sku: string | null
  category_id: string | null
}

/** Embedded inner-join satırı (select sırasıyla aynı). */
interface MovementJoinRow {
  id: string
  product_id: string
  delta: number
  reason: string | null
  order_id: string | null
  created_at: string
  batch_id: string | null
  products: MovementProduct
}

/** Kit'in kullandığı düzleştirilmiş satır (cell'ler product.name/sku okur). */
interface MovementRow {
  id: string
  product_id: string
  delta: number
  reason: string | null
  order_id: string | null
  created_at: string
  batch_id: string | null
  product: MovementProduct
}

interface CategoryRow {
  id: string
  name: string
}

const PAGE_SIZE = 50
const ALL_REASONS = [
  'sale',
  'po_receipt',
  'manual_in',
  'manual_out',
  'adjust',
  'return_in',
  'transfer_out',
  'transfer_in',
] as const

/** reason → i18n etiketi (mevcut sayfadan taşındı). */
function reasonLabel(key: string | null | undefined, t: (k: string) => string): string {
  const val = String(key || '')
  if (val.startsWith('undo')) return t('admin.movements.reasons.undo')
  switch (val) {
    case 'sale':
      return t('admin.movements.reasons.sale')
    case 'po_receipt':
      return t('admin.movements.reasons.po_receipt')
    case 'manual_in':
      return t('admin.movements.reasons.manual_in')
    case 'manual_out':
      return t('admin.movements.reasons.manual_out')
    case 'adjust':
      return t('admin.movements.reasons.adjust')
    case 'return_in':
      return t('admin.movements.reasons.return_in')
    case 'transfer_out':
      return t('admin.movements.reasons.transfer_out')
    case 'transfer_in':
      return t('admin.movements.reasons.transfer_in')
    default:
      return '-'
  }
}

/** Embedded join satırını kit-satırına düzleştirir (product = products). */
function flatten(row: MovementJoinRow): MovementRow {
  return {
    id: row.id,
    product_id: row.product_id,
    delta: row.delta,
    reason: row.reason,
    order_id: row.order_id,
    created_at: row.created_at,
    batch_id: row.batch_id,
    product: row.products,
  }
}

/* ---- fetcher: server-mode, embedded inner-join → search/sort/filter SUNUCUDA ---- */
async function movementsFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<MovementRow>> {
  let query = supabase
    .from('inventory_movements')
    .select(
      'id, product_id, delta, reason, order_id, created_at, batch_id, products!inner(id,name,sku,category_id)',
      { count: 'exact' },
    )

  /* sıralama: anahtar → server kolonu (product = foreignTable products.name) */
  const sortKey = params.sort?.key ?? 'date'
  const ascending = params.sort?.dir === 'asc'
  if (sortKey === 'product') {
    query = query.order('name', { foreignTable: 'products', ascending })
  } else {
    const colMap: Record<string, string> = {
      date: 'created_at',
      delta: 'delta',
      reason: 'reason',
      ref: 'order_id',
    }
    query = query.order(colMap[sortKey] ?? 'created_at', { ascending })
  }

  /* arama: ürün adı/SKU (embedded products foreignTable) */
  if (params.query) {
    const like = `%${params.query}%`
    query = query.or(`name.ilike.${like},sku.ilike.${like}`, { foreignTable: 'products' })
  }

  /* kategori filtresi (embedded kolon üzerinden eşitlik) */
  const category = params.filters.category?.[0]
  if (category) query = query.eq('products.category_id', category)

  /* reason çoklu seçim */
  const reasons = params.filters.reason ?? []
  if (reasons.length > 0) query = query.in('reason', reasons)

  /* tarih aralığı */
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  /* batch deep-link */
  const batch = params.filters.batch?.[0]
  if (batch) query = query.eq('batch_id', batch)

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error

  const joinRows: MovementJoinRow[] = data ?? []
  return { rows: joinRows.map(flatten), totalMatched: typeof count === 'number' ? count : 0 }
}

const MovementsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const searchParams = useSearchParams()

  /* batch deep-link: ?batch=... → initialFilters tohumu (yalnız ilk render) */
  const batchParam = (searchParams?.get('batch') ?? '').trim()
  const initialFilters = useMemo<Record<string, string[]>>(() => {
    const f: Record<string, string[]> = {}
    if (batchParam) f.batch = [batchParam]
    return f
  }, [batchParam])

  const table = useAdminTable<MovementRow>({
    resource: 'movements',
    rowId: (r) => r.id,
    fetcher: movementsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: PAGE_SIZE,
    initialSort: { key: 'date', dir: 'desc' },
    initialFilters,
    syncUrl: true,
  })

  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const categoryVal = filters.category?.[0] ?? ''
  const activeReasons = useMemo(() => filters.reason ?? [], [filters.reason])
  const batchVal = filters.batch?.[0] ?? ''

  /* kategori SELECT seçenekleri — ayrı tek-seferlik fetch (TÜM kategoriler) */
  const [categories, setCategories] = useState<CategoryRow[]>([])
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error } = await supabaseBrowserClient
        .from('categories')
        .select('id,name')
        .order('name', { ascending: true })
      if (!cancelled && !error && data) setCategories(data as CategoryRow[])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* date-range picker ↔ filters.from/to */
  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = filters.from?.[0]
    const to = filters.to?.[0]
    if (!from && !to) return undefined
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }, [filters.from, filters.to])

  const onDateChange = useCallback(
    (range?: DateRange) => {
      setFilter('from', range?.from ? [range.from.toISOString()] : [])
      setFilter('to', range?.to ? [endOfDay(range.to).toISOString()] : [])
    },
    [setFilter],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('category', [])
    setFilter('reason', [])
    setFilter('from', [])
    setFilter('to', [])
    setFilter('batch', [])
  }, [setQuery, setFilter])

  /* ---- export (CSV + XLS), table.fetchAllForExport() üzerinden ---- */
  const buildExportRows = useCallback(
    (rows: MovementRow[]) =>
      rows.map((m) => ({
        date: formatDateTime(m.created_at, lang as 'tr' | 'en'),
        product: m.product?.name || m.product_id,
        sku: m.product?.sku || '',
        delta: m.delta,
        reason: reasonLabel(m.reason, t),
        ref: m.order_id ? m.order_id.slice(-8).toUpperCase() : '',
      })),
    [lang, t],
  )

  const exportHeaders = useMemo(
    () => [
      t('admin.movements.export.headers.date'),
      t('admin.movements.export.headers.product'),
      t('admin.movements.export.headers.sku'),
      t('admin.movements.export.headers.delta'),
      t('admin.movements.export.headers.reason'),
      t('admin.movements.export.headers.ref'),
    ],
    [t],
  )

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = useCallback(async () => {
    const data = buildExportRows(await table.fetchAllForExport())
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = data.map((r) =>
      [r.date, r.product, r.sku, r.delta, r.reason, r.ref].map(escape).join(','),
    )
    const csv = '﻿' + [exportHeaders.join(','), ...lines].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'inventory_movements.csv')
  }, [buildExportRows, exportHeaders, table])

  const exportXls = useCallback(async () => {
    const data = buildExportRows(await table.fetchAllForExport())
    const head = exportHeaders.map((h) => `<th>${h}</th>`).join('')
    const body = data
      .map(
        (r) =>
          `<tr><td>${r.date}</td><td>${r.product}</td><td>${r.sku}</td><td>${r.delta}</td><td>${r.reason}</td><td>${r.ref}</td></tr>`,
      )
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), 'inventory_movements.xls')
  }, [buildExportRows, exportHeaders, table])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<MovementRow>[]>(
    () => [
      {
        key: 'date',
        header: t('admin.movements.table.date'),
        sortable: true,
        cell: (m) => (
          <span className="font-black text-slate-400 text-xs uppercase tracking-widest">
            {formatDateTime(m.created_at, lang as 'tr' | 'en')}
          </span>
        ),
      },
      {
        key: 'product',
        header: t('admin.movements.table.product'),
        sortable: true,
        cell: (m) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-white uppercase tracking-tight">{m.product?.name || m.product_id}</span>
            {m.product?.sku && (
              <span className="text-xs font-black text-slate-500 tracking-widest bg-white/5 w-fit px-2 py-0.5 rounded uppercase">
                {m.product.sku}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'delta',
        header: t('admin.movements.table.delta'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (m) => (
          <span
            className={`inline-flex items-center gap-1 text-xs font-black font-mono px-3 py-1.5 rounded-xl border uppercase tracking-widest ${
              m.delta > 0
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : m.delta < 0
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : 'bg-white/5 text-slate-500 border-white/5'
            }`}
          >
            {m.delta > 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : m.delta < 0 ? <ArrowDownRight size={10} strokeWidth={3} /> : null}
            {m.delta > 0 ? `+${m.delta}` : m.delta}
          </span>
        ),
      },
      {
        key: 'reason',
        header: t('admin.movements.table.reason'),
        sortable: true,
        hideable: true,
        cell: (m) => (
          <div className="flex items-center gap-2 uppercase font-black text-xs tracking-widest text-brand-cyan">
            <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
            {reasonLabel(m.reason, t)}
          </div>
        ),
      },
      {
        key: 'ref',
        header: t('admin.movements.table.ref'),
        sortable: true,
        hideable: true,
        cell: (m) =>
          m.order_id ? (
            <span className="bg-white/5 px-2 py-1 rounded border border-white/5 font-black font-mono text-white/60 text-xs uppercase tracking-hvac-tight">
              {`#${m.order_id.slice(-8).toUpperCase()}`}
            </span>
          ) : (
            <span className="font-black font-mono text-white/60 text-xs">-</span>
          ),
      },
    ],
    [t, lang],
  )

  /* reason chip'leri (AdminToolbar.chips) */
  const reasonChips = useMemo(
    () =>
      ALL_REASONS.map((r) => ({
        key: r,
        label: reasonLabel(r, t),
        active: activeReasons.includes(r),
        onToggle: () => {
          const next = activeReasons.includes(r)
            ? activeReasons.filter((x) => x !== r)
            : [...activeReasons, r]
          setFilter('reason', next)
        },
      })),
    [t, activeReasons, setFilter],
  )

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('admin.movements.toolbar.allCategories') },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories, t],
  )

  return (
    <div className="space-y-6">
      {batchVal && (
        <div className="p-4 glass-strong border border-amber-500/20 rounded-2xl text-sm text-amber-400 flex items-center justify-between">
          <span className="font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('admin.movements.batchFilterPrefix')}{' '}
            <span className="font-mono text-white ml-1 tracking-wider">{batchVal}</span>
          </span>
          <button
            type="button"
            className={`${adminTableActionWarningClass}`}
            onClick={() => setFilter('batch', [])}
          >
            {t('admin.ui.clear')}
          </button>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="movements"
        hasWriteAccess={false}
        totalLabel={t('admin.ui.total')}
        emptyState={
          <AdminEmptyState icon={PackageMinus} title={t('admin.movements.emptyTitle')} description={t('admin.movements.emptyDescription')} />
        }
        filterEmptyState={
          <AdminEmptyState icon={SearchX} title={t('admin.movements.emptyTitle')} description={t('admin.movements.filterEmptyDescription')} />
        }
        columnsButtonLabel={t('admin.common.view')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:movements"
            search={{ value: table.filtering.query, onChange: setQuery, placeholder: t('admin.search.movements'), focusShortcut: '/' }}
            select={{
              value: categoryVal,
              onChange: (v) => setFilter('category', v ? [v] : []),
              title: t('admin.movements.toolbar.categoryTitle'),
              options: categoryOptions,
            }}
            chips={reasonChips}
            onClear={resetFilters}
            recordCount={table.totalMatched}
            rightExtra={
              <div className="flex items-center gap-2">
                <DateRangePicker value={dateRange} onChange={onDateChange} />
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.movements.export.csvLabel'), onSelect: () => void exportCsv() },
                    { key: 'xls', label: t('admin.movements.export.xlsLabel'), onSelect: () => void exportXls() },
                  ]}
                />
              </div>
            }
          />
        }
      />
    </div>
  )
}

export default MovementsTableBody
