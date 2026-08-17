'use client'

import type { ReactNode } from 'react'

import type { SortState } from '@/hooks/useAdminTable'

import { adminTableHeadCellClass } from '../../../utils/adminUi'
import InfoTooltip from '../InfoTooltip'
import type { AdminColumn } from './types'

interface DataTableHeadProps<T> {
  columns: AdminColumn<T>[]
  /** görünür kolon key'leri */
  visibleKeys: Set<string>
  sort: SortState | null
  onToggleSort: (key: string) => void
  /** selection kolonu göster (RBAC + selectable) */
  selectable: boolean
  allSelected: boolean
  onToggleAll: () => void
  /** expand kolonu için boşluk */
  expandable: boolean
  /** i18n-çözülmüş "tümünü seç" */
  selectAllLabel: string
  /** compact yoğunlukta dar padding */
  compact: boolean
}

/** aria-sort + sıralanabilir başlık (cetvel #2 / K5). */
export function DataTableHead<T>(props: DataTableHeadProps<T>): ReactNode {
  const { columns, visibleKeys, sort, onToggleSort, selectable, allSelected, onToggleAll, expandable, selectAllLabel, compact } =
    props
  const pad = compact ? 'px-2 py-2' : ''

  return (
    <thead>
      <tr className="bg-admin-surface">
        {selectable && (
          <th className={`${adminTableHeadCellClass} ${pad} w-10 text-center`}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              aria-label={selectAllLabel}
              className="w-4 h-4 rounded-md border-admin-border bg-admin-surface-2 text-admin-accent focus-visible:ring-admin-accent/30 focus-visible:ring-offset-0"
            />
          </th>
        )}
        {expandable && <th className={`${adminTableHeadCellClass} ${pad} w-8`} aria-hidden="true" />}
        {columns.map((col) => {
          if (!visibleKeys.has(col.key)) return null
          const active = sort?.key === col.key
          const ariaSort: 'ascending' | 'descending' | 'none' | undefined = col.sortable
            ? active
              ? sort?.dir === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'
            : undefined
          const alignClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'

          return (
            <th
              key={col.key}
              aria-sort={ariaSort}
              className={`${adminTableHeadCellClass} ${pad} ${alignClass} ${col.headerClassName ?? ''}`}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => onToggleSort(col.key)}
                  className={`inline-flex items-center gap-2 hover:text-admin-accent transition-colors ${
                    col.align === 'right' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {col.header}
                  <span className="text-admin-accent">{active ? (sort?.dir === 'asc' ? '▲' : '▼') : ''}</span>
                </button>
              ) : (
                col.header
              )}
              {/* Tooltip sıralama butonunun KARDEŞİ — iç içe <button> geçersiz HTML olurdu. */}
              {col.headerHint ? <InfoTooltip text={col.headerHint} /> : null}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

export default DataTableHead
