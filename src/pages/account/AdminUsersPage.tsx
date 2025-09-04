import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Search, Crown, CheckCircle, AlertCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkAdminAccess, listAdminUsers, setUserAdminRole } from '../../config/admin'
import { adminSectionTitleClass, adminCardClass, adminTableHeadCellClass, adminTableCellClass } from '../../utils/adminUi'

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
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'admins' | 'all'>('admins')

  // Admin kontrolü
  useEffect(() => {
    setIsAdmin(checkAdminAccess(user))
  }, [user])

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
      case 'admin': return <Crown className="text-yellow-600" size={16} />
      case 'moderator': return <CheckCircle className="text-blue-600" size={16} />
      default: return <Users className="text-gray-600" size={16} />
    }
  }

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

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
        <h2 className={adminSectionTitleClass}>Kullanıcı Yönetimi</h2>
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
      <div className={`${adminCardClass} p-4 relative`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray" size={16} />
        <input
          type="text"
          placeholder="E-posta veya isim ile ara"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md pl-10 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
        />
      </div>

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
                  <th className={adminTableHeadCellClass}>Kullanıcı</th>
                  <th className={adminTableHeadCellClass}>Role</th>
                  <th className={adminTableHeadCellClass}>Kayıt Tarihi</th>
                  {activeTab === 'all' && <th className={adminTableHeadCellClass}>İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'admins' ? filteredAdminUsers : filteredAllUsers).map((userItem, index) => (
                  <tr key={userItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className={adminTableCellClass}>
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
                    <td className={adminTableCellClass}>
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getRoleColor(userItem.role || 'user')}`}>
                        {getRoleIcon(userItem.role || 'user')}
                        {userItem.role || 'user'}
                      </div>
                    </td>
                    <td className={adminTableCellClass}>
                      <span className="text-steel-gray">
                        {new Date(userItem.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    {activeTab === 'all' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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
