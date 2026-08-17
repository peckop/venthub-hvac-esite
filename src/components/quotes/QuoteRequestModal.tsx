'use client'

import { FileText, Minus, Plus, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient } from '@/lib/supabase/client'

import { useAuth } from '../../hooks/useAuth'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import { createQuoteRequest, type QuoteSource } from '../../lib/services/quoteService'

/**
 * Teklif isteme modali — T067-VH v1 (cetvel: docs/standards/quote-standard.md §Q4).
 *
 * Giriş kapıları: PDP (tek kalem, adet düzenlenebilir) + sepet (fiyatsız kalemler).
 * Teklif LOGIN'lidir; oturum yoksa buton katmanı (QuoteRequestButton) login'e
 * yönlendirir, modal hiç açılmaz.
 *
 * Fiyat otoritesi (cetvel R5): bu bileşen fiyat kolonu YAZMAZ — yalnız ürün/adet/not
 * snapshot'ı gönderir; fiyatlama admin kuyruğunun işidir.
 */

export interface QuoteRequestModalItem {
  productId: string | null
  productName: string
  qty: number
}

interface QuoteRequestModalProps {
  open: boolean
  onClose: () => void
  source: QuoteSource
  sourceProjectId?: string | null
  items: QuoteRequestModalItem[]
  /** PDP tek-kalem akışında adet modal içinde değiştirilebilir. */
  qtyEditable?: boolean
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  open,
  onClose,
  source,
  sourceProjectId,
  items,
  qtyEditable = false,
}) => {
  const { t } = useI18n()
  const { user } = useAuth()
  const Routes = useLocalizedRoutes()
  const [note, setNote] = useState('')
  const [qtys, setQtys] = useState<number[]>(() => items.map((i) => i.qty))
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Modal yeniden açıldığında formu tazele (önceki talebin kalıntısı taşınmasın).
  useEffect(() => {
    if (open) {
      setQtys(items.map((i) => i.qty))
      setNote('')
      setSubmitted(false)
    }
  }, [open, items])

  if (!open) return null

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('quotes.request.loginRequired'))
      return
    }
    try {
      setSubmitting(true)
      await createQuoteRequest(supabaseBrowserClient, {
        userId: user.id,
        source,
        sourceProjectId: sourceProjectId ?? null,
        items: items.map((item, idx) => ({
          productId: item.productId,
          productName: item.productName,
          qty: qtys[idx] ?? item.qty,
          // Tek not alanı İLK kaleme yazılır (v1 — başlık notu yok, kolon kalemde).
          note: idx === 0 && note.trim() ? note.trim() : null,
        })),
      })
      toast.success(t('quotes.request.successToast'))
      setSubmitted(true)
    } catch (e) {
      console.error('Quote request error', e)
      toast.error(t('quotes.request.errorToast'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('quotes.request.title')}
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-primary-navy" />
            {t('quotes.request.title')}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label={t('quotes.request.cancel')}>
            <XCircle size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <p className="text-sm font-medium text-slate-700">{t('quotes.request.successToast')}</p>
            <div className="flex justify-end gap-3">
              <a
                href={Routes.account.quotes() as string}
                className="h-10 px-5 inline-flex items-center text-sm font-bold text-white bg-primary-navy hover:bg-industrial-gray rounded-lg shadow-sm shadow-primary-navy/20 transition-transform hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50"
              >
                {t('quotes.title')}
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t('quotes.request.itemsTitle')}
                </span>
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.productId ?? item.productName}-${idx}`}
                      className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.productName}</span>
                      {qtyEditable ? (
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQtys((prev) => prev.map((q, i) => (i === idx ? Math.max(1, q - 1) : q)))}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-navy hover:text-primary-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
                            aria-label={`${t('quotes.request.qty')} -`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900">{qtys[idx] ?? item.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQtys((prev) => prev.map((q, i) => (i === idx ? q + 1 : q)))}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary-navy hover:text-primary-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30"
                            aria-label={`${t('quotes.request.qty')} +`}
                          >
                            <Plus size={14} />
                          </button>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                          {t('quotes.request.qty')}: {item.qty}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label htmlFor="quote-request-note" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t('quotes.request.note')}
                </label>
                <textarea
                  id="quote-request-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder={t('quotes.request.notePh')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              >
                {t('quotes.request.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || items.length === 0}
                className="h-10 px-5 text-sm font-bold text-white bg-primary-navy hover:bg-industrial-gray rounded-lg shadow-sm shadow-primary-navy/20 transition-transform hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle" />
                ) : (
                  t('quotes.request.submit')
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default QuoteRequestModal
