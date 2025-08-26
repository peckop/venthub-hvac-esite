import React from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const tabs = [
  { to: '/account', label: 'Özet', end: true },
  { to: '/account/orders', label: 'Siparişler' },
  { to: '/account/addresses', label: 'Adresler' },
  { to: '/account/invoices', label: 'Faturalar' },
  { to: '/account/security', label: 'Güvenlik' },
]

export default function AccountLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!loading && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-industrial-gray mb-4">Hesabım</h1>
      <div className="sticky top-[60px] z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-gray-100">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-navy/10 text-primary-navy'
                    : 'text-steel-gray hover:text-primary-navy hover:bg-gray-50'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  )
}

