import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { ShoppingBag, Box, Bell, X, Check, Activity, Clock } from 'lucide-react'
import { formatDateTime } from '../../i18n/datetime'

interface AppNotification {
    id: string
    type: 'order' | 'stock' | 'system'
    title: string
    message: string
    timestamp: string
    isRead: boolean
    link?: string
}

const AdminRealtimeNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Initial fetch of recent activity
    useEffect(() => {
        let active = true
        async function fetchRecentActivity() {
            try {
                // Fetch recent orders
                const { data: oData } = await supabase
                    .from('venthub_orders')
                    .select('id, total_amount, created_at, order_number')
                    .order('created_at', { ascending: false })
                    .limit(5)

                // Fetch recent stock movements with product details
                const { data: sData } = await supabase
                    .from('inventory_movements')
                    .select('id, delta, reason, created_at, products!product_id(name, sku)')
                    .order('created_at', { ascending: false })
                    .limit(5)

                const combined: AppNotification[] = []

                if (oData) {
                    oData.forEach(o => {
                        combined.push({
                            id: `order_${o.id}`,
                            type: 'order',
                            title: 'Yeni Sipariş',
                            message: `₺${o.total_amount} tutarında sipariş alındı.`,
                            timestamp: o.created_at,
                            isRead: true, // past ones are considered read
                            link: `/admin/orders?q=${o.order_number || o.id}`
                        })
                    })
                }

                if (sData) {
                    sData.forEach((s: Record<string, unknown>) => {
                        const products = s.products as Record<string, unknown> | null
                        const pName = products?.name || 'Bilinmeyen Ürün'
                        const pSku = products?.sku || ''
                        const delta = Number(s.delta || 0)
                        const movementType = delta > 0 ? 'Giriş' : 'Çıkış'
                        const absQty = Math.abs(delta)

                        combined.push({
                            id: `stock_${String(s.id)}`,
                            type: 'stock',
                            title: 'Stok Hareketi',
                            message: `${String(pName)} için ${movementType}: ${absQty} Adet`,
                            timestamp: s.created_at as string,
                            isRead: true,
                            link: pSku ? `/admin/products?q=${String(pSku)}` : `/admin/products`
                        })
                    })
                }

                combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                if (active) {
                    setNotifications(combined.slice(0, 10))
                }
            } catch (err) {
                console.error("Failed to fetch notification history", err)
            }
        }

        // Sadece client'ta çalıştır
        if (typeof window !== 'undefined') {
            fetchRecentActivity()
        }

        return () => { active = false }
    }, [])

    // Realtime subscriptions
    useEffect(() => {
        // 1. Sipariş Kanalı
        const ordersChannel = supabase
            .channel('admin-orders-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'venthub_orders' },
                (payload) => {
                    const newOrder = payload.new as Record<string, unknown>
                    const totalAmt = Number(newOrder.total_amount || 0)
                    const amt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmt)

                    const orderId = String(newOrder.id || '')
                    const orderNumber = newOrder.order_number ? String(newOrder.order_number) : orderId.slice(0, 8)

                    const notif: AppNotification = {
                        id: `order_rt_${orderId}`,
                        type: 'order',
                        title: '🚀 Yeni Sipariş Alındı!',
                        message: `Sipariş No: #${orderNumber} - Tutar: ${amt}`,
                        timestamp: (newOrder.created_at as string) || new Date().toISOString(),
                        isRead: false,
                        link: `/admin/orders?q=${orderNumber}`
                    }

                    // Add to dropdown
                    setNotifications(prev => [notif, ...prev].slice(0, 20))
                    setUnreadCount(prev => prev + 1)

                    // Show Toast
                    toast.custom((t) => (
                        <div
                            onClick={() => {
                                toast.dismiss(t.id)
                                if (notif.link) router.push(notif.link as import('next').Route)
                            }}
                            className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-primary-navy cursor-pointer hover:bg-slate-50 transition-colors`}
                        >
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-primary-navy" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                <p className="mt-1 text-sm text-slate-500">{notif.message}</p>
                            </div>
                        </div>
                    ), { duration: 6000, position: 'top-right' })
                }
            )
            .subscribe()

        // 2. Stok Hareketi Kanalı
        const stockChannel = supabase
            .channel('admin-stock-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inventory_movements' },
                (payload) => {
                    const m = payload.new as Record<string, unknown>
                    const delta = Number(m.delta || 0)
                    const movementType = delta > 0 ? 'Giriş' : 'Çıkış'
                    const absQty = Math.abs(delta)

                    const notif: AppNotification = {
                        id: `stock_rt_${String(m.id)}`,
                        type: 'stock',
                        title: '📦 Stok Güncellendi',
                        message: `${movementType}: ${absQty} Adet (${String(m.reason || 'Sistem')})`,
                        timestamp: (m.created_at as string) || new Date().toISOString(),
                        isRead: false,
                        link: `/admin/products` // Default products page for RT stock, ideally we'd fetch SKU here but payload doesn't have it
                    }

                    setNotifications(prev => [notif, ...prev].slice(0, 20))
                    setUnreadCount(prev => prev + 1)

                    toast.custom((t) => (
                        <div
                            onClick={() => {
                                toast.dismiss(t.id)
                                if (notif.link) router.push(notif.link as import('next').Route)
                            }}
                            className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-emerald-500 cursor-pointer hover:bg-slate-50 transition-colors`}
                        >
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Box size={20} className="text-emerald-600" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                <p className="mt-1 text-sm text-slate-500">{notif.message}</p>
                            </div>
                        </div>
                    ), { duration: 4000, position: 'top-right' })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(ordersChannel)
            supabase.removeChannel(stockChannel)
        }
    }, [router])

    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
        if (!isOpen && unreadCount > 0) {
            // Mark all as read when opening
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        }
    }

    const clearAll = () => {
        setNotifications([])
        setUnreadCount(0)
    }

    const IconForType = ({ type }: { type: string }) => {
        if (type === 'order') return <div className="p-2 rounded-full bg-primary-navy/10 text-primary-navy"><ShoppingBag size={16} /></div>
        if (type === 'stock') return <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600"><Box size={16} /></div>
        return <div className="p-2 rounded-full bg-slate-500/10 text-slate-600"><Activity size={16} /></div>
    }

    return (
        <div className="relative z-50" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={toggleDropdown}
                className="relative p-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow hover:bg-slate-50 transition-all text-slate-600 hover:text-primary-navy"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/30 animate-pulse"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transform origin-top-right transition-all animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            Bildirim Merkezi
                            {unreadCount > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} Yeni</span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="text-[11px] font-medium text-slate-500 hover:text-primary-navy transition-colors">
                                    Tümünü Temizle
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[70vh] overflow-y-auto w-full">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-3">
                                    <Check size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">Tümü okundu</p>
                                <p className="text-xs text-slate-400 mt-1">Yeni bir aktivite bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            if (notif.link) {
                                                setIsOpen(false)
                                                router.push(notif.link as import('next').Route)
                                            }
                                        }}
                                        className={`p-4 border-b border-slate-100/50 hover:bg-slate-50/80 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''} ${notif.link ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            <IconForType type={notif.type} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm tracking-tight ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                                                <Clock size={10} />
                                                {formatDateTime(notif.timestamp, 'tr')}
                                            </div>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-primary-navy" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="bg-slate-50/80 p-3 text-center border-t border-slate-100">
                            <span className="text-xs font-medium text-slate-500">Sadece son 20 bildirim gösterilir.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminRealtimeNotifications
