import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { Loader2, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type { FieldErrors } from 'react-hook-form'
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
import { useConfirm } from '../overlay/ConfirmProvider'

// --- Zod Schema ---
// Kurallar AYNI; yalnız mesajlar sözlükten (i18n fabrikası). Mesaj artık alanın
// ALTINDA gösterildiği için sabit Türkçe metin EN oturumda görünür kusur olurdu.
const buildOrderFormSchema = (t: (key: string) => string) =>
  z.object({
    status: z.string().min(1, t('admin.orders.form.validation.statusRequired')),
    customer_name: z.string().min(1, t('admin.orders.form.validation.customerNameRequired')),
    customer_email: z
      .string()
      .email(t('admin.orders.form.validation.emailInvalid'))
      .min(1, t('admin.orders.form.validation.emailRequired')),
    customer_phone: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    tracking_number: z.string().optional().nullable(),
    shipping_method: z.string().optional().nullable(),
  })

type OrderFormValues = z.infer<ReturnType<typeof buildOrderFormSchema>>

/* ---------------------------------------------------------------------------
 * ALAN SEVİYESİ HATA GERİ BİLDİRİMİ (cetvel `docs/standards/admin-design-standard.md` §4.6)
 *
 * Hata, oluştuğu girdinin YANINDA durur — toast kaybolur, bu satır kalmaz.
 * `aria-invalid` + `aria-describedby` bağı, ekran okuyucu kullanıcısının bozuk
 * alana odaklandığında hatayı DUYMASINI sağlar; toast bu bağı KURAMAZ.
 * Renk tek başına taşıyıcı değildir (WCAG 1.4.1): asıl sinyal mesajın METNİ.
 * ------------------------------------------------------------------------- */

/** Girdinin hemen altındaki hata satırı. Hata yoksa DOM'a hiçbir şey basmaz. */
const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="mt-1 px-1 text-xs font-bold tracking-tighter text-admin-danger">
      {message}
    </p>
  ) : null

/** Submit'te odak taşınacak alanların DOM sırası (yukarıdan aşağı). */
const FIELD_FOCUS_ORDER: { name: keyof OrderFormValues; id: string }[] = [
  { name: 'customer_name', id: 'order-customer-name' },
  { name: 'customer_email', id: 'order-customer-email' },
  { name: 'status', id: 'order-status' },
]

/**
 * İlk bozuk alana odak: kullanıcı hatayı görmek için scroll/sekme aramasın.
 * `shouldFocusError:false` ile RHF'nin kendi odak denemesi kapatıldı — sıra
 * DETERMİNİSTİK olsun diye (bu alanların üçü de "Genel" sekmesindedir).
 */
function focusFirstInvalid(errs: FieldErrors<OrderFormValues>): void {
  const first = FIELD_FOCUS_ORDER.find(({ name }) => errs[name])
  if (!first) return
  document.getElementById(first.id)?.focus()
}

// --- İleri-yön statü kuralı (CLAUDE.md Kural 11: sipariş durumu monoton) ---
// Happy-path sırası; terminal statülere (cancelled/refunded/partial_refunded) gelindiyse GERİ dönülemez.
const STATUS_FLOW = ['pending', 'paid', 'confirmed', 'shipped', 'delivered'] as const
const TERMINAL_STATUSES = ['cancelled', 'refunded', 'partial_refunded'] as const

function isStatusTransitionAllowed(current: string, target: string): boolean {
  if (current === target) return true
  const currentTerminal = (TERMINAL_STATUSES as readonly string[]).includes(current)
  const targetTerminal = (TERMINAL_STATUSES as readonly string[]).includes(target)
  // İptal/iade (terminal) → tekrar AKTİF statü YASAK. Asıl "geri alma" budur:
  // iptal/iade parayı + stoğu geri işler, menüyle geri almak kayıtları bozar.
  if (currentTerminal && !targetTerminal) return false
  // İptal/iade İÇİNDE ilerleme (ör. iptal → iade, kısmi iade → tam iade) SERBEST.
  if (currentTerminal && targetTerminal) return true
  // Aktif → iptal/iade (müşteri iptal/iade talebi) her aktif statüden SERBEST.
  if (targetTerminal) return true
  // Aktif → aktif: yalnız ileri (happy-path; geri dönüş yasak).
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
  const confirm = useConfirm()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('orders')

  const [loadingOrder, setLoadingOrder] = useState(false)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<DetailOrder | null>(null)

  const schema = React.useMemo(() => buildOrderFormSchema(t), [t])
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    // Odak sırasını biz yönetiyoruz (bkz. focusFirstInvalid).
    shouldFocusError: false,
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

  /**
   * Kirli-form guard'i — window.confirm yerine ConfirmDialog (cetvel §4.7).
   * Kapatma AKISI DEGISTI: eskiden confirm senkron blokluyordu; artik kapatma
   * ISTEGI once yakalanir, onay beklenir, ancak onaylanirsa gercekten kapatilir.
   * Degisiklikleri atmak GERI ALINAMAZ -> tone:'danger'.
   */
  const handleClose = async () => {
    if (!form.formState.isDirty) {
      onOpenChange(false)
      return
    }
    const ok = await confirm({
      description: t('admin.categories.unsavedChangesConfirm'),
      confirmLabel: t('admin.confirm.discardChanges'),
      tone: 'danger',
    })
    if (ok) onOpenChange(false)
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

  const errors = form.formState.errors
  const customerNameError = errors.customer_name?.message
  const customerEmailError = errors.customer_email?.message
  const statusError = errors.status?.message

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-modal" />
        <Dialog.Content
          // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
          aria-modal="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-90vh overflow-hidden bg-admin-bg border border-admin-border rounded-admin-lg shadow-admin-lg z-modal flex flex-col">
          <div className="p-6 border-b border-admin-border flex items-center justify-between bg-admin-surface-2">
            <div>
              <Dialog.Title className="text-xl font-bold text-admin-fg tracking-tight">
                {order ? `${t('admin.orders.orderDetails')} — ${order.order_number || order.id.slice(0, 8)}` : ''}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-admin-fg-muted mt-1">
                {t('admin.orders.form.descEdit')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-admin-md hover:bg-admin-surface-3 transition-colors text-admin-fg-muted hover:text-admin-fg">
              <X size={20} />
            </Dialog.Close>
          </div>

          {loadingOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
              <Loader2 className="animate-spin text-admin-accent" size={32} />
              <span className="text-xs font-semibold text-admin-fg-muted">
                {t('admin.common.loading')}
              </span>
            </div>
          ) : (
            <Tabs.Root defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
              <Tabs.List className="px-6 py-2 border-b border-admin-border flex gap-4 bg-admin-surface-2">
                <Tabs.Trigger
                  value="general"
                  className="px-4 py-2 text-xs font-bold text-admin-fg-muted border-b-2 border-transparent data-[state=active]:text-admin-accent data-[state=active]:border-admin-accent transition-colors"
                >
                  {t('admin.settings.tabGeneral')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="shipping"
                  className="px-4 py-2 text-xs font-bold text-admin-fg-muted border-b-2 border-transparent data-[state=active]:text-admin-accent data-[state=active]:border-admin-accent transition-colors"
                >
                  {t('admin.orders.form.tabShipping')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="items"
                  className="px-4 py-2 text-xs font-bold text-admin-fg-muted border-b-2 border-transparent data-[state=active]:text-admin-accent data-[state=active]:border-admin-accent transition-colors animate-in fade-in"
                >
                  {t('admin.orders.form.tabItems')}
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="order-form" onSubmit={form.handleSubmit(onSubmit, focusFirstInvalid)} className="space-y-8">
                  <Tabs.Content value="general" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="order-customer-name" className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.customerName')}
                        </label>
                        <input
                          id="order-customer-name"
                          {...form.register('customer_name')}
                          aria-invalid={customerNameError ? true : undefined}
                          aria-describedby={customerNameError ? 'order-customer-name-error' : undefined}
                          className={`w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors placeholder:text-admin-fg-subtle${customerNameError ? ' !border-admin-danger' : ''}`}
                        />
                        <FieldError id="order-customer-name-error" message={customerNameError} />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="order-customer-email" className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.customerEmail')}
                        </label>
                        <input
                          id="order-customer-email"
                          {...form.register('customer_email')}
                          aria-invalid={customerEmailError ? true : undefined}
                          aria-describedby={customerEmailError ? 'order-customer-email-error' : undefined}
                          className={`w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors placeholder:text-admin-fg-subtle${customerEmailError ? ' !border-admin-danger' : ''}`}
                        />
                        <FieldError id="order-customer-email-error" message={customerEmailError} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.customerPhone')}
                        </label>
                        <input
                          {...form.register('customer_phone')}
                          className="w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors placeholder:text-admin-fg-subtle"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="order-status" className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.orderStatus')}
                        </label>
                        <select
                          id="order-status"
                          {...form.register('status')}
                          aria-invalid={statusError ? true : undefined}
                          aria-describedby={statusError ? 'order-status-error' : undefined}
                          className={`w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors appearance-none cursor-pointer${statusError ? ' !border-admin-danger' : ''}`}
                        >
                          <option value="pending" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'pending')}>
                            {t('admin.orders.statusLabels.pending')}
                          </option>
                          <option value="paid" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'paid')}>
                            {t('admin.orders.statusLabels.paid')}
                          </option>
                          <option value="confirmed" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'confirmed')}>
                            {t('admin.orders.statusLabels.confirmed')}
                          </option>
                          <option value="shipped" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'shipped')}>
                            {t('admin.orders.statusLabels.shipped')}
                          </option>
                          <option value="delivered" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'delivered')}>
                            {t('admin.orders.statusLabels.delivered')}
                          </option>
                          <option value="cancelled" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'cancelled')}>
                            {t('admin.orders.statusLabels.cancelled')}
                          </option>
                          <option value="refunded" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'refunded')}>
                            {t('admin.orders.statusLabels.refunded')}
                          </option>
                          <option value="partial_refunded" className="bg-admin-bg" disabled={!isStatusTransitionAllowed(currentStatus, 'partial_refunded')}>
                            {t('admin.orders.statusLabels.partialRefunded')}
                          </option>
                        </select>
                        <FieldError id="order-status-error" message={statusError} />
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="shipping" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.carrier')}
                        </label>
                        <input
                          {...form.register('carrier')}
                          className="w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors placeholder:text-admin-fg-subtle"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.trackingNumber')}
                        </label>
                        <input
                          {...form.register('tracking_number')}
                          className="w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors placeholder:text-admin-fg-subtle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-admin-fg-muted px-1">
                          {t('admin.orders.form.shippingMethod')}
                        </label>
                        <select
                          {...form.register('shipping_method')}
                          className="w-full bg-admin-surface-2 border border-admin-border rounded-admin-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-admin-accent/30 focus-visible:bg-admin-surface-2 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="standard" className="bg-admin-bg">
                            {t('admin.orders.form.shippingStandard')}
                          </option>
                          <option value="express" className="bg-admin-bg">
                            {t('admin.orders.form.shippingExpress')}
                          </option>
                        </select>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="items" className="space-y-6">
                    <div className="bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden">
                      <table className="min-w-full text-xs divide-y divide-admin-border">
                        <thead className="bg-admin-surface-2">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-admin-fg-muted">
                              {t('admin.orders.form.itemsTableProduct')}
                            </th>
                            <th className="px-4 py-2.5 text-center font-semibold text-admin-fg-muted w-20">
                              {t('admin.orders.form.itemsTableQuantity')}
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted w-32">
                              {t('admin.orders.form.itemsTableUnitPrice')}
                            </th>
                            <th className="px-4 py-2.5 text-right font-semibold text-admin-fg-muted w-32">
                              {t('admin.orders.form.itemsTableTotal')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                          {items.map((it) => {
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
                  </Tabs.Content>
                </form>
              </div>

              <div className="p-6 border-t border-admin-border flex items-center justify-between bg-admin-surface-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-xs font-bold text-admin-fg-muted hover:text-admin-fg transition-colors"
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
