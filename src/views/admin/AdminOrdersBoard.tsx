import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { updateOrderStatus } from '../../lib/orderStatusService'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import {
    adminButtonPrimaryClass,
    adminInputClass
} from '../../utils/adminUi'
import { Clock, CheckCircle2, Package, Truck, XCircle, RotateCcw, GripVertical, X, MessageSquare, Mail, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import { useRole } from '../../hooks/useRole'
import AdminSkeleton from '../../components/admin/AdminSkeleton'

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

// Industrial Navy Colors
const COLUMNS: ColumnDef[] = [
    { id: 'col_new', title: 'Yeni / Bekliyor', statuses: ['pending', 'paid'], icon: Clock, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 ring-amber-500/20', targetStatus: 'pending' },
    { id: 'col_prep', title: 'Hazırlanıyor', statuses: ['confirmed', 'processing'], icon: Package, colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10 ring-cyan-500/20', targetStatus: 'confirmed' },
    { id: 'col_shipped', title: 'Kargoda', statuses: ['shipped'], icon: Truck, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 ring-blue-500/20', targetStatus: 'shipped' },
    { id: 'col_done', title: 'Teslim Edildi', statuses: ['delivered', 'completed'], icon: CheckCircle2, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 ring-emerald-500/20', targetStatus: 'delivered' },
    { id: 'col_cancel', title: 'İptal', statuses: ['cancelled'], icon: XCircle, colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10 ring-rose-500/20', targetStatus: 'cancelled' },
    { id: 'col_refund', title: 'İade', statuses: ['refunded', 'partial_refunded'], icon: RotateCcw, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10 ring-orange-500/20', targetStatus: 'refunded' },
]

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
        return 0 
    }

    const currentIndex = getStepIndex(status)
    const isCancelled = status === 'cancelled' || status === 'refunded' || status === 'partial_refunded'

    if (isCancelled) {
        return (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-[1.25rem] flex items-center gap-2 text-rose-400 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
                <XCircle size={14} /> Sipariş iptal veya iade edilmiş.
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between relative mt-4 mb-6 px-2">
            <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-white/5 -z-10 rounded-full"></div>
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-cyan-400 -z-10 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${(Math.min(currentIndex, 4) / 4) * 80}%` }}></div>

            {steps.map((step, idx) => {
                const isPast = idx < currentIndex
                const isCurrent = idx === currentIndex

                return (
                    <div key={step.key} className="flex flex-col items-center gap-2 z-10 w-1/5 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500
                            ${isPast ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' :
                                isCurrent ? 'bg-white text-slate-900 ring-4 ring-cyan-500/20 scale-125' :
                                    'bg-white/5 text-slate-500 border border-white/10'}`}
                        >
                            {isPast ? <CheckCircle2 size={12} strokeWidth={3} /> : (idx + 1)}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest text-center transition-colors duration-500 ${isCurrent ? 'text-cyan-400' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
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
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-xl flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="glass-strong border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">#{order.order_number || order.id.substring(0, 8)}</div>
                        <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">{order.customer_name || 'İsimsiz Müşteri'}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all ring-1 ring-white/10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-10 flex flex-col items-center gap-4">
                            <div className="animate-spin w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Yükleniyor...</span>
                        </div>
                    ) : detail ? (
                        <>
                            <section>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Sipariş Akışı</h4>
                                <OrderStepper status={getEffectiveStatus(order)} />
                            </section>

                            <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Müşteri Detayları</h4>
                                <div className="space-y-3">
                                    {order.customer_email && <div className="flex items-center gap-3 text-xs text-slate-300"><Mail size={14} className="text-cyan-500" /> {order.customer_email}</div>}
                                    {order.customer_phone && <div className="flex items-center gap-3 text-xs text-slate-300"><ChevronRight size={14} className="text-cyan-500" /> {order.customer_phone}</div>}
                                    <div className="pt-2 flex items-baseline gap-2">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">TOPLAM:</span>
                                        <span className="text-xl font-black text-white tracking-tight">{formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </section>

                            {(detail.carrier || detail.tracking_number) && (
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Lojistik</h4>
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-[1.5rem] flex justify-between items-center backdrop-blur-md">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.1em]">{detail.carrier || '-'}</div>
                                            {detail.tracking_number && <div className="font-mono text-sm text-white font-black tracking-wider">{detail.tracking_number}</div>}
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Truck size={24} />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-indigo-400" /> Notlar ({detail.notes.length})
                                </h4>
                                <div className="space-y-3">
                                    {detail.notes.map(n => (
                                        <div key={n.id} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                                            <div className="text-xs text-slate-200 font-medium leading-relaxed">{n.note}</div>
                                            <div className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em]">{formatDateTime(n.created_at, lang)}</div>
                                        </div>
                                    ))}
                                    {detail.notes.length === 0 && <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center py-6 italic">GİRİLMİŞ NOT YOK</div>}
                                </div>
                                 <div className="flex gap-3 mt-6">
                                    <input
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addNote()}
                                        placeholder="Hızlı not ekle..."
                                        className={adminInputClass}
                                    />
                                    <button 
                                        onClick={addNote} 
                                        disabled={saving || !hasWriteAccess} 
                                        className={`${adminButtonPrimaryClass} !px-5 !h-[42px]`}
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex items-center gap-2">
                                    <Mail size={14} className="text-amber-400" /> E-posta Arşivi ({detail.emailLogs.length})
                                </h4>
                                <div className="space-y-2">
                                    {detail.emailLogs.map((l, i) => (
                                        <div key={i} className="p-4 bg-amber-400/5 rounded-2xl border border-amber-400/10 flex items-center justify-between group">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[11px] text-amber-200 font-bold">{l.subject}</div>
                                                <div className="text-[9px] text-amber-400/40 font-black uppercase tracking-widest">{formatDateTime(l.created_at, lang)}</div>
                                            </div>
                                            <CheckCircle2 size={14} className="text-amber-400/20" />
                                        </div>
                                    ))}
                                    {detail.emailLogs.length === 0 && <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center py-6 italic">ARŞİV TEMİZ</div>}
                                </div>
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

    const scrollBoard = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = 340 
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        })
    }

    const getOrdersByCol = (colId: ColumnId) => {
        const colDef = COLUMNS.find(c => c.id === colId)
        if (!colDef) return []
        return orders.filter(o => colDef.statuses.includes(getEffectiveStatus(o)))
    }

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

        setOrders(prev => prev.map(o => {
            if (o.id !== draggableId) return o
            if (targetStatus === 'refunded') {
                return { ...o, status: 'cancelled', payment_status: 'refunded' }
            }
            return { ...o, status: targetStatus, payment_status: targetStatus === 'cancelled' ? o.payment_status : null }
        }))

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
            {/* Board Sub-Toolbar */}
            <div className="flex items-center justify-between mb-6 shrink-0 h-10">
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scrollBoard('left')}
                            className="w-10 h-10 flex items-center justify-center glass border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                            title="Sola kaydır"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollBoard('right')}
                            className="w-10 h-10 flex items-center justify-center glass border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                            title="Sağa kaydır"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="px-6 h-10 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                    >
                        {loading ? '...' : 'Pano Yenile'}
                    </button>
                </div>
            </div>

            {/* Mobile Tabs Switcher */}
            <div className="flex md:hidden overflow-x-auto gap-3 pb-4 mb-2 no-scrollbar -mx-1 px-1 shrink-0 snap-x">
                {COLUMNS.map(col => {
                    const Icon = col.icon
                    const isActive = expandedCol === col.id
                    const count = getOrdersByCol(col.id).length
                    return (
                        <button
                            key={col.id}
                            onClick={() => setExpandedCol(col.id)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border snap-start
                                ${isActive
                                    ? `bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] z-10 scale-105 mx-1`
                                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                        >
                            <Icon size={16} />
                            {col.title}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] ml-1 bg-white/10`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div
                    ref={scrollRef}
                    className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden pb-4 scroll-smooth custom-scrollbar"
                >
                    <div className="contents md:flex md:gap-6 md:min-w-max px-px">
                        {COLUMNS.map(col => {
                            const colOrders = getOrdersByCol(col.id)
                            const Icon = col.icon
                            const isExpanded = expandedCol === col.id

                            return (
                                <div key={col.id} className={`flex flex-col w-full md:w-[320px] shrink-0 glass-strong border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${!isExpanded ? 'h-auto md:h-full opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : 'opacity-100 grayscale-0 shadow-2xl bg-white/[0.03]'}`} style={{ maxHeight: '100%' }}>
                                    {/* Sütun Başlık */}
                                    <div
                                        className={`p-6 border-b border-white/5 flex items-center justify-between ${isExpanded ? `${col.bgClass} backdrop-blur-xl` : 'bg-transparent'} transition-colors cursor-pointer md:cursor-default`}
                                        onClick={() => setExpandedCol(isExpanded ? null : col.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl ${col.bgClass} flex items-center justify-center ${col.colorClass} border border-white/5`}>
                                                <Icon size={18} />
                                            </div>
                                            <h2 className={`font-black text-xs uppercase tracking-widest ${isExpanded ? 'text-white' : 'text-slate-500'}`}>{col.title}</h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10">
                                                {colOrders.length}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 md:hidden transition-transform text-slate-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Droppable */}
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 p-4 space-y-4 transition-all custom-scrollbar ${snapshot.isDraggingOver ? 'bg-cyan-500/5' : ''} ${isExpanded ? 'block' : 'hidden md:block'}`}
                                                style={{ overflowY: 'auto', minHeight: isExpanded ? 150 : 80 }}
                                            >
                                                {colOrders.map((order, index) => (
                                                    <Draggable key={order.id} draggableId={order.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => setSelectedOrder(order)}
                                                                className={`p-5 rounded-[1.75rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden
                                                                    ${snapshot.isDragging 
                                                                        ? 'bg-cyan-400 text-[#0A0F1E] border-cyan-300 shadow-[0_20px_60px_rgba(34,211,238,0.4)] scale-105 z-50' 
                                                                        : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06] shadow-sm'}`}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                {/* Accent Glow */}
                                                                {shardColor(getEffectiveStatus(order), snapshot.isDragging)}

                                                                <div className="flex items-start justify-between gap-3 relative z-10">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${snapshot.isDragging ? 'text-[#0A0F1E]/60' : 'text-slate-500'}`}>
                                                                            <GripVertical size={12} className="opacity-30" />
                                                                            #{order.order_number || order.id.substring(0, 8)}
                                                                        </div>
                                                                        <h4 className={`font-black uppercase tracking-tight text-xs truncate ${snapshot.isDragging ? 'text-[#0A0F1E]' : 'text-white'}`}>
                                                                            {order.customer_name || 'İsimsiz Müşteri'}
                                                                        </h4>
                                                                    </div>
                                                                    <div className={`font-black text-xs tracking-tight shrink-0 ${snapshot.isDragging ? 'text-[#0A0F1E]' : 'text-cyan-400'}`}>
                                                                        {formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}
                                                                    </div>
                                                                </div>

                                                                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${snapshot.isDragging ? 'border-[#0A0F1E]/10' : 'border-white/5'} relative z-10`}>
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${snapshot.isDragging ? 'text-[#0A0F1E]/40' : 'text-slate-500'}`}>
                                                                        {formatDateTime(order.created_at, lang).split(' ')[0]}
                                                                    </span>
                                                                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] ${snapshot.isDragging ? 'text-[#0A0F1E]' : 'text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity'}`}>
                                                                        DETAY <ChevronRight size={10} strokeWidth={3} />
                                                                    </div>
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

function shardColor(status: string, isDragging: boolean) {
    if (isDragging) return null
    const base = status.toLowerCase()
    let color = 'bg-slate-500/20'
    if (base === 'pending') color = 'bg-amber-500/20'
    else if (base === 'paid' || base === 'confirmed' || base === 'processing') color = 'bg-cyan-500/20'
    else if (base === 'shipped') color = 'bg-blue-500/20'
    else if (base === 'delivered' || base === 'completed') color = 'bg-emerald-500/20'
    else if (base === 'cancelled') color = 'bg-rose-500/20'
    else if (base === 'refunded' || base === 'partial_refunded') color = 'bg-orange-500/20'

    return (
        <div className={`absolute -right-4 -top-4 w-12 h-12 blur-2xl rounded-full ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    )
}
