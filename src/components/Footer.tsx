import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import BuildTag from './BuildTag'

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
    <footer className="bg-industrial-gray text-white selection:bg-white/20 selection:text-white">
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
                <div className="text-xs text-gray-300">HVAC Premium</div>
              </div>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-secondary-blue transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2V9c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.9h2.3l-.4 2.9h-1.9v7A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-300 hover:text-secondary-blue transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.46 6c-.77.35-1.5.58-2.32.69.84-.5 1.47-1.28 1.77-2.22-.8.47-1.64.8-2.56.98A4.03 4.03 0 0 0 12 8.03c0 .31.04.62.1.91-3.35-.17-6.3-1.77-8.28-4.2a4.27 4.27 0 0 0-.55 2.03c0 1.4.72 2.63 1.82 3.35-.67-.02-1.3-.2-1.86-.5v.05c0 1.95 1.37 3.58 3.2 3.95-.33.1-.68.15-1.05.15-.25 0-.5-.02-.73-.07.5 1.6 2 2.76 3.77 2.8A8.08 8.08 0 0 1 2 19.55a11.4 11.4 0 0 0 6.29 1.85c7.55 0 11.68-6.34 11.68-11.84v-.54c.8-.58 1.5-1.3 2.06-2.12z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-300 hover:text-secondary-blue transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 5 2.12 5 3.5zM.5 8h4V23h-4V8zm7 0h3.8v2.05h.05c.53-1 1.82-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V23h-4v-6.65c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-4V8z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-secondary-blue transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5zm5.75-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/products?all=1" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.products')}
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.brands')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link to="/destek/merkez" className="text-gray-300 hover:text-white transition-colors">
                  {t('common.knowledgeHub')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-300 hover:text-white transition-colors">
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
                    className="text-gray-300 hover:text-white transition-colors text-sm"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-secondary-blue mt-1 flex-shrink-0" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"/></svg>
                <span className="text-gray-300 text-sm">
                  Teknokent Mah. Teknopark Blv.<br />
                  No: 1/4A 34906 Pendik/İstanbul
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-secondary-blue flex-shrink-0" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.9.3 1.77.54 2.61a2 2 0 0 1-.45 2.11L9.1 10.9a16 16 0 0 0 4 4l1.46-1.1a2 2 0 0 1 2.11-.45c.84.24 1.71.42 2.61.54A2 2 0 0 1 22 16.92z"/></svg>
                <span className="text-gray-300 text-sm">
                  +90 (216) 123-45-67
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-secondary-blue flex-shrink-0" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2l8 6 8-6"/></svg>
                <span className="text-gray-300 text-sm">
                  info@venthub.com.tr
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{t('footer.workingHours')}</h4>
              <p className="text-gray-300 text-xs">
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
            <div className="text-gray-300 text-sm">
              © 2025 VentHub HVAC. {t('footer.rights')}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center md:justify-end">
              {/* Build meta tag */}
              <BuildTag />
              <Link to="/legal/kvkk" className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.kvkk')}
              </Link>
              <Link to="/legal/mesafeli-satis-sozlesmesi" className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.distanceSales')}
              </Link>
              <Link to="/legal/on-bilgilendirme-formu" className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.preInformation')}
              </Link>
              <Link to="/legal/cerez-politikasi" className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.cookies')}
              </Link>
              <Link to="/legal/gizlilik-politikasi" className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.privacy')}
              </Link>
              <Link to="/legal/kullanim-kosullari" className="text-gray-300 hover:text-white transition-colors">
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
