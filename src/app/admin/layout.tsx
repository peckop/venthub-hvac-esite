import { cookies } from 'next/headers'

import { AdminSozlukKapisi } from '../../components/admin/AdminSozlukKapisi'
import { NAV_COLLAPSED_VALUE,navCookieName } from '../../components/admin/shell/navCookie'
import { adminThemeCookieName, parseAdminTheme } from '../../components/admin/shell/themeCookie'
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

  /**
   * Tema de AYNI sebeple sunucuda okunur: istemcide çözülseydi koyu temayı
   * seçmiş kullanıcı her yüklemede bir kare beyaz ekran görürdü. `parseAdminTheme`
   * bozuk/eksik çerezi sessizce varsayılana (AÇIK) düşürür.
   */
  const theme = parseAdminTheme(cookieStore.get(adminThemeCookieName(tenantConfig.id))?.value)

  return (
    <TenantProvider value={tenantConfig}>
      {/*
        Admin sözlüğü artık vitrin paketinde DEĞİL, dinamik yükleniyor (REC-59 Faz 2).
        Kapı KABUĞUN DIŞINDA duruyor, bilerek: sol menü, başlıklar ve araç çubuğu da
        `admin.*` anahtarları kullanıyor — kapıyı içeriye koysaydık menü bir kare boyunca
        ham anahtar basardı.
      */}
      <AdminSozlukKapisi>
        <LayoutComponent
          defaultNavCollapsed={navCollapsed}
          defaultThemePreference={theme.preference}
          defaultThemeResolved={theme.resolved}
        >
          {children}
        </LayoutComponent>
      </AdminSozlukKapisi>
    </TenantProvider>
  )
}
