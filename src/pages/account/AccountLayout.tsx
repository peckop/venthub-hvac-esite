import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

type TabItem = { to: string; label: string; end?: boolean }

const baseTabs: TabItem[] = [
  { to: '/account', label: 'Özet', end: true },
  { to: '/account/orders', label: 'Siparişler' },
  { to: '/account/shipments', label: 'Kargo Takibi' },
  { to: '/account/addresses', label: 'Adresler' },
  { to: '/account/invoices', label: 'Faturalar' },
  { to: '/account/returns', label: 'İadeler' },
  { to: '/account/profile', label: 'Profil' },
  { to: '/account/security', label: 'Güvenlik' },
]

export default function AccountLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadRole() {
      try {
        console.warn('🚀 AccountLayout loadRole called, user:', user?.email || 'NO USER')
        
        if (!user) { 
          console.warn('❌ No user, setting admin false')
          setIsAdmin(false); 
          return 
        }
        
        // TEMP: Production'da da admin mode aktif (site sahibi için)
        const isDev = import.meta.env.DEV
        const isLocalhost = window.location.hostname === 'localhost'
        const isOwnerSite = window.location.hostname.includes('venthub') || window.location.hostname.includes('cloudflare')
        const forceAdmin = isDev || isLocalhost || isOwnerSite || true // TEMP: Herkesi admin yap
        
        console.warn('🔧 ADMIN CHECK:', { isDev, isLocalhost, isOwnerSite, forceAdmin, hostname: window.location.hostname })
        
        if (forceAdmin && user?.email) {
          console.warn('✅ FORCE ADMIN MODE: Access granted to:', user.email)
          if (mounted) {
            setIsAdmin(true)
            console.warn('🎯 Admin state set to TRUE')
          }
          return
        }
        
        // Production admin check
        console.warn('🔍 Checking database for admin role...')
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
          
        if (!mounted) return
        
        console.warn('📊 DB result:', { data, error })
        
        if (!error && data && (data as { role?: string }).role === 'admin') {
          console.warn('✅ DB Admin role confirmed')
          setIsAdmin(true)
        } else {
          console.warn('❌ No admin role in DB')
          setIsAdmin(false)
        }
      } catch (err) {
        console.error('❌ loadRole error:', err)
        if (mounted) setIsAdmin(false)
      }
    }
    loadRole()
    return () => { mounted = false }
  }, [user])

  if (!loading && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const tabs: TabItem[] = isAdmin
    ? [...baseTabs, { to: '/account/operations/stock', label: 'Operasyon' }]
    : baseTabs

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

