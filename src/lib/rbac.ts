export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'warehouse' | 'sales' | 'viewer' | 'user';

/**
 * Sayfa Erişim Matrisi
 */
const ROLE_PAGE_ACCESS: Record<UserRole, string[]> = {
    super_admin: ['*'], // Her seye erişim
    admin: ['*'], // Her seye erişim (kullanıcılar sayfası haricinde kontrol edilecek)
    moderator: ['*'],
    warehouse: [
        '/admin',
        '/admin/inventory',
        '/admin/movements',
        '/admin/inventory/report',
        '/admin/inventory/settings'
    ],
    sales: [
        '/admin',
        '/admin/orders',
        '/admin/logistics',
        '/admin/returns',
        '/admin/coupons'
    ],
    viewer: ['*'], // Her seyi gorebilir
    user: [] // Sadece site kullanicisi
};

/**
 * Yazma (Action) İzin Matrisi
 */
const ROLE_WRITE_ACCESS: Record<UserRole, string[]> = {
    super_admin: ['*'],
    admin: ['orders', 'logistics', 'returns', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook', 'logs', 'error_groups'],
    moderator: ['orders', 'logistics', 'returns', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook', 'logs', 'error_groups'],
    warehouse: ['logistics', 'inventory', 'movements', 'inventory_settings'],
    sales: ['orders', 'logistics', 'returns', 'coupons'],
    viewer: [],
    user: []
};


/**
 * Evaluates whether a given user role has permission to access a specific page path.
 * Relies on the `ROLE_PAGE_ACCESS` matrix. Handles wildcard accesses and strict paths (e.g., locking down `/admin/users` to super_admins).
 *
 * @param role - The role of the user requesting access, or null/undefined if unauthenticated.
 * @param path - The route path the user is attempting to access (e.g., '/admin/orders').
 * @returns True if the user role is authorized to view the path, otherwise false.
 *
 * @example
 * canAccessPage('warehouse', '/admin/inventory') // returns true
 * canAccessPage('sales', '/admin/users') // returns false
 */
export function canAccessPage(role: UserRole | null | undefined, path: string): boolean {
    if (!role) return false;
    if (role === 'user') return false;

    // Özel yetki: super_admin hariç kimse 'Kullanıcılar' sayfasını göremez
    if (role !== 'super_admin' && path.startsWith('/admin/users')) {
        return false;
    }

    const allowedPaths = ROLE_PAGE_ACCESS[role as UserRole] || [];
    if (allowedPaths.includes('*')) return true;

    // Path ile eşleşme
    // exact match veya path ile baslayan
    return allowedPaths.some(p => path === p || path.startsWith(p + '/'));
}

/**
 * Determines whether a given user role possesses write or edit permissions for a specific entity or domain.
 * Evaluated against the `ROLE_WRITE_ACCESS` matrix. Prevents standard admins from modifying user permissions.
 *
 * @param role - The user's role.
 * @param entity - The domain entity being checked (e.g., 'orders', 'inventory', 'users').
 * @returns True if the user has write privileges for the given entity, otherwise false.
 *
 * @example
 * canWrite('sales', 'orders') // returns true
 * canWrite('admin', 'users') // returns false
 */
export function canWrite(role: UserRole | null | undefined, entity: string): boolean {
    if (!role) return false;

    // Admin kullanıcı yetkisini değiştiremez (bunu config.admin handle ediyordu, burda da engelliyoruz)
    if (role === 'admin' && entity === 'users') {
        return false;
    }

    const allowedEntities = ROLE_WRITE_ACCESS[role] || [];
    if (allowedEntities.includes('*')) return true;

    return allowedEntities.includes(entity);
}

/**
 * Checks if a user role is restricted to strictly read-only access within the application.
 * Unauthenticated users (null/undefined), 'viewer' roles, and basic 'user' roles are considered read-only.
 *
 * @param role - The role to evaluate.
 * @returns True if the role cannot perform administrative write actions, otherwise false.
 *
 * @example
 * isReadOnly('viewer') // returns true
 * isReadOnly('admin') // returns false
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
