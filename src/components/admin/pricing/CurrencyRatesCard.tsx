'use client'

import { AlertTriangle, Coins, PlusCircle } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { formatDate } from '@/i18n/datetime'
import { formatNumber } from '@/i18n/format'
import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { adminCardClass } from '../../../utils/adminUi'
import AdminSkeleton from '../AdminSkeleton'

interface CurrencyRateRow {
  quote_ccy: string
  rate: number
  source: string
  effective_date: string
  fetched_at: string
  spread_pct: number
}

const STALE_THRESHOLD_DAYS = 3

const isStale = (effectiveDate: string): boolean => {
  const eff = new Date(effectiveDate)
  if (Number.isNaN(eff.getTime())) return false
  const now = new Date()
  const diffMs = now.getTime() - eff.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= STALE_THRESHOLD_DAYS
}

const daysSince = (effectiveDate: string): number => {
  const eff = new Date(effectiveDate)
  if (Number.isNaN(eff.getTime())) return 0
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - eff.getTime()) / (1000 * 60 * 60 * 24)))
}

const sourceBadgeClass = (source: string): string =>
  source === 'tcmb'
    ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400'
    : 'bg-amber-400/10 border-amber-400/20 text-amber-400'

const CurrencyRatesCard: React.FC = () => {
  const { t, lang } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rates, setRates] = useState<CurrencyRateRow[]>([])

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('currency_rates')
        .select('quote_ccy, rate, source, effective_date, fetched_at, spread_pct')
        .order('effective_date', { ascending: false })
        .order('fetched_at', { ascending: false })
        .limit(30) // append-only tablo büyür; en-güncel seçim için son satırlar yeter

      if (fetchError) throw fetchError

      // Her para birimi için en güncel satırı al (zaten effective_date/fetched_at desc sıralı)
      const latestByCcy = new Map<string, CurrencyRateRow>()
      for (const row of data || []) {
        if (!latestByCcy.has(row.quote_ccy)) {
          latestByCcy.set(row.quote_ccy, row)
        }
      }
      setRates(Array.from(latestByCcy.values()))
    } catch (err: unknown) {
      console.error('Fetch currency_rates error:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  return (
    <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group`}>
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Coins className="text-cyan-400" size={20} />
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              {t('admin.pricing.settings.currencyRates.title')}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              {t('admin.pricing.settings.currencyRates.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <AdminSkeleton variant="table" rows={3} />
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
            {t('admin.pricing.common.loadFailed')}
          </div>
        ) : rates.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-slate-500 text-sm font-bold text-center">
            {t('admin.pricing.settings.currencyRates.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pr-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    {t('admin.pricing.settings.currencyRates.columnCurrency')}
                  </th>
                  <th className="py-3 pr-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    {t('admin.pricing.settings.currencyRates.columnRate')}
                  </th>
                  <th className="py-3 pr-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    {t('admin.pricing.settings.currencyRates.columnSource')}
                  </th>
                  <th className="py-3 pr-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    {t('admin.pricing.settings.currencyRates.columnDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rates.map((row) => {
                  const stale = isStale(row.effective_date)
                  return (
                    <tr key={row.quote_ccy}>
                      <td className="py-3 pr-4 text-sm font-black text-white">{row.quote_ccy}</td>
                      <td className="py-3 pr-4 text-sm font-bold text-slate-200 font-mono">
                        {formatNumber(row.rate, lang, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${sourceBadgeClass(row.source)}`}
                        >
                          {row.source === 'tcmb'
                            ? t('admin.pricing.settings.currencyRates.sourceTcmb')
                            : t('admin.pricing.settings.currencyRates.sourceManual')}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-slate-300">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(row.effective_date, lang)}</span>
                          {stale && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black"
                              title={t('admin.pricing.settings.currencyRates.staleWarning', { days: daysSince(row.effective_date) })}
                            >
                              <AlertTriangle size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && rates.length > 0 && (
        <div className="relative z-10 pt-6 border-t border-white/5 space-y-3">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
            {t('admin.pricing.settings.currencyRates.spreadLabel')}
          </p>
          <div className="flex flex-wrap gap-3">
            {rates.map((row) => (
              <span
                key={row.quote_ccy}
                className="px-3 py-1.5 rounded-xl bg-white/3 border border-white/10 text-xs font-bold text-slate-300"
              >
                {row.quote_ccy}: {formatNumber(row.spread_pct, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 pt-6 border-t border-white/5">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title={t('admin.pricing.settings.manualRate.soon')}
          className="w-full py-3 flex items-center justify-center gap-2 bg-white/3 border border-white/5 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl opacity-50 cursor-not-allowed"
        >
          <PlusCircle size={16} />
          {t('admin.pricing.settings.currencyRates.addManual')}
        </button>
      </div>
    </div>
  )
}

export default CurrencyRatesCard
