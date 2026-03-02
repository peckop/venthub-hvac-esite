import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminButtonPrimaryClass, adminButtonSecondaryClass, adminTableHeadCellClass } from '../../utils/adminUi'
import toast from 'react-hot-toast'
import { Truck, Search, CheckCircle2, RotateCcw } from 'lucide-react'

// Sadece kargo ataması bekleyen siparişler (confirmed)
interface LogisticsRow {
    id: string
    order_number: string
    customer_name: string
    created_at: string
    carrier: string
    tracking_number: string
    saved: boolean
}

export default function AdminLogisticsPage() {
    const { t, lang } = useI18n()
    const [rows, setRows] = useState<LogisticsRow[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [globalCarrier, setGlobalCarrier] = useState('Yurtiçi')

    const fetchPendingOrders = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('view_admin_orders')
                .select('id, order_number, customer_name, created_at, carrier, tracking_number')
                .in('status', ['confirmed', 'processing'])
                .is('shipped_at', null)
                .order('created_at', { ascending: true })

            if (error) throw error

            setRows((data as any[]).map(r => ({
                id: r.id,
                order_number: r.order_number || r.id.substring(0, 8),
                customer_name: r.customer_name || 'İsimsiz',
                created_at: r.created_at,
                carrier: r.carrier || 'Yurtiçi',
                tracking_number: r.tracking_number || '',
                saved: false
            })))
        } catch (err: any) {
            toast.error('Bekleyen siparişler yüklenemedi: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPendingOrders()
    }, [fetchPendingOrders])

    const updateRow = (id: string, field: 'carrier' | 'tracking_number', val: string) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val, saved: false } : r))
    }

    const applyGlobalCarrier = () => {
        setRows(prev => prev.map(r => r.saved ? r : { ...r, carrier: globalCarrier }))
        toast.success('Seçili kargo firması tüm satırlara uygulandı.')
    }

    const generateTrackingUrl = (carrier: string, tracking: string) => {
        const c = (carrier || '').toLowerCase()
        if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
        return null
    }

    const handleBulkSubmit = async () => {
        // Sadece takip numarası girilmiş ve henüz kaydedilmemiş olanları seç
        const targets = rows.filter(r => r.tracking_number.trim() !== '' && !r.saved)
        if (targets.length === 0) {
            toast.error('Kaydedilecek yeni kargo bilgisi bulunamadı.')
            return
        }

        setSaving(true)
        let errCount = 0
        try {
            const results = await Promise.all(targets.map(async (row) => {
                const turl = generateTrackingUrl(row.carrier, row.tracking_number)
                const { error: fnErr } = await supabase.functions.invoke('admin-update-shipping', {
                    body: {
                        order_id: row.id,
                        carrier: row.carrier.trim(),
                        tracking_number: row.tracking_number.trim(),
                        tracking_url: turl,
                        send_email: true
                    }
                })
                return { id: row.id, ok: !fnErr }
            }))

            // Hata olanları say, başarılı olanların `saved` statüsünü true yap
            setRows(prev => prev.map(r => {
                const res = results.find(x => x.id === r.id)
                if (res) {
                    if (res.ok) return { ...r, saved: true }
                    errCount++
                }
                return r
            }))

            if (errCount > 0) {
                toast.error(`${errCount} siparişte kargo güncellemesi başarısız oldu.`)
            } else {
                toast.success(`${targets.length} sipariş başarıyla Kargoda durumuna alındı!`)
            }
        } catch (err: any) {
            toast.error('Toplu güncelleme sırasında kritik bir hata oluştu.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-[1400px]">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className={adminSectionTitleClass}>Toplu Kargo Panosu</h1>
                    <p className="text-sm text-slate-500 mt-1">Hazırlanıyor durumundaki siparişlere hızlıca kargo takip no girin.</p>
                </div>
                <button onClick={fetchPendingOrders} className={adminButtonSecondaryClass}>
                    {loading ? 'Yükleniyor...' : 'Yenile'}
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex items-end gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">Varsayılan Kargo Firması</label>
                    <select
                        value={globalCarrier}
                        onChange={e => setGlobalCarrier(e.target.value)}
                        className="w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-navy"
                    >
                        <option value="Yurtiçi">Yurtiçi Kargo</option>
                        <option value="Aras">Aras Kargo</option>
                        <option value="MNG">MNG Kargo</option>
                        <option value="PTT">PTT Kargo</option>
                    </select>
                </div>
                <button onClick={applyGlobalCarrier} className="px-4 py-2 text-sm font-bold text-primary-navy bg-primary-navy/5 hover:bg-primary-navy/10 rounded-lg transition-colors">
                    Tümüne Uygula
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {loading && rows.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 animate-pulse">Siparişler taranıyor...</div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-bold text-slate-700">Bekleyen Kargo Yok</h3>
                        <p className="text-sm text-slate-500 mt-1">Tüm siparişlerin kargo işlemi tamamlanmış görünüyor.</p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className={adminTableHeadCellClass}>Sipariş No</th>
                                <th className={adminTableHeadCellClass}>Müşteri</th>
                                <th className={adminTableHeadCellClass}>Kargo Firması</th>
                                <th className={adminTableHeadCellClass}>Takip Numarası</th>
                                <th className={adminTableHeadCellClass + " text-center"}>Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, i) => (
                                <tr key={row.id} className={row.saved ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">#{row.order_number}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{row.customer_name}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            disabled={row.saved || saving}
                                            value={row.carrier}
                                            onChange={e => updateRow(row.id, 'carrier', e.target.value)}
                                            className="w-32 bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-primary-navy disabled:opacity-60"
                                        >
                                            <option value="Yurtiçi">Yurtiçi</option>
                                            <option value="Aras">Aras</option>
                                            <option value="MNG">MNG</option>
                                            <option value="PTT">PTT</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            disabled={row.saved || saving}
                                            value={row.tracking_number}
                                            onChange={e => updateRow(row.id, 'tracking_number', e.target.value)}
                                            placeholder="Barkod okutun veya girin..."
                                            className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary-navy focus:ring-1 focus:ring-primary-navy/20 disabled:opacity-60"
                                            autoFocus={i === 0}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {row.saved ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                                                <CheckCircle2 size={12} /> EKLENDİ
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-slate-400">Bekliyor</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {rows.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200/60 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-sm bg-slate-50/90">
                        <div className="text-sm font-medium text-slate-500">
                            <span className="text-primary-navy font-bold">{rows.filter(r => r.tracking_number).length}</span> satır hazır.
                        </div>
                        <button
                            disabled={saving || rows.filter(r => r.tracking_number && !r.saved).length === 0}
                            onClick={handleBulkSubmit}
                            className={`${adminButtonPrimaryClass} px-8 py-2.5 shadow-lg flex items-center gap-2`}
                        >
                            <Truck size={18} />
                            {saving ? 'Gönderiliyor...' : 'Tüm Hazır Kargo Bilgilerini Kaydet'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
