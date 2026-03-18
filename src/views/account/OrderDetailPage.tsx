'use client'

import { VentImage } from '@/components/ui/VentImage'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { supabase, Product } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'
import { Package, Calendar, CreditCard, ArrowLeft, Link as LinkIcon, Copy, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useCart } from '../../hooks/useCartHook'

interface ShippingAddress {
  fullAddress?: string
  street?: string
  city?: string
  district?: string
  state?: string
  postalCode?: string
  postal_code?: string
}

interface OrderItem {
  id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  product_image_url?: string | null
}

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
  shipping_method?: 'standard' | 'express' | string
  invoice_type?: string
  invoice_info?: unknown
  legal_consents?: unknown
}

export default function OrderDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') ?? ''
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t, lang } = useI18n()
  const { addToCart } = useCart()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'items' | 'shipping' | 'invoice'>('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/account/orders/detail?id=${id}`)
      return
    }
  }, [authLoading, user, id, router])


  useEffect(() => {
    async function load() {
      if (!user || !id) return
      try {
        setLoading(true)

        // 1. Sipariş ana verilerini çek
        const { data: orderData, error: orderError } = await (supabase
          .from('venthub_orders'))
          .select(`
            id, total_amount, status, payment_status, created_at, 
            customer_name, customer_email, shipping_address, order_number, 
            conversation_id, carrier, tracking_number, tracking_url, 
            shipped_at, delivered_at, shipping_method, invoice_type, 
            invoice_info, legal_consents
          `)
          .eq('id', id)
          .single()

        if (orderError) throw orderError
        if (!orderData) throw new Error('Order not found')

        // 2. Sipariş kalemlerini (items) çek
        // Not: RLS politikası user_id bazlı koruma sağladığı için doğrudan çekiyoruz
        const { data: itemsData, error: itemsError } = await (supabase
          .from('venthub_order_items'))
          .select('id, product_id, product_name, quantity, price_at_time, product_image_url')
          .eq('order_id', id)

        if (itemsError) {
          console.error('Order items load error:', itemsError)
        }

        const mappedItems: OrderItem[] = (itemsData || []).map((it) => {
          const unit = Number(it.price_at_time) || 0
          const qty = Number(it.quantity) || 0
          return {
            id: it.id,
            product_id: it.product_id ?? undefined,
            product_name: it.product_name,
            quantity: qty,
            unit_price: unit,
            total_price: unit * qty,
            product_image_url: it.product_image_url,
          }
        })

        if (orderData) {
          const mappedOrder: Order = {
            id: orderData.id,
            total_amount: Number(orderData.total_amount) || 0,
            status: orderData.status || 'pending',
            payment_status: orderData.payment_status || undefined,
            created_at: orderData.created_at,
            customer_name: (orderData).customer_name || (user?.user_metadata?.full_name || user?.email || 'Kullanıcı'),
            customer_email: (orderData).customer_email || (user?.email || '-'),
            shipping_address: orderData.shipping_address,
            order_items: mappedItems,
            order_number: (orderData).order_number || undefined,
            is_demo: false,
            payment_data: undefined,
            conversation_id: (orderData).conversation_id || undefined,
            carrier: (orderData).carrier || undefined,
            tracking_number: (orderData).tracking_number || undefined,
            tracking_url: (orderData).tracking_url || undefined,
            shipped_at: (orderData).shipped_at || undefined,
            delivered_at: (orderData).delivered_at || undefined,
            shipping_method: ((orderData).shipping_method || undefined) as string | undefined,
            invoice_type: (orderData).invoice_type || undefined,
            invoice_info: (orderData).invoice_info || undefined,
            legal_consents: (orderData).legal_consents || undefined,
          }
          setOrder(mappedOrder)
        }
      } catch (e) {
        console.error('Order load error:', e)
        toast.error(t('orders.unexpectedError'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, id, t, router])

  const formatDate = (d?: string | null) => (d ? formatDateTime(d, lang) : '-')
  const formatPrice = (n: number | string) => formatCurrency(Number(n) || 0, lang, { maximumFractionDigits: 0 })

  const handleCopy = async (text?: string) => {
    try { if (!text) return; await navigator.clipboard.writeText(text); toast.success(t('orders.copied')) } catch { toast.error(t('orders.copyFailed')) }
  }

  const handleInvoicePdf = (o: Order) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const nf = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: 'TRY' })
      const orderNo = o.order_number ? o.order_number.split('-')[1] : o.id.slice(-8).toUpperCase()
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
      doc.text('PROFORMA', 40, 40)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      doc.text(`Proforma No: ${orderNo}`, 40, 58)
      doc.text(`Tarih: ${formatDateTime(o.created_at, lang)}`, 40, 72)
      doc.setFont('helvetica', 'bold'); doc.text('Müşteri', 350, 40)
      doc.setFont('helvetica', 'normal')
      doc.text(`${o.customer_name}`, 350, 58)
      if (o.customer_email) doc.text(`${o.customer_email}`, 350, 72)
      const head = [[t('orders.productCol'), t('orders.qtyCol'), t('orders.unitPriceCol'), t('orders.totalCol')]]
      const body = (o.order_items || []).map(it => [it.product_name || '-', String(it.quantity ?? 0), nf.format(Number(it.unit_price) || 0), nf.format(Number(it.total_price) || 0)])
      autoTable(doc, { startY: 100, head, body, styles: { font: 'helvetica', fontSize: 10 }, headStyles: { fillColor: [245, 247, 250], textColor: 20 }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } } })
      const after = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 100
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
      doc.text(`${t('orders.grandTotal')}: ${nf.format(o.total_amount)}`, 40, after + 24)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100)
      doc.text('Bu belge resmî fatura değildir; bilgilendirme amaçlıdır.', 40, after + 42)
      doc.save(`Proforma-${orderNo}.pdf`)
    } catch (e) {
      console.error('PDF error', e)
      toast.error('PDF oluşturulamadı')
    }
  }

  const handleReorder = async (o: Order) => {
    try {
      const ids = Array.from(new Set((o.order_items || []).map(it => it.product_id).filter(Boolean))) as string[]
      const names = Array.from(new Set((o.order_items || []).filter(it => !it.product_id && it.product_name).map(it => it.product_name)))
      const productMap: Record<string, Product> = {}
      if (ids.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('id', ids)
        if (error) throw error
          ; ((data || []) as Product[]).forEach((p) => { productMap[p.id] = p })
      }
      if (names.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('name', names)
        if (error) throw error
          ; ((data || []) as Product[]).forEach((p) => { productMap[p.name] = p })
      }
      let added = 0
      for (const it of o.order_items || []) {
        let prod: Product | undefined
        if (it.product_id) prod = productMap[it.product_id]
        if (!prod) prod = productMap[it.product_name]
        if (prod) { addToCart(prod, it.quantity); added += it.quantity }
      }
      if (added > 0) { toast.success(t('orders.reorderedToast', { count: added })); router.push('/cart') } else { toast.error(t('orders.reorderNotFound')) }
    } catch (e) { console.error(e); toast.error(t('orders.reorderError')) }
  }


  if (authLoading || loading || !order) {
    return (
      <div className="min-h-screen bg-clean-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    )
  }

  // Status helpers
  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid':
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'failed':
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusText = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return t('orders.pending')
      case 'paid':
      case 'confirmed': return t('orders.paid')
      case 'shipped': return t('orders.shipped')
      case 'delivered': return t('orders.delivered')
      case 'failed': return t('orders.failed')
      case 'cancelled': return t('orders.cancelled')
      case 'refunded': return t('orders.refunded')
      default: return status
    }
  }
  const steps = ['pending', 'paid', 'shipped', 'delivered'] as const
  // Normalize 'confirmed' status to 'paid' for progress bar
  const normalizedStatus = (order.status || 'pending').toLowerCase() === 'confirmed' ? 'paid' : (order.status || 'pending').toLowerCase()
  const activeIdx = Math.max(steps.indexOf(normalizedStatus as typeof steps[number]), 0)

  return (
    <div className="min-h-screen bg-clean-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button className="mb-4 inline-flex items-center text-steel-gray hover:text-primary-navy text-sm" onClick={() => router.push('/account/orders')}><ArrowLeft size={18} className="mr-1" />{t('auth.back')}</button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-navy/5 text-primary-navy rounded-xl w-12 h-12 flex items-center justify-center"><Package size={24} /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Package size={24} className="text-primary-navy" />
                  {t('orders.orderNumber')}: #{order.order_number?.split('-').pop() || order.id.slice(-8).toUpperCase()}
                  {order.is_demo && (
                    <span className="px-2.5 py-0.5 bg-orange-100/80 border border-orange-200 text-orange-700 text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-sm">
                      DEMO
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-4 text-sm font-medium text-slate-500 mt-1.5">
                  <div className="flex items-center space-x-1.5"><Calendar size={14} /><span>{formatDate(order.created_at)}</span></div>
                  <div className="flex items-center space-x-1.5"><CreditCard size={14} /><span>{formatPrice(order.total_amount)}</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
              {order.payment_status?.toLowerCase() === 'partial_refunded' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm bg-orange-100 text-orange-800">{t('orders.partialRefunded')}</span>
              )}
              <button onClick={() => router.push(`/account/returns?new=${order.id}`)} className="h-10 px-4 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-primary-navy rounded-lg transition-all hover:scale-[1.02] shadow-sm">{t('returns.requestReturn')}</button>
              <button onClick={() => handleReorder(order)} className="h-10 px-4 text-sm font-bold text-white bg-primary-navy hover:bg-industrial-gray rounded-lg shadow-sm shadow-primary-navy/20 flex items-center gap-2 transition-all hover:scale-[1.02]"><RefreshCcw size={16} />{t('orders.reorder')}</button>
            </div>
          </div>
          {/* Detailed Stepper */}
          <div className="mt-2 py-2">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              {steps.map((s, idx) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors shadow-sm ${idx <= activeIdx ? 'bg-primary-navy text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>{idx + 1}</div>
                    <span className={`mt-2 text-[10px] uppercase font-bold tracking-wider ${idx <= activeIdx ? 'text-primary-navy' : 'text-slate-400'}`}>{getStatusText(s)}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full ${activeIdx >= idx + 1 ? 'bg-primary-navy' : 'bg-slate-100'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 min-h-[400px]">
          <div className="mb-8">
            <nav className="flex flex-wrap gap-1 p-1 bg-slate-100/80 rounded-xl max-w-fit">
              {(['overview', 'items', 'shipping', 'invoice'] as const).map(tt => (
                <button key={tt} onClick={() => setTab(tt)} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === tt ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-primary-navy hover:bg-slate-200/50'}`}>
                  {tt === 'overview' && (t('orders.tabs.overview') || 'Özet')}
                  {tt === 'items' && (t('orders.tabs.items') || 'Ürünler')}
                  {tt === 'shipping' && (t('orders.tabs.shipping') || 'Kargo Takibi')}
                  {tt === 'invoice' && (t('orders.tabs.invoice') || 'Fatura')}
                </button>
              ))}
            </nav>
          </div>

          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-3">{t('orders.customerInfo')}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-bold text-slate-700">{t('orders.name')}:</span> {order.customer_name}</p>
                  <p><span className="font-bold text-slate-700">{t('orders.email')}:</span> {order.customer_email}</p>
                </div>
              </div>
              <div className="pt-4 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                <h4 className="font-bold text-slate-900 mb-3">{t('orders.deliveryAddress')}</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  {!!order.shipping_address && (() => {
                    const addr = order.shipping_address as ShippingAddress
                    const line1 = addr.fullAddress || addr.street
                    const line2 = [addr.city, addr.district || addr.state].filter(Boolean).join(', ')
                    const line3 = addr.postalCode || addr.postal_code
                    return (
                      <div>
                        {line1 && <p>{line1}</p>}
                        {(line2 && line2.length > 0) && <p>{line2}</p>}
                        {line3 && <p>{line3}</p>}
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="pt-4 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                <h4 className="font-bold text-slate-900 mb-3">{t('orders.orderInfo')}</h4>
                <div className="text-sm text-slate-600 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-700">{t('orders.orderId')}</span>
                      <button onClick={() => handleCopy(order.id)} className="text-xs font-bold text-primary-navy hover:text-secondary-blue transition-colors focus:outline-none">{t('orders.copy')}</button>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg break-all text-xs font-mono text-slate-500" title={order.id}>{order.id}</div>
                  </div>
                  {order.conversation_id && (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-700">{t('orders.conversationId')}</span>
                        <button onClick={() => handleCopy(order.conversation_id!)} className="text-xs font-bold text-primary-navy hover:text-secondary-blue transition-colors focus:outline-none">{t('orders.copy')}</button>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg break-all text-xs font-mono text-slate-500" title={order.conversation_id}>{order.conversation_id}</div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700">Teslimat Yöntemi</span>
                    <span className="font-medium text-slate-900">{(order.shipping_method === 'express') ? 'Ekspres' : 'Standart'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'items' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4">{t('orders.orderDetails')}</h4>
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.productCol')}</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.imageCol')}</th>
                      <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.qtyCol')}</th>
                      <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.unitPriceCol')}</th>
                      <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orders.totalCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.order_items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-900">
                          {item.product_id ? (
                            <Link href={`/products/${item.product_id}`} className="hover:text-primary-navy transition-colors">
                              {item.product_name}
                            </Link>
                          ) : (
                            item.product_name
                          )}
                        </td>
                        <td className="p-4">
                          {item.product_image_url ? (
                            item.product_id ? (
                              <Link href={`/products/${item.product_id}`}>
                                <VentImage src={item.product_image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg border border-slate-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:opacity-80 transition-opacity"  />
                              </Link>
                            ) : (
                              <VentImage src={item.product_image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg border border-slate-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"  />
                            )
                          ) : (
                            <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('orders.noImage')}</div>
                          )}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 text-center">{item.quantity}</td>
                        <td className="p-4 text-sm font-medium text-slate-600 text-right">{formatPrice(item.unit_price)}</td>
                        <td className="p-4 text-sm font-bold text-slate-900 text-right">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200/60">
                    <tr>
                      <td colSpan={4} className="p-4 text-sm font-bold text-slate-700 text-right">{t('orders.grandTotal')}:</td>
                      <td className="p-4 text-sm font-black text-primary-navy text-right">{formatPrice(order.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teslimat Yöntemi</div>
                  <div className="font-bold text-slate-900">{(order.shipping_method === 'express') ? 'Ekspres (1–2 iş günü)' : 'Standart (3–5 iş günü)'}</div>
                </div>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('orders.carrier')}</div>
                  <div className="font-bold text-slate-900">{order.carrier || '-'}</div>
                </div>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('orders.trackingNumber')}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 break-all">{order.tracking_number || '-'}</span>
                    {order.tracking_number && (
                      <button onClick={() => handleCopy(order.tracking_number)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary-navy hover:bg-primary-navy hover:text-white hover:border-primary-navy transition-all shadow-sm focus:outline-none"><Copy size={12} /></button>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('orders.trackingLink')}</div>
                  {order.tracking_url ? (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-navy hover:text-secondary-blue transition-colors break-all bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow group"><LinkIcon size={14} className="group-hover:scale-110 transition-transform" />{t('orders.openLink')}</a>
                  ) : (
                    <div className="font-bold text-slate-400">-</div>
                  )}
                </div>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('orders.shippedAt')}</div>
                  <div className="font-bold text-slate-900">{formatDate(order.shipped_at)}</div>
                </div>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('orders.deliveredAt')}</div>
                  <div className="font-bold text-slate-900">{formatDate(order.delivered_at)}</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'invoice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 border-l-4 border-primary-navy pl-3">{t('orders.tabs.invoice')}</h4>
                <button onClick={() => handleInvoicePdf(order)} className="h-10 px-4 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-primary-navy rounded-lg transition-all shadow-sm flex items-center gap-2">
                  <RefreshCcw size={16} className="text-slate-400" />
                  {t('orders.invoicePdf')}
                </button>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Fatura Bilgileri</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">Tip:</span> <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-100">{order.invoice_type || '-'}</span></div>
                    {(() => {
                      const info = (order.invoice_info || {}) as Record<string, unknown>
                      const iv = (k: string) => (info?.[k] ? String(info[k]) : '-')
                      if ((order.invoice_type || '').toLowerCase() === 'corporate') {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">Ünvan:</span> <span className="text-sm font-medium text-slate-900 text-right max-w-[60%] truncate" title={iv('companyName')}>{iv('companyName')}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">VKN:</span> <span className="text-sm font-medium text-slate-900">{iv('vkn')}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">Vergi Dairesi:</span> <span className="text-sm font-medium text-slate-900">{iv('taxOffice')}</span></div>
                          </div>
                        )
                      }
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">TCKN:</span> <span className="text-sm font-medium text-slate-900">{iv('tckn')}</span></div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Legal Consents */}
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Yasal Onaylar</div>
                  <div className="space-y-3">
                    {(() => {
                      const cons = (order.legal_consents || {}) as Record<string, { accepted?: boolean; ts?: string | null }>
                      const row = (label: string, k: string) => {
                        const c = cons?.[k]
                        const ok = !!c?.accepted
                        const ts = c?.ts ? formatDateTime(c.ts, lang) : '-'
                        return (
                          <div key={k} className="flex items-center justify-between group">
                            <span className="text-sm font-bold text-slate-600 group-hover:text-primary-navy transition-colors">{label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400 font-medium">{ok ? ts : ''}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${ok ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-200 text-slate-500 border border-slate-300'}`}>{ok ? 'Kabul Edildi' : 'Onay Yok'}</span>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <>
                          {row('KVKK', 'kvkk')}
                          {row('Mesafeli Satış', 'distanceSales')}
                          {row('Ön Bilgilendirme', 'preInfo')}
                          {row('Sipariş Onayı', 'orderConfirm')}
                          {row('Pazarlama İzni', 'marketing')}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
