'use client'

import { ChevronRight, ExternalLink, PackageSearch } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useDragScroll } from '../../../hooks/useDragScroll'
import { formatDateTime } from '../../../i18n/datetime'
import { formatCurrency } from '../../../i18n/format'
import { useI18n } from '../../../i18n/I18nProvider'
import { adminTableCellClass, adminTableContainerClass,adminTableHeadCellClass } from '../../../utils/adminUi'
import { Routes } from '../../../utils/routes';
import AdminEmptyState from '../AdminEmptyState'


interface OrderData {
    id: string
    created_at: string
    total_amount: number
    status: string
    order_number?: string | null
}

interface RecentOrdersTableProps {
    orders: OrderData[]
    title: string
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders, title }) => {
    const { lang, t } = useI18n()
    const dragScrollRef = useDragScroll<HTMLDivElement>()

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30'
            case 'pending': return 'bg-amber-500/10 text-amber-400 ring-amber-500/30'
            case 'processing': return 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/30'
            case 'cancelled': return 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
            default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30'
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'completed': return t('admin.dashboard.statusLabels.completed')
            case 'pending': return t('admin.dashboard.statusLabels.pending')
            case 'processing': return t('admin.dashboard.statusLabels.processing')
            case 'cancelled': return t('admin.dashboard.statusLabels.cancelled')
            default: return s
        }
    }

    return (
        <div className="flex flex-col h-full group/table">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none group-hover/table:text-cyan-400 transition-colors uppercase">{title}</h3>
                    <div className="flex items-center gap-2 mt-3 italic opacity-60">
                        <div className="h-0.5 w-8 bg-cyan-500 rounded-full" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-hvac-relaxed italic opacity-80">{t('admin.dashboard.recent.transactions')}</p>
                    </div>
                </div>
                <Link href={Routes.admin.orders()} className="text-xs font-black text-white uppercase tracking-widest px-8 py-3 rounded-2xl glass-strong hover:bg-cyan-500 hover:text-surface-deep hover:scale-105 active:scale-95 border border-white/5 transition-transform duration-300 flex items-center gap-3 group/btn shadow-2xl">
                    {t('admin.dashboard.recent.viewAll')} <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
            
            <div className={`${adminTableContainerClass} glass-strong border border-white/5 rounded-hvac-2xl overflow-hidden shadow-2xl`}>
                <div ref={dragScrollRef} className="overflow-x-auto custom-scrollbar relative">
                    {/* Decorative glow inside table */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 blur-100 pointer-events-none" />
                    
                    <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                <th className={`${adminTableHeadCellClass} py-6 first:pl-8`}>{t('admin.dashboard.table.orderOrQuoteNo')}</th>
                                <th className={adminTableHeadCellClass}>{t('admin.dashboard.table.date')}</th>
                                <th className={`${adminTableHeadCellClass} text-right`}>{t('admin.dashboard.table.amount')}</th>
                                <th className={adminTableHeadCellClass}>{t('admin.dashboard.table.status')}</th>
                                <th className={`${adminTableHeadCellClass} last:pr-8`}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-24 text-center" colSpan={5}>
                                        <AdminEmptyState 
                                            icon={PackageSearch} 
                                            title={t('admin.dashboard.recent.emptyTitle')} 
                                            description={t('admin.dashboard.recent.emptyDesc')} 
                                            compact 
                                        />
                                    </td>
                                </tr>
                            ) : orders.map((r, index) => {
                                const orderNo = `#${(r.order_number || r.id).toString().slice(-8).toUpperCase()}`
                                return (
                                    <tr 
                                        key={r.id} 
                                        className="group/row hover:bg-white/3 transition-colors duration-500 animate-in fade-in slide-in-from-left-4 duration-500"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className={`${adminTableCellClass} py-6 first:pl-8 font-black text-xs text-cyan-400/90 tracking-wider group-hover/row:text-white transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-cyan-500/0 group-hover/row:bg-cyan-500 transition-colors rounded-full -ml-8 mr-6 duration-500" />
                                                {orderNo}
                                            </div>
                                        </td>
                                    <td className={adminTableCellClass}>
                                        <span className="text-slate-400 font-black text-xs tracking-wider uppercase opacity-80 group-hover/row:opacity-100 transition-opacity">{formatDateTime(r.created_at, lang)}</span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right font-black text-white tracking-widest text-sm`}>
                                        <span className="px-3 py-1 rounded-lg bg-white/5 group-hover/row:bg-white/10 transition-colors border border-white/5">
                                            {formatCurrency(r.total_amount, lang)}
                                        </span>
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ring-1 ring-inset backdrop-blur-md transition-transform duration-500 group-hover/row:scale-105 ${getStatusStyles(r.status)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                                            {getStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right last:pr-8`}>
                                        <Link 
                                            href={`/admin/orders/${r.id}` as import('next').Route} 
                                            className="inline-flex items-center gap-3 text-white text-xs font-black uppercase tracking-hvac-normal bg-white/5 px-6 py-3 rounded-xl hover:bg-cyan-500 hover:text-surface-deep border border-white/5 transition-shadow duration-500 shadow-lg"
                                        >
                                            {t('admin.dashboard.table.detail')} <ExternalLink size={14} className="opacity-60 group-hover/link:opacity-100" />
                                        </Link>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RecentOrdersTable
