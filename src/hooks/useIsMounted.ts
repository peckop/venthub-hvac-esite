'use client';

import { useEffect,useState } from 'react';

/**
 * Next.js 15 (veya genel SSR) mimarisinde Hydration Mismatch hatalarını önlemek için kullanılır.
 * İlk render'da (sunucuda) false döner, istemcide mount olduktan sonra true döner.
 * 
 * Örnek Kullanım:
 * const isMounted = useIsMounted();
 * if (!isMounted) return <Skeleton />;
 * return <ClientSideOnlyComponent />;
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
