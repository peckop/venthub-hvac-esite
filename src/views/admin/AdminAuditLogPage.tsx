 
import React from 'react'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminButtonSecondaryClass, 
  adminTableActionClass
} from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import { useDragScroll } from '../../hooks/useDragScroll'
import JsonDiffViewer from '../../components/admin/JsonDiffViewer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { ClipboardList, Filter, Calendar, Terminal, ChevronLeft, ChevronRight, History } from 'lucide-react'

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

const PAGE_SIZE = 50

const AdminAuditLogPage: React.FC = () => {
  const { t, lang } = useI18n()
  const dragScrollRef = useDragScroll<HTMLDivElement>()
  const router = useRouter()
  const [rows, setRows] = React.useState<AuditRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)

  // Filters
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [fromDate, setFromDate] = React.useState('')
  const [toDate, setToDate] = React.useState('')
  const [action, setAction] = React.useState('')
  const [batch, setBatch] = React.useState('')

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await ensureSessionFresh()

      let query = supabase
        .from('admin_audit_log')
        .select('id, at, actor, table_name, row_pk, action, comment, before, after', { count: 'exact' })
        .order('at', { ascending: false })

      if (fromDate) {
        query = query.gte('at', `${fromDate}T00:00:00Z`)
      }
      if (toDate) {
        query = query.lte('at', `${toDate}T23:59:59Z`)
      }
      if (action) {
        query = query.eq('action', action)
      }
      if (debouncedQ) {
        const like = `%${debouncedQ}%`
        query = query.or(`table_name.ilike.${like},row_pk.ilike.${like},comment.ilike.${like}`)
      }
      if (batch) {
        query = query.or(`after->>batch_id.eq.${batch},comment.ilike.%${batch}%`)
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error
      setRows((data || []) as AuditRow[])
      setTotal(typeof count === 'number' ? count : 0)
    } catch (e) {
      setRows([])
      setTotal(0)
      setError((e as Error).message || 'Yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, action, debouncedQ, page, batch])

  const pathname = usePathname()
  React.useEffect(() => { fetchLogs() }, [fetchLogs, pathname])

  const searchParams = useSearchParams()
  React.useEffect(() => {
    const b = (searchParams?.get('batch') || '').trim()
    setBatch(b)
  }, [searchParams])

  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.audit')}</h1>
        <p className={adminSubtitleClass}>Sistem üzerindeki tüm değişiklikleri ve kullanıcı aktivitelerini inceleyin.</p>
      </header>

      {batch && (
        <div className="glass-strong border border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">
              Filtre: Batch <span className="font-mono text-xs">{batch}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/admin/movements?batch=${batch}`} className={`${adminButtonSecondaryClass} !h-8 !px-3 font-black text-[10px] uppercase border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-all`}>
              Hareketleri Gör
            </a>
            <button
              className={`${adminButtonSecondaryClass} !h-8 !px-3 font-black text-[10px] uppercase border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-all`}
              onClick={() => { 
                setBatch(''); 
                const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost');
                url.searchParams.delete('batch'); 
                router.push(url.pathname + (url.search ? '?' + url.searchParams.toString() : ''), { scroll: false }) 
              }}
            >
              Temizle
            </button>
          </div>
        </div>
      )}

      <div className="glass-strong rounded-[2rem] border border-white/5 overflow-hidden">
        <AdminToolbar
          storageKey="toolbar:audit"
          search={{ value: q, onChange: setQ, placeholder: 'Tablo adı, PK veya not ara', focusShortcut: '/' }}
          select={{
            value: action, onChange: setAction, title: 'Aksiyon', options: [
              { value: '', label: 'Tümü' },
              { value: 'INSERT', label: 'INSERT' },
              { value: 'UPDATE', label: 'UPDATE' },
              { value: 'DELETE', label: 'DELETE' },
              { value: 'CUSTOM', label: 'CUSTOM' },
            ]
          }}
          onClear={() => { setBatch(''); setQ(''); setAction(''); setFromDate(''); setToDate(''); setPage(1) }}
          recordCount={total}
          rightExtra={(
            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0F1E]/40 border border-white/10 group focus-within:border-cyan-400/50 transition-all">
                <Calendar size={14} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)} 
                  className="bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-600 w-24" 
                  title="Başlangıç" 
                />
              </div>
              <span className="text-white/20">—</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0F1E]/40 border border-white/10 group focus-within:border-cyan-400/50 transition-all">
                <Calendar size={14} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)} 
                  className="bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-600 w-24" 
                  title="Bitiş" 
                />
              </div>
            </div>
          )}
        />

        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <History size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Denetim Geçmişi</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page <= 1} 
              className={`${adminButtonSecondaryClass} !h-10 !w-10 !p-0 !rounded-xl disabled:opacity-30`}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-5 h-10 flex items-center justify-center rounded-xl glass border border-white/5">
              <span className="text-xs font-black text-white tracking-widest">
                {page} <span className="opacity-30 mx-2">/</span> {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              </span>
            </div>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} 
              className={`${adminButtonSecondaryClass} !h-10 !w-10 !p-0 !rounded-xl disabled:opacity-30`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 pt-0">
          <div ref={dragScrollRef} className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0A0F1E]/40">
            <table className="w-full text-left">
              <thead>
                <tr className="glass-strong">
                  <th className={adminTableHeadCellClass}>{t('admin.ui.date') || 'Tarih'}</th>
                  <th className={adminTableHeadCellClass}>{t('admin.ui.action') || 'Aksiyon'}</th>
                  <th className={adminTableHeadCellClass}>{t('admin.ui.table') || 'Tablo'}</th>
                  <th className={adminTableHeadCellClass}>{t('admin.ui.pk') || 'PK'}</th>
                  <th className={adminTableHeadCellClass}>{t('admin.ui.note') || 'Not'}</th>
                  <th className={adminTableHeadCellClass}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <AdminSkeleton variant="table" count={6} rows={10} />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12">
                      <AdminEmptyState
                        icon={ClipboardList}
                        title="Kayıt Bulunamadı"
                        description="Girilen filtrelere veya arama kriterlerine uygun denetim logu bulunamadı."
                      />
                    </td>
                  </tr>
                ) : (
                  rows.map(r => (
                    <React.Fragment key={r.id}>
                      <tr className={`group transition-colors ${expandedId === r.id ? 'bg-cyan-400/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                        <td className={`${adminTableCellClass} whitespace-nowrap opacity-60`}>{formatDateTime(r.at, lang)}</td>
                        <td className={adminTableCellClass}>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                            r.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            r.action === 'UPDATE' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            r.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {r.action}
                          </span>
                        </td>
                        <td className={adminTableCellClass}>{r.table_name}</td>
                        <td className={`${adminTableCellClass} font-mono text-[11px] text-slate-400`}>{r.row_pk || '-'}</td>
                        <td className={`${adminTableCellClass} max-w-xs truncate`}>{r.comment || '-'}</td>
                        <td className={adminTableCellClass}>
                          <button
                            className={`${adminTableActionClass} !bg-white/5 !border-white/10 hover:!bg-white/10 hover:!text-white`}
                            onClick={() => setExpandedId(id => id === r.id ? null : r.id)}
                          >
                            {expandedId === r.id ? t('admin.ui.hide') : t('admin.ui.details')}
                          </button>
                        </td>
                      </tr>
                      {expandedId === r.id && (
                        <tr>
                          <td colSpan={6} className="p-6 bg-black/40 shadow-inner">
                            <div className="flex items-center gap-3 mb-4">
                              <Terminal size={14} className="text-cyan-400" />
                              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">İşlem Detayları</div>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-[#0A0F1E]/60 p-1">
                              <JsonDiffViewer before={r.before} after={r.after} />
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
      
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold text-center uppercase tracking-widest">
          {error}
        </div>
      )}
    </div>
  )
}

export default AdminAuditLogPage
