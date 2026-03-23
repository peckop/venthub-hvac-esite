'use client';
/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Code
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AdminWebhookEventsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<unknown[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<unknown | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('webhook_events' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchErr) throw fetchErr;
      setEvents(data || []);
    } catch (err) {
      console.error('Webhook events fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-gray flex items-center gap-2">
            <Activity className="text-primary-navy" />
            Webhook Olayları
          </h1>
          <p className="text-steel-gray text-sm">Sistem dışı gelen API bildirimlerini takip edin.</p>
        </div>
        <button onClick={fetchEvents} className="p-2 text-steel-gray hover:text-primary-navy rounded-lg">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-steel-gray uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Olay Tipi</th>
                <th className="px-4 py-3">Kaynak</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {events.map((event: any /* build-fallback */) => (
                <tr 
                  key={event.id} 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${(selectedEvent as any)?.id === event.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className="px-4 py-4 font-bold text-industrial-gray">{event.event_type}</td>
                  <td className="px-4 py-4 text-steel-gray">{event.provider}</td>
                  <td className="px-4 py-4">
                    {event.status === 'processed' ? (
                      <span className="flex items-center gap-1 text-success-green font-bold text-xs">
                        <CheckCircle2 size={14} /> İşlendi
                      </span>
                    ) : event.status === 'failed' ? (
                      <span className="flex items-center gap-1 text-red-500 font-bold text-xs">
                        <XCircle size={14} /> Hata
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-warning-orange font-bold text-xs">
                        <Clock size={14} /> Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-steel-gray font-medium text-xs">
                    {format(new Date(event.created_at), 'd MMM HH:mm', { locale: tr })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
          <h3 className="text-lg font-bold text-industrial-gray mb-4 flex items-center gap-2">
            <Code size={18} className="text-primary-navy" />
            Olay Detayı
          </h3>
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-indigo-300 font-mono">
                  {JSON.stringify((selectedEvent as any).payload, null, 2)}
                </pre>
              </div>
              {(selectedEvent as any).error_message && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs font-bold text-red-600 mb-1 uppercase">Hata Mesajı</p>
                  <p className="text-xs text-red-500">{(selectedEvent as any).error_message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm italic">
              İncelemek için listeden bir olay seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWebhookEventsPage;
