import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'

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

const PAGE_SIZE = 50

const AdminErrorsPage: React.FC = () => {
  const { t, lang } = useI18n()
  // Default date range: last 7 days (including today)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const now = new Date()
  const defaultToDate = fmt(now)
  const defaultFromDate = fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
  const [rows, setRows] = React.useState<ErrorRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)

  // Filters
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [fromDate, setFromDate] = React.useState(defaultFromDate)
  const [toDate, setToDate] = React.useState(defaultToDate)
  const [level, setLevel] = React.useState('')
  const [env, setEnv] = React.useState('production')

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const fetchErrors = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('client_errors')
        .select('id, at, url, message, stack, user_agent, release, env, level', { count: 'exact' })
        .order('at', { ascending: false })

      if (fromDate) query = query.gte('at', `${fromDate}T00:00:00Z`)
      if (toDate) query = query.lte('at', `${toDate}T23:59:59Z`)
      if (level) query = query.eq('level', level)
      if (env) query = query.eq('env', env)
      if (debouncedQ) {
        const like = `%${debouncedQ}%`
        query = query.or(`url.ilike.${like},message.ilike.${like}`)
      }
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error
      setRows((data || []) as ErrorRow[])
      setTotal(typeof count === 'number' ? count : 0)
    } catch (e) {
      setError((e as Error).message || 'Yüklenemedi')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, level, env, debouncedQ, page])

  React.useEffect(() => { fetchErrors() }, [fetchErrors])

  // Realtime auto-refresh with debounce
  const fetchRef = React.useRef(fetchErrors)
  React.useEffect(() => { fetchRef.current = fetchErrors }, [fetchErrors])

  const refetchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleRefetch = React.useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current)
    refetchTimer.current = setTimeout(() => fetchRef.current(), 400)
  }, [])

  React.useEffect(() => {
    const ch = supabase
      .channel('client-errors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_errors' }, () => {
        scheduleRefetch()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [scheduleRefetch])

  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.errors')}</h1>

      <AdminToolbar
        storageKey="toolbar:errors"
        search={{ value: q, onChange: setQ, placeholder: 'URL veya mesaj ara', focusShortcut: '/' }}
        select={{ value: level, onChange: setLevel, title: 'Seviye', options: [
          { value: '', label: 'Tümü' },
          { value: 'error', label: 'error' },
          { value: 'warn', label: 'warn' },
          { value: 'info', label: 'info' },
        ] }}
        onClear={() => { setQ(''); setLevel(''); setFromDate(defaultFromDate); setToDate(defaultToDate); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <select value={env} onChange={(e)=>setEnv(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Ortam">
              <option value="production">production</option>
              <option value="preview">preview</option>
              <option value="development">development</option>
              <option value="">(tümü)</option>
            </select>
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Başlangıç" />
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="border border-light-gray rounded-md px-2 md:h-12 h-11 text-sm bg-white" title="Bitiş" />
          </div>
        )}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50">Önceki</button>
        <span className="text-sm text-steel-gray">Sayfa {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} className="px-3 md:h-12 h-11 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap disabled:opacity-50">Sonraki</button>
      </div>

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${adminTableHeadCellClass}`}>Tarih</th>
                <th className={`${adminTableHeadCellClass}`}>Seviye</th>
                <th className={`${adminTableHeadCellClass}`}>Mesaj</th>
                <th className={`${adminTableHeadCellClass}`}>URL</th>
                <th className={`${adminTableHeadCellClass}`}></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td className="p-4" colSpan={5}>Yükleniyor…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-4" colSpan={5}>Kayıt yok</td></tr>
              ) : (
                rows.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="border-b border-light-gray/60">
<td className={`${adminTableCellClass}`}>{formatDateTime(r.at, lang)}</td>
                      <td className={`${adminTableCellClass}`}>{r.level || 'error'}</td>
                      <td className={`${adminTableCellClass}`}>{r.message}</td>
                      <td className={`${adminTableCellClass}`}>{r.url || '-'}</td>
                      <td className={`${adminTableCellClass}`}>
                        <button
                          className="px-2 py-1 rounded-md border border-light-gray bg-white hover:border-primary-navy text-xs"
                          onClick={()=> setExpandedId(id => id === r.id ? null : r.id)}
                        >{expandedId === r.id ? 'Gizle' : 'Detay'}</button>
                      </td>
                    </tr>
                    {expandedId === r.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="p-3">
                          <div className="grid md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="font-medium text-industrial-gray mb-1">Stack</div>
                              <pre className="bg-white p-2 rounded border overflow-auto max-h-64">{String(r.stack || '').slice(0, 8000)}</pre>
                            </div>
                            <div>
                              <div className="font-medium text-industrial-gray mb-1">Detaylar</div>
                              <div className="space-y-1">
                                <div><span className="text-industrial-gray">UA: </span>{r.user_agent || '-'}</div>
                                <div><span className="text-industrial-gray">Release: </span>{r.release || '-'}</div>
                                <div><span className="text-industrial-gray">Env: </span>{r.env || '-'}</div>
                              </div>
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

export default AdminErrorsPage

