import React from 'react'
import { adminSectionTitleClass, adminTableHeadCellClass } from '../../utils/adminUi'
import { supabase } from '../../lib/supabase'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { Density } from '../../components/admin/ColumnsMenu'

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
  const [tab, setTab] = React.useState<'returns' | 'shipping'>('returns')
  const [q, setQ] = React.useState('')
  const [density, setDensity] = React.useState<Density>('comfortable')
  const [loading, setLoading] = React.useState(false)

  const [returnsRows, setReturnsRows] = React.useState<ReturnEventRow[]>([])
  const [emailsRows, setEmailsRows] = React.useState<EmailEventRow[]>([])

  const STORAGE_KEY = 'toolbar:webhook-events'
  const [colsRet, setColsRet] = React.useState({ event: true, order: true, carrier: true, status: true, received: true })
  const [colsMail, setColsMail] = React.useState({ order: true, to: true, subject: true, provider: true, created: true })

  React.useEffect(()=>{
    try {
      const d = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
      const cr = localStorage.getItem(`${STORAGE_KEY}:retcols`)
      if (cr) setColsRet(prev => ({ ...prev, ...JSON.parse(cr) }))
      const cm = localStorage.getItem(`${STORAGE_KEY}:mailcols`)
      if (cm) setColsMail(prev => ({ ...prev, ...JSON.parse(cm) }))
    } catch {}
  },[])
  React.useEffect(()=>{ try{ localStorage.setItem(`${STORAGE_KEY}:density`, density) }catch{} }, [density])
  React.useEffect(()=>{ try{ localStorage.setItem(`${STORAGE_KEY}:retcols`, JSON.stringify(colsRet)) }catch{} }, [colsRet])
  React.useEffect(()=>{ try{ localStorage.setItem(`${STORAGE_KEY}:mailcols`, JSON.stringify(colsMail)) }catch{} }, [colsMail])

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

  React.useEffect(()=>{ fetchData() }, [fetchData])

  const headPad = density === 'compact' ? 'px-2 py-2' : ''

  const filteredReturns = React.useMemo(() => {
    if (!q.trim()) return returnsRows
    const s = q.toLowerCase()
    return returnsRows.filter(r =>
      r.event_id.toLowerCase().includes(s) ||
      (r.order_id||'').toLowerCase().includes(s) ||
      (r.return_id||'').toLowerCase().includes(s) ||
      (r.carrier||'').toLowerCase().includes(s) ||
      (r.status_mapped||'').toLowerCase().includes(s)
    )
  }, [returnsRows, q])

  const filteredEmails = React.useMemo(() => {
    if (!q.trim()) return emailsRows
    const s = q.toLowerCase()
    return emailsRows.filter(e =>
      e.order_id.toLowerCase().includes(s) ||
      e.email_to.toLowerCase().includes(s) ||
      e.subject.toLowerCase().includes(s) ||
      (e.provider||'').toLowerCase().includes(s)
    )
  }, [emailsRows, q])

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>Webhook Olayları</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>setTab('returns')} className={`px-3 py-2 rounded ${tab==='returns'?'bg-primary-navy text-white':'border border-gray-200'}`}>Returns</button>
          <button onClick={()=>setTab('shipping')} className={`px-3 py-2 rounded ${tab==='shipping'?'bg-primary-navy text-white':'border border-gray-200'}`}>Kargo E‑postaları</button>
          <button onClick={fetchData} disabled={loading} className="px-3 py-2 rounded border border-gray-200 bg-white hover:border-primary-navy text-sm whitespace-nowrap">{loading ? 'Yükleniyor…' : 'Yenile'}</button>
        </div>
      </header>

      <AdminToolbar
        storageKey="toolbar:webhook-events"
        search={{ value: q, onChange: setQ, placeholder: tab==='returns' ? 'event_id, order_id, return_id, carrier, status_mapped' : 'order_id, email, subject, provider', focusShortcut: '/' }}
        rightExtra={null}
        recordCount={(tab==='returns'? filteredReturns.length : filteredEmails.length)}
      />

      {tab === 'returns' ? (
        <section className="bg-white rounded-lg shadow-hvac-md overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {colsRet.event && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Event ID</th>)}
                {colsRet.order && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Order</th>)}
                {colsRet.carrier && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Kargo</th>)}
                {colsRet.status && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Durum (map)</th>)}
                {colsRet.received && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Received</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr><td className="px-4 py-6">Kayıt yok</td></tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={String(r.id)} className="border-t border-gray-100">
                    {colsRet.event && (<td className="px-3 py-2 font-mono text-xs">{r.event_id}</td>)}
                    {colsRet.order && (<td className="px-3 py-2 font-mono text-xs">{r.order_id || '-'}</td>)}
                    {colsRet.carrier && (<td className="px-3 py-2">{r.carrier || '-'}</td>)}
                    {colsRet.status && (<td className="px-3 py-2">{r.status_mapped || r.status_raw || '-'}</td>)}
                    {colsRet.received && (<td className="px-3 py-2 whitespace-nowrap">{new Date(r.received_at).toLocaleString('tr-TR')}</td>)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white rounded-lg shadow-hvac-md overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {colsMail.order && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Order</th>)}
                {colsMail.to && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Kime</th>)}
                {colsMail.subject && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Konu</th>)}
                {colsMail.provider && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Provider</th>)}
                {colsMail.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Tarih</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredEmails.length === 0 ? (
                <tr><td className="px-4 py-6">Kayıt yok</td></tr>
              ) : (
                filteredEmails.map((e, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    {colsMail.order && (<td className="px-3 py-2 font-mono text-xs">{e.order_id}</td>)}
                    {colsMail.to && (<td className="px-3 py-2">{e.email_to}</td>)}
                    {colsMail.subject && (<td className="px-3 py-2">{e.subject}</td>)}
                    {colsMail.provider && (<td className="px-3 py-2">{e.provider || '-'}</td>)}
                    {colsMail.created && (<td className="px-3 py-2 whitespace-nowrap">{new Date(e.created_at).toLocaleString('tr-TR')}</td>)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

export default AdminWebhookEventsPage
