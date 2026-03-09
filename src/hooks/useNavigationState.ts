import { useCallback, useMemo, useState } from 'react'

import type { NavigationMode } from '../utils/navigationConfig'

type NavigationSurface = 'none' | 'menu' | 'categoryHub' | 'search'

interface UseNavigationStateOptions {
  isScrolled: boolean
}

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
