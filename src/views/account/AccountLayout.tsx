import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'

type TabItem = { to: string; label: string; end?: boolean }

export default function AccountLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const baseTabs: TabItem[] = [
    { to: '/account', label: t('account.tabs.overview'), end: true },
    { to: '/account/orders', label: t('account.tabs.orders') },
    { to: '/account/shipments', label: t('account.tabs.shipments') },
    { to: '/account/addresses', label: t('account.tabs.addresses') },
    { to: '/account/invoices', label: t('account.tabs.invoices') },
    { to: '/account/returns', label: t('account.tabs.returns') },
    { to: '/account/profile', label: t('account.tabs.profile') },
    { to: '/account/security', label: t('account.tabs.security') },
  ]

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  // Admin sekmeleri artık Account altında gösterilmiyor; müşteri alanı sade tutulur
  const tabs: TabItem[] = baseTabs

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('header.account')}</h1>
      <div className="sticky top-[60px] z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-gray-100">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              href={tab.to}
              className={
                `px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${pathname === tab.to
                  ? 'bg-primary-navy/10 text-primary-navy'
                  : 'text-steel-gray hover:text-primary-navy hover:bg-gray-50'
                }`
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="py-4">
        {children}
      </div>
    </div>
  )
}





