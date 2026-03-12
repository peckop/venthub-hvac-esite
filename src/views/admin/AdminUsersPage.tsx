import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useRouter, usePathname } from 'next/navigation'
import { Crown, Shield, ShieldCheck, Users, AlertCircle, Package, Tag, Eye, SearchX } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAdminUsers, setUserAdminRole } from '../../config/admin'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminTableHeadCellClass, 
  adminTableCellClass, 
  adminTableContainerClass 
} from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDate } from '../../i18n/datetime'
import { useRole } from '../../hooks/useRole'
import { useDragScroll } from '../../hooks/useDragScroll'

interface AdminUser {
  id: string
  email: string
  full_name?: string | null
  phone?: string | null
  role: string
  created_at: string
  updated_at: string
}

interface AllUser {
  id: string
  email: string
  full_name?: string | null
  created_at: string
  role?: string
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t: _t, lang } = useI18n()
  const pathname = usePathname()

  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'admins' | 'all'>('admins')

  const { role, canWrite } = useRole()
  const hasWriteAccess = canWrite('users')
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  // Use the global role state instead of local checks
  useEffect(() => {
    setIsAdmin(!!role && (role === 'super_admin' || role === 'admin'))
  }, [role])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/admin/users')
      return
    }
  }, [user, loading, router])

  // Admin kullanıcıları yükle
  useEffect(() => {
    async function loadAdminUsers() {
      if (!isAdmin || !user) return

      try {
        setIsLoading(true)
        const data = await listAdminUsers()
        // Admin user profillerini manuel join ile genişlet (şirket adı vb. için)
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', data.map(u => u.id))

        const enrichedAdmins = data.map(u => ({
          ...u,
          full_name: profiles?.find(p => p.id === u.id)?.full_name || u.full_name
        }))

        setAdminUsers(enrichedAdmins as AdminUser[])
      } catch (error) {
        console.error('Admin users load error:', error)
        toast.error(_t('admin.users.toasts.adminsLoadFailed') as string)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminUsers()
  }, [isAdmin, user, _t, pathname])

  // Tüm kullanıcıları yükle
  useEffect(() => {
    async function loadAllUsers() {
      if (!isAdmin || !user || activeTab !== 'all') return

      try {
        setIsLoading(true)
        // Proaktif oturum kontrolü
        await ensureSessionFresh()

        // user_profiles tablosundan tüm kullanıcıları getir
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, role, created_at, full_name')

        if (profileError) throw profileError

        setAllUsers(profiles as AllUser[])
      } catch (error) {
        console.error('All users load error:', error)
        toast.error(_t('admin.users.toasts.allLoadFailed') as string)
        setAllUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAllUsers()
  }, [isAdmin, user, activeTab, _t, pathname])

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer') => {
    if (!hasWriteAccess) {
      toast.error('Kullanıcı rolleri değiştirme yetkiniz yok.')
      return
    }

    try {
      setUpdatingRole(userId)

      const success = await setUserAdminRole(userId, newRole)

      if (success) {
        // Audit log
        try {
          const { logAdminAction } = await import('../../lib/audit')
          await logAdminAction(supabase, {
            table_name: 'user_profiles',
            row_pk: userId,
            action: 'UPDATE',
            before: { role: (allUsers.find(u => u.id === userId)?.role || 'user') },
            after: { role: newRole },
            comment: 'role change'
          })
        } catch { }

        toast.success(_t('admin.users.toasts.roleUpdated', { role: newRole }) as string)

        // Local state güncelle
        setAllUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ))

        // Admin listesini yeniden yükle
        const data = await listAdminUsers()
        setAdminUsers(data as AdminUser[])
      } else {
        toast.error(_t('admin.users.toasts.roleNotUpdated') as string)
      }
    } catch (error) {
      console.error('Role update error:', error)
      toast.error(_t('admin.users.toasts.roleUpdateError') as string)
    } finally {
      setUpdatingRole(null)
    }
  }

  const filteredAdminUsers = adminUsers.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAllUsers = allUsers.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleIcon = (roleCode: string) => {
    switch (roleCode) {
      case 'super_admin': return <Crown className="text-purple-400" size={14} />
      case 'admin': return <Shield className="text-indigo-400" size={14} />
      case 'warehouse':
      case 'sales': return <ShieldCheck className="text-cyan-400" size={14} />
      default: return <Users className="text-slate-500" size={14} />
    }
  }

  // Görünür kolonlar ve yoğunluk
  const STORAGE_KEY = 'toolbar:users'
  const [visibleCols, setVisibleCols] = useState<{ user: boolean; role: boolean; created: boolean; actions: boolean }>({ user: true, role: true, created: true, actions: true })
  const [density, setDensity] = useState<Density>('comfortable')

  useEffect(() => {
    try {
      const c = localStorage.getItem(`${STORAGE_KEY}:cols`)
      if (c) setVisibleCols(prev => ({ ...prev, ...JSON.parse(c) }))
      const d = localStorage.getItem(`${STORAGE_KEY}:density`)
      if (d === 'compact' || d === 'comfortable') setDensity(d as Density)
    } catch { }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols))
    } catch { }
  }, [visibleCols])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}:density`, density)
    } catch { }
  }, [density])

  const headPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-4'
  const cellPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-4'

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-xl shadow-red-500/5">
          <AlertCircle className="text-red-500" size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{_t('admin.ui.accessDeniedTitle')}</h2>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">{_t('admin.ui.accessDeniedDesc')}</p>
        </div>
      </div>
    )
  }

  const UserAvatar = ({ name, email }: { name?: string, email?: string }) => {
    const initial = (name || email || '?').charAt(0).toUpperCase()
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-cyan-400 font-black border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
        {initial}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={adminSectionTitleClass}>{_t('admin.titles.users')}</h2>
          <p className={adminSubtitleClass}>{_t('admin.users.subtitle') || 'Sistem kullanıcılarını ve rollerini yönetin.'}</p>
        </div>

        <div className="flex glass bg-white/5 p-1 rounded-2xl w-fit border border-white/10 shadow-2xl">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'admins'
              ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            {_t('admin.users.tabs.admins', { count: adminUsers.length })}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'all'
              ? 'bg-cyan-400 text-[#0A0F1E] shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            {_t('admin.users.tabs.all', { count: allUsers.length })}
          </button>
        </div>
      </div>

      <AdminToolbar
        storageKey="toolbar:users"
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: _t('admin.users.searchPlaceholder') || 'E-posta, isim, şirket veya VKN ile ara...',
          focusShortcut: '/'
        }}
        recordCount={(activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length}
        rightExtra={(
          <ColumnsMenu
            columns={[
              { key: 'user', label: _t('admin.users.table.user') || 'Kullanıcı', checked: visibleCols.user, onChange: (v) => setVisibleCols(s => ({ ...s, user: v })) },
              { key: 'role', label: _t('admin.users.table.role') || 'Rol', checked: visibleCols.role, onChange: (v) => setVisibleCols(s => ({ ...s, role: v })) },
              { key: 'created', label: _t('admin.users.table.created') || 'Kayıt', checked: visibleCols.created, onChange: (v) => setVisibleCols(s => ({ ...s, created: v })) },
              { key: 'actions', label: _t('admin.users.table.actions') || 'Aksiyonlar', checked: visibleCols.actions, onChange: (v: boolean) => setVisibleCols(s => ({ ...s, actions: v })) }
            ]}
            density={density}
            onDensityChange={setDensity}
          />
        )}
      />

      <div className={adminTableContainerClass}>
        <div ref={dragScrollRef} className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="glass-strong">
                {visibleCols.user && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.user') || 'Kullanıcı'}</th>)}
                {visibleCols.role && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.role') || 'Rol'}</th>)}
                {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.created') || 'Kayıt'}</th>)}
                {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} text-center`}>{_t('admin.users.table.actions') || 'İşlem'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <AdminSkeleton variant="table" count={5} rows={8} />
                  </td>
                </tr>
              ) : (activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <AdminEmptyState
                      icon={SearchX}
                      title="Sonuç bulunamadı"
                      description={searchQuery ? `"${searchQuery}" araması için hiçbir kullanıcı eşleşmedi.` : "Bu listede henüz herhangi bir kayıt bulunmuyor."}
                      action={searchQuery ? { label: 'Aramayı sıfırla', onClick: () => setSearchQuery('') } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                (activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).map((userItem) => (
                  <tr key={userItem.id} className="group hover:bg-white/[0.02] transition-colors duration-300">
                    {visibleCols.user && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-4">
                          <UserAvatar name={userItem.full_name || undefined} email={userItem.email} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-slate-100 truncate uppercase tracking-tight">{userItem.email || "—"}</span>
                            {userItem.full_name && (
                              <span className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-widest mt-0.5">{userItem.full_name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleCols.role && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-white/5 text-[10px] font-black uppercase tracking-widest shadow-lg group-hover:border-cyan-400/30 transition-all duration-500">
                          {getRoleIcon(userItem.role || 'user')}
                          <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">{_t(`roles.${userItem.role || 'user'}`)}</span>
                        </div>
                      </td>
                    )}

                    {visibleCols.created && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-black text-xs tabular-nums tracking-tight">
                            {formatDate(userItem.created_at, lang)}
                          </span>
                          <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-0.5">Katılım</span>
                        </div>
                      </td>
                    )}

                    {visibleCols.actions && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          {userItem.role !== 'super_admin' && role === 'super_admin' && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'super_admin')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all active:scale-95"
                              title={_t('roles.super_admin') || "Süperadmin yap"}
                            >
                              <Crown size={14} />
                            </button>
                          )}
                          {userItem.role !== 'admin' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'admin')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/50 transition-all active:scale-95"
                              title={_t('roles.admin') || "Admin yap"}
                            >
                              <Shield size={14} />
                            </button>
                          )}
                          {userItem.role !== 'warehouse' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'warehouse')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-orange-400 hover:bg-orange-400/10 hover:border-orange-400/50 transition-all active:scale-95"
                              title={_t('roles.warehouse') || "Depo yetkisi ver"}
                            >
                              <Package size={14} />
                            </button>
                          )}
                          {userItem.role !== 'sales' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'sales')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50 transition-all active:scale-95"
                              title={_t('roles.sales') || "Satış yetkisi ver"}
                            >
                              <Tag size={14} />
                            </button>
                          )}
                          {userItem.role !== 'viewer' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'viewer')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all active:scale-95"
                              title={_t('roles.viewer') || "İzleyici yetkisi ver"}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {userItem.role !== 'user' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'user')}
                              disabled={updatingRole === userItem.id || userItem.id === user?.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                              title={_t('roles.user') || "Normal kullanıcı yap"}
                            >
                              <Users size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bilgilendirme Kartı */}
      <div className="glass-strong p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-cyan-400/10 transition-colors duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-[1.5rem] glass-strong border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-700">
            <Shield size={32} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-white text-xl uppercase tracking-tight tracking-widest">{_t('admin.users.info.title') || 'Rol Yetkilendirme Rehberi'}</h4>
            <p className="text-slate-500 text-sm mt-2 mb-8 font-bold uppercase tracking-[0.15em]">{_t('admin.users.info.subtitle') || 'Sistem güvenliği için rollerin yetki seviyelerini kontrol edin.'}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-400/30 transition-all duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-amber-500 group-hover/item:scale-110 transition-transform"><Crown size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Süperadmin</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">Tüm sistem ayarlarına ve rol yönetimine tam erişim.</p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-400/30 transition-all duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-transform"><Shield size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Admin</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">Ürün, sipariş ve içerik yönetimi için yetki.</p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-400/30 transition-all duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-orange-400 group-hover/item:scale-110 transition-transform"><Package size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Depo</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">Stok yönetimi ve envanter hareketleri yetkisi.</p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-400/30 transition-all duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform"><Tag size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Satış</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">Sipariş, kargo, iade ve kupon yönetimi yetkisi.</p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:border-cyan-400/30 transition-all duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform"><Eye size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">İzleyici</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">Tüm modülleri salt-okunur (view-only) yetkisi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}




