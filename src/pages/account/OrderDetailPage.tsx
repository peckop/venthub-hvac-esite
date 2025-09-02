import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase, Product } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { Package, Calendar, CreditCard, ArrowLeft, Link as LinkIcon, Copy, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useCart } from '../../hooks/useCart'

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
  product_image_url?: string
}

interface Order {
  id: string
  total_amount: number
  status: string
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
}

interface SupabaseOrderData {
  id: string
  total_amount: number | string
  status: string
  created_at: string
  customer_name: string
  customer_email: string
  shipping_address: unknown
  order_number: string
  conversation_id: string | null
  carrier: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  delivered_at: string | null
  shipping_method?: string | null
  venthub_order_items: SupabaseOrderItem[]
}

interface SupabaseOrderItem {
  id: string
  product_id: string | null
  product_name: string
  quantity: number
  price_at_time: number | string
  product_image_url: string | null
}

interface SupabaseError {
  code?: string
  status?: number
  message?: string
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { addToCart } = useCart()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'items'|'shipping'|'invoice'>('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login', { state: { from: { pathname: `/account/orders/${id}` } } })
      return
    }
  }, [authLoading, user, id, navigate])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
const baseSelect = 'id, total_amount, status, created_at, customer_name, customer_email, shipping_address, order_number, conversation_id, carrier, tracking_number, tracking_url, shipped_at, delivered_at, shipping_method, venthub_order_items ( id, product_id, product_name, quantity, price_at_time, product_image_url )'
        const baseRes = await supabase
          .from('venthub_orders')
          .select(baseSelect)
          .eq('id', id)
          .limit(1)
          .single()

        let data: SupabaseOrderData | null = null
        let error: SupabaseError | null = baseRes.error as SupabaseError | null

        if (!baseRes.error) {
          data = baseRes.data as unknown as SupabaseOrderData
        } else if (((baseRes.error as SupabaseError).code === '42703') || ((baseRes.error as SupabaseError).status === 400)) {
          // Fallback: bazı kolonlar yoksa daha dar bir seçimle tekrar dene
          const fallbackSelect = 'id, total_amount, status, created_at, customer_name, customer_email, shipping_address, order_number, conversation_id, venthub_order_items ( id, product_id, product_name, quantity, price_at_time, product_image_url )'
          const fb = await supabase
            .from('venthub_orders')
            .select(fallbackSelect)
            .eq('id', id)
            .limit(1)
            .single()
          data = (fb.data as unknown as SupabaseOrderData) ?? null
          error = (fb.error as SupabaseError | null)
        }

        if (error || !data) throw (error || { message: 'Order not found' })
        // Ensure all required fields have fallback values
        const orderDataWithDefaults: SupabaseOrderData = {
          ...data,
          customer_name: data.customer_name || (user?.user_metadata?.full_name || user?.email || 'Kullanıcı'),
          customer_email: data.customer_email || (user?.email || '-'),
          order_number: data.order_number || data.id,
        }

        // If relationship-based items are missing (FK veya ilişki ayarı yoksa), doğrudan tablodan çek
        let itemsData: SupabaseOrderItem[] = Array.isArray(orderDataWithDefaults.venthub_order_items) ? orderDataWithDefaults.venthub_order_items : []
        if (!itemsData || itemsData.length === 0) {
          try {
            const itemsRes = await supabase
              .from('venthub_order_items')
              .select('id, product_id, product_name, quantity, price_at_time, product_image_url')
              .eq('order_id', orderDataWithDefaults.id)
            if (!itemsRes.error && Array.isArray(itemsRes.data)) {
              itemsData = itemsRes.data as unknown as SupabaseOrderItem[]
            }
          } catch {}
        }
        
const mapped: Order = {
  id: orderDataWithDefaults.id,
  total_amount: Number(orderDataWithDefaults.total_amount) || 0,
  status: orderDataWithDefaults.status || 'pending',
  created_at: orderDataWithDefaults.created_at,
  customer_name: orderDataWithDefaults.customer_name,
  customer_email: orderDataWithDefaults.customer_email,
  shipping_address: orderDataWithDefaults.shipping_address,
  order_items: (itemsData || []).map((it: SupabaseOrderItem) => ({
    id: it.id,
    product_id: it.product_id ?? undefined,
    product_name: it.product_name,
    quantity: it.quantity,
    unit_price: Number(it.price_at_time) || 0,
    total_price: (Number(it.price_at_time) || 0) * (Number(it.quantity) || 0),
    product_image_url: it.product_image_url ?? undefined,
  })),
  order_number: orderDataWithDefaults.order_number || undefined,
  is_demo: false,
  payment_data: undefined,
  conversation_id: orderDataWithDefaults.conversation_id || undefined,
  carrier: orderDataWithDefaults.carrier || undefined,
  tracking_number: orderDataWithDefaults.tracking_number || undefined,
  tracking_url: orderDataWithDefaults.tracking_url || undefined,
  shipped_at: orderDataWithDefaults.shipped_at || undefined,
  delivered_at: orderDataWithDefaults.delivered_at || undefined,
  shipping_method: (orderDataWithDefaults.shipping_method || undefined) as string | undefined,
}
        setOrder(mapped)
      } catch (e) {
        console.error('Order load error', e)
        toast.error(t('orders.unexpectedError'))
      } finally {
        setLoading(false)
      }
    }
    if (user && id) load()
  }, [user, id, t])

  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleString('tr-TR') : '-')
  const formatPrice = (n: number | string) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n) || 0)

  const handleCopy = async (text?: string) => {
    try { if (!text) return; await navigator.clipboard.writeText(text); toast.success(t('orders.copied')) } catch { toast.error(t('orders.copyFailed')) }
  }

  const handleInvoicePdf = (o: Order) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const nf = new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'})
      const orderNo = o.order_number ? o.order_number.split('-')[1] : o.id.slice(-8).toUpperCase()
      doc.setFont('helvetica','bold'); doc.setFontSize(16)
      doc.text('PROFORMA', 40, 40)
      doc.setFont('helvetica','normal'); doc.setFontSize(10)
      doc.text(`Proforma No: ${orderNo}`, 40, 58)
      doc.text(`Tarih: ${new Date(o.created_at).toLocaleString('tr-TR')}`, 40, 72)
      doc.setFont('helvetica','bold'); doc.text('Müşteri', 350, 40)
      doc.setFont('helvetica','normal')
      doc.text(`${o.customer_name}`, 350, 58)
      if (o.customer_email) doc.text(`${o.customer_email}`, 350, 72)
      const head = [[t('orders.productCol'), t('orders.qtyCol'), t('orders.unitPriceCol'), t('orders.totalCol')]]
      const body = (o.order_items || []).map(it => [it.product_name || '-', String(it.quantity ?? 0), nf.format(Number(it.unit_price) || 0), nf.format(Number(it.total_price) || 0)])
      autoTable(doc, { startY: 100, head, body, styles: { font: 'helvetica', fontSize: 10 }, headStyles: { fillColor: [245,247,250], textColor: 20 }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } } })
      const after = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 100
      doc.setFont('helvetica','bold'); doc.setFontSize(12)
      doc.text(`${t('orders.grandTotal')}: ${nf.format(o.total_amount)}`, 40, after + 24)
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(100)
      doc.text('Bu belge resmî fatura değildir; bilgilendirme amaçlıdır.', 40, after + 42)
      doc.save(`Proforma-${orderNo}.pdf`)
    } catch (e) {
      console.error('PDF error', e)
      toast.error('PDF oluşturulamadı')
    }
  }

  const handleReorder = async (o: Order) => {
    try {
      const ids = Array.from(new Set((o.order_items||[]).map(it=>it.product_id).filter(Boolean))) as string[]
      const names = Array.from(new Set((o.order_items||[]).filter(it=>!it.product_id && it.product_name).map(it=>it.product_name)))
      const productMap: Record<string, Product> = {}
      if (ids.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('id', ids)
        if (error) throw error
        ;((data || []) as Product[]).forEach((p)=>{ productMap[p.id] = p })
      }
      if (names.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('name', names)
        if (error) throw error
        ;((data || []) as Product[]).forEach((p)=>{ productMap[p.name] = p })
      }
      let added = 0
      for (const it of o.order_items||[]) {
        let prod: Product | undefined
        if (it.product_id) prod = productMap[it.product_id]
        if (!prod) prod = productMap[it.product_name]
        if (prod) { addToCart({ ...prod, price: String(prod.price) }, it.quantity); added += it.quantity }
      }
      if (added>0) { toast.success(t('orders.reorderedToast', { count: added })); navigate('/cart') } else { toast.error(t('orders.reorderNotFound')) }
    } catch (e) { console.error(e); toast.error(t('orders.reorderError')) }
  }

  if (authLoading || loading || !order) {
    return (
      <div className="min-h-screen bg-clean-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    )
  }

  const prettyNo = order.order_number ? `#${order.order_number.split('-')[1]}` : `#${order.id.slice(-8).toUpperCase()}`

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
      case 'failed':
      case 'cancelled': return t('orders.failed')
      default: return status
    }
  }
  const steps = ['pending','paid','shipped','delivered'] as const
  const activeIdx = Math.max(steps.indexOf((order.status || 'pending').toLowerCase() as typeof steps[number]), 0)

  return (
    <div className="min-h-screen bg-clean-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button className="mb-4 inline-flex items-center text-steel-gray hover:text-primary-navy text-sm" onClick={()=>navigate('/account/orders')}><ArrowLeft size={18} className="mr-1" />{t('auth.back')}</button>

        <div className="bg-white rounded-lg shadow-hvac-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-navy text-white rounded-full w-12 h-12 flex items-center justify-center"><Package size={24} /></div>
              <div>
                <h1 className="text-xl font-semibold text-industrial-gray">{t('orders.title')} {prettyNo}</h1>
                <div className="flex items-center space-x-4 text-sm text-steel-gray mt-1">
                  <div className="flex items-center space-x-1"><Calendar size={16} /><span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span></div>
                  <div className="flex items-center space-x-1"><CreditCard size={16} /><span>{formatPrice(order.total_amount)}</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
              <button onClick={()=>navigate(`/account/returns?new=${order.id}`)} className="text-sm px-3 py-2 border rounded text-steel-gray border-light-gray hover:bg-gray-50">{t('returns.requestReturn')}</button>
              <button onClick={()=>handleReorder(order)} className="text-sm px-3 py-2 border rounded text-success-green border-success-green hover:bg-success-green hover:text-white flex items-center gap-1"><RefreshCcw size={14}/>{t('orders.reorder')}</button>
            </div>
          </div>
          {/* Compact stepper */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${idx <= activeIdx ? 'bg-success-green text-white' : 'bg-light-gray text-steel-gray'}`}>{idx+1}</div>
                    <span className="mt-1 text-[10px] text-steel-gray">{getStatusText(s)}</span>
                  </div>
                  {idx < steps.length-1 && (
                    <div className={`flex-1 h-0.5 ${activeIdx >= idx+1 ? 'bg-success-green' : 'bg-light-gray'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-hvac-md p-6">
          <div className="border-b border-light-gray mb-4">
            <nav className="flex flex-wrap gap-2">
              {(['overview','items','shipping','invoice'] as const).map(tt => (
                <button key={tt} onClick={()=>setTab(tt)} className={`px-3 py-2 text-sm rounded-t ${tab===tt ? 'bg-white border border-light-gray border-b-transparent text-primary-navy' : 'text-steel-gray hover:text-primary-navy'}`}>
                  {tt==='overview' && (t('orders.tabs.overview') || 'Özet')}
                  {tt==='items' && (t('orders.tabs.items') || 'Ürünler')}
                  {tt==='shipping' && (t('orders.tabs.shipping') || 'Kargo Takibi')}
                  {tt==='invoice' && (t('orders.tabs.invoice') || 'Fatura')}
                </button>
              ))}
            </nav>
          </div>

          {tab==='overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-industrial-gray mb-3">{t('orders.customerInfo')}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">{t('orders.name')}:</span> {order.customer_name}</p>
                  <p><span className="font-medium">{t('orders.email')}:</span> {order.customer_email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-industrial-gray mb-3">{t('orders.deliveryAddress')}</h4>
                <div className="text-sm text-steel-gray">
                  {order.shipping_address && (() => {
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
              <div>
                <h4 className="font-semibold text-industrial-gray mb-3">{t('orders.orderInfo')}</h4>
                <div className="text-sm text-steel-gray space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{t('orders.orderId')}</span>
                    <button onClick={() => handleCopy(order.id)} className="text-xs text-primary-navy hover:underline">{t('orders.copy')}</button>
                  </div>
                  <div className="p-2 bg-light-gray rounded break-all" title={order.id}>{order.id}</div>
                  {order.conversation_id && (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{t('orders.conversationId')}</span>
                        <button onClick={() => handleCopy(order.conversation_id!)} className="text-xs text-primary-navy hover:underline">{t('orders.copy')}</button>
                      </div>
                      <div className="p-2 bg-light-gray rounded break-all" title={order.conversation_id}>{order.conversation_id}</div>
                    </>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Teslimat Yöntemi</span>
                    <span className="text-industrial-gray">{(order.shipping_method === 'express') ? 'Ekspres (1–2 iş günü)' : 'Standart (3–5 iş günü)'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='items' && (
            <div>
              <h4 className="font-semibold text-industrial-gray mb-3">{t('orders.orderDetails')}</h4>
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-industrial-gray">{t('orders.productCol')}</th>
                      <th className="text-left p-4 text-sm font-medium text-industrial-gray">{t('orders.imageCol')}</th>
                      <th className="text-center p-4 text-sm font-medium text-industrial-gray">{t('orders.qtyCol')}</th>
                      <th className="text-right p-4 text-sm font-medium text-industrial-gray">{t('orders.unitPriceCol')}</th>
                      <th className="text-right p-4 text-sm font-medium text-industrial-gray">{t('orders.totalCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-air-blue/5'}>
                        <td className="p-4 text-sm text-industrial-gray">{item.product_name}</td>
                        <td className="p-4 text-sm">
                          { item.product_image_url ? (
                            <img src={item.product_image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-light-gray rounded flex items-center justify-center text-xs text-steel-gray">{t('orders.noImage')}</div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-center text-steel-gray">{item.quantity}</td>
                        <td className="p-4 text-sm text-right text-steel-gray">{formatPrice(item.unit_price)}</td>
                        <td className="p-4 text-sm text-right font-medium text-industrial-gray">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary-navy text-white">
                      <td colSpan={4} className="p-4 text-sm font-semibold text-right">{t('orders.grandTotal')}:</td>
                      <td className="p-4 text-sm font-bold text-right">{formatPrice(order.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab==='shipping' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-steel-gray">Teslimat Yöntemi</div>
                <div className="font-medium text-industrial-gray">{(order.shipping_method === 'express') ? 'Ekspres (1–2 iş günü)' : 'Standart (3–5 iş günü)'}</div>
              </div>
              <div>
                <div className="text-steel-gray">{t('orders.carrier')}</div>
                <div className="font-medium text-industrial-gray">{order.carrier || '-'}</div>
              </div>
              <div>
                <div className="text-steel-gray">{t('orders.trackingNumber')}</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-industrial-gray break-all">{order.tracking_number || '-'}</span>
                  {order.tracking_number && (
                    <button onClick={() => handleCopy(order.tracking_number)} className="text-xs text-primary-navy hover:underline"><Copy size={12}/>{t('orders.copy')}</button>
                  )}
                </div>
              </div>
              <div>
                <div className="text-steel-gray">{t('orders.trackingLink')}</div>
                {order.tracking_url ? (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary-navy hover:underline break-all inline-flex items-center gap-1"><LinkIcon size={14}/>{t('orders.openLink')}</a>
                ) : (
                  <div className="text-industrial-gray">-</div>
                )}
              </div>
              <div>
                <div className="text-steel-gray">{t('orders.shippedAt')}</div>
                <div className="font-medium text-industrial-gray">{formatDate(order.shipped_at)}</div>
              </div>
              <div>
                <div className="text-steel-gray">{t('orders.deliveredAt')}</div>
                <div className="font-medium text-industrial-gray">{formatDate(order.delivered_at)}</div>
              </div>
            </div>
          )}

          {tab==='invoice' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-industrial-gray">{t('orders.tabs.invoice')}</h4>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleInvoicePdf(order)} className="text-sm px-4 py-2 border rounded text-industrial-gray border-light-gray hover:bg-gray-50">{t('orders.invoicePdf')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

