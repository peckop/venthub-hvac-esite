import LayoutComponent from '../../views/admin/AdminLayout'
import { getTenantConfig } from '../../utils/tenantServer'
import { TenantProvider } from '../../hooks/useTenant'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const tenantConfig = await getTenantConfig()

  return (
    <TenantProvider value={tenantConfig}>
      <LayoutComponent>{children}</LayoutComponent>
    </TenantProvider>
  )
}



