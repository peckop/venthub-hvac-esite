 
import React from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { 
  adminSectionTitleClass, 
  adminCardClass, 
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminTableActionClass,
  adminSelectClass,
  adminSelectStyle,
  adminInputClass
} from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import { useDragScroll } from '../../hooks/useDragScroll'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { Bug } from 'lucide-react'

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
  const dragScrollRef = useDragScroll<HTMLDivElement>()
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
      setError((e as Error).message || t('admin.ui.failed'))
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, level, env, debouncedQ, page, t])

  const pathname = usePathname()
  React.useEffect(() => { fetchErrors() }, [fetchErrors, pathname])

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
        search={{ value: q, onChange: setQ, placeholder: t('admin.search.errors'), focusShortcut: '/' }}
        select={{
          value: level, onChange: setLevel, title: t('admin.errors.levelTitle'), options: [
            { value: '', label: t('admin.ui.all') },
            { value: 'error', label: 'error' },
            { value: 'warn', label: 'warn' },
            { value: 'info', label: 'info' },
          ]
        }}
        onClear={() => { setQ(''); setLevel(''); setFromDate(defaultFromDate); setToDate(defaultToDate); setPage(1) }}
        recordCount={total}
        rightExtra={(
          <div className="flex items-center gap-2">
            <select 
              value={env} 
              onChange={(e) => setEnv(e.target.value)} 
              className={adminSelectClass}
              style={adminSelectStyle}
              title={t('admin.errors.envTitle') as string}
            >
              <option value="production" className="bg-surface-deep">production</option>
              <option value="preview" className="bg-surface-deep">preview</option>
              <option value="development" className="bg-surface-deep">development</option>
              <option value="" className="bg-surface-deep">({t('admin.ui.all')})</option>
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
          </div>
        )}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 mb-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
          {t('admin.ui.prev')}
        </button>
        <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
          {t('admin.ui.pageLabel', { page: String(page), pages: String(Math.max(1, Math.ceil(total / PAGE_SIZE))) })}
        </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
          {t('admin.ui.next')}
        </button>
      </div>

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}
        <div ref={dragScrollRef} className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="glass-strong">
              <tr>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.errors.table.date')}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.errors.table.level')}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.errors.table.message')}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.errors.table.url')}</th>
                <th className={`${adminTableHeadCellClass}`}></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <AdminSkeleton variant="table" count={5} rows={5} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <AdminEmptyState
                      icon={Bug}
                      title="Hata Bulunamadı"
                      description="Seçilen tarih aralığı ve filtrelere uygun kaydedilmiş bir hata görünmüyor."
                    />
                  </td>
                </tr>
              ) : (
                rows.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className={`${adminTableCellClass}`}>{formatDateTime(r.at, lang)}</td>
                      <td className={`${adminTableCellClass}`}><span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${r.level === 'error' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20' : r.level === 'warn' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20'}`}>{r.level || 'error'}</span></td>
                      <td className={`${adminTableCellClass}`}>{r.message}</td>
                      <td className={`${adminTableCellClass}`}>{r.url || '-'}</td>
                      <td className={`${adminTableCellClass}`}>
                        <button
                          className={adminTableActionClass}
                          onClick={() => setExpandedId(id => id === r.id ? null : r.id)}
                        >{expandedId === r.id ? t('admin.ui.hide') : t('admin.ui.details')}</button>
                      </td>
                    </tr>
                     {expandedId === r.id && (
                      <tr className="bg-white/[0.03]">
                        <td colSpan={5} className="p-6">
                          <div className="grid md:grid-cols-2 gap-6 text-xs">
                            <div>
                              <div className="font-black text-slate-500 mb-3 uppercase tracking-widest">{t('admin.errors.labels.stack')}</div>
                              <pre className="bg-surface-deep/80 text-amber-300/80 font-mono p-4 rounded-2xl border border-white/5 overflow-auto max-h-80 leading-relaxed custom-scrollbar">{String(r.stack || '').slice(0, 8000)}</pre>
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




