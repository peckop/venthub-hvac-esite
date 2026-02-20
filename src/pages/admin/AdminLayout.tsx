import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccessAsync } from '../../config/admin'
import { adminNavClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  React.useEffect(() => {
    let active = true
    async function guard() {
      if (loading) return
      const ok = await checkAdminAccessAsync(user)
      if (!ok && active) router.replace('/')
    }
    guard()
    return () => { active = false }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-clean-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="bg-white rounded-lg shadow-hvac-md p-4 space-y-2">
            <h2 className="text-sm font-semibold text-industrial-gray mb-2">{t('header.adminPanel')}</h2>
            <Link href="/admin" className={adminNavClass(pathname === '/admin')}>{t('admin.menu.dashboard')}</Link>
            <Link href="/admin/orders" className={adminNavClass(pathname === '/admin/orders')}>{t('admin.menu.orders')}</Link>
            <Link href="/admin/inventory" className={adminNavClass(pathname === '/admin/inventory')}>{t('admin.menu.inventory')}</Link>
            <Link href="/admin/movements" className={adminNavClass(pathname === '/admin/movements')}>{t('admin.menu.movements')}</Link>
            <Link href="/admin/inventory/settings" className={adminNavClass(pathname === '/admin/inventory/settings')}>{t('admin.menu.inventorySettings')}</Link>
            <Link href="/admin/returns" className={adminNavClass(pathname === '/admin/returns')}>{t('admin.menu.returns')}</Link>
            <Link href="/admin/webhook-events" className={adminNavClass(pathname === '/admin/webhook-events')}>{t('admin.menu.webhookEvents')}</Link>
            <Link href="/admin/users" className={adminNavClass(pathname === '/admin/users')}>{t('admin.menu.users')}</Link>
            <Link href="/admin/logs" className={adminNavClass(pathname === '/admin/logs')}>{t('admin.menu.logs')}</Link>
            <Link href="/admin/errors" className={adminNavClass(pathname === '/admin/errors')}>{t('admin.menu.errors')}</Link>
            <Link href="/admin/error-groups" className={adminNavClass(pathname === '/admin/error-groups')}>{t('admin.menu.errorGroups') ?? 'Hata Grupları'}</Link>
            <Link href="/admin/products" className={adminNavClass(pathname === '/admin/products')}>{t('admin.menu.products') ?? 'Ürünler'}</Link>
            <Link href="/admin/categories" className={adminNavClass(pathname === '/admin/categories')}>{t('admin.menu.categories') ?? 'Kategoriler'}</Link>
            <Link href="/admin/coupons" className={adminNavClass(pathname === '/admin/coupons')}>{t('admin.menu.coupons')}</Link>
          </nav>
        </aside>
        <section className="col-span-12 md:col-span-9">
          {children}
        </section>
      </div>
    </div>
  )
}

export default AdminLayout

