import React from 'react'
import { formatDateTime } from '../../i18n/datetime'

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
    if (reservedOrders.length === 0) return null;

    return (
        <div className="overflow-hidden">
            <table className="w-full text-xs border-separate border-spacing-0">
                <thead>
                    <tr className="bg-white/[0.02]">
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Sipariş</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Tarih</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Adet</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {reservedOrders.map(ro => (
                        <tr key={ro.order_id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 text-cyan-400 font-black uppercase font-mono tracking-tighter border-b border-white/5 group-last:border-0">{ro.order_id.slice(-8)}</td>
                            <td className="px-4 py-3 text-slate-500 font-bold border-b border-white/5 group-last:border-0">{formatDateTime(ro.created_at, 'tr')}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-300 border-b border-white/5 group-last:border-0">{ro.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
