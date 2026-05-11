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
 * Evaluates whether a specific role has permission to access a given application path.
 *
 * Verifies against the predefined role-to-page access matrix, automatically handling exact matches
 * or wildcard prefix matches. Ensures 'super_admin' remains the only role with users-page access.
 *
 * @param role - The current user's role identifier, or null/undefined
 * @param path - The application URL path being requested
 * @returns True if the role permits accessing the page, false otherwise
 *
 * @example
 * if (!canAccessPage('warehouse', '/admin/orders')) { redirect('/unauthorized'); }
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
 * Evaluates whether a specific role has permission to perform write or edit actions on an entity.
 *
 * Checks against the write-access matrix. Explicitly prevents 'admin' roles from modifying user configurations.
 *
 * @param role - The current user's role identifier, or null/undefined
 * @param entity - The target database or domain entity string identifier (e.g., 'orders', 'products')
 * @returns True if the role permits writing to the entity, false otherwise
 *
 * @example
 * const isEditable = canWrite(user.role, 'products');
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
 * Determines if a user's role falls under strictly read-only capabilities.
 *
 * Read-only roles are inherently blocked from making destructive or state-changing actions.
 * Missing or null roles default to being completely read-only.
 *
 * @param role - The current user's role identifier, or null/undefined
 * @returns True if the role is 'viewer' or 'user', or if no role is provided
 *
 * @example
 * const hideSaveButton = isReadOnly(currentUser.role);
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
