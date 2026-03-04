import React from 'react'
import { adminButtonSecondaryClass } from '../../utils/adminUi'

interface InventoryStockAdjustProps {
    productId: string
    onAdjust: (productId: string, delta: number, reason: string) => void
    moving: boolean
    moveQty: number
    setMoveQty: (qty: number) => void
}

export default function InventoryStockAdjust({
    productId,
    onAdjust,
    moving,
    moveQty,
    setMoveQty
}: InventoryStockAdjustProps) {
    return (
        <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Hızlı Hareket</h3>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
                    value={moveQty}
                    min={1}
                    onChange={(e) => setMoveQty(Math.max(1, Number(e.target.value || 1)))}
                />
                <button
                    disabled={moving}
                    className={adminButtonSecondaryClass + " h-9 text-xs px-4"}
                    onClick={() => onAdjust(productId, Math.abs(moveQty), 'manual_in')}
                >
                    Giriş
                </button>
                <button
                    disabled={moving}
                    className={adminButtonSecondaryClass + " h-9 text-xs px-4"}
                    onClick={() => onAdjust(productId, -Math.abs(moveQty), 'manual_out')}
                >
                    Çıkış
                </button>
            </div>
        </section>
    )
}
