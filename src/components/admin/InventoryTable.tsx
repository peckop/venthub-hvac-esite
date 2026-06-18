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
          className={`${widthClass} bg-surface-deep border-2 border-cyan-400/50 rounded-xl px-2 py-1 text-xs text-cyan-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/10 font-bold`}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/btn relative px-3 py-1.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/10 transition-colors duration-300 flex items-center gap-1.5 text-left"
    >
      <span className={`text-xs font-bold text-slate-300 group-hover/btn:text-cyan-400 transition-colors truncate block ${extraSpanClass}`}>
        {value || <span className="text-slate-500">{placeholder}</span>}
      </span>
      <Pencil size={8} className="text-slate-600 group-hover/btn:text-cyan-400 transition-colors flex-shrink-0" />
    </button>
  )
}

export default function InventoryTable({
  table,
  hasWriteAccess,
  onUpdateLocation,
  onUpdateSupplier,
}: InventoryTableProps) {
  const { t } = useI18n()

  const statusBadge = useCallback((r: InventoryRowWithCategory) => {
    const net = r.available_stock
    const th = r.low_stock_threshold ?? 5
    const base = 'px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border shadow-sm transition-colors'

    if (net <= 0) {
      return (
        <span className={`${base} bg-rose-500/10 text-rose-400 border-rose-500/20`}>
          {t('admin.inventory.status.depleted')}
        </span>
      )
    }
    if (th != null && net <= th) {
      return (
        <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse`}>
          {t('admin.inventory.status.criticalBadge')}
        </span>
      )
    }
    if (r.reserved_stock > 0) {
      return (
        <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}>
          {t('admin.inventory.status.reservedBadge')}
        </span>
      )
    }
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
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
            <span className="font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-xs">
              {r.name}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter mt-0.5">
              {r.product_id.slice(0, 8)}
            </span>
          </div>
        ),
      },
      {
        key: 'physical',
        header: t('admin.inventory.table.physicalCol'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono font-bold text-slate-300">{r.physical_stock}</span>,
      },
      {
        key: 'reserved',
        header: t('admin.inventory.table.reservedCol'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono text-slate-500">{r.reserved_stock}</span>,
      },
      {
        key: 'available',
        header: t('admin.inventory.table.availableCol'),
        sortable: true,
        align: 'right',
        cellClassName: 'text-cyan-400',
        cell: (r) => <span className="font-mono font-black">{r.available_stock}</span>,
      },
      {
        key: 'threshold',
        header: t('admin.inventory.table.thresholdCol'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="font-mono text-slate-500">{r.low_stock_threshold ?? 5}</span>,
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
            <span className="text-slate-500 text-xs font-bold">{r.warehouse_location || '-'}</span>
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
            <span className={`text-slate-500 text-xs block ${adminSupplierMaxWidthClass} truncate`}>
              {r.supplier_name || '-'}
            </span>
          ),
      },
      {
        key: 'abc',
        header: t('admin.inventory.table.abcCol'),
        sortable: true,
        align: 'center',
        hideable: true,
        defaultHidden: true,
        cell: (r) =>
          r.abc_class ? (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs border shadow-sm ${
                r.abc_class === 'A'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : r.abc_class === 'B'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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
        sortable: true,
        align: 'right',
        hideable: true,
        defaultHidden: true,
        cell: (r) => {
          if (r.days_until_empty === 9999) {
            return (
              <span className="text-xs text-slate-600 uppercase font-black tracking-widest">
                {t('admin.inventory.table.stable')}
              </span>
            )
          }
          const isWarning = typeof r.days_until_empty === 'number' && r.days_until_empty <= 7
          return (
            <div
              className={`text-xs font-black uppercase tracking-widest ${
                isWarning ? 'text-rose-500 animate-pulse' : 'text-slate-400'
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
    ],
    [t, hasWriteAccess, onUpdateLocation, onUpdateSupplier, statusBadge],
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
