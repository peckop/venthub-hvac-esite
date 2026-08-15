'use client'

import { useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useMemo } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useRole } from '../../hooks/useRole'
import { useI18n } from '../../i18n/I18nProvider'
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
      <AdminPageHeader
        title={t('admin.titles.users')}
        description={t('admin.users.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <AdminUsersTableBody isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}

export default AdminUsersPage
