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

  const [users, setUsers] = React.useState<AdminUserOpt[]>([])
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [latestClientErrors, setLatestClientErrors] = React.useState<Record<string, ClientErrorRow[]>>({})

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
    // load admin/moderator users for assignment
    ;(async () => {
      try {
        const { data, error } = await supabase.from('admin_users').select('id,email,full_name')
        if (!error) setUsers((data || []) as AdminUserOpt[])
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
  }, [fromDate, toDate, level, status, debouncedQ, page, sortBy, sortDir])

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
        .limit(20)
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

  // Prevent scroll event feedback loop between top and bottom scrollers
  const syncingRef = React.useRef(false)
  const onBottomScroll = React.useCallback(()=>{
    if(!topScrollRef.current||!tableWrapRef.current) return
    if (syncingRef.current) return
    const from = tableWrapRef.current
    const to = topScrollRef.current
    if (to.scrollLeft !== from.scrollLeft) {
      syncingRef.current = true
      to.scrollLeft = from.scrollLeft
      // allow the browser to flush scroll event before releasing the flag
      requestAnimationFrame(() => { syncingRef.current = false })
    }
  },[])
  const onTopScroll = React.useCallback(()=>{
    if(!topScrollRef.current||!tableWrapRef.current) return
    if (syncingRef.current) return
    const from = topScrollRef.current
    const to = tableWrapRef.current
    if (to.scrollLeft !== from.scrollLeft) {
      syncingRef.current = true
      to.scrollLeft = from.scrollLeft
      requestAnimationFrame(() => { syncingRef.current = false })
    }
  },[])

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
        onClear={() => { setQ(''); setLevel(''); setStatus(''); setFromDate(''); setToDate(''); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white">
              <option value="">Durum: Tümü</option>
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="ignored">ignored</option>
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

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}

        {/* Top horizontal scrollbar */}
        <div ref={topScrollRef} onScroll={onTopScroll} className="overflow-x-auto h-3 bg-gray-100 border-b border-light-gray/70" role="presentation" aria-hidden>
          <div style={{ width: topScrollWidth || '100%' }} className="h-3" />
        </div>

        {/* Main table wrapper: only horizontal scroll; prevent scroll chaining on X axis */}
        <div ref={tableWrapRef} onScroll={onBottomScroll} className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
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

