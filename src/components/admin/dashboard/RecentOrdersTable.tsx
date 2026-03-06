'use client'

import React from 'react'
import Link from 'next/link'
import { formatCurrency } from '../../../i18n/format'
import { formatDateTime } from '../../../i18n/datetime'
import { useI18n } from '../../../i18n/I18nProvider'
import { useDragScroll } from '../../../hooks/useDragScroll'

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800'
            case 'pending': return 'bg-warning-orange/20 text-warning-orange'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
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
        <div className="bg-white rounded-lg shadow-hvac-md p-4 mt-6">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="text-sm font-semibold text-industrial-gray uppercase tracking-wide">{title}</div>
                <Link href="/account/orders" className="text-sm text-primary-navy font-medium hover:underline">
                    Tümünü Gör
                </Link>
            </div>
            <div ref={dragScrollRef} className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50/50 text-industrial-gray uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 font-medium rounded-tl-md">Sipariş / Teklif No</th>
                            <th className="px-4 py-3 font-medium">Tarih</th>
                            <th className="px-4 py-3 font-medium text-right">Tutar</th>
                            <th className="px-4 py-3 font-medium">Durum</th>
                            <th className="px-4 py-3 font-medium rounded-tr-md"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td className="px-4 py-6 text-center text-steel-gray" colSpan={5}>
                                    Henüz kayıt bulunmuyor.
                                </td>
                            </tr>
                        ) : orders.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-primary-navy font-medium">
                                    #{(r.order_number || r.id).toString().slice(-8).toUpperCase()}
                                </td>
                                <td className="px-4 py-3 text-steel-gray">
                                    {formatDateTime(r.created_at, lang)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-steel-gray">
                                    {formatCurrency(r.total_amount, lang)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                                        {getStatusLabel(r.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/account/orders/${r.id}`} className="text-primary-navy text-xs font-medium hover:underline bg-light-gray/50 px-3 py-1.5 rounded-md hover:bg-light-gray transition-colors">
                                        Detay
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RecentOrdersTable
