'use client'

import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, GripVertical, LucideIcon,Mail, MessageSquare, Package, RotateCcw, Truck, XCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useRef,useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { AdminModal } from '../../components/admin/overlay/AdminModal'
import { useRole } from '../../hooks/useRole'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { updateOrderStatus } from '../../lib/orderStatusService'
import {
    adminBgWhite3Class,
    adminButtonPrimaryClass,
    adminColumnContainerClass,
    adminInputClass,
    adminNoteItemClass,
    adminOrderBoardItemClass,
    adminOrderCardClass,
    adminStepperLineBgClass,
    adminStepperLineFillClass
} from '../../utils/adminUi'

// --- Constants ---
const HASH_SYMBOL = '#'
const OPEN_PAREN = '('
const CLOSE_PAREN = ')'

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
    icon: LucideIcon
    colorClass: string
    bgClass: string
    /** UI'dan DB'ye gönderilecek hedef statü */
    targetStatus: string
}

// Industrial Navy Colors
// Industrial Navy Colors - Moved inside component or made dynamic
interface ColumnDef {
    id: ColumnId
    title: string
    statuses: string[]
    icon: LucideIcon
    colorClass: string
    bgClass: string
    /** UI'dan DB'ye gönderilecek hedef statü */
    targetStatus: string
}

function getEffectiveStatus(order: AdminOrderRow): string {
    if (order.payment_status === 'refunded' || order.payment_status === 'partial_refunded') {
        return order.payment_status
    }
    return order.status || 'pending'
}

// --- Stepper Bileşeni ---
function OrderStepper({ status }: { status: string }) {
    const { t } = useI18n()
    const steps = [
        { key: 'pending', label: t('admin.orders.board.stepper.received') },
        { key: 'paid', label: t('admin.orders.board.stepper.paid') },
        { key: 'confirmed', label: t('admin.orders.board.stepper.prep') },
        { key: 'shipped', label: t('admin.orders.board.stepper.shipped') },
        { key: 'delivered', label: t('admin.orders.board.stepper.delivered') }
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
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-hvac-lg flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <XCircle size={14} /> {t('admin.orders.board.messages.cancelledOrRefunded')}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between relative mt-4 mb-6 px-2">
            <div className={adminStepperLineBgClass}></div>
            <div className={adminStepperLineFillClass} style={{ width: `${(Math.min(currentIndex, 4) / 4) * 80}%` }}></div>

            {steps.map((step, idx) => {
                const isPast = idx < currentIndex
                const isCurrent = idx === currentIndex

                return (
                    <div key={step.key} className="flex flex-col items-center gap-2 z-10 w-1/5 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors duration-500
                            ${isPast ? 'bg-cyan-500 text-white shadow-glow-md' :
                                isCurrent ? 'bg-white text-slate-900 ring-4 ring-cyan-500/20 scale-125' :
                                    'bg-white/5 text-slate-500 border border-white/10'}`}
                        >
                            {isPast ? <CheckCircle2 size={12} strokeWidth={3} /> : (idx + 1)}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest text-center transition-colors duration-500 ${isCurrent ? 'text-cyan-400' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
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
    const { t, lang } = useI18n()
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
            toast.error(t('admin.users.permissionsError'))
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
            toast.success(t('admin.orders.toasts.noteAddSuccess'))
        } catch {
            toast.error(t('admin.orders.toasts.noteAddFailed'))
        } finally {
            setSaving(false)
        }
    }

    /*
     * ÖLÜ ESC (D14) ONARIMI — 2026-08-15.
     *
     * Eski hâli: perde `<div role="presentation">` idi ve `onKeyDown` ORAYA bağlıydı.
     * `tabIndex` taşımayan bir `<div>` ODAK ALAMAZ; `keydown` odaklanmış öğeden
     * kabararak gelir → o handler HİÇBİR ZAMAN tetiklenmedi. Kodda "ESC destekli"
     * görünen ama gerçekte ölü bir yüzeydi ve hiçbir test bunu görmedi.
     *
     * ÇÖZÜM: yüzey `AdminModal`'a (Radix Dialog) taşındı. ESC artık Radix'in
     * `DismissableLayer`'ında BELGE seviyesinde dinleniyor — odak nerede olursa
     * olsun çalışır. Ayrıca beraberinde odak tuzağı, açılışta odak taşıma,
     * kapanışta odağın tetikleyiciye dönmesi ve gövde kaydırma kilidi de geliyor;
     * bunların hiçbiri elle yazılmış overlay'de yoktu (cetvel §4.8).
     */
    return (
        <AdminModal
            open
            onOpenChange={(next) => { if (!next) onClose() }}
            title={`${HASH_SYMBOL}${order.order_number || order.id.substring(0, 8)} · ${order.customer_name || t('common.none')}`}
            description={t('admin.orders.board.detail.description')}
            closeLabel={t('admin.orders.board.detail.close')}
        >
            <>
                    {loading ? (
                        <div className="p-10 flex flex-col items-center gap-4">
                            <div className="animate-spin w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-hvac-relaxed text-slate-500">{t('admin.common.loading')}</span>
                        </div>
                    ) : detail ? (
                        <>
                            <section>
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-4 ml-1">{t('admin.titles.movements')}</h4>
                                <OrderStepper status={getEffectiveStatus(order)} />
                            </section>

                            <section className={adminOrderCardClass}>
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-2">{t('admin.orders.orderDetails')}</h4>
                                <div className="space-y-3">
                                    {order.customer_email && <div className="flex items-center gap-3 text-xs text-slate-300"><Mail size={14} className="text-cyan-500" /> {order.customer_email}</div>}
                                    {order.customer_phone && <div className="flex items-center gap-3 text-xs text-slate-300"><ChevronRight size={14} className="text-cyan-500" /> {order.customer_phone}</div>}
                                    <div className="pt-2 flex items-baseline gap-2">
                                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('admin.common.total')}:</span>
                                        <span className="text-xl font-black text-white tracking-tight">{formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </section>

                            {(detail.carrier || detail.tracking_number) && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-3 ml-1">{t('admin.menu.logistics')}</h4>
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-hvac-lg flex justify-between items-center backdrop-blur-md">
                                        <div className="space-y-1">
                                            <div className="text-xs font-black text-blue-400 uppercase tracking-hvac-tight">{detail.carrier || '-'}</div>
                                            {detail.tracking_number && <div className="font-mono text-sm text-white font-black tracking-wider">{detail.tracking_number}</div>}
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Truck size={24} />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-2 ml-1 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-indigo-400" /> {t('admin.orders.actions.notes')} {OPEN_PAREN}{detail.notes.length}{CLOSE_PAREN}
                                </h4>
                                <div className="space-y-3">
                                    {detail.notes.map(n => (
                                        <div key={n.id} className={adminNoteItemClass}>
                                            <div className="text-xs text-slate-200 font-medium leading-relaxed">{n.note}</div>
                                            <div className="text-xs text-slate-500 mt-2 font-black uppercase tracking-hvac-normal">{formatDateTime(n.created_at, lang)}</div>
                                        </div>
                                    ))}
                                    {detail.notes.length === 0 && <div className="text-xs text-slate-600 font-black uppercase tracking-hvac-normal text-center py-6 italic">{t('admin.orders.modals.notes.noRecords')}</div>}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <input
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addNote()}
                                        placeholder={t('admin.orders.modals.notes.inputPlaceholder')}
                                        className={`${adminInputClass} h-10`}
                                    />
                                    <button 
                                        onClick={addNote} 
                                        disabled={saving || !hasWriteAccess} 
                                        className={`${adminButtonPrimaryClass} !px-6 !h-10`}
                                    >
                                        {t('admin.orders.modals.notes.add')}
                                    </button>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-2 ml-1 flex items-center gap-2">
                                    <Mail size={14} className="text-amber-400" /> {t('admin.orders.modals.logs.title')} {OPEN_PAREN}{detail.emailLogs.length}{CLOSE_PAREN}
                                </h4>
                                <div className="space-y-2">
                                    {detail.emailLogs.map((l, i) => (
                                        <div key={i} className="p-4 bg-amber-400/5 rounded-2xl border border-amber-400/10 flex items-center justify-between group">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-amber-200 font-bold">{l.subject}</div>
                                                <div className="text-xs text-amber-400/40 font-black uppercase tracking-widest">{formatDateTime(l.created_at, lang)}</div>
                                            </div>
                                            <CheckCircle2 size={14} className="text-amber-400/20" />
                                        </div>
                                    ))}
                                    {detail.emailLogs.length === 0 && <div className="text-xs text-slate-600 font-black uppercase tracking-hvac-normal text-center py-6 italic">{t('admin.orders.modals.logs.noRecords')}</div>}
                                </div>
                            </section>
                        </>
                    ) : null}
            </>
        </AdminModal>
    )
}

// --- Ana Board Bileşeni ---
export default function AdminOrdersBoard() {
    const pathname = usePathname()
    const { t, lang } = useI18n()
    const { canWrite } = useRole()
    const hasWriteAccess = canWrite('orders')
    const [orders, setOrders] = useState<AdminOrderRow[]>([])
    const [totalCount, setTotalCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null)
    const [expandedCol, setExpandedCol] = useState<ColumnId | null>('col_new')
    const scrollRef = useRef<HTMLDivElement>(null)

    const COLUMNS: ColumnDef[] = React.useMemo(() => [
        { id: 'col_new', title: t('admin.orders.board.columns.new'), statuses: ['pending', 'paid'], icon: Clock, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 ring-amber-500/20', targetStatus: 'pending' },
        { id: 'col_prep', title: t('admin.orders.board.columns.prep'), statuses: ['confirmed', 'processing'], icon: Package, colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10 ring-cyan-500/20', targetStatus: 'confirmed' },
        { id: 'col_shipped', title: t('admin.orders.board.columns.shipped'), statuses: ['shipped'], icon: Truck, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 ring-blue-500/20', targetStatus: 'shipped' },
        { id: 'col_done', title: t('admin.orders.board.columns.done'), statuses: ['delivered', 'completed'], icon: CheckCircle2, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 ring-emerald-500/20', targetStatus: 'delivered' },
        { id: 'col_cancel', title: t('admin.orders.board.columns.cancel'), statuses: ['cancelled'], icon: XCircle, colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10 ring-rose-500/20', targetStatus: 'cancelled' },
        { id: 'col_refund', title: t('admin.orders.board.columns.refund'), statuses: ['refunded', 'partial_refunded'], icon: RotateCcw, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10 ring-orange-500/20', targetStatus: 'refunded' },
    ], [t])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            await ensureSessionFresh()
            const { data, error, count } = await supabase
                .from('view_admin_orders')
                .select('id,status,user_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone,payment_status', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(200)

            if (error) throw error
            setOrders(data as AdminOrderRow[])
            setTotalCount(count)
        } catch (err: unknown) {
            toast.error(t('admin.orders.toasts.loadError') + ': ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }, [t])
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders, pathname])

    const scrollBoard = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = 320 
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
            toast.error(t('admin.users.permissionsError'))
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
                ? t('admin.orders.board.messages.cancelledOrRefunded')
                : targetStatus === 'refunded'
                    ? t('admin.orders.board.messages.cancelledOrRefunded')
                    : undefined,
            auditComment: `kanban drag: ${oldStatus} → ${targetStatus}`,
        })

        if (res.ok) {
            toast.success(`${t('admin.orders.board.messages.updateSuccess')}: ${destCol.title}`)
        } else {
            setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: oldStatus } : o))
            toast.error(t('admin.orders.board.messages.updateError') + ': ' + (res.error || ''))
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
                            className="w-10 h-10 flex items-center justify-center glass border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-shadow shadow-sm"
                            title={t('admin.a11y.prev')}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollBoard('right')}
                            className="w-10 h-10 flex items-center justify-center glass border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-shadow shadow-sm"
                            title={t('admin.a11y.next')}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="px-6 h-10 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-hvac-normal text-slate-400 hover:text-white hover:bg-white/10 transition-opacity disabled:opacity-30"
                    >
                        {loading ? '...' : t('admin.ui.refresh')}
                    </button>
                </div>
            </div>

            {/* Limit Warning Banner */}
            {totalCount !== null && totalCount > orders.length && (
                <div className="mb-6 p-4 rounded-hvac-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 backdrop-blur-md shrink-0">
                    <Clock size={16} className="shrink-0" />
                    <div className="text-xs font-bold leading-normal">
                        {t('admin.orders.board.limitWarning', {
                            shown: String(orders.length),
                            total: String(totalCount),
                            remaining: String(totalCount - orders.length)
                        })}
                    </div>
                </div>
            )}

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
                            className={`flex items-center gap-3 px-5 py-4 rounded-hvac-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-transform border snap-start
                                ${isActive
                                    ? `bg-white text-slate-900 border-white shadow-white-glow-md z-10 scale-105 mx-1`
                                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                        >
                            <Icon size={16} />
                            {col.title}
                            <span className={`px-2 py-0.5 rounded-full text-xs ml-1 bg-white/10`}>
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
                    className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden pb-4 scroll-smooth custom-scrollbar content-auto-board"
                >
                    <div className="contents md:flex md:gap-6 md:min-w-max px-px">
                        {COLUMNS.map(col => {
                            const colOrders = getOrdersByCol(col.id)
                            const Icon = col.icon
                            const isExpanded = expandedCol === col.id

                            return (
                                <div key={col.id} className={`${adminColumnContainerClass} max-h-full ${!isExpanded ? 'h-auto md:h-full opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : `opacity-100 grayscale-0 shadow-2xl ${adminBgWhite3Class}`}`}>
                                    {/* Sütun Başlık */}
                                    <button
                                        className={`w-full text-left p-6 border-b border-white/5 flex items-center justify-between ${isExpanded ? `${col.bgClass} backdrop-blur-xl` : 'bg-transparent'} transition-colors cursor-pointer md:cursor-default`}
                                        onClick={() => setExpandedCol(isExpanded ? null : col.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl ${col.bgClass} flex items-center justify-center ${col.colorClass} border border-white/5`}>
                                                <Icon size={18} />
                                            </div>
                                            <h2 className={`font-black text-xs uppercase tracking-widest ${isExpanded ? 'text-white' : 'text-slate-500'}`}>{col.title}</h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-black text-white border border-white/10">
                                                {colOrders.length}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 md:hidden transition-transform text-slate-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    {/* Droppable */}
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 p-4 space-y-4 transition-colors custom-scrollbar ${snapshot.isDraggingOver ? 'bg-cyan-500/5' : ''} ${isExpanded ? 'block min-h-40' : 'hidden md:block min-h-20'}`}
                                                style={{ overflowY: 'auto' }}
                                            >
                                                {colOrders.map((order, index) => (
                                                    <Draggable key={order.id} draggableId={order.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => setSelectedOrder(order)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.stopPropagation()
                                                                        setSelectedOrder(order)
                                                                    }
                                                                }}
                                                                role="button"
                                                                tabIndex={0}
                                                                className={`p-5 rounded-hvac-xl border transition-colors duration-300 cursor-pointer group relative overflow-hidden
                                                                    ${snapshot.isDragging 
                                                                        ? 'bg-cyan-400 text-surface-deep border-cyan-300 shadow-admin-orders-board-glow scale-105 z-50' 
                                                                        : `${adminOrderBoardItemClass}`}`}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                {/* Accent Glow */}
                                                                {shardColor(getEffectiveStatus(order), snapshot.isDragging)}

                                                                <div className="flex items-start justify-between gap-3 relative z-10">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-hvac-normal mb-2 ${snapshot.isDragging ? 'text-surface-deep/60' : 'text-slate-500'}`}>
                                                                            <GripVertical size={12} className="opacity-30" />
                                                                            {HASH_SYMBOL}{order.order_number || order.id.substring(0, 8)}
                                                                        </div>
                                                                        <h4 className={`font-black uppercase tracking-tight text-xs truncate ${snapshot.isDragging ? 'text-surface-deep' : 'text-white'}`}>
                                                                            {order.customer_name || t('common.none')}
                                                                        </h4>
                                                                    </div>
                                                                    <div className={`font-black text-xs tracking-tight shrink-0 ${snapshot.isDragging ? 'text-surface-deep' : 'text-cyan-400'}`}>
                                                                        {formatCurrency(order.total_amount || 0, lang, { maximumFractionDigits: 0 })}
                                                                    </div>
                                                                </div>

                                                                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${snapshot.isDragging ? 'border-surface-deep/10' : 'border-white/5'} relative z-10`}>
                                                                    <span className={`text-xs font-black uppercase tracking-widest ${snapshot.isDragging ? 'text-surface-deep/40' : 'text-slate-500'}`}>
                                                                        {formatDateTime(order.created_at, lang).split(' ')[0]}
                                                                    </span>
                                                                    <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-hvac-normal ${snapshot.isDragging ? 'text-surface-deep' : 'text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity'}`}>
                                                                        {t('admin.ui.details')} <ChevronRight size={10} strokeWidth={3} />
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
