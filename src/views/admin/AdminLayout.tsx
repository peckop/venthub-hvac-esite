import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { checkAdminAccessAsync } from '../../config/admin'
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
  X,
  ExternalLink
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

  useEffect(() => {
    let active = true
    async function guard() {
      if (loading) return
      const ok = await checkAdminAccessAsync(user)
      if (!ok && active) router.replace('/')
    }
    guard()
    return () => { active = false }
  }, [user, loading, router])

  // Proaktif Token Yenileme
  useEffect(() => {
    const refreshOnVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { ensureSessionFresh } = await import('../../lib/ensureSessionFresh')
          await ensureSessionFresh()
        } catch (error) {
          console.error('Proactive token refresh failed:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', refreshOnVisibility)
    return () => document.removeEventListener('visibilitychange', refreshOnVisibility)
  }, [])

  // Initial Auth Loading Spinner (Sadece ilk girişte)
  if (loading && !user) {
    return (
      <div className="h-screen bg-[#0A0F1E] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
        <div className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
          Sistem Hazırlanıyor...
        </div>
      </div>
    )
  }

  // URL Doğrudan erişim koruması
  if (!loading && !roleLoading && !canAccess(pathname ?? '')) {
    return <AccessDenied />
  }

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
    <div className="h-screen flex flex-col font-sans transition-colors duration-500 bg-[#0A0F1E] text-slate-200 overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-navy/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-secondary-blue/10 blur-[100px] rounded-full opacity-30" />
      </div>

      {/* Modern Global Header */}
      <header className="h-16 flex-none border-b border-white/5 bg-[#0A0F1E]/60 backdrop-blur-xl relative z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white focus:outline-none glass rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Link href="/admin" className="flex items-center gap-3 group transition-all">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center cyan-glow group-hover:scale-105 transition-transform">
              <Webhook size={20} className="text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Vent</span>Hub
              </h1>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Yönetim Paneli</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* External Site Link - Standard Requirement */}
          <Link 
            href="/" 
            className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white glass border-white/5 hover:border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 group"
          >
            <ExternalLink size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Mağazaya Git</span>
          </Link>

          <div className="w-px h-6 bg-white/5 mx-2 hidden md:block" />

          <AdminRealtimeNotifications />
          
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-white/5 ml-2">
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white leading-none">{user?.user_metadata?.first_name || 'Admin'}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{user?.user_metadata?.role || 'Süper Admin'}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
               <span className="text-xs font-bold text-cyan-400">
                  {(user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Persistent Sidebar */}
        <aside
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0A0F1E] border-r border-white/5 shadow-2xl transform transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:w-64 md:bg-[#0A0F1E]/30 md:backdrop-blur-sm md:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            {/* Mobile Header in Drawer */}
            <div className="flex items-center justify-between p-6 md:hidden border-b border-white/5">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white">
                  {user?.user_metadata?.first_name || 'Admin'}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full inline-block mt-1 w-max uppercase tracking-wider">
                  {user?.user_metadata?.role || 'Admin'}
                </span>
              </div>
              <button
                type="button"
                className="p-2 -mr-2 text-slate-400 hover:text-white focus:outline-none glass rounded-xl"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8 py-8">
              {navGroups.map((group, gi) => {
                const visibleItems = group.items.filter(item => canAccess(item.href))
                if (visibleItems.length === 0) return null

                return (
                  <div key={gi} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${gi * 100}ms` }}>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 px-3 opacity-60 font-sans">{group.label}</h3>
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl group relative overflow-hidden ${
                              isActive 
                                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 cyan-glow' 
                                : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="truncate">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </nav>

            <div className="p-4 border-t border-white/5 md:hidden">
                 <Link 
                    href="/" 
                    className="flex items-center justify-center gap-3 w-full py-3 text-xs font-bold text-white bg-cyan-500/20 border border-cyan-500/30 rounded-xl"
                    onClick={() => setSidebarOpen(false)}
                >
                    <ExternalLink size={16} />
                    <span>Siteye Dön</span>
                </Link>
            </div>
          </div>
        </aside>

        {/* Independent Scroll Content Area */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </div>
            
            {/* Footer - Optional standard */}
            <footer className="w-full max-w-[1600px] mx-auto px-8 py-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between items-center opacity-50">
                <span>© 2026 VentHub HVAC Systems</span>
                <div className="flex gap-4">
                    <span className="text-cyan-400/40">v2.4.0 Platinum Edition</span>
                </div>
            </footer>
        </main>
      </div>
      
      <CommandPalette />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .cyan-glow {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.1);
        }
      `}</style>
    </div>
  )
}

export default AdminLayout




