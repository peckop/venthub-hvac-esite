import React, { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import { updateOrderStatus } from '../../lib/orderStatusService'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { adminSectionTitleClass } from '../../utils/adminUi'
import toast from 'react-hot-toast'
import { Clock, CheckCircle2, Package, Truck, XCircle, GripVertical, X, MessageSquare, Mail, ChevronRight } from 'lucide-react'

// --- Types ---
interface AdminOrderRow {
    id: string
    status: string
    user_id?: string | null
    total_amount?: number | null
    created_at: string
    customer_name?: string | null
    customer_email?: string | null
    customer_phone?: string | null
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

// --- Mini Detay Paneli ---
interface OrderDetail {
    notes: { id: string; note: string; created_at: string }[]
    emailLogs: { subject: string; created_at: string }[]
    carrier?: string | null
    tracking_number?: string | null
}

function MiniDetailPanel({ order, onClose }: { order: AdminOrderRow; onClose: () => void }) {
    const { lang } = useI18n()
    const [detail, setDetail] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [noteInput, setNoteInput] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const [notesRes, logsRes, orderRes] = await Promise.all([
                    supabase.from('order_notes').select('id,note,created_at').eq('order_id', order.id).order('created_at', { ascending: false }).limit(5),
                    supabase.from('shipping_email_events').select('subject,created_at').eq('order_id', order.id).order('created_at', { ascending: false }).limit(3),
                    supabase.from('venthub_orders').select('carrier,tracking_number').eq('id', order.id).maybeSingle(),
                ])
                if (mounted) {
                    setDetail({
                        notes: (notesRes.data || []) as OrderDetail['notes'],
                        emailLogs: (logsRes.data || []) as OrderDetail['emailLogs'],
                        carrier: (orderRes.data as { carrier?: string | null })?.carrier,
                        tracking_number: (orderRes.data as { tracking_number?: string | null })?.tracking_number,
                    })
                }
            } catch {
                // silent
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [order.id])

    const addNote = async () => {
        if (!noteInput.trim()) return
        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('order_notes')
                .insert({ order_id: order.id, note: noteInput.trim() })
                .select('id,note,created_at')
                .single()
            if (error) throw error
            setDetail(prev => prev ? { ...prev, notes: [data as OrderDetail['notes'][0], ...prev.notes] } : prev)
            setNoteInput('')
            toast.success('Not eklendi')
        } catch {
            toast.error('Not eklenemedi')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-1">#{order.order_number || order.id.substring(0, 8)}</div>
                        <h3 className="text-lg font-bold text-primary-navy">{order.customer_name || 'İsimsiz Müşteri'}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-primary-navy transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div>
                    ) : detail ? (
                        <>
                            {/* Müşteri Bilgileri */}
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Müşteri</h4>
                                <div className="text-sm text-slate-700 space-y-1">
                                    {order.customer_email && <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {order.customer_email}</div>}
                                    {order.customer_phone && <div className="flex items-center gap-2"><ChevronRight size={12} className="text-slate-400" /> {order.customer_phone}</div>}
                                    <div className="font-bold text-slate-800">{formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}</div>
                                </div>
                            </section>

                            {/* Kargo Bilgisi */}
                            {(detail.carrier || detail.tracking_number) && (
                                <section>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kargo</h4>
                                    <div className="text-sm bg-sky-50 p-3 rounded-lg border border-sky-100">
                                        <span className="font-bold text-sky-700">{detail.carrier || '-'}</span>
                                        {detail.tracking_number && <span className="ml-2 font-mono text-xs text-sky-600">{detail.tracking_number}</span>}
                                    </div>
                                </section>
                            )}

                            {/* Notlar */}
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Notlar ({detail.notes.length})
                                </h4>
                                <div className="space-y-2 mb-3">
                                    {detail.notes.map(n => (
                                        <div key={n.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <div className="text-slate-700 font-medium">{n.note}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.created_at, lang)}</div>
                                        </div>
                                    ))}
                                    {detail.notes.length === 0 && <div className="text-xs text-slate-400 italic">Henüz not yok</div>}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addNote()}
                                        placeholder="Hızlı not ekle..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
                                    />
                                    <button onClick={addNote} disabled={saving} className="px-3 py-2 bg-primary-navy text-white text-xs font-bold rounded-lg hover:bg-primary-navy/90 transition-colors disabled:opacity-50">
                                        Ekle
                                    </button>
                                </div>
                            </section>

                            {/* E-posta Logları */}
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Mail size={12} /> E-posta Logları ({detail.emailLogs.length})
                                </h4>
                                {detail.emailLogs.map((l, i) => (
                                    <div key={i} className="text-xs bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 mb-1.5">
                                        <div className="text-slate-700 font-medium">{l.subject}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{formatDateTime(l.created_at, lang)}</div>
                                    </div>
                                ))}
                                {detail.emailLogs.length === 0 && <div className="text-xs text-slate-400 italic">E-posta kaydı yok</div>}
                            </section>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

// --- Ana Board Bileşeni ---
export default function AdminOrdersBoard() {
    const { lang } = useI18n()
    const [orders, setOrders] = useState<AdminOrderRow[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('view_admin_orders')
                .select('id,status,user_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone')
                .order('created_at', { ascending: false })
                .limit(200)

            if (error) throw error
            setOrders(data as AdminOrderRow[])
        } catch (err: unknown) {
            toast.error('Siparişler yüklenemedi: ' + (err as Error).message)
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

    // --- Sürükle-bırak onay/seçim popup state'i ---
    const [pendingDrop, setPendingDrop] = useState<{
        orderId: string
        oldStatus: string
        destCol: ColumnDef
        order: AdminOrderRow
        needsChoice: boolean // İptal/İade seçimi gerekiyor mu?
    } | null>(null)

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const destCol = COLUMNS.find(c => c.id === destination.droppableId)
        if (!destCol) return

        const targetOrder = orders.find(o => o.id === draggableId)
        if (!targetOrder) return

        const targetStatus = destCol.statuses[0]
        if (targetOrder.status === targetStatus) return

        // İptal/İade sütununa bırakıldıysa → "İptal mi? İade mi?" seçtir
        // Diğer sütunlara bırakıldıysa → onay iste
        setPendingDrop({
            orderId: draggableId,
            oldStatus: targetOrder.status,
            destCol,
            order: targetOrder,
            needsChoice: destCol.id === 'col_cancel',
        })
    }

    const executeDrop = async (finalStatus: string) => {
        if (!pendingDrop) return
        const { orderId, oldStatus, destCol, order } = pendingDrop
        setPendingDrop(null)

        // Optimistic UI
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: finalStatus } : o))

        const res = await updateOrderStatus({
            orderId,
            newStatus: finalStatus,
            oldStatus,
            userId: order.user_id,
            reason: finalStatus === 'cancelled'
                ? 'Sipariş Kanban Üzerinden İptal Edildi'
                : finalStatus === 'refunded'
                    ? 'Sipariş Kanban Üzerinden İade Edildi'
                    : undefined,
            auditComment: `kanban drag: ${oldStatus} → ${finalStatus}`,
        })

        if (res.ok) {
            toast.success(`Sipariş durumu güncellendi: ${destCol.title}`)
        } else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: oldStatus } : o))
            toast.error('Güncelleme başarısız: ' + (res.error || ''))
            fetchOrders()
        }
    }

    const cancelDrop = () => setPendingDrop(null)

    if (loading && orders.length === 0) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Panoya Siparişler Yükleniyor...</div>
    }

    return (
        <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
            <header className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className={adminSectionTitleClass}>Sipariş Panosu</h1>
                    <p className="text-sm text-slate-500 mt-1">Siparişleri sürükleyerek durumlarını güncelleyin. Karta tıklayarak detay görün. Son 200 sipariş.</p>
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
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200/50 flex flex-col gap-3 transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-navy/20 cursor-grabbing' : 'hover:shadow-md hover:border-primary-navy/20'}`}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                                                                        <GripVertical className="w-3 h-3 opacity-50" />
                                                                        #{order.order_number || order.id.substring(0, 8)}
                                                                    </div>
                                                                    <h4 className="font-semibold text-slate-800 text-sm truncate">{order.customer_name || 'İsimsiz Müşteri'}</h4>
                                                                    {order.customer_email && (
                                                                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{order.customer_email}</div>
                                                                    )}
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
                                                                <span className="text-[10px] text-primary-navy/60 font-medium">Detay için tıkla →</span>
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

            {/* Mini Detay Paneli */}
            {selectedOrder && (
                <MiniDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}

            {/* Sürükle-bırak Onay / İptal-İade Seçim Popup'ı */}
            {pendingDrop && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={cancelDrop}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-primary-navy">
                                {pendingDrop.needsChoice ? 'İptal mi, İade mi?' : 'Durumu Değiştir'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                <span className="font-bold">#{pendingDrop.order.order_number || pendingDrop.orderId.substring(0, 8)}</span>
                                {' — '}
                                {pendingDrop.order.customer_name || 'İsimsiz Müşteri'}
                            </p>
                        </div>

                        <div className="p-5 space-y-3">
                            {pendingDrop.needsChoice ? (
                                <>
                                    <p className="text-sm text-slate-600 mb-3">Bu siparişi hangi duruma taşımak istiyorsunuz?</p>
                                    <button
                                        onClick={() => executeDrop('cancelled')}
                                        className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm rounded-xl border border-rose-200 transition-colors flex items-center gap-3"
                                    >
                                        <XCircle size={18} />
                                        <div className="text-left">
                                            <div>İptal Et</div>
                                            <div className="text-[10px] text-rose-500 font-medium">Sipariş tamamen iptal edilir</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => executeDrop('refunded')}
                                        className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm rounded-xl border border-amber-200 transition-colors flex items-center gap-3"
                                    >
                                        <Package size={18} />
                                        <div className="text-left">
                                            <div>İade Et</div>
                                            <div className="text-[10px] text-amber-500 font-medium">Ürün iadesi ve geri ödeme başlatılır</div>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600">
                                        Bu siparişin durumunu <span className="font-bold text-slate-800">&quot;{pendingDrop.destCol.title}&quot;</span> olarak değiştirmek istediğinize emin misiniz?
                                    </p>
                                    <button
                                        onClick={() => executeDrop(pendingDrop.destCol.statuses[0])}
                                        className="w-full px-4 py-3 bg-primary-navy hover:bg-primary-navy/90 text-white font-bold text-sm rounded-xl transition-colors"
                                    >
                                        Evet, Değiştir
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
                            <button onClick={cancelDrop} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-all">
                                Vazgeç
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
