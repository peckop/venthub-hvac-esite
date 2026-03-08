import { useCallback, useMemo, useState } from 'react'

import type { NavigationMode } from '../utils/navigationConfig'

interface UseNavigationStateOptions {
  isScrolled: boolean
}

export function useNavigationState({ isScrolled }: UseNavigationStateOptions) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoryHubOpen, setIsCategoryHubOpen] = useState(false)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)

  const mode = useMemo<NavigationMode>(() => (isScrolled ? 'compact' : 'expanded'), [isScrolled])

  const openMenu = useCallback(() => setIsMenuOpen(true), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((current) => !current)
  }, [])

  const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), [])

  const openCategoryHub = useCallback(() => setIsCategoryHubOpen(true), [])
  const closeCategoryHub = useCallback(() => setIsCategoryHubOpen(false), [])

  const openSearchOverlay = useCallback(() => setIsSearchOverlayOpen(true), [])
  const closeSearchOverlay = useCallback(() => setIsSearchOverlayOpen(false), [])

  return {
    mode,
    isCompact: mode === 'compact',
    isMenuOpen,
    isUserMenuOpen,
    isCategoryHubOpen,
    isSearchOverlayOpen,
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
