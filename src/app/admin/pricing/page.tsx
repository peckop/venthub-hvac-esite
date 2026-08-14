import AdminPricingSettingsPage from '../../../views/admin/AdminPricingSettingsPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fiyat Ayarları | VentHub HVAC',
  description: 'VentHub HVAC platformu fiyatlandırma varsayılanları ve döviz kurları.',
}

export default function Page() {
  return <AdminPricingSettingsPage />
}
