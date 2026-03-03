import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { checkAdminAccessAsync } from '../../config/admin'
import { adminNavClass } from '../../utils/adminUi'
import AccessDenied from '../../components/admin/AccessDenied'
import { useI18n } from '../../i18n/I18nProvider'
import {
  BarChart3,
  ShoppingCart,
  PackageSearch,
  ArrowRightLeft,
  Settings,
  Undo2,
  Webhook,
  Users,
  FileText,
  AlertCircle,
  FolderX,
  Package,
  Tags,
  Ticket,
  PieChart,
  Truck,
  Menu,
  X
} from 'lucide-react'
import CommandPalette from '../../components/admin/CommandPalette'
import AdminRealtimeNotifications from '../../components/admin/AdminRealtimeNotifications'

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { canAccess, loading: roleLoading } = useRole()
  const router = useRouter()
  const { t } = useI18n()

  React.useEffect(() => {
    let active = true
    async function guard() {
      if (loading) return
      const ok = await checkAdminAccessAsync(user)
      if (!ok && active) router.replace('/')
    }
    guard()
    return () => { active = false }
  }, [user, loading, router])

  if (loading || roleLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yükleniyor...</div>
  }

  // URL Doğrudan erişim koruması
  if (!canAccess(pathname)) {
    return <AccessDenied />
  }

  // Grouped navigation items
  const navGroups = [
    {
      label: t('admin.menu.groupMain') || 'Ana Menü',
      items: [
        { href: '/admin', label: t('admin.menu.dashboard') || 'Dashboard', icon: BarChart3 },
      ]
    },
    {
      label: t('admin.menu.groupSales') || 'Satış & Operasyon',
      items: [
        { href: '/admin/orders', label: t('admin.menu.orders') || 'Siparişler', icon: ShoppingCart },
        { href: '/admin/logistics', label: t('admin.menu.logistics') || 'Kargo & Lojistik', icon: Truck },
        { href: '/admin/returns', label: t('admin.menu.returns') || 'İadeler', icon: Undo2 },
        { href: '/admin/coupons', label: t('admin.menu.coupons') || 'Kuponlar', icon: Ticket },
      ]
    },
    {
      label: t('admin.menu.groupCatalog') || 'Katalog Yönetimi',
      items: [
        { href: '/admin/products', label: t('admin.menu.products') || 'Ürünler', icon: Package },
        { href: '/admin/categories', label: t('admin.menu.categories') || 'Kategoriler', icon: Tags },
      ]
    },
    {
      label: t('admin.menu.groupStock') || 'Stok & Envanter',
      items: [
        { href: '/admin/inventory', label: t('admin.menu.inventory') || 'Stok Özeti', icon: PackageSearch },
        { href: '/admin/movements', label: t('admin.menu.movements') || 'Hareket Defteri', icon: ArrowRightLeft },
        { href: '/admin/inventory/report', label: t('admin.menu.inventoryReport') || 'Stok Raporu', icon: PieChart },
        { href: '/admin/inventory/settings', label: t('admin.menu.inventorySettings') || 'Eşik & Ayarlar', icon: Settings },
      ]
    },
    {
      label: t('admin.menu.groupSystem') || 'Sistem & Yönetim',
      items: [
        { href: '/admin/users', label: t('admin.menu.users') || 'Kullanıcılar', icon: Users },
        { href: '/admin/webhook-events', label: t('admin.menu.webhookEvents') || 'Webhook Olayları', icon: Webhook },
        { href: '/admin/logs', label: t('admin.menu.logs') || 'Kayıtlar', icon: FileText },
        { href: '/admin/errors', label: t('admin.menu.errors') || 'Hatalar', icon: AlertCircle },
        { href: '/admin/error-groups', label: t('admin.menu.errorGroups') || 'Hata Grupları', icon: FolderX },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-2 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-navy to-secondary-blue text-transparent bg-clip-text">Premium</span>
              Yönetim
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">VentHub B2B Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AdminRealtimeNotifications />
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 py-4 grid grid-cols-12 gap-8">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-50 shadow-2xl transform transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:w-auto md:bg-transparent md:shadow-none md:transform-none
          col-span-12 md:col-span-3 lg:col-span-2
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto p-4 md:p-0 md:h-auto md:overflow-visible">
            {/* Mobile Header in Drawer */}
            <div className="flex items-center justify-between mb-4 md:hidden px-2">
              <span className="font-bold text-lg text-slate-900">Yönetim Menüsü</span>
              <button
                type="button"
                className="p-2 -mr-2 text-slate-500 hover:text-slate-900 focus:outline-none bg-slate-200/50 rounded-full"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sticky top-24 space-y-5">
              {navGroups.map((group, gi) => {
                const visibleItems = group.items.filter(item => canAccess(item.href))
                if (visibleItems.length === 0) return null

                return (
                  <div key={gi}>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{group.label}</h3>
                    <div className="space-y-0.5">
                      {visibleItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={adminNavClass(pathname === item.href)}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>
        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8 min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </section>
      </div>
      <CommandPalette />
    </div>
  )
}

export default AdminLayout




