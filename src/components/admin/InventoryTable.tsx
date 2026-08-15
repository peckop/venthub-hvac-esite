'use client'

import { Pencil, SearchX } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import type { UseAdminTableResult } from '../../hooks/useAdminTable'
import type { InventoryRow } from '../../types/inventory'
import {
  adminInputWidthLocationClass,
  adminInputWidthSupplierClass,
  adminSupplierMaxWidthClass,
  adminTableActionClass,
} from '../../utils/adminUi'
import AdminEmptyState from './AdminEmptyState'
import { DataTableKit } from './data-table/DataTableKit'
import type { AdminColumn } from './data-table/types'

type InventoryRowWithCategory = InventoryRow & {
  category_id?: string | null
  low_stock_threshold?: number | null
}

interface InventoryTableProps {
  table: UseAdminTableResult<InventoryRowWithCategory>
  hasWriteAccess: boolean
  onUpdateLocation: (productId: string, val: string) => Promise<void>
  onUpdateSupplier: (productId: string, val: string) => Promise<void>
  /** verilirse satır sonuna "Detaylar" aksiyon hücresi eklenir → stok detay çekmecesi */
  onSelectRow?: (row: InventoryRowWithCategory) => void
}

/* ---- Inline Text Edit Cell (location / supplier) ---- */
interface InlineTextCellProps {
  value: string
  widthClass: string
  ariaLabel?: string
  placeholder?: string
  extraSpanClass?: string
  onSave: (val: string) => Promise<void>
}

const InlineTextCell: React.FC<InlineTextCellProps> = ({
  value,
  widthClass,
  ariaLabel,
  placeholder = '-',
  extraSpanClass = '',
  onSave,
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = useCallback(async () => {
    setEditing(false)
    if (draft === value) return
    try {
      await onSave(draft)
    } catch {
      setDraft(value)
    }
  }, [draft, value, onSave])

  if (editing) {
    return (
      <div className="relative inline-block animate-in fade-in zoom-in duration-300">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          aria-label={ariaLabel}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void commit()
            if (e.key === 'Escape') {
              setDraft(value)
              setEditing(false)
            }
          }}
          className={`${widthClass} bg-admin-bg border-2 border-admin-accent/30 rounded-admin-md px-2 py-1 text-xs text-admin-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-admin-accent/30 font-bold`}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/btn relative px-3 py-1.5 rounded-admin-md border border-admin-border bg-admin-surface-2 hover:bg-admin-surface-3 hover:border-admin-border transition-colors duration-300 flex items-center gap-1.5 text-left"
    >
      <span className={`text-xs font-bold text-admin-fg group-hover/btn:text-admin-accent transition-colors truncate block ${extraSpanClass}`}>
        {value || <span className="text-admin-fg-muted">{placeholder}</span>}
      </span>
      <Pencil size={8} className="text-admin-fg-subtle group-hover/btn:text-admin-accent transition-colors flex-shrink-0" />
    </button>
  )
}

export default function InventoryTable({
  table,
  hasWriteAccess,
  onUpdateLocation,
  onUpdateSupplier,
  onSelectRow,
}: InventoryTableProps) {
  const { t } = useI18n()

  const statusBadge = useCallback((r: InventoryRowWithCategory) => {
    const net = r.available_stock
    const th = r.low_stock_threshold ?? 5
    const base = 'px-3 py-1 text-xs font-semibold rounded-full border shadow-admin-sm transition-colors'

    if (net <= 0) {
      return (
        <span className={`${base} bg-admin-danger-weak text-admin-danger border-admin-danger/30`}>
          {t('admin.inventory.status.depleted')}
        </span>
      )
    }
    if (th != null && net <= th) {
      return (
        <span className={`${base} bg-admin-warning-weak text-admin-warning border-admin-warning/30 animate-pulse`}>
          {t('admin.inventory.status.criticalBadge')}
        </span>
      )
    }
    if (r.reserved_stock > 0) {
      return (
        <span className={`${base} bg-admin-accent-weak text-admin-accent border-admin-accent/30`}>
          {t('admin.inventory.status.reservedBadge')}
        </span>
      )
    }
    return (
      <span className={`${base} bg-admin-success-weak text-admin-success border-admin-success/30`}>
        {t('admin.inventory.status.availableBadge')}
      </span>
    )
  }, [t])

  const columns = useMemo<AdminColumn<InventoryRowWithCategory>[]>(
    () => [
      {
        key: 'name',
        header: t('admin.inventory.table.productCol'),
        sortable: true,
        cell: (r) => (
          <div className="flex flex-col">
            <span className="font-semibold text-admin-fg group-hover:text-admin-accent transition-colors tracking-tight text-xs">
              {r.name}
            </span>
            <span className="text-xs font-mono text-admin-fg-muted tracking-tighter mt-0.5">
              {r.product_id.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        key: 'physical',
        header: t('admin.inventory.table.physicalCol'),
        headerHint: t('admin.inventory.tooltip.physical'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono font-bold text-admin-fg">{r.physical_stock}</span>,
      },
      {
        key: 'reserved',
        header: t('admin.inventory.table.reservedCol'),
        headerHint: t('admin.inventory.tooltip.reserved'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono text-admin-fg-muted">{r.reserved_stock}</span>,
      },
      {
        key: 'available',
        header: t('admin.inventory.table.availableCol'),
        headerHint: t('admin.inventory.tooltip.available'),
        sortable: true,
        align: 'right',
        cellClassName: 'text-admin-accent',
        cell: (r) => <span className="font-mono font-semibold">{r.available_stock}</span>,
      },
      {
        key: 'threshold',
        header: t('admin.inventory.table.thresholdCol'),
        headerHint: t('admin.inventory.tooltip.threshold'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono text-admin-fg-muted">{r.low_stock_threshold ?? 5}</span>,
      },
      {
        key: 'location',
        header: t('admin.inventory.table.locationCol'),
        sortable: true,
        align: 'left',
        cell: (r) =>
          hasWriteAccess ? (
            <InlineTextCell
              value={r.warehouse_location || ''}
              placeholder="-"
              widthClass={adminInputWidthLocationClass}
              ariaLabel={t('admin.inventory.table.locationCol')}
              onSave={(val) => onUpdateLocation(r.product_id, val)}
            />
          ) : (
            <span className="text-admin-fg-muted text-xs font-bold">{r.warehouse_location || '-'}</span>
          ),
      },
      {
        key: 'supplier',
        header: t('admin.inventory.table.supplierCol'),
        sortable: true,
        align: 'left',
        cell: (r) =>
          hasWriteAccess ? (
            <InlineTextCell
              value={r.supplier_name || ''}
              placeholder="-"
              widthClass={adminInputWidthSupplierClass}
              extraSpanClass={adminSupplierMaxWidthClass}
              ariaLabel={t('admin.inventory.table.supplierCol')}
              onSave={(val) => onUpdateSupplier(r.product_id, val)}
            />
          ) : (
            <span className={`text-admin-fg-muted text-xs block ${adminSupplierMaxWidthClass} truncate`}>
              {r.supplier_name || '-'}
            </span>
          ),
      },
      {
        key: 'abc',
        header: t('admin.inventory.table.abcCol'),
        headerHint: t('admin.inventory.tooltip.abc'),
        sortable: true,
        align: 'center',
        hideable: true,
        defaultHidden: true,
        cell: (r) =>
          r.abc_class ? (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-admin-md font-semibold text-xs border shadow-admin-sm ${
                r.abc_class === 'A'
                  ? 'bg-admin-success-weak text-admin-success border-admin-success/30'
                  : r.abc_class === 'B'
                  ? 'bg-admin-warning-weak text-admin-warning border-admin-warning/30'
                  : 'bg-admin-surface-3 text-admin-fg-muted border-admin-border'
              }`}
            >
              {r.abc_class}
            </span>
          ) : (
            '-'
          ),
      },
      {
        key: 'days',
        header: t('admin.inventory.table.daysCol'),
        headerHint: t('admin.inventory.tooltip.days'),
        sortable: true,
        align: 'right',
        hideable: true,
        defaultHidden: true,
        cell: (r) => {
          if (r.days_until_empty === 9999) {
            return (
              <span className="text-xs text-admin-fg-subtle font-semibold">
                {t('admin.inventory.table.stable')}
              </span>
            )
          }
          const isWarning = typeof r.days_until_empty === 'number' && r.days_until_empty <= 7
          return (
            <div
              className={`text-xs font-semibold ${
                isWarning ? 'text-admin-danger animate-pulse' : 'text-admin-fg-muted'
              }`}
            >
              {isWarning && '🔥 '}
              {t('admin.inventory.table.daysCount', { count: r.days_until_empty })}
            </div>
          )
        },
      },
      {
        key: 'status',
        header: t('admin.inventory.table.statusCol'),
        sortable: false,
        align: 'center',
        cell: (r) => statusBadge(r),
      },
      /**
       * DETAY — kit'in `onRowClick`'i (satırın kendisini `role="button"` yapar) BİLEREK
       * kullanılmadı: yazma yetkisi olan kullanıcıda satır içinde ZATEN odaklanabilir
       * butonlar var (raf/tedarikçi satır-içi düzenleme). Satırı da butona çevirmek
       * "interaktif içinde interaktif" üretir — axe `nested-interactive` ihlali ve
       * klavyede belirsiz hedef. Bu yüzden detay AÇIK bir aksiyon hücresi.
       */
      ...(onSelectRow
        ? ([
            {
              key: 'detail',
              header: t('admin.inventory.stockDetails'),
              sortable: false,
              align: 'right',
              cell: (r) => (
                <button
                  type="button"
                  onClick={() => onSelectRow(r)}
                  aria-label={`${r.name} — ${t('admin.inventory.stockDetails')}`}
                  className={adminTableActionClass}
                >
                  {t('admin.ui.details')}
                </button>
              ),
            },
          ] as AdminColumn<InventoryRowWithCategory>[])
        : []),
    ],
    [t, hasWriteAccess, onUpdateLocation, onUpdateSupplier, statusBadge, onSelectRow],
  )

  return (
    <DataTableKit
      columns={columns}
      table={table}
      rowId={(r) => r.product_id}
      persistKey="inventory"
      hasWriteAccess={hasWriteAccess}
      totalLabel={t('admin.common.total') || 'Toplam'}
      emptyState={
        <AdminEmptyState
          icon={SearchX}
          title={t('admin.inventory.empty.title')}
          description={t('admin.inventory.empty.description')}
        />
      }
      filterEmptyState={
        <AdminEmptyState
          icon={SearchX}
          title={t('admin.inventory.empty.title')}
          description={t('admin.inventory.empty.description')}
        />
      }
      columnsButtonLabel={t('admin.common.view')}
    />
  )
}
