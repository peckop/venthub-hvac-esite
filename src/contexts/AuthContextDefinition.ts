import { createContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError { message: string }

export interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: AuthError }>
    signUp: (email: string, password: string, name: string) => Promise<{ error?: AuthError }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error?: AuthError }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
