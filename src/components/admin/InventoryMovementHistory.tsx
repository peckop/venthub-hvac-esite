import React from 'react'
import { adminButtonSecondaryClass } from '../../utils/adminUi'
import { formatDateTime } from '../../i18n/datetime'

interface Movement {
    id: string;
    delta: number;
    reason: string;
    created_at: string;
}

interface InventoryMovementHistoryProps {
    movements: Movement[]
    onUndo: () => void
    undoing: boolean
}

export default function InventoryMovementHistory({
    movements,
    onUndo,
    undoing
}: InventoryMovementHistoryProps) {
    return (
        <section className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Hareket Geçmişi</h3>
                <button
                    onClick={onUndo}
                    disabled={undoing || movements.length === 0}
                    className={adminButtonSecondaryClass + " h-8 !px-2 text-[10px] uppercase font-bold tracking-wider"}
                >
                    {undoing ? 'İşleniyor...' : 'Geri Al'}
                </button>
            </div>
            {movements.length === 0 ? (
                <div className="text-sm text-slate-500">Henüz hareket bulunmuyor.</div>
            ) : (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="text-left p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sebep</th>
                                <th className="text-right p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {movements.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50 group">
                                    <td className="p-2 text-slate-400 font-medium">{formatDateTime(m.created_at, 'tr')}</td>
                                    <td className="p-2 text-slate-600 truncate max-w-[120px]" title={m.reason}>{m.reason}</td>
                                    <td className={`p-2 text-right font-black ${Number(m.delta) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {Number(m.delta) > 0 ? '+' : ''}{m.delta}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
