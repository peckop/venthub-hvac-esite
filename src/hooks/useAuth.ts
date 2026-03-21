import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContextDefinition'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Statik build veya izole ortamlar için güvenli geri dönüş
    return {
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
  }
  return context
}



