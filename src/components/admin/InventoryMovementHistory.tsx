import React from 'react'
import { formatDateTime } from '../../i18n/datetime'

export interface Movement {
    id: string;
    delta: number;
    reason: string;
    created_at: string;
}

interface InventoryMovementHistoryProps {
    movements: Movement[]
}

export default function InventoryMovementHistory({
    movements
}: InventoryMovementHistoryProps) {
    if (movements.length === 0) return null;

    return (
        <div className="overflow-hidden">
            <table className="w-full text-xs border-separate border-spacing-0">
                <thead>
                    <tr className="bg-white/2">
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">Tarih</th>
                        <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">Sebep</th>
                        <th className="text-right px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-hvac-normal border-b border-white/5">Delta</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {movements.map(m => (
                        <tr key={m.id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-4 py-3 text-slate-500 font-bold border-b border-white/5 group-last:border-0">{formatDateTime(m.created_at, 'tr')}</td>
                            <td className="px-4 py-3 text-slate-300 font-bold truncate max-w-140px border-b border-white/5 group-last:border-0" title={m.reason}>{m.reason}</td>
                            <td className={`px-4 py-3 text-right font-black border-b border-white/5 group-last:border-0 ${Number(m.delta) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {Number(m.delta) > 0 ? '+' : ''}{m.delta}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
