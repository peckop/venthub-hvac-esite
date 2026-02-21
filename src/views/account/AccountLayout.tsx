import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import { LayoutDashboard, Package, Truck, MapPin, FileText, RefreshCcw, User, Shield } from 'lucide-react'

type TabItem = { to: string; label: string; icon: React.ReactNode; end?: boolean }

export default function AccountLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const tabs: TabItem[] = [
    { to: '/account', label: t('account.tabs.overview'), icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { to: '/account/orders', label: t('account.tabs.orders'), icon: <Package className="w-5 h-5" /> },
    { to: '/account/shipments', label: t('account.tabs.shipments'), icon: <Truck className="w-5 h-5" /> },
    { to: '/account/addresses', label: t('account.tabs.addresses'), icon: <MapPin className="w-5 h-5" /> },
    { to: '/account/invoices', label: t('account.tabs.invoices'), icon: <FileText className="w-5 h-5" /> },
    { to: '/account/returns', label: t('account.tabs.returns'), icon: <RefreshCcw className="w-5 h-5" /> },
    { to: '/account/profile', label: t('account.tabs.profile'), icon: <User className="w-5 h-5" /> },
    { to: '/account/security', label: t('account.tabs.security'), icon: <Shield className="w-5 h-5" /> },
  ]

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-[80px]">
            <h1 className="text-2xl font-bold text-industrial-gray mb-6 px-2">{t('header.account')}</h1>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0">
              {tabs.map((tab) => {
                const isActive = pathname === tab.to
                return (
                  <Link
                    key={tab.to}
                    href={tab.to}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                        ? 'bg-primary-navy/5 text-primary-navy'
                        : 'text-steel-gray hover:text-primary-navy hover:bg-gray-50'
                      }`}
                  >
                    <span className={isActive ? 'text-primary-navy' : 'text-gray-400 group-hover:text-primary-navy transition-colors'}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl md:border md:border-gray-100 md:p-8 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}





