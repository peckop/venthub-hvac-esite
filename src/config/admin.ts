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
  'recepvarlk@gmail.com',
  // Acil durum için e-postalar
]

function isProdEnv(): boolean {
  try {
    // Next.js & Node environment
    if (process.env.NODE_ENV === 'production') return true

    // Hostname bazlı koruma (Cloudflare Pages vs)
    if (typeof window !== 'undefined') {
      const h = window.location.hostname
      if (h.endsWith('pages.dev') || /venthub-hvac-esite/i.test(h)) return true
    }
  } catch { }
  return false
}

/**
 * Database'den kullanıcı rolünü getir
 * @param userId Kullanıcı ID
 * @param userEmail Opsiyonel email (fallback için)
 */
export async function getUserRole(userId: string, userEmail?: string): Promise<string> {
  // 1. Email Fallback (En yüksek öncelikli güvenlik ağı)
  if (userEmail && isAdminByEmail(userEmail)) {
    // Özel superadmin emailleri kontrolü
    if (userEmail === 'recep.varlik@gmail.com' || userEmail === 'recepvarlk@gmail.com') {
      return 'super_admin'
    }
    return 'admin'
  }

  try {
    const { supabase } = await import('../lib/supabase')
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('getUserRole error:', error)
      // Hata durumunda email kontrolü (parametre gelmemişse auth'tan çekmeyi dene)
      return 'user'
    }

    if (data?.role) return data.role

    // 2. Database'de kayıt yoksa ama email listedeyse (yeni admin kaydı durumu)
    if (userEmail && isAdminByEmail(userEmail)) return 'admin'

    return 'user'
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
  return ['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'].includes(role)
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
  const isDev = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
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

  // Lokal geliştirmede tam yetki
  const lowerEmail = user.email.toLowerCase()
  if (process.env.NODE_ENV === 'development') {
    if (lowerEmail === 'recep.varlik@gmail.com' || lowerEmail.includes('alize') || lowerEmail.includes('admin')) {
      return true
    }
  }

  // 1) Email Fallback (En yüksek öncelikli güvenlik ağı - her zaman çalışmalı)
  if (isAdminByEmail(user.email)) return true

  // 2) Supabase metadata rolü
  const metadataRole = user.user_metadata?.role
  if (metadataRole && ['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'].includes(metadataRole)) {
    return true
  }

  // 3) Lokal dev fallback
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
      const { ensureSessionFresh } = await import('../lib/ensureSessionFresh')
      await ensureSessionFresh()
      const isAdmin = await isUserAdminAsync(user.id)
      if (isAdmin) return true
    } catch (error) {
      console.warn('Database admin check failed:', error)
    }
  }

  // 2) Email Fallback (Her zaman izin ver)
  if (user.email && isAdminByEmail(user.email)) return true

  // 3) Lokal dev fallback
  if (isDevAdmin()) return true

  return false
}

/**
 * Kullanıcıya admin rolü ata (sadece client tarafında bilgi için)
 * Gerçek database güncellemesi için admin paneli gerekir
 */
export async function setUserAdminRole(userId: string, role: string): Promise<boolean> {
  try {
    const { supabase } = await import('../lib/supabase')
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
    const { ensureSessionFresh } = await import('../lib/ensureSessionFresh')
    await ensureSessionFresh()
    const { supabase } = await import('../lib/supabase')
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



