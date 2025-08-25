import React from 'react'
import { Lock, ShieldCheck, CreditCard } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

interface SecurityRibbonProps {
  brandName?: string
  providerName?: string
  variant?: 'banner' | 'card'
}

export const SecurityRibbon: React.FC<SecurityRibbonProps> = ({
  brandName = 'Venthub HVAC',
  providerName = 'iyzico',
  variant = 'banner',
}) => {
  const { t } = useI18n()
  const base =
    'rounded-xl border border-primary-navy/30 bg-white shadow-sm ' +
    (variant === 'banner' ? 'p-4 md:p-5' : 'p-3')

  const badge = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-air-blue/30 text-primary-navy'

  return (
    <div className={base}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-navy/10 flex items-center justify-center">
            <Lock size={16} className="text-primary-navy" />
          </div>
          <div>
            <div className="text-sm font-semibold text-industrial-gray">{t('checkout.securePaymentBrand', { brand: brandName })}</div>
            <div className="text-[11px] text-steel-gray">{t('checkout.securePaymentProvider', { provider: providerName })}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={badge}><ShieldCheck size={12}/> PCI DSS</span>
          <span className={badge}><CreditCard size={12}/> 3D Secure</span>
          <span className={badge}><Lock size={12}/> 256‑bit SSL</span>
        </div>
      </div>
    </div>
  )
}

export default SecurityRibbon

