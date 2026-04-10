'use client'

import React from 'react'
import { WhatsAppIcon } from './HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'
import { useI18n } from '../i18n/I18nProvider'

const WhatsAppFloat: React.FC = () => {
  const { t } = useI18n()

  if (!isWhatsAppAvailable()) return null
  const link = getSupportLink(t('common.whatsappSupportMessage'))
  if (!link) return null

  return (
    <a
      id="whatsapp-float"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      aria-label={t('common.whatsappAriaLabel')}
      title={t('common.whatsappTitle')}
    >
      <WhatsAppIcon size={34} className="shrink-0" />
      <span className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-bold text-sm pointer-events-none hidden lg:block">
        {t('common.whatsappTooltip')}
      </span>
    </a>
  )
}

export default WhatsAppFloat




