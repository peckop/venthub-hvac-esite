'use client'

import { useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useMemo } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useAuth } from '../../hooks/useAuth'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useRole } from '../../hooks/useRole'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import AdminUsersTableBody from './AdminUsersTableBody'

/**
 * Kullanıcı yönetimi — DataTableKit'e göç edilmiş CLIENT-mode + DUAL-TAB sayfası.
 * Sayfa = başlık + auth/redirect + Suspense; veri/URL/sekme state'i `AdminUsersTableBody`
 * (useAdminTable) taşır. `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminUsersPage: React.FC = () => {
  const { user, loading } = useAuth()
  const { role } = useRole()
  const router = useRouter()
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  const isAdmin = useMemo(() => !!role && (role === 'super_admin' || role === 'admin'), [role])

  useEffect(() => {
    if (!loading && !user) {
      router.push(Routes.auth.login('/admin/users'))
    }
  }, [user, loading, router, Routes])

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.users')}</h1>
        <p className={adminSubtitleClass}>{t('admin.users.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <AdminUsersTableBody isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}

export default AdminUsersPage
