'use client'

import React from 'react'

import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'

export type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}

interface InventoryReservedTableProps {
    reservedOrders: ReservedRow[]
}

export default function InventoryReservedTable({ reservedOrders }: InventoryReservedTableProps) {
    const { t, lang } = useI18n()

    if (reservedOrders.length === 0) return null;

    return (
        <div className="overflow-hidden">
            <table className="w-full text-xs border-separate border-spacing-0">
                <thead>
                    <tr className="bg-white/2">
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">{t('admin.inventory.order')}</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">{t('admin.inventory.table.date')}</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">{t('admin.inventory.quantity')}</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {reservedOrders.map(ro => (
                        <tr key={ro.order_id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-4 py-3 text-cyan-400 font-black uppercase font-mono tracking-tighter border-b border-white/5 group-last:border-0">{ro.order_id.slice(-8)}</td>
                            <td className="px-4 py-3 text-slate-500 font-bold border-b border-white/5 group-last:border-0">{formatDateTime(ro.created_at, lang)}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-300 border-b border-white/5 group-last:border-0">{ro.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
