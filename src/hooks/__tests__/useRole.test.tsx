import { renderHook } from '@testing-library/react';
import { useRole } from '../useRole';
import { useAuth } from '../useAuth';
import { vi, describe, it, expect, Mock } from 'vitest';

// Mock the useAuth hook
vi.mock('../useAuth', () => ({
    useAuth: vi.fn(),
}));

describe('useRole', () => {
    it('should return initial loading state and restrict access', () => {
        (useAuth as Mock).mockReturnValue({ role: null, loading: true, roleLoading: false });

        const { result } = renderHook(() => useRole());

        expect(result.current.loading).toBe(true);
        expect(result.current.role).toBe(null);
        expect(result.current.isReadOnly).toBe(true);
        expect(result.current.canAccess('/admin')).toBe(false);
        expect(result.current.canWrite('orders')).toBe(false);
    });

    it('should correctly evaluate "admin" role permissions', () => {
        (useAuth as Mock).mockReturnValue({ role: 'admin', loading: false, roleLoading: false });

        const { result } = renderHook(() => useRole());

        expect(result.current.loading).toBe(false);
        expect(result.current.role).toBe('admin');
        expect(result.current.isReadOnly).toBe(false);
        expect(result.current.canAccess('/admin')).toBe(true);
        expect(result.current.canAccess('/admin/users')).toBe(false); // as per RBAC
        expect(result.current.canWrite('orders')).toBe(true);
        expect(result.current.canWrite('users')).toBe(false); // as per RBAC
    });

    it('should correctly evaluate "viewer" role permissions', () => {
        (useAuth as Mock).mockReturnValue({ role: 'viewer', loading: false, roleLoading: false });

        const { result } = renderHook(() => useRole());

        expect(result.current.loading).toBe(false);
        expect(result.current.role).toBe('viewer');
        expect(result.current.isReadOnly).toBe(true);
        expect(result.current.canAccess('/admin')).toBe(true);
        expect(result.current.canAccess('/admin/users')).toBe(false);
        expect(result.current.canWrite('orders')).toBe(false);
    });

    it('should correctly evaluate "super_admin" role permissions', () => {
        (useAuth as Mock).mockReturnValue({ role: 'super_admin', loading: false, roleLoading: false });

        const { result } = renderHook(() => useRole());

        expect(result.current.loading).toBe(false);
        expect(result.current.role).toBe('super_admin');
        expect(result.current.isReadOnly).toBe(false);
        expect(result.current.canAccess('/admin/users')).toBe(true);
        expect(result.current.canWrite('users')).toBe(true);
    });
});
