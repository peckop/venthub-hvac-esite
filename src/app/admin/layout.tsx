import { TenantProvider } from '../../hooks/useTenant'
import { getTenantConfig } from '../../utils/tenantServer'
import LayoutComponent from '../../views/admin/AdminLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const tenantConfig = await getTenantConfig()

  return (
    <TenantProvider value={tenantConfig}>
      <LayoutComponent>{children}</LayoutComponent>
    </TenantProvider>
  )
}



