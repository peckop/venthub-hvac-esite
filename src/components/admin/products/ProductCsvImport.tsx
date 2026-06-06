import React from 'react'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { adminButtonPrimaryClass, adminButtonSecondaryClass, adminCardClass } from '../../../utils/adminUi'
import { useI18n } from '../../../i18n/I18nProvider'
import type { Database } from '../../../types/database.types'


interface CategoryOpt {
    id: string
    name: string
}

interface ProductCsvImportProps {
    categories: CategoryOpt[]
    onSuccess: () => void
}

export default function ProductCsvImport({ categories, onSuccess }: ProductCsvImportProps) {
    const { t } = useI18n()
    const [importPreview, setImportPreview] = React.useState<{ header: string[]; rows: Record<string, string>[]; total: number } | null>(null)
    const [importRows, setImportRows] = React.useState<Record<string, string>[] | null>(null)
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        const text = await f.text()
        const lines = text.replace(/^\ufeff/, '').split(/\r?\n/).filter(l => l.trim().length > 0)
        const split = (s: string) => s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
        const header = split(lines[0]).map(h => h.trim().toLowerCase())
        const rows = lines.slice(1).map(l => {
            const cells = split(l)
            const obj: Record<string, string> = {}
            header.forEach((h, i) => obj[h] = cells[i] || '')
            return obj
        })
        setImportRows(rows)
        setImportPreview({ header, rows: rows.slice(0, 10), total: rows.length })
        // Reset file input so same file can be selected again if needed
        e.target.value = ''
    }

    const handleDryRun = () => {
        const h = (importPreview?.header || [])
        const required = ['name', 'sku']
        const hasRequired = required.every(k => h.includes(k))
        const okCount = (importPreview?.rows || []).filter(r => r['name'] && r['sku']).length
        alert(t('admin.products.import.dryRunResult', { status: t(`admin.products.import.${hasRequired ? 'statusComplete' : 'statusMissing'}`), ok: okCount, total: importPreview?.total || 0 }) || `Kuru Çalıştırma Sonucu:\nDurum: ${hasRequired ? 'Gerekli kolonlar var' : 'Gerekli kolonlar EKSİK'}\nGeçerli Satır: ${okCount}\nToplam Satır: ${importPreview?.total || 0}`)
    }

    const handleImport = async () => {
        if (!importRows || !importPreview) return alert(t('admin.products.import.needCsv') || 'Lütfen önce CSV dosyası seçin.')
        const h = importPreview.header
        if (!h.includes('sku') || !h.includes('name')) {
            alert(t('admin.products.import.minColumns') || 'CSV dosyasında en az "sku" ve "name" sütunları bulunmalıdır.')
            return
        }

        setIsProcessing(true)
        const mapCategorySlugToId = (slug: string) => {
            const s = (slug || '').toLowerCase().trim()
            const found = categories.find(c => c.name.toLowerCase() === s)
            return found?.id || null
        }

        const payloads: Database['public']['Tables']['products']['Insert'][] = []

        for (const r of importRows) {
            if (!r['sku'] || !r['name']) continue
            const p: Database['public']['Tables']['products']['Insert'] = {
                sku: r['sku'].trim(),
                name: r['name'].trim(),
                slug: r['name'].trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                brand: r['brand']?.trim() || 'Generic' 
            }
            if (r['model_code']) p.model_code = r['model_code'].trim()
            else if (r['model']) p.model_code = r['model'].trim()
            if (r['brand']) p.brand = r['brand'].trim()
            if (r['status']) p.status = (r['status'].trim() as Database['public']['Tables']['products']['Insert']['status'])
            if (r['price']) p.price = Number(r['price'])
            if (r['stock_qty']) p.stock_qty = Number(r['stock_qty'])
            if (r['low_stock_threshold']) p.low_stock_threshold = Number(r['low_stock_threshold'])
            if (r['category_id']) p.category_id = r['category_id'] || null
            else if (r['category_slug'] || r['category']) p.category_id = mapCategorySlugToId(r['category_slug'] || r['category'])
            payloads.push(p)
        }

        if (payloads.length === 0) {
            alert(t('admin.products.import.noneFound') || 'İçe aktarılacak geçerli ürün bulunamadı.')
            setIsProcessing(false)
            return
        }

        try {
            // chunked upsert by sku
            let ok = 0, fail = 0
            for (let i = 0; i < payloads.length; i += 100) {
                const chunk = payloads.slice(i, i + 100)
                const { error } = await (supabase.from('products')).upsert(chunk, { onConflict: 'sku' })
                if (error) {
                    console.warn('import upsert error', error)
                    fail += chunk.length
                } else {
                    ok += chunk.length
                }
            }
            alert(t('admin.products.import.done', { ok, fail }) || `İçe aktarma tamamlandı. Başarılı: ${ok}, Hatalı: ${fail}`)
            setImportPreview(null)
            setImportRows(null)
            onSuccess()
        } catch (e) {
            alert(t('admin.products.import.error', { msg: ((e as Error).message || String(e)) }) || `Hata oluştu: ${((e as Error).message || String(e))}`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <input id="prod-import-input" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            <button
                onClick={() => document.getElementById('prod-import-input')?.click()}
                className={`${adminButtonSecondaryClass}`}
            >
                {t('admin.products.import.button') || 'CSV İçe Aktar'}
            </button>

            {importPreview && (
                <div className="fixed inset-0 z-modal flex items-center justify-center bg-slate-900/50 p-4">
                    <div className={`${adminCardClass} w-full max-w-4xl max-h-90vh flex flex-col shadow-xl animate-in fade-in zoom-in duration-200`}>

                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">
                                {t('admin.products.import.previewTitle', { total: importPreview.total }) ?? `CSV Önizleme (ilk 10 satır) — Toplam: ${importPreview.total}`}
                            </h3>
                            <button
                                onClick={() => { setImportPreview(null); setImportRows(null) }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                disabled={isProcessing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-x-auto p-4 flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b border-gray-200 text-slate-500 uppercase">
                                    <tr>
                                        {importPreview.header.map(h => (<th key={h} className="p-2 text-left font-semibold">{h}</th>))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {importPreview.rows.map((r, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            {importPreview.header.map(h => (<td key={h} className="p-2 whitespace-nowrap">{r[h]}</td>))}
                                        </tr>
                                    ))}
                                    {importPreview.total > 10 && (
                                        <tr><td colSpan={importPreview.header.length} className="p-3 text-center text-slate-500 italic">... ve {importPreview.total - 10} satır daha.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3 justify-end rounded-b-2xl">
                            <button
                                className={`${adminButtonSecondaryClass} h-10`}
                                onClick={() => { setImportPreview(null); setImportRows(null); }}
                                disabled={isProcessing}
                            >
                                {t('admin.products.import.close') || 'İptal'}
                            </button>

                            <button
                                className={`${adminButtonSecondaryClass} h-10`}
                                onClick={handleDryRun}
                                disabled={isProcessing}
                            >
                                {t('admin.products.import.dryRun') || 'Hata Kontrolü'}
                            </button>

                            <button
                                className={`${adminButtonPrimaryClass} h-10`}
                                onClick={handleImport}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'İşleniyor...' : (t('admin.products.import.writeButton') || 'İçe Aktar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
