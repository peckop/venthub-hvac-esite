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
 * Verilen rol, belirtilen sayfaya erisebilir mi?
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
 * Verilen rol, belirtilen entity'de yazma/düzenleme işlemi yapabilir mi?
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
 * Kullanıcı salt-okunur mu?
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
