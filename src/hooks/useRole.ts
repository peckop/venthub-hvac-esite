import { useAuth } from './useAuth'
import { canAccessPage, canWrite, isReadOnly } from '../lib/rbac'

export function useRole() {
    const { role, loading: authLoading, roleLoading } = useAuth()
    const loading = authLoading || roleLoading

    return {
        role,
        loading,
        roleLoading,
        canAccess: (path: string) => canAccessPage(role, path),
        canWrite: (entity: string) => canWrite(role, entity),
        isReadOnly: isReadOnly(role)
    }
}
