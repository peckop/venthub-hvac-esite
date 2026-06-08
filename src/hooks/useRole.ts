import { canAccessPage, canWrite, isReadOnly } from '../lib/rbac'
import { useAuth } from './useAuth'

/**
 * A custom React hook that evaluates the current user's Role-Based Access Control (RBAC) permissions.
 * It combines the raw role from `useAuth` with the application's permission matrix (`src/lib/rbac.ts`).
 *
 * @returns An object containing the current role and bound permission checker functions:
 * - `role`: The active user's role (e.g., 'admin', 'sales', 'user') or null
 * - `loading`: Combined loading state for auth initialization and role fetching
 * - `roleLoading`: Specific loading state for the role fetching process
 * - `canAccess(path)`: Function returning boolean if the user can view the given path
 * - `canWrite(entity)`: Function returning boolean if the user can modify the given entity
 * - `isReadOnly`: Boolean indicating if the user has a strictly read-only role ('viewer', 'user')
 *
 * @example
 * const { role, loading, canWrite, canAccess, isReadOnly } = useRole();
 *
 * if (loading) return <Spinner />;
 *
 * if (!canAccess('/admin/orders')) {
 *   return <AccessDenied />;
 * }
 *
 * return (
 *   <div>
 *     {canWrite('orders') && <button>Edit Order</button>}
 *     {isReadOnly && <span>You are in view-only mode.</span>}
 *   </div>
 * )
 */
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
