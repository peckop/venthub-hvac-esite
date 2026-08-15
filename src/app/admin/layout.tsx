import { cookies } from 'next/headers'

import { NAV_COLLAPSED_VALUE,navCookieName } from '../../components/admin/shell/navCookie'
import { TenantProvider } from '../../hooks/useTenant'
import { getTenantConfig } from '../../utils/tenantServer'
import LayoutComponent from '../../views/admin/AdminLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const tenantConfig = await getTenantConfig()

  /**
   * Sol navigasyon tercihi SUNUCUDA okunur ve `defaultNavCollapsed` olarak geçilir.
   * Bu adım atlanırsa çerez yazılır ama hiç okunmaz → kalıcılık sessizce çalışmaz
   * (güncel shadcn/ui dokümanından bu okuma bölümü kaldırıldığı için sık düşülen
   * tuzak). Cetvel: docs/standards/admin-design-standard.md §2.4
   */
  const cookieStore = await cookies()
  const navCollapsed =
    cookieStore.get(navCookieName(tenantConfig.id))?.value === NAV_COLLAPSED_VALUE

  return (
    <TenantProvider value={tenantConfig}>
      <LayoutComponent defaultNavCollapsed={navCollapsed}>{children}</LayoutComponent>
    </TenantProvider>
  )
}
