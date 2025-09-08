import React from 'react'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
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
        .order('last_seen', { ascending: false })

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
  }, [fromDate, toDate, level, status, debouncedQ, page])

  React.useEffect(() => { fetchGroups() }, [fetchGroups])

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={adminTableHeadCellClass}>Last Seen</th>
                <th className={adminTableHeadCellClass}>Level</th>
                <th className={adminTableHeadCellClass}>Signature</th>
                <th className={adminTableHeadCellClass}>Last Message</th>
                <th className={adminTableHeadCellClass}>Count</th>
                <th className={adminTableHeadCellClass}>Status</th>
                <th className={adminTableHeadCellClass}>Assigned</th>
                <th className={adminTableHeadCellClass}></th>
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
                      <td className={adminTableCellClass}>{new Date(r.last_seen).toLocaleString('tr-TR')}</td>
                      <td className={adminTableCellClass}>{r.level || 'error'}</td>
                      <td className={`${adminTableCellClass} max-w-[320px] truncate`} title={r.signature}>{r.signature}</td>
                      <td className={`${adminTableCellClass} max-w-[420px] truncate`} title={r.last_message || ''}>{r.last_message || '-'}</td>
                      <td className={adminTableCellClass}>{r.count}</td>
                      <td className={adminTableCellClass}>
                        <select value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value as 'open' | 'resolved' | 'ignored')} className="border border-light-gray rounded-md px-2 py-1 text-xs bg-white">
                          <option value="open">open</option>
                          <option value="resolved">resolved</option>
                          <option value="ignored">ignored</option>
                        </select>
                      </td>
                      <td className={adminTableCellClass}>
                        <div className="flex items-center gap-2">
                          <select value={r.assigned_to || ''} onChange={(e)=>updateAssignedTo(r.id, e.target.value)} className="border border-light-gray rounded-md px-2 py-1 text-xs bg-white">
                            <option value="">(kimse)</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} <${u.email}>` : u.email}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className={adminTableCellClass}>
                        <button className={adminButtonPrimaryClass + ' !px-2 !py-1 text-xs'} onClick={() => {
                          setExpandedId(id => id === r.id ? null : r.id)
                          if (expandedId !== r.id) loadLatestClientErrors(r.id)
                        }}>{expandedId === r.id ? 'Gizle' : 'Detay'}</button>
                      </td>
                    </tr>
                    {expandedId === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-3">
                          <div className="grid md:grid-cols-3 gap-3 text-xs">
                            <div className="md:col-span-2">
                              <div className="font-medium text-industrial-gray mb-1">Son Kayıtlar</div>
                              <div className="space-y-2 max-h-72 overflow-auto bg-white p-2 rounded border">
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
    </div>
  )
}

export default AdminErrorGroupsPage

