import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { isAdminByEmail } from '../../config/admin'
import AccessDenied from '../../components/admin/AccessDenied'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
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
  Package,
  Tags,
  Ticket,
  Truck,
  Menu,
  X
} from 'lucide-react'
import CommandPalette from '../../components/admin/CommandPalette'
import AdminRealtimeNotifications from '../../components/admin/AdminRealtimeNotifications'

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { role, canAccess, loading: roleLoading } = useRole()
  const router = useRouter()
  const { t } = useI18n()

  const loading = authLoading || roleLoading

  // 1. Email Fallback Check (Immediate bypass)
  const isEmailAdmin = user?.email ? isAdminByEmail(user.email) : false

  useEffect(() => {
    // Wait for both auth and role to load, but email bypass can happen
    if (loading) return

    // If no user at all, redirect to home
    if (!user) {
      router.replace('/')
      return
    }

    // Email admin'ler her zaman erişir
    if (isEmailAdmin) return

    // Check if user has admin role access
    // Next.js 15+ navigation senkronizasyonu için bir kez daha rol kontrolü
    const hasAccess = canAccess(pathname ?? '')
    if (!hasAccess && role !== undefined) {
      // Sadece rol bilgisi kesinleşmişse (undefined değilse) kararı uygula
      // router.replace('/') // AccessDenied zaten render ediliyor
    }
  }, [loading, user, pathname, canAccess, router, isEmailAdmin, role])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    )
  }

  // Final check for render
  if (!isEmailAdmin && !canAccess(pathname ?? '')) {
    return <AccessDenied />
  }

  const navGroups = [
    { label: t('admin.menu.groupMain'), items: [{ href: '/admin', label: t('admin.menu.dashboard'), icon: BarChart3 }] },
    { label: t('admin.menu.groupSales'), items: [
        { href: '/admin/orders', label: t('admin.menu.orders'), icon: ShoppingCart },
        { href: '/admin/logistics', label: t('admin.menu.logistics'), icon: Truck },
        { href: '/admin/returns', label: t('admin.menu.returns'), icon: Undo2 },
        { href: '/admin/coupons', label: t('admin.menu.coupons'), icon: Ticket },
    ]},
    { label: t('admin.menu.groupCatalog'), items: [
        { href: '/admin/products', label: t('admin.menu.products'), icon: Package },
        { href: '/admin/categories', label: t('admin.menu.categories'), icon: Tags },
    ]},
    { label: t('admin.menu.groupStock'), items: [
        { href: '/admin/inventory', label: t('admin.menu.inventory'), icon: PackageSearch },
        { href: '/admin/movements', label: t('admin.menu.movements'), icon: ArrowRightLeft },
    ]},
    { label: t('admin.menu.groupSystem'), items: [
        { href: '/admin/users', label: t('admin.menu.users'), icon: Users },
        { href: '/admin/settings', label: t('admin.menu.settings'), icon: Settings },
        { href: '/admin/audit-logs', label: t('admin.menu.logs'), icon: FileText },
    ]},
  ]

  return (
    <div className="h-screen flex flex-col font-sans bg-[#0A0F1E] text-slate-200 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-navy/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-secondary-blue/10 blur-[100px] rounded-full opacity-30" />
      </div>

      <header className="h-16 flex-none border-b border-white/5 bg-[#0A0F1E]/60 backdrop-blur-xl relative z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-cyan-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Webhook size={20} className="text-cyan-400" />
            </div>
            <h1 className="text-lg font-bold text-white">Vent<span className="text-slate-500">Hub</span></h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <AdminRealtimeNotifications />
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold">
            {(user?.user_metadata?.first_name?.[0] || 'A').toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar KatmanÄ± */}
        <aside className={`
          absolute lg:relative inset-y-0 left-0 z-40 w-[280px] bg-[#0A0F1E] border-r border-white/5 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          <nav className="h-full overflow-y-auto p-4 space-y-8 py-8 custom-scrollbar">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-3 opacity-60">{group.label}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all rounded-xl ${
                        pathname === item.href ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                      onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    >
                      <item.icon size={18} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Ana Ä°Ã§erik KatmanÄ± */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col bg-white/[0.02]">
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8">
                {children}
            </div>
            <footer className="px-8 py-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest flex justify-between opacity-50 border-t border-white/5">
                <span>Â© 2026 VentHub Platinum</span>
                <span className="text-cyan-400/40">Secure Node</span>
            </footer>
        </main>
      </div>
      
      <CommandPalette />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default AdminLayout
