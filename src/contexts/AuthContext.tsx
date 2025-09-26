import React, { createContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'

interface AuthError { message: string }

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: AuthError }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: AuthError }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Oturum başlatmayı başlangıç LCP sonrasına ertele (gerektiğinde hemen yükle)
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null

    async function initializeAuth() {
      try {
        const { getSupabase } = await import('../lib/supabase')
        const supabase = await getSupabase()
        // İlk oturumu al
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Session error:', sessionError)
        } else {
          if (isMounted) {
            setSession(initialSession)
            setUser(initialSession?.user || null)
          }
        }
        // Dinleyici kur
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (!isMounted) return
          setSession(newSession)
          setUser(newSession?.user || null)
          switch (event) {
            case 'SIGNED_IN':
if (newSession?.user?.email) {
                import('react-hot-toast').then(({ default: toast }) => {
                  toast.success(`Hoş geldiniz, ${newSession.user.user_metadata?.full_name || newSession.user.email}!`)
                }).catch(() => {})
              }
              break
case 'SIGNED_OUT':
              import('react-hot-toast').then(({ default: toast }) => toast.success('Çıkış yaptınız')).catch(() => {})
              break
case 'USER_UPDATED':
              import('react-hot-toast').then(({ default: toast }) => toast.success('Bilgileriniz güncellendi')).catch(() => {})
              break
            default:
          }
        })
        unsubscribe = () => subscription.unsubscribe()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // /account, /admin, /checkout gibi sayfalarda gecikme yapma
    const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/'
    const needImmediate = /^(\/account|\/admin|\/checkout|\/auth)/.test(path)

    let started = false
    const start = () => {
      if (started) return
      started = true
      try { initializeAuth() } catch {}
      cleanup()
    }
    const cleanup = () => {
      try {
        window.removeEventListener('load', start)
        window.removeEventListener('pointerdown', start)
        window.removeEventListener('keydown', start)
        window.removeEventListener('touchstart', start)
      } catch {}
    }

    if (needImmediate) {
      start()
    } else {
      const ricb = (window as unknown as { requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout?: number }) => number }).requestIdleCallback
      if (typeof ricb === 'function') {
        // İlk ölçüm penceresini etkilememek için daha uzun idle bekle
        ricb(() => start(), { timeout: 10000 })
      } else {
        // Yalnızca ilk kullanıcı etkileşimiyle başlat (load'da başlatma!)
        window.addEventListener('pointerdown', start, { once: true })
        window.addEventListener('keydown', start, { once: true })
        window.addEventListener('touchstart', start, { once: true })
      }
    }

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
      try {
        cleanup()
      } catch {}
    }
  }, [])

  // Enhanced auth methods with better error handling
  function removePersistedSessions() {
    try {
      const keys: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k) keys.push(k)
      }
      keys.forEach((k) => {
        if (/^sb-.*-auth-token$/.test(k)) {
          window.localStorage.removeItem(k)
        }
      })
    } catch {}
  }

  async function signIn(email: string, password: string, rememberMe = true) {
    try {
      setLoading(true)
      const { getSupabase } = await import('../lib/supabase')
      const supabase = await getSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = 'Giriş başarısız';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'E-posta veya şifre hatalı';
            break;
          case 'Email not confirmed':
            errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor';
            break;
          case 'Too many requests':
            errorMessage = 'Çok fazla deneme. Lütfen bekleyin';
            break;
          default:
            errorMessage = error.message || 'Bilinmeyen hata';
        }
        
import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
        return { error: { message: errorMessage } };
      }

      // If user does not want persistence, remove localStorage tokens
      if (!rememberMe) {
        removePersistedSessions()
      }

      return { data }
    } catch (error: unknown) {
      console.error('Sign in catch error:', error)
const errorMessage = 'Giriş sırasında beklenmeyen hata oluştu'
      import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setLoading(true)
      const { getSupabase } = await import('../lib/supabase')
      const supabase = await getSupabase()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            display_name: name.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'Kayıt başarısız';
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'Bu e-posta adresi zaten kayıtlı';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'Şifre en az 6 karakter olmalı';
            break;
          case 'Invalid email':
            errorMessage = 'Geçersiz e-posta adresi';
            break;
          default:
            errorMessage = error.message || 'Bilinmeyen hata';
        }
        
import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
        return { error: { message: errorMessage } };
      }

if (data.user && !data.session) {
        import('react-hot-toast').then(({ default: toast }) => toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın')).catch(() => {})
      }

      return { data }
    } catch (error: unknown) {
      console.error('Sign up catch error:', error)
const errorMessage = 'Kayıt sırasında beklenmeyen hata oluştu'
      import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      const { getSupabase } = await import('../lib/supabase')
      const supabase = await getSupabase()
      const { error } = await supabase.auth.signOut()
if (error) {
        console.error('Sign out error:', error)
        import('react-hot-toast').then(({ default: toast }) => toast.error('Çıkış sırasında hata oluştu')).catch(() => {})
      }
    } catch (error: unknown) {
console.error('Sign out catch error:', error)
      import('react-hot-toast').then(({ default: toast }) => toast.error('Çıkış sırasında beklenmeyen hata oluştu')).catch(() => {})
    }
  }

  async function resetPassword(email: string) {
    try {
      const { getSupabase } = await import('../lib/supabase')
      const supabase = await getSupabase()
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        console.error('Reset password error:', error);
        let errorMessage = 'Şifre sıfırlama başarısız';
        
        if (error.message.includes('rate limit')) {
          errorMessage = 'Çok fazla istek. Lütfen bekleyin';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Geçersiz e-posta adresi';
        }
        
import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
        return { error: { message: errorMessage } };
      }

import('react-hot-toast').then(({ default: toast }) => toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi')).catch(() => {})
      return { data };
    } catch (error: unknown) {
      console.error('Reset password catch error:', error);
const errorMessage = 'Şifre sıfırlama sırasında beklenmeyen hata oluştu';
      import('react-hot-toast').then(({ default: toast }) => toast.error(errorMessage)).catch(() => {})
      return { error: { message: errorMessage } };
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  } as const;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider
