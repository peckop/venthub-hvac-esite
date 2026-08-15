'use client';

import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import AccessDenied from '../../components/admin/AccessDenied'
import AdminRealtimeNotifications from '../../components/admin/AdminRealtimeNotifications'
import CommandPalette from '../../components/admin/CommandPalette'
import { AdminMobileNav, AdminSidebar } from '../../components/admin/shell/AdminSidebar'
import { navCookieName } from '../../components/admin/shell/navCookie'
import { isAdminByEmail } from '../../config/admin'
import { buildBreadcrumbTrail } from '../../config/admin-resources'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { useTenant } from '../../hooks/useTenant'
import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes';

/**
 * ADMIN KABUĞU (shell)
 * Cetvel: docs/standards/admin-design-standard.md §2
 *
 * DEĞİŞMEZ — kök scroll konteyneri DEĞİLDİR. Belge scroll eder, başlık `sticky`.
 * `h-screen` / `100vh` / `overflow-hidden` bu zincirde YASAK: belge kaydırıcısının
 * ayrıcalıkları (mobil URL çubuğu gizleme, Space ile sayfa atlama, scroll
 * restoration, iOS başa dönme) iç konteynere devredilemez; ayrıca `overflow:hidden`
 * WCAG F69'un adlandırdığı kırpılma sebebidir ve %400 zoom'da (SC 1.4.10, Level AA)
 * kaçış scroll'unu yok eder.
 *
 * Yükseklik birimi `svh`: `vh` ≡ `lvh` olduğu için `100vh` "araç çubuğu gizliyken"
 * demektir ve daima taşar; `dvh` ise scroll sırasında yeniden düzen üretir (MDN).
 */

const NAV_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 gün

/** Marka adı çevrilmez — sözlüğe girmez, JSX literali de olmaz. */
const BRAND_NAME = 'VentHub'

interface AdminLayoutProps {
  children?: React.ReactNode
  /** Sunucuda çerezden okunan başlangıç değeri — SSR'da doğru render için. */
  defaultNavCollapsed?: boolean
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  defaultNavCollapsed = false
}) => {
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { canAccess, loading: roleLoading } = useRole()
  const router = useRouter()
  const { t } = useI18n()
  const tenant = useTenant()

  const [navCollapsed, setNavCollapsed] = useState(defaultNavCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const loading = authLoading || roleLoading
  const isEmailAdmin = user?.email ? isAdminByEmail(user.email) : false

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/' as Route)
  }, [loading, user, router])

  /**
   * Tercih ÇEREZDE saklanır, localStorage'da değil: localStorage sunucuda okunamaz,
   * dolayısıyla SSR daima yanlış varsayılanı render eder ve ilk boyada menü zıplar.
   * Çerez tenant-scoped (kural 12) — düz `path=/` çerezi kiracılar arası sızar.
   */
  const toggleNav = useCallback(() => {
    setNavCollapsed((prev) => {
      const next = !prev
      if (typeof document !== 'undefined') {
        document.cookie =
          `${navCookieName(tenant.id)}=${next ? '1' : '0'}` +
          `; path=/admin; max-age=${NAV_COOKIE_MAX_AGE}; SameSite=Lax`
      }
      return next
    })
  }, [tenant.id])

  const breadcrumb = React.useMemo(
    () => buildBreadcrumbTrail(pathname ?? ''),
    [pathname]
  )

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface-deep">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-400" />
      </div>
    )
  }

  if (!isEmailAdmin && !canAccess(pathname ?? '')) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-svh bg-surface-deep font-sans text-white">
      {/*
        SC 2.4.1 Bypass Blocks (Level A): kalıcı sol nav "tekrarlanan blok"tur;
        atlama yolunu sunmak kabuğun sorumluluğudur (§2.6).
      */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast
          focus:rounded-admin-sm focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-sm
          focus:font-medium focus:text-surface-deep"
      >
        {t('admin.a11y.skipToContent')}
      </a>

      <header
        className="sticky top-0 z-sticky flex h-admin-header items-center gap-3
          border-b border-white/10 bg-surface-deep/95 px-3 backdrop-blur md:px-4"
      >
        {/*
          Mobil tetikleyici — YALNIZ CSS breakpoint'i (`md:hidden`). JS tarafında
          ikinci bir breakpoint sayısı yok; böylece §2.4'ün "JS ve CSS aynı sayı
          olmak zorunda" değişmezi yapısal olarak sağlanıyor ve hydration
          uyuşmazlığı imkânsız hâle geliyor.
        */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label={t('admin.a11y.openNavigation')}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          className="inline-flex h-9 w-9 items-center justify-center rounded-admin-sm
            text-white/70 transition-colors hover:bg-white/10 hover:text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 md:hidden"
        >
          <Menu size={18} aria-hidden="true" />
        </button>

        {/* Masaüstü tetikleyici — ikon rayı ↔ genişletilmiş */}
        <button
          type="button"
          onClick={toggleNav}
          aria-label={
            navCollapsed
              ? t('admin.a11y.expandNavigation')
              : t('admin.a11y.collapseNavigation')
          }
          aria-expanded={!navCollapsed}
          aria-controls="admin-desktop-nav"
          className="hidden h-9 w-9 items-center justify-center rounded-admin-sm
            text-white/70 transition-colors hover:bg-white/10 hover:text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 md:inline-flex"
        >
          {navCollapsed ? (
            <PanelLeftOpen size={18} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={18} aria-hidden="true" />
          )}
        </button>

        <Link
          href={Routes.admin.dashboard()}
          className="rounded-admin-sm px-1 text-base font-semibold text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          {BRAND_NAME}
        </Link>

        {breadcrumb.length >= 2 && (
          <nav aria-label={t('admin.a11y.breadcrumb')} className="hidden min-w-0 md:block">
            <ol className="flex items-center gap-1 text-sm text-white/50">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1
                return (
                  <li key={item.key} className="flex min-w-0 items-center gap-1">
                    <ChevronRight size={14} aria-hidden="true" className="shrink-0 opacity-50" />
                    {isLast ? (
                      <span aria-current="page" className="truncate text-white/80">
                        {t(item.labelKey)}
                      </span>
                    ) : (
                      <Link
                        href={item.route as Route}
                        className="truncate rounded-admin-sm transition-colors hover:text-white
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                      >
                        {t(item.labelKey)}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <AdminRealtimeNotifications />
          <div
            aria-label={t('admin.a11y.userMenu')}
            className="flex h-8 w-8 items-center justify-center rounded-full
              border border-white/10 bg-white/5 text-sm font-medium text-cyan-300"
          >
            {(user?.user_metadata?.first_name?.[0] || 'A').toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex">
        <div id="admin-desktop-nav">
          <AdminSidebar
            pathname={pathname ?? ''}
            collapsed={navCollapsed}
            canAccess={canAccess}
          />
        </div>

        <main id="admin-main" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-page px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>

      <div id="admin-mobile-nav">
        <AdminMobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          pathname={pathname ?? ''}
          canAccess={canAccess}
        />
      </div>

      <CommandPalette />

      {/*
        D11 — 2026-08-15 denetimi: `<Toaster/>` admin ağacında HİÇ mount edilmiyordu
        (`MainLayout`'un isAdmin dalı Toaster bloğundan ÖNCE erken dönüyordu), yani
        127 `toast.*` çağrısı sessizce ölüydü ve geri bildirim `alert()`'e kaçmıştı.
        Kabuk artık kendi Toaster'ını taşır. Cetvel §4.6.
      */}
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default AdminLayout
