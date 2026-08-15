import { CheckCircle2, FileUp, Info,Search, X } from 'lucide-react'
import React, { useRef,useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { generateId } from '../../utils/crypto'

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
            const text = textRaw.replace(/^\ufeff/, '')
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
            if (lines.length < 2) {
                toast.error('CSV dosyası en az bir başlık satırı ve bir veri satırı içermelidir')
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
                toast.error('Başlık satırında sku ve qty/quantity/stock sütunları bulunmalı')
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
                    errors.push({ line: i + 1, sku: '', message: 'SKU eksik' })
                    continue
                }
                if (!Number.isFinite(newQty)) {
                    errors.push({ line: i + 1, sku, message: 'Miktar sayı olmalı' })
                    continue
                }
                parsedRows.push({ line: i + 1, sku, newQty: Math.max(0, Math.trunc(newQty)) })
            }

            if (parsedRows.length === 0) {
                toast.error('Geçerli satır bulunamadı')
                return
            }

            const skus = Array.from(new Set(parsedRows.map(r => r.sku)))
            const { data: products } = await supabase
                .from('products')
                .select('id, sku, name, stock_qty')
                .in('sku', skus as string[])

            if (!products || products.length === 0) {
                toast.error('Eşleşen SKU bulunamadı')
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
                    errors.push({ line: row.line, sku: row.sku, message: 'SKU eşleşmedi' })
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
                toast('Bazı satırlar atlandı; önizlemeyi kontrol edin')
            }
        } catch (err) {
            console.error('CSV parse error:', err)
            toast.error('CSV dosyası işlenirken hata oluştu')
        }
    }

    const processCSV = async () => {
        if (csvPreview.length === 0) {
            toast.error('İşlenecek veri yok')
            return
        }

        setCsvProcessing(true)
        setCsvProgress(0)
        try {
            const skus = csvPreview.map(item => item.sku)
            const { data: products } = await supabase.from('products').select('id, sku').in('sku', skus as string[])

            if (!products || products.length === 0) {
                throw new Error('Eşleşen ürün bulunamadı')
            }

            const skuToId = new Map((products as Array<{ sku: string; id: string }>).map((p) => [p.sku, p.id]))

            if (dryRun) {
                toast.success('Kuru çalıştırma başarılı, işlem yapılmadı')
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
                        errors.push({ sku: item.sku, message: (err as Error)?.message || 'Bilinmeyen hata' })
                    }
                }))
                setCsvProgress(Math.min(1, (i + chunk.length) / csvPreview.length))
            }

            onClose()
            onSuccess()

            const downloadErrors = () => {
                if (errors.length === 0) return
                const header = ['sku', 'message']
                const lines = errors.map(e => ['"' + e.sku.replace(/"/g, '""') + '"', '"' + e.message.replace(/"/g, '""') + '"'].join(','))
                const csv = '\ufeff' + [header.join(','), ...lines].join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `inventory_errors_${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
            }

            toast.custom((id) => (
                <div className="glass-strong rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                        <span className="text-sm font-bold text-white">{t('admin.inventory.import.productsUpdated', { count: successCount })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/admin/movements?batch=${batchId}`}
                            className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl bg-cyan-400 text-surface-deep hover:bg-cyan-300 transition-colors"
                        >{t('admin.inventory.import.viewMovements')}</a>
                        {errors.length > 0 && (
                            <button
                                className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl glass border border-white/10 text-white hover:bg-white/10"
                                onClick={() => { downloadErrors(); toast.dismiss(id) }}
                            >{t('admin.inventory.import.downloadErrors')}</button>
                        )}
                        <button
                            className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-colors font-bold ml-auto"
                            onClick={async () => {
                                if (csvUndoingRef.current) return
                                csvUndoingRef.current = true
                                try {
                                    const { data, error } = await supabase.rpc('reverse_inventory_batch', { p_batch_id: batchId })
                                    if (error) throw error
                                    const undone = Number(data || 0)
                                    toast.success(`${undone} hareket geri alındı`)
                                    onSuccess()
                                } catch (e) {
                                    console.error('csv undo error', e)
                                    toast.error('Geri alma başarısız')
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
            toast.error('CSV işlenirken hata oluştu')
        } finally {
            setCsvProcessing(false)
            setCsvProgress(0)
        }
    }

    return (
        <>
            <button 
                type="button"
                className="fixed inset-0 w-full h-full bg-black/60 z-50 backdrop-blur-sm cursor-default border-none outline-none" 
                onClick={onClose}
                aria-label={t('admin.inventory.import.close')}
                tabIndex={-1}
            />
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                role="dialog"
                aria-modal="true"
                aria-labelledby="csv-import-title"
            >
                <div className="glass-strong rounded-hvac-2xl shadow-elevation-5 max-w-2xl w-full max-h-85vh overflow-hidden flex flex-col pointer-events-auto border border-white/10 animate-in zoom-in-95 duration-300">
                    <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-cyan-400 shadow-glow-md">
                                <FileUp size={20} className="text-surface-deep" />
                            </div>
                            <h2 id="csv-import-title" className="text-xl font-black text-white uppercase tracking-tight">{t('admin.inventory.import.title')}</h2>
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full glass border border-white/10 text-slate-400 hover:text-white transition-colors hover:bg-white/5" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </header>
                    
                    <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1">{t('admin.inventory.import.selectFile')}</label>
                            <div className="border-2 border-dashed border-white/10 rounded-hvac-xl p-12 text-center hover:border-cyan-400/40 hover:bg-cyan-400/2 transition-colors group cursor-pointer relative bg-surface-deep/20">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleCsvImport(file)
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full glass border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-400 transition-transform duration-300">
                                        <FileUp size={24} className="text-slate-400 group-hover:text-surface-deep" />
                                    </div>
                                    <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <p className="text-sm font-bold">{t('admin.inventory.import.dragDropText')} <span className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-4">{t('admin.inventory.import.browseText')}</span></p>
                                        <p className="text-xs uppercase font-black tracking-widest mt-2 opacity-50">{t('admin.inventory.import.formatInfo')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-hvac-lg border border-white/5 p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                            <div 
                                className={cn("p-2 rounded-lg transition-colors", dryRun ? 'bg-amber-400 shadow-glow-sm' : 'bg-white/5')}
                                style={dryRun ? { '--glow-color': 'rgba(245,158,11,0.3)' } as React.CSSProperties : undefined}
                            >
                                <Info size={18} className={dryRun ? 'text-surface-deep' : 'text-slate-500'} />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="dryRun" className="text-sm font-bold text-slate-300 select-none cursor-pointer flex items-center gap-2">
                                    {t('admin.inventory.import.dryRunMode')}
                                    <input
                                        type="checkbox"
                                        id="dryRun"
                                        checked={dryRun}
                                        onChange={(e) => setDryRun(e.target.checked)}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-0.5">{t('admin.inventory.import.dryRunHint')}</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={dryRun}
                                aria-label={t('admin.inventory.import.toggleSimulation')}
                                tabIndex={0}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${dryRun ? 'bg-amber-400' : 'bg-white/10'}`}
                                onClick={() => setDryRun(!dryRun)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setDryRun(!dryRun);
                                    }
                                }}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${dryRun ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {csvPreview.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between ml-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal flex items-center gap-2">
                                        <Search size={12} />
                                        {t('admin.inventory.import.previewCount', { count: csvPreview.length })}
                                    </h3>
                                </div>
                                <div className="glass rounded-hvac-xl border border-white/5 overflow-hidden shadow-2xl">
                                    <div className="max-h-300px overflow-auto custom-scrollbar">
                                        <table className="w-full text-xs border-separate border-spacing-0">
                                            <thead className="sticky top-0 bg-surface-midnight z-10">
                                                <tr>
                                                    <th className="px-5 py-4 text-left font-black text-slate-500 uppercase tracking-widest text-xs border-b border-white/5">{t('admin.inventory.table.productInfo')}</th>
                                                    <th className="px-5 py-4 text-right font-black text-slate-500 uppercase tracking-widest text-xs border-b border-white/5">{t('admin.inventory.import.table.current')}</th>
                                                    <th className="px-5 py-4 text-right font-black text-slate-500 uppercase tracking-widest text-xs border-b border-white/5">{t('admin.inventory.import.table.new')}</th>
                                                    <th className="px-5 py-4 text-right font-black text-slate-500 uppercase tracking-widest text-xs border-b border-white/5">{t('admin.inventory.import.table.delta')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-transparent">
                                                {csvPreview.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-white/3 transition-colors group">
                                                        <td className="px-5 py-3 border-b border-white/5 group-last:border-0">
                                                            <div className="font-bold text-white uppercase text-xs truncate max-w-200px">{item.name || item.sku}</div>
                                                            <div className="text-xs text-cyan-400 font-mono tracking-tighter uppercase mt-0.5">{item.sku}</div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right text-slate-500 font-bold border-b border-white/5 group-last:border-0">{item.current}</td>
                                                        <td className="px-5 py-3 text-right font-black text-white border-b border-white/5 group-last:border-0">{item.new}</td>
                                                        <td className={`px-5 py-3 text-right font-black border-b border-white/5 group-last:border-0 ${item.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                    
                    <footer className="px-8 py-6 border-t border-white/5 flex justify-end items-center gap-4 bg-white/2">
                        <button
                            onClick={onClose}
                            className="h-12 px-8 rounded-2xl glass border border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                            {t('admin.common.cancel')}
                        </button>
                        <button
                            onClick={processCSV}
                            disabled={csvPreview.length === 0 || csvProcessing}
                            className={`h-12 px-10 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-xl disabled:opacity-30 ${dryRun ? 'bg-amber-400 text-surface-deep hover:bg-amber-300 shadow-amber-400/10' : 'bg-cyan-400 text-surface-deep hover:bg-cyan-300 shadow-cyan-400/10'}`}
                        >
                            {csvProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-surface-deep/20 border-t-surface-deep rounded-full animate-spin" />
                                    {t('admin.inventory.import.processing', { progress: Math.round(csvProgress * 100) })}
                                </div>
                            ) : (dryRun ? t('admin.inventory.import.testOnly') : t('admin.inventory.import.importData'))}
                        </button>
                    </footer>
                </div>
            </div>
        </>
    )
}
