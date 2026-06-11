 
import { ChevronDown, ChevronUp,ShieldAlert } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import { useDragScroll } from '../../hooks/useDragScroll'
import { useRole } from '../../hooks/useRole'
import { useTenant } from '../../hooks/useTenant'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import { 
  adminButtonPrimaryClass, 
  adminButtonSecondaryClass,
  adminCardClass, 
  adminInputClass,
  adminSectionTitleClass, 
  adminSelectClass,
  adminSelectStyle,
  adminTableCellClass, 
  adminTableHeadCellClass} from '../../utils/adminUi'
interface ErrorGroup {
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
  status: 'open' | 'resolved' | 'ignored'
  assigned_to: string | null
  notes: string | null
}

interface AdminUserOpt { id: string; email: string; full_name?: string | null }

interface ClientErrorRow {
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

const PAGE_SIZE = 50

const AdminErrorGroupsPage: React.FC = () => {
  const { id: tenantId } = useTenant()
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const dragScrollRef = useDragScroll<HTMLDivElement>()
  const hasWriteAccess = canWrite('error_groups')
  // Columns & density (like Inventory)
  const STORAGE_KEY = 'toolbar:errorgroups'
  const [visibleCols, setVisibleCols] = React.useState<{ lastSeen: boolean; level: boolean; signature: boolean; lastMsg: boolean; count: boolean; status: boolean; assigned: boolean; actions: boolean }>({ lastSeen: true, level: true, signature: true, lastMsg: true, count: true, status: true, assigned: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const c = localStorage.getItem(`${STORAGE_KEY}:cols`);
      if (c) setVisibleCols(prev => ({ ...prev, ...JSON.parse(c) }));
      const d = localStorage.getItem(`${STORAGE_KEY}:density`);
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
    } catch { }
  }, [])
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch { }
  }, [visibleCols])
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch { }
  }, [density])
  const headPad = density === 'compact' ? 'px-2 py-2' : ''
  const cellPad = density === 'compact' ? 'px-2 py-2' : ''
  const [rows, setRows] = React.useState<ErrorGroup[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // filters
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [level, setLevel] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [assigned, setAssigned] = React.useState<string>('') // ''=tümü, '__none__'=atanmamış, aksi halde user id

  const [users, setUsers] = React.useState<AdminUserOpt[]>([])
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [latestClientErrors, setLatestClientErrors] = React.useState<Record<string, ClientErrorRow[]>>({})
  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [bulkStatus, setBulkStatus] = React.useState<'open' | 'resolved' | 'ignored'>('resolved')
  const [savingBulk, setSavingBulk] = React.useState(false)

  // Sorting
  const [sortBy, setSortBy] = React.useState<'last_seen' | 'count'>('last_seen')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')
  const toggleSort = (by: 'last_seen' | 'count') => {
    setSortBy(prev => {
      if (prev === by) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      } else {
        // default direction per column
        setSortDir('desc')
        return by
      }
    })
  }

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  React.useEffect(() => {
    // load admin/moderator users for assignment via secure RPC
    ; (async () => {
      try {
        const { data, error } = await supabase.rpc('admin_list_users')
        if (!error && Array.isArray(data)) {
          const list = (data as Array<{ id: string; email: string; full_name?: string | null }>).map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name ?? null,
          })) as AdminUserOpt[]
          setUsers(list)
        }
      } catch { }
    })()
  }, [])

  const fetchGroups = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('error_groups')
        .select('id, signature, level, last_message, url_sample, env, release, first_seen, last_seen, count, status, assigned_to, notes', { count: 'exact' })
        .order(sortBy, { ascending: sortDir === 'asc' })

      if (fromDate) query = query.gte('last_seen', `${fromDate}T00:00:00Z`)
      if (toDate) query = query.lte('last_seen', `${toDate}T23:59:59Z`)
      if (level) query = query.eq('level', level)
      if (status) query = query.eq('status', status)
      if (assigned === '__none__') query = query.is('assigned_to', null)
      else if (assigned) query = query.eq('assigned_to', assigned)
      if (debouncedQ) {
        const like = `%${debouncedQ}%`
        query = query.or(`signature.ilike.${like},last_message.ilike.${like}`)
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error

      setRows((data || []) as ErrorGroup[])
      setTotal(typeof count === 'number' ? count : 0)
    } catch (e) {
      setError((e as Error).message || 'Yüklenemedi')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, level, status, assigned, debouncedQ, page, sortBy, sortDir])

  const pathname = usePathname()
  React.useEffect(() => { fetchGroups() }, [fetchGroups, pathname])

  // Keep a stable ref to fetchGroups so we don't have to re-subscribe the channel
  const fetchRef = React.useRef(fetchGroups)
  React.useEffect(() => { fetchRef.current = fetchGroups }, [fetchGroups])

  // Debounced refetch to avoid spamming on bursts
  const refetchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleRefetch = React.useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current)
    refetchTimer.current = setTimeout(() => {
      fetchRef.current()
    }, 400)
  }, [])

  // Realtime: refresh list on any change in error_groups
  React.useEffect(() => {
    const ch = supabase
      .channel(`error-groups-${tenantId}`, { config: { private: true } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'error_groups' }, () => {
        scheduleRefetch()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [scheduleRefetch, tenantId])

  const updateStatus = async (id: string, newStatus: 'open' | 'resolved' | 'ignored') => {
    const prev = rows
    const before = rows.find(r => r.id === id)?.status ?? null
    setRows(rs => rs.map(r => r.id === id ? { ...r, status: newStatus } : r))
    const { error } = await supabase.from('error_groups').update({ status: newStatus }).eq('id', id)
    if (error) {
      setRows(prev)
      return
    }
    // Audit log (hata UI'ı bloklamasın)
    try {
      const { logAdminAction } = await import('../../lib/audit')
      await logAdminAction(supabase, { table_name: 'error_groups', row_pk: id, action: 'UPDATE', before: { status: before }, after: { status: newStatus }, comment: 'hata grubu statu degisimi' })
    } catch { /* swallow */ }
  }

  const updateAssignedTo = async (id: string, userId: string | '') => {
    const val = userId || null
    const prev = rows
    setRows(rs => rs.map(r => r.id === id ? { ...r, assigned_to: val } : r))
    const { error } = await supabase.from('error_groups').update({ assigned_to: val }).eq('id', id)
    if (error) setRows(prev)
  }

  const updateNotes = async (id: string, notes: string) => {
    const prev = rows
    setRows(rs => rs.map(r => r.id === id ? { ...r, notes } : r))
    const { error } = await supabase.from('error_groups').update({ notes }).eq('id', id)
    if (error) setRows(prev)
  }

  const loadLatestClientErrors = async (groupId: string) => {
    try {
      const queryResult = await supabase.from('client_errors')
        .select('id, at, url, message, stack, user_agent, release, env, level')
        .eq('group_id', groupId)
        .order('at', { ascending: false })
        .limit(200)
      const { data, error }: { data: ClientErrorRow[] | null, error: unknown } = queryResult
      if (!error) setLatestClientErrors(prev => ({ ...prev, [groupId]: data || [] }))
    } catch { }
  }

  // CSV export (tüm filtrelere göre, 1000'erlik parça ile)
  const exportGroupsCsv = React.useCallback(async () => {
    const CHUNK = 1000
    let offset = 0
    let all: ErrorGroup[] = []
    // Aynı filtreleri uygulayan sorgu kurucu
    const makeQuery = () => {
      let q = supabase
        .from('error_groups')
        .select('id, signature, level, last_message, url_sample, env, release, first_seen, last_seen, count, status, assigned_to, notes')
      if (fromDate) q = q.gte('last_seen', `${fromDate}T00:00:00Z`)
      if (toDate) q = q.lte('last_seen', `${toDate}T23:59:59Z`)
      if (level) q = q.eq('level', level)
      if (status) q = q.eq('status', status)
      if (debouncedQ) {
        const like = `%${debouncedQ}%`
        q = q.or(`signature.ilike.${like},last_message.ilike.${like}`)
      }
      // Export’ta da geçerli sıralamayı koru
      q = q.order(sortBy, { ascending: sortDir === 'asc' })
      return q
    }
    try {
      for (; ;) {
        const from = offset
        const to = offset + CHUNK - 1
        const { data, error } = await makeQuery().range(from, to)
        if (error) throw error
        const chunk = (data || []) as ErrorGroup[]
        if (!chunk.length) break
        all = all.concat(chunk)
        if (chunk.length < CHUNK) break
        offset += CHUNK
      }
      const header = ['id', 'signature', 'level', 'last_message', 'url_sample', 'env', 'release', 'first_seen', 'last_seen', 'count', 'status', 'assigned_to', 'notes']
      const escape = (v: unknown) => {
        const s = (v ?? '').toString().replace(/"/g, '""')
        return `"${s}` + `"`
      }
      const rowsCsv = all.map(r => [r.id, r.signature, r.level || '', r.last_message || '', r.url_sample || '', r.env || '', r.release || '', r.first_seen, r.last_seen, r.count, r.status, r.assigned_to || '', r.notes || ''].map(escape).join(','))
      const csv = '\ufeff' + header.map(h => `"${h}"`).join(',') + '\n' + rowsCsv.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'error-groups.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('CSV export failed', e)
    }
  }, [fromDate, toDate, level, status, debouncedQ, sortBy, sortDir])

  const toggleSelect = (id: string, on: boolean) => {
    setSelectedIds(prev => on ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id))
  }

  const bulkApplyStatus = async () => {
    if (selectedIds.length === 0) return
    setSavingBulk(true)
    try {
      const { error } = await supabase.from('error_groups').update({ status: bulkStatus }).in('id', selectedIds)
      if (error) throw error
      setRows(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: bulkStatus } : r))
      setSelectedIds([])
    } catch (e) {
      console.error('bulk status error', e)
    } finally {
      setSavingBulk(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.errorGroups') ?? 'Hata Grupları'}</h1>

      <AdminToolbar
        storageKey="toolbar:errorGroups"
        search={{ value: q, onChange: setQ, placeholder: t('admin.errorGroups.searchPlaceholder'), focusShortcut: '/' }}
        select={{
          value: level, onChange: setLevel, title: t('admin.errors.levelTitle'), options: [
            { value: '', label: 'Tümü' },
            { value: 'error', label: 'error' },
            { value: 'warn', label: 'warn' },
            { value: 'info', label: 'info' },
          ]
        }}
        onClear={() => { setQ(''); setLevel(''); setStatus(''); setAssigned(''); setFromDate(''); setToDate(''); setPage(1); setSelectedIds([]) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              <option value="" className="bg-surface-deep">{t('admin.errorGroups.filter.statusAll')}</option>
              <option value="open" className="bg-surface-deep">open</option>
              <option value="resolved" className="bg-surface-deep">resolved</option>
              <option value="ignored" className="bg-surface-deep">ignored</option>
            </select>
            <select 
              value={assigned} 
              onChange={(e) => setAssigned(e.target.value)} 
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              <option value="" className="bg-surface-deep">{t('admin.errorGroups.filter.assignedAll')}</option>
              <option value="__none__" className="bg-surface-deep">{t('admin.errorGroups.filter.unassigned')}</option>
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-surface-deep">{u.full_name ? `${u.full_name} <${u.email}>` : u.email}</option>
              ))}
            </select>
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
              className={adminInputClass} 
              title={t('admin.ui.startDate') as string} 
            />
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
              className={adminInputClass} 
              title={t('admin.ui.endDate') as string} 
            />
            <ExportMenu items={[{ key: 'csv', label: t('admin.errorGroups.export.csvLabel'), onSelect: () => exportGroupsCsv() }]} />
            <ColumnsMenu
              density={density}
              onDensityChange={setDensity}
              columns={[
                { key: 'lastSeen', label: t('admin.errorGroups.table.lastSeen'), checked: visibleCols.lastSeen, onChange: (v) => setVisibleCols(prev => ({ ...prev, lastSeen: v })) },
                { key: 'level', label: t('admin.errorGroups.table.level'), checked: visibleCols.level, onChange: (v) => setVisibleCols(prev => ({ ...prev, level: v })) },
                { key: 'signature', label: t('admin.errorGroups.table.signature'), checked: visibleCols.signature, onChange: (v) => setVisibleCols(prev => ({ ...prev, signature: v })) },
                { key: 'lastMsg', label: t('admin.errorGroups.table.lastMsg'), checked: visibleCols.lastMsg, onChange: (v) => setVisibleCols(prev => ({ ...prev, lastMsg: v })) },
                { key: 'count', label: t('admin.errorGroups.table.count'), checked: visibleCols.count, onChange: (v) => setVisibleCols(prev => ({ ...prev, count: v })) },
                { key: 'status', label: t('admin.errorGroups.table.status'), checked: visibleCols.status, onChange: (v) => setVisibleCols(prev => ({ ...prev, status: v })) },
                { key: 'assigned', label: t('admin.errorGroups.table.assigned'), checked: visibleCols.assigned, onChange: (v) => setVisibleCols(prev => ({ ...prev, assigned: v })) },
                { key: 'actions', label: t('admin.errorGroups.table.actions'), checked: visibleCols.actions, onChange: (v) => setVisibleCols(prev => ({ ...prev, actions: v })) },
              ]}
            />
          </div>
        )}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 mb-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
          {t('admin.ui.prev')}
        </button>
        <span className="text-xs font-black text-white/40 uppercase tracking-hvac-normal bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
          {t('admin.ui.pageLabel', { page: String(page), pages: String(Math.max(1, Math.ceil(total / PAGE_SIZE))) })}
        </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
          {t('admin.ui.next')}
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className={adminCardClass + ' flex items-center justify-between'}>
          <div className="text-sm text-slate-500">{t('admin.errorGroups.bulk.selected', { count: selectedIds.length })}</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">{t('admin.errorGroups.bulk.statusTitle')}</label>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value as 'open' | 'resolved' | 'ignored')} 
              className={`${adminSelectClass} !h-10`}
              style={adminSelectStyle}
            >
              <option value="open" className="bg-surface-deep">open</option>
              <option value="resolved" className="bg-surface-deep">resolved</option>
              <option value="ignored" className="bg-surface-deep">ignored</option>
            </select>
            <button onClick={bulkApplyStatus} disabled={savingBulk || !hasWriteAccess} className={adminButtonPrimaryClass}>{savingBulk ? t('admin.ui.loadingShort') : t('admin.ui.apply')}</button>
            <button onClick={() => setSelectedIds([])} className={adminButtonSecondaryClass}>{t('admin.ui.clear')}</button>
          </div>
        </div>
      )}

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}

        {/* Main table wrapper: only horizontal scroll; prevent scroll chaining on X axis */}
        <div ref={dragScrollRef} className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="glass-strong sticky top-0 z-10">
              <tr>
                <th className={`${adminTableHeadCellClass} ${headPad} min-w-40px`}></th>
                {visibleCols.lastSeen && (
                  <th className={`${adminTableHeadCellClass} ${headPad} min-w-160px`}>
                    <button type="button" onClick={() => toggleSort('last_seen')} className="inline-flex items-center gap-1">
                      <span>{t('admin.errorGroups.table.lastSeen')}</span>
                      {sortBy === 'last_seen' && <span aria-hidden>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </button>
                  </th>
                )}
                {visibleCols.level && <th className={`${adminTableHeadCellClass} ${headPad} min-w-90px`}>{t('admin.errorGroups.table.level')}</th>}
                {visibleCols.signature && <th className={`${adminTableHeadCellClass} ${headPad} min-w-320px`}>{t('admin.errorGroups.table.signature')}</th>}
                {visibleCols.lastMsg && <th className={`${adminTableHeadCellClass} ${headPad} min-w-420px`}>{t('admin.errorGroups.table.lastMsg')}</th>}
                {visibleCols.count && (
                  <th className={`${adminTableHeadCellClass} ${headPad} min-w-80px`}>
                    <button type="button" onClick={() => toggleSort('count')} className="inline-flex items-center gap-1">
                      <span>{t('admin.errorGroups.table.count')}</span>
                      {sortBy === 'count' && <span aria-hidden>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </button>
                  </th>
                )}
                {visibleCols.status && <th className={`${adminTableHeadCellClass} ${headPad} min-w-120px`}>{t('admin.errorGroups.table.status')}</th>}
                {visibleCols.assigned && <th className={`${adminTableHeadCellClass} ${headPad} min-w-220px`}>{t('admin.errorGroups.table.assigned')}</th>}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} min-w-80px`}></th>}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminSkeleton variant="table" count={8} rows={5} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminEmptyState
                      icon={ShieldAlert}
                      title="Hata Grubu Bulunamadı"
                      description="Seçilen filtrelere uygun kaydedilmiş bir hata grubu görünmüyor."
                    />
                  </td>
                </tr>
              ) : (
                rows.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="border-t border-white/5 hover:bg-white/2 transition-colors group">
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => toggleSelect(r.id, e.target.checked)} />
                      </td>
                      {visibleCols.lastSeen && <td className={`${adminTableCellClass} font-black text-white tracking-widest uppercase`}>{formatDateTime(r.last_seen, lang)}</td>}
                      {visibleCols.level && <td className={`${adminTableCellClass}`}>
                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          r.level === 'error' ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' : 
                          r.level === 'warn' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 
                          'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
                        }`}>
                          {r.level || 'error'}
                        </span>
                      </td>}
                      {visibleCols.signature && <td className={`${adminTableCellClass}`}>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-slate-100 uppercase tracking-tight line-clamp-1">{r.signature}</span>
                          <code className="text-xs font-black text-slate-500 uppercase tracking-widest opacity-60">ID: {r.id.slice(0, 8)}</code>
                        </div>
                      </td>}
                      {visibleCols.lastMsg && <td className={`${adminTableCellClass} ${cellPad} max-w-modal whitespace-normal break-words`} title={r.last_message || ''}>{r.last_message || '-'}</td>}
                      {visibleCols.count && <td className={`${adminTableCellClass} text-center`}>
                        <span className="inline-flex items-center justify-center min-w-28px h-7 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-black border border-cyan-500/20">
                          {r.count}
                        </span>
                      </td>}
                      {visibleCols.status && <td className={`${adminTableCellClass} ${cellPad}`}>
                        <select
                          disabled={!hasWriteAccess}
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value as 'open' | 'resolved' | 'ignored')}
                          className={`${adminSelectClass} !py-1 !px-2 !text-xs !h-8`}
                          style={adminSelectStyle}
                        >
                          <option value="open" className="bg-surface-deep">open</option>
                          <option value="resolved" className="bg-surface-deep">resolved</option>
                          <option value="ignored" className="bg-surface-deep">ignored</option>
                        </select>
                      </td>}
                      {visibleCols.assigned && <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-2">
                          <select
                            disabled={!hasWriteAccess}
                            value={r.assigned_to || ''}
                            onChange={(e) => updateAssignedTo(r.id, e.target.value)}
                            className={`${adminSelectClass} !py-1 !px-2 !text-xs !h-8`}
                            style={adminSelectStyle}
                          >
                            <option value="" className="bg-surface-deep">{t('admin.errorGroups.assigned.none')}</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id} className="bg-surface-deep">{u.full_name ? `${u.full_name} <${u.email}>` : u.email}</option>
                            ))}
                          </select>
                        </div>
                      </td>}
                      {visibleCols.actions && <td className={`${adminTableCellClass}`}>
                        <button
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => {
                            setExpandedId(id => id === r.id ? null : r.id)
                            if (expandedId !== r.id) loadLatestClientErrors(r.id)
                          }}
                        >
                          {expandedId === r.id ? (
                            <>
                              <ChevronUp size={12} />
                              {t('admin.ui.hide')}
                            </>
                          ) : (
                            <>
                              <ChevronDown size={12} />
                              {t('admin.ui.details')}
                            </>
                          )}
                        </button>
                      </td>}
                    </tr>
                    {expandedId === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-3">
                          <div className="grid md:grid-cols-3 gap-3 text-xs">
                            <div className="md:col-span-2">
                              <div className="font-medium text-slate-500 mb-1">{t('admin.errorGroups.details.latest')}</div>
                              <div className="space-y-2 max-h-72 overflow-auto overscroll-y-contain bg-white p-2 rounded border">
                                {(latestClientErrors[r.id] || []).map((e: ClientErrorRow) => (
                                  <div key={e.id} className="border-b last:border-b-0 pb-1">
                                    <div className="text-slate-500">{formatDateTime(e.at, lang)} • {e.level || 'error'}</div>
                                    <div className="text-slate-500 break-words">{e.message}</div>
                                    <div className="text-slate-500 break-all">{e.url || '-'}</div>
                                    {e.stack && <details className="mt-1"><summary className="cursor-pointer">{t('admin.errorGroups.details.stackSummary')}</summary><pre className="text-xs overflow-auto max-h-40">{String(e.stack).slice(0, 4000)}</pre></details>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-500 mb-1">{t('admin.errorGroups.details.notes')}</div>
                              <textarea
                                disabled={!hasWriteAccess}
                                defaultValue={rows.find(x => x.id === r.id)?.notes || ''}
                                onBlur={(ev) => updateNotes(r.id, ev.target.value)}
                                className={`${adminInputClass} w-full`}
                                rows={7}
                                placeholder={t('admin.errorGroups.details.notesPlaceholder') as string}
                              />
                              <div className="font-medium text-slate-500 mb-1 mt-3">{t('admin.errorGroups.details.sampleUrl')}</div>
                              <div className="text-xs break-all">{r.url_sample || '-'}</div>
                              <div className="font-medium text-slate-500 mb-2 mt-3">{t('admin.errorGroups.details.top5')}</div>
                              {(() => {
                                const list = latestClientErrors[r.id] || []
                                const topN = (arr: ClientErrorRow[], key: (e: ClientErrorRow) => string, n = 5) => {
                                  const m = new Map<string, number>()
                                  for (const it of arr) {
                                    const k = key(it) || '-'
                                    m.set(k, (m.get(k) || 0) + 1)
                                  }
                                  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)
                                }
                                const topUrl = topN(list, e => String(e.url || '-'))
                                const topRel = topN(list, e => String(e.release || '-'))
                                const topEnv = topN(list, e => String(e.env || '-'))
                                const topUA = topN(list, e => String(e.user_agent || '-'))
                                const Block = ({ title, items }: { title: string; items: [string, number][] }) => (
                                  <div className="mb-2">
                                    <div className="text-slate-500 font-medium mb-1">{title}</div>
                                    <ul className="space-y-1 list-disc pl-4">
                                      {items.map(([k, c]) => (
                                        <li key={k} className="text-xs break-all"><span className="text-slate-500">{k}</span> <span className="text-slate-500">({c})</span></li>
                                      ))}
                                      {items.length === 0 && <li className="text-xs text-slate-500">-</li>}
                                    </ul>
                                  </div>
                                )
                                return (
                                  <div className="grid grid-cols-1 gap-2 mt-1">
                                    <Block title={t('admin.errorGroups.details.urlTitle') as string} items={topUrl} />
                                    <Block title={t('admin.errorGroups.details.releaseTitle') as string} items={topRel} />
                                    <Block title={t('admin.errorGroups.details.envTitle') as string} items={topEnv} />
                                    <Block title={t('admin.errorGroups.details.userAgentTitle') as string} items={topUA} />
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Görünüm butonu artık toolbar’ın sağında; burada tekrar göstermiyoruz */}

    </div>
  )
}

export default AdminErrorGroupsPage




