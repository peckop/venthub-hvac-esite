import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSupabase } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, Package, Clock, CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkAdminAccess } from '../../config/admin'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass, adminCardClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import ExportMenu from '../../components/admin/ExportMenu'
import { formatDateTime, formatDate, formatTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
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
  const { t: _t, lang } = useI18n()
  
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
        const supabase = await getSupabase()
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

  // Dashboard'tan gelen status parametresini uygula
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const stParam = params.get('status')
    if (stParam) {
      const next = { ...statusFilter }
      Object.keys(next).forEach(k => { next[k] = false })
      stParam.split(',').forEach(s => { const key = s.trim(); if (key in next) (next as Record<string, boolean>)[key] = true })
      setStatusFilter(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, _t])

  // İade taleplerini yükle
  useEffect(() => {
    let mounted = true
    async function loadReturns() {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        
        // İade taleplerini ve sipariş bilgilerini birlikte getir
        const supabase = await getSupabase()
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
        toast.error(_t('admin.returns.toasts.returnsLoadFailed') as string)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadReturns()
    return () => { mounted = false }
  }, [isAdmin, user, _t])

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
      
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('venthub_returns')
        .update({ status: newStatus })
        .eq('id', returnId)

      if (error) throw error

      // Audit log
      try {
        const { logAdminAction } = await import('../../lib/audit')
        await logAdminAction(supabase, {
          table_name: 'venthub_returns',
          row_pk: returnId,
          action: 'UPDATE',
          before: { status: oldStatus },
          after: { status: newStatus },
          comment: 'return status update'
        })
      } catch {}

      // Local state güncelle
      setReturns(prev => prev.map(r => 
        r.id === returnId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
      ))

      toast.success(_t('admin.returns.toasts.statusUpdated', { status: getStatusLabel(newStatus) }) as string)

      // Mock refund integration: when new_status = refunded, call refund-order-mock
      if (newStatus === 'refunded') {
        try {
          const { error: refundErr } = await supabase.functions.invoke('refund-order-mock', {
            body: { order_id: returnItem.order_id, reason: `return:${returnId}` }
          })
          if (refundErr) throw refundErr
        } catch (re) {
          console.error('Mock refund failed:', re)
          // Devam: iade statüsü yine de güncel kaldı
        }
      }

      // Müşteriye e-posta bildirimi gönder
      try {
        const { error: invokeError } = await supabase.functions.invoke('return-status-notification', {
          body: {
            return_id: returnId,
            order_id: returnItem.order_id,
            order_number: returnItem.order_number,
            customer_email: returnItem.customer_email,
            customer_name: returnItem.customer_name,
            old_status: oldStatus,
            new_status: newStatus,
            reason: returnItem.reason,
            description: returnItem.description
          }
        })
        if (invokeError) throw invokeError
        toast.success(_t('admin.returns.toasts.emailNotifySent') as string)
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        toast.error(_t('admin.returns.toasts.emailNotifyFailed') as string)
      }
      
    } catch (error) {
      console.error('Status update error:', error)
      toast.error(_t('admin.returns.toasts.statusUpdateFailed') as string)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusLabel = (status: string): string => {
    return (_t(`admin.returns.statusLabels.${status}`) as string) || status
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
    { value: 'all', label: _t('admin.ui.all') },
    { value: 'requested', label: _t('admin.returns.statusLabels.requested') },
    { value: 'approved', label: _t('admin.returns.statusLabels.approved') },
    { value: 'rejected', label: _t('admin.returns.statusLabels.rejected') },
    { value: 'in_transit', label: _t('admin.returns.statusLabels.in_transit') },
    { value: 'received', label: _t('admin.returns.statusLabels.received') },
    { value: 'refunded', label: _t('admin.returns.statusLabels.refunded') },
    { value: 'cancelled', label: _t('admin.returns.statusLabels.cancelled') },
  ]

  const nextStatuses: Record<string, string[]> = {
    requested: ['approved', 'cancelled'],
    approved: ['in_transit', 'cancelled'],
    rejected: [],
    in_transit: ['received', 'cancelled'],
    received: ['refunded'],
    refunded: [],
    cancelled: []
  }

  // Görünür kolonlar ve yoğunluk (erken - hooks unconditional)
  const STORAGE_KEY = 'toolbar:returns'
  const [visibleCols, setVisibleCols] = useState<{ order: boolean; customer: boolean; reason: boolean; status: boolean; date: boolean }>({ order: true, customer: true, reason: true, status: true, date: true })
  const [density, setDensity] = useState<Density>('comfortable')
  useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">{_t('admin.ui.accessDeniedTitle')}</h2>
          <p className="text-steel-gray mt-2">{_t('admin.ui.accessDeniedDesc')}</p>
        </div>
      </div>
    )
  }

  function exportCsv() {
    const header = [
      _t('admin.returns.export.headers.order'),
      _t('admin.returns.export.headers.customer'),
      _t('admin.returns.export.headers.email'),
      _t('admin.returns.export.headers.reason'),
      _t('admin.returns.export.headers.status'),
      _t('admin.returns.export.headers.date'),
      _t('admin.returns.export.headers.amount'),
    ] as string[]
    const lines = filteredReturns.map(r => [
      r.order_number ? `#${r.order_number.split('-')[1]}` : `#${r.order_id.slice(-8).toUpperCase()}`,
      r.customer_name || '',
      r.customer_email || '',
      r.reason || '',
      getStatusLabel(r.status),
      formatDateTime(r.created_at, lang),
      typeof r.total_amount === 'number' ? formatCurrency(Number(r.total_amount), lang) : ''
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') )
    const bom = '\ufeff'
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `returns_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportXls() {
    const rowsHtml = filteredReturns.map(r => {
      const orderNo = r.order_number ? `#${r.order_number.split('-')[1]}` : `#${r.order_id.slice(-8).toUpperCase()}`
      const amount = typeof r.total_amount === 'number' ? formatCurrency(Number(r.total_amount), lang) : ''
      return `<tr>`+
        `<td>${orderNo}</td>`+
        `<td>${r.customer_name||''}</td>`+
        `<td>${r.customer_email||''}</td>`+
        `<td>${r.reason||''}</td>`+
        `<td>${getStatusLabel(r.status)}</td>`+
        `<td>${formatDateTime(r.created_at, lang)}</td>`+
        `<td>${amount}</td>`+
      `</tr>`
    }).join('')
    const table = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr><th>${_t('admin.returns.export.headers.order')}</th><th>${_t('admin.returns.export.headers.customer')}</th><th>${_t('admin.returns.export.headers.email')}</th><th>${_t('admin.returns.export.headers.reason')}</th><th>${_t('admin.returns.export.headers.status')}</th><th>${_t('admin.returns.export.headers.date')}</th><th>${_t('admin.returns.export.headers.amount')}</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `returns_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={adminSectionTitleClass}>{_t('admin.titles.returns')}</h2>
        <div className="text-sm text-steel-gray">{_t('admin.returns.total', { count: returns.length })}</div>
      </div>

      {/* Filtreler */}
      <AdminToolbar
        storageKey="toolbar:returns"
        search={{ value: searchQuery, onChange: setSearchQuery, placeholder: _t('admin.returns.searchPlaceholder'), focusShortcut: '/' }}
        rightExtra={(
          <div className="flex items-center gap-2">
            <ExportMenu items={[
              { key: 'csv', label: _t('admin.returns.export.csvLabel'), onSelect: exportCsv },
              { key: 'xls', label: _t('admin.returns.export.xlsLabel'), onSelect: exportXls }
            ]} />
            <ColumnsMenu
              columns={[
                { key: 'order', label: _t('admin.returns.table.order'), checked: visibleCols.order, onChange: (v)=>setVisibleCols(s=>({ ...s, order: v })) },
                { key: 'customer', label: _t('admin.returns.table.customer'), checked: visibleCols.customer, onChange: (v)=>setVisibleCols(s=>({ ...s, customer: v })) },
                { key: 'reason', label: _t('admin.returns.table.reason'), checked: visibleCols.reason, onChange: (v)=>setVisibleCols(s=>({ ...s, reason: v })) },
                { key: 'status', label: _t('admin.returns.table.status'), checked: visibleCols.status, onChange: (v)=>setVisibleCols(s=>({ ...s, status: v })) },
                { key: 'date', label: _t('admin.returns.table.date'), checked: visibleCols.date, onChange: (v)=>setVisibleCols(s=>({ ...s, date: v })) },
              ]}
              density={density}
              onDensityChange={setDensity}
            />
          </div>
        )}
        chips={statusOptions.filter(o=>o.value!=='all').map(o => ({
          key: o.value,
          label: o.label,
          active: !!statusFilter[o.value],
          onToggle: ()=>setStatusFilter(prev=>({ ...prev, [o.value]: !prev[o.value] }))
        }))}
        onClear={()=>{ setSearchQuery(''); setStatusFilter({ requested:true, approved:true, rejected:true, in_transit:true, received:true, refunded:true, cancelled:true }) }}
        recordCount={filteredReturns.length}
      />

      {/* İçerik */}
      {isLoading ? (
        <div className={`${adminCardClass} min-h-[20vh] flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy"/>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className={`${adminCardClass} text-center py-8`}>
          <div className="text-steel-gray">
            {searchQuery || !Object.values(statusFilter).every(Boolean)
              ? _t('admin.returns.empty.filtered')
              : _t('admin.returns.empty.none')}
          </div>
        </div>
      ) : (
        <div className={`${adminCardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {visibleCols.order && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('order')}>{_t('admin.returns.table.order')} {sortIndicator('order')}</button></th>)}
                  {visibleCols.customer && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('customer')}>{_t('admin.returns.table.customer')} {sortIndicator('customer')}</button></th>)}
                  {visibleCols.reason && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('reason')}>{_t('admin.returns.table.reason')} {sortIndicator('reason')}</button></th>)}
                  {visibleCols.status && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('status')}>{_t('admin.returns.table.status')} {sortIndicator('status')}</button></th>)}
                  {visibleCols.date && (<th className={`${adminTableHeadCellClass} ${headPad}`}><button type="button" className="hover:underline" onClick={()=>toggleSort('date')}>{_t('admin.returns.table.date')} {sortIndicator('date')}</button></th>)}
                  <th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.returns.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedReturns.map((returnItem, index) => {
                  const orderNo = returnItem.order_number ? 
                    `#${returnItem.order_number.split('-')[1]}` : 
                    `#${returnItem.order_id.slice(-8).toUpperCase()}`
                  
                  return (
                    <tr key={returnItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      {visibleCols.order && (
                        <td className={`${adminTableCellClass} ${cellPad}`}>
                          <div className="flex flex-col">
                            <button
                              onClick={() => navigate(`/account/orders/${returnItem.order_id}`)}
                              className="text-primary-navy hover:underline font-medium text-left"
                            >
                              {orderNo}
                            </button>
                            {returnItem.total_amount && (
                              <span className="text-xs text-steel-gray">
                                {formatCurrency(Number(returnItem.total_amount), lang)}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleCols.customer && (
                        <td className={`${adminTableCellClass} ${cellPad}`}>
                          <div className="flex flex-col">
                            <span className="font-medium text-industrial-gray">{returnItem.customer_name}</span>
                            <span className="text-xs text-steel-gray">{returnItem.customer_email}</span>
                          </div>
                        </td>
                      )}
                      {visibleCols.reason && (
                        <td className={`${adminTableCellClass} ${cellPad}`}>
                          <div className="max-w-xs">
                            <div className="font-medium text-industrial-gray">{returnItem.reason}</div>
                            {returnItem.description && (
                              <div className="text-xs text-steel-gray mt-1 truncate" title={returnItem.description}>
                                {returnItem.description}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleCols.status && (
                        <td className={`${adminTableCellClass} ${cellPad}`}>
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                            {getStatusIcon(returnItem.status)}
                            {getStatusLabel(returnItem.status)}
                          </div>
                        </td>
                      )}
                      {visibleCols.date && (
                        <td className={`${adminTableCellClass} ${cellPad}`}>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(returnItem.created_at, lang)}</span>
                            <span className="text-xs text-steel-gray">{formatTime(returnItem.created_at, lang)}</span>
                          </div>
                        </td>
                      )}
                      <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>
                        <div className="flex gap-1">
                          {nextStatuses[returnItem.status]?.map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(returnItem.id, status)}
                              disabled={updatingStatus === returnItem.id}
                              className="px-2 py-1 text-xs bg-primary-navy text-white rounded hover:bg-primary-navy/90 disabled:opacity-50"
                              title={_t('admin.returns.actions.markAs', { status: getStatusLabel(status) }) as string}
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
