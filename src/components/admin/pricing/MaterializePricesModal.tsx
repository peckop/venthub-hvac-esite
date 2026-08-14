'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2, RefreshCw, Save, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useRole } from '@/hooks/useRole'
import { formatCurrency, formatNumber } from '@/i18n/format'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { materializePrices, type MaterializeSummary } from '@/lib/services/pricingMaterialize.service'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { adminButtonPrimaryClass, adminModalScrollAreaClass } from '../../../utils/adminUi'

/**
 * "Fiyatları yeniden hesapla" modalı (W3-T2).
 *
 * Motor akışı: açılışta HER ZAMAN dryRun:true ile önizleme çalıştırılır — hiçbir şey
 * yazılmadan önce kaç ürünün fiyatlanacağı / "Teklif Alın" kalacağı / segment kırılımı
 * görülür. "Uygula" yalnız önizleme başarıyla yüklendiğinde ve yazma yetkisi varken
 * etkindir; gerçek yazım dryRun:false ile mutateWithAudit üzerinden koşar (K3+K4).
 */

/** DB user_type değeri → ortak segment sözlük anahtarı (common.segment ile aynı harita). */
const SEGMENT_I18N_KEYS: Record<string, string> = {
  individual: 'individual',
  dealer: 'dealer',
  corporate: 'corporate',
  base_book: 'baseBook',
}

function segmentLabel(userType: string, t: (key: string) => string): string {
  const key = SEGMENT_I18N_KEYS[userType]
  return key ? t(`admin.pricing.common.segment.${key}`) : userType
}

interface MaterializePricesModalProps {
  open: boolean
  onClose: () => void
  /** Uygulama başarıyla bitince çağrılır — çağıran taraf kural/fiyat listesini tazeler. */
  onSuccess: () => void
}

const MaterializePricesModal: React.FC<MaterializePricesModalProps> = ({ open, onClose, onSuccess }) => {
  const { t, lang } = useI18n()
  const locale = lang === 'en' ? 'en' : 'tr'
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<MaterializeSummary | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [applying, setApplying] = useState(false)

  const loadPreview = useCallback(() => {
    let alive = true
    setPreviewLoading(true)
    setLoadFailed(false)
    void (async () => {
      try {
        const summary = await materializePrices(supabase, { dryRun: true })
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

  /* ---- açılışta + yeniden dene'de önizleme ----
   * İptal fonksiyonu ref'te tutulur: "tekrar dene" yolu da iptal edilebilir olmalı,
   * yoksa kapanan modalın state'ine geç gelen yanıt yazılır (yarış). */
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

  const applyMaterialize = useCallback(async () => {
    if (!preview) return
    try {
      setApplying(true)
      const result = await mutateWithAudit(supabase, {
        // Denetim izi yazılan TABLOYU işaret etmeli: bu mutasyon pricing_rule'a değil,
        // product_prices cache'ine yazar ("fiyatları kim/ne zaman toplu türetti?").
        resource: 'product_prices',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: { ...preview },
        after: null,
        // Denetim izi TAHMİNİ değil GERÇEKLEŞENİ taşımalı: önizleme ile koşu arasında kural
        // değişmiş olabilir; `after` sabit kalsaydı "ne yazıldı" sorusu cevapsız kalırdı.
        afterFrom: (result) => ({ ...result }),
        auditedByEdge: false,
        // INV-6: blok gövde + await (ifade-gövdeli arrow "sahte-success" sayılır).
        fn: async () => {
          return await materializePrices(supabase, { dryRun: false })
        },
      })
      toast.success(t('admin.pricing.rules.materialize.toasts.applied', { count: result.rowsUpserted }))
      onSuccess()
      onClose()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.pricing.common.noPermission')
          : t('admin.pricing.rules.materialize.toasts.applyFailed'),
      )
    } finally {
      setApplying(false)
    }
  }, [preview, hasWriteAccess, onSuccess, onClose, t])

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? undefined : handleClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {t('admin.pricing.rules.materialize.title')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400 mt-1">
                {t('admin.pricing.rules.materialize.description')}
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
            {previewLoading ? (
              <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Loader2 size={14} className="animate-spin" />
                {t('admin.pricing.rules.materialize.loading')}
              </p>
            ) : loadFailed ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm font-bold text-rose-400">
                  <AlertTriangle size={16} />
                  {t('admin.pricing.common.loadFailed')}
                </p>
                <button
                  type="button"
                  onClick={startPreview}
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-xl glass border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} />
                  {t('admin.pricing.rules.materialize.retry')}
                </button>
              </div>
            ) : preview ? (
              <div className="space-y-8">
                {/* ---- kapsam özeti ---- */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.scanned')}
                    </p>
                    <p className="text-lg font-black text-white">
                      {formatNumber(preview.productsScanned, locale)}
                    </p>
                  </div>
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.priced')}
                    </p>
                    <p className="text-lg font-black text-cyan-400">
                      {formatNumber(preview.pricedProducts, locale)}
                    </p>
                  </div>
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.quoteOnly')}
                    </p>
                    <p className="text-lg font-black text-amber-400">
                      {formatNumber(preview.quoteOnlyProducts, locale)}
                    </p>
                  </div>
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.totalNet')}
                    </p>
                    <p className="text-lg font-black text-white">
                      {formatCurrency(preview.totalNetTry, locale, { currency: 'TRY' })}
                    </p>
                  </div>
                  {/* Sessiz etki olmaz: dokunulmayan elle-ezme ve pasifleştirilecek bayat satır
                      sayısı UYGULA'dan ÖNCE görünür (cetvel §8.1). */}
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.skippedManual')}
                    </p>
                    <p className="text-lg font-black text-white">
                      {formatNumber(preview.skippedManual, locale)}
                    </p>
                  </div>
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.deactivated')}
                    </p>
                    <p className="text-lg font-black text-rose-400">
                      {formatNumber(preview.deactivated, locale)}
                    </p>
                  </div>
                  {/* Cetvel §8.3: markası köprülenemeyen ürün sayısı GÖRÜNMEK ZORUNDA —
                      yoksa "marka kuralı neden işlemedi?" sorusu cevapsız kalır. */}
                  <div className="rounded-2xl glass border border-white/10 p-4 space-y-1">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {t('admin.pricing.rules.materialize.summary.unbridgedBrand')}
                    </p>
                    <p
                      className={
                        preview.unbridgedBrand > 0 ? 'text-lg font-black text-amber-400' : 'text-lg font-black text-white'
                      }
                    >
                      {formatNumber(preview.unbridgedBrand, locale)}
                    </p>
                  </div>
                </section>

                {/* ---- segment kırılımı ---- */}
                <section className="space-y-4 rounded-2xl glass border border-white/10 p-6">
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                    {t('admin.pricing.rules.materialize.segments.title')}
                  </h3>
                  {preview.bySegment.length === 0 ? (
                    <p className="text-xs font-bold text-slate-500">
                      {t('admin.pricing.rules.materialize.segments.empty')}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {preview.bySegment.map((seg) => (
                        <li
                          key={`${seg.priceListId}:${seg.userType}`}
                          className="flex flex-wrap items-center gap-3 rounded-xl bg-white/3 border border-white/5 px-4 py-3"
                        >
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider">
                            {segmentLabel(seg.userType, t)}
                          </span>
                          <span className="ml-auto text-xs font-black uppercase tracking-widest text-white">
                            {t('admin.pricing.rules.materialize.segments.table.priced')}
                            {': '}
                            {formatNumber(seg.priced, locale)}
                          </span>
                          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                            {t('admin.pricing.rules.materialize.segments.table.quoteOnly')}
                            {': '}
                            {formatNumber(seg.quoteOnly, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* ---- örnek satırlar ---- */}
                <section className="space-y-4 rounded-2xl glass border border-white/10 p-6">
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                    {t('admin.pricing.rules.materialize.samples.title')}
                  </h3>
                  {preview.samples.length === 0 ? (
                    <p className="text-xs font-bold text-slate-500">
                      {t('admin.pricing.rules.materialize.samples.empty')}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {preview.samples.map((row) => (
                        <li
                          key={`${row.sku}:${row.ruleId}`}
                          className="flex flex-wrap items-center gap-3 rounded-xl bg-white/3 border border-white/5 px-4 py-3"
                        >
                          <span className="text-sm font-bold text-white truncate">{row.name}</span>
                          <span className="text-xs font-mono font-bold text-slate-500">{row.sku}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-wider">
                            {segmentLabel(row.userType, t)}
                          </span>
                          <span className="ml-auto text-xs font-black uppercase tracking-widest text-slate-500">
                            {formatCurrency(row.net, locale, { currency: 'TRY' })}
                          </span>
                          <span className="text-xs font-black text-slate-600" aria-hidden="true">
                            {'→'}
                          </span>
                          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                            {formatCurrency(row.gross, locale, { currency: 'TRY' })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            ) : null}
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/2">
            <button
              type="button"
              onClick={handleClose}
              disabled={applying}
              className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void applyMaterialize()}
              disabled={!hasWriteAccess || !preview || previewLoading || applying}
              className={`${adminButtonPrimaryClass} flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {applying ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {applying
                ? t('admin.pricing.rules.materialize.applying')
                : t('admin.pricing.rules.materialize.apply')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MaterializePricesModal
