'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { ClipboardList, Filter, SearchX, Terminal } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import JsonDiffViewer from '../../components/admin/JsonDiffViewer'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import { adminButtonSecondaryClass, adminInputClass } from '../../utils/adminUi'

/* ---- model ---- */
interface AuditRow {
  id: string
  at: string
  actor: string | null
  table_name: string
  row_pk: string | null
  action: string
  comment: string | null
  before: unknown
  after: unknown
}

/* ---- fetcher: server-mode (range + count + filter, params'tan) ---- */
async function auditFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<AuditRow>> {
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]
  const action = params.filters.action?.[0]
  const batch = params.filters.batch?.[0]

  let query = supabase
    .from('admin_audit_log')
    .select('id, at, actor, table_name, row_pk, action, comment, before, after', { count: 'exact' })

  const sortKey = params.sort?.key ?? 'at'
  query = query.order(sortKey, { ascending: params.sort?.dir === 'asc' })

  if (from) query = query.gte('at', `${from}T00:00:00Z`)
  if (to) query = query.lte('at', `${to}T23:59:59Z`)
  if (action) query = query.eq('action', action)
  if (params.query) {
    const like = `%${params.query}%`
    query = query.or(`table_name.ilike.${like},row_pk.ilike.${like},comment.ilike.${like}`)
  }
  if (batch) {
    query = query.or(`after->>batch_id.eq.${batch},comment.ilike.%${batch}%`)
  }

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error
  return { rows: (data ?? []) as AuditRow[], totalMatched: typeof count === 'number' ? count : 0 }
}

const AuditLogTableBody: React.FC = () => {
  const { t, lang } = useI18n()

  const table = useAdminTable<AuditRow>({
    resource: 'audit',
    rowId: (r) => r.id,
    fetcher: auditFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    initialSort: { key: 'at', dir: 'desc' },
    syncUrl: true,
  })

  /* ---- filtre kısayolları (kit filters Record üzerinden) ---- */
  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const actionVal = filters.action?.[0] ?? ''
  const fromVal = filters.from?.[0] ?? ''
  const toVal = filters.to?.[0] ?? ''
  const batchVal = filters.batch?.[0] ?? ''

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('action', [])
    setFilter('from', [])
    setFilter('to', [])
    setFilter('batch', [])
  }, [setQuery, setFilter])

  const clearBatch = useCallback(() => {
    setFilter('batch', [])
  }, [setFilter])

  /* ---- export (CSV, tüm filtreli sonuç fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    /*
      Faz 5 bulgusu: fetchAllForExport reddedilirse hata HİÇBİR yüzeye düşmüyordu
      (sessizce reddedilen promise). Görünür kılındı; kalıcı inline yüzeye taşıma
      O10 süpürmesinin (sonraki dalga) işi.
    */
    let rows: Awaited<ReturnType<typeof table.fetchAllForExport>>
    try {
      rows = await table.fetchAllForExport()
    } catch {
      toast.error(t('admin.audit.export.failed'))
      return
    }
    const header = [
      t('admin.audit.export.headers.id'),
      t('admin.audit.export.headers.at'),
      t('admin.audit.export.headers.actor'),
      t('admin.audit.export.headers.action'),
      t('admin.audit.export.headers.tableName'),
      t('admin.audit.export.headers.rowPk'),
      t('admin.audit.export.headers.comment'),
    ].join(',')

    const lines = rows.map((r) =>
      [
        r.id,
        r.at,
        `"${(r.actor || '').replace(/"/g, '""')}"`,
        r.action,
        r.table_name,
        `"${(r.row_pk || '').replace(/"/g, '""')}"`,
        `"${(r.comment || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    const csv = '\ufeff' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t('admin.audit.export.filename')
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<AuditRow>[]>(
    () => [
      {
        key: 'at',
        header: t('admin.audit.colDate'),
        sortable: true,
        cell: (r) => (
          <span className="text-admin-fg-muted text-xs font-semibold whitespace-nowrap">
            {formatDateTime(r.at, lang as 'tr' | 'en')}
          </span>
        ),
      },
      {
        key: 'action',
        header: t('admin.audit.colAction'),
        sortable: true,
        cell: (r) => (
          <span
            className={`px-2 py-0.5 rounded-admin-md text-xs font-semibold border transition-colors ${
              r.action === 'INSERT'
                ? 'bg-admin-success-weak text-admin-success border-admin-success/30'
                : r.action === 'UPDATE'
                  ? 'bg-admin-accent-weak text-admin-accent border-admin-accent/30'
                  : r.action === 'DELETE'
                    ? 'bg-admin-danger-weak text-admin-danger border-admin-danger/30'
                    : 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
            }`}
          >
            {r.action}
          </span>
        ),
      },
      {
        key: 'table_name',
        header: t('admin.audit.colTable'),
        cell: (r) => <span className="text-admin-fg text-xs">{r.table_name}</span>,
      },
      {
        key: 'row_pk',
        header: t('admin.audit.colPk'),
        cell: (r) => <span className="text-admin-fg-muted text-xs font-mono">{r.row_pk || '-'}</span>,
      },
      {
        key: 'comment',
        header: t('admin.audit.colNote'),
        cell: (r) => <span className="block max-w-xs truncate text-admin-fg text-xs">{r.comment || '-'}</span>,
      },
    ],
    [t, lang],
  )

  return (
    <div className="space-y-6">
      {batchVal && (
        <div className="bg-admin-surface border border-admin-warning/30 bg-admin-warning-weak p-4 rounded-admin-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-admin-warning" />
            <span className="text-xs font-semibold text-admin-warning">
              {t('admin.audit.filterBatch')} <span className="font-mono text-xs">{batchVal}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/admin/movements?batch=${batchVal}`}
              className={`${adminButtonSecondaryClass} !h-8 !px-3 font-semibold text-xs border-admin-warning/30 text-admin-warning hover:bg-admin-warning-weak transition-colors`}
            >
              {t('admin.audit.viewMovements')}
            </a>
            <button
              type="button"
              onClick={clearBatch}
              className={`${adminButtonSecondaryClass} !h-8 !px-3 font-semibold text-xs border-admin-warning/30 text-admin-warning hover:bg-admin-warning-weak transition-colors`}
            >
              {t('admin.audit.clear')}
            </button>
          </div>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="audit"
        hasWriteAccess={false}
        emptyState={
          <AdminEmptyState
            icon={ClipboardList}
            title={t('admin.audit.noRecords')}
            description={t('admin.audit.noRecordsDesc')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.audit.noRecords')}
            description={t('admin.audit.noRecordsDesc')}
          />
        }
        errorLabel={t('admin.audit.errorLoad')}
        columnsButtonLabel={t('admin.common.view')}
        totalLabel={t('admin.audit.history')}
        expandLabel={t('admin.ui.details')}
        renderExpandedRow={(r) => (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={14} className="text-admin-accent" />
              <div className="text-xs font-semibold text-admin-accent">
                {t('admin.audit.details')}
              </div>
            </div>
            <div className="rounded-admin-lg border border-admin-border bg-surface-deep/60 p-1">
              <JsonDiffViewer before={r.before} after={r.after} />
            </div>
          </div>
        )}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:audit"
            search={{
              value: table.filtering.query,
              onChange: setQuery,
              placeholder: t('admin.search.audit'),
              focusShortcut: '/',
            }}
            select={{
              value: actionVal,
              onChange: (v) => setFilter('action', v ? [v] : []),
              title: t('admin.audit.actionTitle'),
              options: [
                { value: '', label: t('admin.ui.all') },
                { value: 'INSERT', label: 'INSERT' },
                { value: 'UPDATE', label: 'UPDATE' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'CUSTOM', label: 'CUSTOM' },
              ],
            }}
            onClear={resetFilters}
            recordCount={table.totalMatched}
            rightExtra={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <input
                  type="date"
                  value={fromVal}
                  onChange={(e) => setFilter('from', e.target.value ? [e.target.value] : [])}
                  className={adminInputClass}
                  aria-label={t('admin.ui.startDate')}
                  title={t('admin.ui.startDate')}
                />
                <input
                  type="date"
                  value={toVal}
                  onChange={(e) => setFilter('to', e.target.value ? [e.target.value] : [])}
                  className={adminInputClass}
                  aria-label={t('admin.ui.endDate')}
                  title={t('admin.ui.endDate')}
                />
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.audit.export.csvLabel'), onSelect: () => void exportCsv() },
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

export default AuditLogTableBody
