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
            case 'completed': return 'bg-admin-success-weak text-admin-success ring-admin-success/30'
            case 'pending': return 'bg-admin-warning-weak text-admin-warning ring-admin-warning/30'
            case 'processing': return 'bg-admin-accent-weak text-admin-accent ring-admin-accent/30'
            case 'cancelled': return 'bg-admin-danger-weak text-admin-danger ring-admin-danger/30'
            default: return 'bg-admin-surface-3 text-admin-fg-muted ring-admin-border'
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
                    <h3 className="text-xl font-semibold text-admin-fg tracking-tighter leading-none group-hover/table:text-admin-accent transition-colors">{title}</h3>
                    <div className="flex items-center gap-2 mt-3 italic opacity-60">
                        <div className="h-0.5 w-8 bg-admin-accent rounded-full" />
                        <p className="text-xs font-semibold text-admin-fg-muted italic opacity-80">{t('admin.dashboard.recent.transactions')}</p>
                    </div>
                </div>
                <Link href={Routes.admin.orders()} className="text-xs font-semibold text-admin-accent-fg px-8 py-3 rounded-admin-lg bg-admin-surface hover:bg-admin-accent hover:text-admin-accent-fg hover:scale-105 active:scale-95 border border-admin-border transition-transform duration-300 flex items-center gap-3 group/btn shadow-admin-lg">
                    {t('admin.dashboard.recent.viewAll')} <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
            
            <div className={`${adminTableContainerClass} bg-admin-surface border border-admin-border rounded-admin-lg overflow-hidden shadow-admin-lg`}>
                <div ref={dragScrollRef} className="overflow-x-auto custom-scrollbar relative">
                    {/* Decorative glow inside table */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-admin-accent-weak blur-100 pointer-events-none" />
                    
                    <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="bg-admin-surface-2">
                                <th className={`${adminTableHeadCellClass} py-6 first:pl-8`}>{t('admin.dashboard.table.orderOrQuoteNo')}</th>
                                <th className={adminTableHeadCellClass}>{t('admin.dashboard.table.date')}</th>
                                <th className={`${adminTableHeadCellClass} text-right`}>{t('admin.dashboard.table.amount')}</th>
                                <th className={adminTableHeadCellClass}>{t('admin.dashboard.table.status')}</th>
                                <th className={`${adminTableHeadCellClass} last:pr-8`}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {orders.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-24 text-center" colSpan={5}>
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
                                        className="group/row hover:bg-admin-surface-2 transition-colors duration-500 animate-in fade-in slide-in-from-left-4 duration-500"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className={`${adminTableCellClass} py-6 first:pl-8 font-semibold text-xs text-admin-accent group-hover/row:text-admin-fg transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-admin-accent-weak group-hover/row:bg-admin-accent transition-colors rounded-full -ml-8 mr-6 duration-500" />
                                                {orderNo}
                                            </div>
                                        </td>
                                    <td className={adminTableCellClass}>
                                        <span className="text-admin-fg-muted font-semibold text-xs opacity-80 group-hover/row:opacity-100 transition-opacity">{formatDateTime(r.created_at, lang)}</span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right font-semibold text-admin-fg text-sm`}>
                                        <span className="px-3 py-1 rounded-admin-md bg-admin-surface-2 group-hover/row:bg-admin-surface-3 transition-colors border border-admin-border">
                                            {formatCurrency(r.total_amount, lang)}
                                        </span>
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset transition-transform duration-500 group-hover/row:scale-105 ${getStatusStyles(r.status)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                                            {getStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right last:pr-8`}>
                                        <Link 
                                            href={`/admin/orders/${r.id}` as import('next').Route} 
                                            className="inline-flex items-center gap-3 text-admin-accent-fg text-xs font-semibold bg-admin-surface-2 px-6 py-3 rounded-admin-md hover:bg-admin-accent hover:text-admin-accent-fg border border-admin-border transition-shadow duration-500 shadow-admin-md"
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
