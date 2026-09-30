'use client'

import { AlertTriangle, CheckCircle2, ExternalLink, Info, Loader2 } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { SYSTEM_CURRENCY } from '../../../i18n/currency'
import { formatCurrency } from '../../../i18n/format'
import { useI18n } from '../../../i18n/I18nProvider'
import { isValidFixedPriceAmount } from '../../../lib/services/pricingAdmin.service'
import {
  clearProductPrice,
  type ClearProductPriceResult,
  DEFAULT_VAT_RATE_PCT,
  loadProductPricePanelState,
  previewProductFixedPrice,
  type ProductPriceChangeResult,
  type ProductPricePanelState,
  setProductPrice,
  type SetProductPriceResult,
  type StorefrontVerification,
} from '../../../lib/services/pricingProductPrice.service'
import { supabaseBrowserClient as supabase } from '../../../lib/supabase/client'
import { adminButtonPrimaryClass, adminButtonSecondaryClass, adminInputClass } from '../../../utils/adminUi'
import { AdminSidePanel } from '../overlay/AdminSidePanel'
import { useConfirm } from '../overlay/ConfirmProvider'
import { parseAmountInput, readVatIncludedPreference, writeVatIncludedPreference } from './productPriceInput'

/**
 * ÜRÜN FİYAT YAN PANELİ — REC-412 Faz 2a. Cetvel: docs/standards/pricing-standard.md §12.1 (tek ürün fiyat girişi sözleşmesi).
 *
 * Yönetici ürün satırından "Fiyat"ı açar, tutarı KDV dahil/hariç SEÇEREK girer; kaydet = kural yaz → YALNIZ bu ürünü yeniden
 * hesapla → vitrin satırını GERİ OKU. Sonuç HER ZAMAN söylenir (sessiz başarı yok): "Vitrinde görünen: ₺X — ölçüldü" ya da
 * açık uyarı. Yazma yolu Faz 1 servisidir (`setProductPrice`/`clearProductPrice`); bu bileşen `products.price`'a YAZMAZ
 * (emekli alan, INV-ADMIN-FIYAT-GIRISI-1) ve panelde hiçbir maliyet/marj alanı YOKTUR (karar 95).
 *
 * Yetki: bileşen `canWrite('pricing')` olmayana HİÇ gösterilmez (çağıran karar verir, UI ⊆ DB); `canReflect` = vitrine
 * yansıtma (`product_prices` yazma) yetkisi, yalnız admin/super_admin. Moderatör yolu REC-442 sonrası (REC-468 notu).
 */

export interface ProductPricePanelProduct {
  id: string
  name: string
  sku: string
}

export interface ProductPricePanelProps {
  open: boolean
  product: ProductPricePanelProduct | null
  /** Vitrine yansıtma (`product_prices` yazma) yetkisi: false ise yalnız kural yazılır, "yönetici yansıtmalı" denir. */
  canReflect: boolean
  onClose: () => void
  /** Fiyat yazıldı/kaldırıldı: tablo yeniden okunur. */
  onSaved: () => void
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ProductPricePanelState }

type Outcome =
  | { kind: 'set'; result: SetProductPriceResult }
  | { kind: 'clear'; result: ClearProductPriceResult }
  | { kind: 'error'; message: string }

/** supabase-js hataları `Error` DEĞİL düz nesnedir (`{ message, code }`): `String(err)` "[object Object]" yazardı. */
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') return err.message
  return String(err)
}

const PANEL_LEAD_CLASS = 'text-xs font-semibold uppercase tracking-wide text-admin-fg-muted'

const ProductPricePanel: React.FC<ProductPricePanelProps> = ({ open, product, canReflect, onClose, onSaved }) => {
  const { t, lang } = useI18n()
  const confirm = useConfirm()

  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [amountText, setAmountText] = useState('')
  const [touched, setTouched] = useState(false)
  const [vatIncluded, setVatIncluded] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const productId = product?.id ?? null

  const money = useCallback(
    (value: number): string => formatCurrency(value, lang, { currency: SYSTEM_CURRENCY }),
    [lang],
  )

  /** Ürünün fiyat durumunu okur; `prefill` = alanları kayıtlı kuraldan doldur (açılışta EVET, kayıttan sonra HAYIR). */
  const refresh = useCallback(async (id: string, prefill: boolean): Promise<void> => {
    try {
      const data = await loadProductPricePanelState(supabase, id)
      setLoad({ status: 'ready', data })
      if (prefill) {
        setAmountText(data.fixedRule ? String(data.fixedRule.fixedPrice) : '')
        setVatIncluded(data.fixedRule ? data.fixedRule.vatIncluded : readVatIncludedPreference())
      }
    } catch (err) {
      setLoad({ status: 'error', message: errorMessage(err) })
    }
  }, [])

  useEffect(() => {
    if (!open || productId === null) return
    setLoad({ status: 'loading' })
    setOutcome(null)
    setTouched(false)
    void refresh(productId, true)
  }, [open, productId, refresh])

  const ready = load.status === 'ready' ? load.data : null
  const vatRatePct = ready?.fixedRule?.vatRatePct ?? DEFAULT_VAT_RATE_PCT
  const parsed = parseAmountInput(amountText)
  const amountValid = parsed !== null && isValidFixedPriceAmount(parsed)
  const preview = amountValid ? previewProductFixedPrice(parsed, vatIncluded, vatRatePct) : null
  const showInvalid = touched && amountText.trim() !== '' && !amountValid
  const busy = saving || clearing

  const handleSave = useCallback(async (): Promise<void> => {
    if (productId === null || !amountValid || parsed === null) return
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const result = await setProductPrice(
        supabase,
        productId,
        { amount: parsed, vatIncluded },
        { yontem: 'panel', recalculate: canReflect, updatedBy: auth.user?.id ?? null },
      )
      writeVatIncludedPreference(vatIncluded)
      setOutcome({ kind: 'set', result })
      onSaved()
      await refresh(productId, false)
    } catch (err) {
      setOutcome({ kind: 'error', message: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }, [productId, amountValid, parsed, vatIncluded, canReflect, onSaved, refresh])

  const handleClear = useCallback(async (): Promise<void> => {
    if (productId === null) return
    const approved = await confirm({
      title: t('admin.products.pricePanel.clearConfirmTitle'),
      description: t('admin.products.pricePanel.clearConfirmDescription'),
      confirmLabel: t('admin.products.pricePanel.clearConfirmLabel'),
      cancelLabel: t('admin.products.pricePanel.clearCancelLabel'),
    })
    if (!approved) return
    setClearing(true)
    try {
      const result = await clearProductPrice(supabase, productId, { yontem: 'panel', recalculate: canReflect })
      setOutcome({ kind: 'clear', result })
      onSaved()
      await refresh(productId, true)
    } catch (err) {
      setOutcome({ kind: 'error', message: errorMessage(err) })
    } finally {
      setClearing(false)
    }
  }, [productId, confirm, t, canReflect, onSaved, refresh])

  /** Vitrin geri okumasının tek satırlık, DÜRÜST özeti (sessiz başarı yok). */
  const verificationLine = (verification: StorefrontVerification): { tone: 'ok' | 'warn' | 'info'; text: string } => {
    switch (verification.status) {
      case 'dogrulandi':
        return { tone: 'ok', text: t('admin.products.pricePanel.result.verified', { gross: money(verification.gross) }) }
      case 'farkli':
        return {
          tone: 'warn',
          text: t('admin.products.pricePanel.result.different', {
            actual: money(verification.gross),
            expected: money(verification.expected.gross),
          }),
        }
      case 'yok':
        return { tone: 'warn', text: t('admin.products.pricePanel.result.missing') }
      case 'belirsiz':
        return { tone: 'warn', text: t('admin.products.pricePanel.result.ambiguous', { count: verification.rows }) }
      case 'beklenen-yok':
        return { tone: 'info', text: t('admin.products.pricePanel.result.noExpected', { gross: money(verification.gross) }) }
    }
  }

  const toneClass = (tone: 'ok' | 'warn' | 'info'): string =>
    tone === 'ok'
      ? 'border-admin-success bg-admin-success-weak text-admin-fg'
      : tone === 'warn'
        ? 'border-admin-warning bg-admin-warning-weak text-admin-fg'
        : 'border-admin-border bg-admin-surface-2 text-admin-fg'

  const toneIcon = (tone: 'ok' | 'warn' | 'info'): React.ReactElement =>
    tone === 'ok' ? (
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-admin-success" aria-hidden="true" />
    ) : tone === 'warn' ? (
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-admin-warning" aria-hidden="true" />
    ) : (
      <Info size={16} className="mt-0.5 shrink-0 text-admin-fg-muted" aria-hidden="true" />
    )

  const renderChangeDetails = (result: ProductPriceChangeResult): React.ReactElement => {
    const lines: Array<{ key: string; tone: 'ok' | 'warn' | 'info'; text: string }> = []
    if (result.recalc === 'hata') {
      lines.push({
        key: 'recalc',
        tone: 'warn',
        text: t('admin.products.pricePanel.result.recalcFailed', { msg: result.recalcError ?? '' }),
      })
    } else if (result.recalc === 'yapilmadi') {
      lines.push({ key: 'not-reflected', tone: 'info', text: t('admin.products.pricePanel.result.notReflected') })
    } else if (result.verification) {
      lines.push({ key: 'verification', ...verificationLine(result.verification) })
    }
    if (result.golgelendi) {
      lines.push({ key: 'shadowed', tone: 'warn', text: t('admin.products.pricePanel.result.shadowed') })
    }
    const skippedManual = result.summary?.skippedManual ?? 0
    if (skippedManual > 0) {
      lines.push({ key: 'skipped-manual', tone: 'warn', text: t('admin.products.pricePanel.result.skippedManual', { count: skippedManual }) })
    }
    const skippedFx = result.summary?.skippedFxLocked ?? 0
    if (skippedFx > 0) {
      lines.push({ key: 'skipped-fx', tone: 'warn', text: t('admin.products.pricePanel.result.skippedFxLocked', { count: skippedFx }) })
    }
    return (
      <>
        {lines.map((line) => (
          <div key={line.key} className={`flex items-start gap-2 rounded-admin-md border p-3 text-sm ${toneClass(line.tone)}`}>
            {toneIcon(line.tone)}
            <span>{line.text}</span>
          </div>
        ))}
        {result.golgelendi ? (
          <Link
            href={'/admin/pricing/rules' as Route}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-admin-accent transition-colors hover:text-admin-accent"
          >
            {t('admin.products.pricePanel.result.shadowedLink')}
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        ) : null}
        {result.recalc === 'hata' ? (
          <button type="button" onClick={() => void handleSave()} disabled={busy || !amountValid} className={adminButtonSecondaryClass}>
            {t('admin.products.pricePanel.retry')}
          </button>
        ) : null}
      </>
    )
  }

  const renderOutcome = (): React.ReactElement | null => {
    if (outcome === null) return null
    if (outcome.kind === 'error') {
      return (
        <div role="alert" className="flex items-start gap-2 rounded-admin-md border border-admin-danger bg-admin-danger-weak p-3 text-sm text-admin-fg">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-admin-danger" aria-hidden="true" />
          <span>{t('admin.products.pricePanel.saveFailed', { msg: outcome.message })}</span>
        </div>
      )
    }
    const headline =
      outcome.kind === 'clear'
        ? outcome.result.removed > 0
          ? t('admin.products.pricePanel.result.cleared')
          : t('admin.products.pricePanel.result.clearedNothing')
        : null
    return (
      <div role="status" aria-live="polite" className="space-y-2">
        {headline ? <p className="text-sm font-medium text-admin-fg">{headline}</p> : null}
        {renderChangeDetails(outcome.result)}
      </div>
    )
  }

  const renderStorefront = (data: ProductPricePanelState): React.ReactElement => {
    const s = data.storefront
    if (s.status === 'yok') {
      return <p className="text-sm text-admin-fg-muted">{t('admin.products.pricePanel.storefrontNone')}</p>
    }
    if (s.status === 'belirsiz') {
      return <p className="text-sm text-admin-fg-muted">{t('admin.products.pricePanel.storefrontAmbiguous')}</p>
    }
    return (
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-admin-fg-muted">{t('admin.products.pricePanel.storefrontNet')}</dt>
          <dd className="font-semibold text-admin-fg">{money(s.net)}</dd>
        </div>
        <div>
          <dt className="text-xs text-admin-fg-muted">{t('admin.products.pricePanel.storefrontGross')}</dt>
          <dd className="font-semibold text-admin-fg">{money(s.gross)}</dd>
        </div>
      </dl>
    )
  }

  const amountId = 'product-price-amount'
  const amountErrorId = 'product-price-amount-error'

  return (
    <AdminSidePanel
      open={open && product !== null}
      onClose={onClose}
      title={t('admin.products.pricePanel.title')}
      description={t('admin.products.pricePanel.description')}
      closeLabel={t('admin.products.pricePanel.close')}
    >
      {product ? (
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-admin-fg">{product.name}</p>
            <p className="text-xs text-admin-fg-muted">{product.sku}</p>
          </div>

          {load.status === 'loading' ? (
            <p className="flex items-center gap-2 py-6 text-sm text-admin-fg-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {t('admin.products.pricePanel.loading')}
            </p>
          ) : null}

          {load.status === 'error' ? (
            <div role="alert" className="space-y-3 rounded-admin-md border border-admin-danger bg-admin-danger-weak p-3 text-sm text-admin-fg">
              <p>{t('admin.products.pricePanel.loadFailed', { msg: load.message })}</p>
              <button type="button" onClick={() => productId && void refresh(productId, true)} className={adminButtonSecondaryClass}>
                {t('admin.products.pricePanel.retry')}
              </button>
            </div>
          ) : null}

          {ready ? (
            <>
              <section aria-label={t('admin.products.pricePanel.currentTitle')} className="space-y-2">
                <h3 className={PANEL_LEAD_CLASS}>{t('admin.products.pricePanel.currentTitle')}</h3>
                {renderStorefront(ready)}
                <p className="text-sm text-admin-fg-muted">
                  {ready.fixedRule
                    ? t('admin.products.pricePanel.ruleCurrent', {
                        amount: money(ready.fixedRule.fixedPrice),
                        mode: t(
                          ready.fixedRule.vatIncluded
                            ? 'admin.products.pricePanel.vatIncluded'
                            : 'admin.products.pricePanel.vatExcluded',
                        ),
                        vat: ready.fixedRule.vatRatePct,
                      })
                    : t('admin.products.pricePanel.ruleNone')}
                </p>
                {ready.otherFixedRules > 0 ? (
                  <p className="flex items-start gap-2 text-xs text-admin-fg-muted">
                    <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{t('admin.products.pricePanel.otherRules', { count: ready.otherFixedRules })}</span>
                  </p>
                ) : null}
              </section>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  setTouched(true)
                  void handleSave()
                }}
                noValidate
              >
                <h3 className={PANEL_LEAD_CLASS}>{t('admin.products.pricePanel.ruleTitle')}</h3>

                <div className="space-y-1.5">
                  <label htmlFor={amountId} className="text-sm font-medium text-admin-fg">
                    {t('admin.products.pricePanel.amountLabel')}
                  </label>
                  <input
                    id={amountId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amountText}
                    onChange={(event) => setAmountText(event.target.value)}
                    onBlur={() => setTouched(true)}
                    disabled={busy}
                    aria-invalid={showInvalid ? 'true' : undefined}
                    aria-describedby={showInvalid ? amountErrorId : undefined}
                    className={adminInputClass}
                  />
                  <p className="text-xs text-admin-fg-muted">{t('admin.products.pricePanel.amountHint')}</p>
                  {showInvalid ? (
                    <p id={amountErrorId} role="alert" className="text-xs font-medium text-admin-danger">
                      {t('admin.products.pricePanel.invalidAmount')}
                    </p>
                  ) : null}
                </div>

                <fieldset className="space-y-1.5" disabled={busy}>
                  <legend className="text-sm font-medium text-admin-fg">{t('admin.products.pricePanel.vatModeLabel')}</legend>
                  <div className="flex gap-4">
                    {([true, false] as const).map((mode) => (
                      <label key={String(mode)} className="flex items-center gap-2 text-sm text-admin-fg">
                        <input
                          type="radio"
                          name="product-price-vat-mode"
                          checked={vatIncluded === mode}
                          onChange={() => setVatIncluded(mode)}
                        />
                        {t(mode ? 'admin.products.pricePanel.vatIncluded' : 'admin.products.pricePanel.vatExcluded')}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {preview ? (
                  <div className="space-y-1 rounded-admin-md border border-admin-border bg-admin-surface-2 p-3 text-sm">
                    <p className="text-xs text-admin-fg-muted">{t('admin.products.pricePanel.previewLabel')}</p>
                    <p className="font-semibold text-admin-fg">
                      {t('admin.products.pricePanel.previewBoth', { net: money(preview.net), gross: money(preview.gross) })}
                    </p>
                    {vatIncluded && parsed !== null && Math.abs(preview.gross - parsed) >= 0.005 ? (
                      <p className="text-xs text-admin-warning">
                        {t('admin.products.pricePanel.previewRounding', { entered: money(parsed), gross: money(preview.gross) })}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={busy || !amountValid} className={adminButtonPrimaryClass}>
                    {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                    {saving ? t('admin.products.pricePanel.saving') : t('admin.products.pricePanel.save')}
                  </button>
                  {ready.fixedRule ? (
                    <button type="button" onClick={() => void handleClear()} disabled={busy} className={adminButtonSecondaryClass}>
                      {clearing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                      {clearing ? t('admin.products.pricePanel.clearing') : t('admin.products.pricePanel.clear')}
                    </button>
                  ) : null}
                </div>
              </form>

              {renderOutcome()}
            </>
          ) : null}
        </div>
      ) : null}
    </AdminSidePanel>
  )
}

export default ProductPricePanel
