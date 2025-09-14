import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Crown, CheckCircle, AlertCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkAdminAccess, listAdminUsers, setUserAdminRole, getUserRole } from '../../config/admin'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import ColumnsMenu, { Density } from '../../components/admin/ColumnsMenu'
import { useI18n } from '../../i18n/I18nProvider'

interface AdminUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: string
  created_at: string
  updated_at: string
}

interface AllUser {
  id: string
  email: string
  created_at: string
  role?: string
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'admins' | 'all'>('admins')
  const [actorRole, setActorRole] = useState<'user'|'moderator'|'admin'|'superadmin'>('user')

  // Admin kontrolü
  useEffect(() => {
    setIsAdmin(checkAdminAccess(user))
  }, [user])

  // Aktör rolünü yükle (yetki kontrolleri için)
  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const role = await getUserRole(user.id)
          if (role === 'superadmin' || role === 'admin' || role === 'moderator') {
            setActorRole(role as 'user'|'moderator'|'admin'|'superadmin')
          } else {
            setActorRole('user')
          }
        }
      } catch {}
    })()
  }, [user?.id])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login', { replace: true, state: { from: { pathname: '/admin/users' } } })
      return
    }
  }, [user, loading, navigate])

  // Admin kullanıcıları yükle
  useEffect(() => {
    async function loadAdminUsers() {
      if (!isAdmin || !user) return
      
      try {
        setIsLoading(true)
        const data = await listAdminUsers()
        setAdminUsers(data)
      } catch (error) {
        console.error('Admin users load error:', error)
        toast.error('Admin kullanıcıları yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminUsers()
  }, [isAdmin, user])

  // Tüm kullanıcıları yükle
  useEffect(() => {
    async function loadAllUsers() {
      if (!isAdmin || !user || activeTab !== 'all') return
      
      try {
        setIsLoading(true)
        
        // auth.users tablosundan tüm kullanıcıları getir
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
          // Fallback: user_profiles üzerinden
          const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, role, created_at')
          
          if (profileError) throw profileError
          
          const { data: users, error: usersError } = await supabase
            .from('auth.users')
            .select('id, email, created_at')
          
          if (usersError) {
            throw new Error('Kullanıcı listesi alınamadı. Bu özellik sadece admin API key ile çalışır.')
          }
          
          // Manuel join
          const combined = users?.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            role: profiles?.find(p => p.id === u.id)?.role || 'user'
          })) || []
          
          setAllUsers(combined)
        } else {
          // Admin API ile users listesi alındı
          const userList = authUsers.users.map(u => ({
            id: u.id,
            email: u.email || 'No email',
            created_at: u.created_at,
            role: 'user' // Default, profile'dan güncellenecek
          }))
          
          // Profile bilgilerini al
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, role')
          
          // Role bilgilerini birleştir
          const combined = userList.map(u => ({
            ...u,
            role: profiles?.find(p => p.id === u.id)?.role || 'user'
          }))
          
          setAllUsers(combined)
        }
      } catch (error) {
        console.error('All users load error:', error)
        toast.error('Kullanıcı listesi yüklenemedi')
        setAllUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAllUsers()
  }, [isAdmin, user, activeTab])

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    if (!isAdmin) return
    
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
        } catch {}

        toast.success(`Kullanıcı rolü "${newRole}" olarak güncellendi`)
        
        // Local state güncelle
        setAllUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ))
        
        // Admin listesini yeniden yükle
        if (newRole === 'admin' || newRole === 'moderator') {
          const data = await listAdminUsers()
          setAdminUsers(data)
        }
      } else {
        toast.error('Role güncellenemedi')
      }
    } catch (error) {
      console.error('Role update error:', error)
      toast.error('Role güncelleme hatası')
    } finally {
      setUpdatingRole(null)
    }
  }

  const filteredAdminUsers = adminUsers.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAllUsers = allUsers.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="text-purple-700" size={16} />
      case 'admin': return <Crown className="text-yellow-600" size={16} />
      case 'moderator': return <CheckCircle className="text-blue-600" size={16} />
      default: return <Users className="text-gray-600" size={16} />
    }
  }

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  // Görünür kolonlar ve yoğunluk (erken - hooks unconditional)
  const STORAGE_KEY = 'toolbar:users'
  const [visibleCols, setVisibleCols] = useState<{ user: boolean; role: boolean; created: boolean; actions: boolean }>({ user: true, role: true, created: true, actions: true })
  const [density, setDensity] = useState<Density>('comfortable')
  useEffect(()=>{ try { const c=localStorage.getItem(`${STORAGE_KEY}:cols`); if(c) setVisibleCols(prev=>({ ...prev, ...JSON.parse(c) })); const d=localStorage.getItem(`${STORAGE_KEY}:density`); if(d==='compact'||d==='comfortable') setDensity(d as Density) } catch{} },[])
  useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:cols`, JSON.stringify(visibleCols)) } catch{} }, [visibleCols])
  useEffect(()=>{ try { localStorage.setItem(`${STORAGE_KEY}:density`, density) } catch{} }, [density])
  const headPad = density==='compact' ? 'px-2 py-2' : ''
  const cellPad = density==='compact' ? 'px-2 py-2' : ''

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Erişim Reddedildi</h2>
          <p className="text-steel-gray mt-2">Bu sayfaya erişmek için admin yetkisi gerekiyor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={adminSectionTitleClass}>{_t('admin.titles.users')}</h2>
      </div>

      {/* Tabs */}
      <div className={`${adminCardClass} p-3 flex gap-2`}>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'admins'
              ? 'bg-primary-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Admin Kullanıcılar ({adminUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-primary-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tüm Kullanıcılar ({allUsers.length})
        </button>
      </div>

      {/* Arama */}
      <AdminToolbar
        storageKey="toolbar:users"
        search={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'E-posta veya isim ile ara', focusShortcut: '/' }}
        recordCount={(activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).length}
        rightExtra={(
          <ColumnsMenu
            columns={[
              { key: 'user', label: 'Kullanıcı', checked: visibleCols.user, onChange: (v)=>setVisibleCols(s=>({ ...s, user: v })) },
              { key: 'role', label: 'Role', checked: visibleCols.role, onChange: (v)=>setVisibleCols(s=>({ ...s, role: v })) },
              { key: 'created', label: 'Kayıt Tarihi', checked: visibleCols.created, onChange: (v)=>setVisibleCols(s=>({ ...s, created: v })) },
              ...(activeTab==='all' ? [{ key: 'actions', label: 'İşlemler', checked: visibleCols.actions, onChange: (v: boolean)=>setVisibleCols(s=>({ ...s, actions: v })) }] : [])
            ]}
            density={density}
            onDensityChange={setDensity}
          />
        )}
      />

      {/* İçerik */}
      {isLoading ? (
        <div className={`${adminCardClass} min-h-[20vh] flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy"/>
        </div>
      ) : (
        <div className={`${adminCardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {visibleCols.user && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Kullanıcı</th>)}
                  {visibleCols.role && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Role</th>)}
                  {visibleCols.created && (<th className={`${adminTableHeadCellClass} ${headPad}`}>Kayıt Tarihi</th>)}
                  {activeTab === 'all' && visibleCols.actions && <th className={`${adminTableHeadCellClass} ${headPad}`}>İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).map((userItem, index) => (
                  <tr key={userItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    {visibleCols.user && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className="flex flex-col">
                          <span className="font-medium text-industrial-gray">{userItem.email}</span>
                          {'full_name' in userItem && userItem.full_name && (
                            <span className="text-xs text-steel-gray">{String(userItem.full_name)}</span>
                          )}
                          {'phone' in userItem && userItem.phone && (
                            <span className="text-xs text-steel-gray">{String(userItem.phone)}</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleCols.role && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getRoleColor(userItem.role || 'user')}`}>
                          {getRoleIcon(userItem.role || 'user')}
                          {userItem.role || 'user'}
                        </div>
                      </td>
                    )}
                    {visibleCols.created && (
                      <td className={`${adminTableCellClass} ${cellPad}`}>
                        <span className="text-steel-gray">
                          {new Date(userItem.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                    )}
                    {activeTab === 'all' && visibleCols.actions && (
                      <td className={`px-4 ${density==='compact'?'py-2':'py-3'}`}>
                        <div className="flex gap-1">
                          {/* Süperadmin'i yalnızca süperadmin değiştirebilir; kendi rolünü değiştiremeyecek */}
                          {!(userItem.role === 'superadmin' && (actorRole !== 'superadmin' || userItem.id === user?.id)) && (
                            <>
                              {userItem.role !== 'superadmin' && actorRole === 'superadmin' && userItem.id !== user?.id && (
                                <button
                                  onClick={() => handleRoleChange(userItem.id, 'superadmin')}
                                  disabled={updatingRole === userItem.id}
                                  className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                  title="Superadmin yap"
                                >
                                  Superadmin
                                </button>
                              )}
                              {userItem.role !== 'admin' && (
                                <button
                                  onClick={() => handleRoleChange(userItem.id, 'admin')}
                                  disabled={updatingRole === userItem.id}
                                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                                  title="Admin yap"
                                >
                                  {updatingRole === userItem.id ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    'Admin'
                                  )}
                                </button>
                              )}
                              {userItem.role !== 'moderator' && (
                                <button
                                  onClick={() => handleRoleChange(userItem.id, 'moderator')}
                                  disabled={updatingRole === userItem.id}
                                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                  title="Moderator yap"
                                >
                                  Mod
                                </button>
                              )}
                              {userItem.role !== 'user' && (
                                <button
                                  onClick={() => handleRoleChange(userItem.id, 'user')}
                                  disabled={updatingRole === userItem.id}
                                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                  title="Normal kullanıcı yap"
                                >
                                  User
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(activeTab === 'admins' ? filteredAdminUsers.length === 0 : filteredAllUsers.length === 0) && (
            <div className={`${adminCardClass} text-center py-8`}>
              <div className="text-steel-gray">
                {searchQuery 
                  ? 'Arama kriterine uygun kullanıcı bulunamadı.' 
                  : activeTab === 'admins' 
                    ? 'Henüz admin kullanıcı yok.'
                    : 'Kullanıcı listesi boş.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bilgilendirme */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={16} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Kullanıcı Role Sistemi</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Superadmin:</strong> Tüm yetkiler + rol atamaları (güvenlik amaçlı sınırlı görünürlük)</li>
              <li><strong>Admin:</strong> Tüm operasyon paneline erişim (stok, iadeler, kargo, kullanıcılar)</li>
              <li><strong>Moderator:</strong> Sınırlı admin yetkisi (stok ve iadeler)</li>
              <li><strong>User:</strong> Normal kullanıcı (sadece kendi hesap yönetimi)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
