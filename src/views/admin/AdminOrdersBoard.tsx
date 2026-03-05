import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { updateOrderStatus } from '../../lib/orderStatusService'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { adminSectionTitleClass } from '../../utils/adminUi'
import toast from 'react-hot-toast'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { Clock, CheckCircle2, Package, Truck, XCircle, RotateCcw, GripVertical, X, MessageSquare, Mail, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import { useRole } from '../../hooks/useRole'

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
    payment_status?: string | null
}

type ColumnId = 'col_new' | 'col_prep' | 'col_shipped' | 'col_done' | 'col_cancel' | 'col_refund'

interface ColumnDef {
    id: ColumnId
    title: string
    statuses: string[]
    icon: React.ElementType
    colorClass: string
    bgClass: string
    /** UI'dan DB'ye gönderilecek hedef statü */
    targetStatus: string
}

// İptal ve İade ayrı sütunlar
const COLUMNS: ColumnDef[] = [
    { id: 'col_new', title: 'Yeni / Bekliyor', statuses: ['pending', 'paid'], icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 ring-amber-100', targetStatus: 'pending' },
    { id: 'col_prep', title: 'Hazırlanıyor', statuses: ['confirmed', 'processing'], icon: Package, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 ring-indigo-100', targetStatus: 'confirmed' },
    { id: 'col_shipped', title: 'Kargoda', statuses: ['shipped'], icon: Truck, colorClass: 'text-sky-600', bgClass: 'bg-sky-50 ring-sky-100', targetStatus: 'shipped' },
    { id: 'col_done', title: 'Teslim Edildi', statuses: ['delivered', 'completed'], icon: CheckCircle2, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 ring-emerald-100', targetStatus: 'delivered' },
    { id: 'col_cancel', title: 'İptal', statuses: ['cancelled'], icon: XCircle, colorClass: 'text-rose-600', bgClass: 'bg-rose-50 ring-rose-100', targetStatus: 'cancelled' },
    { id: 'col_refund', title: 'İade', statuses: ['refunded', 'partial_refunded'], icon: RotateCcw, colorClass: 'text-orange-600', bgClass: 'bg-orange-50 ring-orange-100', targetStatus: 'refunded' },
]

/**
 * Sipariş satırının hangi sütuna ait olduğunu belirler.
 * payment_status "refunded" veya "partial_refunded" ise → İade sütunu
 * status "cancelled" ise → İptal sütunu
 */
function getEffectiveStatus(order: AdminOrderRow): string {
    if (order.payment_status === 'refunded' || order.payment_status === 'partial_refunded') {
        return order.payment_status
    }
    return order.status || 'pending'
}

// --- Stepper Bileşeni ---
function OrderStepper({ status }: { status: string }) {
    const steps = [
        { key: 'pending', label: 'Alındı' },
        { key: 'paid', label: 'Ödendi' },
        { key: 'confirmed', label: 'Hazırlanıyor' },
        { key: 'shipped', label: 'Kargoda' },
        { key: 'delivered', label: 'Teslim' }
    ]

    const getStepIndex = (s: string) => {
        if (s === 'completed' || s === 'delivered') return 4
        if (s === 'shipped') return 3
        if (s === 'confirmed' || s === 'processing') return 2
        if (s === 'paid') return 1
        return 0 // pending
    }

    const currentIndex = getStepIndex(status)
    const isCancelled = status === 'cancelled' || status === 'refunded' || status === 'partial_refunded'

    if (isCancelled) {
        return (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-bold">
                <XCircle size={16} /> Sipariş iptal veya iade edilmiş.
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between relative mt-2 mb-4">
            <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10"></div>
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-primary-navy -z-10 transition-all duration-500" style={{ width: `${(Math.min(currentIndex, 4) / 4) * 80}%` }}></div>

            {steps.map((step, idx) => {
                const isPast = idx < currentIndex
                const isCurrent = idx === currentIndex
                const isFuture = idx > currentIndex

                return (
                    <div key={step.key} className="flex flex-col items-center gap-1.5 z-10 w-1/5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white transition-all
                            ${isPast ? 'bg-primary-navy text-white' :
                                isCurrent ? 'bg-primary-navy text-white ring-primary-navy/20 scale-125' :
                                    'bg-slate-200 text-slate-400'}`}
                        >
                            {isPast ? <CheckCircle2 size={12} strokeWidth={3} /> : (idx + 1)}
                        </div>
                        <span className={`text-[10px] font-bold text-center ${isCurrent ? 'text-primary-navy' : isPast ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// --- Mini Detay Paneli ---
interface OrderDetail {
    notes: { id: string; note: string; created_at: string }[]
    emailLogs: { subject: string; created_at: string }[]
    carrier?: string | null
    tracking_number?: string | null
}

function MiniDetailPanel({ order, onClose, hasWriteAccess }: { order: AdminOrderRow; onClose: () => void; hasWriteAccess: boolean }) {
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
                // Proaktif oturum kontrolü
                await ensureSessionFresh()
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
        if (!hasWriteAccess) {
            toast.error('Not eklemek için yetkiniz yok.')
            return
        }
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
                        <AdminSkeleton variant="form" fields={3} />
                    ) : detail ? (
                        <>
                            {/* Durum Takibi */}
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Durum Takibi</h4>
                                <OrderStepper status={getEffectiveStatus(order)} />
                            </section>

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
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kargo Bilgileri</h4>
                                    <div className="text-sm bg-sky-50 p-3 rounded-lg border border-sky-100 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-sky-700">{detail.carrier || '-'}</span>
                                            {detail.tracking_number && <span className="ml-2 font-mono text-xs text-sky-600">{detail.tracking_number}</span>}
                                        </div>
                                        <Truck className="text-sky-400 w-5 h-5" />
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
                                    <button onClick={addNote} disabled={saving || !hasWriteAccess} className="px-3 py-2 bg-primary-navy text-white text-xs font-bold rounded-lg hover:bg-primary-navy/90 transition-colors disabled:opacity-50">
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
    const pathname = usePathname()
    const { lang } = useI18n()
    const { canWrite } = useRole()
    const hasWriteAccess = canWrite('orders')
    const [orders, setOrders] = useState<AdminOrderRow[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null)
    const [expandedCol, setExpandedCol] = useState<ColumnId | null>('col_new')
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            // Proaktif oturum kontrolü
            await ensureSessionFresh()

            const { data, error } = await supabase
                .from('view_admin_orders')
                .select('id,status,user_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone,payment_status')
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
    }, [fetchOrders, pathname])

    // Yatay scroll butonları
    const scrollBoard = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = 340 // bir sütun genişliği kadar
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        })
    }

    // Siparişleri sütunlara eşle (payment_status da dikkate alınır)
    const getOrdersByCol = (colId: ColumnId) => {
        const colDef = COLUMNS.find(c => c.id === colId)
        if (!colDef) return []
        return orders.filter(o => colDef.statuses.includes(getEffectiveStatus(o)))
    }

    // Sürükle-bırak: Anında uygula, popup yok, sadece toast bildirimi
    const onDragEnd = async (result: DropResult) => {
        if (!hasWriteAccess) {
            toast.error('Durum değiştirmek için yetkiniz yok.')
            return
        }
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const destCol = COLUMNS.find(c => c.id === destination.droppableId)
        if (!destCol) return

        const targetOrder = orders.find(o => o.id === draggableId)
        if (!targetOrder) return

        const targetStatus = destCol.targetStatus
        const effectiveCurrent = getEffectiveStatus(targetOrder)
        if (effectiveCurrent === targetStatus) return

        const oldStatus = targetOrder.status

        // Optimistic UI: hemen görsel güncelleme
        setOrders(prev => prev.map(o => {
            if (o.id !== draggableId) return o
            // İade sütununa taşınıyorsa payment_status da güncelle
            if (targetStatus === 'refunded') {
                return { ...o, status: 'cancelled', payment_status: 'refunded' }
            }
            return { ...o, status: targetStatus, payment_status: targetStatus === 'cancelled' ? o.payment_status : null }
        }))

        // Merkezi servis üzerinden güncelle
        const res = await updateOrderStatus({
            orderId: draggableId,
            newStatus: targetStatus,
            oldStatus,
            userId: targetOrder.user_id,
            reason: targetStatus === 'cancelled'
                ? 'Sipariş Kanban Üzerinden İptal Edildi'
                : targetStatus === 'refunded'
                    ? 'Sipariş Kanban Üzerinden İade Edildi'
                    : undefined,
            auditComment: `kanban drag: ${oldStatus} → ${targetStatus}`,
        })

        if (res.ok) {
            toast.success(`Sipariş durumu güncellendi: ${destCol.title}`)
        } else {
            // Revert
            setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: oldStatus } : o))
            toast.error('Güncelleme başarısız: ' + (res.error || ''))
            fetchOrders()
        }
    }

    if (loading && orders.length === 0) {
        return (
            <div className="p-6">
                <AdminSkeleton variant="cards" count={8} />
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Board Sub-Toolbar (Scroll & Refresh) */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scrollBoard('left')}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary-navy transition-colors shadow-sm"
                            title="Sola kaydır"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => scrollBoard('right')}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary-navy transition-colors shadow-sm"
                            title="Sağa kaydır"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {loading ? '...' : 'Yenile'}
                    </button>
                </div>
            </div>

            {/* Mobile Tabs Switcher */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-2 mb-1 no-scrollbar -mx-1 px-1 shrink-0 snap-x">
                {COLUMNS.map(col => {
                    const Icon = col.icon
                    const isActive = expandedCol === col.id
                    const count = getOrdersByCol(col.id).length
                    return (
                        <button
                            key={col.id}
                            onClick={() => setExpandedCol(col.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border snap-start
                                ${isActive
                                    ? `${col.bgClass} ${col.colorClass} border-current ring-2 ring-inset ring-current/10 shadow-sm z-10 scale-105 mx-1`
                                    : 'bg-white text-slate-400 border-slate-200/60 hover:border-slate-300 shadow-sm'}`}
                        >
                            <Icon size={14} />
                            {col.title}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1 ${isActive ? 'bg-white/40' : 'bg-slate-100 shadow-inner'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Board — tek scroll katmanı, nested scroll yok */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div
                    ref={scrollRef}
                    className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden pb-2 scroll-smooth"
                >
                    <div className="contents md:flex md:gap-4 md:min-w-max">
                        {COLUMNS.map(col => {
                            const colOrders = getOrdersByCol(col.id)
                            const Icon = col.icon
                            const isExpanded = expandedCol === col.id

                            return (
                                <div key={col.id} className={`flex flex-col w-full md:w-[280px] shrink-0 bg-slate-100/50 rounded-2xl border border-slate-200/60 snap-center ${!isExpanded ? 'h-auto md:h-full' : ''}`} style={{ maxHeight: '100%' }}>
                                    {/* Sütun Başlık */}
                                    <div
                                        className={`p-3 border-b border-slate-200/60 flex items-center justify-between ${col.bgClass} ring-1 ring-inset ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl md:rounded-t-2xl'} cursor-pointer md:cursor-default`}
                                        onClick={() => setExpandedCol(isExpanded ? null : col.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${col.colorClass}`} />
                                            <h2 className={`font-bold text-sm ${col.colorClass}`}>{col.title}</h2>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/50">
                                                {colOrders.length}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 md:hidden transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Droppable — overflow-y-auto SADECE burada (tek scroll parent) */}
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''} ${isExpanded ? 'block' : 'hidden md:block'}`}
                                                style={{ overflowY: 'auto', minHeight: isExpanded ? 120 : 60 }}
                                            >
                                                {colOrders.map((order, index) => (
                                                    <Draggable key={order.id} draggableId={order.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => setSelectedOrder(order)}
                                                                className={`bg-white p-3 rounded-xl shadow-sm border border-slate-200/50 flex flex-col gap-2 transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-navy/20 cursor-grabbing' : 'hover:shadow-md hover:border-primary-navy/20'}`}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-0.5">
                                                                            <GripVertical className="w-3 h-3 opacity-50" />
                                                                            #{order.order_number || order.id.substring(0, 8)}
                                                                        </div>
                                                                        <h4 className="font-semibold text-slate-800 text-xs truncate">{order.customer_name || 'İsimsiz Müşteri'}</h4>
                                                                    </div>
                                                                    <div className="font-bold text-slate-700 text-xs shrink-0">
                                                                        {formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                        {formatDateTime(order.created_at, lang).split(' ')[0]}
                                                                    </span>
                                                                    <span className="text-[9px] text-primary-navy/50 font-medium">detay →</span>
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
                </div>
            </DragDropContext>

            {/* Mini Detay Paneli */}
            {selectedOrder && <MiniDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} hasWriteAccess={hasWriteAccess} />}
        </div>
    )
}
