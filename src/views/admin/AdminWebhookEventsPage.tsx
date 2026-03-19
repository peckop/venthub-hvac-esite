'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
import { useI18n } from '../../i18n/I18nProvider'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminTableContainerClass 
} from '../../utils/adminUi'
import { Clock, Database } from 'lucide-react'

const AdminWebhookEventsPage: React.FC = () => {
  const { t: _t } = useI18n()
  const [events, setEvents] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: fetchErr } = await (supabase as unknown as SupabaseClient<Database>)
          .from('webhook_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (fetchErr) throw fetchErr
        setEvents(data || [])
      } catch (err) {
        console.error('Webhook load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={adminSectionTitleClass}>{_t('admin.titles.webhookEvents') || 'Webhook Logları'}</h1>
          <p className={adminSubtitleClass}>Sisteme gelen ve giden tüm webhook trafik kayıtlarını inceleyin.</p>
        </div>
      </div>

      <div className={adminTableContainerClass}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="glass-md">
                <th className={adminTableHeadCellClass}>Zaman</th>
                <th className={adminTableHeadCellClass}>Servis</th>
                <th className={adminTableHeadCellClass}>Durum</th>
                <th className={adminTableHeadCellClass}>Payload</th>
                <th className={adminTableHeadCellClass}>Yanıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
              ) : (
                (events as unknown as Record<string, unknown>[]).map((event, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className={adminTableCellClass}>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs">{new Date(event.created_at as string).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className={adminTableCellClass}>
                      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded uppercase tracking-wider">
                        {(event.service as string) || 'iyzico'}
                      </span>
                    </td>
                    <td className={adminTableCellClass}>
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${event.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-xs font-medium uppercase">{event.status as string}</span>
                    </td>
                    <td className={adminTableCellClass}>
                      <button
                        onClick={() => {
                          const payload = event.payload || event.request_body;
                          setSelectedEvent(payload ? JSON.stringify(payload, null, 2) : 'No payload');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                      >
                        {_t('admin.webhooks.viewPayload') || 'Payload'}
                      </button>
                    </td>
                    <td className={adminTableCellClass}>
                      <button
                        onClick={() => {
                          const response = event.response_body || event.error_message;
                          setSelectedEvent(response ? JSON.stringify(response, null, 2) : 'No response');
                        }}
                        className="text-slate-400 hover:text-white font-bold text-xs"
                      >
                        {_t('admin.webhooks.viewResponse') || 'Yanıt'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-[#0A0F1E]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#12192C] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2"><Database size={18} className="text-cyan-400" /> Detay</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white font-bold">Kapat</button>
            </div>
            <pre className="p-6 overflow-auto text-[11px] font-mono text-cyan-100 bg-[#0A0F1E]/50 custom-scrollbar leading-relaxed">
              {selectedEvent}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWebhookEventsPage
