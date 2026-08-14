'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import type { PostgrestError } from '@supabase/supabase-js'
import { AlertTriangle, Loader2, Save, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useRole } from '@/hooks/useRole'
import { formatCurrency, formatNumber } from '@/i18n/format'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import {
  computePriceFromRule,
  type PricingRuleRow,
  resolvePrice,
  ruleMatchesProduct,
  sortRules,
} from '@/lib/services/pricing.service'
import {
  coefficientToMarginPct,
  countProductsInScope,
  createPricingRule,
  listPricingRules,
  marginPctToCoefficient,
  type PricingRuleCreateInput,
  type SampleProduct,
  sampleProductsInScope,
  updatePricingRule,
} from '@/lib/services/pricingAdmin.service'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import {   adminButtonPrimaryClass,
  adminInputClass,
adminModalScrollAreaClass,
  adminSelectClass,
  adminSelectStyle,
  adminSettingsLabelClass,
} from '../../../utils/adminUi'
import RuleScopeTargetPicker from './RuleScopeTargetPicker'

/**
 * Marj kuralı formu (W3-T2).
 *
 * GİRİŞ BİÇİMİ ≠ SAKLAMA BİÇİMİ: panel yüzde / katsayı / sabit fiyat kabul eder,
 * kanonik saklama TEK biçimdir — cost_plus → `margin_pct`, fixed → `fixed_price`
 * (+ `price_is_vat_inclusive`). Giriş modu DB'ye YAZILMAZ; düzenlemede `method`'tan türetilir.
 *
 * `percent_off_list` ve scope 0 (varyant) formda bilinçli olarak YOKTUR:
 * ilki W1 kapsamı dışı, ikincisi varyant hattı hazır olmadan yazılamaz.
 * Var olan böyle satırlar listede salt-okunur görünür.
 */

const DRAFT_RULE_ID = 'draft'
const IMPACT_DEBOUNCE_MS = 400
const SAMPLE_SIZE = 3

type RateInputMode = 'percent' | 'coefficient' | 'fixed'

const getPricingRuleSchema = (t: (key: string) => string) =>
  z
    .object({
      scope: z.number().int().min(1).max(4),
      product_id: z.string().nullable(),
      brand_id: z.string().nullable(),
      category_id: z.string().nullable(),
      method: z.enum(['cost_plus', 'fixed']),
      margin_pct: z.number().nullable(),
      fixed_price: z.number().nullable(),
      price_is_vat_inclusive: z.boolean(),
      surcharge: z.number(),
      min_margin_abs: z.number().nullable(),
      max_margin_abs: z.number().nullable(),
      min_quantity: z.number().min(0, t('admin.pricing.rules.validation.minQuantity')),
      priority: z.number().int(),
      is_exclusive: z.boolean(),
      currency: z.string(),
      vat_rate_pct: z
        .number()
        .min(0, t('admin.pricing.rules.validation.vatRange'))
        .max(100, t('admin.pricing.rules.validation.vatRange')),
      round_to: z.number().nullable(),
      charm_ending: z.number().nullable(),
      valid_from: z.string(),
      valid_to: z.string(),
    })
    // DB CHECK'lerinin AYNASI — sunucu 23514 fırlatmadan önce kullanıcıya anlaşılır hata.
    .superRefine((v, ctx) => {
      // pricing_rule_method_fields
      if (v.method === 'cost_plus' && v.margin_pct === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['margin_pct'],
          message: t('admin.pricing.rules.validation.marginRequired'),
        })
      }
      if (v.method === 'fixed') {
        if (v.fixed_price === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fixed_price'],
            message: t('admin.pricing.rules.validation.fixedPriceRequired'),
          })
        } else if (v.fixed_price <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fixed_price'],
            message: t('admin.pricing.rules.validation.fixedPricePositive'),
          })
        }
      }

      // pricing_rule_scope_target
      const targetIssue = (path: 'product_id' | 'brand_id' | 'category_id') =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path],
          message: t('admin.pricing.rules.validation.targetRequired'),
        })
      if (v.scope === 1 && !v.product_id) targetIssue('product_id')
      if (v.scope === 2 && !v.brand_id) targetIssue('brand_id')
      if (v.scope === 3 && !v.category_id) targetIssue('category_id')

      // round_to > 0
      if (v.round_to !== null && v.round_to <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['round_to'],
          message: t('admin.pricing.rules.validation.roundToPositive'),
        })
      }
      // charm_ending ∈ [0, 1)
      if (v.charm_ending !== null && (v.charm_ending < 0 || v.charm_ending >= 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['charm_ending'],
          message: t('admin.pricing.rules.validation.charmRange'),
        })
      }
      // currency: boş (tüm para birimleri) veya 3 harf
      if (v.currency !== '' && v.currency.trim().length !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currency'],
          message: t('admin.pricing.rules.validation.currencyLength'),
        })
      }
      // marj kelepçesi tutarlılığı
      if (v.min_margin_abs !== null && v.max_margin_abs !== null && v.min_margin_abs > v.max_margin_abs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['max_margin_abs'],
          message: t('admin.pricing.rules.validation.marginClampOrder'),
        })
      }
      // geçerlilik penceresi
      if (v.valid_from && v.valid_to && v.valid_from > v.valid_to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['valid_to'],
          message: t('admin.pricing.rules.validation.dateRange'),
        })
      }
    })

type PricingRuleFormValues = z.infer<ReturnType<typeof getPricingRuleSchema>>

const EMPTY_VALUES: PricingRuleFormValues = {
  scope: 4,
  product_id: null,
  brand_id: null,
  category_id: null,
  method: 'cost_plus',
  margin_pct: 40,
  fixed_price: null,
  price_is_vat_inclusive: false,
  surcharge: 0,
  min_margin_abs: null,
  max_margin_abs: null,
  min_quantity: 1,
  priority: 0,
  is_exclusive: true,
  currency: '',
  vat_rate_pct: 20,
  round_to: null,
  charm_ending: null,
  valid_from: '',
  valid_to: '',
}

function ruleToFormValues(rule: PricingRuleRow): PricingRuleFormValues {
  return {
    scope: rule.scope,
    product_id: rule.product_id,
    brand_id: rule.brand_id,
    category_id: rule.category_id,
    method: rule.method === 'fixed' ? 'fixed' : 'cost_plus',
    margin_pct: rule.margin_pct,
    fixed_price: rule.fixed_price,
    price_is_vat_inclusive: rule.price_is_vat_inclusive,
    surcharge: rule.surcharge,
    min_margin_abs: rule.min_margin_abs,
    max_margin_abs: rule.max_margin_abs,
    min_quantity: rule.min_quantity,
    priority: rule.priority,
    is_exclusive: rule.is_exclusive,
    currency: rule.currency ?? '',
    vat_rate_pct: rule.vat_rate_pct,
    round_to: rule.round_to,
    charm_ending: rule.charm_ending,
    valid_from: rule.valid_from ?? '',
    valid_to: rule.valid_to ?? '',
  }
}

/** '' → null; '1,4' → 1.4; geçersiz → NaN (zod yakalar, sessizce 0 yazılmaz). */
function parseNumberInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '') return null
  return Number(normalized)
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

/**
 * Postgres CHECK ihlalini (23514) i18n mesajına çevirir.
 * HAM SQL METNİ TOAST'A BASILMAZ — kullanıcı şema iç yapısını görmemeli.
 */
function checkViolationKey(error: unknown): string | null {
  if (!isPostgrestError(error) || error.code !== '23514') return null
  const detail = `${error.message} ${error.details ?? ''}`
  if (detail.includes('pricing_rule_method_fields')) return 'admin.pricing.rules.errors.methodFields'
  if (detail.includes('pricing_rule_scope_target')) return 'admin.pricing.rules.errors.scopeTarget'
  if (detail.includes('min_quantity')) return 'admin.pricing.rules.validation.minQuantity'
  if (detail.includes('scope')) return 'admin.pricing.rules.errors.scopeRange'
  return 'admin.pricing.rules.errors.checkViolation'
}

interface ImpactSample {
  product: SampleProduct
  beforeGross: number | null
}

interface PricingRuleFormModalProps {
  open: boolean
  /** null = yeni kural; dolu = düzenleme (giriş modu method'tan türetilir) */
  rule: PricingRuleRow | null
  onClose: () => void
  onSaved: () => void
}

const PricingRuleFormModal: React.FC<PricingRuleFormModalProps> = ({ open, rule, onClose, onSaved }) => {
  const { t, lang } = useI18n()
  const locale = lang === 'en' ? 'en' : 'tr'
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [saving, setSaving] = useState(false)
  const [rateRaw, setRateRaw] = useState('')
  const [mode, setMode] = useState<RateInputMode>('percent')

  const [existingRules, setExistingRules] = useState<PricingRuleRow[]>([])
  const [impactCount, setImpactCount] = useState<number | null>(null)
  const [impactSamples, setImpactSamples] = useState<ImpactSample[]>([])
  const [impactLoading, setImpactLoading] = useState(false)

  const schema = useMemo(() => getPricingRuleSchema(t), [t])
  const { handleSubmit, register, reset, setValue, watch, formState } = useForm<PricingRuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })
  const values = watch()
  const errors = formState.errors

  /* ---- açılışta form + giriş modu tohumlama ---- */
  useEffect(() => {
    if (!open) return
    if (rule) {
      const next = ruleToFormValues(rule)
      reset(next)
      const nextMode: RateInputMode = next.method === 'fixed' ? 'fixed' : 'percent'
      setMode(nextMode)
      setRateRaw(
        nextMode === 'fixed'
          ? next.fixed_price === null
            ? ''
            : String(next.fixed_price)
          : next.margin_pct === null
            ? ''
            : String(next.margin_pct),
      )
    } else {
      reset(EMPTY_VALUES)
      setMode('percent')
      setRateRaw(String(EMPTY_VALUES.margin_pct ?? ''))
    }
  }, [open, rule, reset])

  /* ---- kural havuzu (etki panelindeki "kim kazanır" uyarısı için) ---- */
  useEffect(() => {
    if (!open) return
    let alive = true
    void (async () => {
      try {
        const rules = await listPricingRules(supabase)
        if (alive) setExistingRules(rules)
      } catch {
        if (alive) setExistingRules([])
      }
    })()
    return () => {
      alive = false
    }
  }, [open])

  /* ---- ETKİ PANELİ: kapsam değişince sayım + örnekler + ÖNCE fiyatları ---- */
  const scope = values.scope
  const targetId =
    scope === 1 ? values.product_id : scope === 2 ? values.brand_id : scope === 3 ? values.category_id : null

  useEffect(() => {
    if (!open) return
    if (scope !== 4 && !targetId) {
      setImpactCount(null)
      setImpactSamples([])
      return
    }
    let alive = true
    setImpactLoading(true)
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const [count, samples] = await Promise.all([
            countProductsInScope(supabase, scope, targetId),
            sampleProductsInScope(supabase, scope, targetId, SAMPLE_SIZE),
          ])
          const withBefore: ImpactSample[] = []
          for (const product of samples) {
            const { price } = await resolvePrice(supabase, product, {})
            withBefore.push({ product, beforeGross: price ? price.gross : null })
          }
          if (!alive) return
          setImpactCount(count)
          setImpactSamples(withBefore)
        } catch {
          if (!alive) return
          setImpactCount(null)
          setImpactSamples([])
        } finally {
          if (alive) setImpactLoading(false)
        }
      })()
    }, IMPACT_DEBOUNCE_MS)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [open, scope, targetId])

  /* ---- taslak kural satırı: SONRA fiyatı DB'siz, saf motorla hesaplanır ---- */
  const draftRule = useMemo<PricingRuleRow>(
    () => ({
      id: rule?.id ?? DRAFT_RULE_ID,
      tenant_id: rule?.tenant_id ?? '',
      price_book_id: rule?.price_book_id ?? null,
      scope: values.scope,
      product_id: values.scope === 1 ? values.product_id : null,
      brand_id: values.scope === 2 ? values.brand_id : null,
      category_id: values.scope === 3 ? values.category_id : null,
      method: values.method,
      base: rule?.base ?? 'cost',
      margin_pct: values.method === 'cost_plus' ? values.margin_pct : null,
      surcharge: values.surcharge,
      fixed_price: values.method === 'fixed' ? values.fixed_price : null,
      vat_rate_pct: values.vat_rate_pct,
      price_is_vat_inclusive: values.price_is_vat_inclusive,
      min_margin_abs: values.min_margin_abs,
      max_margin_abs: values.max_margin_abs,
      round_to: values.round_to,
      charm_ending: values.charm_ending,
      min_quantity: values.min_quantity,
      priority: values.priority,
      is_exclusive: values.is_exclusive,
      currency: values.currency ? values.currency.toUpperCase() : null,
      valid_from: values.valid_from || null,
      valid_to: values.valid_to || null,
      created_at: rule?.created_at ?? new Date(0).toISOString(),
      updated_at: rule?.updated_at ?? new Date(0).toISOString(),
      updated_by: rule?.updated_by ?? null,
    }),
    [rule, values],
  )

  /**
   * Taslak bu üründe gerçekten kazanır mı? (merdiven = pricing.service SSOT'u)
   * v1 basitleştirmesi: kategori ata-zinciri yerine ürünün KENDİ kategorisi kullanılır —
   * üst-kategori kuralları bu uyarıda görünmeyebilir (yanlış-negatif, yanlış-pozitif değil).
   */
  const draftLosesFor = useCallback(
    (product: SampleProduct): boolean => {
      const ancestors = new Set<string>(product.categoryId ? [product.categoryId] : [])
      const today = new Date().toISOString().slice(0, 10)
      const rivals = existingRules.filter(
        (r) =>
          r.id !== draftRule.id &&
          r.price_book_id === null &&
          (r.currency === null || r.currency.toUpperCase() === 'TRY') &&
          r.min_quantity <= 1 &&
          (r.valid_from === null || r.valid_from <= today) &&
          (r.valid_to === null || r.valid_to >= today) &&
          ruleMatchesProduct(r, product, ancestors),
      )
      if (rivals.length === 0) return false
      const winner = sortRules([...rivals, draftRule], null)[0]
      return winner.id !== draftRule.id
    },
    [existingRules, draftRule],
  )

  /* ---- giriş modu ↔ kanonik alan köprüsü ---- */
  const applyRate = useCallback(
    (raw: string, nextMode: RateInputMode) => {
      setRateRaw(raw)
      const parsed = parseNumberInput(raw)
      if (nextMode === 'fixed') {
        setValue('fixed_price', parsed, { shouldDirty: true })
        return
      }
      if (parsed === null) {
        setValue('margin_pct', null, { shouldDirty: true })
        return
      }
      setValue('margin_pct', nextMode === 'percent' ? parsed : coefficientToMarginPct(parsed), {
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const switchMode = useCallback(
    (nextMode: RateInputMode) => {
      setMode(nextMode)
      if (nextMode === 'fixed') {
        setValue('method', 'fixed', { shouldDirty: true })
        setValue('margin_pct', null, { shouldDirty: true })
        setRateRaw(values.fixed_price === null ? '' : String(values.fixed_price))
        return
      }
      setValue('method', 'cost_plus', { shouldDirty: true })
      setValue('fixed_price', null, { shouldDirty: true })
      const marginPct = values.margin_pct
      if (marginPct === null) {
        setRateRaw('')
        return
      }
      setRateRaw(String(nextMode === 'percent' ? marginPct : marginPctToCoefficient(marginPct)))
    },
    [setValue, values.fixed_price, values.margin_pct],
  )

  const handleScopeChange = useCallback(
    (nextScope: number) => {
      setValue('scope', nextScope, { shouldDirty: true })
      setValue('product_id', null, { shouldDirty: true })
      setValue('brand_id', null, { shouldDirty: true })
      setValue('category_id', null, { shouldDirty: true })
    },
    [setValue],
  )

  const handleTargetChange = useCallback(
    (nextId: string | null) => {
      if (values.scope === 1) setValue('product_id', nextId, { shouldDirty: true })
      else if (values.scope === 2) setValue('brand_id', nextId, { shouldDirty: true })
      else if (values.scope === 3) setValue('category_id', nextId, { shouldDirty: true })
    },
    [setValue, values.scope],
  )

  /* ---- dirty-guard ---- */
  const handleClose = useCallback(() => {
    if (formState.isDirty && !window.confirm(t('admin.pricing.rules.form.unsavedConfirm'))) return
    onClose()
  }, [formState.isDirty, onClose, t])

  useEffect(() => {
    if (!open) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!formState.isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [open, formState.isDirty])

  /* ---- kaydet ---- */
  const onSubmit = useCallback(
    async (v: PricingRuleFormValues) => {
      // PAYLOAD DİSİPLİNİ: tenant_id YOK (DB default'u jwt_tenant_id yazar).
      const payload: PricingRuleCreateInput = {
        scope: v.scope,
        product_id: v.scope === 1 ? v.product_id : null,
        brand_id: v.scope === 2 ? v.brand_id : null,
        category_id: v.scope === 3 ? v.category_id : null,
        method: v.method,
        margin_pct: v.method === 'cost_plus' ? v.margin_pct : null,
        fixed_price: v.method === 'fixed' ? v.fixed_price : null,
        price_is_vat_inclusive: v.method === 'fixed' ? v.price_is_vat_inclusive : false,
        surcharge: v.surcharge,
        min_margin_abs: v.min_margin_abs,
        max_margin_abs: v.max_margin_abs,
        min_quantity: v.min_quantity,
        priority: v.priority,
        is_exclusive: v.is_exclusive,
        currency: v.currency ? v.currency.trim().toUpperCase() : null,
        vat_rate_pct: v.vat_rate_pct,
        round_to: v.round_to,
        charm_ending: v.charm_ending,
        valid_from: v.valid_from || null,
        valid_to: v.valid_to || null,
      }

      try {
        setSaving(true)
        const { data: authData } = await supabase.auth.getUser()
        const userId = authData.user?.id ?? null

        await mutateWithAudit(supabase, {
          resource: 'pricing_rule',
          canWrite: hasWriteAccess,
          action: rule ? 'UPDATE' : 'INSERT',
          rowPk: rule?.id ?? null,
          before: rule ? { ...ruleToFormValues(rule) } : null,
          after: { ...payload },
          auditedByEdge: false,
          fn: async () => {
            if (rule) await updatePricingRule(supabase, rule.id, payload, userId)
            else await createPricingRule(supabase, payload)
          },
        })

        toast.success(rule ? t('admin.pricing.rules.toasts.updated') : t('admin.pricing.rules.toasts.created'))
        onSaved()
        onClose()
      } catch (e) {
        const checkKey = checkViolationKey(e)
        if (e instanceof AdminPermissionError) toast.error(t('admin.pricing.common.noPermission'))
        else if (checkKey) toast.error(t(checkKey))
        else toast.error(t('admin.pricing.rules.toasts.saveFailed'))
      } finally {
        setSaving(false)
      }
    },
    [hasWriteAccess, onClose, onSaved, rule, t],
  )

  const coefficientPreview =
    values.margin_pct === null || Number.isNaN(values.margin_pct)
      ? null
      : marginPctToCoefficient(values.margin_pct)

  const rateHelper =
    mode === 'fixed'
      ? t(
          values.price_is_vat_inclusive
            ? 'admin.pricing.rules.form.fixedVatInclusiveHint'
            : 'admin.pricing.rules.form.fixedVatExclusiveHint',
        )
      : mode === 'percent'
        ? coefficientPreview === null
          ? ''
          : `= ×${formatNumber(coefficientPreview, locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
        : values.margin_pct === null
          ? ''
          : `= %${formatNumber(values.margin_pct, locale, { maximumFractionDigits: 2 })}`

  const modeButtons: { key: RateInputMode; label: string }[] = [
    { key: 'percent', label: t('admin.pricing.rules.form.modePercent') },
    { key: 'coefficient', label: t('admin.pricing.rules.form.modeCoefficient') },
    { key: 'fixed', label: t('admin.pricing.rules.form.modeFixed') },
  ]

  const fieldError = (message: unknown) =>
    typeof message === 'string' ? (
      <p className="text-xs font-bold text-rose-400 mt-1 uppercase tracking-tighter">{message}</p>
    ) : null

  const targetErrorMessage =
    values.scope === 1
      ? errors.product_id?.message
      : values.scope === 2
        ? errors.brand_id?.message
        : values.scope === 3
          ? errors.category_id?.message
          : undefined

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? undefined : handleClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {rule ? t('admin.pricing.rules.form.editTitle') : t('admin.pricing.rules.form.createTitle')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400 mt-1">
                {t('admin.pricing.rules.form.description')}
              </Dialog.Description>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('admin.pricing.rules.form.close')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/40"
            >
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 ${adminModalScrollAreaClass}`}>
            <form id="pricing-rule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* ---- kapsam ---- */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('admin.pricing.rules.form.sectionScope')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rule-scope" className={adminSettingsLabelClass}>
                      {t('admin.pricing.common.scopeLabel')}
                    </label>
                    <select
                      id="rule-scope"
                      value={String(values.scope)}
                      onChange={(e) => handleScopeChange(Number(e.target.value))}
                      className={adminSelectClass}
                      style={adminSelectStyle}
                    >
                      <option value="1">{t('admin.pricing.common.scope.product')}</option>
                      <option value="2">{t('admin.pricing.common.scope.brand')}</option>
                      <option value="3">{t('admin.pricing.common.scope.category')}</option>
                      <option value="4">{t('admin.pricing.common.scope.global')}</option>
                    </select>
                  </div>
                  <RuleScopeTargetPicker
                    scope={values.scope}
                    value={targetId}
                    onChange={handleTargetChange}
                    error={typeof targetErrorMessage === 'string' ? targetErrorMessage : null}
                  />
                </div>
              </section>

              {/* ---- fiyatlandırma ---- */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('admin.pricing.rules.form.sectionPricing')}
                </h3>

                <div
                  role="radiogroup"
                  aria-label={t('admin.pricing.rules.form.inputMode')}
                  className="inline-flex rounded-xl glass border border-white/10 p-1 gap-1"
                >
                  {modeButtons.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      role="radio"
                      aria-checked={mode === m.key}
                      onClick={() => switchMode(m.key)}
                      className={`px-4 h-9 rounded-lg text-xs font-black uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
                        mode === m.key ? 'bg-cyan-400 text-surface-deep' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rule-rate" className={adminSettingsLabelClass}>
                      {mode === 'fixed'
                        ? t('admin.pricing.rules.form.fixedPrice')
                        : mode === 'percent'
                          ? t('admin.pricing.rules.form.marginPct')
                          : t('admin.pricing.rules.form.coefficient')}
                    </label>
                    <input
                      id="rule-rate"
                      type="text"
                      inputMode="decimal"
                      value={rateRaw}
                      onChange={(e) => applyRate(e.target.value, mode)}
                      className={`${adminInputClass}`}
                    />
                    {rateHelper ? <p className="text-xs font-bold text-slate-500">{rateHelper}</p> : null}
                    {fieldError(errors.margin_pct?.message)}
                    {fieldError(errors.fixed_price?.message)}
                  </div>

                  {mode === 'fixed' ? (
                    <div className="space-y-2">
                      <span className={adminSettingsLabelClass}>{t('admin.pricing.rules.form.vatSemantics')}</span>
                      <label className="flex items-center gap-3 px-4 h-11 glass border border-white/10 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.price_is_vat_inclusive}
                          onChange={(e) =>
                            setValue('price_is_vat_inclusive', e.target.checked, { shouldDirty: true })
                          }
                          className="w-4 h-4 rounded border-white/10 bg-slate-800 text-cyan-500 focus-visible:ring-cyan-400/20"
                        />
                        <span className="text-sm font-bold text-slate-300">
                          {t('admin.pricing.rules.form.vatInclusive')}
                        </span>
                      </label>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label htmlFor="rule-surcharge" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.surcharge')}
                    </label>
                    <input
                      id="rule-surcharge"
                      type="text"
                      inputMode="decimal"
                      value={String(values.surcharge ?? '')}
                      onChange={(e) => setValue('surcharge', parseNumberInput(e.target.value) ?? 0, { shouldDirty: true })}
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.surcharge?.message)}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="rule-vat" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.vatRatePct')}
                    </label>
                    <input
                      id="rule-vat"
                      type="text"
                      inputMode="decimal"
                      value={String(values.vat_rate_pct ?? '')}
                      onChange={(e) =>
                        setValue('vat_rate_pct', parseNumberInput(e.target.value) ?? Number.NaN, { shouldDirty: true })
                      }
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.vat_rate_pct?.message)}
                  </div>
                </div>
              </section>

              {/* ---- kelepçe & yuvarlama ---- */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('admin.pricing.rules.form.sectionGuards')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rule-min-margin" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.minMarginAbs')}
                    </label>
                    <input
                      id="rule-min-margin"
                      type="text"
                      inputMode="decimal"
                      value={values.min_margin_abs === null ? '' : String(values.min_margin_abs)}
                      onChange={(e) => setValue('min_margin_abs', parseNumberInput(e.target.value), { shouldDirty: true })}
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.min_margin_abs?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-max-margin" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.maxMarginAbs')}
                    </label>
                    <input
                      id="rule-max-margin"
                      type="text"
                      inputMode="decimal"
                      value={values.max_margin_abs === null ? '' : String(values.max_margin_abs)}
                      onChange={(e) => setValue('max_margin_abs', parseNumberInput(e.target.value), { shouldDirty: true })}
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.max_margin_abs?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-round" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.roundTo')}
                    </label>
                    <input
                      id="rule-round"
                      type="text"
                      inputMode="decimal"
                      value={values.round_to === null ? '' : String(values.round_to)}
                      onChange={(e) => setValue('round_to', parseNumberInput(e.target.value), { shouldDirty: true })}
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.round_to?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-charm" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.charmEnding')}
                    </label>
                    <input
                      id="rule-charm"
                      type="text"
                      inputMode="decimal"
                      value={values.charm_ending === null ? '' : String(values.charm_ending)}
                      onChange={(e) => setValue('charm_ending', parseNumberInput(e.target.value), { shouldDirty: true })}
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.charm_ending?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-currency" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.currency')}
                    </label>
                    <input
                      id="rule-currency"
                      type="text"
                      maxLength={3}
                      placeholder={t('admin.pricing.rules.form.currencyPlaceholder')}
                      {...register('currency')}
                      className={`${adminInputClass} uppercase`}
                    />
                    {fieldError(errors.currency?.message)}
                  </div>
                </div>
              </section>

              {/* ---- öncelik & geçerlilik ---- */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('admin.pricing.rules.form.sectionPriority')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rule-min-qty" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.minQuantity')}
                    </label>
                    <input
                      id="rule-min-qty"
                      type="text"
                      inputMode="decimal"
                      value={String(values.min_quantity ?? '')}
                      onChange={(e) =>
                        setValue('min_quantity', parseNumberInput(e.target.value) ?? Number.NaN, { shouldDirty: true })
                      }
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.min_quantity?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-priority" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.priority')}
                    </label>
                    <input
                      id="rule-priority"
                      type="text"
                      inputMode="numeric"
                      value={String(values.priority ?? '')}
                      onChange={(e) =>
                        setValue('priority', parseNumberInput(e.target.value) ?? 0, { shouldDirty: true })
                      }
                      className={`${adminInputClass}`}
                    />
                    {fieldError(errors.priority?.message)}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-valid-from" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.validFrom')}
                    </label>
                    <input id="rule-valid-from" type="date" {...register('valid_from')} className={`${adminInputClass}`} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rule-valid-to" className={adminSettingsLabelClass}>
                      {t('admin.pricing.rules.form.validTo')}
                    </label>
                    <input id="rule-valid-to" type="date" {...register('valid_to')} className={`${adminInputClass}`} />
                    {fieldError(errors.valid_to?.message)}
                  </div>
                </div>
                <label className="flex items-center gap-3 px-4 h-11 glass border border-white/10 rounded-xl cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={values.is_exclusive}
                    onChange={(e) => setValue('is_exclusive', e.target.checked, { shouldDirty: true })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-cyan-500 focus-visible:ring-cyan-400/20"
                  />
                  <span className="text-sm font-bold text-slate-300">{t('admin.pricing.rules.form.isExclusive')}</span>
                </label>
              </section>

              {/* ---- ETKİ PANELİ ---- */}
              <section className="space-y-4 rounded-2xl glass border border-white/10 p-6">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('admin.pricing.rules.impact.title')}
                </h3>

                {impactLoading ? (
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Loader2 size={14} className="animate-spin" />
                    {t('admin.pricing.rules.impact.loading')}
                  </p>
                ) : impactCount === null ? (
                  <p className="text-xs font-bold text-slate-500">{t('admin.pricing.rules.impact.selectTarget')}</p>
                ) : (
                  <>
                    <p className="text-sm font-black text-white">
                      {t('admin.pricing.rules.impact.coverage', { count: impactCount })}
                    </p>
                    <ul className="space-y-2">
                      {impactSamples.map(({ product, beforeGross }) => {
                        const after = computePriceFromRule(draftRule, product.costInBase ?? null, [])
                        const loses = draftLosesFor(product)
                        return (
                          <li
                            key={product.id}
                            className="flex flex-wrap items-center gap-3 rounded-xl bg-white/3 border border-white/5 px-4 py-3"
                          >
                            <span className="text-sm font-bold text-white truncate">{product.name}</span>
                            <span className="text-xs font-mono font-bold text-slate-500">{product.sku}</span>
                            <span className="ml-auto text-xs font-black uppercase tracking-widest text-slate-500">
                              {beforeGross === null
                                ? t('admin.pricing.rules.impact.noPrice')
                                : formatCurrency(beforeGross, locale)}
                            </span>
                            <span className="text-xs font-black text-slate-600" aria-hidden="true">
                              {'→'}
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                              {after === null
                                ? t('admin.pricing.rules.impact.notPriceable')
                                : formatCurrency(after.gross, locale)}
                            </span>
                            {loses ? (
                              <span className="w-full flex items-center gap-2 text-xs font-bold text-amber-400">
                                <AlertTriangle size={14} />
                                {t('admin.pricing.rules.impact.moreSpecificWins')}
                              </span>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </section>
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
              form="pricing-rule-form"
              disabled={saving || !hasWriteAccess}
              className={`${adminButtonPrimaryClass} flex items-center gap-2`}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {t('admin.pricing.rules.form.save')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default PricingRuleFormModal
