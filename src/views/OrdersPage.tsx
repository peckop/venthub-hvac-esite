'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Package, Calendar, CreditCard, Eye, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import { formatCurrency } from '../i18n/format'
import { formatDateTime } from '../i18n/datetime'
import { Routes } from '../utils/routes'
import { isRecord } from '../lib/type-converters'


interface Order {
  id: string
  total_amount: number
  status: string
  payment_status?: string
  created_at: string
  customer_name: string
  customer_email: string
  shipping_address: unknown
  order_items: OrderItem[]
  order_number?: string
  is_demo?: boolean
  payment_data?: unknown
  conversation_id?: string
  carrier?: string
  tracking_number?: string
  tracking_url?: string
  shipped_at?: string
  delivered_at?: string
}

interface OrderItem {
  id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  product_image_url?: string
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed'
export const OrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchCode, setSearchCode] = useState<string>('')
  const [productFilter, setProductFilter] = useState<string>('')

  // const { addToCart: _addToCart } = useCart() // Not used in this component
  const { t, lang } = useI18n()

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true)

      // Gerçek siparişler: venthub_orders + venthub_order_items (nested)
      const { data: ordersData, error: ordersError } = await supabase
        .from('venthub_orders')
        .select('id, user_id, total_amount, status, payment_status, created_at, customer_name, customer_email, shipping_address, order_number, conversation_id, carrier, tracking_number, tracking_url, shipped_at, delivered_at, venthub_order_items ( id, product_id, product_name, quantity, price_at_time, product_image_url )')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        // 403 Forbidden error usually means RLS permission issue
        if (ordersError.code === '42501' || ('status' in ordersError && ordersError.status === 403)) {
          console.warn('RLS Permission denied. Please ensure DB migrations are applied.')
        }
        toast.error(t('orders.fetchError'))
        return
      }

      const formattedOrders: Order[] = (ordersData || []).map((rawOrder: unknown) => {
        const order = isRecord(rawOrder) ? rawOrder : {}
        const itemsList = Array.isArray(order.venthub_order_items) ? order.venthub_order_items : []
        const items: OrderItem[] = itemsList.map((rawIt: unknown) => {
          const it = isRecord(rawIt) ? rawIt : {}
          return {
            id: String(it.id),
            product_id: it.product_id ? String(it.product_id) : undefined,
            product_name: String(it.product_name || ''),
            quantity: Number(it.quantity) || 0,
            unit_price: Number(it.price_at_time) || 0,
            total_price: (Number(it.price_at_time) || 0) * (Number(it.quantity) || 0),
            product_image_url: it.product_image_url ? String(it.product_image_url) : undefined,
          }
        })

        return {
          id: String(order.id),
          total_amount: Number(order.total_amount) || 0,
          status: String(order.status || 'pending'),
          payment_status: order.payment_status ? String(order.payment_status) : undefined,
          created_at: String(order.created_at || new Date().toISOString()),
          customer_name: String(order.customer_name || user?.user_metadata?.full_name || user?.email || 'Kullanıcı'),
          customer_email: String(order.customer_email || user?.email || '-'),
          shipping_address: isRecord(order.shipping_address) ? order.shipping_address : undefined,
          order_items: items,
          order_number: order.order_number ? String(order.order_number) : undefined,
          is_demo: false,
          payment_data: isRecord(order.payment_data) ? order.payment_data : undefined,
          conversation_id: order.conversation_id ? String(order.conversation_id) : undefined,
          carrier: order.carrier ? String(order.carrier) : undefined,
          tracking_number: order.tracking_number ? String(order.tracking_number) : undefined,
          tracking_url: order.tracking_url ? String(order.tracking_url) : undefined,
          shipped_at: order.shipped_at ? String(order.shipped_at) : undefined,
          delivered_at: order.delivered_at ? String(order.delivered_at) : undefined,
        } as Order
      })

      setOrders(formattedOrders)

      // Apply product filter from URL (?product=...)
      if (searchParams) {
        const productQ = searchParams.get('product')
        if (productQ) setProductFilter(productQ)
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      toast.error(t('orders.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }, [user, searchParams, t])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(Routes.auth.login('/account/orders'))
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router, fetchOrders])

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString, lang)
  }

  const formatPrice = (price: number) => {
    return formatCurrency(price, lang, { maximumFractionDigits: 0 })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return t('orders.pending')
      case 'paid':
      case 'confirmed':
        return t('orders.paid')
      case 'shipped':
        return t('orders.shipped')
      case 'delivered':
        return t('orders.delivered')
      case 'failed':
        return t('orders.failed')
      case 'cancelled':
        return t('orders.cancelled')
      case 'refunded':
        return t('orders.refunded')
      default:
        return status
    }
  }

  const steps = ['pending', 'paid', 'shipped', 'delivered'] as const
  const stepLabel: Record<string, string> = {
    pending: t('orders.pending'),
    pa_id: t('orders.paid'),
    shipped: t('orders.shipped'),
    delivered: t('orders.delivered')
  }


  // Derived filtered list
  const filtered = orders.filter(o => {
    if (productFilter) {
      const q = productFilter.toLowerCase()
      const match = (o.order_items || []).some(it => (it.product_name || '').toLowerCase().includes(q))
      if (!match) return false
    }
    if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter) return false
    if (dateFrom) {
      if (new Date(o.created_at) < new Date(dateFrom)) return false
    }
    if (dateTo) {
      if (new Date(o.created_at) > new Date(dateTo)) return false
    }
    if (searchCode) {
      const code = o.order_number?.split('-').pop() || o.id.slice(-8).toUpperCase()
      if (!code.includes(searchCode.toUpperCase())) return false
    }
    return true
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-clean-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-clean-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
              <ShoppingBag size={20} />
            </div>
            {t('orders.title')}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t('orders.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.status')}</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all">
                <option value="all">{t('orders.all')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="paid">{t('orders.paid')}</option>
                <option value="shipped">{t('orders.shipped')}</option>
                <option value="delivered">{t('orders.delivered')}</option>
                <option value="failed">{t('orders.failed')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.startDate')}</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.endDate')}</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.orderCode')}</label>
              <input type="text" placeholder={t('orders.orderCodePlaceholder')} value={searchCode} onChange={e => setSearchCode(e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.product')}</label>
              <input type="text" placeholder={t('orders.productSearchPlaceholder')} value={productFilter} onChange={e => setProductFilter(e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{filtered.length} / {orders.length} sipariş gösteriliyor</span>
            <button onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); setSearchCode(''); setProductFilter('') }} className="text-sm font-bold text-slate-500 hover:text-primary-navy transition-colors">{t('orders.clearFilters')}</button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t('orders.noOrdersTitle')}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {t('orders.noOrdersDesc')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-navy hover:bg-industrial-gray text-white font-bold h-10 px-6 rounded-lg shadow-sm shadow-primary-navy/20 transition-colors inline-flex items-center justify-center"
            >
              {t('orders.exploreProducts')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100">
                  {/* Status Stepper */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      {steps.map((s, idx) => {
                        // Normalize 'confirmed' status to 'paid' for progress bar
                        const normalizedStatus = order.status.toLowerCase() === 'confirmed' ? 'paid' : order.status.toLowerCase()
                        const activeIdx = Math.max(steps.indexOf(normalizedStatus as 'paid' | 'pending' | 'shipped' | 'delivered'), 0)
                        const active = idx <= activeIdx
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center min-w-[80px]">
                              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors shadow-sm ${active ? 'bg-primary-navy text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>{idx + 1}</div>
                              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary-navy' : 'text-slate-400'}`}>{stepLabel[s]}</span>
                            </div>
                            {idx < steps.length - 1 && (
                              <div className={`flex-1 h-1 rounded-full ${activeIdx >= idx + 1 ? 'bg-primary-navy' : 'bg-slate-100'}`}></div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Package className="text-primary-navy" size={20} />
                          Sipariş #{order.order_number?.split('-').pop() || order.id.slice(-8).toUpperCase()}
                          {order.is_demo && (
                            <span className="ml-2 px-2.5 py-0.5 bg-orange-100/80 border border-orange-200 text-orange-700 text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-sm">
                              DEMO
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm font-medium text-slate-500 mt-1">
                          <div className="flex items-center space-x-1.5">
                            <Calendar size={14} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <CreditCard size={14} />
                            <span>{formatPrice(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {order.payment_status?.toLowerCase() === 'partial_refunded' && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm bg-orange-100 text-orange-800">
                          {t('orders.partialRefunded')}
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/account/orders/detail?id=${order.id}`)}
                        className="flex items-center space-x-1 bg-slate-50 hover:bg-slate-100 text-primary-navy border border-slate-200 h-10 px-4 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <Eye size={16} />
                        <span>{t('orders.details')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* No inline details - router to detail page */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage




