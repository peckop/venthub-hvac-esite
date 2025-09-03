// Admin Yapılandırması
// Bu dosya sadece admin yetkilerine sahip e-posta adreslerini tanımlar

/**
 * VentHub Admin E-posta Adresleri
 * 
 * Sadece bu listede bulunan e-posta adresleri admin paneline erişebilir:
 * - Stok yönetimi
 * - İade yönetimi  
 * - Kargo operasyonları
 * 
 * Not: E-posta adresleri case-insensitive olarak kontrol edilir
 */
export const ADMIN_EMAILS: string[] = [
  'admin@venthub.com',
  'info@venthub.com', 
  'alize@venthub.com',
  // Kendi e-postanızı buraya ekleyin:
  // 'your-email@gmail.com',
  
  // Test için şirket e-postaları ekleyebilirsiniz:
  // 'test@company.com',
]

/**
 * Bir kullanıcının admin olup olmadığını kontrol eder
 */
export function isAdminUser(email?: string): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Geliştirme ortamında admin kontrolü
 * Production'da bu fonksiyon kullanılmaz
 */
export function isDevAdmin(): boolean {
  const isDev = import.meta.env.DEV
  const isLocalhost = window.location.hostname === 'localhost'
  return isDev && isLocalhost
}

/**
 * Ana admin kontrol fonksiyonu
 * Hem production admin listesi hem de geliştirme ortamını destekler
 */
export function checkAdminAccess(user: { email?: string } | null): boolean {
  if (!user?.email) return false
  
  // Production admin listesi kontrolü
  if (isAdminUser(user.email)) return true
  
  // Geliştirme ortamında localhost'ta tüm kullanıcılara izin ver
  // Bu satırı production'da kapatmak için yoruma alabilirsiniz
  if (isDevAdmin()) return true
  
  return false
}
