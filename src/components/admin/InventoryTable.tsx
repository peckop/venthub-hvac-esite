import React from 'react'
import { adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import EditableCell from './EditableCell'
import InfoTooltip from './InfoTooltip'
import AdminEmptyState from './AdminEmptyState'
import { SearchX } from 'lucide-react'
import { InventoryRow, SortKey, LoadState, Density, VisibleCols } from '../../types/inventory'

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
    groupedRows: { cid: string | null; name: string; items: InventoryRow[] }[]
    onSort: (key: SortKey) => void
    onSelect: (r: InventoryRow) => void
    onUpdateLocation: (productId: string, val: string) => Promise<void>
    onUpdateSupplier: (productId: string, val: string) => Promise<void>
    hasWriteAccess: boolean
    thresholdMap: Record<string, number | null>
    defaultThreshold: number | null
    effectiveThreshold: (productId: string) => number | null
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
    const headPad = density === 'compact' ? 'px-2 py-2' : ''
    const cellPad = density === 'compact' ? 'px-2 py-2' : ''

    const sortIndicator = (key: SortKey) => {
        if (sortKey !== key) return ''
        return sortDir === 'asc' ? '▲' : '▼'
    }

    const statusBadge = (r: InventoryRow) => {
        const net = r.available_stock
        const th = effectiveThreshold(r.product_id)
        if (net <= 0) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 uppercase">Tükendi</span>
        if (th != null && net <= th) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 uppercase animate-pulse">Kritik</span>
        if (r.reserved_stock > 0) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-700 uppercase">Rezervli</span>
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 uppercase">Uygun</span>
    }

    const TableRow = ({ r }: { r: InventoryRow }) => (
        <tr
            key={r.product_id}
            className={`group hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${selected?.product_id === r.product_id ? 'bg-primary-navy/[0.03]' : ''} ${r.available_stock <= 0 ? 'bg-rose-50/20' : (effectiveThreshold(r.product_id) != null && r.available_stock <= Number(effectiveThreshold(r.product_id))) ? 'bg-rose-50/10' : ''}`}
            onClick={() => onSelect(r)}
        >
            {visibleCols.name && (
                <td className={adminTableCellClass + " " + cellPad}>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-primary-navy transition-colors">{r.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{r.product_id.slice(0, 8)}</span>
                    </div>
                </td>
            )}
            {visibleCols.physical && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-medium text-slate-700"}>{r.physical_stock}</td>}
            {visibleCols.reserved && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-400"}>{r.reserved_stock}</td>}
            {visibleCols.available && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono font-black text-slate-900"}>{r.available_stock}</td>}
            {visibleCols.threshold && <td className={adminTableCellClass + " " + cellPad + " text-right font-mono text-slate-500"}>{thresholdMap[r.product_id] ?? defaultThreshold ?? 10}</td>}
            {visibleCols.location && (
                <td className={adminTableCellClass + " " + cellPad} onClick={e => e.stopPropagation()}>
                    {hasWriteAccess ? (
                        <EditableCell
                            value={r.warehouse_location || ''}
                            placeholder="-"
                            inputWidth="w-20"
                            onSave={(val) => onUpdateLocation(r.product_id, val)}
                        />
                    ) : (
                        <span className="text-slate-500">{r.warehouse_location || '-'}</span>
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
                            className="max-w-[120px] truncate"
                            onSave={(val) => onUpdateSupplier(r.product_id, val)}
                        />
                    ) : (
                        <span className="text-slate-500 max-w-[120px] truncate block">{r.supplier_name || '-'}</span>
                    )}
                </td>
            )}
            {visibleCols.abc && (
                <td className={adminTableCellClass + " " + cellPad + " text-center"}>
                    {r.abc_class ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-[10px] border shadow-sm ${r.abc_class === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                r.abc_class === 'B' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                            {r.abc_class}
                        </span>
                    ) : '-'}
                </td>
            )}
            {visibleCols.days && (
                <td className={adminTableCellClass + " " + cellPad + " text-right"}>
                    {r.days_until_empty === 9999 ? (
                        <span className="text-[10px] text-slate-300 uppercase font-bold tracking-tight">Sabit</span>
                    ) : (
                        <div className={`text-[11px] font-bold ${r.days_until_empty && r.days_until_empty <= 7 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
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
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                        {visibleCols.name && (
                            <th className={adminTableHeadCellClass + " " + headPad}>
                                <button onClick={() => onSort('name')} className="hover:text-primary-navy transition-colors flex items-center gap-1 uppercase text-[10px] font-black tracking-widest">
                                    Ürün {sortIndicator('name')}
                                </button>
                            </th>
                        )}
                        {visibleCols.physical && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-black tracking-widest">
                                    <button onClick={() => onSort('physical')} className="hover:text-primary-navy transition-colors">Fiziksel {sortIndicator('physical')}</button>
                                    <InfoTooltip text="Depodaki gerçekte sayılan mevcut ürün adedi." />
                                </div>
                            </th>
                        )}
                        {visibleCols.reserved && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-black tracking-widest">
                                    <button onClick={() => onSort('reserved')} className="hover:text-primary-navy transition-colors">Rezerve {sortIndicator('reserved')}</button>
                                    <InfoTooltip text="Henüz kargolanmamış ama parası ödenmiş ürün miktarı." />
                                </div>
                            </th>
                        )}
                        {visibleCols.available && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-black tracking-widest text-primary-navy">
                                    <button onClick={() => onSort('available')} className="hover:opacity-80">Müsait {sortIndicator('available')}</button>
                                    <InfoTooltip text="Satılabilir durumdaki net stok. (Fiziksel - Rezerve)" />
                                </div>
                            </th>
                        )}
                        {visibleCols.threshold && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-black tracking-widest">
                                    <button onClick={() => onSort('threshold')} className="hover:text-primary-navy transition-colors">Eşik {sortIndicator('threshold')}</button>
                                    <InfoTooltip text="Stok bu rakamın altına indiğinde uyarı verilir." />
                                </div>
                            </th>
                        )}
                        {visibleCols.location && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase text-[10px] font-black tracking-widest"}>
                                <button onClick={() => onSort('location')} className="hover:text-primary-navy transition-colors">Raf {sortIndicator('location')}</button>
                            </th>
                        )}
                        {visibleCols.supplier && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-left uppercase text-[10px] font-black tracking-widest"}>
                                <button onClick={() => onSort('supplier')} className="hover:text-primary-navy transition-colors">Tedarikçi {sortIndicator('supplier')}</button>
                            </th>
                        )}
                        {visibleCols.abc && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-center"}>
                                <div className="flex items-center justify-center gap-1 uppercase text-[10px] font-black tracking-widest">
                                    <button onClick={() => onSort('abc')} className="hover:text-primary-navy transition-colors">Sınıf {sortIndicator('abc')}</button>
                                    <InfoTooltip text="A (En Popüler), B (Orta), C (Az Satan)." />
                                </div>
                            </th>
                        )}
                        {visibleCols.days && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-right"}>
                                <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-black tracking-widest">
                                    <button onClick={() => onSort('days_empty')} className="hover:text-primary-navy transition-colors">Tükenme {sortIndicator('days_empty')}</button>
                                    <InfoTooltip text="Eldeki stoğun kaç gün içinde biteceği tahmini." />
                                </div>
                            </th>
                        )}
                        {visibleCols.status && (
                            <th className={adminTableHeadCellClass + " " + headPad + " text-center uppercase text-[10px] font-black tracking-widest"}>Durum</th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {loading === LoadState.Loading && rows.length === 0 ? (
                        [...Array(10)].map((_, i) => (
                            <tr key={`skel-${i}`} className="border-b border-slate-50 animate-pulse">
                                <td colSpan={10} className="p-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                            </tr>
                        ))
                    ) : error ? (
                        <tr><td colSpan={10} className="p-12 text-center text-rose-500 font-bold">{error}</td></tr>
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
                            <React.Fragment key={g.cid ?? 'null'}>
                                <tr className="bg-slate-50/50 group">
                                    <th colSpan={10} className={`text-left ${density === 'compact' ? 'px-4 py-2' : 'px-6 py-4'} text-primary-navy font-black uppercase text-[10px] tracking-widest border-y border-slate-100 shadow-sm`}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-3 bg-primary-navy rounded-full"></span>
                                            {g.name || 'Kategorisiz'} ({g.items.length})
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
