import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass, adminButtonSecondaryClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import JsonDiffViewer from '../../components/admin/JsonDiffViewer'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
  const pathname = usePathname()
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
        // Exact match on batch_id present in 'after' JSON or in comment
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

  React.useEffect(() => { fetchLogs() }, [fetchLogs])

  const searchParams = useSearchParams()
  React.useEffect(() => {
    const b = (searchParams?.get('batch') || '').trim()
    setBatch(b)
  }, [searchParams])

  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h1 className={adminSectionTitleClass}>{t('admin.titles.audit')}</h1>

      {batch && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex items-center justify-between">
          <span>Filtre: Batch <span className="font-mono">{batch}</span></span>
          <div className="flex items-center gap-2">
            <a href={`/admin/movements?batch=${batch}`} className={`${adminButtonSecondaryClass} !px-2 !py-1 text-[10px] !border-amber-300 !text-amber-700 hover:!bg-amber-100`}>Hareketleri Gör</a>
            <button
              className={`${adminButtonSecondaryClass} !px-2 !py-1 text-[10px] !border-amber-300 !text-amber-700 hover:!bg-amber-100`}
              onClick={() => { setBatch(''); const url = new URL(typeof window !== 'undefined' ? window.location.href : ''); url.searchParams.delete('batch'); router.push(url.pathname + (url.search ? '?' + url.searchParams.toString() : ''), { scroll: false }) }}
            >Temizle</button>
          </div>
        </div>
      )}

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
          <div className="flex items-center gap-3">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 md:h-12 h-11 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 transition-all font-medium text-slate-600" title="Başlangıç" />
            <span className="text-slate-400">—</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 md:h-12 h-11 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 transition-all font-medium text-slate-600" title="Bitiş" />
          </div>
        )}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3 px-1 py-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={adminButtonSecondaryClass + " disabled:opacity-40"}>{t('admin.ui.prev')}</button>
        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">{page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))} className={adminButtonSecondaryClass + " disabled:opacity-40"}>{t('admin.ui.next')}</button>
      </div>

      <div className={`${adminCardClass} overflow-hidden`}>
        {error && (
          <div className="p-3 text-red-600 text-sm border-b border-red-100">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.ui.date') || 'Tarih'}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.ui.action') || 'Aksiyon'}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.ui.table') || 'Tablo'}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.ui.pk') || 'PK'}</th>
                <th className={`${adminTableHeadCellClass}`}>{t('admin.ui.note') || 'Not'}</th>
                <th className={`${adminTableHeadCellClass}`}></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>{t('admin.ui.loading')}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>{t('admin.ui.noRecords')}</td></tr>
              ) : (
                rows.map(r => (
                  <React.Fragment key={r.id}>
                    <tr className="border-b border-slate-200/60">
                      <td className={`${adminTableCellClass}`}>{formatDateTime(r.at, lang)}</td>
                      <td className={`${adminTableCellClass}`}><span className="inline-block px-2 py-1 rounded border text-xs" title={r.action}>{r.action}</span></td>
                      <td className={`${adminTableCellClass}`}>{r.table_name}</td>
                      <td className={`${adminTableCellClass}`}>{r.row_pk || '-'}</td>
                      <td className={`${adminTableCellClass}`}>{r.comment || '-'}</td>
                      <td className={`${adminTableCellClass}`}>
                        <button
                          className={adminButtonSecondaryClass + " h-8 px-3 text-[11px] font-bold uppercase tracking-tight"}
                          onClick={() => setExpandedId(id => id === r.id ? null : r.id)}
                        > {expandedId === r.id ? t('admin.ui.hide') : t('admin.ui.details')}</button>
                      </td>
                    </tr>
                    {expandedId === r.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-4 border-b border-slate-200 shadow-inner">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{r.action} İşlemi Detayları</div>
                          <JsonDiffViewer before={r.before} after={r.after} />
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

export default AdminAuditLogPage






