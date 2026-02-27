import React, { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { adminSectionTitleClass } from '../../utils/adminUi'
import toast from 'react-hot-toast'
import { Clock, CheckCircle2, Package, Truck, XCircle, AlertCircle, GripVertical } from 'lucide-react'

// --- Types ---
interface AdminOrderRow {
    id: string
    status: string
    user_id?: string | null
    total_amount?: number | null
    created_at: string
    customer_name?: string | null
    order_number?: string | null
}

type ColumnId = 'col_new' | 'col_prep' | 'col_shipped' | 'col_done' | 'col_cancel'

interface ColumnDef {
    id: ColumnId
    title: string
    statuses: string[] // Which DB statuses map to this column
    icon: React.ElementType
    colorClass: string
    bgClass: string
}

const COLUMNS: ColumnDef[] = [
    { id: 'col_new', title: 'Yeni / Bekliyor', statuses: ['pending', 'paid'], icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 ring-amber-100' },
    { id: 'col_prep', title: 'Hazırlanıyor', statuses: ['confirmed', 'processing'], icon: Package, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 ring-indigo-100' },
    { id: 'col_shipped', title: 'Kargoda', statuses: ['shipped'], icon: Truck, colorClass: 'text-sky-600', bgClass: 'bg-sky-50 ring-sky-100' },
    { id: 'col_done', title: 'Teslim Edildi', statuses: ['delivered', 'completed'], icon: CheckCircle2, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 ring-emerald-100' },
    { id: 'col_cancel', title: 'İptal / İade', statuses: ['cancelled', 'refunded', 'partial_refunded'], icon: XCircle, colorClass: 'text-rose-600', bgClass: 'bg-rose-50 ring-rose-100' },
]

export default function AdminOrdersBoard() {
    const { t, lang } = useI18n()
    const [orders, setOrders] = useState<AdminOrderRow[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('view_admin_orders')
                .select('id,status,user_id,total_amount,created_at,order_number,customer_name')
                .order('created_at', { ascending: false })
                .limit(200) // Kanban for recent orders

            if (error) throw error
            setOrders(data as AdminOrderRow[])
        } catch (err: any) {
            toast.error('Siparişler yüklenemedi: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Map orders to columns
    const getOrdersByCol = (colId: ColumnId) => {
        const colDef = COLUMNS.find(c => c.id === colId)
        if (!colDef) return []
        return orders.filter(o => colDef.statuses.includes(o.status || 'pending'))
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        // Dropped outside a list
        if (!destination) return
        // Unchanged position
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const sourceCol = COLUMNS.find(c => c.id === source.droppableId)
        const destCol = COLUMNS.find(c => c.id === destination.droppableId)

        if (!destCol || !sourceCol) return

        // Find the primary target status for the destination column
        const targetStatus = destCol.statuses[0]

        const targetOrder = orders.find(o => o.id === draggableId)
        if (!targetOrder || targetOrder.status === targetStatus) return

        const oldStatus = targetOrder.status

        // Optimistic UI Update
        setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: targetStatus } : o))

        try {
            // API call
            // Kanban board'da sürükle-bırak sonrası hızlı statü değişikliği için 
            // edge-function (şartlı tracking_number isteyen) yerine doğrudan db update yapıyoruz.
            // Detaylı kargo/iptal işlemi için tablo görünümündeki fonksiyonlar kullanılmalı.
            const res = await supabase.from('venthub_orders').update({ status: targetStatus }).eq('id', draggableId)
            let error = res.error

            // İptal veya İade sütununa çekildiyse venthub_returns tablosuna da yansıt (İadeler sayfasında görünsün)
            if (!error && (targetStatus === 'cancelled' || targetStatus === 'refunded')) {
                const { data: existingRet } = await supabase.from('venthub_returns').select('id').eq('order_id', draggableId).maybeSingle()

                if (!existingRet) {
                    await supabase.from('venthub_returns').insert({
                        order_id: draggableId,
                        user_id: targetOrder.user_id || '00000000-0000-0000-0000-000000000000', // anonymous fallback
                        reason: targetStatus === 'cancelled' ? 'Sipariş Kanban Üzerinden İptal Edildi' : 'Sipariş Kanban Üzerinden İade Edildi',
                        status: targetStatus === 'cancelled' ? 'cancelled' : 'refunded',
                    })
                } else {
                    await supabase.from('venthub_returns').update({ status: targetStatus }).eq('id', existingRet.id)
                }
            }

            if (error) throw error
            toast.success(`Sipariş durumu güncellendi: ${destCol.title}`)

        } catch (err: any) {
            // Revert Optimistic UI
            setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: oldStatus } : o))
            toast.error('Güncelleme başarısız: ' + err.message)
            fetchOrders() // Refresh state just in case
        }
    }

    if (loading && orders.length === 0) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Panoya Siparişler Yükleniyor...</div>
    }

    return (
        <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
            <header className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className={adminSectionTitleClass}>Sipariş Panosu</h1>
                    <p className="text-sm text-slate-500 mt-1">Siparişleri sürükleyerek durumlarını güncelleyin. Son 200 sipariş listeleniyor.</p>
                </div>
                <button onClick={fetchOrders} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Panoyu Yenile
                </button>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4 h-full flex-1 items-start snap-x">
                    {COLUMNS.map(col => {
                        const colOrders = getOrdersByCol(col.id)
                        const Icon = col.icon

                        return (
                            <div key={col.id} className="flex flex-col w-[320px] shrink-0 h-full max-h-full bg-slate-100/50 rounded-2xl border border-slate-200/60 snap-center overflow-hidden">
                                {/* Column Header */}
                                <div className={`p-4 border-b border-slate-200/60 flex items-center justify-between ${col.bgClass} ring-1 ring-inset`}>
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-5 h-5 ${col.colorClass}`} />
                                        <h2 className={`font-bold ${col.colorClass}`}>{col.title}</h2>
                                    </div>
                                    <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/50">
                                        {colOrders.length}
                                    </span>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                                        >
                                            {colOrders.map((order, index) => (
                                                <Draggable key={order.id} draggableId={order.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200/50 flex flex-col gap-3 transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-navy/20 cursor-grabbing' : 'hover:shadow-md cursor-grab'}`}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                                                                        <GripVertical className="w-3 h-3 opacity-50" />
                                                                        #{order.order_number || order.id.substring(0, 8)}
                                                                    </div>
                                                                    <h4 className="font-semibold text-slate-800 text-sm truncate">{order.customer_name || 'İsimsiz Müşteri'}</h4>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <div className="font-bold text-slate-700 text-sm">
                                                                        {formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-1 border-t border-slate-50 pt-3">
                                                                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                                    {formatDateTime(order.created_at, lang).split(' ')[0]}
                                                                </span>
                                                                {order.status !== col.statuses[0] && (
                                                                    <span className="text-[10px] text-slate-400 italic">({order.status})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}
