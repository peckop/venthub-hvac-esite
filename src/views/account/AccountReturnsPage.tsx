import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDate } from '../../i18n/datetime'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import { Routes } from '../../utils/routes'
import { Clock, CheckCircle, XCircle, Truck, Package, RefreshCw, Filter } from 'lucide-react'

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
  const { t, lang } = useI18n()
  const [rows, setRows] = useState<ReturnRow[]>([])
  const [orders, setOrders] = useState<OrderLite[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const searchParams = useSearchParams()
  const router = useRouter()

  const prefillOrderId = searchParams?.get('new') || ''

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
        user_id: user?.id || '',
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
      router.push(Routes.account.returns())
    } catch (e) {
      console.error(e)
      toast.error(t('returns.createError'))
    }
  }

  const statusClass = (s: string) => {
    const v = (s || '').toLowerCase()
    if (v === 'requested') return 'bg-yellow-100 text-yellow-800'
    if (v === 'approved' || v === 'in_transit' || v === 'received' || v === 'refunded') return 'bg-blue-100 text-blue-800'
    if (v === 'rejected' || v === 'cancelled') return 'bg-red-100 text-red-800'
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

  interface TimelineStep {
    key: string;
    label: string;
    completed: boolean;
    isCurrent?: boolean;
    isTerminal?: boolean;
  }

  const getReturnTimeline = (currentStatus: string): TimelineStep[] => {
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
    <div className="min-h-50vh">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
              <RefreshCw size={20} />
            </div>
            {t('returns.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">İade taleplerinizi oluşturun ve süreç durumunu takip edin.</p>
        </div>
        <button onClick={() => setOpenModal(true)} className="bg-primary-navy hover:bg-industrial-gray text-white font-bold h-10 px-6 rounded-lg shadow-sm shadow-primary-navy/20 transition-transform hover:scale-102 flex items-center gap-2 self-start sm:self-auto">
          {t('returns.new')}
        </button>
      </div>

      {/* Status Filter */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Filter size={12} /> Durum:</span>
            {[
              { value: 'all', label: `Tümü (${rows.length})` },
              { value: 'requested', label: 'Talep Edildi' },
              { value: 'approved', label: 'Onaylandı' },
              { value: 'in_transit', label: 'Kargoda' },
              { value: 'refunded', label: 'İade Edildi' },
              { value: 'rejected', label: 'Reddedildi' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`h-8 px-3.5 rounded-lg text-xs font-bold transition-colors border ${statusFilter === opt.value
                  ? 'bg-primary-navy text-white border-primary-navy shadow-sm shadow-primary-navy/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-navy hover:text-primary-navy'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-20vh flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz hiç iade talebiniz yok</h3>
          <p className="text-sm text-slate-500">{t('returns.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.filter(r => statusFilter === 'all' || r.status === statusFilter).map(r => {
            const o = orders.find(x => x.id === r.order_id)
            const code = o?.order_number ? `#${o.order_number.split('-')[1]}` : `#${r.order_id.slice(-8).toUpperCase()}`
            const timeline = getReturnTimeline(r.status)

            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-navy/5 text-primary-navy rounded-xl w-12 h-12 flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <button
                        onClick={() => router.push(Routes.account.orderDetail(r.order_id))}
                        className="text-lg font-bold text-slate-900 hover:text-primary-navy transition-colors"
                      >
                        Sipariş {code}
                      </button>
                      <div className="text-sm font-medium text-slate-500 mt-0.5">{formatDate(r.created_at, lang)}</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${statusClass(r.status)}`}>
                    {getStatusIcon(r.status)}
                    {getStatusLabel(r.status)}
                  </div>
                </div>

                {/* Return Details */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">İade Sebebi</span>
                    <span className="font-bold text-slate-900">{r.reason}</span>
                  </div>
                  {r.description && (
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Açıklama</span>
                      <span className="font-bold text-slate-900">{r.description}</span>
                    </div>
                  )}
                </div>

                {/* Progress Timeline */}
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-5 mt-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">İade Süreci</div>
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {timeline.map((step, index) => (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center min-w-80px">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-xs font-bold transition-colors ${step.completed
                              ? step.isTerminal && (step.key === 'rejected' || step.key === 'cancelled')
                                ? 'bg-red-500 text-white'
                                : 'bg-primary-navy text-white'
                              : 'bg-white border border-slate-200 text-slate-400'
                              }`}
                          >
                            {step.completed ? (
                              step.isTerminal && (step.key === 'rejected' || step.key === 'cancelled')
                                ? '✕'
                                : '✓'
                            ) : index + 1}
                          </div>
                          <span className={`mt-2 text-xs uppercase font-bold tracking-wider text-center ${step.completed ? 'text-primary-navy' : 'text-slate-400'
                            }`}>
                            {step.label}
                          </span>
                        </div>
                        {index < timeline.length - 1 && !step.isTerminal && (
                          <div className={`flex-1 h-1 rounded-full mx-2 ${step.completed ? 'bg-primary-navy' : 'bg-slate-100'
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
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setOpenModal(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpenModal(false) }}
            role="presentation"
          />
          <div 
            role="dialog"
            aria-modal="true"
            className="relative bg-white rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw size={20} className="text-primary-navy" />
                {t('returns.new')}
              </h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('returns.order')}</label>
                <select value={form.order_id} onChange={e => setForm(s => ({ ...s, order_id: e.target.value }))} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors">
                  <option value="">{t('returns.selectOrder')}</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`} • {formatDate(o.created_at, lang)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('returns.reason')}</label>
                <select value={form.reason} onChange={e => setForm(s => ({ ...s, reason: e.target.value }))} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors">
                  <option value="">{t('returns.selectReason')}</option>
                  {reasonOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('returns.description')}</label>
                <textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors resize-none" rows={4} placeholder={t('returns.descriptionPh')} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setOpenModal(false)} className="h-10 px-5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">{t('common.cancel') || 'İptal'}</button>
              <button onClick={handleCreate} className="h-10 px-5 text-sm font-bold text-white bg-primary-navy hover:bg-industrial-gray rounded-lg shadow-sm shadow-primary-navy/20 transition-transform hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50">{t('returns.submit')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





