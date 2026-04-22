import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useNavigationState } from '../useNavigationState'

describe('useNavigationState', () => {
    it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        expect(result.current.mode).toBe('expanded')
        expect(result.current.isCompact).toBe(false)
        expect(result.current.activeSurface).toBe('none')
        expect(result.current.isMenuOpen).toBe(false)
        expect(result.current.isUserMenuOpen).toBe(false)
        expect(result.current.isCategoryHubOpen).toBe(false)
        expect(result.current.isSearchOverlayOpen).toBe(false)
    })

    it('should set mode to compact when isScrolled is true', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: true }))

        expect(result.current.mode).toBe('compact')
        expect(result.current.isCompact).toBe(true)
    })

    it('should open and close the menu surface properly', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        act(() => {
            result.current.openMenu()
        })
        expect(result.current.activeSurface).toBe('menu')
        expect(result.current.isMenuOpen).toBe(true)

        act(() => {
            result.current.closeMenu()
        })
        expect(result.current.activeSurface).toBe('none')
        expect(result.current.isMenuOpen).toBe(false)
    })

    it('should open and close category hub properly', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        act(() => {
            result.current.openCategoryHub()
        })
        expect(result.current.activeSurface).toBe('categoryHub')
        expect(result.current.isCategoryHubOpen).toBe(true)

        act(() => {
            result.current.closeCategoryHub()
        })
        expect(result.current.activeSurface).toBe('none')
        expect(result.current.isCategoryHubOpen).toBe(false)
    })

    it('should open and close search overlay properly', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        act(() => {
            result.current.openSearchOverlay()
        })
        expect(result.current.activeSurface).toBe('search')
        expect(result.current.isSearchOverlayOpen).toBe(true)

        act(() => {
            result.current.closeSearchOverlay()
        })
        expect(result.current.activeSurface).toBe('none')
        expect(result.current.isSearchOverlayOpen).toBe(false)
    })

    it('should handle user menu toggle and closing', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        act(() => {
            result.current.toggleUserMenu()
        })
        expect(result.current.isUserMenuOpen).toBe(true)
        expect(result.current.activeSurface).toBe('none')

        act(() => {
            result.current.closeUserMenu()
        })
        expect(result.current.isUserMenuOpen).toBe(false)
    })

    it('should close other surfaces when a new one is opened', () => {
        const { result } = renderHook(() => useNavigationState({ isScrolled: false }))

        act(() => {
            result.current.openMenu()
        })
        expect(result.current.activeSurface).toBe('menu')

        // Opening category hub should close menu
        act(() => {
            result.current.openCategoryHub()
        })
        expect(result.current.activeSurface).toBe('categoryHub')
        expect(result.current.isMenuOpen).toBe(false)

        // Toggling user menu should close active surface
        act(() => {
            result.current.toggleUserMenu()
        })
        expect(result.current.activeSurface).toBe('none')
        expect(result.current.isUserMenuOpen).toBe(true)

        // Opening search overlay should close user menu
        act(() => {
            result.current.openSearchOverlay()
        })
        expect(result.current.activeSurface).toBe('search')
        expect(result.current.isUserMenuOpen).toBe(false)
    })
})
