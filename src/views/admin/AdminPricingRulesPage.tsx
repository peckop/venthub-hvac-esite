'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
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
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.pricing.rules.title')}</h1>
        <p className={adminSubtitleClass}>{t('admin.pricing.rules.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <PricingRulesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminPricingRulesPage
