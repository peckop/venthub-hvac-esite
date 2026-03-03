import { useAuth } from './useAuth'
import { canAccessPage, canWrite, isReadOnly } from '../lib/rbac'

export function useRole() {
    const { role, loading } = useAuth()

    return {
        role,
        loading,
        canAccess: (path: string) => canAccessPage(role, path),
        canWrite: (entity: string) => canWrite(role, entity),
        isReadOnly: isReadOnly(role)
    }
}
