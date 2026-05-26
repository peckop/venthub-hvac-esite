import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import { LayoutDashboard, Package, Truck, MapPin, FileText, RefreshCcw, User, Shield } from 'lucide-react'
import { Routes } from '../../utils/routes'

type TabItem = { to: string; label: string; icon: React.ReactNode }
type TabGroup = { label: string; items: TabItem[] }

export default function AccountLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const navGroups: TabGroup[] = [
    {
      label: t('account.tabs.overview') || 'Özet',
      items: [
        { to: '/account', label: t('account.tabs.overview') || 'Hesap Özeti', icon: <LayoutDashboard size={18} className="shrink-0" /> },
      ]
    },
    {
      label: 'Sipariş & Kargo',
      items: [
        { to: '/account/orders', label: t('account.tabs.orders') || 'Siparişler', icon: <Package size={18} className="shrink-0" /> },
        { to: '/account/shipments', label: t('account.tabs.shipments') || 'Kargo Takibi', icon: <Truck size={18} className="shrink-0" /> },
        { to: '/account/returns', label: t('account.tabs.returns') || 'İadeler', icon: <RefreshCcw size={18} className="shrink-0" /> },
      ]
    },
    {
      label: 'Hesap Yönetimi',
      items: [
        { to: '/account/profile', label: t('account.tabs.profile') || 'Kişisel Bilgiler', icon: <User size={18} className="shrink-0" /> },
        { to: '/account/addresses', label: t('account.tabs.addresses') || 'Adreslerim', icon: <MapPin size={18} className="shrink-0" /> },
        { to: '/account/invoices', label: t('account.tabs.invoices') || 'Fatura Bilgileri', icon: <FileText size={18} className="shrink-0" /> },
        { to: '/account/security', label: t('account.tabs.security') || 'Güvenlik', icon: <Shield size={18} className="shrink-0" /> },
      ]
    }
  ]

  React.useEffect(() => {
    let active = true
    
    // Lokal geliştirmede oturum zorunluluğunu kaldır
    if (process.env.NODE_ENV === 'development') return

    if (!loading && !user && active) {
      router.replace(Routes.auth.login())
    }
    return () => { active = false }
  }, [user, loading, router])

  // Geliştirme modunda user null olsa bile render et
  const shouldRender = (process.env.NODE_ENV === 'development') || (!loading && user)
  if (!shouldRender) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight px-1 hidden md:block">{t('header.account') || 'Hesabım'}</h1>

            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-6 overflow-x-auto md:overflow-visible no-scrollbar flex md:block">
              {navGroups.map((group, gi) => (
                <div key={gi} className="shrink-0 md:shrink">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 hidden md:block">
                    {group.label}
                  </h3>
                  <div className="flex gap-2 md:flex-col md:space-y-0.5">
                    {group.items.map((tab) => {
                      const isActive = pathname === tab.to
                      return (
                        <Link
                          key={tab.to}
                          href={tab.to as import('next').Route}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${isActive
                              ? 'bg-primary-navy text-white shadow-md shadow-primary-navy/20'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy hover:translate-x-0.5'
                            }`}
                        >
                          <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-navy'}`}>
                            {tab.icon}
                          </span>
                          {tab.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl md:border md:border-slate-200/60 md:shadow-sm md:p-8 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}





