import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccessAsync } from '../../config/admin'
import { adminNavClass } from '../../utils/adminUi'
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
  Ticket
} from 'lucide-react'

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { user, loading } = useAuth()
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

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yükleniyor...</div>
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sticky top-24 space-y-5">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{group.label}</h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className={adminNavClass(pathname === item.href)}>
                        <Icon size={18} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8 min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminLayout




