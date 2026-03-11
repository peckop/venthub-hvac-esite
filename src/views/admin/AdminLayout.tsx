import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const isSettingsPage = pathname === '/admin/settings'
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

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

  // Proaktif Token Yenileme: Sekme aktif olduğunda Supabase oturumunu kontrol et
  useEffect(() => {
    const refreshOnVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { ensureSessionFresh } = await import('../../lib/ensureSessionFresh')
          // Akıllı oturum kontrolü
          await ensureSessionFresh()
        } catch (error) {
          console.error('Proactive token refresh failed:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', refreshOnVisibility)
    return () => document.removeEventListener('visibilitychange', refreshOnVisibility)
  }, [])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
        <div className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
          Sistem Hazırlanıyor...
        </div>
      </div>
    )
  }

  // URL Doğrudan erişim koruması
  if (!canAccess(pathname ?? '')) {
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
        { href: '/admin/audit-logs', label: t('admin.menu.logs') || 'Kayıtlar', icon: FileText },
        { href: '/admin/settings', label: t('admin.menu.settings') || 'Ayarlar', icon: Settings },
        { href: '/admin/errors', label: t('admin.menu.errors') || 'Hatalar', icon: AlertCircle },
        { href: '/admin/error-groups', label: t('admin.menu.errorGroups') || 'Hata Grupları', icon: FolderX },
      ]
    },
  ]

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 bg-[#0A0F1E] text-slate-200 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-navy/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-secondary-blue/10 blur-[100px] rounded-full opacity-30" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 pt-6 pb-2 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center cyan-glow">
                <Webhook size={18} className="text-cyan-400" />
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Premium</span>
              <span className="text-slate-200">Yönetim</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 ml-11">VentHub B2B Energy Systems</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AdminRealtimeNotifications />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-4 grid grid-cols-12 gap-6 relative z-10">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0A0F1E] border-r border-white/5 shadow-2xl transform transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:w-auto md:bg-transparent md:border-r-0 md:shadow-none md:transform-none
          col-span-12 md:col-span-3 lg:col-span-2
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto p-4 md:p-0 md:h-auto md:overflow-visible">
            {/* Mobile Header in Drawer */}
            <div className="flex items-center justify-between mb-6 md:hidden px-2 pb-4 border-b border-white/5">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white truncate max-w-[180px]">
                  {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Kullanıcı'}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full inline-block mt-1 w-max uppercase tracking-wider">
                  {user?.user_metadata?.role || 'Admin'}
                </span>
              </div>
              <button
                type="button"
                className="p-2 -mr-2 text-slate-400 hover:text-white focus:outline-none glass rounded-full transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="glass rounded-2xl p-4 sticky top-6 space-y-6">
              {navGroups.map((group, gi) => {
                const visibleItems = group.items.filter(item => canAccess(item.href))
                if (visibleItems.length === 0) return null

                return (
                  <div key={gi}>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-3">{group.label}</h3>
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl group ${
                              isActive 
                                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 cyan-glow' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`}
                            onClick={() => {
                              setSidebarOpen(false)
                            }}
                          >
                            <Icon size={18} className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="truncate">{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {/* User profile footer - Desktop only */}
              <div className="hidden md:block pt-4 mt-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-cyan-400">
                      {(user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.user_metadata?.first_name || 'Admin'}</p>
                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user?.user_metadata?.role || 'Super Admin'}</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          <div key={pathname} className="min-h-[calc(100vh-10rem)] transition-all duration-500">
            {children}
          </div>
        </section>
      </div>
      <CommandPalette />
    </div>
  )
}

export default AdminLayout




