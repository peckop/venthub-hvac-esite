'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2, RefreshCw, Save, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useRole } from '@/hooks/useRole'
import { formatNumber } from '@/i18n/format'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { type CostRefreshSummary, refreshCostInBase } from '@/lib/services/pricingMaterialize.service'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { adminButtonPrimaryClass, adminModalScrollAreaClass } from '../../../utils/adminUi'

/**
 * "Maliyetleri tazele" modalı.
 *
 * NEDEN AYRI BİR ADIM: `purchase_price` EUR cinsinden LİSTE fiyatıdır; `cost_in_base` ise
 * onun TL karşılığının DONMUŞ hâlidir. Kur her gün değişir, dolayısıyla tazeleyen bir adım
 * olmadan bütün vitrin, maliyetin en son yazıldığı günün kurunda kalır — cetvel §2·A'nın
 * "liste fiyatı canlı kurla döner, donmaz" kuralının sessiz ihlali. W4a'da servis yazılmış
 * ama panele bağlanmamıştı; bu modal o boşluğu kapatır.
 *
 * Fiyat hesaplamasından AYRI tutulur çünkü ikisinin önizlemesi ayrı gerçeği gösterir:
 * burada "hangi maliyet, hangi kurla değişiyor", orada "hangi fiyat, hangi kuralla çıkıyor".
 * Tek modalde birleştirilseydi fiyat önizlemesi tazelenmemiş maliyetle hesaplanır, yani
 * kullanıcıya UYGULA'dan önce yanlış sayı gösterilirdi.
 */

interface CostRefreshModalProps {
  open: boolean
  onClose: () => void
  /** Uygulama başarıyla bitince çağrılır — çağıran taraf bayat önizlemeleri tazeler. */
  onSuccess: () => void
}

const CostRefreshModal: React.FC<CostRefreshModalProps> = ({ open, onClose, onSuccess }) => {
  const { t, lang } = useI18n()
  const locale = lang === 'en' ? 'en' : 'tr'
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<CostRefreshSummary | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [applying, setApplying] = useState(false)

  const loadPreview = useCallback(() => {
    let alive = true
    setPreviewLoading(true)
    setLoadFailed(false)
    void (async () => {
      try {
        const summary = await refreshCostInBase(supabase, { dryRun: true })
        if (!alive) return
        setPreview(summary)
      } catch {
        if (!alive) return
        setPreview(null)
        setLoadFailed(true)
      } finally {
        if (alive) setPreviewLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  /* İptal fonksiyonu ref'te: "tekrar dene" yolu da iptal edilebilir olmalı, yoksa kapanan
     modalın state'ine geç gelen yanıt yazılır (yarış). */
  const cancelPreviewRef = useRef<(() => void) | null>(null)

  const startPreview = useCallback(() => {
    cancelPreviewRef.current?.()
    cancelPreviewRef.current = loadPreview()
  }, [loadPreview])

  useEffect(() => {
    if (!open) return
    setPreview(null)
    setLoadFailed(false)
    startPreview()
    return () => {
      cancelPreviewRef.current?.()
      cancelPreviewRef.current = null
    }
  }, [open, startPreview])

  const handleClose = useCallback(() => {
    if (applying) return
    onClose()
  }, [applying, onClose])

  const applyRefresh = useCallback(async () => {
    if (!preview) return
    try {
      setApplying(true)
      const result = await mutateWithAudit(supabase, {
        // Denetim izi yazılan TABLOYU işaret eder: bu mutasyon products.cost_in_base'e yazar.
        resource: 'products',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: { ...preview },
        after: null,
        // Önizleme ile koşu arasında kur değişmiş olabilir; iz GERÇEKLEŞENİ taşımalı.
        afterFrom: (applied) => ({ ...applied }),
        auditedByEdge: false,
        // INV-6: blok gövde + await (ifade-gövdeli arrow "sahte-success" sayılır).
        fn: async () => {
          return await refreshCostInBase(supabase, { dryRun: false })
        },
      })
      toast.success(t('admin.pricing.rules.costRefresh.toasts.applied', { count: result.updated }))
      onSuccess()
      onClose()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.pricing.common.noPermission')
          : t('admin.pricing.rules.costRefresh.toasts.applyFailed'),
      )
    } finally {
      setApplying(false)
    }
  }, [preview, hasWriteAccess, onSuccess, onClose, t])

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? undefined : handleClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-modal" />
        <Dialog.Content
          // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
          aria-modal="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-admin-bg border border-admin-border rounded-admin-lg shadow-admin-lg z-modal flex flex-col overflow-hidden max-h-admin-modal">
          <div className="p-6 border-b border-admin-border flex items-center justify-between bg-admin-surface-2">
            <div>
              <Dialog.Title className="text-xl font-bold text-admin-fg tracking-tight">
                {t('admin.pricing.rules.costRefresh.title')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-admin-fg-muted mt-1">
                {t('admin.pricing.rules.costRefresh.description')}
              </Dialog.Description>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('admin.pricing.rules.form.close')}
              className="p-2 rounded-admin-md hover:bg-admin-surface-3 transition-colors text-admin-fg-muted hover:text-admin-fg focus-visible:ring-2 focus-visible:ring-admin-accent/30"
            >
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 ${adminModalScrollAreaClass}`}>
            {previewLoading ? (
              <p className="flex items-center gap-2 text-xs font-bold text-admin-fg-muted">
                <Loader2 size={14} className="animate-spin" />
                {t('admin.pricing.rules.costRefresh.loading')}
              </p>
            ) : loadFailed ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm font-bold text-admin-danger">
                  <AlertTriangle size={16} />
                  {t('admin.pricing.common.loadFailed')}
                </p>
                <button
                  type="button"
                  onClick={startPreview}
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg text-xs font-semibold hover:bg-admin-surface-2 hover:text-admin-fg transition-colors"
                >
                  <RefreshCw size={14} />
                  {t('admin.pricing.rules.costRefresh.retry')}
                </button>
              </div>
            ) : preview ? (
              <div className="space-y-8">
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-admin-lg bg-admin-surface border border-admin-border p-4 space-y-1">
                    <p className="text-xs font-semibold text-admin-fg-muted">
                      {t('admin.pricing.rules.costRefresh.summary.scanned')}
                    </p>
                    <p className="text-lg font-semibold text-admin-fg">{formatNumber(preview.scanned, locale)}</p>
                  </div>
                  <div className="rounded-admin-lg bg-admin-surface border border-admin-border p-4 space-y-1">
                    <p className="text-xs font-semibold text-admin-fg-muted">
                      {t('admin.pricing.rules.costRefresh.summary.updated')}
                    </p>
                    <p className="text-lg font-semibold text-admin-accent">{formatNumber(preview.updated, locale)}</p>
                  </div>
                  {/* Atlananlar GÖRÜNMEK ZORUNDA: kuru olmayan ürün sessizce eski maliyette kalır. */}
                  <div className="rounded-admin-lg bg-admin-surface border border-admin-border p-4 space-y-1">
                    <p className="text-xs font-semibold text-admin-fg-muted">
                      {t('admin.pricing.rules.costRefresh.summary.skippedNoRate')}
                    </p>
                    <p
                      className={
                        preview.skippedNoRate > 0 ? 'text-lg font-semibold text-admin-warning' : 'text-lg font-semibold text-admin-fg'
                      }
                    >
                      {formatNumber(preview.skippedNoRate, locale)}
                    </p>
                  </div>
                  <div className="rounded-admin-lg bg-admin-surface border border-admin-border p-4 space-y-1">
                    <p className="text-xs font-semibold text-admin-fg-muted">
                      {t('admin.pricing.rules.costRefresh.summary.skippedNoPurchasePrice')}
                    </p>
                    <p
                      className={
                        preview.skippedNoPurchasePrice > 0
                          ? 'text-lg font-semibold text-admin-warning'
                          : 'text-lg font-semibold text-admin-fg'
                      }
                    >
                      {formatNumber(preview.skippedNoPurchasePrice, locale)}
                    </p>
                  </div>
                  {/*
                    KUR KİLİDİ atlaması: servis bu sayıyı hep üretiyordu ama HİÇBİR
                    yüzeyde gösterilmiyordu — kilit, ürünleri sessizce atlıyordu.
                    Kilidi görünür kılan tek geri bildirim budur (pricing-standard §8.2.1-C).

                    Ayrıca SESSİZ-ARIZA dedektörü: aktif kilit varken bu sayaç sürekli 0
                    ise kilit UYGULANMIYOR demektir. Bu yüzden 0 değeri de gösterilir,
                    gizlenmez.
                  */}
                  <div className="rounded-admin-lg bg-admin-surface border border-admin-border p-4 space-y-1">
                    <p className="text-xs font-semibold text-admin-fg-muted">
                      {t('admin.pricing.rules.costRefresh.summary.skippedFxLocked')}
                    </p>
                    <p
                      className={
                        preview.skippedFxLocked > 0
                          ? 'text-lg font-semibold text-admin-accent'
                          : 'text-lg font-semibold text-admin-fg'
                      }
                    >
                      {formatNumber(preview.skippedFxLocked, locale)}
                    </p>
                  </div>
                </section>

                {/* ---- kullanılan kurlar: hangi maliyet HANGİ kurla yazılıyor, izlenebilir olmalı ---- */}
                <section className="space-y-4 rounded-admin-lg bg-admin-surface border border-admin-border p-6">
                  <h3 className="text-xs font-semibold text-admin-accent">
                    {t('admin.pricing.rules.costRefresh.rates.title')}
                  </h3>
                  {preview.ratesUsed.length === 0 ? (
                    <p className="text-sm text-admin-fg-muted">{t('admin.pricing.rules.costRefresh.rates.empty')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {preview.ratesUsed.map((r) => (
                        <li
                          key={r.currency}
                          className="flex items-center justify-between text-sm border-b border-admin-border pb-2 last:border-0 last:pb-0"
                        >
                          <span className="font-bold text-admin-fg">
                            {t('admin.pricing.rules.costRefresh.rates.pair', { currency: r.currency })}
                          </span>
                          <span className="text-admin-fg tabular-nums">
                            {formatNumber(r.rate, locale, { maximumFractionDigits: 4 })}
                            <span className="text-admin-fg-muted ml-2">{r.effectiveDate}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* "Yazılacak bir şey yok" iki AYRI gerçeği anlatabilir: ya maliyetler güncel,
                    ya da kuru bulunamadığı için hepsi atlandı. İkincisine "güncel" demek yanlış. */}
                {preview.updated === 0 ? (
                  <p className="text-sm text-admin-fg-muted">
                    {preview.skippedNoRate > 0
                      ? t('admin.pricing.rules.costRefresh.noneWritable')
                      : t('admin.pricing.rules.costRefresh.upToDate')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="p-6 border-t border-admin-border flex items-center justify-end gap-3 bg-admin-surface-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={applying}
              className="px-4 h-10 rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg text-xs font-semibold hover:bg-admin-surface-2 hover:text-admin-fg transition-colors disabled:opacity-40"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void applyRefresh()}
              disabled={!preview || applying || !hasWriteAccess || preview.updated === 0}
              className={`${adminButtonPrimaryClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {applying ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {applying
                ? t('admin.pricing.rules.costRefresh.applying')
                : t('admin.pricing.rules.costRefresh.apply')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CostRefreshModal
