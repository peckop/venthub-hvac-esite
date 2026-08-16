'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import PricingRulesTableBody from './PricingRulesTableBody'

/**
 * Marj kuralları yönetimi — sayfa = başlık + Suspense.
 * Veri/URL state'i `PricingRulesTableBody` (useAdminTable) taşır; `useSearchParams`
 * tüketicisi <Suspense> ile sarılıdır (CLAUDE.md Kural 5 — SSR zehirlenmesi).
 */
const AdminPricingRulesPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.pricing.rules.title')}
        description={t('admin.pricing.rules.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <PricingRulesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminPricingRulesPage
