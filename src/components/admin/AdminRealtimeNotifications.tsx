'use client';

import { Activity, AlertTriangle, Bell, Box, Bug, Check, Clock, RefreshCw, ShoppingBag, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useRole } from '@/hooks/useRole'
import { fetchInboxCounts, InboxCounts } from '@/lib/admin/inboxCounts'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useTenant } from '../../hooks/useTenant'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'

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
    const { id: tenantId } = useTenant()
    const { t, lang } = useI18n()
    const { canWrite } = useRole()
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const [inboxCounts, setInboxCounts] = useState<InboxCounts>({
        pendingReturnsCount: 0,
        pendingShipmentsCount: 0,
        lowStockAlarmsCount: 0,
        unresolvedErrorsCount: 0
    })

    const loadInboxCounts = React.useCallback(async () => {
        const hasAnyAccess = 
            canWrite('returns') || 
            canWrite('orders') || 
            canWrite('inventory') || 
            canWrite('error_groups')

        if (!hasAnyAccess) return

        try {
            const counts = await fetchInboxCounts(supabase)
            setInboxCounts(counts)
        } catch (err) {
            console.error("Failed to fetch inbox counts", err)
        }
    }, [canWrite])

    // Fetch inbox counts on mount, when open transitions to true, and periodically
    useEffect(() => {
        loadInboxCounts()
    }, [loadInboxCounts])

    useEffect(() => {
        if (isOpen) {
            loadInboxCounts()
        }
    }, [isOpen, loadInboxCounts])

    useEffect(() => {
        const interval = setInterval(() => {
            loadInboxCounts()
        }, 30000)
        return () => clearInterval(interval)
    }, [loadInboxCounts])

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close dropdown on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

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
                        const formattedAmount = formatCurrency(o.total_amount || 0, lang, { currency: 'TRY' })
                        combined.push({
                            id: `order_${o.id}`,
                            type: 'order',
                            title: t('admin.dashboard.newOrder'),
                            message: t('admin.dashboard.orderReceivedAmount', { amount: formattedAmount }),
                            timestamp: o.created_at,
                            isRead: true, // past ones are considered read
                            link: `/admin/orders?q=${o.order_number || o.id}`
                        })
                    })
                }

                if (sData) {
                    sData.forEach((s: Record<string, unknown>) => {
                        const products = s.products as Record<string, unknown> | null
                        const pName = products?.name || t('admin.dashboard.unknownProduct')
                        const pSku = products?.sku || ''
                        const delta = Number(s.delta || 0)
                        const movementType = delta > 0 ? t('admin.inventory.incomingLabel') : t('admin.inventory.outgoingLabel')
                        const absQty = Math.abs(delta)

                        combined.push({
                            id: `stock_${String(s.id)}`,
                            type: 'stock',
                            title: t('admin.dashboard.stockMovement'),
                            message: t('admin.dashboard.stockMovementDetail', { productName: String(pName), movementType, qty: absQty }),
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
    }, [lang, t])

    // Realtime subscriptions
    useEffect(() => {
        // 1. Sipariş Kanalı
        const ordersChannel = supabase
            .channel(`admin-orders-realtime-${tenantId}`, { config: { private: true } })
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'venthub_orders', filter: 'tenant_id=eq.' + tenantId },
                (payload) => {
                    const newOrder = payload.new as Record<string, unknown>
                    const totalAmt = Number(newOrder.total_amount || 0)
                    const amt = formatCurrency(totalAmt, lang, { currency: 'TRY' })

                    const orderId = String(newOrder.id || '')
                    const orderNumber = newOrder.order_number ? String(newOrder.order_number) : orderId.slice(0, 8)

                    const notif: AppNotification = {
                        id: `order_rt_${orderId}`,
                        type: 'order',
                        title: t('admin.dashboard.newOrderReceived'),
                        message: t('admin.dashboard.orderNotificationMessage', { orderNumber, amount: amt }),
                        timestamp: (newOrder.created_at as string) || new Date().toISOString(),
                        isRead: false,
                        link: `/admin/orders?q=${orderNumber}`
                    }

                    // Add to dropdown
                    setNotifications(prev => [notif, ...prev].slice(0, 20))
                    setUnreadCount(prev => prev + 1)
                    loadInboxCounts()

                    // Show Toast
                    toast.custom((id) => (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                toast.dismiss(id)
                                if (notif.link) router.push(notif.link as import('next').Route)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toast.dismiss(id)
                                    if (notif.link) router.push(notif.link as import('next').Route)
                                }
                            }}
                            className="max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-primary-navy cursor-pointer hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-top-4 duration-300"
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
                    ), { duration: 6000 })
                }
            )
            .subscribe()

        // 2. Stok Hareketi Kanalı
        const stockChannel = supabase
            .channel(`admin-stock-realtime-${tenantId}`, { config: { private: true } })
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inventory_movements', filter: 'tenant_id=eq.' + tenantId },
                (payload) => {
                    const m = payload.new as Record<string, unknown>
                    const delta = Number(m.delta || 0)
                    const movementType = delta > 0 ? t('admin.inventory.incomingLabel') : t('admin.inventory.outgoingLabel')
                    const absQty = Math.abs(delta)

                    const notif: AppNotification = {
                        id: `stock_rt_${String(m.id)}`,
                        type: 'stock',
                        title: t('admin.dashboard.stockUpdated'),
                        message: t('admin.dashboard.stockNotificationMessage', { movementType, qty: absQty, reason: String(m.reason || t('admin.common.system')) }),
                        timestamp: (m.created_at as string) || new Date().toISOString(),
                        isRead: false,
                        link: `/admin/products` // Default products page for RT stock, ideally we'd fetch SKU here but payload doesn't have it
                    }

                    setNotifications(prev => [notif, ...prev].slice(0, 20))
                    setUnreadCount(prev => prev + 1)
                    loadInboxCounts()

                    toast.custom((id) => (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                toast.dismiss(id)
                                if (notif.link) router.push(notif.link as import('next').Route)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toast.dismiss(id)
                                    if (notif.link) router.push(notif.link as import('next').Route)
                                }
                            }}
                            className="max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-emerald-500 cursor-pointer hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-top-4 duration-300"
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
                    ), { duration: 4000 })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(ordersChannel)
            supabase.removeChannel(stockChannel)
        }
    }, [router, tenantId, lang, t, loadInboxCounts])

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

    const attentionItems = [
        {
            type: 'return',
            count: inboxCounts.pendingReturnsCount,
            label: t('admin.dashboard.inbox.pendingReturns' as never),
            link: '/admin/returns',
            icon: <RefreshCw size={16} className="text-amber-600" />,
            bgColor: 'bg-amber-500/10',
            hasAccess: canWrite('returns')
        },
        {
            type: 'shipment',
            count: inboxCounts.pendingShipmentsCount,
            label: t('admin.dashboard.inbox.pendingShipments' as never),
            link: '/admin/logistics',
            icon: <ShoppingBag size={16} className="text-blue-600" />,
            bgColor: 'bg-blue-500/10',
            hasAccess: canWrite('orders')
        },
        {
            type: 'stock',
            count: inboxCounts.lowStockAlarmsCount,
            label: t('admin.dashboard.inbox.lowStock' as never),
            link: '/admin/inventory',
            icon: <AlertTriangle size={16} className="text-rose-600" />,
            bgColor: 'bg-rose-500/10',
            hasAccess: canWrite('inventory')
        },
        {
            type: 'error',
            count: inboxCounts.unresolvedErrorsCount,
            label: t('admin.dashboard.inbox.unresolvedErrors' as never),
            link: '/admin/error-groups',
            icon: <Bug size={16} className="text-purple-600" />,
            bgColor: 'bg-purple-500/10',
            hasAccess: canWrite('error_groups')
        }
    ].filter(item => item.hasAccess && item.count > 0)

    return (
        <div className="relative z-50" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={toggleDropdown}
                aria-label={t('admin.dashboard.notificationCenter')}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="relative p-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow hover:bg-slate-50 transition-shadow text-slate-600 hover:text-primary-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/30 animate-pulse">
                        <span className="sr-only">
                            {t('admin.dashboard.unreadCount', { count: unreadCount })}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div 
                    role="menu"
                    aria-label={t('admin.dashboard.notificationCenter')}
                    className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transform origin-top-right transition-colors animate-in fade-in zoom-in-95"
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {t('admin.dashboard.notificationCenter')}
                            {unreadCount > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {t('admin.dashboard.unreadCount', { count: unreadCount })}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="text-xs font-medium text-slate-500 hover:text-primary-navy transition-colors">
                                    {t('admin.dashboard.clearAll')}
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label={t('admin.dashboard.closeNotifications')}>
                                <X size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-70vh overflow-y-auto w-full">
                        {/* 1. İlgi Bekleyenler Section */}
                        {attentionItems.length > 0 && (
                            <div className="border-b border-slate-100 bg-slate-50/30 p-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                                    {t('admin.dashboard.inbox.title' as never)}
                                </h4>
                                <div className="grid grid-cols-1 gap-1.5" role="none">
                                    {attentionItems.map((item) => (
                                        <div
                                            key={item.type}
                                            role="menuitem"
                                            tabIndex={0}
                                            onClick={() => {
                                                setIsOpen(false)
                                                router.push(item.link as import('next').Route)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    setIsOpen(false)
                                                    router.push(item.link as import('next').Route)
                                                }
                                            }}
                                            className="group flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-primary-navy/20 hover:shadow-sm transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-2 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}>
                                                    {item.icon}
                                                </div>
                                                <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-navy transition-colors truncate">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold ring-1 ring-rose-500/10">
                                                    {item.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Activity Divider/Title if we have attention items and notifications */}
                        {attentionItems.length > 0 && notifications.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50/10 border-b border-slate-100">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {t('admin.dashboard.recent.transactions')}
                                </h4>
                            </div>
                        )}

                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-3">
                                    <Check size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">{t('admin.dashboard.allRead')}</p>
                                <p className="text-xs text-slate-400 mt-1">{t('admin.dashboard.noNewActivity')}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col" role="none">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            if (notif.link) {
                                                setIsOpen(false)
                                                router.push(notif.link as import('next').Route)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                if (notif.link) {
                                                    setIsOpen(false)
                                                    router.push(notif.link as import('next').Route)
                                                }
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
                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
                                                <Clock size={10} />
                                                {formatDateTime(notif.timestamp, lang)}
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
                            <span className="text-xs font-medium text-slate-500">{t('admin.dashboard.onlyLast20Notifications')}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminRealtimeNotifications
