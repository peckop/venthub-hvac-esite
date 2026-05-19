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
 * Determines whether the given user role is permitted to view a specific application path.
 * Validates against the `ROLE_PAGE_ACCESS` matrix, supporting wildcard access and explicit path prefixes.
 * Includes a special override preventing all non-super_admin roles from accessing the users page.
 *
 * @param role - The current user's role, or null/undefined if unauthenticated
 * @param path - The application path string to verify (e.g., '/admin/orders')
 * @returns True if the role is permitted to view the page, false otherwise
 *
 * @example
 * canAccessPage('sales', '/admin/orders') // returns true
 * canAccessPage('sales', '/admin/users')  // returns false
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
 * Evaluates whether the specified role has permission to create, update, or delete records for a given entity type.
 * Validates against the `ROLE_WRITE_ACCESS` matrix. Includes an explicit override preventing admin users from modifying other users.
 *
 * @param role - The current user's role
 * @param entity - The target database or application entity name (e.g., 'orders', 'users')
 * @returns True if the user has write access to the entity, false otherwise
 *
 * @example
 * canWrite('sales', 'orders') // returns true
 * canWrite('admin', 'users')  // returns false
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
 * Checks if the current role is restricted strictly to read-only capabilities.
 * Unauthenticated users (null/undefined), 'viewer', and standard 'user' roles are considered read-only.
 *
 * @param role - The role to evaluate
 * @returns True if the role cannot perform any write operations
 *
 * @example
 * isReadOnly('viewer') // returns true
 * isReadOnly('admin')  // returns false
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
