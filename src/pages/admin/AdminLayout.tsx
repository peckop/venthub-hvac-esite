import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccessAsync } from '../../config/admin'
import { adminNavClass } from '../../utils/adminUi'
import { useI18n } from '../../i18n/I18nProvider'

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()

  React.useEffect(() => {
    let active = true
    async function guard() {
      if (loading) return
      const ok = await checkAdminAccessAsync(user)
      if (!ok && active) navigate('/', { replace: true })
    }
    guard()
    return () => { active = false }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-clean-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="bg-white rounded-lg shadow-hvac-md p-4 space-y-2">
            <h2 className="text-sm font-semibold text-industrial-gray mb-2">{t('header.adminPanel')}</h2>
            <NavLink to="/admin" end className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.dashboard')}</NavLink>
            <NavLink to="/admin/orders" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.orders')}</NavLink>
            <NavLink to="/admin/inventory" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.inventory')}</NavLink>
            <NavLink to="/admin/movements" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.movements')}</NavLink>
            <NavLink to="/admin/inventory/settings" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.inventorySettings')}</NavLink>
            <NavLink to="/admin/returns" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.returns')}</NavLink>
            <NavLink to="/admin/webhook-events" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.webhookEvents')}</NavLink>
            <NavLink to="/admin/users" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.users')}</NavLink>
            <NavLink to="/admin/logs" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.logs')}</NavLink>
            <NavLink to="/admin/errors" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.errors')}</NavLink>
            <NavLink to="/admin/error-groups" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.errorGroups') ?? 'Hata Grupları'}</NavLink>
            <NavLink to="/admin/products" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.products') ?? 'Ürünler'}</NavLink>
            <NavLink to="/admin/categories" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.categories') ?? 'Kategoriler'}</NavLink>
            <NavLink to="/admin/coupons" className={({isActive})=>adminNavClass(isActive)}>{t('admin.menu.coupons')}</NavLink>
          </nav>
        </aside>
        <section className="col-span-12 md:col-span-9">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AdminLayout
