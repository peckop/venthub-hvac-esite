'use client'

import { ArrowLeft, CheckCircle, FileText, Hourglass, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useAuth } from '../../../hooks/useAuth'
import { useLocalizedRoutes } from '../../../hooks/useLocalizedRoutes'
import { formatDate } from '../../../i18n/datetime'
import { formatCurrency } from '../../../i18n/format'
import { useI18n } from '../../../i18n/I18nProvider'
import { allowedCustomerQuoteActions } from '../../../lib/quotes/quoteStatusMachine'
import { decideQuote, getQuoteDetail, type QuoteWithItems } from '../../../lib/services/quoteService'

/**
 * /account/quotes/detail?id=<uuid> — teklif detayı + müşteri kararı (T067-VH).
 *
 * Karar düğmeleri SSOT'tan çizilir (`allowedCustomerQuoteActions`, R1) — yerel
 * geçiş listesi yok. Fiyat kolonları burada YALNIZ OKUNUR (cetvel R5).
 * `useSearchParams` tüketicisi — app sayfası <Suspense> ile sarar (kural 5).
 */
export default function QuoteDetailPage() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams?.get('id') || ''

  const [quote, setQuote] = useState<QuoteWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(false)

  const load = useCallback(async () => {
    if (!quoteId) {
      setQuote(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const detail = await getQuoteDetail(supabase, quoteId)
      setQuote(detail)
    } catch (e) {
      console.warn('Quote detail load error', e)
      toast.error(t('quotes.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [quoteId, t])

  useEffect(() => {
    if (user) void load()
  }, [user, load])

  const statusLabel = (s: string): string => t(`quotes.statusLabels.${s}`)

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

  const handleDecision = async (decision: 'accepted' | 'rejected') => {
    if (!quote) return
    const confirmKey = decision === 'accepted' ? 'quotes.detail.acceptConfirm' : 'quotes.detail.rejectConfirm'
    if (!window.confirm(t(confirmKey))) return
    try {
      setDeciding(true)
      await decideQuote(supabase, quote, decision)
      toast.success(t('quotes.detail.decisionSuccess'))
      await load()
    } catch (e) {
      console.error('Quote decision error', e)
      toast.error(t('quotes.detail.decisionError'))
    } finally {
      setDeciding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-20vh flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('quotes.detail.notFound')}</h3>
        <button
          type="button"
          onClick={() => router.push(Routes.account.quotes())}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-navy hover:text-industrial-gray transition-colors"
        >
          <ArrowLeft size={16} />
          {t('quotes.detail.backToList')}
        </button>
      </div>
    )
  }

  // Fiyatlanmış kalemler üzerinden toplam — yalnız TÜM kalemler fiyatlı ve tek para
  // biriminde ise gösterilir (kısmi toplamı "Toplam" diye sunmak yanıltıcı — W4b dersi).
  const allPriced = quote.items.length > 0 && quote.items.every((i) => typeof i.unit_price === 'number')
  const currencies = new Set(quote.items.map((i) => i.currency ?? 'TRY'))
  const singleCurrency = currencies.size === 1 ? [...currencies][0] : null
  const total = allPriced && singleCurrency
    ? quote.items.reduce((sum, i) => sum + Number(i.unit_price) * i.qty, 0)
    : null

  const actions = allowedCustomerQuoteActions(quote.status)

  return (
    <div className="min-h-50vh space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(Routes.account.quotes())}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary-navy hover:border-primary-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
            aria-label={t('quotes.detail.backToList')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('quotes.detail.title')}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('quotes.detail.requestedAt')}: {formatDate(quote.created_at, lang)}
              <span className="mx-2 text-slate-300">•</span>
              {t(`quotes.sourceLabels.${quote.source}`)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${statusClass(quote.status)}`}>
          {statusLabel(quote.status)}
        </span>
      </div>

      {quote.status === 'requested' && (
        <div className="bg-air-blue rounded-xl p-4 flex items-center gap-3">
          <Hourglass size={18} className="text-primary-navy shrink-0" />
          <p className="text-sm font-medium text-steel-gray">{t('quotes.detail.awaitingPricing')}</p>
        </div>
      )}

      {quote.status === 'accepted' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">{t('quotes.detail.acceptedNext')}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('quotes.detail.itemsTitle')}</h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm max-md:text-xs">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">{t('quotes.detail.product')}</th>
                <th className="px-5 py-3 text-right">{t('quotes.detail.qty')}</th>
                <th className="px-5 py-3 text-right">{t('quotes.detail.unitPrice')}</th>
                <th className="px-5 py-3 text-right">{t('quotes.detail.lineTotal')}</th>
                <th className="px-5 py-3 text-right">{t('quotes.detail.validUntil')}</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{item.product_name}</div>
                    {item.note && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {t('quotes.detail.note')}: {item.note}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-700">{item.qty}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-700">
                    {typeof item.unit_price === 'number'
                      ? formatCurrency(Number(item.unit_price), lang, { currency: item.currency ?? 'TRY' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">
                    {typeof item.unit_price === 'number'
                      ? formatCurrency(Number(item.unit_price) * item.qty, lang, { currency: item.currency ?? 'TRY' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500">
                    {item.valid_until ? formatDate(item.valid_until, lang) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {total !== null && singleCurrency && (
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={3} className="px-5 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-xs">
                    {t('quotes.detail.total')}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-primary-navy text-base">
                    {formatCurrency(total, lang, { currency: singleCurrency })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex justify-end gap-3">
          {actions.includes('rejected') && (
            <button
              type="button"
              onClick={() => void handleDecision('rejected')}
              disabled={deciding}
              className="h-11 px-6 inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:opacity-50"
            >
              <XCircle size={16} />
              {t('quotes.detail.reject')}
            </button>
          )}
          {actions.includes('accepted') && (
            <button
              type="button"
              onClick={() => void handleDecision('accepted')}
              disabled={deciding}
              className="h-11 px-6 inline-flex items-center gap-2 text-sm font-bold text-white bg-primary-navy hover:bg-industrial-gray rounded-lg shadow-sm shadow-primary-navy/20 transition-transform hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              {t('quotes.detail.accept')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
