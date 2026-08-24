import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'
import { hazirlaUrunSatirlari, type KategoriSecenegi } from '@/lib/admin/csvProductMapping'
import { splitByExistingSku } from '@/lib/data/csvImportGuard'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import type { Database } from '../../../types/database.types'
import { adminButtonPrimaryClass, adminButtonSecondaryClass, adminCardClass } from '../../../utils/adminUi'


interface ProductCsvImportProps {
    categories: KategoriSecenegi[]
    onSuccess: () => void
}

export default function ProductCsvImport({ categories, onSuccess }: ProductCsvImportProps) {
    const { t } = useI18n()
    const [importPreview, setImportPreview] = React.useState<{ header: string[]; rows: Record<string, string>[]; total: number } | null>(null)
    const [importRows, setImportRows] = React.useState<Record<string, string>[] | null>(null)
    const [isProcessing, setIsProcessing] = React.useState(false)
    /**
     * Hata ve sonuç bildirimi INLINE — `alert()` yerine.
     * Cetvel §4.6: hata / kritik / eylem gerektiren mesaj toast'a KONMAZ (beş tasarım
     * sistemi + WAI-ARIA APG hemfikir); inline mesaj veya banner kullanılır. `alert()`
     * ayrıca stilsizdir, ana iş parçacığını bloklar ve e2e'de dialog yakalama gerektirir.
     * `role="status"`/`aria-live` ile ekran okuyucuya da duyurulur.
     */
    const [notice, setNotice] = React.useState<{ tone: 'error' | 'info'; text: string } | null>(null)
    /**
     * BİLİNMEYEN SKU KORUMASI (T148-VH çürütme turunda bulundu).
     * `upsert(..., { onConflict: 'sku' })` eşleşme bulamazsa satırı SESSİZCE **INSERT** eder.
     * Yani düzeltmeden önce alınmış bir dışa aktarım dosyası yeniden yüklenirse, eski SKU'lar
     * artık bulunamayacağı için kopya ürünler doğar — ve ekranda "başarılı içe aktarım"
     * yazar. Kusur bozuk görünmez; tam da bu yüzden hiçbir kapı görmüyordu.
     * Burada yazımdan ÖNCE ölçüyoruz ve kararı kullanıcıya bırakıyoruz.
     */
    const [pendingWrite, setPendingWrite] = React.useState<
        {
            payloads: Database['public']['Tables']['products']['Insert'][]
            unknownSkus: string[]
            /** Ayrim ON OLCUMDE bir kez yapilir; buton onu YENIDEN hesaplamaz. */
            known: Database['public']['Tables']['products']['Insert'][]
        } | null
    >(null)

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
        const statusKey = hasRequired ? 'admin.products.import.statusComplete' : 'admin.products.import.statusMissing'
        setNotice({
            tone: 'info',
            text: t('admin.products.import.dryRunResult', {
                status: t(statusKey),
                ok: okCount,
                total: importPreview?.total || 0
            })
        })
    }

    const handleImport = async () => {
        if (!importRows || !importPreview) { setNotice({ tone: 'error', text: t('admin.products.import.needCsv') }); return }
        const h = importPreview.header
        if (!h.includes('sku') || !h.includes('name')) {
            setNotice({ tone: 'error', text: t('admin.products.import.minColumns') })
            return
        }

        setIsProcessing(true)
        /**
         * Eşleme ve satır hazırlama SAF modülde (src/lib/admin/csvProductMapping.ts).
         *
         * NİÇİN TAŞINDI: burada, bir tıklama işleyicisinin gövdesinde yaşarken davranışı
         * hiçbir kapı ölçemiyordu — kapı ancak dosyada geçen kelimelere bakabiliyordu.
         * Nitekim ilk yazdığım kapı tam bu yüzden kör kaldı: reddetme dalını silen sabotaj
         * kelimeler yerinde durduğu için YEŞİL geçti. Saf hâlde sabotaj davranışı bozar.
         *
         * SÖZLEŞME: kategori değeri var ama canlı DB'de karşılığı yoksa satır payloads'a
         * GİRMEZ, reddedilen'e düşer (ERR_SLUG_NOT_IN_DB — sessiz null YOK).
         */
        const { payloads, reddedilen } = hazirlaUrunSatirlari(importRows, categories)

        /* Kategorisi çözülemeyen satır varsa YAZIM YAPILMAZ. Kısmi yazım burada en kötü
         * seçenek olurdu: dosyanın bir kısmı içeri girer, geri kalanı girmez ve kullanıcı
         * hangi hâlde olduğunu bilemez. Karar kullanıcıya gider — CSV düzeltilip yeniden
         * yüklenir (bilinmeyen SKU korumasının kalıbıyla aynı). */
        if (reddedilen.length > 0) {
            const ornekler = [...new Set(reddedilen.map(x => x.deger))].slice(0, 5).join(', ')
            setNotice({
                tone: 'error',
                text: [
                    t('admin.products.import.unknownCategoryTitle', { count: reddedilen.length }),
                    t('admin.products.import.unknownCategoryHelp'),
                    t('admin.products.import.unknownCategoryExamples', { skus: ornekler }),
                ].join(' ')
            })
            setIsProcessing(false)
            return
        }

        if (payloads.length === 0) {
            setNotice({ tone: 'error', text: t('admin.products.import.noneFound') })
            setIsProcessing(false)
            return
        }

        /* ── ÖN ÖLÇÜM: hangi SKU'lar DB'de YOK ────────────────────────────────
         * Yazımdan önce ölçülür. Bilinmeyen varsa yazım YAPILMAZ; karar kullanıcıya
         * gider. "Sessizce doğru olanı yapmak" burada mümkün değil, çünkü iki meşru
         * niyet var: yeni ürün eklemek ve mevcutları güncellemek. Hangisi olduğunu
         * yalnız kullanıcı bilir; tahmin etmek kopya ürün üretme riskini geri getirir.
         * ──────────────────────────────────────────────────────────────────── */
        try {
            const skus = payloads.map((p) => String(p.sku)).filter(Boolean)
            const existing = new Set<string>()
            for (let i = 0; i < skus.length; i += 200) {
                const { data, error } = await supabase
                    .from('products')
                    .select('sku')
                    .in('sku', skus.slice(i, i + 200))
                if (error) throw error
                for (const r of data ?? []) if (r.sku) existing.add(r.sku)
            }
            const split = splitByExistingSku(payloads, existing)
            if (split.unknown.length > 0) {
                setPendingWrite({ payloads, unknownSkus: split.unknownSkus, known: split.known })
                setIsProcessing(false)
                return
            }
            await writePayloads(payloads, 0)
        } catch (e) {
            setNotice({ tone: 'error', text: t('admin.products.import.error', { msg: ((e as Error).message || String(e)) }) })
            setIsProcessing(false)
        }
    }

    /** Asıl yazım. `skipped` yalnız raporlama içindir — kullanıcı neyin atlandığını görsün. */
    const writePayloads = async (payloads: Database['public']['Tables']['products']['Insert'][], skipped: number) => {
        setIsProcessing(true)
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
            setNotice({
                tone: 'info',
                text: skipped > 0
                    ? t('admin.products.import.updateExistingDone', { ok, skipped })
                    : t('admin.products.import.done', { ok, fail }),
            })
            setPendingWrite(null)
            setImportPreview(null)
            setImportRows(null)
            onSuccess()
        } catch (e) {
            setNotice({ tone: 'error', text: t('admin.products.import.error', { msg: ((e as Error).message || String(e)) }) })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <input id="prod-import-input" type="file" accept=".csv,text/csv" aria-label={t('admin.products.import.button')} className="hidden" onChange={handleFileChange} />
            <button
                onClick={() => document.getElementById('prod-import-input')?.click()}
                className={`${adminButtonSecondaryClass}`}
            >
                {t('admin.products.import.button')}
            </button>

            {/*
              BİLİNMEYEN SKU ONAYI — yazımdan önce, geri alınamaz karar kullanıcıda.
              İki eylem de ADIYLA yazılıdır ("Evet/Hayır" değil): geri alınamaz bir yazımda
              kullanıcının ne onayladığı butonun üzerinde okunabilir olmalı.
            */}
            {pendingWrite && (
                <div
                    role="alertdialog"
                    aria-labelledby="csv-unknown-sku-title"
                    className="mt-3 rounded-2xl border border-admin-border bg-admin-surface-2 p-4"
                >
                    <p id="csv-unknown-sku-title" className="font-bold text-admin-fg">
                        {t('admin.products.import.unknownSkuTitle', { count: pendingWrite.unknownSkus.length })}
                    </p>
                    <p className="mt-2 text-sm text-admin-fg-muted">
                        {t('admin.products.import.unknownSkuHelp')}
                    </p>
                    <p className="mt-2 text-xs text-admin-fg-muted">
                        {t('admin.products.import.unknownSkuExamples', { skus: pendingWrite.unknownSkus.slice(0, 5).join(', ') })}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 justify-end">
                        <button
                            className={`${adminButtonSecondaryClass} h-10`}
                            onClick={() => { setPendingWrite(null) }}
                            disabled={isProcessing}
                        >
                            {t('admin.products.import.close')}
                        </button>
                        <button
                            className={`${adminButtonSecondaryClass} h-10`}
                            onClick={() => {
                                void writePayloads(
                                    pendingWrite.known,
                                    pendingWrite.payloads.length - pendingWrite.known.length,
                                )
                            }}
                            disabled={isProcessing}
                        >
                            {t('admin.products.import.updateExistingOnly', { count: pendingWrite.known.length })}
                        </button>
                        <button
                            className={`${adminButtonPrimaryClass} h-10`}
                            onClick={() => { void writePayloads(pendingWrite.payloads, 0) }}
                            disabled={isProcessing}
                        >
                            {t('admin.products.import.createNewAction', { count: pendingWrite.unknownSkus.length })}
                        </button>
                    </div>
                </div>
            )}

            {/*
              Inline bildirim — `alert()`'in yerini alır. `role="status"` + `aria-live`
              ile ekran okuyucuya duyurulur; hata tonu KALICIDIR (kullanıcı kapatana
              kadar durur), çünkü cetvel §4.6 hata mesajının kendiliğinden kaybolmasını
              yasaklıyor (WCAG 2.2.3 atfıyla APG de aynısını söylüyor).
            */}
            {notice && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`mt-3 flex items-start justify-between gap-3 rounded-admin-sm border px-3 py-2 text-sm ${
                        notice.tone === 'error'
                            ? 'border-admin-danger/30 bg-admin-danger-weak text-admin-danger'
                            : 'border-admin-accent/30 bg-admin-accent-weak text-admin-accent'
                    }`}
                >
                    <span>{notice.text}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label={t('admin.a11y.close')}
                        className="shrink-0 rounded-admin-sm px-1 text-current/70 hover:text-current
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30"
                    >
                        {t('admin.products.import.closeSymbol')}
                    </button>
                </div>
            )}

            {importPreview && (
                <div className="fixed inset-0 z-modal flex items-center justify-center bg-admin-surface-2 p-4">
                    <div className={`${adminCardClass} w-full max-w-4xl max-h-90vh flex flex-col shadow-admin-lg animate-in fade-in zoom-in duration-200`}>

                        <div className="p-4 border-b border-admin-border flex items-center justify-between">
                            <h3 className="font-semibold text-admin-fg-subtle">
                                {t('admin.products.import.previewTitle', { total: importPreview.total })}
                            </h3>
                            <button
                                onClick={() => { setImportPreview(null); setImportRows(null) }}
                                className="text-admin-fg-muted hover:text-admin-fg-subtle transition-colors"
                                disabled={isProcessing}
                            >
                                {t('admin.products.import.closeSymbol')}
                            </button>
                        </div>

                        <div className="overflow-x-auto p-4 flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-admin-surface-2 border-b border-admin-border text-admin-fg-muted">
                                    <tr>
                                        {importPreview.header.map(h => (<th key={h} className="p-2 text-left font-semibold">{h}</th>))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {importPreview.rows.map((r, idx) => (
                                        <tr key={idx} className="hover:bg-admin-surface-2">
                                            {importPreview.header.map(h => (<td key={h} className="p-2 whitespace-nowrap">{r[h]}</td>))}
                                        </tr>
                                    ))}
                                    {importPreview.total > 10 && (
                                        <tr>
                                            <td colSpan={importPreview.header.length} className="p-3 text-center text-admin-fg-muted italic">
                                                {t('admin.products.import.moreRows', { count: importPreview.total - 10 })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-admin-border bg-admin-surface-2 flex items-center gap-3 justify-end rounded-b-2xl">
                            <button
                                className={`${adminButtonSecondaryClass} h-10`}
                                onClick={() => { setImportPreview(null); setImportRows(null); }}
                                disabled={isProcessing}
                            >
                                {t('admin.products.import.close')}
                            </button>

                            <button
                                className={`${adminButtonSecondaryClass} h-10`}
                                onClick={handleDryRun}
                                disabled={isProcessing}
                            >
                                {t('admin.products.import.dryRun')}
                            </button>

                            <button
                                className={`${adminButtonPrimaryClass} h-10`}
                                onClick={handleImport}
                                disabled={isProcessing}
                            >
                                {isProcessing ? t('admin.products.import.processing') : t('admin.products.import.writeButton')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
