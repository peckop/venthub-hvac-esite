import { SearchX } from 'lucide-react'
import React from 'react'

import { useDragScroll } from '../../hooks/useDragScroll'
import { Density, InventoryRow, LoadState, SortKey, VisibleCols } from '../../types/inventory'
import { adminTableCellClass,adminTableHeadCellClass } from '../../utils/adminUi'
import AdminEmptyState from './AdminEmptyState'
import AdminSkeleton from './AdminSkeleton'
import EditableCell from './EditableCell'
import InfoTooltip from './InfoTooltip'

interface InventoryTableProps {
    rows: InventoryRow[]
    loading: LoadState
    error: string
    selected: InventoryRow | null
    visibleCols: VisibleCols
    density: Density
    sortKey: SortKey
    sortDir: 'asc' | 'desc'
    groupByCategory: boolean
    groupedRows: { _c_id: string | null; name: string; items: InventoryRow[] }[]
    onSort: (key: SortKey) => void
    onSelect: (r: InventoryRow) => void
    onUpdateLocation: (_productId: string, val: string) => Promise<void>
    onUpdateSupplier: (_productId: string, val: string) => Promise<void>
    hasWriteAccess: boolean
    thresholdMap: Record<string, number | null>
    defaultThreshold: number | null
    effectiveThreshold: (_productId: string) => number | null
}

export default function InventoryTable({
    rows,
    loading,
    error,
    selected,
    visibleCols,
    density,
    sortKey,
    sortDir,
    groupByCategory,
    groupedRows,
    onSort,
    onSelect,
    onUpdateLocation,
    onUpdateSupplier,
    hasWriteAccess,
    thresholdMap,
    defaultThreshold,
    effectiveThreshold
}: InventoryTableProps) {
    const dragScrollRef = useDragScroll<HTMLDivElement>()
    const headPad = density === 'compact' ? 'px-2 py-2' : ''
    const cellPad = density === 'compact' ? 'px-2 py-2' : ''

    const sortIndicator = (key: SortKey) => {
        if (sortKey !== key) return ''
        return sortDir === 'asc' ? '▲' : '▼'
    }

    const statusBadge = (r: InventoryRow) => {
        const net = r.available_stock
        const th = effectiveThreshold(r.product_id)
        const base = "px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border shadow-sm transition-colors"
        
        if (net <= 0) return <span className={`${base} bg-rose-500/10 text-rose-400 border-rose-500/20`}>Tükendi</span>
        if (th != null && net <= th) return <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse`}>Kritik</span>
        if (r.reserved_stock > 0) return <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}>Rezervli</span>
        return <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>Uygun</span>
    }

    const TableRow = ({ r }: { r: InventoryRow }) => (
        <tr
            key={r.product_id}
            className={`group hover:bg-white/3 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${selected?.product_id === r.product_id ? 'bg-cyan-500/5' : ''}`}
            onClick={() => onSelect(r)}
        >
            {visibleCols.name && (
                <td className={adminTableCellClass + " " + cellPad}>
                    <div className="flex flex-col">
                        <span className="font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-xs">{r.name}</span>
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter mt-0.5">{r.product_id.slice(0, 8)}</span>
                    </div>
                </td>
            )}
            {visibleCols.physical && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-bold text-slate-300"}>{r.physical_stock}</td>}
            {visibleCols.reserved && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-500"}>{r.reserved_stock}</td>}
            {visibleCols.available && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-black text-cyan-400"}>{r.available_stock}</td>}
            {visibleCols.threshold && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-500"}>{thresholdMap[r.product_id] ?? defaultThreshold ?? 10}</td>}
            {visibleCols.location && (
                <td className={adminTableCellClass + " " + cellPad} onClick={e => e.stopPropagation()}>
                    {hasWriteAccess ? (
                        <EditableCell
                            value={r.warehouse_location || ''}
                            placeholder="-"
                            inputWidth="w-20"
                            className="text-slate-400 font-bold"
                            onSave={(val) => onUpdateLocation(r.product_id, val)}
                        />
                    ) : (
                        <span className="text-slate-500 text-xs font-bold">{r.warehouse_location || '-'}</span>
                    )}
                </td>
            )}
            {visibleCols.supplier && (
                <td className={adminTableCellClass + " " + cellPad} onClick={e => e.stopPropagation()}>
                    {hasWriteAccess ? (
                        <EditableCell
                            value={r.supplier_name || ''}
                            placeholder="-"
                            inputWidth="w-24"
                            className="max-w-120px truncate text-slate-400"
                            onSave={(val) => onUpdateSupplier(r.product_id, val)}
                        />
                    ) : (
                        <span className="text-slate-500 max-w-120px truncate block text-xs">{r.supplier_name || '-'}</span>
                    )}
                </td>
            )}
            {visibleCols.abc && (
                <td className={adminTableCellClass + " " + cellPad + " text-center"}>
                    {r.abc_class ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs border shadow-sm ${r.abc_class === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            r.abc_class === 'B' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            {r.abc_class}
                        </span>
                    ) : '-'}
                </td>
            )}
            {visibleCols.days && (
                <td className={adminTableCellClass + " " + cellPad + " text-right"}>
                    {r.days_until_empty === 9999 ? (
                        <span className="text-xs text-slate-600 uppercase font-black tracking-widest">SABİT</span>
                    ) : (
                        <div className={`text-xs font-black uppercase tracking-widest ${r.days_until_empty && r.days_until_empty <= 7 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                            {r.days_until_empty && r.days_until_empty <= 7 && '🔥 '}
                            {r.days_until_empty} GÜN
                        </div>
                    )}
                </td>
            )}
            {visibleCols.status && <td className={adminTableCellClass + " " + cellPad + " text-center"}>{statusBadge(r)}</td>}
        </tr>
    )

    return (
        <div ref={dragScrollRef} className="overflow-x-auto w-full content-auto-table">
            <table className="w-full min-w-1000px border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 backdrop-blur-xl">
                    <tr>
                        {visibleCols.name && (
                            <th className={adminTableHeadCellClass + " " + headPad}>
                                <button onClick={() => onSort('name')} className="hover:text-cyan-400 transition-colors flex items-center gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    Ürün {sortIndicator('name')}
                                </button>
                            </th>
                        )}
                        {visibleCols.physical && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    <button onClick={() => onSort('physical')} className="hover:text-cyan-400 transition-colors">Fiziksel {sortIndicator('physical')}</button>
                                    <InfoTooltip text="Depodaki gerçekte sayılan mevcut ürün adedi." />
                                </div>
                            </th>
                        )}
                        {visibleCols.reserved && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    <button onClick={() => onSort('reserved')} className="hover:text-cyan-400 transition-colors">Rezerve {sortIndicator('reserved')}</button>
                                    <InfoTooltip text="Henüz kargolanmamış ama parası ödenmiş ürün miktarı." />
                                </div>
                            </th>
                        )}
                        {visibleCols.available && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-xs font-black tracking-hvac-normal text-cyan-400">
                                    <button onClick={() => onSort('available')} className="hover:opacity-80">Müsait {sortIndicator('available')}</button>
                                    <InfoTooltip text="Satılabilir durumdaki net stok. (Fiziksel - Rezerve)" />
                                </div>
                            </th>
                        )}
                        {visibleCols.threshold && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    <button onClick={() => onSort('threshold')} className="hover:text-cyan-400 transition-colors">Eşik {sortIndicator('threshold')}</button>
                                    <InfoTooltip text="Stok bu rakamın altına indiğinde uyarı verilir." />
                                </div>
                            </th>
                        )}
                        {visibleCols.location && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase text-xs font-black tracking-hvac-normal"}>
                                <button onClick={() => onSort('location')} className="hover:text-cyan-400 transition-colors">Raf {sortIndicator('location')}</button>
                            </th>
                        )}
                        {visibleCols.supplier && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase text-xs font-black tracking-hvac-normal"}>
                                <button onClick={() => onSort('supplier')} className="hover:text-cyan-400 transition-colors">Tedarikçi {sortIndicator('supplier')}</button>
                            </th>
                        )}
                        {visibleCols.abc && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-center"}>
                                <div className="flex items-center justify-center gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    <button onClick={() => onSort('abc')} className="hover:text-cyan-400 transition-colors">Sınıf {sortIndicator('abc')}</button>
                                    <InfoTooltip text="A (En Popüler), B (Orta), C (Az Satan)." />
                                </div>
                            </th>
                        )}
                        {visibleCols.days && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-xs font-black tracking-hvac-normal">
                                    <button onClick={() => onSort('days_empty')} className="hover:text-cyan-400 transition-colors">Tükenme {sortIndicator('days_empty')}</button>
                                    <InfoTooltip text="Eldeki stoğun kaç gün içinde biteceği tahmini." />
                                </div>
                            </th>
                        )}
                        {visibleCols.status && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-center uppercase text-xs font-black tracking-hvac-normal"}>Durum</th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {loading === LoadState.Loading && rows.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="p-0">
                                <AdminSkeleton variant="table" count={10} rows={10} />
                            </td>
                        </tr>
                    ) : error ? (
                        <tr><td colSpan={10} className="p-12 text-center text-rose-500 font-black uppercase tracking-widest">{error}</td></tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="p-0 border-b-0">
                                <AdminEmptyState
                                    icon={SearchX}
                                    title="Ürün Bulunamadı"
                                    description="Arama kriterlerinize uygun envanter kaydı bulunamadı."
                                />
                            </td>
                        </tr>
                    ) : groupByCategory ? (
                        groupedRows.map(g => (
                            <React.Fragment key={g._c_id ?? 'null'}>
                                <tr className="bg-white/2 group">
                                    <th colSpan={10} className={`text-left ${density === 'compact' ? 'px-4 py-2' : 'px-8 py-4'} text-cyan-400 font-black uppercase text-xs tracking-hvac-relaxed border-y border-white/5`}>
                                        <div className="flex items-center gap-3">
                                            <span className="w-1 h-4 bg-cyan-400 rounded-full shadow-glow-sm"></span>
                                            {g.name || 'Kategorisiz'} <span className="text-slate-500 ml-2">({g.items.length})</span>
                                        </div>
                                    </th>
                                </tr>
                                {g.items.map(r => <TableRow key={r.product_id} r={r} />)}
                            </React.Fragment>
                        ))
                    ) : (
                        rows.map(r => <TableRow key={r.product_id} r={r} />)
                    )}
                </tbody>
            </table>
        </div>
    )
}
