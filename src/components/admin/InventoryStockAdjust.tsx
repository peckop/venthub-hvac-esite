import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

interface InventoryStockAdjustProps {
    _productId: string
    onAdjust: (_productId: string, delta: number, reason: string) => void
    moving: boolean
    moveQty: number
    setMoveQty: (qty: number) => void
}

export default function InventoryStockAdjust({
    _productId,
    onAdjust,
    moving,
    moveQty,
    setMoveQty
}: InventoryStockAdjustProps) {
    const { t } = useI18n()

    return (
        <section className="space-y-4">
            <h3 className="text-xs font-semibold text-admin-fg-muted ml-1">
                {t('admin.inventory.quickStockMovement')}
            </h3>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    className="w-24 bg-admin-surface-2 border border-admin-border rounded-admin-lg px-4 py-3 text-sm text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 focus-visible:border-admin-accent/40 transition-colors font-bold"
                    value={moveQty}
                    min={1}
                    onChange={(e) => setMoveQty(Math.max(1, Number(e.target.value || 1)))}
                />
                <button
                    disabled={moving}
                    className="flex-1 h-12 rounded-admin-lg bg-admin-success-weak border border-admin-success/30 text-admin-success text-xs font-semibold hover:bg-admin-success-weak transition-opacity disabled:opacity-50"
                    onClick={() => onAdjust(_productId, Math.abs(moveQty), 'manual_in')}
                >
                    {t('admin.inventory.stockEntry')}
                </button>
                <button
                    disabled={moving}
                    className="flex-1 h-12 rounded-admin-lg bg-admin-danger-weak border border-admin-danger/30 text-admin-danger text-xs font-semibold hover:bg-admin-danger-weak transition-opacity disabled:opacity-50"
                    onClick={() => onAdjust(_productId, -Math.abs(moveQty), 'manual_out')}
                >
                    {t('admin.inventory.stockExit')}
                </button>
            </div>
        </section>
    )
}
