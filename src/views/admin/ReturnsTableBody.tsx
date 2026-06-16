'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { CheckCircle, ChevronRight, Clock, Package, RefreshCw, SearchX, Truck, Undo2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { allowedNextStatuses } from '@/lib/admin/returnStatusMachine'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import { FacetedFilter } from '../../components/admin/data-table/FacetedFilter'
import type { AdminColumn, DataTableFacet } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDate, formatDateTime, formatTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { syncOrderFromReturn } from '../../lib/orderStatusService'
import type { Database } from '../../types/database.types'
import { adminTableActionPrimaryClass } from '../../utils/adminUi'

/* ---- modeller ---- */
interface ReturnRow {
  id: string
  order_id: string
  user_id: string
  reason: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  /* ---- venthub_orders join, satır-düzeyine düzleştirildi (client arama/sort/facet için) ---- */
  order_number: string | null
  customer_name: string | null
  customer_email: string | null
  total_amount: number | null
}

/** join satırının ham şekli (Supabase ilişkiyi obje VEYA tek-elemanlı dizi olarak döndürebilir). */
interface JoinedOrder {
  order_number: string | null
  customer_name: string | null
  customer_email: string | null
  total_amount: number | null
}
interface RawReturnRow {
  id: string
  order_id: string
  user_id: string
  reason: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  venthub_orders: JoinedOrder | JoinedOrder[] | null
}

/** join'i tek objeye indir (Supabase çoğul/tekil belirsizliğini güvenle çöz). */
function pickOrder(joined: JoinedOrder | JoinedOrder[] | null): JoinedOrder | null {
  if (Array.isArray(joined)) return joined[0] ?? null
  return joined
}

function flatten(row: RawReturnRow): ReturnRow {
  const order = pickOrder(row.venthub_orders)
  return {
    id: row.id,
    order_id: row.order_id,
    user_id: row.user_id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_number: order?.order_number ?? null,
    customer_name: order?.customer_name ?? null,
    customer_email: order?.customer_email ?? null,
    total_amount: order?.total_amount ?? null,
  }
}

const RETURNS_SELECT =
  'id, order_id, user_id, reason, description, status, created_at, updated_at, venthub_orders!inner(order_number, customer_name, customer_email, total_amount)'

const STATUS_VALUES = ['requested', 'approved', 'rejected', 'in_transit', 'received', 'refunded', 'cancelled'] as const

const EMPTY_DASH = '—'

/* ---- fetcher: client-mode (sayfa-bağımsız, limit 500) ---- */
async function returnsFetcher(
  supabase: SupabaseClient<Database>,
  _params: FetchParams,
): Promise<FetchResult<ReturnRow>> {
  await ensureSessionFresh()
  const { data, error } = await supabase
    .from('venthub_returns')
    .select(RETURNS_SELECT)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw error
  const raw: RawReturnRow[] = data ?? []
  const rows = raw.map(flatten)
  return { rows, totalMatched: rows.length }
}

function orderLabel(r: ReturnRow): string {
  if (r.order_number) return `#${r.order_number.split('-')[1] ?? r.order_number}`
  return `#${r.order_id.slice(-8).toUpperCase()}`
}

const ReturnsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const router = useRouter()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('returns')

  const table = useAdminTable<ReturnRow>({
    resource: 'returns',
    rowId: (r) => r.id,
    fetcher: returnsFetcher,
    paginationMode: 'none',
    sortMode: 'client',
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  /* ---- statü etiket/renk/ikon (eski sayfadan taşındı, i18n) ---- */
  const getStatusLabel = useCallback(
    (status: string): string => t(`admin.returns.statusLabels.${status}`),
    [t],
  )

  const getStatusIcon = useCallback((status: string): React.ReactNode => {
    switch (status) {
      case 'requested':
        return <Clock className="text-yellow-600" size={16} />
      case 'approved':
        return <CheckCircle className="text-green-600" size={16} />
      case 'rejected':
        return <XCircle className="text-red-600" size={16} />
      case 'in_transit':
        return <Truck className="text-blue-600" size={16} />
      case 'received':
        return <Package className="text-purple-600" size={16} />
      case 'refunded':
        return <CheckCircle className="text-green-700" size={16} />
      case 'cancelled':
        return <XCircle className="text-gray-600" size={16} />
      default:
        return <RefreshCw className="text-gray-400" size={16} />
    }
  }, [])

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'requested':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'rejected':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'in_transit':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'received':
        return 'bg-violet-500/10 text-violet-500 border-violet-500/20'
      case 'refunded':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'cancelled':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }, [])

  /* ---- statü güncelleme — TEK mutateWithAudit kapısı + durum-makinesi koruması ---- */
  const handleStatusUpdate = useCallback(
    async (row: ReturnRow, newStatus: string) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.returns.toasts.statusUpdateFailed'))
        return
      }
      // Durum-makinesi koruması: UI bypass edilse bile izinsiz (monoton olmayan) geçişi engelle.
      const allowed = allowedNextStatuses(row.status)
      if (!allowed.includes(newStatus)) return

      const oldStatus = row.status
      try {
        setUpdatingStatus(row.id)
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'returns',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { status: oldStatus },
          after: { status: newStatus },
          auditedByEdge: false,
          fn: async () => {
            // (1) asıl mutasyon — hata audit'i kapatır (gate)
            const { error } = await supabaseBrowserClient
              .from('venthub_returns')
              .update({ status: newStatus })
              .eq('id', row.id)
            if (error) throw error

            // (2) Orders senkronizasyonu — best-effort (kullanıcıyı bloklamaz)
            try {
              await syncOrderFromReturn(row.order_id, newStatus)
            } catch {
              /* swallow — orders sync hatası iade güncellemesini bloklamaz */
            }

            // (3) refunded → mock iade — best-effort
            if (newStatus === 'refunded') {
              try {
                await supabaseBrowserClient.functions.invoke('refund-order-mock', {
                  body: { order_id: row.order_id, reason: `return:${row.id}` },
                })
              } catch {
                /* swallow — mock iade hatası statüyü geri almaz */
              }
            }

            // (4) müşteri bildirimi — best-effort
            try {
              await supabaseBrowserClient.functions.invoke('return-status-notification', {
                body: {
                  _return_id: row.id,
                  order_id: row.order_id,
                  order_number: row.order_number,
                  customer_email: row.customer_email,
                  customer_name: row.customer_name,
                  old_status: oldStatus,
                  new_status: newStatus,
                  reason: row.reason,
                  description: row.description,
                },
              })
            } catch {
              /* swallow — e-posta hatası statüyü geri almaz */
            }
          },
        })
        toast.success(t('admin.returns.toasts.statusUpdated', { status: getStatusLabel(newStatus) }))
        await table.reload()
      } catch {
        toast.error(t('admin.returns.toasts.statusUpdateFailed'))
      } finally {
        setUpdatingStatus(null)
      }
    },
    [hasWriteAccess, t, getStatusLabel, table],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<ReturnRow>[]>(
    () => [
      {
        key: 'order_number',
        header: t('admin.returns.table.order'),
        sortable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => router.push(`/admin/orders?q=${r.order_number ?? r.order_id}`)}
              className="text-cyan-400 hover:text-cyan-300 font-black text-left transition-colors uppercase tracking-wider"
              aria-label={orderLabel(r)}
            >
              {orderLabel(r)}
            </button>
            {typeof r.total_amount === 'number' && (
              <span className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-px bg-white/10" />
                {formatCurrency(Number(r.total_amount), lang)}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'customer_name',
        header: t('admin.returns.table.customer'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-white uppercase tracking-tight">{r.customer_name}</span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{r.customer_email}</span>
          </div>
        ),
      },
      {
        key: 'reason',
        header: t('admin.returns.table.reason'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="max-w-xs space-y-1">
            <div className="font-black text-xs text-slate-200 uppercase tracking-wider">{r.reason}</div>
            {r.description && (
              <div
                className="text-xs font-bold text-slate-500 leading-relaxed truncate uppercase tracking-widest"
                title={r.description}
              >
                {r.description}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: t('admin.returns.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${getStatusColor(
              r.status,
            )}`}
          >
            {getStatusIcon(r.status)}
            {getStatusLabel(r.status)}
          </div>
        ),
      },
      {
        key: 'created_at',
        header: t('admin.returns.table.date'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-white tracking-widest text-xs uppercase">{formatDate(r.created_at, lang)}</span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              <span className="inline-block w-1.5 h-px bg-white/10 mr-1 align-middle" />
              {formatTime(r.created_at, lang)}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('admin.returns.table.actions'),
        cell: (r) => {
          const next = allowedNextStatuses(r.status)
          if (!hasWriteAccess || next.length === 0) {
            return <span className="text-xs text-slate-400">{EMPTY_DASH}</span>
          }
          return (
            <div className="flex gap-1.5">
              {next.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusUpdate(r, status)}
                  disabled={updatingStatus === r.id}
                  className={`${adminTableActionPrimaryClass} !px-3 !h-7 disabled:opacity-50 gap-1`}
                  title={t('admin.returns.actions.markAs', { status: getStatusLabel(status) })}
                  aria-label={t('admin.returns.actions.markAs', { status: getStatusLabel(status) })}
                >
                  {updatingStatus === r.id ? (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-xs font-black uppercase tracking-widest">{getStatusLabel(status)}</span>
                      <ChevronRight size={10} strokeWidth={3} />
                    </>
                  )}
                </button>
              ))}
            </div>
          )
        },
      },
    ],
    [t, lang, router, hasWriteAccess, updatingStatus, handleStatusUpdate, getStatusLabel, getStatusColor, getStatusIcon],
  )

  /* ---- status facet — count'lar filtre-öncesi allRows'tan ---- */
  const facets = useMemo<DataTableFacet[]>(() => {
    const counts = new Map<string, number>()
    for (const r of table.allRows) {
      counts.set(r.status, (counts.get(r.status) ?? 0) + 1)
    }
    return [
      {
        key: 'status',
        label: t('admin.returns.table.status'),
        options: STATUS_VALUES.map((value) => ({
          value,
          label: getStatusLabel(value),
          count: counts.get(value) ?? 0,
        })),
      },
    ]
  }, [table.allRows, t, getStatusLabel])

  /* ---- export (csv + xls) — fetchAllForExport, eski BOM/XLS builder'ları korur ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const header = [
      t('admin.returns.export.headers.order'),
      t('admin.returns.export.headers.customer'),
      t('admin.returns.export.headers.email'),
      t('admin.returns.export.headers.reason'),
      t('admin.returns.export.headers.status'),
      t('admin.returns.export.headers.date'),
      t('admin.returns.export.headers.amount'),
    ]
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) =>
      [
        orderLabel(r),
        r.customer_name ?? '',
        r.customer_email ?? '',
        r.reason ?? '',
        getStatusLabel(r.status),
        formatDateTime(r.created_at, lang),
        typeof r.total_amount === 'number' ? formatCurrency(Number(r.total_amount), lang) : '',
      ]
        .map(escape)
        .join(','),
    )
    const bom = '﻿'
    const csv = [header.map(escape).join(','), ...lines].join('\n')
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `returns_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t, lang, getStatusLabel])

  const exportXls = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const rowsHtml = rows
      .map((r) => {
        const amount = typeof r.total_amount === 'number' ? formatCurrency(Number(r.total_amount), lang) : ''
        return (
          `<tr>` +
          `<td>${orderLabel(r)}</td>` +
          `<td>${r.customer_name ?? ''}</td>` +
          `<td>${r.customer_email ?? ''}</td>` +
          `<td>${r.reason ?? ''}</td>` +
          `<td>${getStatusLabel(r.status)}</td>` +
          `<td>${formatDateTime(r.created_at, lang)}</td>` +
          `<td>${amount}</td>` +
          `</tr>`
        )
      })
      .join('')
    const htmlTable =
      `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div class="overflow-x-auto w-full">` +
      `<table class="max-md:text-xs" border="1"><thead><tr>` +
      `<th>${t('admin.returns.export.headers.order')}</th>` +
      `<th>${t('admin.returns.export.headers.customer')}</th>` +
      `<th>${t('admin.returns.export.headers.email')}</th>` +
      `<th>${t('admin.returns.export.headers.reason')}</th>` +
      `<th>${t('admin.returns.export.headers.status')}</th>` +
      `<th>${t('admin.returns.export.headers.date')}</th>` +
      `<th>${t('admin.returns.export.headers.amount')}</th>` +
      `</tr></thead><tbody>${rowsHtml}</tbody></table></div></body></html>`
    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `returns_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t, lang, getStatusLabel])

  return (
    <div className="space-y-6">
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="returns"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={Undo2}
            title={t('admin.returns.emptyTitle')}
            description={t('admin.returns.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.returns.emptyTitle')}
            description={t('admin.returns.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.returns.columnsButton')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:returns"
            search={{
              value: table.filtering.query,
              onChange: table.filtering.setQuery,
              placeholder: t('admin.returns.searchPlaceholder'),
              focusShortcut: '/',
            }}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
            rightExtra={
              <div className="flex items-center gap-2">
                {facets.map((facet) => (
                  <FacetedFilter
                    key={facet.key}
                    facet={facet}
                    selected={table.filtering.filters[facet.key] ?? []}
                    onChange={(values) => table.filtering.setFilter(facet.key, values)}
                    clearLabel={t('admin.dataTable.filter.clearAll')}
                  />
                ))}
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.returns.export.csvLabel'), onSelect: () => void exportCsv() },
                    { key: 'xls', label: t('admin.returns.export.xlsLabel'), onSelect: () => void exportXls() },
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

export default ReturnsTableBody
