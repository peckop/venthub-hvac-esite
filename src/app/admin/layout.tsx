import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'

import { AdminSozlukKapisi } from '../../components/admin/AdminSozlukKapisi'
import { NAV_COLLAPSED_VALUE,navCookieName } from '../../components/admin/shell/navCookie'
import { adminThemeCookieName, parseAdminTheme } from '../../components/admin/shell/themeCookie'
import { TenantProvider } from '../../hooks/useTenant'
import { getTenantConfig } from '../../utils/tenantServer'
import LayoutComponent from '../../views/admin/AdminLayout'

/**
 * ADMİN KENDİ INTER'İNİ TAŞIR (TSR-9, Faz 2b; plan v2.2 §1.4 "Font-family").
 *
 * Kök `<body>` bugün `inter.variable` + `inter.className` taşır; `className` `font-family`'yi doğrudan
 * yazar ve `--font-sans`'ı atlar. Yeni görünüm bayrağı (`YENI_GORUNUM`) `<body>`yi Archivo'ya geçirir ve
 * açılış PR'ı kök Inter'i kaldırır → admin'in fontu sessizce değişirdi. Bu nesne KÖKTEKİYLE AYNI
 * yapılandırmadır (`subsets: ['latin']`, `display: 'swap'`, `variable: '--font-sans'`): Next aynı
 * seçeneklerle aynı sınıf/aileyi üretir, yani bayrak kapalıyken admin'de fark 0 ve ek font dosyası yok.
 * `variable` + `className` BİRLİKTE uygulanır (biri tek başına yetmez: `font-sans` sınıfı `--font-sans`'a,
 * `className` doğrudan `font-family`'ye bakar).
 *
 * SARMALAYICI `contents`: kutu üretmez, yerleşimi (min-h-svh, kaydırma sahipliği) DEĞİŞTİRMEZ; yalnız
 * kalıtım zincirine eklenir.
 * ⚠KAPSAM: yalnız bu ağacın İÇİNDEKİ öğeler. `document.body`ye portal edilen diyalog/toast'lar bu
 * sarmalayıcının DIŞINDADIR (bkz. `useAdminThemeBodyScope`) ve `<body>`nin fontunu alır.
 */
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })

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
    <div className={`${inter.variable} ${inter.className} contents`}>
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
    </div>
  )
}
