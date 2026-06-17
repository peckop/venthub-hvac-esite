'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Bug, SearchX } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useTenant } from '../../hooks/useTenant'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import { adminInputClass, adminSelectClass, adminSelectStyle } from '../../utils/adminUi'

/* ---- model ---- */
interface ErrorRow {
  id: string
  at: string
  url?: string | null
  message: string
  stack?: string | null
  user_agent?: string | null
  release?: string | null
  env?: string | null
  level?: string | null
}

/* ---- fetcher: server-mode (range + count + filter, params'tan) ---- */
async function errorsFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<ErrorRow>> {
  const level = params.filters.level?.[0]
  const env = params.filters.env?.[0]
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]

  let query = supabase
    .from('client_errors')
    .select('id, at, url, message, stack, user_agent, release, env, level', { count: 'exact' })

  const sortKey = params.sort?.key ?? 'at'
  query = query.order(sortKey, { ascending: params.sort?.dir === 'asc' })

  if (from) query = query.gte('at', `${from}T00:00:00Z`)
  if (to) query = query.lte('at', `${to}T23:59:59Z`)
  if (level) query = query.eq('level', level)
  if (env) query = query.eq('env', env)
  if (params.query) {
    const like = `%${params.query}%`
    query = query.or(`url.ilike.${like},message.ilike.${like}`)
  }

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error
  return { rows: (data ?? []) as ErrorRow[], totalMatched: typeof count === 'number' ? count : 0 }
}

const ErrorsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { id: tenantId } = useTenant()

  // Varsayılan pencere: son 7 gün (bugün dahil), env=production — bir kez hesaplanır
  const { defaultFrom, defaultTo } = useMemo(() => {
    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const now = new Date()
    return {
      defaultTo: fmt(now),
      defaultFrom: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)),
    }
  }, [])

  const initialFilters = useMemo<Record<string, string[]>>(
    () => ({ env: ['production'], from: [defaultFrom], to: [defaultTo] }),
    [defaultFrom, defaultTo],
  )

  const table = useAdminTable<ErrorRow>({
    resource: 'errors',
    rowId: (r) => r.id,
    fetcher: errorsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    initialSort: { key: 'at', dir: 'desc' },
    initialFilters,
    syncUrl: true,
  })

  // Realtime: client_errors değişiminde debounce'lu reload
  const reloadRef = useRef(table.reload)
  reloadRef.current = table.reload
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const ch = supabaseBrowserClient
      .channel(`client-errors-${tenantId}`, { config: { private: true } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_errors' }, () => {
        if (refetchTimer.current) clearTimeout(refetchTimer.current)
        refetchTimer.current = setTimeout(() => void reloadRef.current(), 400)
      })
      .subscribe()
    return () => {
      supabaseBrowserClient.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [tenantId])

  /* ---- filtre kısayolları (kit filters Record üzerinden) ---- */
  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const levelVal = filters.level?.[0] ?? ''
  const envVal = filters.env?.[0] ?? ''
  const fromVal = filters.from?.[0] ?? ''
  const toVal = filters.to?.[0] ?? ''

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('level', [])
    setFilter('env', ['production'])
    setFilter('from', [defaultFrom])
    setFilter('to', [defaultTo])
  }, [setQuery, setFilter, defaultFrom, defaultTo])

  /* ---- export (CSV, tüm filtreli sonuç fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const header = [
      t('admin.errors.export.headers.id'),
      t('admin.errors.export.headers.at'),
      t('admin.errors.export.headers.level'),
      t('admin.errors.export.headers.message'),
      t('admin.errors.export.headers.url'),
      t('admin.errors.export.headers.userAgent'),
      t('admin.errors.export.headers.release'),
      t('admin.errors.export.headers.env'),
    ].join(',')

    const lines = rows.map((r) =>
      [
        r.id,
        r.at,
        r.level || 'error',
        `"${(r.message || '').replace(/"/g, '""')}"`,
        `"${(r.url || '').replace(/"/g, '""')}"`,
        `"${(r.user_agent || '').replace(/"/g, '""')}"`,
        `"${(r.release || '').replace(/"/g, '""')}"`,
        `"${(r.env || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    const csv = '\ufeff' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t('admin.errors.export.filename')
    a.click()
    URL.revokeObjectURL(url)
  }, [table, t])

  // env seçenekleri — etiketler JS ifadesi (JSX-literal değil); 'env' adları teknik (çeviri yok)
  const envOptions = useMemo(
    () => [
      { value: 'production', label: 'production' },
      { value: 'preview', label: 'preview' },
      { value: 'development', label: 'development' },
      { value: '', label: `(${t('admin.ui.all')})` },
    ],
    [t],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<ErrorRow>[]>(
    () => [
      {
        key: 'at',
        header: t('admin.errors.table.date'),
        sortable: true,
        cell: (r) => (
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
            {formatDateTime(r.at, lang as 'tr' | 'en')}
          </span>
        ),
      },
      {
        key: 'level',
        header: t('admin.errors.table.level'),
        sortable: true,
        cell: (r) => (
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
              r.level === 'error'
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                : r.level === 'warn'
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                  : 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20'
            }`}
          >
            {r.level || 'error'}
          </span>
        ),
      },
      {
        key: 'message',
        header: t('admin.errors.table.message'),
        cell: (r) => <span className="text-slate-200 text-xs">{r.message}</span>,
      },
      {
        key: 'url',
        header: t('admin.errors.table.url'),
        hideable: true,
        cell: (r) => <span className="text-slate-500 text-xs font-mono">{r.url || '-'}</span>,
      },
    ],
    [t, lang],
  )

  return (
    <DataTableKit
      columns={columns}
      table={table}
      rowId={(r) => r.id}
      persistKey="errors"
      hasWriteAccess={false}
      emptyState={<AdminEmptyState icon={Bug} title={t('admin.errors.emptyTitle')} description={t('admin.errors.emptyDescription')} />}
      filterEmptyState={
        <AdminEmptyState icon={SearchX} title={t('admin.errors.emptyTitle')} description={t('admin.errors.filterEmptyDescription')} />
      }
      columnsButtonLabel={t('admin.common.view')}
      expandLabel={t('admin.ui.details')}
      renderExpandedRow={(r) => (
        <div className="grid md:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="font-black text-slate-500 mb-3 uppercase tracking-widest">{t('admin.errors.labels.stack')}</div>
            <pre className="bg-surface-deep/80 text-amber-300/80 font-mono p-4 rounded-2xl border border-white/5 overflow-auto max-h-80 leading-relaxed custom-scrollbar">
              {String(r.stack || '').slice(0, 8000)}
            </pre>
          </div>
          <div className="space-y-6">
            <div>
              <div className="font-black text-slate-500 mb-3 uppercase tracking-widest">{t('admin.errors.detailsTitle')}</div>
              <div className="space-y-3 bg-surface-deep/40 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500 uppercase font-bold tracking-tighter">{t('admin.errors.labels.ua')}</span>
                  <span className="text-slate-300 font-mono text-xs text-right ml-4">{r.user_agent || '-'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500 uppercase font-bold tracking-tighter">{t('admin.errors.labels.release')}</span>
                  <span className="text-cyan-400 font-black tracking-widest">{r.release || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase font-bold tracking-tighter">{t('admin.errors.labels.env')}</span>
                  <span className="text-amber-400 font-black tracking-widest">{r.env || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      toolbarSlot={
        <AdminToolbar
          storageKey="toolbar:errors"
          search={{ value: table.filtering.query, onChange: setQuery, placeholder: t('admin.search.errors'), focusShortcut: '/' }}
          select={{
            value: levelVal,
            onChange: (v) => setFilter('level', v ? [v] : []),
            title: t('admin.errors.levelTitle'),
            options: [
              { value: '', label: t('admin.ui.all') },
              { value: 'error', label: 'error' },
              { value: 'warn', label: 'warn' },
              { value: 'info', label: 'info' },
            ],
          }}
          onClear={resetFilters}
          recordCount={table.totalMatched}
          rightExtra={
            <div className="flex items-center gap-2">
              <select
                value={envVal}
                onChange={(e) => setFilter('env', e.target.value ? [e.target.value] : [])}
                className={adminSelectClass}
                style={adminSelectStyle}
                aria-label={t('admin.errors.envTitle') as string}
                title={t('admin.errors.envTitle') as string}
              >
                {envOptions.map((o) => (
                  <option key={o.value || 'all'} value={o.value} className="bg-surface-deep">
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={fromVal}
                onChange={(e) => setFilter('from', e.target.value ? [e.target.value] : [])}
                className={adminInputClass}
                aria-label={t('admin.ui.startDate') as string}
                title={t('admin.ui.startDate') as string}
              />
              <input
                type="date"
                value={toVal}
                onChange={(e) => setFilter('to', e.target.value ? [e.target.value] : [])}
                className={adminInputClass}
                aria-label={t('admin.ui.endDate') as string}
                title={t('admin.ui.endDate') as string}
              />
              <ExportMenu
                items={[
                  { key: 'csv', label: t('admin.errors.export.csvLabel'), onSelect: () => void exportCsv() },
                ]}
              />
            </div>
          }
        />
      }
    />
  )
}

export default ErrorsTableBody
