import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Favoriler v1 — localStorage sözleşmesi (cetvel: auth-account-standard.md §A8).
 *
 * Kalıcılık tarayıcı-yereldir (migration istemez; kural 13 kapısına girmez). DB'ye
 * (user_favorites) geçiş kararı Recep'te; geçişte bu hook'un ARAYÜZÜ aynı kalır,
 * yalnız gövdesi değişir — tüketiciler (PDP kalbi, FavoritesPage) etkilenmez.
 *
 * Senkron: aynı sekmedeki bileşenler CUSTOM_EVENT ile, diğer sekmeler tarayıcının
 * 'storage' olayıyla güncellenir. İlk değer SSR uyumu için boş başlar, mount'ta okunur.
 */
const STORAGE_KEY = 'venthub:favorites:v1'
const CHANGE_EVENT = 'venthub:favorites-changed'

function readIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Manages the user's favorite products using browser localStorage.
 * Automatically synchronizes changes across tabs and within the current session.
 * Does not interact with the database (v1 implementation).
 *
 * @returns An object containing the current favorite IDs and mutator functions
 *
 * @example
 * const { isFavorite, toggleFavorite } = useFavorites();
 * if (!isFavorite('product1')) toggleFavorite('product1');
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setIds(readIds())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener(CHANGE_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(CHANGE_EVENT, sync)
    }
  }, [])

  const write = useCallback((next: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Gizli mod / kota — sessiz geç: favoriler oturum içinde state'te yaşamaya devam eder.
    }
    setIds(next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const isFavorite = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggleFavorite = useCallback((productId: string) => {
    write(ids.includes(productId) ? ids.filter(x => x !== productId) : [...ids, productId])
  }, [ids, write])

  const removeFavorite = useCallback((productId: string) => {
    write(ids.filter(x => x !== productId))
  }, [ids, write])

  return useMemo(
    () => ({ favorites: ids, isFavorite, toggleFavorite, removeFavorite }),
    [ids, isFavorite, toggleFavorite, removeFavorite],
  )
}
