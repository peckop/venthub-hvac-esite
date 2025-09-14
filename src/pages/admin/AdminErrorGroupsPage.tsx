import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import { adminCardClass, adminSectionTitleClass, adminTableCellClass, adminTableHeadCellClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'

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
  const { t } = useI18n()
  // Columns & density (like Inventory)
  const STORAGE_KEY = 'toolbar:errorgroups'
  const [visibleCols, setVisibleCols] = React.useState<{ lastSeen: boolean; level: boolean; signature: boolean; lastMsg: boolean; count: boolean; status: boolean; assigned: boolean; actions: boolean }>({ lastSeen: true, level: true, signature: true, lastMsg: true, count: true, status: true, assigned: true, actions: true })
  const [density, setDensity] = React.useState<Density>('comfortable')
  React.useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  React.useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''
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
  const [bulkStatus, setBulkStatus] = React.useState<'open'|'resolved'|'ignored'>('resolved')
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
    ;(async () => {
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
      } catch {}
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

  React.useEffect(() => { fetchGroups() }, [fetchGroups])

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
      .channel('error-groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'error_groups' }, () => {
        scheduleRefetch()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [scheduleRefetch])

  const updateStatus = async (id: string, newStatus: 'open' | 'resolved' | 'ignored') => {
    const prev = rows
    setRows(rs => rs.map(r => r.id === id ? { ...r, status: newStatus } : r))
    const { error } = await supabase.from('error_groups').update({ status: newStatus }).eq('id', id)
    if (error) {
      setRows(prev)
    }
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
      const { data, error } = await supabase
        .from('client_errors')
        .select('id, at, url, message, stack, user_agent, release, env, level')
        .eq('group_id', groupId)
        .order('at', { ascending: false })
        .limit(200)
      if (!error) setLatestClientErrors(prev => ({ ...prev, [groupId]: (data || []) as ClientErrorRow[] }))
    } catch {}
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
      for (;;) {
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
      const header = ['id','signature','level','last_message','url_sample','env','release','first_seen','last_seen','count','status','assigned_to','notes']
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

  // Top and bottom synchronized horizontal scroll
  const topScrollRef = React.useRef<HTMLDivElement | null>(null)
  const tableWrapRef = React.useRef<HTMLDivElement | null>(null)
  const [topScrollWidth, setTopScrollWidth] = React.useState(0)
  const refreshTopWidth = React.useCallback(() => { setTopScrollWidth(tableWrapRef.current?.scrollWidth || 0) }, [])
  React.useEffect(() => { refreshTopWidth(); const onResize=()=>refreshTopWidth(); window.addEventListener('resize', onResize); return ()=>window.removeEventListener('resize', onResize) }, [rows, refreshTopWidth])

  // Smooth, bi-directional sync with rAF + programmatic update guard
  const rafIdRef = React.useRef<number | null>(null)
  const latestLeftRef = React.useRef(0)
  const programmaticTargetRef = React.useRef<null | 'top' | 'bottom'>(null)
  const pendingSourceRef = React.useRef<null | 'top' | 'bottom'>(null)

  const flushSync = React.useCallback(() => {
    if (rafIdRef.current != null) return
    rafIdRef.current = requestAnimationFrame(() => {
      const source = pendingSourceRef.current
      rafIdRef.current = null
      pendingSourceRef.current = null
      if (!source) return
      if (!topScrollRef.current || !tableWrapRef.current) return
      const srcEl = source === 'top' ? topScrollRef.current : tableWrapRef.current
      const dstEl = source === 'top' ? tableWrapRef.current : topScrollRef.current
      const srcMax = Math.max(0, srcEl.scrollWidth - srcEl.clientWidth)
      const dstMax = Math.max(0, dstEl.scrollWidth - dstEl.clientWidth)
      const ratio = srcMax > 0 ? (latestLeftRef.current / srcMax) : 0
      const mappedLeft = Math.max(0, Math.min(dstMax, ratio * dstMax))
      programmaticTargetRef.current = source === 'top' ? 'bottom' : 'top'
      dstEl.scrollLeft = mappedLeft
    })
  }, [])

  const onTopScroll = React.useCallback(() => {
    if (!topScrollRef.current || !tableWrapRef.current) return
    if (programmaticTargetRef.current === 'top') {
      // consume one programmatic event
      programmaticTargetRef.current = null
      return
    }
    latestLeftRef.current = topScrollRef.current.scrollLeft
    pendingSourceRef.current = 'top'
    flushSync()
  }, [flushSync])

  const onBottomScroll = React.useCallback(() => {
    if (!topScrollRef.current || !tableWrapRef.current) return
    if (programmaticTargetRef.current === 'bottom') {
      programmaticTargetRef.current = null
      return
    }
    latestLeftRef.current = tableWrapRef.current.scrollLeft
    pendingSourceRef.current = 'bottom'
    flushSync()
  }, [flushSync])

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
        search={{ value: q, onChange: setQ, placeholder: 'signature/mesaj ara', focusShortcut: '/' }}
        select={{ value: level, onChange: setLevel, title: 'Seviye', options: [
          { value: '', label: 'Tümü' },
          { value: 'error', label: 'error' },
          { value: 'warn', label: 'warn' },
          { value: 'info', label: 'info' },
        ] }}
        onClear={() => { setQ(''); setLevel(''); setStatus(''); setAssigned(''); setFromDate(''); setToDate(''); setPage(1); setSelectedIds([]) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white">
              <option value="">Durum: Tümü</option>
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="ignored">ignored</option>
            </select>
            <select value={assigned} onChange={(e)=>setAssigned(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white">
              <option value="">Atanan: Tümü</option>
              <option value="__none__">(atanmamış)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} <${u.email}>` : u.email}</option>
              ))}
            </select>
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Başlangıç" />
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Bitiş" />
            <ExportMenu items={[{ key: 'csv', label: 'CSV (UTF-8 BOM)', onSelect: () => exportGroupsCsv() }]} />
            {/* Görünüm/kolonlar menüsü: stok özet sayfasındaki gibi sağ üstte */}
            <ColumnsMenu
              density={density}
              onDensityChange={setDensity}
              columns={[
                { key: 'lastSeen', label: 'Last Seen', checked: visibleCols.lastSeen, onChange: (v)=> setVisibleCols(prev=>({ ...prev, lastSeen: v })) },
                { key: 'level', label: 'Level', checked: visibleCols.level, onChange: (v)=> setVisibleCols(prev=>({ ...prev, level: v })) },
                { key: 'signature', label: 'Signature', checked: visibleCols.signature, onChange: (v)=> setVisibleCols(prev=>({ ...prev, signature: v })) },
                { key: 'lastMsg', label: 'Last Message', checked: visibleCols.lastMsg, onChange: (v)=> setVisibleCols(prev=>({ ...prev, lastMsg: v })) },
                { key: 'count', label: 'Count', checked: visibleCols.count, onChange: (v)=> setVisibleCols(prev=>({ ...prev, count: v })) },
                { key: 'status', label: 'Status', checked: visibleCols.status, onChange: (v)=> setVisibleCols(prev=>({ ...prev, status: v })) },
                { key: 'assigned', label: 'Assigned', checked: visibleCols.assigned, onChange: (v)=> setVisibleCols(prev=>({ ...prev, assigned: v })) },
                { key: 'actions', label: 'Actions', checked: visibleCols.actions, onChange: (v)=> setVisibleCols(prev=>({ ...prev, actions: v })) },
              ]}
            />
          </div>
        )}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50">Önceki</button>
        <span className="text-sm text-steel-gray">Sayfa {page} / {pageCount}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page >= pageCount} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50">Sonraki</button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className={adminCardClass + ' flex items-center justify-between'}>
          <div className="text-sm text-industrial-gray">Seçili grup: {selectedIds.length}</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-steel-gray">Durum:</label>
            <select value={bulkStatus} onChange={(e)=>setBulkStatus(e.target.value as 'open'|'resolved'|'ignored')} className="border border-light-gray rounded-md px-2 h-10 text-sm bg-white">
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="ignored">ignored</option>
            </select>
            <button onClick={bulkApplyStatus} disabled={savingBulk} className={adminButtonPrimaryClass}>{savingBulk ? 'Uygulanıyor…' : 'Uygula'}</button>
            <button onClick={()=>setSelectedIds([])} className="px-3 py-2 rounded border border-gray-200">Temizle</button>
          </div>
        </div>
      )}

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}

        {/* Top horizontal scrollbar */}
        <div ref={topScrollRef} onScroll={onTopScroll} className="overflow-x-auto h-4 bg-gray-100 border-b border-light-gray/70 select-none" role="presentation" aria-hidden style={{ willChange: 'scroll-position' }}>
          <div style={{ width: topScrollWidth || '100%' }} className="h-4" />
        </div>

        {/* Main table wrapper: only horizontal scroll; prevent scroll chaining on X axis */}
        <div ref={tableWrapRef} onScroll={onBottomScroll} className="overflow-x-auto overscroll-x-contain" style={{ willChange: 'scroll-position' }}>
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className={`${adminTableHeadCellClass} ${headPad} min-w-[40px]`}></th>
                {visibleCols.lastSeen && (
                  <th className={`${adminTableHeadCellClass} ${headPad} min-w-[160px]`}>
                    <button type="button" onClick={() => toggleSort('last_seen')} className="inline-flex items-center gap-1">
                      <span>Last Seen</span>
                      {sortBy === 'last_seen' && <span aria-hidden>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </button>
                  </th>
                )}
                {visibleCols.level && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[90px]`}>Level</th>}
                {visibleCols.signature && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[320px]`}>Signature</th>}
                {visibleCols.lastMsg && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[420px]`}>Last Message</th>}
                {visibleCols.count && (
                  <th className={`${adminTableHeadCellClass} ${headPad} min-w-[80px]`}>
                    <button type="button" onClick={() => toggleSort('count')} className="inline-flex items-center gap-1">
                      <span>Count</span>
                      {sortBy === 'count' && <span aria-hidden>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </button>
                  </th>
                )}
                {visibleCols.status && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[120px]`}>Status</th>}
                {visibleCols.assigned && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[220px]`}>Assigned</th>}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} min-w-[80px]`}></th>}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td className="p-4" colSpan={8}>Yükleniyor…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-4" colSpan={8}>Kayıt yok</td></tr>
              ) : (
                rows.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="border-b border-light-gray/60 align-top">
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e)=>toggleSelect(r.id, e.target.checked)} />
                      </td>
                      {visibleCols.lastSeen && <td className={`${adminTableCellClass} ${cellPad} whitespace-nowrap`}>{new Date(r.last_seen).toLocaleString('tr-TR')}</td>}
                      {visibleCols.level && <td className={`${adminTableCellClass} ${cellPad} whitespace-nowrap`}>{r.level || 'error'}</td>}
                      {visibleCols.signature && <td className={`${adminTableCellClass} ${cellPad} max-w-[320px] truncate`} title={r.signature}>{r.signature}</td>}
                      {visibleCols.lastMsg && <td className={`${adminTableCellClass} ${cellPad} max-w-[420px] whitespace-normal break-words`} title={r.last_message || ''}>{r.last_message || '-'}</td>}
                      {visibleCols.count && <td className={`${adminTableCellClass} ${cellPad}`}>{r.count}</td>}
                      {visibleCols.status && <td className={`${adminTableCellClass} ${cellPad}`}>
                        <select value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value as 'open' | 'resolved' | 'ignored')} className="border border-light-gray rounded-md px-2 py-1 text-xs bg-white">
                          <option value="open">open</option>
                          <option value="resolved">resolved</option>
                          <option value="ignored">ignored</option>
                        </select>
                      </td>}
                      {visibleCols.assigned && <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-2">
                          <select value={r.assigned_to || ''} onChange={(e)=>updateAssignedTo(r.id, e.target.value)} className="border border-light-gray rounded-md px-2 py-1 text-xs bg-white">
                            <option value="">(kimse)</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} <${u.email}>` : u.email}</option>
                            ))}
                          </select>
                        </div>
                      </td>}
                      {visibleCols.actions && <td className={`${adminTableCellClass} ${cellPad}`}>
                        <button className={adminButtonPrimaryClass + ' !px-2 !py-1 text-xs'} onClick={() => {
                          setExpandedId(id => id === r.id ? null : r.id)
                          if (expandedId !== r.id) loadLatestClientErrors(r.id)
                        }}>{expandedId === r.id ? 'Gizle' : 'Detay'}</button>
                      </td>}
                    </tr>
                    {expandedId === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-3">
                          <div className="grid md:grid-cols-3 gap-3 text-xs">
                            <div className="md:col-span-2">
                              <div className="font-medium text-industrial-gray mb-1">Son Kayıtlar</div>
                              <div className="space-y-2 max-h-72 overflow-auto overscroll-y-contain bg-white p-2 rounded border">
                                {(latestClientErrors[r.id] || []).map((e: ClientErrorRow) => (
                                  <div key={e.id} className="border-b last:border-b-0 pb-1">
                                    <div className="text-steel-gray">{new Date(e.at).toLocaleString('tr-TR')} • {e.level || 'error'}</div>
                                    <div className="text-steel-gray break-words">{e.message}</div>
                                    <div className="text-industrial-gray break-all">{e.url || '-'}</div>
                                    {e.stack && <details className="mt-1"><summary className="cursor-pointer">stack</summary><pre className="text-[10px] overflow-auto max-h-40">{String(e.stack).slice(0,4000)}</pre></details>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-industrial-gray mb-1">Notlar</div>
                              <textarea defaultValue={rows.find(x=>x.id===r.id)?.notes || ''} onBlur={(ev)=>updateNotes(r.id, ev.target.value)} className="w-full border border-light-gray rounded p-2 bg-white" rows={7} placeholder="Bu grup hakkında not bırakın..."/>
                              <div className="font-medium text-industrial-gray mb-1 mt-3">Örnek URL</div>
                              <div className="text-[11px] break-all">{r.url_sample || '-'}</div>
                              <div className="font-medium text-industrial-gray mb-2 mt-3">Top‑5 Dağılımlar</div>
                              {(() => {
                                const list = latestClientErrors[r.id] || []
                                const topN = (arr: ClientErrorRow[], key: (e: ClientErrorRow)=>string, n=5) => {
                                  const m = new Map<string, number>()
                                  for (const it of arr) {
                                    const k = key(it) || '-'
                                    m.set(k, (m.get(k)||0) + 1)
                                  }
                                  return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,n)
                                }
                                const topUrl = topN(list, e=>String(e.url||'-'))
                                const topRel = topN(list, e=>String(e.release||'-'))
                                const topEnv = topN(list, e=>String(e.env||'-'))
                                const topUA  = topN(list, e=>String(e.user_agent||'-'))
                                const Block = ({title, items}:{title:string;items:[string,number][]}) => (
                                  <div className="mb-2">
                                    <div className="text-steel-gray font-medium mb-1">{title}</div>
                                    <ul className="space-y-1 list-disc pl-4">
                                      {items.map(([k,c]) => (
                                        <li key={k} className="text-[11px] break-all"><span className="text-industrial-gray">{k}</span> <span className="text-steel-gray">({c})</span></li>
                                      ))}
                                      {items.length === 0 && <li className="text-[11px] text-steel-gray">-</li>}
                                    </ul>
                                  </div>
                                )
                                return (
                                  <div className="grid grid-cols-1 gap-2 mt-1">
                                    <Block title="URL" items={topUrl} />
                                    <Block title="Release" items={topRel} />
                                    <Block title="Env" items={topEnv} />
                                    <Block title="User Agent" items={topUA} />
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

