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
 * Evaluates whether the given user role is authorized to access a specific page path.
 * Validates against a predefined matrix of roles and path patterns, including exact matches and wildcards.
 *
 * @param role - The user's role (e.g., 'super_admin', 'sales') or null if unauthenticated
 * @param path - The application route path to check access for (e.g., '/admin/orders')
 * @returns True if the user is permitted to view the page, false otherwise
 *
 * @example
 * canAccessPage('sales', '/admin/orders') // returns true
 * canAccessPage('warehouse', '/admin/users') // returns false
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
 * Evaluates whether the given user role has write or modification permissions for a specific entity.
 * Checks against the write access matrix and applies specific business rules (e.g., preventing admins from altering users).
 *
 * @param role - The user's role (e.g., 'warehouse', 'admin') or null if unauthenticated
 * @param entity - The domain entity being modified (e.g., 'inventory', 'products')
 * @returns True if the user is permitted to perform write actions on the entity, false otherwise
 *
 * @example
 * canWrite('warehouse', 'inventory') // returns true
 * canWrite('sales', 'products') // returns false
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
 * Determines if the specified role is strictly limited to read-only actions within the system.
 * Unauthenticated users or those with 'viewer'/'user' roles are considered read-only.
 *
 * @param role - The user's role to evaluate, or null if unauthenticated
 * @returns True if the role is restricted from making any system modifications
 *
 * @example
 * isReadOnly('viewer') // returns true
 * isReadOnly('admin')  // returns false
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
