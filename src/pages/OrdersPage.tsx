import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Package, Calendar, CreditCard, Eye, ChevronRight, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

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
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export const OrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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
        .select('id, user_id, total_amount, status, created_at, customer_name, customer_email, shipping_address, venthub_order_items ( id, product_name, quantity, price_at_time )')
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
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: Number(it.price_at_time) || 0,
          total_price: (Number(it.price_at_time) || 0) * (Number(it.quantity) || 0),
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
        }
      })

      setOrders(formattedOrders)
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
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
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
      case 'confirmed':
        return 'Onaylandı'
      case 'shipped':
        return 'Kargoya Verildi'
      case 'delivered':
        return 'Teslim Edildi'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

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
          <h1 className="text-3xl font-bold text-industrial-gray mb-2">
            Siparişlerim
          </h1>
          <p className="text-steel-gray">
            Geçmiş siparişlerinizi görüntüleyin ve takip edin
          </p>
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
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-hvac-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-light-gray">
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
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                              <p>{order.shipping_address.street}</p>
                              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                              <p>{order.shipping_address.postal_code}</p>
                              <p>{order.shipping_address.country}</p>
                            </div>
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
                                <th className="text-center p-4 text-sm font-medium text-industrial-gray">Adet</th>
                                <th className="text-right p-4 text-sm font-medium text-industrial-gray">Birim Fiyat</th>
                                <th className="text-right p-4 text-sm font-medium text-industrial-gray">Toplam</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_items?.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-air-blue/5'}>
                                  <td className="p-4 text-sm text-industrial-gray">{item.product_name}</td>
                                  <td className="p-4 text-sm text-center text-steel-gray">{item.quantity}</td>
                                  <td className="p-4 text-sm text-right text-steel-gray">{formatPrice(item.unit_price)}</td>
                                  <td className="p-4 text-sm text-right font-medium text-industrial-gray">{formatPrice(item.total_price)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-primary-navy text-white">
                                <td colSpan={3} className="p-4 text-sm font-semibold text-right">Genel Toplam:</td>
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