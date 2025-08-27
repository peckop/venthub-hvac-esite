import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import toast from 'react-hot-toast'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface ReturnRow {
  id: string
  order_id: string
  reason: string
  description?: string | null
  status: string
  created_at: string
}

interface OrderLite { id: string; order_number?: string | null; created_at: string }

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
          if ((error as any).status === 404) {
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
        if (error && ((error as any).code === '42703' || (error as any).status === 400)) {
          const fb = await supabase
            .from('venthub_orders')
            .select('id, created_at')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
          data = fb.data as any
          error = fb.error as any
        }
        if (error) throw error
        if (mounted) setOrders((data || []) as OrderLite[])
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
        <div className="overflow-hidden bg-white rounded-xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-light-gray">
              <tr>
                <th className="text-left p-3 text-sm text-industrial-gray">{t('returns.order')}</th>
                <th className="text-left p-3 text-sm text-industrial-gray">{t('returns.reason')}</th>
                <th className="text-left p-3 text-sm text-industrial-gray">{t('returns.status')}</th>
                <th className="text-left p-3 text-sm text-industrial-gray">{t('returns.created')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-gray-50">
                  <td className="p-3 text-sm">
                    {(() => {
                      const o = orders.find(x => x.id === r.order_id)
                      const code = o?.order_number ? `#${o.order_number.split('-')[1]}` : `#${r.order_id.slice(-8).toUpperCase()}`
                      return <button onClick={() => navigate(`/account/orders?open=${r.order_id}`)} className="text-primary-navy hover:underline">{code}</button>
                    })()}
                  </td>
                  <td className="p-3 text-sm text-industrial-gray">{r.reason}</td>
                  <td className="p-3 text-sm">
                    <span className="px-2 py-1 rounded bg-air-blue/10 text-primary-navy text-xs font-medium">{r.status}</span>
                  </td>
                  <td className="p-3 text-sm text-steel-gray">{new Date(r.created_at).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

