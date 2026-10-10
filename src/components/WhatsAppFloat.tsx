'use client'

import React from 'react'

import { useI18n } from '../i18n/I18nProvider'
import { doluMu } from '../utils/bosDegerKorumasi'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'
import { WhatsAppIcon } from './HVACIcons'

const WhatsAppFloat: React.FC = () => {
  const { t, lang } = useI18n()

  if (!isWhatsAppAvailable()) return null
  const link = getSupportLink(t('common.whatsappSupportMessage'), lang)
  if (!link) return null
  // URN-84: tablo ipucu metnini BOŞ bırakır (canlıda WhatsApp bağlantısı yok, O17); boşken boş balon basılmaz.
  const ipucu = t('common.whatsappTooltip')

  return (
    <a
      id="whatsapp-float"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group relative"
      aria-label={t('common.whatsappAriaLabel')}
      title={t('common.whatsappTitle')}
    >
      <WhatsAppIcon size={34} className="shrink-0" />
      {doluMu(ipucu) && (
        <span className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-bold text-sm pointer-events-none hidden lg:block">
          {ipucu}
        </span>
      )}
    </a>
  )
}

export default WhatsAppFloat




