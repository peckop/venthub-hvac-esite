'use client'

import { DollarSign } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import CurrencyRatesCard from '@/components/admin/pricing/CurrencyRatesCard'
import PricingSettingsFormModal, {
  DEFAULT_PRICING_SETTINGS,
  type PricingSettingsValues,
} from '@/components/admin/pricing/PricingSettingsFormModal'
import { useRole } from '@/hooks/useRole'
import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import {
  adminCardClass,
  adminSectionTitleClass,
  adminSubtitleClass,
} from '../../utils/adminUi'

const isPricingCurrencyArray = (
  value: unknown,
): value is PricingSettingsValues['enabled_currencies'] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((v) => v === 'TRY' || v === 'EUR' || v === 'USD')

const AdminPricingSettingsPage: React.FC = () => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<PricingSettingsValues | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('key', 'pricing')
        .maybeSingle()

      if (fetchError) throw fetchError

      const raw = (data?.value || {}) as Partial<PricingSettingsValues>

      setValues({
        base_currency: 'TRY',
        enabled_currencies: isPricingCurrencyArray(raw.enabled_currencies)
          ? raw.enabled_currencies
          : DEFAULT_PRICING_SETTINGS.enabled_currencies,
        default_vat_rate_pct:
          typeof raw.default_vat_rate_pct === 'number'
            ? raw.default_vat_rate_pct
            : DEFAULT_PRICING_SETTINGS.default_vat_rate_pct,
        default_price_is_vat_inclusive: !!raw.default_price_is_vat_inclusive,
        default_round_to:
          typeof raw.default_round_to === 'number'
            ? raw.default_round_to
            : DEFAULT_PRICING_SETTINGS.default_round_to,
        default_charm_ending:
          typeof raw.default_charm_ending === 'number' ? raw.default_charm_ending : null,
        display_spread_pct:
          typeof raw.display_spread_pct === 'number'
            ? raw.display_spread_pct
            : DEFAULT_PRICING_SETTINGS.display_spread_pct,
      })
    } catch (err: unknown) {
      console.error('Fetch pricing settings error:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const openModal = () => {
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <header className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.titles.pricing')}</h1>
          <p className={adminSubtitleClass}>{t('admin.common.settingsLoading')}</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdminSkeleton variant="form" fields={7} />
          <AdminSkeleton variant="table" rows={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.titles.pricing')}</h1>
          <p className={adminSubtitleClass}>{t('admin.pricing.settings.pageSubtitle')}</p>
        </header>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
          {t('admin.pricing.common.loadFailed')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Fiyatlandırma Varsayılanları Card */}
        <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group flex flex-col justify-between`}>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <DollarSign className="text-cyan-400" size={20} />
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                {t('admin.pricing.settings.defaultsCardTitle')}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.baseCurrencyLabel')}
                </span>
                <span className="font-semibold text-white">{values?.base_currency || '-'}</span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.enabledCurrenciesLabel')}
                </span>
                <span className="font-semibold text-white">
                  {values?.enabled_currencies?.join(', ') || '-'}
                </span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.defaultVatRatePctLabel')}
                </span>
                <span className="font-semibold text-white">%{values?.default_vat_rate_pct ?? '-'}</span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.defaultPriceIsVatInclusiveLabel')}
                </span>
                <span className="font-semibold text-white">
                  {values?.default_price_is_vat_inclusive ? t('admin.common.yes') : t('admin.common.no')}
                </span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.defaultRoundToLabel')}
                </span>
                <span className="font-semibold text-white">{values?.default_round_to ?? '-'}</span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.defaultCharmEndingLabel')}
                </span>
                <span className="font-semibold text-white">
                  {values?.default_charm_ending ?? t('admin.pricing.settings.defaultCharmEndingNone')}
                </span>
              </p>
              <p>
                <span className="text-slate-500 font-bold block text-xs uppercase tracking-wider">
                  {t('admin.pricing.settings.displaySpreadPctLabel')}
                </span>
                <span className="font-semibold text-white">%{values?.display_spread_pct ?? '-'}</span>
              </p>
            </div>
          </div>
          <div className="relative z-10 pt-6 border-t border-white/5">
            <button
              onClick={openModal}
              disabled={!hasWriteAccess}
              className="w-full py-3 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.edit')}
            </button>
          </div>
        </div>

        {/* Currency Rates Card */}
        <CurrencyRatesCard />
      </div>

      {/* Pricing Settings Form Modal */}
      {modalOpen && (
        <PricingSettingsFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialValues={values}
          onSuccess={fetchSettings}
        />
      )}
    </div>
  )
}

export default AdminPricingSettingsPage
