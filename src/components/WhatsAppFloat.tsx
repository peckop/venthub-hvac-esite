import React from 'react'
import { WhatsAppIcon } from './HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'

const WhatsAppFloat: React.FC = () => {
  if (!isWhatsAppAvailable()) return null
  const link = getSupportLink('Web sitesinden hızlı destek')
  if (!link) return null

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float whatsapp-pulse"
      aria-label="WhatsApp ile yaz"
      title="WhatsApp ile yaz"
    >
      <WhatsAppIcon size={36} />
    </a>
  )
}

export default WhatsAppFloat
