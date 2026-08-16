'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, FileUp, Info, Search, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { generateId } from '../../utils/crypto'
import { useConfirm } from './overlay/ConfirmProvider'

/**
 * CSV STOK İÇE AKTARMA.
 *
 * `dcc5a895` (Inventory → DataTableKit) göçünde importer'ı kayboldu; dosya tam yazılmış
 * hâlde ama HİÇBİR yerden çağrılmadan kaldı → "CSV Yükle" işlevi kullanıcıdan düştü.
 *
 * Cetvel: `docs/standards/admin-design-standard.md` §4.
 *  · §4.8 — elle yazılmış perde/dialog odak tuzağı, ESC ve scroll lock SAĞLAMIYORDU;
 *    Radix Dialog'a alındı, `aria-modal` elle basılıyor (Radix basmaz).
 *  · §4.7 — GERÇEK içe aktarma (dry-run KAPALI) çok ürünün stoğunu tek seferde değiştirir:
 *    "ciddi / zincirleme sonuç" kademesi → `useConfirm` ile onay isteniyor. `window.confirm`
 *    yasak (INV-ADMIN-OVERLAY-1).
 *  · §4.9 — ham `z-50`/`z-raised` yerine `z-backdrop`/`z-modal`/`z-raised` token'ları.
 *
 * BİLİNEN GERİLİM (kapatılmadı, kayıt altında): §4.2 "modal içinde büyük tablo yok" diyor;
 * buradaki önizleme tablosu bunu zorluyor. Doğrusu ayrı bir içe-aktarma ROTASI olurdu;
 * bu iş regresyon onarımı olduğu için yüzey değiştirilmedi.
 */

interface CsvPreviewRow {
    sku: string
    name: string
    current: number
    new: number
    delta: number
    status: 'out' | 'critical' | null
}

interface InventoryCsvImportProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    effectiveThreshold: (_productId: string) => number | null
}

export default function InventoryCsvImport({ isOpen, onClose, onSuccess, effectiveThreshold }: InventoryCsvImportProps) {
    const { t } = useI18n()
    const confirm = useConfirm()
    const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[]>([])
    const [csvProcessing, setCsvProcessing] = useState<boolean>(false)
    const [dryRun, setDryRun] = useState<boolean>(true)
    const [csvProgress, setCsvProgress] = useState<number>(0)
    const csvUndoingRef = useRef(false)

    if (!isOpen) return null

    const handleCsvImport = async (file: File) => {
        setCsvPreview([])
        try {
            const textRaw = await file.text()
            const text = textRaw.replace(/^\uFEFF/, '')
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
            if (lines.length < 2) {
                toast.error(t('admin.inventory.import.errors.needHeaderAndRow'))
                return
            }

            const split = (s: string) =>
                s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))

            const headerRaw = split(lines[0]).map(h => h.trim().toLowerCase())
            const skuIdx = headerRaw.indexOf('sku')
            let qtyIdx = headerRaw.indexOf('qty')
            if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('quantity')
            if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('stock')
            if (qtyIdx === -1) qtyIdx = headerRaw.indexOf('new_stock')

            if (skuIdx === -1 || qtyIdx === -1) {
                toast.error(t('admin.inventory.import.errors.missingColumns'))
                return
            }

            const parsedRows: Array<{ line: number; sku: string; newQty: number }> = []
            const errors: Array<{ line: number; sku: string; message: string }> = []

            for (let i = 1; i < lines.length; i++) {
                const cells = split(lines[i])
                if (cells.every(c => (c ?? '').trim() === '')) continue
                const sku = String(cells[skuIdx] || '').trim()
                const qtyStr = String(cells[qtyIdx] || '').trim()
                const newQty = qtyStr === '' ? NaN : Number(qtyStr)
                if (!sku) {
                    errors.push({ line: i + 1, sku: '', message: t('admin.inventory.import.errors.missingSku') })
                    continue
                }
                if (!Number.isFinite(newQty)) {
                    errors.push({ line: i + 1, sku, message: t('admin.inventory.import.errors.qtyMustBeNumber') })
                    continue
                }
                parsedRows.push({ line: i + 1, sku, newQty: Math.max(0, Math.trunc(newQty)) })
            }

            if (parsedRows.length === 0) {
                toast.error(t('admin.inventory.import.errors.noValidRows'))
                return
            }

            const skus = Array.from(new Set(parsedRows.map(r => r.sku)))
            const { data: products } = await supabase
                .from('products')
                .select('id, sku, name, stock_qty')
                .in('sku', skus as string[])

            if (!products || products.length === 0) {
                toast.error(t('admin.inventory.import.errors.noMatchingSku'))
                return
            }

            const skuToProduct = new Map(
                (products as Array<{ sku: string; id: string; name: string; stock_qty: number | null }>)
                    .map(p => [p.sku, { id: p.id, name: p.name, stock: Number(p.stock_qty || 0) }])
            )

            const preview: CsvPreviewRow[] = []

            for (const row of parsedRows) {
                const product = skuToProduct.get(row.sku)
                if (!product) {
                    errors.push({ line: row.line, sku: row.sku, message: t('admin.inventory.import.errors.skuNotMatched') })
                    continue
                }
                const th = effectiveThreshold(product.id)
                const status: 'out' | 'critical' | null = (row.newQty <= 0)
                    ? 'out'
                    : (th != null && row.newQty <= Number(th)) ? 'critical' : null
                preview.push({
                    sku: row.sku,
                    name: product.name,
                    current: product.stock || 0,
                    new: row.newQty,
                    delta: row.newQty - (product.stock || 0),
                    status
                })
            }

            setCsvPreview(preview)
            if (errors.length > 0) {
                toast(t('admin.inventory.import.errors.someRowsSkipped'))
            }
        } catch (err) {
            console.error('CSV parse error:', err)
            toast.error(t('admin.inventory.import.errors.parseFailed'))
        }
    }

    const processCSV = async () => {
        if (csvPreview.length === 0) {
            toast.error(t('admin.inventory.import.errors.nothingToProcess'))
            return
        }

        // §4.7: gerçek içe aktarma çok ürünün stoğunu tek hamlede değiştirir (zincirleme
        // sonuç) → onay ZORUNLU. Kuru çalıştırma hiçbir şey yazmaz, onay istemez.
        if (!dryRun) {
            const ok = await confirm({
                title: t('admin.inventory.import.confirmTitle'),
                description: t('admin.inventory.import.confirmDescription', { count: csvPreview.length }),
                confirmLabel: t('admin.inventory.import.confirmLabel'),
                tone: 'danger',
            })
            if (!ok) return
        }

        setCsvProcessing(true)
        setCsvProgress(0)
        try {
            const skus = csvPreview.map(item => item.sku)
            const { data: products } = await supabase.from('products').select('id, sku').in('sku', skus as string[])

            if (!products || products.length === 0) {
                throw new Error(t('admin.inventory.import.errors.noMatchingProduct'))
            }

            const skuToId = new Map((products as Array<{ sku: string; id: string }>).map((p) => [p.sku, p.id]))

            if (dryRun) {
                toast.success(t('admin.inventory.import.dryRunSuccess'))
                onClose()
                return
            }

            let successCount = 0
            const errors: Array<{ sku: string; message: string }> = []
            const batchId = generateId()

            const BATCH_SIZE = 20
            for (let i = 0; i < csvPreview.length; i += BATCH_SIZE) {
                const chunk = csvPreview.slice(i, i + BATCH_SIZE)
                await Promise.all(chunk.map(async (item) => {
                    const _productId = skuToId.get(item.sku)
                    if (!_productId || item.delta === 0) return
                    try {
                        const reason = `CSV import: ${item.delta > 0 ? 'add' : 'remove'} ${Math.abs(item.delta)}`
                        const { error } = await supabase.rpc('adjust_stock', {
                            p_product_id: _productId,
                            p_delta: item.delta,
                            p_reason: reason,
                            p_batch_id: batchId
                        })
                        if (error) throw error
                        const { logAdminAction } = await import('../../lib/audit')
                        await logAdminAction(supabase, {
                            table_name: 'inventory_movements',
                            row_pk: _productId,
                            action: 'INSERT',
                            before: null,
                            after: { delta: item.delta, reason, batch_id: batchId },
                            comment: `CSV import (batch:${batchId})`
                        })
                        successCount++
                    } catch (err) {
                        console.error(`Error updating stock for SKU ${item.sku}:`, err)
                        errors.push({ sku: item.sku, message: (err as Error)?.message || t('admin.inventory.import.errors.unknown') })
                    }
                }))
                setCsvProgress(Math.min(1, (i + chunk.length) / csvPreview.length))
            }

            onClose()
            onSuccess()

            const downloadErrors = () => {
                if (errors.length === 0) return
                const header = [t('admin.inventory.import.errorCsv.sku'), t('admin.inventory.import.errorCsv.message')]
                const lines = errors.map(e => ['"' + e.sku.replace(/"/g, '""') + '"', '"' + e.message.replace(/"/g, '""') + '"'].join(','))
                const csv = '\uFEFF' + [header.join(','), ...lines].join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `inventory_errors_${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
            }

            toast.custom((id) => (
                <div className="bg-admin-surface rounded-admin-lg border border-admin-border shadow-admin-lg p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-admin-success" size={20} />
                        <span className="text-sm font-bold text-admin-fg">{t('admin.inventory.import.productsUpdated', { count: successCount })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/admin/movements?batch=${batchId}`}
                            className="px-3 py-1.5 text-xs font-semibold rounded-admin-md bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover transition-colors"
                        >{t('admin.inventory.import.viewMovements')}</a>
                        {errors.length > 0 && (
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-semibold rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg hover:bg-admin-surface-3"
                                onClick={() => { downloadErrors(); toast.dismiss(id) }}
                            >{t('admin.inventory.import.downloadErrors')}</button>
                        )}
                        <button
                            type="button"
                            className="px-3 py-1.5 text-xs font-semibold rounded-admin-md bg-admin-danger-weak text-admin-danger border border-admin-danger/30 hover:bg-admin-danger-weak transition-colors font-bold ml-auto"
                            onClick={async () => {
                                if (csvUndoingRef.current) return
                                csvUndoingRef.current = true
                                try {
                                    const { data, error } = await supabase.rpc('reverse_inventory_batch', { p_batch_id: batchId })
                                    if (error) throw error
                                    const undone = Number(data || 0)
                                    toast.success(t('admin.inventory.import.undoSuccess', { count: undone }))
                                    onSuccess()
                                } catch (e) {
                                    console.error('csv undo error', e)
                                    toast.error(t('admin.inventory.import.undoFailed'))
                                } finally {
                                    csvUndoingRef.current = false
                                    toast.dismiss(id)
                                }
                            }}
                        >{t('admin.inventory.import.undoAll')}</button>
                    </div>
                </div>
            ), { duration: 15000 })

        } catch (err) {
            console.error('CSV processing error:', err)
            toast.error(t('admin.inventory.import.errors.processFailed'))
        } finally {
            setCsvProcessing(false)
            setCsvProgress(0)
        }
    }

    return (
        <Dialog.Root open onOpenChange={(next) => { if (!next) onClose() }}>
            <Dialog.Portal>
                {/* Perde = görsel örtü + body scroll lock (cetvel §2.5). */}
                <Dialog.Overlay className="fixed inset-0 z-backdrop bg-black/60" />
                <Dialog.Content
                    // Radix `aria-modal` basmıyor → elle (INV-ADMIN-OVERLAY-2).
                    aria-modal="true"
                    aria-describedby={undefined}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal bg-admin-surface rounded-admin-lg shadow-elevation-5 max-w-2xl w-full max-h-85vh overflow-hidden flex flex-col border border-admin-border animate-in zoom-in-95 duration-300"
                >
                    <header className="px-8 py-6 border-b border-admin-border flex items-center justify-between bg-admin-surface-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-admin-lg bg-admin-accent">
                                <FileUp size={20} className="text-admin-accent-fg" />
                            </div>
                            <Dialog.Title className="text-xl font-semibold text-admin-fg tracking-tight">{t('admin.inventory.import.title')}</Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                aria-label={t('admin.inventory.import.close')}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-admin-surface border border-admin-border text-admin-fg-muted hover:text-admin-fg transition-colors hover:bg-admin-surface-2"
                            >
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </header>

                    <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-admin-fg-muted ml-1" htmlFor="inventory-csv-file">{t('admin.inventory.import.selectFile')}</label>
                            <div className="border-2 border-dashed border-admin-border rounded-admin-lg p-12 text-center hover:border-admin-accent/40 hover:bg-admin-accent-weak transition-colors group cursor-pointer relative bg-surface-deep/20">
                                <input
                                    id="inventory-csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) void handleCsvImport(file)
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-admin-surface border border-admin-border flex items-center justify-center group-hover:scale-110 group-hover:bg-admin-accent transition-transform duration-300">
                                        <FileUp size={24} className="text-admin-fg-muted group-hover:text-admin-accent-fg" />
                                    </div>
                                    <div className="text-admin-fg-muted group-hover:text-admin-fg transition-colors">
                                        <p className="text-sm font-bold">{t('admin.inventory.import.dragDropText')} <span className="text-admin-accent underline decoration-admin-accent underline-offset-4">{t('admin.inventory.import.browseText')}</span></p>
                                        <p className="text-xs font-semibold mt-2 opacity-50">{t('admin.inventory.import.formatInfo')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-admin-surface rounded-admin-md border border-admin-border p-5 flex items-center gap-4 hover:border-admin-border transition-colors">
                            <div
                                className={cn("p-2 rounded-admin-md transition-colors", dryRun ? 'bg-admin-warning' : 'bg-admin-surface-2')}
                                style={dryRun ? { '--glow-color': 'rgba(245,158,11,0.3)' } as React.CSSProperties : undefined}
                            >
                                <Info size={18} className={dryRun ? 'text-admin-accent-fg' : 'text-admin-fg-muted'} />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="dryRun" className="text-sm font-bold text-admin-fg select-none cursor-pointer flex items-center gap-2">
                                    {t('admin.inventory.import.dryRunMode')}
                                    <input
                                        type="checkbox"
                                        id="dryRun"
                                        checked={dryRun}
                                        onChange={(e) => setDryRun(e.target.checked)}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-xs font-bold text-admin-fg-muted tracking-tight mt-0.5">{t('admin.inventory.import.dryRunHint')}</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={dryRun}
                                aria-label={t('admin.inventory.import.toggleSimulation')}
                                tabIndex={0}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 ${dryRun ? 'bg-admin-warning' : 'bg-admin-surface-3'}`}
                                onClick={() => setDryRun(!dryRun)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setDryRun(!dryRun);
                                    }
                                }}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-admin-surface shadow-admin-sm transition-transform ${dryRun ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {csvPreview.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between ml-1">
                                    <h3 className="text-xs font-semibold text-admin-fg-muted flex items-center gap-2">
                                        <Search size={12} />
                                        {t('admin.inventory.import.previewCount', { count: csvPreview.length })}
                                    </h3>
                                </div>
                                <div className="bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden shadow-admin-lg">
                                    <div className="max-h-300px overflow-auto custom-scrollbar">
                                        <table className="w-full text-xs border-separate border-spacing-0">
                                            <thead className="sticky top-0 bg-admin-surface z-raised">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-left font-semibold text-admin-fg-muted text-xs border-b border-admin-border">{t('admin.inventory.table.productInfo')}</th>
                                                    <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted text-xs border-b border-admin-border">{t('admin.inventory.import.table.current')}</th>
                                                    <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted text-xs border-b border-admin-border">{t('admin.inventory.import.table.new')}</th>
                                                    <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted text-xs border-b border-admin-border">{t('admin.inventory.import.table.delta')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-transparent">
                                                {csvPreview.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-admin-surface-2 transition-colors group">
                                                        <td className="px-4 py-2.5 border-b border-admin-border group-last:border-0">
                                                            <div className="font-bold text-admin-fg text-xs truncate max-w-200px">{item.name || item.sku}</div>
                                                            <div className="text-xs text-admin-accent font-mono tracking-tighter mt-0.5">{item.sku}</div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-admin-fg-muted border-b border-admin-border group-last:border-0">{item.current}</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-admin-fg border-b border-admin-border group-last:border-0">{item.new}</td>
                                                        <td className={`px-5 py-3 text-right font-semibold border-b border-admin-border group-last:border-0 ${item.delta > 0 ? 'text-admin-success' : 'text-admin-danger'}`}>
                                                            {item.delta > 0 ? '+' : ''}{item.delta}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <footer className="px-8 py-6 border-t border-admin-border flex justify-end items-center gap-4 bg-admin-surface-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-12 px-8 rounded-admin-lg bg-admin-surface border border-admin-border text-admin-fg-muted text-xs font-semibold hover:text-admin-fg transition-colors"
                        >
                            {t('admin.common.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={() => void processCSV()}
                            disabled={csvPreview.length === 0 || csvProcessing}
                            className={`h-12 px-10 rounded-admin-lg text-xs font-semibold transition-colors shadow-admin-lg disabled:opacity-30 ${dryRun ? 'bg-admin-warning text-admin-accent-fg hover:bg-admin-warning shadow-amber-400/10' : 'bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover shadow-cyan-400/10'}`}
                        >
                            {csvProcessing ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-surface-deep/20 border-t-surface-deep rounded-full animate-spin" />
                                    {t('admin.inventory.import.processing', { progress: Math.round(csvProgress * 100) })}
                                </span>
                            ) : (dryRun ? t('admin.inventory.import.testOnly') : t('admin.inventory.import.importData'))}
                        </button>
                    </footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
