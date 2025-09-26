/// <reference types="vite/client" />
// Admin Yapılandırması - Database Tabanlı Role Sistemi
// Bu dosya artik database'deki user_profiles.role kolunu kullanır


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

function isProdEnv(): boolean {
  try {
    // Vite
    try {
      // Vite build flag (vite/client types)
      if (import.meta?.env?.PROD) return true
    } catch {}
    
    // Hostname bazlı koruma (Cloudflare Pages vs)
    if (typeof window !== 'undefined') {
      const h = window.location.hostname
      if (h.endsWith('pages.dev') || /venthub-hvac-esite/i.test(h)) return true
    }
  } catch {}
  return false
}

/**
 * Database'den kullanıcı rolünü getir
 */
export async function getUserRole(userId: string): Promise<string> {
  try {
    const { getSupabase } = await import('../lib/supabase')
    const supabase = await getSupabase()
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
  return role === 'admin' || role === 'moderator' || role === 'superadmin'
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
  
  // 1) Supabase metadata rolü
  const metadataRole = user.user_metadata?.role
  if (metadataRole === 'admin' || metadataRole === 'moderator' || metadataRole === 'superadmin') {
    return true
  }
  
  // 2) Prod ortamında email fallback KAPALI
  if (isProdEnv()) return false
  
  // 3) Dev fallback: e-posta listesi
  if (isAdminByEmail(user.email)) return true
  
  // 4) Lokal geliştirme ortamı
  if (isDevAdmin()) return true
  
  return false
}

/**
 * Async admin kontrolü - Database'den gerçek role verisi
 * Daha güvenli ama yavaş (database query gerektirir)
 */
export async function checkAdminAccessAsync(user: { id?: string; email?: string } | null): Promise<boolean> {
  if (!user) return false
  
  // 1) DB'den gerçek rol kontrolü
  if (user.id) {
    try {
      const isAdmin = await isUserAdminAsync(user.id)
      if (isAdmin) return true
    } catch (error) {
      console.warn('Database admin check failed:', error)
    }
  }
  
  // 2) Prod ortamında fallback yok
  if (isProdEnv()) return false
  
  // 3) Dev fallback: e-posta listesi
  if (user.email && isAdminByEmail(user.email)) return true
  
  // 4) Lokal dev fallback
  if (isDevAdmin()) return true
  
  return false
}

/**
 * Kullanıcıya admin rolü ata (sadece client tarafında bilgi için)
 * Gerçek database güncellemesi için admin paneli gerekir
 */
export async function setUserAdminRole(userId: string, role: 'user' | 'admin' | 'moderator' | 'superadmin'): Promise<boolean> {
  try {
    const { getSupabase } = await import('../lib/supabase')
    const supabase = await getSupabase()
    // Database RPC (SECURITY DEFINER) – sunucu tarafında gerçek rol ataması
    const { data, error } = await supabase.rpc('set_user_admin_role', {
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
    const { getSupabase } = await import('../lib/supabase')
    const supabase = await getSupabase()
    // Güvenli RPC (SECURITY DEFINER + role kontrolü) – tek kaynak
    const rpcRes = await supabase.rpc('admin_list_users')
    const rpcErr = (rpcRes as { error?: unknown }).error
    if (rpcErr) {
      console.error('listAdminUsers RPC error:', rpcErr)
      return []
    }
    const rpcData = (rpcRes as { data?: AdminUser[] | null }).data || []
    return rpcData as AdminUser[]
  } catch (error) {
    console.error('listAdminUsers exception:', error)
    return []
  }
}
