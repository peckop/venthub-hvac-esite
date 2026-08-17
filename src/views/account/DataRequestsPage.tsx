'use client'

import { AlertCircle, Clock, Loader2, Send, ShieldCheck } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import { computeDueState } from '@/lib/kvkk/dueState'
import {
  createDataSubjectRequest,
  type DataSubjectRequest,
  listDataSubjectRequests,
  REQUEST_TYPES,
  type RequestType,
} from '@/lib/services/dataSubjectRequest.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../i18n/datetime'

/**
 * KVKK başvuru kanalı — veri sahibinin kendi yüzü (T063 PR-2).
 *
 * Cetvel `legal-compliance-standard.md §3.6`. İki şey BİLİNÇLİ olarak burada YOK:
 *   • "Hesabımı sil" düğmesi — §3.1'e göre hukuki zorunluluk değil ve teknik olarak
 *     silme değil ANONİMLEŞTİRME'dir; yanlış yazılmış bir düğme mevzuata aykırı kayıt
 *     imhası üretir. Talep buradan açılır, yerine getirme admin tarafında yürür.
 *   • Süre/durum/sonuç alanları — kullanıcı bunları YAZAMAZ (kolon-GRANT ile DB'de
 *     kapalı); yalnız görür. Defter ispat aracıdır, tarafların beyanı değil.
 *
 * Kimlik tevsiki oturumdan gelir: RLS `applicant_email = JWT email` şartını koyar,
 * yani kullanıcı başkasının adına talep açamaz (Tebliğ m.5 karşılığı).
 */
const DataRequestsPage: React.FC = () => {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const [rows, setRows] = useState<DataSubjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [reqType, setReqType] = useState<RequestType>('access')
  const [sending, setSending] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      // RLS: yalnız kendi satırları döner (p_dsr_owner_select).
      const data = await listDataSubjectRequests(supabaseBrowserClient)
      setRows(data)
    } catch (e) {
      console.error('[account/data-requests] load failed:', e)
      toast.error(t('account.dataRequests.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { refresh() }, [refresh])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    const email = user?.email
    if (!email) {
      toast.error(t('account.dataRequests.authRequired'))
      return
    }
    setSending(true)
    try {
      await createDataSubjectRequest(supabaseBrowserClient, {
        applicant_email: email,
        request_type: reqType,
        user_id: user.id,
      })
      toast.success(t('account.dataRequests.submitted'))
      await refresh()
    } catch (err) {
      console.error('[account/data-requests] submit failed:', err)
      toast.error(t('account.dataRequests.submitError'))
    } finally {
      setSending(false)
    }
  }

  const now = new Date()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-navy" />
          {t('account.dataRequests.title')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{t('account.dataRequests.subtitle')}</p>
      </div>

      {/* Başvuru formu */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="dsr-type" className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('account.dataRequests.typeLabel')}
          </label>
          <select
            id="dsr-type"
            value={reqType}
            onChange={(e) => setReqType(e.target.value as RequestType)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy"
          >
            {REQUEST_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`account.dataRequests.types.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl bg-air-blue/20 p-4 mb-4 text-sm text-steel-gray">
          <p className="font-medium text-slate-700 mb-1">{t('account.dataRequests.noticeTitle')}</p>
          <p>{t('account.dataRequests.noticeBody')}</p>
        </div>

        <button
          type="submit"
          disabled={sending || !user?.email}
          className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {t('account.dataRequests.submit')}
        </button>
      </form>

      {/* Kendi taleplerim */}
      <h3 className="text-lg font-bold text-slate-900 mb-3">{t('account.dataRequests.myRequests')}</h3>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-slate-500">{t('account.dataRequests.emptyDesc')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const due = computeDueState(r, now)
            return (
              <li key={r.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">
                      {t(`account.dataRequests.types.${r.request_type}`)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t('account.dataRequests.receivedAt', { date: formatDate(r.received_at, lang) })}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {t(`account.dataRequests.statuses.${r.status}`)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  {due.frozen ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck size={13} /> {t('account.dataRequests.finalized')}
                    </span>
                  ) : due.overdue ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-error-red">
                      <AlertCircle size={13} /> {t('account.dataRequests.overdue')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <Clock size={13} />
                      {t('account.dataRequests.daysLeft', { days: String(Math.max(due.daysLeft, 0)) })}
                    </span>
                  )}
                </div>

                {r.outcome && (
                  <p className="mt-3 text-sm text-slate-700 border-l-2 border-primary-navy pl-3">{r.outcome}</p>
                )}
                {r.retained_data_note && (
                  <p className="mt-2 text-xs text-slate-500 border-l-2 border-slate-200 pl-3">
                    {t('account.dataRequests.retainedLabel')}: {r.retained_data_note}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DataRequestsPage
