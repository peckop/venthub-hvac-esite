import React from 'react'

import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'

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
    const { t, lang } = useI18n();

    if (movements.length === 0) return null;

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs border-separate border-spacing-0">
                <thead>
                    <tr className="bg-admin-surface-2">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-admin-fg-muted border-b border-admin-border">{t('admin.inventory.table.date')}</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-admin-fg-muted border-b border-admin-border">{t('admin.inventory.table.reason')}</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-admin-fg-muted border-b border-admin-border">{t('admin.inventory.table.delta')}</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {movements.map(m => (
                        <tr key={m.id} className="hover:bg-admin-surface-2 transition-colors group">
                            <td className="px-4 py-2.5 text-admin-fg-muted border-b border-admin-border group-last:border-0">{formatDateTime(m.created_at, lang)}</td>
                            <td className="px-4 py-2.5 text-admin-fg truncate max-w-140px border-b border-admin-border group-last:border-0" title={m.reason}>{m.reason}</td>
                            <td className={`px-4 py-3 text-right font-semibold border-b border-admin-border group-last:border-0 ${Number(m.delta) > 0 ? 'text-admin-success' : 'text-admin-danger'}`}>
                                {Number(m.delta) > 0 ? '+' : ''}{m.delta}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

