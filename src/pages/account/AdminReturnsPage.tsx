import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Package, Clock, CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkAdminAccess } from '../../config/admin'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass, adminCardClass } from '../../utils/adminUi'

interface ReturnWithOrder {
  id: string
  order_id: string
  user_id: string
  reason: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
  // Order details
  order_number?: string
  customer_name?: string
  customer_email?: string
  total_amount?: number
}

type SortKey = 'order' | 'customer' | 'reason' | 'status' | 'date' | 'amount'

// Interface removed - not used

export default function AdminReturnsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const _t = useI18n() // Prefix with underscore to indicate intentionally unused
  
  const [returns, setReturns] = useState<ReturnWithOrder[]>([])
  const [filteredReturns, setFilteredReturns] = useState<ReturnWithOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // Çoklu durum filtresi
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>({
    requested: true,
    approved: true,
    rejected: true,
    in_transit: true,
    received: true,
    refunded: true,
    cancelled: true
  })
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  // Sıralama durumu
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Admin kontrolü
  useEffect(() => {
    let mounted = true
    async function loadRole() {
      try {
        if (!user) { 
          setIsAdmin(false); 
          return 
        }
        
        // Merkezi admin kontrolü
        if (checkAdminAccess(user)) {
          if (mounted) {
            setIsAdmin(true)
          }
          return
        }
        
        // Production admin check
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
          
        if (!mounted) return
        
        if (!error && data && (data as { role?: string }).role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        console.error('loadRole error:', err)
        if (mounted) setIsAdmin(false)
      }
    }
    loadRole()
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login', { replace: true, state: { from: { pathname: '/admin/returns' } } })
      return
    }
  }, [user, loading, navigate])

  // İade taleplerini yükle
  useEffect(() => {
    let mounted = true
    async function loadReturns() {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        // İade taleplerini ve sipariş bilgilerini birlikte getir
        const { data, error } = await supabase
          .from('venthub_returns')
          .select(`
            id, order_id, user_id, reason, description, status, created_at, updated_at,
            venthub_orders!inner (
              order_number, customer_name, customer_email, total_amount
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (mounted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = (data || []).map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            user_id: item.user_id,
            reason: item.reason,
            description: item.description,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            order_number: item.venthub_orders?.order_number,
            customer_name: item.venthub_orders?.customer_name,
            customer_email: item.venthub_orders?.customer_email,
            total_amount: item.venthub_orders?.total_amount,
          })) as ReturnWithOrder[]
          
          setReturns(mapped)
        }
      } catch (error) {
        console.error('Returns load error:', error)
        toast.error('İade talepleri yüklenemedi')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadReturns()
    return () => { mounted = false }
  }, [isAdmin, user])

  // Filtreleme
  useEffect(() => {
    let filtered = returns

    // Durum filtresi (çoklu)
    const anyStatus = Object.values(statusFilter).some(Boolean)
    if (anyStatus) {
      filtered = filtered.filter(r => statusFilter[r.status] === true)
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.order_number?.toLowerCase().includes(query) ||
        r.customer_name?.toLowerCase().includes(query) ||
        r.customer_email?.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query)
      )
    }

    setFilteredReturns(filtered)
  }, [returns, statusFilter, searchQuery])

  // Sıralama
  const sortedReturns = React.useMemo(() => {
    const arr = [...filteredReturns]
    arr.sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'order': {
          const ao = a.order_number ? a.order_number : a.order_id
          const bo = b.order_number ? b.order_number : b.order_id
          return dir * String(ao).localeCompare(String(bo))
        }
        case 'customer':
          return dir * String(a.customer_name||'').localeCompare(String(b.customer_name||''), 'tr')
        case 'reason':
          return dir * a.reason.localeCompare(b.reason, 'tr')
        case 'status':
          return dir * a.status.localeCompare(b.status)
        case 'amount':
          return dir * (Number(a.total_amount||0) - Number(b.total_amount||0))
        case 'date':
          return dir * (Date.parse(a.created_at) - Date.parse(b.created_at))
        default:
          return 0
      }
    })
    return arr
  }, [filteredReturns, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key==='date' ? 'desc' : 'asc') }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? '▲' : '▼'
  }

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    if (!isAdmin) return
    
    const returnItem = returns.find(r => r.id === returnId)
    if (!returnItem) return
    
    try {
      setUpdatingStatus(returnId)
      
      const oldStatus = returnItem.status
      
      const { error } = await supabase
        .from('venthub_returns')
        .update({ status: newStatus })
        .eq('id', returnId)

      if (error) throw error

      // Local state güncelle
      setReturns(prev => prev.map(r => 
        r.id === returnId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
      ))

      toast.success(`İade durumu "${getStatusLabel(newStatus)}" olarak güncellendi`)

      // Müşteriye e-posta bildirimi gönder
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const functionUrl = `${supabaseUrl}/functions/v1/return-status-notification`
        
        await fetch(functionUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            return_id: returnId,
            order_id: returnItem.order_id,
            order_number: returnItem.order_number,
            customer_email: returnItem.customer_email,
            customer_name: returnItem.customer_name,
            old_status: oldStatus,
            new_status: newStatus,
            reason: returnItem.reason,
            description: returnItem.description
          })
        })
        
        toast.success('Müşteriye e-posta bildirimi gönderildi')
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        toast.error('E-posta bildirimi gönderilemedi, ancak durum güncellendi')
      }
      
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('İade durumu güncellenemedi')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      requested: 'Talep Alındı',
      approved: 'Onaylandı', 
      rejected: 'Reddedildi',
      in_transit: 'Kargoda (İade)',
      received: 'İade Teslim Alındı',
      refunded: 'İade Ücreti Ödendi',
      cancelled: 'İptal Edildi'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="text-yellow-600" size={16} />
      case 'approved': return <CheckCircle className="text-green-600" size={16} />
      case 'rejected': return <XCircle className="text-red-600" size={16} />
      case 'in_transit': return <Truck className="text-blue-600" size={16} />
      case 'received': return <Package className="text-purple-600" size={16} />
      case 'refunded': return <CheckCircle className="text-green-700" size={16} />
      case 'cancelled': return <XCircle className="text-gray-600" size={16} />
      default: return <RefreshCw className="text-gray-400" size={16} />
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'received': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'refunded': return 'bg-green-200 text-green-900 border-green-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'requested', label: 'Talep Alındı' },
    { value: 'approved', label: 'Onaylandı' },
    { value: 'rejected', label: 'Reddedildi' },
    { value: 'in_transit', label: 'Kargoda (İade)' },
    { value: 'received', label: 'İade Teslim Alındı' },
    { value: 'refunded', label: 'İade Ücreti Ödendi' },
    { value: 'cancelled', label: 'İptal Edildi' },
  ]

  const nextStatuses: Record<string, string[]> = {
    requested: ['approved', 'rejected'],
    approved: ['in_transit', 'cancelled'],
    rejected: [],
    in_transit: ['received', 'cancelled'],
    received: ['refunded'],
    refunded: [],
    cancelled: []
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Erişim Reddedildi</h2>
          <p className="text-steel-gray mt-2">Bu sayfaya erişmek için admin yetkisi gerekiyor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={adminSectionTitleClass}>İade Yönetimi</h2>
        <div className="text-sm text-steel-gray">Toplam {returns.length} iade talebi</div>
      </div>

      {/* Filtreler */}
      <div className={`${adminCardClass} p-4 flex flex-col sm:flex-row gap-4`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray" size={16} />
          <input
            type="text"
            placeholder="Sipariş no, müşteri adı, email veya sebep ile ara"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
          />
        </div>
        {/* Çoklu durum filtresi */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {statusOptions.filter(o=>o.value!=='all').map(option => (
            <label key={option.value} className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!statusFilter[option.value]}
                onChange={(e)=>setStatusFilter(prev=>({ ...prev, [option.value]: e.target.checked }))}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* İçerik */}
      {isLoading ? (
        <div className={`${adminCardClass} min-h-[20vh] flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy"/>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className={`${adminCardClass} text-center py-8`}>
          <div className="text-steel-gray">
{searchQuery || !Object.values(statusFilter).every(Boolean)
              ? 'Filtrelere uygun iade talebi bulunamadı.' 
              : 'Henüz iade talebi yok.'}
          </div>
        </div>
      ) : (
        <div className={`${adminCardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={adminTableHeadCellClass}><button type="button" className="hover:underline" onClick={()=>toggleSort('order')}>Sipariş {sortIndicator('order')}</button></th>
                  <th className={adminTableHeadCellClass}><button type="button" className="hover:underline" onClick={()=>toggleSort('customer')}>Müşteri {sortIndicator('customer')}</button></th>
                  <th className={adminTableHeadCellClass}><button type="button" className="hover:underline" onClick={()=>toggleSort('reason')}>Sebep {sortIndicator('reason')}</button></th>
                  <th className={adminTableHeadCellClass}><button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>Durum {sortIndicator('status')}</button></th>
                  <th className={adminTableHeadCellClass}><button type="button" className="hover:underline" onClick={()=>toggleSort('date')}>Tarih {sortIndicator('date')}</button></th>
                  <th className={adminTableHeadCellClass}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {sortedReturns.map((returnItem, index) => {
                  const orderNo = returnItem.order_number ? 
                    `#${returnItem.order_number.split('-')[1]}` : 
                    `#${returnItem.order_id.slice(-8).toUpperCase()}`
                  
                  return (
                    <tr key={returnItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className={adminTableCellClass}>
                        <div className="flex flex-col">
                          <button
                            onClick={() => navigate(`/account/orders/${returnItem.order_id}`)}
                            className="text-primary-navy hover:underline font-medium text-left"
                          >
                            {orderNo}
                          </button>
                          {returnItem.total_amount && (
                            <span className="text-xs text-steel-gray">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(returnItem.total_amount))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={adminTableCellClass}>
                        <div className="flex flex-col">
                          <span className="font-medium text-industrial-gray">{returnItem.customer_name}</span>
                          <span className="text-xs text-steel-gray">{returnItem.customer_email}</span>
                        </div>
                      </td>
                      <td className={adminTableCellClass}>
                        <div className="max-w-xs">
                          <div className="font-medium text-industrial-gray">{returnItem.reason}</div>
                          {returnItem.description && (
                            <div className="text-xs text-steel-gray mt-1 truncate" title={returnItem.description}>
                              {returnItem.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={adminTableCellClass}>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                          {getStatusIcon(returnItem.status)}
                          {getStatusLabel(returnItem.status)}
                        </div>
                      </td>
                      <td className={adminTableCellClass}>
                        <div className="flex flex-col">
                          <span className="font-medium">{new Date(returnItem.created_at).toLocaleDateString('tr-TR')}</span>
                          <span className="text-xs text-steel-gray">{new Date(returnItem.created_at).toLocaleTimeString('tr-TR')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {nextStatuses[returnItem.status]?.map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(returnItem.id, status)}
                              disabled={updatingStatus === returnItem.id}
                              className="px-2 py-1 text-xs bg-primary-navy text-white rounded hover:bg-primary-navy/90 disabled:opacity-50"
                              title={`${getStatusLabel(status)} olarak işaretle`}
                            >
                              {updatingStatus === returnItem.id ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  {getStatusLabel(status)}
                                  <ChevronRight size={12} className="inline ml-1" />
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
