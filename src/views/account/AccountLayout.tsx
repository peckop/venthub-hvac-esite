import { FileText, FolderKanban, Heart, LayoutDashboard, MapPin, Package, RefreshCcw, Shield,Truck, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { useAuth } from '../../hooks/useAuth'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'

type TabItem = { to: string; label: string; icon: React.ReactNode }
type TabGroup = { label: string; items: TabItem[] }

export default function AccountLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const routes = useLocalizedRoutes()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Nav hedefleri localize Routes proxy'sinden gelir (SSOT); böylece href dil-önekli olur
  // VE aktif-sekme kontrolü (pathname === tab.to) dil-önekli pathname ile eşleşir.
  const navGroups: TabGroup[] = [
    {
      label: t('account.tabs.overview') || 'Özet',
      items: [
        { to: routes.account.overview(), label: t('account.tabs.overview') || 'Hesap Özeti', icon: <LayoutDashboard size={18} className="shrink-0" /> },
      ]
    },
    {
      label: 'Sipariş & Kargo',
      items: [
        { to: routes.account.orders(), label: t('account.tabs.orders') || 'Siparişler', icon: <Package size={18} className="shrink-0" /> },
        { to: routes.account.shipments(), label: t('account.tabs.shipments') || 'Kargo Takibi', icon: <Truck size={18} className="shrink-0" /> },
        { to: routes.account.returns(), label: t('account.tabs.returns') || 'İadeler', icon: <RefreshCcw size={18} className="shrink-0" /> },
        { to: routes.account.quotes(), label: t('account.tabs.quotes') || 'Tekliflerim', icon: <FileText size={18} className="shrink-0" /> },
      ]
    },
    {
      label: t('account.tabs.listsGroup'),
      items: [
        { to: routes.account.favorites(), label: t('account.tabs.favorites'), icon: <Heart size={18} className="shrink-0" /> },
        { to: routes.account.projects(), label: t('account.tabs.projects'), icon: <FolderKanban size={18} className="shrink-0" /> },
      ]
    },
    {
      label: 'Hesap Yönetimi',
      items: [
        { to: routes.account.profile(), label: t('account.tabs.profile') || 'Kişisel Bilgiler', icon: <User size={18} className="shrink-0" /> },
        { to: routes.account.addresses(), label: t('account.tabs.addresses') || 'Adreslerim', icon: <MapPin size={18} className="shrink-0" /> },
        { to: routes.account.invoices(), label: t('account.tabs.invoices') || 'Fatura Bilgileri', icon: <FileText size={18} className="shrink-0" /> },
        { to: routes.account.security(), label: t('account.tabs.security') || 'Güvenlik', icon: <Shield size={18} className="shrink-0" /> },
      ]
    }
  ]

  React.useEffect(() => {
    let active = true
    
    // Lokal geliştirmede oturum zorunluluğunu kaldır
    if (process.env.NODE_ENV === 'development') return

    if (!loading && !user && active) {
      router.replace(routes.auth.login())
    }
    return () => { active = false }
  }, [user, loading, router, routes])

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
          <div className="bg-white rounded-2xl md:border md:border-slate-200/60 md:shadow-sm md:p-8 min-h-500px">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}





