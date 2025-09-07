import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccessAsync } from '../../config/admin'
import { adminNavClass } from '../../utils/adminUi'

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    let active = true
    async function guard() {
      if (loading) return
      const ok = await checkAdminAccessAsync(user)
      if (!ok && active) navigate('/auth/login', { replace: true })
    }
    guard()
    return () => { active = false }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-clean-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="bg-white rounded-lg shadow-hvac-md p-4 space-y-2">
            <h2 className="text-sm font-semibold text-industrial-gray mb-2">Admin</h2>
            <NavLink to="/admin" end className={({isActive})=>adminNavClass(isActive)}>Dashboard</NavLink>
            <NavLink to="/admin/orders" className={({isActive})=>adminNavClass(isActive)}>Siparişler</NavLink>
            <NavLink to="/admin/inventory" className={({isActive})=>adminNavClass(isActive)}>Stok Özeti</NavLink>
            <NavLink to="/admin/movements" className={({isActive})=>adminNavClass(isActive)}>Hareket Defteri</NavLink>
            <NavLink to="/admin/inventory/settings" className={({isActive})=>adminNavClass(isActive)}>Eşik & Ayarlar</NavLink>
            <NavLink to="/admin/returns" className={({isActive})=>adminNavClass(isActive)}>İadeler</NavLink>
            <NavLink to="/admin/users" className={({isActive})=>adminNavClass(isActive)}>Kullanıcılar</NavLink>
            <NavLink to="/admin/logs" className={({isActive})=>adminNavClass(isActive)}>Kayıtlar</NavLink>
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
