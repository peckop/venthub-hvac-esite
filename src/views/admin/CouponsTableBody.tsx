'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { SearchX, Ticket } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import { FacetedFilter } from '../../components/admin/data-table/FacetedFilter'
import type { AdminColumn, DataTableFacet } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { useTenant } from '../../hooks/useTenant'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminCardPaddedClass,
  adminInputClass,
  adminSelectClass,
} from '../../utils/adminUi'

/* ---- modeller ---- */
interface CouponRow {
  id: string
  code: string
  type: 'percent' | 'fixed' | string
  value: number
  starts_at?: string | null
  ends_at?: string | null
  active: boolean
  usage_limit?: number | null
  used_count?: number | null
  created_at: string
}

type AllowedCouponType = 'percent' | 'fixed'
function isAllowedCouponType(x: unknown): x is AllowedCouponType {
  return x === 'percent' || x === 'fixed'
}

interface DbCouponRow {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount' | string
  discount_value: number
  valid_from?: string | null
  valid_until?: string | null
  is_active: boolean
  usage_limit?: number | null
  used_count?: number | null
  created_at: string
}

function dbToUi(row: DbCouponRow): CouponRow {
  return {
    id: row.id,
    code: row.code,
    type: row.discount_type === 'percentage' ? 'percent' : 'fixed',
    value: Number(row.discount_value),
    starts_at: row.valid_from ?? null,
    ends_at: row.valid_until ?? null,
    active: !!row.is_active,
    usage_limit: row.usage_limit ?? null,
    used_count: row.used_count ?? 0,
    created_at: row.created_at,
  }
}

/* ---- fetcher: client-mode (limit 200, sayfa-bağımsız) ---- */
async function couponsFetcher(
  supabase: SupabaseClient<Database>,
  _params: FetchParams,
): Promise<FetchResult<CouponRow>> {
  await ensureSessionFresh()
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, discount_type, discount_value, valid_from, valid_until, is_active, usage_limit, used_count, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  const rows = (data || []).map((d) => dbToUi(d as DbCouponRow))
  return { rows, totalMatched: rows.length }
}

const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, { message: 'admin.coupons.validation.codeLength' })
    .max(50, { message: 'admin.coupons.validation.codeLength' })
    .refine((val) => val.trim().length >= 3, {
      message: 'admin.coupons.validation.codeLength',
    }),
  type: z.enum(['percent', 'fixed'], {
    errorMap: () => ({ message: 'admin.coupons.validation.typeRequired' }),
  }),
  value: z
    .number({ invalid_type_error: 'admin.coupons.validation.valuePositive' })
    .positive({ message: 'admin.coupons.validation.valuePositive' }),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  active: z.boolean().default(true),
  usage_limit: z
    .number()
    .int()
    .positive({ message: 'admin.coupons.validation.limitPositive' })
    .nullable()
    .optional(),
}).refine(
  (data) => {
    if (data.type === 'percent') {
      return data.value <= 100
    }
    return true
  },
  {
    message: 'admin.coupons.validation.percentLimit',
    path: ['value'],
  }
).refine(
  (data) => {
    if (data.starts_at && data.ends_at) {
      return new Date(data.starts_at) < new Date(data.ends_at)
    }
    return true
  },
  {
    message: 'admin.coupons.validation.dateRange',
    path: ['ends_at'],
  }
)

const CouponsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const { id: tenantId } = useTenant()
  const hasWriteAccess = canWrite('coupons')

  const table = useAdminTable<CouponRow>({
    resource: 'coupons',
    rowId: (r) => r.id,
    fetcher: couponsFetcher,
    paginationMode: 'none',
    sortMode: 'client',
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  // create-form state
  const [form, setForm] = useState<Partial<CouponRow>>({ type: 'percent', active: true })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  /* ---- realtime: coupons değişiminde reload ---- */
  const reloadRef = useRef(table.reload)
  reloadRef.current = table.reload
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const ch = supabaseBrowserClient
      .channel(`coupons-${tenantId}`, { config: { private: true } })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coupons',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          if (refetchTimer.current) clearTimeout(refetchTimer.current)
          refetchTimer.current = setTimeout(() => void reloadRef.current(), 400)
        },
      )
      .subscribe()
    return () => {
      supabaseBrowserClient.removeChannel(ch)
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
    }
  }, [tenantId])

  /* ---- mutasyonlar (K3+K4 mutateWithAudit kapısından) ---- */
  const toggleActive = useCallback(
    async (row: CouponRow) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.coupons.toasts.noPermission'))
        return
      }
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'coupons',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { is_active: row.active },
          after: { is_active: !row.active },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('coupons').update({ is_active: !row.active }).eq('id', row.id)
            if (error) throw error
          },
        })
        toast.success(!row.active ? t('admin.coupons.toasts.activated') : t('admin.coupons.toasts.deactivated'))
        await table.reload()
      } catch (e) {
        toast.error(e instanceof AdminPermissionError ? t('admin.coupons.toasts.noPermission') : t('admin.coupons.toasts.statusFailed'))
      }
    },
    [hasWriteAccess, t, table],
  )

  const bulkSetActive = useCallback(
    async (active: boolean) => {
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'coupons',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { is_active: active, ids },
          auditedByEdge: false,
          fn: async () => {
            const { error } = await supabaseBrowserClient.from('coupons').update({ is_active: active }).in('id', ids)
            if (error) throw error
          },
        })
        table.selection.clear()
        toast.success(active ? t('admin.coupons.toasts.activated') : t('admin.coupons.toasts.deactivated'))
        await table.reload()
      } catch (e) {
        toast.error(e instanceof AdminPermissionError ? t('admin.coupons.toasts.noPermission') : t('admin.coupons.toasts.statusFailed'))
      }
    },
    [hasWriteAccess, t, table],
  )

  const saveCoupon = useCallback(async () => {
    const parsedValue = form.value === undefined || String(form.value).trim() === '' ? undefined : Number(form.value)
    const parsedLimit = form.usage_limit === null || form.usage_limit === undefined || String(form.usage_limit).trim() === '' ? null : Number(form.usage_limit)
    const result = createCouponSchema.safeParse({
      code: String(form.code || '').trim(),
      type: form.type,
      value: parsedValue,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      active: !!form.active,
      usage_limit: parsedLimit,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (path) {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
      toast.error(t('admin.coupons.toasts.createFailed'))
      return
    }

    setErrors({})
    const validatedData = result.data

    try {
      setSaving(true)
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'coupons',
        canWrite: hasWriteAccess,
        action: 'INSERT',
        rowPk: null,
        before: null,
        after: { code: validatedData.code, type: validatedData.type, value: validatedData.value },
        auditedByEdge: false, // edge audit yazmıyor → client loglar (K4 boşluğu kapanır)
        fn: async () => {
          const response = await supabaseBrowserClient.functions.invoke('admin-create-coupon', {
            body: {
              code: validatedData.code,
              type: validatedData.type as AllowedCouponType,
              value: validatedData.value,
              starts_at: validatedData.starts_at || null,
              ends_at: validatedData.ends_at || null,
              active: validatedData.active,
              usage_limit: validatedData.usage_limit,
            },
          })
          const { data, error }: { data: DbCouponRow | null; error: unknown | null } = response
          if (error) throw error
          if (!data) throw new Error('no_data')
        },
      })
      setForm({ type: 'percent', active: true })
      toast.success(t('admin.coupons.toasts.created'))
      await table.reload()
    } catch (e) {
      toast.error(e instanceof AdminPermissionError ? t('admin.coupons.toasts.noPermission') : t('admin.coupons.toasts.createFailed'))
    } finally {
      setSaving(false)
    }
  }, [form, hasWriteAccess, t, table])

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<CouponRow>[]>(
    () => [
      {
        key: 'code',
        header: t('admin.coupons.table.code'),
        sortable: true,
        cell: (r) => (
          <span className="bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-cyan-400 uppercase tracking-widest font-mono text-xs font-black">
            {r.code}
          </span>
        ),
      },
      {
        key: 'type',
        header: t('admin.coupons.table.type'),
        hideable: true,
        cell: (r) => (
          <span className={`uppercase tracking-widest font-black text-xs ${r.type === 'percent' ? 'text-blue-400' : 'text-emerald-400'}`}>
            {r.type === 'percent' ? t('admin.coupons.typeLabels.percent') : t('admin.coupons.typeLabels.fixed')}
          </span>
        ),
      },
      {
        key: 'value',
        header: t('admin.coupons.table.value'),
        sortable: true,
        align: 'right',
        cell: (r) =>
          r.type === 'percent'
            ? `%${r.value}`
            : formatCurrency(r.value, lang as 'tr' | 'en', { maximumFractionDigits: 0 }),
      },
      {
        key: 'active',
        header: t('admin.coupons.table.active'),
        cell: (r) => (
          <button
            type="button"
            onClick={() => toggleActive(r)}
            disabled={!hasWriteAccess}
            aria-label={r.active ? t('admin.coupons.statusLabels.active') : t('admin.coupons.statusLabels.passive')}
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
              r.active
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-400 border-white/5 opacity-60'
            } ${hasWriteAccess ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
          >
            <span className={`w-1 h-1 rounded-full ${r.active ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            {r.active ? t('admin.coupons.statusLabels.active') : t('admin.coupons.statusLabels.passive')}
          </button>
        ),
      },
      {
        key: 'validity',
        header: t('admin.coupons.table.validity'),
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-1 text-xs uppercase font-black tracking-widest">
            <span className="text-white/80">{r.starts_at ? formatDateTime(r.starts_at, lang as 'tr' | 'en') : '-'}</span>
            <span className="text-slate-500">
              {r.ends_at ? formatDateTime(r.ends_at, lang as 'tr' | 'en') : t('admin.coupons.validity.unlimited')}
            </span>
          </div>
        ),
      },
      {
        key: 'usage',
        header: t('admin.coupons.table.usage'),
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col gap-1.5 w-24">
            <div className="flex justify-between text-xs font-bold font-mono text-slate-400">
              <span>{r.used_count || 0}</span>
              <span>{r.usage_limit || '∞'}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-colors duration-1000"
                style={{ width: r.usage_limit ? `${Math.min(((r.used_count || 0) / r.usage_limit) * 100, 100)}%` : '0%' }}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'created_at',
        header: t('admin.coupons.table.createdAt'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <span className="text-slate-500 text-xs font-black uppercase tracking-widest">
            {formatDateTime(r.created_at, lang as 'tr' | 'en')}
          </span>
        ),
      },
    ],
    [t, lang, toggleActive, hasWriteAccess],
  )

  /* ---- facets (type + active) — count'lar filtre-öncesi allRows'tan ---- */
  const facets = useMemo<DataTableFacet[]>(() => {
    let percent = 0
    let fixed = 0
    let active = 0
    let passive = 0
    for (const r of table.allRows) {
      if (r.type === 'percent') percent++
      else if (r.type === 'fixed') fixed++
      if (r.active) active++
      else passive++
    }
    return [
      {
        key: 'type',
        label: t('admin.coupons.table.type'),
        options: [
          { value: 'percent', label: t('admin.coupons.typeLabels.percent'), count: percent },
          { value: 'fixed', label: t('admin.coupons.typeLabels.fixed'), count: fixed },
        ],
      },
      {
        key: 'active',
        label: t('admin.coupons.table.active'),
        options: [
          { value: 'true', label: t('admin.coupons.statusLabels.active'), count: active },
          { value: 'false', label: t('admin.coupons.statusLabels.passive'), count: passive },
        ],
      },
    ]
  }, [table.allRows, t])

  const bulkActions = useMemo<BulkAction[]>(
    () => [
      { key: 'activate', label: t('admin.coupons.bulk.activate'), tone: 'default', onRun: () => bulkSetActive(true) },
      { key: 'deactivate', label: t('admin.coupons.bulk.deactivate'), tone: 'warning', onRun: () => bulkSetActive(false) },
    ],
    [t, bulkSetActive],
  )

  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['id', 'code', 'type', 'value', 'active', 'usage_limit', 'used_count', 'created_at']
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = rows.map((r) =>
      [r.id, r.code, r.type, r.value, r.active, r.usage_limit ?? '', r.used_count ?? '', r.created_at].map(escape).join(','),
    )
    const csv = '﻿' + [cols.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'coupons.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

  return (
    <div className="space-y-6">
      {/* create-form (inline, hardened, i18n) */}
      {hasWriteAccess && (
        <div className={`${adminCardPaddedClass} glass-strong border-white/5 space-y-6`}>
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {t('admin.coupons.create.sectionTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-code" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.code')}
              </label>
              <input
                id="coupon-code"
                value={form.code || ''}
                onChange={(e) => {
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                  setErrors((errs) => ({ ...errs, code: '' }))
                }}
                placeholder={t('admin.coupons.create.codePlaceholder')}
                className={`${adminInputClass} font-mono ${errors.code ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              />
              {errors.code && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.code)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-type" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.type')}
              </label>
              <select
                id="coupon-type"
                value={form.type as string}
                onChange={(e) => {
                  setForm((f) => ({ ...f, type: e.target.value as AllowedCouponType }))
                  setErrors((errs) => ({ ...errs, type: '' }))
                }}
                className={`${adminSelectClass} ${errors.type ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              >
                <option value="percent">{t('admin.coupons.create.typePercent')}</option>
                <option value="fixed">{t('admin.coupons.create.typeFixed')}</option>
              </select>
              {errors.type && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.type)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-value" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.value')}
              </label>
              <input
                id="coupon-value"
                type="number"
                value={(form.value as number | undefined) ?? ''}
                onChange={(e) => {
                  setForm((f) => ({ ...f, value: e.target.value ? Number(e.target.value) : undefined }))
                  setErrors((errs) => ({ ...errs, value: '' }))
                }}
                placeholder="0"
                className={`${adminInputClass} ${errors.value ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              />
              {errors.value && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.value)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-starts" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.startsAt')}
              </label>
              <input
                id="coupon-starts"
                type="datetime-local"
                value={(form.starts_at as string | undefined) ?? ''}
                onChange={(e) => {
                  setForm((f) => ({ ...f, starts_at: e.target.value }))
                  setErrors((errs) => ({ ...errs, starts_at: '', ends_at: '' }))
                }}
                className={`${adminInputClass} ${errors.starts_at ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              />
              {errors.starts_at && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.starts_at)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-ends" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.endsAt')}
              </label>
              <input
                id="coupon-ends"
                type="datetime-local"
                value={(form.ends_at as string | undefined) ?? ''}
                onChange={(e) => {
                  setForm((f) => ({ ...f, ends_at: e.target.value }))
                  setErrors((errs) => ({ ...errs, ends_at: '', starts_at: '' }))
                }}
                className={`${adminInputClass} ${errors.ends_at ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              />
              {errors.ends_at && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.ends_at)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="coupon-active" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.status')}
              </label>
              <div className="flex items-center gap-3 px-4 h-10 glass-strong border-white/10 rounded-xl">
                <input
                  id="coupon-active"
                  type="checkbox"
                  checked={!!form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-slate-800 text-cyan-500 focus-visible:ring-cyan-500/20"
                />
                <span className="text-sm font-medium text-slate-300">{t('admin.coupons.create.active')}</span>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label htmlFor="coupon-limit" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {t('admin.coupons.create.usageLimit')}
              </label>
              <input
                id="coupon-limit"
                type="number"
                min={1}
                value={(form.usage_limit as number | null | undefined) ?? ''}
                onChange={(e) =>
                  setForm((f) => {
                    const raw = e.target.value ? Number(e.target.value) : null
                    setErrors((errs) => ({ ...errs, usage_limit: '' }))
                    return { ...f, usage_limit: raw && raw > 0 ? raw : null }
                  })
                }
                placeholder={t('admin.coupons.create.usageLimitPlaceholder')}
                className={`${adminInputClass} ${errors.usage_limit ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}`}
              />
              {errors.usage_limit && (
                <span className="text-rose-400 text-xs font-bold ml-1 animate-in fade-in duration-200">
                  {t(errors.usage_limit)}
                </span>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col gap-2 justify-end">
              <button
                type="button"
                onClick={saveCoupon}
                disabled={saving}
                className={`${adminButtonPrimaryClass} w-full h-10`}
              >
                {saving ? t('admin.coupons.create.submitting') : t('admin.coupons.create.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="coupons"
        hasWriteAccess={hasWriteAccess}
        emptyState={<AdminEmptyState icon={Ticket} title={t('admin.coupons.emptyTitle')} description={t('admin.coupons.emptyDescription')} />}
        filterEmptyState={
          <AdminEmptyState icon={SearchX} title={t('admin.coupons.emptyTitle')} description={t('admin.coupons.filterEmptyDescription')} />
        }
        columnsButtonLabel={t('admin.common.view')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:coupons"
            search={{ value: table.filtering.query, onChange: table.filtering.setQuery, placeholder: t('admin.coupons.searchPlaceholder'), focusShortcut: '/' }}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
            rightExtra={
              <div className="flex items-center gap-2">
                {facets.map((facet) => (
                  <FacetedFilter
                    key={facet.key}
                    facet={facet}
                    selected={table.filtering.filters[facet.key] ?? []}
                    onChange={(values) => table.filtering.setFilter(facet.key, values)}
                    clearLabel={t('admin.dataTable.filter.clearAll')}
                  />
                ))}
                <ExportMenu items={[{ key: 'csv', label: t('admin.dataTable.export.csv'), onSelect: () => void exportCsv() }]} />
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
    </div>
  )
}

export default CouponsTableBody
