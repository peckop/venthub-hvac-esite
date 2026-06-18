'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { PackageSearch, SearchX } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminToolbar from '@/components/admin/AdminToolbar'
import BulkBar, { type BulkAction } from '@/components/admin/data-table/BulkBar'
import { DataTableKit } from '@/components/admin/data-table/DataTableKit'
import type { AdminColumn } from '@/components/admin/data-table/types'
import ExportMenu from '@/components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '@/hooks/useAdminTable'
import { useRole } from '@/hooks/useRole'
import { formatDateTime } from '@/i18n/datetime'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { ensureSessionFresh } from '@/lib/ensureSessionFresh'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import {
  adminCardClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
} from '@/utils/adminUi'

interface LogisticsRow {
  id: string
  order_number: string
  customer_name: string
  created_at: string
  carrier: string
  tracking_number: string
  saved: boolean
}

const HASH = '#'
const LOGISTICS_SELECT = 'id,order_number,customer_name,created_at,carrier,tracking_number'

const SORT_COLUMN_MAP: Record<string, string> = {
  order_number: 'order_number',
  customer_name: 'customer_name',
  created_at: 'created_at',
}

function generateTrackingUrl(carrier: string, tracking: string): string | null {
  const c = (carrier || '').toLowerCase()
  if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo-takip?KargoTakipNo=${tracking}`
  if (c.includes('mng')) return `https://www.mngkargo.com.tr/gonderitakip?takipNo=${tracking}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${tracking}`
  return null
}

async function logisticsFetcher(
  supabaseClient: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<LogisticsRow>> {
  await ensureSessionFresh()

  let query = supabaseClient
    .from('view_admin_orders')
    .select(LOGISTICS_SELECT, { count: 'exact' })
    .in('status', ['confirmed', 'processing'])
    .is('shipped_at', null)

  const q = params.query.trim()
  if (q) {
    query = query.ilike('search_text', `%${q}%`)
  }

  const sortKey = params.sort?.key
  const col = sortKey ? SORT_COLUMN_MAP[sortKey] : undefined
  const ascending = params.sort?.dir === 'asc'
  if (col) {
    query = query.order(col, { ascending })
  } else {
    query = query.order('created_at', { ascending: true })
  }

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error

  const rows: LogisticsRow[] = (data || []).map((r) => ({
    id: String(r.id),
    order_number: String(r.order_number || (r.id as string).substring(0, 8)),
    customer_name: String(r.customer_name || ''),
    created_at: String(r.created_at),
    carrier: String(r.carrier || 'Yurtiçi'),
    tracking_number: String(r.tracking_number || ''),
    saved: false,
  }))

  return { rows, totalMatched: typeof count === 'number' ? count : 0 }
}

const AdminLogisticsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('logistics')

  const [globalCarrier, setGlobalCarrier] = useState('Yurtiçi')
  const [drafts, setDrafts] = useState<Record<string, { carrier: string; tracking_number: string }>>({})
  const [saving, setSaving] = useState(false)

  const table = useAdminTable<LogisticsRow>({
    resource: 'logistics',
    rowId: (r) => r.id,
    fetcher: logisticsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: 50,
    initialSort: { key: 'created_at', dir: 'asc' },
    syncUrl: true,
  })

  const { setQuery } = table.filtering

  const updateRowDraft = useCallback((id: string, field: 'carrier' | 'tracking_number', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        carrier: field === 'carrier' ? value : (prev[id]?.carrier ?? 'Yurtiçi'),
        tracking_number: field === 'tracking_number' ? value : (prev[id]?.tracking_number ?? ''),
      },
    }))
  }, [])

  const applyGlobalCarrier = useCallback(() => {
    setDrafts((prev) => {
      const next = { ...prev }
      for (const r of table.rows) {
        next[r.id] = {
          carrier: globalCarrier,
          tracking_number: prev[r.id]?.tracking_number ?? r.tracking_number ?? '',
        }
      }
      return next
    })
    toast.success(t('admin.logistics.toasts.appliedToAll'))
  }, [table.rows, globalCarrier, t])

  const handleBulkSubmit = useCallback(async () => {
    const selectedIds = table.selection.selectedIds
    const targets = table.rows.filter((r) => {
      const tracking = drafts[r.id]?.tracking_number ?? r.tracking_number ?? ''
      return selectedIds.includes(r.id) && tracking.trim() !== ''
    })

    if (targets.length === 0) {
      toast.error(t('admin.logistics.toasts.noNewTracking'))
      return
    }

    setSaving(true)
    let errCount = 0
    try {
      const results = await mutateWithAudit(supabase, {
        resource: 'logistics',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { status: 'shipped', ids: targets.map((r) => r.id) },
        auditedByEdge: false,
        fn: async () => {
          return await Promise.all(
            targets.map(async (row) => {
              const currentCarrier = drafts[row.id]?.carrier ?? row.carrier ?? 'Yurtiçi'
              const currentTracking = drafts[row.id]?.tracking_number ?? row.tracking_number ?? ''
              const turl = generateTrackingUrl(currentCarrier, currentTracking)
              const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
                body: {
                  order_id: row.id,
                  carrier: currentCarrier.trim(),
                  tracking_number: currentTracking.trim(),
                  tracking_url: turl,
                  send_email: true,
                },
              })
              return { id: row.id, ok: !fnErr }
            }),
          )
        },
      })

      const successfulIds: string[] = []
      results.forEach((res) => {
        if (res.ok) {
          successfulIds.push(res.id)
        } else {
          errCount++
        }
      })

      setDrafts((prev) => {
        const next = { ...prev }
        successfulIds.forEach((id) => {
          delete next[id]
        })
        return next
      })

      if (errCount > 0) {
        toast.error(t('admin.logistics.toasts.bulkUpdateFailed', { count: errCount }))
      } else {
        toast.success(t('admin.logistics.toasts.bulkUpdateSuccess', { count: targets.length }))
      }

      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.logistics.toasts.noPermission')
          : t('admin.logistics.toasts.criticalError'),
      )
    } finally {
      setSaving(false)
    }
  }, [table, drafts, hasWriteAccess, t])

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['order_number', 'customer_name', 'created_at', 'carrier', 'tracking_number']
    const header = cols.map((c) => t(`admin.logistics.table.${c === 'order_number' ? 'order' : c === 'customer_name' ? 'customer' : c === 'created_at' ? 'date' : c === 'tracking_number' ? 'tracking' : c === 'carrier' ? 'carrier' : c}`)).join(',')
    const lines = rows.map((r) => {
      const currentCarrier = drafts[r.id]?.carrier ?? r.carrier ?? 'Yurtiçi'
      const currentTracking = drafts[r.id]?.tracking_number ?? r.tracking_number ?? ''
      return [
        r.order_number || '',
        `"${(r.customer_name || '').replace(/"/g, '""')}"`,
        r.created_at || '',
        `"${currentCarrier.replace(/"/g, '""')}"`,
        `"${currentTracking.replace(/"/g, '""')}"`,
      ].join(',')
    })
    const csv = '﻿' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'logistics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table, drafts, t])

  const columns = useMemo<AdminColumn<LogisticsRow>[]>(
    () => [
      {
        key: 'order_number',
        header: t('admin.logistics.table.order'),
        sortable: true,
        cell: (r) => (
          <span className="bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 font-mono text-xs font-black text-cyan-400">
            {HASH}{r.order_number}
          </span>
        ),
      },
      {
        key: 'customer_name',
        header: t('admin.logistics.table.customer'),
        sortable: true,
        cell: (r) => (
          <span className="font-black text-slate-100 uppercase tracking-tight">
            {r.customer_name || '-'}
          </span>
        ),
      },
      {
        key: 'created_at',
        header: t('admin.logistics.table.date'),
        sortable: true,
        cell: (r) => (
          <span className="text-xs font-bold text-slate-400">
            {formatDateTime(r.created_at, lang)}
          </span>
        ),
      },
      {
        key: 'carrier',
        header: t('admin.logistics.table.carrier'),
        sortable: false,
        cell: (r) => {
          const currentCarrier = drafts[r.id]?.carrier ?? r.carrier ?? 'Yurtiçi'
          return (
            <div className="relative min-w-140px">
              <select
                disabled={!hasWriteAccess || saving}
                value={currentCarrier}
                onChange={(e) => updateRowDraft(r.id, 'carrier', e.target.value)}
                className={`${adminSelectClass} !py-2 !text-xs !rounded-xl !bg-surface-deep/60 disabled:opacity-40`}
                style={adminSelectStyle}
              >
                <option value="Yurtiçi">{t('admin.logistics.carriers.yurtici')}</option>
                <option value="Aras">{t('admin.logistics.carriers.aras')}</option>
                <option value="MNG">{t('admin.logistics.carriers.mng')}</option>
                <option value="PTT">{t('admin.logistics.carriers.ptt')}</option>
                <option value="UPS">{t('admin.logistics.carriers.ups')}</option>
              </select>
            </div>
          )
        },
      },
      {
        key: 'tracking_number',
        header: t('admin.logistics.table.tracking'),
        sortable: false,
        cell: (r) => {
          const currentTracking = drafts[r.id]?.tracking_number ?? r.tracking_number ?? ''
          return (
            <input
              type="text"
              disabled={!hasWriteAccess || saving}
              value={currentTracking}
              onChange={(e) => updateRowDraft(r.id, 'tracking_number', e.target.value)}
              placeholder={t('admin.orders.modals.shipping.trackingPlaceholder')}
              className={`${adminInputClass} !py-2 !text-xs !rounded-xl !bg-surface-deep/60 !font-mono focus:!bg-white/3 disabled:opacity-40`}
            />
          )
        },
      },
    ],
    [t, lang, hasWriteAccess, saving, drafts, updateRowDraft],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
  }, [setQuery])

  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'ship',
        label: t('admin.logistics.shipOrders'),
        tone: 'default',
        onRun: handleBulkSubmit,
      },
    ],
    [t, handleBulkSubmit],
  )

  return (
    <div className="space-y-6">
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="logistics"
        hasWriteAccess={hasWriteAccess}
        totalLabel={t('admin.ui.total')}
        emptyState={
          <AdminEmptyState
            icon={PackageSearch}
            title={t('admin.orders.states.noRecords')}
            description={t('admin.common.noResults')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.orders.states.noRecords')}
            description={t('admin.common.noResults')}
          />
        }
        columnsButtonLabel={t('admin.common.view')}
        toolbarSlot={
          <div className="space-y-6">
            <div className={`${adminCardClass} p-8 flex flex-col md:flex-row md:items-end gap-6 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

              <div className="flex-1 space-y-3 relative z-10">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1">
                  {t('admin.orders.modals.shipping.carrierLabel')}
                </label>
                <div className="relative max-w-xs">
                  <select
                    value={globalCarrier}
                    onChange={(e) => setGlobalCarrier(e.target.value)}
                    className={adminSelectClass}
                    style={adminSelectStyle}
                  >
                    <option value="Yurtiçi">{t('admin.logistics.carriers.yurtici')}</option>
                    <option value="Aras">{t('admin.logistics.carriers.aras')}</option>
                    <option value="MNG">{t('admin.logistics.carriers.mng')}</option>
                    <option value="PTT">{t('admin.logistics.carriers.ptt')}</option>
                    <option value="UPS">{t('admin.logistics.carriers.ups')}</option>
                  </select>
                </div>
              </div>
              {hasWriteAccess && (
                <button
                  onClick={applyGlobalCarrier}
                  className="h-12 px-8 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-transform active:scale-95 relative z-10"
                >
                  {t('admin.logistics.applyToAll')}
                </button>
              )}
            </div>

            <AdminToolbar
              storageKey="toolbar:logistics"
              sticky
              search={{
                value: table.filtering.query,
                onChange: setQuery,
                placeholder: t('admin.logistics.searchPlaceholder'),
                focusShortcut: '/',
              }}
              onClear={resetFilters}
              recordCount={table.totalMatched}
              rightExtra={
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.products.export.csvLabel'), onSelect: () => void exportCsv() },
                  ]}
                />
              }
            />
          </div>
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkBar
              selectedCount={table.selection.selectedIds.length}
              selectedLabel={t('admin.orders.bulk.selected', { count: table.selection.selectedIds.length })}
              clearLabel={t('admin.orders.bulk.clearSelection')}
              actions={bulkActions}
              onClear={table.selection.clear}
            />
          ) : null
        }
      />
    </div>
  )
}

export default AdminLogisticsTableBody
