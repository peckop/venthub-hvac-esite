import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import { getCategoryIcon } from './HVACIcons'

export const Footer: React.FC = () => {
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
              Türkiye'nin en güvenilir HVAC distributörü. Premium markalardan 
              kaliteli havalandırma çözümleri sunuyoruz.
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
            <h3 className="font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-steel-gray hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-steel-gray hover:text-white transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-steel-gray hover:text-white transition-colors">
                  Markalar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-steel-gray hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-steel-gray hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-steel-gray hover:text-white transition-colors">
                  Destek Merkezi
                </Link>
              </li>
              <li>
                <Link to="/support/sss" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • SSS
                </Link>
              </li>
              <li>
                <Link to="/support/iade-degisim" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • İade & Değişim
                </Link>
              </li>
              <li>
                <Link to="/support/teslimat-kargo" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • Teslimat & Kargo
                </Link>
              </li>
              <li>
                <Link to="/support/garanti-servis" className="text-steel-gray hover:text-white transition-colors text-sm">
                  • Garanti & Servis
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Kategoriler</h3>
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
            <h3 className="font-semibold mb-4">İletişim</h3>
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
              <h4 className="font-medium text-sm mb-2">Mesāi Saatleri</h4>
              <p className="text-steel-gray text-xs">
                Pazartesi - Cuma: 09:00 - 18:00<br />
                Cumartesi: 09:00 - 14:00
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
              © 2025 VentHub HVAC. Tüm hakları saklıdır.
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center md:justify-end">
              <Link to="/legal/kvkk" className="text-steel-gray hover:text-white transition-colors">
                KVKK Aydınlatma Metni
              </Link>
              <Link to="/legal/mesafeli-satis-sozlesmesi" className="text-steel-gray hover:text-white transition-colors">
                Mesafeli Satış Sözleşmesi
              </Link>
              <Link to="/legal/on-bilgilendirme-formu" className="text-steel-gray hover:text-white transition-colors">
                Ön Bilgilendirme Formu
              </Link>
              <Link to="/legal/cerez-politikasi" className="text-steel-gray hover:text-white transition-colors">
                Çerez Politikası
              </Link>
              <Link to="/legal/gizlilik-politikasi" className="text-steel-gray hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link to="/legal/kullanim-kosullari" className="text-steel-gray hover:text-white transition-colors">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer