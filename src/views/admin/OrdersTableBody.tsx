'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { endOfDay } from 'date-fns'
import { Info, ShoppingCart } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import DateRangePicker from '../../components/admin/DateRangePicker'
import ExportMenu from '../../components/admin/ExportMenu'
import OrderFormModal from '../../components/admin/orders/OrderFormModal'
import { AdminModal } from '../../components/admin/overlay/AdminModal'
import { AdminSidePanel } from '../../components/admin/overlay/AdminSidePanel'
import { useConfirm } from '../../components/admin/overlay/ConfirmProvider'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import type { Lang } from '../../i18n/I18nContext'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
  adminSettingsLabelClass,
  adminTableActionDangerClass,
  adminTableCellClass,
  adminTableHeadCellClass,
} from '../../utils/adminUi'

/* ---- model ---- */
interface AdminOrderRow {
  id: string
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'cancelled' | 'refunded' | 'partial_refunded' | string
  conversation_id?: string | null
  total_amount?: number | null
  created_at: string
  order_number?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
}

interface EmailLog {
  subject: string
  email_to: string
  provider_message_id: string | null
  created_at: string
  carrier: string | null
  tracking_number: string | null
}

interface OrderNote {
  id: string
  note: string
  created_at: string
  user_id: string | null
}

const PAGE_SIZE = 50

const ORDER_SELECT =
  'id,status,conversation_id,total_amount,created_at,order_number,customer_name,customer_email,customer_phone'

const SORT_COLUMN_MAP: Record<string, string> = {
  created: 'created_at',
  id: 'id',
  status: 'status',
  conversation: 'conversation_id',
  amount: 'total_amount',
}

const ORDER_STATUS_KEYS = [
  'pending',
  'paid',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'partial_refunded',
] as const

/* ---- helper'lar (module-level) ---- */
function formatAmount(v?: number | null, lang: Lang = 'tr'): string {
  if (typeof v === 'number') return formatCurrency(v, lang, { maximumFractionDigits: 0 })
  return '-'
}

function safeDate(iso: string, lang: Lang = 'tr'): string {
  try {
    return formatDateTime(iso, lang)
  } catch {
    return iso
  }
}

function prettyStatus(s: string, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (!s) return s
  const key = s.toLowerCase()
  switch (key) {
    case 'pending':
      return t('admin.orders.statusLabels.pending')
    case 'paid':
      return t('admin.orders.statusLabels.paid')
    case 'confirmed':
      return t('admin.orders.statusLabels.confirmed')
    case 'shipped':
      return t('admin.orders.statusLabels.shipped')
    case 'delivered':
      return t('admin.orders.statusLabels.delivered')
    case 'cancelled':
      return t('admin.orders.statusLabels.cancelled')
    case 'refunded':
      return t('admin.orders.statusLabels.refunded')
    case 'partial_refunded':
      return t('admin.orders.statusLabels.partialRefunded')
    default:
      return s
  }
}

function badgeClass(s: string): string {
  if (!s)
    return 'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-admin-surface-2 text-admin-fg-muted border-admin-border ring-1 ring-admin-border transition-colors'
  const base =
    'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border group-hover:scale-105 transition-colors'
  const key = s.toLowerCase()
  switch (key) {
    case 'pending':
      return `${base} bg-admin-surface-3 text-admin-fg-muted border-admin-border ring-1 ring-admin-border`
    case 'paid':
      return `${base} bg-admin-success-weak text-admin-success border-admin-success/30 ring-1 ring-admin-success/30`
    case 'confirmed':
      return `${base} bg-admin-accent-weak text-admin-accent border-admin-accent/30 ring-1 ring-admin-accent/30`
    case 'shipped':
      return `${base} bg-admin-warning-weak text-admin-warning border-admin-warning/30 ring-1 ring-admin-warning/30`
    case 'delivered':
      return `${base} bg-admin-accent-weak text-admin-accent border-admin-accent/30 ring-1 ring-admin-accent/30`
    case 'cancelled':
      return `${base} bg-admin-danger-weak text-admin-danger border-admin-danger/30 ring-1 ring-admin-danger/30`
    case 'refunded':
    case 'partial_refunded':
      return `${base} bg-admin-warning-weak text-admin-warning border-admin-warning/30 ring-1 ring-admin-warning/30`
    default:
      return `${base} bg-admin-surface-2 text-admin-fg-muted border-admin-border ring-1 ring-admin-border`
  }
}

function generateTrackingUrl(carrier: string, tracking: string): string | null {
  if (!carrier || !tracking) return null
  const c = carrier.toLowerCase()
  if (c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tracking}`
  if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo_takip/kargo_takip_detay.aspx?sorgu_no=${tracking}`
  if (c.includes('mng')) return `https://www.mngkargo.com.tr/gonderitakip?gonderino=${tracking}`
  if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?id=${tracking}`
  return null
}

/* ---- fetcher: server-mode (search/sort/filter SUNUCUDA) ---- */
async function ordersFetcher(
  supabase: SupabaseClient<Database>,
  params: FetchParams,
): Promise<FetchResult<AdminOrderRow>> {
  await ensureSessionFresh()

  let query = supabase.from('view_admin_orders').select(ORDER_SELECT, { count: 'exact' })

  /* sıralama: server-side */
  const ascending = params.sort?.dir === 'asc'
  if (params.sort?.key) {
    query = query.order(SORT_COLUMN_MAP[params.sort.key] ?? 'created_at', { ascending })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  /* arama: search_text */
  const q = params.query.trim()
  if (q) query = query.ilike('search_text', `%${q}%`)

  /* durum filtresi */
  const statuses = params.filters.status ?? []
  const preset = params.filters.preset?.[0]
  if (statuses.length === 1) {
    query = query.eq('status', statuses[0])
  } else if (statuses.length > 1) {
    query = query.in('status', statuses)
  } else if (preset === 'pendingShipments') {
    query = query.in('status', ['confirmed', 'processing']).is('shipped_at', null)
  }

  /* tarih aralığı (endOfDay ISO değer çağıran tarafça uygulanır) */
  const from = params.filters.from?.[0]
  const to = params.filters.to?.[0]
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const offset = (params.page - 1) * params.pageSize
  const { data, error, count } = await query.range(offset, offset + params.pageSize - 1)
  if (error) throw error
  return { rows: (data ?? []) as AdminOrderRow[], totalMatched: typeof count === 'number' ? count : 0 }
}

interface DetailOrderItem {
  id: string
  product_id?: string | null
  product_name: string
  quantity: number
  price_at_time: number
  product_image_url?: string | null
}

interface DetailOrder {
  id: string
  total_amount: number | null
  status: string
  payment_status?: string | null
  created_at: string
  customer_name?: string | null
  customer_email?: string | null
  shipping_address?: unknown
  order_number?: string | null
  conversation_id?: string | null
  carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  shipping_method?: string | null
  invoice_type?: string | null
  invoice_info?: unknown
  legal_consents?: unknown
  venthub_order_items: DetailOrderItem[]
}

interface ShippingAddress {
  fullAddress?: string
  street?: string
  city?: string
  district?: string
  state?: string
  postalCode?: string
  postal_code?: string
}

interface InvoiceInfo {
  companyName?: string
  company_name?: string
  taxOffice?: string
  tax_office?: string
  taxNumber?: string
  tax_no?: string
  tcNo?: string
  tc_no?: string
  national_id?: string
}

/* ---- lazy genişleyen satır: sipariş kalemi ve detayları ---- */
interface OrderSpecsRowProps {
  orderId: string
}

const OrderSpecsRow: React.FC<OrderSpecsRowProps> = ({ orderId }) => {
  const { t, lang } = useI18n()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<DetailOrder | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const { data, error } = await supabaseBrowserClient
          .from('venthub_orders')
          .select(`
            id, total_amount, status, payment_status, created_at, 
            customer_name, customer_email, shipping_address, order_number, 
            conversation_id, carrier, tracking_number, tracking_url, 
            shipped_at, delivered_at, shipping_method, invoice_type, 
            invoice_info, legal_consents,
            venthub_order_items (
              id, product_id, product_name, quantity, price_at_time, product_image_url
            )
          `)
          .eq('id', orderId)
          .maybeSingle()

        if (!active) return
        if (error) throw error
        if (data) {
          const rawItems = (data.venthub_order_items as Array<{
            id: string
            product_id: string | null
            product_name: string
            quantity: number
            price_at_time: number
            product_image_url: string | null
          }> | undefined) || []

          const mappedItems: DetailOrderItem[] = rawItems.map((it) => ({
            id: it.id,
            product_id: it.product_id,
            product_name: it.product_name,
            quantity: it.quantity,
            price_at_time: it.price_at_time,
            product_image_url: it.product_image_url,
          }))

          setOrder({
            id: data.id,
            total_amount: data.total_amount != null ? Number(data.total_amount) : null,
            status: data.status || 'pending',
            payment_status: data.payment_status,
            created_at: data.created_at,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            shipping_address: data.shipping_address,
            order_number: data.order_number,
            conversation_id: data.conversation_id,
            carrier: data.carrier,
            tracking_number: data.tracking_number,
            tracking_url: data.tracking_url,
            shipped_at: data.shipped_at,
            delivered_at: data.delivered_at,
            shipping_method: data.shipping_method,
            invoice_type: data.invoice_type,
            invoice_info: data.invoice_info,
            legal_consents: data.legal_consents,
            venthub_order_items: mappedItems,
          })
        }
      } catch (err) {
        console.error('Order fetch error:', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-admin-accent/30 border-t-cyan-500 rounded-full" />
        <span className="text-xs font-semibold text-admin-fg-muted">
          {t('admin.common.loading')}
        </span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-admin-surface p-8 rounded-admin-lg border border-admin-border text-center">
        <p className="text-xs font-bold text-admin-fg-muted">
          {t('admin.orders.states.noRecords')}
        </p>
      </div>
    )
  }

  const items = order.venthub_order_items || []
  const addr = order.shipping_address as ShippingAddress | null
  const invoice = order.invoice_info as InvoiceInfo | null

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-0.5 bg-admin-accent" />
        <h4 className="text-xs font-semibold text-admin-accent">
          {t('admin.orders.orderDetails')}
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Ürünler */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-semibold text-admin-fg-muted">
            {t('common.products')}
          </h5>
          <div className="bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden">
            <table className="min-w-full text-xs divide-y divide-admin-border">
              <thead className="bg-admin-surface-2">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-admin-fg-muted">
                    {t('orders.productCol')}
                  </th>
                  <th className="px-4 py-2.5 text-center font-semibold text-admin-fg-muted w-20">
                    {t('orders.qtyCol')}
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted w-32">
                    {t('orders.unitPriceCol')}
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted w-32">
                    {t('orders.totalCol')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {items.map((it: DetailOrderItem) => {
                  const qty = Number(it.quantity) || 0
                  const unitPrice = Number(it.price_at_time) || 0
                  const totalPrice = qty * unitPrice
                  return (
                    <tr key={it.id} className="hover:bg-admin-surface-2 transition-colors">
                      <td className="px-4 py-2.5 text-admin-fg">
                        {it.product_name}
                      </td>
                      <td className="px-4 py-2.5 text-center text-admin-fg">
                        {qty}
                      </td>
                      <td className="px-4 py-2.5 text-right text-admin-fg font-mono">
                        {formatCurrency(unitPrice, lang)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-admin-accent font-mono">
                        {formatCurrency(totalPrice, lang)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sağ Kolon: Teslimat & Fatura */}
        <div className="space-y-6">
          {/* Müşteri & Teslimat */}
          <div className="bg-admin-surface p-6 rounded-admin-lg border border-admin-border space-y-4">
            <h5 className="text-xs font-semibold text-admin-fg-muted">
              {t('orders.shippingInfo')}
            </h5>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-admin-fg-muted font-bold block">{t('orders.name')}:</span>
                <span className="text-admin-fg font-bold block">{order.customer_name}</span>
                <span className="text-admin-fg-muted font-medium block">{order.customer_email}</span>
              </div>
              {addr && (
                <div>
                  <span className="text-admin-fg-muted font-bold block">{t('orders.deliveryAddress')}:</span>
                  <p className="text-admin-fg mt-1 font-medium leading-relaxed">
                    {addr.fullAddress || addr.street}<br />
                    {[addr.city, addr.district || addr.state].filter(Boolean).join(', ')}<br />
                    {addr.postalCode || addr.postal_code}
                  </p>
                </div>
              )}
              {order.shipping_method && (
                <div>
                  <span className="text-admin-fg-muted font-bold block">{t('account.orderDetail.shippingMethod')}:</span>
                  <span className="text-admin-fg font-bold">
                    {order.shipping_method === 'express'
                      ? t('account.orderDetail.express')
                      : t('account.orderDetail.standard')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fatura Bilgileri */}
          <div className="bg-admin-surface p-6 rounded-admin-lg border border-admin-border space-y-4">
            <h5 className="text-xs font-semibold text-admin-fg-muted">
              {t('account.orderDetail.invoiceInfo')}
            </h5>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-admin-fg-muted font-bold block">{t('account.orderDetail.typeLabel')}</span>
                <span className="text-admin-fg font-bold block">
                  {order.invoice_type === 'corporate'
                    ? t('checkout.invoice.corporate')
                    : t('checkout.invoice.individual')}
                </span>
              </div>
              {invoice && (
                <div className="space-y-2 text-admin-fg font-medium leading-relaxed">
                  {order.invoice_type === 'corporate' ? (
                    <>
                      <p><span className="text-admin-fg-muted font-bold">{t('account.orderDetail.companyTitleLabel')}</span> {invoice.companyName || invoice.company_name}</p>
                      <p><span className="text-admin-fg-muted font-bold">{t('account.orderDetail.taxOfficeLabel')}</span> {invoice.taxOffice || invoice.tax_office}</p>
                      <p><span className="text-admin-fg-muted font-bold">{t('account.orderDetail.vknLabel')}</span> {invoice.taxNumber || invoice.tax_no}</p>
                    </>
                  ) : (
                    <>
                      <p><span className="text-admin-fg-muted font-bold">{t('account.orderDetail.tcknLabel')}</span> {invoice.tcNo || invoice.tc_no || invoice.national_id}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrdersTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const confirm = useConfirm()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('orders')

  const table = useAdminTable<AdminOrderRow>({
    resource: 'orders',
    rowId: (r) => r.id,
    fetcher: ordersFetcher,
    paginationMode: 'server',
    sortMode: 'server',
    pageSize: PAGE_SIZE,
    initialSort: { key: 'created', dir: 'desc' },
    syncUrl: true,
  })

  const { setFilter, setQuery } = table.filtering
  const filters = table.filtering.filters
  const presetActive = filters.preset?.[0] === 'pendingShipments'
  const activeStatuses = useMemo(() => filters.status ?? [], [filters.status])

  const statusChips = useMemo(
    () =>
      ORDER_STATUS_KEYS.map((s) => ({
        key: s,
        label: prettyStatus(s, t),
        active: activeStatuses.includes(s),
        onToggle: () => {
          const next = activeStatuses.includes(s)
            ? activeStatuses.filter((x) => x !== s)
            : [...activeStatuses, s]
          setFilter('status', next)
          if (next.length > 0) {
            setFilter('preset', [])
          }
        },
      })),
    [t, activeStatuses, setFilter],
  )

  /* ---- modal state: düzenle (CRUD) ---- */
  const [editOpen, setEditOpen] = useState(false)
  const [editOrderId, setEditOrderId] = useState<string | null>(null)

  const openEditModal = useCallback((id: string) => {
    setEditOrderId(id)
    setEditOpen(true)
  }, [])

  /* ---- modal state: kargo ---- */
  const [shipOpen, setShipOpen] = useState(false)
  const [shipId, setShipId] = useState<string>('')
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [bulkMode, setBulkMode] = useState(false)

  /* ---- modal state: e-posta kayıtları (READ) ---- */
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])

  /* ---- modal state: notlar ---- */
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesOrderId, setNotesOrderId] = useState<string>('')
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState<OrderNote[]>([])



  /* ---- kargo modalı: tekil prefill (READ) ---- */
  const openShipModal = useCallback(async (id: string) => {
    setBulkMode(false)
    setShipId(id)
    setCarrier('')
    setTracking('')
    setSendEmail(true)
    try {
      const { data } = await supabaseBrowserClient
        .from('venthub_orders')
        .select('carrier, tracking_number')
        .eq('id', id)
        .maybeSingle()
      if (data) {
        const dto = data as { carrier?: string | null; tracking_number?: string | null }
        setCarrier(dto.carrier || '')
        setTracking(dto.tracking_number || '')
      }
    } catch {
      // no-op
    }
    setShipOpen(true)
  }, [])
  const closeShipModal = useCallback(() => setShipOpen(false), [])

  /* ---- e-posta kayıtları modalı (READ) ---- */
  const openLogsModal = useCallback(
    async (id: string) => {
      setLogsOpen(true)
      setLogsLoading(true)
      try {
        const { data, error } = await supabaseBrowserClient
          .from('shipping_email_events')
          .select('subject,email_to,provider_message_id,created_at,carrier,tracking_number')
          .eq('order_id', id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (error) throw error
        setEmailLogs(Array.isArray(data) ? (data as EmailLog[]) : [])
      } catch {
        toast.error(t('admin.orders.toasts.emailLogsFailed'))
        setEmailLogs([])
      } finally {
        setLogsLoading(false)
      }
    },
    [t],
  )
  const closeLogsModal = useCallback(() => setLogsOpen(false), [])

  /* ---- notlar modalı (READ açılış) ---- */
  const openNotesModal = useCallback(
    async (id: string) => {
      setNotesOrderId(id)
      setNotesOpen(true)
      try {
        const { data, error } = await supabaseBrowserClient
          .from('order_notes')
          .select('id,note,created_at,user_id')
          .eq('order_id', id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        setNotes(Array.isArray(data) ? (data as OrderNote[]) : [])
      } catch {
        toast.error(t('admin.orders.toasts.notesFailed'))
        setNotes([])
      }
    },
    [t],
  )
  const closeNotesModal = useCallback(() => setNotesOpen(false), [])

  /* ---- (d) Not ekle — INSERT, mutateWithAudit kapısından ---- */
  const addNote = useCallback(async () => {
    const text = noteInput.trim()
    if (!notesOrderId || !text) return
    try {
      const inserted = await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'INSERT',
        rowPk: notesOrderId,
        before: null,
        after: { note: text },
        auditedByEdge: false,
        fn: async () => {
          const { data, error } = await supabaseBrowserClient
            .from('order_notes')
            .insert({ order_id: notesOrderId, note: text })
            .select('id,note,created_at,user_id')
            .single()
          if (error) throw error
          return data as OrderNote
        },
      })
      setNotes((prev) => [inserted, ...prev])
      setNoteInput('')
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.toasts.noteAddFailed'),
      )
    }
  }, [noteInput, notesOrderId, hasWriteAccess, t])

  /* ---- (e) Not sil — DELETE, mutateWithAudit kapısından ---- */
  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!noteId) return
      const target = notes.find((n) => n.id === noteId)
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'orders',
          canWrite: hasWriteAccess,
          action: 'DELETE',
          rowPk: noteId,
          before: { note: target?.note ?? '' },
          after: null,
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('order_notes').delete().eq('id', noteId)
            if (error) throw error
          },
        })
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        toast.success(t('admin.orders.toasts.noteDeleteSuccess'))
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.orders.toasts.noPermission')
            : t('admin.orders.toasts.noteDeleteFailed'),
        )
      }
    },
    [notes, hasWriteAccess, t],
  )

  /* ---- (a)+(b) Kargo gönder — tekil + toplu, tek mutateWithAudit ---- */
  const submitShip = useCallback(async () => {
    if (!bulkMode) {
      if (!shipId) return
      const curRow = table.rows.find((r) => r.id === shipId)
      const cur = curRow?.status ?? ''
      const isShipped = cur === 'shipped'
      if (!isShipped && (!carrier.trim() || !tracking.trim())) {
        toast.error(t('admin.orders.toasts.missingFields'))
        return
      }
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'orders',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: shipId,
          before: { status: cur },
          after: { status: isShipped ? cur : 'shipped', carrier, tracking_number: tracking },
          auditedByEdge: false,
          fn: async () => {
            const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
            const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
              body: {
                order_id: shipId,
                carrier: carrier.trim(),
                tracking_number: tracking.trim(),
                tracking_url: turl,
                send_email: !!sendEmail,
              },
            })
            if (fnErr) throw fnErr
          },
        })
        setShipOpen(false)
        toast.success(
          isShipped
            ? t('admin.orders.toasts.shippingUpdateSuccess')
            : t('admin.orders.toasts.shippingCreateSuccess'),
        )
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.orders.toasts.noPermission')
            : t('admin.orders.toasts.shippingUpdateFailed'),
        )
      }
      return
    }

    /* toplu kargo */
    const selected = table.selection.selectedIds
    const targets = table.rows.filter((r) => selected.includes(r.id) && r.status !== 'shipped').map((r) => r.id)
    if (targets.length === 0) {
      setShipOpen(false)
      return
    }
    if (!carrier.trim() || !tracking.trim()) {
      toast.error(t('admin.orders.toasts.missingFields'))
      return
    }
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { status: 'shipped', ids: targets },
        auditedByEdge: false,
        fn: async () => {
          const turl = carrier && tracking ? generateTrackingUrl(carrier, tracking) : null
          const results = await Promise.all(
            targets.map(async (id) => {
              const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
                body: {
                  order_id: id,
                  carrier: carrier.trim(),
                  tracking_number: tracking.trim(),
                  tracking_url: turl,
                  send_email: !!sendEmail,
                },
              })
              return !fnErr
            }),
          )
          if (results.some((ok) => !ok)) throw new Error('Some failed')
        },
      })
      setShipOpen(false)
      setBulkMode(false)
      toast.success(t('admin.orders.toasts.bulkShippingSuccess', { count: String(targets.length) }))
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.toasts.bulkShippingFailed'),
      )
    }
  }, [bulkMode, shipId, carrier, tracking, sendEmail, hasWriteAccess, t, table])

  /* ---- (c) Toplu kargo iptal ---- */
  const bulkCancelShipping = useCallback(async () => {
    const selected = table.selection.selectedIds
    const targets = table.rows.filter((r) => selected.includes(r.id) && r.status === 'shipped').map((r) => r.id)
    if (targets.length === 0) return
    const ok = await confirm({
      description: t('admin.orders.bulk.confirmCancelShipping', { count: String(targets.length) }),
      tone: 'danger',
    })
    if (!ok) return
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { status: 'confirmed', ids: targets },
        auditedByEdge: false,
        fn: async () => {
          const results = await Promise.all(
            targets.map(async (id) => {
              const { error: fnErr } = await supabaseBrowserClient.functions.invoke('admin-update-shipping', {
                body: { order_id: id, cancel: true, send_email: false },
              })
              return !fnErr
            }),
          )
          if (results.some((ok) => !ok)) throw new Error('Some failed')
        },
      })
      toast.success(t('admin.orders.bulk.cancelSuccess', { count: String(targets.length) }))
      table.selection.clear()
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.bulk.cancelFailed'),
      )
    }
  }, [confirm, hasWriteAccess, t, table])

  /* ---- date-range picker ↔ filters.from/to ---- */
  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = filters.from?.[0]
    const to = filters.to?.[0]
    if (!from && !to) return undefined
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }, [filters.from, filters.to])

  const onDateChange = useCallback(
    (range?: DateRange) => {
      setFilter('from', range?.from ? [range.from.toISOString()] : [])
      setFilter('to', range?.to ? [endOfDay(range.to).toISOString()] : [])
    },
    [setFilter],
  )

  const resetFilters = useCallback(() => {
    setQuery('')
    setFilter('status', [])
    setFilter('preset', [])
    setFilter('from', [])
    setFilter('to', [])
  }, [setQuery, setFilter])

  /* ---- export (CSV + XLS), fetchAllForExport üzerinden (tüm filtreli sonuç) ---- */
  const exportHeaders = useMemo(
    () => [
      t('admin.orders.export.headers.orderId'),
      t('admin.orders.export.headers.status'),
      t('admin.orders.export.headers.amount'),
    ],
    [t],
  )

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) => [r.id, r.status, r.total_amount].map(escape).join(','))
    const csv = '﻿' + [exportHeaders.join(','), ...lines].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'orders.csv')
  }, [table, exportHeaders])

  const exportXls = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const head = exportHeaders.map((h) => `<th>${h}</th>`).join('')
    const body = rows
      .map((r) => `<tr><td>${r.id}</td><td>${r.status}</td><td>${r.total_amount ?? ''}</td></tr>`)
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), 'orders.xls')
  }, [table, exportHeaders])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<AdminOrderRow>[]>(
    () => [
      {
        key: 'id',
        header: t('admin.orders.table.orderId'),
        sortable: true,
        cell: (r) => {
          const shortId = `${r.id.slice(0, 8)}...`
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-admin-fg text-xs">
                {r.order_number || r.id.slice(0, 8)}
              </span>
              {r.order_number && <span className="text-xs text-admin-fg-muted font-mono">{shortId}</span>}
            </div>
          )
        },
      },
      {
        key: 'status',
        header: t('admin.orders.table.status'),
        sortable: true,
        hideable: true,
        cell: (r) => <span className={badgeClass(r.status)}>{prettyStatus(r.status, t)}</span>,
      },
      {
        key: 'conversation',
        header: t('admin.orders.table.conversationId'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-medium text-admin-fg-muted font-mono italic">{r.conversation_id || '-'}</span>
        ),
      },
      {
        key: 'amount',
        header: t('admin.orders.table.amount'),
        sortable: true,
        hideable: true,
        align: 'right',
        cell: (r) => (
          <span className="font-semibold text-admin-fg text-xs">{formatAmount(r.total_amount, lang)}</span>
        ),
      },
      {
        key: 'created',
        header: t('admin.orders.table.created'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-xs font-semibold text-admin-fg-muted">
            {safeDate(r.created_at, lang)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('admin.orders.table.actions'),
        sortable: false,
        cell: (r) => (
          <div className="flex gap-2">
            {hasWriteAccess && (
              <>
                <button
                  type="button"
                  onClick={() => openEditModal(r.id)}
                  className="px-3 py-1.5 rounded-admin-md bg-admin-accent-weak border border-admin-accent/30 text-xs font-semibold text-admin-accent hover:bg-admin-accent hover:text-admin-accent-fg transition-colors"
                >
                  {t('admin.common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => void openShipModal(r.id)}
                  className="px-3 py-1.5 rounded-admin-md bg-admin-surface-2 border border-admin-border text-xs font-semibold text-admin-accent hover:bg-admin-accent hover:text-admin-accent-fg transition-colors"
                >
                  {t('admin.orders.actions.shipping')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => void openLogsModal(r.id)}
              className="px-3 py-1.5 rounded-admin-md bg-admin-surface-2 border border-admin-border text-xs font-semibold text-admin-warning hover:bg-admin-warning hover:text-admin-warning-fg transition-colors"
            >
              {t('admin.orders.actions.logs')}
            </button>
            <button
              type="button"
              onClick={() => void openNotesModal(r.id)}
              className="px-3 py-1.5 rounded-admin-md bg-admin-surface-2 border border-admin-border text-xs font-semibold text-admin-fg-muted hover:bg-admin-surface-3 hover:text-admin-fg transition-colors"
            >
              {t('admin.orders.actions.notes')}
            </button>
          </div>
        ),
      },
    ],
    [t, lang, hasWriteAccess, openShipModal, openLogsModal, openNotesModal, openEditModal],
  )

  /* ---- bulk actions ---- */
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'ship',
        label: t('admin.orders.bulk.shipSelected'),
        tone: 'default',
        onRun: async () => {
          setBulkMode(true)
          setCarrier('')
          setTracking('')
          setSendEmail(true)
          setShipOpen(true)
        },
      },
      {
        key: 'cancel',
        label: t('admin.orders.bulk.cancelShipping'),
        tone: 'warning',
        onRun: bulkCancelShipping,
      },
    ],
    [t, bulkCancelShipping],
  )

  return (
    <>
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="orders"
        hasWriteAccess={hasWriteAccess}
        totalLabel={t('admin.ui.total')}
        emptyState={
          <AdminEmptyState
            icon={ShoppingCart}
            title={t('admin.orders.emptyTitle')}
            description={t('admin.orders.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={ShoppingCart}
            title={t('admin.orders.emptyTitle')}
            description={t('admin.orders.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.common.view')}
        expandLabel={t('admin.orders.orderDetails')}
        renderExpandedRow={(r) => <OrderSpecsRow orderId={r.id} />}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:orders"
            search={{
              value: table.filtering.query,
              onChange: setQuery,
              placeholder: t('admin.search.orders'),
              focusShortcut: '/',
            }}
            chips={statusChips}
            toggles={[
              {
                key: 'pendingShipments',
                label: t('admin.orders.filters.pendingShipments'),
                checked: presetActive,
                onChange: (v) => {
                  setFilter('preset', v ? ['pendingShipments'] : [])
                  if (v) setFilter('status', [])
                },
              },
            ]}
            onClear={resetFilters}
            recordCount={table.totalMatched}
            rightExtra={
              <div className="flex flex-wrap items-center gap-2">
                <DateRangePicker value={dateRange} onChange={onDateChange} />
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.orders.export.csvLabel'), onSelect: () => void exportCsv() },
                    { key: 'xls', label: t('admin.orders.export.xlsLabel'), onSelect: () => void exportXls() },
                  ]}
                />
              </div>
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkBar
              selectedCount={table.selection.selectedIds.length}
              selectedLabel={t('admin.orders.bulk.selected', { count: table.selection.selectedIds.length })}
              clearLabel={t('admin.orders.bulk.clearSelection')}
              actions={bulkActions}
              onClear={table.selection.clear}
            />
          ) : null
        }
      />

      {/*
        KARGO — **MODAL**. Cetvel §4.1: "<5 girdili form → Modal" (Carbon Forms).
        Kullanıcı burada BAKMIYOR, KARAR VERİYOR: taşıyıcı + takip no giriliyor,
        `admin-update-shipping` edge fonksiyonu çağrılıyor ve sipariş durumu
        `shipped`'e taşınıyor (tekil veya toplu). Kararın sonucu geri alınması
        pahalı bir yazma → arka planı bloklamak DOĞRU davranıştır (§4.2).
      */}
      <AdminModal
        open={shipOpen}
        onOpenChange={(next) => {
          if (!next) closeShipModal()
        }}
        title={
          bulkMode
            ? t('admin.orders.modals.shipping.bulkTitle')
            : t('admin.orders.modals.shipping.title')
        }
        description={t('admin.orders.modals.shipping.description')}
        closeLabel={t('admin.orders.modals.shipping.close')}
        footer={
          <>
            <button type="button" onClick={closeShipModal} className={adminButtonSecondaryClass}>
              {t('admin.orders.modals.shipping.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void submitShip()}
              className={adminButtonPrimaryClass}
            >
              {t('admin.orders.modals.shipping.save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="ship-carrier" className={adminSettingsLabelClass}>
              {t('admin.orders.modals.shipping.carrierLabel')}
            </label>
            <select
              id="ship-carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              <option value="">{t('admin.orders.modals.shipping.carrierSelect')}</option>
              <option value="Yurtiçi">{t('admin.orders.modals.shipping.carriers.yurtici')}</option>
              <option value="Aras">{t('admin.orders.modals.shipping.carriers.aras')}</option>
              <option value="MNG">{t('admin.orders.modals.shipping.carriers.mng')}</option>
              <option value="PTT">{t('admin.orders.modals.shipping.carriers.ptt')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="ship-tracking" className={adminSettingsLabelClass}>
              {t('admin.orders.modals.shipping.trackingLabel')}
            </label>
            <input
              id="ship-tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className={adminInputClass}
              placeholder={t('admin.orders.modals.shipping.trackingPlaceholder')}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-admin-fg-muted">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 rounded-admin-sm border-admin-border accent-admin-accent
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring"
            />
            {t('admin.orders.modals.shipping.sendEmailLabel')}
          </label>
        </div>
      </AdminModal>

      {/*
        E-POSTA KAYITLARI — **NON-MODAL YAN PANEL**. Cetvel §4.1: "Kullanıcı arkadaki
        içeriğe bakmalı → non-modal panel" + "Tablo satırı seçince hızlı detay →
        split panel". Burada HİÇBİR karar verilmiyor, hiçbir alan doldurulmuyor:
        sipariş başına gönderilmiş bildirim e-postalarının salt-okunur listesi.
        Böyle bir yüzey için modal, NN/g'nin deyimiyle kullanıcıya "fazladan bir
        hedef — diyaloğu kapatmak" yükler (§4.2) ve listeyle karşılaştırma yapmayı
        engeller. Panel açıkken tablo etkileşimli kalır; perde ve kaydırma kilidi
        BİLEREK yok (§4.3 — bunlar konulursa panel modal olur, sadece şekli değişir).
      */}
      <AdminSidePanel
        open={logsOpen}
        onClose={closeLogsModal}
        title={t('admin.orders.modals.logs.title')}
        description={t('admin.orders.modals.logs.description')}
        closeLabel={t('admin.orders.modals.logs.close')}
      >
        {logsLoading ? (
          <p className="py-10 text-center text-sm text-admin-fg-muted">
            {t('admin.common.loading')}
          </p>
        ) : emailLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-admin-fg-subtle">
            <Info size={24} aria-hidden="true" />
            <span className="text-sm">{t('admin.orders.modals.logs.noRecords')}</span>
          </div>
        ) : (
          /* Geniş içerik KENDİ kabında yatay kayar — sayfa gövdesi asla yatay kaymaz. */
          <div className="overflow-x-auto rounded-admin-md border border-admin-border">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th scope="col" className={adminTableHeadCellClass}>
                    {t('admin.orders.modals.logs.table.date')}
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    {t('admin.orders.modals.logs.table.subject')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((l) => (
                  <tr key={`${l.created_at}-${l.provider_message_id ?? l.subject}`} className="group">
                    <td className={`${adminTableCellClass} whitespace-nowrap`}>
                      {safeDate(l.created_at, lang)}
                    </td>
                    <td className={adminTableCellClass}>{l.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSidePanel>

      {/*
        NOTLAR — **MODAL**. Salt-okunur GİBİ görünür ama değildir: metin girişi +
        INSERT + DELETE barındırır, yani bir ÇALIŞMA yüzeyidir. Carbon'un non-modal
        kısıtı birebir geçerli: "non-modal yalnız isteğe bağlı / kritik olmayan
        görevler içindir; kullanıcının girdisi akışı ilerletmek için gerekliyse
        modal kullan" (§4.3). Alan sayısı 1 → §4.1 "1–2 alanlı hızlı düzenleme → Modal".
      */}
      <AdminModal
        open={notesOpen}
        onOpenChange={(next) => {
          if (!next) closeNotesModal()
        }}
        title={t('admin.orders.modals.notes.title')}
        description={t('admin.orders.modals.notes.description')}
        closeLabel={t('admin.orders.modals.notes.close')}
        footer={
          <button type="button" onClick={closeNotesModal} className={adminButtonSecondaryClass}>
            {t('admin.orders.modals.notes.close')}
          </button>
        }
      >
        {hasWriteAccess && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={t('admin.orders.modals.notes.inputPlaceholder')}
              aria-label={t('admin.orders.modals.notes.inputPlaceholder')}
              className={`${adminInputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => void addNote()}
              className={adminButtonPrimaryClass}
            >
              {t('admin.orders.modals.notes.add')}
            </button>
          </div>
        )}

        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-admin-md border border-admin-border bg-admin-surface-2 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-admin-fg">{n.note}</p>
                {hasWriteAccess && (
                  /* Eskiden `opacity-0 group-hover:opacity-100` idi: klavye ve dokunmatik
                     kullanıcı için görünmez bir eylemdi. Artık daima görünür. */
                  <button
                    type="button"
                    onClick={() => void deleteNote(n.id)}
                    className={adminTableActionDangerClass}
                  >
                    {t('admin.orders.modals.notes.delete')}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-admin-fg-subtle">{safeDate(n.created_at, lang)}</p>
            </li>
          ))}
          {notes.length === 0 && (
            <li className="py-8 text-center text-sm text-admin-fg-muted">
              {t('admin.orders.modals.notes.noRecords')}
            </li>
          )}
        </ul>
      </AdminModal>

      {editOpen && (
        <OrderFormModal
          open={editOpen}
          onOpenChange={setEditOpen}
          orderId={editOrderId}
          onSuccess={async () => {
            await table.reload()
          }}
        />
      )}
    </>
  )
}

export default OrdersTableBody
