'use client'

import React from 'react'
import Link from 'next/link'
import { formatCurrency } from '../../../i18n/format'
import { formatDateTime } from '../../../i18n/datetime'
import { useI18n } from '../../../i18n/I18nProvider'
import { useDragScroll } from '../../../hooks/useDragScroll'
import { adminTableHeadCellClass, adminTableCellClass, adminTableContainerClass } from '../../../utils/adminUi'
import { ExternalLink, ChevronRight, PackageSearch } from 'lucide-react'
import AdminEmptyState from '../AdminEmptyState'
import { Routes } from '../../../utils/routes';


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
    const { lang } = useI18n()
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
            case 'completed': return 'Tamamlandı'
            case 'pending': return 'Teklif/Bekleniyor'
            case 'processing': return 'İşleniyor'
            case 'cancelled': return 'İptal'
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
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-80">Son İşlemler</p>
                    </div>
                </div>
                <Link href={Routes.admin.orders()} className="text-[11px] font-black text-white uppercase tracking-widest px-8 py-3 rounded-2xl glass-strong hover:bg-cyan-500 hover:text-[#0A0F1E] hover:scale-105 active:scale-95 border border-white/5 transition-all duration-300 flex items-center gap-3 group/btn shadow-2xl">
                    Tümünü Gör <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
            
            <div className={`${adminTableContainerClass} glass-strong border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl`}>
                <div ref={dragScrollRef} className="overflow-x-auto custom-scrollbar relative">
                    {/* Decorative glow inside table */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 blur-[100px] pointer-events-none" />
                    
                    <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className={`${adminTableHeadCellClass} py-6 first:pl-8`}>Sipariş / Teklif No</th>
                                <th className={adminTableHeadCellClass}>Tarih</th>
                                <th className={`${adminTableHeadCellClass} text-right`}>Tutar</th>
                                <th className={adminTableHeadCellClass}>Durum</th>
                                <th className={`${adminTableHeadCellClass} last:pr-8`}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-24 text-center" colSpan={5}>
                                        <AdminEmptyState 
                                            icon={PackageSearch} 
                                            title="Sipariş Bulunmuyor" 
                                            description="Henüz herhangi bir sipariş veya teklif kaydı bulunmuyor." 
                                            compact 
                                        />
                                    </td>
                                </tr>
                            ) : orders.map((r, index) => (
                                <tr 
                                    key={r.id} 
                                    className="group/row hover:bg-white/[0.03] transition-all duration-500 animate-in fade-in slide-in-from-left-4 duration-500"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className={`${adminTableCellClass} py-6 first:pl-8 font-black text-[12px] text-cyan-400/90 tracking-wider group-hover/row:text-white transition-colors`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-cyan-500/0 group-hover/row:bg-cyan-500 transition-all rounded-full -ml-8 mr-6 duration-500" />
                                            #{(r.order_number || r.id).toString().slice(-8).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <span className="text-slate-400 font-black text-[11px] tracking-wider uppercase opacity-80 group-hover/row:opacity-100 transition-opacity">{formatDateTime(r.created_at, lang)}</span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right font-black text-white tracking-widest text-[14px]`}>
                                        <span className="px-3 py-1 rounded-lg bg-white/5 group-hover/row:bg-white/10 transition-colors border border-white/5">
                                            {formatCurrency(r.total_amount, lang)}
                                        </span>
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset backdrop-blur-md transition-all duration-500 group-hover/row:scale-105 ${getStatusStyles(r.status)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                                            {getStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td className={`${adminTableCellClass} text-right last:pr-8`}>
                                        <Link 
                                            href={`/admin/orders/${r.id}` as import('next').Route} 
                                            className="inline-flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-xl hover:bg-cyan-500 hover:text-[#0A0F1E] border border-white/5 transition-all duration-500 shadow-lg"
                                        >
                                            Detay <ExternalLink size={14} className="opacity-60 group-hover/link:opacity-100" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RecentOrdersTable
