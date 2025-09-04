import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccess } from '../../config/admin'

const AdminLayout: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user || !checkAdminAccess(user)) {
      navigate('/auth/login', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-clean-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="bg-white rounded-lg shadow-hvac-md p-4 space-y-2">
            <h2 className="text-sm font-semibold text-industrial-gray mb-2">Admin</h2>
            <NavLink to="/admin" end className={({isActive})=>`block px-3 py-2 rounded ${isActive?'bg-primary-navy text-white':'text-steel-gray hover:bg-light-gray'}`}>Dashboard</NavLink>
            <NavLink to="/admin/inventory" className={({isActive})=>`block px-3 py-2 rounded ${isActive?'bg-primary-navy text-white':'text-steel-gray hover:bg-light-gray'}`}>Stok Özeti</NavLink>
            <NavLink to="/account/operations/returns" className={({isActive})=>`block px-3 py-2 rounded ${isActive?'bg-primary-navy text-white':'text-steel-gray hover:bg-light-gray'}`}>İadeler</NavLink>
            <NavLink to="/account/operations/users" className={({isActive})=>`block px-3 py-2 rounded ${isActive?'bg-primary-navy text-white':'text-steel-gray hover:bg-light-gray'}`}>Kullanıcılar</NavLink>
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
