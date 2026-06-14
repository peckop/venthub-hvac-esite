'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import type { UseAdminTableResult } from '@/hooks/useAdminTable'
import type { Density } from '@/types/admin-shared'

import { adminTableCellClass, adminTableContainerClass } from '../../../utils/adminUi'
import AdminSkeleton from '../AdminSkeleton'
import ColumnsMenu, { type ColumnToggle } from '../ColumnsMenu'
import { DataTableHead } from './DataTableHead'
import { loadColumnVisibility, loadDensity, saveColumnVisibility, saveDensity } from './persist'
import type { AdminColumn } from './types'

export interface DataTableKitProps<T> {
  columns: AdminColumn<T>[]
  /** useAdminTable sonucu — kit hiç veri çekmez, yalnız sunar */
  table: UseAdminTableResult<T>
  rowId: (r: T) => string
  /** persist namespace (density + visibleCols), ör. 'coupons' */
  persistKey: string

  /** RBAC katman-1: selection + bulk yalnız yazma yetkisi varsa görünür */
  hasWriteAccess: boolean
  /** sayfa-seviyesi okuma yetkisi; false → accessDeniedState (5. durum) */
  hasReadAccess?: boolean

  /* ---- 5 durum (K5) — hepsi AYRI ---- */
  /** hiç kayıt yok */
  emptyState: ReactNode
  /** filtre/arama sonucu sıfır (≠ veri-yok) */
  filterEmptyState: ReactNode
  /** okuma yetkisizliği */
  accessDeniedState?: ReactNode
  /** hata banner metni (table.error doluyken) */
  errorLabel?: ReactNode

  /* ---- satır → detay (biri) ---- */
  /** ilk görünür hücre gerçek <a> olur (deep-link + a11y) */
  rowHref?: (row: T) => string
  /** satır role=button + klavye (programatik) */
  onRowClick?: (row: T) => void

  /** opsiyonel lazy genişleyen satır (Products tech-specs) */
  renderExpandedRow?: (row: T) => ReactNode

  /** slot: AdminToolbar (arama/filtre), tablonun üstünde */
  toolbarSlot?: ReactNode
  /** slot: BulkBar (seçim varken) */
  bulkBarSlot?: ReactNode

  /* ---- i18n-çözülmüş etiketler ---- */
  columnsButtonLabel?: string
  selectAllLabel?: string
  rowSelectLabel?: string
  expandLabel?: string
  totalLabel?: ReactNode
  renderPageLabel?: (page: number, pageCount: number) => ReactNode
}

export function DataTableKit<T>(props: DataTableKitProps<T>): ReactNode {
  const {
    columns,
    table,
    rowId,
    persistKey,
    hasWriteAccess,
    hasReadAccess = true,
    emptyState,
    filterEmptyState,
    accessDeniedState,
    errorLabel,
    rowHref,
    onRowClick,
    renderExpandedRow,
    toolbarSlot,
    bulkBarSlot,
    columnsButtonLabel,
    selectAllLabel = 'Tümünü seç',
    rowSelectLabel = 'Satırı seç',
    expandLabel = 'Satır detayını aç/kapat',
    totalLabel,
    renderPageLabel,
  } = props

  /* ---- density + kolon görünürlük (persist'li, kit'in merkezi sorumluluğu) ---- */
  const defaultVisibility = useMemo(() => {
    const d: Record<string, boolean> = {}
    for (const c of columns) if (c.hideable) d[c.key] = !c.defaultHidden
    return d
  }, [columns])

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() =>
    loadColumnVisibility(persistKey, defaultVisibility),
  )
  const [density, setDensity] = useState<Density>(() => loadDensity(persistKey))

  useEffect(() => {
    saveColumnVisibility(persistKey, visibleCols)
  }, [persistKey, visibleCols])
  useEffect(() => {
    saveDensity(persistKey, density)
  }, [persistKey, density])

  const visibleKeys = useMemo(() => {
    const s = new Set<string>()
    for (const c of columns) {
      if (!c.hideable) s.add(c.key)
      else if (visibleCols[c.key] !== false) s.add(c.key)
    }
    return s
  }, [columns, visibleCols])

  const visibleColumns = useMemo(() => columns.filter((c) => visibleKeys.has(c.key)), [columns, visibleKeys])

  const columnToggles = useMemo<ColumnToggle[]>(
    () =>
      columns
        .filter((c) => c.hideable)
        .map((c) => ({
          key: c.key,
          label: c.header,
          checked: visibleCols[c.key] !== false,
          onChange: (v: boolean) => setVisibleCols((prev) => ({ ...prev, [c.key]: v })),
        })),
    [columns, visibleCols],
  )

  /* ---- expand state ---- */
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectable = hasWriteAccess
  const expandable = typeof renderExpandedRow === 'function'
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
  const cellPad = density === 'compact' ? 'px-2 py-2' : ''
  const firstVisibleKey = visibleColumns[0]?.key

  // 5. durum: okuma yetkisizliği
  if (hasReadAccess === false) {
    return <>{accessDeniedState ?? null}</>
  }

  const { page, pageCount, setPage } = table.pagination

  return (
    <div className="space-y-6">
      {toolbarSlot}

      <div className={adminTableContainerClass}>
        {table.error && (
          <div className="p-4 text-rose-400 text-xs font-bold bg-rose-500/10 border-b border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {errorLabel ?? table.error}
          </div>
        )}

        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {totalLabel ?? 'Toplam'}: <span className="text-cyan-400" aria-live="polite">{table.totalMatched}</span>
          </div>
          <div className="flex items-center gap-2">
            <ColumnsMenu
              columns={columnToggles}
              density={density}
              onDensityChange={setDensity}
              buttonLabel={columnsButtonLabel}
            />
            {pageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  aria-label="Önceki sayfa"
                  className="w-8 h-8 flex items-center justify-center rounded-lg glass border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <span className="text-xs font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-center uppercase tracking-tighter">
                  {renderPageLabel ? renderPageLabel(page, pageCount) : `${page} / ${pageCount}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pageCount, page + 1))}
                  disabled={page >= pageCount}
                  aria-label="Sonraki sayfa"
                  className="w-8 h-8 flex items-center justify-center rounded-lg glass border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="content-auto-table w-full">
            <DataTableHead
              columns={columns}
              visibleKeys={visibleKeys}
              sort={table.sorting.sort}
              onToggleSort={table.sorting.toggleSort}
              selectable={selectable}
              allSelected={table.selection.allSelected}
              onToggleAll={table.selection.toggleAll}
              expandable={expandable}
              selectAllLabel={selectAllLabel}
              compact={density === 'compact'}
            />
            <tbody className="divide-y divide-white/5">
              {table.isLoading && table.rows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="p-0">
                    <AdminSkeleton variant="table" count={8} rows={5} />
                  </td>
                </tr>
              ) : table.rows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="p-0">
                    {table.filtering.hasActiveFilters ? filterEmptyState : emptyState}
                  </td>
                </tr>
              ) : (
                table.rows.map((row) => {
                  const id = rowId(row)
                  const selected = table.selection.isSelected(id)
                  const isExpanded = expanded.has(id)
                  const clickable = typeof onRowClick === 'function'

                  return (
                    <Fragment key={id}>
                      <tr
                        className={`group transition-colors duration-300 ${
                          selected ? 'bg-cyan-400/5' : 'hover:bg-white/2'
                        } ${clickable ? 'cursor-pointer' : ''}`}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={clickable ? () => onRowClick(row) : undefined}
                        onKeyDown={
                          clickable
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  onRowClick(row)
                                }
                              }
                            : undefined
                        }
                      >
                        {selectable && (
                          <td className={`${adminTableCellClass} ${cellPad} w-10 text-center`}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation()
                                table.selection.toggle(id, { shiftKey: e.shiftKey })
                              }}
                              aria-label={rowSelectLabel}
                              className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-cyan-400 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-0"
                            />
                          </td>
                        )}
                        {expandable && (
                          <td className={`${adminTableCellClass} ${cellPad} w-8`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(id)
                              }}
                              aria-label={expandLabel}
                              aria-expanded={isExpanded}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                                isExpanded ? 'bg-cyan-400/10 text-cyan-400 rotate-90' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                              }`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        )}
                        {visibleColumns.map((col) => {
                          const alignClass =
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          const rendered = col.cell(row)
                          const content =
                            rowHref && col.key === firstVisibleKey ? (
                              <Link
                                href={rowHref(row) as import('next').Route}
                                className="block hover:text-cyan-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {rendered}
                              </Link>
                            ) : (
                              rendered
                            )
                          return (
                            <td
                              key={col.key}
                              className={`${adminTableCellClass} ${cellPad} ${alignClass} ${col.cellClassName ?? ''}`}
                            >
                              {content}
                            </td>
                          )
                        })}
                      </tr>
                      {isExpanded && expandable && (
                        <tr className="bg-white/1">
                          <td colSpan={colSpan} className="px-12 py-8">
                            {renderExpandedRow?.(row)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bulkBarSlot}
    </div>
  )
}

export default DataTableKit
