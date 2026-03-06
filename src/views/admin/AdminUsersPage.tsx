import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { useRouter, usePathname } from 'next/navigation'
import { Crown, Shield, ShieldCheck, Users, AlertCircle, Package, Tag, Eye, SearchX } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAdminUsers, setUserAdminRole } from '../../config/admin'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { useI18n } from '../../i18n/I18nProvider'
import { formatDate } from '../../i18n/datetime'
import { useRole } from '../../hooks/useRole'

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
      case 'super_admin': return <Crown className="text-purple-600" size={14} />
      case 'admin': return <Shield className="text-indigo-600" size={14} />
      case 'warehouse':
      case 'sales': return <ShieldCheck className="text-sky-600" size={14} />
      default: return <Users className="text-slate-500" size={14} />
    }
  }

  const getRoleColor = (roleCode: string): string => {
    switch (roleCode) {
      case 'super_admin': return 'bg-purple-50 text-purple-700 border-purple-200/50 ring-1 ring-purple-600/10'
      case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200/50 ring-1 ring-indigo-600/10'
      case 'warehouse':
      case 'sales': return 'bg-sky-50 text-sky-700 border-sky-200/50 ring-1 ring-sky-600/10'
      default: return 'bg-slate-50 text-slate-600 border-slate-200/50 ring-1 ring-slate-500/10'
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
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="text-red-600" size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">{_t('admin.ui.accessDeniedTitle')}</h2>
          <p className="text-slate-500 mt-1 max-w-sm">{_t('admin.ui.accessDeniedDesc')}</p>
        </div>
      </div>
    )
  }

  const UserAvatar = ({ name, email }: { name?: string, email?: string }) => {
    const initial = (name || email || '?').charAt(0).toUpperCase()
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0">
        {initial}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={adminSectionTitleClass}>{_t('admin.titles.users')}</h2>
          <p className="text-sm text-slate-500">{_t('admin.users.subtitle') || 'Sistem kullanıcılarını ve rollerini yönetin.'}</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'admins'
              ? 'bg-white text-primary-navy shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {_t('admin.users.tabs.admins', { count: adminUsers.length })}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all'
              ? 'bg-white text-primary-navy shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
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

      {isLoading && (activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  {visibleCols.user && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.user') || 'Kullanıcı'}</th>)}
                  {visibleCols.role && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.role') || 'Rol'}</th>)}
                  {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.created') || 'Kayıt'}</th>)}
                  {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>{_t('admin.users.table.actions') || 'Aksiyonlar'}</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="p-0">
                    <AdminSkeleton variant="table" count={5} rows={8} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6">
          <AdminEmptyState
            icon={SearchX}
            title="Sonuç bulunamadı"
            description={searchQuery ? `"${searchQuery}" araması için hiçbir kullanıcı eşleşmedi.` : "Bu listede henüz herhangi bir kayıt bulunmuyor."}
            action={searchQuery ? { label: 'Aramayı sıfırla', onClick: () => setSearchQuery('') } : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  {visibleCols.user && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.user') || 'Kullanıcı'}</th>)}
                  {visibleCols.role && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.role') || 'Rol'}</th>)}
                  {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}>{_t('admin.users.table.created') || 'Kayıt'}</th>)}
                  {visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad} text-right`}>{_t('admin.users.table.actions') || 'Aksiyonlar'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/50 transition-colors group">
                    {visibleCols.user && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={userItem.full_name || undefined} email={userItem.email} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 truncate">{userItem.email || "—"}</span>
                            {userItem.full_name && (
                              <span className="text-xs text-slate-500 font-medium truncate">{userItem.full_name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                    )}



                    {visibleCols.role && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getRoleColor(userItem.role || 'user')}`}>
                          {getRoleIcon(userItem.role || 'user')}
                          {_t(`roles.${userItem.role || 'user'}`)}
                        </div>
                      </td>
                    )}

                    {visibleCols.created && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium">
                            {formatDate(userItem.created_at, lang)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Tarihinde katıldı</span>
                        </div>
                      </td>
                    )}

                    {visibleCols.actions && (
                      <td className={`${adminTableCellClass} ${cellPad} text-right`}>
                        <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {userItem.role !== 'super_admin' && role === 'super_admin' && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'super_admin')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-rose-50 text-rose-600 border-rose-200/50 hover:bg-rose-100 mt-1 mb-1"
                              title={_t('roles.super_admin') || "Süperadmin yap"}
                            >
                              <Crown size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {userItem.role !== 'admin' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'admin')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-indigo-50 text-indigo-600 border-indigo-200/50 hover:bg-indigo-100 mt-1 mb-1"
                              title={_t('roles.admin') || "Admin yap"}
                            >
                              <Shield size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {userItem.role !== 'warehouse' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'warehouse')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-orange-50 text-orange-600 border-orange-200/50 hover:bg-orange-100 mt-1 mb-1"
                              title={_t('roles.warehouse') || "Depo yetkisi ver"}
                            >
                              <Package size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {userItem.role !== 'sales' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'sales')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-blue-50 text-blue-600 border-blue-200/50 hover:bg-blue-100 mt-1 mb-1"
                              title={_t('roles.sales') || "Satış yetkisi ver"}
                            >
                              <Tag size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {userItem.role !== 'viewer' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'viewer')}
                              disabled={updatingRole === userItem.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100 mt-1 mb-1"
                              title={_t('roles.viewer') || "İzleyici yetkisi ver"}
                            >
                              <Eye size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {userItem.role !== 'user' && (role === 'super_admin' || role === 'admin') && (
                            <button
                              onClick={() => handleRoleChange(userItem.id, 'user')}
                              disabled={updatingRole === userItem.id || userItem.id === user?.id || !hasWriteAccess || (userItem.role === 'super_admin' && role !== 'super_admin')}
                              className="inline-flex justify-center items-center w-8 h-8 rounded-md border transition-all disabled:opacity-50 shadow-sm bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 mt-1 mb-1"
                              title={_t('roles.user') || "Normal kullanıcı yap"}
                            >
                              <Users size={14} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Bilgilendirme Kartı */}
      <div className="bg-gradient-to-br from-primary-navy to-secondary-blue p-6 rounded-2xl shadow-lg shadow-blue-900/10 text-white flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
          <Shield className="text-white" size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-white text-lg">{_t('admin.users.info.title') || 'Rol Yetkilendirme Rehberi'}</h4>
          <p className="text-blue-100/80 text-sm mt-1 mb-4 italic">Sistem güvenliği için rollerin yetki seviyelerini kontrol edin.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Süperadmin</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">Tüm sistem ayarlarına ve rol yönetimine tam erişim.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-indigo-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Admin</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">Ürün, sipariş ve içerik yönetimi için standart yönetim yetkisi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-orange-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Depo</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">Stok yönetimi, envanter hareketleri ve depo ayarları yetkisi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={14} className="text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Satış</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">Sipariş, kargo, iade ve kupon yönetimi yetkisi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={14} className="text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">İzleyici</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">Tüm modülleri salt-okunur olarak görüntüleme yetkisi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




