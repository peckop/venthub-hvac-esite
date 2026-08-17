'use client'

import * as Dialog from '@radix-ui/react-dialog'
import type { Route } from 'next'
import Link from 'next/link'
import React from 'react'

import {
  ADMIN_NAV_GROUPS,
  ADMIN_RESOURCES,
  type AdminResource,
  findCurrentResource,
  isResourceActive
} from '../../../config/admin-resources'
import { useI18n } from '../../../i18n/I18nProvider'

/**
 * ADMIN SOL NAVİGASYONU
 * Cetvel: docs/standards/admin-design-standard.md §2.4, §2.5, §2.6
 *
 * Üç durum: genişletilmiş (16rem) · ikon rayı (3rem) · mobil drawer (<768px).
 *
 * KRİTİK — "gap + fixed" deseni (§2.4). Daralan kutu AKIŞTAKİ `gap`'tir; görünen
 * panel `fixed` olduğu için layout genişliğine hiç katkı vermez. Bu yüzden:
 *   · kökün AÇIK GENİŞLİĞİ OLMAZ (`width: auto`) — `w-64` yazılırsa collapse
 *     anlamsızlaşır ve 2026-08-15'te ölçülen "280px ölü sütun" hatası geri gelir,
 *   · gap ile panel AYNI süre + easing kullanır, yoksa panel içerikten kopar.
 *
 * Mobil drawer Radix Dialog üzerine kurulu: focus trap, ESC ve body scroll lock
 * oradan gelir. İki elle kapatılan eksik var (§2.5):
 *   1. Radix `aria-modal` BASMIYOR (dist doğrulandı) → elle veriliyor.
 *   2. Body scroll lock `<Dialog.Overlay>` içindedir → Overlay ASLA çıkarılmaz.
 * Kapalıyken Radix içeriği unmount ettiği için ayrıca `inert` gerekmez (unmount,
 * `inert`'ten güçlüdür); yalnız-`translate` ile gizleme YASAK.
 */

const NAV_ITEM_BASE =
  'group/navitem relative flex items-center gap-3 rounded-admin-sm px-3 h-9 text-sm ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30'

const NAV_ITEM_ACTIVE = 'bg-admin-accent-weak text-admin-accent'
const NAV_ITEM_ANCESTOR = 'text-admin-fg'
const NAV_ITEM_IDLE = 'text-admin-fg-muted hover:bg-admin-surface-2 hover:text-admin-fg'

interface NavListProps {
  pathname: string
  /** Rail modunda etiketler gizlenir, ikon kalır. */
  collapsed: boolean
  canAccess: (path: string) => boolean
  onNavigate?: () => void
}

function NavList({ pathname, collapsed, canAccess, onNavigate }: NavListProps) {
  const { t } = useI18n()
  const current = React.useMemo(() => findCurrentResource(pathname), [pathname])

  const groups = React.useMemo(() => {
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      // RBAC Katman 1 — yetkisiz kaynak LİSTELENMEZ. Görünür link + AccessDenied
      // duvarı kabul edilemez (§2.4 / denetim bulgusu D8).
      items: ADMIN_RESOURCES.filter(
        (r) => r.inNav && r.group === group.key && canAccess(r.requiredAccess)
      )
    })).filter((group) => group.items.length > 0)
  }, [canAccess])

  const renderItem = (resource: AdminResource) => {
    const isCurrent = current?.key === resource.key
    // Ata: rota eşleşiyor ama `aria-current`'ı yaprak alıyor. MDN: "Only mark one
    // element in a set of elements as current." → ata yalnız GÖRSEL vurgu alır.
    const isAncestor = !isCurrent && isResourceActive(resource, pathname)
    const label = t(resource.labelKey)
    const Icon = resource.icon

    return (
      <li key={resource.key}>
        <Link
          href={resource.route as Route}
          aria-current={isCurrent ? 'page' : undefined}
          data-active-ancestor={isAncestor ? 'true' : undefined}
          title={collapsed ? label : undefined}
          onClick={onNavigate}
          className={`${NAV_ITEM_BASE} ${
            isCurrent ? NAV_ITEM_ACTIVE : isAncestor ? NAV_ITEM_ANCESTOR : NAV_ITEM_IDLE
          } ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <Icon size={18} aria-hidden="true" className="shrink-0" />
          <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
        </Link>
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {groups.map((group) => (
        <div key={group.key}>
          {!collapsed && (
            <h3 className="mb-2 px-3 text-xs font-medium tracking-wide text-admin-fg-muted">
              {t(group.labelKey)}
            </h3>
          )}
          <ul className={`flex flex-col gap-0.5 ${collapsed ? 'px-1.5' : 'px-2'}`}>
            {group.items.map(renderItem)}
          </ul>
        </div>
      ))}
    </div>
  )
}

export interface AdminSidebarProps {
  pathname: string
  collapsed: boolean
  canAccess: (path: string) => boolean
}

/**
 * Masaüstü sol navigasyon (≥768px). Mobilde tamamen gizlidir — orada
 * `AdminMobileNav` devreye girer. Breakpoint YALNIZ CSS'te (`md:`) tanımlı;
 * JS tarafında ikinci bir breakpoint sayısı YOK, dolayısıyla §2.4'ün
 * "JS ve CSS aynı sayı olmak zorunda" değişmezi yapısal olarak sağlanıyor
 * ve hydration uyuşmazlığı riski ortadan kalkıyor.
 */
export function AdminSidebar({ pathname, collapsed, canAccess }: AdminSidebarProps) {
  const { t } = useI18n()
  const width = collapsed ? 'w-admin-rail' : 'w-admin-nav'

  return (
    // Kök: AÇIK GENİŞLİK YOK. Layout kutusunu yalnız aşağıdaki `gap` belirler.
    <div
      className="relative hidden md:block"
      data-state={collapsed ? 'collapsed' : 'expanded'}
    >
      {/* AKIŞTAKİ yer tutucu — daralan kutu budur */}
      <div
        aria-hidden="true"
        className={`${width} transition-width duration-200 ease-linear`}
      />
      {/* GÖRÜNEN panel — `fixed`, layout genişliğine katkısı sıfır */}
      <nav
        aria-label={t('admin.a11y.mainNavigation')}
        className={`fixed bottom-0 left-0 top-admin-header z-sticky ${width}
          overflow-y-auto border-r border-admin-border bg-admin-bg
          transition-width duration-200 ease-linear`}
      >
        <NavList pathname={pathname} collapsed={collapsed} canAccess={canAccess} />
      </nav>
    </div>
  )
}

export interface AdminMobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
  canAccess: (path: string) => boolean
}

/**
 * Mobil overlay drawer (<768px). Radix Dialog sözleşmesi: focus trap, ESC,
 * odağın tetikleyiciye dönmesi ve body scroll lock hazır gelir.
 * `<Dialog.Overlay>` ASLA çıkarılmaz — scroll lock oradadır (§2.5).
 */
export function AdminMobileNav({
  open,
  onOpenChange,
  pathname,
  canAccess
}: AdminMobileNavProps) {
  const { t } = useI18n()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay = backdrop + body scroll lock. Kaldırma. */}
        <Dialog.Overlay className="fixed inset-0 z-backdrop bg-black/60 md:hidden" />
        <Dialog.Content
          // Radix `aria-modal` basmıyor (dist doğrulandı) → elle veriliyor.
          aria-modal="true"
          className="fixed inset-y-0 left-0 z-modal w-admin-drawer overflow-y-auto
            border-r border-admin-border bg-admin-bg md:hidden"
        >
          <Dialog.Title className="sr-only">{t('admin.a11y.mainNavigation')}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('admin.a11y.mainNavigation')}
          </Dialog.Description>
          <NavList
            pathname={pathname}
            collapsed={false}
            canAccess={canAccess}
            onNavigate={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
