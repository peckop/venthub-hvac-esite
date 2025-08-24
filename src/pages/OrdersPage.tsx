import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Package, Calendar, CreditCard, Eye, ChevronRight, ShoppingBag, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart'

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  customer_name: string
  customer_email: string
  shipping_address: any
  order_items: OrderItem[]
  order_number?: string
  is_demo?: boolean
  payment_data?: any
  conversation_id?: string
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

export const OrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'paid'|'shipped'|'delivered'|'failed'>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchCode, setSearchCode] = useState<string>('')
  const [productFilter, setProductFilter] = useState<string>('')

  const { addToCart } = useCart()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login', { 
        state: { from: { pathname: '/orders' } }
      })
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      // Gerçek siparişler: venthub_orders + venthub_order_items (nested)
      const { data: ordersData, error: ordersError } = await supabase
        .from('venthub_orders')
        .select('id, user_id, total_amount, status, created_at, customer_name, customer_email, shipping_address, conversation_id, venthub_order_items ( id, product_id, product_name, quantity, price_at_time, product_image_url )')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        toast.error('Siparişler yüklenirken hata oluştu')
        return
      }

      const formattedOrders: Order[] = (ordersData || []).map((order: any) => {
        const items = (order.venthub_order_items || []).map((it: any) => ({
          id: it.id,
          product_id: it.product_id || undefined,
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: Number(it.price_at_time) || 0,
          total_price: (Number(it.price_at_time) || 0) * (Number(it.quantity) || 0),
          product_image_url: it.product_image_url || undefined,
        }))

        return {
          id: order.id,
          total_amount: Number(order.total_amount) || 0,
          status: order.status || 'pending',
          created_at: order.created_at,
          customer_name: order.customer_name || (user?.user_metadata?.full_name || user?.email || 'Kullanıcı'),
          customer_email: order.customer_email || user?.email || '-',
          shipping_address: order.shipping_address,
          order_items: items,
          order_number: order.order_number,
          is_demo: false,
          payment_data: order.payment_data,
          conversation_id: order.conversation_id,
        }
      })

      setOrders(formattedOrders)

      // Auto-open behavior if URL contains ?open={orderId}
      const openId = searchParams.get('open')
      if (openId) {
        const found = formattedOrders.find(o => o.id === openId)
        if (found) setSelectedOrder(found)
      }

      // Apply product filter from URL (?product=...)
      const productQ = searchParams.get('product')
      if (productQ) setProductFilter(productQ)
    } catch (error) {
      console.error('Orders fetch error:', error)
      toast.error('Beklenmeyen hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
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
        return 'Beklemede'
      case 'paid':
      case 'confirmed':
        return 'Ödendi'
      case 'shipped':
        return 'Kargoya Verildi'
      case 'delivered':
        return 'Teslim Edildi'
      case 'failed':
      case 'cancelled':
        return 'Başarısız'
      default:
        return status
    }
  }

  const steps = ['pending','paid','shipped','delivered']
  const stepLabel: Record<string,string> = { pending:'Ödeme Bekleniyor', paid:'Ödendi', shipped:'Kargoda', delivered:'Teslim Edildi' }

  const handlePrintReceipt = (order: Order) => {
    const w = window.open('', '_blank', 'width=720,height=900')
    if (!w) return
    const itemsHtml = (order.order_items || [])
      .map(it => `<tr><td style="padding:6px 0">${it.product_name}</td><td style="text-align:center">${it.quantity}</td><td style="text-align:right">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(it.unit_price)}</td><td style="text-align:right">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(it.total_price)}</td></tr>`) 
      .join('')
    const total = new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(order.total_amount)
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Makbuz</title></head><body style="font-family:Arial,sans-serif;padding:24px"><h2>Venthub Sipariş Makbuzu</h2><p><strong>Sipariş ID:</strong> ${order.id}<br/><strong>Tarih:</strong> ${new Date(order.created_at).toLocaleString('tr-TR')}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Ürün</th><th>Adet</th><th align="right">Birim</th><th align="right">Toplam</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="3" align="right"><strong>Genel Toplam</strong></td><td align="right"><strong>${total}</strong></td></tr></tfoot></table><hr/><p>3D Secure ile korunan ödeme işlemi.</p><script>window.print();</script></body></html>`)
    w.document.close()
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
      const code = o.id.slice(-8).toUpperCase()
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

  // Reorder handler
  const handleCopy = async (text?: string) => {
    try {
      if (!text) return
      await navigator.clipboard.writeText(text)
      toast.success('Kopyalandı')
    } catch {
      toast.error('Kopyalanamadı')
    }
  }

  const handleReorder = async (order: Order) => {
    try {
      const ids = Array.from(new Set((order.order_items||[]).map(it=>it.product_id).filter(Boolean))) as string[]
      const names = Array.from(new Set((order.order_items||[]).filter(it=>!it.product_id && it.product_name).map(it=>it.product_name)))

      const productMap: Record<string, any> = {}

      if (ids.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('id', ids)
        if (error) throw error
        ;(data||[]).forEach((p:any)=>{productMap[p.id]=p})
      }

      if (names.length > 0) {
        const { data, error } = await supabase.from('products').select('*').in('name', names)
        if (error) throw error
        ;(data||[]).forEach((p:any)=>{productMap[p.name]=p})
      }

      let added = 0
      for (const it of order.order_items||[]) {
        let prod: any
        if (it.product_id) prod = productMap[it.product_id]
        if (!prod) prod = productMap[it.product_name]
        if (prod) {
          addToCart({
            ...prod,
            price: String(prod.price)
          }, it.quantity)
          added += it.quantity
        }
      }

      if (added>0) toast.success(`${added} adet ürün sepete eklendi`)
      else toast.error('Ürünler stokta bulunamadı')
    } catch (e:any) {
      console.error('Reorder error', e)
      toast.error('Tekrar satın alma sırasında hata')
    }
  }

  return (
    <div className="min-h-screen bg-clean-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-industrial-gray mb-2">
            Siparişlerim
          </h1>
          <p className="text-steel-gray">
            Geçmiş siparişlerinizi görüntüleyin ve takip edin
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-hvac-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-steel-gray">Durum</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="w-full border border-light-gray rounded px-2 py-2 text-sm">
                <option value="all">Hepsi</option>
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="failed">Başarısız</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-steel-gray">Başlangıç</label>
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="w-full border border-light-gray rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-steel-gray">Bitiş</label>
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="w-full border border-light-gray rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-steel-gray">Sipariş Kodu (son 8)</label>
              <input type="text" placeholder="örn. 7016DD05" value={searchCode} onChange={e=>setSearchCode(e.target.value)} className="w-full border border-light-gray rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-steel-gray">Ürün</label>
              <input type="text" placeholder="Ürün adına göre ara" value={productFilter} onChange={e=>setProductFilter(e.target.value)} className="w-full border border-light-gray rounded px-2 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={()=>{setStatusFilter('all');setDateFrom('');setDateTo('');setSearchCode('');setProductFilter('')}} className="text-sm text-steel-gray hover:text-primary-navy">Filtreleri Temizle</button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-hvac-md p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-steel-gray mb-4" />
            <h3 className="text-xl font-semibold text-industrial-gray mb-2">
              Henüz siparişiniz yok
            </h3>
            <p className="text-steel-gray mb-6">
              İlk siparişinizi vermek için ürünleri keşfedin
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ürünleri Keşfet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-hvac-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-light-gray">
                  {/* Status Stepper */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      {steps.map((s, idx) => {
                        const activeIdx = Math.max(steps.indexOf(order.status.toLowerCase()), 0)
                        const active = idx <= activeIdx
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center min-w-[80px]">
                              <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${active ? 'bg-success-green text-white' : 'bg-light-gray text-steel-gray'}`}>{idx+1}</div>
                              <span className="mt-1 text-[11px] text-steel-gray">{stepLabel[s]}</span>
                            </div>
                            {idx < steps.length-1 && (
                              <div className={`flex-1 h-1 ${activeIdx >= idx+1 ? 'bg-success-green' : 'bg-light-gray'}`}></div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-navy text-white rounded-full w-12 h-12 flex items-center justify-center">
                        <Package size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-industrial-gray">
                          {order.order_number ? `Sipariş #${order.order_number.split('-')[1]}` : `Sipariş #${order.id.slice(-8).toUpperCase()}`}
                          {order.is_demo && (
                            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                              DEMO
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-steel-gray">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard size={16} />
                            <span>{formatPrice(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="flex items-center space-x-1 text-primary-navy hover:text-secondary-blue"
                      >
                        <Eye size={20} />
                        <span className="text-sm font-medium">Detaylar</span>
                        <ChevronRight 
                          size={16} 
                          className={`transform transition-transform ${
                            selectedOrder?.id === order.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {selectedOrder?.id === order.id && (
                  <div className="p-6 bg-air-blue/10">
                    {/* Customer + Order Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-industrial-gray mb-3">Müşteri Bilgileri</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Ad:</span> {order.customer_name}</p>
                          <p><span className="font-medium">E-posta:</span> {order.customer_email}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-industrial-gray mb-3">Teslimat Adresi</h4>
                        <div className="text-sm text-steel-gray">
                          {order.shipping_address && (
                            <div>
                              <p>{order.shipping_address?.fullAddress || order.shipping_address?.street}</p>
                              <p>
                                {order.shipping_address?.city}
                                {order.shipping_address?.district ? `, ${order.shipping_address.district}` : (order.shipping_address?.state ? `, ${order.shipping_address.state}` : '')}
                              </p>
                              <p>{order.shipping_address?.postalCode || order.shipping_address?.postal_code}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-industrial-gray mb-3">Sipariş Bilgileri</h4>
                        <div className="text-sm text-steel-gray space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">Sipariş ID</span>
                            <button onClick={() => handleCopy(order.id)} className="text-xs text-primary-navy hover:underline">Kopyala</button>
                          </div>
                          <div className="p-2 bg-light-gray rounded break-all" title={order.id}>{order.id}</div>
                          {order.conversation_id && (
                            <>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">Conversation ID</span>
                                <button onClick={() => handleCopy(order.conversation_id!)} className="text-xs text-primary-navy hover:underline">Kopyala</button>
                              </div>
                              <div className="p-2 bg-light-gray rounded break-all" title={order.conversation_id}>{order.conversation_id}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.order_items && order.order_items.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-industrial-gray mb-3">Sipariş Detayları</h4>
                        <div className="bg-white rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-light-gray">
                              <tr>
                                <th className="text-left p-4 text-sm font-medium text-industrial-gray">Ürün</th>
                                <th className="text-left p-4 text-sm font-medium text-industrial-gray">Görsel</th>
                                <th className="text-center p-4 text-sm font-medium text-industrial-gray">Adet</th>
                                <th className="text-right p-4 text-sm font-medium text-industrial-gray">Birim Fiyat</th>
                                <th className="text-right p-4 text-sm font-medium text-industrial-gray">Toplam</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_items?.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-air-blue/5'}>
                                  <td className="p-4 text-sm text-industrial-gray">{item.product_name}</td>
                                  <td className="p-4 text-sm">
                                    {/** eslint-disable-next-line @next/next/no-img-element */}
                                    { item.product_image_url ? (
                                      <img src={item.product_image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                                    ) : (
                                      <div className="w-12 h-12 bg-light-gray rounded flex items-center justify-center text-xs text-steel-gray">Yok</div>
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
                                <td colSpan={4} className="p-4 text-sm font-semibold text-right">Genel Toplam:</td>
                                <td className="p-4 text-sm font-bold text-right">{formatPrice(order.total_amount)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-industrial-gray mb-3">Sipariş Detayları</h4>
                        <div className="bg-white rounded-lg p-6 text-center">
                          <p className="text-steel-gray mb-2">Ürün detayları bulunamadı</p>
                          {order.is_demo && (
                            <p className="text-sm text-orange-600">
                              Bu demo siparişi test amaçlıdır
                            </p>
                          )}
                          <div className="mt-4 p-4 bg-primary-navy text-white rounded-lg">
                            <p className="font-semibold">Toplam Tutar: {formatPrice(order.total_amount)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => handleReorder(order)} className="text-sm px-4 py-2 border rounded text-success-green border-success-green hover:bg-success-green hover:text-white transition-colors flex items-center gap-2"><RefreshCcw size={14}/>Tekrar Satın Al</button>
                      <button onClick={() => handlePrintReceipt(order)} className="text-sm px-4 py-2 border rounded text-primary-navy border-primary-navy hover:bg-primary-navy hover:text-white transition-colors">Makbuzu Gör</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage