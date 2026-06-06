import AdminSettingsPage from '../../../views/admin/AdminSettingsPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Ayarları | VentHub HVAC',
  description: 'VentHub HVAC platformu genel ayarları ve yapılandırması.',
}

export default function Page() {
  return <AdminSettingsPage />
}

