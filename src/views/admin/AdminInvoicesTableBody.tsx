'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { FileCheck2, Receipt, SearchX } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import {
  createInvoice,
  listInvoices,
  listUninvoicedPaidOrders,
  type OrderInvoiceRow,
  type UninvoicedOrderRow,
} from '@/lib/services/orderInvoice.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import { AdminModal } from '../../components/admin/overlay/AdminModal'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { SYSTEM_CURRENCY } from '../../i18n/currency'
import { formatDate } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminInputClass,
  adminTableActionPrimaryClass,
} from '../../utils/adminUi'

/**
 * Fatura defteri gövdesi — iki liste, tek ekran (T132-VH, cetvel §2.3).
 *
 * ÜST LİSTE (bekleyen) prosedürün 1. adımıdır ve kaynağı `view_admin_uninvoiced_orders`
 * görünümüdür. Süzme BİLEREK DB'de: "faturalandı mı" istemcide hesaplansaydı sayfalama
 * ile birlikte yanlış cevap verirdi — o sayfada görünmeyen bir fatura satırı yüzünden
 * faturalı sipariş "faturasız" listelenirdi.
 *
 * ALT LİSTE defterin kendisidir. Satırlar DEĞİŞTİRİLEMEZ: `order_invoices` üzerinde
 * UPDATE/DELETE politikası yoktur, bu yüzden burada düzenle/sil eylemi de YOKTUR.
 * Ekranda olmayan bir eylemi DB'nin reddetmesi doğru ama geç bir savunmadır; ikisi
 * aynı şeyi söylemeli.
 *
 * PARA BİRİMİ: `SYSTEM_CURRENCY` — sipariş satırında para birimi kolonu YOK (2026-08-20'de
 * prod'dan ölçüldü). Dilden türetmek T094-VH'de kapatılan kusurdur (INV-CURRENCY-1).
 */
const AdminInvoicesTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('invoices')

  /* ---- defter (alt liste) ---- */
  const fetcher = useCallback(
    async (
      supabase: SupabaseClient<Database>,
      _params: FetchParams,
    ): Promise<FetchResult<OrderInvoiceRow>> => {
      const { rows } = await listInvoices(supabase, { limit: 200 })
      return { rows, totalMatched: rows.length }
    },
    [],
  )

  const table = useAdminTable<OrderInvoiceRow>({
    resource: 'invoices',
    rowId: (r) => r.id,
    fetcher,
    paginationMode: 'client',
    sortMode: 'client',
    pageSize: 50,
    initialSort: { key: 'invoice_date', dir: 'desc' },
    syncUrl: true,
  })

  /* ---- bekleyenler (üst liste) ---- */
  const [pending, setPending] = useState<UninvoicedOrderRow[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)

  const loadPending = useCallback(async () => {
    setPendingLoading(true)
    try {
      setPending(await listUninvoicedPaidOrders(supabaseBrowserClient))
    } catch (err) {
      console.error('[invoices] pending load failed:', err)
      toast.error(t('admin.invoices.toasts.loadError'))
    } finally {
      setPendingLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadPending()
  }, [loadPending])

  /* ---- kayıt açma ---- */
  const [target, setTarget] = useState<UninvoicedOrderRow | null>(null)
  const [invoiceNo, setInvoiceNo] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const openForm = (row: UninvoicedOrderRow) => {
    setTarget(row)
    setInvoiceNo('')
    setNote('')
    // Varsayılan BUGÜN; kesim tarihi geçmişse kullanıcı düzeltir.
    setInvoiceDate(new Date().toISOString().slice(0, 10))
  }

  const handleSave = async () => {
    if (!target || saving) return
    if (!invoiceNo.trim() || !invoiceDate) return
    const row = target
    setSaving(true)
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'invoices',
        action: 'INSERT',
        rowPk: null,
        canWrite: hasWriteAccess,
        before: null,
        after: null,
        // Denetim izine müşteri adı/e-postası YAZILMAZ: fatura kaydı zaten defterde,
        // kişisel veriyi ikinci kez kopyalamak KVKK veri minimizasyonuna aykırı olur.
        afterFrom: (created) => ({
          id: created.id,
          order_id: created.order_id,
          invoice_no: created.invoice_no,
          invoice_date: created.invoice_date,
        }),
        // INV-6: servise-delege yazımda await ZORUNLU.
        fn: async () =>
          await createInvoice(supabaseBrowserClient, {
            orderId: row.id,
            invoiceNo,
            invoiceDate,
            invoiceType: row.invoice_type,
            note,
          }),
      })
      toast.success(t('admin.invoices.toasts.created'))
      setTarget(null)
      await Promise.all([loadPending(), table.reload()])
    } catch (err) {
      // Tekil indeks ihlali kullanıcı hatasıdır, sistem hatası değil — ayrı mesaj.
      const mesaj = err instanceof Error ? err.message : ''
      const tekrar = /duplicate key|unique constraint|23505/i.test(mesaj)
      console.error('[invoices] create failed:', err)
      toast.error(
        tekrar ? t('admin.invoices.toasts.duplicate') : t('admin.invoices.toasts.createError'),
      )
    } finally {
      setSaving(false)
    }
  }

  const columns: AdminColumn<OrderInvoiceRow>[] = useMemo(() => {
    // Sözlük anahtarı ÜRETİLMEZ, adıyla seçilir: dinamik anahtar i18n bekçisinin
    // göremediği bir yüzey yaratır ve eksik çeviri ekrana ham anahtar olarak basar.
    const faturaTipi = (deger: string | null) => {
      if (deger === 'individual') return t('admin.invoices.types.individual')
      if (deger === 'corporate') return t('admin.invoices.types.corporate')
      return t('admin.invoices.types.unknown')
    }

    return [
      {
        key: 'invoice_no',
        header: t('admin.invoices.table.invoiceNo'),
        sortable: true,
        cell: (r) => <span className="font-medium text-admin-fg">{r.invoice_no}</span>,
      },
      {
        key: 'invoice_date',
        header: t('admin.invoices.table.invoiceDate'),
        sortable: true,
        cell: (r) => <span>{formatDate(r.invoice_date, lang)}</span>,
      },
      {
        key: 'invoice_type',
        header: t('admin.invoices.table.invoiceType'),
        sortable: true,
        facetAccessor: (r) => r.invoice_type ?? 'unknown',
        cell: (r) => <span>{faturaTipi(r.invoice_type)}</span>,
      },
      {
        key: 'note',
        header: t('admin.invoices.table.note'),
        cell: (r) => <span className="text-admin-fg-muted">{r.note ?? '—'}</span>,
      },
    ]
  }, [t, lang])

  return (
    <div className="space-y-8">
      {/* Adım 1: faturası bekleyen ödenmiş siparişler */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-admin-fg">
            {t('admin.invoices.pending.heading')}
          </h2>
          <p className="text-sm text-admin-fg-muted">{t('admin.invoices.pending.note')}</p>
        </div>

        {pendingLoading ? null : pending.length === 0 ? (
          <AdminEmptyState
            icon={FileCheck2}
            title={t('admin.invoices.pending.emptyTitle')}
            description={t('admin.invoices.pending.emptyDescription')}
          />
        ) : (
          <div className="overflow-x-auto rounded-admin-lg border border-admin-border">
            <table className="w-full text-sm">
              <thead className="bg-admin-surface-muted text-admin-fg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">{t('admin.invoices.table.orderNumber')}</th>
                  <th className="px-4 py-2 text-left">{t('admin.invoices.table.customer')}</th>
                  <th className="px-4 py-2 text-left">{t('admin.invoices.table.orderedAt')}</th>
                  <th className="px-4 py-2 text-right">{t('admin.invoices.table.total')}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-t border-admin-border">
                    <td className="px-4 py-2 font-medium text-admin-fg">{r.order_number ?? '—'}</td>
                    <td className="px-4 py-2">{r.customer_name ?? '—'}</td>
                    <td className="px-4 py-2">{formatDate(r.created_at, lang)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {r.total_amount === null
                        ? '—'
                        : formatCurrency(r.total_amount, lang, { currency: SYSTEM_CURRENCY })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {hasWriteAccess ? (
                        <button
                          type="button"
                          className={adminTableActionPrimaryClass}
                          onClick={() => openForm(r)}
                        >
                          {t('admin.invoices.pending.action')}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Adım 5: defterin kendisi (değiştirilemez) */}
      <section className="space-y-3">
        <p className="text-sm text-admin-fg-muted">{t('admin.invoices.immutableNote')}</p>

        <DataTableKit
          columns={columns}
          table={table}
          rowId={(r) => r.id}
          persistKey="invoices"
          hasWriteAccess={hasWriteAccess}
          emptyState={
            <AdminEmptyState
              icon={Receipt}
              title={t('admin.invoices.ledger.emptyTitle')}
              description={t('admin.invoices.ledger.emptyDescription')}
            />
          }
          filterEmptyState={
            <AdminEmptyState
              icon={SearchX}
              title={t('admin.invoices.ledger.emptyTitle')}
              description={t('admin.invoices.ledger.emptyDescription')}
            />
          }
        />
      </section>

      {/* Kayıt formu — fatura entegratörde kesilir, buraya KİMLİĞİ işlenir (cetvel §2.3/5) */}
      <AdminModal
        open={target !== null}
        onOpenChange={(acik) => {
          if (!acik) setTarget(null)
        }}
        title={t('admin.invoices.form.title')}
        description={t('admin.invoices.form.description')}
        closeLabel={t('admin.invoices.form.cancel')}
        footer={
          <>
            <button
              type="button"
              className={adminButtonSecondaryClass}
              onClick={() => setTarget(null)}
            >
              {t('admin.invoices.form.cancel')}
            </button>
            <button
              type="button"
              className={adminButtonPrimaryClass}
              disabled={saving || !invoiceNo.trim() || !invoiceDate}
              onClick={() => void handleSave()}
            >
              {t('admin.invoices.form.save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-admin-fg">
              {t('admin.invoices.form.invoiceNo')}
            </span>
            <input
              className={adminInputClass}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
            <span className="block text-xs text-admin-fg-muted">
              {t('admin.invoices.form.invoiceNoHint')}
            </span>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-admin-fg">
              {t('admin.invoices.form.invoiceDate')}
            </span>
            <input
              type="date"
              className={adminInputClass}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-admin-fg">
              {t('admin.invoices.form.note')}
            </span>
            <input
              className={adminInputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </AdminModal>
    </div>
  )
}

export default AdminInvoicesTableBody
