'use client'

import { Plus, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/i18n/I18nProvider'
import {
  createPurchaseOrder,
  createSupplier,
  listSuppliers,
  type SupplierRow,
} from '@/lib/services/purchasing.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'
import { adminTableActionPrimaryClass } from '@/utils/adminUi'

/**
 * Yeni PO paneli (T062 D4, cetvel §8). Satır maliyet SNAPSHOT'ları burada girilir
 * ve sipariş anında donar (§5.1). Katalog fiyat alanlarına DOKUNULMAZ (§5.2 / R3):
 * ürün arama yalnız id/name/sku çeker.
 */

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface DraftLine {
  product: ProductOption
  qty: string
  unitCost: string
}

const inputClass =
  'h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-sm font-semibold text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40'

interface Props {
  onCreated: () => void
  onCancel: () => void
}

const CreatePurchaseOrderPanel: React.FC<Props> = ({ onCreated, onCancel }) => {
  const { t } = useI18n()

  const [suppliers, setSuppliers] = useState<SupplierRow[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [showNewSupplier, setShowNewSupplier] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [expectedAt, setExpectedAt] = useState('')
  const [note, setNote] = useState('')

  const [productTerm, setProductTerm] = useState('')
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [lines, setLines] = useState<DraftLine[]>([])
  const [submitting, setSubmitting] = useState(false)

  const reloadSuppliers = useCallback(async () => {
    try {
      setSuppliers(await listSuppliers(supabaseBrowserClient))
    } catch (err) {
      console.warn('supplier list failed', err)
    }
  }, [])

  useEffect(() => {
    void reloadSuppliers()
  }, [reloadSuppliers])

  /* Ürün arama — yalnız kimlik alanları (R3: katalog fiyat alanları çekilmez). */
  useEffect(() => {
    const term = productTerm.trim()
    if (term.length < 2) {
      setProductOptions([])
      return
    }
    const handle = setTimeout(() => {
      void (async () => {
        const { data, error } = await supabaseBrowserClient
          .from('products')
          .select('id, name, sku')
          .is('deleted_at', null)
          .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
          .limit(8)
        if (!error) setProductOptions(data ?? [])
      })()
    }, 250)
    return () => clearTimeout(handle)
  }, [productTerm])

  const addLine = useCallback((product: ProductOption) => {
    setLines((prev) =>
      prev.some((l) => l.product.id === product.id)
        ? prev
        : [...prev, { product, qty: '1', unitCost: '' }],
    )
    setProductTerm('')
    setProductOptions([])
  }, [])

  const saveNewSupplier = useCallback(async () => {
    const name = newSupplierName.trim()
    if (!name) return
    try {
      const created = await createSupplier(supabaseBrowserClient, { name, currency })
      toast.success(t('admin.purchasing.toasts.supplierCreated'))
      setNewSupplierName('')
      setShowNewSupplier(false)
      await reloadSuppliers()
      setSupplierId(created.id)
    } catch (err) {
      console.warn('supplier create failed', err)
      toast.error(t('admin.purchasing.toasts.supplierCreateFailed'))
    }
  }, [currency, newSupplierName, reloadSuppliers, t])

  const submit = useCallback(async () => {
    if (!supplierId) {
      toast.error(t('admin.purchasing.toasts.supplierRequired'))
      return
    }
    const parsed = lines
      .map((l) => ({
        product_id: l.product.id,
        qty_ordered: Number(l.qty),
        unit_cost: Number(l.unitCost),
      }))
      .filter((l) => Number.isInteger(l.qty_ordered) && l.qty_ordered > 0 && Number.isFinite(l.unit_cost) && l.unit_cost >= 0)
    if (parsed.length === 0) {
      toast.error(t('admin.purchasing.toasts.lineRequired'))
      return
    }
    try {
      setSubmitting(true)
      await createPurchaseOrder(supabaseBrowserClient, {
        supplier_id: supplierId,
        currency,
        expected_at: expectedAt || null,
        note: note.trim() || null,
        lines: parsed,
      })
      toast.success(t('admin.purchasing.toasts.createSuccess'))
      onCreated()
    } catch (err) {
      console.warn('po create failed', err)
      toast.error(t('admin.purchasing.toasts.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }, [currency, expectedAt, lines, note, onCreated, supplierId, t])

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-lg p-4 space-y-4">
      <h2 className="text-sm font-semibold text-admin-fg">{t('admin.purchasing.create.title')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
          {t('admin.purchasing.create.supplier')}
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('admin.purchasing.create.supplierPlaceholder')}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
          {t('admin.purchasing.create.currency')}
          <input
            type="text"
            maxLength={3}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
          {t('admin.purchasing.create.expectedAt')}
          <input
            type="date"
            value={expectedAt}
            onChange={(e) => setExpectedAt(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="space-y-2">
        {!showNewSupplier ? (
          <button
            type="button"
            onClick={() => setShowNewSupplier(true)}
            className="text-xs font-semibold text-admin-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 rounded-admin-md"
          >
            + {t('admin.purchasing.create.newSupplier')}
          </button>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
              {t('admin.purchasing.create.newSupplierName')}
              <input
                type="text"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => void saveNewSupplier()}
              className={`${adminTableActionPrimaryClass} !px-3`}
            >
              {t('admin.purchasing.create.newSupplierSave')}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-admin-accent">
          {t('admin.purchasing.create.linesTitle')}
        </h3>
        <div className="relative max-w-md">
          <input
            type="text"
            value={productTerm}
            onChange={(e) => setProductTerm(e.target.value)}
            placeholder={t('admin.purchasing.create.productSearch')}
            className={`${inputClass} w-full`}
          />
          {productOptions.length > 0 && (
            <ul className="absolute z-dropdown mt-1 w-full bg-admin-surface border border-admin-border rounded-admin-md shadow-admin-md max-h-56 overflow-auto">
              {productOptions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addLine(p)}
                    className="w-full text-left px-3 py-2 text-sm text-admin-fg hover:bg-admin-surface-3 focus-visible:outline-none focus-visible:bg-admin-surface-3"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-admin-fg-muted ml-2">{p.sku}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.map((line, idx) => (
          <div
            key={line.product.id}
            className="flex flex-wrap items-end gap-3 bg-admin-surface-2 border border-admin-border rounded-admin-md p-3"
          >
            <div className="min-w-40 flex-1">
              <div className="text-sm font-semibold text-admin-fg">{line.product.name}</div>
              <div className="text-xs text-admin-fg-muted">{line.product.sku}</div>
            </div>
            <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
              {t('admin.purchasing.create.qty')}
              <input
                type="number"
                min="1"
                step="1"
                value={line.qty}
                onChange={(e) =>
                  setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, qty: e.target.value } : l)))
                }
                className={`${inputClass} w-24`}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted">
              {t('admin.purchasing.create.unitCost')}
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.unitCost}
                onChange={(e) =>
                  setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, unitCost: e.target.value } : l)))
                }
                className={`${inputClass} w-32`}
              />
            </label>
            <button
              type="button"
              onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
              aria-label={t('admin.purchasing.create.removeLine')}
              className="h-9 px-2 text-admin-danger rounded-admin-md border border-admin-border hover:bg-admin-danger-weak focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger/40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-xs font-bold text-admin-fg-muted max-w-md">
        {t('admin.purchasing.create.note')}
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 text-sm font-semibold text-admin-fg-muted rounded-admin-md border border-admin-border hover:bg-admin-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
        >
          {t('admin.purchasing.create.cancel')}
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className={`${adminTableActionPrimaryClass} !px-4 disabled:opacity-50 gap-1.5`}
        >
          <Plus size={14} />
          {t('admin.purchasing.create.submit')}
        </button>
      </div>
    </section>
  )
}

export default CreatePurchaseOrderPanel
