import { useCallback, useMemo, useState } from 'react'

import type { NavigationMode } from '../utils/navigationConfig'

type NavigationSurface = 'none' | 'menu' | 'categoryHub' | 'search'

interface UseNavigationStateOptions {
    isScrolled: boolean
}

/**
 * Manages the UI state of the application's navigation elements, including active surfaces (menu, category hub, search overlay)
 * and display modes based on scroll position.
 * Ensures only one major navigation surface is active at a time by closing others when opening a new one.
 *
 * @param options - Configuration options, notably `isScrolled` to determine compact mode.
 * @returns An object containing the current state flags and setter callbacks for all navigation surfaces.
 *
 * @example
 * const { isMenuOpen, openMenu, mode } = useNavigationState({ isScrolled: typeof window !== 'undefined' ? window.scrollY > 50 : false });
 */
export function useNavigationState({ isScrolled }: UseNavigationStateOptions) {
    const [activeSurface, setActiveSurface] = useState<NavigationSurface>('none')
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    const mode = useMemo<NavigationMode>(() => (isScrolled ? 'compact' : 'expanded'), [isScrolled])

    const openMenu = useCallback(() => {
        setIsUserMenuOpen(false)
        setActiveSurface('menu')
    }, [])

    const closeMenu = useCallback(() => {
        setActiveSurface((current) => (current === 'menu' ? 'none' : current))
    }, [])

    const toggleUserMenu = useCallback(() => {
        setActiveSurface('none')
        setIsUserMenuOpen((current) => !current)
    }, [])

    const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), [])

    const openCategoryHub = useCallback(() => {
        setIsUserMenuOpen(false)
        setActiveSurface('categoryHub')
    }, [])

    const closeCategoryHub = useCallback(() => {
        setActiveSurface((current) => (current === 'categoryHub' ? 'none' : current))
    }, [])

    const openSearchOverlay = useCallback(() => {
        setIsUserMenuOpen(false)
        setActiveSurface('search')
    }, [])

    const closeSearchOverlay = useCallback(() => {
        setActiveSurface((current) => (current === 'search' ? 'none' : current))
    }, [])

    return {
        mode,
        isCompact: mode === 'compact',
        activeSurface,
        isMenuOpen: activeSurface === 'menu',
        isUserMenuOpen,
        isCategoryHubOpen: activeSurface === 'categoryHub',
        isSearchOverlayOpen: activeSurface === 'search',
        openMenu,
        closeMenu,
        toggleUserMenu,
        closeUserMenu,
        openCategoryHub,
        closeCategoryHub,
        openSearchOverlay,
        closeSearchOverlay,
    }
}
