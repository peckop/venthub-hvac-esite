'use client'

import { CheckCircle, ChevronRight, Clock, FileText, Filter, Hourglass, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useAuth } from '../../../hooks/useAuth'
import { useLocalizedRoutes } from '../../../hooks/useLocalizedRoutes'
import { formatDate } from '../../../i18n/datetime'
import { useI18n } from '../../../i18n/I18nProvider'
import { QUOTE_STATUSES } from '../../../lib/quotes/quoteStatusMachine'
import { listMyQuotes, type QuoteWithItems } from '../../../lib/services/quoteService'

/**
 * /account/quotes — müşterinin teklif talepleri (T067-VH, cetvel Q4).
 * Durum etiketleri SSOT'taki statülerden çizilir; yerel geçiş listesi YOK (R1).
 */
export default function AccountQuotesPage() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  const router = useRouter()
  const [rows, setRows] = useState<QuoteWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const list = await listMyQuotes(supabase)
        if (mounted) setRows(list)
      } catch (e) {
        console.warn('Quotes load error', e)
        toast.error(t('quotes.fetchError'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (user) void load()
    return () => { mounted = false }
  }, [user, t])

  const statusClass = (s: string): string => {
    switch (s) {
      case 'requested': return 'bg-yellow-100 text-yellow-800'
      case 'quoted': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-slate-100 text-slate-600'
      default: return 'bg-air-blue/10 text-primary-navy'
    }
  }

  const statusIcon = (s: string): React.ReactNode => {
    switch (s) {
      case 'requested': return <Clock className="text-yellow-600" size={16} />
      case 'quoted': return <FileText className="text-blue-600" size={16} />
      case 'accepted': return <CheckCircle className="text-green-600" size={16} />
      case 'rejected': return <XCircle className="text-red-600" size={16} />
      case 'expired': return <Hourglass className="text-slate-500" size={16} />
      default: return <FileText className="text-gray-400" size={16} />
    }
  }

  const statusLabel = (s: string): string => t(`quotes.statusLabels.${s}`)

  const visible = rows.filter((r) => statusFilter === 'all' || r.status === statusFilter)

  return (
    <div className="min-h-50vh">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
              <FileText size={20} />
            </div>
            {t('quotes.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('quotes.subtitle')}</p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={12} /> {t('account.returns.filterStatus')}
            </span>
            {[
              { value: 'all', label: t('account.returns.filterAll', { count: rows.length }) },
              ...QUOTE_STATUSES.map((s) => ({ value: s as string, label: statusLabel(s) })),
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`h-8 px-3.5 rounded-lg text-xs font-bold transition-colors border ${statusFilter === opt.value
                  ? 'bg-primary-navy text-white border-primary-navy shadow-sm shadow-primary-navy/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-navy hover:text-primary-navy'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-20vh flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t('quotes.empty')}</h3>
          <p className="text-sm text-slate-500">{t('quotes.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => router.push(Routes.account.quoteDetail(q.id))}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md hover:border-primary-navy/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-primary-navy/5 text-primary-navy rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-slate-900 truncate">
                      {q.items[0]?.product_name ?? t('quotes.detail.title')}
                      {q.items.length > 1 && (
                        <span className="text-slate-500 font-semibold"> +{q.items.length - 1}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{formatDate(q.created_at, lang)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{t('quotes.itemsCount', { count: q.items.length })}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{t(`quotes.sourceLabels.${q.source}`)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${statusClass(q.status)}`}>
                    {statusIcon(q.status)}
                    {statusLabel(q.status)}
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
