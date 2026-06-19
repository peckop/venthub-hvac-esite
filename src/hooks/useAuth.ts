import { useContext } from 'react'

import { AuthContext } from '../contexts/AuthContextDefinition'

// Statik build/izole ortam (provider DIŞI) için no-op fallback.
// MODÜL SABİTİ olarak tanımlı → referans STABİL. Hook içinde inline döndürülürse her
// render'da yeni nesne/fonksiyon olur; bir tüketici bunları useEffect/useMemo bağımlılığı
// yaparsa sonsuz re-render döngüsüne girer. (Bkz: hook-referential-stability conformance.)
const AUTH_FALLBACK = {
  user: null,
  session: null,
  role: null,
  loading: false,
  roleLoading: false,
  signIn: async () => ({ error: { message: 'Auth not available' } }),
  signUp: async () => ({ error: { message: 'Auth not available' } }),
  signOut: async () => { },
  resetPassword: async () => ({ error: { message: 'Auth not available' } }),
  refreshSession: async () => null
}

/**
 * Safely consumes the AuthContext to provide authentication state and operations.
 * If used outside of an AuthProvider (e.g., in static builds or isolated testing environments),
 * it returns a safe, no-op fallback object to prevent runtime errors.
 *
 * @returns The current authentication context containing user info, session, role, loading states, and auth functions.
 *
 * @example
 * const { user, role, signOut } = useAuth();
 * if (user) {
 *   console.log(`Logged in as ${user.email} with role ${role}`);
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Statik build veya izole ortamlar için güvenli geri dönüş
    return AUTH_FALLBACK
  }
  return context
}



