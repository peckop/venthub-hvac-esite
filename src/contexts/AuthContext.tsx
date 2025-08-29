import React, { createContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

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

  // Enhanced session initialization
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        } else {
          console.log('Initial session:', initialSession ? 'Found' : 'None');
          if (isMounted) {
            setSession(initialSession);
            setUser(initialSession?.user || null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Enhanced auth listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', { event, hasSession: !!newSession, userId: newSession?.user?.id });
        
        if (!isMounted) return;
        
        // Update state synchronously to avoid race conditions
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Handle auth events with improved user feedback
        switch (event) {
          case 'SIGNED_IN':
            if (newSession?.user?.email) {
              toast.success(`Hoş geldiniz, ${newSession.user.user_metadata?.full_name || newSession.user.email}!`);
            }
            break;
          case 'SIGNED_OUT':
            toast.success('Çıkış yaptınız');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          case 'USER_UPDATED':
            toast.success('Bilgileriniz güncellendi');
            break;
          default:
            console.log('Auth event:', event);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

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
        
        toast.error(errorMessage);
        return { error: { message: errorMessage } };
      }

      // If user does not want persistence, remove localStorage tokens
      if (!rememberMe) {
        removePersistedSessions()
      }

      return { data };
    } catch (error: unknown) {
      console.error('Sign in catch error:', error);
      const errorMessage = 'Giriş sırasında beklenmeyen hata oluştu';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setLoading(true);
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
      });

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
        
        toast.error(errorMessage);
        return { error: { message: errorMessage } };
      }

      if (data.user && !data.session) {
        toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın');
      }

      return { data };
    } catch (error: unknown) {
      console.error('Sign up catch error:', error);
      const errorMessage = 'Kayıt sırasında beklenmeyen hata oluştu';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Çıkış sırasında hata oluştu');
      }
    } catch (error: unknown) {
      console.error('Sign out catch error:', error);
      toast.error('Çıkış sırasında beklenmeyen hata oluştu');
    }
  }

  async function resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Reset password error:', error);
        let errorMessage = 'Şifre sıfırlama başarısız';
        
        if (error.message.includes('rate limit')) {
          errorMessage = 'Çok fazla istek. Lütfen bekleyin';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Geçersiz e-posta adresi';
        }
        
        toast.error(errorMessage);
        return { error: { message: errorMessage } };
      }

      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
      return { data };
    } catch (error: unknown) {
      console.error('Reset password catch error:', error);
      const errorMessage = 'Şifre sıfırlama sırasında beklenmeyen hata oluştu';
      toast.error(errorMessage);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider
