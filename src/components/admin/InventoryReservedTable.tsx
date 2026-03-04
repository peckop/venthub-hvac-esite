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
    return (
        <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Rezerve Eden Siparişler</h3>
            {reservedOrders.length === 0 ? (
                <div className="text-sm text-slate-500">Bekleyen sipariş yok.</div>
            ) : (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sipariş</th>
                                <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="text-right p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reservedOrders.map(ro => (
                                <tr key={ro.order_id} className="hover:bg-slate-50 animate-in fade-in duration-300">
                                    <td className="p-2 text-primary-navy font-bold uppercase font-mono tracking-tighter">{ro.order_id.slice(-8)}</td>
                                    <td className="p-2 text-slate-500">{formatDateTime(ro.created_at, 'tr')}</td>
                                    <td className="p-2 text-right font-medium text-slate-700">{ro.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
