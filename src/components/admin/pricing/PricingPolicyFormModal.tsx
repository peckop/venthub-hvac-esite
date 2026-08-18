'use client'

import { AlertTriangle, Lock } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AdminModal } from '@/components/admin/overlay/AdminModal'
import { useRole } from '@/hooks/useRole'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { type FxLockFreezeDecision, resolveFxLockFreeze } from '@/lib/services/fxLockAdmin.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
  adminSettingsLabelClass,
} from '@/utils/adminUi'

import RuleScopeTargetPicker from './RuleScopeTargetPicker'

/**
 * KUR KİLİDİ FORMU (FX-LOCK 2/2b · pricing-standard §8).
 *
 * TEK TASARIM KARARI, HER ŞEYİ AÇIKLAYAN: **dondurulan kur ELLE GİRİLMEZ.**
 * Kur bir tercih değil bir ÖLÇÜMDÜR; admin'e yazdırmak, kilidin künyesini
 * (`fx_frozen_rate`) uydurulabilir bir alana çevirirdi ve "bu fiyat neden
 * güncellenmedi" sorusunun cevabı güvenilmez olurdu. Kur, kaydederken
 * `resolveFxLockFreeze` ile ÇÖZÜLÜR — kapsamda tek para birimi varsa dondurulur,
 * birden çoksa ya da hiç ürün yoksa kayıt REDDEDİLİR.
 *
 * ÖNİZLEME BAĞLAYICI DEĞİL: kapsam seçilince ne dondurulacağı gösterilir, ama
 * KAYDEDERKEN yeniden ölçülür. Önizlemeye güvenip onu yazmak, aradan geçen sürede
 * kur ya da kapsam değiştiyse SESSİZCE yanlış künye üretirdi.
 */

interface PolicyFormValue {
  id: string | null
  scope: number
  targetId: string | null
  fxLock: boolean
  note: string
  priority: number
  isActive: boolean
  /** Yalnız düzenlemede dolu: geçmişte dondurulmuş kur (tarihsel künye). */
  frozenRate: number | null
}

interface PricingPolicyFormModalProps {
  open: boolean
  /** `null` → yeni kayıt. */
  policy: PolicyFormValue | null
  onClose: () => void
  onSaved: () => void
}

const SCOPE_OPTIONS: ReadonlyArray<{ value: number; key: string }> = [
  { value: 1, key: 'product' },
  { value: 2, key: 'brand' },
  { value: 3, key: 'category' },
  { value: 4, key: 'global' },
]

function emptyValue(): PolicyFormValue {
  return {
    id: null,
    scope: 4,
    targetId: null,
    fxLock: true,
    note: '',
    priority: 0,
    isActive: true,
    frozenRate: null,
  }
}

/** `scope` ↔ hedef sütunu eşlemesi — DB CHECK'i (`pricing_policy_scope_target`) ile birebir. */
function targetColumns(scope: number, targetId: string | null) {
  return {
    product_id: scope === 0 || scope === 1 ? targetId : null,
    brand_id: scope === 2 ? targetId : null,
    category_id: scope === 3 ? targetId : null,
  }
}

/** Bugünün tarihi (YYYY-MM-DD) — kur çözümü gün bazlıdır. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

const PricingPolicyFormModal: React.FC<PricingPolicyFormModalProps> = ({
  open,
  policy,
  onClose,
  onSaved,
}) => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [value, setValue] = useState<PolicyFormValue>(emptyValue)
  const [decision, setDecision] = useState<FxLockFreezeDecision | null>(null)
  const [measuring, setMeasuring] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setValue(policy ?? emptyValue())
    setDecision(null)
  }, [open, policy])

  const { fxLock, scope, targetId } = value

  /* Kapsam değişince önizleme YENİDEN ölçülür; bayat önizleme yanlış güven verir. */
  useEffect(() => {
    if (!open || !fxLock) {
      setDecision(null)
      return
    }
    if (scope !== 4 && !targetId) {
      setDecision(null)
      return
    }
    let cancelled = false
    setMeasuring(true)
    resolveFxLockFreeze(supabaseBrowserClient, scope, targetId, todayIso())
      .then((d) => {
        if (!cancelled) setDecision(d)
      })
      .catch(() => {
        /* Ölçüm başarısızsa önizleme YOK. Kaydetme yolu kendi ölçümünü yapar ve
           hata orada kullanıcıya düşer — sessizce "hazır" göstermeyiz. */
        if (!cancelled) setDecision(null)
      })
      .finally(() => {
        if (!cancelled) setMeasuring(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, fxLock, scope, targetId])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      /* KAYIT ANINDA YENİDEN ÖLÇÜM — yazan önizleme değil BU ölçümdür. */
      let frozenRate: number | null = value.frozenRate
      if (value.fxLock) {
        const fresh = await resolveFxLockFreeze(
          supabaseBrowserClient,
          value.scope,
          value.targetId,
          todayIso(),
        )
        if (fresh.kind === 'noProducts') {
          toast.error(t('admin.pricing.policies.form.reject.noProducts'))
          return
        }
        if (fresh.kind === 'multiCurrency') {
          toast.error(
            t('admin.pricing.policies.form.reject.multiCurrency', {
              count: String(fresh.currencies.length),
              currencies: fresh.currencies.join(', '),
            }),
          )
          return
        }
        if (fresh.kind === 'rateUnavailable') {
          toast.error(
            t('admin.pricing.policies.form.reject.rateUnavailable', { currency: fresh.currency }),
          )
          return
        }
        frozenRate = fresh.rate
      }
      /* Kilit KAPATILIYORSA künye SİLİNMEZ: "bu fiyat neden güncellenmemişti"
         sorusunun cevabı kayıtta kalır (tarihsel künye). */

      const payload = {
        scope: value.scope,
        ...targetColumns(value.scope, value.targetId),
        fx_lock: value.fxLock,
        fx_frozen_rate: frozenRate,
        note: value.note.trim() || null,
        priority: value.priority,
        is_active: value.isActive,
      }

      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'pricing_policy',
        canWrite: hasWriteAccess,
        action: value.id ? 'UPDATE' : 'INSERT',
        rowPk: value.id,
        before: null,
        after: payload,
        auditedByEdge: false,
        fn: async () => {
          const { error } = value.id
            ? await supabaseBrowserClient.from('pricing_policy').update(payload).eq('id', value.id)
            : await supabaseBrowserClient.from('pricing_policy').insert(payload)
          if (error) throw error
        },
      })

      onSaved()
      onClose()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.pricing.common.noPermission')
          : t('admin.common.error'),
      )
    } finally {
      setSaving(false)
    }
  }, [value, hasWriteAccess, onClose, onSaved, t])

  const blocked = value.fxLock && decision != null && decision.kind !== 'ok'

  return (
    <AdminModal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={t(
        value.id
          ? 'admin.pricing.policies.form.titleEdit'
          : 'admin.pricing.policies.form.titleNew',
      )}
      description={t('admin.pricing.policies.form.lockHelp')}
      closeLabel={t('admin.common.cancel')}
      widthClass="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={adminButtonSecondaryClass}
            onClick={onClose}
            disabled={saving}
          >
            {t('admin.common.cancel')}
          </button>
          <button
            type="button"
            className={adminButtonPrimaryClass}
            onClick={() => void save()}
            disabled={saving || measuring || blocked || !hasWriteAccess}
          >
            {t('admin.pricing.policies.form.save')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={adminSettingsLabelClass} htmlFor="policy-scope">
            {t('admin.pricing.common.scopeLabel')}
          </label>
          <select
            id="policy-scope"
            className={adminSelectClass}
            style={adminSelectStyle}
            value={String(value.scope)}
            onChange={(e) =>
              setValue((v) => ({ ...v, scope: Number(e.target.value), targetId: null }))
            }
          >
            {SCOPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(`admin.pricing.common.scope.${o.key}`)}
              </option>
            ))}
          </select>
        </div>

        {value.scope !== 4 && (
          <RuleScopeTargetPicker
            scope={value.scope}
            value={value.targetId}
            onChange={(next) => setValue((v) => ({ ...v, targetId: next }))}
            disabled={saving}
          />
        )}

        <div className="flex items-start gap-3">
          <input
            id="policy-fx-lock"
            type="checkbox"
            checked={value.fxLock}
            onChange={(e) => setValue((v) => ({ ...v, fxLock: e.target.checked }))}
            className="mt-1"
          />
          <label htmlFor="policy-fx-lock" className="text-sm text-admin-fg">
            <span className="font-semibold">{t('admin.pricing.policies.form.lockLabel')}</span>
            <span className="block text-xs text-admin-fg-muted">
              {t('admin.pricing.policies.form.lockHelp')}
            </span>
          </label>
        </div>

        {/* Kilit KAPALIYKEN duran künye AKTİF KUR SANILMASIN. */}
        {!value.fxLock && value.frozenRate != null && (
          <p className="text-xs text-admin-fg-muted">
            {t('admin.pricing.policies.table.historicalHelp')}
            <span className="font-mono"> {value.frozenRate} </span>
            <span className="italic">{t('admin.pricing.policies.table.historical')}</span>
          </p>
        )}

        {measuring && (
          <p className="text-xs text-admin-fg-muted">
            {t('admin.pricing.policies.form.checking')}
          </p>
        )}

        {decision?.kind === 'ok' && (
          <p role="status" className="flex items-start gap-2 text-xs text-admin-accent">
            <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t('admin.pricing.policies.form.freezePreview', {
              currency: decision.currency,
              rate: String(decision.rate),
              date: decision.effectiveDate,
            })}
          </p>
        )}

        {decision?.kind === 'noProducts' && (
          <p role="alert" className="flex items-start gap-2 text-xs text-admin-warning">
            <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t('admin.pricing.policies.form.reject.noProducts')}
          </p>
        )}

        {decision?.kind === 'multiCurrency' && (
          <p role="alert" className="flex items-start gap-2 text-xs text-admin-danger">
            <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t('admin.pricing.policies.form.reject.multiCurrency', {
              count: String(decision.currencies.length),
              currencies: decision.currencies.join(', '),
            })}
          </p>
        )}

        {decision?.kind === 'rateUnavailable' && (
          <p role="alert" className="flex items-start gap-2 text-xs text-admin-danger">
            <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t('admin.pricing.policies.form.reject.rateUnavailable', {
              currency: decision.currency,
            })}
          </p>
        )}

        <div>
          <label className={adminSettingsLabelClass} htmlFor="policy-note">
            {t('admin.pricing.policies.form.noteLabel')}
          </label>
          <input
            id="policy-note"
            className={adminInputClass}
            value={value.note}
            onChange={(e) => setValue((v) => ({ ...v, note: e.target.value }))}
            placeholder={t('admin.pricing.policies.form.notePlaceholder')}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="policy-active"
            type="checkbox"
            checked={value.isActive}
            onChange={(e) => setValue((v) => ({ ...v, isActive: e.target.checked }))}
          />
          <label htmlFor="policy-active" className="text-sm text-admin-fg">
            {t('admin.pricing.policies.form.activeLabel')}
          </label>
        </div>
      </div>
    </AdminModal>
  )
}

export default PricingPolicyFormModal
export type { PolicyFormValue }
