import React from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { trackEvent } from '../utils/analytics'

const FAQShortSection: React.FC = () => {
  const items = [
    {
      q: 'Hava perdesi hangi durumlarda kullanılır?',
      a: 'Girişlerde konforu artırmak ve enerji kaybını azaltmak için kullanılır. Kapı açıklığında hava bariyeri oluşturur.',
      href: '/support/sss',
    },
    {
      q: 'Jet fan seçimi nasıl yapılır?',
      a: 'Otopark hacmi, CO/NOx sensörleri, hava değişim sayısı ve yerleşim planına göre hesap yapılır.',
      href: '/support/sss',
    },
    {
      q: 'HRV seçerken nelere dikkat etmeliyim?',
      a: 'Hava debisi, ısı geri kazanım verimi, basınç kaybı ve ses seviyeleri ana kriterlerdir.',
      href: '/support/sss',
    },
  ] as const

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">Sık Sorulanlar (Kısa)</h2>
          <p className="text-steel-gray mt-1">Temel konulara hızlı cevaplar — daha fazla bilgi için destek sayfamıza göz atın.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.q} className="rounded-2xl border border-light-gray bg-gradient-to-br from-gray-50 to-white p-5">
              <div className="flex items-start gap-3">
                <HelpCircle size={20} className="text-primary-navy mt-1" />
                <div>
                  <div className="font-semibold text-industrial-gray">{it.q}</div>
                  <div className="text-sm text-steel-gray mt-1">{it.a}</div>
                  <div className="mt-3">
                    <Link
                      to={it.href}
                      onClick={() => trackEvent('faq_click', { q: it.q })}
                      className="text-sm font-medium text-primary-navy hover:underline"
                    >
                      Daha fazla oku →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQShortSection

