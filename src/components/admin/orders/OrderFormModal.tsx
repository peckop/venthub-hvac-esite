import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { Loader2, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useRole } from '@/hooks/useRole'
import { formatCurrency } from '@/i18n/format'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { updateOrderStatus } from '@/lib/orderStatusService'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { adminButtonPrimaryClass } from '../../../utils/adminUi'

// --- Zod Schema ---
const orderFormSchema = z.object({
  status: z.string().min(1, 'Durum zorunludur'),
  customer_name: z.string().min(1, 'Müşteri adı zorunludur'),
  customer_email: z.string().email('Geçersiz e-posta adresi').min(1, 'E-posta zorunludur'),
  customer_phone: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  tracking_number: z.string().optional().nullable(),
  shipping_method: z.string().optional().nullable(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

// --- İleri-yön statü kuralı (CLAUDE.md Kural 11: sipariş durumu monoton) ---
// Happy-path sırası; terminal statülere (cancelled/refunded/partial_refunded) gelindiyse GERİ dönülemez.
const STATUS_FLOW = ['pending', 'paid', 'confirmed', 'shipped', 'delivered'] as const
const TERMINAL_STATUSES = ['cancelled', 'refunded', 'partial_refunded'] as const

function isStatusTransitionAllowed(current: string, target: string): boolean {
  if (current === target) return true
  // Terminal bir statüdeyse artık değiştirilemez (iptal/iade geri alınamaz)
  if ((TERMINAL_STATUSES as readonly string[]).includes(current)) return false
  // Terminal statüye (iptal/iade) her aktif statüden geçilebilir
  if ((TERMINAL_STATUSES as readonly string[]).includes(target)) return true
  // Happy-path: yalnız ileri
  const ci = (STATUS_FLOW as readonly string[]).indexOf(current)
  const ti = (STATUS_FLOW as readonly string[]).indexOf(target)
  if (ci === -1 || ti === -1) return false
  return ti >= ci
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
  user_id: string | null
  total_amount: number | null
  status: string
  payment_status?: string | null
  created_at: string
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
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

interface OrderFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
  onSuccess: () => void
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ open, onOpenChange, orderId, onSuccess }) => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('orders')

  const [loadingOrder, setLoadingOrder] = useState(false)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<DetailOrder | null>(null)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      status: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      carrier: '',
      tracking_number: '',
      shipping_method: '',
    },
  })

  // Load order data
  useEffect(() => {
    if (!orderId || !open) return

    let active = true
    void (async () => {
      setLoadingOrder(true)
      try {
        const { data, error } = await supabase
          .from('venthub_orders')
          .select(`
            id, user_id, total_amount, status, payment_status, created_at, 
            customer_name, customer_email, customer_phone, shipping_address, order_number, 
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
          const mappedItems: DetailOrderItem[] = ((data.venthub_order_items as Array<{
            id: string
            product_id: string | null
            product_name: string
            quantity: number
            price_at_time: number
            product_image_url: string | null
          }>) || []).map((it) => ({
            id: it.id,
            product_id: it.product_id,
            product_name: it.product_name,
            quantity: it.quantity,
            price_at_time: it.price_at_time,
            product_image_url: it.product_image_url,
          }))

          const detailOrder: DetailOrder = {
            id: data.id,
            user_id: data.user_id,
            total_amount: data.total_amount != null ? Number(data.total_amount) : null,
            status: data.status || 'pending',
            payment_status: data.payment_status,
            created_at: data.created_at,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
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
          }

          setOrder(detailOrder)

          form.reset({
            status: detailOrder.status,
            customer_name: detailOrder.customer_name || '',
            customer_email: detailOrder.customer_email || '',
            customer_phone: detailOrder.customer_phone || '',
            carrier: detailOrder.carrier || '',
            tracking_number: detailOrder.tracking_number || '',
            shipping_method: detailOrder.shipping_method || '',
          })
        }
      } catch (err) {
        console.error('Order load error:', err)
        toast.error(t('admin.orders.toasts.loadError'))
      } finally {
        if (active) setLoadingOrder(false)
      }
    })()

    return () => {
      active = false
    }
  }, [orderId, open, form, t])

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (
        window.confirm(
          t('admin.categories.unsavedChangesConfirm') ||
            'Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinizden emin misiniz?',
        )
      ) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  const handleOpenChange = (openVal: boolean) => {
    if (!openVal) {
      handleClose()
    } else {
      onOpenChange(true)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [form.formState.isDirty])

  const onSubmit = async (values: OrderFormValues) => {
    if (!order) return
    // İleri-yön statü koruması: UI seçeneği engellense de burada da reddet (monoton invariant — geri/terminal-sonrası yasak)
    if (values.status !== order.status && !isStatusTransitionAllowed(order.status, values.status)) {
      toast.error(t('admin.orders.toasts.invalidStatusTransition'))
      return
    }
    setSaving(true)
    try {
      await mutateWithAudit(supabase, {
        resource: 'orders',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: order.id,
        before: {
          status: order.status,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          carrier: order.carrier,
          tracking_number: order.tracking_number,
          shipping_method: order.shipping_method,
        },
        after: values,
        auditedByEdge: false,
        fn: async () => {
          // If status changes, update it via updateOrderStatus service
          if (values.status !== order.status) {
            const statusRes = await updateOrderStatus({
              orderId: order.id,
              newStatus: values.status,
              oldStatus: order.status,
              userId: order.user_id,
              auditComment: `Order edit modal: status updated to ${values.status}`,
            })
            if (!statusRes.ok) throw new Error(statusRes.error)
          }

          // Update other order fields
          const { error } = await supabase
            .from('venthub_orders')
            .update({
              customer_name: values.customer_name,
              customer_email: values.customer_email,
              customer_phone: values.customer_phone,
              carrier: values.carrier || null,
              tracking_number: values.tracking_number || null,
              shipping_method: values.shipping_method || null,
            })
            .eq('id', order.id)

          if (error) throw error
        },
      })

      toast.success(t('admin.orders.toasts.shippingUpdateSuccess'))
      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(
        error instanceof AdminPermissionError
          ? t('admin.orders.toasts.noPermission')
          : t('admin.orders.form.errorPrefix') +
            (error instanceof Error ? error.message : t('admin.orders.form.unknownError')),
      )
    } finally {
      setSaving(false)
    }
  }

  const items = order?.venthub_order_items || []
  const currentStatus = order?.status ?? ''

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-90vh overflow-hidden bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {order ? `${t('admin.orders.orderDetails')} — ${order.order_number || order.id.slice(0, 8)}` : ''}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400 mt-1">
                {t('admin.orders.form.descEdit')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          {loadingOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                {t('admin.common.loading')}
              </span>
            </div>
          ) : (
            <Tabs.Root defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
              <Tabs.List className="px-6 py-2 border-b border-white/5 flex gap-4 bg-white/1">
                <Tabs.Trigger
                  value="general"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors"
                >
                  {t('admin.settings.tabGeneral')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="shipping"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors"
                >
                  {t('admin.orders.form.tabShipping')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="items"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b-2 border-transparent data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 transition-colors animate-in fade-in"
                >
                  {t('admin.orders.form.tabItems')}
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Tabs.Content value="general" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.customerName')}
                        </label>
                        <input
                          {...form.register('customer_name')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                        />
                        {form.formState.errors.customer_name && (
                          <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">
                            {form.formState.errors.customer_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.customerEmail')}
                        </label>
                        <input
                          {...form.register('customer_email')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                        />
                        {form.formState.errors.customer_email && (
                          <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter px-1">
                            {form.formState.errors.customer_email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.customerPhone')}
                        </label>
                        <input
                          {...form.register('customer_phone')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.orderStatus')}
                        </label>
                        <select
                          {...form.register('status')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="pending" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'pending')}>
                            {t('admin.orders.statusLabels.pending')}
                          </option>
                          <option value="paid" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'paid')}>
                            {t('admin.orders.statusLabels.paid')}
                          </option>
                          <option value="confirmed" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'confirmed')}>
                            {t('admin.orders.statusLabels.confirmed')}
                          </option>
                          <option value="shipped" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'shipped')}>
                            {t('admin.orders.statusLabels.shipped')}
                          </option>
                          <option value="delivered" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'delivered')}>
                            {t('admin.orders.statusLabels.delivered')}
                          </option>
                          <option value="cancelled" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'cancelled')}>
                            {t('admin.orders.statusLabels.cancelled')}
                          </option>
                          <option value="refunded" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'refunded')}>
                            {t('admin.orders.statusLabels.refunded')}
                          </option>
                          <option value="partial_refunded" className="bg-surface-deep" disabled={!isStatusTransitionAllowed(currentStatus, 'partial_refunded')}>
                            {t('admin.orders.statusLabels.partialRefunded')}
                          </option>
                        </select>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="shipping" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.carrier')}
                        </label>
                        <input
                          {...form.register('carrier')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.trackingNumber')}
                        </label>
                        <input
                          {...form.register('tracking_number')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                          {t('admin.orders.form.shippingMethod')}
                        </label>
                        <select
                          {...form.register('shipping_method')}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-cyan-500/50 focus:bg-white/5 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="standard" className="bg-surface-deep">
                            {t('admin.orders.form.shippingStandard')}
                          </option>
                          <option value="express" className="bg-surface-deep">
                            {t('admin.orders.form.shippingExpress')}
                          </option>
                        </select>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="items" className="space-y-6">
                    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                      <table className="min-w-full text-xs divide-y divide-white/5">
                        <thead className="bg-white/3">
                          <tr>
                            <th className="px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider">
                              {t('admin.orders.form.itemsTableProduct')}
                            </th>
                            <th className="px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider w-20">
                              {t('admin.orders.form.itemsTableQuantity')}
                            </th>
                            <th className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider w-32">
                              {t('admin.orders.form.itemsTableUnitPrice')}
                            </th>
                            <th className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider w-32">
                              {t('admin.orders.form.itemsTableTotal')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                          {items.map((it) => {
                            const qty = Number(it.quantity) || 0
                            const unitPrice = Number(it.price_at_time) || 0
                            const totalPrice = qty * unitPrice
                            return (
                              <tr key={it.id} className="hover:bg-white/2 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-200">
                                  {it.product_name}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-300 font-bold">
                                  {qty}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-300 font-mono">
                                  {formatCurrency(unitPrice, lang)}
                                </td>
                                <td className="px-6 py-4 text-right text-cyan-400 font-mono font-bold">
                                  {formatCurrency(totalPrice, lang)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Tabs.Content>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  {t('admin.categories.cancel')}
                </button>
                <button
                  type="submit"
                  form="order-form"
                  disabled={saving}
                  className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} className="group-hover:-translate-y-px transition-transform" />
                  )}
                  {t('admin.settings.saveChanges')}
                </button>
              </div>
            </Tabs.Root>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default OrderFormModal
