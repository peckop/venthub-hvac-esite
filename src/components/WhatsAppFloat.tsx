import React from 'react'
import { WhatsAppIcon } from './HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'

const WhatsAppFloat: React.FC = () => {
  if (!isWhatsAppAvailable()) return null
  const link = getSupportLink('Web sitesinden hızlı destek')
  if (!link) return null

  return (
    <a
      id="whatsapp-float"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="WhatsApp ile yaz"
      title="WhatsApp ile yaz"
    >
      <WhatsAppIcon size={22} />
    </a>
  )
}

export default WhatsAppFloat
