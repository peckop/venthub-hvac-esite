import React from 'react'
import { adminButtonPrimaryClass, adminButtonSecondaryClass } from '../../utils/adminUi'
import { printQrLabel } from './InventoryQrLabel'
import { InventoryRow, ReservedRow } from '../../types/inventory'
import InventoryStockAdjust from './InventoryStockAdjust'
import InventoryReservedTable from './InventoryReservedTable'
import InventoryMovementHistory from './InventoryMovementHistory'

interface InventoryDetailDrawerProps {
    selected: InventoryRow | null
    setSelected: (v: InventoryRow | null) => void
    printingQr: boolean
    setPrintingQr: (v: boolean) => void
    selectedStock: number | null
    selectedThreshold: number | ''
    setSelectedThreshold: (v: number | '') => void
    defaultThreshold: number | null
    saving: boolean
    saveThreshold: (id: string) => void
    hasWriteAccess: boolean
    moveQty: number
    setMoveQty: (v: number) => void
    moving: boolean
    adjustStock: (id: string, delta: number, reason: string) => void
    reservedOrders: ReservedRow[]
    movements: { id: string; delta: number; reason: string; created_at: string }[]
    undoLastMovement: () => void
    undoing: boolean
    t: (key: string) => string
}

export default function InventoryDetailDrawer(props: InventoryDetailDrawerProps) {
    const {
        selected, setSelected, printingQr, setPrintingQr, selectedStock,
        selectedThreshold, setSelectedThreshold, defaultThreshold, saving, saveThreshold,
        hasWriteAccess, moveQty, setMoveQty, moving, adjustStock,
        reservedOrders, movements, undoLastMovement, undoing, t
    } = props

    // ESC ile çekmeceyi kapat
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [setSelected])

    if (!selected) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
            <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white/95 backdrop-blur z-50 shadow-2xl border-l border-slate-200/80 flex flex-col animate-in slide-in-from-right duration-200">
                <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 truncate pr-4">{selected.name}</h2>
                    <div className="flex items-center gap-2">
                        <button disabled={printingQr} className={adminButtonPrimaryClass + " h-9 text-xs px-3 shadow-md shadow-primary-navy/10"} onClick={() => void printQrLabel(selected, setPrintingQr)}>
                            {printingQr ? 'Hazırlanıyor...' : 'QR Etiket'}
                        </button>
                        <button className={adminButtonSecondaryClass + " h-9"} onClick={() => setSelected(null)}>{t('admin.ui.close') || 'Kapat'}</button>
                    </div>
                </header>
                <div className="p-4 space-y-6 overflow-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-navy"></div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Güncel Stok</div>
                            <div className="text-2xl font-black text-slate-800 ml-1">{selectedStock ?? '-'}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Eşik (Alarm)</div>
                            <div className="text-2xl font-black text-slate-800 ml-1">{(selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold) as string | number}</div>
                        </div>
                    </div>

                    {selected.daily_velocity !== undefined && selected.daily_velocity > 0 && (
                        <section className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
                            <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Zeki Satın Alma Önerisi
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Satış Hızı (30 Gün)</div>
                                    <div className="font-mono text-sm font-semibold text-slate-800">{selected.daily_velocity.toFixed(2)} / gün</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Tahmini {Math.ceil(selected.daily_velocity * 30)} adet/ay</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Önerilen Sipariş</div>
                                    <div className="font-mono text-2xl font-black text-indigo-600">
                                        {Math.max(0, Math.ceil((selected.daily_velocity * 30)) - selected.available_stock)} <span className="text-sm font-semibold">adet</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">30 günlük buffer için</div>
                                </div>
                            </div>

                            {selected.abc_class === 'A' && (
                                <div className="mt-3 text-[10px] bg-indigo-100/50 text-indigo-800 px-2 py-1.5 rounded-md border border-indigo-200/50 flex items-center gap-1.5">
                                    <span className="font-bold">A Sınıfı:</span> Bu ürün kritik ciro kaynağıdır, stokta daima bulunmalıdır.
                                </div>
                            )}
                        </section>
                    )}

                    {hasWriteAccess && (
                        <section className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Eşik Düzenle</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={selectedThreshold}
                                    onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Eşik"
                                    className="w-28 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
                                />
                                <button
                                    disabled={saving}
                                    onClick={() => saveThreshold(selected.product_id)}
                                    className={adminButtonPrimaryClass + " h-9 text-xs px-4"}>Uygula</button>
                                <button
                                    disabled={saving}
                                    onClick={() => setSelectedThreshold('')}
                                    className={adminButtonSecondaryClass + " h-9 text-xs px-4 text-warning-orange border-warning-orange/30 hover:bg-warning-orange/5"}>Varsayılan</button>
                            </div>
                        </section>
                    )}

                    {hasWriteAccess && (
                        <InventoryStockAdjust
                            productId={selected.product_id}
                            onAdjust={adjustStock}
                            moving={moving}
                            moveQty={moveQty}
                            setMoveQty={setMoveQty}
                        />
                    )}

                    <InventoryReservedTable reservedOrders={reservedOrders} />

                    <InventoryMovementHistory
                        movements={movements}
                        onUndo={undoLastMovement}
                        undoing={undoing}
                    />
                </div>
            </aside>
        </>
    )
}
