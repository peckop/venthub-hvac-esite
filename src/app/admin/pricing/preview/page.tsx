import AdminPricePreviewPage from '../../../../views/admin/AdminPricePreviewPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fiyat Önizleme | VentHub HVAC',
  description: 'VentHub HVAC fiyat motorunun tek ürün için ürettiği sonucun önizlemesi.',
}

export default function Page() {
  return <AdminPricePreviewPage />
}
