 
import React, { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useI18n } from '../../i18n/I18nProvider'
import { 
    adminSectionTitleClass, 
    adminSubtitleClass,
    adminButtonPrimaryClass, 
    adminButtonSecondaryClass, 
    adminTableHeadCellClass, 
    adminTableCellClass,
    adminCardClass,
    adminInputClass,
    adminSelectClass,
    adminSelectStyle
} from '../../utils/adminUi'
import { toast } from 'sonner'
import { Truck, CheckCircle2, RefreshCw } from 'lucide-react'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { useRole } from '../../hooks/useRole'
import { useDragScroll } from '../../hooks/useDragScroll'

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
    const { t } = useI18n()
    const { canWrite } = useRole()
    const hasWriteAccess = canWrite('logistics')
    const dragScrollRef = useDragScroll<HTMLDivElement>()

    const [rows, setRows] = useState<LogisticsRow[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [globalCarrier, setGlobalCarrier] = useState('Yurtiçi')

    const fetchPendingOrders = useCallback(async () => {
        setLoading(true)
        try {
            await ensureSessionFresh()

            const { data, error } = await supabase
                .from('view_admin_orders')
                .select('id, order_number, customer_name, created_at, carrier, tracking_number')
                .in('status', ['confirmed', 'processing'])
                .is('shipped_at', null)
                .order('created_at', { ascending: true })

            if (error) throw error

            setRows((data || []).map(r => ({
                id: String(r.id),
                order_number: String(r.order_number || (r.id as string).substring(0, 8)),
                customer_name: String(r.customer_name || t('common.none')),
                created_at: String(r.created_at),
                carrier: String(r.carrier || 'Yurtiçi'),
                tracking_number: String(r.tracking_number || ''),
                saved: false
            })))
        } catch (err: unknown) {
            toast.error(t('admin.logistics.toasts.loadFailed') + ': ' + (err instanceof Error ? err.message : t('admin.common.error')))
        } finally {
            setLoading(false)
        }
    }, [t])

    const pathname = usePathname()
    useEffect(() => {
        fetchPendingOrders()
    }, [fetchPendingOrders, pathname])

    const updateRow = (id: string, field: 'carrier' | 'tracking_number', val: string) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val, saved: false } : r))
    }

    const applyGlobalCarrier = () => {
        setRows(prev => prev.map(r => r.saved ? r : { ...r, carrier: globalCarrier }))
        toast.success(t('admin.logistics.toasts.appliedToAll'))
    }

    const generateTrackingUrl = (carrier: string, tracking: string) => {
        const c = (carrier || '').toLowerCase()
        if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
        if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo-takip?KargoTakipNo=${tracking}`
        if (c.includes('mng')) return `https://www.mngkargo.com.tr/gonderitakip?takipNo=${tracking}`
        if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${tracking}`
        return null
    }

    const handleBulkSubmit = async () => {
        const targets = rows.filter(r => r.tracking_number.trim() !== '' && !r.saved)
        if (targets.length === 0) {
            toast.error(t('admin.logistics.toasts.noNewTracking'))
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

            setRows(prev => prev.map(r => {
                const res = results.find(x => x.id === r.id)
                if (res) {
                    if (res.ok) return { ...r, saved: true }
                    errCount++
                }
                return r
            }))

            if (errCount > 0) {
                toast.error(t('admin.logistics.toasts.bulkUpdateFailed', { count: errCount }))
            } else {
                toast.success(t('admin.logistics.toasts.bulkUpdateSuccess', { count: targets.length }))
            }
        } catch {
            toast.error(t('admin.logistics.toasts.criticalError'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 max-w-page animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className={adminSectionTitleClass}>{t('admin.logistics.title')}</h1>
                    <p className={adminSubtitleClass}>{t('admin.logistics.subtitle')}</p>
                </div>
                <button 
                    onClick={fetchPendingOrders} 
                    disabled={loading}
                    className={adminButtonSecondaryClass}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? t('admin.logistics.updating') : t('admin.ui.refresh')}
                </button>
            </header>

            <div className={`${adminCardClass} p-8 flex flex-col md:flex-row md:items-end gap-6 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />
                
                <div className="flex-1 space-y-3 relative z-10">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1">{t('admin.orders.modals.shipping.carrierLabel')}</label>
                    <div className="relative max-w-xs">
                        <select
                            value={globalCarrier}
                            onChange={e => setGlobalCarrier(e.target.value)}
                            className={adminSelectClass}
                            style={adminSelectStyle}
                        >
                            <option value="Yurtiçi">{t('admin.orders.modals.shipping.carriers.yurtici')}</option>
                            <option value="Aras">{t('admin.orders.modals.shipping.carriers.aras')}</option>
                            <option value="MNG">{t('admin.orders.modals.shipping.carriers.mng')}</option>
                            <option value="PTT">{t('admin.orders.modals.shipping.carriers.ptt')}</option>
                            <option value="UPS">{t('admin.orders.modals.shipping.carriers.ups')}</option>
                        </select>
                    </div>
                </div>
                {hasWriteAccess && (
                    <button 
                        onClick={applyGlobalCarrier} 
                        className="h-12 px-8 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-transform active:scale-95 relative z-10"
                    >
                        {t('admin.logistics.applyToAll')}
                    </button>
                )}
            </div>

            <div className={`${adminCardClass} overflow-hidden`}>
                {loading && rows.length === 0 ? (
                    <div className="p-0">
                        <AdminSkeleton variant="table" count={7} rows={5} />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-20 bg-surface-deep/20">
                        <AdminEmptyState
                            icon={CheckCircle2}
                            title={t('admin.orders.states.noRecords')}
                            description={t('admin.common.noResults')}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full custom-scrollbar" ref={dragScrollRef}>
                        <table className="w-full text-sm border-collapse">
                            <thead className="glass-strong">
                                <tr>
                                    <th className={adminTableHeadCellClass}>{t('admin.logistics.table.order')}</th>
                                    <th className={adminTableHeadCellClass}>{t('admin.logistics.table.customer')}</th>
                                    <th className={adminTableHeadCellClass}>{t('admin.logistics.table.carrier')}</th>
                                    <th className={adminTableHeadCellClass}>{t('admin.logistics.table.tracking')}</th>
                                    <th className={`${adminTableHeadCellClass} text-center`}>{t('admin.logistics.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rows.map((row, idx) => (
                                    <tr 
                                        key={row.id} 
                                        className={`group border-b border-white/5 transition-colors duration-300 ${
                                            row.saved 
                                                ? 'bg-emerald-500/3 hover:bg-emerald-500/6' 
                                                : 'hover:bg-white/2'
                                        }`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <td className={`${adminTableCellClass} font-mono text-xs font-black text-cyan-400`}>
                                            <span className="bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                                                #{row.order_number}
                                            </span>
                                        </td>
                                        <td className={`${adminTableCellClass} font-black text-white uppercase tracking-tight`}>{row.customer_name}</td>
                                        <td className={adminTableCellClass}>
                                            <div className="relative min-w-140px">
                                                <select
                                                    disabled={!hasWriteAccess || row.saved || saving}
                                                    value={row.carrier}
                                                    onChange={e => updateRow(row.id, 'carrier', e.target.value)}
                                                    className={`${adminSelectClass} !py-2 !text-xs !rounded-xl !bg-surface-deep/60 disabled:opacity-40`}
                                                    style={adminSelectStyle}
                                                >
                                                    <option value="Yurtiçi">{t('admin.orders.modals.shipping.carriers.yurtici')}</option>
                                                    <option value="Aras">{t('admin.orders.modals.shipping.carriers.aras')}</option>
                                                    <option value="MNG">{t('admin.orders.modals.shipping.carriers.mng')}</option>
                                                    <option value="PTT">{t('admin.orders.modals.shipping.carriers.ptt')}</option>
                                                    <option value="UPS">{t('admin.orders.modals.shipping.carriers.ups')}</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className={adminTableCellClass}>
                                            <input
                                                type="text"
                                                disabled={!hasWriteAccess || row.saved || saving}
                                                value={row.tracking_number}
                                                onChange={e => updateRow(row.id, 'tracking_number', e.target.value)}
                                                placeholder={t('admin.orders.modals.shipping.trackingPlaceholder')}
                                                className={`${adminInputClass} !py-2 !text-xs !rounded-xl !bg-surface-deep/60 !font-mono focus:!bg-white/3 disabled:opacity-40`}
                                            />
                                        </td>
                                        <td className={`${adminTableCellClass} text-center`}>
                                            {row.saved ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full uppercase tracking-widest animate-in zoom-in duration-300">
                                                    <CheckCircle2 size={10} /> {t('admin.common.success')}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-40">Ready</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {rows.length > 0 && (
                    <div className="p-6 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10 backdrop-blur-xl">
                        <div className="text-sm font-bold text-slate-400">
                            <span className="text-cyan-400 font-black text-base">{rows.filter(r => r.tracking_number).length}</span> / {rows.length} {t('admin.titles.orders')} {t('admin.ui.ready') || 'Ready'}
                        </div>
                        {hasWriteAccess && (
                            <button
                                disabled={saving || rows.filter(r => r.tracking_number && !r.saved).length === 0}
                                onClick={handleBulkSubmit}
                                className={`${adminButtonPrimaryClass} w-full sm:w-auto px-10 relative overflow-hidden group/submit active:scale-98`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/submit:translate-y-0 transition-transform duration-300" />
                                <Truck size={18} className="relative z-10 group-hover/submit:animate-bounce" />
                                <span className="relative z-10">{saving ? t('admin.common.loading') : t('admin.logistics.shipOrders')}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
