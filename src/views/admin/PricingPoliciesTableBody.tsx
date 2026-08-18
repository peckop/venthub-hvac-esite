'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { Lock, LockOpen, SearchX, ShieldCheck } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'

import { loadBrandIdByName } from '@/lib/services/pricingAdmin.service'
import {
  type FxLockDecision,
  type PricingPolicyRow,
  resolveFxLocks,
} from '@/lib/services/pricingPolicy.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import PricingPolicyFormModal, {
  type PolicyFormValue,
} from '../../components/admin/pricing/PricingPolicyFormModal'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDateTime } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardPaddedClass,
  adminInputClass,
  adminSectionTitleClass,
  adminTableActionClass,
} from '../../utils/adminUi'

/**
 * Kur kilidi (`pricing_policy.fx_lock`) yönetim yüzeyi — okuma yarısı.
 *
 * NİÇİN VAR: tablo ve onu okuyan motor W5'te geldi ama HİÇBİR arayüzü yoktu —
 * kilit görülemiyor, konulmuş bir kilidin hangi ürünü etkilediği anlaşılamıyordu.
 * Ölçüm (2026-08-17, prod): `pricing_policy` 0 satır, yani bu yüzey ilk okuyucu.
 *
 * MERDİVEN BURADA TEKRARLANMAZ. "Bu ürün kilitli mi" sorusunu `resolveFxLocks`
 * cevaplar. Kapsam merdivenini (en özel kazanır; daha özel bir `fx_lock=false`
 * genel kilidi BOZAR) arayüzde yeniden yazmak ikinci bir doğruluk kaynağı
 * üretirdi — INV-PRICE-7'nin tek-merdiven kuralı buna zaten KIRMIZI verir.
 * Cetvel: pricing-standard §8.2.1-B.
 */

type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'

const SCOPE_KEYS: Record<number, ScopeKey> = {
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'global',
}

interface PolicyRow {
  id: string
  scope: number
  scopeKey: ScopeKey
  /** Duzenleme formuna tasinir; hangi sutunda durdugu `scope`'a baglidir. */
  targetId: string | null
  targetName: string
  fxLock: boolean
  frozenRate: number | null
  frozenAt: string
  note: string | null
  isActive: boolean
  priority: number
}

/**
 * Politikaları çeker — PASİFLER DAHİL.
 *
 * `fetchActivePolicies` bilerek yalnız aktifleri getirir; motorun ihtiyacı odur.
 * Yönetim yüzeyi pasifleri de göstermek ZORUNDA: aksi hâlde kapatılmış bir kilit
 * ekrandan kaybolur ve "hiç yok" ile "pasif" ayırt edilemez hâle gelir.
 */
async function policiesFetcher(
  supabase: SupabaseClient<Database>,
  _params: FetchParams,
): Promise<FetchResult<PolicyRow>> {
  await ensureSessionFresh()

  const { data, error } = await supabase
    .from('pricing_policy')
    .select('*')
    .order('scope', { ascending: true })
    .order('priority', { ascending: false })
  if (error) throw error

  const policies = (data ?? []) as PricingPolicyRow[]

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from('brands').select('id, name'),
    supabase.from('categories').select('id, name'),
  ])

  const productIds = [...new Set(policies.map((p) => p.product_id).filter((id): id is string => id !== null))]
  const products = productIds.length
    ? (await supabase.from('products').select('id, name, sku').in('id', productIds)).data ?? []
    : []

  const brandName = new Map((brands ?? []).map((b) => [b.id, b.name] as const))
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name] as const))
  const productName = new Map(products.map((p) => [p.id, `${p.name} (${p.sku})`] as const))

  const rows: PolicyRow[] = policies.map((p) => ({
    id: p.id,
    scope: p.scope,
    scopeKey: SCOPE_KEYS[p.scope] ?? 'global',
    targetId: p.brand_id ?? p.category_id ?? p.product_id ?? null,
    targetName:
      p.scope === 2
        ? brandName.get(p.brand_id ?? '') ?? ''
        : p.scope === 3
          ? categoryName.get(p.category_id ?? '') ?? ''
          : p.scope === 0 || p.scope === 1
            ? productName.get(p.product_id ?? '') ?? ''
            : '',
    fxLock: p.fx_lock,
    frozenRate: p.fx_frozen_rate == null ? null : Number(p.fx_frozen_rate),
    frozenAt: p.frozen_at,
    note: p.note,
    isActive: p.is_active,
    priority: p.priority,
  }))

  return { rows, totalMatched: rows.length }
}

/**
 * "Bu ürün ŞU AN kilitli mi, kilidi HANGİ satır verdi?"
 *
 * Destek sorusunun ("bu ürünün fiyatı neden güncellenmiyor?") tek adımlı cevabı.
 * Ham politika listesine bakmak YETMEZ: merdiven yüzünden listede kilit görünürken
 * ürün kilitsiz olabilir — daha özel bir `fx_lock=false` genel kilidi bozar.
 */
const EffectiveLockPanel: React.FC = () => {
  const { t } = useI18n()
  const [term, setTerm] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<
    | { kind: 'notFound' }
    | { kind: 'found'; label: string; decision: FxLockDecision; winnerScope: ScopeKey | null }
    | null
  >(null)

  const lookup = useCallback(async () => {
    const q = term.trim()
    if (!q) return
    setBusy(true)
    setResult(null)
    try {
      const { data: products } = await supabaseBrowserClient
        .from('products')
        .select('id, name, sku, brand, category_id')
        .or(`sku.ilike.%${q}%,name.ilike.%${q}%`)
        .limit(1)

      const product = products && products.length > 0 ? products[0] : null
      if (!product) {
        setResult({ kind: 'notFound' })
        return
      }

      /*
        `products.brand` METİNDİR, politika ise marka FK'si tutar. Köprü, motorun
        kullandığı `loadBrandIdByName` ile kurulur — burada kendi eşleştirmemi
        yazsaydım marka kilidi arayüzde "yok" görünüp motorda "var" olabilirdi
        (ya da tersi) ve iki cevap sessizce ayrışırdı.
      */
      const brandIdByName = await loadBrandIdByName(supabaseBrowserClient)
      const brandId = brandIdByName.get(product.brand) ?? brandIdByName.get(product.brand.trim()) ?? null

      const decisions = await resolveFxLocks(supabaseBrowserClient, [
        { id: product.id, brandId, categoryId: product.category_id },
      ])
      const decision = decisions.get(product.id) ?? {
        locked: false,
        policyId: null,
        frozenRate: null,
        scope: null,
      }

      setResult({
        kind: 'found',
        label: `${product.name} (${product.sku})`,
        decision,
        winnerScope: decision.scope == null ? null : SCOPE_KEYS[decision.scope] ?? null,
      })
    } finally {
      setBusy(false)
    }
  }, [term])

  return (
    <section className={adminCardPaddedClass}>
      <h2 className={adminSectionTitleClass}>{t('admin.pricing.policies.effective.title')}</h2>
      <p className="text-xs text-admin-fg-muted mt-1 mb-4">{t('admin.pricing.policies.effective.help')}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className={adminInputClass}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void lookup()
          }}
          placeholder={t('admin.pricing.policies.effective.placeholder')}
          aria-label={t('admin.pricing.policies.effective.placeholder')}
        />
        <button
          type="button"
          className={adminButtonSecondaryClass}
          onClick={() => void lookup()}
          disabled={busy || term.trim().length === 0}
        >
          {busy ? t('admin.pricing.policies.effective.checking') : t('admin.pricing.policies.effective.check')}
        </button>
      </div>

      {result?.kind === 'notFound' && (
        <p role="status" className="mt-4 text-sm text-admin-warning">
          {t('admin.pricing.policies.effective.notFound')}
        </p>
      )}

      {result?.kind === 'found' && (
        <div role="status" className="mt-4 space-y-2 text-sm">
          <p className="text-admin-fg">{result.label}</p>
          {result.decision.locked ? (
            <>
              <p className="flex items-center gap-2 text-admin-accent">
                <Lock size={14} aria-hidden="true" />
                {t('admin.pricing.policies.effective.locked')}
              </p>
              {/* "Hangi satır kazandı" — merdiven şeffaf olmalı, yoksa admin listede
                  kilit görüp ürünün oynamasını (ya da tersini) açıklayamaz. */}
              <p className="text-admin-fg-muted text-xs">
                {t('admin.pricing.policies.effective.winner', {
                  scope: result.winnerScope ? t(`admin.pricing.common.scope.${result.winnerScope}`) : '—',
                  rate: result.decision.frozenRate == null ? '—' : String(result.decision.frozenRate),
                })}
              </p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-admin-fg-muted">
              <LockOpen size={14} aria-hidden="true" />
              {t('admin.pricing.policies.effective.unlocked')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

const PricingPoliciesTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canAccess, canWrite } = useRole()

  const table = useAdminTable<PolicyRow>({
    resource: 'pricing_policies',
    rowId: (r) => r.id,
    fetcher: policiesFetcher,
    initialSort: { key: 'scope', dir: 'asc' },
    syncUrl: true,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PolicyFormValue | null>(null)

  const openNew = useCallback(() => {
    setEditing(null)
    setFormOpen(true)
  }, [])

  /**
   * Satirdan forma gecerken TARIHSEL KUNYE de tasinir: kilit kapaliyken duran
   * `fx_frozen_rate`, form icinde "su anki kur" gibi gorunmesin diye ayrica
   * etiketlenir (kararin sahibi bu deger degil, gecmisteki bir olcumdur).
   */
  const openEdit = useCallback((row: PolicyRow) => {
    setEditing({
      id: row.id,
      scope: row.scope,
      targetId: row.targetId,
      fxLock: row.fxLock,
      note: row.note ?? '',
      priority: row.priority,
      isActive: row.isActive,
      frozenRate: row.frozenRate,
    })
    setFormOpen(true)
  }, [])

  const columns = useMemo<AdminColumn<PolicyRow>[]>(
    () => [
      {
        key: 'scope',
        header: t('admin.pricing.common.scopeLabel'),
        cell: (r) => <span className="text-admin-fg">{t(`admin.pricing.common.scope.${r.scopeKey}`)}</span>,
      },
      {
        key: 'target',
        header: t('admin.pricing.policies.table.target'),
        cell: (r) => <span className="text-admin-fg-muted">{r.targetName || '—'}</span>,
      },
      {
        key: 'fxLock',
        header: t('admin.pricing.policies.table.lock'),
        cell: (r) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ring-1 ${
              r.fxLock
                ? 'bg-admin-accent-weak text-admin-accent ring-admin-accent/30'
                : 'bg-admin-surface-2 text-admin-fg-muted ring-admin-border'
            }`}
          >
            {r.fxLock ? <Lock size={12} aria-hidden="true" /> : <LockOpen size={12} aria-hidden="true" />}
            {r.fxLock ? t('admin.pricing.policies.table.locked') : t('admin.pricing.policies.table.unlocked')}
          </span>
        ),
      },
      {
        key: 'frozenRate',
        header: t('admin.pricing.policies.table.frozenRate'),
        cell: (r) => <span className="text-admin-fg-muted">{r.frozenRate == null ? '—' : r.frozenRate}</span>,
      },
      {
        key: 'frozenAt',
        header: t('admin.pricing.policies.table.frozenAt'),
        cell: (r) => <span className="text-admin-fg-muted">{formatDateTime(r.frozenAt, lang)}</span>,
      },
      {
        key: 'note',
        header: t('admin.pricing.policies.table.note'),
        cell: (r) => <span className="text-admin-fg-muted">{r.note || '—'}</span>,
      },
      {
        key: 'isActive',
        header: t('admin.pricing.policies.table.active'),
        cell: (r) => (
          <span className={r.isActive ? 'text-admin-success' : 'text-admin-fg-muted'}>
            {r.isActive ? t('admin.common.active') : t('admin.common.passive')}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('admin.common.actions'),
        cell: (r) => (
          <button type="button" className={adminTableActionClass} onClick={() => openEdit(r)}>
            {t('admin.common.edit')}
          </button>
        ),
      },
    ],
    [t, lang, openEdit],
  )

  return (
    <div className="space-y-6 pb-20">
      <EffectiveLockPanel />

      <div className="flex justify-end">
        <button
          type="button"
          className={adminButtonPrimaryClass}
          onClick={openNew}
          disabled={!canWrite('pricing')}
        >
          {t('admin.pricing.policies.form.titleNew')}
        </button>
      </div>

      <DataTableKit
        table={table}
        columns={columns}
        rowId={(r) => r.id}
        persistKey="pricing_policies"
        hasWriteAccess={canWrite('pricing')}
        hasReadAccess={canAccess('/admin/pricing')}
        emptyState={
          <AdminEmptyState
            icon={ShieldCheck}
            title={t('admin.pricing.policies.empty.title')}
            description={t('admin.pricing.policies.empty.description')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.pricing.policies.empty.title')}
            description={t('admin.pricing.policies.empty.description')}
          />
        }
      />

      <PricingPolicyFormModal
        open={formOpen}
        policy={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => void table.reload()}
      />
    </div>
  )
}

export default PricingPoliciesTableBody
