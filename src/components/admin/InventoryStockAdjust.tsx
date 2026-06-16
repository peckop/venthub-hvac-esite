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
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal ml-1">
                {t('admin.inventory.quickStockMovement')}
            </h3>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    className="w-24 bg-white/3 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:border-cyan-400/40 transition-colors font-bold"
                    value={moveQty}
                    min={1}
                    onChange={(e) => setMoveQty(Math.max(1, Number(e.target.value || 1)))}
                />
                <button
                    disabled={moving}
                    className="flex-1 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-opacity disabled:opacity-50"
                    onClick={() => onAdjust(_productId, Math.abs(moveQty), 'manual_in')}
                >
                    {t('admin.inventory.stockEntry')}
                </button>
                <button
                    disabled={moving}
                    className="flex-1 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-opacity disabled:opacity-50"
                    onClick={() => onAdjust(_productId, -Math.abs(moveQty), 'manual_out')}
                >
                    {t('admin.inventory.stockExit')}
                </button>
            </div>
        </section>
    )
}
