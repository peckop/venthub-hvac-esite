import PricingPoliciesTableBody from '../../../../views/admin/PricingPoliciesTableBody'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kur Kilitleri | VentHub HVAC',
  description: 'VentHub HVAC fiyat politikaları — kur kilidi (fx_lock) yönetimi.',
}

export default function Page() {
  return <PricingPoliciesTableBody />
}
