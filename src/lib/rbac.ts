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
    admin: ['orders', 'logistics', 'returns', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook', 'logs', 'error_groups', 'settings'],
    moderator: ['orders', 'logistics', 'returns', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook', 'logs', 'error_groups', 'settings'],
    warehouse: ['logistics', 'inventory', 'movements', 'inventory_settings'],
    sales: ['orders', 'logistics', 'returns', 'coupons'],
    viewer: [],
    user: []
};


/**
 * Evaluates whether a given user role has permission to access a specific frontend route path.
 * Hardcodes rules such as restricting `/admin/users` strictly to `super_admin`.
 *
 * @param role - The current user's role (e.g., 'admin', 'sales'), or null/undefined if unauthenticated
 * @param path - The frontend route path to check access for (e.g., '/admin/orders')
 * @returns True if the user's role is permitted to view the page, otherwise false
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
 * Evaluates whether a given user role has write/modification permissions for a specific database entity.
 * Includes explicit safeguards, such as preventing standard `admin` roles from modifying `users`.
 *
 * @param role - The current user's role
 * @param entity - The target entity name (e.g., 'orders', 'products', 'users')
 * @returns True if the role is authorized to perform write operations on the entity
 *
 * @example
 * canWrite('sales', 'orders') // returns true
 * canWrite('admin', 'users') // returns false (prevented by strict logic)
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
 * Determines if a user's role restricts them to read-only operations across the entire application.
 * Roles mapped as 'viewer' or 'user', as well as unauthenticated users, are considered read-only.
 *
 * @param role - The current user's role
 * @returns True if the user cannot perform any write operations
 *
 * @example
 * isReadOnly('viewer') // returns true
 * isReadOnly('admin') // returns false
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
