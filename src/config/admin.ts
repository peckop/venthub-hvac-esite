/// <reference types="node" />
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
 * ⛔ SABİT E-POSTA ALLOWLIST'İ KALDIRILDI (T047, 2026-08-18) — geri EKLEME.
 *
 * Buradaki `FALLBACK_ADMIN_EMAILS` beş adres taşıyordu ve `getUserRole` içinde
 * DB'den ÖNCE çalışıyordu; ikisi de yönetici hesabına arayüzde `super_admin`
 * döndürüyordu, oysa tek otorite olması gereken `user_profiles.role` `admin` idi.
 * Üç kaynak (allowlist / `user_metadata` / profil) birbiriyle çelişiyordu.
 *
 * KALDIRMA GEREKÇESİ DÜZENLİLİK DEĞİL, ÖLÇÜLMÜŞ BİR AÇIK: listedeki
 * `admin@venthub.com`, `info@venthub.com`, `alize@venthub.com` adreslerinin
 * prod'da HİÇ HESABI YOKTU (2026-08-18 ölçümü). Yani liste, var olan kullanıcılara
 * yetki vermiyordu — HENÜZ KAYIT OLMAMIŞ adreslere ÖNCEDEN yetki veriyordu.
 * Bu üç adresten biriyle kayıt olan herkes anında yönetici olurdu. Depo ayrıca
 * 2026-08-15'ten beri PUBLIC, yani liste herkese görünürdü.
 *
 * Bugünkü tek otorite: `public.user_profiles.role`. JWT'ye `custom_access_token_hook`
 * onu `user_role` olarak yazar; `is_admin_user()` de yalnız onu okur
 * (migration 20260818081500_role_source_single_authority.sql).
 * Bekçi: INV-AUTH-ROLE (`src/__tests__/conformance/auth-role-source.test.ts`).
 */

/**
 * Database'den kullanıcı rolünü getir — TEK OTORİTE `user_profiles.role`.
 *
 * @param userId Kullanıcı ID
 */
export async function getUserRole(userId: string): Promise<string> {
  try {
    const { supabaseBrowserClient } = await import('../lib/supabase/client')
    const { supabaseStaticClient } = await import('../lib/supabase/static')
    const supabase = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient
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

    // Profil satırı yoksa rol YOK. Eskiden burada e-posta listesi devreye girip
    // 'admin' döndürüyordu — "yeni admin kaydı" senaryosu için. O yol, profili
    // olmayan birine yetki vermek demekti; doğru akış önce profil satırını
    // oluşturmaktır (admin panelindeki rol atama akışı).
    return 'user'
  } catch (error) {
    console.warn('getUserRole exception:', error)
    return 'user'
  }
}

/**
 * ⛔ `isAdminByEmail` KALDIRILDI (T047) — tek çağıranı `AdminLayout` idi ve orada
 * RBAC sayfa matrisini BAYPAS ediyordu (`if (!isEmailAdmin && !canAccess(path))`),
 * yani listedeki bir e-posta `rbac.ts`'in sayfa kurallarını tamamen atlıyordu.
 *
 * ⛔ `checkAdminAccess` KALDIRILDI (T047) — ÖLÜ KOD idi (depoda tek bir çağıranı
 * yoktu, testlerde de geçmiyordu) ama içinde üç ayrı fail-open yol taşıyordu:
 *   1. `NODE_ENV === 'development'` altında e-postası 'alize' ya da 'admin'
 *      İÇEREN herkese tam yetki (alt dize eşleşmesi — `admin@rakip.com` da geçerdi),
 *   2. e-posta allowlist'i,
 *   3. `user.user_metadata.role` — KULLANICININ KENDİ YAZABİLDİĞİ alan; bu,
 *      `is_admin_user()`'daki DB açığının istemci tarafındaki ikiziydi. DB dalını
 *      kapatıp bunu bırakmak, aynı kuralın yarısını kapatmak olurdu.
 *
 * Silmeden önce ölçüldü (kural: silinen yetenek ölü kod gibi saklanır) —
 * `grep` ile kaynak ve test ağacında sıfır çağıran doğrulandı.
 * Bekçi: INV-AUTH-ROLE R3/R4.
 */

/**
 * Kullanıcıya admin rolü ata (sadece client tarafında bilgi için)
 * Gerçek database güncellemesi için admin paneli gerekir
 */
export async function setUserAdminRole(userId: string, role: string): Promise<boolean> {
  try {
    const { supabaseBrowserClient } = await import('../lib/supabase/client')
    const { supabaseStaticClient } = await import('../lib/supabase/static')
    const supabase = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient
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
    const { supabaseBrowserClient } = await import('../lib/supabase/client')
    const { supabaseStaticClient } = await import('../lib/supabase/static')
    const supabase = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient
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



