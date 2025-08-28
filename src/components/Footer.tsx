import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export const Footer: React.FC = () => {
  const { t } = useI18n()
  const mainCategories = [
    { name: 'FANLAR', slug: 'fanlar' },
    { name: 'ISI GERİ KAZANIM CİHAZLARI', slug: 'isi-geri-kazanim-cihazlari' },
    { name: 'HAVA PERDELERİ', slug: 'hava-perdeleri' },
    { name: 'NEM ALMA CİHAZLARI', slug: 'nem-alma-cihazlari' },
    { name: 'HAVA TEMİZLEYİCİLER', slug: 'hava-temizleyiciler' },
    { name: 'FLEXİBLE HAVA KANALLARI', slug: 'flexible-hava-kanallari' },
    { name: 'HIZ KONTROLÜ CİHAZLARI', slug: 'hiz-kontrolu-cihazlari' },
    { name: 'AKSESUARLAR', slug: 'aksesuarlar' }
  ]

  return (
    <footer className="bg-industrial-gray text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-navy p-2 rounded-lg">
                <div className="text-white font-bold text-lg">VH</div>
              </div>
              <div>
                <div className="text-xl font-bold">VentHub</div>
                <div className="text-xs text-steel-gray">HVAC Premium</div>
              </div>
            </Link>
            <p className="text-steel-gray leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-steel-gray hover:text-secondary-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-steel-gray hover:text-secondary-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-steel-gray hover:text-secondary-blue transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-steel-gray hover:text-secondary-blue transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/products?all=1" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.products')}
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.brands')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-steel-gray hover:text-white transition-colors">
                  {t('common.supportCenter')}
                </Link>
              </li>
              <li>
                <Link to="/support/sss" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • {t('support.links.faq')}
                </Link>
              </li>
              <li>
                <Link to="/support/iade-degisim" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • {t('support.links.returns')}
                </Link>
              </li>
              <li>
                <Link to="/support/teslimat-kargo" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • {t('support.links.shipping')}
                </Link>
              </li>
              <li>
                <Link to="/support/garanti-servis" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • {t('support.links.warranty')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              {mainCategories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link 
                    to={`/category/${category.slug}`} 
                    className="text-steel-gray hover:text-white transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-secondary-blue mt-1 flex-shrink-0" />
                <span className="text-steel-gray text-sm">
                  Teknokent Mah. Teknopark Blv.<br />
                  No: 1/4A 34906 Pendik/İstanbul
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-secondary-blue flex-shrink-0" />
                <span className="text-steel-gray text-sm">
                  +90 (216) 123-45-67
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-secondary-blue flex-shrink-0" />
                <span className="text-steel-gray text-sm">
                  info@venthub.com.tr
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{t('footer.workingHours')}</h4>
              <p className="text-steel-gray text-xs">
                {t('footer.weekdays')}: 09:00 - 18:00<br />
                {t('footer.saturday')}: 09:00 - 14:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-steel-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-steel-gray text-sm">
              © 2025 VentHub HVAC. {t('footer.rights')}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center md:justify-end">
              {/* Build meta tag */}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              {(() => {
                try {
                  const BuildTag = require('./BuildTag').default
                  return <BuildTag />
                } catch {
                  return null
                }
              })()}
              <Link to="/legal/kvkk" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.kvkk')}
              </Link>
              <Link to="/legal/mesafeli-satis-sozlesmesi" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.distanceSales')}
              </Link>
              <Link to="/legal/on-bilgilendirme-formu" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.preInformation')}
              </Link>
              <Link to="/legal/cerez-politikasi" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.cookies')}
              </Link>
              <Link to="/legal/gizlilik-politikasi" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.privacy')}
              </Link>
              <Link to="/legal/kullanim-kosullari" className="text-steel-gray hover:text-white transition-colors">
                {t('legalLinks.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer