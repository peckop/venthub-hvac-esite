'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { ClipboardList, Filter, SearchX, Terminal } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'

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
    const rows = await table.fetchAllForExport()
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
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest whitespace-nowrap">
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
            className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-colors ${
              r.action === 'INSERT'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : r.action === 'UPDATE'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  : r.action === 'DELETE'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {r.action}
          </span>
        ),
      },
      {
        key: 'table_name',
        header: t('admin.audit.colTable'),
        cell: (r) => <span className="text-slate-200 text-xs">{r.table_name}</span>,
      },
      {
        key: 'row_pk',
        header: t('admin.audit.colPk'),
        cell: (r) => <span className="text-slate-400 text-xs font-mono">{r.row_pk || '-'}</span>,
      },
      {
        key: 'comment',
        header: t('admin.audit.colNote'),
        cell: (r) => <span className="block max-w-xs truncate text-slate-300 text-xs">{r.comment || '-'}</span>,
      },
    ],
    [t, lang],
  )

  return (
    <div className="space-y-6">
      {batchVal && (
        <div className="glass-strong border border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">
              {t('admin.audit.filterBatch')} <span className="font-mono text-xs">{batchVal}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/admin/movements?batch=${batchVal}`}
              className={`${adminButtonSecondaryClass} !h-8 !px-3 font-black text-xs uppercase border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-colors`}
            >
              {t('admin.audit.viewMovements')}
            </a>
            <button
              type="button"
              onClick={clearBatch}
              className={`${adminButtonSecondaryClass} !h-8 !px-3 font-black text-xs uppercase border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-colors`}
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
              <Terminal size={14} className="text-cyan-400" />
              <div className="text-xs font-black text-cyan-400 uppercase tracking-hvac-normal">
                {t('admin.audit.details')}
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-surface-deep/60 p-1">
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
