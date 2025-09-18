import React from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { WhatsAppIcon } from '../components/HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'

const ContactPage: React.FC = () => {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-industrial-gray">İletişim</h1>
          <p className="text-steel-gray mt-2 max-w-2xl mx-auto">
            Projeniz veya ürünlerle ilgili sorularınız için bize ulaşın. En kısa sürede dönüş yaparız.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="text-primary-navy" size={20} />
              <h2 className="font-semibold text-industrial-gray">Adres</h2>
            </div>
            <p className="text-steel-gray text-sm leading-relaxed">
              Teknokent Mah. Teknopark Blv.<br />
              No: 1/4A 34906 Pendik/İstanbul
            </p>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="text-primary-navy" size={20} />
              <h2 className="font-semibold text-industrial-gray">Telefon</h2>
            </div>
            <a href="tel:+902161234567" className="text-steel-gray text-sm hover:text-primary-navy transition-colors">
              +90 (216) 123-45-67
            </a>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="text-primary-navy" size={20} />
              <h2 className="font-semibold text-industrial-gray">E‑posta</h2>
            </div>
            <a href="mailto:info@venthub.com.tr" className="text-steel-gray text-sm hover:text-primary-navy transition-colors">
              info@venthub.com.tr
            </a>
          </div>
        </div>

        {/* WhatsApp Quick Contact */}
        {isWhatsAppAvailable() && (() => {
          const whatsappLink = getSupportLink('İletişim formu')
          if (!whatsappLink) return null
          
          return (
            <div className="mb-8 whatsapp-container">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <WhatsAppIcon size={48} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold whatsapp-text mb-2">Hızlı İletişim</h2>
                  <p className="whatsapp-subtext mb-4">Acil durumlar ve hızlı yanıt gereken konular için WhatsApp'tan direkt ulaşın.</p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                  >
                  <WhatsAppIcon size={18} variant="solid" />
                    WhatsApp'tan Yaz
                  </a>
                </div>
              </div>
            </div>
          )
        })()}

        <div className="rounded-xl border border-light-gray p-6 bg-gradient-to-br from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">Teklif/İletişim Formu</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-light-gray rounded-lg p-3" placeholder="Ad Soyad" />
            <input className="border border-light-gray rounded-lg p-3" placeholder="E‑posta" type="email" />
            <input className="border border-light-gray rounded-lg p-3 md:col-span-2" placeholder="Konu" />
            <textarea className="border border-light-gray rounded-lg p-3 md:col-span-2" rows={5} placeholder="Mesajınız / Proje bilgileri" />
            <div className="md:col-span-2">
              <button type="button" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
