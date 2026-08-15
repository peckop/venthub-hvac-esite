'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useRole } from '@/hooks/useRole'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { toSupabaseJson } from '@/lib/type-converters'

import {
  adminButtonPrimaryClass,
  adminInputClass,
  adminSettingsLabelClass,
} from '../../../utils/adminUi'
import { useConfirm } from '../overlay/ConfirmProvider'

// --- Şema + tip + form-varsayılanı (SSOT bu modülde; view bu tipi/const'u import eder) ---
// UYARI: bu değerler YALNIZ formun başlangıç değerleridir — motor/servislere (lib/services/pricing.service.ts) BAĞLANMAZ.

export const PRICING_CURRENCY_OPTIONS = ['TRY', 'EUR', 'USD'] as const
export type PricingCurrencyCode = (typeof PRICING_CURRENCY_OPTIONS)[number]

// i18n şema fabrikası (ProductFormModal deseni): mesajlar aktif dilden gelir.
export const buildPricingSettingsSchema = (t: (key: string) => string) => {
  const v = (key: string) => t(`admin.pricing.settings.validation.${key}`)
  return z.object({
    base_currency: z.literal('TRY'),
    enabled_currencies: z
      .array(z.enum(PRICING_CURRENCY_OPTIONS))
      .min(1, v('atLeastOneCurrency'))
      .refine((arr) => arr.includes('TRY'), { message: v('tryRequired') }),
    default_vat_rate_pct: z
      .coerce.number({ invalid_type_error: v('invalidNumber') })
      .min(0, v('vatRange'))
      .max(100, v('vatRange')),
    default_price_is_vat_inclusive: z.boolean(),
    default_round_to: z
      .coerce.number({ invalid_type_error: v('invalidNumber') })
      .gt(0, v('positiveNumber')),
    default_charm_ending: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null
      const num = typeof val === 'number' ? val : Number(val)
      return Number.isNaN(num) ? val : num
    }, z.number({ invalid_type_error: v('invalidNumber') }).gte(0, v('charmRange')).lt(1, v('charmRange')).nullable()),
    display_spread_pct: z
      .coerce.number({ invalid_type_error: v('invalidNumber') })
      .min(-50, v('spreadRange'))
      .max(50, v('spreadRange')),
  })
}

// Tip/SSOT örneği (mesajsız — yalnız tip çıkarımı ve dış tüketiciler için)
export const pricingSettingsSchema = buildPricingSettingsSchema((key) => key)

export type PricingSettingsValues = z.infer<typeof pricingSettingsSchema>

export const DEFAULT_PRICING_SETTINGS: PricingSettingsValues = {
  base_currency: 'TRY',
  enabled_currencies: ['TRY'],
  default_vat_rate_pct: 20,
  default_price_is_vat_inclusive: false,
  default_round_to: 0.01,
  default_charm_ending: null,
  display_spread_pct: 0,
}

interface PricingSettingsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: PricingSettingsValues | null
  onSuccess: () => void
}

const PricingSettingsFormModal: React.FC<PricingSettingsFormModalProps> = ({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
}) => {
  const { t } = useI18n()
  const confirm = useConfirm()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')
  const [saving, setSaving] = useState(false)

  const schema = React.useMemo(() => buildPricingSettingsSchema(t), [t])
  const form = useForm<PricingSettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || DEFAULT_PRICING_SETTINGS,
  })

  // Modal açıldığında / değerler değiştiğinde formu doldur
  useEffect(() => {
    if (open) {
      form.reset(initialValues || DEFAULT_PRICING_SETTINGS)
    }
  }, [open, initialValues, form])

  /**
   * Kirli-form guard'i — window.confirm yerine ConfirmDialog (cetvel §4.7).
   * Kapatma AKISI DEGISTI: eskiden confirm senkron blokluyordu; artik kapatma
   * ISTEGI once yakalanir, onay beklenir, ancak onaylanirsa gercekten kapatilir.
   * Degisiklikleri atmak GERI ALINAMAZ -> tone:'danger'.
   */
  const handleClose = async () => {
    if (!form.formState.isDirty) {
      onOpenChange(false)
      return
    }
    const ok = await confirm({
      description: t('admin.pricing.settings.unsavedChangesConfirm'),
      confirmLabel: t('admin.confirm.discardChanges'),
      tone: 'danger',
    })
    if (ok) onOpenChange(false)
  }

  const handleOpenChange = (openVal: boolean) => {
    if (!openVal) {
      handleClose()
    } else {
      onOpenChange(true)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [form.formState.isDirty])

  const enabledCurrencies = form.watch('enabled_currencies') || []

  const toggleCurrency = (code: PricingCurrencyCode) => {
    if (code === 'TRY') return // taban para birimi kapatılamaz
    const current = form.getValues('enabled_currencies') || []
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code]
    form.setValue('enabled_currencies', next, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (values: PricingSettingsValues) => {
    setSaving(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id || null
      // base_currency her zaman sabit — form dışı zorlanır
      const payload: PricingSettingsValues = { ...values, base_currency: 'TRY' }

      await mutateWithAudit(supabase, {
        resource: 'pricing',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: 'pricing',
        before: initialValues,
        after: payload,
        fn: async () => {
          const { error } = await supabase
            .from('site_settings')
            .upsert({
              key: 'pricing',
              value: toSupabaseJson(payload),
              updated_by: userId,
              updated_at: new Date().toISOString(),
            })
          if (error) throw error
        },
      })

      toast.success(t('admin.pricing.settings.saveSuccess'))
      onSuccess()
      onOpenChange(false)
    } catch (e: unknown) {
      console.error('Save pricing settings error:', e)
      const msg =
        e instanceof AdminPermissionError
          ? t('admin.pricing.common.noPermission')
          : e instanceof Error
          ? e.message
          : t('admin.pricing.settings.saveError')
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
        <Dialog.Content
          // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
          aria-modal="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col overflow-hidden max-h-90vh">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {t('admin.pricing.settings.defaultsCardTitle')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400 mt-1">
                {t('admin.pricing.settings.formDesc')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="pricing-settings-modal-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Taban Para Birimi — salt-okunur */}
              <div className="space-y-2">
                <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.baseCurrencyLabel')}</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="px-3 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-black tracking-widest">
                    {DEFAULT_PRICING_SETTINGS.base_currency}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('admin.pricing.settings.baseCurrencyReadonlyNote')}
                  </span>
                </div>
              </div>

              {/* Etkin Para Birimleri */}
              <div className="space-y-2">
                <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.enabledCurrenciesLabel')}</label>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  {t('admin.pricing.settings.enabledCurrenciesDesc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {PRICING_CURRENCY_OPTIONS.map((code) => {
                    const checked = enabledCurrencies.includes(code)
                    const disabled = code === 'TRY'
                    return (
                      <label
                        key={code}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                        } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleCurrency(code)}
                        />
                        <span className="text-sm font-black">{code}</span>
                      </label>
                    )
                  })}
                </div>
                {form.formState.errors.enabled_currencies?.message ? (
                  <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                    {String(form.formState.errors.enabled_currencies.message)}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Varsayılan KDV Oranı */}
                <div className="space-y-2">
                  <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.defaultVatRatePctLabel')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className={adminInputClass}
                    {...form.register('default_vat_rate_pct')}
                  />
                  {form.formState.errors.default_vat_rate_pct?.message ? (
                    <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                      {String(form.formState.errors.default_vat_rate_pct.message)}
                    </p>
                  ) : null}
                </div>

                {/* Varsayılan Yuvarlama Birimi */}
                <div className="space-y-2">
                  <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.defaultRoundToLabel')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={adminInputClass}
                    {...form.register('default_round_to')}
                    placeholder="0.01"
                  />
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    {t('admin.pricing.settings.defaultRoundToDesc')}
                  </p>
                  {form.formState.errors.default_round_to?.message ? (
                    <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                      {String(form.formState.errors.default_round_to.message)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Varsayılan Charm Kuyruğu */}
                <div className="space-y-2">
                  <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.defaultCharmEndingLabel')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={adminInputClass}
                    {...form.register('default_charm_ending')}
                    placeholder={t('admin.pricing.settings.defaultCharmEndingNone')}
                  />
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    {t('admin.pricing.settings.defaultCharmEndingDesc')}
                  </p>
                  {form.formState.errors.default_charm_ending?.message ? (
                    <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                      {String(form.formState.errors.default_charm_ending.message)}
                    </p>
                  ) : null}
                </div>

                {/* Gösterim Spread */}
                <div className="space-y-2">
                  <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.displaySpreadPctLabel')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="-50"
                    max="50"
                    className={adminInputClass}
                    {...form.register('display_spread_pct')}
                  />
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    {t('admin.pricing.settings.displaySpreadPctDesc')}
                  </p>
                  {form.formState.errors.display_spread_pct?.message ? (
                    <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                      {String(form.formState.errors.display_spread_pct.message)}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Varsayılan Fiyat KDV Dahil mi */}
              <div className="space-y-2">
                <label className={adminSettingsLabelClass}>{t('admin.pricing.settings.defaultPriceIsVatInclusiveLabel')}</label>
                <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                    {...form.register('default_price_is_vat_inclusive')}
                  />
                  <div className="space-y-1">
                    <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                      {t('admin.pricing.settings.defaultPriceIsVatInclusiveLabel')}
                    </span>
                    <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                      {t('admin.pricing.settings.defaultPriceIsVatInclusiveDesc')}
                    </span>
                  </div>
                </label>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/2">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="submit"
              form="pricing-settings-modal-form"
              disabled={saving || !hasWriteAccess}
              className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} className="group-hover:-translate-y-px transition-transform" />
              )}
              {t('admin.common.saveChanges')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default PricingSettingsFormModal
