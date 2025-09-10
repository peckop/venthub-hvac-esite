// Admin Yapılandırması - Database Tabanlı Role Sistemi
// Bu dosya artik database'deki user_profiles.role kolunu kullanır

import { supabase } from '../lib/supabase'

/**
 * Admin user interface for type safety
 */
interface AdminUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: string
  created_at: string
  updated_at: string
}

/**
 * Production-ready admin email list
 * 
 * Admin rolleri artık database'den kontrol edilir:
 * - user_profiles.role = 'admin' olan kullanıcılar admin
 * - user_profiles.role = 'moderator' olan kullanıcılar sınırlı admin
 * - user_profiles.role = 'user' olan kullanıcılar normal kullanıcı
 * 
 * Fallback: E-posta tabanlı sistem (geliştirme veya acil durum)
 */
export const FALLBACK_ADMIN_EMAILS: string[] = [
  'admin@venthub.com',
  'info@venthub.com', 
  'alize@venthub.com',
  'recep.varlik@gmail.com',
  // Acil durum için e-postalar
]

/**
 * Database'den kullanıcı rolünü getir
 */
export async function getUserRole(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      
    if (error) {
      console.warn('getUserRole error:', error)
      return 'user'
    }
    
    return data?.role || 'user'
  } catch (error) {
    console.warn('getUserRole exception:', error)
    return 'user'
  }
}

/**
 * Database'den admin kontrolü (async)
 */
export async function isUserAdminAsync(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'moderator'
}

/**
 * E-posta tabanlı fallback admin kontrolü
 */
export function isAdminByEmail(email?: string): boolean {
  if (!email) return false
  return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Geliştirme ortamında admin kontrolü
 */
export function isDevAdmin(): boolean {
  const isDev = import.meta.env.DEV
  const isLocalhost = window.location.hostname === 'localhost'
  return isDev && isLocalhost
}

/**
 * Senkron admin kontrolü (cache tabанлı)
 * 
 * Bu fonksiyon önceki auth state'den role bilgisini kullanır.
 * Eğer role bilgisi yoksa fallback olarak e-posta kontrolü yapar.
 */
export function checkAdminAccess(user: { email?: string; user_metadata?: { role?: string } } | null): boolean {
  if (!user?.email) return false
  
  // 1. User metadata'dan role kontrolü (Supabase auth)
  const metadataRole = user.user_metadata?.role
  if (metadataRole === 'admin' || metadataRole === 'moderator') {
    return true
  }
  
  // 2. Fallback: E-posta tabanlı admin listesi
  if (isAdminByEmail(user.email)) return true
  
  // 3. Geliştirme ortamı fallback (opsiyonel)
  if (isDevAdmin()) return true
  
  return false
}

/**
 * Async admin kontrolü - Database'den gerçek role verisi
 * Daha güvenli ama yavaş (database query gerektirir)
 */
export async function checkAdminAccessAsync(user: { id?: string; email?: string } | null): Promise<boolean> {
  if (!user) return false
  
  // 1. Database'den role kontrolü
  if (user.id) {
    try {
      const isAdmin = await isUserAdminAsync(user.id)
      if (isAdmin) return true
    } catch (error) {
      console.warn('Database admin check failed:', error)
      // Continue to fallback methods
    }
  }
  
  // 2. Fallback: E-posta kontrolü
  if (user.email && isAdminByEmail(user.email)) return true
  
  // 3. Development fallback
  if (isDevAdmin()) return true
  
  return false
}

/**
 * Kullanıcıya admin rolü ata (sadece client tarafında bilgi için)
 * Gerçek database güncellemesi için admin paneli gerekir
 */
export async function setUserAdminRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<boolean> {
  try {
    // Bu database RPC fonksiyonunu çağırır (sadece service_role yetkisi ile)
    const { data, error } = await supabase.rpc('set_user_role', {
      user_id: userId,
      new_role: role
    }) as { data: unknown; error: unknown }
    
    if (error) {
      console.error('setUserAdminRole error:', error)
      return false
    }
    
    return data === true
  } catch (error) {
    console.error('setUserAdminRole exception:', error)
    return false
  }
}

/**
 * Admin kullanıcılarını listele (sadece admin'ler erişebilir)
 */
export async function listAdminUsers(): Promise<AdminUser[]> {
  try {
    // Öncelik: Güvenli RPC (SECURITY DEFINER + role kontrolü)
    const rpcRes = await supabase.rpc('admin_list_users')
    const rpcErr = (rpcRes as { error?: unknown }).error
    if (rpcErr) {
      // Geri dönüş: View (eski uygulamalar için)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
      if (error) {
        console.error('listAdminUsers error:', error)
        return []
      }
      return (data as AdminUser[] | null) || []
    }
    const rpcData = (rpcRes as { data?: AdminUser[] | null }).data || []
    return rpcData as AdminUser[]
  } catch (error) {
    console.error('listAdminUsers exception:', error)
    return []
  }
}
