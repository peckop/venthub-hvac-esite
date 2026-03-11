/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { usePathname } from 'next/navigation'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminCardClass,
  adminButtonSecondaryClass 
} from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { Density } from '../../components/admin/ColumnsMenu'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDateTime } from '../../i18n/datetime'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { RefreshCcw, MailX, Activity, Terminal, Send } from 'lucide-react'
import { useDragScroll } from '../../hooks/useDragScroll'

interface ReturnEventRow {
  id: number | string
  event_id: string
  return_id: string | null
  order_id: string | null
  carrier: string | null
  tracking_number: string | null
  status_raw: string | null
  status_mapped: string | null
  received_at: string
  processed_at: string | null
}

interface EmailEventRow {
  id?: string
  order_id: string
  email_to: string
  subject: string
  provider: string | null
  provider_message_id: string | null
  carrier: string | null
  tracking_number: string | null
  created_at: string
}

const AdminWebhookEventsPage: React.FC = () => {
  const { lang, t } = useI18n()
  const dragScrollRef1 = useDragScroll<HTMLDivElement>()
  const dragScrollRef2 = useDragScroll<HTMLDivElement>()
  const [tab, setTab] = React.useState<'returns' | 'shipping'>('returns')
  const [q, setQ] = React.useState('')
  const [density, setDensity] = React.useState<Density>('comfortable')
  const [loading, setLoading] = React.useState(false)

  const [returnsRows, setReturnsRows] = React.useState<ReturnEventRow[]>([])
  const [emailsRows, setEmailsRows] = React.useState<EmailEventRow[]>([])

  const STORAGE_KEY = 'toolbar:webhook-events'
  const [colsRet, setColsRet] = React.useState({ event: true, order: true, carrier: true, status: true, received: true })
  const [colsMail, setColsMail] = React.useState({ order: true, to: true, subject: true, provider: true, created: true })

  React.useEffect(() => {
    try {
      const d = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
      const cr = localStorage.getItem(`${STORAGE_KEY}:retcols`)
      if (cr) setColsRet(prev => ({ ...prev, ...JSON.parse(cr) }))
      const cm = localStorage.getItem(`${STORAGE_KEY}:mailcols`)
      if (cm) setColsMail(prev => ({ ...prev, ...JSON.parse(cm) }))
    } catch { }
  }, [])
  React.useEffect(() => { try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch { } }, [density])
  React.useEffect(() => { try { localStorage.setItem(`${STORAGE_KEY}:retcols`, JSON.stringify(colsRet)) } catch { } }, [colsRet])
  React.useEffect(() => { try { localStorage.setItem(`${STORAGE_KEY}:mailcols`, JSON.stringify(colsMail)) } catch { } }, [colsMail])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'returns') {
        const { data, error } = await supabase
          .from('returns_webhook_events')
          .select('id,event_id,return_id,order_id,carrier,tracking_number,status_raw,status_mapped,received_at,processed_at')
          .order('received_at', { ascending: false })
          .limit(200)
        if (error) throw error
        const list = (data || []) as unknown as ReturnEventRow[]
        setReturnsRows(list)
      } else {
        const { data, error } = await supabase
          .from('shipping_email_events')
          .select('order_id,email_to,subject,provider,provider_message_id,carrier,tracking_number,created_at')
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) throw error
        const list = (data || []) as unknown as EmailEventRow[]
        setEmailsRows(list)
      }
    } catch (e) {
      console.error('fetch webhook events error', e)
    } finally {
      setLoading(false)
    }
  }, [tab])

  const pathname = usePathname()
  React.useEffect(() => { fetchData() }, [fetchData, pathname])

  const filteredReturns = React.useMemo(() => {
    if (!q.trim()) return returnsRows
    const s = q.toLowerCase()
    return returnsRows.filter(r =>
      r.event_id.toLowerCase().includes(s) ||
      (r.order_id || '').toLowerCase().includes(s) ||
      (r.return_id || '').toLowerCase().includes(s) ||
      (r.carrier || '').toLowerCase().includes(s) ||
      (r.status_mapped || '').toLowerCase().includes(s)
    )
  }, [returnsRows, q])

  const filteredEmails = React.useMemo(() => {
    if (!q.trim()) return emailsRows
    const s = q.toLowerCase()
    return emailsRows.filter(e =>
      e.order_id.toLowerCase().includes(s) ||
      e.email_to.toLowerCase().includes(s) ||
      e.subject.toLowerCase().includes(s) ||
      (e.provider || '').toLowerCase().includes(s)
    )
  }, [emailsRows, q])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.webhooks.title')}</h1>
          <p className={adminSubtitleClass}>Sistemler arası veri akışını ve otomatik bildirimleri izleyin.</p>
        </div>
        
        <div className="flex items-center gap-3 glass p-1.5 rounded-2xl border border-white/5 shadow-xl">
          <button 
            onClick={() => setTab('returns')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === 'returns' ? 'bg-cyan-400 text-[#0A0F1E] shadow-lg shadow-cyan-400/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Activity size={14} />
            {t('admin.webhooks.tabs.returns')}
          </button>
          <button 
            onClick={() => setTab('shipping')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === 'shipping' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Send size={14} />
            {t('admin.webhooks.tabs.shipping')}
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button 
            onClick={fetchData} 
            disabled={loading} 
            className={`${adminButtonSecondaryClass} !h-10 !px-4 !rounded-xl disabled:opacity-30`}
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCcw size={16} />
                <span className="hidden sm:inline">{t('admin.ui.refresh')}</span>
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="glass-strong rounded-[2rem] border border-white/5 overflow-hidden">
        <AdminToolbar
          storageKey="toolbar:webhook-events"
          search={{ 
            value: q, 
            onChange: setQ, 
            placeholder: tab === 'returns' ? t('admin.webhooks.search.returns') : t('admin.webhooks.search.shipping'), 
            focusShortcut: '/' 
          }}
          rightExtra={null}
          recordCount={(tab === 'returns' ? filteredReturns.length : filteredEmails.length)}
        />

        <div className="p-4 pt-0">
          {tab === 'returns' ? (
            <div className="space-y-4">
              <div className="px-4 py-2 rounded-xl bg-cyan-400/5 border border-cyan-400/10 flex items-center gap-3">
                <Terminal size={14} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{t('admin.webhooks.tip.rowAction')}</span>
              </div>
              
              <div ref={dragScrollRef1} className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0A0F1E]/40">
                <table className="w-full text-left">
                  <thead>
                    <tr className="glass-strong">
                      {colsRet.event && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.returnsTable.eventId')}</th>)}
                      {colsRet.order && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.returnsTable.order')}</th>)}
                      {colsRet.carrier && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.returnsTable.carrier')}</th>)}
                      {colsRet.status && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.returnsTable.statusMapped')}</th>)}
                      {colsRet.received && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.returnsTable.received')}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading && returnsRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <AdminSkeleton variant="table" count={5} rows={8} />
                        </td>
                      </tr>
                    ) : filteredReturns.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12">
                          <AdminEmptyState
                            icon={RefreshCcw}
                            title="İade Etkinliği Bulunamadı"
                            description="Şu an için kaydedilmiş herhangi bir iade webhook etkinliği bulunmuyor."
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredReturns.map((r, idx) => (
                        <tr key={String(r.id || idx)} className="group hover:bg-white/[0.02] transition-colors">
                          {colsRet.event && (<td className={`${adminTableCellClass} font-mono text-[11px] text-cyan-400/80`}>{r.event_id}</td>)}
                          {colsRet.order && (<td className={`${adminTableCellClass} font-mono text-[11px]`}>{r.order_id || '-'}</td>)}
                          {colsRet.carrier && (<td className={adminTableCellClass}>{r.carrier || '-'}</td>)}
                          {colsRet.status && (
                            <td className={adminTableCellClass}>
                              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-wider">
                                {r.status_mapped || r.status_raw || '-'}
                              </span>
                            </td>
                          )}
                          {colsRet.received && (<td className={`${adminTableCellClass} whitespace-nowrap opacity-60`}>{formatDateTime(r.received_at, lang)}</td>)}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div ref={dragScrollRef2} className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0A0F1E]/40">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="glass-strong">
                      {colsMail.order && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.emailsTable.order')}</th>)}
                      {colsMail.to && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.emailsTable.to')}</th>)}
                      {colsMail.subject && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.emailsTable.subject')}</th>)}
                      {colsMail.provider && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.emailsTable.provider')}</th>)}
                      {colsMail.created && (<th className={adminTableHeadCellClass}>{t('admin.webhooks.emailsTable.date')}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading && emailsRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <AdminSkeleton variant="table" count={5} rows={8} />
                        </td>
                      </tr>
                    ) : filteredEmails.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12">
                          <AdminEmptyState
                            icon={MailX}
                            title="E-Posta Etkinliği Bulunamadı"
                            description="Şu an için kaydedilmiş herhangi bir sevkiyat/kargo e-posta etkinliği bulunmuyor."
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredEmails.map((e, idx) => (
                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                          {colsMail.order && (<td className={`${adminTableCellClass} font-mono text-[11px] text-violet-400/80`}>{e.order_id}</td>)}
                          {colsMail.to && (<td className={`${adminTableCellClass} text-slate-400`}>{e.email_to}</td>)}
                          {colsMail.subject && (<td className={`${adminTableCellClass} max-w-xs truncate`}>{e.subject}</td>)}
                          {colsMail.provider && (
                            <td className={adminTableCellClass}>
                              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-black uppercase">{e.provider || '-'}</span>
                            </td>
                          )}
                          {colsMail.created && (<td className={`${adminTableCellClass} whitespace-nowrap opacity-60`}>{formatDateTime(e.created_at, lang)}</td>)}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminWebhookEventsPage
