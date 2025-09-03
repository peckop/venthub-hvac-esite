import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import toast from 'react-hot-toast'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Truck, Package, RefreshCw } from 'lucide-react'

interface ReturnRow {
  id: string
  order_id: string
  reason: string
  description?: string | null
  status: string
  created_at: string
}

interface OrderLite { id: string; order_number: string; created_at: string }

interface SupabaseError {
  code?: string
  status?: number
  message?: string
}

export default function AccountReturnsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [rows, setRows] = useState<ReturnRow[]>([])
  const [orders, setOrders] = useState<OrderLite[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const prefillOrderId = searchParams.get('new') || ''

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const { data: list, error } = await supabase
          .from('venthub_returns')
          .select('id, order_id, reason, description, status, created_at')
          .order('created_at', { ascending: false })
        if (error) {
          // Table yoksa (404) boş liste göster, toast yapma
          if ((error as SupabaseError).status === 404) {
            if (mounted) setRows([])
          } else {
            throw error
          }
        } else {
          if (mounted) setRows((list || []) as ReturnRow[])
        }
      } catch (e) {
        console.warn('Returns load error', e)
        toast.error(t('returns.fetchError'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (user) load()
    return () => { mounted = false }
  }, [user, t])

  useEffect(() => {
    let mounted = true
    async function loadOrders() {
      try {
        let { data, error } = await supabase
          .from('venthub_orders')
          .select('id, order_number, created_at')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
        if (error && ((error as SupabaseError).code === '42703' || (error as SupabaseError).status === 400)) {
          const fb = await supabase
            .from('venthub_orders')
            .select('id, created_at')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
          data = fb.data as OrderLite[]
          error = fb.error
        }
        if (error) throw error
        if (mounted) setOrders((data || []).map(o => ({
          id: o.id,
          created_at: o.created_at,
          order_number: o.order_number || o.id,
        })))
      } catch (e) {
        console.warn('Orders for returns load error', e)
      }
    }
    if (user) loadOrders()
    return () => { mounted = false }
  }, [user])

  const [form, setForm] = useState({ order_id: prefillOrderId, reason: '', description: '' })
  
  // Açılışta ?new=<order_id> varsa modalı otomatik aç
  useEffect(() => {
    if (prefillOrderId) {
      setOpenModal(true)
    }
  }, [prefillOrderId])
  const reasonOptions = useMemo(() => (
    [
      'Yanlış ürün/eksik parça',
      'Hasarlı ürün',
      'Uyumsuz/istenen özelliklerde değil',
      'Fikrim değişti',
      'Diğer'
    ]
  ), [])

  const handleCreate = async () => {
    try {
      if (!form.order_id || !form.reason) {
        toast.error(t('returns.required'))
        return
      }
      const payload = {
        order_id: form.order_id,
        user_id: user?.id,
        reason: form.reason,
        description: form.description || null
      }
      const { error } = await supabase.from('venthub_returns').insert(payload)
      if (error) throw error
      toast.success(t('returns.createdToast'))
      setOpenModal(false)
      setForm({ order_id: '', reason: '', description: '' })
      // refresh
      const { data: list } = await supabase
        .from('venthub_returns')
        .select('id, order_id, reason, description, status, created_at')
        .order('created_at', { ascending: false })
      setRows((list || []) as ReturnRow[])
      navigate('/account/returns')
    } catch (e) {
      console.error(e)
      toast.error(t('returns.createError'))
    }
  }

  const statusClass = (s: string) => {
    const v = (s || '').toLowerCase()
    if (v==='requested') return 'bg-yellow-100 text-yellow-800'
    if (v==='approved' || v==='in_transit' || v==='received' || v==='refunded') return 'bg-blue-100 text-blue-800'
    if (v==='rejected' || v==='cancelled') return 'bg-red-100 text-red-800'
    return 'bg-air-blue/10 text-primary-navy'
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

  const getStatusLabel = (status: string): string => {
    return t(`returns.statusLabels.${status}`) || status
  }

  const getReturnTimeline = (currentStatus: string) => {
    const allSteps = [
      { key: 'requested', label: 'Talep Alındı' },
      { key: 'approved', label: 'Onaylandı' },
      { key: 'in_transit', label: 'Kargoda (İade)' },
      { key: 'received', label: 'İade Teslim Alındı' },
      { key: 'refunded', label: 'İade Ücreti Ödendi' }
    ]
    
    // Rejected/cancelled are terminal states that don't follow the normal flow
    if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
      return [
        { key: 'requested', label: 'Talep Alındı', completed: true },
        { key: currentStatus, label: getStatusLabel(currentStatus), completed: true, isTerminal: true }
      ]
    }
    
    const currentIndex = allSteps.findIndex(step => step.key === currentStatus)
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      isCurrent: index === currentIndex
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-industrial-gray">{t('returns.title')}</h2>
        <button onClick={() => setOpenModal(true)} className="px-4 py-2 text-sm bg-primary-navy text-white rounded hover:bg-secondary-blue">{t('returns.new')}</button>
      </div>

      {loading ? (
        <div className="min-h-[20vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy"/>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-steel-gray">{t('returns.empty')}</div>
      ) : (
        <div className="space-y-4">
          {rows.map(r => {
            const o = orders.find(x => x.id === r.order_id)
            const code = o?.order_number ? `#${o.order_number.split('-')[1]}` : `#${r.order_id.slice(-8).toUpperCase()}`
            const timeline = getReturnTimeline(r.status)
            
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-navy text-white rounded-full w-10 h-10 flex items-center justify-center">
                      <Package size={18} />
                    </div>
                    <div>
                      <button 
                        onClick={() => navigate(`/account/orders/${r.order_id}`)} 
                        className="font-semibold text-primary-navy hover:underline"
                      >
                        {code}
                      </button>
                      <div className="text-xs text-steel-gray">{new Date(r.created_at).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusClass(r.status)}`}>
                    {getStatusIcon(r.status)}
                    {getStatusLabel(r.status)}
                  </div>
                </div>
                
                {/* Return Details */}
                <div className="mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-steel-gray">İade Sebebi:</span> 
                    <span className="text-industrial-gray ml-2">{r.reason}</span>
                  </div>
                  {r.description && (
                    <div className="text-sm mt-1">
                      <span className="font-medium text-steel-gray">Açıklama:</span>
                      <span className="text-industrial-gray ml-2">{r.description}</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Timeline */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-steel-gray mb-3">İade Süreci</div>
                  <div className="flex items-center justify-between">
                    {timeline.map((step, index) => (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center min-w-[60px]">
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.completed 
                                ? step.isTerminal && (step.key === 'rejected' || step.key === 'cancelled')
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-success-green text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {step.completed ? (
                              step.isTerminal && (step.key === 'rejected' || step.key === 'cancelled') 
                                ? '✕' 
                                : '✓'
                            ) : index + 1}
                          </div>
                          <span className={`mt-1 text-[10px] text-center leading-tight ${
                            step.completed ? 'text-industrial-gray font-medium' : 'text-steel-gray'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {index < timeline.length - 1 && !step.isTerminal && (
                          <div className={`flex-1 h-0.5 mx-2 ${
                            step.completed ? 'bg-success-green' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setOpenModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-industrial-gray mb-3">{t('returns.new')}</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-steel-gray mb-1">{t('returns.order')}</label>
                <select value={form.order_id} onChange={e=>setForm(s=>({ ...s, order_id: e.target.value }))} className="w-full border border-light-gray rounded px-2 py-2 text-sm">
                  <option value="">{t('returns.selectOrder')}</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`} • {new Date(o.created_at).toLocaleDateString('tr-TR')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-steel-gray mb-1">{t('returns.reason')}</label>
                <select value={form.reason} onChange={e=>setForm(s=>({ ...s, reason: e.target.value }))} className="w-full border border-light-gray rounded px-2 py-2 text-sm">
                  <option value="">{t('returns.selectReason')}</option>
                  {reasonOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-steel-gray mb-1">{t('returns.description')}</label>
                <textarea value={form.description} onChange={e=>setForm(s=>({ ...s, description: e.target.value }))} className="w-full border border-light-gray rounded px-2 py-2 text-sm" rows={4} placeholder={t('returns.descriptionPh')}/>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setOpenModal(false)} className="px-4 py-2 text-sm text-steel-gray hover:text-industrial-gray">{t('common.cancel') || 'İptal'}</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-primary-navy text-white rounded hover:bg-secondary-blue">{t('returns.submit')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

