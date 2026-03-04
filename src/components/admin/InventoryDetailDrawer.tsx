import React from 'react'
import { adminButtonPrimaryClass, adminButtonSecondaryClass } from '../../utils/adminUi'
import { formatDateTime } from '../../i18n/datetime'
import { printQrLabel } from './InventoryQrLabel'

export type InventoryRow = {
    product_id: string;
    name: string;
    physical_stock: number;
    reserved_stock: number;
    available_stock: number;
    warehouse_location?: string | null;
    supplier_name?: string | null;
    daily_velocity?: number;
    days_until_empty?: number;
    abc_class?: 'A' | 'B' | 'C' | null;
}

export type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}

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
    adjustStock: (id: string, delta: number, type: 'manual_in' | 'manual_out') => void
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
                <div className="p-4 space-y-4 overflow-auto">
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
                        <section className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-500">Hızlı Hareket</h3>
                            <div className="flex items-center gap-2">
                                <input type="number" className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all" value={moveQty} min={1} onChange={(e) => setMoveQty(Math.max(1, Number(e.target.value || 1)))} />
                                <button disabled={moving} className={adminButtonSecondaryClass + " h-9 text-xs px-4"} onClick={() => adjustStock(selected.product_id, Math.abs(moveQty), 'manual_in')}>Giriş</button>
                                <button disabled={moving} className={adminButtonSecondaryClass + " h-9 text-xs px-4"} onClick={() => adjustStock(selected.product_id, -Math.abs(moveQty), 'manual_out')}>Çıkış</button>
                            </div>
                        </section>
                    )}

                    <section className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-500">Rezerve Eden Siparişler</h3>
                        {reservedOrders.length === 0 ? (
                            <div className="text-sm text-slate-500">Bekleyen sipariş yok.</div>
                        ) : (
                            <div className="border border-slate-100 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left p-2 text-slate-500">Sipariş</th>
                                            <th className="text-left p-2 text-slate-500">Tarih</th>
                                            <th className="text-right p-2 text-slate-500">Adet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reservedOrders.map(ro => (
                                            <tr key={ro.order_id}>
                                                <td className="p-2 text-primary-navy font-medium uppercase">{ro.order_id.slice(-8)}</td>
                                                <td className="p-2 text-slate-500">{formatDateTime(ro.created_at, 'tr')}</td>
                                                <td className="p-2 text-right">{ro.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Hareket Geçmişi</h3>
                            <button onClick={undoLastMovement} disabled={undoing || movements.length === 0} className={adminButtonSecondaryClass + " h-8 !px-2 text-[10px] uppercase font-bold tracking-wider"}>Geri Al</button>
                        </div>
                        {movements.length === 0 ? (
                            <div className="text-sm text-slate-500">Hareket yok.</div>
                        ) : (
                            <div className="border border-slate-100 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left p-2 text-slate-500">Tarih</th>
                                            <th className="text-left p-2 text-slate-500">Sebep</th>
                                            <th className="text-right p-2 text-slate-500">Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {movements.map(m => (
                                            <tr key={m.id}>
                                                <td className="p-2 text-slate-400">{formatDateTime(m.created_at, 'tr')}</td>
                                                <td className="p-2 text-slate-600">{m.reason}</td>
                                                <td className={`p-2 text-right font-medium ${Number(m.delta) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {Number(m.delta) > 0 ? '+' : ''}{m.delta}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </aside>
        </>
    )
}
