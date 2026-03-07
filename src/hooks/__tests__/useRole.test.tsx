import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRole } from '../useRole'
import * as useAuthModule from '../useAuth'
import type { UserRole } from '../../lib/rbac'

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: vi.fn()
}))

describe('useRole hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns correctly for super_admin role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      role: 'super_admin' as UserRole,
      loading: false,
      signOut: vi.fn(),
      signInWithOAuth: vi.fn()
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.role).toBe('super_admin')
    expect(result.current.loading).toBe(false)
    expect(result.current.isReadOnly).toBe(false)
    expect(result.current.canAccess('/admin/users')).toBe(true)
    expect(result.current.canWrite('users')).toBe(true)
  })

  it('returns correctly for viewer role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      role: 'viewer' as UserRole,
      loading: false,
      signOut: vi.fn(),
      signInWithOAuth: vi.fn()
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.role).toBe('viewer')
    expect(result.current.loading).toBe(false)
    expect(result.current.isReadOnly).toBe(true)
    expect(result.current.canAccess('/admin/dashboard')).toBe(true)
    expect(result.current.canWrite('products')).toBe(false)
  })

  it('returns false for unknown/null role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      role: null,
      loading: true,
      signOut: vi.fn(),
      signInWithOAuth: vi.fn()
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.role).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.isReadOnly).toBe(true)
    expect(result.current.canAccess('/admin')).toBe(false)
    expect(result.current.canWrite('orders')).toBe(false)
  })
})
