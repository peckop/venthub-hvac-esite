'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Percent, Plus, RefreshCw, SearchX } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AccessDenied from '../../components/admin/AccessDenied'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import { FacetedFilter } from '../../components/admin/data-table/FacetedFilter'
import type { AdminColumn, DataTableFacet } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import MaterializePricesModal from '../../components/admin/pricing/MaterializePricesModal'
import PricingRuleFormModal from '../../components/admin/pricing/PricingRuleFormModal'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDate } from '../../i18n/datetime'
import { formatCurrency, formatNumber } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { PricingRuleRow } from '../../lib/services/pricing.service'
import {
  deletePricingRule,
  deletePricingRules,
  listPricingRules,
  marginPctToCoefficient,
} from '../../lib/services/pricingAdmin.service'
import type { Database } from '../../types/database.types'
import {
  adminTableActionClass,
  adminTableActionDangerClass,
  adminTableActionPrimaryClass,
} from '../../utils/adminUi'

/**
 * Marj kuralları tablosu (W3-T2).
 *
 * Kural = fiyatın SSOT'u: burada yapılan her değişiklik vitrin fiyatını türetir.
 * Bu yüzden tablo "hangi kural neyi kapsıyor + hangi oranla" sorusunu tek bakışta
 * cevaplar; kanonik `margin_pct` yanında katsayı karşılığı (×1,40) da gösterilir —
 * saha dili katsayıdır, veri dili yüzdedir.
 */

type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'
type RuleStatus = 'active' | 'scheduled' | 'expired'

const SCOPE_KEYS: Record<number, ScopeKey> = {
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'global',
}

/** DB method değeri → ortak sözlük anahtarı (sözlük camelCase, DB snake_case). */
const METHOD_I18N_KEYS: Record<string, string> = {
  cost_plus: 'costPlus',
  fixed: 'fixed',
  percent_off_list: 'percentOffList',
}

function methodLabel(method: string, t: (key: string) => string): string {
  const key = METHOD_I18N_KEYS[method]
  return key ? t(`admin.pricing.common.method.${key}`) : method
}

interface RuleRow {
  id: string
  scope: number
  scopeKey: ScopeKey
  targetName: string
  method: string
  /** W1 motoru bu method'u hesaplayabiliyor mu (percent_off_list → hayır) */
  supported: boolean
  marginPct: number | null
  fixedPrice: number | null
  vatInclusive: boolean
  priority: number
  validFrom: string | null
  validTo: string | null
  status: RuleStatus
  productId: string | null
  raw: PricingRuleRow
}

function deriveStatus(rule: PricingRuleRow, today: string): RuleStatus {
  if (rule.valid_to !== null && rule.valid_to < today) return 'expired'
  if (rule.valid_from !== null && rule.valid_from > today) return 'scheduled'
  return 'active'
}

/**
 * Fetcher (DI: ilk parametre supabase). Kural satırlarından sonra GÖRÜNTÜ ADLARI
 * çözülür: marka/kategori tam liste, ürün ise YALNIZ kurallarda geçen id'lerle
 * (tüm katalog çekilmez — 400+ üründe gereksiz yük).
 */
async function pricingRulesFetcher(
  supabase: SupabaseClient<Database>,
  _params: FetchParams,
): Promise<FetchResult<RuleRow>> {
  await ensureSessionFresh()
  const rules = await listPricingRules(supabase)

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from('brands').select('id, name'),
    supabase.from('categories').select('id, name'),
  ])

  const productIds = [...new Set(rules.map((r) => r.product_id).filter((id): id is string => id !== null))]
  const products = productIds.length
    ? (await supabase.from('products').select('id, name, sku').in('id', productIds)).data ?? []
    : []

  const brandName = new Map((brands ?? []).map((b) => [b.id, b.name] as const))
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name] as const))
  const productName = new Map(products.map((p) => [p.id, `${p.name} (${p.sku})`] as const))

  const today = new Date().toISOString().slice(0, 10)

  const rows: RuleRow[] = rules.map((rule) => {
    const scopeKey = SCOPE_KEYS[rule.scope] ?? 'global'
    const targetName =
      rule.scope === 2
        ? brandName.get(rule.brand_id ?? '') ?? ''
        : rule.scope === 3
          ? categoryName.get(rule.category_id ?? '') ?? ''
          : rule.scope === 0 || rule.scope === 1
            ? productName.get(rule.product_id ?? '') ?? ''
            : ''
    return {
      id: rule.id,
      scope: rule.scope,
      scopeKey,
      targetName,
      method: rule.method,
      supported: rule.method === 'cost_plus' || rule.method === 'fixed',
      marginPct: rule.margin_pct,
      fixedPrice: rule.fixed_price,
      vatInclusive: rule.price_is_vat_inclusive,
      priority: rule.priority,
      validFrom: rule.valid_from,
      validTo: rule.valid_to,
      status: deriveStatus(rule, today),
      productId: rule.product_id,
      raw: rule,
    }
  })

  return { rows, totalMatched: rows.length }
}

const PricingRulesTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const locale = lang === 'en' ? 'en' : 'tr'
  const { role, loading: roleLoading, canWrite } = useRole()
  const hasWriteAccess = canWrite('pricing')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PricingRuleRow | null>(null)
  const [materializeOpen, setMaterializeOpen] = useState(false)

  const table = useAdminTable<RuleRow>({
    resource: 'pricing_rules',
    rowId: (r) => r.id,
    fetcher: pricingRulesFetcher,
    paginationMode: 'none',
    sortMode: 'client',
    initialSort: { key: 'priority', dir: 'desc' },
    syncUrl: true,
  })

  const openCreate = useCallback(() => {
    setEditing(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((row: RuleRow) => {
    setEditing(row.raw)
    setModalOpen(true)
  }, [])

  const removeRule = useCallback(
    async (row: RuleRow) => {
      if (!window.confirm(t('admin.pricing.rules.confirm.delete'))) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'pricing_rule',
          canWrite: hasWriteAccess,
          action: 'DELETE',
          rowPk: row.id,
          before: { scope: row.scope, method: row.method, margin_pct: row.marginPct, priority: row.priority },
          after: null,
          auditedByEdge: false,
          fn: async () => {
            await deletePricingRule(supabaseBrowserClient, row.id)
          },
        })
        toast.success(t('admin.pricing.rules.toasts.deleted'))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.pricing.common.noPermission')
            : t('admin.pricing.rules.toasts.deleteFailed'),
        )
      }
    },
    [hasWriteAccess, t, table],
  )

  const bulkDelete = useCallback(async () => {
    const ids = table.selection.selectedIds
    if (ids.length === 0) return
    if (!window.confirm(t('admin.pricing.rules.confirm.bulkDelete', { count: ids.length }))) return
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'pricing_rule',
        canWrite: hasWriteAccess,
        action: 'DELETE',
        rowPk: null,
        before: { ids },
        after: null,
        auditedByEdge: false,
        fn: async () => {
          await deletePricingRules(supabaseBrowserClient, ids)
        },
      })
      table.selection.clear()
      toast.success(t('admin.pricing.rules.toasts.deleted'))
      await table.reload()
    } catch (e) {
      toast.error(
        e instanceof AdminPermissionError
          ? t('admin.pricing.common.noPermission')
          : t('admin.pricing.rules.toasts.deleteFailed'),
      )
    }
  }, [hasWriteAccess, t, table])

  const columns = useMemo<AdminColumn<RuleRow>[]>(
    () => [
      {
        key: 'scopeKey',
        header: t('admin.pricing.common.scopeLabel'),
        sortable: true,
        cell: (r) => (
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider">
            {t(`admin.pricing.common.scope.${r.scopeKey}`)}
          </span>
        ),
      },
      {
        key: 'targetName',
        header: t('admin.pricing.rules.table.target'),
        sortable: true,
        cell: (r) => (
          <span className="text-sm font-bold text-white">
            {r.targetName || t('admin.pricing.rules.table.allProducts')}
          </span>
        ),
      },
      {
        key: 'method',
        header: t('admin.pricing.common.methodLabel'),
        sortable: true,
        cell: (r) => (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
              {methodLabel(r.method, t)}
            </span>
            {r.supported ? null : (
              <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                {t('admin.pricing.rules.table.outOfW1')}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'rate',
        header: t('admin.pricing.rules.table.rate'),
        align: 'right',
        cell: (r) => {
          if (r.method === 'cost_plus' && r.marginPct !== null) {
            return (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-black text-white">
                  {`%${formatNumber(r.marginPct, locale, { maximumFractionDigits: 2 })}`}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {`×${formatNumber(marginPctToCoefficient(r.marginPct), locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}`}
                </span>
              </div>
            )
          }
          if (r.method === 'fixed' && r.fixedPrice !== null) {
            return (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-black text-white">
                  {/* Para birimi ZORUNLU: verilmezse format yardımcısı EN dilinde USD'ye düşer ($ sızar). */}
                  {formatCurrency(r.fixedPrice, locale, { currency: r.raw.currency ?? 'TRY' })}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t(r.vatInclusive ? 'admin.pricing.common.vatIncluded' : 'admin.pricing.common.vatExcluded')}
                </span>
              </div>
            )
          }
          return <span className="text-xs font-bold text-slate-600">{'—'}</span>
        },
      },
      {
        key: 'priority',
        header: t('admin.pricing.rules.table.priority'),
        sortable: true,
        align: 'right',
        cell: (r) => <span className="text-sm font-black text-slate-300">{r.priority}</span>,
      },
      {
        key: 'validity',
        header: t('admin.pricing.rules.table.validity'),
        hideable: true,
        cell: (r) => (
          <div
            className={`flex flex-col gap-1 text-xs font-black uppercase tracking-widest ${
              r.status === 'expired' ? 'opacity-50' : ''
            }`}
          >
            <span className="text-white/80">
              {r.validFrom ? formatDate(r.validFrom, locale) : t('admin.pricing.rules.table.noStart')}
            </span>
            <span className="text-slate-500">
              {r.validTo ? formatDate(r.validTo, locale) : t('admin.pricing.rules.table.unlimited')}
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        header: t('admin.common.status'),
        hideable: true,
        cell: (r) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              r.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : r.status === 'scheduled'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-white/5'
            }`}
          >
            {t(`admin.pricing.rules.status.${r.status}`)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('admin.common.actions'),
        align: 'right',
        cell: (r) => (
          <div className="flex items-center justify-end gap-2">
            {(r.scope === 0 || r.scope === 1) && r.productId ? (
              <Link
                href={`/admin/pricing/preview?productId=${r.productId}` as Route}
                className={adminTableActionPrimaryClass}
              >
                {t('admin.pricing.rules.actions.preview')}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => openEdit(r)}
              disabled={!hasWriteAccess || !r.supported || r.scopeKey === 'variant'}
              title={
                !r.supported
                  ? t('admin.pricing.rules.table.outOfW1')
                  : r.scopeKey === 'variant'
                    ? t('admin.pricing.common.scope.variant')
                    : undefined
              }
              className={`${adminTableActionClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t('admin.common.edit')}
            </button>
            <button
              type="button"
              onClick={() => void removeRule(r)}
              disabled={!hasWriteAccess}
              className={`${adminTableActionDangerClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t('admin.common.delete')}
            </button>
          </div>
        ),
      },
    ],
    [t, locale, hasWriteAccess, openEdit, removeRule],
  )

  /* ---- facets: kapsam · yöntem · durum (sayımlar filtre-ÖNCESİ havuzdan) ---- */
  const facets = useMemo<DataTableFacet[]>(() => {
    const scopeCount = new Map<string, number>()
    const methodCount = new Map<string, number>()
    const statusCount = new Map<string, number>()
    for (const r of table.allRows) {
      scopeCount.set(r.scopeKey, (scopeCount.get(r.scopeKey) ?? 0) + 1)
      methodCount.set(r.method, (methodCount.get(r.method) ?? 0) + 1)
      statusCount.set(r.status, (statusCount.get(r.status) ?? 0) + 1)
    }
    const scopeOptions: ScopeKey[] = ['variant', 'product', 'brand', 'category', 'global']
    const methodOptions = ['cost_plus', 'fixed', 'percent_off_list']
    const statusOptions: RuleStatus[] = ['active', 'scheduled', 'expired']
    return [
      {
        key: 'scopeKey',
        label: t('admin.pricing.common.scopeLabel'),
        options: scopeOptions.map((value) => ({
          value,
          label: t(`admin.pricing.common.scope.${value}`),
          count: scopeCount.get(value) ?? 0,
        })),
      },
      {
        key: 'method',
        label: t('admin.pricing.common.methodLabel'),
        options: methodOptions.map((value) => ({
          value,
          label: methodLabel(value, t),
          count: methodCount.get(value) ?? 0,
        })),
      },
      {
        key: 'status',
        label: t('admin.common.status'),
        options: statusOptions.map((value) => ({
          value,
          label: t(`admin.pricing.rules.status.${value}`),
          count: statusCount.get(value) ?? 0,
        })),
      },
    ]
  }, [table.allRows, t])

  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'delete',
        label: t('admin.pricing.rules.bulk.delete'),
        tone: 'danger',
        onRun: () => bulkDelete(),
      },
    ],
    [t, bulkDelete],
  )

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['id', 'scope', 'target', 'method', 'margin_pct', 'fixed_price', 'priority', 'valid_from', 'valid_to']
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) =>
      [r.id, r.scope, r.targetName, r.method, r.marginPct ?? '', r.fixedPrice ?? '', r.priority, r.validFrom ?? '', r.validTo ?? '']
        .map(escape)
        .join(','),
    )
    const csv = '﻿' + [cols.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pricing-rules.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

  /**
   * RBAC kapısı: pricing_rule RLS'i admin-only'dir — yetkisiz rol sayfayı açabilir ama
   * SIFIR satır görür ve bunu "hiç kural yok" sanar (tehlikeli yanılgı: yeni kural yazmaya
   * kalkar). Bu yüzden veri boşluğu değil YETKİ ekranı gösterilir.
   */
  const isPricingAdmin = role === 'super_admin' || role === 'admin' || role === 'moderator'
  if (!roleLoading && !isPricingAdmin) return <AccessDenied />

  return (
    <div className="space-y-6">
      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="pricing_rules"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={Percent}
            title={t('admin.pricing.rules.emptyTitle')}
            description={t('admin.pricing.rules.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.pricing.rules.emptyTitle')}
            description={t('admin.pricing.rules.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.common.view')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:pricing_rules"
            search={{
              value: table.filtering.query,
              onChange: table.filtering.setQuery,
              placeholder: t('admin.pricing.rules.searchPlaceholder'),
              focusShortcut: '/',
            }}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
            rightExtra={
              <div className="flex items-center gap-2">
                {facets.map((facet) => (
                  <FacetedFilter
                    key={facet.key}
                    facet={facet}
                    selected={table.filtering.filters[facet.key] ?? []}
                    onChange={(vals) => table.filtering.setFilter(facet.key, vals)}
                    clearLabel={t('admin.dataTable.filter.clearAll')}
                  />
                ))}
                <ExportMenu items={[{ key: 'csv', label: t('admin.dataTable.export.csv'), onSelect: () => void exportCsv() }]} />
                <button
                  type="button"
                  onClick={() => setMaterializeOpen(true)}
                  disabled={!hasWriteAccess}
                  className={`${adminTableActionClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <RefreshCw size={14} />
                  {t('admin.pricing.rules.materialize.toolbarAction')}
                </button>
                {hasWriteAccess ? (
                  <button type="button" onClick={openCreate} className={adminTableActionPrimaryClass}>
                    <Plus size={14} />
                    {t('admin.pricing.rules.actions.create')}
                  </button>
                ) : null}
              </div>
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <BulkBar
              selectedCount={table.selection.selectedIds.length}
              selectedLabel={t('admin.dataTable.bulk.selectedCount', { count: table.selection.selectedIds.length })}
              clearLabel={t('admin.dataTable.bulk.clear')}
              actions={bulkActions}
              onClear={table.selection.clear}
            />
          ) : null
        }
      />

      <PricingRuleFormModal
        open={modalOpen}
        rule={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => void table.reload()}
      />

      <MaterializePricesModal
        open={materializeOpen}
        onClose={() => setMaterializeOpen(false)}
        onSuccess={() => void table.reload()}
      />
    </div>
  )
}

export default PricingRulesTableBody
