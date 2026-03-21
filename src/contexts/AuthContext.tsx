'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '../lib/rbac';
import { AuthContext, type AuthError } from './AuthContextDefinition';
import { getUserRole } from '../config/admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchRole = async (userId: string, email?: string) => {
    setRoleLoading(true);
    try {
      // Önce config'deki isAdminByEmail kontrolünü dene (hızlı fallback)
      const userRole = await getUserRole(userId, email);
      setRole(userRole as UserRole);
    } catch (err) {
      console.error('fetchRole error:', err);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchRole(initialSession.user.id, initialSession.user.email);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const newUser = currentSession?.user ?? null;
      setUser(newUser);
      
      // Oturum açma veya token yenileme olaylarında taze kullanıcı ve rol bilgilerini bekle
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(true)
        if (currentSession?.user) {
          setUser(currentSession.user)
          await fetchRole(currentSession.user.id, currentSession.user.email)
        }
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setRole(null) // undefined yerine null kullanıyoruz
        setLoading(false)
      } else if (newUser) {
        // Diğer durumlarda normal yükleme (örn: INITIAL_SESSION)
        await fetchRole(newUser.id, newUser.email)
        setLoading(false)
      } else {
        setLoading(false)
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: { message: error.message } as AuthError };
    
    // ÖNEMLİ: Giriş başarılı olduğunda rrol bilgisini hemen yükle
    if (data.user) {
      await fetchRole(data.user.id, data.user.email);
    }
    
    return {};
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) return { error: { message: error.message } as AuthError };
    return {};
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: { message: error.message } as AuthError };
    return {};
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
      if (refreshedSession?.user) await fetchRole(refreshedSession.user.id, refreshedSession.user.email);
      return refreshedSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  };

  const value = useMemo(() => ({
    user,
    session,
    role,
    loading,
    roleLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession
  }), [user, session, role, loading, roleLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
