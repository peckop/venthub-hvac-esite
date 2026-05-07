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
 * Determines if a given user role has permission to access a specific page path.
 * The super_admin role has access to all pages, while other roles are checked against the access matrix.
 *
 * @param role - The role of the user attempting access
 * @param path - The application path they are trying to access
 * @returns True if the role is permitted to view the page, false otherwise
 *
 * @example
 * canAccessPage('warehouse', '/admin/inventory') // returns true
 * canAccessPage('viewer', '/admin/users') // returns false
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
 * Checks if a given role has write or edit permissions for a specific entity type.
 * Super admins have full write access, while other roles are limited by the write access matrix.
 *
 * @param role - The role of the user attempting to write
 * @param entity - The entity identifier (e.g., 'orders', 'products', 'users')
 * @returns True if the user is authorized to perform write operations on the entity
 *
 * @example
 * canWrite('sales', 'orders') // returns true
 * canWrite('admin', 'users') // returns false (prevented to protect admin config)
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
 * Determines whether a user role is restricted to strictly read-only operations across the application.
 * Missing roles, 'viewer', and 'user' roles are considered read-only by default.
 *
 * @param role - The role to evaluate
 * @returns True if the role is restricted to read-only capabilities
 *
 * @example
 * isReadOnly('viewer') // returns true
 * isReadOnly('admin') // returns false
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
