'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { SearchX, ShieldAlert } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { useTenant } from '../../hooks/useTenant'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
  glassStrongClass,
} from '../../utils/adminUi'

/* ---- modeller ---- */
type ErrorStatus = 'open' | 'resolved' | 'ignored'

interface ErrorGroupRow {
  id: string
  signature: string
  level: string | null
  last_message: string | null
  url_sample: string | null
  env: string | null
  release: string | null
  first_seen: string
  last_seen: string
  count: number
  status: string
  assigned_to: string | null
  notes: string | null
}

interface AdminUserOpt {
  id: string
  email: string
  full_name: string | null
}

interface ClientErrorRow {
  id: string
  at: string
  url: string | null
  message: string
  stack: string | null
  user_agent: string | null
  release: string | null
  env: string | null
  level: string
}

const GROUP_SELECT =
  'id, signature, level, last_message, url_sample, env, release, first_seen, last_seen, count, status, assigned_to, notes'

const STATUS_VALUES: ErrorStatus[] = ['open', 'resolved', 'ignored']

function isErrorStatus(x: string): x is ErrorStatus {
  return x === 'open' || x === 'resolved' || x === 'ignored'
}

function userLabel(u: AdminUserOpt): string {
  return u.full_name ? `${u.full_name} <${u.email}>` : u.email
}

/* ---- fetcher: server-mode (range + count + filter, params'tan) ---- */
async function errorGroupsFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<ErrorGroupRow>> {
  const level = params.filters.level?.[0]
  const status = params.filters.status?.[0]
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]
  const assigned = params.filters.assigned?.[0]

  let query = supabase.from('error_groups').select(GROUP_SELECT, { count: 'exact' })

  const sortKey = params.sort?.key === 'count' ? 'count' : 'last_seen'
  query = query.order(sortKey, { ascending: params.sort?.dir === 'asc' })

  if (level) query = query.eq('level', level)
  if (status) query = query.eq('status', status)
  if (from) query = query.gte('last_seen', `${from}T00:00:00Z`)
  if (to) query = query.lte('last_seen', `${to}T23:59:59Z`)
  if (assigned === '__none__') query = query.is('assigned_to', null)
  else if (assigned) query = query.eq('assigned_to', assigned)
  if (params.query) {
    const like = `%${params.query}%`
    query = query.or(`signature.ilike.${like},last_message.ilike.${like}`)
  }

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error
  return { rows: (data ?? []) as ErrorGroupRow[], totalMatched: typeof count === 'number' ? count : 0 }
}

/* ---- lazy genişleyen satır: kit yalnız açıkken mount eder → mount'ta client_errors yükle ---- */
interface ExpandedRowProps {
  group: ErrorGroupRow
  users: AdminUserOpt[]
  hasWriteAccess: boolean
  onSaveNotes: (group: ErrorGroupRow, notes: string) => Promise<void>
}

function topN(arr: ClientErrorRow[], key: (e: ClientErrorRow) => string, n = 5): [string, number][] {
  const m = new Map<string, number>()
  for (const it of arr) {
    const k = key(it) || '-'
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

const ErrorGroupExpandedRow: React.FC<ExpandedRowProps> = ({ group, hasWriteAccess, onSaveNotes }) => {
  const { t, lang } = useI18n()
  const [errors, setErrors] = useState<ClientErrorRow[]>([])

  // kit yalnız genişlediğinde bu bileşeni mount eder → mount'ta lazy yükle
  useEffect(() => {
    let active = true
    void (async () => {
      const { data, error } = await supabaseBrowserClient
        .from('client_errors')
        .select('id, at, url, message, stack, user_agent, release, env, level')
        .eq('group_id', group.id)
        .order('at', { ascending: false })
        .limit(200)
      if (active && !error) setErrors((data ?? []) as ClientErrorRow[])
    })()
    return () => {
      active = false
    }
  }, [group.id])

  const aggregations = useMemo(
    () => [
      { title: t('admin.errorGroups.details.urlTitle'), items: topN(errors, (e) => String(e.url ?? '-')) },
      { title: t('admin.errorGroups.details.releaseTitle'), items: topN(errors, (e) => String(e.release ?? '-')) },
      { title: t('admin.errorGroups.details.envTitle'), items: topN(errors, (e) => String(e.env ?? '-')) },
      { title: t('admin.errorGroups.details.userAgentTitle'), items: topN(errors, (e) => String(e.user_agent ?? '-')) },
    ],
    [errors, t],
  )

  return (
    <div className="grid md:grid-cols-3 gap-6 text-xs">
      <div className="md:col-span-2">
        <div className="font-black text-slate-500 mb-3 uppercase tracking-widest">
          {t('admin.errorGroups.details.latest')}
        </div>
        <div className="space-y-3 max-h-80 overflow-auto overscroll-y-contain bg-surface-deep/40 p-4 rounded-2xl border border-white/5 custom-scrollbar">
          {errors.map((e) => (
            <div key={e.id} className="border-b border-white/5 last:border-b-0 pb-2">
              <div className="text-slate-500">
                {formatDateTime(e.at, lang as 'tr' | 'en')} • {e.level || 'error'}
              </div>
              <div className="text-slate-300 break-words">{e.message}</div>
              <div className="text-slate-500 break-all">{e.url || '-'}</div>
              {e.stack && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-slate-500">
                    {t('admin.errorGroups.details.stackSummary')}
                  </summary>
                  <pre className="text-xs overflow-auto max-h-40 text-amber-300/80 font-mono">
                    {String(e.stack).slice(0, 4000)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`group-notes-${group.id}`}
            className="block font-black text-slate-500 mb-2 uppercase tracking-widest"
          >
            {t('admin.errorGroups.details.notes')}
          </label>
          <textarea
            id={`group-notes-${group.id}`}
            disabled={!hasWriteAccess}
            defaultValue={group.notes ?? ''}
            onBlur={(ev) => void onSaveNotes(group, ev.target.value)}
            className={`${adminInputClass} !pl-4 w-full`}
            rows={6}
            placeholder={t('admin.errorGroups.details.notesPlaceholder')}
            aria-label={t('admin.errorGroups.details.notes')}
          />
        </div>

        <div>
          <div className="font-black text-slate-500 mb-2 uppercase tracking-widest">
            {t('admin.errorGroups.details.sampleUrl')}
          </div>
          <div className="text-xs break-all text-slate-400">{group.url_sample || '-'}</div>
        </div>

        <div>
          <div className="font-black text-slate-500 mb-2 uppercase tracking-widest">
            {t('admin.errorGroups.details.top5')}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {aggregations.map((block) => (
              <div key={block.title}>
                <div className="text-slate-500 font-bold mb-1">{block.title}</div>
                <ul className="space-y-1 list-disc pl-4">
                  {block.items.map(([k, c]) => {
                    const countStr = `(${c})`
                    return (
                      <li key={k} className="text-xs break-all">
                        <span className="text-slate-300">{k}</span> <span className="text-slate-500">{countStr}</span>
                      </li>
                    )
                  })}
                  {block.items.length === 0 && <li className="text-xs text-slate-500">-</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ErrorGroupsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { id: tenantId } = useTenant()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('error_groups')

  const table = useAdminTable<ErrorGroupRow>({
    resource: 'error_groups',
    rowId: (r) => r.id,
    fetcher: errorGroupsFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    initialSort: { key: 'last_seen', dir: 'desc' },
    pageSize: 50,
    syncUrl: true,
  })

  /* ---- atama için kullanıcı listesi (güvenli RPC ile, body'de yüklenir) ---- */
  const [users, setUsers] = useState<AdminUserOpt[]>([])
  useEffect(() => {
    let active = true
    void (async () => {
      const { data, error } = await supabaseBrowserClient.rpc('admin_list_users')
      if (active && !error && Array.isArray(data)) {
        setUsers(
          data.map((u) => ({ id: u.id, email: u.email, full_name: u.full_name ?? null })),
        )
      }
    })()
    return () => {
      active = false
    }
  }, [])

  /* ---- realtime: error_groups değişiminde debounce'lu reload (ErrorsTableBody aynası) ---- */
  const reloadRef = useRef(table.reload)
  reloadRef.current = table.reload
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const ch = supabaseBrowserClient
      .channel(`error-groups-${tenantId}`, { config: { private: true } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'error_groups' }, () => {
        if (refetchTimer.current) clearTimeout(refetchTimer.current)
        refetchTimer.current = setTimeout(() => void reloadRef.current(), 400)
      })
      .subscribe()
    return () => {
      supabaseBrowserClient.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [tenantId])

  /* ---- mutasyonlar: HEPSI mutateWithAudit kapısından (3 önceki audit boşluğu kapandı) ---- */
  const updateStatus = useCallback(
    async (row: ErrorGroupRow, next: string) => {
      if (!isErrorStatus(next) || row.status === next) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'error_groups',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { status: row.status },
          after: { status: next },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('error_groups').update({ status: next }).eq('id', row.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.errorGroups.toasts.statusUpdated'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.errorGroups.toasts.noPermission')
            : t('admin.errorGroups.toasts.failed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  const updateAssignedTo = useCallback(
    async (row: ErrorGroupRow, userId: string) => {
      const next = userId || null
      if ((row.assigned_to ?? null) === next) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'error_groups',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { assigned_to: row.assigned_to },
          after: { assigned_to: next },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient
              .from('error_groups')
              .update({ assigned_to: next })
              .eq('id', row.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.errorGroups.toasts.assignedUpdated'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.errorGroups.toasts.noPermission')
            : t('admin.errorGroups.toasts.failed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  const saveNotes = useCallback(
    async (row: ErrorGroupRow, notes: string) => {
      if ((row.notes ?? '') === notes) return // no-op: değişmediyse yazma
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'error_groups',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { notes: row.notes },
          after: { notes },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('error_groups').update({ notes }).eq('id', row.id)
            if (error) throw error
          },
        })
        toast.success(t('admin.errorGroups.toasts.notesSaved'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.errorGroups.toasts.noPermission')
            : t('admin.errorGroups.toasts.failed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  const bulkApplyStatus = useCallback(
    async (next: ErrorStatus) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'error_groups',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { status: next, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('error_groups').update({ status: next }).in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        toast.success(t('admin.errorGroups.toasts.bulkApplied'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.errorGroups.toasts.noPermission')
            : t('admin.errorGroups.toasts.failed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<ErrorGroupRow>[]>(
    () => [
      {
        key: 'last_seen',
        header: t('admin.errorGroups.table.lastSeen'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="font-black text-white tracking-widest uppercase text-xs">
            {formatDateTime(r.last_seen, lang as 'tr' | 'en')}
          </span>
        ),
      },
      {
        key: 'level',
        header: t('admin.errorGroups.table.level'),
        hideable: true,
        cell: (r) => (
          <span
            className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
              r.level === 'error'
                ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                : r.level === 'warn'
                  ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                  : 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
            }`}
          >
            {r.level || 'error'}
          </span>
        ),
      },
      {
        key: 'signature',
        header: t('admin.errorGroups.table.signature'),
        hideable: true,
        cell: (r) => {
          const idStr = `ID: ${r.id.slice(0, 8)}`
          return (
            <div className="flex flex-col gap-1">
              <span className="font-black text-slate-100 uppercase tracking-tight line-clamp-1">{r.signature}</span>
              <code className="text-xs font-black text-slate-500 uppercase tracking-widest opacity-60 font-mono">
                {idStr}
              </code>
            </div>
          )
        },
      },
      {
        key: 'last_message',
        header: t('admin.errorGroups.table.lastMsg'),
        hideable: true,
        cell: (r) => (
          <span className="text-slate-300 text-xs whitespace-normal break-words" title={r.last_message || ''}>
            {r.last_message || '-'}
          </span>
        ),
      },
      {
        key: 'count',
        header: t('admin.errorGroups.table.count'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (r) => (
          <span className="inline-flex items-center justify-center min-w-28px h-7 px-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-black border border-cyan-500/20">
            {r.count}
          </span>
        ),
      },
      {
        key: 'status',
        header: t('admin.errorGroups.table.status'),
        hideable: true,
        cell: (r) => (
          <select
            disabled={!hasWriteAccess}
            value={r.status}
            onChange={(e) => void updateStatus(r, e.target.value)}
            className={`${adminSelectClass} !pl-3 !py-1 !text-xs !h-8`}
            style={adminSelectStyle}
            aria-label={t('admin.errorGroups.table.status')}
          >
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s} className="bg-surface-deep">
                {s}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'assigned_to',
        header: t('admin.errorGroups.table.assigned'),
        hideable: true,
        cell: (r) => (
          <select
            disabled={!hasWriteAccess}
            value={r.assigned_to ?? ''}
            onChange={(e) => void updateAssignedTo(r, e.target.value)}
            className={`${adminSelectClass} !pl-3 !py-1 !text-xs !h-8`}
            style={adminSelectStyle}
            aria-label={t('admin.errorGroups.table.assigned')}
          >
            <option value="" className="bg-surface-deep">
              {t('admin.errorGroups.assigned.none')}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-surface-deep">
                {userLabel(u)}
              </option>
            ))}
          </select>
        ),
      },
    ],
    [t, lang, hasWriteAccess, users, updateStatus, updateAssignedTo],
  )

  /* ---- filtre kısayolları (kit filters Record üzerinden) ---- */
  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const levelVal = filters.level?.[0] ?? ''
  const statusVal = filters.status?.[0] ?? ''
  const assignedVal = filters.assigned?.[0] ?? ''
  const fromVal = filters.from?.[0] ?? ''
  const toVal = filters.to?.[0] ?? ''

  /* ---- CSV export (tüm filtreli sonuç, fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = [
      'id',
      'signature',
      'level',
      'last_message',
      'url_sample',
      'env',
      'release',
      'first_seen',
      'last_seen',
      'count',
      'status',
      'assigned_to',
      'notes',
    ]
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) =>
      [
        r.id,
        r.signature,
        r.level ?? '',
        r.last_message ?? '',
        r.url_sample ?? '',
        r.env ?? '',
        r.release ?? '',
        r.first_seen,
        r.last_seen,
        r.count,
        r.status,
        r.assigned_to ?? '',
        r.notes ?? '',
      ]
        .map(escape)
        .join(','),
    )
    const csv = '﻿' + [cols.map((c) => `"${c}"`).join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'error-groups.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

  /* ---- bulk action: panel = status select + Apply ---- */
  const [bulkStatus, setBulkStatus] = useState<ErrorStatus>('resolved')
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'apply-status',
        label: t('admin.errorGroups.bulk.statusTitle'),
        tone: 'default',
        panel: (close) => (
          <div className={`${glassStrongClass} rounded-2xl p-3 flex items-center gap-2`}>
            <select
              value={bulkStatus}
              onChange={(e) => {
                if (isErrorStatus(e.target.value)) setBulkStatus(e.target.value)
              }}
              className={`${adminSelectClass} !pl-3 !h-10`}
              style={adminSelectStyle}
              aria-label={t('admin.errorGroups.bulk.statusTitle')}
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s} className="bg-surface-deep">
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                void bulkApplyStatus(bulkStatus)
                close()
              }}
              className={`${adminButtonPrimaryClass} !h-10`}
            >
              {t('admin.errorGroups.bulk.apply')}
            </button>
          </div>
        ),
      },
    ],
    [t, bulkStatus, bulkApplyStatus],
  )

  return (
    <DataTableKit
      columns={columns}
      table={table}
      rowId={(r) => r.id}
      persistKey="errorGroups"
      hasWriteAccess={hasWriteAccess}
      emptyState={
        <AdminEmptyState
          icon={ShieldAlert}
          title={t('admin.errorGroups.emptyTitle')}
          description={t('admin.errorGroups.emptyDescription')}
        />
      }
      filterEmptyState={
        <AdminEmptyState
          icon={SearchX}
          title={t('admin.errorGroups.emptyTitle')}
          description={t('admin.errorGroups.filterEmptyDescription')}
        />
      }
      columnsButtonLabel={t('admin.common.view')}
      expandLabel={t('admin.ui.details')}
      renderExpandedRow={(r) => (
        <ErrorGroupExpandedRow group={r} users={users} hasWriteAccess={hasWriteAccess} onSaveNotes={saveNotes} />
      )}
      toolbarSlot={
        <AdminToolbar
          storageKey="toolbar:errorGroups"
          search={{
            value: table.filtering.query,
            onChange: setQuery,
            placeholder: t('admin.errorGroups.searchPlaceholder'),
            focusShortcut: '/',
          }}
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
          onClear={table.filtering.clearAll}
          recordCount={table.totalMatched}
          rightExtra={
            <div className="flex items-center gap-2">
              <select
                value={statusVal}
                onChange={(e) => setFilter('status', e.target.value ? [e.target.value] : [])}
                className={adminSelectClass}
                style={adminSelectStyle}
                aria-label={t('admin.errorGroups.filter.statusAll')}
                title={t('admin.errorGroups.filter.statusAll')}
              >
                <option value="" className="bg-surface-deep">
                  {t('admin.errorGroups.filter.statusAll')}
                </option>
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s} className="bg-surface-deep">
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={assignedVal}
                onChange={(e) => setFilter('assigned', e.target.value ? [e.target.value] : [])}
                className={adminSelectClass}
                style={adminSelectStyle}
                aria-label={t('admin.errorGroups.filter.assignedAll')}
                title={t('admin.errorGroups.filter.assignedAll')}
              >
                <option value="" className="bg-surface-deep">
                  {t('admin.errorGroups.filter.assignedAll')}
                </option>
                <option value="__none__" className="bg-surface-deep">
                  {t('admin.errorGroups.filter.unassigned')}
                </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-surface-deep">
                    {userLabel(u)}
                  </option>
                ))}
              </select>
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
                items={[{ key: 'csv', label: t('admin.errorGroups.export.csvLabel'), onSelect: () => void exportCsv() }]}
              />
            </div>
          }
        />
      }
      bulkBarSlot={
        hasWriteAccess ? (
          <BulkBar
            selectedCount={table.selection.selectedIds.length}
            selectedLabel={t('admin.errorGroups.bulk.selected', { count: table.selection.selectedIds.length })}
            clearLabel={t('admin.dataTable.bulk.clear')}
            actions={bulkActions}
            onClear={table.selection.clear}
          />
        ) : null
      }
    />
  )
}

export default ErrorGroupsTableBody
