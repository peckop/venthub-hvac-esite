import React, { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { adminButtonPrimaryClass, adminButtonSecondaryClass } from '../../utils/adminUi'

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
    effectiveThreshold: (productId: string) => number | null
}

export default function InventoryCsvImport({ isOpen, onClose, onSuccess, effectiveThreshold }: InventoryCsvImportProps) {
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
            // Desteklenen başlıklar
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

            // SKU -> product_id eşlemesi
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
                    current: product.stock,
                    new: row.newQty,
                    delta: row.newQty - product.stock,
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
            const genBatchId = (): string => crypto.randomUUID()
            const batchId = genBatchId()

            const BATCH_SIZE = 20
            for (let i = 0; i < csvPreview.length; i += BATCH_SIZE) {
                const chunk = csvPreview.slice(i, i + BATCH_SIZE)
                await Promise.all(chunk.map(async (item) => {
                    const productId = skuToId.get(item.sku)
                    if (!productId || item.delta === 0) return
                    try {
                        const reason = `CSV import: ${item.delta > 0 ? 'add' : 'remove'} ${Math.abs(item.delta)}`
                        const { error } = await supabase.rpc('adjust_stock', {
                            p_product_id: productId,
                            p_delta: item.delta,
                            p_reason: reason,
                            p_batch_id: batchId
                        })
                        if (error) throw error
                        const { logAdminAction } = await import('../../lib/audit')
                        await logAdminAction(supabase, {
                            table_name: 'inventory_movements',
                            row_pk: productId,
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

            toast.custom((t) => (
                <div className="rounded-lg border border-slate-200 bg-white shadow px-3 py-2 text-sm flex items-center gap-3">
                    <span>{successCount} ürün güncellendi.</span>
                    <a
                        href={`/admin/movements?batch=${batchId}`}
                        className="px-2 py-1 text-xs rounded border border-slate-200 hover:border-primary-navy text-primary-navy"
                    >Hareketleri Gör</a>
                    {errors.length > 0 && (
                        <button
                            className="px-2 py-1 text-xs rounded border border-slate-200 hover:border-primary-navy"
                            onClick={() => { downloadErrors(); toast.dismiss(t.id) }}
                        >Hataları İndir</button>
                    )}
                    <button
                        className="px-2 py-1 text-xs rounded bg-warning-orange/10 text-warning-orange hover:bg-warning-orange hover:text-white"
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
                                toast.dismiss(t.id)
                            }
                        }}
                    >Geri Al</button>
                </div>
            ), { duration: 10000 })

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
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200">
                    <header className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">CSV Stok İçe Aktarma</h2>
                        <button className={adminButtonSecondaryClass + " w-10 h-10 !p-0 flex items-center justify-center rounded-full"} onClick={onClose}>×</button>
                    </header>
                    <div className="p-6 space-y-6 overflow-auto">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-600 uppercase tracking-tight">CSV Dosyası Seç</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary-navy/40 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleCsvImport(file)
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="text-slate-400 group-hover:text-primary-navy transition-colors">
                                    <p className="text-sm font-medium">Dosyayı buraya sürükleyin veya <span className="text-primary-navy underline">seçin</span></p>
                                    <p className="text-xs mt-1">Format: SKU, Miktar (örn: PRD001, 25)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <input
                                type="checkbox"
                                id="dryRun"
                                checked={dryRun}
                                onChange={(e) => setDryRun(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-primary-navy focus:ring-primary-navy"
                            />
                            <label htmlFor="dryRun" className="text-sm font-medium text-slate-700 select-none">
                                Kuru Çalıştırma (Veritabanını güncelleme, sadece önizle)
                            </label>
                        </div>

                        {csvPreview.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Önizleme ({csvPreview.length} Ürün)</h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold text-slate-500">Ürün</th>
                                                <th className="px-3 py-2 text-right font-bold text-slate-500">Mevcut</th>
                                                <th className="px-3 py-2 text-right font-bold text-slate-500">Yeni</th>
                                                <th className="px-3 py-2 text-right font-bold text-slate-500">Delta</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {csvPreview.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-slate-800">{item.name || item.sku}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.sku}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-slate-500">{item.current}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-slate-900">{item.new}</td>
                                                    <td className={`px-3 py-2 text-right font-bold ${item.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {item.delta > 0 ? '+' : ''}{item.delta}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                    <footer className="p-6 border-t border-slate-100 flex justify-end items-center gap-3 bg-slate-50/50">
                        <button
                            onClick={onClose}
                            className={adminButtonSecondaryClass + " px-6"}
                        >
                            İptal
                        </button>
                        <button
                            onClick={processCSV}
                            disabled={csvPreview.length === 0 || csvProcessing}
                            className={adminButtonPrimaryClass + " px-8 shadow-lg shadow-primary-navy/20"}
                        >
                            {csvProcessing ? `İşleniyor... %${Math.round(csvProgress * 100)}` : (dryRun ? 'Kuru Çalıştır' : 'İçe Aktar')}
                        </button>
                    </footer>
                </div>
            </div>
        </>
    )
}
