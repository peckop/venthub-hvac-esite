'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Activity, CheckCircle2, Clock, Code, SearchX, XCircle } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'

import type { DbWebhookEvent } from '@/types/db-rows'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database, Json } from '../../types/database.types'
import { adminCardPaddedClass } from '../../utils/adminUi'

async function webhookEventsFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<DbWebhookEvent>> {
  let query = supabase
    .from('webhook_events' as never)
    .select('*', { count: 'exact' })

  const sortKey = params.sort?.key ?? 'created_at'
  const ascending = params.sort?.dir === 'asc'

  const colMap: Record<string, string> = {
    event_type: 'event_type',
    provider: 'provider',
    status: 'status',
    created_at: 'created_at',
  }
  const orderCol = colMap[sortKey] ?? 'created_at'
  query = query.order(orderCol, { ascending })

  if (params.query) {
    const like = `%${params.query}%`
    query = query.or(`event_type.ilike.${like},provider.ilike.${like}`)
  }

  const statusFilter = params.filters.status ?? []
  if (statusFilter.length > 0) {
    query = query.in('status', statusFilter)
  }

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)

  if (error) throw error

  const rows: DbWebhookEvent[] = (data || []).map((row) => {
    const r = row as Record<string, unknown>
    return {
      id: String(r.id || ''),
      event_type: String(r.event_type || ''),
      provider: String(r.provider || ''),
      status: (r.status === 'processed' || r.status === 'failed' || r.status === 'pending')
        ? (r.status as 'processed' | 'failed' | 'pending')
        : 'pending',
      payload: r.payload as Json,
      request_body: r.request_body as Json,
      response_body: r.response_body as Json,
      error_message: r.error_message ? String(r.error_message) : undefined,
      created_at: String(r.created_at || ''),
    }
  })

  return {
    rows,
    totalMatched: typeof count === 'number' ? count : 0,
  }
}

const WebhookEventsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const [selectedEvent, setSelectedEvent] = useState<DbWebhookEvent | null>(null)

  const table = useAdminTable<DbWebhookEvent>({
    resource: 'webhook_events',
    rowId: (r) => r.id,
    fetcher: webhookEventsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: 50,
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  const { setQuery, setFilter } = table.filtering
  const filters = table.filtering.filters
  const activeStatuses = useMemo(() => filters.status ?? [], [filters.status])

  const onRowClick = useCallback(
    (row: DbWebhookEvent) => {
      setSelectedEvent(row)
      table.selection.clear()
      table.selection.toggle(row.id)
    },
    [table.selection],
  )

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const header = [
      t('admin.webhooks.export.headers.id'),
      t('admin.webhooks.export.headers.eventType'),
      t('admin.webhooks.export.headers.source'),
      t('admin.webhooks.export.headers.status'),
      t('admin.webhooks.export.headers.date'),
      t('admin.webhooks.export.headers.errorMessage'),
    ].join(',')

    const lines = rows.map((r) =>
      [
        r.id,
        `"${(r.event_type || '').replace(/"/g, '""')}"`,
        `"${(r.provider || '').replace(/"/g, '""')}"`,
        r.status,
        r.created_at,
        `"${(r.error_message || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    const csv = '\ufeff' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t('admin.webhooks.export.filename')
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t])


  const columns = useMemo<AdminColumn<DbWebhookEvent>[]>(
    () => [
      {
        key: 'event_type',
        header: t('admin.webhooks.eventType'),
        sortable: true,
        cell: (e) => (
          <span className="font-bold text-admin-fg tracking-tight">
            {e.event_type}
          </span>
        ),
      },
      {
        key: 'provider',
        header: t('admin.webhooks.source'),
        sortable: true,
        cell: (e) => (
          <span className="text-admin-fg font-bold">
            {e.provider}
          </span>
        ),
      },
      {
        key: 'status',
        header: t('admin.webhooks.status'),
        sortable: true,
        cell: (e) => {
          switch (e.status) {
            case 'processed':
              return (
                <span className="flex items-center gap-1.5 text-admin-success font-semibold text-xs bg-admin-success-weak border border-admin-success/30 px-2.5 py-1.5 rounded-admin-md w-fit">
                  <CheckCircle2 size={12} strokeWidth={3} /> {t('admin.webhooks.statusProcessed')}
                </span>
              )
            case 'failed':
              return (
                <span className="flex items-center gap-1.5 text-admin-danger font-semibold text-xs bg-admin-danger-weak border border-admin-danger/30 px-2.5 py-1.5 rounded-admin-md w-fit">
                  <XCircle size={12} strokeWidth={3} /> {t('admin.webhooks.statusFailed')}
                </span>
              )
            default:
              return (
                <span className="flex items-center gap-1.5 text-admin-warning font-semibold text-xs bg-admin-warning-weak border border-admin-warning/30 px-2.5 py-1.5 rounded-admin-md w-fit">
                  <Clock size={12} strokeWidth={3} /> {t('admin.webhooks.statusPending')}
                </span>
              )
          }
        },
      },
      {
        key: 'created_at',
        header: t('admin.webhooks.date'),
        sortable: true,
        cell: (e) => (
          <span className="font-semibold text-admin-fg-muted text-xs">
            {formatDateTime(e.created_at, lang as 'tr' | 'en')}
          </span>
        ),
      },
    ],
    [t, lang],
  )

  const statusChips = useMemo(
    () => [
      {
        key: 'processed',
        label: t('admin.webhooks.statusProcessed'),
        active: activeStatuses.includes('processed'),
        onToggle: () => {
          const next = activeStatuses.includes('processed')
            ? activeStatuses.filter((s) => s !== 'processed')
            : [...activeStatuses, 'processed']
          setFilter('status', next)
        },
      },
      {
        key: 'failed',
        label: t('admin.webhooks.statusFailed'),
        active: activeStatuses.includes('failed'),
        onToggle: () => {
          const next = activeStatuses.includes('failed')
            ? activeStatuses.filter((s) => s !== 'failed')
            : [...activeStatuses, 'failed']
          setFilter('status', next)
        },
      },
      {
        key: 'pending',
        label: t('admin.webhooks.statusPending'),
        active: activeStatuses.includes('pending'),
        onToggle: () => {
          const next = activeStatuses.includes('pending')
            ? activeStatuses.filter((s) => s !== 'pending')
            : [...activeStatuses, 'pending']
          setFilter('status', next)
        },
      },
    ],
    [t, activeStatuses, setFilter],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('status', [])
  }, [setQuery, setFilter])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <DataTableKit
          columns={columns}
          table={table}
          rowId={(r) => r.id}
          persistKey="webhook_events"
          hasWriteAccess={false}
          totalLabel={t('admin.ui.total')}
          emptyState={
            <AdminEmptyState
              icon={Activity}
              title={t('admin.webhooks.noEvents')}
              description={t('admin.webhooks.noEventsDesc')}
            />
          }
          filterEmptyState={
            <AdminEmptyState
              icon={SearchX}
              title={t('admin.webhooks.noEvents')}
              description={t('admin.webhooks.filterEmptyDescription')}
            />
          }
          columnsButtonLabel={t('admin.common.view')}
          onRowClick={onRowClick}
          toolbarSlot={
            <AdminToolbar
              storageKey="toolbar:webhook_events"
              search={{
                value: table.filtering.query,
                onChange: setQuery,
                placeholder: t('admin.search.webhookEvents'),
                focusShortcut: '/',
              }}
              chips={statusChips}
              onClear={resetFilters}
              recordCount={table.totalMatched}
              rightExtra={
                <ExportMenu
                  items={[
                    {
                      key: 'csv',
                      label: t('admin.dataTable.export.csv'),
                      onSelect: () => void exportCsv(),
                    },
                  ]}
                />
              }
            />
          }

        />
      </div>

      <div className={adminCardPaddedClass}>
        <h3 className="text-lg font-bold text-admin-fg mb-4 flex items-center gap-2 tracking-wide">
          <Code size={18} className="text-admin-accent" />
          {t('admin.webhooks.eventDetail')}
        </h3>
        {selectedEvent ? (
          <div className="space-y-4">
            <div className="bg-admin-surface-2 rounded-admin-lg p-4 overflow-x-auto border border-admin-border">
              <pre className="text-xs text-admin-accent font-mono">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>
            {selectedEvent.error_message && (
              <div className="p-4 bg-admin-danger-weak border border-admin-danger/30 rounded-admin-lg">
                <p className="text-xs font-semibold text-admin-danger mb-2">
                  {t('admin.webhooks.errorMessage')}
                </p>
                <p className="text-xs text-admin-danger font-medium">{selectedEvent.error_message}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-admin-fg-muted text-sm font-bold italic">
            {t('admin.webhooks.selectEventToView')}
          </div>
        )}
      </div>
    </div>
  )
}

export default WebhookEventsTableBody
