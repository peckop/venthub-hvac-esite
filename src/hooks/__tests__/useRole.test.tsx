import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock,vi } from 'vitest';

import { useAuth } from '../useAuth';
import { useRole } from '../useRole';

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

    // REGRESYON BEKÇİSİ: canAccess/canWrite ve dönen nesne, role DEĞİŞMEDİĞİ sürece
    // re-render'lar arasında REFERANS olarak STABİL kalmalı. Aksi halde bunları
    // useEffect/useMemo/useCallback bağımlılığı olarak kullanan bileşenler (CommandPalette,
    // AdminRealtimeNotifications) sonsuz re-render döngüsüne girer → admin paneli donar.
    it('returns referentially STABLE functions/object across re-renders (no infinite loop)', () => {
        (useAuth as Mock).mockReturnValue({ role: 'super_admin', loading: false, roleLoading: false });

        const { result, rerender } = renderHook(() => useRole());

        const first = result.current;
        rerender();
        rerender();
        const second = result.current;

        expect(second.canAccess).toBe(first.canAccess);
        expect(second.canWrite).toBe(first.canWrite);
        expect(second).toBe(first); // memoized object identity preserved
    });

    it('recomputes the bound functions when the role CHANGES', () => {
        (useAuth as Mock).mockReturnValue({ role: 'viewer', loading: false, roleLoading: false });
        const { result, rerender } = renderHook(() => useRole());
        const viewerCanWrite = result.current.canWrite;

        (useAuth as Mock).mockReturnValue({ role: 'super_admin', loading: false, roleLoading: false });
        rerender();

        expect(result.current.canWrite).not.toBe(viewerCanWrite);
        expect(result.current.canWrite('users')).toBe(true);
    });
});
